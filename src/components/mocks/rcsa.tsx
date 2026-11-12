import { Avatar, Bar, Check, Frame, Status, Table, Tr, mockStyles as s } from './primitives';

const checklist: { text: string; on: boolean; tone: 'success' | 'warning' | 'neutral'; label: string }[] = [
  { text: 'Sanctions screening performed on all new customers (AML-C-002)', on: true, tone: 'success', label: 'Effective' },
  { text: 'EDD completed for PEPs before account opening (KYC-001)', on: true, tone: 'success', label: 'Effective' },
  { text: 'STR filed within the regulatory window (AML-C-001)', on: true, tone: 'warning', label: 'Partial' },
  { text: 'Quarterly review of dormant accounts (OPS-C-014)', on: false, tone: 'neutral', label: 'Not tested' },
];

export function AssessmentCard() {
  return (
    <Frame>
      <Bar title="RCSA Q3 · Retail banking" meta="Due 30 Sep">
        <Status tone="warning">In progress</Status>
      </Bar>
      <div className={s.tabs}>
        <span>Overview</span>
        <span className={s.tabOn}>Checklist</span>
        <span>Risk scoring</span>
        <span>Comments · 3</span>
        <span>Report</span>
      </div>
      <div className={s.pad}>
        {checklist.map((c) => (
          <div key={c.text} className={s.listRow} style={{ gridTemplateColumns: 'auto minmax(0,1fr) auto' }}>
            <Check on={c.on} />
            <span>{c.text}</span>
            <Status tone={c.tone}>{c.label}</Status>
          </div>
        ))}
        <div style={{ marginTop: 6 }}>
          <div className={s.msg}>
            <Avatar initials="SK" color="#E0A030" />
            <div>
              <b>Sarah K.</b>
              <small>Compliance · 2h ago</small>
              <p>AML-C-001: two STRs in August filed on day 6. Marking partial until the new 5-day window is reflected in the SOP.</p>
            </div>
          </div>
          <div className={s.msg}>
            <Avatar initials="RM" color="#2BA86F" />
            <div>
              <b>Rahul M.</b>
              <small>Branch operations · 40m ago</small>
              <p>Agreed. SOP update is in review (POL-0115 v2.5). Can we re-test in October?</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function RcsaSummary() {
  return (
    <Frame>
      <div className={s.kpis}>
        <div className={s.kpi}>
          <b className={s.big}>42</b>
          <span>controls assessed</span>
        </div>
        <div className={s.kpi}>
          <b className={s.big}>34</b>
          <span>rated effective</span>
        </div>
        <div className={s.kpi}>
          <b className={s.big}>6</b>
          <span>partial · 2 not tested</span>
        </div>
      </div>
      <div className={s.pad} style={{ paddingTop: 6 }}>
        <div className={s.kv} style={{ borderTop: 0 }}>
          <span>Residual risk above appetite</span>
          <b className={s.bad}>3 risks</b>
        </div>
        <div className={s.kv}>
          <span>Actions raised</span>
          <b className={s.ink}>7 · 2 overdue</b>
        </div>
        <div className={s.kv}>
          <span>Report</span>
          <b className={s.brand}>RCSA-Q3-Retail.pdf · generated</b>
        </div>
      </div>
    </Frame>
  );
}

const reports: { unit: string; who: string; date: string; tone: 'warning' | 'success'; status: string }[] = [
  { unit: 'Q3 · Retail banking', who: 'Sarah K. · 42 controls', date: '30 Sep', tone: 'warning', status: 'In progress' },
  { unit: 'Q3 · Treasury', who: 'Priya N. · 28 controls', date: '30 Sep', tone: 'success', status: 'Reported' },
  { unit: 'Q2 · Digital channels', who: 'James W. · 35 controls', date: '30 Jun', tone: 'success', status: 'Reported' },
  { unit: 'Q2 · Operations', who: 'Rahul M. · 51 controls', date: '30 Jun', tone: 'success', status: 'Reported' },
];

export function RcsaReports() {
  return (
    <Frame>
      <Bar title="RCSA Reports" meta="All business units · FY26" />
      <Table cols="minmax(0,1fr) 64px 104px" minWidth={380}>
        {reports.map((r) => (
          <Tr key={r.unit}>
            <span>
              <b className={s.strong}>{r.unit}</b>
              <span className={s.sub}>{r.who}</span>
            </span>
            <span className={s.metaSmall}>{r.date}</span>
            <span className={s.right}>
              <Status tone={r.tone}>{r.status}</Status>
            </span>
          </Tr>
        ))}
      </Table>
    </Frame>
  );
}
