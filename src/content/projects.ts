import type { Localized } from '../i18n/types.ts';

/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS — edit freely, but only add verified facts.
 *  featured: true      → large case study; false → "More systems" list
 *  blueprint           → the architecture sketch shown instead of screenshots
 *                         (most systems are internal). Nodes marked `mine`
 *                         get the "In scope" mark — keep that honest.
 *  roles / owned       → shown as "Scope" and "Delivered": describe the work,
 *                         not the person (no "I"), and let the facts speak.
 *  media               → optional real screenshot; shown above the sketch when set
 * ─────────────────────────────────────────────────────────────
 */

export type NodeKind = 'actor' | 'app' | 'api' | 'db' | 'ext' | 'out' | 'ai';
export type Side = 'l' | 'r' | 't' | 'b';
/** [column, row] on the sketch grid. Wide: up to 4 columns. Tall (phones): up to 2 columns. */
export type Cell = readonly [number, number];

export interface BlueprintNode {
  id: string;
  kind: NodeKind;
  wide: Cell;
  tall: Cell;
  label: Localized;
  sub?: Localized;
  mine?: boolean;
}

export interface BlueprintEdge {
  from: string;
  to: string;
  label?: string;
  twoWay?: boolean;
  /** Optional port overrides per layout, as [from side, to side]. Mirrored automatically in Arabic. */
  wideSides?: readonly [Side, Side];
  tallSides?: readonly [Side, Side];
}

