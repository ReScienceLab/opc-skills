# Archive Template

Use this template when creating archive files.

```markdown
---
tags: [keyword1, keyword2, keyword3]
category: infrastructure | release | debugging | feature | design
related: [other-archive-filename-without-ext]
---

# {Title} - {YYYY-MM-DD}

## Summary
One-line description of what was accomplished.

## Context
- **Branch**: {branch name}
- **Version**: {if applicable}
- **Related Issue**: {if applicable}

## Issues Encountered & Solutions

### 1. {Issue Title}
- {Description of the problem}
- **Fix**: {How it was resolved}

## Key Changes
{Code snippets, config changes, or commands that were critical}

## Lessons Learned
{Optional: insights for future reference}
```

## Frontmatter Fields

- **tags**: searchable keywords for `grep -ri "tags:.*keyword" .archive/`
- **category**: one of `infrastructure`, `release`, `debugging`, `feature`, `design`
- **related**: filenames (without `.md`) of related archives for cross-referencing
