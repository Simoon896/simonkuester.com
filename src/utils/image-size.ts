// Build-time helper: read the pixel size of an image in public/ so pages can set
// width and height (no layout jump while it loads) and spot logo-shaped covers.
// Reads only the file header. Handles PNG and JPEG, which is all the site uses.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ImageSize { width: number; height: number; }

const PUBLIC_DIR = join(process.cwd(), 'public');

function pngSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15 carry the frame size, except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

export function publicImageSize(src: string): ImageSize | null {
  let buf: Buffer;
  try {
    buf = readFileSync(join(PUBLIC_DIR, decodeURI(src)));
  } catch {
    return null;
  }
  return pngSize(buf) ?? jpegSize(buf);
}

export function isLogoShaped(size: ImageSize): boolean {
  return size.width / size.height > 2.2;
}
