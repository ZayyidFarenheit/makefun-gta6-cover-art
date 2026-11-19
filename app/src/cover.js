// VICE HEAT Cover Studio — the cover renderer.
// drawCover(canvas, state) paints one cover: a multi-panel photo mosaic with
// a gradient-map colour grade, an optional Poster Ink halftone, and a title
// block with a kicker, a wanted-level star row, a huge gradient title, a neon
// script subtitle, a tagline bar and a starburst badge. It renders at any
// canvas size, so the live preview and the PNG exports share one code path.
import { SCENES } from './scenes.js';

// Four gradient-map grades: each is five [position, rgb] stops from shadow
// (luminance 0) to highlight (luminance 1).
export const GRADES = {
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
export const GRADE_IDS = ['sunset', 'neon', 'vice', 'golden'];

// Four layouts. Each returns panels (photo/scene rectangles) and a title
// block, all in fractions of the canvas width and height. The ids name the
// panels the editor lets the maker fill.
export const LAYOUTS = {
  heatwave: { name: 'Heatwave', panels: [
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
  vicegrid: { name: 'Vice Grid', panels: [
    { id: 'cell1', x: 0.008, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell2', x: 0.339, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell3', x: 0.67, y: 0.012, w: 0.322, h: 0.315 },
    { id: 'cell4', x: 0.008, y: 0.339, w: 0.322, h: 0.315 },
    { id: 'cell5', x: 0.339, y: 0.339, w: 0.322, h: 0.315 },
    { id: 'cell6', x: 0.67, y: 0.339, w: 0.322, h: 0.315 },
  ], title: { x: 0.008, y: 0.666, w: 0.984, h: 0.322 } },
  boulevard: { name: 'Boulevard', panels: [
    { id: 'hero', x: 0.008, y: 0.012, w: 0.984, h: 0.52 },
    { id: 'mini1', x: 0.008, y: 0.545, w: 0.484, h: 0.155 },
    { id: 'mini2', x: 0.508, y: 0.545, w: 0.484, h: 0.155 },
  ], title: { x: 0.008, y: 0.713, w: 0.984, h: 0.275 } },
  neonstrip: { name: 'Neon Strip', panels: [
    { id: 'wide', x: 0.008, y: 0.012, w: 0.984, h: 0.52 },
    { id: 'small1', x: 0.008, y: 0.535, w: 0.32, h: 0.13 },
    { id: 'small2', x: 0.34, y: 0.535, w: 0.32, h: 0.13 },
    { id: 'small3', x: 0.672, y: 0.535, w: 0.32, h: 0.13 },
  ], title: { x: 0.008, y: 0.678, w: 0.984, h: 0.31 } },
};
export const LAYOUT_IDS = ['heatwave', 'vicegrid', 'boulevard', 'neonstrip'];

// The default cover: the Heatwave layout, Sunset grade, Poster Ink on, the
// two sample photos in the heroes, drawn scenes elsewhere, and the fresh
// title VICE HEAT with the GTA details rank 1 lacks (wanted stars, kicker).
export function defaultState() {
  return {
    layout: 'heatwave',
    grade: 'sunset',
    posterInk: true,
    title: 'VICE HEAT',
    subtitle: 'Neon Coast Nights',
    tagline: 'THE CITY NEVER SLEEPS',
    kicker: 'WELCOME TO VICE CITY',
    stars: 5,
    badge: true,
    badgeText: 'NEW SUMMER 2026',
    panels: {
      heroA: { kind: 'photo', photo: 'pier', zoom: 1, ox: 0, oy: 0 },
      mini1: { kind: 'scene', scene: 'sunset' },
      mini2: { kind: 'photo', photo: 'pier', zoom: 1.4, ox: 0.1, oy: -0.05 },
      mini3: { kind: 'scene', scene: 'skyline' },
      heroB: { kind: 'photo', photo: 'boulevard', zoom: 1, ox: 0, oy: 0 },
      strip1: { kind: 'scene', scene: 'beach' },
      strip2: { kind: 'scene', scene: 'palms' },
      strip3: { kind: 'scene', scene: 'sunset' },
      strip4: { kind: 'photo', photo: 'boulevard', zoom: 1.6, ox: -0.1, oy: 0 },
      cell1: { kind: 'photo', photo: 'pier', zoom: 1, ox: 0, oy: 0 },
      cell2: { kind: 'scene', scene: 'sunset' },
      cell3: { kind: 'photo', photo: 'boulevard', zoom: 1, ox: 0, oy: 0 },
      cell4: { kind: 'scene', scene: 'palms' },
      cell5: { kind: 'photo', photo: 'pier', zoom: 1.3, ox: 0, oy: 0.1 },
      cell6: { kind: 'scene', scene: 'skyline' },
      hero: { kind: 'photo', photo: 'pier', zoom: 1, ox: 0, oy: 0 },
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

// Maps every pixel of `data` through the grade. When posterize is on, the
// luminance is first quantized to five levels, the comic-book look.
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
  gradePixels(img.data, gradeLUT(GRADES[grade].stops), posterInk);
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

// The title block: kicker, wanted stars, the huge gradient title, the neon
// script subtitle overlapping it, and the tagline bar.
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

/** Paints one cover onto `canvas` (any size) from `state` and `photos`. */
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.heatwave;
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
  drawTitleBlock(
    ctx,
    { x: Math.round(t.x * w), y: Math.round(t.y * h), w: Math.round(t.w * w), h: Math.round(t.h * h) },
    state,
    w,
    h,
  );
  // Starburst badge, top left, overlapping the first hero panel.
  if (state.badge) {
    const r = Math.min(w, h) * 0.075;
    const parts = (state.badgeText || 'NEW SUMMER 2026').split(' ');
    const line1 = parts[0] || 'NEW';
    const line2 = parts.slice(1).join(' ') || 'SUMMER 2026';
    drawStarburst(ctx, r * 1.15, r * 1.15, r, [line1, line2]);
  }
}
