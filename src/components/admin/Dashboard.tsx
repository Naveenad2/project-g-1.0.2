'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { database } from '@/lib/firebase';
import { CURRENCIES, formatPercent, formatPrice, parsePricing, savingOf, valuesOf, type Pricing, type PricingValues } from '@/lib/pricing';
import { routes } from '@/lib/routes';
import type { Account } from './AdminApp';
import { EMPTY, LABELS, changes, check, toDraft, type Draft, type FieldKey } from './draft';
import { writeMessage } from './errors';
import { PasswordDialog } from './PasswordDialog';
import s from './Admin.module.css';

interface HistoryEntry {
  id: string;
  at: number;
  by: string;
  pricing: PricingValues;
}

const when = (ms: number) =>
  new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(ms);

const summary = (p: PricingValues) =>
  `Starter ${formatPrice(p.starter.monthly, p.currency)} / ${formatPrice(p.starter.annual, p.currency)} · ` +
  `Professional ${formatPrice(p.professional.monthly, p.currency)} / ${formatPrice(p.professional.annual, p.currency)} · ` +
  `up to ${p.starter.seatCap.toLocaleString('en-US')} users · save ${formatPercent(p.annualSaving)}%`;

const same = (a: PricingValues, b: PricingValues) => JSON.stringify(valuesOf(a)) === JSON.stringify(valuesOf(b));

/**
 * The pricing editor. Everything here is live: the fields are the prices on the pricing page, the preview is
 * the page's cards with these values, and publishing writes them (with a history entry) in one step, after a
 * confirmation that lists every change.
 */
