// GOLDEN HOUR Cover Studio — the cover renderer.
// drawCover(canvas, state) paints one cover: a cinematic photo poster in the
// style of the current top 1 — one big hero photo on the left, three stacked
// panels on the right, a huge gradient title overlapping the photos, a neon
// script subtitle, a wanted-level star row, a kicker, a circular seal, a
// bottom tagline strip and a small-print footer. It renders at any canvas
// size, so the live preview and the PNG exports share one code path.
// The default grade is Cinematic (a gentle warm treatment that keeps photos
// photorealistic); the gradient-map grades and the Poster Ink halftone are
// options for a more printed look.
import { SCENES } from './scenes.js';

// Grades. 'cinematic' is a gentle warm treatment (not a gradient map).
// The others are five-stop gradient maps from shadow to highlight.
export const GRADES = {
  cinematic: {
    name: 'Cinematic',
    cinematic: true,
  },
  sunset: {
    name: 'Sunset',
    stops: [[0, [26, 11, 46]], [0.25, [123, 30, 91]], [0.5, [214, 51, 108]], [0.75, [255, 122, 61]], [1, [255, 209, 102]]],
  },
  neon: {
    name: 'Neon',
    stops: [[0, [13, 2, 33]], [0.25, [59, 15, 110]], [0.5, [164, 19, 143]], [0.75, [255, 46, 166]], [1, [125, 249, 255]]],
  },
  vice: {
    name: 'Vice Teal',
    stops: [[0, [2, 20, 26]], [0.25, [11, 79, 92]], [0.5, [30, 142, 138]], [0.75, [255, 154, 61]], [1, [255, 233, 168]]],
  },
  golden: {
    name: 'Golden Hour',
    stops: [[0, [36, 21, 5]], [0.25, [107, 58, 14]], [0.5, [199, 123, 33]], [0.75, [255, 179, 71]], [1, [255, 243, 196]]],
  },
};
export const GRADE_IDS = ['cinematic', 'sunset', 'neon', 'vice', 'golden'];

