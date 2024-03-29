#!/bin/bash

me=$(neonctl me | awk -F '│' 'NR==4{print $2}' | tr -d ' ')
currentBranch=$(git rev-parse --abbrev-ref HEAD)
branchName=${currentBranch}__dev_${me}

# Use the output in the neonctl command
if neonctl branches get $branchName; then
    neonctl branches reset $branchName --parent
else
    neonctl branches create $branchName
fi

# Get the connection string for the branch
connectionString=$(neonctl connection-string $branchName)
connectionStringPool=$(neonctl connection-string $branchName --pooled)

# Check if DATABASE_URL exists in the file
if grep -q "DATABASE_URL" .env; then
    # If it exists, replace it    
    sed -i "" "s#^DATABASE_URL=.*#DATABASE_URL=$connectionString#" .env
else
    # If it doesn't exist, append it
    echo "DATABASE_URL=$connectionString" >> .env
fi

# Check if DATABASE_URL_POOLED exists in the file
if grep -q "DATABASE_POOL_URL" .env; then
    # If it exists, replace it
    sed -i "" "s#^DATABASE_POOL_URL=.*#DATABASE_POOL_URL=$connectionStringPool#" .env
else
    # If it doesn't exist, append it
    echo "DATABASE_POOL_URL=$connectionStringPool" >> .env
fi
