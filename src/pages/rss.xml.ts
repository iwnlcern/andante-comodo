import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '#config/site.mjs';
import { feedCollections } from '#lib/content/collection-registry.mjs';

// The registry controls which collections appear and in what order. Item shape
// stays bespoke per collection, and links derive from each canonical slug.
async function itemsForCollection(entry: { id: string; slug: string }) {
  switch (entry.id) {
    case 'blog': {
      const blog = await getCollection('blog', ({ data }) => !data.draft);
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
  const lists = await Promise.all(feedCollections().map(itemsForCollection));
  const items = lists.flat().sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: site.feeds.title,
    description: site.feeds.description,
    site: context.site!,
    items,
  });
}
