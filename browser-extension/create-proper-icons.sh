#!/bin/bash

# Create directory for icons if it doesn't exist
mkdir -p test-extension/icons

# Function to create a colored square PNG icon
create_icon() {
  size=$1
  output_file=$2
  
  # Use convert from ImageMagick to create a simple colored icon
  # This creates a blue square with the size text in white
  convert -size ${size}x${size} xc:blue -fill white -gravity center -pointsize $(($size/4)) -annotate 0 "${size}px" "${output_file}"
  
  echo "Created ${output_file}"
}

# Create icons of different sizes
create_icon 16 "test-extension/icons/icon16.png"
create_icon 48 "test-extension/icons/icon48.png"
create_icon 128 "test-extension/icons/icon128.png"

# Also create icons for the public directory
mkdir -p public/icons
create_icon 16 "public/icons/icon16.png"
create_icon 48 "public/icons/icon48.png"
create_icon 128 "public/icons/icon128.png"

echo "All icons created successfully"
