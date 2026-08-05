import type { APIRoute } from 'astro';
import { site } from '#config/site.mjs';

// Cloudflare's managed robots.txt (content signals / AI-bot rules) is
// prepended at the edge; this origin file carries the crawl policy the
// repo owns — most importantly the Sitemap pointer, which the managed
// block never includes.
const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', site.url).href}
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
