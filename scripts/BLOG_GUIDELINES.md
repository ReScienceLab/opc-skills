# Blog Post Guidelines & Best Practices

This document outlines the best practices for creating high-quality blog posts for OPC Skills.

## Quick Start

```bash
# Validate all blog posts
python3 scripts/create-blog.py validate

# Check specific post
python3 scripts/create-blog.py check ralph-autonomous-agent-loop

# Create new blog post template
python3 scripts/create-blog.py new
```

## Blog Creation Workflow

### 1. Create Content First

**Option A: Manual Creation**
1. Write content in any editor (Google Docs, Notion, etc.)
2. Convert to markdown
3. Add to `website/blog/posts/<slug>.md`

**Option B: Use Template Generator**
```bash
python3 scripts/create-blog.py new
```

### 2. Add Metadata to blog.json

Add entry at position 0 (newest first) in `website/blog/blog.json`:

```json
{
  "slug": "your-post-slug",
  "title": "Your Post Title",
  "description": "1-2 sentence summary with key metrics",
  "date": "2026-01-26",
  "dateModified": "2026-01-26",
  "author": "OPC Team",
  "category": "Tutorial",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": "9 min",
  "keywords": ["keyword1", "keyword2", ...],
  "image": "https://opc.dev/opc-banner.png",
  "schema": { ... },
  "faq": [ ... ],
  "citations": [ ... ]
}
```

### 3. Validate

```bash
# Validate metadata
python3 scripts/create-blog.py validate

# Check content quality
python3 scripts/create-blog.py check your-post-slug
```

### 4. Create PR

```bash
git checkout -b feature/blog/your-post-slug
git add website/blog/posts/your-post-slug.md website/blog/blog.json
git commit -m "feat(blog): add [topic] tutorial/case study"
git push -u origin feature/blog/your-post-slug
gh pr create --base develop --head feature/blog/your-post-slug
```

## Content Quality Standards

### Word Count
- **Minimum**: 2,000 words
- **Recommended**: 2,500-4,000 words
- **Tutorial/Guide**: 3,000+ words
- **Case Study**: 2,000-2,500 words

### Structure Requirements

✅ **Must Have**:
- 1 H1 heading (title only)
- 8-12 H2 sections
- TL;DR section (100-150 words)
- FAQ section with 5-10 questions
- Further Reading section with internal links

✅ **Should Have**:
- Tables for comparisons
- Code blocks with syntax highlighting
- Real examples and metrics
- Step-by-step workflows
- Visual hierarchy (H2, H3, H4)

### SEO/GEO Optimization

#### Keywords (15+ required)
- 3-5 primary keywords (high search volume)
- 10-15 long-tail keywords (specific phrases)
- Include in: title, description, H2 headings, first 200 words

Example:
```json
"keywords": [
  "build MVP automatically",
  "solopreneur MVP builder", 
  "Ralph AI tutorial",
  "autonomous AI agent loop",
  "PRD to code automatically",
  ...
]
```

#### FAQ Section (5-10 questions)
- Answer common search queries
- Optimize for voice search ("How do I...", "What is...")
- 50-150 word answers
- Include keywords naturally

#### Internal Links (3-5 minimum)
- Link to related OPC blog posts
- Link to skill pages
- Use descriptive anchor text

#### External Citations (3-6 minimum)
- Link to authoritative sources
- Include GitHub repos, official docs
- Add to both markdown content AND citations array

### Schema.org Markup

Required schema types:
- `BlogPosting` (main content)
- FAQs embedded in BlogPosting

```json
"schema": {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post title",
  "description": "Post description",
  "author": { "@type": "Organization", "name": "OPC Team", "url": "https://opc.dev" },
  "datePublished": "2026-01-26",
  "dateModified": "2026-01-26",
  "publisher": { ... },
  "image": "https://opc.dev/opc-banner.png",
  "mainEntityOfPage": "https://opc.dev/blog/slug",
  "keywords": "comma, separated, keywords",
  "articleSection": "Category",
  "wordCount": 2900
}
```

