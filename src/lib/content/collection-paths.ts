import { getCollection } from 'astro:content';
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { collectionById } from '#lib/content/collection-registry.mjs';

type PathOpts<K extends CollectionKey> = {
  /** Prop key the detail route destructures (e.g. 'post', 'note', 'work', 'book', 'project'). */
  propKey: string;
  /** Optional entry filter (e.g. reading: type === 'book'). */
  filter?: (entry: CollectionEntry<K>) => boolean;
  /** When true, include drafts iff INCLUDE_DRAFTS=true (blog only). */
  draftGated?: boolean;
};

/** getStaticPaths helper: one path per entry, slug = entry.id, props keyed by propKey. */
export async function collectionPaths<K extends CollectionKey>(name: K, opts: PathOpts<K>) {
  if (!collectionById(name)?.enabled) return [];

  // Baked in via vite.define (astro.config.mjs): prerendering runs in workerd
  // under the cloudflare adapter, so process.env is not available here.
  const includeDrafts = import.meta.env.INCLUDE_DRAFTS === 'true';
  const entries = await getCollection(name, (entry: CollectionEntry<K>) => {
    if (opts.draftGated && !includeDrafts && (entry.data as { draft?: boolean }).draft) return false;
    return opts.filter ? opts.filter(entry) : true;
  });
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { [opts.propKey]: entry } as Record<string, CollectionEntry<K>>,
  }));
}
