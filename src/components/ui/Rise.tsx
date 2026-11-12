import { Fragment } from 'react';

/**
 * Splits a headline into words that rise into place on load (pure CSS, see
 * `.rise` in globals.css). The text itself is unchanged; non-string titles
 * render as-is.
 */
export function Rise({ children, offset = 0 }: { children: React.ReactNode; offset?: number }) {
  if (typeof children !== 'string') return <>{children}</>;
  const words = children.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="rise">
            <span style={{ '--i': i + offset } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
