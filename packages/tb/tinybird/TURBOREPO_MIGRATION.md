# Tinybird Scripts Migration to Turborepo

## Overview

All Tinybird scripts have been moved from the root `package.json` to the `@barely/tb` package to leverage Turborepo's capabilities.

## Benefits

1. **Better Organization**: Tinybird scripts live with the Tinybird code
2. **Parallel Execution**: Turborepo can optimize task execution
3. **Dependency Management**: Tasks can depend on each other (e.g., `tb:test` depends on `tb:build`)
4. **Unified Dev Experience**: `pnpm dev` in the tb package now runs both TypeScript and Tinybird watchers

## Usage

All commands work the same from the root:

```bash
# From root (uses Turborepo)
pnpm tb:setup          # One-time setup
pnpm tb:dev           # Start Tinybird dev watcher
pnpm tb:build         # Build project
pnpm tb:test          # Run tests

# Or directly from tb package
cd packages/tb
pnpm tb:dev           # Direct execution
```

## Development Workflow

The `@barely/tb` package now has an integrated dev command:

```bash
cd packages/tb
pnpm dev  # Runs both TypeScript watch AND Tinybird dev
```

This uses `concurrently` to run:

- TypeScript compilation in watch mode
- Tinybird development watcher

## Task Dependencies

Turborepo now manages task dependencies:

- `tb:test` depends on `tb:build`
- `tb:deploy:check` depends on both `tb:build` and `tb:test`
- `tb:local:restart` depends on `tb:local:stop` then `tb:local:start`

## Migration Details

### Scripts Moved

All `tb:*` scripts moved from root to `@barely/tb/package.json`

### Root package.json

Now uses Turborepo commands:

```json
"tb:dev": "turbo run tb:dev --filter=@barely/tb"
```

### Turbo.json Configuration

Added Tinybird tasks with appropriate settings:

- `persistent: true` for `tb:dev` (long-running watcher)
- `cache: false` for all Tinybird tasks (always fresh)
- Dependencies between related tasks
