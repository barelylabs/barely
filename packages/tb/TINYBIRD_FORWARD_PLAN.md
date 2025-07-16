# Tinybird Forward Implementation Plan

## Overview

This document outlines the comprehensive plan for implementing Tinybird Forward for local development, preview deployments, and production CI/CD at barely.io.

## Current Status

- **Migration Progress**: Reached step #6 in migration guide
- **Project Location**: `packages/tb/tinybird/`
- **Existing Scripts**:
  - `create-tinybird-dev-branch.sh` (uses old branch-based approach)
  - `cleanup-tinybird-branches.sh`
- **Git Branch**: `feat/tinybird-forward-migration`

## Implementation Phases

### Phase 1: Local Development Setup ✅

#### 1.1 Environment Setup

- [x] Tinybird CLI installed (`curl https://tinybird.co | sh`)
- [x] Project structure migrated to Forward format
- [x] Update package.json scripts:
  ```json
  "tb:dev": "cd packages/tb/tinybird && tb dev",
  "tb:build": "cd packages/tb/tinybird && tb build",
  "tb:test": "cd packages/tb/tinybird && tb test run",
  "tb:deploy:check": "cd packages/tb/tinybird && tb deploy --check",
  "tb:local:start": "tb local start --volumes-path ./tb-local-data",
  "tb:local:stop": "tb local stop"
  ```

#### 1.2 Local Development Workflow

- [x] Use Tinybird Local container for isolated development
- [x] Port 7181 for local API endpoints
- [x] Persist data between sessions with `--volumes-path`
- [x] Create fixtures for testing in `fixtures/` directory
- [x] Generate mock data with `tb mock` command

#### 1.3 Testing Strategy

- [x] Create test suites in `tests/` directory
- [x] Use `tb test create` to generate test templates
- [x] Run `tb test run` before deployments
- [x] Validate deployments with `tb deploy --check`

### Phase 2: CI/CD Workflows

#### 2.1 GitHub Actions - CI Workflow

Create `.github/workflows/tinybird-ci.yml`:

```yaml
name: Tinybird CI

on:
  pull_request:
    branches: [main]
    paths:
      - 'packages/tb/tinybird/**'
      - '.github/workflows/tinybird-ci.yml'

env:
  TINYBIRD_HOST: ${{ secrets.TINYBIRD_HOST }}
  TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_CI_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      tinybird:
        image: tinybirdco/tinybird-local:latest
        ports:
          - 7181:7181
    steps:
      - uses: actions/checkout@v4

      - name: Setup node/pnpm
        uses: ./tooling/github/setup

      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh

      - name: Build project
        working-directory: packages/tb/tinybird
        run: tb build

      - name: Run tests
        working-directory: packages/tb/tinybird
        run: tb test run

      - name: Deployment check
        working-directory: packages/tb/tinybird
        run: tb --cloud --host ${{ env.TINYBIRD_HOST }} --token ${{ env.TINYBIRD_TOKEN }} deploy --check

  preview-deploy:
    needs: test
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh

      - name: Deploy to staging
        working-directory: packages/tb/tinybird
        run: |
          tb --cloud deploy --staging \
            --host ${{ env.TINYBIRD_HOST }} \
            --token ${{ env.TINYBIRD_TOKEN }} \
            --deployment-name "pr-${{ github.event.pull_request.number }}"

      - name: Update PR comment
        uses: actions/github-script@v7
        with:
          script: |
            const body = `🐦 **Tinybird Preview Deployment**

            - Deployment: \`pr-${{ github.event.pull_request.number }}\`
            - Status: ✅ Ready
            - API Host: \`${{ env.TINYBIRD_HOST }}\`

            To query the preview deployment, add \`?__tb__deployment=pr-${{ github.event.pull_request.number }}\` to your API calls.`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
```

#### 2.2 GitHub Actions - CD Workflow

Create `.github/workflows/tinybird-cd.yml`:

```yaml
name: Tinybird CD

on:
  push:
    branches: [main]
    paths:
      - 'packages/tb/tinybird/**'

concurrency:
  group: tinybird-production
  cancel-in-progress: false

env:
  TINYBIRD_HOST: ${{ secrets.TINYBIRD_HOST }}
  TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_PROD_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh

      - name: Deploy to production
        working-directory: packages/tb/tinybird
        run: |
          # Deploy automatically promotes when using tb deploy
          tb --cloud deploy \
            --host ${{ env.TINYBIRD_HOST }} \
            --token ${{ env.TINYBIRD_TOKEN }} \
            --deployment-name "main-${{ github.sha }}"

      - name: Notify deployment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ job.status }}' === 'success' ? '✅' : '❌';
            const message = `Tinybird Production Deployment ${status}

            - Commit: ${{ github.sha }}
            - Deployment: main-${{ github.sha }}
            - Status: ${{ job.status }}`;

            // Send to Slack or other notification service
