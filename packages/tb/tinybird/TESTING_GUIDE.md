# Tinybird Version Control Testing Guide

## Test Plan Overview

This guide walks through testing the complete Tinybird version control workflow to ensure everything works correctly.

## Prerequisites Checklist

- [ ] Tinybird CLI installed: `tb --version`
- [ ] Authenticated to Tinybird: `pnpm tb:workspace`
- [ ] Git repository initialized
- [ ] On a feature branch in git

## Test 1: Branch Creation and Basic Workflow

### 1.1 Create a Test Branch

```bash
# Create a test branch (remember: use underscores!)
pnpm tb:branch:create test_workflow_validation

# When prompted:
# - Copy data? Yes (for realistic testing)
# - Amount: Default or small amount for quick testing
```

### 1.2 Verify Branch Creation

```bash
# List branches to see your new branch
pnpm tb:branch:list

# Switch to the branch
pnpm tb:branch:use test_workflow_validation

# Confirm you're on the right branch
pnpm tb:branch:current
```

### 1.3 Make a Simple Change

Create a test pipe to verify the workflow:

```bash
# Create a simple test pipe
cat > pipes/endpoints/general/test_endpoint.pipe << 'EOF'
DESCRIPTION >
    Test endpoint for workflow validation

TOKEN "test_endpoint_read" READ

NODE test_query
SQL >
    SELECT
        'Hello from branch!' as message,
        now() as timestamp

EOF
```

### 1.4 Push to Branch

```bash
# Push the new pipe to your branch
pnpm tb:push:force

# Check what was pushed
pnpm tb:diff
```

### 1.5 Verify in UI

1. Log into Tinybird UI
2. Switch to your branch workspace (dropdown in top-left)
3. Navigate to Pipes → test_endpoint
4. Run the endpoint to see results

### 1.6 Clean Up Test

```bash
# Remove the test file
rm pipes/endpoints/general/test_endpoint.pipe

# Switch back to main
pnpm tb:branch:use main

# Delete the test branch
pnpm tb:branch:rm test_workflow_validation
```

## Test 2: Full Development Cycle

### 2.1 Create Feature Branch

```bash
# Create a feature branch for adding new analytics
pnpm tb:branch:create feature_add_device_model_analytics
pnpm tb:branch:use feature_add_device_model_analytics
```

### 2.2 Add New Analytics Endpoint

Create a new endpoint that doesn't exist yet:

```bash
# Add device model analytics for cart
cat > pipes/endpoints/cart/v2_cart_deviceModels.pipe << 'EOF'
DESCRIPTION >
    Device model analytics for cart events

TOKEN "v2_cart_deviceModels_endpoint_read_1234" READ

NODE device_models
SQL >
    SELECT
        device_model,
        COUNT(*) as events,
        COUNT(DISTINCT sessionId) as sessions,
        COUNT(DISTINCT workspaceId) as workspaces
    FROM barely_cart_events_mv
    WHERE
        workspaceId = {{ String(workspaceId, '85c175e4-b4cb-49ab-b3bf-2ea43014e102', required=True) }}
        AND timestamp >= {{ DateTime(start, '2024-01-01 00:00:00') }}
        AND timestamp < {{ DateTime(end, '2024-12-31 23:59:59') }}
        AND device_model != ''
    GROUP BY device_model
    ORDER BY events DESC
    LIMIT {{ Int32(limit, 100) }}

EOF
```

### 2.3 Test the New Endpoint

```bash
# Push to branch
pnpm tb:push:force

# In Tinybird UI (branch workspace):
# 1. Navigate to the new pipe
# 2. Test with parameters
# 3. Verify results
```

### 2.4 Create Pull Request

```bash
# Add and commit changes
git add pipes/endpoints/cart/v2_cart_deviceModels.pipe
git commit -m "feat(tinybird): add device model analytics for cart events"

# Push to GitHub
git push origin feature/tinybird/add-device-model-analytics
```

### 2.5 Verify CI Pipeline

