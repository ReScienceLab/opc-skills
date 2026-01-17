#!/usr/bin/env python3
"""
Get comments on a post
Usage: python3 scripts/get_post_comments.py POST_ID --limit 20
"""
import argparse
from producthunt_api import graphql, print_comments_list, print_pagination

QUERY = """
query GetPostComments($id: ID, $slug: String, $first: Int, $after: String) {
  post(id: $id, slug: $slug) {
    id
    name
    commentsCount
    comments(first: $first, after: $after) {
      totalCount
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          body
          votesCount
          createdAt
          user { name username }
        }
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get post comments")
    parser.add_argument("identifier", help="Post ID or slug")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max comments")
    parser.add_argument("--cursor", "-c", help="Pagination cursor")
    args = parser.parse_args()

    variables = {"first": min(args.limit, 50), "after": args.cursor}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["slug"] = args.identifier

    data = graphql(QUERY, variables)
    post = data.get("post")

    if not post:
        print(f"Post not found: {args.identifier}")
        return

    print(f"post: {post.get('name')} (id:{post.get('id')})")
    print(f"total_comments: {post.get('commentsCount')}")
    
    comments_data = post.get("comments", {})
    edges = comments_data.get("edges", [])
    comments = [e["node"] for e in edges]
    
    print_comments_list(comments)
    print_pagination(comments_data.get("pageInfo"))


if __name__ == "__main__":
    main()
