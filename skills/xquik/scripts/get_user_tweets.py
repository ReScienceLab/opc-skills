#!/usr/bin/env python3
"""Get profile tweets with Xquik."""
import argparse
import urllib.parse

from xquik_api import api_get, print_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Get profile tweets")
    parser.add_argument("user", help="User ID or username")
    parser.add_argument("--cursor")
    parser.add_argument("--include-replies", action="store_true")
    parser.add_argument("--include-parent-tweet", action="store_true")
    args = parser.parse_args()

    user = urllib.parse.quote(args.user, safe="")
    data = api_get(
        f"/x/users/{user}/tweets",
        {
            "cursor": args.cursor,
            "includeReplies": str(args.include_replies).lower() if args.include_replies else None,
            "includeParentTweet": str(args.include_parent_tweet).lower()
            if args.include_parent_tweet
            else None,
        },
    )
    print_json(data)


if __name__ == "__main__":
    main()
