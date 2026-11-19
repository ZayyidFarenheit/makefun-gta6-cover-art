// GOLDEN HOUR Cover Studio — layouts and colour grades.
//
// A layout is a function of the cover's pixel size (w, h). It returns the
// geometry the renderer needs: every photo panel as a pixel rectangle, plus
// where the title, the neon script, the kicker, the seal, the tagline strip
// and the footer go. Layouts adapt to the cover's shape: a wide cover puts
// the hero on the left with panels stacked on the right; a tall cover stacks
// the hero on top and the panels in a grid below it.
//
// All coordinates are fractions of the cover size until the layout function
// turns them into pixels, so one layout works at 1920x1080, 1080x1080 and
// 1080x1350 alike.

/** The four layouts the studio offers, in the order the editor shows them. */
export const LAYOUTS = [
  { id: 'sunset', name: 'Sunset State', blurb: 'Big cinematic hero, side panels' },
  { id: 'heatwave', name: 'Heatwave', blurb: 'Mosaic of panels, hero on top' },
  { id: 'grid', name: 'Vice Grid', blurb: 'Even grid of six panels' },
  { id: 'boulevard', name: 'Boulevard', blurb: 'One wide photo, title band' },
];

/** The four colour grades, in the order the editor shows them. */
export const GRADES = [
  { id: 'cinematic', name: 'Cinematic', blurb: 'Warm and soft, photos stay photoreal' },
  { id: 'neon', name: 'Neon Dusk', blurb: 'Pink and purple night glow' },
  { id: 'golden', name: 'Golden Coast', blurb: 'Deep gold, high summer' },
  { id: 'vice', name: 'Vice Nights', blurb: 'Cool blue after dark' },
];

/**
 * A grade: a CSS filter string the renderer sets on the canvas context
 * while it draws a photo, plus a tint colour it washes over the photo
 * with a soft-light blend, and the colours the title gradient and the
 * tagline strip take under this grade.
 */
export const GRADE_STYLE = {
  cinematic: {
    filter: 'saturate(1.18) contrast(1.06) sepia(0.14) brightness(1.02)',
    tint: 'rgba(255, 150, 60, 0.10)',
    titleTop: '#ffffff',
    titleMid: '#ffd9a0',
    titleBottom: '#ff7a1a',
    strip: ['#ff2e7e', '#c81d6e'],
  },
  neon: {
    filter: 'saturate(1.35) contrast(1.12) hue-rotate(-18deg) brightness(0.98)',
    tint: 'rgba(255, 40, 160, 0.12)',
    titleTop: '#fff0fa',
    titleMid: '#ffb3e2',
    titleBottom: '#ff2e9e',
    strip: ['#b537f2', '#6d28a8'],
  },
  golden: {
    filter: 'sepia(0.38) saturate(1.45) contrast(1.05) brightness(1.03)',
    tint: 'rgba(255, 190, 40, 0.12)',
    titleTop: '#fffbe8',
    titleMid: '#ffe27a',
    titleBottom: '#ff9d00',
    strip: ['#ff8a00', '#e85d04'],
  },
  vice: {
    filter: 'saturate(1.25) contrast(1.12) hue-rotate(18deg) brightness(0.96)',
    tint: 'rgba(60, 80, 255, 0.12)',
    titleTop: '#eef4ff',
    titleMid: '#a8c8ff',
    titleBottom: '#4d7dff',
    strip: ['#3b2fd6', '#1d1a5e'],
  },
};

/** Clamp a number into [lo, hi]. */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The shared chrome of every layout: the tagline strip and the footer.
 * Returns their pixel rectangles plus the photo area (everything above the
 * strip), so each layout only has to arrange photos inside that area.
 */
function chrome(w, h) {
  const stripH = Math.round(h * 0.075);
  const footH = Math.round(h * 0.055);
  const photoH = h - stripH - footH;
  return {
    strip: { x: 0, y: photoH, w, h: stripH },
    footer: { x: 0, y: photoH + stripH, w, h: footH },
    photo: { x: 0, y: 0, w, h: photoH },
  };
}

/**
 * Panel rectangles for the Sunset State layout: one big hero on the left
 * (about 60% of the width) and five panels on the right — two small on top,
 * one wide in the middle, two small at the bottom. On a tall cover the
 * hero moves to the top and the panels form a grid underneath.
 */
