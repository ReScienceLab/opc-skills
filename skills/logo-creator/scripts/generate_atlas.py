#!/usr/bin/env python3
"""Generate one logo image through Atlas Cloud's asynchronous media API."""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
from pathlib import Path
import socket
import sys
import tempfile
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


API_BASE = "https://api.atlascloud.ai"
CATALOG_URL = f"{API_BASE}/api/v1/models"
GENERATE_URL = f"{API_BASE}/api/v1/model/generateImage"
PREDICTION_URL = f"{API_BASE}/api/v1/model/prediction/{{prediction_id}}"
DEFAULT_MODEL = "google/nano-banana-2/text-to-image"
SCHEMA_PREFIX = "https://static.atlascloud.ai/model/schema/"
MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024
TERMINAL_FAILURES = {"failed", "canceled", "cancelled", "timeout"}


class AtlasError(RuntimeError):
    """A safe, user-facing Atlas integration error."""


def request_json(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    payload: dict[str, Any] | None = None,
    timeout: float = 30,
) -> dict[str, Any]:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request_headers = {
        "Accept": "application/json",
        "User-Agent": "opc-logo-creator/1.1",
        **(headers or {}),
    }
    request = Request(url, data=body, method=method, headers=request_headers)
    try:
        with urlopen(request, timeout=timeout) as response:
            value = json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise AtlasError(f"{method} {url} failed: {exc}") from exc
    if not isinstance(value, dict):
        raise AtlasError(f"{method} {url} returned a non-object JSON response")
    return value


def unwrap_data(value: dict[str, Any]) -> dict[str, Any]:
    data = value.get("data")
    return data if isinstance(data, dict) else value


def find_model(catalog: dict[str, Any], model: str) -> dict[str, Any]:
    entries = catalog.get("data")
    if not isinstance(entries, list):
        raise AtlasError("Atlas model catalog has no data array")
    matches = [entry for entry in entries if isinstance(entry, dict) and entry.get("model") == model]
    if len(matches) != 1:
        raise AtlasError(f"model must match exactly one live catalog entry: {model}")
    entry = matches[0]
    if entry.get("type") != "Image":
        raise AtlasError(f"model is not an Image model: {model}")
    schema_url = entry.get("schema")
    if not isinstance(schema_url, str) or not schema_url.startswith(SCHEMA_PREFIX):
        raise AtlasError("model catalog returned an unexpected schema URL")
    return entry


def validate_payload(schema: dict[str, Any], payload: dict[str, Any]) -> None:
    input_schema = schema.get("components", {}).get("schemas", {}).get("Input")
    if not isinstance(input_schema, dict):
        raise AtlasError("model schema has no components.schemas.Input object")
    properties = input_schema.get("properties")
    required = input_schema.get("required", [])
    if not isinstance(properties, dict) or not isinstance(required, list):
        raise AtlasError("model input schema is malformed")

    unknown = sorted(set(payload) - set(properties))
    if unknown:
        raise AtlasError(f"payload contains fields absent from the live schema: {', '.join(unknown)}")
    missing = [name for name in required if name not in payload]
    if missing:
        raise AtlasError(f"payload is missing required fields: {', '.join(missing)}")

    for name, value in payload.items():
        definition = properties.get(name)
        if not isinstance(definition, dict):
            continue
        allowed = definition.get("enum")
        if isinstance(allowed, list) and value not in allowed:
            choices = ", ".join(str(item) for item in allowed)
            raise AtlasError(f"{name} must be one of: {choices}")


def build_payload(args: argparse.Namespace) -> dict[str, Any]:
    return {
        "model": args.model,
        "prompt": args.prompt,
        "aspect_ratio": args.ratio,
        "resolution": args.resolution,
        "output_format": args.output_format,
    }


def auth_headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def submit_once(payload: dict[str, Any], api_key: str) -> dict[str, Any]:
    response = request_json(
        GENERATE_URL,
        method="POST",
        headers=auth_headers(api_key),
        payload=payload,
        timeout=60,
    )
    code = response.get("code")
    if code is not None and str(code) not in {"0", "200"}:
        detail = response.get("message") or response.get("msg") or "unknown API error"
        raise AtlasError(f"generation API rejected the request: {detail}")
    prediction = unwrap_data(response)
    prediction_id = prediction.get("id")
    if not isinstance(prediction_id, str) or not prediction_id:
        raise AtlasError(
            "generation response contained no prediction ID; submission is ambiguous and must not be retried"
        )
    return prediction


