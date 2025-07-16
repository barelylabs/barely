#!/bin/bash

# Setup script for Tinybird local development
# This script handles all setup steps automatically

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

log_info "🚀 Starting Tinybird Complete Setup"
log_info "Project directory: $PROJECT_DIR"

# Step 1: Check prerequisites
log_info "Checking prerequisites..."

# Check for Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    log_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Step 2: Install Tinybird CLI
if ! command -v tb &> /dev/null; then
    # Check if it's in the local bin
    if [ -f "$HOME/.local/bin/tb" ]; then
        log_info "Tinybird CLI found in ~/.local/bin"
        export PATH="$HOME/.local/bin:$PATH"
    else
        log_info "Installing Tinybird CLI..."
        curl -sSL https://tinybird.co | sh || {
            log_error "Failed to install Tinybird CLI"
            exit 1
        }
        export PATH="$HOME/.local/bin:$PATH"
    fi
else
    log_info "Tinybird CLI already installed"
fi

# Verify tb is available
if ! command -v tb &> /dev/null; then
    log_error "Tinybird CLI installation failed or not in PATH"
    log_info "Please add this to your shell profile: export PATH=\"\$HOME/.local/bin:\$PATH\""
    exit 1
fi

# Step 3: Start or restart Docker container
log_info "Setting up Docker container..."

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^tinybird-local$"; then
    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^tinybird-local$"; then
        log_info "Tinybird Local container is already running"
    else
        log_info "Starting existing Tinybird Local container..."
        docker start tinybird-local
    fi
else
    log_info "Creating and starting Tinybird Local container..."
    docker run \
        --platform linux/amd64 \
        -p 7181:7181 \
        -v barely-tinybird-local-data:/var/lib/tinybird \
        -v "$PROJECT_DIR:/workspace:ro" \
        --name tinybird-local \
        -d \
        --restart unless-stopped \
        tinybirdco/tinybird-local:latest
fi

# Step 4: Wait for container to be ready
log_info "Waiting for Tinybird Local to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:7181/v0/ping &> /dev/null; then
        log_info "Tinybird Local is ready!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        log_error "Tinybird Local failed to start after 30 seconds"
        log_info "Check Docker logs: docker logs tinybird-local"
        exit 1
    fi
    sleep 1
done

# Step 5: Create .env.local if it doesn't exist
cd "$PROJECT_DIR"

if [ ! -f .env.local ]; then
    log_info "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Tinybird Local Development Configuration
# These are default tokens for local development
TINYBIRD_HOST=http://localhost:7181
TINYBIRD_TOKEN=p.eyJ1IjogImFmZjU2NTQwLWI3YmMtNGJmOC05NGI5LTE2ZjYzODIyMWJlZSIsICJpZCI6ICI5ZTdjMzdhMS1iMTM0LTRhNTktOGE5MC0yMjI3ZGY5NWM0MDgiLCAiaG9zdCI6ICJsb2NhbCJ9.vX5HqsBZcGCEyxCc1DvGxhexMGqtF5qfgYWNcmD11y0
EOF
    log_info "Created .env.local file"
else
    log_info ".env.local already exists"
fi

# Step 6: Build the project
log_info "Building Tinybird project..."
if tb build; then
    log_info "Project built successfully!"
else
    log_warn "Build had issues, but continuing..."
fi

# Step 7: Create sample fixtures if they don't exist
if [ ! -d "fixtures" ]; then
    mkdir -p fixtures
    log_info "Created fixtures directory"
fi

# Step 8: Run validation tests
log_info "Running validation..."

# Test the API endpoint
if curl -s "http://localhost:7181/v0/pipes/ci_test.json?token=p.eyJ1IjogImFmZjU2NTQwLWI3YmMtNGJmOC05NGI5LTE2ZjYzODIyMWJlZSIsICJpZCI6ICI5ZTdjMzdhMS1iMTM0LTRhNTktOGE5MC0yMjI3ZGY5NWM0MDgiLCAiaG9zdCI6ICJsb2NhbCJ9.vX5HqsBZcGCEyxCc1DvGxhexMGqtF5qfgYWNcmD11y0" | grep -q "success"; then
    log_info "✅ API endpoint test passed!"
else
    log_warn "API endpoint test failed, but environment is set up"
fi

# Step 9: Update shell profile if needed
SHELL_PROFILE=""
if [ -n "${BASH_VERSION:-}" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -n "${ZSH_VERSION:-}" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
fi

if [ -n "$SHELL_PROFILE" ] && [ -f "$SHELL_PROFILE" ]; then
    if ! grep -q "/.local/bin" "$SHELL_PROFILE"; then
        log_info "Adding Tinybird CLI to PATH in $SHELL_PROFILE"
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_PROFILE"
        log_info "Please run: source $SHELL_PROFILE"
    fi
fi

# Mark setup as complete
touch "$PROJECT_DIR/.setup-complete"

# Final summary
log_info "✅ Tinybird local development environment is ready!"
log_info ""
log_info "Quick reference:"
log_info "  - Local API: http://localhost:7181"
log_info "  - Start development: pnpm tb:dev"
log_info "  - Build project: pnpm tb:build"
log_info "  - Run tests: pnpm tb:test"
log_info "  - Stop container: docker stop tinybird-local"
log_info "  - View logs: docker logs tinybird-local"
log_info ""
log_info "For new terminals, remember to add to PATH:"
log_info "  export PATH=\"\$HOME/.local/bin:\$PATH\""