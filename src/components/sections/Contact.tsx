import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useLocalTime } from '../../hooks/useLocalTime';
import { cx } from '../../lib/cx';
import { copyText, toast } from '../../lib/toast';
import { validateContact, type ContactErrors, type ContactValues } from '../../lib/validation';
import { LocalClock } from '../layout/Header';
import { SectionHead } from '../layout/SectionHead';
import { ButtonIcon } from '../ui/Button';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from '../ui/BrandIcons';
import { CvChoice } from '../ui/CvChoice';
import s from './Contact.module.css';

type Status = 'idle' | 'invalid' | 'sending' | 'sent' | 'failed' | 'offline' | 'mailto' | 'unconfigured';
type Field = keyof ContactValues | 'type' | 'timeline';

const TYPES = ['erp', 'api', 'web', 'data', 'ai', 'other'] as const;
const TIMELINES = ['asap', 'soon', 'later', 'exploring'] as const;
const EMPTY: ContactValues = { name: '', email: '', company: '', message: '' };

/** How the form can deliver: a real endpoint, the visitor's mail app, or not at all (and it says so). */
const deliveryMode = profile.formEndpoint ? 'endpoint' : profile.email ? 'mailto' : 'none';

function endpointParts() {
  try {
    const url = new URL(profile.formEndpoint);
    return { host: url.host, path: url.pathname };
  } catch {
    return { host: 'mail', path: '/' };
  }
}

const endpoint = endpointParts();

const quote = (value: string, max = 0) => {
  const text = max && value.length > max ? `${value.slice(0, max)}…` : value;
  return JSON.stringify(text);
};

