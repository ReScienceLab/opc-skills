#!/usr/bin/env python3
"""Search feature requests from RequestHunt API with optional realtime expansion."""

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

def search_requests(query, limit=20, expand=False, platforms=None):
    api_key = get_api_key()
    
    url = f"{API_BASE}/api/v1/requests/search"
    
    body = {
        "query": query,
        "limit": limit,
        "expand": expand
    }
    
    if platforms:
        body["platforms"] = platforms.split(",")
    
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

def format_request(req, score=None):
    """Format a single request for display."""
    lines = []
    title = req.get('title', 'Untitled')
    if score is not None:
        title += f" (relevance: {score:.2f})"
    lines.append(f"## {title}")
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
    parser = argparse.ArgumentParser(description="Search feature requests from RequestHunt")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--limit", type=int, default=20, help="Number of results (max 100)")
    parser.add_argument("--expand", action="store_true", help="Enable realtime expansion (scrapes fresh data)")
    parser.add_argument("--platforms", help="Platforms for realtime scraping (comma-separated: reddit,x,github)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    
    args = parser.parse_args()
    
    result = search_requests(
        query=args.query,
        limit=min(args.limit, 100),
        expand=args.expand,
        platforms=args.platforms
    )
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    data = result.get("data", {})
    results = data.get("results", [])
    meta = result.get("meta", {})
    
    print(f"# Search Results for \"{args.query}\" ({len(results)} results)\n")
    
    if args.expand:
        print("*Realtime expansion enabled - fresh data scraped*\n")
    
    if meta.get("expandedPlatforms"):
        print(f"*Expanded from: {', '.join(meta['expandedPlatforms'])}*\n")
    
    for item in results:
        req = item.get("request", item)
        score = item.get("score")
        print(format_request(req, score))
        print("\n---\n")
    
    # Show timing info if available
    if meta.get("searchTimeMs"):
        print(f"\n*Search completed in {meta['searchTimeMs']}ms*")

if __name__ == "__main__":
    main()