```

#### 2.3 Cleanup Workflow

Create `.github/workflows/tinybird-cleanup.yml`:

```yaml
name: Tinybird Cleanup

on:
  pull_request:
    types: [closed]

env:
  TINYBIRD_HOST: ${{ secrets.TINYBIRD_HOST }}
  TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_CI_TOKEN }}

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh

      - name: Remove staging deployment
        run: |
          tb --cloud deployment remove \
            --host ${{ env.TINYBIRD_HOST }} \
            --token ${{ env.TINYBIRD_TOKEN }} \
            "pr-${{ github.event.pull_request.number }}" || true
```

### Phase 3: Integration with Vercel Preview

#### 3.1 Environment Variables

Update Vercel preview deployments to use Tinybird staging:

```typescript
// packages/tb/src/utils.ts
export function getTinybirdEndpoint(pipeName: string) {
	const host = process.env.NEXT_PUBLIC_TINYBIRD_HOST || 'https://api.us-east.tinybird.co';
	const deployment = process.env.NEXT_PUBLIC_TINYBIRD_DEPLOYMENT;

	let url = `${host}/v0/pipes/${pipeName}.json`;
	if (deployment) {
		url += `?__tb__deployment=${deployment}`;
	}

	return url;
}
```

#### 3.2 Preview Workflow Updates

Update `.github/workflows/preview.yml` to set Tinybird deployment:

```yaml
- name: Set Tinybird deployment env
  run: |
    branch_name=${{ needs.git-meta.outputs.git_branch_name }}
    deployment_name="pr-${{ github.event.pull_request.number }}"

    echo "NEXT_PUBLIC_TINYBIRD_DEPLOYMENT=$deployment_name" | \
      pnpm vercel env add NEXT_PUBLIC_TINYBIRD_DEPLOYMENT preview $branch_name \
      --token=${{ secrets.VERCEL_TOKEN }}
```

### Phase 4: Migration Steps

#### 4.1 Complete Forward Migration

- [ ] Fix remaining migration errors (currently at step #6)
- [ ] Update any missing connection files
- [ ] Replace deprecated settings
- [ ] Add `TYPE endpoint` to all API pipes

#### 4.2 Update Development Scripts

- [ ] Replace `create-tinybird-dev-branch.sh` with deployment-based approach
- [ ] Update cleanup scripts to handle deployments
- [ ] Create helper scripts for common operations

#### 4.3 Documentation

- [ ] Update README with new workflows
- [ ] Document deployment naming conventions
- [ ] Add troubleshooting guide
- [ ] Create onboarding guide for developers

### Phase 5: Testing & Rollout

#### 5.1 Testing Plan

- [ ] Test local development workflow
- [ ] Test CI pipeline on feature branch
- [ ] Test preview deployments
- [ ] Test production deployment on staging
- [ ] Load test staging deployment
- [ ] Test rollback procedures

#### 5.2 Rollout Strategy

1. **Week 1**: Complete migration and test locally
2. **Week 2**: Deploy CI/CD to a test branch
3. **Week 3**: Run parallel with existing system
4. **Week 4**: Full cutover to Forward

## Key Considerations

### Security

- Use separate tokens for CI and production
- Store all tokens in GitHub Secrets
- Use read-only tokens where possible
- Implement deployment approvals for production

### Performance

- Tinybird Local container for fast CI tests
- Deployment caching where possible
- Parallel test execution
- Efficient fixture generation

### Monitoring

- Track deployment times
- Monitor API performance
- Set up alerts for failed deployments
- Log all deployment activities

## Success Metrics

- [ ] Zero-downtime deployments
- [ ] CI pipeline < 5 minutes
- [ ] Preview deployments < 2 minutes
- [ ] 100% test coverage for critical endpoints
- [ ] Rollback time < 30 seconds

## Next Steps

1. Review and approve this plan
2. Set up GitHub Secrets for Tinybird tokens
3. Complete migration to Forward format
4. Implement CI workflow
5. Test with a sample PR
6. Roll out incrementally

## Resources

- [Tinybird Forward Documentation](https://www.tinybird.co/docs/forward)
- [Local Testing Guide](./tinybird/docs/configure-local-testing.md)
- [CI/CD Guide](./tinybird/docs/deploying-from-ci-cd.md)
- [Schema Evolution Guide](./tinybird/docs/evolve-data-sources.md)
