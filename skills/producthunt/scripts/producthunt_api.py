#!/usr/bin/env python3
"""
ProductHunt GraphQL API wrapper
"""
import urllib.request
import json
import sys
from credential import get_access_token

API_URL = "https://api.producthunt.com/v2/api/graphql"


def graphql(query: str, variables: dict = None) -> dict:
    """Execute GraphQL query"""
    token = get_access_token()
    if not token:
        print("error: PRODUCTHUNT_ACCESS_TOKEN not set", file=sys.stderr)
        sys.exit(1)
    
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    
    req = urllib.request.Request(API_URL, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            if "errors" in data:
                print(f"error: {data['errors'][0]['message']}", file=sys.stderr)
                sys.exit(1)
            return data.get("data", {})
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
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def clean_post(p: dict) -> dict:
    """Clean post object"""
    if not p:
        return None
    return {
        "id": p.get("id"),
        "name": p.get("name"),
        "tagline": p.get("tagline"),
        "slug": p.get("slug"),
        "votes": p.get("votesCount"),
        "comments": p.get("commentsCount"),
        "url": p.get("url"),
        "website": p.get("website"),
        "featured_at": p.get("featuredAt"),
        "created_at": p.get("createdAt"),
        "makers": [m.get("name") for m in (p.get("makers") or [])],
    }


def clean_user(u: dict) -> dict:
    """Clean user object"""
    if not u:
        return None
    return {
        "id": u.get("id"),
        "name": u.get("name"),
        "username": u.get("username"),
        "headline": u.get("headline"),
        "url": u.get("url"),
        "twitter": u.get("twitterUsername"),
        "website": u.get("websiteUrl"),
        "is_maker": u.get("isMaker"),
    }


def clean_topic(t: dict) -> dict:
    """Clean topic object"""
    if not t:
        return None
    return {
        "id": t.get("id"),
        "name": t.get("name"),
        "slug": t.get("slug"),
        "description": (t.get("description") or "")[:150],
        "posts_count": t.get("postsCount"),
        "followers_count": t.get("followersCount"),
        "url": t.get("url"),
    }


def clean_collection(c: dict) -> dict:
    """Clean collection object"""
    if not c:
        return None
    return {
        "id": c.get("id"),
        "name": c.get("name"),
        "tagline": c.get("tagline"),
        "url": c.get("url"),
        "followers": c.get("followersCount"),
        "featured_at": c.get("featuredAt"),
    }


def clean_comment(c: dict) -> dict:
    """Clean comment object"""
    if not c:
        return None
    user = c.get("user", {})
    return {
        "id": c.get("id"),
        "body": c.get("body"),
        "author": user.get("username") if user else None,
        "author_name": user.get("name") if user else None,
        "votes": c.get("votesCount"),
        "created_at": c.get("createdAt"),
    }


def print_post(p: dict):
    """Print post in TOON format"""
    if not p:
        return
    print(f"id: {p.get('id', '')}")
    print(f"name: {p.get('name', '')}")
    print(f"tagline: {p.get('tagline', '')}")
    print(f"votes: {format_count(p.get('votes'))}")
    print(f"comments: {format_count(p.get('comments'))}")
    print(f"url: {p.get('url', '')}")
    if p.get('website'):
        print(f"website: {p['website']}")
    if p.get('makers'):
        print(f"makers: {', '.join(p['makers'])}")
    if p.get('featured_at'):
        print(f"featured: {p['featured_at']}")


def print_user(u: dict):
    """Print user in TOON format"""
    if not u:
        return
    print(f"id: {u.get('id', '')}")
    print(f"username: @{u.get('username', '')}")
    print(f"name: {u.get('name', '')}")
    if u.get('headline'):
        print(f"headline: {u['headline']}")
    print(f"maker: {u.get('is_maker', False)}")
    print(f"url: {u.get('url', '')}")
    if u.get('twitter'):
        print(f"twitter: @{u['twitter']}")
    if u.get('website'):
        print(f"website: {u['website']}")


def print_topic(t: dict):
    """Print topic in TOON format"""
    if not t:
        return
    print(f"id: {t.get('id', '')}")
    print(f"name: {t.get('name', '')}")
    print(f"slug: {t.get('slug', '')}")
    print(f"posts: {format_count(t.get('posts_count'))}")
    print(f"followers: {format_count(t.get('followers_count'))}")
    if t.get('description'):
        print(f"description: {t['description']}")
    if t.get('url'):
        print(f"url: {t['url']}")


def print_posts_list(posts: list, label: str = "posts"):
    """Print list of posts"""
    cleaned = [clean_post(p) for p in posts if p]
    print(f"{label}[{len(cleaned)}]{{name,tagline,votes}}:")
    for p in cleaned:
        tagline = (p['tagline'] or '')[:50]
        print(f"  {p['name']},{tagline},{format_count(p['votes'])}")


def print_topics_list(topics: list, label: str = "topics"):
    """Print list of topics"""
    cleaned = [clean_topic(t) for t in topics if t]
    print(f"{label}[{len(cleaned)}]{{name,slug,posts}}:")
    for t in cleaned:
        print(f"  {t['name']},{t['slug']},{format_count(t['posts_count'])}")


def print_comments_list(comments: list, label: str = "comments"):
    """Print list of comments"""
    cleaned = [clean_comment(c) for c in comments if c]
    print(f"{label}[{len(cleaned)}]{{author,body,votes}}:")
    for c in cleaned:
        body = (c['body'] or '')[:60].replace('\n', ' ')
        print(f"  @{c['author']},{body},{c['votes']}")


def print_pagination(page_info: dict, total: int = None):
    """Print pagination info"""
    if not page_info:
        return
    has_next = page_info.get("hasNextPage", False)
    cursor = page_info.get("endCursor", "")
    if total is not None:
        print(f"---")
        print(f"total: {total}")
    if has_next and cursor:
        if total is None:
            print(f"---")
        print(f"has_next_page: {has_next}")
        print(f"next_cursor: {cursor}")
