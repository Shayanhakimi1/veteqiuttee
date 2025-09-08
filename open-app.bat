@echo off
echo Opening Pet Consultation Platform...
echo.
echo Backend API Status:
curl -s http://localhost:3000/api/health
echo.
echo.
echo Opening application in your default browser...
start http://localhost:5173
echo.
echo If the browser doesn't open automatically, go to:
echo http://localhost:5173
echo.
echo Admin Panel: http://localhost:5173/admin/login
echo Admin Credentials: 09302467932 / 12345678
echo.
pause