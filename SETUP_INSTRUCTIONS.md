# ABC Touch & Move - Setup Instructions

## Prerequisites

- **Node.js**: v18+ (download from https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **Expo CLI**: Will be installed via npm
- **iOS Development**:
  - macOS with Xcode (for iOS simulator)
  - Or an iPhone with Expo Go app

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native & Expo
- TypeScript
- react-native-gesture-handler
- react-native-reanimated
- Navigation libraries
- AsyncStorage
- Vector Icons

### 2. Add Audio Files

The app requires 26 MP3 files (a.mp3 through z.mp3) in the `assets/sounds/` directory.

**Option A: Create Using Text-to-Speech (Recommended)**

If you have a Mac:
```bash
# Navigate to the sounds directory
cd assets/sounds

# Create audio files using macOS say command
for letter in A B C D E F G H I J K L M N O P Q R S T U V W X Y Z; do
  say -o "${letter}.aiff" "$letter"
  ffmpeg -i "${letter}.aiff" "${letter}.mp3"
  rm "${letter}.aiff"
done
```

**Option B: Download Pre-made Audio Files**

1. Visit: https://www.naturaltts.com/ or similar online TTS service
2. For each letter A-Z:
   - Type the letter (e.g., "A" or "Aaa")
   - Select a clear voice (preferably American English)
   - Download as MP3
   - Save to `assets/sounds/a.mp3`, `assets/sounds/b.mp3`, etc.

**Option C: Use Google Text-to-Speech**

1. Use Python with Google TTS:
```bash
pip install google-tts
python3 << 'EOF'
from gtts import gTTS
import string

for letter in string.ascii_uppercase:
    tts = gTTS(text=letter, lang='en', slow=False)
    tts.save(f'assets/sounds/{letter.lower()}.mp3')
    print(f'Created {letter.lower()}.mp3')
EOF
```

**Verify Audio Files**
```bash
ls assets/sounds/
# Should show: a.mp3 b.mp3 c.mp3 ... z.mp3
```

### 3. Build Configuration

The app is already configured in `app.json` and `babel.config.js`. No additional configuration needed.

### 4. Start the App

```bash
npm start
```

This will start the Expo development server.

## Running on iOS

### Option A: iOS Simulator (macOS only)

```bash
npm run ios
```

This will:
1. Build the app for iOS
2. Open the iOS simulator automatically
3. Load the app

### Option B: Physical iPhone

1. **Download Expo Go**
   - Open App Store on your iPhone
   - Search for "Expo Go"
   - Install the official Expo app

2. **Connect Your Phone**
   - Make sure your Mac and iPhone are on the same WiFi
   - Or connect via USB with cable

3. **Run the App**
   ```bash
   npm start
   ```
   
4. **Load on Phone**
   - Option 1: Scan QR code shown in terminal with iPhone camera
   - Option 2: In Expo Go app, tap "Scan QR Code" and scan the code
   - Option 3: Press 'i' in terminal to open iOS build

### Option C: EAS Build (Production)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

Then install the resulting .ipa file on your device.

## Project Structure

```
ABC IOS/
├── App.tsx                 # Main app entry
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
├── assets/
│   └── sounds/           # Letter audio files (26 MP3 files)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── PlayScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── DraggableLetter.tsx
│   │   └── PrimaryButton.tsx
│   ├── audio/
│   │   └── audio.ts      # Audio playback utilities
│   ├── storage/
│   │   └── settings.ts   # AsyncStorage settings
│   ├── data/
│   │   └── letters.ts    # Alphabet data
│   └── theme/
│       ├── colors.ts
│       ├── spacing.ts
│       └── typography.ts
```

## iOS Test Checklist

After running the app, verify the following features:

### Home Screen
- [ ] Title "ABC Touch & Move" displays centered
- [ ] "Play A–Z" button is large and tappable
- [ ] "Settings" button is visible
- [ ] Background has gradient colors
- [ ] Tips section shows at bottom

### Play Screen
- [ ] Letter "A" displays in center (large, white card)
- [ ] Top bar shows "1 / 26"
- [ ] Back button returns to Home
- [ ] Left arrow button is disabled on first letter
- [ ] Right arrow button advances to next letter
- [ ] Tapping letter "A" plays sound (if enabled)
- [ ] Double-tapping letter scales up and back
- [ ] Can drag letter around screen smoothly
- [ ] Letter returns to center when released
- [ ] "Next" button shows "Z 26/26" at end
- [ ] Confetti message "Great Job! 🎉" shows when reaching Z

### Settings Screen
- [ ] All toggle switches visible and functional
- [ ] Sound toggle ON shows "✓"
- [ ] Test Sound button plays letter A
- [ ] Letter size slider works (changes preview)
- [ ] Small to Large range: 80px to 220px
- [ ] Settings persist after app restart
- [ ] Back button returns to Home

### Audio Tests
- [ ] First launch: Should hear "A" sound
- [ ] Settings toggle off: No sound plays
- [ ] Settings toggle on: Sound plays again
- [ ] Test button in Settings: Plays "A" sound
- [ ] Different letters: Each has correct pronunciation

### Gesture Tests
- [ ] Single tap: Plays sound
- [ ] Drag: Moves letter smoothly
- [ ] Double tap: Scales animation
- [ ] Release drag: Letter returns to center
- [ ] Boundaries: Letter doesn't go off screen

### Navigation Tests
- [ ] Home → Play (works)
- [ ] Play ← Home (works)
- [ ] Home → Settings (works)
- [ ] Settings ← Home (works)
- [ ] All animations smooth

## Troubleshooting

### No Sound Playing
1. Check iPhone volume is on (not muted)
2. Verify audio files exist: `ls assets/sounds/a.mp3`
3. Toggle Sound ON in Settings
4. Try Test Sound button
5. Check device speaker is working

### App Crashes on Letter Load
1. Verify all 26 audio files exist
2. Check file names are lowercase: a.mp3, b.mp3, etc.
3. Ensure files are MP3 format (not WAV or other)
4. Try `npm start --clear` to clear cache

### Gestures Not Working
1. Make sure you're on actual iOS device or latest simulator
2. Verify react-native-gesture-handler is installed
3. Check App.tsx has GestureHandlerRootView wrapper
4. Restart the app and Expo

### Settings Not Persisting
1. Check AsyncStorage is installed: `npm ls @react-native-async-storage/async-storage`
2. Clear app data and restart
3. Check device has storage available

### Slow Performance
1. Reduce letter size in Settings
2. Clear Expo cache: `npm start --clear`
3. Restart iOS simulator
4. Use physical device instead of simulator

### TypeScript Errors
1. Run `npm run tsc` to check types
2. Make sure tsconfig.json extends expo/tsconfig
3. Restart TypeScript server in editor

## Development Commands

```bash
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run on web (limited features)
npm run eject         # Eject from Expo (advanced)
```

## Build for App Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for iOS App Store
eas build --platform ios --auto-submit

# Or build locally
eas build --platform ios --local
```

## Environment Notes

- **iOS Only**: Some features like GestureHandler may behave differently on web
- **Device Testing**: Testing on a real iPhone is recommended
- **Audio Files**: Bundled with app, so no internet needed (fully offline)
- **Data Persistence**: Settings saved locally via AsyncStorage

## Support Resources

- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/
- Reanimated: https://docs.swmansion.com/react-native-reanimated/
- Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/

## Next Steps

1. Install dependencies: `npm install`
2. Add audio files to `assets/sounds/`
3. Start dev server: `npm start`
4. Run on device: Press `i` for iOS
5. Go through test checklist
6. Make any customizations needed
7. Build for App Store when ready
