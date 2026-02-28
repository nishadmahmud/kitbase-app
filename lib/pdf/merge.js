import { PDFDocument } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

/**
 * Merge multiple PDFs by their file URIs (from expo-document-picker).
 * @param {Array<{ uri: string, name: string }>} files - Array of { uri, name }
 * @returns {Promise<Uint8Array>} Merged PDF as bytes
 */
export async function mergePdfUris(files) {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await readPdfUriAsBytes(file.uri);
    const pdf = await PDFDocument.load(bytes);
    const indices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}
