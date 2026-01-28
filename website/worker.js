import { marked } from 'marked';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/sitemap.xml') {
      const config = await fetchSkillsConfig(ctx);
      const skills = config.skills || [];
      const blogConfig = await fetchBlogConfig(ctx);
      const posts = blogConfig.posts || [];
      const today = new Date().toISOString().split('T')[0];
      
      const skillUrls = skills.map(s => `
  <url>
    <loc>https://opc.dev/skills/${s.name}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
      
      const blogUrls = posts.map(post => `
  <url>
    <loc>https://opc.dev/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://opc.dev/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://opc.dev/compare</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://opc.dev/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://opc.dev/skills.json</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>${skillUrls}${blogUrls}
</urlset>`;
      return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
    }
    
    if (url.pathname === '/robots.txt') {
      return new Response(`# OPC Skills - AI Agent Skills
# We explicitly allow AI bots for GEO (Generative Engine Optimization)
# Content-Signal: search=yes, ai-input=yes, ai-train=no

User-agent: *
Allow: /

# AI Search Engines - Explicitly Allowed for GEO
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

# Bad Bots - Blocked
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

Sitemap: https://opc.dev/sitemap.xml`, { 
        headers: { 
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'all',
          'Cache-Control': 'public, max-age=86400'
        } 
      });
    }

    // llms.txt - AI-optimized plain text summary for LLMs
    if (url.pathname === '/llms.txt') {
      const today = new Date().toISOString().split('T')[0];
      return new Response(`# OPC Skills - AI Agent Skills for Solopreneurs

## Overview
9 specialized AI agent skills for one-person companies.
Supports: Claude Code, Cursor, Factory Droid, OpenCode, Codex

## Installation
npx skills add ReScienceLab/opc-skills

## Skills
1. requesthunt - User demand research from Reddit, Twitter/X, and GitHub
2. domain-hunter - Domain search and registrar price comparison with promo codes
3. logo-creator - AI logo generation with crop, background removal, and SVG export
4. banner-creator - Social media banner creation (GitHub, Twitter, LinkedIn)
5. nanobanana - Google Gemini 3 Pro image generation (2K/4K support)
6. reddit - Reddit content search via public JSON API (no auth required)
7. twitter - Twitter/X search via twitterapi.io
8. producthunt - Product Hunt posts, topics, and collections search
9. seo-geo - SEO & GEO optimization for AI search engines (ChatGPT, Perplexity, Claude)

## Statistics
- 9 skills total
- 5 platforms supported (Claude Code, Cursor, Factory Droid, OpenCode, Codex)
- Installation time: < 30 seconds
- License: MIT (100% free and open source)
- FAQ entries: 14+
- Last updated: ${today}

## Documentation
Main site: https://opc.dev
GitHub: https://github.com/ReScienceLab/opc-skills
Skills.sh: https://skills.sh/ReScienceLab/opc-skills
Agent Skills Standard: https://agentskills.io

## Key Features
- One-command installation
- Cross-platform compatibility
- No API keys required for most skills
- Active maintenance and updates
- Community-driven development`, {
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // Serve skill images from GitHub
    const imgMatch = url.pathname.match(/^\/skills\/([a-z-]+)\/examples\/images\/(.+)$/);
    if (imgMatch) {
      const [, skillName, fileName] = imgMatch;
      const contentType = fileName.endsWith('.svg') ? 'image/svg+xml' :
                          fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const imgUrl = `https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/skills/${skillName}/examples/images/${fileName}`;
      try {
        const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'OPC-Skills-Website' } });
        if (imgRes.ok) {
          return new Response(imgRes.body, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' } });
        }
      } catch (e) {}
      return new Response('Image not found', { status: 404 });
    }

    // Serve install.sh - proxy from GitHub raw
    if (url.pathname === '/install.sh') {
      const installScript = await fetch('https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh');
      return new Response(installScript.body, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Serve skills.json directly
    if (url.pathname === '/skills.json') {
      const skills = await fetchSkillsConfig(ctx);
      return new Response(JSON.stringify(skills, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Comparison page - AI loves comparison tables (+25% citation rate)
    if (url.pathname === '/compare') {
      return renderComparePage(ctx);
    }

    // Blog list page
    if (url.pathname === '/blog') {
      return renderBlogListPage(ctx);
    }

    // Individual blog post
    const blogMatch = url.pathname.match(/^\/blog\/([a-z0-9-]+)$/);
    if (blogMatch) {
      return renderBlogPost(blogMatch[1], ctx);
    }

    // Serve individual skill pages
    const skillMatch = url.pathname.match(/^\/skills\/([a-z-]+)$/);
    if (skillMatch) {
      return renderSkillPage(skillMatch[1], ctx);
    }

    // Fetch skills from config and install stats
    const [config, installStats] = await Promise.all([
      fetchSkillsConfig(ctx),
      fetchInstallStats(ctx)
    ]);
    const skills = config.skills || [];

    // Generate JSON-LD structured data for skills (GEO-optimized)
    const today = new Date().toISOString().split('T')[0];
    const skillsJsonLd = skills.map(s => ({
      "@type": "SoftwareApplication",
      "name": s.name,
      "description": s.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cross-platform",
      "softwareVersion": s.version,
      "datePublished": "2024-01-01",
      "dateModified": today,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "url": `https://opc.dev/skills/${s.name}`
    }));

    // GEO: Generate FAQPage schema for AI citation optimization (+40% visibility)
    const faqItems = skills.slice(0, 5).map(s => ({
      "@type": "Question",
      "name": `What is ${s.name}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${s.name} is an agent skill for AI coding assistants. ${s.description} Install it with: curl -fsSL opc.dev/install.sh | bash -s -- -t claude ${s.name}`
      }
    }));
    faqItems.push({
      "@type": "Question",
      "name": "What is OPC Skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `OPC Skills is a curated collection of ${skills.length} AI agent skills for solopreneurs, indie hackers, and one-person companies. According to the Agent Skills standard (agentskills.io), these modular extensions work with 5 major AI coding platforms: Claude Code, Factory Droid, Cursor, OpenCode, and Codex. Each skill adds specialized capabilities like domain hunting, social media research, and product analytics. 100% free and open source under MIT license with installation taking less than 30 seconds.`
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How do I install OPC Skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Run this command in your terminal: npx skills add ReScienceLab/opc-skills. For a specific skill, use npx skills add ReScienceLab/opc-skills --skill reddit. Works with Claude Code, Cursor, Windsurf, Droid, and 12+ other AI tools."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "What are AI agent skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI agent skills are modular capabilities that extend AI coding assistants like Claude Code, Cursor, and Codex. According to agentskills.io, skills are self-contained folders with instructions (SKILL.md) that enable AI agents to perform specialized tasks such as searching domains, researching social media, and analyzing product launches. Skills typically take less than 30 seconds to install via one-line commands and work across 5+ major AI coding platforms."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How to extend Claude Code with custom skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can extend Claude Code with custom skills by installing OPC Skills using: npx skills add ReScienceLab/opc-skills. Skills are stored in ~/.claude/skills/ for user-level or .claude/skills/ for project-level. Each skill is a markdown file with instructions that Claude Code can follow."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "What platforms are supported by OPC Skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `OPC Skills supports 5 major AI coding platforms: Claude Code (by Anthropic), Factory Droid, Cursor, OpenCode, and Codex (by OpenAI). All ${skills.length} skills can be installed with a single one-line command for any of these platforms, with installation completing in less than 30 seconds. Skills follow the Agent Skills standard (agentskills.io) for cross-platform compatibility.`
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "What are Claude Code skills for solopreneurs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Claude Code skills for solopreneurs are AI extensions that help one-person companies work smarter. They add capabilities like domain search, Twitter analysis, and Reddit research to Claude Code. Each skill is built specifically for indie hackers who need to do more with less time and resources."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How do I install Claude Code extensions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the one-command install: npx skills add ReScienceLab/opc-skills. This works for Claude Code and 12+ other AI coding assistants. Browse available skills at https://skills.sh/ReScienceLab/opc-skills."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Are these skills compatible with Cursor AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! OPC Skills work with Claude Code, Cursor, Codex, Windsurf, Droid, and 12+ other AI coding assistants. Just run npx skills add ReScienceLab/opc-skills and the CLI will automatically detect your installed tools."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Is OPC Skills free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OPC Skills is 100% free and open source under the MIT license. Some individual skills may require API keys for third-party services (like Twitter API or Reddit API), but the skills themselves are free to install and use."
      }
    });
    
    // Installation FAQs
    faqItems.push({
      "@type": "Question",
      "name": "How do I install only specific skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the --skill flag to install specific skills: npx skills add ReScienceLab/opc-skills --skill reddit --skill twitter. You can chain multiple --skill flags to install only the skills you need."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Do I need API keys for all skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Only 3 of 9 skills require API keys: requesthunt (requires API key), twitter (requires twitterapi.io key), producthunt (requires PH token), and logo-creator (requires Gemini API). Skills like reddit, domain-hunter, banner-creator, and nanobanana work without any authentication."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I install skills globally vs per-project?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Use npx skills add with the -a flag for user-level install (e.g., -a droid) or without flags for project-level install in .claude/skills/ or .droid/skills/. Global skills are accessible across all projects."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How do I update installed skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Run the same install command again: npx skills add ReScienceLab/opc-skills. The CLI will automatically update existing skills to the latest version. Check the GitHub repository for changelog and version updates."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I uninstall individual skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Navigate to ~/.claude/skills/ (user-level) or .claude/skills/ (project-level) and delete the specific skill folder. Or use npx skills remove command if supported by your AI tool."
      }
    });
    
    // Comparison FAQs
    faqItems.push({
      "@type": "Question",
      "name": "How does OPC Skills compare to manual research?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OPC Skills automates tasks that typically take hours. For example, domain-hunter reduces domain research from 2+ hours to 10 minutes. requesthunt analyzes 100+ Reddit/Twitter posts in seconds versus hours of manual browsing. According to user feedback, skills save 3-5 hours per week on average."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "What makes OPC Skills different from other collections?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OPC Skills is specifically designed for solopreneurs and one-person companies. Unlike general-purpose tools, every skill addresses common solopreneur pain points: domain hunting, social research, logo creation, and SEO. It supports 5 platforms (most alternatives support 1-2) and installs in under 30 seconds."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can OPC Skills replace paid tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For many use cases, yes. OPC Skills provides free alternatives to tools costing $50-200/month (domain research, social monitoring, SEO audit). However, paid tools may offer more advanced features like historical data, deeper analytics, or priority support. OPC Skills excels at everyday automation tasks."
      }
    });
    
    // Technical FAQs
    faqItems.push({
      "@type": "Question",
      "name": "What programming languages are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Skills are language-agnostic and work with any programming language. Most scripts are written in Python 3.12+ for portability. Skills integrate with AI coding assistants (Claude Code, Cursor, Codex) which support all major languages: JavaScript, Python, Go, Rust, TypeScript, etc."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I create custom skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Follow the Agent Skills standard (agentskills.io). Create a folder with SKILL.md containing YAML frontmatter (name, description) and instructions. See the template/ directory in the GitHub repo for examples. Custom skills can be installed locally or published to skills.sh."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Are skills compatible with all operating systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Skills work on macOS, Linux, and Windows. Requirements: Python 3.12+ and npm/npx. Some skills may have platform-specific notes (e.g., Windows users may need WSL for certain bash scripts)."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I contribute to existing skills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Visit https://github.com/ReScienceLab/opc-skills, fork the repo, make your improvements, and submit a pull request. Popular contributions include: adding new data sources, improving error handling, and expanding documentation."
      }
    });
    
    // Use Case FAQs
    faqItems.push({
      "@type": "Question",
      "name": "How can I use requesthunt for product validation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "requesthunt scrapes feature requests from Reddit, Twitter/X, and GitHub to validate product ideas. Run 'python3 scripts/scrape_topic.py your-idea' to find real user pain points. Analyze the data to identify demand, pricing expectations, and competitor gaps before building."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "What are real use cases for domain-hunter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "domain-hunter helps find available domains and compare registrar prices. Use cases: (1) Find cheap .ai domains with promo codes, (2) Compare GoDaddy vs Namecheap pricing, (3) Check domain availability across 10+ TLDs instantly, (4) Find expired domains for acquisition."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I use logo-creator for client work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! OPC Skills has MIT license allowing commercial use. logo-creator generates AI logos, removes backgrounds, and exports to SVG. You can use it for client projects. Note: Underlying AI (Gemini) has its own terms - review Google's Gemini API terms for commercial usage."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How does seo-geo help with AI visibility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "seo-geo implements Princeton's 9 GEO methods proven to increase AI search visibility by 40-70%. It audits your site, generates schema markup (FAQPage, ItemList), optimizes meta tags, and ensures AI bots (ChatGPT, Claude, Perplexity) can access your content. Includes citation tracking and keyword research.",
        "citation": [
          {
            "@type": "Citation",
            "url": "https://arxiv.org/abs/2311.03735",
            "name": "Princeton NLP: GEO Optimization Methods",
            "datePublished": "2023-11-07"
          },
          {
            "@type": "Citation",
            "url": "https://agentskills.io",
            "name": "Agent Skills Standard",
            "datePublished": "2024-01-01"
          }
        ]
      }
    });
    
    // Platform FAQs
    faqItems.push({
      "@type": "Question",
      "name": "Is OPC Skills suitable for teams?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, while designed for solopreneurs, OPC Skills works great for small teams (2-10 people). Install at project level so all team members can use the same skills. Multiple developers can share API keys via environment variables."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Can I use skills for commercial projects?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! MIT license permits commercial use. You can use OPC Skills for client work, SaaS products, and revenue-generating projects without restrictions. Some skills use third-party APIs that may have their own commercial terms (check provider ToS)."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "How often are skills updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Skills are actively maintained with updates every 1-2 weeks. Major platform updates (Claude Code, Cursor releases) trigger compatibility updates within 48 hours. Follow GitHub releases or star the repo to get notifications of new features and bug fixes."
      }
    });
    faqItems.push({
      "@type": "Question",
      "name": "Does installation work offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Initial installation requires internet to download from GitHub. After installation, most skills work offline except those requiring API calls (twitter, requesthunt, producthunt). Skills like reddit (public JSON), domain-hunter (whois), and logo-creator (local) have offline capabilities."
      }
    });

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "https://opc.dev/#webpage",
          "url": "https://opc.dev",
          "name": "Claude Code Skills for Solopreneurs | AI Tools for One-Person Companies",
          "description": `10+ Claude Code skills for solopreneurs and indie hackers. Add Twitter search, Reddit analysis, domain finder, and SEO tools. Built for one-person companies. One-click install. 100% open source.`,
          "datePublished": "2024-01-01",
          "dateModified": today,
          "inLanguage": "en-US",
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".skill-desc", ".stats-bar", ".compatibility-note"]
          },
          "mainEntity": { "@id": "https://opc.dev/#skillcollection" }
        },
        {
          "@type": "WebSite",
          "@id": "https://opc.dev/#website",
          "name": "OPC Skills",
          "url": "https://opc.dev",
          "description": `${skills.length}+ curated AI agent skills for solopreneurs and indie hackers. Supercharge Claude Code, Cursor, and Codex with domain hunting, social media research, and more.`,
          "publisher": { "@id": "https://opc.dev/#organization" }
        },
        {
          "@type": "Organization",
          "@id": "https://opc.dev/#organization",
          "name": "ReScience Lab",
          "url": "https://rescience.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-logo.svg"
          },
          "sameAs": [
            "https://github.com/ReScienceLab"
          ]
        },
        {
          "@type": "ItemList",
          "@id": "https://opc.dev/#skillcollection",
          "name": "OPC Skills Collection",
          "description": `${skills.length} agent skills for one person companies, supporting 5 platforms: Claude Code, Factory Droid, Cursor, OpenCode, and Codex.`,
          "numberOfItems": skills.length,
          "itemListElement": skillsJsonLd.map((skill, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": skill
          }))
        },
        {
          "@type": "FAQPage",
          "@id": "https://opc.dev/#faq",
          "mainEntity": faqItems
        },
        {
          "@type": "HowTo",
          "@id": "https://opc.dev/#installation",
          "name": "How to Install OPC Skills",
          "description": "Quick one-command installation for AI agent skills compatible with Claude Code, Cursor, Droid, and 12+ other AI tools",
          "totalTime": "PT30S",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Run installation command",
              "text": "Open your terminal and run: npx skills add ReScienceLab/opc-skills",
              "itemListElement": {
                "@type": "HowToDirection",
                "text": "npx skills add ReScienceLab/opc-skills"
              }
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Wait for installation",
              "text": "The CLI will automatically detect your installed AI tools (Claude, Cursor, Droid, etc.) and install skills in under 30 seconds"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Start using skills",
              "text": "Skills are now available in your AI coding assistant. Reference them in your conversations to trigger specialized capabilities"
            }
          ]
        }
      ]
    };

    // Helper to get dependency names from object or array
    const getDeps = (deps) => {
      if (!deps) return [];
      if (Array.isArray(deps)) return deps;
      return Object.keys(deps);
    };

    // Helper to convert URLs in text to clickable links
    // Helper to collect all API keys including from dependencies
    const getAllKeys = (skill, allSkills) => {
      const keys = [...(skill.auth?.keys || [])];
      const deps = getDeps(skill.dependencies);
      for (const depName of deps) {
        const depSkill = allSkills.find(s => s.name === depName);
        if (depSkill?.auth?.keys) {
          for (const k of depSkill.auth.keys) {
            if (!keys.some(existing => existing.env === k.env)) {
              keys.push({ ...k, from: depName });
            }
          }
        }
      }
      return keys;
    };

    // Helper to check if skill requires any API key (self or deps)
    const requiresApiKey = (skill, allSkills) => {
      const allKeys = getAllKeys(skill, allSkills);
      return allKeys.some(k => !k.optional);
    };

    // Generate skill cards with simplified npx install command
    const skillCards = skills.map(s => {
      const installs = installStats.skills?.[s.name] || 0;
      const deps = getDeps(s.dependencies);
      const allKeys = getAllKeys(s, skills);
      const needsKey = requiresApiKey(s, skills);
      return `
        <div class="skill-card" id="skill-${s.name}">
          <div class="skill-header">
            <div class="skill-icon">
              <img src="${s.logo || `https://cdn.simpleicons.org/${s.icon}/${s.color}`}" alt="${s.name} skill icon" loading="lazy" decoding="async" width="28" height="28" onerror="this.src='https://cdn.simpleicons.org/${s.icon}/${s.color}'">
            </div>
            <div class="skill-title">
              <h3><a href="/skills/${s.name}" style="color:inherit;text-decoration:none;">${s.name}</a></h3>
              <span class="version">v${s.version}</span>${installs > 0 ? ` <span class="install-count">${installs} installs</span>` : ''}
            </div>
            ${needsKey ? `<span class="auth-tag paid">API Key</span>` : `<span class="auth-tag free">Free</span>`}
            ${s.links.example ? `<a href="${s.links.example}" target="_blank" rel="noopener noreferrer" class="example-link" title="View Example">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </a>` : ''}
            <a href="${s.links.github}" target="_blank" rel="noopener noreferrer" class="github-link" title="View on GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
          <p class="skill-desc">${s.description}</p>
          ${allKeys.length > 0 ? `<div class="skill-auth-info"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> ${allKeys.map(k => `<code>${k.env}</code> <a href="${k.url}" target="_blank" rel="noopener noreferrer">${k.url.replace('https://', '')}</a>${k.from ? ` <span class="from-dep">(${k.from})</span>` : ''}${k.optional ? ' <span class="optional">(optional)</span>' : ''}`).join('<br>')}</div>` : ''}
          ${deps.length > 0 ? `<div class="skill-deps"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg> Depends on: ${deps.map(d => `<span class="dep-tag">${d}</span>`).join('')}</div>` : ''}
          <div class="skill-triggers">${s.triggers.map(t => `<span class="trigger">${t}</span>`).join('')}</div>
          <div class="install-section">
            <div class="install-cmd">
              <code class="cmd-display">npx skills add ReScienceLab/opc-skills --skill ${deps.length > 0 ? deps.concat(s.name).join(' --skill ') : s.name}</code>
              <button class="copy-btn" onclick="navigator.clipboard.writeText('npx skills add ReScienceLab/opc-skills --skill ${deps.length > 0 ? deps.concat(s.name).join(' --skill ') : s.name}').then(() => { this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 1000); })">Copy</button>
            </div>
          </div>
          <details class="commands-section">
            <summary>Example Commands</summary>
            <div class="commands-list">
              ${s.commands.map(cmd => `<code>${cmd}</code>`).join('')}
            </div>
          </details>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Agent Skills for Solopreneurs | Claude Code & Cursor</title>
  <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/apple-touch-icon.png">
  <meta name="description" content="9 AI agent skills for solopreneurs. Add Twitter search, Reddit analysis, domain finder & SEO tools to Claude/Cursor. One-click install. 100% free & open source.">
  <meta name="keywords" content="AI agent skills, solopreneur tools, indie hacker tools, Claude Code skills, Cursor skills, Codex skills, one-person company, solo developer, AI coding assistant, AI automation, vibe coding, agent skills, claude skills, Factory Droid, OpenCode, developer tools, AI agents">
  <meta name="robots" content="index, follow">
  <meta name="author" content="ReScience Lab">
  <meta name="theme-color" content="#000000">
  <meta http-equiv="Content-Language" content="en">
  <link rel="canonical" href="https://opc.dev/">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta property="og:title" content="Claude Code Skills for Solopreneurs | AI Tools">
  <meta property="og:description" content="10+ Claude Code skills for solopreneurs and indie hackers. Twitter search, Reddit analysis, domain finder. Built for one-person companies. 100% open source.">
  <meta property="og:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
  <meta property="og:url" content="https://opc.dev/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPC Skills">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Claude Code Skills for Solopreneurs | AI Tools">
  <meta name="twitter:description" content="10+ Claude Code skills for solopreneurs & indie hackers. Twitter search, Reddit analysis, domain finder. One-click install.">
  <meta name="twitter:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
  <meta name="twitter:creator" content="@AnyLabxyz">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --font: 'JetBrains Mono', monospace;
      --font-pixel: 'Press Start 2P', cursive;
      --black: #000;
      --white: #fff;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --green: #22c55e;
    }
    body { font-family: var(--font); background: var(--white); color: var(--black); line-height: 1.5; }
    
    header { position: sticky; top: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--black); z-index: 100; }
    .header-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--black); }
    .logo-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .logo-icon img { width: 32px; height: 32px; object-fit: contain; }
    .logo-text { font-family: var(--font-pixel); font-size: 10px; font-weight: 400; }
    nav { display: flex; align-items: center; gap: 16px; }
    nav a { font-size: 12px; color: var(--gray-600); text-decoration: none; }
    nav a:hover { color: var(--black); }
    .github-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--black); font-size: 11px; }
    .github-btn:hover { background: var(--gray-100); }
    .github-btn svg { width: 14px; height: 14px; }
    
    .hero { text-align: center; padding: 60px 24px; border-bottom: 1px solid var(--black); }
    .hero-banner { max-width: 560px; width: 100%; height: auto; margin: 0 auto 24px; border-radius: 8px; display: block; }
    .badge { display: inline-block; border: 1px solid var(--black); padding: 5px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
    h1 { font-family: var(--font-pixel); font-size: 20px; font-weight: 400; margin-bottom: 16px; letter-spacing: 0; line-height: 1.6; }
    .compatibility-note { font-size: 13px; color: var(--gray-600); margin: 0 auto 16px; max-width: 600px; }
    .stats-bar { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; font-size: 12px; color: var(--gray-600); }
    .stats-bar span { display: flex; align-items: center; gap: 4px; }
    .stats-bar strong { color: var(--black); font-weight: 700; }
    
    .tools-scroller { 
      width: 100%; 
      overflow: hidden; 
      margin-bottom: 32px; 
      padding: 20px 0; 
      background: var(--gray-50); 
      border-top: 1px solid var(--gray-200); 
      border-bottom: 1px solid var(--gray-200);
      position: relative;
    }
    .tools-scroller::before,
    .tools-scroller::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100px;
      z-index: 2;
      pointer-events: none;
    }
    .tools-scroller::before {
      left: 0;
      background: linear-gradient(to right, var(--gray-50), transparent);
    }
    .tools-scroller::after {
      right: 0;
      background: linear-gradient(to left, var(--gray-50), transparent);
    }
    .tools-track { 
      display: flex; 
      gap: 50px; 
      animation: scroll 40s linear infinite; 
    }
    .tools-scroller:hover .tools-track {
      animation-play-state: paused;
    }
    .tool-item { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      white-space: nowrap; 
      flex-shrink: 0;
      transition: opacity 0.3s ease;
    }
    .tool-item:hover {
      opacity: 1;
    }
    .tool-item img { 
      width: 24px; 
      height: 24px; 
      object-fit: contain; 
      opacity: 0.9;
    }
    .tool-item span { 
      font-size: 11px; 
      color: var(--gray-600); 
      font-weight: 500; 
    }
    
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    .hero-install { max-width: 600px; margin: 0 auto; width: 100%; }
    .hero-cmd { display: flex; border: 1px solid var(--black); }
    .hero-cmd code { flex: 1; padding: 12px; font-size: 11px; background: var(--gray-100); overflow-x: auto; white-space: nowrap; }
    .hero-cmd .copy-btn { padding: 12px 16px; background: var(--black); color: var(--white); border: none; font-family: var(--font); font-size: 11px; cursor: pointer; border-left: 1px solid var(--black); }
    .hero-cmd .copy-btn:hover { opacity: 0.9; }
    
    main { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .section-title { font-family: var(--font-pixel); font-size: 12px; font-weight: 400; margin-bottom: 24px; text-align: center; }
    
    .skills-grid { display: grid; gap: 20px; }
    .skill-card { border: 2px solid var(--black); padding: 24px; }
    .skill-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .skill-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .skill-icon img { width: 28px; height: 28px; object-fit: contain; }
    .skill-title { flex: 1; display: flex; align-items: baseline; gap: 8px; }
    .skill-title h3 { font-size: 16px; font-weight: 700; }
    .version { font-size: 10px; color: var(--gray-400); }
    .example-link { color: var(--gray-400); padding: 4px; display: flex; align-items: center; }
    .example-link:hover { color: #4A90D9; }
    .github-link { color: var(--gray-400); padding: 4px; display: flex; align-items: center; }
    .github-link:hover { color: var(--black); }
    .skill-desc { font-size: 12px; color: var(--gray-600); margin-bottom: 12px; line-height: 1.6; }
    .skill-auth-info { font-size: 11px; color: var(--gray-600); display: flex; align-items: flex-start; gap: 6px; margin-bottom: 10px; line-height: 1.6; }
    .skill-auth-info svg { flex-shrink: 0; margin-top: 2px; }
    .skill-auth-info code { background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-size: 10px; }
    .skill-auth-info a { color: #6366f1; text-decoration: none; font-size: 10px; }
    .skill-auth-info a:hover { text-decoration: underline; }
    .skill-auth-info .from-dep, .skill-auth-info .optional { color: #9ca3af; font-size: 9px; }
    .skill-deps { font-size: 10px; color: var(--gray-600); display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .skill-deps svg { flex-shrink: 0; }
    .dep-tag { font-size: 9px; padding: 2px 6px; background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; margin-left: 4px; }
    .skill-triggers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; align-items: center; }
    .trigger { font-size: 9px; padding: 3px 8px; background: var(--gray-100); border: 1px solid var(--gray-200); }
    .auth-tag { font-size: 9px; padding: 3px 8px; font-weight: 500; line-height: 1; }
    .auth-tag.free { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .auth-tag.paid { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
    .install-count { font-size: 9px; color: var(--gray-500); margin-left: 6px; }
    
    .install-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .install-tabs { display: flex; gap: 0; margin-bottom: 4px; flex-wrap: wrap; }
    .tab-btn { font-family: var(--font); font-size: 10px; padding: 6px 12px; border: 1px solid var(--gray-200); background: var(--gray-50); cursor: pointer; color: var(--gray-600); border-left: none; }
    .tab-btn:first-child { border-radius: 4px 0 0 4px; border-left: 1px solid var(--gray-200); }
    .tab-btn:last-child { border-radius: 0 4px 4px 0; }
    .tab-btn.active { background: var(--black); color: var(--white); border-color: var(--black); }
    .level-tabs { margin-bottom: 4px; }
    .platform-tabs { margin-bottom: 8px; }
    .platform-tabs .tab-btn { padding: 4px 10px; font-size: 9px; }
    .tab-hint { font-size: 9px; color: var(--gray-400); margin-bottom: 4px; font-style: italic; }
    .install-cmd { display: flex; align-items: center; gap: 8px; }
    .install-cmd code { flex: 1; font-size: 10px; padding: 8px 12px; background: var(--gray-50); border: 1px solid var(--gray-200); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; }
    .install-cmd .copy-btn { font-family: var(--font); font-size: 10px; padding: 8px 16px; border: 1px solid var(--black); background: var(--white); cursor: pointer; flex-shrink: 0; }
    .install-cmd .copy-btn:hover { background: var(--black); color: var(--white); }
    .install-cmd .copy-btn.copied { background: var(--green); color: var(--white); border-color: var(--green); }
    .platform-note { font-size: 9px; color: var(--gray-400); font-style: italic; margin-top: 4px; }
    
    .commands-section { border-top: 1px solid var(--gray-200); padding-top: 12px; }
    .commands-section summary { font-size: 11px; font-weight: 600; cursor: pointer; color: var(--gray-600); }
    .commands-section summary:hover { color: var(--black); }
    .commands-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .commands-list code { font-size: 10px; padding: 6px 10px; background: var(--gray-50); border: 1px solid var(--gray-200); display: block; overflow-x: auto; }
    
    .faq-section { max-width: 900px; margin: 0 auto; padding: 48px 24px; border-top: 1px solid var(--gray-200); }
    .faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .faq-item { padding: 20px; border: 1px solid var(--gray-200); background: var(--gray-50); }
    .faq-item h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--black); }
    .faq-item p { font-size: 13px; color: var(--gray-600); line-height: 1.6; }
    .faq-item strong { color: var(--black); }
    .faq-item code { font-size: 11px; background: var(--white); padding: 2px 6px; border: 1px solid var(--gray-200); }

    footer { border-top: 1px solid var(--black); padding: 24px; text-align: center; }
    footer p { font-size: 11px; color: var(--gray-600); }
    footer a { color: var(--gray-600); }
    footer a:hover { color: var(--black); }
    
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--black); color: var(--white); padding: 10px 20px; font-size: 11px; opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 1000; }
    .toast.show { opacity: 1; }
    
    @media (max-width: 768px) {
      .header-inner { padding: 0 16px; height: 56px; }
      .logo-text { font-size: 14px; }
      .github-btn span { display: none; }
      .github-btn { padding: 6px 8px; }
      
      .hero { padding: 40px 16px; }
      .badge { font-size: 9px; padding: 4px 10px; }
      h1 { font-size: 14px; line-height: 1.8; }
      .subtitle { font-size: 13px; }
      .stats-bar { gap: 12px 20px; font-size: 11px; margin-bottom: 24px; }
      .tools-scroller { margin-bottom: 24px; padding: 12px 0; }
      .tool-item { gap: 6px; }
      .tool-item img { width: 20px; height: 20px; }
      .tool-item span { font-size: 10px; }
      .hero-tabs { flex-wrap: wrap; }
      .hero-tab { flex: 1 1 auto; min-width: 60px; padding: 6px 8px; font-size: 10px; }
      .hero-cmd code { font-size: 9px; padding: 10px; }
      
      main { padding: 24px 16px; }
      .section-title { font-size: 16px; }
      
      .skill-card { padding: 16px; overflow: hidden; }
      .skill-header { flex-wrap: wrap; gap: 8px; }
      .skill-icon { width: 32px; height: 32px; flex-shrink: 0; }
      .skill-icon img { width: 24px; height: 24px; }
      .skill-title { min-width: 0; flex: 1; }
      .skill-title h3 { font-size: 14px; word-break: break-word; }
      
      .skill-desc { word-break: break-word; }
      .skill-deps { flex-wrap: wrap; }
      .skill-triggers { gap: 4px; }
      .trigger { font-size: 8px; padding: 2px 6px; }
      
      .install-section { overflow: hidden; }
      .install-tabs { flex-wrap: nowrap; width: 100%; }
      .level-tabs { display: flex; }
      .level-tabs .tab-btn { flex: 1; text-align: center; min-width: 0; padding: 8px 4px; font-size: 10px; }
      .platform-tabs { display: flex; width: 100%; }
      .platform-tabs .tab-btn { flex: 1; min-width: 0; border-radius: 0; border-left: none; text-align: center; padding: 6px 2px; font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .platform-tabs .tab-btn:first-child { border-radius: 4px 0 0 4px; border-left: 1px solid var(--gray-200); }
      .platform-tabs .tab-btn:last-child { border-radius: 0 4px 4px 0; }
      
      .install-cmd { flex-direction: column; gap: 8px; }
      .install-cmd code { width: 100%; font-size: 7px; padding: 10px; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; display: block; }
      .install-cmd .copy-btn { width: 100%; padding: 10px; }
      
      .commands-list code { font-size: 9px; white-space: nowrap; overflow-x: auto; display: block; }
      
      .faq-section { padding: 32px 16px; }
      .faq-grid { grid-template-columns: 1fr; gap: 16px; }
      .faq-item { padding: 16px; }
      .faq-item h3 { font-size: 13px; }
      .faq-item p { font-size: 12px; }

      footer { padding: 20px 16px; }
      footer p { font-size: 10px; }
    }
    
    @media (max-width: 400px) {
      h1 { font-size: 11px; }
      .skill-title h3 { font-size: 13px; }
      .platform-tabs .tab-btn { padding: 6px 1px; font-size: 7px; }
      .level-tabs .tab-btn { font-size: 9px; padding: 8px 4px; }
      .install-cmd code { font-size: 7px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon"><img src="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-logo.svg" alt="OPC Skills logo" width="32" height="32"></div>
        <span class="logo-text">OPC Skills</span>
      </a>
      <nav>
        <a href="/blog">Blog</a>
        <a href="https://github.com/ReScienceLab/opc-skills" target="_blank" rel="noopener noreferrer" class="github-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
        <a href="mailto:hi@opc.dev">Contact</a>
      </nav>
    </div>
  </header>

  <section class="hero" aria-label="Quick install instructions">
    <img src="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-banner.png" alt="OPC Skills - AI Agent Skills for Solopreneurs" class="hero-banner" fetchpriority="high" decoding="async">
    <h1>AI Agent Skills for Solopreneurs</h1>
    <p class="compatibility-note">Works with Claude Code, Cursor, Windsurf, Droid, and 12+ other AI tools</p>
    <div class="stats-bar">
      <span><strong>${skills.length}</strong> Skills Available</span>
      <span><strong>16+</strong> AI Tools Supported</span>
      <span><strong>100%</strong> Free & Open Source</span>
      <span><strong>MIT</strong> License</span>
    </div>
    <div class="tools-scroller">
      <div class="tools-track">
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/anthropic.png" alt="Claude" width="24" height="24" loading="lazy">
          <span>Claude</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cursor.png" alt="Cursor" width="24" height="24" loading="lazy">
          <span>Cursor</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/windsurf.png" alt="Windsurf" width="24" height="24" loading="lazy">
          <span>Windsurf</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/openai.png" alt="OpenAI" width="24" height="24" loading="lazy">
          <span>OpenAI</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/copilot.png" alt="GitHub Copilot" width="24" height="24" loading="lazy">
          <span>GitHub Copilot</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cline.png" alt="Cline" width="24" height="24" loading="lazy">
          <span>Cline</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/replit.png" alt="Replit" width="24" height="24" loading="lazy">
          <span>Replit</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/lmstudio.png" alt="LM Studio" width="24" height="24" loading="lazy">
          <span>LM Studio</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/ollama.png" alt="Ollama" width="24" height="24" loading="lazy">
          <span>Ollama</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/anthropic.png" alt="Claude" width="24" height="24" loading="lazy">
          <span>Claude</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cursor.png" alt="Cursor" width="24" height="24" loading="lazy">
          <span>Cursor</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/windsurf.png" alt="Windsurf" width="24" height="24" loading="lazy">
          <span>Windsurf</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/openai.png" alt="OpenAI" width="24" height="24" loading="lazy">
          <span>OpenAI</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/copilot.png" alt="GitHub Copilot" width="24" height="24" loading="lazy">
          <span>GitHub Copilot</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cline.png" alt="Cline" width="24" height="24" loading="lazy">
          <span>Cline</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/replit.png" alt="Replit" width="24" height="24" loading="lazy">
          <span>Replit</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/lmstudio.png" alt="LM Studio" width="24" height="24" loading="lazy">
          <span>LM Studio</span>
        </div>
        <div class="tool-item">
          <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/ollama.png" alt="Ollama" width="24" height="24" loading="lazy">
          <span>Ollama</span>
        </div>
      </div>
    </div>
    <div class="hero-install">
      <div class="hero-cmd">
        <code id="hero-cmd-code" data-cmd="npx skills add ReScienceLab/opc-skills">npx skills add ReScienceLab/opc-skills</code>
        <button class="copy-btn" onclick="copyHeroCmd(this)">Copy</button>
      </div>
      <p style="font-size:11px;margin-top:8px;color:var(--gray-600);">
        <a href="https://skills.sh/ReScienceLab/opc-skills" target="_blank" rel="noopener" style="color:var(--purple);">Browse on skills.sh →</a>
      </p>
    </div>
  </section>

  <main>
    <h2 class="section-title">Available Skills</h2>
    <div class="skills-grid">${skillCards}</div>
  </main>

  <section class="faq-section" aria-label="Frequently Asked Questions">
    <h2 class="section-title">Frequently Asked Questions</h2>
    <div class="faq-grid">
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">What is OPC Skills?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">OPC Skills is a curated collection of <strong>${skills.length} AI agent skills</strong> for <strong>solopreneurs</strong>, <strong>indie hackers</strong>, and <strong>one-person companies</strong>. These skills extend AI coding assistants like Claude Code, Cursor, and Codex with automation capabilities like domain hunting, social media research, and product analytics. According to the <a href="https://agentskills.io" target="_blank" rel="noopener">Agent Skills standard</a>, skills are modular instructions that help AI agents perform specialized tasks efficiently.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">What are AI agent skills?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">AI agent skills are modular capabilities that extend AI coding assistants like Claude Code, Cursor, and Codex. According to <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a>, skills enable AI agents to perform specialized tasks such as searching domains, researching social media, hunting for promo codes, and analyzing product launches. Each skill typically includes instructions, scripts, and resources in a self-contained folder with a SKILL.md file. Skills are installed via simple one-line commands and work across <strong>5+ major AI coding platforms</strong>.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">How do I install OPC Skills?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Run this command in your terminal: npx skills add ReScienceLab/opc-skills. For a specific skill, use npx skills add ReScienceLab/opc-skills --skill reddit. Works with Claude Code, Cursor, Windsurf, Droid, and 12+ other AI tools.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">What platforms are supported?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">OPC Skills supports <strong>5 major AI coding platforms</strong>: Claude Code (Anthropic), Factory Droid, Cursor, OpenCode, and Codex (OpenAI). Each skill can be installed with a single command for any of these platforms.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">How do I install Claude Code extensions?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Use the one-command install: npx skills add ReScienceLab/opc-skills. This works for Claude Code and 12+ other AI coding assistants. Browse available skills at https://skills.sh/ReScienceLab/opc-skills.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">Are these skills compatible with Cursor AI?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Yes! OPC Skills work with Claude Code, Cursor, Codex, Windsurf, Droid, and 12+ other AI coding assistants. Just run npx skills add ReScienceLab/opc-skills and the CLI will automatically detect your installed tools.</p>
        </div>
      </div>
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">How to extend Claude Code with custom skills?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Install skills using: npx skills add ReScienceLab/opc-skills. Skills are stored in ~/.claude/skills/ for user-level or .claude/skills/ for project-level. Each skill is a markdown file with instructions that Claude Code follows.</p>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <p>2026 <a href="https://rescience.com" target="_blank" rel="noopener noreferrer">ReScience Lab</a> | <a href="mailto:hi@opc.dev">hi@opc.dev</a> | <a href="https://github.com/ReScienceLab/opc-skills" target="_blank" rel="noopener noreferrer">GitHub</a> | <a href="/skills.json">API</a></p>
  </footer>

  <div class="toast" id="toast">Copied to clipboard!</div>

  <script>
    function copyCmd(btn) {
      const code = btn.previousElementSibling;
      const cmd = code.dataset.cmd;
      navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        showToast();
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
    
    function copyHeroCmd(btn) {
      const code = document.getElementById('hero-cmd-code');
      navigator.clipboard.writeText(code.dataset.cmd).then(() => {
        btn.textContent = 'Copied!';
        showToast('Install command copied!');
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    }
    
    const projectOnlyTools = ['cursor'];
    
    function updateHeroCmd() {
      const tool = document.querySelector('.hero-tool-tabs .hero-tab.active').dataset.tool;
      const userTab = document.querySelector('.hero-level-tabs .hero-tab[data-level="user"]');
      const projectTab = document.querySelector('.hero-level-tabs .hero-tab[data-level="project"]');
      
      if (projectOnlyTools.includes(tool)) {
        userTab.classList.add('disabled');
        userTab.classList.remove('active');
        projectTab.classList.add('active');
      } else {
        userTab.classList.remove('disabled');
      }
      
      const level = document.querySelector('.hero-level-tabs .hero-tab.active').dataset.level;
      const levelFlag = level === 'project' ? ' -p' : '';
      const cmd = 'curl -fsSL opc.dev/install.sh | bash -s -- -t ' + tool + levelFlag + ' all';
      const code = document.getElementById('hero-cmd-code');
      code.textContent = cmd;
      code.dataset.cmd = cmd;
    }
    
    document.querySelectorAll('.hero-level-tabs .hero-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('disabled')) return;
        document.querySelectorAll('.hero-level-tabs .hero-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateHeroCmd();
      });
    });
    
    document.querySelectorAll('.hero-tool-tabs .hero-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.hero-tool-tabs .hero-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateHeroCmd();
      });
    });
    
    function showToast(msg = 'Copied to clipboard!') {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
    
    function copyCmdNew(btn) {
      const code = btn.previousElementSibling;
      const cmd = code.textContent;
      if (!cmd) {
        showToast('Not available for this combination');
        return;
      }
      navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        showToast();
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
    
    function updateCmd(card) {
      const levelBtn = card.querySelector('.level-tabs .tab-btn.active');
      const platformBtn = card.querySelector('.platform-tabs .tab-btn.active');
      const level = levelBtn.textContent.toLowerCase().includes('user') ? 'user' : 'project';
      const platform = platformBtn.dataset.platform;
      
      const code = card.querySelector('.cmd-display');
      const cmd = code.dataset[level + '-' + platform] || code.dataset[level + platform.charAt(0).toUpperCase() + platform.slice(1)] || '';
      code.textContent = cmd || 'Not available';
      
      // Show cursor note when user-level + cursor
      const cursorNote = card.querySelector('.cursor-note');
      if (cursorNote) {
        cursorNote.style.display = (platform === 'cursor' && level === 'user') ? 'block' : 'none';
      }
    }
    
    function switchLevel(btn, level) {
      const card = btn.closest('.skill-card');
      card.querySelectorAll('.level-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      card.querySelector('.user-hint').style.display = level === 'user' ? 'block' : 'none';
      card.querySelector('.project-hint').style.display = level === 'project' ? 'block' : 'none';
      
      updateCmd(card);
    }
    
    function switchPlatform(btn, platform) {
      const card = btn.closest('.skill-card');
      card.querySelectorAll('.platform-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      updateCmd(card);
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html;charset=UTF-8', 
        'Cache-Control': 'public, max-age=300' 
      }
    });
  }
};

// Fetch skills config from GitHub with caching
async function fetchSkillsConfig(ctx) {
  const SKILLS_JSON_URL = 'https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/skills.json';
  const cache = caches.default;
  const cacheUrl = new URL('https://opc.dev/_cache/skills-v2.json');
  
  let response = await cache.match(cacheUrl);
  if (response) {
    return await response.json();
  }

  try {
    const res = await fetch(SKILLS_JSON_URL, {
      headers: { 'User-Agent': 'OPC-Skills-Website' }
    });
    
    if (res.ok) {
      const config = await res.json();
      const cacheResponse = new Response(JSON.stringify(config), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      });
      ctx.waitUntil(cache.put(cacheUrl, cacheResponse));
      return config;
    }
  } catch (e) {
    console.error('Error fetching skills.json:', e);
  }

  return getFallbackConfig();
}

// Fetch install stats from GitHub with caching
async function fetchInstallStats(ctx) {
  const STATS_URL = 'https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/install-stats.json';
  const cache = caches.default;
  const cacheUrl = new URL('https://opc.dev/_cache/install-stats.json');
  
  let response = await cache.match(cacheUrl);
  if (response) {
    return await response.json();
  }

  try {
    const res = await fetch(STATS_URL, {
      headers: { 'User-Agent': 'OPC-Skills-Website' }
    });
    
    if (res.ok) {
      const stats = await res.json();
      const cacheResponse = new Response(JSON.stringify(stats), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
      ctx.waitUntil(cache.put(cacheUrl, cacheResponse));
      return stats;
    }
  } catch (e) {
    console.error('Error fetching install-stats.json:', e);
  }

  return { total: 0, skills: {} };
}

function getFallbackConfig() {
  return {
    version: "1.0.0",
    logo: "https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/resciencelab-logo.svg",
    skills: [
      {
        name: "domain-hunter",
        version: "1.0.0",
        description: "Search domains, compare prices, find promo codes",
        icon: "globe",
        color: "4A90D9",
        triggers: ["domain", "registrar"],
        dependencies: ["twitter", "reddit"],
        auth: { required: false, note: "Uses web search and public APIs" },
        install: {
          user: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude domain-hunter",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid domain-hunter",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode domain-hunter",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex domain-hunter"
          },
          project: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude -p domain-hunter",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid -p domain-hunter",
            cursor: "curl -fsSL opc.dev/install.sh | bash -s -- -t cursor -p domain-hunter",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode -p domain-hunter",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex -p domain-hunter"
          }
        },
        commands: ["whois {domain}.{tld}"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/domain-hunter" }
      },
      {
        name: "reddit",
        version: "1.0.0",
        description: "Search and retrieve content from Reddit via the public JSON API",
        icon: "reddit",
        color: "FF4500",
        triggers: ["reddit", "subreddit", "r/"],
        dependencies: [],
        auth: { required: false, note: "No API key required" },
        install: {
          user: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude reddit",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid reddit",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode reddit",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex reddit"
          },
          project: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude -p reddit",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid -p reddit",
            cursor: "curl -fsSL opc.dev/install.sh | bash -s -- -t cursor -p reddit",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode -p reddit",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex -p reddit"
          }
        },
        commands: ["python3 scripts/get_posts.py {subreddit}"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/reddit" }
      },
      {
        name: "twitter",
        version: "1.0.0",
        description: "Search and retrieve content from Twitter/X via twitterapi.io",
        icon: "x",
        color: "000000",
        triggers: ["twitter", "X", "tweet"],
        dependencies: [],
        auth: { required: true, note: "Requires TWITTERAPI_API_KEY" },
        install: {
          user: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude twitter",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid twitter",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode twitter",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex twitter"
          },
          project: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude -p twitter",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid -p twitter",
            cursor: "curl -fsSL opc.dev/install.sh | bash -s -- -t cursor -p twitter",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode -p twitter",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex -p twitter"
          }
        },
        commands: ["python3 scripts/get_user_info.py {username}"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/twitter" }
      },
      {
        name: "producthunt",
        version: "1.0.0",
        description: "Search and retrieve content from Product Hunt via the GraphQL API",
        icon: "producthunt",
        color: "DA552F",
        triggers: ["producthunt", "product hunt", "PH", "launch"],
        dependencies: [],
        auth: { required: true, note: "Requires PRODUCTHUNT_ACCESS_TOKEN" },
        install: {
          user: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude producthunt",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid producthunt",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode producthunt",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex producthunt"
          },
          project: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude -p producthunt",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid -p producthunt",
            cursor: "curl -fsSL opc.dev/install.sh | bash -s -- -t cursor -p producthunt",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode -p producthunt",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex -p producthunt"
          }
        },
        commands: ["python3 scripts/search_posts.py --limit 20"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/producthunt" }
      },
      {
        name: "requesthunt",
        version: "1.0.0",
        description: "Generate user demand research reports from real user feedback. Scrape and analyze feature requests from Reddit, X, and GitHub.",
        icon: "globe",
        color: "6366F1",
        triggers: ["requesthunt", "request hunt", "feature request", "user demand"],
        dependencies: [],
        auth: { required: true, note: "Get API key from requesthunt.com/settings/api" },
        install: {
          user: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude requesthunt",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid requesthunt",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode requesthunt",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex requesthunt"
          },
          project: {
            claude: "curl -fsSL opc.dev/install.sh | bash -s -- -t claude -p requesthunt",
            droid: "curl -fsSL opc.dev/install.sh | bash -s -- -t droid -p requesthunt",
            cursor: "curl -fsSL opc.dev/install.sh | bash -s -- -t cursor -p requesthunt",
            opencode: "curl -fsSL opc.dev/install.sh | bash -s -- -t opencode -p requesthunt",
            codex: "curl -fsSL opc.dev/install.sh | bash -s -- -t codex -p requesthunt"
          }
        },
        commands: ["python3 scripts/search_requests.py \"{query}\" --expand"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/requesthunt" }
      }
    ]
  };
}

