# Tinybird Quick Start Guide

## 🚀 One-Command Setup

```bash
./scripts/setup-all.sh
```

That's it! This script will:

- ✅ Install Tinybird CLI
- ✅ Start Docker container
- ✅ Configure environment
- ✅ Build the project
- ✅ Validate everything works

## 📋 Prerequisites

You only need:

1. **Docker Desktop** installed and running
2. **Node.js** and **pnpm** (already required for the project)

## 🎯 Common Commands

After setup, use these commands:

```bash
# Start development watcher (auto-rebuilds on changes)
pnpm tb:dev

# Build the project
pnpm tb:build

# Run tests
pnpm tb:test

# Access local API
curl http://localhost:7181/v0/pipes/[pipe_name].json?token=[your_token]
```

## 🔧 Troubleshooting

### "Docker is not running"

→ Start Docker Desktop application

### "tb command not found"

→ Add to your shell: `export PATH="$HOME/.local/bin:$PATH"`

### "Port 7181 already in use"

→ Stop existing container: `docker stop tinybird-local`

### "Build failed"

→ Check datasource/pipe files for syntax errors
→ Run `tb build` to see detailed errors

## 🛠️ Manual Setup (if needed)

If the automated script fails:

1. **Install Tinybird CLI**

   ```bash
   curl -sSL https://tinybird.co | sh
   export PATH="$HOME/.local/bin:$PATH"
   ```

2. **Start Docker container**

   ```bash
   pnpm tb:local:start
   ```

3. **Run setup**
   ```bash
   pnpm tb:local:setup
   ```

## 📁 Project Structure

```
packages/tb/tinybird/
├── datasources/     # Data schemas
├── endpoints/       # API endpoints
├── fixtures/        # Test data
├── tests/          # Endpoint tests
└── scripts/        # Utility scripts
```

## 🔄 Daily Workflow

1. **Start your day**

   ```bash
   # Container auto-starts with Docker
   pnpm tb:dev  # Start watcher
   ```

2. **Make changes**

   - Edit `.datasource` or `.pipe` files
   - Watcher auto-rebuilds

3. **Test locally**

   ```bash
   pnpm tb:test
   ```

4. **Deploy**
   ```bash
   pnpm tb:deploy:check  # Validate
   tb deploy            # Deploy to cloud
   ```

## 💡 Tips

- Container persists data between restarts
- Use `pnpm tb:mock <datasource>` to generate test data
- Check logs: `docker logs tinybird-local`
- Reset everything: `pnpm tb:local:restart`
