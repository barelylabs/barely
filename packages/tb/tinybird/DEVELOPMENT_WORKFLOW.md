# Tinybird Development Workflow

## Overview

This document outlines the development workflow for making changes to Tinybird analytics pipelines.

## Prerequisites

- Tinybird CLI installed and authenticated (`pnpm tb:setup` and `pnpm tb:auth`)
- Access to the Tinybird workspace
- Understanding of the data flow (see DATA_FLOW.md)

## Branch Naming Rules

**⚠️ CRITICAL WARNING**: Tinybird branch names have strict requirements that MUST be followed:

- **MANDATORY**: Use **underscores** (`_`) instead of hyphens (`-`)
- **VALID**: `feature_analytics`, `fix_timezone_bug`, `test_new_endpoint` ✅
- **INVALID**: `feature-analytics`, `fix-timezone-bug`, `test-new-endpoint` ❌
- **Note**: Git branches can still use hyphens, but Tinybird branches CANNOT

### Common Naming Patterns

- Features: `feature_[description]` (e.g., `feature_user_analytics`)
- Fixes: `fix_[description]` (e.g., `fix_timezone_issue`)
- Tests: `test_[description]` (e.g., `test_new_pipeline`)
- Hotfixes: `hotfix_[description]` (e.g., `hotfix_query_timeout`)

### Why This Matters

Tinybird's API will reject branch names with hyphens, resulting in errors. This is a hard requirement from Tinybird's system, not a convention we can change.

## Development Process

### 1. Automatic Development Branch Creation

**NEW**: The `pnpm dev:pull` command now automatically creates a Tinybird development branch alongside your Neon database branch:

```bash
# From project root, this single command:
pnpm dev:pull

# Will:
# 1. Pull Vercel environment variables
# 2. Create Neon dev branch: {git-branch}__dev_{username}
# 3. Create Tinybird dev branch: {git_branch}__dev_{username} (with underscores)
# 4. Set up tunnelto authentication
```

**Example**: If you're on git branch `feature/new-analytics` and your username is `john`:

- Neon branch: `feature/new-analytics__dev_john`
- Tinybird branch: `feature_new_analytics__dev_john` (hyphens converted to underscores)

### 1. Manual Development Branch Creation

**IMPORTANT**: Never push directly to the main Workspace. Always use branches for development.

```bash
# Create a new Tinybird branch for your feature
# ⚠️ CRITICAL: Branch names MUST use underscores (_), NOT hyphens (-)
# Example: feature_user_analytics ✅  NOT feature-user-analytics ❌
cd packages/tb/tinybird
source .venv/bin/activate
.venv/bin/tb branch create feature_[description]  # Replace [description] with underscores

# Switch to the new branch
.venv/bin/tb branch use feature_[description]
```

The branch will:

- Create an isolated copy of your Workspace
- Copy recent data (configurable, up to 50GB) OR start empty
- Generate independent tokens with same scopes
- Allow safe experimentation without affecting production

**Important**:

- If you create an empty branch (without copying data), the branch starts with NO resources at all
- You MUST push ALL resources on the first push, not just your changes
- Use `tb push --force` to push all resources to the empty branch
- This is different from branches that copy data, which already have existing resources

### 2. Making Changes

#### Editing Existing Resources

1. Make changes to `.datasource` or `.pipe` files
2. Follow the existing patterns and naming conventions
3. Add comments to explain complex logic

#### Adding New Resources

1. Create new files in the appropriate directory structure
2. Follow naming conventions:
   - Datasources: `[name].datasource` or `[name]_mv.datasource` for materialized views
   - Pipes: `v2_[app]_[dimension].pipe` for endpoints
3. Update documentation if adding new event types or dimensions

### 3. Testing Changes in Branch

#### Push to Branch

```bash
# Push changes to your development branch
pnpm tb:push
# or with force if replacing resources
cd packages/tb/tinybird
source .venv/bin/activate
.venv/bin/tb push --force
```

#### Test in Branch

1. Use the Tinybird UI to test your endpoints in the branch
2. Verify data flows correctly through new pipes
3. Check performance metrics
4. Test with sample queries

#### Validate Changes

```bash
# See what's different between local and branch
.venv/bin/tb diff

# Pull any changes made in the UI
.venv/bin/tb pull
```

### 4. Merging to Main Workspace

#### Via Pull Request (Recommended)

1. Commit your changes to a Git feature branch
2. Push to GitHub: `git push origin feature/tinybird/[description]`
   - Note: Git branch names can use hyphens (e.g., `feature/tinybird/user-analytics`)
   - But the Tinybird branch must use underscores (e.g., `feature_user_analytics`)
