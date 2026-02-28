import { PDFDocument } from 'pdf-lib';
import { readPdfUriAsBytes } from './utils';

export async function protectPdfUri(uri, password) {
  const bytes = await readPdfUriAsBytes(uri);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  pdf.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    },
  });
  return await pdf.save();
}
