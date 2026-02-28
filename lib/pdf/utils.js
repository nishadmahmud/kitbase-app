import * as FileSystem from 'expo-file-system/legacy';

export function base64ToUint8Array(base64) {
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

export async function readPdfUriAsBytes(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToUint8Array(base64);
}
