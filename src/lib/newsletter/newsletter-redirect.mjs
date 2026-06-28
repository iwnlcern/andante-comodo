// Pure, node-importable helpers for the newsletter subscribe endpoint.
// Enforces same-origin redirects; the canonical post-path is derived from the
// primary feed collection instead of a hardcoded route, with root as the
// fallback when no primary feed exists.
import { primaryFeedCollection } from '#lib/content/collection-registry.mjs';

export function derivePostPath(primary) {
  if (!primary) return { postPrefix: null, fallbackPath: '/' };
  return { postPrefix: `${primary.slug}/`, fallbackPath: primary.slug };
}

export function redirectFallbackPath(primary = primaryFeedCollection()) {
  return derivePostPath(primary).fallbackPath;
}

const FALLBACK_PATH = redirectFallbackPath();

export function toRedirectUrl(request, payload) {
  const base = new URL(request.url);
  const referer = request.headers.get('referer');
  let redirectUrl;
  try {
    if (!referer) throw new Error('no referer');
    redirectUrl = new URL(referer, base.origin);
    if (redirectUrl.origin !== base.origin) {
      redirectUrl = new URL(FALLBACK_PATH, base.origin);
    }
  } catch {
    redirectUrl = new URL(FALLBACK_PATH, base.origin);
  }
  redirectUrl.searchParams.set('newsletter', payload.ok ? 'success' : 'error');
  return redirectUrl;
}
