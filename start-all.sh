#!/bin/bash

echo "🚀 Starting Crypto Token Analyzer..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "python3 server.py" 2>/dev/null
pkill -f "node server.js" 2>/dev/null

# Start backend server
echo "🔧 Starting backend server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server..."
python3 server.py &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📱 Frontend: http://localhost:8000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "python3 server.py" 2>/dev/null
    pkill -f "node server.js" 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
