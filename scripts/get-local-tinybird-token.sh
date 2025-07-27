#!/bin/bash

set -euo pipefail

# Function to handle errors
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Getting local Tinybird token..."

# Navigate to tinybird directory
if ! cd packages/tb/tinybird; then
    error_exit "Failed to change to packages/tb/tinybird directory"
fi

# Get the admin token using tb token ls and parsing the output
TINYBIRD_TOKEN=$(tb token ls 2>/dev/null | grep -A1 "name: admin token" | grep "token:" | awk '{print $2}')

if [ -n "$TINYBIRD_TOKEN" ]; then
    # Navigate back to project root
    cd ../../..
    
    # Check if TINYBIRD_API_KEY exists in the file
    if grep -q "TINYBIRD_API_KEY" .env; then
        # If it exists, replace it    
        sed -i "" "s#^TINYBIRD_API_KEY=.*#TINYBIRD_API_KEY=$TINYBIRD_TOKEN#" .env
        log "✅ Updated TINYBIRD_API_KEY in .env"
    else
        # If it doesn't exist, append it
        echo "TINYBIRD_API_KEY=$TINYBIRD_TOKEN" >> .env
        log "✅ Added TINYBIRD_API_KEY to .env"
    fi
else
    error_exit "Failed to get Tinybird admin token. Is the local Tinybird instance running?"
fi