#!/usr/bin/env python3
"""Check the status of a RequestHunt scrape job."""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API_BASE = "https://requesthunt.com"


def get_api_key():
    key = os.environ.get("REQUESTHUNT_API_KEY")
    if not key:
        print("Error: REQUESTHUNT_API_KEY environment variable not set", file=sys.stderr)
        print("Get your key from: https://requesthunt.com/settings", file=sys.stderr)
        sys.exit(1)
    return key


def check_scrape(job_id):
    api_key = get_api_key()

    encoded_job_id = urllib.parse.quote(job_id, safe="")
    url = f"{API_BASE}/api/v1/scrape/{encoded_job_id}"

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        error_body = error.read().decode()
        try:
            error_data = json.loads(error_body)
            print(
                f"Error {error.code}: {error_data.get('error', {}).get('message', error_body)}",
                file=sys.stderr,
            )
        except Exception:
            print(f"Error {error.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Check the status of a RequestHunt scrape job")
    parser.add_argument("job_id", help="Scrape job ID")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")

    args = parser.parse_args()

    result = check_scrape(args.job_id)

    if args.json:
        print(json.dumps(result, indent=2))
        return

    data = result.get("data", {})
    status = data.get("status", "unknown")

    print("# Scrape Job Status\n")
    print(f"- **Job ID**: {data.get('jobId', args.job_id)}")
    print(f"- **Status**: {status}")
    print(f"- **Topic**: {data.get('topic', 'N/A')}")
    print(f"- **Platforms**: {', '.join(data.get('platforms', [])) or 'N/A'}")
    if "depth" in data:
        print(f"- **Depth**: {data.get('depth')}")
    if status == "completed":
        print(f"- **Requests Created**: {data.get('requestsCreated', 0)}")
    print(f"- **Started At**: {data.get('startedAt', 'N/A')}")
    if data.get("completedAt"):
        print(f"- **Completed At**: {data.get('completedAt')}")

    progress = data.get("progress")
    if isinstance(progress, dict) and progress:
        print()
        print("## Progress")
        for platform, platform_status in progress.items():
            print(f"- **{platform}**: {platform_status}")

    if status == "failed" and data.get("error"):
        print()
        print("## Error")
        print(data.get("error"))


if __name__ == "__main__":
    main()
