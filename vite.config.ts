import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { siteMeta } from './src/i18n/meta.ts';
import { profile, site } from './src/content/site.ts';
import type { Lang } from './src/i18n/types.ts';

/** schema.org Person, so search engines can read who the site is about. */
function personJsonLd(lang: Lang, url: string, description: string) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name.en,
    alternateName: profile.name.ar,
    jobTitle: profile.title[lang],
    description,
    ...(url ? { url } : {}),
    ...(site.url && site.ogImage[lang] ? { image: `${site.url}${site.ogImage[lang]}` } : {}),
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Baghdad', addressCountry: 'IQ' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Technology, Iraq' },
    knowsAbout: ['C#', 'ASP.NET Core', 'React', 'Next.js', 'SQL Server', 'PostgreSQL', 'MySQL', 'Node.js', 'REST APIs', 'Data Security'],
    knowsLanguage: ['ar', 'en'],
    sameAs: profile.socials.map((social) => social.href),
  };
  return `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`;
}

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Injects localized <title>, description, Open Graph, canonical and hreflang tags
 * into each HTML entry point, so crawlers and link previews get the right language
 * without server-side rendering. The source of truth is src/i18n/meta.ts.
 */
function localizedHead(): Plugin {
  return {
    name: 'localized-head',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const lang: Lang = ctx.path.startsWith('/ar') ? 'ar' : 'en';
        const other: Lang = lang === 'ar' ? 'en' : 'ar';
        const meta = siteMeta[lang];
        const pathFor = (l: Lang) => (l === 'ar' ? '/ar/' : '/');
        const tags = [
          `<title>${escape(meta.title)}</title>`,
          `<meta name="description" content="${escape(meta.description)}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="${escape(meta.siteName)}" />`,
          `<meta property="og:title" content="${escape(meta.title)}" />`,
          `<meta property="og:description" content="${escape(meta.description)}" />`,
          `<meta property="og:locale" content="${meta.ogLocale}" />`,
          `<meta property="og:locale:alternate" content="${siteMeta[other].ogLocale}" />`,
          `<meta name="twitter:card" content="${site.ogImage[lang] ? 'summary_large_image' : 'summary'}" />`,
        ];
        if (site.url) {
          tags.push(
            `<link rel="canonical" href="${site.url}${pathFor(lang)}" />`,
            `<link rel="alternate" hreflang="en" href="${site.url}/" />`,
            `<link rel="alternate" hreflang="ar" href="${site.url}/ar/" />`,
            `<link rel="alternate" hreflang="x-default" href="${site.url}/" />`,
            `<meta property="og:url" content="${site.url}${pathFor(lang)}" />`,
          );
        }
        if (site.ogImage[lang]) {
          const img = site.ogImage[lang].startsWith('http') ? site.ogImage[lang] : `${site.url}${site.ogImage[lang]}`;
          tags.push(
            `<meta property="og:image" content="${escape(img)}" />`,
            `<meta property="og:image:width" content="1200" />`,
            `<meta property="og:image:height" content="630" />`,
            `<meta property="og:image:alt" content="${escape(meta.title)}" />`,
          );
        }
        tags.push(personJsonLd(lang, site.url ? `${site.url}${pathFor(lang)}` : '', meta.description));
        if (site.googleVerification) {
          tags.push(`<meta name="google-site-verification" content="${escape(site.googleVerification)}" />`);
        }
        if (site.cloudflareAnalyticsToken) {
          const beacon = escape(JSON.stringify({ token: site.cloudflareAnalyticsToken }));
          tags.push(
            `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="${beacon}"></script>`,
          );
        }
        return html.replace('<!--localized-head-->', tags.join('\n    '));
      },
    },
  };
}

/**
 * Emits robots.txt, and sitemap.xml with both language pages once site.url is set
 * (sitemaps need absolute URLs, so without a domain only robots.txt is written).
 */
function seoFiles(): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /'];
      if (site.url) robots.push('', `Sitemap: ${site.url}/sitemap.xml`);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });
      if (!site.url) return;

      const today = new Date().toISOString().slice(0, 10);
      const alternates = [
        `<xhtml:link rel="alternate" hreflang="en" href="${site.url}/"/>`,
        `<xhtml:link rel="alternate" hreflang="ar" href="${site.url}/ar/"/>`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/"/>`,
      ].join('\n    ');
      const entry = (path: string) =>
        `  <url>\n    <loc>${site.url}${path}</loc>\n    <lastmod>${today}</lastmod>\n    ${alternates}\n  </url>`;
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        entry('/'),
        entry('/ar/'),
        '</urlset>',
        '',
      ].join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

export default defineConfig({
  plugins: [react(), localizedHead(), seoFiles()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ar: resolve(import.meta.dirname, 'ar/index.html'),
      },
    },
  },
});