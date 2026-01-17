#!/usr/bin/env python3
"""
Get post by ID or slug
Usage: python3 scripts/get_post.py POST_ID_OR_SLUG
"""
import argparse
import json
from producthunt_api import graphql, clean_post, print_post

QUERY = """
query GetPost($id: ID, $slug: String) {
  post(id: $id, slug: $slug) {
    id
    name
    tagline
    slug
    description
    votesCount
    commentsCount
    url
    website
    featuredAt
    createdAt
    makers { name username }
    topics(first: 5) { edges { node { name slug } } }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt post")
    parser.add_argument("identifier", help="Post ID or slug")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    variables = {}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["slug"] = args.identifier

    data = graphql(QUERY, variables)
    post = data.get("post")

    if not post:
        print(f"Post not found: {args.identifier}")
        return

    if args.json:
        print(json.dumps(post, indent=2))
        return

    cleaned = clean_post(post)
    print_post(cleaned)
    
    if post.get("description"):
        print(f"---")
        desc = post["description"][:500]
        print(f"description: {desc}")
    
    topics = post.get("topics", {}).get("edges", [])
    if topics:
        topic_names = [e["node"]["slug"] for e in topics]
        print(f"topics: {', '.join(topic_names)}")


if __name__ == "__main__":
    main()
