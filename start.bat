@echo off
echo ==============================================
echo    Starting LocalDev Connect Services...
echo ==============================================

echo Starting Node.js Backend Server (Port 5000)...
start "Backend" cmd /k "cd backend && npm run dev"

echo Starting Python AI Service (Port 8000)...
start "AI Service" cmd /k "cd ai-service && venv\Scripts\python.exe main.py"

echo Starting React Frontend (Port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All LocalDev Connect services have been launched in separate windows!
echo Keep those windows open while developing. You can now visit http://localhost:5173
echo.
pause
