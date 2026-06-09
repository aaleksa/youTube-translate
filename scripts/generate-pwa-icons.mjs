import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const iconsDir = path.join(process.cwd(), 'public', 'icons');

function buildSvg(size) {
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.28);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#2563eb"/>
  <rect x="${size * 0.12}" y="${size * 0.28}" width="${size * 0.76}" height="${size * 0.44}" rx="${size * 0.06}" fill="#ffffff" opacity="0.95"/>
  <polygon points="${size * 0.4},${size * 0.36} ${size * 0.4},${size * 0.64} ${size * 0.66},${size * 0.5}" fill="#2563eb"/>
  <text x="50%" y="${size * 0.84}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">YT</text>
</svg>`;
}

async function createIcon(size, filename) {
  const outputPath = path.join(iconsDir, filename);
  await sharp(Buffer.from(buildSvg(size))).png().toFile(outputPath);
  console.log(`Created ${outputPath}`);
}

await mkdir(iconsDir, { recursive: true });
await createIcon(192, 'icon-192.png');
await createIcon(512, 'icon-512.png');
