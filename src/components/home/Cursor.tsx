import d from './demos.module.css';

/** Pointer used by the scripted demos. Hidden when no target is given. */
export function Cursor({ point, clicking }: { point: { x: number; y: number } | null; clicking?: boolean }) {
  return (
    <span
      className={`${d.cursor} ${point ? '' : d.cursorHidden} ${clicking ? d.cursorClick : ''}`}
      style={point ? { transform: `translate3d(${point.x}px, ${point.y}px, 0)` } : undefined}
      aria-hidden="true"
    >
      <svg width="20" height="22" viewBox="0 0 20 22">
        <path
          d="M2 1.5v16.2l4.3-3.9 2.9 6.6 2.9-1.3-2.9-6.5 5.9-.4z"
          fill="#0F2D3D"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
