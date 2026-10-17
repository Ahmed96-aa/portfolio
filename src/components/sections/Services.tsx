import type { ComponentType } from 'react';
import { Blocks, Bot, Building2, Compass, Database, MonitorSmartphone, Webhook, type LucideProps } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { formatIndex } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { Guilloche } from '../brand/Brand';
import { SectionHead } from '../layout/SectionHead';
import { Button } from '../ui/Button';
import s from './Services.module.css';

const ICONS: Record<string, ComponentType<LucideProps>> = {
  erp: Building2,
  api: Webhook,
  web: MonitorSmartphone,
  data: Database,
  lead: Compass,
  ai: Bot,
};

/** Services on a cream "paper" panel — the one light surface in the page, same palette inverted. */
export function Services() {
  const { t, lang } = useLanguage();
  const section = t.sections.services;

  return (
    <section id="services" className={s.services} aria-labelledby="services-title">
      <div className={s.paper} data-spot>
        <Guilloche className={s.watermark} />
        <i className="spot" aria-hidden />
        <i className="uv" aria-hidden />
        <div className="container">
          <SectionHead
            headingId="services-title"
            index={section.index}
            label={section.label}
            title={section.title}
            intro={section.intro}
            tone="light"
          />

          <ol className={s.grid} data-reveal-stagger>
            {t.services.items.map((item, i) => {
              const Icon = ICONS[item.icon] ?? Blocks;
              return (
                <li key={item.title} className={s.item}>
                  <div className={s.itemTop}>
                    <span className={s.num}>{formatIndex(i + 1, lang)}</span>
                    <span className={s.icon} aria-hidden>
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                  </div>
                  <h3 className={cx('display', s.title)}>{item.title}</h3>
                  <p className={s.body}>{item.body}</p>
                  <ul className={s.tags}>
                    {item.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>

          <div className={s.note} data-reveal>
            <p>{t.services.note}</p>
            <Button href="#contact" variant="dark">
              {t.nav.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
