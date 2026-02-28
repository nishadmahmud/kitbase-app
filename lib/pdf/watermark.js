import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

function hexToRgbColor(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!match) {
    return rgb(0, 0, 0);
  }
  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  return rgb(r, g, b);
}

/**
 * Add a text watermark to all pages of a PDF from a file URI.
 * @param {string} uri - PDF file URI
 * @param {Object} options
 * @param {string} options.text
 * @param {number} options.size
 * @param {number} options.opacity
 * @param {number} options.rotation
 * @param {string} options.color - hex string like "#FF0000"
 * @returns {Promise<Uint8Array>}
 */
export async function watermarkPdfUri(uri, options = {}) {
  const {
    text = 'CONFIDENTIAL',
    size = 50,
    opacity = 0.5,
    rotation = 45,
    color = '#FF0000',
  } = options;

  const bytes = await readPdfUriAsBytes(uri);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const watermarkColor = hexToRgbColor(color);

  const pages = pdfDoc.getPages();
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size,
      font,
      color: watermarkColor,
      opacity,
      rotate: degrees(rotation),
    });
  });

  return pdfDoc.save();
}