// Layouts. Each returns panels (photo/scene rectangles) and a title zone,
// all in fractions of the canvas width and height. The ids name the panels
// the editor lets the maker fill. 'sunset' is the default: the top-1
// formula — big hero left, three stacked panels right, title overlapping
// the photos, a bottom strip and a footer. The other layouts keep the
// solid title block.
export const LAYOUTS = {
  sunset: { name: 'Sunset State', titleStyle: 'overlay', strip: true, footer: true, badgeAt: { x: 0.70, y: 0.285 }, panels: [
    { id: 'hero', x: 0.008, y: 0.010, w: 0.592, h: 0.852 },
    { id: 'face', x: 0.608, y: 0.010, w: 0.172, h: 0.272 },
    { id: 'road', x: 0.788, y: 0.010, w: 0.204, h: 0.272 },
    { id: 'gas', x: 0.608, y: 0.290, w: 0.384, h: 0.272 },
    { id: 'moto', x: 0.608, y: 0.570, w: 0.172, h: 0.292 },
    { id: 'boat', x: 0.788, y: 0.570, w: 0.204, h: 0.292 },
  ], title: { x: 0.03, y: 0.48, w: 0.82, h: 0.32 } },
  heatwave: { name: 'Heatwave', titleStyle: 'block', panels: [
    { id: 'heroA', x: 0.008, y: 0.012, w: 0.312, h: 0.525 },
    { id: 'mini1', x: 0.328, y: 0.012, w: 0.222, h: 0.168 },
    { id: 'mini2', x: 0.328, y: 0.188, w: 0.222, h: 0.168 },
    { id: 'mini3', x: 0.328, y: 0.364, w: 0.222, h: 0.173 },
    { id: 'heroB', x: 0.558, y: 0.012, w: 0.434, h: 0.525 },
    { id: 'strip1', x: 0.008, y: 0.55, w: 0.074, h: 0.438 },
    { id: 'strip2', x: 0.088, y: 0.55, w: 0.074, h: 0.438 },
    { id: 'strip3', x: 0.168, y: 0.55, w: 0.074, h: 0.438 },
    { id: 'strip4', x: 0.248, y: 0.55, w: 0.074, h: 0.438 },
  ], title: { x: 0.328, y: 0.55, w: 0.664, h: 0.438 } },
  vicegrid: { name: 'Vice Grid', titleStyle: 'block', panels: [
    { id: 'cell1', x: 0.008, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell2', x: 0.339, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell3', x: 0.67, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell4', x: 0.008, y: 0.339, w: 0.322, h: 0.315 },
    { id: 'cell5', x: 0.339, y: 0.339, w: 0.322, h: 0.315 },
    { id: 'cell6', x: 0.67, y: 0.339, w: 0.322, h: 0.315 },
  ], title: { x: 0.008, y: 0.666, w: 0.984, h: 0.322 } },
  boulevard: { name: 'Boulevard', titleStyle: 'block', panels: [
    { id: 'hero', x: 0.008, y: 0.012, w: 0.984, h: 0.52 },
    { id: 'mini1', x: 0.008, y: 0.545, w: 0.484, h: 0.155 },
    { id: 'mini2', x: 0.508, y: 0.545, w: 0.484, h: 0.155 },
  ], title: { x: 0.008, y: 0.713, w: 0.984, h: 0.275 } },
  neonstrip: { name: 'Neon Strip', titleStyle: 'block', panels: [
    { id: 'wide', x: 0.008, y: 0.012, w: 0.984, h: 0.52 },
    { id: 'small1', x: 0.008, y: 0.535, w: 0.32, h: 0.13 },
    { id: 'small2', x: 0.34, y: 0.535, w: 0.32, h: 0.13 },
    { id: 'small3', x: 0.672, y: 0.535, w: 0.32, h: 0.13 },
  ], title: { x: 0.008, y: 0.678, w: 0.984, h: 0.31 } },
};
export const LAYOUT_IDS = ['sunset', 'heatwave', 'vicegrid', 'boulevard', 'neonstrip'];

// The default cover: the Sunset State layout, Cinematic grade, Poster Ink
// off, the six new cinematic sample photos, and the fresh title GOLDEN
// HOUR with the one change from the top 1 — the kicker WELCOME TO VICE
// CITY (top 1's reads "A FEVER DREAM IN NEON") — plus the wanted stars.
export function defaultState() {
  return {
    layout: 'sunset',
    grade: 'cinematic',
    posterInk: false,
    title: 'GOLDEN HOUR',
    subtitle: 'Neon Dusk',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
    kicker: 'WELCOME TO VICE CITY',
    stars: 5,
    badge: true,
    badgeText: 'ORIGINAL COVER ART',
    panels: {
      hero: { kind: 'photo', photo: 'hero', zoom: 1, ox: 0, oy: 0 },
      face: { kind: 'photo', photo: 'face', zoom: 1, ox: 0, oy: 0 },
      road: { kind: 'photo', photo: 'road', zoom: 1, ox: 0, oy: 0 },
      gas: { kind: 'photo', photo: 'gas', zoom: 1, ox: 0, oy: 0 },
      moto: { kind: 'photo', photo: 'moto', zoom: 1, ox: 0, oy: 0 },
      boat: { kind: 'photo', photo: 'boat', zoom: 1, ox: 0, oy: 0 },
      heroA: { kind: 'photo', photo: 'hero', zoom: 1, ox: 0, oy: 0 },
      mini1: { kind: 'scene', scene: 'sunset' },
      mini2: { kind: 'photo', photo: 'face', zoom: 1.3, ox: 0, oy: 0 },
      mini3: { kind: 'scene', scene: 'skyline' },
      heroB: { kind: 'photo', photo: 'road', zoom: 1, ox: 0, oy: 0 },
      strip1: { kind: 'scene', scene: 'beach' },
      strip2: { kind: 'scene', scene: 'palms' },
      strip3: { kind: 'scene', scene: 'sunset' },
      strip4: { kind: 'photo', photo: 'moto', zoom: 1.4, ox: 0, oy: 0 },
      cell1: { kind: 'photo', photo: 'hero', zoom: 1, ox: 0, oy: 0 },
      cell2: { kind: 'scene', scene: 'sunset' },
      cell3: { kind: 'photo', photo: 'face', zoom: 1, ox: 0, oy: 0 },
      cell4: { kind: 'scene', scene: 'palms' },
      cell5: { kind: 'photo', photo: 'gas', zoom: 1, ox: 0, oy: 0 },
      cell6: { kind: 'scene', scene: 'skyline' },
      wide: { kind: 'scene', scene: 'sunset' },
      small1: { kind: 'scene', scene: 'sunset' },
      small2: { kind: 'scene', scene: 'palms' },
      small3: { kind: 'scene', scene: 'skyline' },
    },
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Builds the 256-entry gradient-map lookup table for a grade.
function gradeLUT(stops) {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s = 0;
    while (s < stops.length - 2 && t > stops[s + 1][0]) s++;
    const [p0, c0] = stops[s];
    const [p1, c1] = stops[s + 1];
    const f = p1 === p0 ? 0 : Math.min(1, Math.max(0, (t - p0) / (p1 - p0)));
    lut[i * 3] = lerp(c0[0], c1[0], f);
    lut[i * 3 + 1] = lerp(c0[1], c1[1], f);
    lut[i * 3 + 2] = lerp(c0[2], c1[2], f);
  }
  return lut;
}

// Maps every pixel of `data` through the gradient-map grade. When
// posterize is on, the luminance is first quantized to five levels, the
// comic-book look.
function gradePixels(data, lut, posterize) {
  for (let i = 0; i < data.length; i += 4) {
    let lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (posterize) lum = Math.round(lum / 64) * 64;
    const idx = Math.max(0, Math.min(255, lum | 0)) * 3;
    data[i] = lut[idx];
    data[i + 1] = lut[idx + 1];
    data[i + 2] = lut[idx + 2];
  }
}

// The Cinematic grade: a gentle warm treatment that keeps photos
// photorealistic — a saturation lift, warm highlights, cool shadows and a
// touch of contrast. No posterization, no duotone.
function cinematicPixels(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Saturation lift, 1.18x away from luminance.
    let nr = lum + (r - lum) * 1.18;
    let ng = lum + (g - lum) * 1.18;
    let nb = lum + (b - lum) * 1.18;
    // Warm highlights, cool shadows.
    const t = lum / 255;
    nr += (t - 0.5) * 14;
    nb -= (t - 0.5) * 10;
    // A touch of contrast.
    nr += (nr - 128) * 0.06;
    ng += (ng - 128) * 0.06;
    nb += (nb - 128) * 0.06;
    data[i] = Math.max(0, Math.min(255, nr));
    data[i + 1] = Math.max(0, Math.min(255, ng));
    data[i + 2] = Math.max(0, Math.min(255, nb));
  }
}

// Halftone dots over a graded panel: black dots whose radius grows as the
// cell gets darker, the printed-poster texture. Reads luminance from the
// graded ImageData, so the dots follow the picture.
function halftoneDots(octx, img, w, h) {
  const cell = Math.max(5, Math.round(w / 160));
  const path = new Path2D();
  for (let gy = 0; gy < h; gy += cell) {
    for (let gx = 0; gx < w; gx += cell) {
      const px = Math.min(w - 1, gx + (cell >> 1));
      const py = Math.min(h - 1, gy + (cell >> 1));
      const i = (py * w + px) * 4;
      const lum = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3 / 255;
      const r = (1 - lum) * cell * 0.52;
      if (r < 0.4) continue;
      path.moveTo(px + r, py);
      path.arc(px, py, r, 0, Math.PI * 2);
    }
  }
  octx.fillStyle = 'rgba(10, 2, 20, 0.5)';
  octx.fill(path);
}

// Draws one photo into a rectangle, cover-fit, with a zoom and an offset
// (both in fractions of the rectangle), like a crop the maker positioned.
function drawPhotoFit(octx, img, x, y, w, h, zoom, ox, oy) {
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * base;
  const ph = img.naturalHeight * base;
  const dx = x + (w - pw) / 2 + ox * w;
  const dy = y + (h - ph) / 2 + oy * h;
  octx.drawImage(img, dx, dy, pw, ph);
}

// Renders one panel to an offscreen canvas at its pixel size, grades it and
// inks it, then stamps it onto the cover. Returns the offscreen canvas.
function renderPanel(panel, assign, photos, grade, posterInk) {
  const w = Math.max(2, Math.round(panel.w));
  const h = Math.max(2, Math.round(panel.h));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  octx.fillStyle = '#1c0533';
  octx.fillRect(0, 0, w, h);
  if (assign && assign.kind === 'photo' && photos[assign.photo]) {
    drawPhotoFit(octx, photos[assign.photo], 0, 0, w, h, assign.zoom || 1, assign.ox || 0, assign.oy || 0);
  } else if (assign && assign.kind === 'scene' && SCENES[assign.scene]) {
    SCENES[assign.scene](octx, 0, 0, w, h);
  } else if (assign && assign.kind === 'photo') {
    octx.fillStyle = '#3b0f6e';
    octx.fillRect(0, 0, w, h);
  }
  const img = octx.getImageData(0, 0, w, h);
  if (GRADES[grade].cinematic) {
    cinematicPixels(img.data);
  } else {
    gradePixels(img.data, gradeLUT(GRADES[grade].stops), posterInk);
  }
  octx.putImageData(img, 0, 0);
  if (posterInk) halftoneDots(octx, img, w, h);
  return off;
}

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// The wanted-level star row: gold stars with a dark outline.
function drawStars(ctx, x, y, size, count) {
  for (let i = 0; i < count; i++) {
    const cx = x + i * size * 1.25 + size / 2;
    starPath(ctx, cx, y + size / 2, size / 2);
    ctx.fillStyle = '#ffd166';
    ctx.fill();
    ctx.lineWidth = Math.max(1, size * 0.07);
    ctx.strokeStyle = '#1c0533';
    ctx.stroke();
  }
}

// A jagged starburst badge with two lines of text.
function drawStarburst(ctx, cx, cy, r, lines) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.beginPath();
  const points = 14;
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points;
    const rr = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#1c0533';
  ctx.stroke();
  ctx.fillStyle = '#1c0533';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = r * 0.32;
  ctx.font = `900 ${fs}px Anton, sans-serif`;
  ctx.fillText(lines[0], 0, -fs * 0.55);
  ctx.font = `900 ${fs * 0.72}px Anton, sans-serif`;
  ctx.fillText(lines[1], 0, fs * 0.5);
  ctx.restore();
}

