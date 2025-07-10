# Tinybird Analytics

This directory contains the Tinybird analytics configuration for the barely.io platform.

## Setup

### Prerequisites
- Python 3.8+ (tested with 3.12)
- Tinybird API token (stored in `TINYBIRD_API_KEY` environment variable)

### Installation

1. Run the setup script to create a virtual environment and install the Tinybird CLI:
   ```bash
   ./setup.sh
   ```

2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```

3. Authenticate with Tinybird:
   ```bash
   tb auth -i
   ```
   Enter your Tinybird API token when prompted.

## Project Structure

```
packages/tb/tinybird/
├── .gitignore          # Git ignore rules
├── .tinyb              # Tinybird auth (gitignored)
├── .venv/              # Python virtual environment (gitignored)
├── README.md           # This file
├── setup.sh            # Setup script
├── datasources/        # Data source definitions
├── pipes/              # Pipe definitions
└── endpoints/          # API endpoint definitions
```

## Common Commands

```bash
# Activate virtual environment
source .venv/bin/activate

# Pull all resources from Tinybird
tb pull

# Push all resources to Tinybird
tb push

# Check status
tb status

# List datasources
tb datasource ls

# List pipes
tb pipe ls

# List endpoints
tb endpoint ls
```

## Development Workflow

### ⚠️ IMPORTANT: Always Use Branches
**Never push directly to the main Workspace.** Always create a branch for development to protect production.

### Quick Start
1. Create a branch: `pnpm tb:branch:create feature_name` 
   - ⚠️ **CRITICAL**: Use underscores (`_`), NOT hyphens (`-`)!
   - ✅ Correct: `feature_user_analytics`
   - ❌ Wrong: `feature-user-analytics`
2. Switch to branch: `pnpm tb:branch:use feature_name`
3. Make changes to `.datasource` or `.pipe` files
4. Deploy to branch: `pnpm tb:push:force`
5. Test in Tinybird UI (branch workspace)
6. Create PR to merge changes

### Branch Commands
- `pnpm tb:branch:create [name]` - Create a new branch
  - ⚠️ **MUST use underscores**: `feature_analytics` ✅
  - ❌ **NOT hyphens**: `feature-analytics` ❌
- `pnpm tb:branch:use [name]` - Switch to a branch
- `pnpm tb:branch:list` - List all branches
- `pnpm tb:branch:current` - Show current branch
- `pnpm tb:branch:rm [name]` - Remove a branch

**⚠️ Critical Note**: 
- Tinybird branch names MUST use underscores (`_`), not hyphens (`-`)
- This is a hard requirement from Tinybird's API
- Git branches can still use hyphens, but Tinybird branches cannot

### Detailed Workflows
- [BRANCH_WORKFLOW.md](./BRANCH_WORKFLOW.md) - Complete branch workflow guide
- [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) - Development best practices
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment checklist

### Git Hooks
Install pre-commit hooks for automatic validation:
```bash
cd packages/tb/tinybird
./scripts/install-hooks.sh
```

### CI/CD
- Pull requests create isolated test branches
- Changes are validated in the branch
- Merges to `main` deploy to production workspace
- Branches are automatically cleaned up

## Documentation

- [Tinybird CLI Docs](https://www.tinybird.co/docs/cli)
- [Tinybird Datafiles Format](https://www.tinybird.co/docs/cli/datafiles)