'use client';

const HX = 340;
const HY = 268;
const CITIZEN_R = 26;
const RESPONDER_R = 26;
const HERMES_R = 48;

const CITIZENS = [
  { id: 'c1', cx: 94, cy: 200 },
  { id: 'c2', cx: 158, cy: 132 },
  { id: 'c3', cx: 252, cy: 96 },
  { id: 'c4', cx: 340, cy: 72 },
  { id: 'c5', cx: 428, cy: 96 },
  { id: 'c6', cx: 522, cy: 132 },
  { id: 'c7', cx: 586, cy: 200 },
];

const RESPONDERS = [
  { id: 'r1', cx: 130, cy: 388 },
  { id: 'r2', cx: 232, cy: 448 },
  { id: 'r3', cx: 340, cy: 468 },
  { id: 'r4', cx: 448, cy: 448 },
  { id: 'r5', cx: 550, cy: 388 },
];

function shorten(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * r1,
    y1: y1 + uy * r1,
    x2: x2 - ux * r2,
    y2: y2 - uy * r2,
  };
}

export default function HermesNetwork() {
  return (
    <>
      <style>{`
        @keyframes hnet-dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes hnet-badge {
          0%, 100% { opacity: 0.8; }
          50%       { opacity: 1;   }
        }
        @keyframes hnet-ripple {
          0%   { r: 50; opacity: 0.55; }
          100% { r: 94; opacity: 0;    }
        }
        .hnet-line {
          stroke-dasharray: 5 5;
          animation: hnet-dash 1.6s linear infinite;
        }
        .hnet-badge-anim {
          animation: hnet-badge 3.5s ease-in-out infinite;
        }
        .hnet-ripple-a { animation: hnet-ripple 2.6s ease-out infinite; }
        .hnet-ripple-b { animation: hnet-ripple 2.6s ease-out infinite; animation-delay: 0.87s; }
        .hnet-ripple-c { animation: hnet-ripple 2.6s ease-out infinite; animation-delay: 1.73s; }
      `}</style>

      <svg
        width="100%"
        viewBox="0 0 680 540"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* ── Ripple rings ── */}
        <circle
          cx={HX}
          cy={HY}
          r={HERMES_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.12}
          className="hnet-ripple-a"
        />
        <circle
          cx={HX}
          cy={HY}
          r={HERMES_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.12}
          className="hnet-ripple-b"
        />
        <circle
          cx={HX}
          cy={HY}
          r={HERMES_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity={0.12}
          className="hnet-ripple-c"
        />

        {/* ── Lines: citizens → HERMES ── */}
        {CITIZENS.map((c, i) => {
          const s = shorten(c.cx, c.cy, HX, HY, CITIZEN_R + 2, HERMES_R + 2);
          return (
            <line
              key={c.id + '-l'}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="currentColor"
              strokeWidth="1.2"
              opacity={0.35}
              className="hnet-line"
              style={{ animationDelay: `${i * 0.23}s` }}
            />
          );
        })}

        {/* ── Lines: HERMES → responders ── */}
        {RESPONDERS.map((r, i) => {
          const s = shorten(HX, HY, r.cx, r.cy, HERMES_R + 2, RESPONDER_R + 2);
          return (
            <line
              key={r.id + '-l'}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="currentColor"
              strokeWidth="1.2"
              opacity={0.35}
              className="hnet-line"
              style={{ animationDelay: `${i * 0.23 + 0.12}s` }}
            />
          );
        })}

        {/* ══ HERMES center ══ */}
        <circle
          cx={HX}
          cy={HY}
          r={HERMES_R}
          fill="#1a1a1a"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity={0.25}
        />
        <g
          transform={`translate(${HX},${HY}) scale(0.056) translate(-512,-512)`}
        >
          <path
            d="M923.53,377.48c-35.82-154.27-160.62-219.06-356.95-212.87l30,212.87h-35.37c-22.16-187.7-75.04-265.78-161.58-265.47H12l68.96,69.7,264.7,10.06v34.34l-232.71,1.41,68.07,71.39,215.27,10.06v34.65h-180.34l63.95,68.18,178.29,10.06v36.21h-143.96l-72.87,286.82h74.05l242.94-246.57h453.2c5.66-37.29-42.47-105.52-88.01-120.85Z"
            fill="white"
          />
          <polygon
            points="588.58 547.52 393.25 744.9 716.75 912 799.22 826.52 751.29 815.09 713.62 851.11 583.83 750.29 691.9 594.83 765.47 630.78 890.59 603.97 901.96 695.49 855.32 691.53 840.48 722.62 924.3 742.81 948.71 728.53 923.53 547.52 588.58 547.52"
            fill="white"
          />
          <polygon
            points="729.94 764.21 818.34 793.94 842.3 754.75 733.26 743.64 729.94 764.21"
            fill="white"
          />
        </g>
        <text
          x={HX}
          y={HY + HERMES_R + 16}
          textAnchor="middle"
          style={{
            fontSize: 10,
            fill: 'currentColor',
            opacity: 0.3,
            letterSpacing: 2,
            fontFamily: 'inherit',
          }}
        >
          HERMES
        </text>

        {/* ══ CITIZEN NODES ══ */}
        {CITIZENS.map((c) => (
          <g key={c.id}>
            <circle
              cx={c.cx}
              cy={c.cy}
              r={CITIZEN_R}
              fill="currentColor"
              fillOpacity={0.06}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity={0.25}
            />
            {/* person icon */}
            <circle
              cx={c.cx}
              cy={c.cy - 8}
              r={5.5}
              fill="currentColor"
              opacity={0.6}
            />
            <path
              d={`M${c.cx - 9},${c.cy + 14} Q${c.cx - 9},${c.cy + 4} ${c.cx},${c.cy + 4} Q${c.cx + 9},${c.cy + 4} ${c.cx + 9},${c.cy + 14}`}
              fill="currentColor"
              opacity={0.6}
            />
            {/* plain circular badge */}
            <g className="hnet-badge-anim">
              <circle
                cx={c.cx + 18}
                cy={c.cy - 18}
                r={7}
                fill="currentColor"
                fillOpacity={0.7}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity={0.3}
              />
            </g>
          </g>
        ))}

        {/* ══ RESPONDER NODES ══ */}
        {RESPONDERS.map((r) => (
          <g key={r.id}>
            <circle
              cx={r.cx}
              cy={r.cy}
              r={RESPONDER_R}
              fill="currentColor"
              fillOpacity={0.06}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity={0.25}
            />
            {/* shield icon */}
            <path
              d={`M${r.cx},${r.cy - 13} L${r.cx + 10},${r.cy - 8} L${r.cx + 10},${r.cy + 2} Q${r.cx + 10},${r.cy + 10} ${r.cx},${r.cy + 15} Q${r.cx - 10},${r.cy + 10} ${r.cx - 10},${r.cy + 2} L${r.cx - 10},${r.cy - 8} Z`}
              fill="currentColor"
              opacity={0.6}
            />
            {/* plain circular badge */}
            <g className="hnet-badge-anim">
              <circle
                cx={r.cx + 18}
                cy={r.cy - 18}
                r={7}
                fill="currentColor"
                fillOpacity={0.7}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity={0.3}
              />
            </g>
          </g>
        ))}

        {/* ── section labels ── */}
        <text
          x={HX}
          y={36}
          textAnchor="middle"
          style={{
            fontSize: 11,
            fill: 'currentColor',
            opacity: 0.28,
            letterSpacing: 2,
            fontFamily: 'inherit',
          }}
        >
          CITIZENS
        </text>
        <text
          x={HX}
          y={514}
          textAnchor="middle"
          style={{
            fontSize: 11,
            fill: 'currentColor',
            opacity: 0.28,
            letterSpacing: 2,
            fontFamily: 'inherit',
          }}
        >
          RESPONDERS
        </text>

        {/* ── legend (centered) ── */}
        <g transform="translate(340, 532)">
          {/* citizen */}
          <g transform="translate(-88, 0)">
            <circle
              cx={7}
              cy={7}
              r={7}
              fill="currentColor"
              fillOpacity={0.06}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity={0.25}
            />
            <circle cx={7} cy={4} r={2.5} fill="currentColor" opacity={0.55} />
            <path
              d="M2,14 Q2,9 7,9 Q12,9 12,14"
              fill="currentColor"
              opacity={0.55}
            />
            <text
              x={20}
              y={11}
              style={{
                fontSize: 11,
                fill: 'currentColor',
                opacity: 0.35,
                fontFamily: 'inherit',
              }}
            >
              Citizens
            </text>
          </g>
          {/* responder */}
          <g transform="translate(26, 0)">
            <circle
              cx={7}
              cy={7}
              r={7}
              fill="currentColor"
              fillOpacity={0.06}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity={0.25}
            />
            <path
              d="M7,1 L13,4 L13,9 Q13,13 7,16 Q1,13 1,9 L1,4 Z"
              fill="currentColor"
              opacity={0.55}
            />
            <text
              x={20}
              y={11}
              style={{
                fontSize: 11,
                fill: 'currentColor',
                opacity: 0.35,
                fontFamily: 'inherit',
              }}
            >
              Responders
            </text>
          </g>
        </g>
      </svg>
    </>
  );
}