// A circular seal with a scalloped edge, an inner gold ring and two lines
// of dark text — the "ORIGINAL COVER ART" badge that overlaps the panels.
function drawSeal(ctx, cx, cy, r, lines) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.08);
  ctx.beginPath();
  const points = 28;
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points;
    const rr = i % 2 === 0 ? r : r * 0.93;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff5e9e';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.strokeStyle = '#1c0533';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.strokeStyle = '#ffd166';
  ctx.stroke();
  ctx.fillStyle = '#1c0533';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = r * 0.24;
  ctx.font = `900 ${fs}px Anton, sans-serif`;
  ctx.fillText(lines[0], 0, -fs * 0.55);
  ctx.font = `900 ${fs * 0.78}px Anton, sans-serif`;
  ctx.fillText(lines[1], 0, fs * 0.5);
  ctx.restore();
}

// One palm silhouette for the bottom strip: a slim curved trunk and five
// drooping fronds, drawn in a single colour.
function drawPalmSilhouette(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.5, x + s * 0.22, y - s * 0.9);
  ctx.stroke();
  const tx = x + s * 0.22;
  const ty = y - s * 0.9;
  for (let i = 0; i < 5; i++) {
    const a = (-0.1 - i * 0.35) * Math.PI;
    const ex = tx + Math.cos(a) * s * 0.45;
    const ey = ty + Math.sin(a) * s * 0.18 + s * 0.28;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * s * 0.25, ty - s * 0.08, ex, ey);
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.stroke();
  }
}

