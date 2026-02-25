# 🎨 ABC Touch & Move

An interactive, kid-friendly React Native app that teaches the alphabet through touch, drag, and sound.

**Features:**
- 📝 Big, colorful A–Z letters
- 🔊 Tap to hear letter pronunciation  
- 👆 Drag letters around the screen
- ✨ Double-tap for pop animations
- ⚙️ Adjustable settings (sound, size, auto-advance)
- 💾 Saves preferences locally
- 📱 Works on iOS (iPad & iPhone)
- 🌐 Fully offline - no internet needed
- 🎯 Kid-safe UI (no ads, no login, no tracking)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Audio Files
Add 26 MP3 files (a.mp3 through z.mp3) to `assets/sounds/`:

**Option A: macOS (Fastest)**
```bash
cd assets/sounds
for letter in A B C D E F G H I J K L M N O P Q R S T U V W X Y Z; do
  say -o "${letter}.aiff" "$letter"
  ffmpeg -i "${letter}.aiff" "${letter}.mp3"
  rm "${letter}.aiff"
done
```

**Option B: Online**
Visit https://www.naturaltts.com/ and download each letter A–Z as MP3

**Option C: Python**
```bash
pip install google-tts
python3 << 'EOF'
from gtts import gTTS
import string
for letter in string.ascii_uppercase:
    gTTS(text=letter, lang='en').save(f'assets/sounds/{letter.lower()}.mp3')
EOF
```

### 3. Run the App
```bash
npm start
```

- Press **`i`** for iOS simulator, OR
- Scan the QR code with **Expo Go** app on your iPhone

## 📁 Project Structure

```
src/
├── screens/           # App screens
│   ├── HomeScreen.tsx
│   ├── PlayScreen.tsx
│   └── SettingsScreen.tsx
├── components/        # Reusable UI components
│   ├── DraggableLetter.tsx
│   └── PrimaryButton.tsx
├── audio/            # Sound utilities
├── storage/          # Settings storage
├── data/             # App data (alphabet)
└── theme/            # Colors, spacing, typography
```

## 📖 Documentation

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Detailed setup & troubleshooting
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Architecture & technical details

## 🛠 Technology Stack

- **Framework**: Expo 51 + React Native
- **Language**: TypeScript
- **Gestures**: react-native-gesture-handler
- **Animations**: react-native-reanimated
- **Audio**: expo-av
- **Navigation**: @react-navigation/native-stack
- **Storage**: @react-native-async-storage/async-storage
- **Styling**: react-native-linear-gradient + custom theme

## ✨ Features in Detail

### Home Screen
- Welcome title and instructions
- "Play A–Z" button
- "Settings" button
- Soft gradient background

### Play Screen
- Large, draggable letter in center
- Tap to hear letter sound
- Drag to move around
- Double-tap for pop animation
- Navigation arrows (prev/next letter)
- Counter showing current position (1/26)
- Celebration when reaching Z

### Settings Screen
- 🔊 Sound toggle
- ⏯️ Auto-advance option
- 📏 Adjustable letter size (80–220px)
- 💾 Auto-save settings

## 🎮 How to Play

1. **Tap** the letter to hear its sound
2. **Drag** the letter around the screen
3. **Double-tap** for a fun pop effect
4. Use **arrow buttons** to go to next/previous letter
5. Reach **"Z"** to see a celebration message!

## 🧪 Testing

### Functionality Checklist
- [ ] App launches without errors
- [ ] All 26 letters display
- [ ] Audio plays for each letter
- [ ] Dragging feels smooth
- [ ] Settings persist after restart
- [ ] Navigation works

### Run Tests
```bash
# Type check
npx tsc --noEmit

# Lint (if configured)
npm run lint
```

## 📱 iOS Deployment

### For Testing
```bash
npm start
# Press 'i' for simulator
```

### For App Store
```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

Then submit to App Store Connect.

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| **No sound** | Check `assets/sounds/a.mp3` exists; Toggle Sound ON in Settings |
| **App crashes** | Verify all 26 MP3 files exist; Run `npm start --clear` |
| **Drag feels laggy** | Use a physical device instead of simulator |
| **Settings not saving** | Clear app cache; Check AsyncStorage is installed |

See **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** for detailed troubleshooting.

## 🔒 Privacy & Security

✅ **No internet** - All audio bundled with app
✅ **No tracking** - Zero analytics
✅ **No ads** - Clean, kid-safe experience
✅ **No login** - Open and play immediately
✅ **Local storage only** - Settings saved on device only

## 📦 Requirements

- **Node.js** 18+
- **npm** or **yarn**
- **iOS** 14.0+
- **macOS** with Xcode (for simulator) OR iPhone with Expo Go

## 🎨 Customization

### Change Colors
Edit `src/theme/colors.ts`

### Change Letter Size Range
Edit `src/screens/SettingsScreen.tsx` slider bounds

### Adjust Drag Boundaries
Edit `src/components/DraggableLetter.tsx` PADDING constant

### Add Features
1. Create component in `src/components/`
2. Add screen in `src/screens/` if needed
3. Update navigation in `App.tsx`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)

## 📄 License

Open source - feel free to modify and distribute.

## 🎉 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Add audio files to `assets/sounds/`
3. ✅ Start dev server: `npm start`
4. ✅ Test on device
5. ✅ Deploy to App Store

---

**Made with ❤️ for kids learning their ABCs!**
