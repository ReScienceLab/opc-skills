#!/usr/bin/env python3
"""
Get posts with filters
Usage: python3 scripts/get_posts.py --featured --limit 20
       python3 scripts/get_posts.py --topic ai --limit 10
"""
import argparse
from datetime import datetime, timezone
from producthunt_api import graphql, print_posts_list, print_pagination

QUERY = """
query GetPosts($first: Int, $after: String, $featured: Boolean, $topic: String, $postedAfter: DateTime, $postedBefore: DateTime) {
  posts(first: $first, after: $after, featured: $featured, topic: $topic, postedAfter: $postedAfter, postedBefore: $postedBefore) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        name
        tagline
        slug
        votesCount
        commentsCount
        url
        website
        featuredAt
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt posts")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max posts")
    parser.add_argument("--featured", "-f", action="store_true", help="Featured posts only")
    parser.add_argument("--topic", "-t", help="Filter by topic slug")
    parser.add_argument("--after", help="Posts after date (YYYY-MM-DD)")
    parser.add_argument("--before", help="Posts before date (YYYY-MM-DD)")
    parser.add_argument("--cursor", "-c", help="Pagination cursor")
    args = parser.parse_args()

    variables = {
        "first": min(args.limit, 50),
        "after": args.cursor,
        "featured": True if args.featured else None,
        "topic": args.topic,
    }
    
    if args.after:
        variables["postedAfter"] = f"{args.after}T00:00:00Z"
    if args.before:
        variables["postedBefore"] = f"{args.before}T23:59:59Z"

    data = graphql(QUERY, variables)
    posts_data = data.get("posts", {})
    edges = posts_data.get("edges", [])
    posts = [e["node"] for e in edges]

    filters = []
    if args.featured:
        filters.append("featured")
    if args.topic:
        filters.append(f"topic:{args.topic}")
    if args.after:
        filters.append(f"after:{args.after}")
    
    label = f"posts({','.join(filters)})" if filters else "posts"
    print_posts_list(posts, label)
    print_pagination(posts_data.get("pageInfo"), posts_data.get("totalCount"))


if __name__ == "__main__":
    main()
