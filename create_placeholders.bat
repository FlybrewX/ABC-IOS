@echo off
cd /d "%~dp0assets\sounds"

for %%L in (A B C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if not exist "%%L.mp3" (
        echo ID3 > %%L.mp3
        echo [Created placeholder for %%L.mp3]
    )
)

cd /d "%~dp0"
echo All placeholder audio files created!
pause
