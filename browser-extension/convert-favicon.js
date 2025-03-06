const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const { execSync } = require('child_process');

// Path to the favicon.ico file
const faviconPath = '/Users/yinka/My Drive/CS/Projects/SWE/careerclutch/public/favicon.ico';

// Directories where icons should be saved
const directories = [
  path.join(__dirname, 'public', 'icons'),
  path.join(__dirname, 'test-extension', 'icons')
];

// Icon sizes to generate
const sizes = [16, 48, 128];

// Create directories if they don't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create a temporary PNG from the favicon.ico using sips (macOS utility)
const tempPngPath = path.join(__dirname, 'temp_favicon.png');
try {
  execSync(`sips -s format png "${faviconPath}" --out "${tempPngPath}"`);
  console.log(`Converted favicon.ico to temporary PNG: ${tempPngPath}`);
} catch (error) {
  console.error('Error converting favicon.ico to PNG:', error);
  process.exit(1);
}

// Function to resize the icon to different sizes
async function resizeIcon() {
  try {
    const image = await loadImage(tempPngPath);
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the image resized to the canvas
      ctx.drawImage(image, 0, 0, size, size);
      
      // Save the resized image to each directory
      for (const dir of directories) {
        const filePath = path.join(dir, `icon${size}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);
        console.log(`Created icon: ${filePath}`);
      }
    }
    
    // Clean up the temporary file
    fs.unlinkSync(tempPngPath);
    console.log('Removed temporary PNG file');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error resizing icon:', error);
    // Clean up the temporary file if it exists
    if (fs.existsSync(tempPngPath)) {
      fs.unlinkSync(tempPngPath);
    }
  }
}

resizeIcon();
