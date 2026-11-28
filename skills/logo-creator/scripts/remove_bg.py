#!/usr/bin/env python3
"""
Remove background from image using remove.bg API.

Requires REMOVE_BG_API_KEY environment variable.
Set REMOVE_BG_API_URL to use a remove.bg-compatible API instead
(default: https://api.remove.bg/v1.0/removebg).

Usage:
    python3 remove_bg.py input.png output.png
"""

import sys
import os
import subprocess

DEFAULT_API_URL = 'https://api.remove.bg/v1.0/removebg'


def remove_background(input_path, output_path):
    """
    Remove background from image using remove.bg API.
    
    Args:
        input_path: Path to input image
        output_path: Path to save output image (transparent PNG)
    """
    api_key = os.environ.get('REMOVE_BG_API_KEY')
    
    if not api_key:
        # Try to get from ~/.zshrc
        try:
            result = subprocess.run(
                ['grep', 'REMOVE_BG_API_KEY', os.path.expanduser('~/.zshrc')],
                capture_output=True, text=True
            )
            if result.stdout:
                api_key = result.stdout.split('"')[1]
        except:
            pass
    
    if not api_key:
        print("Error: REMOVE_BG_API_KEY not found in environment or ~/.zshrc")
        print("Get your API key from: https://www.remove.bg/api")
        sys.exit(1)
    
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    api_url = os.environ.get('REMOVE_BG_API_URL') or DEFAULT_API_URL

    # Use curl to call the API
    cmd = [
        'curl', '-s',
        '-H', f'X-Api-Key: {api_key}',
        '-F', f'image_file=@{input_path}',
        '-F', 'size=auto',
        '-F', 'format=png',
        '-o', output_path,
        api_url
    ]
    
    print(f"Removing background from: {input_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        sys.exit(1)
    
    # Check if output is valid
    if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
        print(f"Success! Saved to: {output_path}")
        print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")
    else:
        print("Error: API call failed. Check your API key and quota.")
        if os.path.exists(output_path):
            with open(output_path, 'r') as f:
                print(f.read())
        sys.exit(1)
    
    return output_path


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    remove_background(input_path, output_path)


if __name__ == "__main__":
    main()
