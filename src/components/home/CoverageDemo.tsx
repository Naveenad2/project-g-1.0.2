'use client';

import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { useInView, useSequence } from '@/lib/hooks';
import d from './demos.module.css';

const TIMES = [1000, 2600] as const;

const bars = [
  { label: 'Regulatory', value: 86, n: '12 / 14', color: 'var(--success)' },
  { label: 'Controls', value: 100, n: '6 / 6', color: 'var(--accent)' },
  { label: 'Risks', value: 75, n: '3 / 4', color: 'var(--primary)' },
];

export function CoverageDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const { stage: C } = useSequence(TIMES, { active: inView, loopAfter: 14000 });

  return (
    <div ref={ref} className={d.coverWrap}>
      <Screenshot
        src={screenshots.policyEditor}
        alt="Policy editor with a regulatory clause linked and its detail shown in the side panel"
      />
      {/* floats above the screen in the 3D stage */}
      <div className={`frame ${d.coverage}`}>
        <div className={d.coverageHead}>
          Linkage coverage <span>AML-POL-0115</span>
        </div>
        {bars.map((b) => (
          <div key={b.label} className={d.coverageRow}>
            <span>{b.label}</span>
            <span className={d.track}>
              <i style={{ width: C >= 1 ? `${b.value}%` : '0%', background: b.color }} />
            </span>
            <span className={d.coverageN}>{b.n}</span>
          </div>
        ))}
        <div className={`${d.coverageRes} ${C >= 2 ? d.on : ''}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.8 14.6 13.6H1.4z" fill="currentColor" />
            <path d="M8 6v3.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.4" r="0.85" fill="#fff" />
          </svg>
          Consistency check: 2 clauses without a regulatory basis
        </div>
      </div>
    </div>
  );
}
