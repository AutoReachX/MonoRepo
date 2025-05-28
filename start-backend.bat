@echo off
echo Starting AutoReach Backend...
cd backend
call venv\Scripts\activate
uvicorn app.main:app --reload
