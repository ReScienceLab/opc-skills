---
name: requesthunt
description: Generate user demand research reports from real user feedback. Scrape and analyze feature requests, complaints, and questions from Reddit, X, GitHub, YouTube, and LinkedIn. Use when user wants to do demand research, find feature requests, analyze user demand, or run RequestHunt queries.
---

# RequestHunt Skill

Generate user demand research reports by collecting and analyzing real user feedback from Reddit, X (Twitter), GitHub, YouTube, and LinkedIn.

## Prerequisites

Install the CLI and authenticate:
```bash
curl -fsSL https://requesthunt.com/cli | sh
requesthunt auth login
```

The CLI displays a verification code and opens `https://requesthunt.com/device` — the human must enter the code to approve. Verify with:
```bash
requesthunt config show
```
Expected output contains: `resolved_api_key:` with a masked key value (not `null`).

For headless/CI environments, use a manual API key instead:
```bash
requesthunt config set-key rh_live_your_key
```

Get your key from: https://requesthunt.com/dashboard

## Output Modes

Default output is TOON (Token-Oriented Object Notation) — structured and token-efficient.
Use `--json` for raw JSON or `--human` for table/key-value display.

## Research Workflow

### Step 1: Define Scope

Before collecting data, clarify with the user:
1. **Research Goal**: What domain/area to investigate? (e.g., AI coding assistants, project management tools)
2. **Specific Products**: Any products/competitors to focus on? (e.g., Cursor, GitHub Copilot)
3. **Platform Preference**: Which platforms to prioritize? (reddit, x, github, youtube, linkedin)
4. **Time Range**: How recent should the feedback be?
5. **Report Purpose**: Product planning / competitive analysis / market research?

### Step 2: Collect Data

```bash
# 1. Trigger realtime scrape for the topic
requesthunt scrape start "ai-coding-assistant" --platforms reddit,x,github,youtube,linkedin --depth 2

# 2. Search with expansion for more data
requesthunt search "code completion" --expand --limit 50

# 3. List requests filtered by topic
requesthunt list --topic "ai-tools" --limit 100
```

### Step 3: Generate Report

Analyze collected data and generate a structured Markdown report:

```markdown
# [Topic] User Demand Research Report

## Overview
- Scope: ...
- Data Sources: Reddit (X), X (Y), GitHub (Z), YouTube (W), LinkedIn (V)
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

### Search
```bash
requesthunt search "authentication" --limit 20
requesthunt search "oauth" --expand                          # With realtime expansion
requesthunt search "API rate limit" --expand --platforms reddit,x,youtube
```

### List
```bash
requesthunt list --limit 20                                  # Recent requests
requesthunt list --topic "ai-tools" --limit 10               # By topic
requesthunt list --platforms reddit,github,youtube                    # By platform
requesthunt list --category "Developer Tools"                # By category
requesthunt list --sort top --limit 20                       # Top voted
```

### Scrape
```bash
requesthunt scrape start "developer-tools" --depth 1         # Default: all platforms
requesthunt scrape start "ai-assistant" --platforms reddit,x,github,youtube,linkedin --depth 2
requesthunt scrape status "job_123"                          # Check job status
```

### Reference
```bash
requesthunt topics                                           # List all topics by category
requesthunt usage                                            # View account stats
requesthunt config show                                      # Check auth status
```

## API Info
- **Base URL**: https://requesthunt.com
- **Auth**: Device code login (`requesthunt auth login`) or manual API key
- **Rate Limits**:
  - Free tier: 100 credits/month, 10 req/min
  - Pro tier: 2,000 credits/month, 60 req/min
- **Costs**:
  - API call: 1 credit
  - Scrape: depth x number of platforms credits
- **Docs**: https://requesthunt.com/docs
- **Agent Setup**: https://requesthunt.com/setup.md
