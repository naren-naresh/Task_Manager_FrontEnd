const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎨 Generating PWA icons...\n');

// Configuration
const text = 'TF';
const bgColor = '#4f46e5';
const textColor = '#ffffff';

// Create a temporary SVG
const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${bgColor}"/>
  <text x="256" y="384" font-size="320" text-anchor="middle" fill="${textColor}" 
        font-family="Arial, sans-serif" font-weight="bold">${text}</text>
</svg>`;

console.log('📝 Creating temporary SVG...');
fs.writeFileSync('temp-icon.svg', svg);

console.log('🔄 Generating all icon sizes...');
try {
  execSync('npx pwa-asset-generator temp-icon.svg ./public --background ' + bgColor + ' --icon-only', { stdio: 'inherit' });
  console.log('\n✅ Icons generated successfully!');
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
}

// Clean up
console.log('🧹 Cleaning up temporary files...');
try {
  fs.unlinkSync('temp-icon.svg');
} catch(e) {
  // File might not exist
}

console.log('\n📁 Your icons are in the /public folder');