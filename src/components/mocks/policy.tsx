import { Alert, Frame, Meter, Status, Table, Tr, mockStyles as s } from './primitives';

const registry = [
  {
    code: 'POL-0201',
    name: 'Account Opening Policy',
    owner: 'George Paul · Customer',
    v: 'v3.2',
    status: <Status tone="success">Published</Status>,
  },
  {
    code: 'POL-0115',
    name: 'AML and Sanctions Policy',
    owner: 'Sarah Chen · Compliance',
    v: 'v2.4',
    status: <Status tone="warning">In review</Status>,
  },
  {
    code: 'POL-0267',
    name: 'Credit Risk Management Policy',
    owner: 'David Lee · Risk',
    v: 'v2.1',
    status: <Status tone="info">Approval</Status>,
  },
  { code: 'POL-0302', name: 'IT Security — Incident Response', owner: 'James Wilson · IT', v: 'v1.1', status: <Status>Draft</Status> },
  {
    code: 'POL-0334',
    name: 'Data Protection & Privacy Policy',
    owner: 'Nina Patel · Compliance',
    v: 'v2.0',
    status: <Status tone="success">Published</Status>,
  },
];

export function RegistryTable() {
  return (
    <Frame>
      <Table cols="minmax(64px,auto) minmax(0,1fr) 64px minmax(96px,auto)">
        <Tr head>
          <span>Code</span>
          <span>Document</span>
          <span>Version</span>
          <span>Status</span>
        </Tr>
        {registry.map((r) => (
          <Tr key={r.code}>
            <span className={s.code}>{r.code}</span>
            <span>
              <b className={s.strong}>{r.name}</b>
              <span className={s.sub}>{r.owner}</span>
            </span>
            <span className={s.code}>{r.v}</span>
            <span>{r.status}</span>
          </Tr>
        ))}
      </Table>
    </Frame>
  );
}

export function AssistantCard() {
  return (
    <Frame>
      <div className={`${s.padLg} ${s.split2}`}>
        <div>
          <h4 className={s.h6}>You ask</h4>
          <div className={s.bubble}>
            Generate policy text for customer due diligence under AML regulations, referencing CBUAE standards.
          </div>
          <h4 className={s.h6} style={{ marginTop: 18 }}>
            Magpie AI drafts
          </h4>
          <div className={s.output}>
            The Bank shall conduct customer due diligence at onboarding and on an ongoing basis, in line with{' '}
            <span className="chip chip--reg">Reg · CBUAE §4.1</span> and read with <span className="chip chip--ctl">Ctrl</span> KYC-001,
            including identification and verification of beneficial owners.
          </div>
        </div>
        <div>
          <h4 className={s.h6}>Then</h4>
          <div className={s.action}>Insert at cursor</div>
          <div className={s.action}>Rephrase to organisation standards</div>
          <div className={s.action}>Check against existing policies for contradictions</div>
          <div className={s.action}>Suggest regulatory links for this section</div>
        </div>
      </div>
    </Frame>
  );
}

const ack = [
  { dept: 'Compliance', pct: 100, n: '38 / 38' },
  { dept: 'Retail banking', pct: 91, n: '412 / 451' },
  { dept: 'Treasury', pct: 78, n: '46 / 59' },
  { dept: 'Digital channels', pct: 62, n: '71 / 114' },
  { dept: 'Operations', pct: 55, n: '203 / 370' },
];

export function AckCard() {
  return (
    <Frame>
      <div className={s.padLg}>
        <div className={s.titleRow}>
          <b>Acknowledgement · AML and Sanctions Policy v2.4</b>
          <span className={s.metaSmall}>Published 12 May</span>
        </div>
        {ack.map((a) => (
          <div key={a.dept} className={s.meterRow}>
            <span>{a.dept}</span>
            <Meter value={a.pct} warn={a.pct < 60} />
            <span>{a.n}</span>
          </div>
        ))}
        <Alert>262 staff have not acknowledged · reminder scheduled for Monday</Alert>
      </div>
    </Frame>
  );
}

const stages = ['Setup', 'Draft', 'Co-create', 'Review', 'Approve', 'Board', 'Publish', 'Acknowledge'];

export function LifecycleRail() {
  const current = stages.indexOf('Review');
  return (
    <ol className={`${s.rail} reveal`} aria-label="Document lifecycle stages">
      {stages.map((stage, i) => (
        <li
          key={stage}
          className={[s.railStage, i === current ? s.railOn : '', i < current ? s.railDone : ''].join(' ')}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className={s.railDot} aria-hidden="true" />
          {stage}
        </li>
      ))}
    </ol>
  );
}
