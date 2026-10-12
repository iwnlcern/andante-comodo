// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { site } from './src/config/site.mjs';
import { siteHost } from './src/lib/config/site.mjs';
import {
  blogRouteFromEntryId,
  unlistedBlogSlugs,
} from './src/lib/content/unlisted-slugs.mjs';
import {
  remarkMultilineBlockquote,
  rehypeFigures,
  rehypeFigureCredits,
  rehypeDirectives,
  rehypeTableQuotes,
  rehypeAdmonitions,
  rehypeHeadingAnchors,
  rehypeCollapsibles,
  rehypeMermaid,
  rehypeSidenotes,
} from './src/lib/rehype-plugins.mjs';

// Unlisted posts build normally but must not be advertised: the scanner
// (fail-closed; see unlisted-slugs.mjs) feeds the sitemap filter. Comparison
// is trailing-slash-insensitive so a trailingSlash config change cannot
// silently re-leak URLs. The filter receives full absolute page URLs.
const stripTrailingSlash = (url) => url.replace(/\/+$/, '');
const unlistedUrls = new Set(
  unlistedBlogSlugs().map((slug) =>
    stripTrailingSlash(new URL(blogRouteFromEntryId(slug), site.url).href)
  )
);

/**
 * Replace the external-link host sentinel in compiled CSS.
 *
 * Deliberately a normal-order transform: it runs after Vite's CSS plugin has inlined the
 * @import-ed partials (an `enforce: 'pre'` hook only ever sees the bare @import lines) and
 * before minification. The minifier unquotes [href*="__SITE_HOST__"] because the sentinel
 * is a valid CSS identifier; a dotted host dropped into that unquoted slot is an invalid
 * selector, and browsers then discard the whole rule. Substituting first hands the
 * minifier a value it has to keep quoted.
 */
function siteHostCssPlugin() {
  const host = siteHost;
  const sentinel = '__SITE_HOST__';

  return {
    name: 'site-host-css-inject',
    transform(code, id) {
      if (!/\.css(?:$|\?)/.test(id) || !code.includes(sentinel)) return null;
      return { code: code.replaceAll(sentinel, host), map: null };
    },
    // Fail closed: a sentinel in the bundle means the transform no longer sees that
    // stylesheet, and replacing it here (after minification) is the bug described above.
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || typeof asset.source !== 'string') continue;
        if (asset.source.includes(sentinel)) {
          this.error(
            `${sentinel} reached ${asset.fileName} unreplaced: siteHostCssPlugin's transform did not run on its stylesheet.`,
          );
        }
      }
    },
  };
}

export default defineConfig({
  site: site.url,
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !unlistedUrls.has(stripTrailingSlash(page)) }),
    tailwind(),
  ],
  adapter: cloudflare(),
  output: 'static',
  vite: {
    plugins: [siteHostCssPlugin()],
    // OG cards are prerendered in Node. Keep resvg's platform-native binary
    // external so Vite does not try to parse the .node file as JavaScript.
    ssr: { external: ['@resvg/resvg-js'] },
  },
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    remarkPlugins: [remarkMultilineBlockquote, remarkMath],
    rehypePlugins: [
      rehypeTableQuotes,
      rehypeFigures,
      rehypeFigureCredits,
      rehypeDirectives,
      rehypeAdmonitions,
      rehypeHeadingAnchors,
      rehypeCollapsibles,
      rehypeMermaid,
      [rehypeKatex, { throwOnError: false }],
      rehypeSidenotes,
    ],
  },
});
