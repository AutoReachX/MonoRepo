#!/bin/bash

echo "========================================"
echo "   AutoReach Local Development Setup"
echo "========================================"
echo

echo "Step 1: Checking prerequisites..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python not found! Please install Python 3.9+ from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo "✅ Python found: $($PYTHON_CMD --version)"
echo "✅ Node.js found: $(node --version)"
echo

echo "Step 2: Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "✅ .env file already exists"
fi
echo

echo "Step 3: Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed successfully"
cd ..
echo

echo "Step 4: Setting up React frontend..."
cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed successfully"
cd ..
echo

echo "========================================"
echo "   Setup Complete! 🎉"
echo "========================================"
echo
echo "Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - Get Twitter OAuth credentials from developer.twitter.com"
echo "   - Get OpenAI API key from platform.openai.com"
echo "   - Set up Render PostgreSQL database"
echo
echo "2. Start the development servers:"
echo "   Backend:  ./start-backend.sh"
echo "   Frontend: ./start-frontend.sh"
echo
echo "3. Visit http://localhost:3000 to see your app!"
echo
