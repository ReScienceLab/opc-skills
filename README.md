# OPC Skills

<p align="center">
  <img src="website/opc-banner.png" alt="OPC Skills" width="100%">
</p>

Agent Skills for One Person Companies (OPC) - a collection of skills designed for solopreneurs, indie hackers, and small teams.

## What are Skills?

Skills are folders of instructions, scripts, and resources that AI agents load dynamically to improve performance on specialized tasks. Each skill is self-contained with a `SKILL.md` file containing instructions and metadata.

For more information about the Agent Skills standard, see [agentskills.io](http://agentskills.io).

## Included Skills

| Skill | Description |
|-------|-------------|
| [nanobanana](./skills/nanobanana) | Generate images using Gemini 3 Pro Image (Nano Banana Pro) |
| [logo-creator](./skills/logo-creator) | Create logos with AI, crop, remove background, export as SVG |
| [banner-creator](./skills/banner-creator) | Create banners for GitHub, Twitter, LinkedIn, etc. |
| [reddit](./skills/reddit) | Search and retrieve content from Reddit via the public JSON API |
| [twitter](./skills/twitter) | Search and retrieve content from Twitter/X via twitterapi.io |
| [producthunt](./skills/producthunt) | Search Product Hunt posts, topics, users, and collections |
| [domain-hunter](./skills/domain-hunter) | Find domains, compare registrar prices, and discover promo codes |
| [requesthunt](./skills/requesthunt) | Research user demand from Reddit, X, and GitHub |

## Quick Install

### Using the Install Script (Recommended)

```bash
# Clone the repo
git clone https://github.com/ReScienceLab/opc-skills.git
cd opc-skills

# Interactive install
./install.sh

# Or specify tool and skill directly
./install.sh -t claude all           # All skills to Claude Code
./install.sh -t droid twitter        # Twitter skill to Factory Droid
./install.sh -t cursor -p reddit     # Reddit to current project (Cursor)
./install.sh -t custom -d ~/.my-agent/skills all
```

### One-liner Install

```bash
# Install all skills to Claude Code (global)
curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t claude all

# Install specific skill to Factory Droid
curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t droid reddit
```

## Manual Installation

### Skill Directory Locations

| Tool | Global Directory | Project Directory |
|------|------------------|-------------------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Factory Droid | `~/.factory/skills/` | `.factory/skills/` |
| Cursor | - | `.cursor/skills/` |
| OpenCode | `~/.config/opencode/skills/` | - |
| Codex | `~/.codex/skills/` | `.codex/skills/` |

### Manual Copy

```bash
# Clone repo
git clone https://github.com/ReScienceLab/opc-skills.git

# Copy to your tool's skills directory
# Example for Claude Code (global):
mkdir -p ~/.claude/skills
cp -r opc-skills/skills/reddit ~/.claude/skills/
cp -r opc-skills/skills/twitter ~/.claude/skills/
cp -r opc-skills/skills/domain-hunter ~/.claude/skills/

# Example for Factory Droid (project):
mkdir -p .factory/skills
cp -r opc-skills/skills/reddit .factory/skills/
```

### Claude Code Plugin

```bash
/plugin marketplace add ReScienceLab/opc-skills
```

### Claude.ai

Upload skill folders via [Claude.ai settings](https://support.claude.com/en/articles/12512180-using-skills-in-claude#h_a4222fa77b).

### Claude API

See the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill).

## Creating New Skills

Use the template in `./template/SKILL.md` as a starting point:

```markdown
---
name: my-skill-name
description: A clear description of what this skill does
---

# My Skill Name

[Instructions for the AI agent]
```

## Contributing

1. Fork this repository
2. Create a new skill folder in `skills/`
3. Add a `SKILL.md` with proper frontmatter
4. Submit a pull request

## License

Apache 2.0
