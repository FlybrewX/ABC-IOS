# Generate app icons from SVG
# This script converts icon.svg to PNG format

# Install ImageMagick if needed:
# https://imagemagick.org/script/download.php

$svgFile = "icon.svg"
$iconFile = "icon.png"
$splashFile = "splash.png"

# Check if ImageMagick convert command exists
if (-not (Get-Command convert -ErrorAction SilentlyContinue)) {
    Write-Host "ImageMagick is not installed. Installing via chocolatey..."
    choco install imagemagick -y
}

# Generate icon (1024x1024)
Write-Host "Generating $iconFile (1024x1024)..."
convert $svgFile -background none -resize 1024x1024 $iconFile

# Generate splash screen (1242x2208 for iPhone)
Write-Host "Generating $splashFile (1242x2208)..."
convert $svgFile -background "#FFB6C1" -resize 1242x2208 -gravity center -extent 1242x2208 $splashFile

Write-Host "Icons generated successfully!"
Write-Host "Files created:"
Write-Host "  - $iconFile"
Write-Host "  - $splashFile"
