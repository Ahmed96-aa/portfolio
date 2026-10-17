import type { Localized } from '../i18n/types.ts';

/**
 * ─────────────────────────────────────────────────────────────
 *  SITE & PROFILE CONFIGURATION — edit these values.
 *  Empty strings hide the related UI rather than faking it.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  /** Absolute production URL, no trailing slash. Enables canonical, hreflang, og:url, sitemap and JSON-LD. */
  url: 'https://dev-ahmed.pages.dev',
  /** 1200×630 Open Graph images per language (files in /public). */
  ogImage: { en: '/og-en.jpg', ar: '/og-ar.jpg' } as Localized,
  /** Google Search Console "HTML tag" verification code (only the content value). Empty adds nothing. */
  googleVerification: '',
  /** Cloudflare Web Analytics token. Not needed when analytics is switched on in the Cloudflare Pages dashboard. */
  cloudflareAnalyticsToken: '',
};

export interface SocialLink {
  id: 'telegram' | 'instagram' | 'linkedin' | 'github';
  label: Localized;
  handle: string;
  href: string;
}

export const profile = {
  name: { en: 'Ahmed Abbas Ashour', ar: 'أحمد عباس عاشور' } as Localized,
  shortName: { en: 'Ahmed Ashour', ar: 'أحمد عاشور' } as Localized,
  title: { en: 'Full-Stack Developer & Technical Lead', ar: 'مطوّر Full-Stack وقائد تقني' } as Localized,
  location: { en: 'Baghdad, Iraq', ar: 'بغداد، العراق' } as Localized,
  /** IANA time zone used for the live local clock. */
  timeZone: 'Asia/Baghdad',
  /** Public contact email: the email link, the copy button and the mailto fallback of the form. */
  email: 'ahmedabbasam7@gmail.com',
  /** WhatsApp number in international format, digits only. The number itself is never displayed. Empty hides it. */
  whatsapp: '9647712714443',
  /** Shows the "available for new projects" status. Set to false when fully booked. */
  available: true,
  /** Public CV per language (files in /public). Empty hides every download link on that language's page. */
  cv: { en: '/Ahmed-Abbas-Ashour-CV.pdf', ar: '/Ahmed-Abbas-Ashour-CV-ar.pdf' } as Localized,
  /**
   * Form endpoint that accepts JSON POSTs (Formspree). When empty, the form opens the visitor's
   * email app with the request ready instead.
   */
  formEndpoint: 'https://formspree.io/f/mrpeoqzp',
  /** Add LinkedIn / GitHub in the same shape when they exist. Never invent accounts. */
  socials: [
    { id: 'telegram', label: { en: 'Telegram', ar: 'تيليجرام' }, handle: '@dev_ahmed', href: 'https://t.me/dev_ahmed' },
    {
      id: 'instagram',
      label: { en: 'Instagram', ar: 'إنستغرام' },
      handle: '@dev_ahmed96',
      href: 'https://www.instagram.com/dev_ahmed96/',
    },
  ] as SocialLink[],
};

/** The core stack, set as one quiet spec line under the hero lead (kept out of the prose, so the
 *  Arabic sentence is not broken up by Latin names). */
export const heroStack = ['C#', 'ASP.NET Core', 'React', 'SQL'];

/** The technologies in the moving band under the hero. */
export const marquee = [
  'C#',
  'ASP.NET Core',
  'React',
  'Next.js',
  'SQL Server',
  'PostgreSQL',
  'MySQL',
  'Node.js',
  'Express',
  'REST APIs',
  'JWT',
  'Python',
  'Telegram Bot API',
];