// The bottom tagline strip: a pink-to-purple band with palm silhouettes at
// both ends and the tagline centred in white caps.
function drawBottomStrip(ctx, w, h, tagline) {
  const y0 = h * 0.870;
  const y1 = h * 0.935;
  const g = ctx.createLinearGradient(0, y0, w, y0);
  g.addColorStop(0, '#ff5e7a');
  g.addColorStop(0.5, '#ff2e7e');
  g.addColorStop(1, '#a4138f');
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, y1 - y0);
  const s = (y1 - y0) * 1.15;
  drawPalmSilhouette(ctx, w * 0.02, y1 - 2, s, '#1c0533');
  drawPalmSilhouette(ctx, w * 0.06, y1 - 2, s * 0.85, '#240842');
  drawPalmSilhouette(ctx, w * 0.97, y1 - 2, s, '#1c0533');
  drawPalmSilhouette(ctx, w * 0.93, y1 - 2, s * 0.85, '#240842');
  if (tagline) {
    const fs = Math.max(9, (y1 - y0) * 0.42);
    ctx.font = `700 ${fs}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${fs * 0.28}px`; } catch (e) { /* older canvas */ }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagline, w / 2, (y0 + y1) / 2 + fs * 0.06);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  }
}

// The small-print footer: a black band with the studio mark, the credits
// line and a barcode.
function drawFooter(ctx, w, h, studio) {
  const y0 = h * 0.935;
  const y1 = h * 0.990;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, y0, w, y1 - y0);
  const bh = y1 - y0;
  // Studio mark: a pink rounded square with the initials.
  const ms = bh * 0.72;
  const mx = w * 0.008;
  const my = y0 + (bh - ms) / 2;
  ctx.fillStyle = '#ff2e7e';
  ctx.beginPath();
  ctx.roundRect(mx, my, ms, ms, ms * 0.18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${ms * 0.52}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(studio, mx + ms / 2, my + ms / 2 + ms * 0.04);
  // Credits line.
  const fs = Math.max(7, bh * 0.30);
  ctx.font = `${fs}px Anton, sans-serif`;
  ctx.fillStyle = '#c9c9c9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const credits = `${studio} COVER STUDIO · A ${studio} COVER STUDIO PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND · LETTERING AND SEAL ORIGINAL · CAT. GH-GH-0926`;
  ctx.fillText(credits, w * 0.52, (y0 + y1) / 2 + fs * 0.06, w * 0.82);
  // Barcode, bottom right.
  const bw = w * 0.035;
  const bx = w * 0.958;
  const by = y0 + bh * 0.16;
  const bh2 = bh * 0.68;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by, bw, bh2);
  ctx.fillStyle = '#0a0a0a';
  let px = bx + bw * 0.08;
  const bars = [0.10, 0.04, 0.14, 0.06, 0.08, 0.16, 0.05, 0.12, 0.07, 0.09];
  for (const f of bars) {
    const bwid = bw * f;
    if (px + bwid > bx + bw * 0.92) break;
    ctx.fillRect(px, by + bh2 * 0.08, bwid, bh2 * 0.84);
    px += bwid + bw * 0.05;
  }
}

