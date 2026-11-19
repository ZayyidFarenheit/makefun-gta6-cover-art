// GOLDEN HOUR Cover Studio — the entry program (Node 22, stdlib only).
//
// Hands the app in: copies this repository's app/ and screenshots/ beside
// this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The app itself is plain static files a desktop browser loads offline:
// app/index.html and its modules, its fonts and its sample photos. Nothing
// is installed or built before this runs.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The directory this file lives in, and where the entry goes.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the app first, then the screenshots beside it. The screenshots
// are checked up front: an entry with no cover screenshot is refused by
// the gate, so fail here with a plain message instead of handing in a
// dossier the scorer cannot use.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}
const shotDir = join(out, 'screenshots');
const shots = readdirSync(shotDir).filter((name) => !name.startsWith('.'));
if (shots.length === 0) {
  throw new Error('screenshots/: no screenshots — the cover is the first by name');
}

// The scorer's own caps (from the competition's gate): only text_max_bytes
// shapes the dossier's bytes; the other caps refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB, more than
// 993 files in app/ or 48 MiB of app files in all, or a path under app/
// over 1000 bytes (app/ counts beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
