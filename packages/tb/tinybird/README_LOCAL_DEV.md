# Tinybird Local Development Guide

> **🚀 New to Tinybird? Start with the [Quick Start Guide](./QUICK_START.md)**

## Quick Start

1. **Initial Setup**

   ```bash
   # One-command setup (installs everything)
   pnpm tb:setup

   # Or manual setup (if TB CLI already installed)
   pnpm tb:local:setup
   ```

   **Having issues?** Run `pnpm tb:troubleshoot`

2. **Start Development**

   ```bash
   # Start the development watcher
   pnpm tb:dev
   ```

3. **Run Tests**
   ```bash
   # Run all tests
   pnpm tb:test
   ```

## Available Commands

### Container Management

- `pnpm tb:local:start` - Start Tinybird Local container
- `pnpm tb:local:stop` - Stop Tinybird Local container
- `pnpm tb:local:restart` - Restart Tinybird Local container

### Development

- `pnpm tb:dev` - Start development watcher
- `pnpm tb:build` - Build the project
- `pnpm tb:test` - Run tests
- `pnpm tb:deploy:check` - Validate deployment
- `pnpm tb:mock <datasource>` - Generate mock data

## Local Development Workflow

### 1. Making Changes

When you modify datafiles (.datasource, .pipe), the `tb dev` watcher will automatically rebuild:

```bash
# Terminal 1: Keep this running
pnpm tb:dev

# Terminal 2: Make your changes
# Edit datasources/my_datasource.datasource
# Edit endpoints/my_endpoint.pipe
```

### 2. Testing with Fixtures

Fixtures are automatically loaded when you run `tb build`:

```bash
# Add test data to fixtures/
echo '{"timestamp":"2024-01-10T10:00:00Z","data":"test"}' > fixtures/my_datasource.ndjson

# Build to load fixtures
pnpm tb:build
```

### 3. Generating Mock Data

Use the mock command to generate realistic test data:

```bash
# Generate mock data for a datasource
pnpm tb:mock barely_events

# Generate with custom prompt
pnpm tb:mock barely_events --prompt "Create 100 pageView events from US users"
```

### 4. Testing Endpoints

Access your endpoints locally:

```bash
# Get endpoint URL with token
cd packages/tb/tinybird && tb endpoint url my_endpoint

# Test with curl
curl "http://localhost:7181/v0/pipes/my_endpoint.json?token=<token>"

# Test with parameters
curl "http://localhost:7181/v0/pipes/my_endpoint.json?token=<token>&param1=value1"
```

### 5. Running Tests

Create and run tests for your endpoints:

```bash
# Create a test
cd packages/tb/tinybird && tb test create my_endpoint

# Edit tests/my_endpoint.yaml

# Run all tests
pnpm tb:test

# Run specific test
cd packages/tb/tinybird && tb test run my_endpoint
```

## Environment Variables

### Local Development (.env.local)

```env
# These are set automatically by setup script
TINYBIRD_HOST=http://localhost:7181
TINYBIRD_TOKEN=local_token_development
NEXT_PUBLIC_TINYBIRD_HOST=http://localhost:7181
NEXT_PUBLIC_TINYBIRD_TOKEN=local_token_development
```

### Production (.env)

```env
# Add your production credentials (DO NOT COMMIT)
TINYBIRD_HOST=https://api.us-east.tinybird.co
TINYBIRD_TOKEN=your_production_token
TINYBIRD_WORKSPACE=your_workspace_name
```

## Troubleshooting

### Container Issues

```bash
# Check if container is running
docker ps | grep tinybird-local

# View container logs
docker logs tinybird-local

# Reset container
pnpm tb:local:restart
```

### Build Errors

```bash
# Clean build
cd packages/tb/tinybird && tb build --force

# Check syntax
cd packages/tb/tinybird && tb check
```

### Data Issues

```bash
# Check datasource data
cd packages/tb/tinybird && tb datasource data <datasource_name>

# Check quarantine
cd packages/tb/tinybird && tb datasource data <datasource_name>_quarantine
```

## Advanced Usage

### Docker Compose

For more control, use Docker Compose:

```bash
cd packages/tb/tinybird
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Persistent Data

Data persists in Docker volume `barely-tinybird-local-data`:

```bash
# View volume
docker volume inspect barely-tinybird-local-data

# Clear all data (careful!)
docker volume rm barely-tinybird-local-data
```

### Custom Configuration

Edit `docker-compose.yml` for advanced settings:

- Custom ports
- Environment variables
- Volume mounts
- Resource limits

## Best Practices

1. **Always use fixtures** for reproducible tests
2. **Run tests before pushing** to catch issues early
3. **Use `tb deploy --check`** to validate changes
4. **Keep fixtures small** for faster builds
5. **Document your endpoints** with clear descriptions
6. **Use meaningful test names** that describe scenarios

## Next Steps

- Read the [Tinybird Forward docs](https://www.tinybird.co/docs/forward)
- Set up [CI/CD workflows](../TINYBIRD_FORWARD_PLAN.md#phase-2-cicd-workflows)
- Learn about [schema evolution](./docs/evolve-data-sources.md)
