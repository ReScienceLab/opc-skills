#!/usr/bin/env python3
"""
Blog creation and validation script for OPC Skills.

Usage:
  python3 scripts/create-blog.py validate           # Validate existing blogs
  python3 scripts/create-blog.py new                # Create new blog interactively
  python3 scripts/create-blog.py check <slug>       # Check specific blog post
"""

import json
import os
import sys
import re
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
BLOG_DIR = PROJECT_ROOT / "website" / "blog"
BLOG_JSON = BLOG_DIR / "blog.json"
POSTS_DIR = BLOG_DIR / "posts"

REQUIRED_FIELDS = [
    "slug", "title", "description", "date", "dateModified", "author",
    "category", "tags", "readTime", "keywords", "image", "schema",
    "faq", "citations"
]

def validate_blog_json():
    """Validate blog.json structure and required fields."""
    print("🔍 Validating blog.json...")
    
    try:
        with open(BLOG_JSON, 'r') as f:
            blog = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ blog.json is invalid JSON: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ blog.json not found at {BLOG_JSON}")
        return False
    
    print(f"✓ blog.json is valid JSON")
    print(f"✓ Total posts: {len(blog.get('posts', []))}")
    
    errors = []
    warnings = []
    
    for i, post in enumerate(blog.get('posts', [])):
        slug = post.get('slug', f'post-{i}')
        
        # Check required fields
        missing = [f for f in REQUIRED_FIELDS if f not in post]
        if missing:
            errors.append(f"Post '{slug}' missing fields: {', '.join(missing)}")
        
        # Check if markdown file exists
        md_file = POSTS_DIR / f"{slug}.md"
        if not md_file.exists():
            errors.append(f"Post '{slug}' has no markdown file at {md_file}")
        
        # Check FAQ count (should have 5-10 for GEO)
        faq_count = len(post.get('faq', []))
        if faq_count < 5:
            warnings.append(f"Post '{slug}' has only {faq_count} FAQs (recommend 5-10 for GEO)")
        
        # Check keywords (should have 10+ for SEO)
        keyword_count = len(post.get('keywords', []))
        if keyword_count < 10:
            warnings.append(f"Post '{slug}' has only {keyword_count} keywords (recommend 10+ for SEO)")
        
        # Check citations (should have 3+ for authority)
        citation_count = len(post.get('citations', []))
        if citation_count < 3:
            warnings.append(f"Post '{slug}' has only {citation_count} citations (recommend 3+ for authority)")
        
        # Validate date format
        try:
            datetime.strptime(post.get('date', ''), '%Y-%m-%d')
        except ValueError:
            errors.append(f"Post '{slug}' has invalid date format: {post.get('date')}")
        
        # Check schema.org structure
        schema = post.get('schema', {})
        if '@context' not in schema or '@type' not in schema:
            errors.append(f"Post '{slug}' missing required schema.org fields")
        
        print(f"  {'✓' if not missing else '⚠'} Post: {slug}")
    
    # Print warnings
    if warnings:
        print(f"\n⚠️  {len(warnings)} warnings:")
        for w in warnings:
            print(f"  - {w}")
    
    # Print errors
    if errors:
        print(f"\n❌ {len(errors)} errors:")
        for e in errors:
            print(f"  - {e}")
        return False
    
    print(f"\n✅ All blog posts validated successfully!")
    return True

