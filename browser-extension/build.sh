#!/bin/bash

# Clean the dist directory if it exists
if [ -d "dist" ]; then
  rm -rf dist
fi

# Build the extension
echo "Building Jobber Tracker Mate extension..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful! Extension files are in the dist directory."
  echo "To load the extension in Chrome:"
  echo "1. Open Chrome and navigate to chrome://extensions"
  echo "2. Enable Developer mode (toggle in top right)"
  echo "3. Click 'Load unpacked' and select the dist directory"
else
  echo "Build failed. Please check the error messages above."
fi
