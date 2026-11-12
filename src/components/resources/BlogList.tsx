'use client';

import { useState } from 'react';
import styles from './Resources.module.css';

const categories = ['All', 'Regulatory news', 'Product updates', 'GRC practice', 'For consultants'];

const posts: { cat: string; mins: string; title: string; body: string }[] = [
  {
    cat: 'Product updates',
    mins: '4 min',
    title: 'Regulatory change tracking now starts the re-review for you',
    body: 'A changed clause in the library lists every document that cites it and opens a review workflow with the owner. Here is how it works and what to configure.',
  },
  {
    cat: 'GRC practice',
    mins: '9 min',
    title: 'Acknowledgement is not evidence of understanding. What auditors actually accept.',
    body: 'A tick-box tells you a page was opened. Three ways to show comprehension without turning every policy into a training course.',
  },
  {
    cat: 'For consultants',
    mins: '6 min',
    title: "Running ten clients' RCSAs: a workflow that scales",
    body: 'How advisory firms structure workspaces, templates and reviewer roles so the tenth engagement is a process rather than a project.',
  },
  {
    cat: 'Regulatory news',
    mins: '5 min',
    title: "RBI's KYC Master Direction: the clauses most policies miss",
    body: 'Coverage data across sample policy sets points at the same handful of clauses. A checklist for your next review.',
  },
  {
    cat: 'GRC practice',
    mins: '8 min',
    title: 'Why your risk register and your policy index disagree and how to stop it',
    body: 'Three files maintained by three people will drift. The fix is structural rather than disciplinary.',
  },
  {
    cat: 'Product updates',
    mins: '3 min',
    title: 'The SOP designer: drawing procedures with roles and recordings',
    body: 'Swim lanes, decision points, and a screen recording on the step that needs it. What shipped and what is next.',
  },
  {
    cat: 'GRC practice',
    mins: '7 min',
    title: 'Board approval tiers: when a policy needs the committee, and when it does not',
    body: 'A practical split used by banks in the GCC, and how to encode it as a platform setting rather than a habit.',
  },
  {
    cat: 'For consultants',
    mins: '5 min',
    title: 'Handover: leaving a client with a system instead of a binder',
    body: 'What to transfer, what to retain as reviewer, and how to price the retained relationship.',
  },
];

export function BlogList() {
  const [cat, setCat] = useState('All');
  const visible = posts.filter((p) => cat === 'All' || p.cat === cat);

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter articles by category">
        <div className={styles.filterGroup}>
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.posts}>
        {visible.map((p) => (
          <a key={p.title} href="#" className={styles.post}>
            <p className={styles.meta}>
              <b>{p.cat}</b>
              <span aria-hidden="true">·</span>
              <span>{p.mins}</span>
            </p>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </a>
        ))}
      </div>
    </>
  );
}
