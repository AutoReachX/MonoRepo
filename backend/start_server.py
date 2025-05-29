#!/usr/bin/env python3
"""
Start the AutoReach FastAPI server
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn

    print("Starting AutoReach API server...")
    print(f"Working directory: {os.getcwd()}")

    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["."]
    )
