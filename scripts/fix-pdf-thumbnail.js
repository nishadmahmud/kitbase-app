#!/usr/bin/env node
/**
 * Fix react-native-pdf-thumbnail Kotlin nullability error (Bitmap.Config?)
 * Required for RN 0.76+ / newer Android toolchains.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-pdf-thumbnail',
  'android',
  'src',
  'main',
  'java',
  'org',
  'songsterq',
  'pdfthumbnail',
  'PdfThumbnailModule.kt'
);

if (!fs.existsSync(filePath)) {
  console.warn('fix-pdf-thumbnail: PdfThumbnailModule.kt not found, skipping');
  process.exit(0);
  return;
}

let content = fs.readFileSync(filePath, 'utf8');
const original = 'Bitmap.createBitmap(bitmap.width, bitmap.height, bitmap.config)';
const fixed = 'Bitmap.createBitmap(bitmap.width, bitmap.height, bitmap.config ?: Bitmap.Config.ARGB_8888)';

if (content.includes(fixed)) {
  process.exit(0);
  return;
}

if (!content.includes(original)) {
  console.warn('fix-pdf-thumbnail: Pattern not found, package may have changed');
  process.exit(0);
  return;
}

content = content.replace(original, fixed);
fs.writeFileSync(filePath, content);
console.log('fix-pdf-thumbnail: Applied Bitmap.Config fix');
