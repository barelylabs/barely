#!/bin/bash

echo "Waiting for Tinybird Local to be ready..."

# Wait up to 60 seconds for the container to be running
for i in {1..60}; do
    if docker ps | grep -q tinybird-local; then
        echo "Container is running, checking API..."
        break
    fi
    sleep 1
done

# Wait for API to be responsive
for i in {1..30}; do
    if curl -s http://localhost:7181/api/v0/ping > /dev/null 2>&1; then
        echo "✅ Tinybird Local is ready!"
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo "❌ Tinybird Local failed to start"
exit 1