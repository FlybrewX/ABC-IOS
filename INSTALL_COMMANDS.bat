@echo off
REM ABC Touch & Move - Installation Script for Windows

echo.
echo ==========================================
echo ABC Touch and Move - Installation
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo [OK] Node.js found
for /f "tokens=*" %%i in ('node -v') do echo %%i
for /f "tokens=*" %%i in ('npm -v') do echo npm %%i
echo.

REM Install dependencies
echo [WAIT] Installing dependencies...
npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Installation failed. Check error messages above.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Instructions for audio files
echo ==========================================
echo Next Step: Add Audio Files
echo ==========================================
echo.
echo The app requires 26 MP3 files (a.mp3 through z.mp3)
echo in the 'assets\sounds\' directory.
echo.
echo Choose one of these methods:
echo.
echo 1. Online TTS Service (RECOMMENDED):
echo    - Visit https://www.naturaltts.com/
echo    - For each letter A-Z:
echo      * Type the letter
echo      * Select 'American English' voice
echo      * Download as MP3
echo      * Save to assets\sounds\[letter].mp3
echo.
echo 2. Python Google TTS (All platforms):
echo    pip install google-tts
echo    Then run:
echo    python generate_audio.py
echo    (See SETUP_INSTRUCTIONS.md for script)
echo.
echo 3. Use existing audio files from another source
echo.
echo ==========================================
echo Run the Development Server
echo ==========================================
echo.
echo After adding audio files, run:
echo.
echo   npm start
echo.
echo Then press:
echo   i for iOS simulator
echo   OR scan QR code with Expo Go app on iPhone
echo.
echo ==========================================
echo.
pause
