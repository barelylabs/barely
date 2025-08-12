#!/bin/bash

# Fix script for the orphaned bio-mvp worktree
# Run this from the main git repository to properly register the worktree

echo "Fixing orphaned bio-mvp worktree..."

MAIN_REPO="/Users/barely/hub/git/barely"
WORKTREE_PATH="/Users/barely/hub/git/barely/worktrees/feature/bio-mvp"
BRANCH_NAME="feature/bio-mvp"

cd "$MAIN_REPO"

# First, check if the branch exists
if ! git branch | grep -q "$BRANCH_NAME"; then
    echo "Branch $BRANCH_NAME not found!"
    exit 1
fi

# Get the commit hash of the branch
COMMIT_HASH=$(git rev-parse "$BRANCH_NAME")
echo "Branch $BRANCH_NAME is at commit $COMMIT_HASH"

# Remove any existing worktree registration (if it exists)
git worktree prune

# Force add the worktree even though the directory exists
# We'll move the directory temporarily, add the worktree, then restore the files
echo "Temporarily moving existing files..."
mv "$WORKTREE_PATH" "${WORKTREE_PATH}.backup"

# Add the worktree properly
echo "Adding worktree..."
git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"

# Now restore any local changes from the backup
echo "Restoring local changes..."
rsync -av --exclude='.git' "${WORKTREE_PATH}.backup/" "$WORKTREE_PATH/"

# Clean up
rm -rf "${WORKTREE_PATH}.backup"

echo "Done! The worktree should now be properly registered."
echo "Test with: cd $WORKTREE_PATH && git status"