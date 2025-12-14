#!/bin/bash

# Function to kill all background processes on exit
cleanup() {
    echo "Stopping all services..."
    # Kill all child processes of this script
    pkill -P $$
}
trap cleanup EXIT INT TERM

echo "Starting MongoDB check..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "WARNING: MongoDB process 'mongod' not found. Ensure it is running if connection fails."
else
    echo "MongoDB appears to be running."
fi

echo "Starting Redis check..."
if ! pgrep -x "redis-server" > /dev/null; then 
    echo "WARNING: Redis process not found. Ensure it is running via brew services or manually."
else
    echo "Redis appears to be running."
fi

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting Backend (Node.js)..."
cd "$DIR/backend"
npm start &
echo "Backend started (PID $!)"

echo "Starting Node.js Worker..."
cd "$DIR/backend"
npm run worker &
echo "Worker started (PID $!)"

echo "Starting Frontend..."
cd "$DIR/frontend"
npx -y serve -l 8080 &
echo "Frontend started (PID $!)"

echo "---------------------------------------------------"
echo "All services are attempting to start."
echo "Backend API: http://localhost:5001 (configured in .env)"
echo "Frontend UI: http://localhost:8080"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all services."

# Wait for all background processes
wait
