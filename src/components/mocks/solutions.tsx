import type { ReactNode } from 'react';
import { Bar, Frame, Lane, Status, Table, Tr, mockStyles as s } from './primitives';
import m from './solutions.module.css';

/* Compliance officers */
export function EvidencePack() {
  const rows: [string, string, ReactNode][] = [
    [
      'Current version',
      'v2.4, published 12 May',
      <Status key="a" tone="success">
        Locked
      </Status>,
    ],
    [
      'Approved by',
      'Head of Compliance, Board Risk Committee',
      <Status key="b" tone="success">
        Signed
      </Status>,
    ],
    [
      'Regulatory basis',
      'CBUAE AML Circular 2023 (12 of 14 clauses), FATF R.10',
      <Status key="c" tone="success">
        Linked
      </Status>,
    ],
    [
      'Acknowledged',
      '770 of 1,032 staff · reminders running',
      <Status key="d" tone="warning" strong>
        75%
      </Status>,
    ],
    [
      'Previous versions',
      'v2.3, v2.2, v2.1 archived with history',
      <Status key="e" tone="success">
        Kept
      </Status>,
    ],
  ];
  return (
    <Frame>
      <div className={s.padLg}>
        <p className={s.kicker}>Evidence pack · AML and Sanctions Policy</p>
        {rows.map(([k, v, st]) => (
          <div key={k} className={s.listRow}>
            <span>
              <b className={s.strong}>{k}</b>
              <span className={s.sub}>{v}</span>
            </span>
            {st}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Consultants */
const engagement: { n: string; title: string; detail: string; who: string; tone: 'success' | 'warning' | 'neutral'; status: string }[] = [
  {
    n: '1',
    title: 'Deployment created and branded',
    detail: 'alnoor.blueprint.gieom.cloud · client logo and colours applied',
    who: 'Priya N.',
    tone: 'success',
    status: 'Done',
  },
  {
    n: '2',
    title: 'Registers loaded',
    detail: 'IRDAI, CBUAE Insurance, DFSA · from the included registers',
    who: 'Priya N.',
    tone: 'success',
    status: 'Done',
  },
  {
    n: '3',
    title: 'Policy framework imported',
    detail: "18 policies from the firm's templates · 14 linked to clauses",
    who: 'You',
    tone: 'warning',
    status: 'In progress',
  },
  {
    n: '4',
    title: 'RCSA scoped',
    detail: 'Underwriting and claims · 28 controls · respondents invited',
    who: 'Rahul M.',
    tone: 'neutral',
    status: 'Next',
  },
];

export function EngagementHub() {
  return (
    <Frame>
      <Bar title="Al Noor Insurance · deployment" meta="Engagement week 2" />
      <Table cols="28px minmax(0,1fr) 64px 100px" minWidth={440}>
        {engagement.map((e) => (
          <Tr key={e.n}>
            <span className={m.step} data-tone={e.tone}>
              {e.n}
            </span>
            <span>
              <b className={s.strong}>{e.title}</b>
              <span className={s.sub}>{e.detail}</span>
            </span>
            <span className={s.metaSmall}>{e.who}</span>
            <span className={s.right}>
              <Status tone={e.tone}>{e.status}</Status>
            </span>
          </Tr>
        ))}
      </Table>
    </Frame>
  );
}

/** Two report covers presented as standing 3D booklets. */
export function WhiteLabelCovers() {
  return (
    <div className={m.covers}>
      <div className={`${m.cover} ${m.coverA}`}>
        <span className={m.coverLogo} style={{ background: '#0F2D3D' }} />
        <b>RCSA Q3 · Retail banking</b>
        <span>Prepared for Kuwait Finance House</span>
        <i />
        <i className={m.short} />
        <i />
      </div>
      <div className={`${m.cover} ${m.coverB}`}>
        <span className={m.coverLogo} style={{ background: '#00807A' }} />
        <b>Policy framework review</b>
        <span>Prepared for Al Noor Insurance</span>
        <i />
        <i className={m.short} />
        <i />
      </div>
    </div>
  );
}

/* Internal audit */
const controls: { name: string; detail: string; tested: string; tone: 'success' | 'warning' | 'danger'; result: string }[] = [
  {
    name: 'AML-C-002 Sanctions screening',
    detail: 'Automated · quarterly · owner: S. Chen',
    tested: 'Q3 RCSA · 14 Sep',
    tone: 'success',
    result: 'Effective',
  },
  {
    name: 'AML-C-001 STR filing window',
    detail: 'Manual · monthly · owner: R. Mehta',
    tested: 'Q3 RCSA · 14 Sep',
    tone: 'warning',
    result: 'Partial',
  },
  {
    name: 'OPS-C-014 Dormant account review',
    detail: 'Manual · quarterly · owner: M. Brown',
    tested: 'Q1 RCSA · 12 Mar',
    tone: 'danger',
    result: 'Overdue test',
  },
  {
    name: 'KYC-001 Enhanced due diligence',
    detail: 'Manual · monthly · owner: L. Chen',
    tested: 'Q3 RCSA · 14 Sep',
    tone: 'success',
    result: 'Effective',
  },
];

export function ControlTesting() {
  return (
    <Frame>
      <Table cols="minmax(0,1fr) 110px 108px" minWidth={460}>
        <Tr head>
          <span>Control</span>
          <span>Last tested</span>
          <span className={s.right}>Result</span>
        </Tr>
        {controls.map((c) => (
          <Tr key={c.name}>
            <span>
              <b className={s.strong}>{c.name}</b>
              <span className={s.sub}>{c.detail}</span>
            </span>
            <span className={s.metaSmall}>{c.tested}</span>
            <span className={s.right}>
              <Status tone={c.tone}>{c.result}</Status>
            </span>
          </Tr>
        ))}
      </Table>
    </Frame>
  );
}

const log: [string, string, string][] = [
  ['14 Sep 10:42', 'S. Chen', 'rated AML-C-002 Effective · evidence: screening_log_Q3.csv'],
  ['14 Sep 11:05', 'R. Mehta', 'rated AML-C-001 Partial · comment thread #412'],
  ['15 Sep 09:12', 'P. Nair', 'reviewed RCSA Q3 · Retail · 2 ratings challenged'],
  ['16 Sep 14:30', 'Workflow', 'escalated OPS-C-014 test overdue → Head of Operations'],
  ['18 Sep 16:01', 'D. Lee', 'approved Credit Risk Policy v2.1 · board tier pending'],
  ['19 Sep 08:55', 'Report', 'RCSA-Q3-Retail.pdf generated by S. Chen'],
];

export function AuditLog() {
  return (
    <Frame>
      <div className={m.log}>
        {log.map(([t, who, what]) => (
          <div key={t} className={m.logRow}>
            <time>{t}</time>
            <span>
              <b>{who}</b> {what}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Financial services */
export function PolicyExcerpt() {
  const path = ['Author', 'Compliance review', 'CCO', 'Board Risk Committee', 'Publish'];
  const current = path.indexOf('Board Risk Committee');
  return (
    <Frame>
      <div className={s.padLg}>
        <h4 className={s.h6}>From a sample policy in the trial</h4>
        <b className={s.strong}>AML and Sanctions Policy · §4.2 Transaction monitoring</b>
        <p className={m.excerpt}>
          All alerts shall be reviewed within five (5) business days. STRs must be filed with the FIU per{' '}
          <span className="chip chip--reg">Reg · CBUAE AML 2023 §7.2</span>, governed by{' '}
          <span className="chip chip--ctl">Ctrl · AML-C-001</span>. Risk: <span className="chip chip--risk">Risk · AML-R-03</span>.
        </p>
        <h4 className={s.h6} style={{ marginTop: 20 }}>
          Approval path
        </h4>
        <ol className={m.path}>
          {path.map((p, i) => (
            <li key={p} className={i < current ? m.pathDone : i === current ? m.pathOn : undefined}>
              {p}
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}

/* Insurance */
export function ClaimFlow() {
  return (
    <Frame>
      <div className={s.padLg}>
        <div className={s.titleRow}>
          <b>Motor claim assessment · SOP v3.1</b>
          <Status tone="success">Published</Status>
        </div>
        <Lane
          steps={[
            { title: 'Register claim', sub: 'Claims desk' },
            { title: 'Verify cover', sub: 'Underwriting' },
            { title: 'Survey needed?', sub: 'Claims assessor', kind: 'decision' },
            { title: 'Assess and reserve', sub: 'Claims assessor' },
            { title: 'Settle', sub: 'Finance', kind: 'end' },
          ]}
        />
        <span className={s.recording}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="1.5" y="4.5" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="m13.5 8.5 5-3v9l-5-3z" fill="currentColor" />
          </svg>
          1:12 recording on &ldquo;Assess and reserve&rdquo;
        </span>
      </div>
    </Frame>
  );
}

/* Healthcare */
const cycle: { name: string; detail: string; tone: 'warning' | 'success' | 'danger'; status: string }[] = [
  {
    name: 'Infection Prevention and Control Policy',
    detail: 'v6.0 · review due 14 Oct · owner: Dir. Nursing',
    tone: 'warning',
    status: 'Due 30d',
  },
  { name: 'Medication Management Policy', detail: 'v4.2 · reviewed 2 Jun · next Jun 2027', tone: 'success', status: 'Current' },
  { name: 'Patient Identification Procedure', detail: 'v2.1 · acknowledgement 88% · MCQ avg 91%', tone: 'success', status: 'Current' },
  { name: 'Consent for Treatment Policy', detail: 'v3.0 · review overdue by 12 days', tone: 'danger', status: 'Overdue' },
  { name: 'Patient Data Handling Procedure', detail: 'v1.4 · linked to DPDP, PDPL · 3 clauses uncovered', tone: 'warning', status: 'Gaps' },
];

export function ReviewCycle() {
  return (
    <Frame>
      <div className={s.padLg}>
        <p className={s.kicker}>Review cycle · Clinical governance</p>
        {cycle.map((c) => (
          <div key={c.name} className={s.listRow}>
            <span>
              <b className={s.strong}>{c.name}</b>
              <span className={s.sub}>{c.detail}</span>
            </span>
            <Status tone={c.tone}>{c.status}</Status>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Public sector */
export function Cascade() {
  return (
    <Frame>
      <div className={s.padLg}>
        <p className={s.kicker}>Cascade · Procurement</p>
        <div className={m.level} data-depth="0">
          <b>Public Procurement Law, Art. 12–18</b>
          <small>Regulations Library · statutory basis</small>
        </div>
        <ul className={m.tree}>
          <li>
            <div className={m.level} data-depth="1">
              <b>Entity Procurement Policy v4</b>
              <small>Approved by Director General · 14 clauses linked</small>
              <div className={s.chips}>
                <span className="chip chip--reg">Reg · Art. 14(2)</span>
                <span className="chip chip--reg">Reg · Art. 16</span>
              </div>
            </div>
            <ul className={m.tree}>
              <li>
                <div className={m.level} data-depth="2">
                  <b>Tender Evaluation Procedure</b>
                  <small>Directorate of Finance · flow with recorded e-procurement steps</small>
                </div>
              </li>
              <li>
                <div className={m.level} data-depth="2">
                  <b>Vendor Registration Procedure</b>
                  <small>Directorate of Finance · MCQ for evaluation committee</small>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </Frame>
  );
}
