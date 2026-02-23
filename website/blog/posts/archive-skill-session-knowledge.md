# Stop Losing Context Between AI Sessions: Introducing the Archive Skill

*By OPC Team | February 23, 2026 | 7 min read*

**TL;DR** — Every AI coding session generates valuable knowledge: debugging solutions, deployment steps, configuration tricks. But when the session ends, that knowledge vanishes. The new **Archive skill** for OPC Skills solves this by creating indexed, searchable markdown archives in your project. Your AI agent can write session learnings to `.archive/` and consult them in future sessions. Install in 30 seconds with `npx skills add ReScienceLab/opc-skills --skill archive`. No API keys required.

---

## The Problem: AI Agents Have No Long-Term Memory

You've been there. You spend 45 minutes debugging a CloudWatch logging issue with Claude Code. You find the fix — a specific IAM permission plus a log group naming convention. Session ends.

Three weeks later, you hit the **exact same issue**. Your AI agent has no memory of the previous session. You start from scratch.

This is the **context amnesia problem**. According to a [2025 GitHub survey](https://github.blog/news-insights/research/the-state-of-open-source-and-ai/), developers using AI coding assistants report that **losing session context** is one of their top 3 frustrations with AI tools.

The root cause is simple: AI coding sessions are **stateless by design**. Claude Code, Cursor, Droid — they all start fresh each session. Your hard-won debugging knowledge, deployment procedures, and configuration decisions evaporate when the session ends.

---

## What is the Archive Skill?

The Archive skill gives your AI agent a **structured knowledge base** it can write to and read from across sessions.

It works with any AI coding tool that supports skills: Claude Code, Cursor, Droid, OpenCode, Codex, and [12+ other platforms](https://opc.dev).

### How It Works

1. **After a significant task** — your agent writes a concise markdown file to `.archive/YYYY-MM-DD/`
2. **Index updated** — `.archive/MEMORY.md` gets a one-line entry linking to the archive
3. **Next session** — your agent reads `MEMORY.md` first, finds relevant past solutions
4. **Knowledge compounds** — over weeks, your project builds a searchable knowledge base

### Directory Structure

```
.archive/
├── MEMORY.md                          # Master index
├── 2026-02-20/
│   ├── cloudwatch-logging.md          # Specific solution
│   └── ecs-deploy-fix.md              # Another solution
├── 2026-02-23/
│   └── github-actions-cache.md        # Today's learnings
```

Each archive file has YAML frontmatter with tags, categories, and related entries — making it easy to search with `grep -ri "keyword" .archive/`.

---

## When to Use the Archive Skill

The skill is designed around **natural triggers**. Your AI agent activates it when:

| Trigger | Example |
|---------|---------|
| "Archive this" | After solving a tricky bug |
| "Save learnings" | After a multi-step deployment |
| "Session notes" | At the end of a productive session |
| "Check archives" | Before debugging a familiar problem |
| "Past solutions" | When encountering a recurring error |

The agent can also proactively suggest archiving when it detects a significant task completion.

---

## Real-World Use Cases

### 1. Debugging Knowledge Base

You resolve a CORS issue that required 3 specific configuration changes across API Gateway, CloudFront, and your Express server. Instead of losing that knowledge:

```yaml
---
tags: [cors, api-gateway, cloudfront, express]
category: debugging
related: [2026-01-15/api-gateway-setup.md]
---

# CORS Fix: API Gateway + CloudFront + Express

## Problem
403 errors on preflight OPTIONS requests...

## Solution
1. API Gateway: Add OPTIONS method with mock integration
2. CloudFront: Whitelist Origin and Access-Control headers
3. Express: Use cors() middleware with explicit origin
```

Next time CORS breaks, your agent reads `MEMORY.md`, finds this entry, and applies the fix in minutes instead of hours.

### 2. Deployment Procedures

Every deployment has subtle steps that are easy to forget. Archive them:

```yaml
---
tags: [deploy, ecs, staging, production]
category: release
---

# ECS Deployment: Staging → Production

## Steps
1. Build: docker build -t app:$(git rev-parse --short HEAD) .
2. Push: aws ecr push ...
3. Update task definition (increment revision)
4. Important: wait for service stability before proceeding
5. Health check: curl https://api.example.com/health
```

### 3. Configuration Decisions

Why did you choose that particular database index? Why is the rate limit set to 100/min? Archive the reasoning:

```yaml
---
tags: [postgres, indexing, performance]
category: infrastructure
---

# PostgreSQL Index Strategy for Orders Table

## Decision
Composite index on (user_id, created_at DESC) instead of separate indexes.

## Reasoning
- Query pattern: always filter by user_id + sort by created_at
- Composite index serves both WHERE and ORDER BY in one scan
- Benchmarked: 12ms vs 89ms on 1M rows
```

---

## Installation

### 30-Second Install

```bash
npx skills add ReScienceLab/opc-skills --skill archive
```

That's it. No API keys, no configuration, no dependencies.

### Verify Installation

Ask your AI agent: "Do you have access to the archive skill?" or simply say "archive this" after completing a task.

### Supported Platforms

The Archive skill works with all major AI coding tools:

| Platform | Install Command |
|----------|----------------|
| Claude Code | `npx skills add ReScienceLab/opc-skills --skill archive -a claude` |
| Cursor | `npx skills add ReScienceLab/opc-skills --skill archive` |
| Factory Droid | `npx skills add ReScienceLab/opc-skills --skill archive -a droid` |
| OpenCode | `npx skills add ReScienceLab/opc-skills --skill archive -a opencode` |
| All tools | `npx skills add ReScienceLab/opc-skills --skill archive` |

---

## Archive Skill vs. Other Approaches

| Approach | Persistent | Searchable | Structured | Works Offline | Cost |
|----------|:----------:|:----------:|:----------:|:-------------:|:----:|
| **Archive Skill** | Yes | Yes | Yes | Yes | Free |
| Session history | No | No | No | N/A | Free |
| Manual notes | Yes | Somewhat | No | Yes | Free |
| Notion/Docs | Yes | Yes | Somewhat | No | $8-10/mo |
| Vector DB (RAG) | Yes | Yes | No | No | $20+/mo |

The Archive skill is the simplest approach that actually works. Plain markdown files, version-controlled, searchable with grep, readable by any AI agent.

---

## How It Integrates with Other OPC Skills

The Archive skill complements the entire OPC Skills ecosystem:

- **After SEO-GEO audit** → Archive the optimization steps and before/after metrics
- **After domain-hunter search** → Archive the registrar comparison and final decision
- **After logo-creator session** → Archive the style decisions and prompt that worked
- **After requesthunt research** → Archive key findings and user demand patterns

Each skill session produces knowledge worth preserving.

---

## FAQ

### How is this different from just keeping a `NOTES.md` file?

The Archive skill provides structure: YAML frontmatter for tags and categories, a master index (`MEMORY.md`), date-organized directories, and templates. More importantly, your AI agent knows how to read and write to it automatically — you don't have to maintain it manually.

### Does the archive get committed to git?

No. `.archive/` should be in your `.gitignore` — these are local project notes, not source code. The skill enforces this convention. If you want to share archives across a team, you can override this, but the default is local-only.

### What happens when the archive gets large?

The `MEMORY.md` index keeps things navigable. It's a one-line-per-entry index organized by category. Your agent reads the index first (small file), then fetches specific entries as needed. Even with hundreds of entries, lookups are fast.

### Can I use this with multiple AI tools on the same project?

Yes. The archive is plain markdown in a standard directory structure. Claude Code, Cursor, Droid — they all read the same `.archive/` directory. Knowledge created by one tool is available to all others.

### Does it work with the Claude Code marketplace?

You can install via the marketplace, but we recommend using `npx skills add` for the most reliable installation. See our [installation guide](https://opc.dev/blog/install-opc-skills-claude-code) for details.

### What categories does the archive support?

Five built-in categories: **infrastructure** (AWS, networking), **release** (versioning, deploys), **debugging** (bug fixes, error resolution), **feature** (implementation notes), and **design** (UI/UX decisions). You can add custom categories as needed.

---

## Getting Started

1. **Install the skill**:
   ```bash
   npx skills add ReScienceLab/opc-skills --skill archive
   ```

2. **Complete a task** in your next AI session

3. **Say "archive this"** — your agent creates the archive entry automatically

4. **Next session**, say "check archives for [topic]" — your agent finds relevant past solutions

Your project knowledge compounds over time. Every debugging session, every deployment, every configuration decision — preserved and searchable.

---

## Further Reading

- [Archive Skill on GitHub](https://github.com/ReScienceLab/opc-skills/tree/main/skills/archive) — Source code, SKILL.md, and templates
- [OPC Skills Library](https://opc.dev) — Browse all 10 skills
- [How to Install OPC Skills in Claude Code](https://opc.dev/blog/install-opc-skills-claude-code) — Step-by-step installation guide
- [Why Skills Beat Documentation](https://opc.dev/blog/why-skills-beat-docs) — The case for skills over static docs
- [What is OPC?](https://opc.dev/blog/what-is-opc) — The One Person Company movement
