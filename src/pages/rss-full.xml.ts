import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '#config/site.mjs';
import { feedCollections } from '#lib/content/collection-registry.mjs';
import { fullItemsForCollection } from '#lib/content/feed-items';

export async function GET(context: APIContext) {
  const lists = await Promise.all(
    feedCollections().map((collection) => fullItemsForCollection(collection, context.site!.toString())),
  );
  const items = lists.flat().sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: `${site.feeds.title} — Full content`,
    description: site.feeds.description,
    site: context.site!,
    items,
  });
}
