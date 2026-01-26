# How Solopreneurs Build MVPs Automatically with Ralph: From PRD to Production in 24 Hours

*By OPC Team | January 26, 2026 | 9 min read*

## TL;DR

Ralph is an autonomous AI agent loop with **7.9k GitHub stars** that turns PRDs into working features automatically. Each iteration spawns a fresh AI instance that picks the highest priority incomplete task, implements it, runs tests, and commits—then repeats until all stories pass. Memory persists via git history, `progress.txt`, and `prd.json` (not context windows).

**Perfect for solopreneurs**: Build MVP features hands-off while you focus on customers, sales, and product strategy. Works with Amp CLI and Claude Code, integrates seamlessly with [OPC Skills](https://github.com/ReScienceLab/opc-skills).

**Real case study**: Built a complete SaaS dashboard with authentication in 24 hours—15 user stories, 47 commits, 28 passing tests, zero manual coding intervention.

---

## The Solopreneur's Dilemma: MVPs Need 100+ Features

You're a solopreneur. You validated your idea, found early customers, and now you need to ship an MVP. Fast.

But building software takes time you don't have:
- 50 features × 2 hours each = **100 hours of coding**
- That's 2.5 weeks of full-time work
- Meanwhile, you're also doing sales, marketing, customer support, and everything else

Traditional AI coding assistants help, but they require **constant supervision**:
- Context windows fill up after an hour of work
- Code quality degrades as context shrinks (200k → 150k → 50k tokens)
- You spend hours copying/pasting context to resume work
- Progress stalls when you step away to talk to customers

**The math doesn't work.** You need to wear all the hats, but coding demands your full attention.

**Ralph's solution**: An autonomous loop that runs 24/7 with fresh context every iteration. You write the PRD, Ralph builds the features, you wake up to working code.

---

## What is Ralph? The Autonomous AI Agent Loop

Ralph is a bash script that spawns fresh AI coding instances (Amp CLI or Claude Code) repeatedly until all PRD items are complete. Each iteration runs independently with clean context, making Ralph perfect for building features that exceed single-session limitations.

### Key Innovation: Memory Through Artifacts, Not Context

Traditional AI coding stores everything in context. Ralph uses **persistent artifacts**:

- **`prd.json`**: Task list with `passes: true/false` status for each user story
- **`progress.txt`**: Append-only file capturing learnings, gotchas, and patterns
- **Git history**: All code changes, commits, and diffs from previous iterations
- **`AGENTS.md`**: Project conventions discovered during development

Every iteration starts with a fresh AI instance that reads these artifacts. No context pollution. No degraded quality over time.

### The Numbers

- **7.9k GitHub stars** (as of January 2026)
- MIT licensed, fully open source
- Based on [Geoffrey Huntley's Ralph pattern](https://ghuntley.com/ralph/)
- Created by [Ryan Carson](https://x.com/ryancarson/status/2008548371712135632) (SnarkTank)
- Supports Amp CLI (default) and Claude Code via `--tool` flag

---

## How Ralph Works: The Autonomous Loop Explained

Ralph's loop is elegantly simple. Here's the step-by-step breakdown:

### The 10-Step Autonomous Cycle

1. **Create feature branch** from PRD `branchName` field
2. **Load artifacts** (`progress.txt`, `prd.json`, git diff) into fresh AI instance
3. **AI picks highest priority story** where `passes: false`
4. **Implement that single story** (and only that story)
5. **Run quality checks**: typecheck, lint, unit tests, integration tests
6. **If checks pass** → commit with descriptive message
7. **Update `prd.json`**: Mark story as `passes: true`
8. **Append learnings** to `progress.txt` and update `AGENTS.md`
9. **Loop continues** until all stories have `passes: true` OR max iterations reached
10. **Output `<promise>COMPLETE</promise>`** and exit

### Why Fresh Context Matters

**Traditional AI coding session**:
```
Iteration 1: 200k tokens available → great code
Iteration 5: 150k tokens available → okay code
Iteration 10: 50k tokens available → degraded quality
Iteration 15: Out of context → session ends
```

**Ralph's approach**:
```
Iteration 1: 200k tokens + artifacts → great code
Iteration 5: 200k tokens + artifacts → great code
Iteration 10: 200k tokens + artifacts → great code
Iteration 20: 200k tokens + artifacts → great code
```

Every iteration starts fresh. Quality stays consistent. Features that would take 3-4 manual sessions complete in one autonomous run.

### Feedback Loops Are Critical

Ralph only works if there are **automated quality checks**:

- **Type checking** (TypeScript, mypy): Catches type errors immediately
- **Unit tests** (Jest, pytest): Verifies behavior
- **Integration tests** (Playwright, Cypress): Confirms end-to-end workflows
- **CI/CD pipelines**: Must stay green

If tests fail, the story stays `passes: false` and gets retried in the next iteration. This creates a self-correcting loop that catches bugs before they compound.

---

## Real Case Study: Building a SaaS Dashboard in 24 Hours

Let's walk through a real example where Ralph built a production-ready feature from scratch.

### Project: User Dashboard for SaaS Startup

**Goal**: Build authentication, user profile, settings, and billing preview for a subscription SaaS product.

**Starting Point**:
- Empty Next.js 14 project with App Router
- Supabase configured (database + auth backend)
- `prd.json` with 15 user stories
- Zero lines of code written

**Tech Stack**:
- Next.js 14 (App Router, Server Actions)
- TypeScript (strict mode)
- Supabase (auth, database)
- Tailwind CSS
- Jest + React Testing Library

### The PRD Breakdown

```json
{
  "projectName": "SaaS Dashboard MVP",
  "branchName": "feature/user-dashboard",
  "userStories": [
    // Stories 1-5: Authentication
    { "id": "story-1", "title": "Supabase auth setup", "passes": false },
    { "id": "story-2", "title": "Login/signup forms", "passes": false },
    { "id": "story-3", "title": "Protected routes", "passes": false },
    { "id": "story-4", "title": "Session management", "passes": false },
    { "id": "story-5", "title": "Logout flow", "passes": false },
    
    // Stories 6-10: Dashboard
    { "id": "story-6", "title": "Dashboard layout", "passes": false },
    { "id": "story-7", "title": "User profile display", "passes": false },
    { "id": "story-8", "title": "Settings page", "passes": false },
    { "id": "story-9", "title": "Avatar upload", "passes": false },
    { "id": "story-10", "title": "Email preferences", "passes": false },
    
    // Stories 11-15: Billing + Polish
    { "id": "story-11", "title": "Subscription status", "passes": false },
    { "id": "story-12", "title": "Upgrade CTA", "passes": false },
    { "id": "story-13", "title": "Usage metrics", "passes": false },
    { "id": "story-14", "title": "Responsive design", "passes": false },
    { "id": "story-15", "title": "Loading states + error boundaries", "passes": false }
  ]
}
```

### Ralph Configuration

```bash
# Run Ralph with Claude Code, max 20 iterations
./scripts/ralph/ralph.sh --tool claude 20
```

### Timeline (Actual Results)

**Hours 0-6: Authentication (Stories 1-5)**
- Supabase client setup with environment variables
- Auth flow with email/password validation
- Middleware for protected routes
- Session persistence with cookies
- Logout with session cleanup

**Hours 6-12: User Dashboard (Stories 6-10)**
- Dashboard layout with sidebar navigation
- User profile page fetching data from Supabase
- Settings page with form validation
- Avatar upload to Supabase Storage
- Email preference toggles with Server Actions

**Hours 12-18: Billing Preview (Stories 11-13)**
- Subscription status display (Free/Pro/Enterprise)
- Upgrade CTA with pricing comparison
- Usage metrics dashboard with charts

**Hours 18-24: Polish + Browser Verification (Stories 14-15)**
- Responsive design for mobile/tablet
- Loading states for all async operations
- Error boundaries for graceful failures
- Browser verification using dev-browser skill

### Results

- ✅ **15/15 stories completed**
- ✅ **47 commits** to feature branch
- ✅ **28 test cases** all passing
- ✅ **Zero manual coding** intervention
- ✅ **Production-ready** deployment

### Key Learnings Added to AGENTS.md

Ralph automatically documented these patterns in `AGENTS.md`:

```markdown
## Authentication Best Practices
- Always use Supabase Edge Functions for auth, not client-side
- Store session in httpOnly cookies, not localStorage
- Test auth flows in incognito browser to catch session issues

## Dashboard Components
- Dashboard components should lazy-load to improve Time to Interactive
- Use Suspense boundaries for each major section
- Always add loading states to async components

## File Uploads
- Use Supabase Storage policies to restrict access
- Validate file types and sizes server-side
- Generate thumbnail previews for avatars
```

These learnings benefited future iterations and will help human developers maintain the codebase.

### OPC Skills Integration During Development

Ralph automatically invoked OPC skills when needed:

| Iteration | OPC Skill Used | Purpose |
|-----------|----------------|---------|
| 3 | `logo-creator` | Generated dashboard logo for nav bar |
| 8 | `seo-geo` | Added meta tags and OpenGraph for landing page |
| 12 | `twitter` | Researched SaaS pricing page best practices |

This is the power of skill composition—Ralph can use any installed OPC skill during the autonomous loop.

---

## Integration with OPC Skills

Ralph works seamlessly with [OPC Skills](https://github.com/ReScienceLab/opc-skills), our collection of 9 AI agent skills for solopreneurs. When you install OPC skills globally, Ralph's AI instances automatically have access to them during the loop.

### How It Works

**Step 1: Install OPC Skills**
```bash
npx skills add ReScienceLab/opc-skills
```

**Step 2: Reference Skills in PRD**

Your PRD stories can explicitly reference OPC skills:

```json
{
  "id": "story-2",
  "title": "Find and register domain",
  "description": "Use domain-hunter skill to find available .io domains under $20/year and register the best option",
  "acceptanceCriteria": [
    "Domain hunter searches for 5+ domain options",
    "Compares prices across 8 registrars",
    "Finds active promo codes via Twitter/Reddit",
    "Registers domain at cheapest registrar",
    "Adds domain to project configuration"
  ],
  "passes": false
}
```

**Step 3: Ralph Invokes Skills Automatically**

During implementation, Ralph's AI will:
1. Load the `domain-hunter` skill
2. Execute the workflow (search → compare → find promos → register)
3. Document the results in the codebase
4. Mark story as complete

### OPC Skills Ralph Can Use

| OPC Skill | Ralph Use Case | Example PRD Story |
|-----------|----------------|-------------------|
| **domain-hunter** | Find and register domains | "Use domain-hunter to find and register best .io domain under $20" |
| **logo-creator** | Generate logos/icons | "Use logo-creator to generate app logo and favicon" |
| **banner-creator** | Create hero images | "Use banner-creator to create landing page hero image" |
| **twitter** | Research competitors | "Use twitter to find top 10 SaaS pricing pages for inspiration" |
| **reddit** | Validate features | "Use reddit to discover pain points in r/SaaS and r/startups" |
| **seo-geo** | Optimize for search | "Use seo-geo to add meta tags, schema markup, and sitemap" |
| **nanobanana** | Generate custom images | "Use nanobanana to generate custom dashboard illustrations" |

### Complete Installation

```bash
# Install OPC skills globally
npx skills add ReScienceLab/opc-skills

# Ralph automatically detects installed skills
./scripts/ralph/ralph.sh --tool claude 15
```

Now Ralph can use any OPC skill during development—no additional configuration needed.

---

## Critical Success Factors for Solopreneurs

Ralph works best when you follow these patterns:

### 1. Small, Focused PRD Items

Each story should fit in one context window (~1-2 hours of work).

✅ **Good story**: "Add login form with email/password validation"
- Single component
- Clear acceptance criteria
- Testable outcome

❌ **Too big**: "Build entire authentication system"
- Multiple components
- Vague scope
- Will exceed context window

**Rule of thumb**: If a story takes more than 2 hours for a human developer, split it into smaller stories.

### 2. Strong Feedback Loops

Ralph relies on automated checks to verify correctness:

**Must have**:
- Type checking (TypeScript, mypy, Flow)
- Unit tests (Jest, pytest, RSpec)
- Linting (ESLint, Pylint, Rubocop)

**Nice to have**:
- Integration tests (Playwright, Cypress)
- E2E tests for critical paths
- Visual regression tests

Ralph only marks a story complete if **all checks pass**. Weak tests = unreliable results.

### 3. Browser Verification for UI

For frontend stories, add browser verification to acceptance criteria:

```json
{
  "acceptanceCriteria": [
    "Login form renders with email and password fields",
    "Submit button is disabled until both fields are filled",
    "Verify in browser using dev-browser skill",
    "Screenshot confirms visual correctness"
  ]
}
```

Ralph will use the `dev-browser` skill to:
- Navigate to the page
- Interact with UI elements
- Take screenshots
- Verify expected behavior

This catches visual bugs that unit tests miss.

### 4. AGENTS.md Updates

Each iteration should update `AGENTS.md` with learnings:

```markdown
## Dashboard Components
- Always add loading states to async components
- Use Suspense boundaries for better UX
- Lazy-load heavy components to improve TTI

## Common Gotchas
- Don't forget to update the sitemap after adding new pages
- Always test auth flows in incognito to catch session issues
```

Future iterations (and human developers) benefit from these documented patterns.

### 5. Right-Sized Iterations

Start conservatively:

```bash
# Start with 15 iterations
./scripts/ralph/ralph.sh 15
```

Monitor progress:

```bash
# Check which stories are complete
cat prd.json | jq '.userStories[] | {id, title, passes}'

# If incomplete, run more iterations
./scripts/ralph/ralph.sh 10  # Runs 10 more
```

Better to run in smaller batches than one massive 50-iteration run that might go off track.

---

## Getting Started: Your First Ralph MVP

Ready to build your MVP hands-off? Here's how to get started in under 10 minutes.

### Prerequisites

- **Amp CLI** (`brew install amp`) OR **Claude Code** (`npm i -g @anthropic-ai/claude-code`)
- **jq** for JSON parsing (`brew install jq`)
- **Git repository** for your project
- Basic understanding of your tech stack (to write PRD and tests)

### Step 1: Install Ralph

**Option A: Copy to your project**
```bash
mkdir -p scripts/ralph
curl -o scripts/ralph/ralph.sh https://raw.githubusercontent.com/snarktank/ralph/main/ralph.sh
curl -o scripts/ralph/prompt.md https://raw.githubusercontent.com/snarktank/ralph/main/prompt.md
chmod +x scripts/ralph/ralph.sh
```

**Option B: Install skills globally** (recommended)
```bash
# For Claude Code
curl -o ~/.claude/skills/prd/SKILL.md https://raw.githubusercontent.com/snarktank/ralph/main/skills/prd/SKILL.md
curl -o ~/.claude/skills/ralph/SKILL.md https://raw.githubusercontent.com/snarktank/ralph/main/skills/ralph/SKILL.md

# For Amp
curl -o ~/.config/amp/skills/prd/SKILL.md https://raw.githubusercontent.com/snarktank/ralph/main/skills/prd/SKILL.md
curl -o ~/.config/amp/skills/ralph/SKILL.md https://raw.githubusercontent.com/snarktank/ralph/main/skills/ralph/SKILL.md
```

### Step 2: Create PRD

Use your AI coding assistant with the `prd` skill:

```
Load the prd skill and create a PRD for [describe your MVP idea]
```

Example:
```
Load the prd skill and create a PRD for a task management SaaS with:
- User authentication
- Create/edit/delete tasks
- Drag-and-drop prioritization
- Due dates and reminders
- Team collaboration
```

The skill will ask clarifying questions and generate `tasks/prd-[feature-name].md`.

### Step 3: Convert PRD to Ralph Format

```
Load the ralph skill and convert tasks/prd-task-management.md to prd.json
```

This creates `prd.json` with structured user stories:

```json
{
  "projectName": "Task Management SaaS",
  "branchName": "feature/task-management-mvp",
  "userStories": [
    { "id": "story-1", "title": "...", "passes": false },
    { "id": "story-2", "title": "...", "passes": false }
  ]
}
```

### Step 4: Configure Auto-Handoff (Amp only)

Add to `~/.config/amp/settings.json`:

```json
{
  "amp.experimental.autoHandoff": { "context": 90 }
}
```

This enables automatic handoff when context fills up, allowing Ralph to handle large stories.

### Step 5: Run Ralph

```bash
# Using Claude Code
./scripts/ralph/ralph.sh --tool claude 15

# Using Amp (default)
./scripts/ralph/ralph.sh 15
```

Ralph will:
- Create feature branch
- Run 15 autonomous iterations
- Implement stories one by one
- Commit passing code
- Output final status

### Step 6: Monitor Progress

In a separate terminal:

```bash
# Check story completion status
watch -n 30 'cat prd.json | jq ".userStories[] | {id, title, passes}"'

# Tail recent learnings
tail -f progress.txt

# View commits in real-time
watch -n 30 'git log --oneline -10'
```

### Step 7: Review and Deploy

When Ralph outputs `<promise>COMPLETE</promise>`:

```bash
# Review all changes
git log --oneline feature/task-management-mvp

# Check final test status
npm test  # or pytest, etc.

# Merge to main
git checkout main
git merge feature/task-management-mvp

# Deploy
npm run deploy  # or your deployment command
```

**Time investment**: 30 minutes to create PRD, 24-48 hours for Ralph to build autonomously, 1-2 hours for review and deployment.

---

## Ralph vs Traditional AI Coding: The Complete Comparison

| Aspect | Traditional AI Coding | Ralph Autonomous Loop |
|--------|----------------------|----------------------|
| **Context Management** | Single session, fills up after 1-2 hours | Fresh 200k tokens every iteration |
| **Memory** | Lost between sessions, manual copy/paste | Persistent via git + progress.txt + prd.json |
| **Scope** | Small tasks (<1 hour) | Multi-story features (24+ hours) |
| **Supervision** | Constant monitoring required | Hands-off after PRD creation |
| **Quality Assurance** | Manual verification | Automated tests + typecheck every iteration |
| **Context Restoration** | Manual (15-30 minutes per session) | Automatic via artifacts |
| **MVP Timeline** | 2-3 weeks with supervision | 24-48 hours hands-off |
| **OPC Skills Integration** | Manual skill invocation each time | Automatic during loop |
| **Cost** (Claude Sonnet 4.5) | $50-100 for MVP (lots of retries) | $30-60 for MVP (fewer retries due to fresh context) |
| **Best For** | Single components, quick fixes | Complete features, MVPs, refactors |

---

## Common Gotchas & Debugging

### Issue: Ralph Keeps Retrying the Same Story

**Symptoms**: Story fails tests repeatedly, never marked complete

**Cause**: Tests are failing but error messages aren't clear enough for AI to fix

**Fix**:
1. Check `progress.txt` for error patterns
2. Improve test error messages to be more descriptive
3. Add more specific acceptance criteria to the story
4. Manually fix the issue and let Ralph continue

```bash
# Check error patterns
grep "FAILED" progress.txt | tail -20

# Improve test messages in your test files
# Then reset story and retry
jq '.userStories[3].passes = false' prd.json > tmp.json && mv tmp.json prd.json
./scripts/ralph/ralph.sh 5
```

### Issue: Stories Marked Complete But Feature Doesn't Work

**Symptoms**: Tests pass but actual functionality is broken

**Cause**: Tests aren't comprehensive enough or don't cover edge cases

**Fix**:
1. Add browser verification to acceptance criteria
2. Write more comprehensive tests before running Ralph
3. Add manual QA as a separate story

```json
{
  "id": "story-16",
  "title": "QA all auth flows",
  "acceptanceCriteria": [
    "Test login with valid credentials",
    "Test login with invalid credentials",
    "Test signup with existing email",
    "Test password reset flow",
    "Test session persistence after browser restart",
    "Verify all scenarios in browser using dev-browser skill"
  ]
}
```

### Issue: Ralph Runs Out of Iterations

**Symptoms**: Max iterations reached but stories still incomplete

**Cause**: Stories are too large or poorly defined

**Fix**:
1. Break down remaining stories into smaller pieces
2. Run additional iterations
3. Review progress.txt to see where time was spent

```bash
# Check which stories are incomplete
cat prd.json | jq '.userStories[] | select(.passes == false)'

# Run 10 more iterations
./scripts/ralph/ralph.sh 10
```

### Issue: AI Forgets Project Conventions

**Symptoms**: New code doesn't match existing patterns

**Cause**: AGENTS.md not being updated or read properly

**Fix**:
1. Manually update AGENTS.md with critical patterns
2. Add explicit instruction in prompt.md to always read AGENTS.md
3. Make conventions part of acceptance criteria

```markdown
## AGENTS.md
### Critical Patterns
- ALL components must use TypeScript strict mode
- ALL API routes must include error handling
- ALL database queries must use prepared statements
- File structure: components in src/components, utils in src/lib
```

### Debugging Commands

```bash
# Current status
cat prd.json | jq '.userStories[] | {id, title, passes}'

# Recent learnings
tail -50 progress.txt

# Commit history
git log --oneline --graph -20

# Test status
npm test -- --verbose

# Reset if needed (careful!)
git checkout main
rm progress.txt prd.json
# Start over with new PRD
```

---

## OPC Skills + Ralph: The Complete Solopreneur Stack

Together, OPC Skills and Ralph form a complete hands-off MVP builder:

### The Full Toolkit

1. **OPC Skills**: 9 reusable skills for research, design, and optimization
2. **Ralph**: Autonomous loop for feature development
3. **Combined**: Complete automation from idea to deployment

### Example 4-Day Launch Workflow

**Day 1: Research & Design** (4 hours hands-on)
```bash
# Domain and branding
"Use domain-hunter to find available .io domains under $20"
"Use logo-creator to generate app logo in 3 color variations"
"Use banner-creator to create landing page hero image"

# Market validation
"Use twitter to find competitors and analyze their pricing"
"Use reddit to discover pain points in r/SaaS and r/startups"

# Product requirements
"Load prd skill and create PRD based on research findings"
```

**Day 2-3: Development** (Ralph runs autonomously)
```bash
# Convert PRD and start Ralph
"Load ralph skill and convert tasks/prd-mvp.md to prd.json"
./scripts/ralph/ralph.sh --tool claude 20

# Ralph runs for 24-48 hours, building all features
# Meanwhile, you work on:
# - Customer interviews
# - Marketing copy
# - Sales outreach
# - Social media presence
```

**Day 4: Launch** (2 hours hands-on)
```bash
# SEO optimization
"Use seo-geo to add meta tags, schema markup, and generate sitemap"

# Final checks
npm test
npm run build
npm run deploy

# Announce
"Post launch announcement on Twitter, Product Hunt, Reddit"
```

**Total hands-on time**: 6 hours over 4 days
**Total autonomous time**: 48 hours (Ralph + OPC skills)

### Installation

```bash
# Install OPC skills
npx skills add ReScienceLab/opc-skills

# Install Ralph
curl -o ~/.claude/skills/ralph/SKILL.md https://raw.githubusercontent.com/snarktank/ralph/main/skills/ralph/SKILL.md

# You're ready to build
```

---

## Further Reading

### OPC Skills Resources
- [OPC Skills: AI Agent Skills for Solopreneurs](/blog/what-is-opc)
- [Why Skills Beat Docs: Agent-Native Documentation](/blog/why-skills-beat-docs)
- [How to Convert Your Docs to Agent Skills (5-Min Guide)](/blog/convert-docs-to-skills-guide)
- [Domain Hunter Tutorial: How AI Saved Me $50](/blog/domain-hunting-ai-saved-50)

### Ralph Resources
- [Ralph GitHub Repository](https://github.com/snarktank/ralph) - Source code, examples, and community
- [Geoffrey Huntley's Ralph Article](https://ghuntley.com/ralph/) - Original pattern and philosophy
- [Ryan Carson's Ralph Announcement](https://x.com/ryancarson/status/2008548371712135632) - Real-world usage examples

### AI Coding Tools
- [Amp Documentation](https://ampcode.com/manual) - Amp CLI setup and best practices
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code) - Claude Code installation and usage
- [Skills.sh Registry](https://skills.sh) - Discover more skills for your AI agents

---

## Frequently Asked Questions

### What is Ralph AI and how does it work?

Ralph is an autonomous AI agent loop that runs coding tools (Amp or Claude Code) repeatedly until all PRD items are complete. Each iteration spawns a fresh AI instance that picks the highest priority incomplete task, implements it, runs tests, and commits the code. Memory persists via git history, `progress.txt` (learnings), and `prd.json` (task status)—not through context windows. This allows Ralph to build features over 24+ hours without quality degradation.

### Can solopreneurs build MVPs with Ralph without coding experience?

Yes. Ralph requires a PRD (product requirements document) which you can create by describing your idea in plain English using the `prd` skill. Ralph handles all coding automatically—you never write a single line of code. However, you need basic command line knowledge to run Ralph and basic understanding of your tech stack to write meaningful PRD items and verify the results. Think of it as "no-code for developers" or "low-supervision AI development."

### How long does Ralph take to build an MVP?

Based on our case study, Ralph built a complete SaaS dashboard with authentication in 24 hours (15 user stories, 47 commits, 28 passing tests). Timeline depends on MVP complexity: simple landing pages take 6-12 hours, CRUD apps take 24-36 hours, complex SaaS products take 48-72 hours. The key is that Ralph runs autonomously—you're not sitting at your computer supervising. You write the PRD, start Ralph, and come back when it's done.

### Which AI coding tools does Ralph support?

Ralph natively supports two AI coding tools: **Amp CLI** (default) and **Claude Code**. Use `./ralph.sh` for Amp or `./ralph.sh --tool claude` for Claude Code. Both require authentication and CLI installation. Amp is great for teams and has auto-handoff for large context. Claude Code (Anthropic) is perfect for solopreneurs and has strong reasoning capabilities. Both produce similar quality results, so choose based on your preference and budget.

### How does Ralph integrate with OPC Skills?

Install OPC skills globally with `npx skills add ReScienceLab/opc-skills` and Ralph's AI instances automatically have access during the loop. Your PRD can reference skills explicitly: "Use domain-hunter to find domain" or "Use logo-creator for branding." Ralph invokes skills as needed during implementation. This creates composable workflows where Ralph can do market research (twitter/reddit skills), generate assets (logo-creator/banner-creator), optimize for SEO (seo-geo skill), and build features—all in one autonomous run.

### What is prd.json and how do I create it?

`prd.json` is a JSON file containing user stories with `passes: true/false` status that Ralph uses to track progress. Create it using the `ralph` skill: (1) Write a PRD in markdown describing your MVP using the `prd` skill, (2) Run "Load ralph skill and convert tasks/prd-mvp.md to prd.json". The ralph skill structures your requirements into user stories with IDs, titles, descriptions, and acceptance criteria. Ralph reads this file each iteration, picks an incomplete story, implements it, and marks it `passes: true` when tests pass.

### Does Ralph work for frontend/UI development?

Yes, Ralph works great for frontend development. Include "Verify in browser using dev-browser skill" in your PRD acceptance criteria. Ralph will navigate to pages, interact with UI elements (click buttons, fill forms), take screenshots, and verify expected behavior. This catches visual bugs that unit tests miss. Works with React, Vue, Next.js, Svelte, and other frameworks. Our case study built a complete Next.js dashboard with responsive design, loading states, and error boundaries—all verified in browser automatically.

### How much does it cost to run Ralph?

With Claude Code (Sonnet 4.5): **$30-60 for a typical MVP** (15-25 user stories). With Amp: pricing varies based on your plan. Cost depends on iterations, complexity, and how well-structured your PRD is. Ralph is often **cheaper than manual AI coding** because fresh context reduces retries and errors. Traditional approach: spend $50-100 redoing work as context degrades. Ralph approach: spend $30-60 getting it right the first time with consistent quality.

### Is Ralph production-ready for startups?

Yes, with important caveats. Ralph requires **strong feedback loops** (tests, type checking, linting) and **well-structured PRDs** to work reliably. Best for solopreneurs who can review code before deployment, not for fully hands-off production deployments without review. **7.9k GitHub stars** indicate active community usage and real-world validation. Many startups use Ralph for MVP development, then review and refine before launch. Think of Ralph as an extremely productive junior developer that needs code review.

### What are the prerequisites to run Ralph?

You need: **(1) Amp CLI or Claude Code installed** - choose your AI coding tool, **(2) jq command** - install with `brew install jq` for JSON parsing, **(3) Git repository** - Ralph uses git for memory persistence, **(4) Basic tech stack understanding** - you should know enough to write meaningful PRD items and verify tests. You don't need to be an expert developer, but you should understand what you're building and be able to read test results. If you can write "Add login form with email/password validation" and understand why that matters, you're ready for Ralph.

---

*Questions about Ralph or OPC Skills? Open an issue on [GitHub](https://github.com/ReScienceLab/opc-skills/issues) or join the discussion.*
