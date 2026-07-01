/** Long-form, UTC date for the post meta row. */
export function formatMetaDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function utcDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Resolve the "Updated" date to display: manual frontmatter wins, else the git
 * date; shown only when it is a strictly later UTC calendar day than published.
 * @param {Date} published
 * @param {Date|null} manualUpdated
 * @param {Date|null} gitDate
 * @returns {Date | null}
 */
export function resolveUpdated(published, manualUpdated, gitDate) {
  const candidate = manualUpdated ?? gitDate ?? null;
  if (!candidate || !published) return null;
  return utcDay(candidate) > utcDay(published) ? candidate : null;
}

/** The 0–5 AI-involvement rubric (source of truth: the colophon table). */
const AI_LEVEL_NAMES = [
  'no AI',
  'AI-assisted research',
  'AI-edited',
  'human–AI collaboration',
  'AI-drafted, human-reviewed',
  'AI-generated',
];

/** The rubric "Meaning" column, kept in step with the colophon table. */
const AI_LEVEL_DESCRIPTIONS = [
  'No AI — written by hand (mechanical spell/grammar aside).',
  'AI for research, brainstorming, or feedback only; all published prose is human-written.',
  'AI polished human-written prose (grammar, phrasing, tightening); substance and structure are human.',
  'Meaningful portions were AI-drafted, then human-revised and verified.',
  'AI wrote most of the draft; a human edited, restructured, and fact-checked it.',
  'Substantially AI-generated, with little to no human review.',
];

/**
 * The rubric name for a 0–5 AI-involvement level.
 * @param {number} level
 * @returns {string}
 */
export function aiLevelName(level) {
  return AI_LEVEL_NAMES[level] ?? '';
}

/**
 * The rubric "Meaning" description for a 0–5 AI-involvement level.
 * @param {number} level
 * @returns {string}
 */
export function aiLevelDescription(level) {
  return AI_LEVEL_DESCRIPTIONS[level] ?? '';
}

/**
 * The glanceable AI-signal label used for the indicator's tooltip/aria-label,
 * e.g. `AI involvement: 3/5 — human–AI collaboration · Claude`. Tools and note
 * are appended when present. Null when there is no level to report.
 * @param {{ level?: number, tools?: string[], note?: string }} ai
 * @returns {string | null}
 */
export function aiSignalLabel(ai) {
  if (!ai || typeof ai.level !== 'number') return null;
  const parts = [`AI involvement: ${ai.level}/5 — ${aiLevelName(ai.level)}`];
  if (ai.tools && ai.tools.length) parts.push(ai.tools.join(', '));
  if (ai.note) parts.push(ai.note);
  return parts.join(' · ');
}
