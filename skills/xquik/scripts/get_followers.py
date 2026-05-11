#!/usr/bin/env python3
"""Get followers with Xquik."""
import argparse
import urllib.parse

from xquik_api import api_get, print_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Get user followers")
    parser.add_argument("user", help="User ID or username")
    parser.add_argument("--cursor")
    parser.add_argument("--page-size", type=int, default=100)
    args = parser.parse_args()

    user = urllib.parse.quote(args.user, safe="")
    data = api_get(
        f"/x/users/{user}/followers",
        {"cursor": args.cursor, "pageSize": args.page_size},
    )
    print_json(data)


if __name__ == "__main__":
    main()
