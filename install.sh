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
    echo -e "${BLUE}"
    cat << 'EOF'
                    __        
 ___  ___  ____ ___/ /__ _  __
/ _ \/ _ \/ __// _  / -_) |/ /
\___/ .__/\__(_)_,_/\__/|___/ 
   /_/                        
EOF
    echo -e "${NC}"
    echo -e "${BLUE}       Skills Installer${NC}"
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

# Track installed skills to avoid duplicates
INSTALLED_SKILLS=""

# Path to skills.json (set after determining source)
SKILLS_JSON_PATH=""
SKILLS_JSON_CONTENT=""

# Check if jq is available
check_jq() {
    if command -v jq &> /dev/null; then
        return 0
    fi
    
    print_warning "jq not found, attempting to install..."
    
    if command -v brew &> /dev/null; then
        brew install jq 2>/dev/null && return 0
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install -y jq 2>/dev/null && return 0
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq 2>/dev/null && return 0
    elif command -v apk &> /dev/null; then
        sudo apk add jq 2>/dev/null && return 0
    fi
    
    print_error "Please install jq: https://stedolan.github.io/jq/download/"
    exit 1
}

# Load skills.json content
load_skills_json() {
    if [ -n "$SKILLS_JSON_CONTENT" ]; then
        return 0
    fi

    if [ "$USE_LOCAL" = "true" ] && [ -f "$SCRIPT_DIR/skills.json" ]; then
        SKILLS_JSON_PATH="$SCRIPT_DIR/skills.json"
        SKILLS_JSON_CONTENT=$(cat "$SKILLS_JSON_PATH")
    else
        # Download skills.json from GitHub
        SKILLS_JSON_CONTENT=$(curl -fsSL "$REPO_RAW/skills.json" 2>/dev/null) || {
            print_error "Could not load skills.json"
            exit 1
        }
    fi
}

# Get all available skill names from skills.json
get_available_skills() {
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r '.skills[].name' | tr '\n' ' '
}

# Validate if a skill exists in skills.json
validate_skill() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -e --arg s "$skill" \
        '.skills[] | select(.name == $s)' > /dev/null 2>&1
}

# Get dependencies for a skill from skills.json
get_skill_deps() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .dependencies // [] | .[]' 2>/dev/null | tr '\n' ' '
}

# Get skill description from skills.json
get_skill_description() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .description // ""' 2>/dev/null
}

# Check if skill requires authentication
skill_requires_auth() {
    local skill=$1
    load_skills_json || return 1
    
    local required=$(echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .auth.required // false' 2>/dev/null)
    
    if [ "$required" = "true" ]; then
        return 0  # true - requires auth
    else
        return 1  # false - no auth
    fi
}

# Get environment variable name for skill auth
get_skill_env_var() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .auth.env_var // empty' 2>/dev/null
}

# Get auth note/instructions for skill
get_skill_auth_note() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .auth.note // empty' 2>/dev/null
}

# Get example URL for skill from links.example
get_skill_example_url() {
    local skill=$1
    load_skills_json || return 1
    echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill" \
        '.skills[] | select(.name == $s) | .links.example // empty' 2>/dev/null
}

# Detect user's shell profile
get_shell_profile() {
    local shell_name=$(basename "$SHELL")
    case $shell_name in
        zsh) echo "$HOME/.zshrc" ;;
        bash)
            if [ -f "$HOME/.bash_profile" ]; then
                echo "$HOME/.bash_profile"
            else
                echo "$HOME/.bashrc"
            fi
            ;;
        fish) echo "$HOME/.config/fish/config.fish" ;;
        *) echo "$HOME/.profile" ;;
    esac
}

# Check if an environment variable is set
is_env_var_set() {
    local var_name=$1
    eval "[ -n \"\${$var_name:-}\" ]"
}

