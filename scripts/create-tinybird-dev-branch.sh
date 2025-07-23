#!/bin/bash

set -euo pipefail

# Function to handle errors
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Get current user (same as Neon script)
log "Getting current user..."
if ! me=$(neonctl me | awk -F '│' 'NR==4{print $2}' | tr -d ' '); then
    error_exit "Failed to get current user from neonctl. Is neonctl authenticated?"
fi

if [ -z "$me" ]; then
    error_exit "Could not determine current user"
fi

# Get current git branch
if ! currentBranch=$(git rev-parse --abbrev-ref HEAD); then
    error_exit "Failed to get current git branch"
fi

# Convert git branch name to Tinybird-compatible format (replace hyphens with underscores)
# Also replace forward slashes with double underscores for nested branches
tinybirdBranch=$(echo "${currentBranch}__dev_${me}" | tr '/' '_' | tr '-' '_')

log "Setting up Tinybird dev branch: $tinybirdBranch"

# Change to tb package directory
if ! cd packages/tb/tinybird; then
    error_exit "Failed to change to packages/tb/tinybird directory"
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    log "Virtual environment not found. Running setup..."
    if ! ./setup.sh; then
        error_exit "Failed to set up virtual environment"
    fi
fi

# Activate virtual environment
if ! source .venv/bin/activate; then
    error_exit "Failed to activate virtual environment"
fi

# Check if already authenticated
if ! .venv/bin/tb workspace current &>/dev/null; then
    error_exit "Tinybird authentication required. Please run 'pnpm tb:auth' first."
fi

# Ensure we're in the main workspace first
log "Setting workspace context to 'barely'..."
if ! .venv/bin/tb workspace use barely; then
    error_exit "Failed to set workspace context to 'barely'"
fi

# Check current branch count (max 3 allowed)
BRANCH_COUNT=$(.venv/bin/tb branch ls | grep -c "^[[:alnum:]]" || echo "0")
if [ "$BRANCH_COUNT" -ge 3 ]; then
    log "⚠️  Warning: Already at maximum branch limit (3). Consider cleaning up unused branches."
fi

# Check if branch exists
if .venv/bin/tb branch ls | grep -q "^$tinybirdBranch"; then
    log "Branch $tinybirdBranch already exists. Switching to it..."
    if ! .venv/bin/tb branch use "$tinybirdBranch"; then
        error_exit "Failed to switch to existing branch: $tinybirdBranch"
    fi
else
    log "Creating new Tinybird branch: $tinybirdBranch"
    
    # Create branch without copying data for faster creation
    # Note: This creates an empty branch, requiring full resource push
    if ! echo "n" | .venv/bin/tb branch create "$tinybirdBranch"; then
        error_exit "Failed to create branch: $tinybirdBranch"
    fi
    
    log "Switching to branch: $tinybirdBranch"
    if ! .venv/bin/tb branch use "$tinybirdBranch"; then
        # Rollback: try to delete the branch we just created
        log "Failed to switch to new branch, attempting to clean up..."
        .venv/bin/tb branch rm "$tinybirdBranch" --yes 2>/dev/null || true
        error_exit "Failed to switch to newly created branch"
    fi
    
    log "Pushing all resources to empty branch..."
    log "This may take a moment for large projects..."
    
    # Note: --force is required here because we're populating an empty branch
    # This is safe as the branch is isolated from production
    if ! .venv/bin/tb push --force --yes; then
        log "Push failed, attempting to clean up branch..."
        .venv/bin/tb branch use main 2>/dev/null || true
        .venv/bin/tb branch rm "$tinybirdBranch" --yes 2>/dev/null || true
        error_exit "Failed to push resources to new branch"
    fi
fi

# Verify we're on the correct branch
CURRENT_BRANCH=$(.venv/bin/tb branch current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" != "$tinybirdBranch" ]; then
    error_exit "Branch verification failed. Expected: $tinybirdBranch, Got: $CURRENT_BRANCH"
fi

log "✅ Tinybird dev branch ready: $tinybirdBranch"
log "   Current branch: $CURRENT_BRANCH"
log "   To return to main: tb branch use main"

# Copy admin token to .env file
log "Copying Tinybird admin token..."
if TINYBIRD_TOKEN=$(.venv/bin/tb token copy "admin token" 2>/dev/null); then
    # Navigate back to project root
    cd ../../..
    
    # Check if TINYBIRD_API_KEY exists in the file
    if grep -q "TINYBIRD_API_KEY" .env; then
        # If it exists, replace it    
        sed -i "" "s#^TINYBIRD_API_KEY=.*#TINYBIRD_API_KEY=$TINYBIRD_TOKEN#" .env
        log "✅ Updated TINYBIRD_API_KEY in .env"
    else
        # If it doesn't exist, append it
        echo "TINYBIRD_API_KEY=$TINYBIRD_TOKEN" >> .env
        log "✅ Added TINYBIRD_API_KEY to .env"
    fi
else
    log "⚠️  Warning: Failed to copy Tinybird admin token. You may need to set TINYBIRD_API_KEY manually."
fi