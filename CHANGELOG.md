# Changelog

All notable changes to OPC Skills are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Skill Compatibility & Dependency Matrix

Each skill maintains its own independent version. Use this matrix to understand dependencies and compatibility.

| Skill | Current Version | Requires | Min Versions |
|-------|-----------------|----------|--------------|
| **requesthunt** | 1.0.0 | - | - |
| **domain-hunter** | 1.0.0 | twitter, reddit | twitter ≥1.0.0, reddit ≥1.0.0 |
| **logo-creator** | 1.0.0 | nanobanana | nanobanana ≥1.0.0 |
| **banner-creator** | 1.0.0 | nanobanana | nanobanana ≥1.0.0 |
| **nanobanana** | 1.0.0 | - | - |
| **reddit** | 1.0.0 | - | - |
| **twitter** | 1.0.0 | - | - |
| **producthunt** | 1.0.0 | - | - |
| **seo-geo** | 1.0.0 | twitter, reddit | twitter ≥1.0.0, reddit ≥1.0.0 |

**Key Points:**
- Each skill has an independent version number (MAJOR.MINOR.PATCH)
- Skills can be released independently without coordinating with others
- Use this matrix to identify dependencies before updating a skill
- When a dependency skill updates with breaking changes, dependent skills need to be tested

---

## [Unreleased]

### Website
- (no changes)

### requesthunt
- (no changes)

### domain-hunter
- (no changes)

### logo-creator
- (no changes)

### banner-creator
- (no changes)

### nanobanana
- (no changes)

### reddit
- (no changes)

### twitter
- (no changes)

### producthunt
- (no changes)

### seo-geo
- (no changes)

## Released Versions

## [1.0.9] - 2026-02-23

