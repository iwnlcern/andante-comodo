// Pure, node-importable Listmonk helpers shared by the newsletter endpoint
// (src/pages/api/newsletter-subscribe.ts) and the RSS sync script
// (scripts/rss-to-listmonk.mjs). No ambient env reads; callers pass env in.

export function classifySubscriptionResponse(status, bodyText) {
  if (status >= 200 && status < 300) return 'ok';
  const text = String(bodyText ?? '').toLowerCase();
  if (text.includes('already subscribed') || text.includes('subscriber already exists')) {
    return 'already-subscribed';
  }
  if (text.includes('invalid email')) return 'invalid-email';
  return 'error';
}

export function getApiResults(payload) {
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && payload.data && Array.isArray(payload.data.results)) return payload.data.results;
  if (payload && payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export function canonicalizeListmonkEnv(sources, { emptyStringFallsThrough = false } = {}) {
  const list = Array.isArray(sources) ? sources : [sources];
  const usable = (value) => {
    if (value === undefined || value === null) return false;
    if (emptyStringFallsThrough && String(value).trim() === '') return false;
    return true;
  };
  const pick = (...keys) => {
    for (const source of list) {
      if (!source) continue;
      for (const key of keys) {
        if (usable(source[key])) return String(source[key]);
      }
    }
    return '';
  };
  const baseUrl = pick('LISTMONK_BASE_URL', 'LISTMONK_BASE').trim().replace(/\/+$/, '');
  const csv = pick('LISTMONK_LIST_UUIDS')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const single = pick('LIST_UUID').trim();
  const listUuids = csv.length ? csv : single ? [single] : [];
  return { baseUrl, listUuids };
}
