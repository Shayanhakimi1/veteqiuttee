@echo off
echo Checking Pet Consultation Platform Status...
echo.

echo Checking if backend is running on port 3000...
netstat -an | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ✓ Backend server is running on port 3000
) else (
    echo ✗ Backend server is not running on port 3000
)

echo.
echo Checking if frontend is running on port 5173...
netstat -an | findstr :5173 > nul
if %errorlevel% == 0 (
    echo ✓ Frontend server is running on port 5173
) else (
    echo ✗ Frontend server is not running on port 5173
)

echo.
echo Checking database file...
if exist "backend\prisma\dev.db" (
    echo ✓ Database file exists
) else (
    echo ✗ Database file not found
)

echo.
echo Checking upload directory...
if exist "backend\uploads" (
    echo ✓ Upload directory exists
) else (
    echo ✗ Upload directory not found
)

echo.
echo Application URLs:
echo - Frontend: http://localhost:5173
echo - Admin Panel: http://localhost:5173/admin/login
echo - Backend API: http://localhost:3000/api
echo.
pause