// The title block for the solid-block layouts: kicker, wanted stars, the
// huge gradient title, the neon script subtitle overlapping it, and the
// tagline bar.
function drawTitleBlock(ctx, rect, state, w, h) {
  const { x, y, w: bw, h: bh } = rect;
  const g = ctx.createLinearGradient(0, y, 0, y + bh);
  g.addColorStop(0, '#ff2e7e');
  g.addColorStop(1, '#8a0f5e');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, bw, bh);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(x, y, bw, Math.max(2, bh * 0.012));

  const pad = bw * 0.045;
  const innerW = bw - pad * 2;
  let cy = y + bh * 0.07;

  // Kicker.
  if (state.kicker) {
    const ks = Math.max(10, bh * 0.075);
    ctx.font = `700 ${ks}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${ks * 0.25}px`; } catch (e) { /* older canvas */ }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(state.kicker, x + pad, cy + ks);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
    cy += ks * 1.9;
  }

  // Wanted stars, top right of the block.
  if (state.stars > 0) {
    const ss = Math.max(10, bh * 0.085);
    drawStars(ctx, x + bw - pad - ss * 1.25 * state.stars, y + bh * 0.045, ss, state.stars);
  }

  // The huge gradient title, auto-fit to the block width.
  const title = (state.title || '').toUpperCase();
  let ts = Math.min(bh * 0.42, (innerW / Math.max(1, title.length)) * 1.9);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  while (ts > 12) {
    ctx.font = `${ts}px Anton, sans-serif`;
    if (ctx.measureText(title).width <= innerW) break;
    ts -= 2;
  }
  ctx.font = `${ts}px Anton, sans-serif`;
  const tg = ctx.createLinearGradient(0, cy, 0, cy + ts);
  tg.addColorStop(0, '#fff3c4');
  tg.addColorStop(0.45, '#ffb347');
  tg.addColorStop(1, '#ff2e7e');
  ctx.lineWidth = Math.max(2, ts * 0.07);
  ctx.strokeStyle = '#1c0533';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(20, 4, 31, 0.55)';
  ctx.shadowBlur = ts * 0.12;
  ctx.shadowOffsetY = ts * 0.04;
  ctx.strokeText(title, x + pad, cy + ts);
  ctx.fillStyle = tg;
  ctx.fillText(title, x + pad, cy + ts);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Neon script subtitle, overlapping the title's foot.
  if (state.subtitle) {
    const sub = state.subtitle;
    let ss = ts * 0.52;
    ctx.textAlign = 'right';
    while (ss > 10) {
      ctx.font = `${ss}px Pacifico, cursive`;
      if (ctx.measureText(sub).width <= innerW * 0.98) break;
      ss -= 2;
    }
    ctx.font = `${ss}px Pacifico, cursive`;
    ctx.save();
    ctx.translate(x + bw - pad, cy + ts * 0.98);
    ctx.rotate(-0.03);
    ctx.shadowColor = '#ff2ea6';
    ctx.shadowBlur = ss * 0.45;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sub, 0, 0);
    ctx.restore();
    cy += ts + ss * 0.55;
  } else {
    cy += ts * 1.05;
  }

  // Tagline bar.
  if (state.tagline) {
    const tfs = Math.max(9, bh * 0.062);
    ctx.font = `700 ${tfs}px Anton, sans-serif`;
    const tw = ctx.measureText(state.tagline).width + tfs * 2.2;
    const bx = x + (bw - tw) / 2;
    const by = y + bh - tfs * 2.1;
    ctx.fillStyle = '#14041f';
    ctx.fillRect(bx, by, tw, tfs * 1.7);
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.tagline, x + bw / 2, by + tfs * 0.88);
  }
}

