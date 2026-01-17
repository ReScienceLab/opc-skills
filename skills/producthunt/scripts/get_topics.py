#!/usr/bin/env python3
"""
Get topics with optional search
Usage: python3 scripts/get_topics.py --query "AI" --limit 20
"""
import argparse
from producthunt_api import graphql, print_topics_list, print_pagination

QUERY = """
query GetTopics($first: Int, $after: String, $query: String) {
  topics(first: $first, after: $after, query: $query, order: FOLLOWERS_COUNT) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        name
        slug
        description
        postsCount
        followersCount
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt topics")
    parser.add_argument("--query", "-q", help="Search query")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max topics")
    parser.add_argument("--cursor", "-c", help="Pagination cursor")
    args = parser.parse_args()

    variables = {
        "first": min(args.limit, 50),
        "after": args.cursor,
        "query": args.query,
    }

    data = graphql(QUERY, variables)
    topics_data = data.get("topics", {})
    edges = topics_data.get("edges", [])
    topics = [e["node"] for e in edges]

    label = f"topics(query:{args.query})" if args.query else "topics"
    print_topics_list(topics, label)
    print_pagination(topics_data.get("pageInfo"), topics_data.get("totalCount"))


if __name__ == "__main__":
    main()