1. Open PR on GitHub
2. Watch CI pipeline:
   - Should create `ci_pr_[number]` branch
   - Should validate changes
   - Should show success

### 2.6 Clean Up After Test

```bash
# Remove test file
rm pipes/endpoints/cart/v2_cart_deviceModels.pipe

# Switch to main and remove branch
pnpm tb:branch:use main
pnpm tb:branch:rm feature_add_device_model_analytics
```

## Test 3: Error Handling

### 3.1 Test Invalid SQL

Create a pipe with invalid SQL:

```bash
cat > pipes/endpoints/general/invalid_test.pipe << 'EOF'
TOKEN "invalid_test_read" READ

NODE bad_query
SQL >
    SELECT * FROM non_existent_table

EOF
```

### 3.2 Verify Error Handling

```bash
# This should fail
pnpm tb:push:force

# Should see clear error message about missing table
```

### 3.3 Fix and Retry

```bash
# Remove invalid file
rm pipes/endpoints/general/invalid_test.pipe
```

## Test 4: Git Hooks

### 4.1 Install Hooks

```bash
cd packages/tb/tinybird
./scripts/install-hooks.sh
cd ../..
```

### 4.2 Test Pre-commit Hook

```bash
# Make a change to a pipe
echo "# Test comment" >> pipes/endpoints/cart/v2_cart_browsers.pipe

# Try to commit
git add pipes/endpoints/cart/v2_cart_browsers.pipe
git commit -m "test: pre-commit hook"

# Should run validation
# Revert change
git checkout -- pipes/endpoints/cart/v2_cart_browsers.pipe
```

## Test 5: Production Deployment Simulation

### 5.1 Simulate PR Merge

1. Ensure you're on main branch in git
2. Ensure you're on main workspace in Tinybird
3. Make a small, safe change:

```bash
# Add a comment to existing pipe
sed -i '' '1i\
# Analytics for browser usage\
' pipes/endpoints/cart/v2_cart_browsers.pipe

# Push directly to main workspace (only for testing!)
pnpm tb:branch:use main
pnpm tb:push:dry  # Dry run first
```

## Validation Checklist

### Branch Operations

- [ ] Can create branches (with underscore names)
- [ ] Branch creation fails with hyphen names (expected)
- [ ] Can switch between branches
- [ ] Can list all branches
- [ ] Can delete branches
- [ ] Branch tokens work correctly

### Development Workflow

- [ ] Can push changes to branch
- [ ] Changes isolated to branch
- [ ] Can test in branch UI
- [ ] Main workspace unaffected

### CI/CD Pipeline

- [ ] PR creates CI branch
- [ ] Validation runs successfully
- [ ] Errors reported clearly
- [ ] Branch cleanup works

### Git Integration

- [ ] Pre-commit hooks work
- [ ] Changes tracked in git
- [ ] Can revert changes

## Troubleshooting

### Common Issues

#### "Invalid branch name" Error

- **Cause**: Using hyphens in branch names
- **Solution**: Use underscores instead
- **Example**: `test_feature` ✅ not `test-feature` ❌

#### "Permission denied" on branch operations

- Check token permissions
- Ensure you're using admin token

#### Changes not appearing in branch

- Verify you're on correct branch: `pnpm tb:branch:current`
- Check push output for errors
- Try force push: `pnpm tb:push:force`

#### CI pipeline fails

- Check GitHub Actions logs
- Verify TINYBIRD_API_KEY secret is set
- Ensure token has admin permissions

#### Pre-commit hook not running

- Verify hook installed: `ls -la .git/hooks/pre-commit`
- Check hook is executable
- Run manually: `./packages/tb/tinybird/scripts/pre-commit.sh`

## Next Steps

After successful testing:

1. Document any issues found
2. Update workflows based on learnings
3. Train team on new process
4. Monitor first few production deployments

## Success Criteria

The workflow is considered successfully tested when:

- ✅ All test scenarios pass
- ✅ No changes leak to production during testing
- ✅ CI/CD pipeline works end-to-end
- ✅ Team members can follow the workflow
- ✅ Rollback procedures verified
