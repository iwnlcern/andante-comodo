import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const imageSizeCache = new Map();

const publicImagePath = (src) => {
  if (!src.startsWith('/')) return null;

  let relative;
  try {
    relative = decodeURI(src.slice(1));
  } catch {
    return null;
  }

  if (relative.split('/').includes('..')) return null;

  return path.join(process.cwd(), 'public', relative);
};

const SVG_HEAD_BYTES = 4096;

const svgDimensions = (buffer) => {
  const svg = buffer.toString('utf8', 0, Math.min(buffer.length, SVG_HEAD_BYTES));
  const viewBox = svg.match(/\bviewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
  if (viewBox) {
    return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  }

  const width = svg.match(/\bwidth=["'](\d+(?:\.\d+)?)(?:px)?["']/i);
  const height = svg.match(/\bheight=["'](\d+(?:\.\d+)?)(?:px)?["']/i);
  return width && height ? { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) } : null;
};

const jpegDimensions = (buffer) => {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }

    offset += 2 + length;
  }

  return null;
};

const pngDimensions = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
});

const webpDimensions = (buffer) => {
  const chunk = buffer.toString('ascii', 12, 16);

  if (chunk === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }

  if (chunk === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }

  if (chunk === 'VP8L') {
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    const width = 1 + (((b2 & 0x3f) << 8) | b1);
    const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width, height };
  }

  return null;
};

export const imageDimensions = (src) => {
  if (imageSizeCache.has(src)) return imageSizeCache.get(src);

  let dimensions = null;
  const filePath = publicImagePath(src);

  if (filePath && existsSync(filePath)) {
    const buffer = readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.svg') dimensions = svgDimensions(buffer);
    if (ext === '.jpg' || ext === '.jpeg') dimensions = jpegDimensions(buffer);
    if (ext === '.png') dimensions = pngDimensions(buffer);
    if (ext === '.webp') dimensions = webpDimensions(buffer);
  }

  imageSizeCache.set(src, dimensions);
  return dimensions;
};
