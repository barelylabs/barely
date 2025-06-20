# GitHub Workflows Architecture

## Overview

This document explains the simplified GitHub Actions workflow architecture that reduces duplication and improves maintainability.

## Key Improvements

### Before vs After

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| preview.yml lines | 492 | ~155 | 68% reduction |
| production.yml lines | 731 | ~175 | 76% reduction |
| Total workflow files | 5 | 8+ | More modular |
| Deploy job duplication | 9x | 1x | Matrix strategy |
| Adding new app | Edit multiple files | Update apps.json | Single source |

## Architecture Components

### 1. Configuration (`apps.json`)

Centralized app configuration:
```json
{
  "apps": [
    {
      "name": "app",
      "projectId": "VERCEL_APP_PROJECT_ID",
      "port": 3000,
      "envPrefix": "APP_",
      "domain": "app.barely.io"
    }
  ]
}
```

### 2. Shared Workflows

Located in `.github/workflows/shared/`:

#### `neon-setup.yml`
- Creates/deletes Neon database branches
- Returns database URL as output
- Handles branch existence checks

#### `vercel-env-update.yml`
- Updates environment variables for all apps in parallel
- Uses bash script for efficient updates
- Handles DATABASE_URL, POOL_URL, DIRECT_URL

#### `deploy-apps.yml`
- Deploys all apps using matrix strategy
- Returns deployment IDs as JSON object
- Supports both preview and production

#### `promote-apps.yml`
- Promotes apps to production domains
- Handles failures gracefully
- Supports rollback triggers

### 3. Main Workflows

#### `ci-integrated.yml`
- Combines code quality checks with Tinybird validation
- Single `can-merge` job for all CI checks
- Supports both PR and merge_group events

#### `preview-simplified.yml`
- ~155 lines (vs 492 originally)
- Uses all shared workflows
- Clean separation of concerns

#### `production-simplified.yml`
- ~175 lines (vs 731 originally)
- Handles merge queue events
- Includes cleanup and rollback logic

## Workflow Execution Flow

### Pull Request Flow
```
PR Created/Updated
    ├── ci-integrated.yml
    │   ├── lint, format, typecheck
    │   ├── tinybird-validate (if files changed)
    │   └── can-merge ✓
    └── preview-simplified.yml
        ├── setup (read apps.json)
        ├── neon-preview (create branch)
        ├── update-vercel-env
        ├── deploy-apps (matrix)
        ├── trigger-preview
        └── preview--can-merge ✓
```

### Merge Queue Flow
```
Added to Merge Queue
    ├── ci-integrated.yml
    │   └── tinybird-validate
    └── production-simplified.yml
        ├── setup
        ├── db-push
        ├── deploy-apps
        ├── trigger-production
        ├── production--can-merge ✓
        ├── promote-apps
        └── cleanup-preview
```

## Adding a New App

1. Update `.github/apps.json`:
```json
{
  "name": "new-app",
  "projectId": "VERCEL_NEW_APP_PROJECT_ID",
  "port": 3010,
  "envPrefix": "NEW_APP_",
  "domain": "new.barely.io"
}
```

2. Add the secret `VERCEL_NEW_APP_PROJECT_ID` to GitHub

That's it! The app will automatically be:
- Deployed in previews
- Deployed in production
- Have env vars updated
- Be promoted to production domain

## Environment Variables

### Required Secrets
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_TEAM_ID` - Vercel team/org ID
- `VERCEL_*_PROJECT_ID` - Per-app project IDs
- `NEON_API_KEY` - Neon database API key
- `NEON_PROJECT_ID` - Neon project ID
- `DATABASE_URL` - Production database URL
- `TRIGGER_ACCESS_TOKEN` - Trigger.dev token
- `TINYBIRD_API_KEY` - Tinybird API token

## Migration Guide

### Phase 1: Testing
1. Run new workflows in parallel with old ones
2. Compare outputs and timing
3. Verify all apps deploy correctly

### Phase 2: Switchover
1. Update branch protection rules to use new job names
2. Disable old workflows
3. Monitor for issues

### Phase 3: Cleanup
1. Delete old workflow files
2. Remove unused secrets
3. Update documentation

## Best Practices

1. **Always update apps.json** for app changes
2. **Use matrix strategy** for repetitive tasks
3. **Keep shared workflows generic** and reusable
4. **Test locally** with act: `act -j preview--can-merge`
5. **Monitor performance** - matrix jobs run in parallel

## Troubleshooting

### Common Issues

**"Unable to find reusable workflow"**
- Ensure shared workflows are committed
- Check file paths are correct

**"Context access might be invalid"**
- Verify secrets are passed correctly
- Check workflow inputs/outputs

**Matrix job fails for one app**
- Check app-specific configuration
- Verify project ID secret exists

## Future Improvements

1. **Dynamic environments** - Create env-specific app configs
2. **Selective deployments** - Only deploy changed apps
3. **Parallel promotions** - Promote all apps simultaneously
4. **Automated rollbacks** - Implement full rollback automation
5. **Performance metrics** - Track deployment times