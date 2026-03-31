#!/usr/bin/env python3
"""Start a scrape job for a topic on RequestHunt."""

import argparse
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

def scrape_topic(topic, platforms=None, depth=1):
    api_key = get_api_key()
    
    url = f"{API_BASE}/api/v1/scrape"
    
    body = {
        "topic": topic,
        "platforms": platforms or ["reddit", "x"],
        "depth": depth,
    }
    
    data = json.dumps(body).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        try:
            error_data = json.loads(error_body)
            print(f"Error {e.code}: {error_data.get('error', {}).get('message', error_body)}", file=sys.stderr)
        except:
            print(f"Error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Start a scrape job for a topic")
    parser.add_argument("topic", help="Topic to scrape (e.g., 'ai-tools', 'developer-tools')")
    parser.add_argument("--platforms", default="reddit,x", help="Platforms to scrape (comma-separated: reddit,x,github)")
    parser.add_argument("--depth", type=int, default=1, help="Scrape depth (1-40)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    
    args = parser.parse_args()
    
    platforms = [p.strip() for p in args.platforms.split(",") if p.strip()]
    
    # Validate platforms
    valid_platforms = ["reddit", "x", "github"]
    for p in platforms:
        if p not in valid_platforms:
            print(f"Error: Invalid platform '{p}'. Valid: {', '.join(valid_platforms)}", file=sys.stderr)
            sys.exit(1)

    if not 1 <= args.depth <= 40:
        print("Error: --depth must be between 1 and 40", file=sys.stderr)
        sys.exit(1)
    
    result = scrape_topic(args.topic, platforms, args.depth)
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    data = result.get("data", {})
    depth = data.get("depth", args.depth)
    estimated_credits = depth * len(platforms)
    
    print("# Scrape Job Started\n")
    print(f"- **Job ID**: {data.get('jobId', 'N/A')}")
    print(f"- **Topic**: {data.get('topic', args.topic)}")
    print(f"- **Platforms**: {', '.join(data.get('platforms', platforms))}")
    print(f"- **Depth**: {depth}")
    print(f"- **Estimated Credit Cost**: {estimated_credits}")
    print(f"- **Status**: {data.get('status', 'pending')}")
    print()
    print("*The scrape job is running in the background. New requests will appear in search results shortly.*")
    
    # Show usage info if available
    usage = result.get("usage", {})
    if usage:
        credits = usage.get("credits", {})
        print()
        print("## Credits")
        print(f"- **Used**: {credits.get('used', 0)} / {credits.get('limit', 0)}")
        print(f"- **Remaining**: {credits.get('remaining', 0)}")

if __name__ == "__main__":
    main()
