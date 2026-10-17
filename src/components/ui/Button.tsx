import { useRef, type AnchorHTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import { cx } from '../../lib/cx';
import s from './ui.module.css';

export type ButtonIconName = 'arrow' | 'down' | 'external' | 'download';

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'solid' | 'ghost' | 'dark';
  icon?: ButtonIconName | null;
  children: ReactNode;
}

/**
 * Pill link-button. The solid variant leans a few pixels toward a fine pointer ("magnetic"),
 * which is skipped for touch and reduced motion.
 */
export function Button({ variant = 'solid', icon = 'arrow', className, children, ...rest }: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    el.style.setProperty('--mx', `${(x * 8).toFixed(2)}px`);
    el.style.setProperty('--my', `${(y * 6).toFixed(2)}px`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--mx', '0px');
    ref.current?.style.setProperty('--my', '0px');
  };

  return (
    <a ref={ref} className={cx(s.button, s[variant], className)} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      <span className={s.label}>{children}</span>
      {icon ? (
        <span className={s.iconWrap} aria-hidden>
          <ButtonIcon icon={icon} />
        </span>
      ) : null}
    </a>
  );
}

export function ButtonIcon({ icon, size = 17 }: { icon: ButtonIconName; size?: number }) {
  if (icon === 'down') return <ArrowDown className={cx(s.icon, s.iconDown)} size={size} strokeWidth={1.8} aria-hidden />;
  if (icon === 'download') return <Download className={cx(s.icon, s.iconDown)} size={size} strokeWidth={1.8} aria-hidden />;
  if (icon === 'external')
    return <ArrowUpRight className={cx(s.icon, s.iconDiag, 'dir-icon')} size={size} strokeWidth={1.8} aria-hidden />;
  return <ArrowRight className={cx(s.icon, s.iconShift, 'dir-icon')} size={size} strokeWidth={1.8} aria-hidden />;
}

export { s as uiStyles };
