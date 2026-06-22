// Generates build/icon.png (1024x1024) from scratch using only Node's
// built-in zlib — no image library dependency, since the project avoids
// adding packages beyond what's strictly needed for packaging.
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const SIZE = 1024;
const ACCENT = [99, 102, 241]; // --color-accent
const WHITE = [255, 255, 255];
const CARD_COLORS = [
  [248, 113, 113],
  [74, 222, 128],
  [129, 140, 248],
];

function makeCanvas(size) {
  const px = new Uint8Array(size * size * 4);
  return {
    size,
    px,
    set(x, y, [r, g, b], a = 255) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const i = (y * size + x) * 4;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    },
  };
}

function fillRoundedRect(canvas, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const dx = x < x0 + r ? x0 + r - x : x > x0 + w - r ? x - (x0 + w - r) : 0;
      const dy = y < y0 + r ? y0 + r - y : y > y0 + h - r ? y - (y0 + h - r) : 0;
      if (dx * dx + dy * dy <= r * r || (dx === 0 || dy === 0)) {
        canvas.set(x, y, color);
      }
    }
  }
}

function fillCircle(canvas, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) canvas.set(x, y, color);
    }
  }
}

function encodePNG({ size, px }) {
  function crc32(buf) {
    let c;
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (crc ^ buf[i]) & 0xff;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
      }
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    raw.set(Buffer.from(px.buffer, y * size * 4, size * 4), rowStart + 1);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = chunk("IDAT", idatData);
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const canvas = makeCanvas(SIZE);

// Background: rounded square in accent color.
fillRoundedRect(canvas, 0, 0, SIZE, SIZE, 180, ACCENT);

// Three "kanban columns" as white rounded bars.
const margin = 160;
const gap = 56;
const colW = Math.round((SIZE - margin * 2 - gap * 2) / 3);
const colH = SIZE - margin * 2;
for (let i = 0; i < 3; i++) {
  const x = Math.round(margin + i * (colW + gap));
  fillRoundedRect(canvas, x, margin, colW, colH, 28, WHITE);
}

// A colored "card" near the top of each column.
const cardH = 110;
const cardMargin = 28;
for (let i = 0; i < 3; i++) {
  const x = Math.round(margin + i * (colW + gap));
  fillRoundedRect(
    canvas,
    x + cardMargin,
    margin + cardMargin,
    colW - cardMargin * 2,
    cardH,
    16,
    CARD_COLORS[i],
  );
}

const outPath = path.join(__dirname, "..", "build", "icon.png");
fs.writeFileSync(outPath, encodePNG(canvas));
console.log("wrote", outPath);