## Content Templates

### Tutorial Post Template

```markdown
# How to [Do Something]: [Benefit/Outcome]

*By OPC Team | Date | X min read*

## TL;DR

[100-150 word summary with key metrics]

---

## The Problem: [Pain Point]

[Context and why this matters - 250 words]

---

## What is [Tool/Concept]?

[Explanation - 300 words]

---

## How It Works: Step-by-Step

[Detailed explanation with diagrams/code - 400 words]

---

## Real Example: [Case Study]

[Concrete example with metrics - 400 words]

---

## Getting Started

[Step-by-step tutorial - 300 words]

---

## Comparison Table

| Feature | Traditional | Our Approach |
|---------|------------|--------------|
| ...     | ...        | ...          |

---

## Common Issues & Debugging

[Troubleshooting guide - 200 words]

---

## Further Reading

- [Link to related post 1](/blog/post-1)
- [Link to related post 2](/blog/post-2)

---

## Frequently Asked Questions

### How do I [question]?

[Answer - 50-100 words]

### What is [question]?

[Answer - 50-100 words]

[5-10 total questions]

---

*Questions? [GitHub](https://github.com/ReScienceLab/opc-skills/issues)*
```

### Case Study Template

```markdown
# How [Tool] Saved Me $X on [Task]

*By OPC Team | Date | X min read*

## TL;DR

[Summary with specific metrics]

---

## The Challenge

[Problem description]

---

## The Solution

[What we used]

---

## Step-by-Step Workflow

[Actual steps taken]

---

## Results

- Metric 1
- Metric 2
- Metric 3

---

## Key Learnings

[Insights gained]

---

## Try It Yourself

[How readers can replicate]

---

## Further Reading

[Links]

---

## FAQ

[Questions]
```

## Common Mistakes to Avoid

❌ **Don't**:
- Write less than 2,000 words (poor SEO)
- Skip the FAQ section (missing GEO opportunity)
- Use generic keywords (low search intent)
- Forget internal links (lost SEO juice)
- Miss schema.org markup (no rich results)
- Use vague metrics ("saves time" vs "saves 50%")
- Skip validation before PR

✅ **Do**:
- Include real numbers and metrics
- Write actionable content
- Add comparison tables
- Include code examples
- Link to 3-5 related posts
- Optimize for AI search engines (Perplexity, ChatGPT)
- Run validation script

## Validation Checklist

Before creating PR, verify:

- [ ] `python3 scripts/create-blog.py validate` passes
- [ ] `python3 scripts/create-blog.py check <slug>` shows no errors
- [ ] Word count > 2,000
- [ ] 5-10 FAQ questions
- [ ] 10+ keywords
- [ ] 3+ internal links
- [ ] 3+ external citations
- [ ] Schema.org markup complete
- [ ] Tables for comparisons
- [ ] Code blocks formatted
- [ ] Reading time estimate accurate

## Automation Available

### Current Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `create-blog.py validate` | Validate all posts | `python3 scripts/create-blog.py validate` |
| `create-blog.py check` | Check specific post | `python3 scripts/create-blog.py check <slug>` |
| `create-blog.py new` | Generate template | `python3 scripts/create-blog.py new` |

### Recommended Additions

**Future improvements** (contributions welcome):

1. **Pre-commit hook** - Auto-validate on commit
2. **GitHub Action** - Validate on PR
3. **Link checker** - Find broken links
4. **Image optimizer** - Compress images
5. **Preview generator** - Create OG images
6. **SEO scorer** - Rate SEO quality
7. **Readability checker** - Flesch-Kincaid score

## Questions?

- Check existing posts: `website/blog/posts/`
- Review blog.json: `website/blog/blog.json`
- Ask on GitHub: https://github.com/ReScienceLab/opc-skills/issues
