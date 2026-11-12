import a from './CapabilityArt.module.css';

/**
 * Line illustrations for the ten connected capabilities (viewBox 220 × 170).
 * Pure vector: navy line work, mint fills and orange accents, so they stay sharp at any size.
 * Colours come from CSS variables, so the art follows the light and dark themes.
 */
export function CapabilityArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 220 170" className={a.art} aria-hidden="true">
      {renderArt(index)}
    </svg>
  );
}

const DOC_ANGLES = [-90, -38, 14, 66, 118, 170, 222];

function renderArt(index: number) {
  switch (index) {
    /* 1 · Registries */
    case 0:
      return (
        <g>
          <rect x="34" y="14" width="146" height="104" rx="9" className={a.sheet} />
          <rect x="26" y="7" width="146" height="104" rx="9" className={`${a.paper} ${a.ln}`} />
          <rect x="32" y="15" width="62" height="17" rx="8.5" className={a.inkFill} />
          <text x="63" y="26.8" textAnchor="middle" className={`${a.t} ${a.tInv} ${a.tXs}`}>
            Regulations
          </text>
          <rect x="98" y="15" width="30" height="17" rx="8.5" className={a.ln} />
          <text x="113" y="26.8" textAnchor="middle" className={`${a.t} ${a.tXs}`}>
            Risks
          </text>
          <rect x="132" y="15" width="34" height="17" rx="8.5" className={a.ln} />
          <text x="149" y="26.8" textAnchor="middle" className={`${a.t} ${a.tXxs}`}>
            Controls
          </text>
          <line x1="34" y1="44" x2="66" y2="44" className={a.tealBar} />
          <line x1="34" y1="54" x2="150" y2="54" className={a.soft} />
          <line x1="34" y1="63" x2="124" y2="63" className={a.soft} />
          <rect x="32" y="71" width="134" height="15" rx="5" className={a.mint} />
          <line x1="39" y1="78.5" x2="134" y2="78.5" className={a.ln} />
          <circle cx="156" cy="78.5" r="4.5" className={a.orangeFill} />
          <text x="178" y="82.5" className={`${a.t} ${a.tOrange} ${a.tLg}`}>
            § 4.2
          </text>
          <line x1="34" y1="95" x2="146" y2="95" className={a.soft} />
          <line x1="34" y1="104" x2="114" y2="104" className={a.soft} />
          <rect x="40" y="124" width="62" height="18" rx="9" className={`${a.mint} ${a.tealLn}`} />
          <text x="71" y="136.5" textAnchor="middle" className={`${a.t} ${a.tTeal}`}>
            Policies
          </text>
          <rect x="108" y="124" width="72" height="18" rx="9" className={`${a.mint} ${a.tealLn}`} />
          <text x="144" y="136.5" textAnchor="middle" className={`${a.t} ${a.tTeal}`}>
            Procedures
          </text>
          <rect x="56" y="149" width="108" height="17" rx="8.5" className={a.dashOrange} />
          <text x="110" y="160.5" textAnchor="middle" className={`${a.t} ${a.tOrange} ${a.tSm}`}>
            + your own registry
          </text>
        </g>
      );

    /* 2 · Magpie AI */
    case 1:
      return (
        <g>
          <path d="M24 10h72l20 20v124H24z" className={`${a.paper} ${a.ln}`} />
          <path d="M96 10v20h20" className={a.ln} />
          <line x1="34" y1="30" x2="68" y2="30" className={a.tealBar} />
          <line x1="34" y1="45" x2="104" y2="45" className={a.soft} />
          <line x1="34" y1="55" x2="96" y2="55" className={a.soft} />
          <line x1="34" y1="65" x2="104" y2="65" className={a.soft} />
          <line x1="34" y1="75" x2="82" y2="75" className={a.soft} />
          <line x1="34" y1="88" x2="92" y2="88" className={a.soft} />
          <line x1="96" y1="82" x2="96" y2="95" className={a.caret} />
          <rect x="32" y="112" width="70" height="20" rx="10" className={`${a.mint} ${a.tealLn}`} />
          <text x="67" y="125.5" textAnchor="middle" className={`${a.t} ${a.tTeal}`}>
            cites § 4.2
          </text>
          {[
            ['link § 4.2', 14, false],
            ['contradicts?', 50, true],
            ['rate risk', 86, false],
            ['draft steps', 122, false],
          ].map(([label, y, warn]) => (
            <g key={label as string}>
              <line x1="117" y1={(y as number) + 11} x2="138" y2={(y as number) + 11} className={a.dots} />
              <circle cx="117" cy={(y as number) + 11} r="2.2" className={warn ? a.orangeFill : a.tealFill} />
              <rect x="138" y={y as number} width="74" height="22" rx="6" className={`${a.paper} ${warn ? a.orangeLn : a.ln}`} />
              <text x="175" y={(y as number) + 14.5} textAnchor="middle" className={`${a.t} ${warn ? a.tOrange : ''}`}>
                {label}
              </text>
            </g>
          ))}
        </g>
      );

    /* 3 · Linked items */
    case 2:
      return (
        <g>
          <ellipse cx="110" cy="85" rx="74" ry="56" className={a.dotsSoft} />
          {[
            [40, 36],
            [180, 36],
            [40, 134],
            [180, 134],
          ].map(([x, y]) => (
            <line key={`${x}${y}`} x1="110" y1="85" x2={x} y2={y} className={a.dots} />
          ))}
          {[
            ['regulation', 40, 36],
            ['control', 180, 36],
            ['risk', 40, 134],
            ['owner', 180, 134],
          ].map(([label, x, y]) => (
            <g key={label as string}>
              <circle cx={x as number} cy={y as number} r="28" className={`${a.paper} ${a.ln}`} />
              <text x={x as number} y={(y as number) + 3.3} textAnchor="middle" className={`${a.t} ${a.tXs}`}>
                {label}
              </text>
            </g>
          ))}
          <circle cx="110" cy="85" r="30" className={a.halo} />
          <circle cx="110" cy="85" r="23" className={`${a.paper} ${a.orangeLn}`} />
          <text x="110" y="89" textAnchor="middle" className={`${a.t} ${a.tOrange} ${a.tLg}`}>
            policy
          </text>
        </g>
      );

    /* 4 · Procedures */
    case 3:
      return (
        <g>
          <rect x="8" y="6" width="150" height="158" rx="11" className={a.dashFrame} />
          <rect x="44" y="16" width="70" height="24" rx="12" className={`${a.paper} ${a.ln}`} />
          <text x="79" y="32" textAnchor="middle" className={`${a.t} ${a.tLg}`}>
            Start
          </text>
          <line x1="79" y1="40" x2="79" y2="50" className={a.ln} />
          <path d="M79 52l38 27-38 27-38-27z" className={`${a.paper} ${a.ln}`} />
          <text x="79" y="83" textAnchor="middle" className={a.t}>
            Approve?
          </text>
          <line x1="79" y1="106" x2="79" y2="118" className={a.ln} />
          <path d="M75 114l4 5 4-5" className={a.ln} />
          <rect x="44" y="120" width="70" height="26" rx="6" className={`${a.mint} ${a.tealLn}`} />
          <text x="79" y="137" textAnchor="middle" className={`${a.t} ${a.tTeal} ${a.tLg}`}>
            Record
          </text>
          <line x1="117" y1="79" x2="150" y2="79" className={a.dots} />
          <rect x="164" y="48" width="48" height="66" rx="6" className={`${a.paper} ${a.ln}`} />
          <line x1="172" y1="60" x2="204" y2="60" className={a.soft} />
          <line x1="172" y1="69" x2="196" y2="69" className={a.soft} />
          <rect x="172" y="80" width="10" height="10" rx="2.5" className={a.tealFill} />
          <path d="M174.5 85.2l2 2 3.6-4" className={a.checkInv} />
          <line x1="187" y1="85" x2="204" y2="85" className={a.soft} />
          <rect x="172" y="96" width="10" height="10" rx="2.5" className={a.ln} />
          <line x1="187" y1="101" x2="200" y2="101" className={a.soft} />
        </g>
      );

    /* 5 · Workflow builder */
    case 4:
      return (
        <g>
          <rect x="10" y="6" width="200" height="158" rx="11" className={a.dashFrame} />
          <rect x="76" y="16" width="68" height="24" rx="12" className={`${a.paper} ${a.orangeLn}`} />
          <text x="110" y="32" textAnchor="middle" className={`${a.t} ${a.tOrange} ${a.tLg}`}>
            Trigger
          </text>
          <path d="M110 40v10M56 50h108M56 50v10M164 50v10" className={a.ln} />
          <rect x="22" y="60" width="68" height="26" rx="6" className={`${a.paper} ${a.ln}`} />
          <text x="56" y="77" textAnchor="middle" className={a.t}>
            Review
          </text>
          <rect x="130" y="60" width="68" height="26" rx="6" className={`${a.paper} ${a.ln}`} />
          <text x="164" y="77" textAnchor="middle" className={a.t}>
            Legal
          </text>
          <path d="M56 86v10M164 86v10M56 96h108M110 96v10" className={a.ln} />
          <rect x="74" y="106" width="72" height="26" rx="6" className={`${a.mint} ${a.tealLn}`} />
          <text x="110" y="123" textAnchor="middle" className={`${a.t} ${a.tTeal} ${a.tLg}`}>
            Publish
          </text>
          <path d="M34 132l17 6-7.5 2.5-2.5 7.5z" className={a.inkFill} />
          <circle cx="184" cy="144" r="10" className={`${a.paper} ${a.orangeLn}`} />
          <path d="M184 139v10M179 144h10" className={a.orangeLn} />
        </g>
      );

    /* 6 · Lifecycle */
    case 5:
      return (
        <g>
          <path d="M96 27v5M96 51v5M96 75v5M96 99v5" className={a.ln} />
          {[
            ['Draft', 8, 'plain'],
            ['Under review', 32, 'plain'],
            ['Approved', 56, 'strong'],
            ['Published', 80, 'teal'],
            ['Archived', 104, 'dash'],
          ].map(([label, y, kind]) => (
            <g key={label as string}>
              <rect
                x="52"
                y={y as number}
                width="88"
                height="19"
                rx="9.5"
                className={
                  kind === 'teal'
                    ? `${a.mint} ${a.tealLn}`
                    : kind === 'dash'
                      ? `${a.paper} ${a.dashLn}`
                      : kind === 'strong'
                        ? `${a.paper} ${a.lnStrong}`
                        : `${a.paper} ${a.ln}`
                }
              />
              <text
                x="96"
                y={(y as number) + 13}
                textAnchor="middle"
                className={`${a.t} ${kind === 'teal' ? a.tTeal : ''} ${kind === 'dash' ? a.tMuted : ''}`}
              >
                {label}
              </text>
            </g>
          ))}
          <path d="M140 65.5C152 65.5 152 66 160 66" className={a.dotsOrange} />
          <circle cx="180" cy="66" r="19" className={`${a.paper} ${a.orangeLn}`} />
          <text x="180" y="69.5" textAnchor="middle" className={`${a.t} ${a.tOrange}`}>
            Board
          </text>
          <text x="110" y="150" textAnchor="middle" className={`${a.t} ${a.tTeal} ${a.tSm}`}>
            v3 · every decision recorded
          </text>
        </g>
      );

    /* 7 · Acknowledgement */
    case 6:
      return (
        <g>
          <rect x="20" y="6" width="166" height="100" rx="9" className={`${a.paper} ${a.ln}`} />
          <line x1="30" y1="18" x2="72" y2="18" className={a.tealBar} />
          <line x1="30" y1="28" x2="150" y2="28" className={a.soft} />
          {[
            ['read', 46, 'ok'],
            ['due', 68, 'due'],
            ['read', 90, 'ok'],
          ].map(([label, y, kind], i) => (
            <g key={i}>
              {i > 0 && <line x1="30" y1={(y as number) - 11} x2="176" y2={(y as number) - 11} className={a.hair} />}
              <line x1="30" y1={y as number} x2="100" y2={y as number} className={a.ln} />
              <rect
                x="110"
                y={(y as number) - 7.5}
                width="36"
                height="15"
                rx="7.5"
                className={kind === 'due' ? `${a.paper} ${a.orangeLn}` : `${a.mint} ${a.tealLn}`}
              />
              <text
                x="128"
                y={(y as number) + 3.5}
                textAnchor="middle"
                className={`${a.t} ${a.tSm} ${kind === 'due' ? a.tOrange : a.tTeal}`}
              >
                {label}
              </text>
              {kind === 'due' ? (
                <path d={`M160 ${(y as number) - 4}l8 8M168 ${(y as number) - 4}l-8 8`} className={a.orangeLn} />
              ) : (
                <path d={`M159 ${y as number}l3.5 3.5 6.5-7`} className={a.tealLn} />
              )}
            </g>
          ))}
          <rect x="50" y="116" width="104" height="22" rx="11" className={`${a.mint} ${a.tealLn}`} />
          <text x="102" y="130.5" textAnchor="middle" className={`${a.t} ${a.tTeal}`}>
            Published to me
          </text>
          <circle cx="154" cy="117" r="8.5" className={a.orangeFill} />
          <text x="154" y="120.5" textAnchor="middle" className={`${a.t} ${a.tInv} ${a.tSm}`}>
            3
          </text>
          <text x="102" y="158" textAnchor="middle" className={`${a.t} ${a.tTeal} ${a.tSm}`}>
            read by 1,240 of 1,300
          </text>
        </g>
      );

    /* 8 · Risk assessment */
    case 7: {
      const levels = [
        [0, 1, 3],
        [0, 0, 1],
        [2, 0, 0],
      ];
      return (
        <g>
          {levels.map((row, r) =>
            row.map((lv, col) => (
              <rect
                key={`${r}${col}`}
                x={14 + col * 30}
                y={8 + r * 30}
                width="30"
                height="30"
                className={`${a.cell} ${[a.cell0, a.cell1, a.cell2, a.cell3][lv]}`}
              />
            )),
          )}
          <rect x="14" y="8" width="90" height="90" className={a.ln} />
          <circle cx="89" cy="23" r="6" className={a.orangeFill} />
          <text x="14" y="112" className={`${a.t} ${a.tMuted} ${a.tSm}`}>
            likelihood →
          </text>
          <path d="M136 82a34 34 0 0 1 48-31" className={a.gaugeTeal} />
          <path d="M184 51a34 34 0 0 1 20 31" className={a.gaugeOrange} />
          <line x1="170" y1="82" x2="188" y2="60" className={a.lnStrong} />
          <circle cx="170" cy="82" r="3.5" className={a.inkFill} />
          <text x="170" y="100" textAnchor="middle" className={`${a.t} ${a.tSm}`}>
            score 3.6
          </text>
          <rect x="14" y="122" width="112" height="16" rx="5" className={`${a.paper} ${a.ln}`} />
          <line x1="22" y1="130" x2="118" y2="130" className={a.soft} />
          <rect x="60" y="118" width="20" height="24" rx="5" className={`${a.mint} ${a.tealLn}`} />
          <text x="14" y="160" className={`${a.t} ${a.tMuted} ${a.tSm}`}>
            evidence attached
          </text>
          <path d="M108 155l3.5 3.5 7-7.5" className={a.tealLn} />
        </g>
      );
    }

    /* 9 · Impact analyser */
    case 8:
      return (
        <g>
          <ellipse cx="110" cy="72" rx="58" ry="44" className={a.dotsOrangeSoft} />
          <ellipse cx="110" cy="72" rx="38" ry="30" className={a.dotsOrangeSoft} />
          {DOC_ANGLES.map((deg) => {
            const r = (deg * Math.PI) / 180;
            const x = 110 + 84 * Math.cos(r);
            const y = 72 + 58 * Math.sin(r);
            return (
              <g key={deg}>
                <line x1="110" y1="72" x2={x} y2={y} className={a.dots} />
                <path d={`M${x - 7} ${y - 9}h9l5 5v13h-14z`} className={`${a.paper} ${a.ln}`} />
                <path d={`M${x + 2} ${y - 9}v5h5`} className={a.ln} />
              </g>
            );
          })}
          <circle cx="110" cy="72" r="22" className={`${a.paper} ${a.dashOrange}`} />
          <text x="110" y="76" textAnchor="middle" className={`${a.t} ${a.tOrange} ${a.tLg}`}>
            § 4.2
          </text>
          <text x="110" y="158" textAnchor="middle" className={`${a.t} ${a.tTeal} ${a.tSm}`}>
            7 items affected · 3 owners notified
          </text>
        </g>
      );

    /* 10 · Reports & dashboards */
    default:
      return (
        <g>
          <rect x="18" y="8" width="118" height="70" rx="8" className={`${a.paper} ${a.ln}`} />
          {[
            [34, 40],
            [52, 26],
            [70, 46],
            [88, 30],
            [106, 52],
          ].map(([x, h]) => (
            <line key={x} x1={x} y1="66" x2={x} y2={66 - h} className={a.bar} />
          ))}
          <path d="M28 46c14-12 26 4 40-6s22-18 34-12 18 2 26-8" className={a.trend} />
          <path d="M74 88l34 11v24c0 22-15 36-34 42-19-6-34-20-34-42V99z" className={`${a.paper} ${a.lnStrong}`} />
          <path d="M58 126l11 11 22-24" className={a.checkBig} />
          <rect x="148" y="54" width="56" height="70" rx="5" className={`${a.paper} ${a.ln}`} />
          <line x1="157" y1="67" x2="186" y2="67" className={a.orangeBar} />
          <line x1="157" y1="79" x2="196" y2="79" className={a.soft} />
          <line x1="157" y1="89" x2="190" y2="89" className={a.soft} />
          <line x1="157" y1="99" x2="196" y2="99" className={a.soft} />
          <line x1="157" y1="109" x2="178" y2="109" className={a.soft} />
        </g>
      );
  }
}
