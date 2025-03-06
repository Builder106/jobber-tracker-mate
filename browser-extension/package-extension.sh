#!/bin/bash

# Clean the package directory if it exists
if [ -d "package" ]; then
  rm -rf package
fi

# Create package directory
mkdir -p package

# Copy the manifest file
cp public/manifest.json package/

# Copy the icon files
mkdir -p package/icons
cp public/icons/*.png package/icons/

# Copy the background and content scripts
cp public/background.js package/
cp public/content.js package/

# Copy the popup files
cp public/popup.html package/
cp public/popup.css package/
cp public/popup.js package/

echo "Extension packaged in the 'package' directory"
echo "To load the extension in Chrome:"
echo "1. Open Chrome and navigate to chrome://extensions"
echo "2. Enable Developer mode (toggle in top right)"
echo "3. Click 'Load unpacked' and select the package directory"
