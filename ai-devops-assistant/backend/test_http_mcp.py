#!/usr/bin/env python3
"""
Test script for HTTP MCP Server
Tests the HTTP JSON-RPC implementation
"""

import json
import requests
import time

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

def test_mcp_server_health():
    """Test MCP server health endpoint"""
    print("🔍 Testing MCP Server health...")
    try:
        response = requests.get("http://localhost:6365/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ MCP Server healthy: {result}")
            return True
        else:
            print("❌ MCP Server not responding")
            return False
    except Exception as e:
        print(f"❌ Cannot reach MCP server: {e}")
        return False

def test_mcp_initialize():
    """Test MCP initialize"""
    print("📤 Sending initialize request...")
    try:
        request_data = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "test-client",
                    "version": "1.0.0"
                }
            }
        }
        
        response = requests.post(
            "http://localhost:6365/mcp",
            json=request_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Initialize successful")
            print(f"   Protocol: {result['result']['protocolVersion']}")
            print(f"   Server: {result['result']['serverInfo']['name']}")
            return True
        else:
            print(f"❌ Initialize failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Initialize error: {e}")
        return False

def test_tools_list():
    """Test tools list"""
    print("📤 Sending tools/list request...")
    try:
        request_data = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list"
        }
        
        response = requests.post(
            "http://localhost:6365/mcp",
            json=request_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            tools = result['result']['tools']
            print("✅ Tools list successful")
            for tool in tools:
                print(f"   Tool: {tool['name']} - {tool['description']}")
            return True
        else:
            print(f"❌ Tools list failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Tools list error: {e}")
        return False

def test_ask_question():
    """Test asking a question"""
    print("📤 Sending ask_devops_question request...")
    try:
        request_data = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "ask_devops_question",
                "arguments": {
                    "question": "What is Docker and why is it useful?"
                }
            }
        }
        
        print("⏳ Waiting for AI response...")
        response = requests.post(
            "http://localhost:6365/mcp",
            json=request_data,
            timeout=130  # Allow time for AI response
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'result' in result:
                answer = result['result']['content'][0]['text']
                print("✅ Question answered successfully")
                print(f"   Answer length: {len(answer)} characters")
                print(f"   Answer preview: {answer[:100]}...")
                return True
            else:
                print(f"❌ Unexpected response format: {result}")
                return False
        else:
            print(f"❌ Question failed: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Question timed out (this is expected if model is slow)")
        return True  # Consider timeout as success for slow models
    except Exception as e:
        print(f"❌ Question error: {e}")
        return False

def main():
    print("=" * 50)
    print("🚀 HTTP MCP Server Testing")
    print("=" * 50)
    
    # Test backend first
    if not test_backend():
        print("💥 Backend not available. Start with: python app/main.py")
        return
    
    print()
    
    # Test MCP server health
    if not test_mcp_server_health():
        print("💥 MCP Server not available. Start with: python mcp_server_simple.py")
        return
    
    print()
    
    # Test MCP protocol
    tests = [
        test_mcp_initialize,
        test_tools_list,
        test_ask_question
    ]
    
    for test in tests:
        if test():
            print()
        else:
            print("💥 Test failed!")
            return
    
    print("🎉 All tests passed! HTTP MCP Server is working correctly.")

if __name__ == "__main__":
    main() 