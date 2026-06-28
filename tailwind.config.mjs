// Relative path: Node-loaded Tailwind config cannot resolve the #config subpath alias.
import { BREAKPOINTS } from './src/config/breakpoints.mjs';

// ── THEME CONTROL SURFACE ───────────────────────────────────────────────
// This file owns the UI scale SHAPE: SCALE_RATIO + per-step exponents/overrides
// (sizes resize from --ui-base in tokens.css), plus the color/font bridges.
// Runtime size knobs + --font-* roles: src/styles/global/tokens.css
// Palette (--color-*): src/styles/global/base-layered.css
// Full guide: docs/theming.md
// ─────────────────────────────────────────────────────────────────────────
const SCALE_RATIO = 1.172;

const TYPE_STEPS = {
  xs: [-2, '1.47'],
  sm: [-1, '1.6'],
  base: [0, '1.57'],
  lg: [1, '1.5'],
  xl: [2, '1.4'],
  '2xl': [3, '1.28'],
  '3xl': [4, '1.21'],
  '4xl': [5, '1.15'],
};

const TYPE_OVERRIDES = {
  lg: 1.1064,
  xl: 1.2766,
  '2xl': 1.5319,
  '3xl': 1.8298,
};

// UI/content type scale provenance:
// - generated steps use SCALE_RATIO and resize from --ui-base;
// - override entries pin the existing intentionally re-harmonized display steps.
const fontSize = Object.fromEntries(
  Object.entries(TYPE_STEPS).map(([key, [step, lineHeight]]) => {
    const multiplier = TYPE_OVERRIDES[key] ?? Number(Math.pow(SCALE_RATIO, step).toFixed(4));
    const size = multiplier === 1 ? 'var(--ui-base)' : `calc(var(--ui-base) * ${multiplier})`;
    return [key, [size, lineHeight]];
  }),
);

const TYPE_SCALE_CLASSES = Object.keys(TYPE_STEPS).map((step) => `text-${step}`);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // Keep every scale utility emitted so the C1 generated-CSS proof always covers every step.
  safelist: TYPE_SCALE_CLASSES,
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'surface-contrast': 'rgb(var(--color-surface-contrast) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
      screens: {
        sidenote: `${BREAKPOINTS.sidenote}px`,
      },
      fontFamily: {
        // Font roles are defined as CSS vars in tokens.css so downstream bundles consume one contract.
        sans: 'var(--font-serif)',
        // mono is a DELIBERATE serif alias (UI labels read as serif); real code uses `code` (var(--font-code)).
        mono: 'var(--font-serif)',
        display: 'var(--font-display)',
        serif: 'var(--font-serif)',
        code: 'var(--font-code)',
        // Inter — reserved for the résumé, which keeps its own dense sans rather than the serif body.
        dense: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize,
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--color-text-primary) / 0.95)',
            '--tw-prose-headings': 'rgb(var(--color-text-primary) / 1)',
            '--tw-prose-links': 'rgb(var(--color-accent) / 1)',
            '--tw-prose-bold': 'rgb(var(--color-text-primary) / 1)',
            '--tw-prose-code': 'rgb(var(--color-text-primary) / 1)',
            '--tw-prose-pre-code': 'rgb(var(--color-text-primary) / 1)',
            '--tw-prose-pre-bg': 'rgb(var(--color-surface) / 1)',
            '--tw-prose-quotes': 'rgb(var(--color-text-secondary) / 1)',
            '--tw-prose-counters': 'rgb(var(--color-text-secondary) / 1)',
            '--tw-prose-bullets': 'rgb(var(--color-text-secondary) / 1)',
            '--tw-prose-hr': 'rgb(var(--color-border) / 1)',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
