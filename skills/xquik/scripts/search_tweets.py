#!/usr/bin/env python3
"""Search tweets with Xquik."""
import argparse

from xquik_api import api_get, print_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Search tweets")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--query-type", choices=["Latest", "Top"], default="Latest")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--cursor")
    parser.add_argument("--since-time")
    parser.add_argument("--until-time")
    args = parser.parse_args()

    data = api_get(
        "/x/tweets/search",
        {
            "q": args.query,
            "queryType": args.query_type,
            "limit": args.limit,
            "cursor": args.cursor,
            "sinceTime": args.since_time,
            "untilTime": args.until_time,
        },
    )
    print_json(data)


if __name__ == "__main__":
    main()
