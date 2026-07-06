# Template configuration

This site is built to be **re-skinned by a stranger**: change your name,
links, navigation, and metadata in one place without touching layout or
component code. This guide is the source of truth for the **identity**
control surface. (For type, color, and font tuning, see
[theming.md](./theming.md).)

## The site config (`src/config/site.mjs`)

Almost everything that says "you" lives in one plain-ESM module,
`src/config/site.mjs`, imported across the site as `#config/site.mjs`.
It is plain `.mjs` (not `.ts`) so it imports cleanly into Astro components,
`astro.config.mjs`, and direct Node tools/tests alike. Edit the values;
do not rename the keys (the keys are a contract other files read).

The chrome reads this subset:

| Field | Drives |
| ----- | ------ |
| `site.name` | Page `<title>` suffix, header wordmark, footer copyright. |
| `site.social.github` / `.linkedin` / `.rss` | Footer links. |
| `site.meta.ogImage` | Default Open Graph / Twitter card image path. |
| `site.meta.templateHref` | Optional. When set, the footer adds "Like this website? Get the template." linking to it. Delete the key to remove the line. |
| `site.email` | Contact email, shown obfuscated (reassembled client-side) on `/resume` and the home-page hero. Sample data — replace with your own. |

Other fields (`site.url` — the hostname is derived from it, not edited
separately — the hero/portrait block, `site.feeds`, page meta) are consumed by
the home page, feeds, and domain machinery; see the schema and JSDoc in
`src/config/site.mjs` itself, which
is the authoritative reference for the full field set.

### Portrait and hero assets

`site.hero.portrait.src` points at the portrait image in `public/` (the
template ships a neutral `portrait.jpg`). Replace that file with your own
portrait or a neutral representative image and update `src` to match, then
update the `alt` and `credit` fields in `site.hero.portrait`.

## Collections (`src/config/collections.mjs`)

The site's section roster lives in one plain-ESM registry,
`src/config/collections.mjs`. It controls which content sections exist, their
display names, descriptions, canonical URLs, ordering, accents, taxonomy
labels, and where each appears (nav / homepage / feed). As with `site.mjs`,
edit the values; do not rename the keys.

- **Navigation** comes from `navCollections()` (the enabled, in-nav sections)
  plus `standalonePages` (the non-collection links, e.g. About / Resume).
- **Feeds:** a collection with `inFeed: true` joins the combined `/rss.xml`;
  the first in-feed collection (registry order) is the primary feed. It
  drives `/rss-blog.xml` and the newsletter post-path. Reorder to change the
  primary; adding `inFeed` widens only the combined feed, never the newsletter.
- **Feed copy** (titles + descriptions) lives in `site.feeds`
  (`title`, `description`, `blogDescription`) in `src/config/site.mjs`.
- **Renaming vs moving:** changing a section's `label` is no-code; changing its
  URL `slug` (the route on disk) is an advanced file move, not config.

## Resume (`src/data/resume.ts`)

The resume page at `/resume` is driven by `src/data/resume.ts`. Replace all
seven exports when re-skinning:

- `experience`
- `projects`
- `education`
- `skills`
- `profile`
- `publications`
- `interests`

Keep `profile` and `education` as objects; the remaining exports may be arrays
or the existing shapes documented by the file. Empty arrays are valid while
drafting, but a public template should include enough neutral sample data for
the page to render coherently.

> **Identity & PII:** `site.email` (`src/config/site.mjs`) and `profile.phone`
> (`src/data/resume.ts`) ship as neutral sample data here - replace both with
> your own when re-skinning.

## About page

The main about content lives in `src/content/pages/about.mdx` — edit it to
introduce yourself.

## Theme storage key (`src/scripts/theme-key.mjs`)

The light/dark preference is saved under a localStorage key exported once
from `src/scripts/theme-key.mjs` (`THEME_STORAGE_KEY`). It is intentionally
**separate** from `site.mjs`: it is a per-origin storage namespace, not
personal identity, and a template user normally never touches it. The
constant is consumed by `theme.ts`, the pre-paint inline script in
`BaseHead.astro` (injected via Astro `define:vars`), so the key is defined
in exactly one place.

> **Note:** changing this key resets every existing visitor's saved
> light/dark choice once (it falls back to the default dark theme until
> they toggle again). That one-time reset is accepted by design; there is
> no migration shim.

## Environment (`.env.example`)

Deploy-time and secret values live in `.env` (never committed); copy
`.env.example` to `.env` and fill it in. The identity-flavored entries you
will change:

- `RSS_FEED_URL` - your feed URL (`https://yourdomain.com/rss-blog.xml`).
- `LISTMONK_FROM_EMAIL` - your newsletter sender (`Your Name <news@yourdomain.com>`).

