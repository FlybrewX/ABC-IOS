#!/bin/bash

# ABC Touch & Move - Installation Script
# Run this script to set up the entire project

set -e

echo "=========================================="
echo "ABC Touch & Move - Installation"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Instructions for audio files
echo "=========================================="
echo "📝 Next Step: Add Audio Files"
echo "=========================================="
echo ""
echo "The app requires 26 MP3 files (a.mp3 through z.mp3)"
echo "in the 'assets/sounds/' directory."
echo ""
echo "Choose one of these methods:"
echo ""
echo "1️⃣  macOS Text-to-Speech (FASTEST):"
echo "   cd assets/sounds"
echo "   for letter in A B C D E F G H I J K L M N O P Q R S T U V W X Y Z; do"
echo "     say -o \"\${letter}.aiff\" \"\$letter\""
echo "     ffmpeg -i \"\${letter}.aiff\" \"\${letter}.mp3\""
echo "     rm \"\${letter}.aiff\""
echo "   done"
echo "   cd ../.."
echo ""
echo "2️⃣  Online TTS Service (ANY PLATFORM):"
echo "   - Visit https://www.naturaltts.com/"
echo "   - For each letter A-Z:"
echo "     - Type the letter"
echo "     - Select 'American English' voice"
echo "     - Download as MP3"
echo "     - Save to assets/sounds/[letter].mp3"
echo ""
echo "3️⃣  Python Google TTS (ALL PLATFORMS):"
echo "   pip install google-tts"
echo "   python3 << 'EOF'"
echo "   from gtts import gTTS"
echo "   import string"
echo "   for letter in string.ascii_uppercase:"
echo "       tts = gTTS(text=letter, lang='en', slow=False)"
echo "       tts.save(f'assets/sounds/{letter.lower()}.mp3')"
echo "   EOF"
echo ""
echo "=========================================="
echo "🚀 Start Development Server"
echo "=========================================="
echo ""
echo "After adding audio files, run:"
echo ""
echo "  npm start"
echo ""
echo "Then press:"
echo "  'i' for iOS simulator"
echo "  or scan QR code with Expo Go app"
echo ""
echo "=========================================="
