// Single source of truth for the theme localStorage key. Plain .mjs so the
// Vite-bundled scripts (theme.ts, BaseHead frontmatter) AND the Node-run e2e
// tests can all import it. De-personalized (was an owner-named key); renaming
// resets any previously-stored visitor preference once, which is accepted.
export const THEME_STORAGE_KEY = 'theme';
