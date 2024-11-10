#!/bin/bash

# Get current working directory
cwd=$(pwd)

# Function to kill background processes on script exit
cleanup() {
    echo "Stopping background processes..."
    kill $flask_pid $npm_pid
    cd $cwd
}
trap cleanup EXIT

# Start the Flask server in the background and get its process ID
cd backend
flask run --port=50000 --host=0.0.0.0 &
flask_pid=$!

# Start the npm server in the background and get its process ID
cd ../frontend
npm start &
npm_pid=$!

# Wait for both processes to complete (in case they stop naturally)
wait $flask_pid
wait $npm_pid