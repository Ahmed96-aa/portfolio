import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '../i18n/types';

/** Live local time in a time zone, re-rendered on each minute boundary. */
export function useLocalTime(timeZone: string, lang: Lang) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60_000 - (Date.now() % 60_000) + 40);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return useMemo(() => {
    const time = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(now);
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(now));
    return { time, hour, isNight: hour < 7 || hour >= 23 };
  }, [now, lang, timeZone]);
}
