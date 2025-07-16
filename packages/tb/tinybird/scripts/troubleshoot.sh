#!/bin/bash

# Tinybird troubleshooting script
# Helps diagnose common issues

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Tinybird Local Troubleshooting${NC}"
echo "================================"

# Check Docker
echo -e "\n${YELLOW}1. Docker Status:${NC}"
if command -v docker &> /dev/null; then
    echo "✅ Docker installed"
    if docker info &> /dev/null; then
        echo "✅ Docker daemon running"
    else
        echo "❌ Docker daemon not running - Start Docker Desktop"
    fi
else
    echo "❌ Docker not installed - Install from https://docker.com"
fi

# Check Tinybird CLI
echo -e "\n${YELLOW}2. Tinybird CLI:${NC}"
if command -v tb &> /dev/null; then
    echo "✅ Tinybird CLI installed"
    tb --version
elif [ -f "$HOME/.local/bin/tb" ]; then
    echo "⚠️  Tinybird CLI installed but not in PATH"
    echo "   Add to your shell: export PATH=\"\$HOME/.local/bin:\$PATH\""
else
    echo "❌ Tinybird CLI not installed"
    echo "   Install with: curl -sSL https://tinybird.co | sh"
fi

# Check container
echo -e "\n${YELLOW}3. Docker Container:${NC}"
if docker ps -a --format '{{.Names}}' | grep -q "^tinybird-local$"; then
    if docker ps --format '{{.Names}}' | grep -q "^tinybird-local$"; then
        echo "✅ Container running"
        # Check health
        if docker inspect tinybird-local --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
            echo "✅ Container healthy"
        else
            echo "⚠️  Container not healthy yet"
        fi
    else
        echo "⚠️  Container exists but stopped"
        echo "   Start with: docker start tinybird-local"
    fi
else
    echo "❌ Container not found"
    echo "   Create with: pnpm tb:local:start"
fi

# Check port
echo -e "\n${YELLOW}4. Port 7181:${NC}"
if lsof -i :7181 &> /dev/null || netstat -an | grep -q ":7181.*LISTEN"; then
    echo "✅ Port 7181 is in use (should be Tinybird)"
else
    echo "❌ Port 7181 not in use"
    echo "   Container might not be running"
fi

# Check API
echo -e "\n${YELLOW}5. API Status:${NC}"
if curl -s http://localhost:7181/v0/ping 2>&1 | grep -q "error"; then
    echo "✅ API responding (may need workspace setup)"
else
    echo "❌ API not responding"
    echo "   Wait a moment or check container logs"
fi

# Check environment
echo -e "\n${YELLOW}6. Environment:${NC}"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "❌ .env.local missing"
    echo "   Run setup script or create manually"
fi

# Check workspace
echo -e "\n${YELLOW}7. Build Status:${NC}"
if [ -f "$HOME/.local/bin/tb" ]; then
    export PATH="$HOME/.local/bin:$PATH"
    if tb build 2>&1 | grep -q "No changes"; then
        echo "✅ Project builds successfully"
    else
        echo "⚠️  Build has issues - check datasource/pipe files"
    fi
else
    echo "⚠️  Cannot check build - CLI not available"
fi

# Docker logs
echo -e "\n${YELLOW}8. Recent Docker Logs:${NC}"
if docker ps --format '{{.Names}}' | grep -q "^tinybird-local$"; then
    echo "Last 10 lines:"
    docker logs tinybird-local --tail 10 2>&1 | sed 's/^/  /'
else
    echo "Container not running - no logs available"
fi

# Summary
echo -e "\n${GREEN}Summary:${NC}"
echo "If you're having issues:"
echo "1. Ensure Docker Desktop is running"
echo "2. Run: ./scripts/setup-all.sh"
echo "3. Add to PATH: export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "4. Check logs: docker logs tinybird-local"
echo "5. Restart if needed: pnpm tb:local:restart"