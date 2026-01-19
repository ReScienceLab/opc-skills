export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/sitemap.xml') {
      const config = await fetchSkillsConfig(ctx);
      const skills = config.skills || [];
      const today = new Date().toISOString().split('T')[0];
      
      const skillUrls = skills.map(s => `
  <url>
    <loc>https://opc.dev/#skill-${s.name}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
    <loc>https://opc.dev/skills.json</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>${skillUrls}
</urlset>`;
      return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
    }
    
    if (url.pathname === '/robots.txt') {
      return new Response(`User-agent: *
Allow: /
Sitemap: https://opc.dev/sitemap.xml`, { headers: { 'Content-Type': 'text/plain' } });
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

    // Fetch skills from config
    const config = await fetchSkillsConfig(ctx);
    const skills = config.skills || [];

    // Generate JSON-LD structured data for skills
    const skillsJsonLd = skills.map(s => ({
      "@type": "SoftwareApplication",
      "name": s.name,
      "description": s.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cross-platform",
      "offers": {
        "@type": "Offer",
        "price": s.auth.required ? "0" : "0",
        "priceCurrency": "USD"
      },
      "url": `https://opc.dev/#skill-${s.name}`
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "OPC Skills",
          "url": "https://opc.dev",
          "description": "Curated agent skills for solopreneurs and indie hackers. One-click install for Claude, Droid, Cursor, and more.",
          "publisher": {
            "@type": "Organization",
            "name": "ReScience Lab",
            "url": "https://rescience.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-logo.svg"
            }
          }
        },
        {
          "@type": "Organization",
          "name": "ReScience Lab",
          "url": "https://rescience.com",
          "logo": "https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-logo.svg",
          "sameAs": [
            "https://github.com/ReScienceLab"
          ]
        },
        {
          "@type": "ItemList",
          "name": "OPC Skills Collection",
          "description": "Agent skills for one person companies",
          "numberOfItems": skills.length,
          "itemListElement": skillsJsonLd.map((skill, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": skill
          }))
        }
      ]
    };

    // Generate skill cards
    const skillCards = skills.map(s => `
        <div class="skill-card" id="skill-${s.name}">
          <div class="skill-header">
            <div class="skill-icon">
              <img src="${s.logo || `https://cdn.simpleicons.org/${s.icon}/${s.color}`}" alt="${s.name} skill icon" loading="lazy" decoding="async" width="28" height="28" onerror="this.src='https://cdn.simpleicons.org/${s.icon}/${s.color}'">
            </div>
            <div class="skill-title">
              <h3>${s.name}</h3>
              <span class="version">v${s.version}</span>
            </div>
            ${s.auth.required ? `<span class="auth-tag paid">API Key</span>` : `<span class="auth-tag free">Free</span>`}
            ${s.links.example ? `<a href="${s.links.example}" target="_blank" class="example-link" title="View Example">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </a>` : ''}
            <a href="${s.links.github}" target="_blank" class="github-link" title="View on GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
          <p class="skill-desc">${s.description}</p>
          ${s.dependencies && s.dependencies.length > 0 ? `<div class="skill-deps"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg> Depends on: ${s.dependencies.map(d => `<span class="dep-tag">${d}</span>`).join('')}</div>` : ''}
          <div class="skill-triggers">${s.triggers.map(t => `<span class="trigger">${t}</span>`).join('')}</div>
          <div class="install-section">
            <div class="install-tabs level-tabs">
              <button class="tab-btn active" onclick="switchLevel(this, 'user')">User-level</button>
              <button class="tab-btn" onclick="switchLevel(this, 'project')">Project-level</button>
            </div>
            <div class="tab-hint user-hint">Available across ALL your projects</div>
            <div class="tab-hint project-hint" style="display:none">Shared with team in this repo</div>
            <div class="install-tabs platform-tabs">
              <button class="tab-btn active" data-platform="claude" onclick="switchPlatform(this, 'claude')">Claude</button>
              <button class="tab-btn" data-platform="droid" onclick="switchPlatform(this, 'droid')">Droid</button>
              <button class="tab-btn" data-platform="opencode" onclick="switchPlatform(this, 'opencode')">OpenCode</button>
              <button class="tab-btn" data-platform="codex" onclick="switchPlatform(this, 'codex')">Codex</button>
              <button class="tab-btn" data-platform="cursor" onclick="switchPlatform(this, 'cursor')">Cursor</button>
            </div>
            <div class="install-cmd">
              <code class="cmd-display" 
                data-user-claude="${s.install.user?.claude || ''}"
                data-user-droid="${s.install.user?.droid || ''}"
                data-user-opencode="${s.install.user?.opencode || ''}"
                data-user-codex="${s.install.user?.codex || ''}"
                data-user-cursor=""
                data-project-claude="${s.install.project?.claude || ''}"
                data-project-droid="${s.install.project?.droid || ''}"
                data-project-opencode="${s.install.project?.opencode || ''}"
                data-project-codex="${s.install.project?.codex || ''}"
                data-project-cursor="${s.install.project?.cursor || ''}"
              >${s.install.user?.claude || ''}</code>
              <button class="copy-btn" onclick="copyCmdNew(this)">Copy</button>
            </div>
            <div class="platform-note cursor-note" style="display:none">Cursor only supports project-level</div>
          </div>
          <details class="commands-section">
            <summary>Example Commands</summary>
            <div class="commands-list">
              ${s.commands.map(cmd => `<code>${cmd}</code>`).join('')}
            </div>
          </details>
        </div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPC Skills - Agent Skills for One Person Companies</title>
  <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/apple-touch-icon.png">
  <meta name="description" content="Curated agent skills for solopreneurs and indie hackers. One-click install for Claude, Droid, Cursor, and more.">
  <meta name="keywords" content="agent skills, claude skills, AI tools, solopreneurs, indie hackers, one person company, automation, Claude Code, Factory Droid, Cursor, OpenCode, Codex, developer tools, AI agents">
  <meta name="robots" content="index, follow">
  <meta name="author" content="ReScience Lab">
  <meta name="theme-color" content="#000000">
  <meta http-equiv="Content-Language" content="en">
  <link rel="canonical" href="https://opc.dev/">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta property="og:title" content="OPC Skills - Agent Skills for One Person Companies">
  <meta property="og:description" content="Curated agent skills for solopreneurs and indie hackers. One-click install for Claude, Droid, Cursor, and more.">
  <meta property="og:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
  <meta property="og:url" content="https://opc.dev/">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC Skills - Agent Skills for One Person Companies">
  <meta name="twitter:description" content="Curated agent skills for solopreneurs and indie hackers. One-click install for Claude, Droid, Cursor, and more.">
  <meta name="twitter:image" content="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/og-image.png">
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
    .subtitle { font-size: 14px; color: var(--gray-600); max-width: 480px; margin: 0 auto 24px; }
    .hero-install { max-width: 600px; margin: 0 auto; width: 100%; }
    .hero-level-tabs { border-bottom: 1px solid var(--black); }
    .hero-tool-tabs { border-bottom: none; }
    .hero-tabs { display: flex; border: 1px solid var(--black); border-bottom: none; }
    .hero-tab { flex: 1; padding: 8px 12px; background: var(--white); border: none; font-family: var(--font); font-size: 11px; cursor: pointer; border-right: 1px solid var(--black); }
    .hero-tab:last-child { border-right: none; }
    .hero-tab.active { background: var(--black); color: var(--white); }
    .hero-tab.disabled { opacity: 0.4; cursor: not-allowed; }
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
    .skill-deps { font-size: 10px; color: var(--gray-600); display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .skill-deps svg { flex-shrink: 0; }
    .dep-tag { font-size: 9px; padding: 2px 6px; background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; margin-left: 4px; }
    .skill-triggers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; align-items: center; }
    .trigger { font-size: 9px; padding: 3px 8px; background: var(--gray-100); border: 1px solid var(--gray-200); }
    .auth-tag { font-size: 9px; padding: 3px 8px; font-weight: 500; line-height: 1; }
    .auth-tag.free { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .auth-tag.paid { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
    
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
      .install-cmd code { width: 100%; font-size: 8px; padding: 10px; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; display: block; }
      .install-cmd .copy-btn { width: 100%; padding: 10px; }
      
      .commands-list code { font-size: 9px; white-space: nowrap; overflow-x: auto; display: block; }
      
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
        <a href="https://github.com/ReScienceLab/opc-skills" target="_blank" class="github-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
        <a href="mailto:hi@opc.dev">Contact</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <img src="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/website/opc-banner.png" alt="OPC Skills - Agent Skills for One Person Companies banner" class="hero-banner" fetchpriority="high" decoding="async">
    <h1>Agent Skills for<br>One Person Companies</h1>
    <p class="subtitle">Curated skills for solopreneurs and indie hackers. One-click install for Claude Code, Factory Droid, Cursor, and more.</p>
    <div class="hero-install">
      <div class="hero-tabs hero-level-tabs">
        <button class="hero-tab active" data-level="user">User-level</button>
        <button class="hero-tab" data-level="project">Project-level</button>
      </div>
      <div class="hero-tabs hero-tool-tabs">
        <button class="hero-tab active" data-tool="claude">Claude</button>
        <button class="hero-tab" data-tool="droid">Droid</button>
        <button class="hero-tab" data-tool="opencode">OpenCode</button>
        <button class="hero-tab" data-tool="codex">Codex</button>
        <button class="hero-tab" data-tool="cursor">Cursor</button>
      </div>
      <div class="hero-cmd">
        <code id="hero-cmd-code" data-cmd="curl -fsSL opc.dev/install.sh | bash -s -- -t claude all">curl -fsSL opc.dev/install.sh | bash -s -- -t claude all</code>
        <button class="copy-btn" onclick="copyHeroCmd(this)">Copy</button>
      </div>
    </div>
  </section>

  <main>
    <h2 class="section-title">Available Skills</h2>
    <div class="skills-grid">${skillCards}</div>
  </main>

  <footer>
    <p>2026 <a href="https://rescience.com" target="_blank">ReScience Lab</a> | <a href="mailto:hi@opc.dev">hi@opc.dev</a> | <a href="https://github.com/ReScienceLab/opc-skills" target="_blank">GitHub</a> | <a href="/skills.json">API</a></p>
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
        commands: ["python3 scripts/get_posts.py --limit 20"],
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