For the complete newsletter environment - both the RSS-to-campaign automation
and the on-site subscribe form (reCAPTCHA keys, listmonk list UUIDs) - see
[listmonk-rss-automation.md](./listmonk-rss-automation.md).

## Build, deploy & operations

### Commands & scripts (`package.json`)

This table lists the scripts available in the template package.

| Script | Runs | Purpose |
| ------ | ---- | ------- |
| `npm run dev` | `astro dev` | Local dev server (http://localhost:4321). |
| `npm run build` | `astro build` -> `dist/` | Production build; auto-runs `postbuild`. |
| `postbuild` (auto) | `pagefind --site dist` | Builds the Pagefind search index into `dist/`. No separate config. |
| `npm run preview` | `astro preview` | Unsupported under the Cloudflare adapter; serve `dist/` statically instead. |
| `npm run rss:sync` | `node tools/rss-to-listmonk.mjs` | Newsletter RSS sync; see [listmonk-rss-automation.md](./listmonk-rss-automation.md). |

Node: use `>=20.3.0` (`engines.node` in `package.json`); CI pins Node `20`
(`.github/workflows/rss-to-listmonk.yml`). There is no `.nvmrc`.

### Static output & the Cloudflare adapter

`astro.config.mjs` sets `output: 'static'` and `adapter: cloudflare()`. A
build-time Vite plugin (`siteHostCssPlugin`, `astro.config.mjs`) replaces the
`__SITE_HOST__` sentinel in CSS with the hostname derived from `site.url`, so
you change `site.url`, never the CSS. Bump `faviconVersion` in
`src/components/common/BaseHead.astro` whenever you change a favicon; it
cache-busts the `<link>` tags.

### Worker/runtime config (`wrangler.jsonc`)

| Field | Value | Meaning |
| ----- | ----- | ------- |
| `name` | your Cloudflare project/worker name | Set per project; do not copy another project's name. |
| `main` | `dist/_worker.js/index.js` | Worker entry emitted by the adapter. |
| `compatibility_date` | `2026-02-05` | Workers runtime compatibility date. |
| `compatibility_flags` | `nodejs_compat`, `global_fetch_strictly_public` | Node compatibility plus outbound-fetch hardening. |
| `assets.binding` | `ASSETS` | Static-assets binding name. |
| `assets.directory` | `./dist` | Directory served as static assets. |
| `observability.enabled` | `true` | Worker logging and observability. |

### Deploy to Cloudflare

Anchor for sibling docs: `#deploy-to-cloudflare`.

The site deploys as a static build to Cloudflare. The build command
(`npm run build`), output directory (`dist/`), and the Node version used by
Cloudflare are set in the Cloudflare dashboard (Pages/Workers project settings);
they are not stored in this repo. In-repo, the deploy surface is
`wrangler.jsonc` (above) and the Cloudflare adapter in `astro.config.mjs`.

## Demo audio licensing

Template demos may ship with openly licensed or public-domain audio so score
and audio components have realistic examples. Replace demo recordings before
publishing a commercial, client, or substantially modified site unless your use
fits the recorded license. Retain attribution - for example in asset credits or
a `NOTICE` file if you add one - for any Creative Commons BY-SA or BY-NC-ND
assets you keep. A BY-NC-ND track must be replaced for commercial use or
modified derivatives.

## RSS to listmonk workflow

The workflow `.github/workflows/rss-to-listmonk.yml` runs on blog pushes
to `main` and sends feed items to listmonk. It fails without the required
listmonk secrets. If you use listmonk, configure the secrets named by
`docs/listmonk-rss-automation.md`; otherwise delete or disable the workflow
before your first blog push.

## What is *not* here

- **Content** - posts, projects, garden notes, and the about/resume
  pages under `src/content/**` are *swapped wholesale* when templating, not
  parameterized. Their identity strings are content, not config.
- **Visual theme** - type scale, palette, and fonts are documented separately
  in [theming.md](./theming.md).

## Re-skin checklist

1. Edit `src/config/site.mjs` - `name`, `social`, `meta`, `feeds`, and the
   hero/URL fields documented in that file.
2. Edit `src/config/collections.mjs` - rename/reorder/hide sections, set
   nav/homepage/feed membership, and relabel taxonomies.
3. Replace the assets the config points at: `public/portrait.jpg`,
   `public/og-image.png`, favicons, and any demo media you keep.
4. Edit `src/data/resume.ts` and replace all seven resume exports.
5. Copy `.env.example` to `.env` and set `RSS_FEED_URL` + `LISTMONK_FROM_EMAIL`
   (and the listmonk/recaptcha secrets).
6. Decide whether to configure or remove `.github/workflows/rss-to-listmonk.yml`.
7. Swap the content under `src/content/**`.
8. (Optional) Retune type/color/fonts via [theming.md](./theming.md).
9. Run `npm install && npm run build` and verify.
