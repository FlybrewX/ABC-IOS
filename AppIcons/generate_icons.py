#!/usr/bin/env python3
"""
Generate app icons from SVG for ABC Touch & Move app.
Requires: pip install pillow cairosvg
"""

import os
import sys
from pathlib import Path

def generate_icons():
    """Generate icon.png and splash.png from icon.svg"""
    
    try:
        from cairosvg import svg2png
        from PIL import Image
        import io
    except ImportError:
        print("❌ Required packages not found!")
        print("\nInstall with:")
        print("  pip install pillow cairosvg")
        sys.exit(1)
    
    svg_file = Path("icon.svg")
    icon_file = Path("icon.png")
    splash_file = Path("splash.png")
    
    if not svg_file.exists():
        print(f"❌ {svg_file} not found!")
        sys.exit(1)
    
    print("🎨 Generating app icons from SVG...")
    
    try:
        # Generate icon (1024x1024)
        print(f"  → Creating {icon_file} (1024x1024)...")
        svg2png(
            url=str(svg_file),
            write_to=str(icon_file),
            output_width=1024,
            output_height=1024
        )
        print(f"     ✅ {icon_file} created!")
        
        # Generate splash screen (1242x2208)
        print(f"  → Creating {splash_file} (1242x2208)...")
        svg2png(
            url=str(svg_file),
            write_to=str(splash_file),
            output_width=1242,
            output_height=2208
        )
        print(f"     ✅ {splash_file} created!")
        
        print("\n✅ Icons generated successfully!")
        print(f"\nFiles created:")
        print(f"  - {icon_file}")
        print(f"  - {splash_file}")
        print("\nYou can now start the app with: npm start")
        
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure Python 3 is installed")
        print("2. Install required packages:")
        print("   pip install pillow cairosvg")
        print("3. Try again")
        sys.exit(1)

if __name__ == "__main__":
    generate_icons()
