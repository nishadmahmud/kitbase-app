import { PDFDocument } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

export async function compressPdfUri(uri) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pdf.getPageIndices());
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save({ useObjectStreams: true });
}

export async function splitPdfUri(uri, baseName, options = {}) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes);
  const pageCount = pdf.getPageCount();
  const result = [];
  const safeName = (baseName || 'document').replace(/\.pdf$/i, '');

  const createPdfFromIndices = async (indices, suffixName) => {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    return { name: `${safeName}-${suffixName}.pdf`, bytes: await newPdf.save() };
  };

  const { mode = 'extract-all', fixedCount = 1 } = options;

  if (mode === 'extract-all') {
    for (let i = 0; i < pageCount; i++) {
      result.push(await createPdfFromIndices([i], `page-${i + 1}`));
    }
  } else if (mode === 'fixed-range') {
    const count = Math.max(1, fixedCount);
    for (let i = 0; i < pageCount; i += count) {
      const indices = [];
      for (let j = i; j < Math.min(i + count, pageCount); j++) indices.push(j);
      if (indices.length > 0) {
        const from = indices[0] + 1;
        const to = indices[indices.length - 1] + 1;
        result.push(await createPdfFromIndices(indices, `range-${from}-${to}`));
      }
    }
  } else {
    throw new Error('Invalid split mode.');
  }

  return result;
}

export async function getPdfPageCountUri(uri) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
}