export function Dashboard({ account, onSignOut }: { account: Account; onSignOut: (message?: string) => void }) {
  const [live, setLive] = useState<Pricing | null | undefined>(undefined);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [connected, setConnected] = useState<boolean | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [remote, setRemote] = useState<Pricing | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [preview, setPreview] = useState<'annual' | 'monthly'>('annual');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  /** The published prices the form was last filled from (undefined until they first load). */
  const base = useRef<Pricing | null | undefined>(undefined);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const checked = useMemo(() => check(draft), [draft]);
  /** Differences from what is live (or, with nothing published, from the empty form). */
  const edits = useMemo(() => (live === undefined ? [] : changes(toDraft(live ? valuesOf(live) : null), draft)), [live, draft]);
  /** What publishing would change; with nothing published yet, every field is new. */
  const pending = useMemo(() => (live === undefined ? [] : changes(live ? toDraft(valuesOf(live)) : null, draft)), [live, draft]);
  const canPublish = !!checked.values && live !== undefined && (live === null || edits.length > 0) && connected !== false && !publishing;

  const say = useCallback((text: string, tone: 'ok' | 'error' = 'ok') => setToast({ text, tone }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), toast.tone === 'error' ? 9000 : 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // The published prices, the connection and the history, all live.
  useEffect(() => {
    const stops: (() => void)[] = [];
    let alive = true;
    Promise.all([database(), import('firebase/database')])
      .then(([db, { ref, onValue, query, limitToLast }]) => {
        if (!alive) return;
        stops.push(
          onValue(
            ref(db, 'pricing'),
            (snap) => {
              const next = parsePricing(snap.val());
              setLive(next);
              const previous = base.current;
              const form = draftRef.current;
              const formValues = check(form).values;
              const edited = previous !== undefined && changes(toDraft(previous ? valuesOf(previous) : null), form).length > 0;
              const ours = !!next && !!formValues && same(next, formValues);
              if (previous === undefined || !edited || ours) {
                // the first load, an untouched form, or this form's own publish: the form follows what is live
                base.current = next;
                setDraft(toDraft(next ? valuesOf(next) : null));
                setRemote(null);
                setTouched({});
              } else {
                // published from another session while this form has unpublished edits: keep the edits, offer the new prices
                setRemote(next);
              }
            },
            () => setLive(null),
          ),
        );
        stops.push(onValue(ref(db, '.info/connected'), (snap) => setConnected(snap.val() === true)));
        stops.push(
          onValue(
            query(ref(db, 'pricingHistory'), limitToLast(20)),
            (snap) => {
              const list: HistoryEntry[] = [];
              snap.forEach((child) => {
                const v = child.val() as { at?: unknown; by?: unknown; pricing?: unknown };
                const p = parsePricing(v?.pricing);
                if (p && typeof v.at === 'number' && typeof v.by === 'string')
                  list.push({ id: child.key!, at: v.at, by: v.by, pricing: valuesOf(p) });
              });
              setHistory(list.reverse());
            },
            () => setHistory([]),
          ),
        );
      })
      .catch(() => say('The database could not be reached. Reload the page to try again.', 'error'));
    return () => {
      alive = false;
      stops.forEach((stop) => stop());
    };
  }, [say]);

  // Leaving with unpublished changes asks first.
  const unsaved = edits.length > 0;
  useEffect(() => {
    if (!unsaved) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [unsaved]);

  // The account menu closes when you click or tap anywhere else.
  useEffect(() => {
    const close = (e: PointerEvent) => {
      const menu = menuRef.current;
      if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const set = (key: FieldKey, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const touch = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));

  const publish = async () => {
    const values = checked.values;
    if (!values) return;
    setPublishing(true);
    try {
      const [db, { ref, push, update, serverTimestamp }] = await Promise.all([database(), import('firebase/database')]);
      const id = push(ref(db, 'pricingHistory')).key;
      await update(ref(db), {
        pricing: { ...values, updatedAt: serverTimestamp(), updatedBy: account.email },
        [`pricingHistory/${id}`]: { at: serverTimestamp(), by: account.email, pricing: values },
      });
      confirmRef.current?.close();
      say('Published. The pricing page shows the new prices now.');
    } catch (error) {
      confirmRef.current?.close();
      say(writeMessage(error), 'error');
    } finally {
      setPublishing(false);
    }
  };

  const discard = () => {
    base.current = live;
    setDraft(toDraft(live ? valuesOf(live) : null));
    setTouched({});
    setRemote(null);
  };

  const loadRemote = () => {
    base.current = remote;
    setDraft(toDraft(remote ? valuesOf(remote) : null));
    setTouched({});
    setRemote(null);
  };

  const restore = (entry: HistoryEntry) => {
    setDraft(toDraft(entry.pricing));
    setTouched({});
    say(`Loaded the prices published ${when(entry.at)}. Publish them to make them live again.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const symbol = (() => {
    try {
      return (
        new Intl.NumberFormat('en-US', { style: 'currency', currency: draft.currency, currencyDisplay: 'narrowSymbol' })
          .formatToParts(0)
          .find((p) => p.type === 'currency')?.value ?? draft.currency
      );
    } catch {
      return draft.currency;
    }
  })();

  const field = (key: FieldKey, label: string, hint: string, kind: 'price' | 'whole' | 'percent') => {
    const error = touched[key] ? checked.errors[key] : undefined;
    return (
      <div className={s.field}>
        <label className={s.label} htmlFor={`f-${key}`}>
          {label}
        </label>
        <div className={`${s.affix} ${error ? s.invalid : ''}`}>
          {kind === 'price' && <span className={s.prefix}>{symbol}</span>}
          <input
            id={`f-${key}`}
            className={s.input}
            inputMode={kind === 'price' || kind === 'percent' ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={draft[key]}
            onChange={(e) => set(key, e.target.value)}
            onBlur={() => touch(key)}
            aria-invalid={!!error}
            aria-describedby={`f-${key}-hint`}
          />
          {kind === 'percent' && <span className={s.suffix}>%</span>}
          {kind === 'whole' && <span className={s.suffix}>users</span>}
        </div>
        <p id={`f-${key}-hint`} className={error ? s.fieldError : s.hint}>
          {error ?? hint}
        </p>
      </div>
    );
  };

  const savingLine = (monthly: FieldKey, annual: FieldKey) => {
    const m = Number(draft[monthly]);
    const a = Number(draft[annual]);
    if (checked.errors[monthly] || checked.errors[annual]) return null;
    const saving = savingOf({ monthly: m, annual: a });
    if (saving === null) return <p className={s.calc}>Free when billed monthly.</p>;
    if (saving < 0) return <p className={`${s.calc} ${s.warnText}`}>Annual billing costs more than monthly.</p>;
    return (
      <p className={s.calc}>
        Annual billing is {formatPercent(saving)}% lower ({formatPrice(m - a, draft.currency)} less per user per month).
      </p>
    );
  };

  const v = checked.values;
  const cardPrice = (t: 'starter' | 'professional') => (v ? formatPrice(v[t][preview], v.currency) : '—');

  return (
    <div className={s.app}>
      <header className={s.top}>
        <div className={s.topInner}>
          <div className={s.brand}>
            <Logo height={20} />
            <span className={s.brandTag}>Pricing admin</span>
          </div>
          <div className={s.topRight}>
            <span className={`${s.conn} ${connected === false ? s.connOff : ''}`} role="status" aria-live="polite">
              <span className={s.connMark} aria-hidden="true" />
              {connected === null ? 'Connecting…' : connected ? 'Connected' : 'Offline, reconnecting…'}
            </span>
            <details ref={menuRef} className={s.account}>
              <summary aria-label={`Account: ${account.email}`}>
                <span className={s.accountEmail}>{account.email}</span>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className={s.menu}>
                <p className={s.menuEmail}>{account.email}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget.closest('details') as HTMLDetailsElement).open = false;
                    setPasswordOpen(true);
                  }}
                >
                  Change password
                </button>
                <a href={routes.pricing} target="_blank" rel="noopener">
                  Open the pricing page
                </a>
                <button type="button" onClick={() => onSignOut()}>
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className={s.main}>
        <div className={s.titleRow}>
          <div>
            <h1 className={s.pageTitle}>Prices</h1>
            <p className={s.pageSub}>
              {live === undefined
                ? 'Loading the published prices…'
                : live
                  ? `Last published ${live.updatedAt ? when(live.updatedAt) : ''}${live.updatedBy ? ` by ${live.updatedBy}` : ''}.`
                  : 'Nothing published yet. Until you publish, the pricing page shows placeholders.'}
            </p>
          </div>
        </div>

        {remote !== null && (
          <div className={s.banner} role="alert">
            <span>Prices were published from another session while you were editing.</span>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadRemote}>
              Load the latest
            </button>
          </div>
        )}

        <div className={s.grid}>
          <div className={s.col}>
            <section className={s.card} aria-labelledby="sec-billing">
              <h2 id="sec-billing" className={s.cardTitle}>
                Billing
              </h2>
              <p className={s.cardSub}>Used for every price on the page.</p>
              <div className={s.fields2}>
                <div className={s.field}>
                  <label className={s.label} htmlFor="f-currency">
                    {LABELS.currency}
                  </label>
                  <select id="f-currency" className={s.input} value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} · {c.name}
                      </option>
                    ))}
                  </select>
                  <p className={s.hint}>Example: {formatPrice(1299, draft.currency)}</p>
                </div>
                {field(
                  'annualSaving',
                  LABELS.annualSaving,
                  `The switch reads “Annual · save ${draft.annualSaving.trim() || '…'}%”.`,
                  'percent',
                )}
              </div>
            </section>

            <section className={s.card} aria-labelledby="sec-starter">
              <h2 id="sec-starter" className={s.cardTitle}>
                Starter
              </h2>
              <p className={s.cardSub}>Prices per user per month.</p>
              <div className={s.fields2}>
                {field('starterMonthly', 'Billed monthly', 'Shown with “billed monthly”', 'price')}
                {field('starterAnnual', 'Billed annually', 'Shown with “billed annually”', 'price')}
              </div>
              {savingLine('starterMonthly', 'starterAnnual')}
              <div className={s.fields2}>
                {field('seatCap', 'User limit', `Shown as “Self-serve checkout · up to ${draft.seatCap.trim() || '…'} users”`, 'whole')}
              </div>
            </section>

            <section className={s.card} aria-labelledby="sec-pro">
              <h2 id="sec-pro" className={s.cardTitle}>
                Professional
              </h2>
              <p className={s.cardSub}>Prices per user per month. Marked “Most chosen” on the page.</p>
              <div className={s.fields2}>
                {field('proMonthly', 'Billed monthly', 'Shown with “billed monthly”', 'price')}
                {field('proAnnual', 'Billed annually', 'Shown with “billed annually”', 'price')}
              </div>
              {savingLine('proMonthly', 'proAnnual')}
            </section>

            <section className={`${s.card} ${s.muted}`} aria-labelledby="sec-ent">
              <h2 id="sec-ent" className={s.cardTitle}>
                Enterprise
              </h2>
              <p className={s.cardSub}>Shown as “Custom · annual contract” with a “Contact sales” button, so there is no price to set.</p>
            </section>
          </div>

          <div className={s.col}>
            <section className={s.card} aria-labelledby="sec-preview">
              <div className={s.cardHead}>
                <h2 id="sec-preview" className={s.cardTitle}>
                  Preview
                </h2>
                <div className={s.seg} role="group" aria-label="Preview billing period">
                  <button type="button" aria-pressed={preview === 'monthly'} onClick={() => setPreview('monthly')}>
                    Monthly
                  </button>
                  <button type="button" aria-pressed={preview === 'annual'} onClick={() => setPreview('annual')}>
                    Annual · save {draft.annualSaving.trim() || '…'}%
                  </button>
                </div>
              </div>
              <p className={s.cardSub}>How the cards on the pricing page will read with these values.</p>
              <div className={s.previewCards}>
                <div className={s.pCard}>
                  <b>Starter</b>
                  <span className={s.pPrice}>{cardPrice('starter')}</span>
                  <small>/ user / month, billed {preview === 'annual' ? 'annually' : 'monthly'}</small>
                  <small className={s.pNote}>Self-serve checkout · up to {v ? v.starter.seatCap.toLocaleString('en-US') : '—'} users</small>
                </div>
                <div className={`${s.pCard} ${s.pRec}`}>
                  <b>Professional</b>
                  <span className={s.pPrice}>{cardPrice('professional')}</span>
                  <small>/ user / month, billed {preview === 'annual' ? 'annually' : 'monthly'}</small>
                </div>
                <div className={s.pCard}>
                  <b>Enterprise</b>
                  <span className={s.pPrice}>Custom</span>
                  <small>· annual contract</small>
                </div>
              </div>
              {checked.warnings.length > 0 && (
                <ul className={s.warnings}>
                  {checked.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className={s.card} aria-labelledby="sec-history">
              <h2 id="sec-history" className={s.cardTitle}>
                History
              </h2>
              <p className={s.cardSub}>
                The last 20 publishes. Loading one puts its prices in the form; nothing changes until you publish.
              </p>
              {history === null ? (
                <p className={s.hint}>Loading…</p>
              ) : history.length === 0 ? (
                <p className={s.hint}>Nothing published yet.</p>
              ) : (
                <ol className={s.history}>
                  {history.map((h, i) => (
                    <li key={h.id}>
                      <div className={s.hMeta}>
                        <b>{when(h.at)}</b>
                        <span>{h.by}</span>
                        {i === 0 && live && same(live, h.pricing) && <span className={s.hLive}>Live now</span>}
                      </div>
                      <p className={s.hSum}>{summary(h.pricing)}</p>
                      <button type="button" className={s.linkButton} onClick={() => restore(h)}>
                        Load into the form
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      </main>

      <div className={s.bar}>
        <div className={s.barInner}>
          <p className={s.barText} aria-live="polite">
            {live === undefined
              ? 'Loading…'
              : connected === false
                ? 'Offline. Publishing is paused until the connection returns.'
                : !checked.values
                  ? 'Fix the highlighted fields to publish.'
                  : live === null
                    ? 'Ready for the first publish.'
                    : edits.length
                      ? `${edits.length} unpublished change${edits.length === 1 ? '' : 's'}`
                      : 'Everything here is live.'}
          </p>
          <div className={s.row}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={discard} disabled={!unsaved || publishing}>
              Discard
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={!canPublish}
              onClick={() => {
                setTouched(Object.fromEntries(Object.keys(draft).map((k) => [k, true])));
                if (checked.values) confirmRef.current?.showModal();
              }}
            >
              Publish prices
            </button>
          </div>
        </div>
      </div>

      <dialog ref={confirmRef} className={s.dialog} aria-labelledby="confirm-title" data-lenis-prevent="">
        <h2 id="confirm-title" className={s.cardTitle}>
          Publish these prices?
        </h2>
        <p className={s.cardSub}>They go live on the pricing page as soon as you confirm.</p>
        <table className={s.diff}>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Now</th>
              <th scope="col">New</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((c) => (
              <tr key={c.key}>
                <th scope="row">{LABELS[c.key]}</th>
                <td>{c.before}</td>
                <td>
                  <b>{c.after}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {checked.warnings.length > 0 && (
          <ul className={s.warnings}>
            {checked.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        <div className={`${s.row} ${s.dialogActions}`}>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => confirmRef.current?.close()} disabled={publishing}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => void publish()} disabled={publishing}>
            {publishing ? 'Publishing…' : 'Publish now'}
          </button>
        </div>
      </dialog>

      {passwordOpen && (
        <PasswordDialog
          email={account.email}
          onClose={(done) => {
            setPasswordOpen(false);
            if (done) say('Password changed. Use the new one next time you sign in.');
          }}
        />
      )}

      <div className={s.toastWrap} aria-live="polite">
        {toast && (
          <div className={`${s.toast} ${toast.tone === 'error' ? s.toastError : ''}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}
