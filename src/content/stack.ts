import type { Localized } from '../i18n/types.ts';

export interface StackLayer {
  id: string;
  title: Localized;
  note: Localized;
  items: string[];
}

/**
 * The stack, from the CV plus what Ahmed confirmed (ASP.NET Core, React, Next.js, PostgreSQL),
 * ordered the way a request travels. Keep it to tools used in real work.
 */
export const stackLayers: StackLayer[] = [
  {
    id: 'interface',
    title: { en: 'Interface', ar: 'الواجهة' },
    note: { en: 'What people see and use.', ar: 'ما يراه الناس ويستخدمونه.' },
    items: ['React', 'Next.js', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Responsive design'],
  },
  {
    id: 'server',
    title: { en: 'Server', ar: 'الخادم' },
    note: { en: 'Where the rules live.', ar: 'حيث تعيش قواعد العمل.' },
    items: ['C#', 'ASP.NET Core Web API', 'Node.js', 'Express', 'REST APIs', 'JWT'],
  },
  {
    id: 'data',
    title: { en: 'Data', ar: 'البيانات' },
    note: { en: 'What must never be wrong.', ar: 'ما لا يجوز أن يخطئ أبدًا.' },
    items: ['SQL Server', 'PostgreSQL', 'MySQL', 'Schema design', 'Query optimization'],
  },
  {
    id: 'automation',
    title: { en: 'Automation', ar: 'الأتمتة' },
    note: { en: 'Work that runs by itself.', ar: 'عمل يُنجز نفسه بنفسه.' },
    items: ['Python', 'Telegram Bot API', 'AI integration'],
  },
];

export const practices: Localized<string[]> = {
  en: ['Project management', 'Technical supervision', 'Remote & distributed teams', 'Technical documentation', 'Continuous learning'],
  ar: ['إدارة المشاريع', 'الإشراف التقني', 'العمل عن بُعد ضمن فرق موزّعة', 'التوثيق التقني', 'التعلّم المستمر'],
};

export const practicesLabel: Localized = { en: 'Ways of working', ar: 'أسلوب العمل' };
