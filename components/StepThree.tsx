'use client';

import { useEffect, useRef, useState } from 'react';

function HermesLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      fill="black"
    >
      <path d="M923.53,377.48c-35.82-154.27-160.62-219.06-356.95-212.87l30,212.87h-35.37c-22.16-187.7-75.04-265.78-161.58-265.47H12l68.96,69.7,264.7,10.06v34.34l-232.71,1.41,68.07,71.39,215.27,10.06v34.65h-180.34l63.95,68.18,178.29,10.06v36.21h-143.96l-72.87,286.82h74.05l242.94-246.57h453.2c5.66-37.29-42.47-105.52-88.01-120.85Z" />
      <polygon points="588.58 547.52 393.25 744.9 716.75 912 799.22 826.52 751.29 815.09 713.62 851.11 583.83 750.29 691.9 594.83 765.47 630.78 890.59 603.97 901.96 695.49 855.32 691.53 840.48 722.62 924.3 742.81 948.71 728.53 923.53 547.52 588.58 547.52" />
      <polygon points="729.94 764.21 818.34 793.94 842.3 754.75 733.26 743.64 729.94 764.21" />
    </svg>
  );
}

type MessageType = 'botReview' | 'userConfirm' | 'typing' | 'botSubmitted';

interface ChatMessage {
  id: number;
  type: MessageType;
}

const MESSAGES: ChatMessage[] = [
  { id: 1, type: 'botReview' },
  { id: 2, type: 'userConfirm' },
  { id: 3, type: 'typing' },
  { id: 4, type: 'botSubmitted' },
];

const DELAYS = [600, 1800, 2600, 4000];

const FONT = '-apple-system, BlinkMacSystemFont, sans-serif';

const bubbleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  lineHeight: 1.6,
  color: '#fff',
};

function AvatarBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <HermesLogo size={14} />
      </div>
      {children}
    </div>
  );
}

function BotReviewBubble() {
  return (
    <AvatarBubble>
      <div
        style={{
          background: '#2c2c2e',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 12px',
          maxWidth: '78%',
          ...bubbleStyle,
        }}
      >
        <div style={bubbleStyle}>
          Please review your report before submission.
        </div>
        <div style={{ ...bubbleStyle, marginTop: 4 }}>Incident Type: Fire</div>
        <div style={bubbleStyle}>Location: Roosevelt St. Quezon City</div>
        <div style={bubbleStyle}>Severity: High</div>
        <div style={bubbleStyle}>
          {"Description: Fire at Aling Nena's Store"}
        </div>
        <div style={{ ...bubbleStyle, marginTop: 4 }}>
          Select a field to edit, cancel the report, or confirm to submit.
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 5 }}>
          {['Confirm', 'Edit', 'Cancel'].map((label) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: '#3a3a3c',
                borderRadius: 8,
                color: '#fff',
                fontSize: 10,
                padding: '5px 4px',
                textAlign: 'center',
                fontFamily: FONT,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </AvatarBubble>
  );
}

