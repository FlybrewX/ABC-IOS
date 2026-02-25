# Audio Files

This directory must contain 26 MP3 files for the letter sounds:
- a.mp3
- b.mp3
- c.mp3
- ... (d through y)
- z.mp3

Each file should contain the clear pronunciation of the letter (e.g., "Aaa" for A, "Bbb" for B, etc.).

## How to Add Audio Files

1. **Get High-Quality Audio Files**
   - Download or record clear letter pronunciations
   - Recommended: Use text-to-speech services like:
     - Google Text-to-Speech
     - Amazon Polly
     - Apple Voice (Mac built-in)
   
2. **File Format Requirements**
   - Format: MP3
   - Sample Rate: 44.1 kHz or higher
   - Bitrate: 128 kbps or higher
   - Duration: 0.5-2 seconds per file

3. **Quick Setup Using Text-to-Speech (macOS)**
   ```bash
   # For letter A
   say -o a.aiff "Aaa"
   ffmpeg -i a.aiff a.mp3
   ```

4. **Quick Setup Using Online Tools**
   - Visit: https://www.naturalreaders.com/online/
   - Select language and voice
   - Type the letter name (e.g., "Aaa")
   - Download as MP3
   - Save to this directory

5. **File Naming**
   - Must be lowercase: a.mp3, b.mp3, c.mp3, etc.
   - No spaces in filenames

## Testing Audio

After adding files:
1. Go to Settings screen
2. Click "Test Sound (A)" button
3. Should hear the pronunciation
4. If no sound, check:
   - File exists: `assets/sounds/a.mp3`
   - File format: MP3 (not WAV or other)
   - Device volume is on
   - Sound enabled in Settings

## Alternative: Use a Pre-made Package

Consider using a ready-made collection:
- https://github.com/google/material-design-icons has some audio assets
- YouTube video tutorials often have letter pronunciation audio
