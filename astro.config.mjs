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

/** Replace the external-link host sentinel before and after CSS bundling. */
function siteHostCssPlugin() {
  const host = siteHost;
  const replaceHost = (code) => code.replaceAll('__SITE_HOST__', host);

  return {
    name: 'site-host-css-inject',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('base-layered.css')) return null;
      if (!code.includes('__SITE_HOST__')) return null;
      return { code: replaceHost(code), map: null };
    },
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset') continue;
        if (typeof asset.source !== 'string' || !asset.source.includes('__SITE_HOST__')) continue;
        asset.source = replaceHost(asset.source);
      }
    },
  };
}

export default defineConfig({
  site: site.url,
  integrations: [mdx(), sitemap(), tailwind()],
  adapter: cloudflare(),
  output: 'static',
  vite: { plugins: [siteHostCssPlugin()] },
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