def poll_prediction(
    prediction_id: str,
    api_key: str,
    *,
    attempts: int,
    interval: float,
) -> dict[str, Any]:
    url = PREDICTION_URL.format(prediction_id=prediction_id)
    last_error: AtlasError | None = None
    for attempt in range(1, attempts + 1):
        try:
            prediction = unwrap_data(
                request_json(url, headers=auth_headers(api_key), timeout=30)
            )
            last_error = None
        except AtlasError as exc:
            last_error = exc
            prediction = {}

        status = str(prediction.get("status", "")).lower()
        if status in {"completed", "succeeded"}:
            outputs = prediction.get("outputs")
            if not isinstance(outputs, list) or not outputs or not isinstance(outputs[0], str):
                raise AtlasError("completed prediction contained no output URL")
            return prediction
        if status in TERMINAL_FAILURES:
            detail = prediction.get("error") or prediction.get("message") or status
            raise AtlasError(f"prediction ended with {status}: {detail}")
        if attempt < attempts:
            time.sleep(interval)

    suffix = f": {last_error}" if last_error else ""
    raise AtlasError(
        f"polling budget exhausted for prediction {prediction_id}{suffix}; do not submit a replacement job"
    )


def validate_public_https(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise AtlasError("output URL must be credential-free HTTPS")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise AtlasError(f"could not resolve output host: {exc}") from exc
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise AtlasError("output URL resolves to a non-public address")


def image_kind(header: bytes) -> str | None:
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if header.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "webp"
    return None


def download_image(url: str, output: Path) -> None:
    validate_public_https(url)
    request = Request(
        url,
        headers={"Accept": "image/*", "User-Agent": "opc-logo-creator/1.1"},
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None
    try:
        with urlopen(request, timeout=60) as response:
            final_url = response.geturl()
            validate_public_https(final_url)
            content_type = response.headers.get_content_type()
            with tempfile.NamedTemporaryFile(dir=output.parent, delete=False) as handle:
                temp_path = Path(handle.name)
                total = 0
                header = b""
                while True:
                    chunk = response.read(64 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_DOWNLOAD_BYTES:
                        raise AtlasError("output image exceeds the 25 MiB limit")
                    if len(header) < 16:
                        header = (header + chunk)[:16]
                    handle.write(chunk)
        if not content_type.startswith("image/") or image_kind(header) is None:
            raise AtlasError("downloaded output is not a recognized image")
        os.replace(temp_path, output)
        temp_path = None
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise AtlasError(f"image download failed: {exc}") from exc
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("prompt", help="Complete logo-generation prompt")
    parser.add_argument("output", type=Path, help="Output image path")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--ratio", default="1:1")
    parser.add_argument("--resolution", default="1k")
    parser.add_argument("--output-format", default="png")
    parser.add_argument("--poll-attempts", type=int, default=40)
    parser.add_argument("--poll-interval", type=float, default=3.0)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="Validate live model/schema without submitting")
    mode.add_argument(
        "--confirm-generation",
        action="store_true",
        help="Acknowledge that this command submits one potentially billable generation",
    )
    args = parser.parse_args(argv)
    if args.poll_attempts < 1 or args.poll_interval < 0:
        parser.error("poll attempts must be positive and interval must be non-negative")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    payload = build_payload(args)
    try:
        catalog = request_json(CATALOG_URL)
        entry = find_model(catalog, args.model)
        schema = request_json(entry["schema"])
        validate_payload(schema, payload)
        price = entry.get("price", {}).get("actual", {}).get("base_price")

        if args.dry_run:
            print(json.dumps({"payload": payload, "current_base_price": price}, indent=2))
            return 0

        api_key = os.environ.get("ATLASCLOUD_API_KEY")
        if not api_key:
            raise AtlasError("ATLASCLOUD_API_KEY is not set")
        prediction = submit_once(payload, api_key)
        prediction_id = prediction["id"]
        print(f"Submitted prediction: {prediction_id}", file=sys.stderr)
        completed = poll_prediction(
            prediction_id,
            api_key,
            attempts=args.poll_attempts,
            interval=args.poll_interval,
        )
        download_image(completed["outputs"][0], args.output)
        print(str(args.output.resolve()))
        return 0
    except AtlasError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
