/**
 * Built routes end in "/" (directory output); links that omit it cost a 308
 * on every crawl hop and never point at the canonical URL. Normalize the path
 * part of bare internal route hrefs — fragments and queries are preserved;
 * external URLs and file paths (with extensions) pass through untouched.
 */
export function withTrailingSlash(href) {
  if (!href.startsWith('/')) return href;
  const [, path, suffix] = href.match(/^([^#?]*)([\s\S]*)$/);
  if (path === '' || path.endsWith('/')) return href;
  if (/\.[a-z0-9]+$/i.test(path)) return href;
  return `${path}/${suffix}`;
}
