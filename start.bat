@echo off
echo Starting Violence Detection Web App...
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd backend && ..\venv\Scripts\python.exe main.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo Both servers are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ============================================
echo.
pause
