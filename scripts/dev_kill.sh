#!/bin/bash

# Define an array of ports to check and kill processes on
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 4000 5555)

for PORT in "${PORTS[@]}"; do
  # Find process ID listening on the current port
  PID=$(lsof -ti:$PORT)

  # Check if any PID was found
  if [ ! -z "$PID" ]; then
    echo "Killing process running on port $PORT with PID: $PID"
    kill -9 $PID
    if [ $? -eq 0 ]; then
      echo "Process on port $PORT killed."
    else
      echo "Failed to kill process on port $PORT."
    fi
  else
    echo "No process found running on port $PORT."
  fi
done