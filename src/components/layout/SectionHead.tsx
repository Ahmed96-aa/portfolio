import { cx } from '../../lib/cx';
import { SplitWords } from '../ui/SplitWords';
import s from './SectionHead.module.css';

interface SectionHeadProps {
  headingId: string;
  index: string;
  label: string;
  title: string;
  intro?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

/** Section opener: index rule, mono label, display title (accent word), and an intro set beside it. */
export function SectionHead({ headingId, index, label, title, intro, tone = 'dark', className }: SectionHeadProps) {
  return (
    <header className={cx(s.head, tone === 'light' && s.light, !intro && s.noIntro, className)}>
      <div className={s.main}>
        <p className={s.kicker} data-reveal>
          <span className={s.index}>{index}</span>
          <span className={s.rule} data-rule aria-hidden />
          <span className="label">{label}</span>
        </p>
        <h2 id={headingId} className={cx('display', s.title)} data-title>
          <SplitWords text={title} data="title" />
        </h2>
      </div>
      {intro ? (
        <p className={s.intro} data-reveal>
          {intro}
        </p>
      ) : null}
    </header>
  );
}