function sunsetPanels(w, h) {
  const c = chrome(w, h);
  const a = c.photo;
  const gap = Math.max(3, Math.round(w * 0.004));
  if (w >= h) {
    const heroW = Math.round(a.w * 0.6);
    const rx = a.x + heroW + gap;
    const rw = a.x + a.w - rx;
    const topH = Math.round(a.h * 0.32);
    const midH = Math.round(a.h * 0.33);
    const botH = a.h - topH - midH - gap * 2;
    const halfW = Math.round((rw - gap) / 2);
    return {
      chrome: c,
      panels: [
        { id: 'hero', x: a.x, y: a.y, w: heroW, h: a.h },
        { id: 'face', x: rx, y: a.y, w: halfW, h: topH },
        { id: 'road', x: rx + halfW + gap, y: a.y, w: rw - halfW - gap, h: topH },
        { id: 'gas', x: rx, y: a.y + topH + gap, w: rw, h: midH },
        { id: 'moto', x: rx, y: a.y + topH + gap + midH + gap, w: halfW, h: botH },
        { id: 'boat', x: rx + halfW + gap, y: a.y + topH + gap + midH + gap, w: rw - halfW - gap, h: botH },
      ],
    };
  }
  const heroH = Math.round(a.h * 0.48);
  const gy = a.y + heroH + gap;
  const gh = a.h - heroH - gap;
  const rowH = Math.round((gh - gap) / 2);
  const colW = Math.round((a.w - gap * 2) / 3);
  return {
    chrome: c,
    panels: [
      { id: 'hero', x: a.x, y: a.y, w: a.w, h: heroH },
      { id: 'face', x: a.x, y: gy, w: colW, h: rowH },
      { id: 'road', x: a.x + colW + gap, y: gy, w: colW, h: rowH },
      { id: 'gas', x: a.x + colW * 2 + gap * 2, y: gy, w: a.w - colW * 2 - gap * 2, h: rowH },
      { id: 'moto', x: a.x, y: gy + rowH + gap, w: Math.round(a.w / 2) - Math.round(gap / 2), h: gh - rowH - gap },
      { id: 'boat', x: a.x + Math.round(a.w / 2) + Math.round(gap / 2), y: gy + rowH + gap, w: a.w - Math.round(a.w / 2) - Math.round(gap / 2), h: gh - rowH - gap },
    ],
  };
}

/**
 * Panel rectangles for the Heatwave layout: a mosaic — the hero spans the
 * top-left, the gas station takes the bottom-left, and the right side is a
 * column of three smaller panels.
 */
function heatwavePanels(w, h) {
  const c = chrome(w, h);
  const a = c.photo;
  const gap = Math.max(3, Math.round(w * 0.004));
  if (w >= h) {
    const leftW = Math.round(a.w * 0.52);
    const rx = a.x + leftW + gap;
    const rw = a.x + a.w - rx;
    const topH = Math.round(a.h * 0.55);
    const thirdH = Math.round((a.h - gap * 2) / 3);
    return {
      chrome: c,
      panels: [
        { id: 'hero', x: a.x, y: a.y, w: leftW, h: topH },
        { id: 'gas', x: a.x, y: a.y + topH + gap, w: leftW, h: a.h - topH - gap },
        { id: 'face', x: rx, y: a.y, w: rw, h: thirdH },
        { id: 'road', x: rx, y: a.y + thirdH + gap, w: rw, h: thirdH },
        { id: 'boat', x: rx, y: a.y + thirdH * 2 + gap * 2, w: rw, h: a.h - thirdH * 2 - gap * 2 },
        { id: 'moto', x: a.x, y: a.y, w: 0, h: 0 },
      ].filter((p) => p.w > 0 && p.h > 0),
    };
  }
  const heroH = Math.round(a.h * 0.45);
  const gy = a.y + heroH + gap;
  const gh = a.h - heroH - gap;
  const halfW = Math.round((a.w - gap) / 2);
  const rowH = Math.round((gh - gap) / 2);
  return {
    chrome: c,
    panels: [
      { id: 'hero', x: a.x, y: a.y, w: a.w, h: heroH },
      { id: 'gas', x: a.x, y: gy, w: halfW, h: rowH },
      { id: 'face', x: a.x + halfW + gap, y: gy, w: a.w - halfW - gap, h: rowH },
      { id: 'road', x: a.x, y: gy + rowH + gap, w: halfW, h: gh - rowH - gap },
      { id: 'moto', x: a.x + halfW + gap, y: gy + rowH + gap, w: a.w - halfW - gap, h: gh - rowH - gap },
      { id: 'boat', x: a.x, y: gy, w: 0, h: 0 },
    ].filter((p) => p.w > 0 && p.h > 0),
  };
}

