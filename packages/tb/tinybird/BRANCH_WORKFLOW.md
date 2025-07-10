# Tinybird Branch Workflow Guide

## Overview

This guide explains how to use Tinybird branches to safely develop and test changes before deploying to production.

## Why Use Branches?

- **Isolation**: Changes don't affect production until explicitly merged
- **Testing**: Full environment to test with real (recent) data
- **Collaboration**: Multiple developers can work on different features
- **Safety**: Main workspace is protected from accidental changes

## Branch Naming Requirements

**⚠️ CRITICAL WARNING**: Tinybird has strict branch naming rules that MUST be followed:

- ✅ **VALID**: Use underscores: `feature_analytics`, `fix_bug_123`, `test_endpoint`
- ❌ **INVALID**: Using hyphens: `feature-analytics`, `fix-bug-123`, `test-endpoint`
- **Important**: This applies ONLY to Tinybird branches, not Git branches
- **Git branches**: Can continue using hyphens as normal (e.g., `feature/tinybird/new-analytics`)
- **Tinybird branches**: MUST use underscores (e.g., `feature_new_analytics`)

### Why This Restriction Exists

Tinybird's API enforces this naming convention and will reject any branch names containing hyphens. This is a system limitation, not a preference.

## Empty Branch Behavior

**Important**: When creating a branch without copying data:

1. The branch starts completely empty (NO datasources, NO pipes, NO endpoints)
2. Your first push MUST include ALL resources: `tb push --force`
3. This is different from branches with copied data, which already have resources
4. After the initial push, subsequent pushes can be incremental

### Common Empty Branch Mistakes

