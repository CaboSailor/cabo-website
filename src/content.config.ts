import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const travelGuide = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/travel-guide" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    category: z.string(),
    categoryLink: z.string(),
    activeSubmenu: z.string(),
    bestTime: z.string().optional(),
    relatedActivity: z.string().optional(),
    sidebarType: z.enum(["default", "snorkeling"]).default("default"),
    hasBoatCards: z.boolean().default(false),
  }),
});

export const collections = { 'travel-guide': travelGuide };
