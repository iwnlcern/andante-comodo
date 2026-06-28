// Single source of truth for layout breakpoints (px). Plain .mjs so the
// Node-loaded Tailwind config and Vite-bundled browser scripts can both import it.
// - mobile (640): matches Tailwind's default sm; used as a max-width in directives.css.
// - toc (1280): matches Tailwind's default xl; min-width for the TOC rail.
// - sidenote (1366): custom wide-layout cutover where footnotes become sidenotes.
export const BREAKPOINTS = {
  mobile: 640,
  toc: 1280,
  sidenote: 1366,
};
