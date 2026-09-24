import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).parents[1] / "scripts" / "generate_atlas.py"
SPEC = importlib.util.spec_from_file_location("generate_atlas", SCRIPT)
assert SPEC and SPEC.loader
atlas = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = atlas
SPEC.loader.exec_module(atlas)


class FakeResponse:
    def __init__(self, body, *, url="https://cdn.example.com/logo.png", content_type="application/json"):
        self.body = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.url = url
        self.headers = type("Headers", (), {"get_content_type": lambda self: content_type})()
        self.offset = 0

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, size=-1):
        if size == -1:
            result = self.body[self.offset :]
            self.offset = len(self.body)
            return result
        result = self.body[self.offset : self.offset + size]
        self.offset += len(result)
        return result

    def geturl(self):
        return self.url


class AtlasGeneratorTests(unittest.TestCase):
    def test_find_model_requires_exact_image_entry(self):
        catalog = {
            "data": [
                {
                    "model": atlas.DEFAULT_MODEL,
                    "type": "Image",
                    "schema": atlas.SCHEMA_PREFIX + "model.json",
                }
            ]
        }
        self.assertEqual(atlas.find_model(catalog, atlas.DEFAULT_MODEL)["type"], "Image")
        with self.assertRaises(atlas.AtlasError):
            atlas.find_model(catalog, "missing")

    def test_validate_payload_rejects_unknown_and_invalid_enum(self):
        schema = {
            "components": {
                "schemas": {
                    "Input": {
                        "required": ["model", "prompt"],
                        "properties": {
                            "model": {"type": "string"},
                            "prompt": {"type": "string"},
                            "aspect_ratio": {"enum": ["1:1", "16:9"]},
                        },
                    }
                }
            }
        }
        atlas.validate_payload(schema, {"model": "m", "prompt": "p", "aspect_ratio": "1:1"})
        with self.assertRaises(atlas.AtlasError):
            atlas.validate_payload(schema, {"model": "m", "prompt": "p", "extra": True})
        with self.assertRaises(atlas.AtlasError):
            atlas.validate_payload(schema, {"model": "m", "prompt": "p", "aspect_ratio": "2:1"})

    @patch.object(atlas, "request_json")
    def test_submit_once_makes_one_post(self, request_json):
        request_json.return_value = {"code": 200, "data": {"id": "pred-1", "status": "created"}}
        result = atlas.submit_once({"model": "m", "prompt": "p"}, "secret")
        self.assertEqual(result["id"], "pred-1")
        self.assertEqual(request_json.call_count, 1)
        self.assertEqual(request_json.call_args.kwargs["method"], "POST")

    @patch.object(atlas, "request_json")
    def test_submit_once_does_not_retry_api_error(self, request_json):
        request_json.return_value = {"code": 400, "message": "invalid payload"}
        with self.assertRaises(atlas.AtlasError):
            atlas.submit_once({"model": "m", "prompt": "p"}, "secret")
        self.assertEqual(request_json.call_count, 1)

    @patch.object(atlas.time, "sleep")
    @patch.object(atlas, "request_json")
    def test_poll_retries_get_and_stops_on_completion(self, request_json, sleep):
        request_json.side_effect = [
            atlas.AtlasError("temporary"),
            {"data": {"id": "pred-1", "status": "processing", "outputs": []}},
            {"data": {"id": "pred-1", "status": "completed", "outputs": ["https://cdn.example/x.png"]}},
        ]
        result = atlas.poll_prediction("pred-1", "secret", attempts=3, interval=0)
        self.assertEqual(result["status"], "completed")
        self.assertEqual(request_json.call_count, 3)
        self.assertEqual(sleep.call_count, 2)

    def test_download_rejects_non_https(self):
        with self.assertRaises(atlas.AtlasError):
            atlas.download_image("http://example.com/logo.png", Path("logo.png"))

    @patch.object(atlas, "validate_public_https")
    @patch.object(atlas, "urlopen")
    def test_download_writes_png_atomically(self, urlopen_mock, validate_url):
        urlopen_mock.return_value = FakeResponse(
            b"\x89PNG\r\n\x1a\n" + b"payload",
            content_type="image/png",
        )
        with self.subTest("download"):
            import tempfile

            with tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / "logo.png"
                atlas.download_image("https://cdn.example/logo.png", output)
                self.assertTrue(output.read_bytes().startswith(b"\x89PNG"))
        self.assertEqual(validate_url.call_count, 2)

    @patch.object(atlas, "urlopen")
    def test_request_json_sets_stable_headers(self, urlopen_mock):
        urlopen_mock.return_value = FakeResponse({"ok": True})
        self.assertEqual(atlas.request_json("https://example.com"), {"ok": True})
        request = urlopen_mock.call_args.args[0]
        self.assertEqual(request.get_header("Accept"), "application/json")
        self.assertEqual(request.get_header("User-agent"), "opc-logo-creator/1.1")


if __name__ == "__main__":
    unittest.main()
