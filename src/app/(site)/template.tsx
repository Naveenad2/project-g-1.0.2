'use client';

import { useState } from 'react';

let firstRender = true;

/** Fades each new page in after a client-side navigation; the first load is left to the hero's own entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  const [enter] = useState(() => {
    if (typeof window === 'undefined') return false;
    const animate = !firstRender;
    firstRender = false;
    return animate;
  });
  return <div className={enter ? 'route-enter' : undefined}>{children}</div>;
}