// The overlay title for the Sunset State layout: the wanted stars and the
// kicker on one line, then the huge gradient title with a thick dark
// outline drawn straight over the photos, then the neon script subtitle
// overlapping the title's foot.
function drawOverlayTitle(ctx, rect, state, w, h) {
  const { x, y, w: bw, h: bh } = rect;
  const title = (state.title || '').toUpperCase();

  // Stars + kicker on one line at the top of the zone.
  const ks = Math.max(10, bh * 0.11);
  const ky = y + ks * 1.15;
  let tx = x;
  if (state.stars > 0) {
    drawStars(ctx, x, ky - ks, ks, state.stars);
    tx = x + ks * 1.25 * state.stars + ks * 0.7;
  }
  if (state.kicker) {
    ctx.font = `700 ${ks}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${ks * 0.22}px`; } catch (e) { /* older canvas */ }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = 'rgba(20, 4, 31, 0.8)';
    ctx.shadowBlur = ks * 0.25;
    ctx.fillText(state.kicker, tx, ky);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  }

  // The huge gradient title, auto-fit to the zone width.
  let ts = Math.min(bh * 0.62, (bw / Math.max(1, title.length)) * 1.85);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  while (ts > 12) {
    ctx.font = `${ts}px Anton, sans-serif`;
    if (ctx.measureText(title).width <= bw) break;
    ts -= 2;
  }
  ctx.font = `${ts}px Anton, sans-serif`;
  const baseY = y + bh * 0.78;
  const tg = ctx.createLinearGradient(0, baseY - ts, 0, baseY);
  tg.addColorStop(0, '#ffffff');
  tg.addColorStop(0.45, '#ffd166');
  tg.addColorStop(1, '#ff7a3d');
  ctx.lineWidth = Math.max(2, ts * 0.09);
  ctx.strokeStyle = '#160428';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(20, 4, 31, 0.6)';
  ctx.shadowBlur = ts * 0.10;
  ctx.shadowOffsetY = ts * 0.035;
  ctx.strokeText(title, x, baseY);
  ctx.fillStyle = tg;
  ctx.fillText(title, x, baseY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Neon script subtitle, overlapping the title's foot, right of centre.
  if (state.subtitle) {
    const sub = state.subtitle;
    let ss = ts * 0.46;
    ctx.textAlign = 'right';
    while (ss > 10) {
      ctx.font = `${ss}px Pacifico, cursive`;
      if (ctx.measureText(sub).width <= bw * 0.62) break;
      ss -= 2;
    }
    ctx.font = `${ss}px Pacifico, cursive`;
    ctx.save();
    ctx.translate(x + bw * 0.98, baseY + ss * 0.28);
    ctx.rotate(-0.04);
    ctx.shadowColor = '#ff2ea6';
    ctx.shadowBlur = ss * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sub, 0, 0);
    ctx.restore();
  }
}

