#!/bin/bash

echo "🚀 Starting Crypto Token Analyzer..."
echo "📁 Project directory: $(pwd)"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found, starting server..."
    python3 server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found, starting server..."
    python server.py
else
    echo "❌ Python not found. Please install Python 3 to run this app."
    echo ""
    echo "Alternative: Open public/index.html directly in your browser"
    exit 1
fi 