import { PDFDocument } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

/**
 * Reorder pages in a PDF from URI.
 * @param {string} uri - File URI
 * @param {number[]} newOrder - 0-based page indices in desired order
 * @returns {Promise<Uint8Array>}
 */
export async function reorderPdfUri(uri, newOrder) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, newOrder);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save();
}