// Fetch blog config from GitHub with caching
async function fetchBlogConfig(ctx) {
  const BLOG_JSON_URL = 'https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/blog/blog.json';
  const cache = caches.default;
  const cacheUrl = new URL('https://opc.dev/_cache/blog-v1.json');
  
  let response = await cache.match(cacheUrl);
  if (response) {
    return await response.json();
  }

  try {
    const res = await fetch(BLOG_JSON_URL, {
      headers: { 'User-Agent': 'OPC-Skills-Website' }
    });
    
    if (res.ok) {
      const config = await res.json();
      const cacheResponse = new Response(JSON.stringify(config), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 min cache
        }
      });
      ctx.waitUntil(cache.put(cacheUrl, cacheResponse));
      return config;
    }
  } catch (e) {
    console.error('Error fetching blog.json:', e);
  }

  return { posts: [] };
}

// Markdown to HTML converter using marked
function markdownToHtml(md) {
  if (!md) return '';
  // Remove YAML frontmatter (must start with ---\n at position 0)
  if (md.startsWith('---\n')) {
    md = md.replace(/^---\n[\s\S]*?\n---\n/, '');
  }
  // Convert using marked (supports GFM tables, etc.)
  let html = marked.parse(md);
  // Wrap images in figure tags for grid layout
  html = html.replace(/<img src="([^"]+)" alt="([^"]*)">/g, 
    '<figure class="example-img"><img src="$1" alt="$2" loading="lazy"><figcaption>$2</figcaption></figure>');
  return html;
}

