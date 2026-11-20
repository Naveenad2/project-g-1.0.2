'use client';

import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/ui/Logo';
import { authentication } from '@/lib/firebase';
import { authMessage } from './errors';
import s from './Admin.module.css';

/** Sign-in for the admin account, with a password reset that Firebase emails. */
export function SignIn({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<'signIn' | 'reset'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const [auth, { signInWithEmailAndPassword }] = await Promise.all([authentication(), import('firebase/auth')]);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // the dashboard takes over once Firebase reports the signed-in account
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const [auth, { sendPasswordResetEmail }] = await Promise.all([authentication(), import('firebase/auth')]);
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={s.signPage}>
      <div className={s.signCard}>
        <div className={s.brand}>
          <Logo height={22} />
          <span className={s.brandTag}>Pricing admin</span>
        </div>

        {mode === 'signIn' ? (
          <form onSubmit={signIn} noValidate>
            <h1 className={s.signTitle}>Sign in</h1>
            <p className={s.signSub}>For the person who manages the prices on the pricing page.</p>
            {notice && (
              <p className={s.notice} role="status">
                {notice}
              </p>
            )}
            <label className={s.label} htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className={s.input}
              type="email"
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className={s.label} htmlFor="admin-password">
              Password
            </label>
            <div className={s.passWrap}>
              <input
                id="admin-password"
                className={s.input}
                type={reveal ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className={s.reveal} onClick={() => setReveal((r) => !r)} aria-pressed={reveal}>
                {reveal ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={`btn btn--primary btn--block ${s.submit}`} disabled={busy || !email.trim() || !password}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              className={s.linkButton}
              onClick={() => {
                setMode('reset');
                setError('');
                setSent(false);
              }}
            >
              Forgot the password?
            </button>
          </form>
        ) : (
          <form onSubmit={reset} noValidate>
            <h1 className={s.signTitle}>Reset the password</h1>
            <p className={s.signSub}>Firebase emails a link for choosing a new password to the admin account&apos;s address.</p>
            <label className={s.label} htmlFor="admin-reset-email">
              Email
            </label>
            <input
              id="admin-reset-email"
              className={s.input}
              type="email"
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {sent && (
              <p className={s.notice} role="status">
                If an admin account uses that address, the reset link is on its way. Check the inbox and spam folder.
              </p>
            )}
            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={`btn btn--primary btn--block ${s.submit}`} disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Send the reset link'}
            </button>
            <button
              type="button"
              className={s.linkButton}
              onClick={() => {
                setMode('signIn');
                setError('');
              }}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
      <p className={s.signFoot}>Gieom.cloud · Prices published here appear on the pricing page straight away.</p>
    </main>
  );
}
