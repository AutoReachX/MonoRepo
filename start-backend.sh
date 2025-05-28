#!/bin/bash

echo "Starting AutoReach Backend..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend not set up yet!"
    echo "Please run ./setup-dev.sh first"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Environment file not found!"
    echo "Please run ./setup-dev.sh first"
    exit 1
fi

cd backend
source venv/bin/activate

echo "✅ Starting FastAPI server at http://localhost:8000"
echo "✅ API docs will be available at http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"
echo

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
