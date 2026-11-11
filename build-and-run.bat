@echo off
setlocal
set "ROOT=%~dp0"

if not defined JWT_SECRET (
    echo Set JWT_SECRET to a secret of at least 32 characters before running.
    exit /b 1
)

pushd "%ROOT%"
call npm run build
if errorlevel 1 goto frontend_failed

set "STATIC_DIR=%ROOT%Backend\backend\src\main\resources\static"
if not exist "%STATIC_DIR%" mkdir "%STATIC_DIR%"
robocopy "%ROOT%dist" "%STATIC_DIR%" /E
if errorlevel 8 goto copy_failed

pushd "%ROOT%Backend\backend"
call mvnw.cmd clean package
if errorlevel 1 goto maven_failed

java -jar target\backend-0.0.1-SNAPSHOT.jar
set "EXIT_CODE=%ERRORLEVEL%"
popd
popd
exit /b %EXIT_CODE%

:frontend_failed
popd
exit /b 1

:copy_failed
popd
exit /b 1

:maven_failed
popd
popd
exit /b 1
