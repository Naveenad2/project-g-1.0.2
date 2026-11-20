'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { authentication } from '@/lib/firebase';
import { authMessage, codeOf } from './errors';
import s from './Admin.module.css';

const RULES: [string, (p: string) => boolean][] = [
  ['At least 14 characters', (p) => p.length >= 14],
  ['An upper-case and a lower-case letter', (p) => /[A-Z]/.test(p) && /[a-z]/.test(p)],
  ['A number', (p) => /\d/.test(p)],
  ['A symbol, such as ! # % or ?', (p) => /[^A-Za-z0-9]/.test(p)],
];

/** Change the admin password: the current one is confirmed with Firebase first. */
export function PasswordDialog({ email, onClose }: { email: string; onClose: (changed: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const strong = RULES.every(([, ok]) => ok(next));
  const matches = next === again;
  const ready = !!current && strong && matches && next !== current;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setError('');
    setBusy(true);
    try {
      const [auth, { EmailAuthProvider, reauthenticateWithCredential, updatePassword }] = await Promise.all([
        authentication(),
        import('firebase/auth'),
      ]);
      const user = auth.currentUser;
      if (!user) throw Object.assign(new Error('signed out'), { code: 'auth/requires-recent-login' });
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, current));
      await updatePassword(user, next);
      onClose(true);
    } catch (err) {
      const code = codeOf(err);
      setError(
        code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials'
          ? 'The current password is not right.'
          : authMessage(err),
      );
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby="pw-title"
      data-lenis-prevent=""
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose(false);
      }}
    >
      <form onSubmit={submit} noValidate>
        <h2 id="pw-title" className={s.cardTitle}>
          Change password
        </h2>
        <p className={s.cardSub}>For {email}. You stay signed in on this tab.</p>
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <label className={s.label} htmlFor="pw-current">
          Current password
        </label>
        <input
          id="pw-current"
          className={s.input}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <label className={s.label} htmlFor="pw-new">
          New password
        </label>
        <input
          id="pw-new"
          className={s.input}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-describedby="pw-rules"
        />
        <ul id="pw-rules" className={s.pwRules}>
          {RULES.map(([text, ok]) => (
            <li key={text} data-ok={ok(next) || undefined}>
              {text}
            </li>
          ))}
          {next && next === current && <li>Different from the current password</li>}
        </ul>
        <label className={s.label} htmlFor="pw-again">
          New password again
        </label>
        <input
          id="pw-again"
          className={s.input}
          type="password"
          autoComplete="new-password"
          value={again}
          onChange={(e) => setAgain(e.target.value)}
        />
        {again && !matches && <p className={s.fieldError}>The two new passwords are not the same.</p>}
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <div className={`${s.row} ${s.dialogActions}`}>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => onClose(false)} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={!ready || busy}>
            {busy ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
