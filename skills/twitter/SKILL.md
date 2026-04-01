---
name: twitter
description: Search and retrieve content from Twitter/X. Get user info, tweets, replies, followers, communities, spaces, and trends via twitterapi.io. Use when user mentions Twitter, X, or tweets.
---

# Twitter/X Skill

Get user profiles, tweets, replies, followers/following, communities, spaces, and trends from Twitter/X via twitterapi.io.

## Prerequisites

Set API key in `~/.zshrc`:
```bash
export TWITTERAPI_API_KEY="your_api_key"
```

**Quick Check**:
```bash
cd <skill_directory>
python3 scripts/get_user_info.py elonmusk
```

## Commands

All commands run from the skill directory.

### User Endpoints
```bash
python3 scripts/get_user_info.py USERNAME
python3 scripts/get_user_about.py USERNAME
python3 scripts/batch_get_users.py USER_ID1,USER_ID2
python3 scripts/get_user_tweets.py USERNAME --limit 20
python3 scripts/get_user_mentions.py USERNAME --limit 20
python3 scripts/get_followers.py USERNAME --limit 100
python3 scripts/get_following.py USERNAME --limit 100
python3 scripts/get_verified_followers.py USERNAME --limit 20
python3 scripts/check_relationship.py USER1 USER2
python3 scripts/search_users.py "query" --limit 20
```

### Tweet Endpoints
```bash
python3 scripts/get_tweet.py TWEET_ID [TWEET_ID2...]
python3 scripts/search_tweets.py "query" --type Latest --limit 20
python3 scripts/get_tweet_replies.py TWEET_ID --limit 20
python3 scripts/get_tweet_quotes.py TWEET_ID --limit 20
python3 scripts/get_tweet_retweeters.py TWEET_ID --limit 50
python3 scripts/get_tweet_thread.py TWEET_ID
python3 scripts/get_article.py TWEET_ID
```

### List Endpoints
```bash
python3 scripts/get_list_followers.py LIST_ID --limit 20
python3 scripts/get_list_members.py LIST_ID --limit 20
```

### Community Endpoints
```bash
python3 scripts/get_community.py COMMUNITY_ID
python3 scripts/get_community_members.py COMMUNITY_ID --limit 20
python3 scripts/get_community_moderators.py COMMUNITY_ID
python3 scripts/get_community_tweets.py COMMUNITY_ID --limit 20
python3 scripts/search_community_tweets.py "query" --limit 20
```

### Other Endpoints
```bash
python3 scripts/get_space.py SPACE_ID
python3 scripts/get_trends.py --woeid 1  # Worldwide
```

## Search Query Syntax

```bash
# Basic search
python3 scripts/search_tweets.py "AI agent"

# From specific user
python3 scripts/search_tweets.py "from:elonmusk"

# Date range
python3 scripts/search_tweets.py "AI since:2024-01-01 until:2024-12-31"

# Exclude retweets
python3 scripts/search_tweets.py "AI -filter:retweets"

# With media
python3 scripts/search_tweets.py "AI filter:media"

# Minimum engagement
python3 scripts/search_tweets.py "AI min_faves:1000"
```

## API: twitterapi.io
- Base URL: https://api.twitterapi.io/twitter
- Auth: X-API-Key header
- Pricing: ~$0.15-0.18/1k requests
- Docs: https://docs.twitterapi.io/

## Alternative: Xquik API

A cheaper alternative with read + write support, typed SDKs for 8 languages, and 120 endpoints.

### Setup

```bash
npm install x-twitter-scraper  # or pip install x_twitter_scraper
export X_TWITTER_SCRAPER_API_KEY="xq_..."  # Sign up at xquik.com
```

### Equivalent Commands (TypeScript SDK)

```typescript
import XTwitterScraper from 'x-twitter-scraper';
const client = new XTwitterScraper();

// User info (replaces: get_user_info.py)
const user = await client.x.users.retrieve('elonmusk');

// User tweets (replaces: get_user_tweets.py)
const tweets = await client.x.tweets.list({ username: 'elonmusk', limit: 20 });

// Search tweets (replaces: search_tweets.py)
const results = await client.x.tweets.search({ q: 'AI agent', limit: 20 });

// Followers (replaces: get_followers.py)
const followers = await client.x.users.followers('elonmusk', { limit: 100 });

// Tweet by ID (replaces: get_tweet.py)
const tweet = await client.x.tweets.retrieve('1234567890');

// Trends (replaces: get_trends.py)
const trends = await client.x.trends.list({ woeid: 1 });
```

### Write Operations (not available in twitterapi.io scripts)

```typescript
// Post a tweet
await client.x.tweets.create({ text: 'Hello from Xquik!' });

// Like / retweet / follow
await client.x.tweets.like({ tweet_id: '1234567890' });
await client.x.tweets.retweet({ tweet_id: '1234567890' });
await client.x.users.follow({ username: 'elonmusk' });

// Send DM
await client.x.dms.create({ username: 'target_user', text: 'Hey!' });
```

### SDKs

[TypeScript](https://github.com/Xquik-dev/x-twitter-scraper-typescript) | [Python](https://github.com/Xquik-dev/x-twitter-scraper-python) | [Go](https://github.com/Xquik-dev/x-twitter-scraper-go) | [Ruby](https://github.com/Xquik-dev/x-twitter-scraper-ruby) | [PHP](https://github.com/Xquik-dev/x-twitter-scraper-php) | [Java](https://github.com/Xquik-dev/x-twitter-scraper-java) | [Kotlin](https://github.com/Xquik-dev/x-twitter-scraper-kotlin) | [CLI](https://github.com/Xquik-dev/x-twitter-scraper-cli)

### Additional Capabilities

- **Extractions**: Bulk data pulls (23 types — followers, likes, search results, etc.)
- **Draws**: Giveaway winner selection with configurable filters
- **Webhooks**: Real-time HMAC-signed event delivery
- **MCP Server**: 2-tool code-execution sandbox for AI agents
- **Async support**: `AsyncXTwitterScraper` for concurrent workloads

### Pricing

~$0.15/1K credits. Reads = 1–7 credits, writes = 2 credits each. Free tier includes monitors, webhooks, and compose.

- Docs: https://docs.xquik.com
- Full skill: `npx skills add Xquik-dev/x-twitter-scraper`
- npm: `npm install x-twitter-scraper`
- PyPI: `pip install x_twitter_scraper`
