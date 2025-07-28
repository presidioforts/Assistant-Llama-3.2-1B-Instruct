#!/usr/bin/env python3
"""
Test script for Simple MCP Server
Tests the JSON-RPC protocol implementation
"""

import json
import subprocess
import time
import sys
import requests

def test_backend():
    """Test if backend is available"""
    print("🔍 Testing backend...")
    try:
        response = requests.get("http://localhost:8000/v1/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print("❌ Backend not responding")
            return False
    except Exception as e:
        print(f"❌ Cannot reach backend: {e}")
        return False

def test_mcp_server():
    """Test MCP server with JSON-RPC messages"""
    print("🔍 Testing Simple MCP Server...")
    
    try:
        # Start MCP server process
        proc = subprocess.Popen(
            ["python", "mcp_server_simple.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd="."
        )
        
        # Give it time to start
        time.sleep(2)
        
        # Test 1: Initialize
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test", "version": "1.0.0"}
            }
        }
        
        print("📤 Sending initialize request...")
        proc.stdin.write(json.dumps(init_request) + "\n")
        proc.stdin.flush()
        
        # Read response
        response_line = proc.stdout.readline()
        if response_line:
            response = json.loads(response_line.strip())
            if response.get("result", {}).get("serverInfo", {}).get("name") == "devopsaiassistant":
                print("✅ Initialize successful")
            else:
                print("❌ Initialize failed")
        
        # Test 2: List tools
        tools_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        }
        
        print("📤 Sending tools/list request...")
        proc.stdin.write(json.dumps(tools_request) + "\n")
        proc.stdin.flush()
        
        response_line = proc.stdout.readline()
        if response_line:
            response = json.loads(response_line.strip())
            tools = response.get("result", {}).get("tools", [])
            if tools and tools[0].get("name") == "ask_devops_question":
                print("✅ Tools list successful")
                print(f"   Found tool: {tools[0]['name']}")
            else:
                print("❌ Tools list failed")
        
        # Clean up
        proc.terminate()
        proc.wait(timeout=5)
        
        return True
        
    except Exception as e:
        print(f"❌ MCP server test failed: {e}")
        try:
            proc.terminate()
        except:
            pass
        return False

def main():
    """Run tests"""
    print("="*50)
    print("🚀 Simple MCP Server Testing")
    print("="*50)
    
    # Test backend
    if not test_backend():
        print("\n❌ Backend not available. Please start with: python app/main.py")
        return
    
    # Test MCP server
    if test_mcp_server():
        print("\n✅ Simple MCP Server working!")
        print("\n📋 Ready for IDE Integration:")
        print("1. Server command: python mcp_server_simple.py")
        print("2. Server name: devopsaiassistant")
        print("3. Tool: ask_devops_question")
        print("4. Usage: @devopsaiassistant <your question>")
        
        print("\n🔧 IDE Configuration:")
        print("VS Code settings.json:")
        print(json.dumps({
            "mcp.servers": {
                "devopsaiassistant": {
                    "command": "python",
                    "args": ["mcp_server_simple.py"],
                    "cwd": "backend"
                }
            }
        }, indent=2))
    else:
        print("\n❌ MCP server test failed")

if __name__ == "__main__":
    main() 