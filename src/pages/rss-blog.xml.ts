import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '#config/site.mjs';
import { primaryFeedCollection } from '#lib/content/collection-registry.mjs';
import { listable } from '#lib/content/listable.mjs';

// Bespoke item builder for the primary feed collection. Links derive from the
// collection's canonical slug, and a missing primary yields an empty feed.
async function itemsForCollection(entry: { id: string; slug: string }) {
  switch (entry.id) {
    case 'blog': {
      const blog = await getCollection('blog', listable);
      return blog.map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `${entry.slug}/${post.id}/`,
      }));
    }
    case 'garden': {
      const garden = await getCollection('garden');
      return garden.map((note) => ({
        title: note.data.title,
        pubDate: note.data.date,
        description: `${note.data.type}: ${note.data.title}`,
        link: `${entry.slug}/${note.id}/`,
      }));
    }
    default:
      return [];
  }
}

export async function GET(context: APIContext) {
  const primary = primaryFeedCollection();
  const items = primary
    ? (await itemsForCollection(primary)).sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
    : [];

  return rss({
    title: site.feeds.title,
    description: site.feeds.blogDescription,
    site: context.site!,
    items,
  });
}
