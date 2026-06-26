import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    tools: z.array(z.string()).default([]),
    summary: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    coverImage: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const highlights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
  schema: z.object({
    image: z.string(),
    caption: z.string(),
    link: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, projects, highlights };
