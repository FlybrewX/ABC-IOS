# ABC Touch & Move - Quick Start Guide

## 1. Install & Setup (5 minutes)

```bash
# Install dependencies
npm install

# Add audio files (choose one method):
# Option A: macOS (fastest)
cd assets/sounds
for letter in A B C D E F G H I J K L M N O P Q R S T U V W X Y Z; do
  say -o "${letter}.aiff" "$letter"
  ffmpeg -i "${letter}.aiff" "${letter}.mp3"
  rm "${letter}.aiff"
done
cd ../..

# Option B: Online (https://www.naturaltts.com/)
# Download each letter a.mp3 through z.mp3 to assets/sounds/
```

## 2. Run the App

```bash
# Start Expo
npm start

# Press 'i' for iOS simulator
# OR scan QR code with Expo Go app on physical iPhone
```

## 3. Test the Features

✓ **Home Screen**: Tap "Play A–Z"
✓ **Play Screen**: Tap letter to hear sound, drag it around
✓ **Double Tap**: Letter scales up (pop animation)
✓ **Navigation**: Use arrow buttons to go next/prev letter
✓ **Settings**: Adjust sound, auto-advance, letter size
✓ **End**: Reach "Z" to see celebration message

## File Structure Overview

```
ABC IOS/
├── App.tsx                          # Entry point with navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Home with Play/Settings buttons
│   │   ├── PlayScreen.tsx          # Main draggable letter screen
│   │   └── SettingsScreen.tsx      # Settings (sound, size, etc)
│   ├── components/
│   │   ├── DraggableLetter.tsx    # Gesture + reanimated drag
│   │   └── PrimaryButton.tsx      # Reusable button component
│   ├── audio/
│   │   └── audio.ts               # Sound loading/playback
│   ├── storage/
│   │   └── settings.ts            # AsyncStorage settings
│   └── theme/
│       ├── colors.ts              # Color palette
│       ├── spacing.ts             # Spacing constants
│       └── typography.ts          # Text styles
└── assets/sounds/                 # 26 MP3 files (a.mp3-z.mp3)
```

## Key Technologies Used

- **Expo 51**: Framework & bundler
- **React Native**: UI
- **TypeScript**: Type safety
- **react-native-gesture-handler**: Touch gestures
- **react-native-reanimated**: Smooth animations
- **expo-av**: Audio playback
- **@react-navigation**: Screen navigation
- **AsyncStorage**: Settings persistence

## Common Tasks

### Add Custom Colors
Edit `src/theme/colors.ts`

### Change Letter Size Range
Edit `PlayScreen.tsx` letterSize state, or adjust slider in `SettingsScreen.tsx`

### Add New Feature
1. Create new component in `src/components/`
2. Create new screen in `src/screens/` if needed
3. Add navigation to `App.tsx`

### Customize UI
- Text styles: `src/theme/typography.ts`
- Spacing: `src/theme/spacing.ts`
- Colors: `src/theme/colors.ts`

## iOS Testing Checklist

- [ ] App launches without errors
- [ ] All 26 letters display correctly
- [ ] Audio plays for each letter
- [ ] Dragging feels smooth (not laggy)
- [ ] Settings save and persist
- [ ] Back buttons work
- [ ] No console errors

## Build for App Store

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

## Troubleshooting

**No sound?**
- Check `assets/sounds/a.mp3` exists
- Toggle Sound ON in Settings

**App crashes?**
- Verify all 26 audio files exist
- Check filenames are lowercase (a.mp3, not A.mp3)
- Run `npm start --clear`

**Gestures not working?**
- Restart the app
- Check GestureHandlerRootView is in App.tsx
- Test on physical device

**Settings not saving?**
- Clear app cache
- Check AsyncStorage package installed
- Look at console for errors

## Full Documentation

See `SETUP_INSTRUCTIONS.md` for:
- Detailed audio file setup
- iOS simulator setup
- EAS build & deployment
- Full troubleshooting guide
- Project structure details
