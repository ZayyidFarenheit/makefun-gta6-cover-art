// GOLDEN HOUR Cover Studio — the editor.
//
// Owns the studio's state (which layout and grade, the caption, and which
// photo sits in each panel with its crop), wires the editor's controls to
// it, and re-renders the live preview on every change. Export renders the
// same cover at a post size on an offscreen canvas and downloads it as a
// PNG. Everything runs offline: the photos and fonts are files of this app.

import { drawCover, loadImage } from './cover.js';
import { LAYOUTS, GRADES, GRADE_STYLE } from './scenes.js';
import { SAMPLES, DEFAULT_PANELS, EXPORT_SIZES, exportFileName } from './shots.js';

/** The studio's opening state: the Sunset State layout, Cinematic grade. */
function freshState() {
  const panels = {};
  for (const [id, sample] of Object.entries(DEFAULT_PANELS)) {
    panels[id] = { src: `samples/${sample}.jpg`, zoom: 1, dx: 0, dy: 0 };
  }
  return {
    layout: 'sunset',
    grade: 'cinematic',
    halftone: false,
    title: 'GOLDEN HOUR',
    script: 'Neon Dusk',
    kicker: 'WELCOME TO VICE CITY',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
    panels,
  };
}

const state = freshState();
/** The panel the editor's crop controls currently edit. */
let selectedPanel = 'hero';
/** Photos the person uploaded in this session, as data URLs. */
const uploads = [];
/** Whether a render is already queued, so slider drags coalesce. */
let renderQueued = false;

/** The preview canvas and its context, found once at startup. */
const preview = document.getElementById('cover-preview');

/** The panel ids the current layout actually shows. */
function visiblePanels() {
  const ids = ['hero', 'face', 'road', 'gas', 'moto', 'boat'];
  return ids.filter((id) => state.panels[id] !== undefined);
}

/** Re-render the preview, coalescing rapid calls (slider drags). */
function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(async () => {
    renderQueued = false;
    try {
      await drawCover(preview, state);
    } catch (err) {
      console.error('preview failed', err);
    }
  });
}

/** A small helper: an element by id, or null. */
const $ = (id) => document.getElementById(id);

/** Build a row of toggle buttons (layouts, grades) into a container. */
function buildToggles(container, items, current, onPick) {
  container.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle' + (item.id === current ? ' active' : '');
    b.textContent = item.name;
    b.title = item.blurb ?? '';
    b.addEventListener('click', () => {
      onPick(item.id);
      buildToggles(container, items, item.id, onPick);
    });
    container.appendChild(b);
  }
}

/** Build the photo thumbnail strip: samples first, then uploads. */
function buildPhotoStrip() {
  const strip = $('photo-strip');
  strip.innerHTML = '';
  const all = [
    ...SAMPLES.map((s) => ({ id: s.id, src: s.src, label: s.label })),
    ...uploads.map((u, i) => ({ id: `upload-${i}`, src: u.src, label: u.label })),
  ];
  for (const photo of all) {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    thumb.title = photo.label;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.label;
    img.loading = 'lazy';
    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      const slot = state.panels[selectedPanel];
      if (slot) {
        slot.src = photo.src;
        syncPanelControls();
        render();
      }
    });
    strip.appendChild(thumb);
  }
}

/** Build the panel picker buttons for the current layout. */
function buildPanelPicker() {
  const picker = $('panel-picker');
  picker.innerHTML = '';
  for (const id of visiblePanels()) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle' + (id === selectedPanel ? ' active' : '');
    b.textContent = id;
    b.addEventListener('click', () => {
      selectedPanel = id;
      buildPanelPicker();
      syncPanelControls();
    });
    picker.appendChild(b);
  }
  $('panel-name').textContent = `Panel: ${selectedPanel}`;
}

