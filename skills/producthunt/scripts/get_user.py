#!/usr/bin/env python3
"""
Get user by username or ID
Usage: python3 scripts/get_user.py rrhoover
"""
import argparse
import json
from producthunt_api import graphql, clean_user, print_user

QUERY = """
query GetUser($id: ID, $username: String) {
  user(id: $id, username: $username) {
    id
    name
    username
    headline
    url
    twitterUsername
    websiteUrl
    isMaker
    createdAt
    profileImage
  }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Get ProductHunt user")
    parser.add_argument("identifier", help="Username or user ID")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    variables = {}
    if args.identifier.isdigit():
        variables["id"] = args.identifier
    else:
        variables["username"] = args.identifier

    data = graphql(QUERY, variables)
    user = data.get("user")

    if not user:
        print(f"User not found: {args.identifier}")
        return

    if args.json:
        print(json.dumps(user, indent=2))
        return

    print_user(clean_user(user))
    if user.get("createdAt"):
        print(f"joined: {user['createdAt']}")


if __name__ == "__main__":
    main()
