---
name: archive
description: >-
  Archive session learnings, debugging solutions, and deployment logs to
  .archive/yyyy-mm-dd/ as indexed markdown with searchable tags.
  Use when completing a significant task, resolving a tricky bug, deploying,
  or when the user says "archive this". Maintains .archive/MEMORY.md index
  for cross-session knowledge reuse.
---

# Archive Skill

Capture, index, and reuse project knowledge across sessions.

## When to Archive

- After completing a significant task (deploy, migration, major feature)
- After resolving a tricky debugging session
- When the user says "archive this"
- After any multi-step process with learnings worth preserving

## When to Consult Archives

- Before debugging infrastructure, deploy, or CI issues
- Before repeating a process done in a past session
- When encountering an error that may have been solved before

**Search**: `grep -ri "keyword" .archive/`
**Index**: `.archive/MEMORY.md`

## Archive Workflow

1. Read `.archive/MEMORY.md` — check for related existing archives
2. Create `.archive/YYYY-MM-DD/` directory if needed
3. Write markdown file with YAML frontmatter (see `references/TEMPLATE.md`)
4. **Update `.archive/MEMORY.md`**: add one-line entry under the right category
5. If related archives exist, add `related` field in frontmatter

## Lookup Workflow

1. Read `.archive/MEMORY.md` to find relevant entries
2. Read the specific archive file for detailed context
3. Apply learnings to current task

## Categories

- **infrastructure** — AWS, ECS, IAM, networking, secrets, CloudWatch
- **release** — TestFlight, versioning, Git Flow, CHANGELOG
- **debugging** — Bug fixes, error resolution, gotchas
- **feature** — Feature design, implementation notes
- **design** — UI/UX, icons, visual design

## Rules

- `.archive/` must be in `.gitignore` — local-only notes
- Keep entries concise but reproducible
- Focus on **problems, fixes, and exact commands**
- Always update MEMORY.md after creating an archive
- Use descriptive filenames (e.g., `cloudwatch-logging.md` not `session.md`)
- Include YAML frontmatter with `tags`, `category`, and optional `related`
