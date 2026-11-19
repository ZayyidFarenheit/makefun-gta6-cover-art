// Built-in drawn scenes for cover panels: a sunset sky, palm silhouettes, a
// city skyline and a beach. Every scene is drawn with canvas paths only, so
// the cover stays rich even when the maker has loaded just one photo.
// Each scene draws inside the rectangle (x, y, w, h) of the given context.

function skyGradient(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function sunDisc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function palmTree(ctx, x, y, s, color) {
  // One palm silhouette: a slim curved trunk and seven drooping fronds.
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.035);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x + s * 0.26, y - s * 0.92);
  ctx.stroke();
  const topX = x + s * 0.26;
  const topY = y - s * 0.92;
  for (let i = 0; i < 7; i++) {
    const a = (-0.05 - i * 0.24) * Math.PI;
    const ex = topX + Math.cos(a) * s * 0.5;
    const ey = topY + Math.sin(a) * s * 0.2 + s * 0.3;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * s * 0.28, topY - s * 0.1, ex, ey);
    ctx.lineWidth = Math.max(1, s * 0.018);
    ctx.stroke();
  }
  // A small coconut cluster under the crown.
  ctx.beginPath();
  ctx.arc(topX + s * 0.03, topY + s * 0.05, s * 0.035, 0, Math.PI * 2);
  ctx.arc(topX - s * 0.03, topY + s * 0.06, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

/** A sunset sky with a low sun and a glowing sea band. */
export function drawSunset(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [
    [0, '#ff9a3d'],
    [0.45, '#ff5e7a'],
    [0.8, '#a4138f'],
    [1, '#3b0f6e'],
  ]);
  sunDisc(ctx, x + w * 0.62, y + h * 0.42, Math.min(w, h) * 0.16, '#ffe9a8');
  ctx.fillStyle = 'rgba(255, 233, 168, 0.35)';
  ctx.fillRect(x, y + h * 0.72, w, h * 0.06);
  ctx.fillStyle = 'rgba(20, 4, 31, 0.55)';
  ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
}

/** Palm silhouettes against a sunset, with a sea band at the foot. */
export function drawPalms(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [
    [0, '#ffd166'],
    [0.5, '#ff7a3d'],
    [1, '#c22e6e'],
  ]);
  sunDisc(ctx, x + w * 0.5, y + h * 0.55, Math.min(w, h) * 0.14, '#fff3c4');
  ctx.fillStyle = 'rgba(20, 4, 31, 0.45)';
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  const s = Math.min(w, h) * 0.62;
  palmTree(ctx, x + w * 0.2, y + h * 0.98, s, '#1c0533');
  palmTree(ctx, x + w * 0.68, y + h, s * 1.1, '#240842');
  palmTree(ctx, x + w * 0.92, y + h * 0.95, s * 0.75, '#1c0533');
}

/** A city skyline at dusk, windows lit. */
export function drawSkyline(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [
    [0, '#2b1055'],
    [0.55, '#a4138f'],
    [1, '#ff7a3d'],
  ]);
  sunDisc(ctx, x + w * 0.78, y + h * 0.3, Math.min(w, h) * 0.1, '#ffe9a8');
  const buildings = [
    [0.0, 0.55, 0.16, 0.45], [0.14, 0.4, 0.14, 0.6], [0.3, 0.62, 0.12, 0.38],
    [0.44, 0.32, 0.16, 0.68], [0.62, 0.5, 0.13, 0.5], [0.77, 0.38, 0.15, 0.62],
    [0.9, 0.58, 0.1, 0.42],
  ];
  ctx.fillStyle = '#160428';
  for (const [bx, by, bw, bh] of buildings) {
    ctx.fillRect(x + bx * w, y + by * h, bw * w, bh * h);
  }
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 26; i++) {
    const bx = (i * 0.37) % 0.95;
    const by = 0.4 + ((i * 0.53) % 0.45);
    ctx.fillRect(x + bx * w, y + by * h, Math.max(1.5, w * 0.008), Math.max(1.5, h * 0.02));
  }
}

/** A beach with a lifeguard tower and a low sun. */
export function drawBeach(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [
    [0, '#ff9a3d'],
    [0.5, '#ff5e7a'],
    [1, '#7b1e5b'],
  ]);
  sunDisc(ctx, x + w * 0.3, y + h * 0.32, Math.min(w, h) * 0.13, '#fff3c4');
  ctx.fillStyle = '#e85d75';
  ctx.fillRect(x, y + h * 0.62, w, h * 0.14);
  ctx.fillStyle = '#f7c873';
  ctx.fillRect(x, y + h * 0.76, w, h * 0.24);
  // Lifeguard tower silhouette.
  ctx.fillStyle = '#2b0a3d';
  const tx = x + w * 0.68;
  ctx.fillRect(tx, y + h * 0.42, w * 0.03, h * 0.34);
  ctx.fillRect(tx - w * 0.05, y + h * 0.36, w * 0.13, h * 0.08);
  ctx.beginPath();
  ctx.moveTo(tx - w * 0.07, y + h * 0.36);
  ctx.lineTo(tx + w * 0.015, y + h * 0.28);
  ctx.lineTo(tx + w * 0.1, y + h * 0.36);
  ctx.closePath();
  ctx.fill();
}

export const SCENES = { sunset: drawSunset, palms: drawPalms, skyline: drawSkyline, beach: drawBeach };
export const SCENE_NAMES = { sunset: 'Sunset', palms: 'Palms', skyline: 'Skyline', beach: 'Beach' };
