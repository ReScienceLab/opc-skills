#!/usr/bin/env python3
"""List feature requests from RequestHunt API."""

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
        print("Get your key from: https://requesthunt.com/settings/api", file=sys.stderr)
        sys.exit(1)
    return key

def list_requests(limit=20, topic=None, platforms=None, category=None, sort_by="new", cursor=None):
    api_key = get_api_key()
    
    params = [f"limit={limit}"]
    if topic:
        params.append(f"topic={urllib.parse.quote(topic)}")
    if platforms:
        params.append(f"platforms={platforms}")
    if category:
        params.append(f"category={urllib.parse.quote(category)}")
    if sort_by:
        params.append(f"sortBy={sort_by}")
    if cursor:
        params.append(f"cursor={urllib.parse.quote(cursor)}")
    
    url = f"{API_BASE}/api/v1/requests?{'&'.join(params)}"
    
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

def format_request(req):
    """Format a single request for display."""
    lines = []
    lines.append(f"## {req.get('title', 'Untitled')}")
    lines.append(f"**Platform**: {req.get('sourcePlatform', 'unknown')} | **Votes**: {req.get('votes', 0)} | **Comments**: {req.get('commentCount', 0)}")
    
    if req.get('topic'):
        lines.append(f"**Topic**: {req['topic']}")
    
    if req.get('description'):
        desc = req['description'][:300] + "..." if len(req.get('description', '')) > 300 else req.get('description', '')
        lines.append(f"\n{desc}")
    
    if req.get('sourceUrl'):
        lines.append(f"\n[Source]({req['sourceUrl']})")
    
    if req.get('authorName'):
        author = req['authorName']
        if req.get('authorHandle'):
            author += f" (@{req['authorHandle']})"
        lines.append(f"*— {author}*")
    
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="List feature requests from RequestHunt")
    parser.add_argument("--limit", type=int, default=20, help="Number of results (max 100)")
    parser.add_argument("--topic", help="Filter by topic slug")
    parser.add_argument("--platforms", help="Filter by platforms (comma-separated: reddit,x,github,requesthunt)")
    parser.add_argument("--category", help="Filter by category")
    parser.add_argument("--sortBy", choices=["new", "top"], default="new", help="Sort order")
    parser.add_argument("--cursor", help="Pagination cursor")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    
    args = parser.parse_args()
    
    # Import urllib.parse here to avoid issues if not needed
    import urllib.parse
    
    result = list_requests(
        limit=min(args.limit, 100),
        topic=args.topic,
        platforms=args.platforms,
        category=args.category,
        sort_by=args.sortBy,
        cursor=args.cursor
    )
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    requests = result.get("data", [])
    meta = result.get("meta", {})
    
    print(f"# Feature Requests ({len(requests)} results)\n")
    
    for req in requests:
        print(format_request(req))
        print("\n---\n")
    
    if meta.get("hasMore"):
        print(f"\n*More results available. Use --cursor \"{meta.get('cursor')}\" to continue.*")

if __name__ == "__main__":
    main()
