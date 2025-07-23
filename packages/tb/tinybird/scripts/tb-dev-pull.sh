#!/bin/bash

# Script to export fixtures for all non-materialized datasources
# This creates sample data files in the fixtures directory for local development

set -e

echo "🔄 Exporting fixtures for non-materialized datasources..."

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
  if tb --cloud datasource export "$datasource" --format ndjson --rows "$ROWS" --where "workspaceId='ws_xonQ49f34Y8YYGX3' AND timestamp >= now() - interval 7 day"; then
    echo "✅ Exported $datasource successfully"
  else
    echo "❌ Failed to export $datasource"
    exit 1
  fi
done

echo "✨ All fixtures exported successfully!"