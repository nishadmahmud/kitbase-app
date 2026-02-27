import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument } from 'pdf-lib';

/**
 * Decode base64 to Uint8Array. Works in RN (Hermes has atob; else use minimal decode).
 */
function base64ToUint8Array(base64) {
  let binary;
  if (typeof atob !== 'undefined') {
    binary = atob(base64);
  } else {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
    base64 = base64.replace(/=+$/, '');
    const len = base64.length;
    const bytes = new Uint8Array((len * 3) / 4);
    let p = 0;
    for (let i = 0; i < len; i += 4) {
      const a = lookup[base64.charCodeAt(i)];
      const b = lookup[base64.charCodeAt(i + 1)];
      const c = i + 2 < len ? lookup[base64.charCodeAt(i + 2)] : 0;
      const d = i + 3 < len ? lookup[base64.charCodeAt(i + 3)] : 0;
      bytes[p++] = (a << 2) | (b >> 4);
      if (i + 2 < len) bytes[p++] = ((b & 15) << 4) | (c >> 2);
      if (i + 3 < len) bytes[p++] = ((c & 3) << 6) | d;
    }
    return bytes.slice(0, p);
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

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
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = base64ToUint8Array(base64);
    const pdf = await PDFDocument.load(bytes);
    const indices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}
