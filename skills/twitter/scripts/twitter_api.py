#!/usr/bin/env python3
"""
Twitter API wrapper using twitterapi.io
"""
import urllib.request
import urllib.parse
import json
import sys
from credential import get_twitter_api_key

API_BASE = "https://api.twitterapi.io/twitter"


def api_get(endpoint: str, params: dict = None) -> dict:
    """Make GET request to twitterapi.io"""
    api_key = get_twitter_api_key()
    if not api_key:
        print("error: TWITTERAPI_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    
    url = f"{API_BASE}/{endpoint}"
    if params:
        filtered = {k: v for k, v in params.items() if v is not None}
        if filtered:
            url += "?" + urllib.parse.urlencode(filtered)
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "X-API-Key": api_key})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"error: HTTP {e.code} - {error_body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


def format_count(n) -> str:
    """Format numbers (1234567 -> 1.2M)"""
    if n is None:
        return "0"
    n = int(n)
    if n >= 1_000_000_000:
        return f"{n/1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def clean_user(u: dict) -> dict:
    """Clean user object"""
    if not u:
        return None
    return {
        "id": u.get("id"),
        "username": u.get("userName"),
        "name": u.get("name"),
        "verified": u.get("isBlueVerified"),
        "followers": u.get("followers"),
        "following": u.get("following"),
        "tweets": u.get("statusesCount"),
        "description": (u.get("description") or "")[:150],
        "location": u.get("location"),
        "created": u.get("createdAt"),
    }


def clean_tweet(t: dict) -> dict:
    """Clean tweet object"""
    if not t:
        return None
    author = t.get("author", {})
    return {
        "id": t.get("id"),
        "text": t.get("text"),
        "author": author.get("userName") if author else None,
        "author_name": author.get("name") if author else None,
        "created": t.get("createdAt"),
        "retweets": t.get("retweetCount"),
        "likes": t.get("likeCount"),
        "replies": t.get("replyCount"),
        "quotes": t.get("quoteCount"),
        "views": t.get("viewCount"),
        "lang": t.get("lang"),
        "isReply": t.get("isReply"),
    }


def print_user(u: dict):
    """Print user in TOON format"""
    if not u:
        return
    print(f"id: {u.get('id', '')}")
    print(f"username: @{u.get('username', '')}")
    print(f"name: {u.get('name', '')}")
    print(f"verified: {u.get('verified', False)}")
    print(f"followers: {format_count(u.get('followers'))}")
    print(f"following: {format_count(u.get('following'))}")
    print(f"tweets: {format_count(u.get('tweets'))}")
    if u.get('location'):
        print(f"location: {u['location']}")
    if u.get('description'):
        print(f"bio: {u['description']}")
    if u.get('created'):
        print(f"created: {u['created']}")


def print_tweet(t: dict):
    """Print tweet in TOON format"""
    if not t:
        return
    print(f"id: {t.get('id', '')}")
    print(f"author: @{t.get('author', '')} ({t.get('author_name', '')})")
    text = (t.get('text') or '')[:280]
    print(f"text: {text}")
    print(f"stats: {format_count(t.get('retweets'))} RT | {format_count(t.get('likes'))} likes | {format_count(t.get('replies'))} replies | {format_count(t.get('views'))} views")
    print(f"created: {t.get('created', '')}")


def print_users_list(users: list, label: str = "users"):
    """Print list of users"""
    cleaned = [clean_user(u) for u in users if u]
    print(f"{label}[{len(cleaned)}]{{username,name,followers,verified}}:")
    for u in cleaned:
        print(f"  @{u['username']},{u['name']},{format_count(u['followers'])},{u['verified']}")


def print_tweets_list(tweets: list, label: str = "tweets"):
    """Print list of tweets"""
    cleaned = [clean_tweet(t) for t in tweets if t]
    print(f"{label}[{len(cleaned)}]{{id,author,text,likes}}:")
    for t in cleaned:
        text = (t['text'] or '')[:60].replace('\n', ' ')
        print(f"  {t['id']},@{t['author']},{text},{format_count(t['likes'])}")


def print_pagination(data: dict):
    """Print pagination info"""
    has_next = data.get("has_next_page", False)
    cursor = data.get("next_cursor", "")
    if has_next and cursor:
        print(f"---")
        print(f"has_next_page: {has_next}")
        print(f"next_cursor: {cursor}")
