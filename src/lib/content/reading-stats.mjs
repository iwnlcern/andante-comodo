const WORDS_PER_MINUTE = 200;

/**
 * Prose word count + reading time from a raw markdown/MDX body.
 * Code, MDX imports/expressions/components, math, and markup are excluded so
 * the count reflects reading, not code volume.
 * @param {string} body Raw entry body (no frontmatter).
 * @returns {{ words: number, minutes: number }}
 */
export function readingStats(body) {
  if (typeof body !== 'string' || body.length === 0) {
    return { words: 0, minutes: 1 };
  }

  const text = body
    .replace(/^---\n[\s\S]*?\n---\n/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/^[ \t]*(?:import|export)\s.*$/gm, ' ')
    .replace(/\{[\s\S]*?\}/g, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^[ \t]*:::.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { words, minutes };
}
