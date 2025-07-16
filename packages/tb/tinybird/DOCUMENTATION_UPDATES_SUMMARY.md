# Documentation Updates Summary

This file summarizes the documentation updates made to reflect learnings from Tinybird testing.

## Key Changes Made

### 1. Branch Naming Convention

**Issue**: Documentation showed branch names with hyphens, but Tinybird requires underscores.

**Files Updated**:

- `DEVELOPMENT_WORKFLOW.md`: Updated all branch name examples to use underscores
- `BRANCH_WORKFLOW.md`: Updated all branch name examples and added dedicated section on naming rules
- `README.md`: Added warnings about underscore requirement
- `TESTING_GUIDE.md`: Updated all test branch names
- `.github/workflows/tinybird-ci.yml`: Changed CI branch naming from `ci-pr-123` to `ci_pr_123`
- `DEPLOYMENT_CHECKLIST.md`: Added Tinybird branch creation step

### 2. Empty Branch Behavior

**Issue**: Documentation didn't explain that empty branches require pushing ALL resources on first push.

**Files Updated**:

- `DEVELOPMENT_WORKFLOW.md`: Added explanation in branch creation section and troubleshooting
- `BRANCH_WORKFLOW.md`: Added dedicated "Empty Branch Behavior" section

### 3. New Sections Added

- **Branch Naming Rules** section in DEVELOPMENT_WORKFLOW.md
- **Empty Branch Behavior** section in BRANCH_WORKFLOW.md
- **Troubleshooting entries** for branch naming errors and empty branch issues

## Examples of Changes

### Before:

```bash
pnpm tb:branch:create feature-analytics
```

### After:

```bash
pnpm tb:branch:create feature_analytics  # Use underscores!
```

## Important Notes

- Git branches can still use hyphens (e.g., `feature/tinybird/add-analytics`)
- Only Tinybird branches must use underscores (e.g., `feature_add_analytics`)
- The CI/CD workflow now creates branches with underscores to avoid failures
- Empty branches require `tb push --force` for the initial push of all resources

## Verification

All documentation now correctly reflects:

1. Underscore requirement for Tinybird branch names
2. Empty branch behavior requiring full resource push
3. Clear distinction between Git and Tinybird branch naming conventions
