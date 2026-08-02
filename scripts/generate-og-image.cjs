const sharp = require('sharp');
const fs = require('fs');

const NAME = 'Vasantha Kumar JM';
const TITLE = 'Software Engineer';
const TAGLINE = 'Reliable backend systems, clean scalable web apps,';
const TAGLINE2 = 'and a lot of experimenting with AI.';
const SITE = 'www.jmvasanthakumar.com';

const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="a" cx="0.2" cy="0" r="0.9">
      <stop offset="0" stop-color="#f59e0b" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="0.95" cy="0.15" r="0.75">
      <stop offset="0" stop-color="#fb7185" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#fb7185" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="0.1" cy="1" r="0.7">
      <stop offset="0" stop-color="#38bdf8" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f59e0b"/>
      <stop offset="1" stop-color="#fb7185"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#fdfcf9"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <rect width="1200" height="630" fill="url(#c)"/>

  <g transform="translate(80,74)">
    <rect width="64" height="64" rx="15" fill="url(#vk)"/>
    <g fill="none" stroke="#1c1917" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 20 L21.5 44 L30 20"/>
      <path d="M38.5 20 L38.5 44"/>
      <path d="M51 20 L39 32 L51 44"/>
    </g>
  </g>

  <text x="80" y="250" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="76" font-weight="700" fill="#1c1917">${NAME}</text>
  <text x="80" y="316" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="40" font-weight="600" fill="#b45309">${TITLE}</text>
  <text x="80" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="28" fill="#6b6259">${TAGLINE}</text>
  <text x="80" y="432" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="28" fill="#6b6259">${TAGLINE2}</text>
  <text x="80" y="545" font-family="Consolas, Menlo, monospace" font-size="24" fill="#6b6259">${SITE}</text>
</svg>`;

const ring = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#fb7185"/></linearGradient></defs><circle cx="180" cy="180" r="176" fill="none" stroke="url(#r)" stroke-width="8"/></svg>`;
const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="336" height="336"><circle cx="168" cy="168" r="168" fill="#fff"/></svg>`;

(async () => {
  const photo = await sharp('public/images/vasanth-photo.webp')
    .resize(336, 336, { fit: 'cover', position: sharp.strategy ? 'top' : 'centre' })
    .composite([{ input: Buffer.from(mask), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const out = await sharp(Buffer.from(bg))
    .composite([
      { input: photo, left: 792, top: 147 },
      { input: Buffer.from(ring), left: 780, top: 135 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync('src/app/opengraph-image.jpg', out);
  fs.writeFileSync('src/app/twitter-image.jpg', out);
  console.log('og written', (out.length / 1024).toFixed(0) + 'KB');
})();
