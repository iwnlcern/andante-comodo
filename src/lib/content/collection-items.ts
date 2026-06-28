import type { CollectionEntry } from 'astro:content';
import { accentVar, collectionById, taxonomyAccent } from '#lib/content/collection-registry.mjs';
import type { IndexItem, IndexSection } from './collection-index';

/** Registry entry for a fixed id; throws instead of producing undefined-prefixed hrefs. */
export function requiredCollection(id: string) {
  const entry = collectionById(id);
  if (!entry) throw new Error(`collections registry: missing required collection '${id}'`);
  return entry;
}

/** Newest-first by date. */
export const byDate = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

/**
 * Highest-rated first (missing rating sorts last), with a stable title/id
 * tiebreaker for deterministic output after content-cache rebuilds.
 */
export const byRating = (
  a: { id: string; data: { rating?: number; title: string } },
  b: { id: string; data: { rating?: number; title: string } },
) => {
  const rating = (b.data.rating ?? 0) - (a.data.rating ?? 0);
  if (rating !== 0) return rating;

  const title = a.data.title.localeCompare(b.data.title);
  return title !== 0 ? title : a.id.localeCompare(b.id);
};

export function blogItem(post: CollectionEntry<'blog'>): IndexItem {
  const blog = requiredCollection('blog');
  return {
    title: post.data.title,
    href: `${blog.slug}/${post.id}`,
    date: post.data.date,
    description: post.data.description,
    tags: post.data.tags,
    accent: taxonomyAccent('blog', post.data.category),
  };
}

export function projectItem(project: CollectionEntry<'projects'>): IndexItem {
  const projects = requiredCollection('projects');
  return {
    title: project.data.title,
    href: `${projects.slug}/${project.id}`,
    date: project.data.date,
    description: project.data.description,
    tags: project.data.tags,
    accent: accentVar(projects.accent),
  };
}

export function bookItem(book: CollectionEntry<'reading'>): IndexItem {
  const reading = requiredCollection('reading');
  return {
    title: book.data.title,
    href: `${reading.slug}/${book.id}`,
    tags: book.data.tags,
    rating: book.data.rating,
    highlight: book.data.rating === 6,
    meta: book.data.author ? `by ${book.data.author}` : undefined,
  };
}

export function articleItem(article: CollectionEntry<'reading'>): IndexItem {
  return {
    title: article.data.title,
    href: article.data.link,
    external: true,
    tags: article.data.tags,
    description: article.data.note,
  };
}

/** Drop sections with no items (the repeated `.filter(s => s.items.length > 0)`). */
export function dropEmptySections(sections: IndexSection[]): IndexSection[] {
  return sections.filter((section) => section.items.length > 0);
}
