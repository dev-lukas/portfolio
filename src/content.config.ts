import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Publication date. Markdown frontmatter dates are parsed by Zod's coerce.
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Minutes; shown in the post header. Hand-set so it stays honest.
    readingTime: z.number().optional(),
    // The accent used for the post's chrome (matches the site's accent tokens).
    accent: z.enum(['fire', 'blue', 'green', 'yellow']).default('green'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
