// Replaces the deprecated @astrojs/tailwind integration (unsupported on
// Astro 6): the same Tailwind 3 + autoprefixer PostCSS pass it used to inject.
// The @tailwind directives live in src/styles/global/base-layered.css.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
