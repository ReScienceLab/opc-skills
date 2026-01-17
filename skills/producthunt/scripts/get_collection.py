#!/usr/bin/env python3
"""
Get collection by ID or slug
Usage: python3 scripts/get_collection.py COLLECTION_SLUG
"""
import argparse
import json
from producthunt_api import graphql, clean_collection, format_count

QUERY = """
query GetCollection($id: ID, $slug: String) {
  collection(id: $id, slug: $slug) {
    id
    name
    tagline
    description
    url
    followersCount
    featuredAt
    createdAt
    user { name username }
    posts(first: 10) {
      totalCount
      edges {
        node {
          id
          name
          tagline
          votesCount
        }
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt collection")
    parser.add_argument("identifier", help="Collection ID or slug")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    variables = {}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["slug"] = args.identifier

    data = graphql(QUERY, variables)
    collection = data.get("collection")

    if not collection:
        print(f"Collection not found: {args.identifier}")
        return

    if args.json:
        print(json.dumps(collection, indent=2))
        return

    print(f"id: {collection.get('id')}")
    print(f"name: {collection.get('name')}")
    print(f"tagline: {collection.get('tagline')}")
    print(f"followers: {format_count(collection.get('followersCount'))}")
    print(f"url: {collection.get('url')}")
    
    user = collection.get("user", {})
    if user:
        print(f"creator: @{user.get('username')} ({user.get('name')})")
    
    if collection.get("description"):
        print(f"description: {collection['description'][:200]}")
    
    posts_data = collection.get("posts", {})
    posts = [e["node"] for e in posts_data.get("edges", [])]
    if posts:
        print(f"---")
        print(f"posts[{posts_data.get('totalCount', len(posts))}]{{name,votes}}:")
        for p in posts:
            print(f"  {p['name']},{format_count(p['votesCount'])}")


if __name__ == "__main__":
    main()
