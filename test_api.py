#!/usr/bin/env python3
"""
Simple test script for the DevOps AI Assistant API
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/v1/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat():
    """Test the chat completions endpoint"""
    print("\n🔍 Testing Chat Endpoint...")
    
    payload = {
        "messages": [
            {
                "role": "user", 
                "content": "What is Docker and why is it useful in DevOps?"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30  # 30 second timeout for model response
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat Response:")
            print(json.dumps(result, indent=2))
            return True
        else:
            print(f"❌ Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing DevOps AI Assistant API")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health()
    
    if health_ok:
        # Test chat endpoint
        chat_ok = test_chat()
        
        if chat_ok:
            print("\n🎉 All tests PASSED! Your API is working correctly.")
        else:
            print("\n❌ Chat test FAILED.")
    else:
        print("\n❌ Health test FAILED. Check if the server is running.") 