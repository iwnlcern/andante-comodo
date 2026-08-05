const URL_ATTRIBUTE = /\b(href|src|poster)=(["'])(.*?)\2/gi;
const SRCSET_ATTRIBUTE = /\bsrcset=(["'])(.*?)\1/gi;

function absoluteUrl(value, baseUrl) {
  if (!value) return value;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Resolve document-relative URLs so rendered HTML remains portable in feed readers. */
export function absolutizeFeedHtml(html, baseUrl) {
  return html
    .replace(URL_ATTRIBUTE, (_match, attribute, quote, value) =>
      `${attribute}=${quote}${absoluteUrl(value, baseUrl)}${quote}`)
    .replace(SRCSET_ATTRIBUTE, (_match, quote, value) => {
      const candidates = value.split(',').map((candidate) => {
        const trimmed = candidate.trim();
        const separator = trimmed.search(/\s/);
        const url = separator === -1 ? trimmed : trimmed.slice(0, separator);
        const descriptor = separator === -1 ? '' : trimmed.slice(separator);
        return `${absoluteUrl(url, baseUrl)}${descriptor}`;
      });
      return `srcset=${quote}${candidates.join(', ')}${quote}`;
    });
}

/** Return rendered feed HTML, or a visible and diagnosed description fallback. */
export function fullFeedHtml({ html, fallback, entryId, baseUrl, warn = console.warn }) {
  if (html?.trim()) return absolutizeFeedHtml(html, baseUrl);

  warn(`[rss] ${entryId} has no rendered HTML; using description fallback.`);
  return `<p>${escapeHtml(fallback)}</p>`;
}
