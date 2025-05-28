#!/usr/bin/env python3

import sys
import subprocess
import os

def check_python():
    print("🐍 Checking Python...")
    print(f"Python version: {sys.version}")
    return True

def check_pip():
    print("📦 Checking pip...")
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "--version"], 
                              capture_output=True, text=True)
        print(f"Pip version: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Pip check failed: {e}")
        return False

def install_basic_deps():
    print("📥 Installing basic dependencies...")
    deps = ["fastapi", "uvicorn[standard]", "python-dotenv"]
    
    for dep in deps:
        print(f"Installing {dep}...")
        try:
            result = subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {dep} installed successfully")
            else:
                print(f"❌ Failed to install {dep}: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Error installing {dep}: {e}")
            return False
    
    return True

def test_imports():
    print("🧪 Testing imports...")
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
        
        import uvicorn
        print("✅ Uvicorn imported successfully")
        
        import dotenv
        print("✅ python-dotenv imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def main():
    print("========================================")
    print("   AutoReach Setup Test")
    print("========================================")
    print()
    
    if not check_python():
        return False
    
    if not check_pip():
        return False
    
    if not install_basic_deps():
        return False
    
    if not test_imports():
        return False
    
    print()
    print("🎉 Basic setup test completed successfully!")
    print("You can now try starting the backend server.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
