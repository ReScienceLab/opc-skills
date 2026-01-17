#!/bin/bash

# OPC Skills Installer
# Install agent skills to Claude Code, Factory Droid, OpenCode, or custom directories

set -e

REPO_URL="https://github.com/ReScienceLab/opc-skills"
REPO_RAW="https://raw.githubusercontent.com/ReScienceLab/opc-skills/main"
SKILLS_DIR="skills"
TEMP_DIR=""
CLEANUP_TEMP="false"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       OPC Skills Installer             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

cleanup() {
    if [ "$CLEANUP_TEMP" = "true" ] && [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

# Available skills
AVAILABLE_SKILLS="reddit twitter domain-hunter producthunt"

# Track installed skills to avoid duplicates
INSTALLED_SKILLS=""

# Get dependencies for a skill
get_skill_deps() {
    local skill=$1
    case $skill in
        reddit) echo "" ;;
        twitter) echo "" ;;
        domain-hunter) echo "twitter reddit" ;;
        producthunt) echo "" ;;
        *) echo "" ;;
    esac
}

show_help() {
    echo "Usage: ./install.sh [OPTIONS] <skill>"
    echo ""
    echo "Skills:"
    echo "  reddit         Reddit content search via public JSON API"
    echo "  twitter        Twitter/X search via twitterapi.io"
    echo "  domain-hunter  Domain search and price comparison"
    echo "  producthunt    Product Hunt posts, topics, users, collections"
    echo "  all            Install all skills"
    echo ""
    echo "Options:"
    echo "  -t, --tool TOOL    Target tool: claude, droid, opencode, cursor, custom"
    echo "  -d, --dir DIR      Custom skills directory (use with -t custom)"
    echo "  -p, --project      Install to current project (default: user-level/global)"
    echo "  --no-deps          Don't install dependencies"
    echo "  -h, --help         Show this help"
    echo ""
    echo "Installation Levels:"
    echo "  User-level (default): Skills available to you across ALL projects"
    echo "  Project-level (-p):   Skills shared with anyone working in THIS repo"
    echo ""
    echo "Examples:"
    echo "  # User-level install (available everywhere)"
    echo "  curl -fsSL .../install.sh | bash -s -- -t claude reddit"
    echo "  curl -fsSL .../install.sh | bash -s -- -t droid all"
    echo ""
    echo "  # Project-level install (shared with team)"
    echo "  curl -fsSL .../install.sh | bash -s -- -t claude -p reddit"
    echo "  curl -fsSL .../install.sh | bash -s -- -t droid -p all"
    echo ""
    echo "Directories:"
    echo "  Tool        User-level (~)              Project-level (.)"
    echo "  ─────────   ─────────────────────────   ─────────────────────"
    echo "  claude      ~/.claude/skills            .claude/skills"
    echo "  droid       ~/.factory/skills           .factory/skills"
    echo "  cursor      -                           .cursor/skills"
    echo "  opencode    ~/.config/opencode/skills   -"
    echo "  codex       ~/.codex/skills             .codex/skills"
}

get_skills_dir() {
    local tool=$1
    local project=$2

    case $tool in
        claude)
            if [ "$project" = "true" ]; then
                echo ".claude/skills"
            else
                echo "$HOME/.claude/skills"
            fi
            ;;
        droid)
            if [ "$project" = "true" ]; then
                echo ".factory/skills"
            else
                echo "$HOME/.factory/skills"
            fi
            ;;
        cursor)
            echo ".cursor/skills"
            ;;
        opencode)
            echo "$HOME/.config/opencode/skills"
            ;;
        codex)
            if [ "$project" = "true" ]; then
                echo ".codex/skills"
            else
                echo "$HOME/.codex/skills"
            fi
            ;;
        *)
            echo ""
            ;;
    esac
}

download_skill() {
    local skill=$1
    local target_dir=$2
    
    print_info "Downloading $skill..."
    
    mkdir -p "$target_dir/$skill"
    
    # Download SKILL.md
    curl -fsSL "$REPO_RAW/skills/$skill/SKILL.md" -o "$target_dir/$skill/SKILL.md" 2>/dev/null || {
        print_error "Failed to download $skill/SKILL.md"
        return 1
    }
    
    # Get list of files in skill directory from GitHub API
    local files_json=$(curl -fsSL "https://api.github.com/repos/ReScienceLab/opc-skills/contents/skills/$skill" 2>/dev/null)
    
    # Download scripts directory if exists
    if echo "$files_json" | grep -q '"name": *"scripts"'; then
        mkdir -p "$target_dir/$skill/scripts"
        local scripts_json=$(curl -fsSL "https://api.github.com/repos/ReScienceLab/opc-skills/contents/skills/$skill/scripts" 2>/dev/null)
        
        # Parse and download each script file
        echo "$scripts_json" | grep -o '"download_url": *"[^"]*"' | cut -d'"' -f4 | while read -r url; do
            if [ -n "$url" ] && [ "$url" != "null" ]; then
                local filename=$(basename "$url")
                curl -fsSL "$url" -o "$target_dir/$skill/scripts/$filename" 2>/dev/null
            fi
        done
    fi
    
    # Download references directory if exists
    if echo "$files_json" | grep -q '"name": *"references"'; then
        mkdir -p "$target_dir/$skill/references"
        local refs_json=$(curl -fsSL "https://api.github.com/repos/ReScienceLab/opc-skills/contents/skills/$skill/references" 2>/dev/null)
        
        echo "$refs_json" | grep -o '"download_url": *"[^"]*"' | cut -d'"' -f4 | while read -r url; do
            if [ -n "$url" ] && [ "$url" != "null" ]; then
                local filename=$(basename "$url")
                curl -fsSL "$url" -o "$target_dir/$skill/references/$filename" 2>/dev/null
            fi
        done
    fi
    
    print_success "Installed $skill to $target_dir/$skill"
}

