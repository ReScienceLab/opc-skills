---
name: requesthunt
description: Generate user demand research reports from real user feedback. Scrape and analyze feature requests, complaints, and questions from Reddit, X, and GitHub. Use when user wants to do demand research, find feature requests, analyze user demand, or run RequestHunt queries.
---

# RequestHunt Skill

Generate user demand research reports by collecting and analyzing real user feedback from Reddit, X (Twitter), and GitHub.

## Prerequisites

Set API key in `~/.zshrc`:
```bash
export REQUESTHUNT_API_KEY="your_api_key"
```

Get your key from: https://requesthunt.com/settings/api

**Quick Check**:
```bash
cd <skill_directory>
python3 scripts/get_usage.py
```

## Research Workflow

This skill helps you generate comprehensive user demand research reports. Follow this workflow:

### Step 1: Define Scope

Before collecting data, clarify with the user:
1. **Research Goal**: What domain/area to investigate? (e.g., AI coding assistants, project management tools)
2. **Specific Products**: Any products/competitors to focus on? (e.g., Cursor, GitHub Copilot)
3. **Platform Preference**: Which platforms to prioritize? (reddit, x, github)
4. **Time Range**: How recent should the feedback be?
5. **Report Purpose**: Product planning / competitive analysis / market research?

### Step 2: Collect Data

```bash
# 1. Trigger realtime scrape for the topic
python3 scripts/scrape_topic.py "ai-coding-assistant" --platforms reddit,x,github

# 2. Search with expansion for more data
python3 scripts/search_requests.py "code completion" --expand --limit 50

# 3. List requests filtered by topic
python3 scripts/list_requests.py --topic "ai-tools" --limit 100
```

### Step 3: Generate Report

Analyze collected data and generate a structured Markdown report:

```markdown
# [Topic] User Demand Research Report

## Overview
- Scope: ...
- Data Sources: Reddit (X), X (Y), GitHub (Z)
- Time Range: ...

## Key Findings

### 1. Top Feature Requests
| Rank | Request | Sources | Representative Quote |
|------|---------|---------|---------------------|

### 2. Pain Points Analysis
- **Pain Point A**: ...

### 3. Competitive Comparison (if specified)
| Feature | Product A | Product B | User Expectations |

### 4. Opportunities
- ...

## Methodology
Based on N real user feedbacks collected via RequestHunt...
```

## Commands

All commands run from the skill directory.

### List Requests
```bash
python3 scripts/list_requests.py --limit 20                    # Recent requests
python3 scripts/list_requests.py --topic "ai-tools" --limit 10 # By topic
python3 scripts/list_requests.py --platforms reddit,github     # By platform
python3 scripts/list_requests.py --category "Developer Tools"  # By category
python3 scripts/list_requests.py --sortBy top --limit 20       # Top voted
```

### Search Requests
```bash
python3 scripts/search_requests.py "authentication" --limit 20
python3 scripts/search_requests.py "oauth" --expand            # With realtime expansion
python3 scripts/search_requests.py "API rate limit" --expand --platforms reddit,x
```

### Get Topics
```bash
python3 scripts/get_topics.py                                  # List all topics by category
```

### Check Usage
```bash
python3 scripts/get_usage.py                                   # View API usage stats
```

### Scrape Topic (Realtime)
```bash
python3 scripts/scrape_topic.py "developer-tools"              # Default: reddit,x
python3 scripts/scrape_topic.py "ai-assistant" --platforms reddit,x,github
```

## API Info
- **Base URL**: https://requesthunt.com
- **Auth**: Bearer token (API key)
- **Rate Limits**: 
  - Cached requests: 1000/month
  - Realtime requests: 500/month (scraping is expensive)
- **Docs**: https://requesthunt.com/docs
