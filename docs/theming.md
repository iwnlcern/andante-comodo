# Theming

This site's type, color, and font system is designed to be **retuned by a
stranger** without touching layout code. This guide is the source of truth for
the theme control surface.

> **Changing your name, links, nav, or metadata?** Those identity settings
> live in [template-config.md](./template-config.md), not here — this guide
> covers only type, color, and fonts.

> **One rule of thumb:** *edit CSS variables for runtime size; edit the Tailwind
> config for scale shape.* Sizes (`--ui-base`, `--prose-size`, `--measure`) are
> runtime CSS custom properties. The *ratio between* the UI type steps is a
> build-time constant in `tailwind.config.mjs`.

## Control surface

Four files own the theme. The first three carry a header comment pointing back
here; `typography.css` does not, so check this guide when editing it.

| File | Owns |
| ---- | ---- |
| `src/styles/global/tokens.css` | Runtime knobs: type sizes (`--prose-size`, `--ui-base`), reading measure (`--measure`), rhythm/line-height, flow-spacing + secondary-text tokens, and the `--font-*` roles. |
| `src/styles/global/base-layered.css` | The palette: every `--color-*`, `--accent-*`, and `--adm-*` token, dark (default) + light. |
| `tailwind.config.mjs` | The UI type-scale **shape** (`SCALE_RATIO` + per-step exponents/overrides), the color/font bridges into Tailwind utilities, and the breakpoint hook. |
| `src/styles/global/typography.css` | How the prose hierarchy is *applied*: heading `em`-ratios (`h1`/`h2`/`h3`), the prose flow-spacing rules that consume `--flow-*`/`--rhythm`, the résumé `.resume-base` second scale, and the scale-bypassing one-offs (`.entry-title`, `.hero-title`, `.error-code`). |

Supporting files referenced by the font-swap procedure: `src/styles/global/fonts.css`
(`@font-face`), `src/components/common/BaseHead.astro` (preloads), and
`src/config/breakpoints.mjs` (breakpoint SSOT).

## Runtime knobs (`tokens.css`)

| Variable | Default | What it does |
| -------- | ------- | ------------ |
| `--prose-size` | `1.375rem` | Reading body size for all content `.prose`. Headings are `em` ratios of it (`typography.css`), so the whole prose hierarchy scales from this one value. |
| `--ui-base` | `1.33rem` | Base size for everything else (chrome, home, collections). Every Tailwind `text-*` step is a ratio of this (see *Scale shape* below), so the whole UI scale resizes from here. |
| `--measure` | `50rem` | Reading column width. Sidenote/TOC gutter geometry derives from `--measure-half` (= `--measure / 2`) and the prose page cap is `calc(var(--measure) + 3rem)`, so changing this one value stays safe. |
| `--lh` | `1.7` | Prose line-height; `--rhythm` (= `1em * --lh`) is the vertical-rhythm unit. |
| `--flow-gap` / `--flow-above-heading` / `--flow-below-heading` | `0.85` / `0.5` / `0.35` | Multipliers of `--rhythm` for the three prose block-spacing relationships (gap between blocks, above a heading, below a heading). |
| `--code-scale` / `--note-scale` | `0.85em` / `0.9em` | Secondary text sizes (code, sidenotes), in `em` so they stay relative to surrounding prose. |

To make the whole site bigger/smaller, nudge `--ui-base` (and `--prose-size`
for the reading column). To make the reading column wider/narrower, change
`--measure` — the gutters follow.

### What is *not* a centralized knob

Prose flow, rhythm, and reading measure **are** centralized (the `--flow-*`,
`--rhythm`, and `--measure` knobs above). Beyond those, there is deliberately **no**
general `--space-*`, `--radius-*`, or `--font-weight-*` design-token family for
component chrome: component spacing and corner radius use Tailwind's default scale,
and font-weight is set per rule. If you want a different chrome rhythm, edit the
component or the Tailwind config — there is no single token to turn.

`tokens.css` also holds a token that is **not** part of the type/color/font
surface (e.g. `--ease-brake`, a motion-easing curve). Those are outside this guide's
remit; changing them affects animation, not the theme.

## Scale shape (`tailwind.config.mjs`)

The non-prose type scale is **generated**, not hand-typed. `SCALE_RATIO`
(`1.172`) is the ratio between adjacent steps. Each step in `TYPE_STEPS` has an
exponent and a line-height; the size is `--ui-base × SCALE_RATIO^exponent`
(`base` is exponent `0`, i.e. exactly `--ui-base`):

- **Generated from the ratio:** `xs`, `sm`, `base`, `4xl`.
- **Pinned overrides** (`TYPE_OVERRIDES`): `lg`, `xl`, `2xl`, `3xl` keep
  intentionally re-harmonized display multipliers instead of the pure ratio.

So there are two ways to reshape the UI scale:
- **Change the overall size** → edit `--ui-base` in `tokens.css` (runtime).
- **Change the step-to-step ratio** → edit `SCALE_RATIO` in `tailwind.config.mjs`
  (build-time; re-run `npm run build`). Adjust or remove a `TYPE_OVERRIDES` entry
  to let a pinned step fall back onto the pure ratio.