# Print auth instructions for a single skill
print_skill_auth_instructions() {
    local skill=$1
    local is_dependency=$2
    local env_var=$(get_skill_env_var "$skill")
    local auth_note=$(get_skill_auth_note "$skill")
    local shell_profile=$(get_shell_profile)

    # Check if API key is already configured
    if is_env_var_set "$env_var"; then
        if [ "$is_dependency" = "true" ]; then
            print_success "$skill skill (dependency): API key already configured (\$$env_var)"
        else
            print_success "$skill skill: API key already configured (\$$env_var)"
        fi
        return 0
    fi

    # API key not configured - show instructions
    if [ "$is_dependency" = "true" ]; then
        echo -e "${YELLOW}⚠  Dependency requires API Key:${NC}"
        echo "   The $skill skill (dependency) requires authentication:"
    else
        echo -e "${YELLOW}⚠  API Key Required:${NC}"
    fi
    echo ""
    echo "   Environment variable: $env_var"
    if [ -n "$auth_note" ]; then
        echo "   $auth_note"
    fi
    echo ""
    echo "   Add to your shell profile ($shell_profile):"
    echo ""
    echo -e "   ${BLUE}export $env_var=\"your_api_key_here\"${NC}"
    echo ""
    echo "   Then run: source $shell_profile"
    echo ""
}

# Print post-install instructions with auth awareness
print_post_install_instructions() {
    local skill=$1
    local installed_skills=$2

    echo ""
    print_success "Installation complete!"

    # Collect all skills that need auth (main skill + dependencies)
    local skills_needing_auth=""
    local skills_no_auth=""

    for s in $installed_skills; do
        if skill_requires_auth "$s"; then
            skills_needing_auth="$skills_needing_auth $s"
        else
            skills_no_auth="$skills_no_auth $s"
        fi
    done

    # Trim whitespace
    skills_needing_auth=$(echo "$skills_needing_auth" | xargs)
    skills_no_auth=$(echo "$skills_no_auth" | xargs)

    # Show dependencies info if installed multiple skills
    local skill_count=$(echo "$installed_skills" | wc -w | xargs)
    if [ "$skill_count" -gt 1 ]; then
        local deps_list=""
        for s in $installed_skills; do
            if [ "$s" != "$skill" ]; then
                if [ -z "$deps_list" ]; then
                    deps_list="$s"
                else
                    deps_list="$deps_list, $s"
                fi
            fi
        done
        if [ -n "$deps_list" ]; then
            echo "  Installed: $skill (+ dependencies: $deps_list)"
        fi
    fi
    echo ""

    # Track which skills have missing API keys
    local skills_missing_keys=""

    # Print auth instructions for skills that need them
    if [ -n "$skills_needing_auth" ]; then
        # Get dependencies for the main skill
        local main_deps=""
        if [ "$skill" != "all" ]; then
            main_deps=$(get_skill_deps "$skill")
        fi

        for s in $skills_needing_auth; do
            # Check if this skill is a dependency (not the main skill and not "all" install)
            local is_dep="false"
            if [ "$skill" != "all" ] && [ "$s" != "$skill" ]; then
                # Check if it's in the dependencies list
                if echo " $main_deps " | grep -q " $s "; then
                    is_dep="true"
                fi
            fi
            
            # Check if API key is missing for this skill
            local env_var=$(get_skill_env_var "$s")
            if ! is_env_var_set "$env_var"; then
                skills_missing_keys="$skills_missing_keys $s"
            fi
            
            print_skill_auth_instructions "$s" "$is_dep"
        done
    fi

    # Trim whitespace
    skills_missing_keys=$(echo "$skills_missing_keys" | xargs)

    # Show status of skills that don't need auth
    if [ -n "$skills_no_auth" ]; then
        for s in $skills_no_auth; do
            print_success "$s skill: No API key required"
        done
        echo ""
    fi

    # If no auth required at all, show simple ready message
    if [ -z "$skills_needing_auth" ]; then
        print_success "No API key required - ready to use!"
        echo ""
    fi

    # Next steps
    echo "Next steps:"
    local example_skill="$skill"
    if [ "$skill" = "all" ]; then
        # Pick a good example skill from the installed list
        example_skill=$(echo "$installed_skills" | awk '{print $1}')
    fi

    if [ -n "$skills_missing_keys" ]; then
        echo "  1. Configure the missing API key(s) above"
        echo "  2. Restart your AI coding assistant"
        echo "  3. Try: 'Use the $example_skill skill to...'"
    else
        echo "  1. Restart your AI coding assistant"
        echo "  2. Try: 'Use the $example_skill skill to...'"
    fi

    # Show example URL if available for the main skill
    local example_url=$(get_skill_example_url "$skill")
    if [ -n "$example_url" ]; then
        echo ""
        echo -e "${BLUE}Example:${NC} $example_url"
    fi
}

