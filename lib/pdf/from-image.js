import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument } from 'pdf-lib';
import { base64ToUint8Array } from './utils';

/**
 * Create a PDF from image URIs (JPG/PNG). Order of array = page order.
 * @param {Array<{ uri: string, name?: string }>} images - Image file URIs
 * @returns {Promise<Uint8Array>}
 */
export async function imagesToPdfUris(images) {
  if (!images || images.length === 0) throw new Error('Add at least one image.');

  const pdfDoc = await PDFDocument.create();

  for (const img of images) {
    const base64 = await FileSystem.readAsStringAsync(img.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = base64ToUint8Array(base64);
    const name = (img.name || '').toLowerCase();

    let image;
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.jpe')) {
      image = await pdfDoc.embedJpg(bytes);
    } else if (name.endsWith('.png')) {
      image = await pdfDoc.embedPng(bytes);
    } else {
      continue;
    }

    const page = pdfDoc.addPage();
    const { width, height } = image.scale(1);
    page.setSize(width, height);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  return await pdfDoc.save();
}
