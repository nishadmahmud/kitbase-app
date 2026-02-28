import { PDFDocument } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

export async function unlockPdfUri(uri, password) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes, { password: password || undefined });
  return await pdf.save();
}