export function Contact() {
  const { t, lang } = useLanguage();
  const c = t.contact;
  const section = t.sections.contact;
  const uid = useId();
  const { isNight } = useLocalTime(profile.timeZone, lang);
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [types, setTypes] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [http, setHttp] = useState<{ code: number; text: string } | null>(null);
  const [focused, setFocused] = useState<Field | null>(null);
  const [copied, setCopied] = useState(false);

  const subject = c.subject.replace('{name}', values.name.trim());
  const typeLabels = types.map((key) => c.types[key as keyof typeof c.types]);
  const timelineLabel = timeline ? c.timelines[timeline as keyof typeof c.timelines] : '';
  const payload = {
    name: values.name.trim(),
    email: values.email.trim(),
    company: values.company.trim(),
    type: typeLabels.join(', '),
    timeline: timelineLabel,
    message: values.message.trim(),
    language: lang,
    _subject: subject,
  };

  const resetFeedback = () => {
    if (status !== 'sending') {
      setStatus('idle');
      setHttp(null);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (attempted) setErrors(validateContact(next, c.errors));
    resetFeedback();
  };

  const toggleType = (key: string) => {
    setTypes((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
    resetFeedback();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Honeypot: real visitors never see or fill this field.
    if ((form.elements.namedItem('website') as HTMLInputElement | null)?.value) return;

    setAttempted(true);
    const found = validateContact(values, c.errors);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as Array<keyof ContactValues>)[0];
    if (firstInvalid) {
      setStatus('invalid');
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (deliveryMode === 'none') {
      setStatus('unconfigured');
      return;
    }

    if (deliveryMode === 'mailto') {
      const body = [
        values.message.trim(),
        '',
        typeLabels.length ? `${c.type} ${typeLabels.join(', ')}` : '',
        timelineLabel ? `${c.timeline}: ${timelineLabel}` : '',
        `— ${values.name.trim()}`,
        values.company.trim(),
        values.email.trim(),
      ]
        .filter((line, i) => line !== '' || i === 1)
        .join('\n');
      window.location.assign(`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      setStatus('mailto');
      return;
    }

    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    setStatus('sending');
    setHttp(null);
    try {
      const response = await fetch(profile.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      setHttp({ code: response.status, text: response.statusText || (response.ok ? 'OK' : 'Error') });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('sent');
      setValues(EMPTY);
      setTypes([]);
      setTimeline('');
      setAttempted(false);
      setErrors({});
    } catch {
      setStatus('failed');
    }
  };

  const copyEmail = async () => {
    const ok = await copyText(profile.email);
    toast(ok ? t.toast.copied : t.toast.copyFailed);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusMessage: Record<Status, string> = {
    idle: '',
    invalid: c.errors.summary,
    sending: c.sending,
    sent: c.status.sent,
    failed: c.status.failed,
    offline: c.status.offline,
    mailto: c.status.mailto,
    unconfigured: c.status.unconfigured,
  };
  const tone =
    status === 'sent' || status === 'mailto' ? s.statusOk : status === 'sending' || status === 'idle' ? s.statusNeutral : s.statusError;

  const field = (
    name: keyof ContactValues,
    label: string,
    opts: { type?: string; optional?: boolean; multiline?: boolean; hint?: string; autoComplete?: string; wide?: boolean } = {},
  ) => {
    const id = `${uid}-${name}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const error = errors[name];
    const describedBy = [opts.hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
    const common = {
      id,
      name,
      value: values[name],
      onChange,
      onFocus: () => setFocused(name),
      onBlur: () => setFocused(null),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
      required: !opts.optional,
      autoComplete: opts.autoComplete,
      className: s.input,
      placeholder: ' ',
    };
    return (
      <div className={cx(s.field, error && s.fieldError, (opts.multiline || opts.wide) && s.fieldWide)}>
        <label htmlFor={id} className={s.labelText}>
          {label}
          {opts.optional ? <span className={s.optional}> ({c.optional})</span> : null}
        </label>
        {opts.multiline ? (
          <textarea {...common} rows={5} maxLength={4000} />
        ) : (
          <input {...common} type={opts.type ?? 'text'} maxLength={name === 'email' ? 254 : 120} />
        )}
        {opts.hint ? (
          <p id={hintId} className={s.hint}>
            {opts.hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={s.error}>
            {error}
          </p>
        ) : null}
      </div>
    );
  };

  /* ───────── The live request preview ───────── */
  const entries = Object.entries(payload) as Array<[string, string]>;
  const line = (key: string, value: string, last: boolean): ReactNode => (
    <span key={key} className={cx(s.line, focused === key && s.lineActive)}>
      {'  '}
      <span className={s.jk}>"{key}"</span>:{' '}
      {/* dir="auto": an Arabic value reads right to left inside its quotes instead of being split by the LTR line. */}
      <span className={value ? s.js : s.jEmpty} dir="auto">
        {quote(value, key === 'message' ? 140 : 0)}
      </span>
      {last ? '' : ','}
      {'\n'}
    </span>
  );
  const previewState =
    status === 'sending' ? 'sending' : status === 'sent' ? 'ok' : status === 'failed' || status === 'offline' ? 'error' : 'idle';
  const previewText =
    status === 'sending'
      ? c.preview.sending
      : status === 'sent'
        ? c.preview.delivered
        : status === 'failed'
          ? c.preview.failed
          : status === 'offline'
            ? c.preview.offline
            : status === 'mailto'
              ? c.preview.mailto
              : c.preview.idle;

  return (
    <section id="contact" className={cx('section', s.contact)} aria-labelledby="contact-title">
      <div className={s.glow} aria-hidden />
      <div className="container">
        <SectionHead headingId="contact-title" index={section.index} label={section.label} title={section.title} intro={section.intro} />

        <div className={s.layout}>
          <form className={s.form} aria-label={c.formLabel} noValidate onSubmit={onSubmit} data-reveal>
            {field('name', c.name, { autoComplete: 'name' })}
            {field('email', c.email, { type: 'email', autoComplete: 'email' })}
            {field('company', c.company, { optional: true, autoComplete: 'organization', wide: true })}

            <fieldset className={cx(s.fieldset, s.fieldWide)} onFocus={() => setFocused('type')} onBlur={() => setFocused(null)}>
              <legend className={s.labelText}>
                {c.type} <span className={s.optional}>— {c.typeHint}</span>
              </legend>
              <div className={s.chips}>
                {TYPES.map((key) => (
                  <label key={key} className={s.chip}>
                    <input type="checkbox" name="type" value={key} checked={types.includes(key)} onChange={() => toggleType(key)} />
                    <span>{c.types[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={cx(s.fieldset, s.fieldWide)} onFocus={() => setFocused('timeline')} onBlur={() => setFocused(null)}>
              <legend className={s.labelText}>
                {c.timeline} <span className={s.optional}>({c.optional})</span>
              </legend>
              <div className={s.chips}>
                {TIMELINES.map((key) => (
                  <label key={key} className={s.chip}>
                    <input
                      type="radio"
                      name="timeline"
                      value={key}
                      checked={timeline === key}
                      onChange={() => {
                        setTimeline(key);
                        resetFeedback();
                      }}
                    />
                    <span>{c.timelines[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {field('message', c.message, { multiline: true, hint: c.messageHint })}

            <div className={s.honeypot} aria-hidden>
              <label htmlFor={`${uid}-website`}>{c.honeypot}</label>
              <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className={s.submitRow}>
              <button type="submit" className={s.submit} disabled={status === 'sending'}>
                <span>{status === 'sending' ? c.sending : deliveryMode === 'mailto' ? c.compose : c.submit}</span>
                <span className={s.submitIcon} aria-hidden>
                  <ButtonIcon icon="arrow" />
                </span>
              </button>
              {deliveryMode === 'mailto' ? <p className={s.note}>{c.mailtoNote}</p> : null}
            </div>

            <p role="status" aria-live="polite" className={cx(s.status, tone)}>
              {statusMessage[status]}
            </p>
          </form>

          <div className={s.side}>
            <div className={s.preview} aria-hidden data-reveal>
              <div className={s.previewBar}>
                <span className={s.dots}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={s.previewTitle}>{c.preview.title}</span>
                <span className={s.previewLive}>live</span>
              </div>
              <pre className={s.request} dir="ltr">
                <code>
                  {deliveryMode === 'mailto' ? (
                    <>
                      <span className={s.method}>mailto:</span>
                      {profile.email}
                      {'\n\n'}
                    </>
                  ) : (
                    <>
                      <span className={s.method}>POST</span> {endpoint.path} <span className={s.dim}>HTTP/1.1</span>
                      {'\n'}
                      <span className={s.header}>Host:</span> {endpoint.host}
                      {'\n'}
                      <span className={s.header}>Content-Type:</span> application/json
                      {'\n'}
                      <span className={s.header}>Accept-Language:</span> {lang}
                      {'\n\n'}
                    </>
                  )}
                  {'{\n'}
                  {entries.map(([key, value], i) => line(key, value, i === entries.length - 1))}
                  {'}'}
                </code>
              </pre>
              <div className={s.response} data-state={previewState}>
                <span className={s.responseArrow}>←</span>
                <span className={s.responseCode}>{http ? `${http.code} ${http.text}` : status === 'sending' ? '…' : '—'}</span>
                <span className={s.responseText} dir="auto">
                  {previewText}
                </span>
              </div>
              <p className={s.caption}>{c.preview.caption}</p>
            </div>

            <aside className={s.channels} aria-labelledby={`${uid}-channels`} data-reveal>
              <h3 id={`${uid}-channels`} className={cx('label', s.channelsTitle)}>
                {c.channels}
              </h3>
              <div className={s.mailRow}>
                <a href={`mailto:${profile.email}`} className={s.mail}>
                  {profile.email}
                </a>
                <button type="button" className={s.copy} onClick={copyEmail}>
                  {copied ? <Check size={15} strokeWidth={2} aria-hidden /> : <Copy size={15} strokeWidth={1.8} aria-hidden />}
                  <span>{copied ? c.copied : c.copy}</span>
                </button>
              </div>
              <ul className={s.channelList}>
                {profile.whatsapp ? (
                  <li>
                    <a
                      className={s.channel}
                      href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(c.whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon size={18} />
                      <span>{c.whatsapp}</span>
                      <ButtonIcon icon="external" size={15} />
                      <span className="sr-only">{t.a11y.newTab}</span>
                    </a>
                  </li>
                ) : null}
                {profile.socials.map((social) => (
                  <li key={social.id}>
                    <a className={s.channel} href={social.href} target="_blank" rel="noopener noreferrer">
                      {social.id === 'telegram' ? <TelegramIcon size={18} /> : <InstagramIcon size={18} />}
                      <span>
                        {social.label[lang]} <span className={s.handle}>{social.handle}</span>
                      </span>
                      <ButtonIcon icon="external" size={15} />
                      <span className="sr-only">{t.a11y.newTab}</span>
                    </a>
                  </li>
                ))}
                {profile.cv.en || profile.cv.ar ? (
                  <li>
                    <CvChoice className={s.cvRow} label={c.cv} />
                  </li>
                ) : null}
              </ul>
              <p className={s.timeRow}>
                <LocalClock />
                <span className={s.timeNote}>{isNight ? t.time.night : t.time.day}</span>
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
