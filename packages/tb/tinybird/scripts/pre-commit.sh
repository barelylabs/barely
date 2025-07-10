#!/bin/bash

# Tinybird pre-commit hook
# This script validates Tinybird resources before committing

echo "🐦 Running Tinybird pre-commit validation..."

# Check if we're in the right directory
if [ ! -f ".venv/bin/tb" ]; then
    echo "❌ Error: Tinybird CLI not found. Run 'pnpm tb:setup' first."
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Check if authenticated
if ! .venv/bin/tb workspace current &>/dev/null; then
    echo "❌ Error: Not authenticated to Tinybird. Run 'pnpm tb:auth' first."
    exit 1
fi

# Get list of changed Tinybird files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "(\.datasource|\.pipe|\.incl)$")

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ No Tinybird files changed."
    exit 0
fi

echo "📝 Changed Tinybird files:"
echo "$CHANGED_FILES"

# Validate syntax
echo "🔍 Validating syntax..."
for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        echo "  Checking: $file"
        # Basic syntax validation (you can add more specific checks)
        if ! grep -q "^SCHEMA\|^NODE\|^DATASOURCE\|^ENGINE" "$file"; then
            echo "  ⚠️  Warning: $file might have invalid structure"
        fi
    fi
done

# Run dry-run push to validate
echo "🚀 Running dry-run push to validate changes..."
if .venv/bin/tb push --dry-run --no-interactive; then
    echo "✅ Tinybird validation passed!"
else
    echo "❌ Tinybird validation failed. Please fix the errors before committing."
    exit 1
fi

exit 0