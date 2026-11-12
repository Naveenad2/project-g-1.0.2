import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Form.module.css';

export { styles as formStyles };

interface FieldProps {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  /** Render the label as a group legend (for checkbox/radio sets or button groups). */
  group?: boolean;
}

export function Field({ id, label, hint, children, group }: FieldProps) {
  if (group) {
    return (
      <fieldset className={`${styles.field} ${styles.fieldset}`}>
        <legend className={styles.label}>{label}</legend>
        {children}
        {hint && <span className={styles.hint}>{hint}</span>}
      </fieldset>
    );
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[styles.control, props.className].filter(Boolean).join(' ')} />;
}

export function Select({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <div className={styles.selectWrap}>
      <select {...props} className={[styles.control, styles.select, props.className].filter(Boolean).join(' ')}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={[styles.control, styles.textarea, props.className].filter(Boolean).join(' ')} />;
}

export function FormCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.card, className].filter(Boolean).join(' ')}>{children}</div>;
}
