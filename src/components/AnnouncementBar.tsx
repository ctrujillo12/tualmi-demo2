const MESSAGE = 'Pre-order now — ships August 2026! ★ ';

export default function AnnouncementBar() {
  const repeated = MESSAGE.repeat(12);
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        backgroundColor: '#E078A1',
        overflow: 'hidden',
        padding: '8px 0',
      }}
    >
      <div className="marquee-track marquee-track--fast">
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#BC3D2C',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            lineHeight: 1,
            display: 'inline-block',
          }}
        >
          {repeated}
          {repeated}
        </span>
      </div>
    </div>
  );
}
