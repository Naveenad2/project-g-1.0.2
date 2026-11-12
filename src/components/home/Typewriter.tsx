'use client';

import { useEffect, useState } from 'react';
import d from './demos.module.css';

interface TypewriterProps {
  text: string;
  /** Start typing. */
  active: boolean;
  /** Show the whole string immediately. */
  complete?: boolean;
  /** ms per character */
  speed?: number;
  /** Blinking caret shown at the typing position. */
  caret?: boolean;
}

/**
 * Types `text` out character by character. The full string is always in the DOM
 * (for assistive tech and layout); untyped characters are visually hidden.
 */
export function Typewriter({ text, active, complete, speed = 22, caret }: TypewriterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || complete) return;
    const id = window.setInterval(() => {
      setCount((n) => {
        if (n >= text.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [active, complete, speed, text.length]);

  const shown = complete ? text.length : active ? count : 0;

  return (
    <span className={d.typewriter}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {caret && <span className={d.caret} />}
        <span className={d.untyped}>{text.slice(shown)}</span>
      </span>
    </span>
  );
}
