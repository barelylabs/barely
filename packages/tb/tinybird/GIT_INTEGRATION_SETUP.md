# Git Integration Setup Guide

This guide explains how Tinybird's Git integration works and how to use it.

## Git Integration Status

✅ **Git integration is now active** on the main workspace.

## Benefits of Git Integration

With Git integration enabled:

- `tb deploy` command is available (handles MV dependencies properly)
- All deployments track Git commits automatically
- Rollbacks are easier with Git workflows
- CI/CD can fully validate and deploy all changes

## How It Works

Git integration links your Git commits to Tinybird deployments:

1. Each deployment records the Git commit SHA
2. `tb diff` compares against the last deployed commit
3. `tb deploy` only pushes changes since the last deployment
4. Rollbacks can be done via Git revert

## Important Note on Branch Ancestry

When Git integration is enabled:

- `tb deploy` requires the workspace's tracked commit to be an ancestor of your branch
- PRs created before Git integration was enabled will need to use `tb push` instead
- After merging, all new branches from main will work with `tb deploy`

The CI workflow automatically handles this by:

1. Checking if `tb deploy` is possible
2. Falling back to `tb push` if needed (with a warning)

## Verifying Git Integration

To check if Git integration is active:

```bash
cd packages/tb/tinybird
source .venv/bin/activate
tb release ls
```

You should see releases with commit SHAs.

## Setup Process (If Not Already Done)

### 1. Switch to Main Branch

```bash
# Ensure you have the latest main branch
git checkout main
git pull origin main
```

### 2. Initialize Git Integration

```bash
cd packages/tb/tinybird
source .venv/bin/activate

# Ensure you're on the main Tinybird workspace
tb branch use main

# Initialize Git integration
tb init --git
```

This will:

- Create/update `.tinyenv` file
- Create/update CI/CD scaffolding files
- Link the current Git commit to the Tinybird workspace

### 3. Review Generated Files

The command will generate or update:

- `.tinyenv` - Environment configuration
- `requirements.txt` - Python dependencies
- Various CI/CD helper scripts

Review these files to ensure they don't conflict with existing setup.

### 4. Create a Feature Branch for the Changes

```bash
# Create a new branch for the generated files
git checkout -b feat/tinybird-git-integration-files

# Add the new/modified files
git add -A

# Commit
git commit -m "feat(tinybird): add Git integration files from tb init --git"

# Push to create PR
git push origin feat/tinybird-git-integration-files
```

### 5. Create PR and Merge

1. Create a PR with the generated files
2. Review to ensure no conflicts
3. Merge the PR

## How It Works

Once Git integration is set up:

1. **Deployment Tracking**: Each deployment records the Git commit SHA
2. **Better Diffs**: `tb diff` can compare against the deployed commit
3. **Git-based Rollbacks**: Can rollback by reverting Git commits
4. **Source of Truth**: Git becomes the authoritative source

## Important Notes

- This is a one-time setup
- Must be done from main branch (both Git and Tinybird)
- The generated files should go through normal PR process
- After setup, the CI/CD workflow will automatically use Git integration

## Verification

After setup is complete:

```bash
# Check Git integration status
tb status

# The output should show the linked Git commit
```

## Troubleshooting

### "Please make sure you run tb init --git over your main git branch"

- Ensure you're on main/master/develop Git branch
- Run `git branch` to verify

### "You need to be in Main to run this command"

- Switch to main Tinybird workspace: `tb branch use main`
- Run `tb branch current` to verify

### Generated files conflict with existing ones

- Review the differences carefully
- Keep the existing content that's needed
- Merge the new Git integration features

## Next Steps

After Git integration is set up:

1. All production deployments will track Git commits
2. Rollbacks become easier with Git revert
3. The CI/CD pipeline will automatically detect and use Git integration
4. Development workflow remains the same (branches for features)
