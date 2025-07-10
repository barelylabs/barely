#!/bin/bash

# Install Tinybird git hooks

echo "Installing Tinybird git hooks..."

# Get the git root directory
GIT_ROOT=$(git rev-parse --show-toplevel)
HOOK_DIR="$GIT_ROOT/.git/hooks"
TINYBIRD_DIR="$GIT_ROOT/external/tinybird"

# Create pre-commit hook
cat > "$HOOK_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Check if Tinybird files are being committed
if git diff --cached --name-only | grep -qE "external/tinybird/.*\.(datasource|pipe|incl)$"; then
    echo "Tinybird files detected in commit, running validation..."
    cd external/tinybird
    if [ -f "scripts/pre-commit.sh" ]; then
        ./scripts/pre-commit.sh
    else
        echo "Warning: Tinybird pre-commit script not found"
    fi
fi
EOF

# Make hook executable
chmod +x "$HOOK_DIR/pre-commit"

echo "✅ Git hooks installed successfully!"
echo ""
echo "The pre-commit hook will automatically validate Tinybird resources before committing."
echo "To skip validation, use: git commit --no-verify"