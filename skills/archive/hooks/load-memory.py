#!/usr/bin/env python3
import json
import os
import sys

project_dir = (
    os.environ.get("FACTORY_PROJECT_DIR")
    or os.environ.get("CLAUDE_PROJECT_DIR")
    or os.getcwd()
)
memory_file = os.path.join(project_dir, ".archive", "MEMORY.md")

if os.path.exists(memory_file):
    with open(memory_file, "r", encoding="utf-8") as f:
        content = f.read()

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": f"## Archived Project Knowledge (.archive/MEMORY.md)\n\n{content}",
        }
    }
    print(json.dumps(output))

sys.exit(0)
