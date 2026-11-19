// GOLDEN HOUR Cover Studio — the cover renderer.
//
// drawCover(canvas, state) paints the whole cover onto a canvas at the
// canvas's own pixel size: the photo panels with the chosen grade, the
// giant gradient title, the neon script, the kicker with its five stars,
// the round seal, the tagline strip and the footer. It works the same at
// 1920x1080, 1080x1080 and 1080x1350 because every position comes from the
// layout (scenes.js) for that exact size.
//
// Photos are loaded once and cached by URL, so the preview re-renders fast
// while the editor's sliders move. The two display fonts (Anton for the
// bold lettering, Pacifico for the neon script) are loaded from the app's
// own fonts/ folder before anything is drawn.

import { layoutFor, GRADE_STYLE } from './scenes.js';

/** The display fonts, loaded from app/fonts/ by the page's stylesheet. */
const TITLE_FONT = 'Anton, "Arial Narrow", sans-serif';
const SCRIPT_FONT = 'Pacifico, "Comic Sans MS", cursive';

/** Loaded images, keyed by their src, so a re-render costs nothing. */
const imageCache = new Map();

/** Load one image, from the cache when it is already there. */
export function loadImage(src) {
  const hit = imageCache.get(src);
  if (hit) return hit;
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load photo ${src}`));
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

/** Make sure the display fonts are ready before the canvas uses them. */
export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load(`100px ${TITLE_FONT}`),
      document.fonts.load(`100px ${SCRIPT_FONT}`),
    ]);
    await document.fonts.ready;
  } catch {
    // If a font fails, the canvas falls back to its sans-serif stack.
  }
}

/**
 * Draw one photo into a panel rectangle, cover-fit: the photo fills the
 * rectangle and is cropped, never stretched. `zoom` scales it up around
 * its centre; `dx`/`dy` shift it by fractions of the panel. The grade's
 * filter and tint are applied so every panel shares the cover's grade.
 */
function drawPhoto(ctx, img, rect, zoom, dx, dy, grade) {
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE.cinematic;
  const s = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const x = rect.x + (rect.w - dw) / 2 + dx * rect.w;
  const y = rect.y + (rect.h - dh) / 2 + dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = style.filter;
  ctx.drawImage(img, x, y, dw, dh);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = style.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** A five-point star path, centred at (cx, cy) with outer radius r. */
function starPath(ctx, cx, cy, r) {
  const inner = r * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** The kicker: five gold stars followed by the kicker text. */
function drawKicker(ctx, text, at, size) {
  const starR = size * 0.62;
  const gap = size * 0.55;
  ctx.save();
  ctx.font = `${size}px ${TITLE_FONT}`;
  try { ctx.letterSpacing = `${Math.round(size * 0.18)}px`; } catch { /* older canvas */ }
  ctx.textBaseline = 'middle';
  let x = at.x;
  ctx.fillStyle = '#ffd34d';
  ctx.strokeStyle = '#7a4d00';
  ctx.lineWidth = Math.max(1, size * 0.06);
  for (let i = 0; i < 5; i++) {
    starPath(ctx, x + starR, at.y, starR);
    ctx.fill();
    ctx.stroke();
    x += starR * 2 + gap * 0.5;
  }
  x += gap;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(text.toUpperCase(), x, at.y + size * 0.05);
  ctx.restore();
}

/**
 * The giant title: Anton, filled with a vertical gradient (white at the
 * top, deep orange at the bottom) and stroked in dark purple so it reads
 * over any photo. Shrinks until it fits inside maxWidth.
 */
function drawTitle(ctx, text, at, size, maxWidth, grade) {
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE.cinematic;
  let fit = size;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  while (fit > size * 0.5) {
    ctx.font = `${fit}px ${TITLE_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fit = Math.round(fit * 0.94);
  }
  ctx.font = `${fit}px ${TITLE_FONT}`;
  const grad = ctx.createLinearGradient(0, at.y - fit, 0, at.y);
  grad.addColorStop(0, style.titleTop);
  grad.addColorStop(0.55, style.titleMid);
  grad.addColorStop(1, style.titleBottom);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2a0a4a';
  ctx.lineWidth = Math.max(2, fit * 0.085);
  ctx.strokeText(text, at.x, at.y);
  ctx.fillStyle = grad;
  ctx.fillText(text, at.x, at.y);
  ctx.restore();
}

