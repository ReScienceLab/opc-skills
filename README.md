# OPC Skills

<p align="center">
  <img src="website/opc-banner.png" alt="OPC Skills - AI Agent Skills for Solopreneurs" width="100%">
</p>

<p align="center">
  <a href="https://opc.dev"><img src="https://img.shields.io/badge/Website-opc.dev-black?style=flat-square" alt="Website"></a>
  <a href="https://github.com/ReScienceLab/opc-skills/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/ReScienceLab/opc-skills/stargazers"><img src="https://img.shields.io/github/stars/ReScienceLab/opc-skills?style=flat-square" alt="GitHub Stars"></a>
</p>

<p align="center">
  <strong>AI Agent Skills for Solopreneurs, Indie Hackers, and One-Person Companies</strong>
</p>

<p align="center">
  Extend Claude Code, Cursor, Codex, and more with automation skills.<br>
  <a href="https://opc.dev">Browse Skills</a> · <a href="#quick-install">Quick Install</a> · <a href="#included-skills">View All Skills</a>
</p>

---

## What are Skills?

Skills are folders of instructions, scripts, and resources that AI agents load dynamically to improve performance on specialized tasks. Each skill is self-contained with a `SKILL.md` file containing instructions and metadata.

For more information about the Agent Skills standard, see [agentskills.io](http://agentskills.io).

## Included Skills

| | Skill | Description |
|:---:|-------|-------------|
| <img src="./skill-logos/requesthunt.svg" width="24"> | [requesthunt](./skills/requesthunt) | Research user demand from Reddit, X, and GitHub |
| <img src="./skill-logos/domain-hunter.svg" width="24"> | [domain-hunter](./skills/domain-hunter) | Find domains, compare registrar prices, and discover promo codes |
| <img src="./skill-logos/logo-creator.svg" width="24"> | [logo-creator](./skills/logo-creator) | Create logos with AI, crop, remove background, export as SVG |
| <img src="./skill-logos/banner-creator.svg" width="24"> | [banner-creator](./skills/banner-creator) | Create banners for GitHub, Twitter, LinkedIn, etc. |
| <img src="./skill-logos/nanobanana.svg" width="24"> | [nanobanana](./skills/nanobanana) | Generate images using Gemini 3 Pro Image (Nano Banana Pro) |
| <img src="./skill-logos/reddit.svg" width="24"> | [reddit](./skills/reddit) | Search and retrieve content from Reddit via the public JSON API |
| <img src="./skill-logos/twitter.svg" width="24"> | [twitter](./skills/twitter) | Search and retrieve content from Twitter/X via twitterapi.io |
| <img src="./skill-logos/producthunt.svg" width="24"> | [producthunt](./skills/producthunt) | Search Product Hunt posts, topics, users, and collections |
| <img src="./skill-logos/seo-geo.svg" width="24"> | [seo-geo](./skills/seo-geo) | SEO & GEO optimization for AI search engines (ChatGPT, Perplexity, Google) |

## Quick Install

### 🚀 Universal Install (Works with 16+ AI Tools)

Install with one command - works with Claude Code, Cursor, Windsurf, Droid, and more:

```bash
# Install all skills
npx skills add ReScienceLab/opc-skills

# Install specific skill
npx skills add ReScienceLab/opc-skills --skill reddit

# Install to specific agent
npx skills add ReScienceLab/opc-skills -a droid -a claude-code
```

Browse and discover skills at **[skills.sh](https://skills.sh/ReScienceLab/opc-skills)** 🎯

> **Note:** For skills with dependencies (e.g., `domain-hunter` needs `twitter` + `reddit`), use the Advanced Install method below for automatic dependency resolution.

---

### ⚙️ Advanced Install (With Dependency Management)

For power users who need dependency resolution, batch operations, and custom directories:

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

**Why use the advanced installer?**
- ✅ Auto-installs dependencies (e.g., `domain-hunter` → `twitter`, `reddit`)
- ✅ Batch install all skills with one command
- ✅ Custom directory support
- ✅ Project-level vs global install options
- ✅ Beautiful dependency tree visualization

### One-liner Install

```bash
# Install all skills to Claude Code (global)
curl -fsSL opc.dev/install.sh | bash -s -- -t claude all

# Install specific skill to Factory Droid
curl -fsSL opc.dev/install.sh | bash -s -- -t droid reddit
```

---

## Supported AI Tools

OPC Skills work with 16+ AI coding agents:

| Agent | `npx` Support | Advanced Install |
|-------|:-------------:|:----------------:|
| Claude Code | ✅ | ✅ |
| Cursor | ✅ | ✅ |
| Factory Droid | ✅ | ✅ |
| Windsurf | ✅ | ✅ |
| OpenCode | ✅ | ✅ |
| Codex | ✅ | ✅ |
| GitHub Copilot | ✅ | ❌ |
| Gemini CLI | ✅ | ❌ |
| Goose | ✅ | ❌ |
| Kilo Code | ✅ | ❌ |
| Roo Code | ✅ | ❌ |
| Trae | ✅ | ❌ |
| And more... | ✅ | - |

See the [full compatibility list](https://github.com/vercel-labs/add-skill#available-agents) for installation paths.

---

## Manual Installation

### Skill Directory Locations

| Tool | Global Directory | Project Directory |
|------|------------------|-------------------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Factory Droid | `~/.factory/skills/` | `.factory/skills/` |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` |
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

See the template in `./template/` directory for the basic structure:

1. Create a folder in `skills/` with your skill name
2. Add a `SKILL.md` file with YAML frontmatter
3. (Optional) Add scripts, examples, or other resources

**Required fields in SKILL.md:**
```yaml
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---
```

For detailed guidance, check out existing skills or visit the [Agent Skills specification](https://agentskills.io/).

## Contributing

1. Fork this repository
2. Create a new skill folder in `skills/`
3. Add a `SKILL.md` with proper frontmatter
4. Submit a pull request

## License

Apache 2.0
