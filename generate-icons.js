// Generate favicon PNG files from SVG
// Run with: node generate-icons.js

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - Deep Navy with gold gradient
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size*0.8);
  gradient.addColorStop(0, '#2d2d3f');
  gradient.addColorStop(1, '#15151f');
  ctx.fillStyle = gradient;
  
  // Rounded rectangle
  const radius = size * 0.15625; // 80px for 512px
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Draw brain icon in gold
  const scale = size / 512;
  const lineWidth = 16 * scale;
  
  ctx.fillStyle = '#d4af37';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Scale all coordinates
  const s = (coord) => coord * scale;
  
  // Left hemisphere
  ctx.beginPath();
  ctx.moveTo(s(180), s(256));
  ctx.quadraticCurveTo(s(140), s(180), s(180), s(140));
  ctx.quadraticCurveTo(s(220), s(100), s(256), s(140));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(180), s(256));
  ctx.quadraticCurveTo(s(140), s(332), s(180), s(372));
  ctx.quadraticCurveTo(s(220), s(412), s(256), s(372));
  ctx.stroke();
  
  // Right hemisphere
  ctx.beginPath();
  ctx.moveTo(s(332), s(256));
  ctx.quadraticCurveTo(s(372), s(180), s(332), s(140));
  ctx.quadraticCurveTo(s(292), s(100), s(256), s(140));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(332), s(256));
  ctx.quadraticCurveTo(s(372), s(332), s(332), s(372));
  ctx.quadraticCurveTo(s(292), s(412), s(256), s(372));
  ctx.stroke();
  
  // Center connections
  ctx.beginPath();
  ctx.moveTo(s(256), s(140));
  ctx.lineTo(s(256), s(180));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(256), s(332));
  ctx.lineTo(s(256), s(372));
  ctx.stroke();
  
  // Brain folds - left side
  ctx.lineWidth = lineWidth * 0.75;
  
  ctx.beginPath();
  ctx.moveTo(s(160), s(200));
  ctx.quadraticCurveTo(s(180), s(190), s(200), s(200));
  ctx.quadraticCurveTo(s(220), s(210), s(230), s(230));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(160), s(256));
  ctx.quadraticCurveTo(s(180), s(246), s(200), s(256));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(160), s(312));
  ctx.quadraticCurveTo(s(180), s(302), s(200), s(312));
  ctx.quadraticCurveTo(s(220), s(322), s(230), s(302));
  ctx.stroke();
  
  // Brain folds - right side
  ctx.beginPath();
  ctx.moveTo(s(352), s(200));
  ctx.quadraticCurveTo(s(332), s(190), s(312), s(200));
  ctx.quadraticCurveTo(s(292), s(210), s(282), s(230));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(352), s(256));
  ctx.quadraticCurveTo(s(332), s(246), s(312), s(256));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(s(352), s(312));
  ctx.quadraticCurveTo(s(332), s(302), s(312), s(312));
  ctx.quadraticCurveTo(s(292), s(322), s(282), s(302));
  ctx.stroke();
  
  // Highlight effect
  ctx.fillStyle = 'rgba(245, 208, 112, 0.15)';
  ctx.beginPath();
  ctx.ellipse(s(200), s(180), s(40), s(30), 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated: ${filename}`);
}

// Generate all sizes
async function generateAll() {
  await generateIcon(16, 'public/favicon.ico'); // Note: will be PNG, rename manually
  await generateIcon(32, 'public/favicon-32x32.png');
  await generateIcon(192, 'public/icon-192x192.png');
  await generateIcon(512, 'public/icon-512x512.png');
  await generateIcon(180, 'public/apple-touch-icon.png');
  console.log('All icons generated successfully!');
}

generateAll().catch(console.error);
