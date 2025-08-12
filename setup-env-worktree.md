# Environment Setup for Git Worktree

Since you're working in a Git worktree, Vercel CLI has issues with the `.git` file structure. Here are your options:

## Option 1: Copy .env from main repository (Recommended)

If you have a `.env` file in your main repository at `/Users/barely/hub/git/barely/`, you can copy it:

```bash
cp /Users/barely/hub/git/barely/.env /Users/barely/hub/git/barely/worktrees/feature/bio-mvp/.env
```

## Option 2: Run Vercel commands from main repository

Navigate to your main repository and run the Vercel commands there, then copy the `.env` file:

```bash
cd /Users/barely/hub/git/barely
pnpm vercel env pull .env
cp .env /Users/barely/hub/git/barely/worktrees/feature/bio-mvp/.env
```

## Option 3: Use the temporary fix script

Run the provided script to temporarily fix the `.git` structure:

```bash
/tmp/vercel-worktree-fix.sh pnpm vercel env pull .env
```

## Option 4: Manual setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Then manually add your environment variables from Vercel dashboard or another source.

## Why this happens

Git worktrees use a `.git` file (not directory) that points to the actual git directory. Vercel CLI expects `.git` to be a directory and fails when it encounters a file instead. This is a known limitation when using Vercel CLI with git worktrees.

## For development

Once you have your `.env` file set up, you should be able to run all development commands normally:

```bash
pnpm dev           # Start all services
pnpm dev:app       # Start just the app
pnpm db:studio     # Open database studio
```