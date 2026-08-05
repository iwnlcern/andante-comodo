/** Canonical URL slug for a tag: lowercase, single hyphens for whitespace runs. */
export const tagSlug = (tag) => tag.trim().toLowerCase().replace(/\s+/g, '-');

/** Canonical tag-page route (trailing slash matches the built output). */
export const tagHref = (tag) => `/tags/${tagSlug(tag)}/`;

/** Two display tags mapping to one slug would silently merge pages — fail the build instead. */
export function assertNoSlugCollisions(tags) {
  const bySlug = new Map();
  for (const tag of tags) {
    const slug = tagSlug(tag);
    const seen = bySlug.get(slug);
    if (seen !== undefined && seen !== tag) {
      throw new Error(`Tag slug collision: "${seen}" and "${tag}" both map to "${slug}"`);
    }
    bySlug.set(slug, tag);
  }
}
