#!/bin/bash

# Script to export fixtures for all non-materialized datasources
# This creates sample data files in the fixtures directory for local development

set -e

echo "🔄 Exporting fixtures for non-materialized datasources..."

# Load TEST_WORKSPACE_ID from root .env file
ENV_FILE="../../../.env"
if [ -f "$ENV_FILE" ]; then
  # Source the .env file and look for TEST_WORKSPACE_ID
  export $(grep -E '^TEST_WORKSPACE_ID=' "$ENV_FILE" | xargs)
fi

# Check if TEST_WORKSPACE_ID is set
if [ -z "$TEST_WORKSPACE_ID" ]; then
  echo "❌ Error: TEST_WORKSPACE_ID not found in $ENV_FILE"
  echo "Please add TEST_WORKSPACE_ID to your .env file"
  exit 1
fi

echo "🔍 Using workspace ID: $TEST_WORKSPACE_ID"

# Define the datasources to export (non-mv datasources)
DATASOURCES=(
  "barely_events"
#   "email_events"
#   "barely_streaming_stats"
)

# Number of rows to export per datasource
ROWS=1000

# Export each datasource
for datasource in "${DATASOURCES[@]}"; do
  echo "📦 Exporting $datasource..."
  
  # Export the datasource data with workspaceId filter and last 7 days
  if tb --cloud datasource export "$datasource" --format ndjson --rows "$ROWS" --where "workspaceId='$TEST_WORKSPACE_ID' AND timestamp >= now() - interval 7 day"; then
    echo "✅ Exported $datasource successfully"
  else
    echo "❌ Failed to export $datasource"
    exit 1
  fi
done

echo "✨ All fixtures exported successfully!"