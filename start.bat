@echo off
echo Starting Schedulo (Calendly Clone)...

echo Starting Backend on port 8000...
start cmd /k "cd backend && set PGPASSWORD=1234&& python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Backend:   http://localhost:8000
echo Frontend:  http://localhost:5173
echo.
