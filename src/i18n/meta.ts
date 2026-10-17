import type { Lang } from './types.ts';

export interface SiteMeta {
  title: string;
  description: string;
  siteName: string;
  ogLocale: string;
}

/** Document metadata per language. Descriptions stay within ~160 characters, where search results cut off.
 *  The name is already in the title, so the description spends its length on the work. Used at build time (vite.config.ts) and at runtime on language switch. */
export const siteMeta: Record<Lang, SiteMeta> = {
  en: {
    title: 'Ahmed Abbas Ashour — Full-Stack Developer & Technical Lead, Baghdad',
    description:
      'Full-stack developer in Baghdad building ERP, ticketing, tracking and automation systems: secure ASP.NET Core APIs, React interfaces and SQL databases. 7+ years',
    siteName: 'Ahmed Abbas Ashour',
    ogLocale: 'en_US',
  },
  ar: {
    title: 'أحمد عباس عاشور — مطوّر Full-Stack وقائد تقني، بغداد',
    description:
      'مطوّر Full-Stack في بغداد يبني أنظمة ERP والتذاكر والتتبّع والأتمتة: واجهات ASP.NET Core API آمنة، وواجهات React، وقواعد بيانات SQL. خبرة تزيد على ٧ سنوات.',
    siteName: 'أحمد عباس عاشور',
    ogLocale: 'ar_IQ',
  },
};
