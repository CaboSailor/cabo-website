// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://cabosailing.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
        },
      },
      filter: (page) => !/\/(thank-you|sitemap)\/?$/.test(page),
      serialize(item) {
        if (item.links && item.links.length > 0) {
          const enLink = item.links.find((l) => l.lang === 'en');
          if (enLink && !item.links.some((l) => l.lang === 'x-default')) {
            item.links.push({ url: enLink.url, lang: 'x-default' });
          }
        }
        return item;
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
