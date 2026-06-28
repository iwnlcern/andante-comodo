/**
 * Collection registry: normalization + helpers over the raw roster.
 * The editable roster data lives in #config/collections.mjs. Plain .mjs (cross-runtime).
 */
import { collections as rawCollections, standalonePages } from '#config/collections.mjs';

const ACCENT_TOKENS = ['technical', 'slice-of-life', 'rants', 'project', 'work'];
const DEFAULT_ACCENT_TOKEN = 'technical';

/** Resolve a palette token key to its themed CSS custom property. */
export function accentVar(token) {
  if (!ACCENT_TOKENS.includes(token)) {
    throw new Error(`Unknown accent token "${String(token)}" (known: ${ACCENT_TOKENS.join(', ')})`);
  }
  return `rgb(var(--accent-${token}) / 1)`;
}

function humanize(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** Materialize defaults once, so consumers never see undefined for a defaulted field. */
function normalize(entry) {
  const slug = entry.slug ?? `/${entry.id}`;
  if (!slug.startsWith('/')) {
    throw new Error(`collection "${entry.id}": slug must be absolute (start with "/")`);
  }
  if (slug.length > 1 && slug.endsWith('/')) {
    throw new Error(`collection "${entry.id}": slug must not have a trailing slash`);
  }
  if (entry.accent !== undefined) accentVar(entry.accent);

  const taxonomy = Object.fromEntries(
    Object.entries(entry.taxonomy ?? {}).map(([key, value]) => [key, Object.freeze({ ...value })]),
  );
  for (const value of Object.values(taxonomy)) {
    if (value.accent !== undefined) accentVar(value.accent);
  }

  return Object.freeze({
    id: entry.id,
    label: entry.label ?? humanize(entry.id),
    description: entry.description ?? '',
    slug,
    enabled: entry.enabled ?? true,
    inNav: entry.inNav ?? false,
    home: Object.freeze({ show: entry.home?.show ?? false, limit: entry.home?.limit }),
    inFeed: entry.inFeed ?? false,
    accent: entry.accent,
    taxonomy: Object.freeze(taxonomy),
  });
}

/** The normalized, ordered roster. Helpers and consumers read this. */
export const collections = Object.freeze(rawCollections.map(normalize));

export { standalonePages };

export function collectionById(id, list = collections) {
  return list.find((c) => c.id === id);
}

export function enabledCollections(list = collections) {
  return list.filter((c) => c.enabled);
}

export function navCollections(list = collections) {
  return enabledCollections(list)
    .filter((c) => c.inNav)
    .map((c) => ({ label: c.label, href: c.slug }));
}

export function homeCollections(list = collections) {
  return enabledCollections(list).filter((c) => c.home.show);
}

export function feedCollections(list = collections) {
  return enabledCollections(list).filter((c) => c.inFeed);
}

export function primaryFeedCollection(list = collections) {
  return feedCollections(list)[0] ?? null;
}

export function taxonomyLabel(id, value, list = collections) {
  return collectionById(id, list)?.taxonomy?.[value]?.label ?? value;
}

export function taxonomyAccent(id, value, list = collections) {
  const entry = collectionById(id, list);
  const token = entry?.taxonomy?.[value]?.accent ?? entry?.accent ?? DEFAULT_ACCENT_TOKEN;
  return accentVar(token);
}
