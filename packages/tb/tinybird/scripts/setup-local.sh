#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Tinybird CLI is installed
check_tb_cli() {
    if ! command -v tb &> /dev/null; then
        log "Tinybird CLI not found. Installing..."
        curl -sSL https://tinybird.co | sh
        export PATH="$HOME/.local/bin:$PATH"
        
        # Add to shell profile if not already there
        if ! grep -q "/.local/bin" ~/.bashrc 2>/dev/null && ! grep -q "/.local/bin" ~/.zshrc 2>/dev/null; then
            log "Adding Tinybird CLI to PATH..."
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${SHELL_RC:-$HOME/.bashrc}"
        fi
    else
        log "Tinybird CLI found at: $(which tb)"
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker and try again."
    fi
    log "Docker is running"
}

# Start Tinybird Local container
start_tinybird_local() {
    log "Starting Tinybird Local container..."
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q '^tinybird-local$'; then
        if docker ps --format '{{.Names}}' | grep -q '^tinybird-local$'; then
            log "Tinybird Local container is already running"
        else
            log "Starting existing Tinybird Local container..."
            docker start tinybird-local
        fi
    else
        log "Creating new Tinybird Local container..."
        docker run --platform linux/amd64 -p 7181:7181 --name tinybird-local -d tinybirdco/tinybird-local:latest
    fi
    
    # Wait for container to be ready
    log "Waiting for Tinybird Local to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:7181/api/v0/ping > /dev/null 2>&1; then
            log "Tinybird Local is ready!"
            break
        fi
        sleep 1
    done
}

# Set up environment variables
setup_env() {
    local env_file="$1/.env.local"
    
    if [ ! -f "$env_file" ]; then
        log "Creating .env.local file..."
        cat > "$env_file" << EOF
# Tinybird Local Development
TINYBIRD_HOST=http://localhost:7181
TINYBIRD_TOKEN=local_token_development
NEXT_PUBLIC_TINYBIRD_HOST=http://localhost:7181
NEXT_PUBLIC_TINYBIRD_TOKEN=local_token_development

# Add your production tokens here (DO NOT COMMIT)
# TINYBIRD_PROD_HOST=https://api.us-east.tinybird.co
# TINYBIRD_PROD_TOKEN=your_production_token
EOF
        log "Created .env.local file. Please update with your tokens if needed."
    else
        log ".env.local already exists"
    fi
}

# Build the Tinybird project
build_project() {
    local project_dir="$1"
    
    log "Building Tinybird project..."
    cd "$project_dir"
    
    # First, ensure we're connected to local
    export TINYBIRD_HOST=http://localhost:7181
    
    if ! tb build; then
        warn "Build failed. This might be expected on first run."
        warn "Creating initial workspace..."
        
        # Try to create a workspace if it doesn't exist
        tb workspace create barely-local || true
        tb workspace use barely-local || true
        
        # Try building again
        tb build || warn "Build still failing. You may need to fix datafile errors."
    else
        log "Project built successfully!"
    fi
}

# Create sample fixtures
create_fixtures() {
    local project_dir="$1"
    local fixtures_dir="$project_dir/fixtures"
    
    if [ ! -d "$fixtures_dir" ]; then
        log "Creating fixtures directory..."
        mkdir -p "$fixtures_dir"
    fi
    
    # Check if fixtures already exist
    if ls "$fixtures_dir"/*.ndjson &> /dev/null; then
        log "Fixtures already exist"
    else
        log "Creating sample fixtures..."
        
        # Create a sample fixture for barely_events
        cat > "$fixtures_dir/barely_events.ndjson" << 'EOF'
{"timestamp":"2024-01-10T10:00:00Z","workspaceId":"test-workspace","assetId":"test-asset","eventType":"pageView","visitorId":"visitor-1","sessionId":"session-1","properties":{"url":"https://example.com","title":"Test Page"}}
{"timestamp":"2024-01-10T10:01:00Z","workspaceId":"test-workspace","assetId":"test-asset","eventType":"click","visitorId":"visitor-1","sessionId":"session-1","properties":{"selector":"button.cta","text":"Get Started"}}
{"timestamp":"2024-01-10T10:02:00Z","workspaceId":"test-workspace","assetId":"test-asset-2","eventType":"pageView","visitorId":"visitor-2","sessionId":"session-2","properties":{"url":"https://example.com/about","title":"About Us"}}
EOF
        
        log "Created sample fixtures. You can generate more with: pnpm tb:mock <datasource_name>"
    fi
}

# Main setup flow
main() {
    log "Setting up Tinybird Local Development Environment"
    
    # Get the project directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    log "Project directory: $PROJECT_DIR"
    
    # Run setup steps
    check_tb_cli
    check_docker
    start_tinybird_local
    setup_env "$PROJECT_DIR"
    create_fixtures "$PROJECT_DIR"
    build_project "$PROJECT_DIR"
    
    log "✅ Local development environment is ready!"
    log ""
    log "Next steps:"
    log "  1. Run 'pnpm tb:dev' to start the development watcher"
    log "  2. Make changes to your datafiles"
    log "  3. Run 'pnpm tb:test' to run tests"
    log "  4. Access local API at http://localhost:7181"
    log ""
    log "Useful commands:"
    log "  - pnpm tb:local:stop    # Stop Tinybird Local"
    log "  - pnpm tb:local:restart # Restart Tinybird Local"
    log "  - pnpm tb:mock          # Generate mock data"
    log "  - pnpm tb:build         # Build the project"
    log "  - pnpm tb:test          # Run tests"
}

main "$@"