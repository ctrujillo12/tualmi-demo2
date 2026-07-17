// Shared building blocks for the footer pages (shipping, returns, size + fit,
// garment care, privacy, terms). Matches the landing-page design system:
// blush background, lowercase maroon headings, left-aligned soft-maroon body.
// Header + footer come from the global layout — pages only render content.

import type { CSSProperties, ReactNode } from 'react';

export const sans    = 'var(--font-montserrat), system-ui, sans-serif';
export const maroon  = '#A9445C';
export const blushBg = '#FBF1F5';
export const soft    = '#C9849A';
export const rule    = '#F0D9E1'; // hairlines / table borders

export const bodyStyle: CSSProperties = {
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 'clamp(14px, 1.6vw, 15px)',
  lineHeight: 2,
  color: soft,
  margin: 0,
  textAlign: 'left',
};

/** Page shell — blush background, centered lowercase title, content column. */
export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ backgroundColor: blushBg, minHeight: '100vh' }}>
      <main
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: 'clamp(96px, 14vw, 150px) clamp(24px, 5vw, 32px) clamp(64px, 10vw, 110px)',
        }}
      >
        <h1
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 'clamp(28px, 4.5vw, 44px)',
            letterSpacing: '-0.03em',
            color: maroon,
            margin: '0 0 clamp(40px, 6vw, 60px)',
            textTransform: 'lowercase',
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(36px, 5vw, 52px)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Content section with an optional lowercase maroon heading. */
export function Section({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {heading && (
        <h2
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: '17px',
            letterSpacing: '-0.01em',
            color: maroon,
            margin: 0,
            textTransform: 'lowercase',
          }}
        >
          {heading}
        </h2>
      )}
      {children}
    </section>
  );
}

/** Body paragraph. */
export function P({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ ...bodyStyle, ...style }}>{children}</p>;
}

/** Bullet list with the ✦ marker used across the site. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ ...bodyStyle, display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: 1.8 }}>
          <span style={{ color: maroon, flexShrink: 0 }}>✦</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Table primitives (size charts etc.). */
export function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  const cell: CSSProperties = {
    fontFamily: sans,
    fontWeight: 500,
    fontSize: '13px',
    color: soft,
    padding: '9px 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  ...cell,
                  fontWeight: 700,
                  color: maroon,
                  textTransform: 'lowercase',
                  borderBottom: `1.5px solid ${maroon}`,
                  textAlign: i === 0 ? 'left' : 'center',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${rule}` }}>
              {row.map((v, j) => (
                <td key={j} style={{ ...cell, textAlign: j === 0 ? 'left' : 'center', whiteSpace: j === 0 ? 'normal' : 'nowrap' }}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
