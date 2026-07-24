@echo off
REM AWS EC2 Deployment Script for SwissGarden Perfumes (Windows)
REM Run this script with: deploy-to-aws.bat C:\path\to\swiss.pem

if "%~1"=="" (
    echo Usage: deploy-to-aws.bat C:\path\to\swiss.pem
    exit /b 1
)

set SSH_KEY=%~1
set EC2_USER=ubuntu
set EC2_HOST=65.1.3.113

echo 🚀 Starting deployment to AWS EC2...

ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd swissgardenperfumes && git pull origin main && cd server && npm install && cd ../client && npm install && npm run build && pm2 restart all && pm2 status"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deployment to AWS EC2 completed successfully!
    echo 🌐 Your site should be live at: https://swissgardenperfumes.com
) else (
    echo.
    echo ❌ Deployment failed. Please check the error messages above.
)