/** Fill the crop controls from the selected panel's slot. */
function syncPanelControls() {
  const slot = state.panels[selectedPanel];
  if (!slot) return;
  $('panel-name').textContent = `Panel: ${selectedPanel}`;
  const fill = $('fill-select');
  fill.innerHTML = '';
  const all = [
    ...SAMPLES.map((s) => ({ value: s.src, label: `Photo: ${s.id}.jpg` })),
    ...uploads.map((u, i) => ({ value: u.src, label: u.label })),
  ];
  for (const opt of all) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    fill.appendChild(o);
  }
  fill.value = slot.src;
  $('zoom-range').value = String(slot.zoom);
  $('shift-x-range').value = String(slot.dx);
  $('shift-y-range').value = String(slot.dy);
}

/** The export buttons: one per post size, each rendering at that size. */
function buildExportButtons() {
  const box = $('export-buttons');
  box.innerHTML = '';
  for (const size of EXPORT_SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'export-btn';
    b.innerHTML = `<strong>PNG ${size.label}</strong><span>${size.hint}</span>`;
    b.addEventListener('click', () => exportCover(size));
    box.appendChild(b);
  }
}

/**
 * Render the cover at a post size and download it as a PNG. The export
 * canvas is offscreen: the preview never changes size for an export.
 */
async function exportCover(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  await drawCover(canvas, state);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) {
    console.error('export failed: no PNG produced');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFileName(state.title, size);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Wire the caption inputs (kicker, title, script, tagline) to the state. */
function wireCaption() {
  const map = { kicker: 'kicker-input', title: 'title-input', script: 'script-input', tagline: 'tagline-input' };
  for (const [key, id] of Object.entries(map)) {
    const input = $(id);
    input.value = state[key];
    input.addEventListener('input', () => {
      state[key] = input.value;
      render();
    });
  }
}

/** Wire the crop sliders and the fill-all button. */
function wireCrop() {
  $('fill-select').addEventListener('change', (e) => {
    const slot = state.panels[selectedPanel];
    if (slot) {
      slot.src = e.target.value;
      render();
    }
  });
  $('zoom-range').addEventListener('input', (e) => {
    const slot = state.panels[selectedPanel];
    if (slot) {
      slot.zoom = Number(e.target.value);
      render();
    }
  });
  $('shift-x-range').addEventListener('input', (e) => {
    const slot = state.panels[selectedPanel];
    if (slot) {
      slot.dx = Number(e.target.value);
      render();
    }
  });
  $('shift-y-range').addEventListener('input', (e) => {
    const slot = state.panels[selectedPanel];
    if (slot) {
      slot.dy = Number(e.target.value);
      render();
    }
  });
  $('fill-all-btn').addEventListener('click', () => {
    const slot = state.panels[selectedPanel];
    if (!slot) return;
    for (const id of visiblePanels()) state.panels[id].src = slot.src;
    render();
  });
}

/** Wire the photo upload: files become data URLs the panels can use. */
function wireUpload() {
  $('photo-input').addEventListener('change', async (e) => {
    const files = [...(e.target.files ?? [])];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const src = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
      uploads.push({ src, label: `Your photo: ${file.name}` });
      try {
        await loadImage(src);
      } catch {
        uploads.pop();
      }
    }
    e.target.value = '';
    buildPhotoStrip();
    syncPanelControls();
  });
}

/** Wire the layout and grade pickers and the halftone toggle. */
function wirePickers() {
  buildToggles($('layout-picker'), LAYOUTS, state.layout, (id) => {
    state.layout = id;
    if (!state.panels[selectedPanel]) selectedPanel = 'hero';
    buildPanelPicker();
    syncPanelControls();
    render();
  });
  buildToggles($('grade-picker'), GRADES, state.grade, (id) => {
    state.grade = id;
    render();
  });
  const halftone = $('halftone-toggle');
  halftone.checked = state.halftone;
  halftone.addEventListener('change', () => {
    state.halftone = halftone.checked;
    render();
  });
}

/** Start the studio: build the editor, preload the samples, paint. */
async function start() {
  buildPhotoStrip();
  buildPanelPicker();
  buildExportButtons();
  wireCaption();
  wireCrop();
  wireUpload();
  wirePickers();
  syncPanelControls();
  for (const s of SAMPLES) {
    try {
      await loadImage(s.src);
    } catch {
      // A missing sample leaves its panel dark; the cover still renders.
    }
  }
  render();
}

start();
