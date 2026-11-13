'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { offsetWithin } from '@/lib/geometry';
import { useInView, useSequence } from '@/lib/hooks';
import { Cursor } from './Cursor';
import d from './demos.module.css';

/* Stage offsets (ms): select → menu → submenu → picker → tick → tick → press → chips → verified */
const TIMES = [500, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5700, 6200, 6900] as const;

interface Point {
  x: number;
  y: number;
}

interface Layout {
  cursor: Point | null;
  menu: Point;
  sub: Point;
}

const MENU_W = 196;
const SUB_W = 188;

export function LinkDemo() {
  const [viewRef, inView] = useInView<HTMLDivElement>(0.3);
  const { stage: L, replay } = useSequence(TIMES, { active: inView, loopAfter: 14000 });

  const cardRef = useRef<HTMLDivElement>(null);
  const selStartRef = useRef<HTMLSpanElement>(null);
  const selEndRef = useRef<HTMLSpanElement>(null);
  const chipsRef = useRef<HTMLSpanElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const regRef = useRef<HTMLDivElement>(null);
  const pick1Ref = useRef<HTMLLIElement>(null);
  const pick3Ref = useRef<HTMLLIElement>(null);
  const applyRef = useRef<HTMLSpanElement>(null);

  const [layout, setLayout] = useState<Layout>({ cursor: null, menu: { x: 24, y: 160 }, sub: { x: 220, y: 260 } });

  // Measurements use layout offsets, so entrance transforms never skew the cursor path.
  const measure = useCallback(() => {
    const card = cardRef.current;
    const start = selStartRef.current;
    const end = selEndRef.current;
    if (!card || !start || !end) return;
    const W = card.offsetWidth;
    const H = card.offsetHeight;
    const at = (el: HTMLElement | null, fx: number, fy: number, dx = 0, dy = 0): Point | null => {
      if (!el) return null;
      const o = offsetWithin(el, card);
      return { x: o.x + o.w * fx + dx, y: o.y + o.h * fy + dy };
    };

    const s0 = at(start, 0, 0.5)!;
    const s1 = at(end, 0, 0.5)!;

    // Context menu opens just below the end of the selection, kept inside the card.
    const menu = {
      x: Math.max(12, Math.min(s1.x - 40, W - MENU_W - 12)),
      y: Math.min(s1.y + 16, H - 250),
    };
    const roomRight = menu.x + MENU_W + SUB_W + 4 <= W - 8;
    const sub = roomRight
      ? { x: menu.x + MENU_W + 4, y: menu.y + 118 }
      : { x: Math.max(12, Math.min(menu.x + 36, W - SUB_W - 12)), y: menu.y + 150 };

    const target = (): Point | null => {
      switch (L) {
        case 0:
          return { x: s0.x - 14, y: s0.y + 6 };
        case 1:
          return { x: s0.x + 2, y: s0.y + 8 };
        case 2:
        case 3:
          return { x: s1.x - 4, y: s1.y + 8 };
        case 4:
          return at(addRef.current, 0, 0.5, 44, 2);
        case 5:
          return at(regRef.current, 0, 0.5, 44, 2);
        case 6:
          return at(pick1Ref.current, 0, 0.5, 14, 2);
        case 7:
          return at(pick3Ref.current, 0, 0.5, 14, 2);
        case 8:
        case 9:
          return at(applyRef.current, 0.5, 0.5, -6, 2);
        case 10:
          return at(chipsRef.current, 0.5, 0.5, 0, 10);
        default:
          return null;
      }
    };

    setLayout({ cursor: target(), menu, sub });
  }, [L]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(card);
    return () => ro.disconnect();
  }, [measure]);

  const on = (b: boolean) => (b ? d.on : '');
  const show = (b: boolean) => (b ? d.show : '');
  const selState = L >= 11 ? d.selDone : L >= 2 ? d.selOn : '';
  const stepIndex = L >= 11 ? 4 : L >= 6 ? 3 : L >= 4 ? 2 : L >= 2 ? 1 : 0;

  return (
    <div ref={viewRef} className={d.linkWrap}>
      <div className={`is-light ${d.linkShell}`}>
        <div
          ref={cardRef}
          className={`frame ${d.linkCard}`}
          aria-label="Animated demonstration: linking a policy clause to a regulatory clause"
          role="group"
        >
          <div className={d.top}>
            <span className={d.topTitle}>AML and Sanctions Policy</span>
            <span className={d.topState}>In review</span>
            <span className={d.topMeta}>v2.1</span>
            <span className="avatar-stack" style={{ marginLeft: 'auto' }}>
              <span className="avatar" style={{ background: '#E0A030' }}>
                SK
              </span>
              <span className="avatar" style={{ background: '#2BA86F' }}>
                JL
              </span>
              <span className="avatar" style={{ background: '#00B3AA' }}>
                GK
              </span>
            </span>
          </div>

          <div className={d.docBody}>
            <p className={d.secNum}>1.1 · Nature and purpose</p>
            <p className={d.secTitle}>Introduction</p>
            <ol className={d.clauses}>
              <li>
                The purpose of this Policy is to establish rules for the <span className="chip chip--doc">Doc</span> Business Function in
                alignment with applicable laws.
              </li>
              <li>
                The Bank is a Shari&apos;a compliant organisation{' '}
                <span className={`${d.sel} ${selState}`}>
                  <span ref={selStartRef} className={d.mark} aria-hidden="true" />
                  governed by CBUAE AML Circular 2023
                  <span ref={selEndRef} className={d.mark} aria-hidden="true" />
                </span>
                <span ref={chipsRef} className={`${d.newChips} ${on(L >= 10)}`}>
                  <span className="chip chip--reg">Reg · §4.1</span>
                  <span className="chip chip--reg">Reg · §7.2</span>
                </span>{' '}
                and read with <span className="chip chip--ctl">Ctrl</span> KYC-001.
              </li>
              <li>This policy applies to all customer-facing activities on behalf of the Bank.</li>
            </ol>
          </div>

          <div className={`${d.menu} ${show(L >= 3 && L <= 5)}`} style={{ left: layout.menu.x, top: layout.menu.y, width: MENU_W }}>
            <div className={d.mi}>
              Cut <span className={d.kbd}>⌘X</span>
            </div>
            <div className={d.mi}>
              Copy <span className={d.kbd}>⌘C</span>
            </div>
            <div className={d.mk}>LINKED HERE</div>
            <div className={d.mi}>
              <span>
                <span className="chip chip--doc">Doc</span> KYC Framework v1.4
              </span>
            </div>
            <div ref={addRef} className={`${d.mi} ${L >= 4 && L <= 5 ? d.hi : ''}`}>
              Add linkage <span className={d.arr}>›</span>
            </div>
            <div className={d.mi}>Add comment</div>
            <div className={d.mi}>
              Ask Magpie <span className={d.arr}>›</span>
            </div>
          </div>

          <div className={`${d.menu} ${show(L >= 4 && L <= 5)}`} style={{ left: layout.sub.x, top: layout.sub.y, width: SUB_W }}>
            <div className={d.mi}>
              <span>
                <span className="chip chip--doc">Doc</span> Same doc section
              </span>
            </div>
            <div className={d.mi}>
              <span>
                <span className="chip chip--doc">Doc</span> Other document
              </span>
            </div>
            <div ref={regRef} className={`${d.mi} ${L === 5 ? d.hi : ''}`}>
              <span>
                <span className="chip chip--reg">Reg</span> Regulatory clause
              </span>
            </div>
            <div className={d.mi}>
              <span>
                <span className="chip chip--ctl">Ctrl</span> Control clause
              </span>
            </div>
          </div>

          <div className={`${d.picker} ${show(L >= 6 && L <= 9)}`}>
            <div className={d.pickerHead}>
              <span className="chip chip--reg">Reg</span> Regulatory clause <span className={d.x}>×</span>
            </div>
            <div className={d.search}>
              <Icon name="search" size={14} /> Search…
            </div>
            <ul className={d.pickList}>
              <li ref={pick1Ref} className={on(L >= 7)}>
                <span className={d.cb} aria-hidden="true" />
                <span>
                  CBUAE AML Circular 2023 — Clause 4.1<small>Central Bank UAE</small>
                </span>
                <span className="chip chip--reg">Reg</span>
              </li>
              <li>
                <span className={d.cb} aria-hidden="true" />
                <span>
                  CBUAE AML Circular 2023 — Clause 5.3<small>Central Bank UAE</small>
                </span>
                <span className="chip chip--reg">Reg</span>
              </li>
              <li ref={pick3Ref} className={on(L >= 8)}>
                <span className={d.cb} aria-hidden="true" />
                <span>
                  CBUAE AML Circular 2023 — Clause 7.2<small>Central Bank UAE</small>
                </span>
                <span className="chip chip--reg">Reg</span>
              </li>
              <li>
                <span className={d.cb} aria-hidden="true" />
                <span>
                  FATF Recommendation 10 — CDD<small>FATF</small>
                </span>
                <span className="chip chip--reg">Reg</span>
              </li>
            </ul>
            <div className={d.pickerFoot}>
              <span className={d.cancel}>Cancel</span>
              <span ref={applyRef} className={`${d.apply} ${L === 9 ? d.press : ''}`}>
                Apply 2 linkages
              </span>
            </div>
          </div>

          <div className={`${d.linked} ${show(L >= 11)}`}>
            <span className="chip chip--reg">Regulatory clause</span>
            <b>CBUAE AML Circular 2023 · §4.1</b>
            <small>Central Bank of the UAE</small>
            <p>Requires regulated institutions to apply risk-based AML controls and report suspicious activity to the FIU without delay.</p>
          </div>

          <Cursor point={layout.cursor} clicking={L === 3 || L === 5 || L === 9} />
        </div>

        <div className={d.steps}>
          <ol style={{ '--progress': Math.max(0, stepIndex - 1) / 3 } as React.CSSProperties}>
            <li className={on(L >= 2)}>Select</li>
            <li className={on(L >= 4)}>Link</li>
            <li className={on(L >= 6)}>Choose clauses</li>
            <li className={on(L >= 11)}>Verified</li>
          </ol>
          <button type="button" onClick={replay} className={d.replay} aria-label="Replay the demonstration" title="Replay">
            <Icon name="replay" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
