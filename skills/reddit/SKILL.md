---
name: reddit
description: Search and retrieve content from Reddit. Get posts, comments, subreddit info, and user profiles via the public JSON API. Use when user mentions Reddit, a subreddit, or r/ links.
---

# Reddit Skill

Get posts, comments, subreddit info, and user profiles from Reddit via the public JSON API.

## Prerequisites

**No API key required!** Reddit's public JSON API works without authentication.

**Quick Check**:
```bash
cd <skill_directory>
python3 scripts/get_posts.py python --limit 3
```

## Commands

All commands run from the skill directory.

### Subreddit Posts
```bash
python3 scripts/get_posts.py python --limit 20           # Hot posts (default)
python3 scripts/get_posts.py python --sort new --limit 20
python3 scripts/get_posts.py python --sort top --time week
python3 scripts/get_posts.py python --sort top --time all --limit 10
```

### Search Posts
```bash
python3 scripts/search_posts.py "AI agent" --limit 20
python3 scripts/search_posts.py "MCP server" --subreddit ClaudeAI --limit 10
python3 scripts/search_posts.py "async python" --sort top --time year
```

### Subreddit Info
```bash
python3 scripts/get_subreddit.py python
python3 scripts/get_subreddit.py ClaudeAI
```

### Post & Comments
```bash
python3 scripts/get_post.py abc123                       # Get post by ID
python3 scripts/get_post.py abc123 --comments 50         # With more comments
```

### User Profile
```bash
python3 scripts/get_user.py spez
python3 scripts/get_user.py spez --posts 10              # Include recent posts
```

## Sort Options

| Sort | Description | Time Options |
|------|-------------|--------------|
| `hot` | Trending posts (default) | - |
| `new` | Latest posts | - |
| `top` | Highest voted | hour, day, week, month, year, all |
| `rising` | Gaining traction | - |
| `controversial` | Mixed votes | hour, day, week, month, year, all |

## API Info
- **Method**: Public JSON API (no auth needed)
- **Trick**: Append `.json` to any Reddit URL
- **Rate Limit**: 100 requests/minute
- **Docs**: https://www.reddit.com/dev/api
