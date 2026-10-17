import { Fragment } from 'react';

interface Segment {
  text: string;
  accent: boolean;
}

/** Splits "I build the *systems* run on." into words, each a list of accent / plain segments. */
function toWords(text: string): Segment[][] {
  const words: Segment[][] = [];
  let word: Segment[] = [];
  let accent = false;
  const push = (ch: string) => {
    const last = word[word.length - 1];
    if (last && last.accent === accent) last.text += ch;
    else word.push({ text: ch, accent });
  };
  for (const ch of text) {
    if (ch === '*') accent = !accent;
    else if (/\s/.test(ch)) {
      if (word.length) words.push(word);
      word = [];
    } else push(ch);
  }
  if (word.length) words.push(word);
  return words;
}

/**
 * Splits a dictionary string into masked words for a rising reveal. Words are never split into
 * letters, so Arabic keeps its joins; punctuation stays with the word it follows. *word* marks the
 * accent word, as everywhere else.
 */
export function SplitWords({ text, data = 'word' }: { text: string; data?: string }) {
  const words = toWords(text);
  return (
    <>
      {words.map((segments, i) => (
        <Fragment key={i}>
          <span className="split-word">
            <span className="split-inner" data-split={data}>
              {segments.map((segment, j) =>
                segment.accent ? (
                  <em key={j} className="accent">
                    {segment.text}
                  </em>
                ) : (
                  <span key={j}>{segment.text}</span>
                ),
              )}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
