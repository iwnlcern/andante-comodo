// The one predicate for "appears in enumerations" (homepage, blog index, tag
// pages, RSS feeds, and — via the sitemap scanner's mirror of the unlisted
// half — the sitemap). Route generation is NOT gated here: unlisted posts
// still build; drafts are gated separately in collection-paths.ts.
export function listable(entry) {
  return !entry.data.draft && !entry.data.unlisted;
}

// Detail-route visibility is deliberately broader than listability: unlisted
// posts keep their direct route, while drafts require the explicit build flag.
export function draftVisible(
  entry,
  { includeDrafts = process.env.INCLUDE_DRAFTS === 'true' } = {},
) {
  return includeDrafts || !entry.data.draft;
}