/** The neon script under the title, pink with a thin dark outline. */
function drawScript(ctx, text, at, size) {
  ctx.save();
  ctx.font = `${size}px ${SCRIPT_FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(42, 10, 74, 0.85)';
  ctx.lineWidth = Math.max(1.5, size * 0.05);
  ctx.strokeText(text, at.x, at.y);
  ctx.fillStyle = '#ff5da2';
  ctx.fillText(text, at.x, at.y);
  ctx.restore();
}

/**
 * The round seal: a pink starburst (a circle with scalloped points),
 * a cream inner disc, and two lines of tiny dark text. Tilted a little,
 * like a sticker pressed onto the cover.
 */
function drawSeal(ctx, at, r) {
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(-0.21);
  ctx.beginPath();
  const points = 26;
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.88;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff4d8d';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe9f2';
  ctx.fill();
  ctx.fillStyle = '#5b1150';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.24)}px ${TITLE_FONT}`;
  ctx.fillText('ORIGINAL', 0, -r * 0.16);
  ctx.fillText('COVER ART', 0, r * 0.16);
  ctx.restore();
}

/** A palm silhouette: a leaning trunk and six drooping fronds. */
function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(2, -14, 8, -26);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * (0.08 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(8, -26);
    ctx.quadraticCurveTo(8 + Math.cos(a) * 12, -26 + Math.sin(a) * 8, 8 + Math.cos(a) * 20, -26 + Math.sin(a) * 16 + 6);
    ctx.stroke();
  }
  ctx.restore();
}

/** The tagline strip: a magenta band, palms at both ends, centred text. */
function drawTagline(ctx, text, rect, grade) {
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE.cinematic;
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
  grad.addColorStop(0, style.strip[0]);
  grad.addColorStop(1, style.strip[1]);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const s = rect.h * 0.62;
  drawPalm(ctx, rect.x + rect.w * 0.03, rect.y + rect.h * 0.92, s / 26, 'rgba(42, 10, 74, 0.55)');
  drawPalm(ctx, rect.x + rect.w * 0.06, rect.y + rect.h * 0.95, s / 34, 'rgba(42, 10, 74, 0.45)');
  drawPalm(ctx, rect.x + rect.w * 0.97, rect.y + rect.h * 0.92, s / 26, 'rgba(42, 10, 74, 0.55)');
  drawPalm(ctx, rect.x + rect.w * 0.94, rect.y + rect.h * 0.95, s / 34, 'rgba(42, 10, 74, 0.45)');
  const size = Math.round(rect.h * 0.42);
  ctx.font = `${size}px ${TITLE_FONT}`;
  try { ctx.letterSpacing = `${Math.round(size * 0.3)}px`; } catch { /* older canvas */ }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text.toUpperCase(), rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.04);
  ctx.restore();
}

/** The footer: black band, credits line, GH mark on the left, barcode right.
 *  The credits shrink (and shorten on narrow covers) so they always fit
 *  between the mark and the barcode instead of running off the edges. */