function UserConfirmBubble() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards',
        }}
      >
        <div
          style={{
            background: '#0a7cff',
            borderRadius: '18px 18px 4px 18px',
            padding: '8px 12px',
            maxWidth: '82%',
            ...bubbleStyle,
          }}
        >
          Confirm and Submit
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: 4,
          marginTop: 2,
        }}
      >
        <span style={{ fontSize: 10, color: '#636366', fontFamily: FONT }}>
          Sent
        </span>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <AvatarBubble>
      <div
        style={{
          background: '#2c2c2e',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {[0, 0.18, 0.36].map((delay, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#8e8e93',
              animation: `dotBounce 1.2s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </AvatarBubble>
  );
}

function BotSubmittedBubble() {
  return (
    <AvatarBubble>
      <div
        style={{
          background: '#2c2c2e',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 12px',
          ...bubbleStyle,
        }}
      >
        Report Submitted.
      </div>
    </AvatarBubble>
  );
}

export function StepThreeIllustration() {
  const [visibleCount, setVisibleCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;
    // Skip showing typing bubble if next is botSubmitted (replace it instead)
    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      DELAYS[visibleCount]
    );
    return () => clearTimeout(timer);
  }, [visibleCount]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [visibleCount]);

  // Show typing only while waiting for botSubmitted
  const visible = MESSAGES.slice(0, visibleCount).filter((m) => {
    if (m.type === 'typing') {
      return !MESSAGES.slice(0, visibleCount).some(
        (x) => x.type === 'botSubmitted'
      );
    }
    return true;
  });

  return (
    <>
      <style>{`
        @keyframes bubbleIn {
          from { opacity:0; transform:translateY(8px) scale(0.93); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40%          { transform:translateY(-4px); opacity:1; }
        }
      `}</style>

      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}
      >
        <div
          style={{
            position: 'relative',
            width: 296,
            background: '#1a1a1a',
            borderRadius: 48,
            boxShadow:
              '0 0 0 1.5px #3a3a3a, 0 0 0 3px #111, 0 32px 64px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Side buttons */}
          <div
            style={{
              position: 'absolute',
              left: -4,
              top: 96,
              width: 4,
              height: 28,
              background: '#2a2a2a',
              borderRadius: '2px 0 0 2px',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -4,
              top: 134,
              width: 4,
              height: 28,
              background: '#2a2a2a',
              borderRadius: '2px 0 0 2px',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -4,
              top: 120,
              width: 4,
              height: 44,
              background: '#2a2a2a',
              borderRadius: '0 2px 2px 0',
              boxShadow: '1px 0 2px rgba(0,0,0,0.5)',
            }}
          />

          {/* Screen bezel */}
          <div
            style={{
              borderRadius: 40,
              overflow: 'hidden',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                background: '#1c1c1e',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 10,
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 26,
                  background: '#000',
                  borderRadius: 20,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                }}
              />
            </div>

            {/* Status bar */}
            <div
              style={{
                background: '#1c1c1e',
                padding: '2px 18px 6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  fontFamily: FONT,
                }}
              >
                10:43
              </span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <svg width="12" height="9" viewBox="0 0 12 9">
                  <rect
                    x="0"
                    y="3"
                    width="2"
                    height="6"
                    rx="0.5"
                    fill="white"
                    opacity="0.4"
                  />
                  <rect
                    x="3"
                    y="2"
                    width="2"
                    height="7"
                    rx="0.5"
                    fill="white"
                    opacity="0.6"
                  />
                  <rect
                    x="6"
                    y="1"
                    width="2"
                    height="8"
                    rx="0.5"
                    fill="white"
                    opacity="0.8"
                  />
                  <rect
                    x="9"
                    y="0"
                    width="2"
                    height="9"
                    rx="0.5"
                    fill="white"
                  />
                </svg>
                <svg width="14" height="9" viewBox="0 0 20 12">
                  <path
                    d="M10 2C13 2 15.7 3.2 17.6 5.2L19.2 3.6C16.8 1.3 13.6 0 10 0S3.2 1.3.8 3.6L2.4 5.2C4.3 3.2 7 2 10 2Z"
                    fill="white"
                    opacity="0.4"
                  />
                  <path
                    d="M10 5C12 5 13.8 5.8 15.2 7.1L16.8 5.5C15 3.9 12.6 3 10 3S5 3.9 3.2 5.5L4.8 7.1C6.2 5.8 8 5 10 5Z"
                    fill="white"
                    opacity="0.7"
                  />
                  <circle cx="10" cy="10" r="2" fill="white" />
                </svg>
                <svg width="22" height="11" viewBox="0 0 22 11">
                  <rect
                    x="0.5"
                    y="0.5"
                    width="18"
                    height="10"
                    rx="3"
                    stroke="white"
                    strokeOpacity="0.35"
                  />
                  <rect
                    x="2"
                    y="2"
                    width="13"
                    height="7"
                    rx="1.5"
                    fill="white"
                  />
                  <path
                    d="M20 3.5v4c.8-.3 1.5-.9 1.5-2s-.7-1.7-1.5-2z"
                    fill="white"
                    opacity="0.4"
                  />
                </svg>
              </div>
            </div>

            {/* Chat header */}
            <div
              style={{
                background: '#1c1c1e',
                padding: '8px 12px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path
                  d="M6 2L2 7L6 12"
                  stroke="#0a7cff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HermesLogo size={20} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    background: '#30d158',
                    borderRadius: '50%',
                    border: '2px solid #1c1c1e',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#fff',
                    lineHeight: 1.2,
                    fontFamily: FONT,
                  }}
                >
                  HERMES
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#30d158',
                    lineHeight: 1.2,
                    fontFamily: FONT,
                  }}
                >
                  Active now
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(10,124,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#0a7cff"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(10,124,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="14"
                    height="11"
                    viewBox="0 0 24 18"
                    fill="#0a7cff"
                  >
                    <path d="M17 6.5V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V11.5l4 4v-13l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px 10px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                background: '#111',
                minHeight: 340,
                maxHeight: 340,
                scrollbarWidth: 'none',
              }}
            >
              {visible.map((msg) => {
                if (msg.type === 'botReview')
                  return <BotReviewBubble key={msg.id} />;
                if (msg.type === 'userConfirm')
                  return <UserConfirmBubble key={msg.id} />;
                if (msg.type === 'typing') return <TypingBubble key={msg.id} />;
                if (msg.type === 'botSubmitted')
                  return <BotSubmittedBubble key={msg.id} />;
                return null;
              })}
            </div>

            {/* Input bar */}
            <div
              style={{
                background: '#1c1c1e',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                borderTop: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                <svg
                  key="plus"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#0a7cff"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v8M8 12h8"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>,
                <svg
                  key="cam"
                  width="12"
                  height="11"
                  viewBox="0 0 24 20"
                  fill="none"
                >
                  <path
                    d="M23 17C23 18.1 22.1 19 21 19H3C1.9 19 1 18.1 1 17V7C1 5.9 1.9 5 3 5H7L9 2H15L17 5H21C22.1 5 23 5.9 23 7V17Z"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#0a7cff"
                    strokeWidth="2"
                  />
                </svg>,
                <svg
                  key="img"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="#0a7cff"
                    strokeWidth="2"
                  />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#0a7cff" />
                  <path
                    d="M21 15L16 10L5 21"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>,
                <svg
                  key="mic"
                  width="10"
                  height="14"
                  viewBox="0 0 20 28"
                  fill="none"
                >
                  <rect
                    x="5"
                    y="1"
                    width="10"
                    height="15"
                    rx="5"
                    stroke="#0a7cff"
                    strokeWidth="2"
                  />
                  <path
                    d="M2 13c0 4.4 3.6 8 8 8s8-3.6 8-8"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="10"
                    y1="21"
                    x2="10"
                    y2="26"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="6"
                    y1="26"
                    x2="14"
                    y2="26"
                    stroke="#0a7cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>,
              ].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(10,124,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
              ))}
              <div
                style={{
                  flex: 1,
                  background: '#2c2c2e',
                  borderRadius: 18,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                }}
              >
                <span
                  style={{ fontSize: 12, color: '#636366', fontFamily: FONT }}
                >
                  Aa
                </span>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(10,124,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#0a7cff"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 13.5s1.5 2 4 2 4-2 4-2"
                    stroke="#0a7cff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="10" r="1.2" fill="#0a7cff" />
                  <circle cx="15" cy="10" r="1.2" fill="#0a7cff" />
                </svg>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#0a7cff"
                style={{ flexShrink: 0 }}
              >
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </div>

            {/* Home indicator */}
            <div
              style={{
                background: '#1c1c1e',
                display: 'flex',
                justifyContent: 'center',
                padding: '6px 0 10px',
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 4,
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
