# GOLDEN HOUR Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ZayyidFarenheit/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ZayyidFarenheit/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Your photos into cinematic GTA-style cover art — a big hero photo, side panels, a sunset grade, a gradient title and neon script. Export a PNG in 1920×1080, 1080×1080 or 1080×1350.

Made for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on [make.fun](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Sunset State layout** (default): one big cinematic hero photo on the left, five panels on the right, a giant gradient title overlapping the hero, a neon script, a kicker with five wanted stars, a round "ORIGINAL COVER ART" seal, a tagline strip and a credits footer.
- **4 layouts**: Sunset State, Heatwave, Vice Grid, Boulevard.
- **4 grades**: Cinematic (warm and photoreal, default), Neon Dusk, Golden Coast, Vice Nights — plus an optional Poster Ink halftone toggle (off by default).
- **Any photo**: upload your own photos, or use the six glamorous sample photos. Crop and position each panel (zoom, shift left–right, shift up–down), or fill every panel with one photo.
- **Caption**: edit the kicker ("WELCOME TO VICE CITY"), the title ("GOLDEN HOUR"), the neon script ("Neon Dusk") and the tagline strip ("ONE COAST · NO RULES · COMING SOON").
- **Export PNG** in the three common post sizes: 1920×1080, 1080×1080, 1080×1350.
- **Offline**: every font, photo and script is a file of this app — nothing loads over the network.

## Try it

Serve `app/` with any static file server and open `index.html`, for example:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor's dark violet theme
- `app/src/main.js` — state, editor wiring, export
- `app/src/cover.js` — the cover renderer (canvas)
- `app/src/scenes.js` — the four layouts and four grades
- `app/src/shots.js` — the sample photos and export sizes
- `app/samples/` — six sample photos, made with an image model
- `app/fonts/` — Anton and Pacifico (SIL Open Font License, see `OFL.txt`)
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`

## License

MIT — see [LICENSE](LICENSE). The fonts are licensed under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).
