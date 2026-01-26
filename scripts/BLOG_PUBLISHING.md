# Blog Publishing Best Practices

This document outlines optimized workflows for publishing blog posts quickly without sacrificing quality.

## The Problem

**Current workflow** (too slow for blog posts):
```
feature/blog/post → PR to develop → merge → PR to main → merge → deploy
                     ↓ review      ↓        ↓ review    ↓       ↓
                     1 day         instant  1 day       instant  5 min
```
**Total time**: 2+ days for a blog post to go live

**Desired workflow** (fast-track for content):
```
feature/blog/post → PR to main → auto-merge → deploy
                    ↓ validation  ↓           ↓
                    30 sec        instant     5 min
```
**Total time**: 6 minutes from PR creation to live

---

## Recommended Solutions

### Option 1: Fast-Track Blog Posts with Auto-Merge (RECOMMENDED)

**How it works:**
1. Create PR directly to `main` (skip `develop`)
2. Add `blog-post` label
3. GitHub Action validates blog.json and markdown
4. If validation passes, auto-approves and auto-merges
5. Cloudflare Workers deploys automatically

**Setup:**

Already created: `.github/workflows/publish-blog.yml`

**Usage:**
```bash
# Create blog post
git checkout -b feature/blog/my-post
# ... edit files ...
git add website/blog/
git commit -m "feat(blog): add my awesome post"
git push -u origin feature/blog/my-post

# Create PR to main (not develop!)
gh pr create --base main --label blog-post --title "feat(blog): add my awesome post"

# Auto-merge happens in ~1 minute
# Live in ~6 minutes total
```

**Pros:**
✅ Fast (6 minutes to live)
✅ Still validated automatically
✅ No manual review needed for content
✅ Works with existing infrastructure

**Cons:**
❌ Bypasses develop branch (Git Flow purists won't like it)
❌ Requires GitHub Actions secrets for auto-merge

---

### Option 2: Scheduled Publishing

**How it works:**
1. Create PR to `main` with blog post
2. Add `publish-date: 2026-01-28` label
3. GitHub Action waits until that date, then auto-merges

**Setup:**

Create `.github/workflows/scheduled-publish.yml`:

```yaml
name: Scheduled Blog Publishing

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Get current date
        id: date
        run: echo "today=$(date +%Y-%m-%d)" >> $GITHUB_OUTPUT
      
      - name: Find scheduled PRs
        id: prs
        uses: actions/github-script@v7
        with:
          script: |
            const today = '${{ steps.date.outputs.today }}';
            const prs = await github.rest.pulls.list({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              base: 'main'
            });
            
            const scheduled = prs.data.filter(pr => {
              const publishLabel = pr.labels.find(l => l.name.startsWith('publish-date:'));
              if (!publishLabel) return false;
              const publishDate = publishLabel.name.split(':')[1].trim();
              return publishDate <= today;
            });
            
            return scheduled.map(pr => pr.number);
      
      - name: Auto-merge scheduled PRs
        if: steps.prs.outputs.result != '[]'
        uses: pascalgn/automerge-action@v0.15.6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Usage:**
```bash
# Create blog post
git checkout -b feature/blog/my-post
# ... edit files ...
git commit -m "feat(blog): add my awesome post"
git push

# Schedule for future publication
gh pr create --base main --label "publish-date: 2026-01-30" \
  --title "feat(blog): add my awesome post"

# Auto-publishes on Jan 30, 2026
```

**Pros:**
✅ Schedule posts in advance
✅ Great for content calendar
✅ Still automated validation

**Cons:**
❌ More complex setup
❌ Requires cron job monitoring

---

### Option 3: Separate Blog Branch (Hot Deploy)

**How it works:**
1. Maintain a `blog` branch that auto-deploys
2. Blog posts PR directly to `blog`
3. `blog` branch continuously deploys
4. Periodically sync `blog` → `main`

**Setup:**

Update `.github/workflows/deploy-website.yml`:

```yaml
name: Deploy Website

on:
  push:
    branches: [main, blog]  # Add blog branch
    paths:
      - 'website/**'
      - 'skills.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate blog (if blog branch)
        if: github.ref == 'refs/heads/blog'
        run: python3 scripts/create-blog.py validate
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: website
```

**Usage:**
```bash
# Create blog post
git checkout blog
git pull origin blog
git checkout -b feature/blog/my-post

# ... edit files ...
git commit -m "feat(blog): add my awesome post"
git push -u origin feature/blog/my-post

# PR to blog branch
gh pr create --base blog --title "feat(blog): add my awesome post"

# Merge and it deploys immediately
# Periodically: merge blog → main for history
```

**Pros:**
✅ Clean separation of blog vs code
✅ Very fast deployment
✅ Blog branch is always production-ready

**Cons:**
❌ Requires maintaining two branches
❌ Can diverge from main if not synced regularly

---

### Option 4: Headless CMS (Most User-Friendly)

**How it works:**
1. Use a headless CMS (Sanity, Contentful, TinaCMS)
2. Non-technical users edit in UI
3. CMS auto-commits to git
4. Webhook triggers deployment

**Popular Options:**

| CMS | Complexity | Cost | Best For |
|-----|-----------|------|----------|
| **TinaCMS** | Low | Free | Markdown + Git workflow |
| **Sanity** | Medium | Free tier | Structured content |
| **Contentful** | Medium | Free tier | Team collaboration |
| **Netlify CMS** | Low | Free | Simple markdown editing |

**Example with TinaCMS:**

1. Install TinaCMS:
```bash
npm install tinacms @tinacms/cli
```

2. Configure `.tina/config.ts`:
```typescript
import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "website",
  },
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "website/blog/posts",
        fields: [
          { type: "string", name: "title", label: "Title", required: true },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
          { type: "datetime", name: "date", label: "Date" },
        ],
      },
    ],
  },
});
```

3. Access UI at `/admin` to edit blog posts

**Pros:**
✅ Non-technical users can publish
✅ Visual editing experience
✅ Preview before publishing
✅ Still uses git for version control

**Cons:**
❌ Requires setup and configuration
❌ More moving parts
❌ Some services have usage limits

---

### Option 5: Direct Main Commits (Fastest, Least Safe)

**How it works:**
1. Give trusted authors write access to `main`
2. Push blog posts directly to `main`
3. Skip PR process entirely

**Setup:**

Create `.github/workflows/validate-on-push.yml`:
```yaml
name: Validate Blog on Push

