import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '#config/site.mjs';
import { primaryFeedCollection } from '#lib/content/collection-registry.mjs';
import { fullItemsForCollection } from '#lib/content/feed-items';

export async function GET(context: APIContext) {
  const primary = primaryFeedCollection();
  const items = primary
    ? (await fullItemsForCollection(primary, context.site!.toString()))
        .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
    : [];

  return rss({
    title: `${site.feeds.title} — Full content`,
    description: site.feeds.blogDescription,
    site: context.site!,
    items,
  });
}
