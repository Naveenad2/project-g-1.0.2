'use client';

import { useEffect } from 'react';

/**
 * Several cards (articles, roles, templates, recordings) point at pages that
 * have not been published yet and use href="#". Stop those clicks from
 * jumping the visitor back to the top of the page.
 */
export function PlaceholderLinkGuard() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.('a[href="#"]');
      if (anchor) e.preventDefault();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