Prose headings are independent: they are `em` ratios of `--prose-size` defined in
`typography.css` (`h1` is a fluid `clamp`, `h2` `1.48em`, `h3` `1.12em`).

## Palette (`base-layered.css`)

Colors are stored as **space-separated RGB channels** (e.g. `19 15 10`), consumed
through `rgb(var(--color-…) / <alpha-value>)` so Tailwind opacity utilities work.
The dark theme is the `:root` default; the `:root[data-theme='light']` block
mirrors **every** token — edit both. Token groups:

- `--color-*` — surfaces, borders, text, the primary `--color-accent`.
- `--accent-*` — per-section accent colors (technical, slice-of-life, rants,
  project, work).
- `--adm-*` — admonition colors (tip / caution / danger).
- `--theme-outline-width` / `--theme-divider-width` / `--audio-control-filter` —
  per-theme chrome tweaks.

To recolor the site, edit the triplets in **both** the dark and light blocks.

Prose text colors (body, headings, links, code, quotes) are **not** a separate
palette: they are wired from these same `--color-*` tokens through the Tailwind
`typography` plugin block in `tailwind.config.mjs` (the `--tw-prose-*` bridge), so
recoloring the tokens recolors prose automatically.

## Fonts

Font **roles** are CSS vars in `tokens.css`:

| Role | Default | Used for |
| ---- | ------- | -------- |
| `--font-display` | Bodoni Std | Headings, entry/hero titles. |
| `--font-serif` | EB Garamond | Body / reading text (and the `sans`/`mono` Tailwind aliases — see below). |
| `--font-code` | Comic Mono | Inline + fenced code. |

The résumé deliberately uses a separate **`dense`** family (Inter), defined
inline in `tailwind.config.mjs` rather than as a `--font-*` var. Its `@font-face`
loader still lives in `fonts.css` (only the family *stack* is inline in the
Tailwind config), so swapping the résumé face touches `fonts.css` too.

### Deliberate quirks

- **`sans` and `mono` are serif aliases.** In `tailwind.config.mjs`, both
  `font-sans` and `font-mono` map to `var(--font-serif)`. This is intentional:
  UI labels read as serif, and there is no sans body font. Real code uses the
  `code` role (`font-code` → `var(--font-code)`), not `font-mono`.
- **The résumé has its own type scale.** `src/pages/resume.astro` wraps the page
  in `.resume-base` + `font-dense`; `typography.css` overrides the `text-*`
  utilities under `.resume-base` back to stock Tailwind sizes (the rest of the
  site enlarges them). This keeps the résumé compact and printable. Leave it as
  is unless you specifically want to restyle the résumé.

### Font-swap procedure (4 files)

To replace a font (e.g. swap the display face), edit these four places:

1. **`src/styles/global/tokens.css`** — point the `--font-*` role at the new
   family name (keep a sensible fallback stack).
2. **`src/styles/global/fonts.css`** — add/replace the `@font-face` block(s) for
   the new family (the site self-hosts woff2/ttf under `public/fonts/`; add the
   file there too).
3. **`src/components/common/BaseHead.astro`** — update the `<link rel="preload">`
   tags if the new face is one of the two critical above-the-fold faces
   (currently EB Garamond body + Bodoni Std display).
4. **`tailwind.config.mjs`** — only if you are changing which role a Tailwind
   alias maps to (`sans`/`mono`/`display`/`serif`/`code`/`dense`).

> **Display-font file provenance.** The display font is brand/identity and
> licensed per repo: this template ships an open-licensed display face (libre Bodoni Moda) at
> `public/fonts/BodoniStd-Roman.woff2` — the filename is retained for compatibility.
> Treat the display font as yours to choose: supply your own `woff2`, point
> `--font-display` at it, and update the `@font-face` and preload as above.

> **Metric-tuned heading caveat.** The heading `em` ratios in `typography.css`
> (`.prose h1/h2/h3`, `.entry-title`, `.hero-title`, `.error-code`) were fitted to
> **Bodoni Std's** metrics (cap-height/x-height). A replacement `--font-display`
> with different metrics may look too large or too small at the same ratios —
> expect to re-tune those values after a display-font swap. Body-font swaps are
> usually safe because the reading size is the single `--prose-size` knob.

## Breakpoints

`src/config/breakpoints.mjs` is the single source of truth (plain `.mjs` so the
Node-loaded Tailwind config and the Vite-bundled browser scripts both import it):

| Name | px | Meaning |
| ---- | -- | ------- |
| `mobile` | `640` | Matches Tailwind's default `sm`; used as a max-width in `directives.css`. |
| `toc` | `1280` | Matches Tailwind's default `xl`; min-width for the TOC rail. |
| `sidenote` | `1366` | Custom wide-layout cutover where footnotes become sidenotes; exposed to Tailwind as the `sidenote` screen. |

Change a number here and both the CSS/JS layout logic and the Tailwind `sidenote`
screen stay in lockstep.