show_help() {
    echo "Usage: ./install.sh [OPTIONS] <skill>"
    echo ""
    echo "Skills:"
    # Dynamically list skills from skills.json
    load_skills_json 2>/dev/null
    if [ -n "$SKILLS_JSON_CONTENT" ]; then
        echo "$SKILLS_JSON_CONTENT" | jq -r '.skills[] | "  \(.name | . + " " * (15 - length)) \(.description | .[0:50])..."' 2>/dev/null || {
            echo "  (run with -h after jq is installed to see skill list)"
        }
    else
        echo "  (skills list loaded from skills.json)"
    fi
    echo "  all              Install all skills"
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
    echo "  opencode    ~/.config/opencode/skills   .opencode/skills"
    echo "  codex       ~/.codex/skills             .codex/skills"
    echo ""
    echo "Notes:"
    echo "  - Codex requires: codex --enable skills"
    echo "  - OpenCode uses singular 'skill' dir internally, symlink may be needed"
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
            if [ "$project" = "true" ]; then
                echo ".opencode/skills"
            else
                echo "$HOME/.config/opencode/skills"
            fi
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
    
    # Build dynamic menu from skills.json
    load_skills_json
    SKILL_NAMES=$(echo "$SKILLS_JSON_CONTENT" | jq -r '.skills[].name')
    SKILL_COUNT=$(echo "$SKILL_NAMES" | wc -l | xargs)
    
    local i=1
    while IFS= read -r skill_name; do
        local desc=$(echo "$SKILLS_JSON_CONTENT" | jq -r --arg s "$skill_name" \
            '.skills[] | select(.name == $s) | .description | .[0:40]' 2>/dev/null)
        printf "  %d) %-15s - %s...\n" "$i" "$skill_name" "$desc"
        ((i++))
    done <<< "$SKILL_NAMES"
    
    echo "  $i) all            - All skills"
    echo ""
    
    local all_choice=$i
    read -p "Enter choice [1-$all_choice]: " choice
    
    if [ "$choice" = "$all_choice" ]; then
        SKILL="all"
    elif [ "$choice" -ge 1 ] && [ "$choice" -lt "$all_choice" ] 2>/dev/null; then
        SKILL=$(echo "$SKILL_NAMES" | sed -n "${choice}p")
    else
        print_error "Invalid choice"
        exit 1
    fi
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

# Check jq is available (required for parsing skills.json)
check_jq

# Load skills.json early
load_skills_json

# Validate skill name if not "all"
if [ "$SKILL" != "all" ]; then
    if ! validate_skill "$SKILL"; then
        print_error "Unknown skill: $SKILL"
        echo ""
        echo "Available skills:"
        get_available_skills | tr ' ' '\n' | sed 's/^/  /'
        exit 1
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
    ALL_SKILLS=$(get_available_skills)
    for s in $ALL_SKILLS; do
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

# Print auth-aware post-install instructions
print_post_install_instructions "$SKILL" "$INSTALLED_SKILLS"
