import { useId, useRef, useState, type CSSProperties } from 'react';
import { Check, Plus } from 'lucide-react';
import { projects, type Project } from '../../content/projects';
import { useLanguage } from '../../i18n/LanguageProvider';
import { fill, formatIndex } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { ALLOW_MOTION, gsap, useGSAP } from '../../motion/gsap';
import { Blueprint } from '../blueprint/Blueprint';
import { SectionHead } from '../layout/SectionHead';
import { ButtonIcon, uiStyles } from '../ui/Button';
import s from './Work.module.css';

function Links({ project }: { project: Project }) {
  const { t } = useLanguage();
  if (!project.links.live && !project.links.repo) return null;
  return (
    <div className={s.links}>
      {project.links.live ? (
        <a className={uiStyles.textLink} href={project.links.live} target="_blank" rel="noopener noreferrer">
          {t.work.live}
          <ButtonIcon icon="external" size={15} />
          <span className="sr-only">{t.a11y.newTab}</span>
        </a>
      ) : null}
      {project.links.repo ? (
        <a className={uiStyles.textLink} href={project.links.repo} target="_blank" rel="noopener noreferrer">
          {t.work.repo}
          <ButtonIcon icon="external" size={15} />
          <span className="sr-only">{t.a11y.newTab}</span>
        </a>
      ) : null}
    </div>
  );
}

function Stack({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className={s.stack} aria-label={label}>
      {items.map((tech) => (
        <li key={tech}>{tech}</li>
      ))}
    </ul>
  );
}

function CaseStudy({ project, n, total }: { project: Project; n: number; total: number }) {
  const { t, lang } = useLanguage();
  const headingId = `case-${project.id}`;
  return (
    <li className={s.caseItem} style={{ '--i': n - 1 } as CSSProperties} data-case>
      <article className={s.case} aria-labelledby={headingId} data-spot>
        <i className="spot" aria-hidden />
        <i className="uv" aria-hidden />
        <div className={s.caseInfo}>
          <div className={s.caseMeta}>
            <span className={s.caseNum}>
              <span className="sr-only">{fill(t.work.count, { n, total })}</span>
              <span aria-hidden>
                {formatIndex(n, lang)}
                <span className={s.of}> / {formatIndex(total, lang)}</span>
              </span>
            </span>
            <span className={cx('label', s.category)}>{project.category[lang]}</span>
          </div>
          <h3 id={headingId} className={cx('display', s.caseTitle)}>
            {project.name[lang]}
          </h3>
          <p className={s.caseHeadline}>{project.headline[lang]}</p>
          <p className={s.caseSummary}>{project.summary[lang]}</p>
          <div className={s.caseFoot}>
            <div>
              <h4 className={cx('label', s.blockLabel)}>{t.work.role}</h4>
              <ul className={s.roles}>
                {project.roles[lang].map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
            <Stack items={project.stack} label={t.work.stack} />
            <Links project={project} />
          </div>
        </div>
        <div className={s.caseVisual}>
          {project.media ? (
            <img
              className={s.media}
              src={project.media.src}
              width={project.media.width}
              height={project.media.height}
              alt={project.media.alt[lang]}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <Blueprint spec={project.blueprint} title={project.name[lang]} className={s.sketch} />
          <div className={s.owned}>
            <h4 className={cx('label', s.blockLabel)}>{t.work.owned}</h4>
            <ul>
              {project.owned[lang].map((item) => (
                <li key={item}>
                  <Check size={15} strokeWidth={2} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </li>
  );
}

function IndexRow({ project, n }: { project: Project; n: number }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const uid = useId();
  const panelId = `${uid}-panel`;
  return (
    <li className={cx(s.row, open && s.rowOpen)}>
      <h4 className={s.rowHeading}>
        <button type="button" className={s.rowButton} aria-expanded={open} aria-controls={panelId} onClick={() => {
            setMounted(true);
            setOpen((o) => !o);
          }}>
          <span className={s.rowNum}>{formatIndex(n, lang)}</span>
          <span className={cx('display', s.rowName)}>{project.name[lang]}</span>
          <span className={s.rowCat}>{project.category[lang]}</span>
          <span className={s.rowStack} dir="ltr">
            {project.stack.slice(0, 2).join(' · ')}
          </span>
          <span className={s.rowToggle} aria-hidden>
            <Plus size={18} strokeWidth={1.6} />
          </span>
          <span className="sr-only">{open ? t.work.collapse : t.work.expand}</span>
        </button>
      </h4>
      <div id={panelId} className={s.rowPanel} role="region" aria-label={project.name[lang]} inert={!open}>
        <div className={s.rowClip}>
          <div className={s.rowInner}>
            <div className={s.rowText}>
              <p className={s.caseHeadline}>{project.headline[lang]}</p>
              <p className={s.caseSummary}>{project.summary[lang]}</p>
              <h5 className={cx('label', s.blockLabel)}>{t.work.role}</h5>
              <ul className={s.roles}>
                {project.roles[lang].map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
              <Stack items={project.stack} label={t.work.stack} />
            </div>
            {mounted ? <Blueprint spec={project.blueprint} title={project.name[lang]} /> : <div className={s.rowSpacer} />}
          </div>
        </div>
      </div>
    </li>
  );
}

export function Work() {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const section = t.sections.work;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: ALLOW_MOTION, stacked: '(min-width: 1024px) and (min-height: 760px)' }, (context) => {
        const { motion, stacked } = context.conditions ?? {};
        if (!motion) return;
        const cards = gsap.utils.toArray<HTMLElement>('[data-case]');

        // Every case study rises out of the page in perspective as it arrives — phones included.
        // Stacked cards slide over the previous one, so they arrive opaque; elsewhere they also fade in.
        cards.forEach((card) => {
          gsap.from(card, {
            ...(stacked ? {} : { opacity: 0 }),
            y: stacked ? 60 : 80,
            rotateX: 6,
            transformPerspective: 1600,
            transformOrigin: '50% 0%',
            duration: 1.4,
            ease: 'expo.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true },
          });
        });

        // Stacked case studies: the card underneath settles back like a page in a folio —
        // it tips away, shrinks and dims as the next one slides over it.
        if (!stacked) return;
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const article = card.firstElementChild as HTMLElement;
          gsap.to(article, {
            scale: 0.92,
            rotateX: 7,
            transformPerspective: 1600,
            '--shade': 0.6,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className={cx('section', s.work)} aria-labelledby="work-title">
      <div className="container">
        <SectionHead headingId="work-title" index={section.index} label={section.label} title={section.title} intro={section.intro} />

        <ol className={s.cases}>
          {featured.map((project, i) => (
            <CaseStudy key={project.id} project={project} n={i + 1} total={projects.length} />
          ))}
        </ol>

        <div className={s.more}>
          <div className={s.moreHead} data-reveal>
            <span className="label">{t.sections.more.label}</span>
            <h3 className={cx('display', s.moreTitle)}>{t.sections.more.title}</h3>
          </div>
          <ul className={s.rows} data-reveal-stagger>
            {more.map((project, i) => (
              <IndexRow key={project.id} project={project} n={featured.length + i + 1} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
