#!/usr/bin/env python3
"""
Get user's posts (submitted or made)
Usage: python3 scripts/get_user_posts.py rrhoover --limit 20
"""
import argparse
from producthunt_api import graphql, print_posts_list, print_pagination

QUERY = """
query GetUserPosts($id: ID, $username: String, $first: Int, $after: String) {
  user(id: $id, username: $username) {
    id
    name
    username
    submittedPosts(first: $first, after: $after) {
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
          featuredAt
        }
      }
    }
    madePosts(first: $first, after: $after) {
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
          featuredAt
        }
      }
    }
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get user's posts")
    parser.add_argument("identifier", help="Username or user ID")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max posts")
    parser.add_argument("--made", "-m", action="store_true", help="Show made posts instead of submitted")
    parser.add_argument("--cursor", "-c", help="Pagination cursor")
    args = parser.parse_args()

    variables = {"first": min(args.limit, 50), "after": args.cursor}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["username"] = args.identifier

    data = graphql(QUERY, variables)
    user = data.get("user")

    if not user:
        print(f"User not found: {args.identifier}")
        return

    print(f"user: @{user.get('username')} ({user.get('name')})")
    
    if args.made:
        posts_data = user.get("madePosts", {})
        label = "made_posts"
    else:
        posts_data = user.get("submittedPosts", {})
        label = "submitted_posts"
    
    edges = posts_data.get("edges", [])
    posts = [e["node"] for e in edges]
    
    print_posts_list(posts, label)
    print_pagination(posts_data.get("pageInfo"), posts_data.get("totalCount"))


if __name__ == "__main__":
    main()
