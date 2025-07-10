# Tinybird Rollback Procedures

This document outlines how to rollback changes in various scenarios when working with Tinybird.

## Table of Contents

- [Production Rollback (Git-Integrated)](#production-rollback-git-integrated)
- [Production Rollback (Non Git-Integrated)](#production-rollback-non-git-integrated)
- [Branch Rollback](#branch-rollback)
- [Materialized View Rollback](#materialized-view-rollback)
- [Emergency Procedures](#emergency-procedures)

## Production Rollback (Git-Integrated)

When using Git integration (`tb init --git`), rollbacks are straightforward:

### 1. Identify the Problem Commit

```bash
# View recent deployments
git log --oneline -10

# Find the last known good commit
GOOD_COMMIT="abc123..."
```

### 2. Revert the Changes

```bash
# Create a revert commit
git revert HEAD
# or revert to specific commit
git revert <bad-commit-hash>

# Push to trigger deployment
git push origin main
```

### 3. The CI/CD Pipeline Will

- Automatically deploy the reverted state
- Run validation checks
- Update the workspace to match the reverted commit

## Production Rollback (Non Git-Integrated)

If Git integration is not set up, you'll need to manually restore:

### 1. From Local Backup

```bash
# Switch to main workspace
cd packages/tb/tinybird
source .venv/bin/activate
.venv/bin/tb branch use main

# Pull current state (backup)
.venv/bin/tb pull --force

# Checkout previous version from Git
git checkout <good-commit-hash> -- .

# Push the previous version
.venv/bin/tb push --force --yes
```

### 2. From a Branch

If you have a branch with the good state:

```bash
# List branches to find one with good state
.venv/bin/tb branch ls

# Create a backup branch of current main
.venv/bin/tb branch create backup_$(date +%Y%m%d_%H%M%S)

# Push good state from branch to main
.venv/bin/tb branch use <good-branch>
.venv/bin/tb pull --force
.venv/bin/tb branch use main
.venv/bin/tb push --force --yes
```

## Branch Rollback

To rollback changes in a development or CI branch:

```bash
# Switch to the branch
.venv/bin/tb branch use <branch-name>

# Option 1: Reset to main
.venv/bin/tb branch use main
.venv/bin/tb pull --force
.venv/bin/tb branch use <branch-name>
.venv/bin/tb push --force --yes

# Option 2: Delete and recreate
.venv/bin/tb branch use main
.venv/bin/tb branch rm <branch-name> --yes
.venv/bin/tb branch create <branch-name>
```

## Materialized View Rollback

Materialized views require special handling:

### 1. Schema Changes

If the schema changed and broke the MV:

```bash
# 1. Drop the materialized view
# In Tinybird UI or via API

# 2. Rollback the source datasource
git checkout <good-commit> -- datasources/<source>.datasource
.venv/bin/tb push datasources/<source>.datasource --force --yes

# 3. Recreate the materialized view
.venv/bin/tb push datasources/<mv>.datasource --force --yes
```

### 2. Data Issues

If bad data was materialized:

```bash
# 1. Stop the materialization (in UI)
# 2. Truncate the MV
# 3. Fix the source data or pipe
# 4. Restart materialization
```

## Emergency Procedures

### Complete Workspace Reset

**⚠️ WARNING: This will delete all data!**

```bash
# 1. Document current state
.venv/bin/tb pull --force
cp -r . ../tinybird-backup-$(date +%Y%m%d_%H%M%S)

# 2. Delete all resources
for pipe in pipes/**/*.pipe; do
  .venv/bin/tb pipe rm "$(basename "$pipe" .pipe)" --yes || true
done

for ds in datasources/**/*.datasource; do
  .venv/bin/tb datasource rm "$(basename "$ds" .datasource)" --yes || true
done

# 3. Restore from Git
git checkout main -- .
.venv/bin/tb push --force --yes
```

### Partial Rollback

To rollback specific resources:

```bash
# Rollback a specific pipe
git checkout <good-commit> -- pipes/specific_pipe.pipe
.venv/bin/tb push pipes/specific_pipe.pipe --force --yes

# Rollback a datasource (careful with dependencies!)
git checkout <good-commit> -- datasources/specific_ds.datasource
.venv/bin/tb push datasources/specific_ds.datasource --force --yes
```

## Best Practices

1. **Always backup before rollback**
   ```bash
   .venv/bin/tb pull --force
   git stash
   ```

2. **Test rollback in a branch first**
   ```bash
   .venv/bin/tb branch create test_rollback
   .venv/bin/tb branch use test_rollback
   # Test your rollback here
   ```

3. **Document the issue**
   - What broke?
   - When did it break?
   - What was the last working state?

4. **Monitor after rollback**
   - Check API endpoints
   - Verify data flow
   - Monitor error rates

## Rollback Checklist

- [ ] Identify the issue and impact
- [ ] Determine the last known good state
- [ ] Create a backup of current state
- [ ] Test rollback in a branch (if time permits)
- [ ] Execute rollback procedure
- [ ] Verify services are restored
- [ ] Document incident and resolution
- [ ] Plan forward fix

## Getting Help

If rollback procedures fail:

1. Contact Tinybird support with your workspace ID
2. Provide the error messages and attempted procedures
3. Have your backup files ready

Remember: With Git integration properly set up, rollbacks become much simpler as they follow standard Git workflows.