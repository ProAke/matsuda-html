# Matsuda Sangyo Thailand — original HTML design on Nuxt

Nuxt 3 / Vue 3, no database. The visual source is the user-approved **Google Drive `matsuda-html` HTML export**, not the PHP archive and not a newly designed theme. Seven sections × four languages: `/en`, `/ja`, `/th`, `/zh`.

## Run

```sh
npm ci
npm run dev       # 0.0.0.0:3000
npm test         # locale integrity, safe HTML, local asset existence
npm run build
HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

Static hosting: `npm run generate`, deploy `.output/public`. Configure the host to redirect `/` to `/th`; the Node server already provides that redirect. Add legacy `.html`/`.php` redirects at the host when migrating the existing domain.

## Editing / team ownership

| Files | Responsibility |
|---|---|
| `data/legacy/{en,ja,th,zh}.json` | Imported original per-language HTML content, homepage blocks, navigation and footer. Edit trusted HTML blocks with code review. |
| `data/locales/{en,ja,th,zh}.json` | UI labels, accessibility labels and SEO descriptions. |
| `data/assets.json` | Banner and gallery image lists. All website images are local. |
| `public/legacy/` | Original logo, fonts, illustrations, photos, certificates and maps. |
| `assets/css/legacy-original.css` | Supplied `template.css` with corrected asset/font paths. Prefer compatibility fixes below instead of changing this file. |
| `assets/css/main.css` | Compatibility and mobile fixes over the original design. |
| `components/SiteHeader.vue`, `SiteFooter.vue`, `LegacyHome.vue` | Shared layout and native Vue carousel/menu (no old Prototype or Cloudflare runtime). |
| `pages/[lang]/[[page]].vue` | Route validation, language attributes, metadata and page rendering. |
| `scripts/import-legacy.py` | Reproducible build-time import of the HTML export. |
| `docs/HANDOFF.md` | Design provenance, known gaps and release checks. |

All content changes require a rebuild. This app does not accept arbitrary HTML from visitors, write content at runtime, or provide an admin panel. Imported HTML is sanitized at import time; JSON files are trusted, reviewed project source.

## Re-import the approved HTML export

Downloaded source files remain locally in ignored `google_drive/`. Keep the original Drive folder as the source backup; it is not copied into the public site. The importer expects the 28 HTML files, `template.css`, and associated assets (flattened by their original filenames, as delivered by the Drive connector).

```sh
python -m venv .venv
.venv/bin/pip install -r scripts/requirements-import.txt
.venv/bin/python scripts/import-legacy.py google_drive
npm test
```

Import regenerates the legacy JSON, original stylesheet and local asset copies. It does **not** execute PHP or legacy scripts. Review the diff before overwriting manual JSON edits. Missing source files are reported in `data/legacy/import-report.json`; unavailable **unused** decorative/admin CSS backgrounds are replaced with `none`.

## Browser checks (Linux)

Build and start the production server first, then run:

```sh
npm run test:browser
# Alternative server: TEST_BASE_URL=http://127.0.0.1:3001 npm run test:browser
```

Checks 28 localized routes, image loading, desktop/tablet/mobile overflow, menu, language switching, carousel and 404. Test-only Chromium is a development dependency and is not shipped to the site. External Google Maps embeds are stubbed during tests, so tests do not verify the Maps service. Screenshots go to ignored `.arena/screenshots/`.
