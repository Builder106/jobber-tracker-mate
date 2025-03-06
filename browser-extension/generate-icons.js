const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

// Directories where icons should be saved
const directories = [
  path.join(__dirname, 'test-extension', 'icons'),
  path.join(__dirname, 'public', 'icons')
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

// Function to draw an icon
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background (Google Blue)
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(0, 0, size, size);
  
  // Draw a "C" letter for CareerClutch
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.7)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', size/2, size/2);
  
  // Add border
  ctx.strokeStyle = '#3367D6'; // Darker blue
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.05));
  ctx.strokeRect(0, 0, size, size);
  
  return canvas.toBuffer();
}

// Generate and save icons
sizes.forEach(size => {
  const iconBuffer = drawIcon(size);
  
  directories.forEach(dir => {
    const filePath = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(filePath, iconBuffer);
    console.log(`Created icon: ${filePath}`);
  });
});

console.log('All icons generated successfully!');
