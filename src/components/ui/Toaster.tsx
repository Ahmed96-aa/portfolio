import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { onToast } from '../../lib/toast';
import s from './Toaster.module.css';

/** One polite live region for short confirmations ("Email copied"). */
export function Toaster() {
  const [message, setMessage] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => onToast((text) => setMessage({ text, id: Date.now() })), []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div className={s.region} role="status" aria-live="polite">
      {message ? (
        <p key={message.id} className={s.toast}>
          <Check size={16} strokeWidth={2} aria-hidden />
          <span>{message.text}</span>
        </p>
      ) : null}
    </div>
  );
}
