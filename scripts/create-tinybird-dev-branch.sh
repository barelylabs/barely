#!/bin/bash

# Get current user (same as Neon script)
me=$(neonctl me | awk -F '│' 'NR==4{print $2}' | tr -d ' ')
currentBranch=$(git rev-parse --abbrev-ref HEAD)

# Convert git branch name to Tinybird-compatible format (replace hyphens with underscores)
# Also replace forward slashes with double underscores for nested branches
tinybirdBranch=$(echo "${currentBranch}__dev_${me}" | tr '/' '_' | tr '-' '_')

echo "Setting up Tinybird dev branch: $tinybirdBranch"

# Change to tb package directory
cd packages/tb/tinybird

# Activate virtual environment
source .venv/bin/activate

# Check if already authenticated
if ! .venv/bin/tb workspace current &>/dev/null; then
    echo "Tinybird authentication required. Please run 'pnpm tb:auth' first."
    exit 1
fi

# Ensure we're in the main workspace first
echo "Setting workspace context to 'barely'..."
.venv/bin/tb workspace use barely

# Check if branch exists
if .venv/bin/tb branch ls | grep -q "^$tinybirdBranch"; then
    echo "Branch $tinybirdBranch already exists. Switching to it..."
    .venv/bin/tb branch use $tinybirdBranch
else
    echo "Creating new Tinybird branch: $tinybirdBranch"
    # Create branch without copying data for faster creation
    echo "n" | .venv/bin/tb branch create $tinybirdBranch
    
    echo "Switching to branch: $tinybirdBranch"
    .venv/bin/tb branch use $tinybirdBranch
    
    echo "Pushing all resources to empty branch..."
    .venv/bin/tb push --force --yes
fi

echo "✓ Tinybird dev branch ready: $tinybirdBranch"
echo "  Current branch: $(.venv/bin/tb branch current)"