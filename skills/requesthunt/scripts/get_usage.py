#!/usr/bin/env python3
"""Get API usage stats from RequestHunt."""

import json
import os
import sys
import urllib.request
import urllib.error

API_BASE = "https://requesthunt.com"

def get_api_key():
    key = os.environ.get("REQUESTHUNT_API_KEY")
    if not key:
        print("Error: REQUESTHUNT_API_KEY environment variable not set", file=sys.stderr)
        print("Get your key from: https://requesthunt.com/settings", file=sys.stderr)
        sys.exit(1)
    return key

def get_usage():
    api_key = get_api_key()
    
    url = f"{API_BASE}/api/v1/usage"
    
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        try:
            error_data = json.loads(error_body)
            print(f"Error {e.code}: {error_data.get('error', {}).get('message', error_body)}", file=sys.stderr)
        except:
            print(f"Error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Get API usage stats from RequestHunt")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()
    
    result = get_usage()
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    data = result.get("data", {})
    
    print("# RequestHunt API Usage\n")

    tier = data.get("tier")
    if tier:
        print(f"**Tier**: {tier}\n")

    credits = data.get("credits", {})
    print("## Credits")
    print(f"- **Used**: {credits.get('used', 0)} / {credits.get('limit', 0)}")
    print(f"- **Remaining**: {credits.get('remaining', 0)}")
    print(f"- **Resets at**: {credits.get('resetsAt', 'N/A')}")
    if credits.get("period"):
        print(f"- **Period**: {credits.get('period')}")

    api_keys = data.get("apiKeys")
    if api_keys:
        print()
        print("## API Keys")
        print(f"- **Used**: {api_keys.get('used', 0)} / {api_keys.get('limit', 0)}")

    rate_limit = data.get("rateLimit")
    if rate_limit:
        print()
        print("## Rate Limit")
        print(f"- **Requests per minute**: {rate_limit.get('requestsPerMinute', 'N/A')}")
        if "used" in rate_limit:
            print(f"- **Used**: {rate_limit.get('used', 0)}")
        if "remaining" in rate_limit:
            print(f"- **Remaining**: {rate_limit.get('remaining', 0)}")
        if "resetsAt" in rate_limit:
            print(f"- **Resets at**: {rate_limit.get('resetsAt', 'N/A')}")

if __name__ == "__main__":
    main()
