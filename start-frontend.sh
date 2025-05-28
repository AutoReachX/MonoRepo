#!/bin/bash

echo "Starting AutoReach Frontend..."

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend not set up yet!"
    echo "Please run ./setup-dev.sh first"
    exit 1
fi

cd frontend

echo "✅ Starting React development server at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo

npm start
