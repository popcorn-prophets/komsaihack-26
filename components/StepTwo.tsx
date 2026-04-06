'use client';

import { useEffect, useState } from 'react';

function HermesLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path d="M923.53,377.48c-35.82-154.27-160.62-219.06-356.95-212.87l30,212.87h-35.37c-22.16-187.7-75.04-265.78-161.58-265.47H12l68.96,69.7,264.7,10.06v34.34l-232.71,1.41,68.07,71.39,215.27,10.06v34.65h-180.34l63.95,68.18,178.29,10.06v36.21h-143.96l-72.87,286.82h74.05l242.94-246.57h453.2c5.66-37.29-42.47-105.52-88.01-120.85Z" />
      <polygon points="588.58 547.52 393.25 744.9 716.75 912 799.22 826.52 751.29 815.09 713.62 851.11 583.83 750.29 691.9 594.83 765.47 630.78 890.59 603.97 901.96 695.49 855.32 691.53 840.48 722.62 924.3 742.81 948.71 728.53 923.53 547.52 588.58 547.52" />
      <polygon points="729.94 764.21 818.34 793.94 842.3 754.75 733.26 743.64 729.94 764.21" />
    </svg>
  );
}

const WAVEFORM = [
  3, 6, 10, 7, 12, 8, 14, 9, 6, 13, 11, 7, 15, 10, 6, 9, 13, 8, 5, 11, 14, 7,
  10, 6, 12,
];

const FIELDS = [
  { label: 'Incident Type', value: 'Fire', delay: 0 },
  { label: 'Location', value: 'Roosevelt St. Quezon City', delay: 200 },
  { label: 'Time', value: '10:42 AM', delay: 400 },
  { label: 'Severity', value: 'High', delay: 600 },
  { label: 'Description', value: "Fire at Aling Nena's store", delay: 800 },
];

