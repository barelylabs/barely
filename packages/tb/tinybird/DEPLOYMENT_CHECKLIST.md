# Tinybird Deployment Checklist

## Before Making Changes

### Environment Setup

- [ ] Pull latest resources from Tinybird: `pnpm tb:pull`
- [ ] Review current workspace status: `pnpm tb:workspace`
- [ ] Verify Git integration status: `tb diff` (if using Git integration)
- [ ] Check current branch count: `tb branch ls` (max 3 allowed)

### Branch Creation

- [ ] Create a feature branch: `git checkout -b feature/tinybird/your-change`
- [ ] Create a Tinybird branch: `pnpm tb:branch:create feature_your_change` (use underscores!)
- [ ] Verify switched to new branch: `pnpm tb:branch:current`

## While Developing

### Code Quality

- [ ] Follow naming conventions (see README.md)
- [ ] Add comments to complex SQL logic
- [ ] Use meaningful node names in pipes
- [ ] Avoid using `--no-check` flag

### Testing

- [ ] Run syntax validation: `pnpm tb:check`
- [ ] Test queries in Tinybird UI for performance
- [ ] Verify no regression test failures
- [ ] Check query execution times

### Documentation

- [ ] Update SCHEMA.md if schema changes
- [ ] Update relevant README files
- [ ] Document any new event types
- [ ] Note any performance considerations

## Before Committing

### Validation

- [ ] Run dry-run to preview changes: `pnpm tb:validate`
- [ ] Review diff output: `pnpm tb:diff`
- [ ] Ensure no breaking changes to existing endpoints
- [ ] Verify backwards compatibility

### Code Review Prep

- [ ] Self-review all changes
- [ ] Check for sensitive data exposure
- [ ] Ensure proper error handling
- [ ] Verify resource dependencies

## Deployment Process

### For Pull Requests

1. **Create PR**

   - [ ] Use descriptive title
   - [ ] Include detailed description of changes
   - [ ] List any breaking changes
   - [ ] Reference related issues

2. **CI Validation**

   - [ ] Wait for CI to create test branch
   - [ ] Review CI logs for any warnings
   - [ ] Verify all checks pass
   - [ ] Check regression test results

3. **Review Process**
   - [ ] Get code review approval
   - [ ] Address any feedback
   - [ ] Re-test after changes
   - [ ] Final approval received

### For Production Deployment

1. **Pre-Deployment**

   - [ ] Ensure on main branch locally
   - [ ] Pull latest changes
   - [ ] Verify no uncommitted changes
   - [ ] Review deployment plan

2. **Deployment**

   - [ ] Merge PR to main branch
   - [ ] Monitor GitHub Actions deployment
   - [ ] Watch for deployment errors
   - [ ] Check Git commit ID recorded (if using Git integration)

3. **Verification**
   - [ ] Verify in Tinybird UI that resources updated
   - [ ] Test critical endpoints
   - [ ] Check materialized view status
   - [ ] Confirm no performance degradation

## Post-Deployment

### Immediate Checks (0-5 minutes)

- [ ] Monitor error rates in Tinybird UI
- [ ] Test a sample of API endpoints
- [ ] Verify data is flowing correctly
- [ ] Check for any alerts

### Short-term Monitoring (5-30 minutes)

- [ ] Monitor query performance metrics
- [ ] Check resource usage
- [ ] Verify materialized views updating
- [ ] Watch for timeout errors

### Communication

- [ ] Update team about deployment
- [ ] Document any issues encountered
- [ ] Note any manual interventions
- [ ] Create incident report if needed

## Rollback Plan

### Rollback Triggers

Initiate rollback if:

- [ ] API endpoints returning errors (>10% error rate)
- [ ] Query performance degraded >50%
- [ ] Materialized views stopped updating
- [ ] Critical business metrics impacted
- [ ] Data quality checks failing

### Rollback Procedures

1. **Git-Integrated Rollback** (if `tb init --git` was run):

   ```bash
   # Quick revert
   git revert HEAD
   git push origin main
   # CI/CD will handle the rollback
   ```

2. **Manual Rollback**:

   ```bash
   # Switch to main workspace
   tb branch use main

   # Option 1: Push previous version
   git checkout <last-good-commit> -- .
   tb push --force --yes

   # Option 2: Use Tinybird UI version history
   ```

3. **Emergency Procedure**:
   - See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed steps
   - Contact Tinybird support if needed
   - Notify stakeholders immediately

## Special Scenarios

### Materialized View Changes

- [ ] Review [MATERIALIZED_VIEWS.md](./MATERIALIZED_VIEWS.md)
- [ ] Plan for potential data backfill
- [ ] Consider creating new MV instead of updating
- [ ] Monitor materialization lag after deployment
- [ ] Have rollback strategy for MV changes

### Schema Breaking Changes

- [ ] Identify all dependent resources
- [ ] Create migration plan
- [ ] Consider phased deployment
- [ ] Test with sample data first
- [ ] Document migration steps

### High-Traffic Endpoints

- [ ] Deploy during low-traffic period
- [ ] Have scaling plan ready
- [ ] Monitor closely for first hour
- [ ] Prepare to rollback quickly
- [ ] Consider canary deployment

## Common Issues & Solutions

### Deployment Failures

**"Resource already exists"**

- Solution: Check if using correct branch
- Use `tb push --force` if intentional replacement

**"Permission denied"**

- Verify token has admin permissions
- Check workspace access rights

**"Regression test failed"**

- Review changes for unintended modifications
- Use `--force` only if changes are intentional
- Never use `--no-check` in production

### Performance Issues

**Slow Queries**

- Check query execution time in UI
- Review recent SQL changes
- Consider adding materialized views
- Optimize sorting keys

**High Resource Usage**

- Monitor in Tinybird UI
- Check for inefficient queries
- Review materialization frequency
- Consider data retention policies

## Final Checks

- [ ] All checklist items completed
- [ ] Deployment documented
- [ ] Team notified
- [ ] Monitoring in place
- [ ] Rollback plan ready