export interface Blueprint {
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

export interface ProjectMedia {
  src: string;
  width: number;
  height: number;
  alt: Localized;
}

export interface Project {
  id: string;
  name: Localized;
  category: Localized;
  headline: Localized;
  summary: Localized;
  roles: Localized<string[]>;
  owned: Localized<string[]>;
  stack: string[];
  featured: boolean;
  blueprint: Blueprint;
  media?: ProjectMedia;
  links: { live?: string; repo?: string };
}

const API = { en: 'ASP.NET Core API', ar: 'ASP.NET Core API' };
const SUPERVISION = { en: 'Project supervision through to delivery', ar: 'الإشراف على المشروع وتسليمه' };
const SUPERVISION_SCOPE = { en: ['Project supervision', 'API'], ar: ['الإشراف على المشروع', 'الـ\u00A0API'] };

export const projects: Project[] = [
  {
    id: 'opsiq',
    name: { en: 'OpsIQ', ar: 'OpsIQ' },
    category: { en: 'Enterprise · ERP', ar: 'نظام مؤسسي · ERP' },
    headline: {
      en: 'An integrated ERP — one system for an organization’s daily operations.',
      ar: 'نظام ERP متكامل — منصة واحدة لعمليات المؤسسة اليومية.',
    },
    summary: {
      en: 'OpsIQ brings an organization’s departments, records and workflows into a single source of truth: an ASP.NET Core API over SQL Server, and the React interface the teams work in.',
      ar: 'يجمع OpsIQ أقسام المؤسسة وسجلاتها وسير عملها في مصدر واحد موثوق للبيانات: واجهة ASP.NET Core API فوق SQL Server، وواجهة React التي تعمل عليها الفرق.',
    },
    roles: {
      en: ['Project management', 'API', 'Web interface'],
      ar: ['إدارة المشروع', 'الـ\u00A0API', 'واجهة الويب'],
    },
    owned: {
      en: [
        'Delivery planning and management, from requirements to launch',
        'The ASP.NET Core REST API, designed and built',
        'The React web interface on top of it',
      ],
      ar: [
        'تخطيط التسليم وإدارته من المتطلبات حتى الإطلاق',
        'تصميم وبناء واجهة REST API بتقنية ASP.NET Core',
        'بناء واجهة الويب بـ\u00A0React فوقها',
      ],
    },
    stack: ['C#', 'ASP.NET Core API', 'React', 'SQL Server'],
    featured: true,
    blueprint: {
      nodes: [
        { id: 'teams', kind: 'actor', wide: [0, 0], tall: [0, 0], label: { en: 'Teams', ar: 'الفرق' }, sub: { en: 'role-based access', ar: 'صلاحيات حسب الدور' } },
        { id: 'web', kind: 'app', wide: [1, 0], tall: [0, 1], label: { en: 'React web app', ar: 'تطبيق ويب React' }, sub: { en: 'screens · dashboards', ar: 'شاشات · لوحات' }, mine: true },
        { id: 'api', kind: 'api', wide: [2, 0], tall: [0, 2], label: API, sub: { en: 'auth · business rules', ar: 'مصادقة · قواعد العمل' }, mine: true },
        { id: 'db', kind: 'db', wide: [3, 0], tall: [1, 2], label: { en: 'SQL Server', ar: 'SQL Server' }, sub: { en: 'one source of truth', ar: 'مصدر واحد للبيانات' } },
        { id: 'reports', kind: 'out', wide: [2, 1], tall: [0, 3], label: { en: 'Reports', ar: 'التقارير' }, sub: { en: 'for decisions', ar: 'لاتخاذ القرار' } },
      ],
      edges: [
        { from: 'teams', to: 'web' },
        { from: 'web', to: 'api', label: 'REST', twoWay: true },
        { from: 'api', to: 'db', twoWay: true },
        { from: 'api', to: 'reports' },
      ],
    },
    links: {},
  },
  {
    id: 'tickets',
    name: { en: 'Ticket System', ar: 'نظام التذاكر' },
    category: { en: 'Central management', ar: 'إدارة مركزية' },
    headline: {
      en: 'A ticketing system that works as an organization’s central desk.',
      ar: 'نظام تذاكر يعمل مكتبًا مركزيًا لإدارة طلبات المؤسسة.',
    },
    summary: {
      en: 'Every request becomes a ticket that can be assigned, tracked and closed — nothing gets lost between people and departments, and management sees the whole picture in one place.',
      ar: 'كل طلب يتحوّل إلى تذكرة يمكن إسنادها ومتابعتها وإغلاقها، فلا يضيع شيء بين الأشخاص والأقسام، وترى الإدارة الصورة كاملة في مكان واحد.',
    },
    roles: SUPERVISION_SCOPE,
    owned: {
      en: [
        SUPERVISION.en,
        'The ASP.NET Core API behind every ticket',
        'The ticket lifecycle, modelled: open, assign, track, close',
      ],
      ar: [SUPERVISION.ar, 'بناء ASP.NET Core API الذي تمرّ عبره كل تذكرة', 'نمذجة دورة حياة التذكرة: فتح، إسناد، متابعة، إغلاق'],
    },
    stack: ['C#', 'ASP.NET Core API'],
    featured: true,
    blueprint: {
      nodes: [
        { id: 'req', kind: 'actor', wide: [0, 0], tall: [0, 0], label: { en: 'Requesters', ar: 'مقدّمو الطلبات' }, sub: { en: 'staff & departments', ar: 'موظفون وأقسام' } },
        { id: 'portal', kind: 'app', wide: [1, 0], tall: [0, 1], label: { en: 'Ticket portal', ar: 'بوابة التذاكر' }, sub: { en: 'open · follow up', ar: 'فتح · متابعة' } },
        { id: 'api', kind: 'api', wide: [2, 0], tall: [0, 2], label: API, sub: { en: 'assign · track · close', ar: 'إسناد · متابعة · إغلاق' }, mine: true },
        { id: 'db', kind: 'db', wide: [3, 0], tall: [1, 2], label: { en: 'Database', ar: 'قاعدة البيانات' }, sub: { en: 'ticket history', ar: 'سجل التذاكر' } },
        { id: 'team', kind: 'actor', wide: [2, 1], tall: [0, 3], label: { en: 'Assigned teams', ar: 'الفرق المكلّفة' }, sub: { en: 'resolve tickets', ar: 'تعالج التذاكر' } },
        { id: 'dash', kind: 'out', wide: [3, 1], tall: [1, 3], label: { en: 'Central dashboard', ar: 'لوحة مركزية' }, sub: { en: 'the full picture', ar: 'الصورة كاملة' } },
      ],
      edges: [
        { from: 'req', to: 'portal' },
        { from: 'portal', to: 'api', twoWay: true },
        { from: 'api', to: 'db', twoWay: true },
        { from: 'api', to: 'team', twoWay: true },
        { from: 'db', to: 'dash' },
      ],
    },
    links: {},
  },
  {
    id: 'tracking',
    name: { en: 'Map Tracking App', ar: 'تطبيق التتبّع على الخريطة' },
    category: { en: 'Mobile · Location tracking', ar: 'تطبيق هاتف · تتبّع المواقع' },
    headline: {
      en: 'The backend behind a mobile app that tracks and shares location on a map.',
      ar: 'النظام الخلفي لتطبيق هاتف يتتبّع الموقع ويرسله على الخريطة.',
    },
    summary: {
      en: 'The phone sends its location; the system receives it, stores it and serves it back, so positions can be followed on a map.',
      ar: 'يرسل الهاتف موقعه، فيستقبله النظام ويخزّنه ويعيد تقديمه لتُتابَع المواقع على الخريطة.',
    },
    roles: SUPERVISION_SCOPE,
    owned: {
      en: [SUPERVISION.en, 'The ASP.NET Core API that receives location updates and serves them back to the map'],
      ar: [SUPERVISION.ar, 'بناء الـ\u00A0API الذي يستقبل تحديثات الموقع ويعيد تقديمها للخريطة'],
    },
    stack: ['C#', 'ASP.NET Core API'],
    featured: true,
    blueprint: {
      nodes: [
        { id: 'phone', kind: 'app', wide: [0, 0], tall: [0, 0], label: { en: 'Mobile app', ar: 'تطبيق الهاتف' }, sub: { en: 'sends GPS location', ar: 'يرسل موقع GPS' } },
        { id: 'api', kind: 'api', wide: [1, 0], tall: [0, 1], label: API, sub: { en: 'location updates', ar: 'تحديثات الموقع' }, mine: true },
        { id: 'db', kind: 'db', wide: [2, 0], tall: [1, 1], label: { en: 'Database', ar: 'قاعدة البيانات' }, sub: { en: 'location history', ar: 'سجل المواقع' } },
        { id: 'map', kind: 'out', wide: [1, 1], tall: [0, 2], label: { en: 'Map view', ar: 'عرض الخريطة' }, sub: { en: 'positions on a map', ar: 'المواقع على الخريطة' } },
      ],
      edges: [
        { from: 'phone', to: 'api', label: 'GPS' },
        { from: 'api', to: 'db', twoWay: true },
        { from: 'api', to: 'map' },
      ],
    },
    links: {},
  },
  {
    id: 'news',
    name: { en: 'Tech News Monitor', ar: 'نظام رصد أخبار التقنية' },
    category: { en: 'AI · Automation', ar: 'ذكاء اصطناعي · أتمتة' },
    headline: {
      en: 'An AI bot that gathers tech news from several sources and publishes it to Telegram.',
      ar: 'بوت ذكاء اصطناعي يجمع أخبار التقنية من عدة مصادر وينشرها على تيليجرام.',
    },
    summary: {
      en: 'An AI-driven bot collects the latest technology news from several sources and publishes it to a Telegram channel automatically — no copying, pasting or posting by hand.',
      ar: 'بوت يعمل بالذكاء الاصطناعي يجمع آخر أخبار التقنية من عدة مصادر وينشرها تلقائيًا في قناة على تيليجرام، دون نسخ أو لصق أو نشر يدوي.',
    },
    roles: { en: ['Project supervision', 'Backend'], ar: ['الإشراف على المشروع', 'النظام الخلفي'] },
    owned: {
      en: [SUPERVISION.en, 'The backend that connects the AI model to the Telegram channel'],
      ar: [SUPERVISION.ar, 'بناء النظام الخلفي الذي يربط نموذج الذكاء الاصطناعي بقناة تيليجرام'],
    },
    stack: ['Python', 'AI', 'C#', 'Telegram Bot API'],
    featured: true,
    blueprint: {
      nodes: [
        { id: 'src', kind: 'ext', wide: [0, 0], tall: [0, 0], label: { en: 'News sources', ar: 'مصادر الأخبار' }, sub: { en: 'several sites', ar: 'عدة مواقع' } },
        { id: 'ai', kind: 'ai', wide: [1, 0], tall: [0, 1], label: { en: 'AI model', ar: 'نموذج ذكاء اصطناعي' }, sub: { en: 'Python · collects news', ar: 'Python · يجمع الأخبار' } },
        { id: 'backend', kind: 'api', wide: [2, 0], tall: [0, 2], label: { en: 'Backend', ar: 'النظام الخلفي' }, sub: { en: 'C# service', ar: 'خدمة ⁦C#⁩' }, mine: true },
        { id: 'tg', kind: 'out', wide: [3, 0], tall: [0, 3], label: { en: 'Telegram channel', ar: 'قناة تيليجرام' }, sub: { en: 'auto-published', ar: 'نشر تلقائي' } },
        { id: 'readers', kind: 'actor', wide: [3, 1], tall: [1, 3], label: { en: 'Readers', ar: 'القرّاء' }, sub: { en: 'subscribers', ar: 'المشتركون' } },
      ],
      edges: [
        { from: 'src', to: 'ai' },
        { from: 'ai', to: 'backend' },
        { from: 'backend', to: 'tg', label: 'Bot API' },
        { from: 'tg', to: 'readers' },
      ],
    },
    links: {},
  },
  {
    id: 'fieldtasks',
    name: { en: 'FieldTasks', ar: 'FieldTasks' },
    category: { en: 'Field operations', ar: 'عمليات ميدانية' },
    headline: { en: 'Field task management, from the office to the ground.', ar: 'إدارة المهام الميدانية، من المكتب إلى الميدان.' },
    summary: {
      en: 'Tasks are created and assigned from the office and followed through to completion by the teams on the ground, over an API integrated with other services.',
      ar: 'تُنشأ المهام وتُسند من المكتب، وتُتابَع حتى إنجازها من قِبل الفرق في الميدان، عبر API متكامل مع الخدمات الأخرى.',
    },
    roles: SUPERVISION_SCOPE,
    owned: {
      en: [SUPERVISION.en, 'The ASP.NET Core API and its service integrations'],
      ar: [SUPERVISION.ar, 'بناء ASP.NET Core API وتكامله مع الخدمات الأخرى'],
    },
    stack: ['C#', 'ASP.NET Core API', 'REST APIs', 'Service Integration'],
    featured: false,
    blueprint: {
      nodes: [
        { id: 'office', kind: 'actor', wide: [0, 0], tall: [0, 0], label: { en: 'Office', ar: 'المكتب' }, sub: { en: 'creates · assigns', ar: 'إنشاء · إسناد' } },
        { id: 'api', kind: 'api', wide: [1, 0], tall: [0, 1], label: { en: 'FieldTasks API', ar: 'FieldTasks API' }, sub: { en: 'tasks · status', ar: 'المهام · الحالة' }, mine: true },
        { id: 'field', kind: 'actor', wide: [2, 0], tall: [0, 2], label: { en: 'Field teams', ar: 'الفرق الميدانية' }, sub: { en: 'receive · update', ar: 'استلام · تحديث' } },
        { id: 'svc', kind: 'ext', wide: [1, 1], tall: [1, 1], label: { en: 'Integrated services', ar: 'خدمات متكاملة' }, sub: { en: 'REST integrations', ar: 'تكامل REST' } },
      ],
      edges: [
        { from: 'office', to: 'api' },
        { from: 'api', to: 'field', twoWay: true },
        { from: 'api', to: 'svc', twoWay: true },
      ],
    },
    links: {},
  },
  {
    id: 'interviews',
    name: { en: 'Job Interview System', ar: 'نظام المقابلات الوظيفية' },
    category: { en: 'Recruitment · Scientific Engineer Club', ar: 'التوظيف · نادي المهندس العلمي' },
    headline: {
      en: 'Applications and interviews for the Scientific Engineer Club, in one place.',
      ar: 'طلبات التوظيف والمقابلات لنادي المهندس العلمي في مكان واحد.',
    },
    summary: {
      en: 'An interview system for job applications at the Scientific Engineer Club: candidates apply, and the hiring side runs and records the interviews in one system.',
      ar: 'نظام مقابلات للتقديم على الوظائف لدى نادي المهندس العلمي: يتقدّم المرشحون، وتُدار المقابلات وتُوثَّق في نظام واحد.',
    },
    roles: SUPERVISION_SCOPE,
    owned: {
      en: [SUPERVISION.en, 'The ASP.NET Core API for applications and interviews'],
      ar: [SUPERVISION.ar, 'بناء ASP.NET Core API الخاص بالطلبات والمقابلات'],
    },
    stack: ['C#', 'ASP.NET Core API'],
    featured: false,
    blueprint: {
      nodes: [
        { id: 'apps', kind: 'actor', wide: [0, 0], tall: [0, 0], label: { en: 'Applicants', ar: 'المتقدّمون' }, sub: { en: 'apply for jobs', ar: 'التقديم على الوظائف' } },
        { id: 'portal', kind: 'app', wide: [1, 0], tall: [0, 1], label: { en: 'Application portal', ar: 'بوابة التقديم' }, sub: { en: 'forms · status', ar: 'نماذج · حالة الطلب' } },
        { id: 'api', kind: 'api', wide: [2, 0], tall: [0, 2], label: API, sub: { en: 'applications · interviews', ar: 'الطلبات · المقابلات' }, mine: true },
        { id: 'db', kind: 'db', wide: [3, 0], tall: [1, 2], label: { en: 'Database', ar: 'قاعدة البيانات' }, sub: { en: 'candidate records', ar: 'سجلات المرشحين' } },
        { id: 'panel', kind: 'actor', wide: [2, 1], tall: [0, 3], label: { en: 'Interview panel', ar: 'لجنة المقابلات' }, sub: { en: 'evaluates candidates', ar: 'تقييم المرشحين' } },
      ],
      edges: [
        { from: 'apps', to: 'portal' },
        { from: 'portal', to: 'api', twoWay: true },
        { from: 'api', to: 'db', twoWay: true },
        { from: 'api', to: 'panel', twoWay: true },
      ],
    },
    links: {},
  },
  {
    id: 'admin',
    name: { en: 'Administrative Systems', ar: 'الأنظمة الإدارية' },
    category: { en: 'Correspondence · Archiving · Custody', ar: 'مخاطبات · أرشفة · ذمم' },
    headline: {
      en: 'Correspondence, archiving and custody records — off paper, into systems.',
      ar: 'المخاطبات والأرشفة وسجلات الذمم، من الورق إلى أنظمة رقمية.',
    },
    summary: {
      en: 'A family of administrative systems for official correspondence, document archiving and custody records, replacing paper trails with organized digital records over one shared API.',
      ar: 'مجموعة أنظمة إدارية للمخاطبات الرسمية وأرشفة الوثائق وسجلات الذمم، تستبدل المسارات الورقية بسجلات رقمية منظّمة عبر API مشترك.',
    },
    roles: SUPERVISION_SCOPE,
    owned: {
      en: [SUPERVISION.en, 'The shared ASP.NET Core API behind the three systems'],
      ar: [SUPERVISION.ar, 'بناء ASP.NET Core API المشترك للأنظمة الثلاثة'],
    },
    stack: ['C#', 'ASP.NET Core API'],
    featured: false,
    blueprint: {
      nodes: [
        { id: 'mail', kind: 'app', wide: [0, 0], tall: [0, 0], label: { en: 'Correspondence', ar: 'المخاطبات' }, sub: { en: 'official letters', ar: 'كتب رسمية' } },
        { id: 'arch', kind: 'app', wide: [0, 1], tall: [0, 1], label: { en: 'Archive', ar: 'الأرشفة' }, sub: { en: 'documents', ar: 'الوثائق' } },
        { id: 'cust', kind: 'app', wide: [0, 2], tall: [0, 2], label: { en: 'Custody records', ar: 'سجلات الذمم' }, sub: { en: 'items in custody', ar: 'المواد بالعهدة' } },
        { id: 'api', kind: 'api', wide: [1, 1], tall: [1, 1], label: API, sub: { en: 'one shared API', ar: 'واجهة مشتركة' }, mine: true },
        { id: 'db', kind: 'db', wide: [2, 1], tall: [1, 2], label: { en: 'Database', ar: 'قاعدة البيانات' }, sub: { en: 'digital records', ar: 'سجلات رقمية' } },
      ],
      edges: [
        { from: 'mail', to: 'api', wideSides: ['r', 'l'], tallSides: ['r', 'l'] },
        { from: 'arch', to: 'api' },
        { from: 'cust', to: 'api', wideSides: ['r', 'l'], tallSides: ['r', 'l'] },
        { from: 'api', to: 'db', twoWay: true },
      ],
    },
    links: {},
  },
];