export function StepTwoIllustration() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [visibleFields, setVisibleFields] = useState(0);
  const [particleKey, setParticleKey] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setPhase(0);
      setVisibleFields(0);

      timers.push(
        setTimeout(() => {
          setPhase(1);
          setParticleKey((k) => k + 1);
        }, 1000)
      );

      timers.push(setTimeout(() => setPhase(2), 2200));

      FIELDS.forEach((f, i) => {
        timers.push(
          setTimeout(() => setVisibleFields(i + 1), 2200 + f.delay + 80)
        );
      });

      timers.push(setTimeout(() => setPhase(3), 2200 + 800 + 700));
      timers.push(setTimeout(run, 2200 + 800 + 3500));
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const parsing = phase === 1;
  const cardVisible = phase === 2 || phase === 3;
  const done = phase === 3;

  return (
    <>
      <style>{`
        @keyframes s2-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes s2-ring  { 0%{transform:scale(0.8);opacity:0.55} 100%{transform:scale(1.75);opacity:0} }
        @keyframes s2-pt    { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--px),var(--py)) scale(0)} }
        @keyframes s2-bar   { from{width:0} to{width:100%} }
        @keyframes s2-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes s2-pulse { 0%,100%{opacity:0.35;transform:translateY(0)} 40%{opacity:1;transform:translateY(-2px)} }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem 1rem',
          fontFamily: 'system-ui, sans-serif',
          minHeight: 460,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            width: '100%',
            maxWidth: 720,
          }}
        >
          {/* ── LEFT: Chat thread (always visible) ── */}
          <div
            style={{
              flexShrink: 0,
              width: 160,
              animation: 's2-float 4s ease-in-out infinite',
            }}
          >
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.10)',
                background: '#f9f9f9',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              {/* Mini header */}
              <div
                style={{
                  background: '#fff',
                  borderBottom: '1px solid rgba(0,0,0,0.07)',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#171717',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <HermesLogo size={10} />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#171717',
                    letterSpacing: '0.04em',
                  }}
                >
                  HERMES
                </span>
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#22c55e',
                  }}
                />
              </div>

              {/* Messages */}
              <div
                style={{
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                {/* Text bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      background: '#171717',
                      color: '#fff',
                      borderRadius: '12px 12px 2px 12px',
                      padding: '7px 9px',
                      fontSize: 9.5,
                      lineHeight: 1.5,
                      maxWidth: '92%',
                    }}
                  >
                    tulong!! may sunog sa tindahan ni aling nena!
                  </div>
                </div>

                {/* Image bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: 88,
                      height: 60,
                      borderRadius: '10px 10px 2px 10px',
                      background: '#e4e4e7',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                    }}
                  >
                    <svg width="22" height="17" viewBox="0 0 36 28" fill="none">
                      <circle cx="27" cy="7" r="4" fill="rgba(0,0,0,0.15)" />
                      <path
                        d="M0 28L11 10L18 19L23 12L36 28H0Z"
                        fill="rgba(0,0,0,0.18)"
                      />
                      <path
                        d="M18 28L23 12L36 28H18Z"
                        fill="rgba(0,0,0,0.10)"
                      />
                    </svg>
                    <span style={{ fontSize: 8, color: '#a1a1aa' }}>Photo</span>
                  </div>
                </div>

                {/* Audio bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      background: '#171717',
                      borderRadius: '12px 12px 2px 12px',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      minWidth: 104,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="6" height="7" viewBox="0 0 8 10" fill="white">
                        <path d="M0 0L8 5L0 10V0Z" />
                      </svg>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flex: 1,
                        height: 14,
                      }}
                    >
                      {WAVEFORM.slice(0, 18).map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 2,
                            height: Math.max(2, (h / 15) * 11),
                            background: 'rgba(255,255,255,0.65)',
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: 8,
                        color: 'rgba(255,255,255,0.55)',
                        flexShrink: 0,
                      }}
                    >
                      0:11
                    </span>
                  </div>
                </div>

                {/* Sent */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 8, color: '#a1a1aa' }}>Sent</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CONNECTOR LEFT ── */}
          <div style={{ flexShrink: 0, width: 28 }}>
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <path
                d="M0 18 Q14 18 28 18"
                stroke={parsing ? '#171717' : 'rgba(0,0,0,0.14)'}
                strokeWidth="1.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.4s' }}
              />
              {parsing && (
                <circle r="2.5" fill="#171717">
                  <animateMotion
                    dur="0.9s"
                    repeatCount="indefinite"
                    path="M0 18 Q14 18 28 18"
                  />
                </circle>
              )}
            </svg>
          </div>

          {/* ── CENTER: Hermes Logo ── */}
          <div
            style={{
              flexShrink: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 68,
              height: 68,
            }}
          >
            {/* Spinning dashed orbit */}
            <div
              style={{
                position: 'absolute',
                width: 68,
                height: 68,
                border: '1.5px dashed rgba(0,0,0,0.12)',
                borderRadius: '50%',
                animation: 's2-spin 8s linear infinite',
              }}
            />

            {/* Pulse rings */}
            {parsing &&
              [0, 0.38, 0.76].map((d, i) => (
                <div
                  key={`${particleKey}-${i}`}
                  style={{
                    position: 'absolute',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(0,0,0,0.3)',
                    animation: `s2-ring 1.4s ease-out ${d}s infinite`,
                  }}
                />
              ))}

            {/* Logo disc */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#171717',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: parsing
                  ? '0 0 24px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.18)'
                  : '0 4px 14px rgba(0,0,0,0.16)',
                transition: 'box-shadow 0.5s',
                position: 'relative',
                zIndex: 2,
                color: '#fff',
              }}
            >
              <HermesLogo size={26} />
            </div>

            {/* Particles */}
            {parsing && (
              <div
                key={particleKey}
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const angle = (i / 10) * 2 * Math.PI;
                  const dist = 42 + (i % 3) * 10;
                  const px = Math.cos(angle) * dist;
                  const py = Math.sin(angle) * dist;
                  const shades = [
                    '#171717',
                    '#404040',
                    '#737373',
                    '#a3a3a3',
                    '#d4d4d4',
                  ];
                  return (
                    <div
                      key={i}
                      style={
                        {
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: shades[i % shades.length],
                          '--px': `${px}px`,
                          '--py': `${py}px`,
                          transform: 'translate(-50%,-50%)',
                          animation: `s2-pt 1s ease-out ${i * 0.07}s forwards`,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CONNECTOR RIGHT ── */}
          <div style={{ flexShrink: 0, width: 28 }}>
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <path
                d="M0 18 Q14 18 28 18"
                stroke={cardVisible ? '#171717' : 'rgba(0,0,0,0.14)'}
                strokeWidth="1.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.5s' }}
              />
              <polygon
                points="24,14 28,18 24,22"
                fill={cardVisible ? '#171717' : 'rgba(0,0,0,0.14)'}
                style={{ transition: 'fill 0.5s' }}
              />
            </svg>
          </div>

          {/* ── RIGHT: Structured Data Card ── */}
          <div
            style={{
              flexShrink: 0,
              width: 200,
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible
                ? 'translateY(0) scale(1)'
                : 'translateY(14px) scale(0.95)',
              transition:
                'opacity 0.5s cubic-bezier(0.34,1.4,0.64,1), transform 0.5s cubic-bezier(0.34,1.4,0.64,1)',
            }}
          >
            <div
              style={{
                borderRadius: 16,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.09)',
                boxShadow:
                  '0 8px 28px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: '#171717',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '0.05em',
                  }}
                >
                  INCIDENT REPORT
                </span>

                {!done && cardVisible && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      gap: 3,
                      alignItems: 'center',
                    }}
                  >
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.5)',
                          animation: `s2-pulse 0.9s ease-in-out ${d}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {done && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      color: '#d4d4d4',
                      fontWeight: 500,
                    }}
                  >
                    Parsed
                  </span>
                )}
              </div>

              {/* Fields */}
              <div
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {FIELDS.map((field, i) => (
                  <div
                    key={field.label}
                    style={{
                      opacity: visibleFields > i ? 1 : 0,
                      transform:
                        visibleFields > i
                          ? 'translateX(0)'
                          : 'translateX(-10px)',
                      transition: 'opacity 0.32s ease, transform 0.32s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 8.5,
                          fontWeight: 600,
                          color: '#a3a3a3',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          minWidth: 66,
                          flexShrink: 0,
                          paddingTop: 3,
                        }}
                      >
                        {field.label}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          background: '#f5f5f5',
                          borderRadius: 5,
                          padding: '3px 7px',
                          border: '1px solid rgba(0,0,0,0.07)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 500,
                            color: '#171717',
                            lineHeight: 1.35,
                            display: 'block',
                          }}
                        >
                          {field.value}
                        </span>
                      </div>
                    </div>
                    {visibleFields > i && (
                      <div
                        style={{
                          marginTop: 3,
                          height: 1.5,
                          borderRadius: 1,
                          background: 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 1,
                            background:
                              'linear-gradient(90deg,#404040,#d4d4d4)',
                            animation: 's2-bar 0.45s ease forwards',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              {done && (
                <div
                  style={{
                    padding: '7px 12px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 8.5, color: '#a3a3a3' }}>
                    Processed by HERMES
                  </span>
                  <span
                    style={{
                      fontSize: 8.5,
                      color: '#a3a3a3',
                      fontFamily: 'monospace',
                    }}
                  >
                    #INC-2847
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: 10.5,
              color: '#a3a3a3',
              letterSpacing: '0.04em',
            }}
          >
            {phase === 0 && 'Messages received'}
            {phase === 1 && 'Parsing with HERMES…'}
            {phase === 2 && 'Structuring incident data…'}
            {phase === 3 && 'Incident report generated'}
          </p>
        </div>
      </div>
    </>
  );
}
