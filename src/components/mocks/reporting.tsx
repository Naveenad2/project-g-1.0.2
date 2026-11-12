import { Frame, Switch, mockStyles as s } from './primitives';

const runs = [40, 55, 48, 70, 62, 80, 74, 92];

export function Dashboard() {
  return (
    <Frame>
      <div className={s.dash}>
        <div className={s.widget}>
          <h4 className={s.h6}>Policies due for review</h4>
          <b className={s.big}>7</b>
          <span className={s.sub}>3 within 30 days</span>
        </div>
        <div className={s.widget}>
          <h4 className={s.h6}>Approvals overdue</h4>
          <b className={`${s.big} ${s.bad}`}>2</b>
          <span className={s.sub}>Oldest: 9 days</span>
        </div>
        <div className={s.widget}>
          <h4 className={s.h6}>Acknowledgement</h4>
          <div className={s.donut}>
            <span className={s.ring} aria-hidden="true" />
            <div className={s.legend}>
              <span>
                <b>71%</b> signed
              </span>
              <span>
                <b>15%</b> reminded
              </span>
              <span>
                <b>14%</b> open
              </span>
            </div>
          </div>
        </div>
        <div className={`${s.widget} ${s.widgetWide}`}>
          <h4 className={s.h6}>Workflow runs completed · last 8 weeks</h4>
          <div className={s.bars} aria-hidden="true">
            {runs.map((h, i) => (
              <i key={i} className={i === runs.length - 1 ? s.barOn : undefined} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className={s.widget}>
          <h4 className={s.h6}>Regulatory coverage</h4>
          {[
            ['CBUAE AML', '86%'],
            ['DFSA AML', '91%'],
            ['RBI KYC', '58%'],
            ['FATF R.10', '100%'],
          ].map(([k, v]) => (
            <div key={k} className={s.prop} style={{ padding: '4px 0', borderTop: 0 }}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

const ackRows = [
  ['Compliance', '38', '38', '100%'],
  ['Retail banking', '451', '412', '91%'],
  ['Treasury', '59', '46', '78%'],
  ['Digital channels', '114', '71', '62%'],
  ['Operations', '370', '203', '55%'],
];

export function ReportDesigner() {
  return (
    <Frame>
      <div className={s.padLg}>
        <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <h4 className={s.h6}>Data sources</h4>
          <div className={s.sources}>
            <span>Documents</span>
            <span className={s.sourceOn}>Acknowledgements</span>
            <span>Workflow runs</span>
            <span>Risks</span>
            <span>Controls</span>
            <span>Regulations</span>
            <span>Assessments</span>
          </div>
        </div>
        <div>
          <h4 className={s.h6}>Acknowledgement by department · AML Policy v2.4</h4>
          <table className={s.dataTable}>
            <thead>
              <tr>
                <th>Department</th>
                <th>Required</th>
                <th>Done</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {ackRows.map(([d, r, dn, rate]) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>{r}</td>
                  <td>{dn}</td>
                  <td>{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={s.chips} style={{ marginTop: 14 }}>
            <span className={`${s.tool} ${s.toolPrimary}`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Schedule weekly
            </span>
            <span className={s.tool}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M8 2v8m-3.2-3.2L8 10l3.2-3.2M3 13.5h10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Export PDF · CSV
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function PlatformSettings() {
  const rows: [string, string, boolean | null][] = [
    ['Magpie AI co-pilot', 'Enabled', true],
    ['Board approval tier', 'Enabled · policies only', true],
    ['Acknowledgement reminders', 'Weekly, Monday 09:00', null],
    ['Branding preset', 'Kuwait Finance House', null],
    ['Single sign-on', 'SAML · configured', null],
  ];
  return (
    <Frame>
      <div className={s.padLg}>
        <p className={s.kicker}>Platform settings</p>
        {rows.map(([k, v, on]) => (
          <div key={k} className={s.kv}>
            <span>{k}</span>
            <b className={on ? s.ok : s.ink}>
              {v}
              {on !== null && <Switch on={on} />}
            </b>
          </div>
        ))}
      </div>
    </Frame>
  );
}