# Install a skill with its dependencies
install_with_deps() {
    local skill=$1
    local target_dir=$2
    local source_dir=$3
    local use_local=$4
    
    # Skip if already installed
    if echo "$INSTALLED_SKILLS" | grep -q " $skill "; then
        return 0
    fi
    
    # Get dependencies
    local deps=$(get_skill_deps "$skill")
    
    # Install dependencies first
    if [ -n "$deps" ] && [ "$INSTALL_DEPS" = "true" ]; then
        for dep in $deps; do
            if ! echo "$INSTALLED_SKILLS" | grep -q " $dep "; then
                print_info "Installing dependency: $dep"
                install_with_deps "$dep" "$target_dir" "$source_dir" "$use_local"
            fi
        done
    fi
    
    # Install the skill itself
    if [ "$use_local" = "true" ]; then
        install_skill_from_local "$skill" "$target_dir" "$source_dir"
    else
        download_skill "$skill" "$target_dir"
    fi
    
    INSTALLED_SKILLS="$INSTALLED_SKILLS $skill "
}

install_skill_from_local() {
    local skill=$1
    local target_dir=$2
    local source_dir=$3

    if [ ! -d "$source_dir/$skill" ]; then
        print_error "Skill '$skill' not found in $source_dir"
        return 1
    fi

    mkdir -p "$target_dir"
    
    if [ -d "$target_dir/$skill" ]; then
        print_warning "Skill '$skill' already exists, updating..."
        rm -rf "$target_dir/$skill"
    fi

    cp -r "$source_dir/$skill" "$target_dir/"
    print_success "Installed $skill to $target_dir/$skill"
}

# Parse arguments
TOOL=""
CUSTOM_DIR=""
PROJECT="false"
SKILL=""
INSTALL_DEPS="true"

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tool)
            TOOL="$2"
            shift 2
            ;;
        -d|--dir)
            CUSTOM_DIR="$2"
            shift 2
            ;;
        -p|--project)
            PROJECT="true"
            shift
            ;;
        --no-deps)
            INSTALL_DEPS="false"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            SKILL="$1"
            shift
            ;;
    esac
done

# Validate inputs
if [ -z "$SKILL" ]; then
    print_header
    echo "Select a skill to install:"
    echo ""
    echo "  1) reddit         - Reddit content search"
    echo "  2) twitter        - Twitter/X search"
    echo "  3) domain-hunter  - Domain price comparison"
    echo "  4) producthunt    - Product Hunt search"
    echo "  5) all            - All skills"
    echo ""
    read -p "Enter choice [1-5]: " choice
    case $choice in
        1) SKILL="reddit" ;;
        2) SKILL="twitter" ;;
        3) SKILL="domain-hunter" ;;
        4) SKILL="producthunt" ;;
        5) SKILL="all" ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
fi

if [ -z "$TOOL" ]; then
    echo ""
    echo "Select target tool:"
    echo ""
    echo "  1) claude    - Claude Code"
    echo "  2) droid     - Factory Droid"
    echo "  3) cursor    - Cursor"
    echo "  4) opencode  - OpenCode"
    echo "  5) codex     - OpenAI Codex"
    echo "  6) custom    - Custom directory"
    echo ""
    read -p "Enter choice [1-6]: " choice
    case $choice in
        1) TOOL="claude" ;;
        2) TOOL="droid" ;;
        3) TOOL="cursor" ;;
        4) TOOL="opencode" ;;
        5) TOOL="codex" ;;
        6) TOOL="custom" ;;
        *) print_error "Invalid choice"; exit 1 ;;
    esac
fi

# Get target directory
if [ "$TOOL" = "custom" ]; then
    if [ -z "$CUSTOM_DIR" ]; then
        read -p "Enter custom skills directory: " CUSTOM_DIR
    fi
    TARGET_DIR="$CUSTOM_DIR"
else
    TARGET_DIR=$(get_skills_dir "$TOOL" "$PROJECT")
fi

if [ -z "$TARGET_DIR" ]; then
    print_error "Unknown tool: $TOOL"
    exit 1
fi

# Determine source: local repo or download from GitHub
SCRIPT_DIR=""
SOURCE_DIR=""
USE_LOCAL="false"

# Try to detect if running from local repo (not piped via curl)
if [ -n "${BASH_SOURCE[0]:-}" ] && [ "${BASH_SOURCE[0]}" != "bash" ] && [ -f "${BASH_SOURCE[0]}" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || true
    if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/$SKILLS_DIR" ]; then
        SOURCE_DIR="$SCRIPT_DIR/$SKILLS_DIR"
        USE_LOCAL="true"
    fi
fi

print_header
echo "Installing to: $TARGET_DIR"
echo ""

# Check if running from local repo
if [ "$USE_LOCAL" = "true" ]; then
    print_info "Using local repository..."
else
    print_info "Downloading from GitHub..."
fi

mkdir -p "$TARGET_DIR"

# Install skill(s) with dependencies
if [ "$SKILL" = "all" ]; then
    for s in $AVAILABLE_SKILLS; do
        install_with_deps "$s" "$TARGET_DIR" "$SOURCE_DIR" "$USE_LOCAL"
    done
else
    # Show dependencies info
    deps=$(get_skill_deps "$SKILL")
    if [ -n "$deps" ] && [ "$INSTALL_DEPS" = "true" ]; then
        print_info "Will also install dependencies: $deps"
    fi
    install_with_deps "$SKILL" "$TARGET_DIR" "$SOURCE_DIR" "$USE_LOCAL"
fi

echo ""
print_success "Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Restart your AI coding assistant"
echo "  2. Try: 'Use the $SKILL skill to...'"
