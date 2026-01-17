export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/sitemap.xml') {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://opc.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
    }
    
    if (url.pathname === '/robots.txt') {
      return new Response(`User-agent: *
Allow: /
Sitemap: https://opc.dev/sitemap.xml`, { headers: { 'Content-Type': 'text/plain' } });
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

    // Generate skill cards
    const skillCards = skills.map(s => `
        <div class="skill-card">
          <div class="skill-header">
            <div class="skill-icon">
              <img src="https://cdn.simpleicons.org/${s.icon}/${s.color}" alt="${s.name}" onerror="this.src='${config.logo}'">
            </div>
            <div class="skill-title">
              <h3>${s.name}</h3>
              <span class="version">v${s.version}</span>
            </div>
            <a href="${s.links.github}" target="_blank" class="github-link" title="View on GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
          <p class="skill-desc">${s.description}</p>
          <div class="skill-triggers">${s.triggers.map(t => `<span class="trigger">${t}</span>`).join('')}</div>
          ${s.auth.required ? `<div class="auth-note"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> ${s.auth.note}</div>` : `<div class="auth-note free"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${s.auth.note}</div>`}
          <div class="install-section">
            <div class="install-row">
              <span class="label">Claude</span>
              <code data-cmd="${s.install.claude}">curl ... -t claude ${s.name}</code>
              <button onclick="copyCmd(this)">Copy</button>
            </div>
            <div class="install-row">
              <span class="label">Droid</span>
              <code data-cmd="${s.install.droid}">curl ... -t droid ${s.name}</code>
              <button onclick="copyCmd(this)">Copy</button>
            </div>
            <div class="install-row">
              <span class="label">Cursor</span>
              <code data-cmd="${s.install.cursor}">curl ... -t cursor ${s.name}</code>
              <button onclick="copyCmd(this)">Copy</button>
            </div>
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
  <meta name="description" content="Curated agent skills for solopreneurs and indie hackers. One-click install for Claude, Droid, Cursor, and more.">
  <link rel="canonical" href="https://opc.dev/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --font: 'JetBrains Mono', monospace;
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
    .logo-icon { width: 28px; height: 28px; background: var(--black); color: var(--white); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
    .logo-text { font-size: 16px; font-weight: 700; }
    nav { display: flex; align-items: center; gap: 16px; }
    nav a { font-size: 12px; color: var(--gray-600); text-decoration: none; }
    nav a:hover { color: var(--black); }
    .github-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--black); font-size: 11px; }
    .github-btn:hover { background: var(--gray-100); }
    .github-btn svg { width: 14px; height: 14px; }
    
    .hero { text-align: center; padding: 60px 24px; border-bottom: 1px solid var(--black); }
    .badge { display: inline-block; border: 1px solid var(--black); padding: 5px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
    h1 { font-size: 32px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px; }
    .subtitle { font-size: 14px; color: var(--gray-600); max-width: 480px; margin: 0 auto 24px; }
    .install-all { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--black); color: var(--white); border: none; font-family: var(--font); font-size: 12px; cursor: pointer; }
    .install-all:hover { opacity: 0.9; }
    
    main { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; text-align: center; }
    
    .skills-grid { display: grid; gap: 20px; }
    .skill-card { border: 2px solid var(--black); padding: 24px; }
    .skill-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .skill-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .skill-icon img { width: 28px; height: 28px; object-fit: contain; }
    .skill-title { flex: 1; display: flex; align-items: baseline; gap: 8px; }
    .skill-title h3 { font-size: 16px; font-weight: 700; }
    .version { font-size: 10px; color: var(--gray-400); }
    .github-link { color: var(--gray-400); padding: 4px; }
    .github-link:hover { color: var(--black); }
    .skill-desc { font-size: 12px; color: var(--gray-600); margin-bottom: 12px; line-height: 1.6; }
    .skill-triggers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .trigger { font-size: 9px; padding: 3px 8px; background: var(--gray-100); border: 1px solid var(--gray-200); }
    .auth-note { font-size: 10px; color: var(--gray-600); display: flex; align-items: center; gap: 6px; margin-bottom: 16px; padding: 8px 12px; background: var(--gray-50); border: 1px solid var(--gray-200); }
    .auth-note.free { color: var(--green); background: #f0fdf4; border-color: #bbf7d0; }
    .auth-note svg { flex-shrink: 0; }
    
    .install-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .install-row { display: flex; align-items: center; gap: 8px; }
    .install-row .label { font-size: 10px; font-weight: 600; width: 50px; flex-shrink: 0; }
    .install-row code { flex: 1; font-size: 10px; padding: 6px 10px; background: var(--gray-50); border: 1px solid var(--gray-200); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--font); }
    .install-row button { font-family: var(--font); font-size: 10px; padding: 6px 12px; border: 1px solid var(--black); background: var(--white); cursor: pointer; flex-shrink: 0; }
    .install-row button:hover { background: var(--black); color: var(--white); }
    .install-row button.copied { background: var(--green); color: var(--white); border-color: var(--green); }
    
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
    
    @media (max-width: 640px) {
      h1 { font-size: 24px; }
      .skill-card { padding: 16px; }
      .install-row { flex-wrap: wrap; }
      .install-row .label { width: 100%; margin-bottom: 4px; }
      .install-row code { width: calc(100% - 60px); }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon">O</div>
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
    <div class="badge">${skills.length} Skills</div>
    <h1>Agent Skills for<br>One Person Companies</h1>
    <p class="subtitle">Curated skills for solopreneurs and indie hackers. One-click install for Claude Code, Factory Droid, Cursor, and more.</p>
    <button class="install-all" onclick="copyAllInstall()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg>
      Install All Skills
    </button>
  </section>

  <main>
    <h2 class="section-title">Available Skills</h2>
    <div class="skills-grid">${skillCards}</div>
  </main>

  <footer>
    <p>2026 <a href="https://resciencelab.ai" target="_blank">ReScience Lab</a> | <a href="mailto:hi@opc.dev">hi@opc.dev</a> | <a href="https://github.com/ReScienceLab/opc-skills" target="_blank">GitHub</a> | <a href="/skills.json">API</a></p>
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
    
    function copyAllInstall() {
      const cmd = 'curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t claude all';
      navigator.clipboard.writeText(cmd).then(() => showToast('Install command copied!'));
    }
    
    function showToast(msg = 'Copied to clipboard!') {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
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
  const cacheUrl = new URL('https://opc.dev/_cache/skills.json');
  
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
          'Cache-Control': 'public, max-age=3600'
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
    logo: "https://github.com/ReScienceLab.png",
    skills: [
      {
        name: "reddit",
        version: "1.0.0",
        description: "Search and retrieve content from Reddit via the public JSON API",
        icon: "reddit",
        color: "FF4500",
        triggers: ["reddit", "subreddit", "r/"],
        auth: { required: false, note: "No API key required" },
        install: {
          claude: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t claude reddit",
          droid: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t droid reddit",
          cursor: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t cursor -p reddit"
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
        auth: { required: true, note: "Requires TWITTERAPI_API_KEY" },
        install: {
          claude: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t claude twitter",
          droid: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t droid twitter",
          cursor: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t cursor -p twitter"
        },
        commands: ["python3 scripts/get_user_info.py {username}"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/twitter" }
      },
      {
        name: "domain-hunter",
        version: "1.0.0",
        description: "Search domains, compare prices, find promo codes",
        icon: "globe",
        color: "4A90D9",
        triggers: ["domain", "registrar"],
        auth: { required: false, note: "No API key required" },
        install: {
          claude: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t claude domain-hunter",
          droid: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t droid domain-hunter",
          cursor: "curl -fsSL https://raw.githubusercontent.com/ReScienceLab/opc-skills/main/install.sh | bash -s -- -t cursor -p domain-hunter"
        },
        commands: ["whois {domain}.{tld}"],
        links: { github: "https://github.com/ReScienceLab/opc-skills/tree/main/skills/domain-hunter" }
      }
    ]
  };
}
