import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'dark';

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: 'md' | 'sm';
  arrow?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant = 'primary', size = 'md', arrow, block, className, children }: ButtonLinkProps) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className].filter(Boolean).join(' ');
  return (
    <Link href={href} className={cls}>
      {children}
      {arrow && <Icon name="arrowRight" size={16} strokeWidth={2} />}
    </Link>
  );
}

/** Inline text link with a trailing arrow ("Learn more →" style). */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={['link-arrow', className].filter(Boolean).join(' ')}>
      {children}
      <Icon name="arrowRight" size={15} strokeWidth={2} />
    </Link>
  );
}