3. Create a Pull Request
4. CI will validate changes in the Tinybird branch
5. After PR approval and merge, CI will deploy to main Workspace

#### Manual Merge (If Needed)

```bash
# Switch back to main workspace
.venv/bin/tb branch use main

# Push the validated changes
.venv/bin/tb push --force

# Clean up the branch (remember: underscore in branch name)
.venv/bin/tb branch rm feature_[description]
```

### 4. Version Control Best Practices

#### Commit Messages

Use descriptive commit messages:

```
feat(tinybird): add new device analytics endpoint for cart events
fix(tinybird): correct timezone handling in timeseries pipes
refactor(tinybird): consolidate common filters into shared includes
docs(tinybird): update schema documentation for new fields
```

#### Pull Request Guidelines

1. Create a Git feature branch: `feature/tinybird/[description]` (can use hyphens)
   - Create corresponding Tinybird branch: `feature_[description]` (MUST use underscores)
2. Make your changes and test thoroughly
3. Update relevant documentation
4. Create a PR with:
   - Description of changes
   - Testing performed
   - Any breaking changes
   - Performance impact (if applicable)

### 5. Branch Management

#### List All Branches

```bash
cd packages/tb/tinybird
source .venv/bin/activate
.venv/bin/tb branch ls
```

#### Switch Between Branches

```bash
# Switch to a different branch
# ⚠️ Remember: branch names MUST use underscores
# Example: .venv/bin/tb branch use feature_analytics
.venv/bin/tb branch use [branch_name_or_id]

# Switch back to main
.venv/bin/tb branch use main
```

#### Delete a Branch

```bash
# Remove a branch after merging
.venv/bin/tb branch rm [branch_name]
```

### 6. Common Tasks

#### Pulling Latest Changes

```bash
# Always specify which environment you're pulling from
# Make sure you're on the right branch first!
.venv/bin/tb branch current

# Then pull
pnpm tb:pull
```

#### Syncing Branch with Main

```bash
# If main has changed, update your branch
# First, pull latest main to local
.venv/bin/tb branch use main
.venv/bin/tb pull

# Switch back to your branch (with underscores!)
.venv/bin/tb branch use feature_[description]

# Push main changes to branch
.venv/bin/tb push --force
```

#### Renaming Resources

1. Rename the file locally
2. Update any references in other pipes
3. Deploy with `tb push --force` to replace the old resource

## Troubleshooting

### Common Issues

#### "Invalid branch name" Error

- **Cause**: Using hyphens in Tinybird branch names
- **Solution**: Tinybird branch names MUST use underscores (`_`), not hyphens (`-`)
- **Example**: Use `feature_analytics` instead of `feature-analytics`
- **Note**: This is a hard requirement from Tinybird's API, not a preference
- **Remember**: Git branches can still use hyphens; only Tinybird branches need underscores

#### "Resource already exists" Error

- Use `--force` flag to overwrite: `tb push --force`
- Or delete the resource first in the UI, then push

#### Empty Branch - No Resources Found

- If you created an empty branch (without copying data), the branch starts completely empty
- You must push ALL resources on first push: `tb push --force`
- This pushes your entire local project to the empty branch
- Subsequent pushes can be incremental

#### Materialized View Dependencies

- When updating a pipe that feeds a materialized view, you may need to:
  1. Drop the materialized view
  2. Update the pipe
  3. Recreate the materialized view

#### Token Permissions

- Ensure your token has appropriate permissions for the operations
- Admin tokens are required for creating/modifying resources

### Debug Commands

```bash
# List all datasources
cd packages/tb/tinybird && source .venv/bin/activate
.venv/bin/tb datasource ls

# List all pipes
.venv/bin/tb pipe ls

# Get details about a specific resource
.venv/bin/tb datasource show [name]
.venv/bin/tb pipe show [name]
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/tinybird.yml`:

```yaml
name: Tinybird CI

on:
  pull_request:
    paths:
      - 'packages/tb/tinybird/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Tinybird CLI
        run: |
          pip install tinybird-cli

      - name: Validate Tinybird Resources
        env:
          TB_TOKEN: ${{ secrets.TINYBIRD_TOKEN }}
        run: |
          cd packages/tb/tinybird
          tb auth --token $TB_TOKEN
          tb push --dry-run
```

## Best Practices

1. **Always test with dry-run first**
2. **Document complex SQL logic**
3. **Use meaningful names for nodes in pipes**
4. **Keep materialized views focused and efficient**
5. **Monitor query performance after changes**
6. **Version control all changes**
7. **Review Tinybird best practices**: https://www.tinybird.co/docs/best-practices
