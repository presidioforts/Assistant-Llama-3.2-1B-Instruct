"""
API endpoint definitions and utilities
This module can be extended for additional endpoints and API utilities
"""

from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

# Blueprint for API routes (can be used for modular organization)
api_bp = Blueprint('api', __name__)

class APIResponse:
    """Utility class for standardized API responses"""
    
    @staticmethod
    def success(data, message="Success"):
        return jsonify({
            "status": "success",
            "message": message,
            "data": data
        })
    
    @staticmethod
    def error(message, status_code=400):
        return jsonify({
            "status": "error",
            "message": message
        }), status_code
    
    @staticmethod
    def health_response(healthy=True):
        if healthy:
            return jsonify({"status": "healthy"})
        else:
            return jsonify({"status": "unhealthy"}), 503

# Additional endpoint utilities can be added here 