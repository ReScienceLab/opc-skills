#!/usr/bin/env python3
"""Get available topics from RequestHunt API."""

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
        print("Get your key from: https://requesthunt.com/settings/api", file=sys.stderr)
        sys.exit(1)
    return key

def get_topics():
    api_key = get_api_key()
    
    url = f"{API_BASE}/api/v1/topics"
    
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
    parser = argparse.ArgumentParser(description="Get available topics from RequestHunt")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()
    
    result = get_topics()
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    categories = result.get("data", [])
    
    print("# Available Topics\n")
    
    for category in categories:
        cat_name = category.get("name", "Unknown")
        topics = category.get("topics", [])
        
        print(f"## {cat_name}\n")
        
        for topic in topics:
            if isinstance(topic, dict):
                name = topic.get("name", "")
                slug = topic.get("slug", "")
                print(f"- **{name}** (`{slug}`)")
            else:
                print(f"- `{topic}`")
        
        print()

if __name__ == "__main__":
    main()