def check_markdown_post(slug):
    """Validate a specific markdown blog post."""
    md_file = POSTS_DIR / f"{slug}.md"
    
    if not md_file.exists():
        print(f"❌ Blog post not found: {md_file}")
        return False
    
    print(f"🔍 Checking {md_file.name}...")
    
    with open(md_file, 'r') as f:
        content = f.read()
    
    warnings = []
    
    # Check word count
    word_count = len(content.split())
    print(f"  ✓ Word count: {word_count}")
    if word_count < 2000:
        warnings.append(f"Post is only {word_count} words (recommend 2500+ for SEO)")
    
    # Check heading structure
    h1_count = len(re.findall(r'^# [^#]', content, re.MULTILINE))
    h2_count = len(re.findall(r'^## [^#]', content, re.MULTILINE))
    print(f"  ✓ H1 headings: {h1_count}")
    print(f"  ✓ H2 headings: {h2_count}")
    
    if h1_count == 0:
        warnings.append("No H1 heading found (should have exactly 1)")
    elif h1_count > 1:
        warnings.append(f"Multiple H1 headings found ({h1_count}, should have exactly 1)")
    
    if h2_count < 5:
        warnings.append(f"Only {h2_count} H2 sections (recommend 8-12 for structure)")
    
    # Check for tables
    table_count = len(re.findall(r'^\|.*\|.*\|', content, re.MULTILINE))
    print(f"  ✓ Tables: {table_count} rows")
    
    # Check for code blocks
    code_block_count = len(re.findall(r'^```', content, re.MULTILINE))
    print(f"  ✓ Code blocks: {code_block_count // 2}")
    
    # Check for internal links
    internal_links = re.findall(r'\]\(/blog/[^\)]+\)', content)
    print(f"  ✓ Internal links: {len(internal_links)}")
    if len(internal_links) < 3:
        warnings.append(f"Only {len(internal_links)} internal links (recommend 3-5 for SEO)")
    
    # Check for external links
    external_links = re.findall(r'\]\(https?://[^\)]+\)', content)
    print(f"  ✓ External links: {len(external_links)}")
    
    # Check for FAQ section
    has_faq = '## Frequently Asked Questions' in content or '## FAQ' in content
    print(f"  {'✓' if has_faq else '⚠'} FAQ section: {'present' if has_faq else 'missing'}")
    if not has_faq:
        warnings.append("No FAQ section found (required for GEO)")
    
    # Print warnings
    if warnings:
        print(f"\n⚠️  {len(warnings)} warnings:")
        for w in warnings:
            print(f"  - {w}")
    else:
        print(f"\n✅ Blog post passed all checks!")
    
    return True

def create_new_blog():
    """Interactive blog post creation wizard."""
    print("📝 Create New Blog Post\n")
    
    # Get basic info
    title = input("Title: ")
    slug = input("Slug (kebab-case): ")
    category = input("Category (Tutorial/Case Study/Insights/Getting Started): ")
    
    # Create markdown file
    md_file = POSTS_DIR / f"{slug}.md"
    if md_file.exists():
        print(f"❌ Blog post already exists: {md_file}")
        return False
    
    # Create template
    today = datetime.now().strftime('%Y-%m-%d')
    template = f"""# {title}

*By OPC Team | {datetime.now().strftime('%B %d, %Y')} | X min read*

## TL;DR

[Write a 100-150 word summary here]

---

## Section 1

[Content here]

---

## Frequently Asked Questions

### Question 1?

Answer here.

### Question 2?

Answer here.

---

*Questions about [topic]? Open an issue on [GitHub](https://github.com/ReScienceLab/opc-skills/issues).*
"""
    
    with open(md_file, 'w') as f:
        f.write(template)
    
    print(f"\n✅ Created template: {md_file}")
    print(f"\nNext steps:")
    print(f"  1. Edit the markdown file: {md_file}")
    print(f"  2. Add metadata to blog.json")
    print(f"  3. Validate: python3 scripts/create-blog.py check {slug}")
    print(f"  4. Create PR: git checkout -b feature/blog/{slug}")
    
    return True

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "validate":
        success = validate_blog_json()
        sys.exit(0 if success else 1)
    
    elif command == "check":
        if len(sys.argv) < 3:
            print("Usage: python3 scripts/create-blog.py check <slug>")
            sys.exit(1)
        slug = sys.argv[2]
        success = check_markdown_post(slug)
        sys.exit(0 if success else 1)
    
    elif command == "new":
        success = create_new_blog()
        sys.exit(0 if success else 1)
    
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