function drawFooter(ctx, rect) {
  ctx.save();
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const h = rect.h;
  const mark = Math.round(h * 0.62);
  const mx = rect.x + Math.round(rect.w * 0.012);
  const my = rect.y + Math.round((h - mark) / 2);
  ctx.fillStyle = '#ff4d8d';
  ctx.beginPath();
  ctx.roundRect(mx, my, mark, mark, Math.round(mark * 0.18));
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(mark * 0.5)}px ${TITLE_FONT}`;
  ctx.fillText('GH', mx + mark / 2, my + mark / 2 + mark * 0.04);
  const bw = Math.round(rect.w * 0.038);
  const bx = rect.x + rect.w - Math.round(rect.w * 0.012) - bw;
  const bh = Math.round(h * 0.6);
  const by = rect.y + Math.round((h - bh) / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
  ctx.fillStyle = '#0d0518';
  let px = bx;
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1];
  for (const b of bars) {
    const wdt = Math.max(1, Math.round((bw / 30) * b));
    if (b % 2 === 1) ctx.fillRect(px, by, wdt, bh);
    px += wdt + Math.max(1, Math.round(bw / 30));
    if (px > bx + bw) break;
  }
  // Credits: fit between the mark and the barcode. Shrink the type until
  // it fits; on a narrow cover fall back to the short line.
  const full = 'GH COVER STUDIO · A GH COVER STUDIO PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND · LETTERING AND SEAL ORIGINAL · CAT. GH-GH-0926';
  const short = 'GH COVER STUDIO · STARRING YOU · SHOT ON YOUR OWN CAMERA · CAT. GH-GH-0926';
  const left = mx + mark + Math.round(rect.w * 0.012);
  const right = bx - Math.round(rect.w * 0.012);
  const avail = right - left;
  const cx = left + avail / 2;
  let text = full;
  let size = Math.round(h * 0.3);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9b8e0';
  const setFont = (s) => {
    ctx.font = `${s}px ${TITLE_FONT}`;
    try { ctx.letterSpacing = `${Math.round(s * 0.12)}px`; } catch { /* older canvas */ }
  };
  setFont(size);
  if (ctx.measureText(text).width > avail) {
    while (size > Math.round(h * 0.18) && ctx.measureText(text).width > avail) {
      size -= 1;
      setFont(size);
    }
  }
  if (ctx.measureText(text).width > avail) {
    text = short;
    size = Math.round(h * 0.3);
    setFont(size);
    while (size > Math.round(h * 0.18) && ctx.measureText(text).width > avail) {
      size -= 1;
      setFont(size);
    }
  }
  ctx.fillText(text, cx, rect.y + h / 2 + size * 0.05);
  ctx.restore();
}

/**
 * The Poster Ink halftone: a grid of tiny dark dots over the photo area,
 * the printed-poster texture. Only drawn when the toggle is on.
 */
function drawHalftone(ctx, area, w) {
  const spacing = Math.max(5, Math.round(w * 0.0045));
  const dot = Math.max(0.7, spacing * 0.22);
  ctx.save();
  ctx.fillStyle = 'rgba(20, 5, 40, 0.13)';
  ctx.beginPath();
  for (let y = area.y + spacing / 2; y < area.y + area.h; y += spacing) {
    const offset = Math.round(y / spacing) % 2 === 0 ? spacing / 2 : 0;
    for (let x = area.x + spacing / 2 + offset; x < area.x + area.w; x += spacing) {
      ctx.moveTo(x + dot, y);
      ctx.arc(x, y, dot, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.restore();
}

/**
 * Paint the whole cover onto `canvas` (at its own pixel size) from `state`:
 *   state = { layout, grade, halftone, title, script, kicker, tagline,
 *             panels: { [panelId]: { src, zoom, dx, dy } } }
 * Returns a promise that resolves when the cover is drawn.
 */
export async function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  await fontsReady();
  const geo = layoutFor(state.layout, w, h);
  const needed = new Set();
  for (const p of geo.panels) {
    const slot = state.panels[p.id];
    if (slot?.src) needed.add(slot.src);
  }
  const images = new Map();
  for (const src of needed) {
    try {
      images.set(src, await loadImage(src));
    } catch {
      // A missing photo leaves its panel as a dark placeholder.
    }
  }
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160a2e';
  ctx.fillRect(0, 0, w, h);
  for (const p of geo.panels) {
    const slot = state.panels[p.id];
    const img = slot?.src ? images.get(slot.src) : undefined;
    if (img) {
      drawPhoto(ctx, img, p, slot.zoom ?? 1, slot.dx ?? 0, slot.dy ?? 0, state.grade);
    } else {
      ctx.fillStyle = '#241145';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }
  if (state.halftone) drawHalftone(ctx, geo.photo, w);
  drawKicker(ctx, state.kicker, geo.kicker, geo.kicker.size);
  drawTitle(ctx, state.title, geo.title, geo.title.size, geo.title.maxWidth, state.grade);
  drawScript(ctx, state.script, geo.script, geo.script.size);
  drawSeal(ctx, geo.seal, geo.seal.r);
  drawTagline(ctx, state.tagline, geo.strip, state.grade);
  drawFooter(ctx, geo.footer);
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = geo.frame;
  ctx.strokeRect(geo.frame / 2, geo.frame / 2, w - geo.frame, h - geo.frame);
  ctx.restore();
}
