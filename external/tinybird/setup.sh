#!/bin/bash

# Setup script for Tinybird CLI

echo "Setting up Tinybird CLI environment..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/upgrade tinybird-cli
echo "Installing/upgrading Tinybird CLI..."
pip install --upgrade tinybird-cli

# Display version
echo "Tinybird CLI installed:"
tb --version

echo ""
echo "Setup complete! To use the Tinybird CLI:"
echo "1. Activate the virtual environment: source .venv/bin/activate"
echo "2. Authenticate: tb auth -i"
echo "3. Run tb --help to see available commands"