- ❌ Trying to push only changed files (fails because dependencies don't exist)
- ❌ Using `tb push` without `--force` flag (fails because resources need replacement)
- ✅ Using `tb push --force` to push entire project on first push

## Quick Start

### 1. Create a Feature Branch

```bash
# Create a new branch for your feature
# ⚠️ CRITICAL: Use underscores (_) NOT hyphens (-) in branch names!
# ✅ CORRECT: feature_add_new_analytics
# ❌ WRONG: feature-add-new-analytics
pnpm tb:branch:create feature_add_new_analytics

# The CLI will prompt for options:
# - Copy data? (Yes for testing with real data, No for empty branch)
# - How much data? (Last 50GB max)

# ⚠️ Note: If you choose not to copy data (empty branch):
# - The branch starts with ZERO resources
# - You MUST push ALL resources on first push using --force
# - Use: pnpm tb:push:force (not just tb:push)
```

### 2. Switch to Your Branch

```bash
# Use the branch
pnpm tb:branch:use feature_add_new_analytics

# Verify you're on the right branch
pnpm tb:branch:current
```

### 3. Develop and Test

```bash
# Make your changes to .datasource/.pipe files
# Push changes to the branch
pnpm tb:push:force

# Test in Tinybird UI (branch workspace)
# Iterate as needed
```

### 4. Create Pull Request

```bash
# Commit your changes
git add -A
git commit -m "feat: add new analytics endpoints"

# Push to GitHub
# ✅ Note: Git branches CAN use hyphens (normal Git convention)
# This Git branch: feature/tinybird/add-new-analytics (with hyphens) ✅
# But Tinybird branch: feature_add_new_analytics (with underscores) ✅
git push origin feature/tinybird/add-new-analytics
```

### 5. After PR Merge

The CI/CD pipeline will automatically:

1. Deploy changes to the main workspace
2. Clean up the CI branch

## Common Workflows

### Starting Fresh Development

```bash
# 1. Pull latest from main
git checkout main
git pull origin main

# 2. Create feature branch in git
git checkout -b feature/tinybird/my-feature

# 3. Create Tinybird branch
# ⚠️ MUST use underscores in Tinybird branch name!
pnpm tb:branch:create feature_my_feature  # ✅ Correct
# NOT: pnpm tb:branch:create feature-my-feature  # ❌ Wrong!
pnpm tb:branch:use feature_my_feature

# 4. Develop and test
# ... make changes ...
pnpm tb:push:force

# 5. Commit and push
git add -A
git commit -m "feat: my feature"
git push origin feature/tinybird/my-feature
```

### Testing Production Hotfix

```bash
# 1. Create hotfix branch (remember: underscores!)
pnpm tb:branch:create hotfix_urgent_fix  # ✅ Correct format
pnpm tb:branch:use hotfix_urgent_fix

# 2. Make and test fix
# ... fix issue ...
pnpm tb:push:force

# 3. Verify fix works
# Test in branch UI

# 4. Apply to main immediately
pnpm tb:branch:use main
pnpm tb:push:force

# 5. Clean up (branch name with underscores)
pnpm tb:branch:rm hotfix_urgent_fix
```

### Syncing Branch with Main

```bash
# If main has changed while you were developing

# 1. Switch to main and pull latest
pnpm tb:branch:use main
pnpm tb:pull
git pull origin main

# 2. Switch back to your branch (with underscores)
pnpm tb:branch:use feature_my_feature

# 3. Push main's changes to your branch
pnpm tb:push:force
```

## Branch Management Commands

### List All Branches

```bash
pnpm tb:branch:list
```

Shows all branches with creation date and data status.

### Check Current Branch

```bash
pnpm tb:branch:current
```

Shows which branch you're currently working on.

### Delete a Branch

```bash
pnpm tb:branch:rm branch_name
```

Remove branches after merging or abandoning work.

### See Differences

```bash
pnpm tb:diff
```

Shows differences between local files and current branch.

## Best Practices

### DO:

- ✅ Create a branch for each feature/fix
- ✅ Name branches descriptively with underscores: `feature_`, `fix_`, `test_`
- ✅ ALWAYS use underscores in Tinybird branch names (e.g., `feature_user_analytics`)
- ✅ Test thoroughly in the branch before merging
- ✅ Delete branches after merging
- ✅ Keep branches short-lived (days, not weeks)
- ✅ Remember: Git branches can use hyphens, Tinybird branches CANNOT

### DON'T:

- ❌ Work directly on the main workspace
- ❌ Keep branches for long periods
- ❌ Create branches from other branches
- ❌ Share branch tokens (each branch has its own)

## CI/CD Integration

### Automatic Branch Creation

When you create a PR, the CI pipeline:

1. Creates a branch named `ci_pr_[number]`
2. Pushes your changes to that branch
3. Validates the changes

### Automatic Cleanup

When a PR is closed or merged:

1. The CI branch is automatically deleted
2. No manual cleanup needed

## Troubleshooting

### "Branch already exists"

```bash
# Use existing branch (with underscores)
pnpm tb:branch:use branch_name

# Or remove and recreate
pnpm tb:branch:rm branch_name
pnpm tb:branch:create branch_name  # Remember: underscores only!
```

### "Cannot switch branches"

Make sure to commit or stash local changes first.

### "Invalid branch name" Error

- **Cause**: Using hyphens or other invalid characters in branch name
- **Solution**: Use only underscores in Tinybird branch names
- **Example**: `feature_analytics` ✅ not `feature-analytics` ❌

### "Token error in branch"

Each branch has its own tokens. The CLI automatically uses the branch token when you switch branches.

### Data Not Showing in Branch

- Branches copy recent data only (up to 50GB)
- Historical data might not be available
- Check data copy settings when creating branch

## Advanced Topics

### Production-like Testing

For most accurate testing:

1. Copy maximum data (50GB) when creating branch
2. Use same query patterns as production
3. Monitor query performance in branch UI

### Multi-Developer Workflow

1. Each developer creates their own branch
2. Name branches with developer prefix: `john_feature_x` (underscores!)
3. Examples:
   - `alice_feature_analytics` ✅
   - `bob_fix_timeout_issue` ✅
   - `carol-feature-reports` ❌ (no hyphens!)
4. Coordinate merges through PR reviews
5. Avoid working on same resources simultaneously
