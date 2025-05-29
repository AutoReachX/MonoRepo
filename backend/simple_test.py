from fastapi import FastAPI
import uvicorn

app = FastAPI(title="AutoReach Test API")


@app.get("/")
def read_root():
    return {"message": "AutoReach backend is working! 🚀"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running successfully"}


if __name__ == "__main__":
    print("🚀 Starting AutoReach test server...")
    print("📍 Server will be available at: http://localhost:8001")
    print("📖 Test endpoints:")
    print("   - http://localhost:8001/")
    print("   - http://localhost:8001/health")
    print("   - http://localhost:8001/docs (API documentation)")
    print()

    uvicorn.run(app, host="0.0.0.0", port=8001)
