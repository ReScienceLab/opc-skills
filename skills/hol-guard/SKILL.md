---
name: hol-guard
description: Use when setting up HOL Guard, protecting local AI harnesses, reviewing Guard approvals or receipts, scanning Codex plugins, skills, MCP servers, marketplace packages, or running plugin-scanner verification before release.
license: Apache-2.0
---

# HOL Guard

HOL Guard protects local AI harnesses before tools run. Use this skill when the user wants AI antivirus behavior, local approval review, Codex protection, Claude Code protection, MCP safety checks, skill/package verification, or release gates from `hol-guard` and `plugin-scanner`.

## Hard Rules

- Never read `.env` files.
- Never bypass Guard approvals.
- Do not mark a workspace protected until a Guard command proves status.
- Prefer reversible Guard commands over direct harness config edits.
- Do not mutate user-level harness config unless the `hol-guard` command owns that mutation.
- Treat scanner failures as real until inspected.
- Preserve existing user changes and inspect `git status --short` before edits in a repo.

## Install Check

Check both CLIs independently:

```bash
hol-guard --version
plugin-scanner --version
```

If `hol-guard` is missing and the user asked for runtime setup, prefer:

```bash
pipx install hol-guard
```

If `plugin-scanner` is missing and the user asked for scanning, install the separate scanner distribution:

```bash
pipx install plugin-scanner
```

Do not assume the `hol-guard` distribution provides the `plugin-scanner` command. If `pipx` is unavailable, explain that isolated CLI installation is recommended rather than silently changing the user's Python environment.

After runtime installation:

```bash
hol-guard status
hol-guard detect --json
```

## Protect A Local Harness

Use `hol-guard detect --json` as the source of truth for whether the local harness is supported and for its exact Guard harness identifier. Do not maintain or guess a separate supported-harness or alias list in this skill.

For the exact detected harness identifier:

```bash
hol-guard bootstrap
hol-guard install <harness>
hol-guard run <harness> --dry-run
hol-guard doctor <harness> --json
hol-guard run <harness>
hol-guard status
```

A missing detection result, Guard error, failed dry-run, or failed doctor check is not permission to launch an unprotected fallback agent.

### Claude Code

When `hol-guard detect --json` identifies Claude Code, use the exact `claude-code` Guard identifier:

```bash
hol-guard install claude-code
hol-guard run claude-code --dry-run
hol-guard doctor claude-code --json
hol-guard run claude-code
```

Claude Code is a first-class Guard target. Prefer Guard-owned Claude hooks over direct manual edits to Claude config.

### Codex

When `hol-guard detect --json` identifies Codex, use the exact `codex` Guard identifier:

```bash
hol-guard install codex
hol-guard run codex --dry-run
hol-guard doctor codex --json
hol-guard run codex
```

Codex supports Guard-owned `PreToolUse` Bash hooks and same-chat MCP elicitation where available.

## Approval Work

If Guard blocks or queues work, list pending requests first and use the exact pending request ID when opening one:

```bash
hol-guard approvals
hol-guard approvals open <request-id>
hol-guard receipts
hol-guard diff <harness>
```

For terminal-only resolution:

```bash
hol-guard approvals approve <request-id>
hol-guard approvals deny <request-id>
```

Only approve after reading the risk reason and understanding the requested scope.

## Evidence Work

Use evidence commands when user needs proof, audit trail, or handoff artifacts:

```bash
hol-guard receipts
hol-guard inventory
hol-guard abom --format json
hol-guard events
hol-guard explain <artifact-id>
```

For cloud sync, keep it optional and user-directed:

```bash
hol-guard connect
hol-guard connect status
hol-guard connect repair
hol-guard sync
```

## Scan A Plugin Or Skill Package

Use scanner mode for Codex plugins, Claude Code project surfaces, `.agents` marketplaces, skills, MCP server configs, and release gates.

```bash
plugin-scanner lint .
plugin-scanner verify .
```

If scanning a specific package:

```bash
plugin-scanner lint <path>
plugin-scanner verify <path>
```

If the target is a Codex marketplace root with `.agents/plugins/marketplace.json`, scan the repo root so local plugin entries can be discovered.

Scanner target guidance:

- Codex plugin: scan the repo root or plugin folder containing `.codex-plugin/plugin.json`.
- Codex marketplace: scan the repo root containing `.agents/plugins/marketplace.json`.
- Claude Code project: scan the workspace root containing `.claude/`, `.mcp.json`, hooks, or agent folders.
- MCP server package: scan the package root containing server config and package metadata.
- Skill package: scan the folder containing `SKILL.md`.
- Mixed agent workspace: scan the repo root so local plugin, skill, MCP, and harness config surfaces are discovered together.

## Common Debug Commands

```bash
hol-guard doctor
hol-guard doctor <harness> --json
hol-guard detect --json
hol-guard settings show
hol-guard explain install-connect
plugin-scanner verify . --json
```

## Response Pattern

When using Guard, report:

- What command ran.
- What Guard found.
- What remains blocked or risky.
- What proof exists.
- Exact next command if user must act.

Do not claim protection, approval, or release readiness without command output proving it.
