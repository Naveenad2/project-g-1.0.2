import { Frame, Meter, Table, Tr, mockStyles as s } from './primitives';

const library = [
  { name: 'CBUAE AML Circular 2023', src: 'Central Bank of the UAE · 14 clauses', pct: 86, n: '12 / 14' },
  { name: 'FATF Recommendation 10 — CDD', src: 'FATF · 6 clauses', pct: 100, n: '6 / 6' },
  { name: 'RBI Master Direction on KYC', src: 'Reserve Bank of India · 31 clauses', pct: 58, n: '18 / 31', warn: true },
  { name: 'DFSA Rulebook — AML module', src: 'Dubai Financial Services Authority · 22 clauses', pct: 91, n: '20 / 22' },
  { name: 'UAE PDPL — Article 14', src: 'UAE · 4 clauses', pct: 25, n: '1 / 4', warn: true },
];

export function CoverageLibrary() {
  return (
    <Frame>
      <Table cols="minmax(0,1.5fr) minmax(70px,1fr) 52px" minWidth={420}>
        <Tr head>
          <span>Regulation</span>
          <span>Coverage</span>
          <span aria-hidden="true" />
        </Tr>
        {library.map((r) => (
          <Tr key={r.name}>
            <span>
              <b className={s.strong}>{r.name}</b>
              <span className={s.sub}>{r.src}</span>
            </span>
            <Meter value={r.pct} warn={r.warn} />
            <span className={`${s.code} ${s.right} ${r.warn ? s.warn : s.ink}`}>{r.n}</span>
          </Tr>
        ))}
      </Table>
    </Frame>
  );
}

function EventMark({ alert }: { alert?: boolean }) {
  return (
    <svg className={`${s.eventDot} ${alert ? s.eventDotAlert : ''}`} viewBox="0 0 16 16" aria-hidden="true">
      {alert ? (
        <path d="M8 1.2 14.8 8 8 14.8 1.2 8z" fill="currentColor" />
      ) : (
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

export function ChangeEvents() {
  return (
    <Frame>
      <div className={s.padLg}>
        <p className={s.titleRow} style={{ marginBottom: 6 }}>
          <b>Regulatory change · what this affects</b>
        </p>
        <div className={s.event}>
          <EventMark alert />
          <div>
            <b className={s.strong}>CBUAE AML Circular 2023 — Clause 7.2 amended</b>
            <span className={s.sub}>STR filing window reduced from 10 to 5 business days · effective 1 Jan</span>
            <div className={s.chips}>
              <span className="chip chip--pol">AML and Sanctions Policy §4.2</span>
              <span className="chip chip--pol">Transaction Monitoring Procedure, step 6</span>
              <span className="chip chip--pol">Suspicious Activity Reporting SOP</span>
            </div>
          </div>
        </div>
        <div className={s.event}>
          <EventMark />
          <div>
            <b className={s.strong}>3 documents flagged for re-review</b>
            <span className={s.sub}>Owners notified · review workflow started · due in 14 days</span>
          </div>
        </div>
        <div className={s.event}>
          <EventMark />
          <div>
            <b className={s.strong}>Control AML-C-001 marked for re-test</b>
            <span className={s.sub}>Linked to the amended clause via Transaction Monitoring Policy</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}
