#!/usr/bin/env python3
"""Small Xquik API helper for skill scripts."""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API_BASE = os.environ.get("XQUIK_API_BASE", "https://xquik.com/api/v1").rstrip("/")


def api_get(path, params=None):
    api_key = os.environ.get("XQUIK_API_KEY")
    if not api_key:
        print("error: XQUIK_API_KEY is not set", file=sys.stderr)
        sys.exit(1)

    url = f"{API_BASE}{path}"
    filtered = {}
    if params:
        filtered = {key: value for key, value in params.items() if value is not None}
    if filtered:
        url = f"{url}?{urllib.parse.urlencode(filtered)}"

    request = urllib.request.Request(url, headers={"x-api-key": api_key})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8")
        print(f"error: HTTP {error.code} - {body}", file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(1)


def print_json(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))
