#!/usr/bin/env python3
"""
Get topic by ID or slug
Usage: python3 scripts/get_topic.py artificial-intelligence
"""
import argparse
import json
from producthunt_api import graphql, clean_topic, print_topic

QUERY = """
query GetTopic($id: ID, $slug: String) {
  topic(id: $id, slug: $slug) {
    id
    name
    slug
    description
    postsCount
    followersCount
    url
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt topic")
    parser.add_argument("identifier", help="Topic ID or slug")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    variables = {}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["slug"] = args.identifier

    data = graphql(QUERY, variables)
    topic = data.get("topic")

    if not topic:
        print(f"Topic not found: {args.identifier}")
        return

    if args.json:
        print(json.dumps(topic, indent=2))
        return

    print_topic(clean_topic(topic))


if __name__ == "__main__":
    main()
