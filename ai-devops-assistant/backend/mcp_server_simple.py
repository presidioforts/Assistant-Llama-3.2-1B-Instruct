#!/usr/bin/env python3
"""
Simple MCP Server for DevOps AI Assistant (HTTP Mode)
Uses HTTP JSON-RPC to implement MCP protocol without framing issues
"""

import json
import logging
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Backend API URL
BACKEND_URL = "http://localhost:8000"
# MCP Server HTTP Port
MCP_PORT = 6365

app = Flask(__name__)
CORS(app)

class SimpleMCPServer:
    def __init__(self):
        self.capabilities = {
            "tools": {},
            "resources": {}
        }
    
    def handle_initialize(self, request_data):
        """Handle MCP initialize request"""
        return {
            "jsonrpc": "2.0",
            "id": request_data["id"],
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {}
                },
                "serverInfo": {
                    "name": "DevOps AI Assistant",
                    "version": "1.0.0"
                }
            }
        }
    
    def handle_tools_list(self, request_data):
        """Handle tools/list request"""
        tools = [{
            "name": "ask_devops_question",
            "description": "Ask questions to the DevOps AI Assistant about infrastructure, deployment, monitoring, and best practices",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "Your DevOps question"
                    }
                },
                "required": ["question"]
            }
        }]
        
        return {
            "jsonrpc": "2.0",
            "id": request_data["id"],
            "result": {
                "tools": tools
            }
        }
    
    def handle_tools_call(self, request_data):
        """Handle tools/call request"""
        tool_name = request_data["params"]["name"]
        
        if tool_name != "ask_devops_question":
            return {
                "jsonrpc": "2.0",
                "id": request_data["id"],
                "error": {
                    "code": -32601,
                    "message": f"Unknown tool: {tool_name}"
                }
            }
        
        # Extract question from arguments
        question = request_data["params"]["arguments"]["question"]
        logger.info(f"🤖 Processing question: {question[:100]}...")
        
        try:
            # Call backend AI model
            chat_request = {
                "model": "llama",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a DevOps AI Assistant. Help with infrastructure, deployment, monitoring, security, and DevOps best practices."
                    },
                    {
                        "role": "user", 
                        "content": question
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            logger.info(f"📡 Sending request to backend...")
            response = requests.post(
                f"{BACKEND_URL}/v1/chat/completions",
                json=chat_request,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result["choices"][0]["message"]["content"]
                logger.info(f"✅ Response received: {len(answer)} characters")
                
                return {
                    "jsonrpc": "2.0",
                    "id": request_data["id"],
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": answer
                            }
                        ]
                    }
                }
            else:
                error_msg = f"Backend error: {response.status_code}"
                logger.error(f"❌ {error_msg}")
                return {
                    "jsonrpc": "2.0",
                    "id": request_data["id"],
                    "result": {
                        "content": [
                            {
                                "type": "text", 
                                "text": f"Error: {error_msg}"
                            }
                        ]
                    }
                }
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 2 minutes. The AI model may be processing a complex query."
            logger.error(f"⏰ {error_msg}")
            return {
                "jsonrpc": "2.0",
                "id": request_data["id"],
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": f"⏰ {error_msg}"
                        }
                    ]
                }
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"💥 {error_msg}")
            return {
                "jsonrpc": "2.0",
                "id": request_data["id"],
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": f"💥 {error_msg}"
                        }
                    ]
                }
            }

# Create MCP server instance
mcp_server = SimpleMCPServer()

@app.route('/mcp', methods=['POST'])
def handle_mcp_request():
    """Handle MCP JSON-RPC requests via HTTP"""
    try:
        request_data = request.get_json()
        method = request_data.get("method")
        
        logger.info(f"📥 Received {method} request")
        
        if method == "initialize":
            response = mcp_server.handle_initialize(request_data)
        elif method == "tools/list":
            response = mcp_server.handle_tools_list(request_data)
        elif method == "tools/call":
            response = mcp_server.handle_tools_call(request_data)
        else:
            response = {
                "jsonrpc": "2.0",
                "id": request_data.get("id"),
                "error": {
                    "code": -32601,
                    "message": f"Unknown method: {method}"
                }
            }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Error handling request: {e}")
        return jsonify({
            "jsonrpc": "2.0",
            "id": request_data.get("id") if 'request_data' in locals() else None,
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "mode": "http", "port": MCP_PORT})

def check_backend():
    """Check if backend is available"""
    try:
        response = requests.get(f"{BACKEND_URL}/v1/health", timeout=5)
        if response.status_code == 200:
            logger.info("✅ Backend connection successful")
            return True
        else:
            logger.error(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Cannot reach backend: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting Simple MCP Server for DevOps AI Assistant (HTTP Mode)")
    logger.info(f"📡 Connecting to backend at {BACKEND_URL}")
    
    # Check backend availability
    check_backend()
    
    logger.info(f"🌐 Starting HTTP server on port {MCP_PORT}")
    logger.info(f"🔌 MCP Server ready at http://localhost:{MCP_PORT}/mcp")
    
    app.run(host='0.0.0.0', port=MCP_PORT, debug=False) 