#!/usr/bin/env python3
"""Get trends with Xquik."""
import argparse

from xquik_api import api_get, print_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Get trending topics")
    parser.add_argument("--woeid", type=int, default=1)
    parser.add_argument("--count", type=int, default=30)
    args = parser.parse_args()

    data = api_get("/x/trends", {"woeid": args.woeid, "count": args.count})
    print_json(data)


if __name__ == "__main__":
    main()
