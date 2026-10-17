import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from 'react';
import { ArrowRight, AtSign, Copy, CornerDownLeft, Download, Languages, Printer, Search } from 'lucide-react';
import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { fill } from '../../i18n/format';
import type { Lang } from '../../i18n/types';
import { cx } from '../../lib/cx';
import { PALETTE_EVENT } from '../../lib/palette';
import { copyText, toast } from '../../lib/toast';
import { SECTION_IDS } from '../layout/Header';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from '../ui/BrandIcons';
import s from './CommandPalette.module.css';

type Group = 'navigate' | 'actions' | 'elsewhere';

type Action =
  | { kind: 'go'; id: string }
  | { kind: 'copy' }
  | { kind: 'mail' }
  | { kind: 'cv'; lang: Lang }
  | { kind: 'lang' }
  | { kind: 'print' }
  | { kind: 'open'; href: string };

interface Item {
  id: string;
  group: Group;
  label: string;
  keywords: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  action: Action;
}

const GROUPS: Group[] = ['navigate', 'actions', 'elsewhere'];

/** Case-, accent- and diacritic-insensitive matching, with the common Arabic letter variants folded. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\p{Mn}\p{Lm}]/gu, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

/**
 * ⌘K / Ctrl K quick actions: jump to a section, copy the email, download the CV, switch language,
 * print the page as a résumé, or open a channel. A combobox over a listbox, fully keyboard driven.
 */
export function CommandPalette() {
  const { t, lang, setLang } = useLanguage();
  const p = t.palette;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const uid = useId();

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery('');
    setActive(0);
    dialog.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else open();
      } else if (e.key === '/' && !typing && !dialogRef.current?.open) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(PALETTE_EVENT, open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(PALETTE_EVENT, open);
    };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = SECTION_IDS.map((id) => ({
      id: `go-${id}`,
      group: 'navigate' as const,
      label: fill(p.goTo, { section: t.nav[id] }),
      keywords: `${id} section`,
      Icon: ArrowRight,
      action: { kind: 'go', id },
    }));
    list.push(
      { id: 'copy', group: 'actions', label: p.copyEmail, keywords: `email mail copy ${profile.email} بريد نسخ`, Icon: Copy, action: { kind: 'copy' } },
      { id: 'mail', group: 'actions', label: p.writeEmail, keywords: 'email mail write compose بريد رسالة', Icon: AtSign, action: { kind: 'mail' } },
    );
    // One action per CV language, the page's language first; "arabic"/"english" find the other one.
    for (const l of (lang === 'ar' ? ['ar', 'en'] : ['en', 'ar']) as Lang[]) {
      if (!profile.cv[l]) continue;
      list.push({
        id: `cv-${l}`,
        group: 'actions',
        label: t.contact.cvIn[l],
        keywords: `cv resume résumé pdf download سيرة تحميل ${l === 'ar' ? 'arabic عربي العربية' : 'english انجليزي الإنجليزية'}`,
        Icon: Download,
        action: { kind: 'cv', lang: l },
      });
    }
    list.push(
      { id: 'lang', group: 'actions', label: p.switchLang, keywords: 'language arabic english عربي انجليزي لغة', Icon: Languages, action: { kind: 'lang' } },
      { id: 'print', group: 'actions', label: p.print, keywords: 'print pdf resume cv طباعة', Icon: Printer, action: { kind: 'print' } },
    );
    if (profile.whatsapp) {
      list.push({
        id: 'whatsapp',
        group: 'elsewhere',
        label: p.whatsapp,
        keywords: 'whatsapp chat message واتساب',
        Icon: WhatsAppIcon,
        action: { kind: 'open', href: `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(t.contact.whatsappMessage)}` },
      });
    }
    for (const social of profile.socials) {
      list.push({
        id: social.id,
        group: 'elsewhere',
        label: fill(p.open, { name: social.label[lang] }),
        keywords: `${social.id} ${social.handle} ${social.label.en} ${social.label.ar}`,
        Icon: social.id === 'telegram' ? TelegramIcon : InstagramIcon,
        action: { kind: 'open', href: social.href },
      });
    }
    return list;
  }, [t, p, lang]);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((item) => {
      const hay = normalize(`${item.label} ${item.keywords}`);
      return terms.every((term) => hay.includes(term));
    });
  }, [items, query]);

  // Display order (grouped); the active index and Enter both follow it.
  const ordered = GROUPS.flatMap((group) => results.filter((item) => item.group === group));

  /** Runs an item; only ever called from an event handler. */
  const run = (item: Item | undefined) => {
    if (!item) return;
    dialogRef.current?.close();
    const action = item.action;
    switch (action.kind) {
      case 'go':
        document.getElementById(action.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(history.state, '', `#${action.id}`);
        break;
      case 'copy':
        void copyText(profile.email).then((ok) => toast(ok ? t.toast.copied : t.toast.copyFailed));
        break;
      case 'mail':
        window.location.assign(`mailto:${profile.email}`);
        break;
      case 'cv': {
        const link = document.createElement('a');
        link.href = profile.cv[action.lang];
        link.download = '';
        document.body.append(link);
        link.click();
        link.remove();
        break;
      }
      case 'lang':
        setLang(lang === 'ar' ? 'en' : 'ar');
        break;
      case 'print':
        window.setTimeout(() => window.print(), 150);
        break;
      case 'open':
        window.open(action.href, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  const move = (step: number) => {
    if (!ordered.length) return;
    const next = (active + step + ordered.length) % ordered.length;
    setActive(next);
    document.getElementById(`${uid}-opt-${next}`)?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(ordered[active]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={s.palette}
      aria-label={p.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className={s.panel}>
        <div className={s.searchRow}>
          <Search size={18} strokeWidth={1.7} aria-hidden />
          <input
            ref={inputRef}
            className={s.input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={p.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={ordered.length ? `${uid}-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label={p.title}
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className={s.esc}>Esc</kbd>
        </div>

        <div id={`${uid}-list`} role="listbox" className={s.list} aria-label={p.title}>
          {ordered.length === 0 ? <p className={s.empty}>{p.empty}</p> : null}
          {GROUPS.map((group) => {
            const groupItems = ordered.filter((item) => item.group === group);
            if (!groupItems.length) return null;
            return (
              <div key={group} role="group" aria-labelledby={`${uid}-g-${group}`} className={s.group}>
                <p id={`${uid}-g-${group}`} className={s.groupLabel}>
                  {p[group]}
                </p>
                {groupItems.map((item) => {
                  const i = ordered.indexOf(item);
                  const Icon = item.Icon;
                  return (
                    <div
                      key={item.id}
                      id={`${uid}-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className={cx(s.option, i === active && s.optionActive)}
                      onPointerMove={() => setActive(i)}
                      onClick={() => run(item)}
                    >
                      <span className={s.optionIcon} aria-hidden>
                        <Icon size={16} strokeWidth={1.7} />
                      </span>
                      <span className={s.optionLabel}>{item.label}</span>
                      {i === active ? <CornerDownLeft className={s.enter} size={15} strokeWidth={1.7} aria-hidden /> : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className={s.foot} aria-hidden>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {p.keys.move}
          </span>
          <span>
            <kbd>↵</kbd> {p.keys.run}
          </span>
          <span>
            <kbd>Esc</kbd> {p.keys.close}
          </span>
          <span className={s.count}>{fill(p.results, { n: ordered.length })}</span>
        </div>
      </div>
    </dialog>
  );
}
