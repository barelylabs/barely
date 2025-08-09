# Database Migrations

This folder contains one-time database migration scripts that modify the database schema or data. These scripts are located within the `@barely/db` package for direct access to database connections and schemas.

## ⚠️ Important

**Always backup your database before running any migration scripts!**

These scripts make permanent changes to your database and should be run with caution.

## Available Migrations

### 1. Global Fan Uniqueness Migration (2025-08-06)

**Purpose**: Migrate fans to have globally unique emails with many-to-many workspace relationships.

**Scripts**:

- `2025-08-06-global-fan-uniqueness-dry-run.ts` - Analyzes what would be changed without modifying data
- `2025-08-06-global-fan-uniqueness.ts` - Actually performs the migration

**Usage**:

```bash
# Navigate to the db package
cd packages/db

# First, run the dry run to see what will be changed
pnpm with-env tsx src/migrations/2025-08-06-global-fan-uniqueness-dry-run.ts

# If everything looks good, run the actual migration
pnpm with-env tsx src/migrations/2025-08-06-global-fan-uniqueness.ts
```

**What it does**:

1. Creates \_Fans_To_Workspaces entries for all existing fans (using their current workspaceId)
2. Consolidates fans with the same email across ALL workspaces
3. Merges data from duplicates (preserving opt-ins, addresses, Stripe data)
4. Updates all foreign key references to point to the consolidated fan
5. Ensures consolidated fan has links to all relevant workspaces
6. Deletes duplicate fan records

**After migration**:

- Each email address will have only one fan record
- Fans can belong to multiple workspaces via \_Fans_To_Workspaces table
- Ready to add unique constraint on Fans.email column

## Migration Naming Convention

Name migration scripts with the pattern:

```
YYYY-MM-DD-description.ts
```

For example:

- `2025-08-06-global-fan-uniqueness.ts`
- `2025-09-01-add-workspace-links.ts`

## Creating New Migrations

When creating a new migration:

1. **Always create a dry-run version** that shows what would be changed
2. **Use transactions** where possible to ensure atomicity
3. **Use soft deletes** instead of hard deletes when removing records
4. **Log progress** so users can see what's happening
5. **Handle errors gracefully** and provide clear error messages
6. **Document the migration** with comments explaining why it's needed

## Running Migrations in Production

1. **Test in development** first
2. **Backup the production database**
3. **Run during low-traffic periods**
4. **Monitor the migration** as it runs
5. **Have a rollback plan** ready

## Migration History

Keep track of which migrations have been run:

| Date       | Migration             | Description                                            | Status  |
| ---------- | --------------------- | ------------------------------------------------------ | ------- |
| 2025-08-06 | global-fan-uniqueness | Migrate to global email uniqueness with M2M workspaces | Pending |

## Notes

- These scripts use the `dbHttp` connection from the db package
- **IMPORTANT**: Use `pnpm with-env tsx` to run scripts so environment variables are loaded
- They respect your existing database configuration and environment variables
- Most migrations can be run multiple times safely (idempotent)
- Soft-deleted records (with deletedAt set) are generally ignored