/** Paints one cover onto `canvas` (any size) from `state` and `photos`. */
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.sunset;
  const gap = Math.max(2, Math.round(w * 0.004));
  ctx.fillStyle = '#14041f';
  ctx.fillRect(0, 0, w, h);
  for (const p of layout.panels) {
    const px = Math.round(p.x * w) + gap;
    const py = Math.round(p.y * h) + gap;
    const pw = Math.round(p.w * w) - gap * 2;
    const ph = Math.round(p.h * h) - gap * 2;
    if (pw <= 0 || ph <= 0) continue;
    const off = renderPanel(
      { w: pw, h: ph },
      state.panels[p.id],
      photos,
      state.grade,
      state.posterInk,
    );
    ctx.drawImage(off, px, py, pw, ph);
  }
  const t = layout.title;
  const titleRect = { x: Math.round(t.x * w), y: Math.round(t.y * h), w: Math.round(t.w * w), h: Math.round(t.h * h) };
  if (layout.titleStyle === 'overlay') {
    drawOverlayTitle(ctx, titleRect, state, w, h);
  } else {
    drawTitleBlock(ctx, titleRect, state, w, h);
  }
  // The bottom strip and footer belong to the overlay (top-1) layout.
  if (layout.strip) drawBottomStrip(ctx, w, h, state.tagline);
  if (layout.footer) drawFooter(ctx, w, h, 'GH');
  // The badge: a circular seal on the overlay layout, a starburst at the
  // top left on the block layouts.
  if (state.badge) {
    if (layout.badgeAt) {
      const r = Math.min(w, h) * 0.055;
      const parts = (state.badgeText || 'ORIGINAL COVER ART').split(' ');
      const line1 = parts[0] || 'ORIGINAL';
      const line2 = parts.slice(1).join(' ') || 'COVER ART';
      drawSeal(ctx, layout.badgeAt.x * w, layout.badgeAt.y * h, r, [line1, line2]);
    } else {
      const r = Math.min(w, h) * 0.075;
      const parts = (state.badgeText || 'NEW SUMMER 2026').split(' ');
      const line1 = parts[0] || 'NEW';
      const line2 = parts.slice(1).join(' ') || 'SUMMER 2026';
      drawStarburst(ctx, r * 1.15, r * 1.15, r, [line1, line2]);
    }
  }
}
