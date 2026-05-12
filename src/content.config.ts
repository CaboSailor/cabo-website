import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const travelGuideSchema = z.object({
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
});

const travelGuide = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/travel-guide" }),
  schema: travelGuideSchema,
});

const travelGuideEs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/travel-guide-es" }),
  schema: travelGuideSchema,
});

export const collections = { 'travel-guide': travelGuide, 'travel-guide-es': travelGuideEs };
