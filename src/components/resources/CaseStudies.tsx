'use client';

import { useState } from 'react';
import styles from './Resources.module.css';

interface CaseStudy {
  name: string;
  color: string;
  tags: string[];
  role: string;
  industry: string;
  title: string;
  body: string;
  results: [React.ReactNode, string][];
}

const ph = (s: string) => <span className="ph">{s}</span>;

const studies: CaseStudy[] = [
  {
    name: '[Bank name]',
    color: '#0F2D3D',
    tags: ['Financial services', 'Compliance', 'UAE'],
    role: 'Compliance officers',
    industry: 'Financial services',
    title: 'From 14 policy versions in three drives to one register with board sign-off recorded',
    body: 'How a mid-sized bank consolidated its AML, KYC and risk policies, linked them to CBUAE circulars, and walked its next inspection with the evidence pack open.',
    results: [
      [ph('[n]'), 'policies migrated and linked'],
      [<>{ph('[n]')} days</>, 'to first board-approved policy'],
    ],
  },
  {
    name: '[Advisory firm]',
    color: '#00807A',
    tags: ['Consultants', 'RCSA', 'India and GCC'],
    role: 'Consultants',
    industry: '',
    title: "Eleven client RCSAs a quarter with reports under each client's name",
    body: 'A GRC advisory firm moved its assessments off workbooks, standardised scoping from the registers, and cut the time from kick-off to report.',
    results: [
      [ph('[n]'), 'client deployments'],
      [<>{ph('[n]')}%</>, 'less time to report'],
    ],
  },
  {
    name: '[Insurer name]',
    color: '#B85E0A',
    tags: ['Insurance', 'Procedures', 'India'],
    role: '',
    industry: 'Insurance',
    title: 'One claims procedure across forty branches, with the recording on the step that varied',
    body: 'How an insurer drew its motor claims procedure in the SOP designer, attached screen recordings, and tracked assessor comprehension by branch.',
    results: [
      [ph('[n]'), 'branches on one procedure'],
      [<>{ph('[n]')}%</>, 'MCQ pass rate'],
    ],
  },
  {
    name: '[Hospital group]',
    color: '#2D55B8',
    tags: ['Healthcare', 'Accreditation'],
    role: '',
    industry: 'Healthcare',
    title: 'Survey-ready all year: review cycles that run themselves',
    body: 'A hospital group put 300 clinical and administrative policies on tracked review cycles with committee-specific approval and ward-level acknowledgement.',
    results: [
      [ph('[n]'), 'policies on cycle'],
      ['0', 'overdue reviews at survey'],
    ],
  },
  {
    name: '[NBFC name]',
    color: '#0E8A5F',
    tags: ['Financial services', 'Internal audit', 'India'],
    role: 'Internal audit',
    industry: 'Financial services',
    title: "Internal audit with read access to the live registers, not last quarter's export",
    body: "How an NBFC's third line moved from requested exports to independent, logged access, and what changed in the audit plan.",
    results: [
      [ph('[n]'), 'controls traced to clauses'],
      [ph('[n]'), 'hours saved per audit'],
    ],
  },
  {
    name: '[Public entity]',
    color: '#6F8793',
    tags: ['Public sector', 'Procurement'],
    role: '',
    industry: 'Public sector',
    title: 'Procurement policy traced to the article of law, approval through the directorate',
    body: 'A government entity linked its procurement policy and procedures to statute and ran approvals through legal and executive review with the record intact.',
    results: [
      [ph('[n]'), 'clauses linked to law'],
      [ph('[n]'), 'directorates on one chain'],
    ],
  },
];

const roleFilters = ['All', 'Compliance officers', 'Consultants', 'Internal audit'];
const industryFilters = ['Financial services', 'Insurance', 'Healthcare', 'Public sector'];

function CaseStudyFilters({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.filters} role="group" aria-label="Filter case studies">
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Role</span>
        {roleFilters.map((f) => (
          <button key={f} type="button" aria-pressed={value === f} onClick={() => onChange(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Industry</span>
        {industryFilters.map((f) => (
          <button key={f} type="button" aria-pressed={value === f} onClick={() => onChange(f)}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Case studies with role / industry filters. */
export function CaseStudies() {
  const [filter, setFilter] = useState('All');
  const visible = studies.filter((s) => filter === 'All' || s.role === filter || s.industry === filter);
  return (
    <>
      <CaseStudyFilters value={filter} onChange={setFilter} />
      <div className={styles.cases}>
        {visible.map((s) => (
          <a key={s.name} href="#" className={styles.case}>
            <div className={styles.caseLogo}>
              <i style={{ background: s.color }} aria-hidden="true" />
              <b>
                <span className="ph">{s.name}</span>
              </b>
            </div>
            <div className={styles.tags}>
              {s.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <div className={styles.results}>
              {s.results.map(([n, label], i) => (
                <div key={i}>
                  <b>{n}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
