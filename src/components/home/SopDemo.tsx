'use client';

import { Status } from '@/components/ui/Status';
import { useInView, useSequence } from '@/lib/hooks';
import d from './demos.module.css';

const TIMES = [700, 1600, 2500, 3500, 4600, 5600] as const;

export function SopDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const { stage: P } = useSequence(TIMES, { active: inView, loopAfter: 14000 });
  const on = (b: boolean) => (b ? d.on : '');

  return (
    <div ref={ref} className={`frame ${d.sopCard}`}>
      <div className={d.top}>
        <span className={d.topTitle}>Customer Onboarding Procedure</span>
        <Status>Draft</Status>
        <span className={d.topMeta}>SOP designer</span>
        <span className="avatar-stack" style={{ marginLeft: 'auto' }}>
          <span className="avatar" style={{ background: '#E0A030' }}>
            SK
          </span>
          <span className="avatar" style={{ background: '#00B3AA' }}>
            GK
          </span>
        </span>
      </div>
      <div className={d.sop}>
        <span className={`${d.ln} ${d.lnV} ${on(P >= 2)}`} style={{ left: '18.1%', top: '17%', height: '31%' }} aria-hidden="true" />
        <span className={`${d.ln} ${d.lnH} ${on(P >= 3)}`} style={{ left: '18.1%', top: '47.5%', width: '36.4%' }} aria-hidden="true" />
        <span className={`${d.ln} ${d.lnUp} ${on(P >= 4)}`} style={{ left: '54.5%', top: '17%', height: '31%' }} aria-hidden="true" />
        <span className={`${d.ln} ${d.lnV} ${on(P >= 4)}`} style={{ left: '54.5%', top: '47.5%', height: '30%' }} aria-hidden="true" />
        <span className={`${d.ln} ${d.lnH} ${on(P >= 5)}`} style={{ left: '54.5%', top: '47.5%', width: '17%' }} aria-hidden="true" />
        <span className={`${d.sopLabel} ${on(P >= 4)}`} style={{ left: '56%', top: '30%' }}>
          match
        </span>
        <span className={`${d.sopLabel} ${on(P >= 4)}`} style={{ left: '56%', top: '60%' }}>
          no match
        </span>
        <div className={`${d.nd} ${on(P >= 1)}`} style={{ left: '3.6%', top: '10%' }}>
          <span className={d.role}>Front office</span>Receive application
        </div>
        <div className={`${d.nd} ${on(P >= 2)}`} style={{ left: '3.6%', top: '40%' }}>
          <span className={d.role}>Front office</span>Verify identity
        </div>
        <div className={`${d.nd} ${d.ndDec} ${on(P >= 3)}`} style={{ left: '40%', top: '40%' }}>
          <span className={d.role}>Compliance</span>Screen sanctions
        </div>
        <div className={`${d.nd} ${on(P >= 4)}`} style={{ left: '40%', top: '10%' }}>
          <span className={d.role}>CCO</span>Escalate to CCO
        </div>
        <div className={`${d.nd} ${d.ndEnd} ${on(P >= 4)}`} style={{ left: '40%', top: '70%' }}>
          <span className={d.role}>Operations</span>Open account
        </div>
        <div className={`${d.sopTag} ${d.sopVid} ${on(P >= 5)}`} style={{ left: '71%', top: '43%' }}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="1.5" y="4.5" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="m13.5 8.5 5-3v9l-5-3z" fill="currentColor" />
          </svg>
          0:48 screen recording
        </div>
        <div className={`${d.sopTag} ${d.sopMcq} ${on(P >= 6)}`} style={{ left: '71%', top: '73%' }}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="2" y="2" width="16" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="m6 10.2 2.6 2.6L14 7.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          MCQ · 3 questions
        </div>
      </div>
    </div>
  );
}
