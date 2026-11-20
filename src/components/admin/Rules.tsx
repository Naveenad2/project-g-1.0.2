'use client';

import { useMemo, useState } from 'react';
import rulesTemplate from '../../../database.rules.json';
import s from './Admin.module.css';

/** The security rules with an account filled in as the admin, ready to copy into the Firebase console. */
export function RulesBlock({ uid }: { uid: string }) {
  const rules = useMemo(() => JSON.stringify(rulesTemplate, null, 2).replaceAll('ADMIN_UID', uid), [uid]);
  const [copied, setCopied] = useState(false);
  const id = `rules-${uid}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rules);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked: select the text so it can be copied by hand
      const pre = document.getElementById(id);
      if (pre) window.getSelection()?.selectAllChildren(pre);
    }
  };

  return (
    <>
      <div className={s.rulesHead}>
        <span>Account ID: {uid}</span>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => void copy()}>
          {copied ? 'Copied' : 'Copy the rules'}
        </button>
      </div>
      <pre id={id} className={s.rules} tabIndex={0} data-lenis-prevent="" data-rules="">
        {rules}
      </pre>
    </>
  );
}
