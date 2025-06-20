# Tinybird Deployment Checklist

## Before Making Changes

- [ ] Pull latest resources from Tinybird: `pnpm tb:pull`
- [ ] Review current workspace status: `pnpm tb:workspace`
- [ ] Create a feature branch: `git checkout -b feature/tinybird/your-change`
- [ ] Create a Tinybird branch: `pnpm tb:branch:create feature_your_change` (use underscores!)

## While Developing

- [ ] Follow naming conventions (see README.md)
- [ ] Add comments to complex SQL logic
- [ ] Update documentation if adding new event types
- [ ] Test queries in Tinybird UI for performance

## Before Committing

- [ ] Run dry-run to validate: `pnpm tb:push:dry`
- [ ] Ensure no breaking changes to existing endpoints
- [ ] Update SCHEMA.md if schema changes
- [ ] Update relevant README files

## Deployment Process

### For Pull Requests
- [ ] Create PR with descriptive title
- [ ] Include description of changes
- [ ] List any breaking changes
- [ ] Wait for CI validation to pass
- [ ] Get code review approval

### For Production Deployment
- [ ] Merge PR to main branch
- [ ] Monitor GitHub Actions deployment
- [ ] Verify in Tinybird UI that resources updated
- [ ] Test a few endpoints to ensure they work

## Post-Deployment

- [ ] Monitor query performance in Tinybird UI
- [ ] Check for any error alerts
- [ ] Update team about significant changes
- [ ] Document any learnings or issues

## Rollback Plan

If issues arise after deployment:

1. **Quick Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**:
   - Use Tinybird UI to restore previous version
   - Or checkout previous commit and force push

3. **Emergency Contacts**:
   - Keep Tinybird support contact handy
   - Document who to notify for critical issues

## Common Issues & Solutions

### "Resource already exists"
- Solution: Use `tb push --force` or delete in UI first

### Materialized View Errors
- Solution: May need to drop and recreate the view

### Performance Degradation
- Check query execution time in Tinybird UI
- Review recent changes to SQL logic
- Consider adding indexes or optimizing queries

### Token Permission Errors
- Ensure API token has correct permissions
- Admin tokens needed for resource creation/modification