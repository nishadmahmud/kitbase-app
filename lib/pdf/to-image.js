import PdfPageImage from 'react-native-pdf-page-image';

/**
 * Convert all pages of a PDF to images.
 * @param {string} filePath - Local file path (not content:// URI)
 * @param {number} scale - Image scale factor (default 2.0 for high quality)
 * @returns {Promise<Array<{ uri: string, width: number, height: number }>>}
 */
export async function pdfToImages(filePath, scale = 2.0) {
  const results = await PdfPageImage.generateAllPages(filePath, scale);
  return results;
}
