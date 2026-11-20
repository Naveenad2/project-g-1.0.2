'use client';

import { Logo } from '@/components/ui/Logo';
import type { Account } from './AdminApp';
import { RulesBlock } from './Rules';
import s from './Admin.module.css';

/**
 * Signed in, but the database does not let this account publish: either the security rules have not been
 * published yet, or they name a different admin. Shows the rules with this account filled in, ready to paste.
 */
export function Setup({ account, onCheck, onSignOut }: { account: Account; onCheck: () => void; onSignOut: () => void }) {
  return (
    <main className={s.signPage}>
      <div className={`${s.signCard} ${s.setupCard}`}>
        <div className={s.brand}>
          <Logo height={22} />
          <span className={s.brandTag}>Pricing admin</span>
        </div>
        <h1 className={s.signTitle}>One step left</h1>
        <p className={s.signSub}>
          You are signed in as <b>{account.email}</b>, but the database does not let this account publish prices yet. Publish the security
          rules below once, and this account becomes the only one that can change the prices.
        </p>
        <ol className={s.steps}>
          <li>
            Open the Firebase console, project <b>gieom-cloud</b> → <b>Realtime Database</b> → <b>Rules</b>.
          </li>
          <li>Replace everything in the editor with the rules below (this account is already filled in), then press Publish.</li>
          <li>Come back here and press “Check again”.</li>
        </ol>
        <RulesBlock uid={account.uid} />
        <div className={s.row}>
          <button type="button" className="btn btn--primary btn--sm" onClick={onCheck}>
            Check again
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
