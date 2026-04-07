'use client';

const SimpleIcon = ({
  iconSlug,
  size = 24,
}: {
  iconSlug: string;
  size?: number;
}) => {
  const iconMap = {
    messenger:
      'M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z',
    telegram:
      'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    whatsapp:
      'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
    sms: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
  } as const;

  const iconPath = iconMap[iconSlug as keyof typeof iconMap];

  if (!iconPath) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: '#eee',
          borderRadius: 4,
        }}
      />
    );
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      style={{ width: size, height: size, fill: 'currentColor' }}
    >
      <path d={iconPath} />
    </svg>
  );
};

const messagingApps = [
  { name: 'Messenger', id: 'messenger', comingSoon: false },
  { name: 'Telegram', id: 'telegram', comingSoon: false },
  { name: 'WhatsApp', id: 'whatsapp', comingSoon: true },
  { name: 'SMS', id: 'sms', comingSoon: true },
] as const;

// Build two identical halves of 4 copies each (8 total items per half).
// The animation translates -50%, which is exactly one half — so the snap
// back to 0 is invisible. Having 8 items per half ensures the track is
// always wider than the visible container on any screen size.
const half = [
  ...messagingApps,
  ...messagingApps,
  ...messagingApps,
  ...messagingApps,
];
const repeated = [...half, ...half];

export function LogoCarousel() {
  return (
    <section style={{ padding: '48px 0' }}>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .marquee-item {
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .marquee-item:hover {
          opacity: 1;
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: 14,
            color: 'var(--muted-foreground, #888)',
            marginBottom: 32,
          }}
        >
          Messaging platforms that we have integrated with (and many more to
          come)
        </p>

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left fade */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background:
                'linear-gradient(to right, var(--background, #fff), transparent)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
          {/* Right fade */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background:
                'linear-gradient(to left, var(--background, #fff), transparent)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          <div className="marquee-track">
            {repeated.map((app, index) => (
              <div
                key={index}
                className="marquee-item"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 40px',
                }}
              >
                <SimpleIcon iconSlug={app.id} size={28} />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}
                  >
                    {app.name}
                  </span>
                  {app.comingSoon && (
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--muted-foreground, #888)',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
