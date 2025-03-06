#!/bin/bash

# Base64 encoded minimal valid PNG file (1x1 transparent pixel)
BASE64_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

# Create icons directory if it doesn't exist
mkdir -p public/icons

# Decode base64 string to PNG files
echo $BASE64_PNG | base64 --decode > public/icons/icon16.png
echo $BASE64_PNG | base64 --decode > public/icons/icon48.png
echo $BASE64_PNG | base64 --decode > public/icons/icon128.png

echo "Created icon files in public/icons/"
