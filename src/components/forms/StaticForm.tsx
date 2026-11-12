'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './Form.module.css';

interface StaticFormProps {
  children: ReactNode;
  submitLabel: string;
  submitVariant?: 'primary' | 'dark';
  footer?: ReactNode;
  className?: string;
  /** Lay the submit button out inline with the fields (search / newsletter). */
  inline?: boolean;
  ariaLabel?: string;
}

/**
 * Form without a backend yet: validates natively, prevents navigation and
 * confirms the submission on the button itself.
 */
export function StaticForm({ children, submitLabel, submitVariant = 'primary', footer, className, inline, ariaLabel }: StaticFormProps) {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <form
      className={[inline ? styles.inlineForm : styles.form, className].filter(Boolean).join(' ')}
      onSubmit={onSubmit}
      onInput={() => sent && setSent(false)}
      aria-label={ariaLabel}
    >
      {children}
      <button type="submit" className={`btn btn--${submitVariant} ${inline ? '' : styles.submit}`} data-sent={sent || undefined}>
        {sent && <Icon name="check" size={16} strokeWidth={2.4} />}
        {submitLabel}
      </button>
      {footer && <p className={styles.foot}>{footer}</p>}
    </form>
  );
}
