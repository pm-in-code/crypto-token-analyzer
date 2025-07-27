#!/usr/bin/env python3
"""
Simple HTTP server for the Crypto Token Analyzer app
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the project directory
    os.chdir(Path(__file__).parent)
    
    # Create server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Crypto Token Analyzer server starting...")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📱 Open your browser and navigate to: http://localhost:{PORT}/public/")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Try to open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}/public/')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 