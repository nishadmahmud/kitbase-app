import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument } from 'pdf-lib';
import { base64ToUint8Array, readPdfUriAsBytes } from './utils';

/**
 * Sign a PDF by stamping an image (PNG/JPG) on each page.
 * @param {string} pdfUri - PDF file URI
 * @param {string} signatureUri - Image file URI (PNG/JPG)
 * @param {Object} options
 * @param {'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'} options.position
 * @param {number} options.scale - Scale factor for signature image
 * @param {number} options.margin - Margin from page edges in points
 * @returns {Promise<Uint8Array>}
 */
export async function signPdfUri(pdfUri, signatureUri, options = {}) {
  const {
    position = 'bottom-right',
    scale = 0.5,
    margin = 24,
  } = options;

  const pdfBytes = await readPdfUriAsBytes(pdfUri);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const sigBase64 = await FileSystem.readAsStringAsync(signatureUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const sigBytes = base64ToUint8Array(sigBase64);

  let sigImage;
  try {
    sigImage = await pdfDoc.embedPng(sigBytes);
  } catch {
    sigImage = await pdfDoc.embedJpg(sigBytes);
  }

  const pages = pdfDoc.getPages();
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const dims = sigImage.scale(scale);

    let x = margin;
    let y = margin;

    if (position === 'bottom-right') {
      x = width - dims.width - margin;
      y = margin;
    } else if (position === 'top-right') {
      x = width - dims.width - margin;
      y = height - dims.height - margin;
    } else if (position === 'top-left') {
      x = margin;
      y = height - dims.height - margin;
    } else {
      // bottom-left
      x = margin;
      y = margin;
    }

    page.drawImage(sigImage, {
      x,
      y,
      width: dims.width,
      height: dims.height,
    });
  });

  return pdfDoc.save();
}

