#!/bin/bash
# Update Vercel environment variables for all apps
# Usage: ./update-vercel-env.sh <environment> <branch_name> <database_url> <database_pool_url>

set -e

ENVIRONMENT=$1
BRANCH_NAME=$2
DATABASE_URL=$3
DATABASE_POOL_URL=$4

# Load app configuration
APPS=$(cat .github/apps.json | jq -r '.apps[]')

# Function to update env vars for a single app
update_app_env() {
  local app_name=$1
  local project_id_secret=$2
  local project_id=${!project_id_secret}
  
  echo "Updating env vars for $app_name..."
  
  export VERCEL_PROJECT_ID=$project_id
  
  if [ "$ENVIRONMENT" = "preview" ]; then
    # Remove existing vars if they exist
    pnpm vercel env ls preview $BRANCH_NAME --token=$VERCEL_TOKEN 2>/dev/null | grep -q DATABASE_URL && \
      pnpm vercel env rm DATABASE_URL preview $BRANCH_NAME --yes --token=$VERCEL_TOKEN || true
    
    pnpm vercel env ls preview $BRANCH_NAME --token=$VERCEL_TOKEN 2>/dev/null | grep -q DATABASE_POOL_URL && \
      pnpm vercel env rm DATABASE_POOL_URL preview $BRANCH_NAME --yes --token=$VERCEL_TOKEN || true
    
    # Add new vars
    echo $DATABASE_URL | pnpm vercel env add DATABASE_URL preview $BRANCH_NAME --token=$VERCEL_TOKEN
    echo $DATABASE_POOL_URL | pnpm vercel env add DATABASE_POOL_URL preview $BRANCH_NAME --token=$VERCEL_TOKEN
  fi
}

# Export required env vars
export VERCEL_TOKEN
export VERCEL_ORG_ID=$VERCEL_TEAM_ID

# Update each app in parallel
echo "$APPS" | jq -r '. | @base64' | while read app_data; do
  app=$(echo $app_data | base64 -d)
  app_name=$(echo $app | jq -r '.name')
  project_id_secret=$(echo $app | jq -r '.project_id_secret')
  
  # Run updates in background for parallelism
  update_app_env "$app_name" "$project_id_secret" &
done

# Wait for all background jobs to complete
wait

echo "All Vercel environment variables updated successfully"