'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { authentication, database } from '@/lib/firebase';
import { Dashboard } from './Dashboard';
import { isPermissionDenied } from './errors';
import { Setup } from './Setup';
import { SignIn } from './SignIn';
import s from './Admin.module.css';

export interface Account {
  uid: string;
  email: string;
}

type Phase =
  | { name: 'starting' }
  | { name: 'signedOut'; notice?: string }
  | { name: 'checking'; account: Account }
  | { name: 'admin'; account: Account }
  | { name: 'notAdmin'; account: Account }
  | { name: 'failed'; account?: Account; message: string };

/** Signed in but untouched for this long: the session ends. */
const IDLE_MS = 30 * 60 * 1000;

/**
 * The pricing admin. Sign in with the admin account (Firebase Authentication); the account's right to publish
 * is then confirmed with the database itself, since only the admin may read the publishing history. The session
 * lasts for this tab only and ends after 30 minutes without activity.
 */
export function AdminApp() {
  const [phase, setPhase] = useState<Phase>({ name: 'starting' });
  const notice = useRef<string | undefined>(undefined);
  const current = useRef<string | null>(null);

  /** Only the admin may read the history, so reading it proves the account can publish. */
  const confirm = useCallback(async (account: Account) => {
    setPhase({ name: 'checking', account });
    try {
      const [db, { ref, get, query, limitToLast }] = await Promise.all([database(), import('firebase/database')]);
      await get(query(ref(db, 'pricingHistory'), limitToLast(1)));
      setPhase({ name: 'admin', account });
    } catch (error) {
      if (isPermissionDenied(error)) setPhase({ name: 'notAdmin', account });
      else
        setPhase({
          name: 'failed',
          account,
          message: 'The database could not be reached. Check the internet connection, then try again.',
        });
    }
  }, []);

  useEffect(() => {
    let stop = () => {};
    let alive = true;
    Promise.all([authentication(), import('firebase/auth')])
      .then(([auth, { onAuthStateChanged }]) => {
        if (!alive) return;
        stop = onAuthStateChanged(auth, (user) => {
          if (user && user.email) {
            if (current.current === user.uid) return;
            current.current = user.uid;
            void confirm({ uid: user.uid, email: user.email });
          } else {
            current.current = null;
            setPhase({ name: 'signedOut', notice: notice.current });
            notice.current = undefined;
          }
        });
      })
      .catch(() => {
        if (alive)
          setPhase({ name: 'failed', message: 'Firebase could not be loaded. Check the internet connection and reload the page.' });
      });
    return () => {
      alive = false;
      stop();
    };
  }, [confirm]);

  const signOut = useCallback(async (message?: string) => {
    notice.current = message;
    const [auth, { signOut: end }] = await Promise.all([authentication(), import('firebase/auth')]);
    await end(auth);
  }, []);

  // A session left alone for 30 minutes ends.
  const signedIn = phase.name === 'admin' || phase.name === 'notAdmin' || phase.name === 'checking';
  useEffect(() => {
    if (!signedIn) return;
    const end = () => void signOut('You were signed out after 30 minutes without activity. Unpublished changes were not saved.');
    let timer = window.setTimeout(end, IDLE_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(end, IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [signedIn, signOut]);

  switch (phase.name) {
    case 'starting':
    case 'checking':
      return (
        <div className={s.center} role="status" aria-live="polite">
          <span className={s.spinner} aria-hidden="true" />
          <span>{phase.name === 'checking' ? 'Checking this account…' : 'Loading…'}</span>
        </div>
      );
    case 'signedOut':
      return <SignIn notice={phase.notice} />;
    case 'notAdmin':
      return <Setup account={phase.account} onCheck={() => void confirm(phase.account)} onSignOut={() => void signOut()} />;
    case 'failed':
      return (
        <div className={s.center} role="alert">
          <p className={s.failText}>{phase.message}</p>
          <div className={s.row}>
            {phase.account ? (
              <>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => void confirm(phase.account!)}>
                  Try again
                </button>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => void signOut()}>
                  Sign out
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>
                Reload
              </button>
            )}
          </div>
        </div>
      );
    case 'admin':
      return <Dashboard account={phase.account} onSignOut={(message) => void signOut(message)} />;
  }
}
