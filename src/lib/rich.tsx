import { Fragment, type ReactNode } from 'react';

/** Renders the *accent* segments of a dictionary string as the accent word. */
export function rich(text: string): ReactNode {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="accent">
        {part}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** The same string without accent markers, for attributes and plain-text contexts. */
export const plain = (text: string) => text.replace(/\*/g, '');
