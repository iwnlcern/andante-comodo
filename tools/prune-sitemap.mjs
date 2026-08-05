// Postbuild sitemap hygiene. The rendered HTML is the single source of truth:
// any page carrying <meta name="robots" content="noindex"> is removed from the
// sitemap (a sitemap must not advertise pages that refuse indexing), and pages
// exposing article:modified_time / article:published_time get a <lastmod>.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const NOINDEX_RE = /<meta\s+name="robots"\s+content="noindex"/;
const MODIFIED_RE = /<meta\s+property="article:modified_time"\s+content="([^"]+)"/;
const PUBLISHED_RE = /<meta\s+property="article:published_time"\s+content="([^"]+)"/;

function pageFileFor(distDir, loc) {
  const pathname = new URL(loc).pathname;
  const relative = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  return join(distDir, relative, 'index.html');
}

export function pruneSitemap(distDir) {
  const removed = [];
  let stamped = 0;

  const chunks = readdirSync(distDir).filter((name) => /^sitemap-\d+\.xml$/.test(name));
  for (const chunk of chunks) {
    const path = join(distDir, chunk);
    const xml = readFileSync(path, 'utf8');
    const next = xml.replace(/<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>/g, (entry, loc) => {
      const file = pageFileFor(distDir, loc);
      if (!existsSync(file)) return entry;
      const html = readFileSync(file, 'utf8');
      if (NOINDEX_RE.test(html)) {
        removed.push(loc);
        return '';
      }
      const modified = html.match(MODIFIED_RE) ?? html.match(PUBLISHED_RE);
      if (modified) {
        stamped += 1;
        return `<url><loc>${loc}</loc><lastmod>${modified[1]}</lastmod></url>`;
      }
      return entry;
    });
    if (next !== xml) writeFileSync(path, next);
  }

  return { removed, stamped };
}

if (process.argv[1] && basename(process.argv[1]) === 'prune-sitemap.mjs') {
  const distDir = process.argv[2] ?? 'dist';
  const { removed, stamped } = pruneSitemap(distDir);
  console.log(`prune-sitemap: removed ${removed.length} noindexed URL(s), stamped ${stamped} lastmod(s)`);
}