/** Panel rectangles for the Vice Grid layout: six panels in an even grid. */
function gridPanels(w, h) {
  const c = chrome(w, h);
  const a = c.photo;
  const gap = Math.max(3, Math.round(w * 0.004));
  const cols = w >= h ? 3 : 2;
  const rows = w >= h ? 2 : 3;
  const cw = Math.round((a.w - gap * (cols - 1)) / cols);
  const rh = Math.round((a.h - gap * (rows - 1)) / rows);
  const ids = ['hero', 'face', 'road', 'gas', 'moto', 'boat'];
  const panels = [];
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const id = ids[n++];
      panels.push({
        id,
        x: a.x + col * (cw + gap),
        y: a.y + r * (rh + gap),
        w: col === cols - 1 ? a.x + a.w - (a.x + col * (cw + gap)) : cw,
        h: r === rows - 1 ? a.y + a.h - (a.y + r * (rh + gap)) : rh,
      });
    }
  }
  return { chrome: c, panels };
}

/**
 * Panel rectangles for the Boulevard layout: one wide photo fills the whole
 * photo area, and the title sits on a band across its lower third.
 */
function boulevardPanels(w, h) {
  const c = chrome(w, h);
  const a = c.photo;
  return {
    chrome: c,
    panels: [
      { id: 'hero', x: a.x, y: a.y, w: a.w, h: a.h },
      { id: 'face', x: a.x, y: a.y, w: 0, h: 0 },
      { id: 'road', x: a.x, y: a.y, w: 0, h: 0 },
      { id: 'gas', x: a.x, y: a.y, w: 0, h: 0 },
      { id: 'moto', x: a.x, y: a.y, w: 0, h: 0 },
      { id: 'boat', x: a.x, y: a.y, w: 0, h: 0 },
    ].filter((p) => p.w > 0 && p.h > 0),
  };
}

const PANEL_BUILDERS = {
  sunset: sunsetPanels,
  heatwave: heatwavePanels,
  grid: gridPanels,
  boulevard: boulevardPanels,
};

/**
 * The full geometry of a cover at pixel size (w, h) for a layout id:
 * the photo panels, the tagline strip, the footer, and where the title,
 * the neon script, the kicker and the seal go. Text sizes scale with the
 * cover so the same layout works at 1920x1080 and at 1080x1350.
 */
export function layoutFor(layoutId, w, h) {
  const build = PANEL_BUILDERS[layoutId] ?? PANEL_BUILDERS.sunset;
  const { chrome: c, panels } = build(w, h);
  const photo = c.photo;
  const wide = w >= h;
  const titleSize = Math.round((wide ? h : w) * (layoutId === 'boulevard' ? 0.16 : 0.15));
  const scriptSize = Math.round(titleSize * 0.48);
  const kickerSize = Math.round(titleSize * 0.21);
  const hero = panels.find((p) => p.id === 'hero') ?? panels[0];
  return {
    panels,
    strip: c.strip,
    footer: c.footer,
    photo,
    title: {
      // The title overlaps the hero's lower part, starting at the hero's left.
      x: hero.x + Math.round(w * 0.015),
      y: hero.y + hero.h - Math.round(titleSize * 0.95),
      size: titleSize,
      maxWidth: wide ? Math.round(w * 0.82) : Math.round(w * 0.94),
    },
    script: {
      // The neon script sits to the right of the hero, over the lower
      // panels, a little above the hero's bottom edge.
      x: wide ? hero.x + hero.w + Math.round(w * 0.012) : hero.x + Math.round(w * 0.5),
      y: hero.y + hero.h - Math.round(scriptSize * 1.05),
      size: scriptSize,
    },
    kicker: {
      // The kicker sits just above the title's top edge, clear of it.
      x: hero.x + Math.round(w * 0.02),
      y: hero.y + hero.h - Math.round(titleSize * 2.05 + kickerSize * 0.5),
      size: kickerSize,
    },
    seal: {
      // The round seal hangs over the first right-hand panel, or the hero's
      // top-right corner when there is no side panel.
      x: wide ? hero.x + hero.w + Math.round(w * 0.06) : hero.x + hero.w - Math.round(w * 0.1),
      y: wide ? photo.y + Math.round(photo.h * 0.3) : hero.y + Math.round(hero.h * 0.32),
      r: Math.round((wide ? h : w) * 0.062),
    },
    frame: Math.max(2, Math.round(w * 0.004)),
  };
}
