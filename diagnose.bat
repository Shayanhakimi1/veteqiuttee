@echo off
echo Pet Consultation Platform Diagnostics
echo =====================================
echo.

echo 1. Checking Backend Server (Port 3000):
curl -s http://localhost:3000 | echo Backend Response: && type CON
echo.

echo 2. Checking Frontend Server (Port 5173):
curl -s http://localhost:5173 | echo Frontend Response: && type CON
echo.

echo 3. Checking Process List:
tasklist | findstr node
echo.

echo 4. Checking Port Usage:
netstat -an | findstr ":3000\|:5173"
echo.

echo 5. Testing API Health:
curl -s http://localhost:3000/api/health
echo.
echo.

echo If you see responses above, the servers are working!
echo Try opening: http://localhost:5173 in your browser
echo.
pause