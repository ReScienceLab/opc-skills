---
name: skill-name
description: Clear description of what this skill does and when to use it
triggers:
  - trigger1
  - trigger2
  - another-trigger
dependencies:
  dependency-skill: ">=1.0.0"
  another-skill: ">=2.0.0"
---

# Skill Name

Brief description of the skill and its purpose.

## Prerequisites

List any setup requirements:
- Environment variables needed
- API keys required
- Dependencies (already listed in frontmatter above)

Example setup:
```bash
export SKILL_API_KEY="your_api_key"
```

## Quick Start

How to use the skill quickly:

```bash
cd <skill_directory>
python3 scripts/command.py --option value
```

## Usage Examples

### Example 1: Basic usage

```bash
python3 scripts/script.py "input"
```

Output:
```
Expected output here
```

### Example 2: Advanced usage

```bash
python3 scripts/script.py "input" --flag --option value
```

## Commands

All commands run from the skill directory.

### Command 1
```bash
python3 scripts/script1.py --help
python3 scripts/script1.py "param1" --option value
```

### Command 2
```bash
python3 scripts/script2.py "param1" "param2"
```

## Scripts

- `script1.py` - Description of what this script does
- `script2.py` - Description of what this script does

## API Info

- **Base URL**: (if applicable)
- **Rate Limits**: (if applicable)
- **Auth**: (how authentication works)
- **Docs**: Link to official documentation

## Troubleshooting

### Issue 1

**Symptom**: Description of the problem

**Solution**:
1. Step 1
2. Step 2

### Issue 2

**Symptom**: Description of the problem

**Solution**:
1. Step 1
2. Step 2

## Examples

See `examples/` directory for full workflow examples.

## References

- [Official Documentation](https://example.com)
- [API Reference](https://example.com/api)
- [Related Skill](https://github.com/ReScienceLab/opc-skills/tree/main/skills/related-skill)

## Notes

- Important note 1
- Important note 2

---

## Frontmatter Guide

The YAML frontmatter at the top of this file is required:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Unique identifier (kebab-case) |
| `description` | string | ✓ | What the skill does and when to use it |
| `triggers` | array | ✓ | Keywords that activate this skill |
| `dependencies` | object | | Dependent skills (format: `skill-name: ">=X.Y.Z"`) |

### Dependency Format

Use semantic versioning format:
- `"^1.0.0"` - Compatible with 1.x versions
- `">=1.0.0"` - Version 1.0.0 or higher
- `"1.0.0"` - Exact version only
- `">=1.0.0,<2.0.0"` - Range of versions

## Creating Your Skill

1. Copy this template to `skills/your-skill-name/`
2. Update the YAML frontmatter
3. Write your SKILL.md documentation
4. Add Python/shell scripts in `scripts/`
5. Add usage examples in `examples/`
6. Update `skills.json` with your skill entry
7. Test with your agent before submitting PR
