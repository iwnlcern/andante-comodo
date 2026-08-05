import { getCollection } from 'astro:content';
import { fullFeedHtml } from './feed-html.mjs';
import { listable } from './listable.mjs';

interface FeedCollection {
  id: string;
  slug: string;
}

/** Build summary-only RSS items for a feed-enabled collection. */
export async function itemsForCollection(entry: FeedCollection) {
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

/** Build rendered, full-content RSS items for a feed-enabled collection. */
export async function fullItemsForCollection(entry: FeedCollection, siteUrl: string) {
  switch (entry.id) {
    case 'blog': {
      const blog = await getCollection('blog', listable);
      return blog.map((post) => {
        const link = `${entry.slug}/${post.id}/`;
        return {
          title: post.data.title,
          pubDate: post.data.date,
          description: post.data.description,
          link,
          content: fullFeedHtml({
            html: post.rendered?.html,
            fallback: post.data.description,
            entryId: `blog/${post.id}`,
            baseUrl: new URL(link, siteUrl),
          }),
        };
      });
    }
    case 'garden': {
      const garden = await getCollection('garden');
      return garden.map((note) => {
        const link = `${entry.slug}/${note.id}/`;
        return {
          title: note.data.title,
          pubDate: note.data.date,
          description: `${note.data.type}: ${note.data.title}`,
          link,
          content: fullFeedHtml({
            html: note.rendered?.html,
            fallback: `${note.data.type}: ${note.data.title}`,
            entryId: `garden/${note.id}`,
            baseUrl: new URL(link, siteUrl),
          }),
        };
      });
    }
    default:
      return [];
  }
}
