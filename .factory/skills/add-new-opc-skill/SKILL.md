---
name: add-new-opc-skill
description: Checklist and automation guide for adding a new skill to the OPC Skills project. Ensures all required files, metadata, logos, and listings are created before release. Use when adding a new skill, publishing a skill, or preparing a skill for release.
---

# Add New OPC Skill

Use this skill when adding a new skill to the OPC Skills project. Follow every step below to ensure the skill meets all publishing requirements.

## Pre-flight

Before starting, confirm:
- You are on a feature branch: `feature/skill/<skill-name>` (branched from `develop`)
- The skill name is kebab-case (e.g., `my-new-skill`)

## Checklist

### 1. Skill Directory Structure

Create the skill directory with required files:

```
skills/<skill-name>/
├── SKILL.md              (required) Main skill documentation
├── scripts/              (if skill has scripts)
│   └── *.py / *.sh
├── examples/             (recommended) Usage examples
│   └── *.md
└── references/           (optional) API docs, templates
    └── *.md
```

**SKILL.md** must include YAML frontmatter:

```yaml
---
name: <skill-name>
description: Clear description. Include trigger keywords and "Use when..." contexts.
---
```

Use `template/SKILL.md` as a starting point:

```bash
cp -r template skills/<skill-name>
```

### 2. Skill Logo

Generate a pixel-art style SVG logo matching existing skill logos:

```bash
# Use the logo-creator skill
python3 skills/nanobanana/scripts/batch_generate.py \
  "Pixel art <subject> logo, 8-bit retro style, black pixels on white background, minimalist icon, clean crisp edges, no text, centered" \
  -n 20 --ratio 1:1 \
  -d .skill-archive/logo-creator/<date>-<skill-name> \
  -p logo

# Open preview to pick a logo
cp skills/logo-creator/templates/preview.html .skill-archive/logo-creator/<date>-<skill-name>/
open .skill-archive/logo-creator/<date>-<skill-name>/preview.html

# After picking (e.g., #5):
python3 skills/logo-creator/scripts/crop_logo.py <input>.png <output>-cropped.png
python3 skills/logo-creator/scripts/vectorize.py <output>-cropped.png skill-logos/<skill-name>.svg
```

Verify: `skill-logos/<skill-name>.svg` exists and matches the pixel-art style of other logos.

### 3. skills.json Entry

Add a complete entry to the `skills` array in `skills.json`. All fields are required unless noted:

```json
{
  "name": "<skill-name>",
  "version": "1.0.0",
  "description": "Full description of the skill.",
  "logo": "https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/skill-logos/<skill-name>.svg",
  "icon": "<simpleicons-name>",
  "color": "<hex-without-hash>",
  "triggers": ["trigger1", "trigger2"],
  "dependencies": {},
  "auth": {
    "required": false,
    "type": null,
    "keys": []
  },
  "install": {
    "user": {
      "claude": "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a claude",
      "droid": "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a droid",
      "opencode": "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a opencode",
      "codex": "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a codex"
    },
    "project": {
      "claude": "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      "droid": "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      "cursor": "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      "opencode": "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      "codex": "npx skills add ReScienceLab/opc-skills --skill <skill-name>"
    }
  },
  "commands": [
    "python3 scripts/example.py \"{input}\""
  ],
  "links": {
    "github": "https://github.com/ReScienceLab/opc-skills/tree/main/skills/<skill-name>"
  }
}
```

**Field notes:**
- `icon`: Use a [Simple Icons](https://simpleicons.org/) name, or generic like `"globe"`, `"archive"`, `"image"`
- `color`: 6-char hex without `#` (e.g., `"6B7280"`)
- `dependencies`: Object with skill names as keys and version ranges as values (e.g., `{"twitter": ">=1.0.0"}`)
- `auth.keys`: Array of `{"env": "VAR_NAME", "url": "https://...", "optional": true/false}`
- `commands`: List of CLI commands the skill exposes (empty array `[]` if instructions-only)

Validate after editing:

```bash
python3 -c "import json; json.load(open('skills.json')); print('valid')"
```

### 4. README.md

Add the skill to the "Included Skills" table in `README.md`:

```markdown
| <img src="./skill-logos/<skill-name>.svg" width="24"> | [<skill-name>](./skills/<skill-name>) | Short description |
```

Insert in the appropriate position within the existing table.

### 5. Website (worker.js)

Add the skill to the hardcoded skills array in `website/worker.js` inside the `fetchCompareData()` function. Find the `],\n  };\n}` closing of the skills array and add before it:

```javascript
{
  name: "<skill-name>",
  version: "1.0.0",
  description: "<description>",
  icon: "<icon>",
  color: "<color>",
  triggers: ["trigger1", "trigger2"],
  dependencies: [],
  auth: { required: false, note: "..." },
  install: {
    user: {
      claude: "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a claude",
      droid: "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a droid",
      opencode: "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a opencode",
      codex: "npx skills add ReScienceLab/opc-skills --skill <skill-name> -a codex",
    },
    project: {
      claude: "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      droid: "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      cursor: "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      opencode: "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
      codex: "npx skills add ReScienceLab/opc-skills --skill <skill-name>",
    },
  },
  commands: [],
  links: {
    github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/<skill-name>",
  },
},
```

### 6. CHANGELOG.md

Add the skill to the **Skill Compatibility & Dependency Matrix** table:

```markdown
| **<skill-name>** | 1.0.0 | - | - |
```

Add an entry under `## [Unreleased]` (or the release version section):

```markdown
### <skill-name>
#### [1.0.0] - YYYY-MM-DD
- **Added**: Initial release - <description>
```

## Verification

Before committing, verify all items:

```bash
# 1. SKILL.md exists with valid frontmatter
head -5 skills/<skill-name>/SKILL.md

# 2. Logo SVG exists
ls -la skill-logos/<skill-name>.svg

# 3. skills.json is valid JSON with all fields
python3 -c "
import json
config = json.load(open('skills.json'))
skill = [s for s in config['skills'] if s['name'] == '<skill-name>'][0]
required = ['name','version','description','logo','icon','color','triggers','dependencies','auth','install','links']
missing = [f for f in required if f not in skill]
print('PASS' if not missing else f'MISSING: {missing}')
"

# 4. README.md lists the skill
grep '<skill-name>' README.md

# 5. worker.js has the skill
grep '<skill-name>' website/worker.js

# 6. CHANGELOG.md has the skill in matrix
grep '<skill-name>' CHANGELOG.md
```

## Git Workflow

```bash
# Branch
git checkout develop && git pull
git checkout -b feature/skill/<skill-name>

# Commit
git add skills/<skill-name>/ skill-logos/<skill-name>.svg skills.json README.md website/worker.js CHANGELOG.md
git commit -m "feat(skill): add <skill-name> skill"

# PR to develop
git push -u origin feature/skill/<skill-name>
gh pr create --base develop
```
