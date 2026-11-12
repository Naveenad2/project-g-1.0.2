'use client';

import { Status, type StatusTone } from '@/components/ui/Status';
import { useInView, useSequence } from '@/lib/hooks';
import d from './demos.module.css';

const TIMES = [900, 2100, 3100, 4300, 5500, 6700, 7500] as const;

function Person({
  initials,
  color,
  name,
  role,
  tone,
  status,
}: {
  initials: string;
  color: string;
  name: string;
  role: string;
  tone: StatusTone;
  status: string;
}) {
  return (
    <div className={d.pp}>
      <span className="avatar" style={{ background: color }}>
        {initials}
      </span>
      <span className={d.ppName}>
        {name}
        <small>{role}</small>
      </span>
      <Status tone={tone}>{status}</Status>
    </div>
  );
}

export function GovernDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const { stage: G } = useSequence(TIMES, { active: inView, loopAfter: 14000 });

  const node = (done: boolean, live: boolean) => (done ? d.nodeDone : live ? d.nodeLive : '');
  const status = G >= 7 ? 'Published' : G >= 3 ? 'Approval' : 'Review';

  return (
    <div ref={ref} className={`frame ${d.govern}`}>
      <div className={d.top}>
        <span className={d.topTitle}>Risk Management Policy</span>
        <Status tone={G >= 7 ? 'success' : G >= 3 ? 'info' : 'warning'}>{status}</Status>
        <span className={d.topMeta} style={{ marginLeft: 'auto' }}>
          wf-005
        </span>
      </div>
      <ol className={d.wf}>
        <li className={d.wfRow}>
          <span className={`${d.node} ${d.nodeDone}`}>✓</span>
          <div>
            <p className={d.wfHead}>
              Author <small>10 Apr 2026</small>
            </p>
          </div>
        </li>
        <li className={d.wfRow}>
          <span className={`${d.node} ${d.nodeDone}`}>✓</span>
          <div>
            <p className={d.wfHead}>
              Co-create <span className={d.skip}>Skipped</span>
            </p>
          </div>
        </li>
        <li className={d.wfRow}>
          <span className={`${d.node} ${node(G >= 3, G >= 1)}`}>{G >= 3 ? '✓' : '3'}</span>
          <div>
            <p className={d.wfHead}>
              Review <small>22 May 2026</small>
            </p>
            <Person
              initials="JW"
              color="#2D55B8"
              name="James Wong"
              role="Reviewer"
              tone={G >= 1 ? 'success' : 'neutral'}
              status={G >= 1 ? 'Approved' : 'Pending'}
            />
            <Person
              initials="PN"
              color="#B85E0A"
              name="Priya Nair"
              role="Reviewer"
              tone={G >= 2 ? 'success' : 'neutral'}
              status={G >= 2 ? 'Approved with comments' : 'Pending'}
            />
          </div>
        </li>
        <li className={d.wfRow}>
          <span className={`${d.node} ${node(G >= 6, G >= 3)}`}>{G >= 6 ? '✓' : '4'}</span>
          <div>
            <p className={d.wfHead}>
              Approval <small>due 15 Jun 2026</small>
            </p>
            <Person
              initials="MT"
              color="#00B3AA"
              name="Michael Torres"
              role="Approver"
              tone={G >= 5 ? 'success' : G >= 4 ? 'info' : 'neutral'}
              status={G >= 5 ? 'Approved' : G >= 4 ? 'Reviewing' : 'Not yet started'}
            />
            <Person
              initials="LA"
              color="#0E8A5F"
              name="Leila Al-Rashid"
              role="Approver"
              tone={G >= 6 ? 'success' : G >= 5 ? 'info' : 'neutral'}
              status={G >= 6 ? 'Approved' : G >= 5 ? 'Reviewing' : 'Not yet started'}
            />
          </div>
        </li>
        <li className={d.wfRow}>
          <span className={`${d.node} ${node(G >= 7, false)}`}>{G >= 7 ? '✓' : '5'}</span>
          <div>
            <p className={d.wfHead}>Publish</p>
            <p className={`${d.pub} ${G >= 7 ? d.on : ''}`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7.5" rx="1.5" fill="currentColor" />
                <path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span>
                <b>Version 2.2 locked</b> · published to 1,240 staff · previous version archived
              </span>
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
