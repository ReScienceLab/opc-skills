#!/usr/bin/env python3
"""
Get collections with filters
Usage: python3 scripts/get_collections.py --featured --limit 20
"""
import argparse
from producthunt_api import graphql, clean_collection, format_count, print_pagination

QUERY = """
query GetCollections($first: Int, $after: String, $featured: Boolean, $userId: ID) {
  collections(first: $first, after: $after, featured: $featured, userId: $userId, order: FOLLOWERS_COUNT) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        name
        tagline
        url
        followersCount
        featuredAt
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt collections")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max collections")
    parser.add_argument("--featured", "-f", action="store_true", help="Featured collections only")
    parser.add_argument("--user", "-u", help="Filter by user ID")
    parser.add_argument("--cursor", "-c", help="Pagination cursor")
    args = parser.parse_args()

    variables = {
        "first": min(args.limit, 50),
        "after": args.cursor,
        "featured": True if args.featured else None,
        "userId": args.user,
    }

    data = graphql(QUERY, variables)
    collections_data = data.get("collections", {})
    edges = collections_data.get("edges", [])
    collections = [e["node"] for e in edges]

    filters = []
    if args.featured:
        filters.append("featured")
    if args.user:
        filters.append(f"user:{args.user}")
    
    label = f"collections({','.join(filters)})" if filters else "collections"
    print(f"{label}[{len(collections)}]{{name,tagline,followers}}:")
    for c in collections:
        tagline = (c.get('tagline') or '')[:40]
        print(f"  {c['name']},{tagline},{format_count(c['followersCount'])}")
    
    print_pagination(collections_data.get("pageInfo"), collections_data.get("totalCount"))


if __name__ == "__main__":
    main()
