---
name: producthunt
description: Search and retrieve content from Product Hunt. Get posts, topics, users, and collections via the GraphQL API. Use when user mentions Product Hunt, PH, or product launches.
---

# ProductHunt Skill

Get posts, topics, users, and collections from Product Hunt via the official GraphQL API.

## Prerequisites

Set access token in `~/.zshrc`:
```bash
export PRODUCTHUNT_ACCESS_TOKEN="your_developer_token"
```

Get your token from: https://www.producthunt.com/v2/oauth/applications

**Quick Check**:
```bash
cd <skill_directory>
python3 scripts/get_posts.py --limit 3
```

## Commands

All commands run from the skill directory.

### Posts
```bash
python3 scripts/get_post.py chatgpt                    # Get post by slug
python3 scripts/get_post.py 12345                      # Get post by ID
python3 scripts/get_posts.py --limit 20                # Today's featured posts
python3 scripts/get_posts.py --topic ai --limit 10     # Posts in topic
python3 scripts/get_posts.py --after 2026-01-01        # Posts after date
python3 scripts/get_post_comments.py POST_ID --limit 20
```

### Topics
```bash
python3 scripts/get_topic.py artificial-intelligence  # Get topic by slug
python3 scripts/get_topics.py --query "AI" --limit 20 # Search topics
python3 scripts/get_topics.py --limit 50              # Popular topics
```

### Users
```bash
python3 scripts/get_user.py rrhoover                  # Get user by username
python3 scripts/get_user_posts.py rrhoover --limit 20 # User's posts
```

### Collections
```bash
python3 scripts/get_collection.py SLUG_OR_ID          # Get collection
python3 scripts/get_collections.py --featured --limit 20
```

## API Info
- **Endpoint**: https://api.producthunt.com/v2/api/graphql
- **Type**: GraphQL
- **Rate Limits**: 6250 complexity points / 15 min
- **Docs**: https://api.producthunt.com/v2/docs
