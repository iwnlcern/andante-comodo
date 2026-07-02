import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared metadata fields used by both `blog` posts and standalone `pages`, so
// the two schemas can't drift. A one-line epistemic-status note and an
// AI-involvement disclosure (0–5 rubric on the colophon; optional tools/note).
const epistemicField = z.string().optional();
const aiField = z
  .object({
    level: z.number().int().min(0).max(5),
    tools: z.array(z.string()).optional(),
    note: z.string().optional(),
  })
  .optional();

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['technical', 'slice-of-life', 'rants']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    epistemic: epistemicField,
    ai: aiField,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    github: z.string().url().optional(),
    live: z.string().url().optional(),
  }),
});

const garden = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/garden' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['til', 'resource', 'note']),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    year: z.union([z.number(), z.string()]),
    status: z.enum(['completed', 'in-progress']).default('completed'),
    audio: z.string().optional(),
    score: z.string().optional(),
    instrumentation: z.string().optional(),
    duration: z.string().optional(),
    description: z.string().optional(),
  }),
});

const reading = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reading' }),
  schema: z.discriminatedUnion('type', [
    z.object({
      title: z.string(),
      type: z.literal('book'),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      author: z.string().optional(),
      status: z.enum(['read', 'reading', 'want-to-read']).optional(),
      rating: z.number().min(1).max(6).optional(),
      link: z.never().optional(),
      note: z.never().optional(),
    }),
    z.object({
      title: z.string(),
      type: z.literal('article'),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      link: z.string().url(),
      note: z.string().optional(),
      author: z.never().optional(),
      status: z.never().optional(),
      rating: z.never().optional(),
    }),
  ]),
});

// Standalone long-form pages authored in the same Markdown format as blog posts
// (e.g. /about). Rendered directly by a page, not listed anywhere.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date().optional(),
    epistemic: epistemicField,
    ai: aiField,
  }),
});

export const collections = { blog, projects, garden, works, reading, pages };
