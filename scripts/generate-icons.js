import sharp from "sharp";
import fs from "fs";
import path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple icon programmatically
async function generateIcons() {
  for (const size of sizes) {
    // Create a simple icon with a question mark
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#0a0a0a"/>
        <text x="${size / 2}" y="${size * 0.625}" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${size * 0.55}" 
              font-weight="bold" 
              fill="#ffffff" 
              text-anchor="middle">?</text>
        <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.08}" fill="#3b82f6"/>
        <circle cx="${size * 0.65}" cy="${size * 0.35}" r="${size * 0.08}" fill="#3b82f6"/>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleSize = 180;
  const appleSvg = `
    <svg width="${appleSize}" height="${appleSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${appleSize}" height="${appleSize}" rx="${appleSize * 0.125}" fill="#0a0a0a"/>
      <text x="${appleSize / 2}" y="${appleSize * 0.625}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="${appleSize * 0.55}" 
            font-weight="bold" 
            fill="#ffffff" 
            text-anchor="middle">?</text>
      <circle cx="${appleSize * 0.35}" cy="${appleSize * 0.35}" r="${appleSize * 0.08}" fill="#3b82f6"/>
      <circle cx="${appleSize * 0.65}" cy="${appleSize * 0.35}" r="${appleSize * 0.08}" fill="#3b82f6"/>
    </svg>
  `;

  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));

  console.log("Generated apple-touch-icon.png");

  // Generate favicon
  const faviconSvg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#0a0a0a"/>
      <text x="16" y="22" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="20" 
            font-weight="bold" 
            fill="#ffffff" 
            text-anchor="middle">?</text>
    </svg>
  `;

  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(__dirname, "../public/favicon.png"));

  console.log("Generated favicon.png");

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch(console.error);
