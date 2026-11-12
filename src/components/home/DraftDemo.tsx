'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { offsetWithin } from '@/lib/geometry';
import { useInView, useSequence } from '@/lib/hooks';
import { Cursor } from './Cursor';
import { Typewriter } from './Typewriter';
import d from './demos.module.css';

const TIMES = [800, 3400, 5200, 6400, 7000, 7600] as const;
const PROMPT = 'Generate policy text for customer due diligence under AML regulations, referencing CBUAE standards.';

export function DraftDemo() {
  const [viewRef, inView] = useInView<HTMLDivElement>(0.35);
  const { stage: D, run } = useSequence(TIMES, { active: inView, loopAfter: 14000 });
  const cardRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const insertRef = useRef<HTMLSpanElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card || D < 3 || D >= 6) {
        setCursor(null);
        return;
      }
      // Layout offsets, not client rects: the card sits in a rotated 3D stage.
      const target = D === 3 ? readyRef.current : insertRef.current;
      if (!target) return;
      const o = offsetWithin(target, card);
      setCursor(D === 3 ? { x: o.x + o.w - 40, y: o.y + 18 } : { x: o.x + 40, y: o.y + o.h / 2 });
    });
    return () => cancelAnimationFrame(id);
  }, [D]);

  const on = (b: boolean) => (b ? d.on : '');

  return (
    <div ref={viewRef}>
      <div ref={cardRef} className={`frame ${d.draftCard}`}>
        <div className={d.draftDoc}>
          <p className={d.draftH}>4.1 Customer Due Diligence</p>
          <p>1. The Bank shall conduct CDD on all customers at onboarding and on an ongoing basis.</p>
          <p>2. High-risk customers require Enhanced Due Diligence prior to account opening.</p>
          <p className={`${d.ins} ${on(D >= 5)}`}>
            3. CDD measures shall follow <span className="chip chip--reg">Reg · CBUAE §4.1</span> and align with{' '}
            <span className="chip chip--ctl">Ctrl</span> KYC-001, including identification of beneficial owners.
          </p>
        </div>
        <div className={d.assistant}>
          <div className={d.assistantHead}>
            <span className={d.assistantMark} aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M3 2.5h7l3 3v8H3z M10 2.5v3h3 M5.5 8.5h5 M5.5 11h3" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            Document Assistant <span className={d.assistantSub}>Magpie AI</span>
          </div>
          <div className={d.prompt}>
            <Typewriter key={run} text={PROMPT} active={D >= 1} complete={D >= 2} caret={D >= 1 && D < 2} />
          </div>
          <div className={`${d.think} ${on(D === 2)}`}>
            <span className={d.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>{' '}
            Drafting against CBUAE AML Circular 2023
          </div>
          <div ref={readyRef} className={`${d.ready} ${on(D >= 3)}`}>
            <p className={d.readyK}>DRAFT READY</p>
            <p className={d.readyB}>Draft for §4.1 CDD references CBUAE Circular 2023 Clause 4.1 and aligns with Control KYC-001.</p>
            <div className={d.readyActs}>
              <span ref={insertRef} className={D >= 4 && D <= 5 ? d.hi : ''}>
                Insert at cursor
              </span>
              <span>Rephrase to org standards</span>
            </div>
          </div>
        </div>
        <Cursor point={cursor} clicking={D === 5} />
      </div>
    </div>
  );
}