### Blog
- **Added**: Archive skill announcement blog post (#62)
  - "Stop Losing Context Between AI Sessions: Introducing the Archive Skill"
  - Includes OG banner image

## [1.0.8] - 2026-02-23

### Skills
- **Added**: Archive skill for indexed session knowledge (#57, #59)
  - Archive session learnings, debugging solutions, and deployment logs
  - Maintains `.archive/MEMORY.md` index for cross-session knowledge reuse
  - Includes logo, install commands, README listing, and website integration
- **Added**: `add-new-opc-skill` checklist skill under `.factory/skills/` (#60)

### Infrastructure
- **Fixed**: Replace broken `curl -fsSL opc.dev/install.sh` with `npx skills add` (#55, #58)
  - install.sh endpoint was returning 404
  - Updated all install commands in skills.json and website/worker.js

## [1.0.7] - 2026-02-15

### Infrastructure
- **Added**: Twitter ([@Yilin0x](https://x.com/Yilin0x)) and Discord badges to README (#52)
- **Changed**: Ranked seo-geo skill at the top of skills list in skills.json and README (#53)

## [1.0.6] - 2026-02-15

### Infrastructure
- **Fixed**: Install stats scraper now handles abbreviated count formats (e.g. "2.8K") from skills.sh (#50)
  - Added `_parse_count()` helper for K-suffix abbreviations
  - Previously caused seo-geo to steal logo-creator's count and logo-creator to be dropped entirely

### Skills
- **Refactored**: Aligned all SKILL.md frontmatter with Anthropic skill standard (#51)
  - Removed `triggers` field from all 9 skills and the template
  - Merged trigger keywords into `description` field as "Use when..." clauses
  - Frontmatter now only uses `name` and `description` fields
  - Fixes seo-geo broken description display on skills.sh (YAML `|` block rendered as literal `|`)

## [1.0.5] - 2026-01-29

### Infrastructure
- **Fixed**: Removed `pluginRoot` and updated all source paths to work around Claude Code bug
  - Removed `pluginRoot: "./skills"` from marketplace metadata (Claude Code doesn't respect this field)
  - Updated all plugin source paths from `"./domain-hunter"` to `"./skills/domain-hunter"`
  - Fixes "Source path does not exist" error when installing plugins
  - Workaround for known Claude Code issues #11243 and #11278

### Skills
- (no skill version changes in this release)

## [1.0.4] - 2026-01-29

### Infrastructure
- **Fixed**: Updated marketplace metadata version to trigger cache refresh
  - Changed marketplace metadata version from 1.0.0 to 1.0.3
  - Fixes "Source path does not exist" error when installing plugins in Claude Code
  - Ensures Claude Code refreshes marketplace cache with correct plugin paths

### Skills
- (no skill version changes in this release)

## [1.0.3] - 2026-01-29

### Website
- **Fixed**: Blog OG image path for installation tutorial post
  - Corrected image path from `2026-01-28-install-tutorial-og.png` to `2026-01-28-install-opc-skills-claude-code-og.png`
  - Fixes broken Open Graph preview on social media shares

### Skills
- (no skill version changes in this release)

## [1.0.2] - 2026-01-29

### Infrastructure
- **Fixed**: Claude Code Plugin Marketplace schema validation errors
  - Updated all plugin source paths from bare names to relative paths (e.g., `"requesthunt"` → `"./requesthunt"`)
  - Ensures compatibility with Claude Code's `/plugin marketplace add` command
  - Resolves "Invalid input" errors when adding marketplace

### Skills
- (no skill version changes in this release)

## [1.0.1] - 2026-01-29

### Website
- **Added**: New blog post "Why Skills Beat Docs: The Rise of Agent-Native Documentation"
  - Analysis of 100x engagement gap between docs and skills
  - Comprehensive ecosystem overview (Skills.sh, Mintlify, awesome-claude-code)
  - Step-by-step guide for converting docs to skills

### Skills
- (no skill version changes in this release)

### requesthunt

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Generate user demand research reports from Reddit, X, and GitHub
- Collect real user feedback across multiple platforms
- Filter and search by topic, platform, and timeframe
- Generate structured demand research reports

### domain-hunter

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Search domains, compare registrar prices, and find promo codes
- Query domain availability and pricing
- Compare prices across registrars
- Find current promo codes from Twitter and Reddit
- **Dependencies**: twitter ≥1.0.0, reddit ≥1.0.0

### logo-creator

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Create logos using AI image generation
- Generate logo variations with Gemini
- Remove background from images
- Crop logos to desired aspect ratios
- Export as SVG vector format
- **Dependencies**: nanobanana ≥1.0.0

### banner-creator

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Create banners for GitHub, Twitter, LinkedIn, and other platforms
- Generate banner variations with Gemini
- Crop to platform-specific ratios (16:9, 21:9, 2:1, etc.)
- Support for different banner formats and styles
- **Dependencies**: nanobanana ≥1.0.0

### nanobanana

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Generate and edit images using Google Gemini 3 Pro Image (Nano Banana Pro)
- Text-to-image generation
- Image-to-image editing and variations
- Support for multiple aspect ratios (1:1, 2:3, 3:2, 16:9, 21:9, etc.)
- 2K and 4K high-resolution output options
- Batch image generation

### reddit

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Search and retrieve content from Reddit
- Access public JSON API without authentication
- Search posts and subreddits
- Get user profiles and comment threads
- No API key required

### twitter

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Search and retrieve content from Twitter/X
- User information and tweet retrieval
- Search tweets by keyword
- Get follower information and trends
- Via twitterapi.io API service

### producthunt

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- Search and retrieve content from Product Hunt
- Query posts, topics, and collections
- Get user and product information
- Access GraphQL API for detailed data
- Requires Product Hunt API access token

### seo-geo

#### [1.0.0] - 2025-01-21
- **Added**: Initial release
- SEO & GEO (Generative Engine Optimization) for websites
- Optimize for traditional search engines (Google, Bing)
- Optimize for AI search engines (ChatGPT, Perplexity, Gemini, Copilot, Claude)
- Generate schema markup and JSON-LD
- Keyword research and SERP analysis
- Princeton GEO research methods for +40% AI visibility
- Optional DataForSEO API integration for advanced features
- **Dependencies**: twitter ≥1.0.0, reddit ≥1.0.0

---

## Initial Release Features

### Unified Installation & Support
- Unified installation system via `npx skills add`
- Support for 16+ AI agent tools (Claude Code, Cursor, Droid, Windsurf, etc.)
- Composable skills with dependency management
- Comprehensive documentation website (opc.dev)
- SKILL.md standard with YAML frontmatter for all skills

### Documentation & Resources
- Official website: https://opc.dev
- Skill browser: https://skills.sh/ReScienceLab/opc-skills
- Individual skill repositories on GitHub
- Example workflows in each skill directory
- API documentation and rate limit information

### Infrastructure
- GitHub repository: https://github.com/ReScienceLab/opc-skills
- MIT License
- Automated skill installation scripts
- Website deployment pipeline

## Version Compatibility

| Version | Status | Release Date | Notable Changes |
|---------|--------|--------------|-----------------|
| 1.0.0 | Stable | 2025-01-21 | Initial release with 9 core skills |
| Unreleased | Development | TBD | Documentation and workflow improvements |

## Migration Guides

### Coming Soon
Migration guides for major version upgrades will be documented here.

## Notes

### API Keys Required
- **requesthunt**: REQUESTHUNT_API_KEY (requesthunt.com/settings/api)
- **twitter**: TWITTERAPI_API_KEY (twitterapi.io, ~$0.15-0.18/1k requests)
- **logo-creator**: GEMINI_API_KEY, REMOVE_BG_API_KEY, RECRAFT_API_KEY
- **banner-creator**: GEMINI_API_KEY (Google AI Studio)
- **nanobanana**: GEMINI_API_KEY
- **producthunt**: PRODUCTHUNT_ACCESS_TOKEN
- **seo-geo**: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD (optional)

### Rate Limits
- **requesthunt**: 1000/month cached, 500/month realtime
- **twitter**: Depends on twitterapi.io plan
- **nanobanana**: Google Gemini API limits apply
- **seo-geo**: DataForSEO API limits apply

### Supported Platforms
- Claude Code (Desktop)
- Cursor
- Factory Droid
- Windsurf
- OpenCode
- Codex
- GitHub Copilot
- Gemini CLI
- Goose
- Kilo Code
- Roo Code
- Trae
- And more via `npx skills add`

## Contributing

Interested in contributing? Please see:
- Contributing Guidelines: https://github.com/ReScienceLab/opc-skills/blob/main/CONTRIBUTING.md (coming soon)
- Issue Tracker: https://github.com/ReScienceLab/opc-skills/issues
- Skill Template: https://github.com/ReScienceLab/opc-skills/tree/main/template

## Support

For issues and questions:
- GitHub Issues: https://github.com/ReScienceLab/opc-skills/issues
- Website: https://opc.dev
- Documentation: https://skills.sh/ReScienceLab/opc-skills

## License

All OPC Skills are released under the [MIT License](https://github.com/ReScienceLab/opc-skills/blob/main/LICENSE).

---

Generated: 2025-01-21
Project: OPC Skills - AI Agent Skills for Solopreneurs
