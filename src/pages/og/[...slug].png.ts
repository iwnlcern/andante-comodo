import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '#config/site.mjs';
import { enabledCollections, taxonomyLabel } from '#lib/content/collection-registry.mjs';
import { draftVisible, listable } from '#lib/content/listable.mjs';
import { renderOgCard } from '#lib/og-card.mjs';
import { tagSlug } from '#lib/content/tag-slugs.mjs';

export const prerender = true;

type Card = {
  slug: string;
  title: string;
  kicker: string;
  detail?: string;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

export const getStaticPaths = (async () => {
  const cards: Card[] = [
    { slug: 'home', title: site.meta.homeTitle ?? site.name, kicker: 'Home', detail: site.meta.description },
    { slug: '404', title: 'Page not found', kicker: '404', detail: site.name },
    { slug: 'about', title: 'About', kicker: 'About', detail: site.name },
    { slug: 'about/website', title: 'About the Website', kicker: 'Colophon', detail: site.name },
    { slug: 'uses', title: 'Uses', kicker: 'Uses', detail: site.name },
    { slug: 'resume', title: 'Resume', kicker: 'Resume', detail: site.name },
  ];

  for (const collection of enabledCollections()) {
    cards.push({
      slug: collection.slug.replace(/^\//, ''),
      title: collection.label,
      kicker: collection.label,
      detail: collection.description,
    });
  }

  const [blog, projects, works, reading] = await Promise.all([
    getCollection('blog'),
    getCollection('projects'),
    getCollection('works'),
    getCollection('reading'),
  ]);

  const routableBlog = blog.filter(draftVisible);
  cards.push(...routableBlog.map((post) => ({
    slug: `blog/${post.id}`,
    title: post.data.title,
    kicker: taxonomyLabel('blog', post.data.category),
    detail: formatDate(post.data.date),
  })));
  const routableProjects = projects.filter(draftVisible);
  cards.push(...routableProjects.map((project) => ({
    slug: `projects/${project.id}`,
    title: project.data.title,
    kicker: 'Project',
    detail: formatDate(project.data.date),
  })));
  cards.push(...works.map((work) => ({
    slug: `works/${work.id}`,
    title: work.data.title,
    kicker: 'Work',
    detail: String(work.data.year),
  })));
  cards.push(...reading.map((entry) => ({
    slug: `reading/${entry.id}`,
    title: entry.data.title,
    kicker: 'Reading',
    detail: entry.data.type === 'book' ? entry.data.author : undefined,
  })));

  const visibleBlog = routableBlog.filter(listable);
  const tags = new Set([
    ...visibleBlog.flatMap((entry) => entry.data.tags),
    ...routableProjects.filter(listable).flatMap((entry) => entry.data.tags),
    ...reading.flatMap((entry) => entry.data.tags),
  ]);
  cards.push(...[...tags].map((tag) => ({
    slug: `tags/${tagSlug(tag)}`,
    title: `Posts tagged ${tag}`,
    kicker: 'Tag',
    detail: site.name,
  })));

  return cards.map((card) => ({
    params: { slug: card.slug },
    props: { card },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const card = props.card as Card;
  const png = await renderOgCard({ ...card, name: site.name });
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
