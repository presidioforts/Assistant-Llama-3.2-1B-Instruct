#!/usr/bin/env python3
"""
Test script for DevOps AI Assistant API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/v1/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check PASSED")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check FAILED: {e}")
        return False

def test_chat_endpoint():
    """Test the chat completions endpoint"""
    print("\n🔍 Testing Chat Endpoint...")
    try:
        payload = {
            "model": "llama-3.2-1b-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": "What is Docker?"
                }
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        print("   Sending request...")
        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat completions PASSED")
            print(f"   Response: {result}")
            return True
        else:
            print(f"❌ Chat completions failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat test FAILED: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting API Tests...")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    if not health_ok:
        print("\n❌ Health check failed. Make sure the backend is running.")
        return
    
    # Test chat endpoint
    chat_ok = test_chat_endpoint()
    
    print("\n" + "=" * 50)
    if health_ok and chat_ok:
        print("🎉 All tests PASSED! The API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs.")

if __name__ == "__main__":
    main() 