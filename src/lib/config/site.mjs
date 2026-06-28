/**
 * Helpers + derived/validated values for the site identity config.
 * Pure logic; the editable data lives in #config/site.mjs. Plain .mjs (no
 * import.meta.env) so it imports into Astro/Vite, astro.config, bare Node, and tools/.
 */
import { site } from '#config/site.mjs';

if (site.url.endsWith('/')) throw new Error('site.url must not have a trailing slash');
const parsed = new URL(site.url);

/** Guard the value injected into the external-link CSS selector. */
export function assertSafeHost(host) {
  if (typeof host !== 'string' || host.length > 253 || !/^[a-z0-9.-]+$/.test(host)) {
    throw new Error(`Unsafe site host for CSS injection: ${String(host)}`);
  }
  return host;
}

/** Hostname (no port), derived from site.url and validated for CSS injection. */
export const siteHost = assertSafeHost(parsed.hostname);

/** Join the site origin with an absolute path. */
export function siteUrl(path = '/') {
  return new URL(path, site.url).toString();
}

/** True iff href parses and shares the site origin. */
export function isSiteOrigin(href) {
  try {
    return new URL(href).origin === parsed.origin;
  } catch {
    return false;
  }
}
