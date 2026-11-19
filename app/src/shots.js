// GOLDEN HOUR Cover Studio — the sample photos and the export sizes.
//
// The six sample photos ship with the app under app/samples/. They were
// made with an image model for this studio: glamorous, cinematic Vice City
// scenes with no text and no borrowed artwork in them, so they are free to
// use as the cover's starting photos. A person can replace any of them with
// their own photo from the editor.

/** The sample photos, in the order the editor lists them. */
export const SAMPLES = [
  { id: 'hero', src: 'samples/hero.jpg', label: 'Hero — convertible at sunset' },
  { id: 'face', src: 'samples/face.jpg', label: 'Face — golden-hour portrait' },
  { id: 'road', src: 'samples/road.jpg', label: 'Road — coastal road and palms' },
  { id: 'gas', src: 'samples/gas.jpg', label: 'Gas — neon station at night' },
  { id: 'moto', src: 'samples/moto.jpg', label: 'Moto — bike on the coast road' },
  { id: 'boat', src: 'samples/boat.jpg', label: 'Boat — speedboat wake from above' },
];

/** Which sample fills each panel when the studio first opens. */
export const DEFAULT_PANELS = {
  hero: 'hero',
  face: 'face',
  road: 'road',
  gas: 'gas',
  moto: 'moto',
  boat: 'boat',
};

/** The three PNG sizes the studio exports, the common post sizes. */
export const EXPORT_SIZES = [
  { id: 'wide', label: '1920 × 1080', w: 1920, h: 1080, hint: 'Landscape — desktop and stories' },
  { id: 'square', label: '1080 × 1080', w: 1080, h: 1080, hint: 'Square — feed posts' },
  { id: 'portrait', label: '1080 × 1350', w: 1080, h: 1350, hint: 'Portrait — feed posts, taller' },
];

/** Find a sample by id, or null. */
export function sampleById(id) {
  return SAMPLES.find((s) => s.id === id) ?? null;
}

/** Find an export size by id, or the wide one. */
export function exportSizeById(id) {
  return EXPORT_SIZES.find((s) => s.id === id) ?? EXPORT_SIZES[0];
}

/**
 * A short file name for an exported cover, e.g. golden-hour-1920x1080.png.
 * The title is slugified so the name is safe on every system.
 */
export function exportFileName(title, size) {
  const slug = (title || 'golden-hour')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'golden-hour';
  return `${slug}-${size.w}x${size.h}.png`;
}
