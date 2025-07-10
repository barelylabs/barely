# Tinybird Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### Error: "No auth token provided"

**Solution**: Run `pnpm tb:auth` and enter your Tinybird API token when prompted.

#### Error: "Invalid token"

**Solution**:

1. Check that your token has the correct permissions
2. Ensure you're using the correct workspace token
3. Verify the token in your `.tinyb` file or `TINYBIRD_API_KEY` environment variable

### Branch Issues

#### Error: "Branch name contains invalid characters"

**Problem**: Tinybird branches cannot contain hyphens (-)
**Solution**: Use underscores (\_) instead. Example: `feature_new_analytics` not `feature-new-analytics`

#### Error: "Branch not found"

**Solution**:

1. List available branches: `pnpm tb:branch:list`
2. Create the branch if needed: `pnpm tb:branch:create branch_name`
3. Switch to the branch: `pnpm tb:branch:use branch_name`

#### Error: "Resources not found" on empty branch

**Problem**: Empty branches start with NO resources
**Solution**: Use `pnpm tb:push:force` to push ALL resources on first push

### Push/Pull Issues

#### Error: "Resource already exists"

**Solution**: Use `pnpm tb:push:force` to overwrite existing resources

#### Error: "Dependencies not found"

**Problem**: Trying to push a pipe that depends on a datasource that doesn't exist
**Solution**:

1. Push all datasources first
2. Then push pipes that depend on them
3. Or use `pnpm tb:push:force` to push everything at once

#### Error: "Permission denied"

**Solution**:

1. Check your token has write permissions
2. Verify you're in the correct branch (not main)
3. Ensure you have access to the workspace

### Data Issues

#### No data in materialized views

**Problem**: Materialized views need to be populated after creation
**Solution**:

1. Wait for the materialization job to run (check schedule)
2. Manually trigger population if needed
3. Verify source datasources have data

#### Query returns empty results

**Check**:

1. Time range filters - ensure data exists in the range
2. Workspace/asset filters - verify correct IDs
3. Data ingestion - confirm events are being sent

### Performance Issues

#### Slow queries

**Solutions**:

1. Check if proper indexes exist
2. Review query complexity
3. Consider adding materialized views
4. Use time filters to limit data scanned

#### High costs

**Solutions**:

1. Review query patterns
2. Add appropriate filters
3. Use materialized views for frequent queries
4. Monitor usage in Tinybird UI

### CI/CD Issues

#### GitHub Actions failing

**Check**:

1. `TINYBIRD_API_KEY` secret is set in GitHub
2. Branch naming follows underscore convention
3. All required files are committed
4. No syntax errors in pipe/datasource files

#### Changes not deploying

**Verify**:

1. PR was merged to main branch
2. CI/CD workflow completed successfully
3. Check GitHub Actions logs for errors

### Development Workflow Issues

#### Can't find resources after `tb pull`

**Problem**: Resources are placed in root directories by CLI
**Solution**: We organize them into subdirectories for better structure. The CI/CD handles deployment correctly.

#### Changes not reflecting in branch

**Steps**:

1. Ensure you're in the correct branch: `pnpm tb:branch:current`
2. Push your changes: `pnpm tb:push`
3. Check differences: `pnpm tb:diff`

### Validation Issues

#### How to validate changes before pushing

**Commands**:

1. `pnpm tb:check` - Basic syntax validation
2. `pnpm tb:validate` - Dry run of push operation
3. `pnpm tb:diff` - See what will change

### Getting Help

1. **Tinybird Documentation**: https://www.tinybird.co/docs
2. **Internal Docs**: See README.md, DEVELOPMENT_WORKFLOW.md
3. **Logs**: Check `.tinyb.log` for detailed error messages
4. **Support**: Contact Tinybird support for infrastructure issues

### Best Practices

1. Always work in branches, never directly in main workspace
2. Test queries in Tinybird UI before committing
3. Use meaningful branch names with underscores
4. Document complex queries with comments
5. Monitor costs and performance regularly
6. Keep materialized views updated
7. Use appropriate data retention policies
