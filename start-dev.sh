#!/bin/bash
# Quantum Enterprise Platform — One-command dev startup
# Usage: ./start-dev.sh

set -e

echo ""
echo "⚛️  Quantum Enterprise Platform — Starting Dev Environment"
echo "==========================================================="
echo ""

# Check Python 3.11
if command -v python3.11 &>/dev/null; then
    PYTHON=python3.11
elif command -v python3 &>/dev/null && python3 --version 2>&1 | grep -q "3.11"; then
    PYTHON=python3
else
    echo "⚠️  Python 3.11 not found. Install it from https://python.org/downloads"
    echo "   Attempting with default python3..."
    PYTHON=python3
fi

echo "✅ Python: $($PYTHON --version)"

# Check Node
if ! command -v node &>/dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "✅ Node: $(node --version)"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    $PYTHON -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   Created backend/.env from template"
fi

# Start backend in background
echo "🚀 Starting backend on http://localhost:8000 ..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install --legacy-peer-deps --silent
fi

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "   Created frontend/.env.local from template"
fi

echo ""
echo "==========================================================="
echo "✅ Backend:  http://localhost:8000"
echo "✅ API Docs: http://localhost:8000/api/docs"
echo "🚀 Frontend: http://localhost:3000 (starting...)"
echo ""
echo "📧 Dev OTP: Check backend terminal output for login codes"
echo "==========================================================="
echo ""

# Start frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
