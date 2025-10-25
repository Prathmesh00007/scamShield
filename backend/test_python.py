#!/usr/bin/env python3

"""
Simple test script to verify Python environment and dependencies
"""

import sys
import json
from datetime import datetime

def main():
    print("🐍 Python test script started", file=sys.stderr)
    print(f"🐍 Python version: {sys.version}", file=sys.stderr)
    
    try:
        # Test basic functionality
        result = {
            "success": True,
            "message": "Python environment is working",
            "python_version": sys.version,
            "timestamp": datetime.utcnow().isoformat(),
            "test_data": {
                "incidents_processed": 2,
                "categories_detected": ["financial", "employment"],
                "confidence_scores": [0.85, 0.92]
            }
        }
        
        print("🐍 Test completed successfully", file=sys.stderr)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Python test failed: {str(e)}",
            "python_version": sys.version
        }
        print("🐍 Test failed:", str(e), file=sys.stderr)
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
