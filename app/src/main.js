// VICE HEAT Cover Studio — wires the editor page: photo upload, panel
// picking, layout and grade controls, caption editing, live preview and the
// PNG exports. A `?shot=` query sets up a fixed scene for a screenshot
// instead (./shots.js).
import { drawCover, defaultState, LAYOUTS, LAYOUT_IDS, GRADES, GRADE_IDS } from './cover.js';
import { SCENE_NAMES } from './scenes.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
const photos = {};
let selectedPanel = 'heroA';
let selectedSize = { w: 1920, h: 1080, label: '1920 × 1080' };
let photoCount = 0;

const SIZES = [
  { w: 1920, h: 1080, label: '1920 × 1080', layout: 'heatwave' },
  { w: 1080, h: 1080, label: '1080 × 1080', layout: 'vicegrid' },
  { w: 1080, h: 1350, label: '1080 × 1350', layout: 'boulevard' },
];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('100px Pacifico'),
      document.fonts.ready,
    ]);
  } catch (e) { /* fall back to system fonts */ }
}

function fitPreview() {
  const maxW = 960;
  const scale = Math.min(1, maxW / selectedSize.w);
  canvas.width = Math.round(selectedSize.w * scale);
  canvas.height = Math.round(selectedSize.h * scale);
  canvas.style.aspectRatio = `${selectedSize.w} / ${selectedSize.h}`;
}

function redraw() {
  fitPreview();
  drawCover(canvas, state, photos);
}

function panelAt(cx, cy) {
  const rect = canvas.getBoundingClientRect();
  const fx = (cx - rect.left) / rect.width;
  const fy = (cy - rect.top) / rect.height;
  const layout = LAYOUTS[state.layout];
  for (const p of layout.panels) {
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) return p.id;
  }
  return null;
}

function refreshPanelControls() {
  const layout = LAYOUTS[state.layout];
  const assign = state.panels[selectedPanel] || { kind: 'scene', scene: 'sunset' };
  const select = document.getElementById('panel-source');
  select.innerHTML = '';
  for (const [id, img] of Object.entries(photos)) {
    const opt = document.createElement('option');
    opt.value = `photo:${id}`;
    opt.textContent = `Photo: ${img.dataset.name || id}`;
    select.appendChild(opt);
  }
  for (const [id, name] of Object.entries(SCENE_NAMES)) {
    const opt = document.createElement('option');
    opt.value = `scene:${id}`;
    opt.textContent = `Scene: ${name}`;
    select.appendChild(opt);
  }
  select.value = assign.kind === 'photo' ? `photo:${assign.photo}` : `scene:${assign.scene}`;
  document.getElementById('panel-name').textContent = `Panel: ${selectedPanel}`;
  document.getElementById('panel-zoom').value = assign.zoom || 1;
  document.getElementById('panel-ox').value = assign.ox || 0;
  document.getElementById('panel-oy').value = assign.oy || 0;
  document.querySelectorAll('#panel-list button').forEach((b) => {
    b.classList.toggle('active', b.dataset.panel === selectedPanel);
  });
}

function buildPanelList() {
  const list = document.getElementById('panel-list');
  list.innerHTML = '';
  for (const p of LAYOUTS[state.layout].panels) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.panel = p.id;
    b.textContent = p.id;
    b.addEventListener('click', () => {
      selectedPanel = p.id;
      refreshPanelControls();
    });
    list.appendChild(b);
  }
  if (!LAYOUTS[state.layout].panels.some((p) => p.id === selectedPanel)) {
    selectedPanel = LAYOUTS[state.layout].panels[0].id;
  }
  refreshPanelControls();
}

function buildOptionButtons(containerId, items, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.value = item.id;
    b.textContent = item.label;
    if (item.id === current) b.classList.add('active');
    b.addEventListener('click', () => {
      box.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      onPick(item.id);
    });
    box.appendChild(b);
  }
}

function addPhoto(img, name, fixedId) {
  const id = fixedId || `photo${++photoCount}`;
  img.dataset.name = name;
  photos[id] = img;
  const tray = document.getElementById('tray');
  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'thumb';
  thumb.title = name;
  const t = document.createElement('canvas');
  t.width = 72;
  t.height = 72;
  const tctx = t.getContext('2d');
  const s = Math.max(72 / img.naturalWidth, 72 / img.naturalHeight);
  tctx.drawImage(img, (72 - img.naturalWidth * s) / 2, (72 - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  thumb.appendChild(t);
  thumb.addEventListener('click', () => {
    state.panels[selectedPanel] = { kind: 'photo', photo: id, zoom: 1, ox: 0, oy: 0 };
    refreshPanelControls();
    redraw();
  });
  tray.appendChild(thumb);
  return id;
}

async function exportPNG(size) {
  await loadFonts();
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state, photos);
  const name = `vice-heat-${size.w}x${size.h}.png`;
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    status.textContent = `Saved ${name}`;
  }, 'image/png');
}

