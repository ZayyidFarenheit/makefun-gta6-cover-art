# GOLDEN HOUR Cover Studio — GTA 6-style cover art maker

Turn your photos into cinematic GTA-style cover art: one big hero photo, three stacked panels, a huge gradient title overlapping the photos, a neon script subtitle, wanted stars and the "WELCOME TO VICE CITY" kicker — then export a PNG to share in 1920×1080, 1080×1080 or 1080×1350.

The cover maker is a static web app under `app/` — it runs offline in desktop Chrome with no network request. Photos are read on your own machine and never uploaded. The six bundled sample photos are AI-generated for this entry. The fonts (Anton and Pacifico, SIL Open Font License) are bundled under `app/fonts/`.

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ZayyidFarenheit/makefun-gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ZayyidFarenheit/makefun-gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Entry for [make.fun/bounty/gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

## How it works

- **Layouts:** Sunset State (the default: big hero left, three stacked panels right, title overlapping the photos, tagline strip and footer), Heatwave, Vice Grid, Boulevard and Neon Strip.
- **Grades:** Cinematic (the default: a gentle warm treatment that keeps photos photorealistic), Sunset, Neon, Vice Teal and Golden Hour gradient-map grades, plus a Poster Ink halftone toggle for the printed-poster look.
- **Photos:** upload your own photos, click a panel to select it, then pick its fill (a photo or a drawn scene), zoom and shift it, or fill every panel with one photo.
- **Caption:** kicker ("WELCOME TO VICE CITY"), wanted-level stars, gradient title, neon script subtitle, tagline strip and a circular "ORIGINAL COVER ART" seal.
- **Export:** one click per size — 1920×1080, 1080×1080, 1080×1350.

## Run it

Serve `app/` with any static server and open `index.html` in desktop Chrome:

```sh
cd app && python3 -m http.server 8080
```

`main.ts` (Node 22, standard library only) hands the entry in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
