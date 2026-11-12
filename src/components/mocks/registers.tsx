import { Frame, Node, Severity, mockStyles as s } from './primitives';
import m from './registers.module.css';

/** Risk → control → policy graph. Rows align across columns, so the links are drawn in CSS. */
export function RiskControlPolicyMap() {
  return (
    <Frame>
      <div className={`${s.padLg} ${m.graph}`}>
        <h4 className={`${s.h6} ${m.colHead}`} style={{ gridColumn: 1 }}>
          Risks
        </h4>
        <h4 className={`${s.h6} ${m.colHead}`} style={{ gridColumn: 3 }}>
          Controls
        </h4>
        <h4 className={`${s.h6} ${m.colHead}`} style={{ gridColumn: 5 }}>
          Policies
        </h4>

        <div className={m.cell} style={{ gridColumn: 1, gridRow: 2 }}>
          <Node kind="risk" code="AML-R-03" title="Sanctions breach" detail="Inherent: High · Residual: Medium" />
        </div>
        <span className={m.link} style={{ gridColumn: 2, gridRow: 2 }} aria-hidden="true" />
        <div className={m.cell} style={{ gridColumn: 3, gridRow: 2 }}>
          <Node kind="ctl" code="AML-C-002" title="Sanctions screening" detail="Automated · tested quarterly" />
        </div>
        <span className={m.link} style={{ gridColumn: 4, gridRow: 2 }} aria-hidden="true" />
        <div className={m.cell} style={{ gridColumn: 5, gridRow: 2 }}>
          <Node kind="pol" code="POL-0115" title="AML and Sanctions Policy" detail="§4.3 · v2.4 · Published" />
        </div>

        <div className={m.cell} style={{ gridColumn: 1, gridRow: 3 }}>
          <Node kind="risk" code="AML-R-07" title="PEP onboarding" detail="Inherent: High · Residual: Low" />
        </div>
        <span className={m.link} style={{ gridColumn: 2, gridRow: 3 }} aria-hidden="true" />
        <div className={m.cell} style={{ gridColumn: 3, gridRow: 3 }}>
          <Node kind="ctl" code="KYC-001" title="Enhanced due diligence" detail="Manual · tested monthly" />
        </div>
        <span className={m.link} style={{ gridColumn: 4, gridRow: 3 }} aria-hidden="true" />
        <div className={m.cell} style={{ gridColumn: 5, gridRow: 3 }}>
          <Node kind="pol" code="SOP-0032" title="Customer Onboarding Procedure" detail="Step 3 · v4.0 · Published" />
        </div>
      </div>
    </Frame>
  );
}

const risks: [string, 'High' | 'Medium' | 'Low'][] = [
  ['AML-R-03 Sanctions breach', 'High'],
  ['OPS-R-11 Payment system outage', 'High'],
  ['AML-R-07 PEP onboarding', 'Medium'],
  ['DAT-R-02 Customer data leakage', 'Medium'],
  ['HR-R-05 Key person dependency', 'Low'],
  ['OPS-R-14 Branch cash handling', 'Low'],
];

export function RiskScoreList() {
  return (
    <Frame>
      <div className={s.padLg}>
        <div className={s.titleRow}>
          <b>Operational risk · Retail banking</b>
          <span className={s.metaSmall}>12 risks</span>
        </div>
        {risks.map(([name, level]) => (
          <div key={name} className={s.listRow}>
            <span className={s.ink}>{name}</span>
            <Severity level={level} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function ImpactTrace() {
  return (
    <Frame>
      <div className={s.padLg}>
        <h4 className={s.h6}>Impact of retiring AML-C-002</h4>
        <Node kind="ctl" code="AML-C-002" title="Sanctions screening" detail="Control · proposed: retire" />
        <ul className={m.tree}>
          <li>
            <Node kind="risk" code="AML-R-03" title="Sanctions breach" detail="Residual rating would rise from Medium to High" />
          </li>
          <li>
            <Node
              kind="pol"
              code="POL-0115"
              title="AML and Sanctions Policy §4.3"
              detail="Clause cites this control · re-review required"
            />
          </li>
          <li>
            <Node
              kind="pol"
              code="SOP-0032"
              title="Customer Onboarding Procedure, step 3"
              detail="Procedure step references this control"
            />
          </li>
          <li>
            <Node
              kind="other"
              code="RCSA-Q3"
              title="RCSA Q3 · Retail banking"
              detail="Assessment scored this control · would be invalidated"
            />
          </li>
        </ul>
      </div>
    </Frame>
  );
}