// Render individual skill page
async function renderSkillPage(skillName, ctx) {
  const [config, installStats] = await Promise.all([
    fetchSkillsConfig(ctx),
    fetchInstallStats(ctx)
  ]);
  const skill = config.skills.find(s => s.name === skillName);
  
  if (!skill) {
    return new Response('Skill not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }
  
  const installs = installStats.skills?.[skillName] || 0;
  
  // Get dependency names from object or array
  const skillDeps = skill.dependencies 
    ? (Array.isArray(skill.dependencies) ? skill.dependencies : Object.keys(skill.dependencies))
    : [];

  // Helper to collect all API keys including from dependencies
  const getAllKeys = (sk, allSkills) => {
    const keys = [...(sk.auth?.keys || [])];
    const deps = sk.dependencies 
      ? (Array.isArray(sk.dependencies) ? sk.dependencies : Object.keys(sk.dependencies))
      : [];
    for (const depName of deps) {
      const depSkill = allSkills.find(s => s.name === depName);
      if (depSkill?.auth?.keys) {
        for (const k of depSkill.auth.keys) {
          if (!keys.some(existing => existing.env === k.env)) {
            keys.push({ ...k, from: depName });
          }
        }
      }
    }
    return keys;
  };

  const allKeys = getAllKeys(skill, config.skills);
  const needsKey = allKeys.some(k => !k.optional);

  // Fetch SKILL.md from GitHub
  const mdUrl = `https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/skills/${skillName}/SKILL.md`;
  let markdown = '';
  try {
    const mdRes = await fetch(mdUrl, { headers: { 'User-Agent': 'OPC-Skills-Website' } });
    if (mdRes.ok) markdown = await mdRes.text();
  } catch (e) {}
  
  const content = markdownToHtml(markdown);

  // Fetch example markdown if skill has example link
  let exampleContent = '';
  if (skill.links.example) {
    // Convert GitHub blob URL to raw URL
    const exampleRawUrl = skill.links.example
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
    try {
      const exRes = await fetch(exampleRawUrl, { headers: { 'User-Agent': 'OPC-Skills-Website' } });
      if (exRes.ok) {
        const exampleMd = await exRes.text();
        exampleContent = markdownToHtml(exampleMd);
      }
    } catch (e) {}
  }

  // JSON-LD for this skill (GEO-optimized with FAQPage for +40% AI visibility)
  const today = new Date().toISOString().split('T')[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://opc.dev/skills/${skill.name}#webpage`,
        "url": `https://opc.dev/skills/${skill.name}`,
        "name": `${skill.name} - OPC Skills`,
        "description": skill.description,
        "datePublished": "2024-01-01",
        "dateModified": today,
        "inLanguage": "en-US",
        "isPartOf": { "@id": "https://opc.dev/#website" },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".skill-desc", "h1", ".skill-content p"]
        },
        "mainEntity": { "@id": `https://opc.dev/skills/${skill.name}#software` }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `https://opc.dev/skills/${skill.name}#software`,
        "name": skill.name,
        "description": skill.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Cross-platform",
        "softwareVersion": skill.version,
        "datePublished": "2024-01-01",
        "dateModified": today,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "author": {
          "@type": "Organization",
          "name": "ReScience Lab",
          "url": "https://rescience.com"
        },
        "url": `https://opc.dev/skills/${skill.name}`
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://opc.dev/" },
          { "@type": "ListItem", "position": 2, "name": "Skills", "item": "https://opc.dev/" },
          { "@type": "ListItem", "position": 3, "name": skill.name, "item": `https://opc.dev/skills/${skill.name}` }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `https://opc.dev/skills/${skill.name}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is ${skill.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${skill.name} is an agent skill for AI coding assistants like Claude Code, Factory Droid, and Cursor. ${skill.description}`
            }
          },
          {
            "@type": "Question",
            "name": `How do I install ${skill.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Install ${skill.name} by running: npx skills add ReScienceLab/opc-skills --skill ${skill.name}. Replace 'claude' with your preferred platform (droid, cursor, opencode, codex).`
            }
          },
          {
            "@type": "Question",
            "name": `Does ${skill.name} require an API key?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": skill.auth.required ? `Yes, ${skill.name} requires an API key. ${skill.auth.note || ''}` : `No, ${skill.name} is free to use and does not require an API key.`
            }
          }
        ]
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${skill.name} - OPC Skills | Agent Skill for Claude, Droid, Cursor</title>
  <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/apple-touch-icon.png">
  <meta name="description" content="${skill.description}">
  <meta name="keywords" content="${skill.name}, ${skill.triggers.join(', ')}, agent skill, claude skill, AI tool">
  <meta name="robots" content="index, follow">
  <meta name="author" content="ReScience Lab">
  <meta name="theme-color" content="#${skill.color}">
  <link rel="canonical" href="https://opc.dev/skills/${skill.name}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta property="og:title" content="${skill.name} - OPC Skills">
  <meta property="og:description" content="${skill.description}">
  <meta property="og:image" content="${skill.logo || `https://cdn.simpleicons.org/${skill.icon}/${skill.color}`}">
  <meta property="og:url" content="https://opc.dev/skills/${skill.name}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPC Skills">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${skill.name} - OPC Skills">
  <meta name="twitter:description" content="${skill.description}">
  <meta name="twitter:image" content="${skill.logo || `https://cdn.simpleicons.org/${skill.icon}/${skill.color}`}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --font: 'JetBrains Mono', monospace; --font-pixel: 'Press Start 2P', cursive; --black: #000; --white: #fff; --gray-100: #f3f4f6; --gray-200: #e5e7eb; --gray-400: #9ca3af; --gray-600: #4b5563; --green: #22c55e; }
    body { font-family: var(--font); background: var(--white); color: var(--black); line-height: 1.6; }
    header { position: sticky; top: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--black); z-index: 100; }
    .header-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--black); }
    .logo-icon img { width: 32px; height: 32px; }
    .logo-text { font-family: var(--font-pixel); font-size: 10px; }
    nav a { font-size: 12px; color: var(--gray-600); text-decoration: none; }
    nava:hover { color: var(--black); }
    main { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .breadcrumb { font-size: 12px; color: var(--gray-600); margin-bottom: 24px; }
    .breadcrumb a { color: var(--gray-600); text-decoration: none; }
    .breadcrumb a:hover { color: var(--black); text-decoration: underline; }
    .skill-hero { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--gray-200); }
    .skill-hero img { width: 64px; height: 64px; }
    .skill-hero h1 { font-size: 24px; font-weight: 700; }
    .skill-hero .version { font-size: 12px; color: var(--gray-400); margin-left: 8px; }
    .skill-hero .auth-tag { font-size: 11px; padding: 4px 10px; margin-left: 12px; }
    .auth-tag.free { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .auth-tag.paid { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
    .skill-desc { font-size: 14px; color: var(--gray-600); margin-bottom: 16px; }
    .skill-deps { font-size: 10px; color: var(--gray-600); display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .skill-deps svg { flex-shrink: 0; }
    .dep-tag { font-size: 9px; padding: 2px 6px; background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; margin-left: 4px; }
    .skill-triggers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
    .trigger { font-size: 10px; padding: 4px 10px; background: var(--gray-100); border: 1px solid var(--gray-200); }
    .skill-content { margin-bottom: 32px; }
    .skill-content h1 { font-size: 20px; margin: 24px 0 12px; border-bottom: 1px solid var(--gray-200); padding-bottom: 8px; }
    .skill-content h2 { font-size: 16px; margin: 20px 0 10px; }
    .skill-content h3 { font-size: 14px; margin: 16px 0 8px; }
    .skill-content p { margin: 12px 0; font-size: 14px; line-height: 1.6; }
    .skill-content ul, .skill-content ol { margin: 8px 0 8px 24px; }
    .skill-content ul { list-style: disc; }
    .skill-content ol { list-style: decimal; }
    .skill-content li { font-size: 14px; margin: 4px 0; line-height: 1.5; }
    .skill-content strong { font-weight: 600; }
    .skill-content code { font-size: 12px; background: var(--gray-100); padding: 2px 6px; border-radius: 3px; }
    .skill-content pre { background: var(--gray-100); padding: 16px; overflow-x: auto; margin: 12px 0; border: 1px solid var(--gray-200); white-space: pre; font-size: 12px; line-height: 1.5; }
    .skill-content pre code { background: none; padding: 0; white-space: pre; }
    .skill-content a { color: #2563eb; }
    .skill-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    .skill-content th, .skill-content td { border: 1px solid var(--gray-200); padding: 8px 12px; text-align: left; }
    .skill-content th { background: var(--gray-100); font-weight: 600; }
    .skill-content ul { list-style: disc; margin-left: 24px; }
    .skill-content blockquote { border-left: 3px solid var(--gray-400); padding: 8px 16px; margin: 12px 0; background: var(--gray-100); font-style: italic; }
    .skill-content hr { border: none; border-top: 1px solid var(--gray-200); margin: 24px 0; }
    .skill-content .example-img { display: inline-block; margin: 8px; vertical-align: top; max-width: 200px; text-align: center; }
    .skill-content .example-img img { width: 100%; height: auto; border: 1px solid var(--gray-200); border-radius: 8px; background: white; }
    .skill-content .example-img figcaption { font-size: 11px; color: var(--gray-600); margin-top: 4px; }
    .skill-tabs { display: flex; border-bottom: 2px solid var(--black); margin-bottom: 0; }
    .skill-tab { padding: 12px 24px; background: var(--gray-100); border: none; cursor: pointer; font-family: var(--font); font-size: 13px; font-weight: 600; border-right: 1px solid var(--gray-200); }
    .skill-tab:hover { background: var(--gray-200); }
    .skill-tab.active { background: var(--black); color: var(--white); }
    .tab-content { display: none; border: 2px solid var(--black); border-top: none; padding: 24px; margin-bottom: 24px; }
    .tab-content.active { display: block; }

    .skill-links { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .skill-links a { font-size: 12px; padding: 8px 16px; border: 1px solid var(--black); text-decoration: none; color: var(--black); }
    .skill-links a:hover { background: var(--black); color: var(--white); }
    .back-link { font-size: 13px; color: var(--gray-600); text-decoration: none; display: inline-block; margin-top: 24px; }
    .back-link:hover { color: var(--black); text-decoration: underline; }
    footer { border-top: 1px solid var(--black); padding: 24px; text-align: center; }
    footer p { font-size: 11px; color: var(--gray-600); }
    footer a { color: var(--gray-600); }
    @media (max-width: 768px) {
      .skill-hero { flex-direction: column; align-items: flex-start; gap: 12px; }
      .skill-hero h1 { font-size: 18px; }
      .skill-content pre { font-size: 11px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon"><img src="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-logo.svg" alt="OPC Skills logo" width="32" height="32"></div>
        <span class="logo-text">OPC Skills</span>
      </a>
      <nav>
        <a href="/blog">Blog</a>
        <a href="https://github.com/ReScienceLab/opc-skills" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:hi@opc.dev">Contact</a>
      </nav>
    </div>
  </header>
  <main>
    <div class="breadcrumb">
      <a href="/">Home</a> &gt; <a href="/">Skills</a> &gt; ${skill.name}
    </div>
    <article class="skill-hero" itemscope itemtype="https://schema.org/SoftwareApplication">
      <img src="${skill.logo || `https://cdn.simpleicons.org/${skill.icon}/${skill.color}`}" alt="${skill.name} logo" itemprop="image">
      <div>
        <h1 itemprop="name">${skill.name}<span class="version" itemprop="softwareVersion">v${skill.version}</span>${installs > 0 ? `<span class="install-count" style="font-size:12px;color:#6b7280;margin-left:12px;font-weight:400;">${installs} installs</span>` : ''}</h1>
        ${needsKey ? '<span class="auth-tag paid">API Key Required</span>' : '<span class="auth-tag free">Free</span>'}
      </div>
    </article>
    <p class="skill-desc" itemprop="description">${skill.description}</p>
    ${allKeys.length > 0 ? `<div class="skill-auth-info" style="margin:12px 0;display:flex;align-items:flex-start;gap:8px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#6366f1" style="flex-shrink:0;margin-top:2px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><div style="display:flex;flex-direction:column;gap:6px;">${allKeys.map(k => `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><code style="background:#fff;padding:3px 8px;border-radius:4px;font-size:12px;border:1px solid #e5e7eb;">${k.env}</code><a href="${k.url}" target="_blank" rel="noopener noreferrer" style="color:#6366f1;font-size:13px;">${k.url.replace('https://', '')}</a>${k.from ? `<span style="color:#9ca3af;font-size:11px;">(from ${k.from})</span>` : ''}${k.optional ? '<span style="color:#9ca3af;font-size:11px;">(optional)</span>' : ''}</div>`).join('')}</div></div>` : ''}
    ${skillDeps.length > 0 ? `<div class="skill-deps"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg> Depends on: ${skillDeps.map(d => `<a href="/skills/${d}" class="dep-tag" style="text-decoration:none;">${d}</a>`).join('')}</div>` : ''}
    <div class="skill-triggers">${skill.triggers.map(t => `<span class="trigger">${t}</span>`).join('')}</div>
    
    <div class="install-section" style="margin-bottom:32px;">
      <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Quick Install</h3>
      <div class="install-box" style="background:#f9fafb;border:2px solid #000;padding:0;position:relative;overflow:hidden;">
        <div style="display:flex;align-items:stretch;">
          <code class="install-cmd" style="flex:1;font-size:12px;padding:14px 16px;background:#f9fafb;overflow-x:auto;white-space:nowrap;font-family:monospace;color:#000;line-height:1.5;">npx skills add ReScienceLab/opc-skills --skill ${skillDeps.length > 0 ? skillDeps.concat(skill.name).join(' --skill ') : skill.name}</code>
          <button class="copy-btn" style="background:#000;color:#fff;border:none;border-left:2px solid #000;padding:12px 20px;font-size:11px;cursor:pointer;font-weight:600;font-family:var(--font);white-space:nowrap;transition:background 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#000'" onclick="navigator.clipboard.writeText('npx skills add ReScienceLab/opc-skills --skill ${skillDeps.length > 0 ? skillDeps.concat(skill.name).join(' --skill ') : skill.name}').then(() => { const orig = this.textContent; this.textContent='✓ Copied!'; this.style.background='#22c55e'; setTimeout(() => { this.textContent=orig; this.style.background='#000'; }, 2000); })">Copy</button>
        </div>
      </div>
    </div>
    
    <div class="skill-tabs">
      ${exampleContent ? `<button class="skill-tab active" onclick="switchTab(this, 'example')">Example</button>` : ''}
      <button class="skill-tab ${exampleContent ? '' : 'active'}" onclick="switchTab(this, 'docs')">Documentation</button>
    </div>
    
    ${exampleContent ? `
    <section id="tab-example" class="tab-content active" aria-label="Example usage">
      <div class="skill-content">${exampleContent}</div>
    </section>
    ` : ''}
    
    <section id="tab-docs" class="tab-content ${exampleContent ? '' : 'active'}" aria-label="Documentation">
      <div class="skill-content">${content}</div>
    </section>
    <div class="skill-links">
      <a href="${skill.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
      ${skill.links.docs ? `<a href="${skill.links.docs}" target="_blank" rel="noopener noreferrer">Docs</a>` : ''}
      ${skill.links.example ? `<a href="${skill.links.example}" target="_blank" rel="noopener noreferrer">Example</a>` : ''}
    </div>
    <a href="/" class="back-link">&larr; Back to all skills</a>
  </main>
  <footer>
    <p>2026 <a href="https://rescience.com" target="_blank" rel="noopener noreferrer">ReScience Lab</a> | <a href="mailto:hi@opc.dev">hi@opc.dev</a></p>
  </footer>
  <script>
    function switchTab(btn, tabId) {
      document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=1800' }
  });
}

async function renderComparePage(ctx) {
  const config = await fetchSkillsConfig(ctx);
  const skills = config.skills || [];
  const today = new Date().toISOString().split('T')[0];
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Agent Skills Comparison 2026 | OPC Skills vs Alternatives</title>
  <meta name="description" content="Compare OPC Skills with alternative AI agent skill collections. Feature-by-feature comparison of platforms, installation methods, and capabilities for solopreneurs.">
  <meta name="keywords" content="AI agent skills comparison, Claude Code extensions comparison, Cursor skills comparison, developer tools comparison">
  <link rel="icon" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon.ico">
  <link rel="canonical" href="https://opc.dev/compare">
  <!-- Open Graph Tags -->
  <meta property="og:title" content="AI Agent Skills Comparison 2026 | OPC vs Alternatives">
  <meta property="og:description" content="Feature-by-feature comparison of AI agent skill platforms. Compare OPC Skills with alternatives for Claude Code, Cursor, and Droid.">
  <meta property="og:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
  <meta property="og:url" content="https://opc.dev/compare">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPC Skills">
  <meta property="og:locale" content="en_US">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AI Agent Skills Comparison 2026">
  <meta name="twitter:description" content="Compare OPC Skills with alternatives for Claude Code, Cursor, and Droid.">
  <meta name="twitter:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
  <!-- JSON-LD Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Agent Skills Comparison 2026",
    "description": "Feature-by-feature comparison of AI agent skill platforms for Claude Code, Cursor, and Droid",
    "url": "https://opc.dev/compare",
    "datePublished": "2024-01-01",
    "dateModified": "${today}",
    "inLanguage": "en-US",
    "mainEntity": {
      "@type": "Table",
      "about": "Comparison of AI agent skill platforms including OPC Skills, manual tools, and paid alternatives"
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".intro", "table"]
    }
  }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --font: 'JetBrains Mono', monospace; --black: #000; --white: #fff; --gray-100: #f3f4f6; --gray-200: #e5e7eb; --gray-600: #4b5563; --green: #22c55e; --red: #ef4444; }
    body { font-family: var(--font); background: var(--white); color: var(--black); line-height: 1.6; }
    header { border-bottom: 1px solid var(--black); padding: 16px 24px; }
    .logo { font-size: 14px; font-weight: 700; text-decoration: none; color: var(--black); }
    main { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    .intro { font-size: 13px; color: var(--gray-600); margin-bottom: 32px; max-width: 800px; }
    table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 12px; }
    th, td { border: 1px solid var(--black); padding: 12px; text-align: left; }
    th { background: var(--black); color: var(--white); font-weight: 700; }
    td:first-child { font-weight: 600; }
    .check { color: var(--green); }
    .cross { color: var(--red); }
    .winner { background: #f0fdf4; }
    .methodology { margin-top: 48px; font-size: 12px; color: var(--gray-600); }
    .back-link { display: inline-block; margin-top: 32px; font-size: 12px; color: var(--gray-600); text-decoration: none; }
    .back-link:hover { color: var(--black); text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <a href="/" class="logo">← OPC Skills</a>
  </header>
  <main>
    <h1>AI Agent Skills: Complete Comparison 2026</h1>
    <p class="intro">
      Objective comparison of OPC Skills with alternative AI agent skill collections. 
      This analysis helps solopreneurs and indie hackers choose the right tools for automating research, 
      domain hunting, and social media analysis. Last updated: ${today}.
    </p>
    
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th class="winner">OPC Skills</th>
          <th>Manual Tools</th>
          <th>Paid Alternatives</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Skills</td>
          <td class="winner"><strong>9 specialized skills</strong></td>
          <td>N/A (manual work)</td>
          <td>3-5 tools</td>
        </tr>
        <tr>
          <td>Platform Support</td>
          <td class="winner"><strong>5 platforms</strong> (Claude Code, Cursor, Codex, Droid, OpenCode)</td>
          <td>Platform-dependent</td>
          <td>1-2 platforms</td>
        </tr>
        <tr>
          <td>Installation Time</td>
          <td class="winner"><strong>&lt; 30 seconds</strong></td>
          <td>Hours of setup</td>
          <td>5-15 minutes</td>
        </tr>
        <tr>
          <td>Cost</td>
          <td class="winner"><strong>$0 (MIT License)</strong></td>
          <td>Time cost only</td>
          <td>$49-199/month</td>
        </tr>
        <tr>
          <td>Open Source</td>
          <td class="winner"><span class="check">✓ 100%</span></td>
          <td>N/A</td>
          <td><span class="cross">✗ Proprietary</span></td>
        </tr>
        <tr>
          <td>Reddit Integration</td>
          <td class="winner"><span class="check">✓ Public JSON API</span></td>
          <td>Manual browsing</td>
          <td><span class="check">✓ (paid API)</span></td>
        </tr>
        <tr>
          <td>Twitter/X Integration</td>
          <td class="winner"><span class="check">✓ twitterapi.io</span></td>
          <td>Manual browsing</td>
          <td><span class="check">✓ (official API)</span></td>
        </tr>
        <tr>
          <td>Domain Hunter</td>
          <td class="winner"><span class="check">✓ Price comparison</span></td>
          <td>Manual registrar checks</td>
          <td><span class="cross">✗ Not included</span></td>
        </tr>
        <tr>
          <td>Logo/Banner Creator</td>
          <td class="winner"><span class="check">✓ AI-powered</span></td>
          <td>Hire designer</td>
          <td><span class="cross">✗ Separate tool</span></td>
        </tr>
        <tr>
          <td>SEO/GEO Tools</td>
          <td class="winner"><span class="check">✓ Built-in</span></td>
          <td>Multiple paid tools</td>
          <td><span class="check">✓ (limited)</span></td>
        </tr>
        <tr>
          <td>Product Hunt Integration</td>
          <td class="winner"><span class="check">✓ GraphQL API</span></td>
          <td>Manual browsing</td>
          <td><span class="cross">✗ Not included</span></td>
        </tr>
        <tr>
          <td>API Keys Required</td>
          <td class="winner"><strong>Optional</strong> (most skills work without)</td>
          <td>N/A</td>
          <td>Required</td>
        </tr>
        <tr>
          <td>Maintenance</td>
          <td class="winner"><span class="check">✓ Active updates</span></td>
          <td>Self-maintained</td>
          <td>Vendor-dependent</td>
        </tr>
        <tr>
          <td>Community Support</td>
          <td class="winner"><span class="check">✓ GitHub Issues</span></td>
          <td>N/A</td>
          <td>Email/ticket only</td>
        </tr>
        <tr>
          <td>Learning Curve</td>
          <td class="winner"><strong>Minimal</strong> (AI-native)</td>
          <td>High (multiple tools)</td>
          <td>Medium</td>
        </tr>
      </tbody>
    </table>
    
    <div class="methodology">
      <h2 style="font-size: 16px; margin-bottom: 12px;">Methodology</h2>
      <p>This comparison is based on:</p>
      <ul style="margin-left: 20px; margin-top: 8px;">
        <li>Feature completeness (30%)</li>
        <li>Platform compatibility (25%)</li>
        <li>Installation ease (20%)</li>
        <li>Cost effectiveness (15%)</li>
        <li>Community and maintenance (10%)</li>
      </ul>
      <p style="margin-top: 12px;">
        Data collected from official documentation, GitHub repositories, and user feedback as of ${today}. 
        For detailed information about specific features, visit each tool's official documentation.
      </p>
    </div>
    
    <a href="/" class="back-link">← Back to all skills</a>
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=3600' }
  });
}

// Render blog list page
async function renderBlogListPage(ctx) {
  const blogConfig = await fetchBlogConfig(ctx);
  const posts = blogConfig.posts || [];
  
  const postCards = posts.map(post => `
    <article class="blog-card">
      <a href="/blog/${post.slug}" class="blog-image-link">
        <img src="${post.image}" alt="${post.title}" class="blog-image" loading="lazy">
      </a>
      <div class="blog-content">
        <div class="blog-meta">
          <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <span class="blog-category">${post.category}</span>
        </div>
        <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
        <p class="blog-description">${post.description}</p>
        <div class="blog-footer">
          <span class="read-time">⏱ ${post.readTime}</span>
          <div class="blog-tags">
            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <a href="/blog/${post.slug}" class="read-more">Read Article →</a>
      </div>
    </article>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | OPC Skills - AI Automation Guides for Solopreneurs</title>
  <meta name="description" content="AI automation guides for solopreneurs. Learn to build skills for Claude Code, Cursor & Droid. Tutorials, case studies & best practices for indie hackers.">
  <meta name="keywords" content="AI automation, solopreneur blog, AI agent skills, indie hacker guides, one-person company">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Blog | OPC Skills - AI Automation Guides">
  <meta property="og:description" content="AI automation guides for solopreneurs. Learn to build skills for Claude Code, Cursor & Droid.">
  <meta property="og:url" content="https://opc.dev/blog">
  <meta property="og:image" content="https://opc.dev/opc-banner.png">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Blog | OPC Skills">
  <meta name="twitter:description" content="Learn how to automate solopreneur workflows with AI agent skills.">
  <meta name="twitter:image" content="https://opc.dev/opc-banner.png">
  
  <link rel="canonical" href="https://opc.dev/blog">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --font: 'JetBrains Mono', monospace;
      --font-pixel: 'Press Start 2P', cursive;
      --black: #000;
      --white: #fff;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-600: #4b5563;
      --gray-700: #374151;
    }
    body { font-family: var(--font); background: var(--white); color: var(--black); line-height: 1.5; }
    
    .page-header { border-bottom: 1px solid var(--black); padding: 48px 24px; text-align: center; background: var(--white); }
    .page-header h1 { font-family: var(--font-pixel); font-size: 16px; font-weight: 400; margin-bottom: 12px; }
    .page-header p { font-size: 12px; color: var(--gray-600); }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .back-link {
      display: inline-block;
      font-size: 11px;
      color: var(--gray-600);
      text-decoration: none;
      margin-bottom: 32px;
    }
    .back-link:hover { color: var(--black); text-decoration: underline; }
    
    .blog-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .blog-card {
      background: var(--white);
      border: 1px solid var(--black);
      padding: 0;
      transition: box-shadow 0.2s;
      overflow: hidden;
    }
    .blog-card:hover {
      box-shadow: 4px 4px 0 var(--black);
    }
    .blog-image-link {
      display: block;
      width: 100%;
      border-bottom: 1px solid var(--black);
      overflow: hidden;
      max-height: 200px;
    }
    .blog-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: opacity 0.2s;
    }
    .blog-image-link:hover .blog-image {
      opacity: 0.9;
    }
    .blog-content {
      padding: 24px;
    }
    .blog-meta {
      display: flex;
      gap: 12px;
      font-size: 10px;
      color: var(--gray-600);
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .blog-category {
      border: 1px solid var(--black);
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .blog-card h2 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .blog-card h2 a {
      color: var(--black);
      text-decoration: none;
    }
    .blog-card h2 a:hover { text-decoration: underline; }
    .blog-description {
      color: var(--gray-600);
      font-size: 12px;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .blog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--gray-200);
      flex-wrap: wrap;
      gap: 12px;
    }
    .read-time { font-size: 10px; color: var(--gray-600); }
    .blog-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tag {
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      padding: 3px 8px;
      font-size: 9px;
      color: var(--gray-600);
    }
    .read-more {
      display: inline-block;
      margin-top: 12px;
      font-size: 11px;
      color: var(--gray-600);
      text-decoration: none;
    }
    .read-more:hover { color: var(--black); text-decoration: underline; }
    
    @media (max-width: 768px) {
      .page-header { padding: 32px 16px; }
      .page-header h1 { font-size: 12px; }
      .page-header p { font-size: 11px; }
      .container { padding: 32px 16px; }
      .blog-content { padding: 16px; }
    }
  </style>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "OPC Skills Blog",
    "description": "AI automation guides, tutorials, and case studies for solopreneurs and indie hackers",
    "url": "https://opc.dev/blog",
    "publisher": {
      "@type": "Organization",
      "name": "OPC Skills",
      "url": "https://opc.dev"
    }
  }
  </script>
</head>
<body>
  <div class="page-header">
    <h1>BLOG</h1>
    <p>AI Automation Guides for Solopreneurs & Indie Hackers</p>
  </div>
  
  <div class="container">
    <a href="/" class="back-link">← Back to Home</a>
    
    <div class="blog-grid">
      ${postCards}
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=1800' }
  });
}

// Render individual blog post
async function renderBlogPost(slug, ctx) {
  const blogConfig = await fetchBlogConfig(ctx);
  const post = blogConfig.posts.find(p => p.slug === slug);
  
  if (!post) {
    return new Response('Blog post not found', { status: 404 });
  }

  // Fetch markdown content from GitHub
  const MD_URL = `https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/blog/posts/${slug}.md`;
  let markdown = '';
  
  try {
    const mdRes = await fetch(MD_URL, {
      headers: { 'User-Agent': 'OPC-Skills-Website' }
    });
    if (mdRes.ok) {
      markdown = await mdRes.text();
    }
  } catch (e) {
    console.error('Error fetching markdown:', e);
  }

  const content = markdownToHtml(markdown);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | OPC Skills Blog</title>
  <meta name="description" content="${post.description}">
  <meta name="keywords" content="${post.keywords.join(', ')}">
  <meta name="author" content="${post.author}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.description}">
  <meta property="og:url" content="https://opc.dev/blog/${slug}">
  <meta property="og:image" content="${post.image}">
  <meta property="article:published_time" content="${post.date}T08:00:00Z">
  <meta property="article:author" content="${post.author}">
  <meta property="article:section" content="${post.category}">
  ${post.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ')}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.description}">
  <meta name="twitter:image" content="${post.image}">
  
  <link rel="canonical" href="https://opc.dev/blog/${slug}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --font: 'JetBrains Mono', monospace;
      --font-pixel: 'Press Start 2P', cursive;
      --black: #000;
      --white: #fff;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-600: #4b5563;
      --gray-700: #374151;
    }
    body { font-family: var(--font); background: var(--gray-50); color: var(--black); line-height: 1.6; }
    
    .page-header {
      background: var(--white);
      border-bottom: 1px solid var(--black);
      padding: 24px;
    }
    .breadcrumb {
      max-width: 800px;
      margin: 0 auto;
      font-size: 11px;
    }
    .breadcrumb a {
      color: var(--gray-600);
      text-decoration: none;
    }
    .breadcrumb a:hover { color: var(--black); text-decoration: underline; }
    .breadcrumb span { color: var(--gray-400); margin: 0 8px; }
    
    article {
      max-width: 800px;
      margin: 48px auto;
      padding: 0 24px;
    }
    .article-header {
      background: var(--white);
      border: 1px solid var(--black);
      padding: 32px;
      margin-bottom: 24px;
    }
    .article-header h1 {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 16px;
      color: var(--black);
    }
    .article-meta {
      display: flex;
      gap: 12px;
      color: var(--gray-600);
      font-size: 10px;
      flex-wrap: wrap;
    }
    .article-meta span { display: flex; align-items: center; gap: 4px; }
    .category-badge {
      border: 1px solid var(--black);
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .article-content {
      background: var(--white);
      border: 1px solid var(--black);
      padding: 32px;
    }
    .article-content h2 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 32px;
      margin-bottom: 12px;
      color: var(--black);
    }
    .article-content h3 {
      font-size: 14px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 8px;
      color: var(--black);
    }
    .article-content p {
      font-size: 13px;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .article-content ul, .article-content ol {
      margin-left: 24px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .article-content li { margin-bottom: 6px; }
    .article-content blockquote {
      border-left: 2px solid var(--black);
      padding-left: 16px;
      margin: 24px 0;
      color: var(--gray-600);
      font-style: italic;
      font-size: 12px;
    }
    .article-content code {
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      padding: 2px 6px;
      font-family: monospace;
      font-size: 11px;
    }
    .article-content pre {
      background: var(--black);
      color: var(--white);
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid var(--black);
    }
    .article-content pre code {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
      font-size: 11px;
    }
    .article-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 12px;
    }
    .article-content th, .article-content td {
      border: 1px solid var(--gray-200);
      padding: 8px 12px;
      text-align: left;
    }
    .article-content th {
      background: var(--gray-100);
      font-weight: 700;
    }
    .article-content img {
      max-width: 100%;
      height: auto;
      border: 1px solid var(--gray-200);
      margin: 16px 0;
    }
    .article-content strong { color: var(--black); font-weight: 700; }
    .article-footer {
      background: var(--white);
      border: 1px solid var(--black);
      padding: 24px 32px;
      margin-top: 24px;
    }
    .article-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .tag {
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      padding: 4px 10px;
      font-size: 10px;
      color: var(--gray-600);
    }
    .back-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .back-link {
      color: var(--gray-600);
      text-decoration: none;
      font-size: 11px;
    }
    .back-link:hover { color: var(--black); text-decoration: underline; }
    
    @media (max-width: 768px) {
      .page-header { padding: 16px; }
      .article { padding: 0 16px; margin: 32px auto; }
      .article-header { padding: 24px; }
      .article-header h1 { font-size: 16px; }
      .article-content { padding: 24px; }
      .article-footer { padding: 24px; }
    }
  </style>
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.description}",
    "image": "${post.image}",
    "datePublished": "${post.date}T08:00:00Z",
    "dateModified": "${post.date}T08:00:00Z",
    "author": {
      "@type": "Organization",
      "name": "${post.author}",
      "url": "https://opc.dev"
    },
    "publisher": {
      "@type": "Organization",
      "name": "OPC Skills",
      "logo": {
        "@type": "ImageObject",
        "url": "https://opc.dev/opc-banner.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://opc.dev/blog/${slug}"
    },
    "keywords": ${JSON.stringify(post.keywords)},
    "articleSection": "${post.category}",
    "inLanguage": "en-US"
  }
  </script>
</head>
<body>
  <div class="page-header">
    <div class="breadcrumb">
      <a href="/">Home</a>
      <span>›</span>
      <a href="/blog">Blog</a>
      <span>›</span>
      <span>${post.title}</span>
    </div>
  </div>
  
  <article>
    <header class="article-header">
      <h1>${post.title}</h1>
      <div class="article-meta">
        <span class="category-badge">${post.category}</span>
        <span>📅 ${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>✍️ ${post.author}</span>
        <span>⏱️ ${post.readTime}</span>
      </div>
    </header>
    
    <div class="article-content">
      ${content}
    </div>
    
    <footer class="article-footer">
      <div class="article-tags">
        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
      <div class="back-links">
        <a href="/blog" class="back-link">← All Blog Posts</a>
        <a href="/" class="back-link">← Browse Skills</a>
      </div>
    </footer>
  </article>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=1800' }
  });
}
