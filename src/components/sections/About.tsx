import { useLanguage } from '../../i18n/LanguageProvider';
import { formatIndex } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { rich } from '../../lib/rich';
import { Guilloche } from '../brand/Brand';
import { SectionHead } from '../layout/SectionHead';
import { CvChoice } from '../ui/CvChoice';
import s from './About.module.css';

export function About() {
  const { t, lang } = useLanguage();
  const section = t.sections.about;
  const a = t.about;

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHead headingId="about-title" index={section.index} label={section.label} title={section.title} />

        <div className={s.story}>
          <blockquote className={s.quote} data-reveal>
            <span className={s.quoteMark} aria-hidden>
              “
            </span>
            <p className="display">{a.quote}</p>
          </blockquote>
          <div className={s.bio} data-reveal-stagger>
            {a.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className={s.principles}>
          <h3 className={cx('label', s.smallHead)}>{a.principlesLabel}</h3>
          <ol className={s.principleList} data-reveal-stagger>
            {a.principles.map((principle, i) => (
              <li key={principle.title} data-spot>
                <i className="spot" aria-hidden />
                <i className="uv" aria-hidden />
                <span className={s.principleNum}>{formatIndex(i + 1, lang)}</span>
                <h4 className={cx('display', s.principleTitle)}>{principle.title}</h4>
                <p>{principle.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.lower}>
          <div className={s.ledger} data-reveal>
            <h3 className={cx('label', s.smallHead)}>{a.ledgerLabel}</h3>
            <dl>
              {a.ledger.map((row) => (
                <div key={row.k}>
                  <dt>{row.k}</dt>
                  <dd>{row.v}</dd>
                </div>
              ))}
            </dl>
            <CvChoice className={s.cv} label={t.hero.cv} />
          </div>

          <aside className={s.heritage} aria-labelledby="heritage-title" data-reveal data-spot data-tilt="5">
            <Guilloche className={s.heritageRosette} spin />
            <span className={s.calligraphy} lang="ar" aria-hidden>
              الخوارزمي
            </span>
            <i className="spot" aria-hidden />
            <i className="uv" aria-hidden />
            <p className={cx('label', s.heritageLabel)}>{a.heritage.label}</p>
            <h3 id="heritage-title" className={cx('display', s.heritageTitle)}>
              {rich(a.heritage.title)}
            </h3>
            <p className={s.heritageBody}>{a.heritage.body}</p>
            <p className={s.heritageSign} dir="ltr">
              al-Khwārizmī · c. 780–850 · Bayt al-Ḥikmah
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