on:
  push:
    branches: [main]
    paths:
      - 'website/blog/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate blog
        run: |
          python3 scripts/create-blog.py validate
          if [ $? -ne 0 ]; then
            echo "❌ Blog validation failed! Reverting..."
            git revert HEAD --no-edit
            git push
            exit 1
          fi
```

**Usage:**
```bash
# Just push directly
git checkout main
git pull
# ... edit blog post ...
git add website/blog/
git commit -m "feat(blog): add post"
git push origin main

# Live in 5 minutes
```

**Pros:**
✅ Fastest possible (5 minutes)
✅ Zero PR overhead
✅ Simple workflow

**Cons:**
❌ No review process
❌ Easy to break main branch
❌ Not recommended for teams

---

## Recommended Workflow

For OPC Skills, I recommend **Option 1 (Fast-Track with Auto-Merge)**:

### Complete Workflow

```bash
# 1. Create and write blog post
python3 scripts/create-blog.py new
# ... edit markdown file ...
# ... update blog.json ...

# 2. Validate locally
python3 scripts/create-blog.py validate
python3 scripts/create-blog.py check <slug>

# 3. Create PR directly to main
git checkout -b feature/blog/<slug>
git add website/blog/
git commit -m "feat(blog): add <topic> tutorial"
git push -u origin feature/blog/<slug>

# 4. Create PR with blog-post label
gh pr create --base main --label blog-post \
  --title "feat(blog): add <topic> tutorial" \
  --body "Auto-publish blog post. Validation will run automatically."

# 5. Wait ~1 minute for auto-merge
# 6. Live in ~6 minutes total!
```

### When to Use Each Option

| Scenario | Best Option |
|----------|-------------|
| Solo developer, need speed | Option 1 (Fast-Track) |
| Team with content calendar | Option 2 (Scheduled) |
| High blog post frequency | Option 3 (Blog Branch) |
| Non-technical authors | Option 4 (Headless CMS) |
| Complete trust, max speed | Option 5 (Direct Push) |

---

## Implementation Checklist

To implement Option 1 (Fast-Track):

- [x] Create `.github/workflows/publish-blog.yml`
- [ ] Enable GitHub Actions in repo settings
- [ ] Add required secrets (if using auto-merge action)
- [ ] Test with a draft blog post
- [ ] Update AGENTS.md with new workflow
- [ ] Train team on new process

---

## Comparison: Before vs After

### Before (Git Flow)
```
Day 1, 9am:  Create feature branch
Day 1, 10am: Write blog post
Day 1, 11am: PR to develop
Day 1, 2pm:  Review & merge to develop
Day 2, 9am:  PR develop → main
Day 2, 10am: Review & merge to main
Day 2, 10:05am: Deployed

Total: ~25 hours
```

### After (Fast-Track)
```
9:00am: Create feature branch
9:30am: Write blog post
10:00am: PR to main with blog-post label
10:01am: Auto-validated & auto-merged
10:06am: Deployed

Total: ~1 hour (6 min automated)
```

---

## Questions?

- Check workflows: `.github/workflows/`
- Review validation: `python3 scripts/create-blog.py validate`
- Test locally: `python3 scripts/create-blog.py check <slug>`
- Ask on GitHub: https://github.com/ReScienceLab/opc-skills/issues
