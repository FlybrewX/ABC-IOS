# App Icons for ABC Touch & Move

## Icons Needed

This folder should contain the following icon files:

### Required Files
1. **icon.png** (1024x1024 px)
   - App icon for iOS and home screen
   - PNG format, no transparency required
   - Should display the letter "A" prominently with colorful background

2. **splash.png** (1242x2208 px)
   - Splash/loading screen for iOS
   - PNG format
   - Soft pink/purple gradient background recommended

## How to Generate Icons

### Option 1: Using ImageMagick (Recommended)
```powershell
# Run the PowerShell script
.\generate_icons.ps1

# Or run individual commands:
convert icon.svg -background none -resize 1024x1024 icon.png
convert icon.svg -background "#FFB6C1" -resize 1242x2208 splash.png
```

### Option 2: Online Icon Generators
- Visitonline SVG to PNG converter: https://cloudconvert.com/svg-to-png
- Upload `icon.svg`
- Download as PNG (1024x1024)
- Repeat for splash screen (1242x2208)

### Option 3: Use Design Software
- Open `icon.svg` in:
  - Adobe Illustrator
  - Figma (import SVG)
  - Sketch
- Export as PNG at required sizes

### Option 4: Quick Icon Creation (No Tools Needed)
- Use online icon maker: https://www.favicon-generator.org/
- Or visit: https://app.smallseotools.com/image-resizer/

## Icon File Specifications

### icon.png (App Icon)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Gradient (pink #FFB6C1 to purple #DDA0DD)
- **Content**: Large "A" letter in red (#FF6B6B)
- **Corners**: Rounded (Expo handles this)

### splash.png (Splash Screen)
- **Size**: 1242x2208 pixels
- **Format**: PNG
- **Background**: Same gradient as icon
- **Content**: "ABC Touch & Move" text or centered app icon
- **Bottom Margin**: Leave space (200px+) for safe area

## Current Status

- ✅ `icon.svg` created (vector format)
- ⏳ `icon.png` - Generate from SVG
- ⏳ `splash.png` - Generate from SVG

## Steps to Complete

1. **Generate icons from icon.svg** (choose one method above)
2. **Place PNG files in this directory**:
   ```
   AppIcons/
   ├── icon.svg
   ├── icon.png          ← Generate this
   ├── splash.png        ← Generate this
   └── README.md
   ```
3. **Start the dev server**:
   ```bash
   npm start
   ```
4. **Test the app** - Icons will appear when you load on device

## Quick One-Liner (If ImageMagick Installed)
```bash
convert icon.svg icon.png && convert icon.svg -resize 1242x2208 splash.png
```

## Troubleshooting

**Icons not showing in app?**
- ✓ Verify file names match exactly: `icon.png` and `splash.png`
- ✓ Files must be in `AppIcons/` folder
- ✓ Run `npm start --clear` to clear cache
- ✓ Restart dev server

**File sizes are wrong?**
- Use ImageMagick or online resizer
- Icon must be 1024x1024
- Splash must be 1242x2208

**SVG won't convert?**
- Use CloudConvert (online tool)
- Or copy SVG content and use online editor

## References

- Expo Icon Requirements: https://docs.expo.dev/guides/icons/
- SVG to PNG Tools: https://cloudconvert.com/svg-to-png
- Icon Templates: https://www.figma.com/templates/
