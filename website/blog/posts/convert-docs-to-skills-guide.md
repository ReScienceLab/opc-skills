# How to Convert Your Docs to Agent Skills (5-Minute Guide)

*By OPC Team | January 24, 2026 | 6 min read*

## TL;DR

Traditional documentation gets **2 retweets**. The same content published as a skill gets **350 retweets**. That's 100x more engagement. This guide shows you how to convert any documentation into an agent skill in **5 minutes**—no coding required. Your docs will go from "read and forget" to "install and execute."

---

## The 100x Engagement Gap

[swyx](https://twitter.com/swyx/status/2014521220260364380) recently observed something fascinating:

> "Publish markdown docs to docs website: 2 retweets
> 
> Publish markdown docs as 'skills': 350 retweets"

**Why such a massive difference?**

AI agents can *execute* skills, but they can only *read* docs. When someone installs your skill, it becomes part of their AI's permanent knowledge. When someone reads your docs, they forget it by tomorrow.

We're witnessing a shift from **"documentation for humans"** to **"instructions for AI."**

## What Makes a Good Skill? (The Anatomy)

A skill is just a markdown file with structure. Here's the anatomy:

```markdown
---
name: your-skill-name
description: What this skill does in one sentence
triggers:
  - keyword that activates this skill
  - another trigger phrase
dependencies:
  - other-skill-if-needed
---

# Your Skill Title

Instructions that AI can follow step-by-step...
```

### The 4 Essential Components

| Component | Purpose | Example |
|-----------|---------|---------|
| **YAML Frontmatter** | Metadata for discovery | `name: domain-hunter` |
| **Instructions** | Clear, imperative commands | "When user asks for domains, first check availability..." |
| **Examples** | Real workflows, not abstract concepts | "Example: Find .io domains under $20/year" |
| **Scripts** (optional) | Automation helpers | `scripts/search.py` |

## Step-by-Step: Convert Any Doc to a Skill

Here's the 5-minute conversion process:

| Step | Action | Time |
|------|--------|------|
| 1 | Extract the "How To" section | 1 min |
| 2 | Rewrite as imperative instructions | 2 min |
| 3 | Add YAML frontmatter | 30 sec |
| 4 | Add 2-3 example commands | 1 min |
| 5 | Test with Claude Code | 30 sec |

### Step 1: Extract the "How To" Section (1 min)

Find the actionable parts of your documentation. Skip:
- Company history
- Feature comparisons
- Marketing copy

Keep:
- Step-by-step tutorials
- API integration guides
- Workflow automation
- Troubleshooting procedures

### Step 2: Rewrite as Imperative Instructions (2 min)

Documentation is descriptive. Skills are imperative.

**Before (Documentation style):**
> "The API supports rate limiting. Users can configure rate limits using the dashboard or by calling the `/settings` endpoint. Rate limits help prevent abuse and ensure fair usage across all customers."

**After (Skill style):**
> "When user asks about rate limits:
> 1. Check current limits: `GET /api/limits`
> 2. If limits are too low, suggest increasing via dashboard
> 3. If user needs custom limits, provide the API call: `POST /api/settings { "rateLimit": 1000 }`"

The key difference: **Tell the AI exactly what to do**, not what's possible.

### Step 3: Add YAML Frontmatter (30 sec)

```yaml
---
name: rate-limit-helper
description: Configure and troubleshoot API rate limits
triggers:
  - rate limit
  - too many requests
  - 429 error
  - throttling
dependencies: []
---
```

**Trigger tips:**
- Include error messages users might mention
- Add synonyms (rate limit, throttling, 429)
- Think about how users phrase questions

### Step 4: Add 2-3 Example Commands (1 min)

Examples teach the AI the expected workflow:

```markdown
## Example Workflows

### Check Current Rate Limits
User: "What are my API rate limits?"
Action: Call `GET /api/limits` and display results

### Increase Rate Limits
User: "I'm getting 429 errors, can you help?"
Action:
1. Check current limits
2. Identify which endpoint is hitting limits
3. Suggest increase or optimization strategies

### Custom Enterprise Limits
User: "We need higher limits for our enterprise account"
Action: Provide contact form link and explain enterprise tier options
```

### Step 5: Test with Claude Code (30 sec)

Save your skill and test it:

```bash
# Save as SKILL.md in your project
# Then in Claude Code, try:
"Help me with rate limiting"
```

If the AI doesn't pick up your skill, check your triggers.

## Real Example: OPC Skills Conversion

Here's how we converted `domain-hunter` from a README to a skill:

### Before: README.md

```markdown
# Domain Hunter

A tool to search for available domains and compare prices.

## Features
- Search multiple TLDs
- Compare 8+ registrars
- Find promo codes

## Usage
Run the search script with your desired domain name.
```

### After: SKILL.md

```markdown
---
name: domain-hunter
description: Search domains, compare registrar prices, find promo codes
triggers:
  - domain
  - registrar
  - buy domain
  - domain availability
dependencies:
  - twitter
  - reddit
---

# Domain Hunter

Help users find and register domains at the best prices.

## When to Use This Skill

Activate when user:
- Asks about domain availability
- Wants to compare registrar prices
- Needs promo codes for domain registration
- Is choosing between TLDs (.com, .io, .dev, etc.)

## Workflow

1. **Gather requirements**: Ask for desired domain name and preferred TLDs
2. **Check availability**: Use WHOIS or registrar APIs
3. **Compare prices**: Check prices across 8 registrars (see price table)
4. **Find promo codes**: Use twitter and reddit skills to search for active codes
5. **Present recommendation**: Show cheapest option with any available discounts

## Price Comparison Table

| Registrar | .com | .io | .dev |
|-----------|------|-----|------|
| Namecheap | $9.98 | $32.98 | $12.98 |
| Cloudflare | $9.15 | $22.15 | $10.18 |
| Spaceship | $9.78 | $14.98 | $11.98 |

## Example

User: "I need a domain for my startup called 'acmetech'"

Response:
1. Check acmetech.com, acmetech.io, acmetech.dev
2. Compare prices across registrars
3. Search Twitter/Reddit for promo codes
4. Recommend: "acmetech.io available at Spaceship for $14.98 (cheapest)"
```

**What changed:**
- Added triggers for discoverability
- Declared dependencies (twitter, reddit)
- Structured as step-by-step workflow
- Included concrete example with expected output

## Where to Publish Your Skills

| Platform | Audience | How to Publish |
|----------|----------|----------------|
| **GitHub** | Open source community | `npx skills add user/repo` |
| **skills.sh** | Discovery & metrics | Listed in registry automatically |
| **Project-level** | Team only | `.claude/skills/` or `.cursor/skills/` |
| **Personal** | Your workflows | `~/.claude/skills/` |

### Publishing to GitHub

```bash
# Create skill structure
mkdir -p skills/your-skill
touch skills/your-skill/SKILL.md

# Users install with
npx skills add your-org/your-repo --skill your-skill
```

### Publishing to skills.sh

Skills published on GitHub are automatically indexed by [skills.sh](https://skills.sh). The registry tracks:
- Installation counts
- Platform compatibility
- Version history

## Common Mistakes to Avoid

### 1. Too Vague

❌ **Bad:** "Help with domains"

✅ **Good:** "Search for available .com domains under $15/year and compare prices across Namecheap, Cloudflare, and Porkbun"

### 2. No Triggers

❌ **Bad:** Missing `triggers` in frontmatter

✅ **Good:** Include 3-5 trigger phrases users might actually say

### 3. Missing Examples

❌ **Bad:** Abstract instructions without concrete workflows

✅ **Good:** "User says X → AI does Y → Expected output is Z"

### 4. Hardcoded Values

❌ **Bad:** API keys in the skill file

✅ **Good:** Use environment variables: `Set TWITTER_API_KEY in your environment`

### 5. No Dependencies Declared

❌ **Bad:** Skill uses other skills but doesn't declare them

✅ **Good:** List dependencies so users install everything needed

## Skill Template

Copy this template to get started:

```markdown
---
name: my-skill-name
description: One sentence describing what this skill does
triggers:
  - primary trigger phrase
  - secondary trigger
  - error message users might mention
dependencies: []
---

# Skill Title

Brief description of the skill's purpose.

## When to Use This Skill

Activate when user:
- [Scenario 1]
- [Scenario 2]
- [Scenario 3]

## Workflow

1. **Step one**: Description
2. **Step two**: Description
3. **Step three**: Description

## Example

User: "[Example user request]"

Action:
1. [First action]
2. [Second action]
3. [Final response]

## Notes

- Important consideration 1
- Important consideration 2
```

## Start Converting Today

Your documentation is invisible to AI agents. Your skills are not.

### Try OPC Skills

See real examples of well-structured skills:

```bash
npx skills add ReScienceLab/opc-skills
```

**9 skills included:** domain-hunter, logo-creator, twitter, reddit, seo-geo, and more.

### Create Your Own

1. Pick one piece of actionable documentation
2. Follow the 5-minute conversion process above
3. Test with Claude Code or Cursor
4. Publish to GitHub

### Join the Community

- [OPC Skills on GitHub](https://github.com/ReScienceLab/opc-skills)
- [Skills.sh Registry](https://skills.sh)
- [Mintlify Skill.md Standard](https://www.mintlify.com/blog/skill-md)

---

## Further Reading

- [Why Skills Beat Docs: The Rise of Agent-Native Documentation](/blog/why-skills-beat-docs)
- [What is OPC? AI Agent Skills for Solopreneurs Explained](/blog/what-is-opc)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [swyx on Skills vs Docs Engagement](https://twitter.com/swyx/status/2014521220260364380)

---

## Frequently Asked Questions

### How do I convert documentation to an agent skill?

Follow the 5-step process: (1) Extract actionable "How To" content, (2) Rewrite as imperative instructions, (3) Add YAML frontmatter with name/description/triggers, (4) Add 2-3 example workflows, (5) Test with your AI coding assistant. The entire process takes about 5 minutes.

### What is the Skill.md format?

Skill.md is a markdown file with YAML frontmatter that AI coding assistants can load and execute. The frontmatter includes `name`, `description`, `triggers` (keywords that activate the skill), and `dependencies` (other required skills). The body contains structured instructions and examples.

### Which AI platforms support skills?

As of January 2026, **6 major platforms** natively support skills: Claude Code, Cursor, Windsurf, OpenCode, Codex (via adapters), and Droid (Factory). Skills are stored in platform-specific directories like `.claude/skills/` or `.cursor/skills/`.

### How long does it take to create a skill?

A basic skill takes **5 minutes** to create from existing documentation. More complex skills with scripts and multiple workflows may take 15-30 minutes. The key is starting simple and iterating based on usage.

### Do I need to know how to code to create skills?

No. Skills are markdown files. If you can write documentation, you can create a skill. Scripts are optional—many effective skills are pure markdown with structured instructions and examples.

---

*Questions about converting your docs to skills? Open an issue on [GitHub](https://github.com/ReScienceLab/opc-skills/issues).*
