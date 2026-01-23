#!/usr/bin/env python3
"""Fetch installation stats from skills.sh and output JSON."""

import json
import re
import sys
import urllib.request

SKILLS_SH_URL = "https://skills.sh/resciencelab/opc-skills"

def fetch_install_stats():
    """Scrape skills.sh page and extract installation counts."""
    try:
        req = urllib.request.Request(
            SKILLS_SH_URL,
            headers={"User-Agent": "OPC-Skills-Stats-Fetcher/1.0"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            html = response.read().decode("utf-8")
    except Exception as e:
        print(f"Error fetching {SKILLS_SH_URL}: {e}", file=sys.stderr)
        sys.exit(1)

    # Extract total installs (e.g., "266<!-- --> total installs")
    total_match = re.search(r"(\d+)(?:<!--\s*-->)?\s*total\s*installs?", html, re.IGNORECASE)
    total = int(total_match.group(1)) if total_match else 0

    # Extract per-skill installs from skill links
    # Pattern: skill name followed by install count in the link structure
    skills = {}
    
    # HTML pattern: href="/resciencelab/opc-skills/{skill}">...<span...>{count}</span>
    skill_pattern = re.compile(
        r'href="/resciencelab/opc-skills/([a-z0-9-]+)"[^>]*>.*?'
        r'<span[^>]*class="[^"]*font-mono[^"]*"[^>]*>(\d+)</span>',
        re.IGNORECASE | re.DOTALL
    )
    
    for match in skill_pattern.finditer(html):
        skill_name = match.group(1).lower()
        count = int(match.group(2))
        # Skip template skill
        if skill_name != "skill-name":
            skills[skill_name] = count

    result = {
        "total": total,
        "skills": skills,
        "source": SKILLS_SH_URL
    }
    
    return result

if __name__ == "__main__":
    stats = fetch_install_stats()
    print(json.dumps(stats, indent=2))
