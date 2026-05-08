import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.literal('Cendia Solutions'),
    category: z.string(),
    readingTime: z.number(),
    ogImage: z.string().optional(),
    canonical: z.string().url().optional(),
    keywords: z.array(z.string()).optional().default([]),
    relatedPosts: z.array(z.string()).optional().default([]),
    primaryFramework: z.string(),
  }),
});

export const collections = { blog };
