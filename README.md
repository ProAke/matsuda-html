# Matsuda Sangyo Thailand — Nuxt

Nuxt 3 / Vue 3, no database. Content is version-controlled JSON. Four locales: `/en`, `/ja`, `/th`, `/zh`.

## Development

```sh
npm ci
npm run dev
npm test
npm run build
```

Dev server binds to `0.0.0.0:3000`. For static hosting: `npm run generate`, deploy `.output/public`. For Node: `npm run build`, then `HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs`.

## Editing / team ownership

| Team | Files | Responsibility |
|---|---|---|
| Content / translation | `data/locales/{en,ja,th,zh}.json` | Translate matching keys; keep array order |
| Corporate content | `data/site.json` | Company name, offices, phone numbers, capital |
| Design / frontend | `components/`, `assets/css/main.css` | Shared header, footer, office cards, responsive design |
| Page development | `pages/[lang]/[[page]].vue` | Home and six internal page sections |
| Assets | `data/assets.json`, `public/images/` | Original image mapping, no stock or generated replacements |
| QA / deployment | `tests/`, `nuxt.config.ts`, `docs/HANDOFF.md` | Content validation, deployment, migration checklist |

Add a translation key to **all four** locale files. Run `npm test` before review. Changes need a rebuild; no admin panel or runtime JSON write endpoint is provided.

## Original images

Original images currently load from the legacy host. The sandbox cannot download that host's binary files. From a permitted network, run:

```sh
node scripts/sync-assets.mjs
```

This copies original image bytes to `public/images/` and rewrites the manifest only after every download succeeds. Review and commit assets and manifest together. No images are regenerated. Text embedded in legacy images remains in its original language.

See `docs/HANDOFF.md` for known migration gaps and release checks.
