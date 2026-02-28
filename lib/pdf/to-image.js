import PdfThumbnail from 'react-native-pdf-thumbnail';

/**
 * Convert all pages of a PDF to images.
 * @param {string} filePath - Local file path (not content:// URI)
 * @param {number} quality - JPEG quality 0-100 (default 90)
 * @returns {Promise<Array<{ uri: string, width: number, height: number }>>}
 */
export async function pdfToImages(filePath, quality = 90) {
  const results = await PdfThumbnail.generateAllPages(filePath, quality);
  return results;
}