function bindControls() {
  document.getElementById('photo').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      const img = await loadImage(URL.createObjectURL(file));
      const id = addPhoto(img, file.name);
      state.panels[selectedPanel] = { kind: 'photo', photo: id, zoom: 1, ox: 0, oy: 0 };
    }
    refreshPanelControls();
    redraw();
  });
  document.getElementById('fill-all').addEventListener('click', () => {
    const assign = state.panels[selectedPanel];
    if (!assign || assign.kind !== 'photo') {
      status.textContent = 'Pick a photo panel first, then fill all.';
      return;
    }
    for (const p of LAYOUTS[state.layout].panels) {
      state.panels[p.id] = { kind: 'photo', photo: assign.photo, zoom: 1, ox: 0, oy: 0 };
    }
    redraw();
    status.textContent = 'Every panel now uses that photo.';
  });
  document.getElementById('panel-source').addEventListener('change', (e) => {
    const [kind, id] = e.target.value.split(':');
    const prev = state.panels[selectedPanel] || {};
    state.panels[selectedPanel] = kind === 'photo'
      ? { kind: 'photo', photo: id, zoom: prev.zoom || 1, ox: prev.ox || 0, oy: prev.oy || 0 }
      : { kind: 'scene', scene: id };
    redraw();
  });
  document.getElementById('panel-zoom').addEventListener('input', (e) => {
    const a = state.panels[selectedPanel];
    if (a && a.kind === 'photo') { a.zoom = parseFloat(e.target.value); redraw(); }
  });
  document.getElementById('panel-ox').addEventListener('input', (e) => {
    const a = state.panels[selectedPanel];
    if (a && a.kind === 'photo') { a.ox = parseFloat(e.target.value); redraw(); }
  });
  document.getElementById('panel-oy').addEventListener('input', (e) => {
    const a = state.panels[selectedPanel];
    if (a && a.kind === 'photo') { a.oy = parseFloat(e.target.value); redraw(); }
  });
  const textIds = ['title', 'subtitle', 'tagline', 'kicker'];
  for (const id of textIds) {
    document.getElementById(id).addEventListener('input', (e) => {
      state[id] = e.target.value;
      redraw();
    });
  }
  document.getElementById('stars').addEventListener('change', (e) => {
    state.stars = parseInt(e.target.value, 10) || 0;
    redraw();
  });
  document.getElementById('badge').addEventListener('change', (e) => {
    state.badge = e.target.checked;
    redraw();
  });
  document.getElementById('poster-ink').addEventListener('change', (e) => {
    state.posterInk = e.target.checked;
    redraw();
  });
  buildOptionButtons('layout-pick', LAYOUT_IDS.map((id) => ({ id, label: LAYOUTS[id].name })), state.layout, (id) => {
    state.layout = id;
    buildPanelList();
    redraw();
  });
  buildOptionButtons('grade-pick', GRADE_IDS.map((id) => ({ id, label: GRADES[id].name })), state.grade, (id) => {
    state.grade = id;
    redraw();
  });
  buildOptionButtons('size-pick', SIZES.map((s) => ({ id: s.label, label: s.label })), selectedSize.label, (label) => {
    selectedSize = SIZES.find((s) => s.label === label);
    state.layout = selectedSize.layout;
    buildOptionButtons('layout-pick', LAYOUT_IDS.map((id) => ({ id, label: LAYOUTS[id].name })), state.layout, (id2) => {
      state.layout = id2;
      buildPanelList();
      redraw();
    });
    buildPanelList();
    redraw();
  });
  for (const s of SIZES) {
    const b = document.getElementById(`export-${s.w}x${s.h}`);
    if (b) b.addEventListener('click', () => exportPNG(s));
  }
  canvas.addEventListener('click', (e) => {
    const id = panelAt(e.clientX, e.clientY);
    if (id) {
      selectedPanel = id;
      refreshPanelControls();
    }
  });
}

async function init() {
  bindControls();
  buildPanelList();
  // The two bundled sample photos, so the editor opens with a cover ready.
  // They are registered under the ids the default cover state names.
  const pier = await loadImage('samples/pier.jpg');
  addPhoto(pier, 'pier.jpg', 'pier');
  const boulevard = await loadImage('samples/boulevard.jpg');
  addPhoto(boulevard, 'boulevard.jpg', 'boulevard');
  // Rebuild the panel source list now that the photos exist.
  refreshPanelControls();
  await loadFonts();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    await runShot(shot, query, state, photos, redraw);
  } else {
    redraw();
  }
}

init();
