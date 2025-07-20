#!/bin/bash

# Tinybird Branch Cleanup Script
# This script helps clean up stale Tinybird branches

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=true
PATTERN=""
CLEANUP_CI=true
CLEANUP_DEV=true

# Help function
show_help() {
    echo "Tinybird Branch Cleanup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -f, --force          Actually delete branches (default is dry run)"
    echo "  -p, --pattern REGEX  Only cleanup branches matching this pattern"
    echo "  --ci-only            Only cleanup CI branches (ci_pr_*)"
    echo "  --dev-only           Only cleanup dev branches (*__dev_*)"
    echo "  -y, --yes            Skip confirmation prompts"
    echo ""
    echo "Examples:"
    echo "  $0                           # Dry run, show what would be deleted"
    echo "  $0 --force                   # Delete all stale branches"
    echo "  $0 --force --ci-only         # Delete only stale CI branches"
    echo "  $0 --pattern 'feature_.*'    # Only branches matching pattern"
}

# Parse command line arguments
SKIP_CONFIRM=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            DRY_RUN=false
            shift
            ;;
        -p|--pattern)
            PATTERN="$2"
            shift 2
            ;;
        --ci-only)
            CLEANUP_DEV=false
            shift
            ;;
        --dev-only)
            CLEANUP_CI=false
            shift
            ;;
        -y|--yes)
            SKIP_CONFIRM=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if we're in the right directory
if [ ! -f "packages/tb/tinybird/setup.sh" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Change to tb package directory
cd packages/tb/tinybird

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Running setup...${NC}"
    ./setup.sh
fi

# Activate virtual environment
source .venv/bin/activate

# Check authentication
if ! .venv/bin/tb workspace current &>/dev/null; then
    echo -e "${RED}Error: Not authenticated to Tinybird. Run 'pnpm tb:auth' first.${NC}"
    exit 1
fi

# Ensure we're in the main workspace
echo -e "${BLUE}Setting workspace context to 'barely'...${NC}"
.venv/bin/tb workspace use barely

# Get all branches
echo -e "${BLUE}Fetching Tinybird branches...${NC}"
.venv/bin/tb branch ls > /tmp/tb_branches.txt

# Initialize arrays
declare -a CI_BRANCHES_TO_DELETE=()
declare -a DEV_BRANCHES_TO_DELETE=()

# Get list of open PRs if we have GitHub CLI
if command -v gh &> /dev/null; then
    gh pr list --state open --json number --jq '.[].number' > /tmp/open_prs.txt 2>/dev/null || touch /tmp/open_prs.txt
else
    echo -e "${YELLOW}GitHub CLI not found. Cannot check open PRs.${NC}"
    touch /tmp/open_prs.txt
fi

# Process each branch
while IFS= read -r branch_line; do
    # Skip header lines
    if [[ "$branch_line" == *"Name"* ]] || [[ "$branch_line" == *"──"* ]] || [ -z "$branch_line" ]; then
        continue
    fi
    
    # Extract branch name
    BRANCH_NAME=$(echo "$branch_line" | awk '{print $1}')
    
    # Skip main branch
    if [ "$BRANCH_NAME" == "main" ] || [ -z "$BRANCH_NAME" ]; then
        continue
    fi
    
    # Apply pattern filter if specified
    if [ -n "$PATTERN" ]; then
        if ! echo "$BRANCH_NAME" | grep -qE "$PATTERN"; then
            continue
        fi
    fi
    
    # Check CI branches
    if [ "$CLEANUP_CI" = true ] && [[ "$BRANCH_NAME" =~ ^ci_pr_([0-9]+)$ ]]; then
        PR_NUM="${BASH_REMATCH[1]}"
        # Check if PR is still open
        if ! grep -q "^$PR_NUM$" /tmp/open_prs.txt; then
            CI_BRANCHES_TO_DELETE+=("$BRANCH_NAME")
        fi
    fi
    
    # Check dev branches
    if [ "$CLEANUP_DEV" = true ] && [[ "$BRANCH_NAME" =~ __dev_ ]]; then
        # Extract the git branch part
        GIT_BRANCH_PART=$(echo "$BRANCH_NAME" | sed 's/__dev_.*//')
        
        # Check if corresponding git branch exists (try common variations)
        BRANCH_EXISTS=false
        
        # Go back to repo root for git commands
        pushd ../../.. > /dev/null
        
        # Try different branch name formats
        for separator in '/' '-'; do
            POTENTIAL_BRANCH=$(echo "$GIT_BRANCH_PART" | tr '_' "$separator")
            if git show-ref --verify --quiet "refs/remotes/origin/$POTENTIAL_BRANCH"; then
                BRANCH_EXISTS=true
                break
            fi
        done
        
        popd > /dev/null
        
        if [ "$BRANCH_EXISTS" = false ]; then
            DEV_BRANCHES_TO_DELETE+=("$BRANCH_NAME")
        fi
    fi
done < /tmp/tb_branches.txt

# Clean up temp files
rm -f /tmp/tb_branches.txt /tmp/open_prs.txt

# Report findings
echo ""
echo -e "${BLUE}=== Branch Cleanup Report ===${NC}"
echo ""

if [ ${#CI_BRANCHES_TO_DELETE[@]} -gt 0 ]; then
    echo -e "${YELLOW}CI Branches to delete (from closed PRs):${NC}"
    for branch in "${CI_BRANCHES_TO_DELETE[@]}"; do
        echo "  - $branch"
    done
    echo ""
fi

if [ ${#DEV_BRANCHES_TO_DELETE[@]} -gt 0 ]; then
    echo -e "${YELLOW}Dev Branches to delete (orphaned):${NC}"
    for branch in "${DEV_BRANCHES_TO_DELETE[@]}"; do
        echo "  - $branch"
    done
    echo ""
fi

TOTAL_COUNT=$((${#CI_BRANCHES_TO_DELETE[@]} + ${#DEV_BRANCHES_TO_DELETE[@]}))

if [ $TOTAL_COUNT -eq 0 ]; then
    echo -e "${GREEN}No branches to clean up! ✨${NC}"
    exit 0
fi

echo -e "${BLUE}Total branches to delete: $TOTAL_COUNT${NC}"

# Handle dry run
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}This is a DRY RUN. No branches will be deleted.${NC}"
    echo "To actually delete branches, run with --force flag."
    exit 0
fi

# Confirm deletion
if [ "$SKIP_CONFIRM" = false ]; then
    echo ""
    read -p "Are you sure you want to delete these $TOTAL_COUNT branches? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cancelled.${NC}"
        exit 0
    fi
fi

# Delete branches
echo ""
echo -e "${BLUE}Deleting branches...${NC}"

SUCCESS_COUNT=0
FAIL_COUNT=0

# Delete CI branches
for branch in "${CI_BRANCHES_TO_DELETE[@]}"; do
    echo -n "Deleting $branch... "
    if .venv/bin/tb branch rm "$branch" --yes 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}✗${NC}"
        ((FAIL_COUNT++))
    fi
done

# Delete dev branches
for branch in "${DEV_BRANCHES_TO_DELETE[@]}"; do
    echo -n "Deleting $branch... "
    if .venv/bin/tb branch rm "$branch" --yes 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}✗${NC}"
        ((FAIL_COUNT++))
    fi
done

# Summary
echo ""
echo -e "${BLUE}=== Cleanup Complete ===${NC}"
echo -e "${GREEN}Successfully deleted: $SUCCESS_COUNT branches${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed to delete: $FAIL_COUNT branches${NC}"
fi

# Deactivate virtual environment
deactivate