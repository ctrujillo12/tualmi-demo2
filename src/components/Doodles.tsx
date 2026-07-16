/*
 * Original hand-drawn-style SVG doodles for the Tualmi redesign.
 * Drawn from scratch — rough strokes, playful rotation.
 */

interface DoodleProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SunDoodle({ size = 64, color = '#BC3D2C', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="20" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="50" y1="18" x2="50" y2="6"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          transform={`rotate(${deg + 6} 50 50)`}
        />
      ))}
    </svg>
  );
}

export function FlowerDoodle({ size = 64, color = '#BC3D2C', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={style} aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="50" cy="26" rx="11" ry="17"
          stroke={color} strokeWidth="3.5" fill="none"
          transform={`rotate(${deg + 8} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="8" fill={color} />
    </svg>
  );
}

export function MountainDoodle({ size = 90, color = '#5B7A3A', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 140 84" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M6 76 C 20 60, 32 30, 46 16 C 52 10, 56 12, 62 22 C 68 32, 72 40, 78 34 C 90 20, 100 44, 112 58 C 120 67, 128 74, 134 77"
        stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      <path d="M40 26 L 50 34 L 58 24" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function StarDoodle({ size = 34, color = '#F5C518', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M30 4 C 32 16, 34 24, 42 27 C 52 30, 52 30, 43 34 C 35 37, 33 44, 30 56 C 27 44, 25 37, 17 34 C 8 30, 8 30, 18 27 C 26 24, 28 16, 30 4 Z"
        stroke={color} strokeWidth="3.5" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

export function SquiggleDoodle({ size = 120, color = '#E078A1', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size * 0.3} viewBox="0 0 200 60" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M6 30 C 20 8, 34 8, 48 30 C 62 52, 76 52, 90 30 C 104 8, 118 8, 132 30 C 146 52, 160 52, 174 30 C 181 19, 188 16, 194 20"
        stroke={color} strokeWidth="5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

export function HeartDoodle({ size = 40, color = '#BC3D2C', className, style }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M30 50 C 14 38, 6 28, 8 18 C 10 9, 22 7, 30 17 C 38 7, 50 9, 52 18 C 54 28, 46 38, 30 50 Z"
        stroke={color} strokeWidth="3.5" strokeLinejoin="round" fill="none"
        transform="rotate(-6 30 30)"
      />
    </svg>
  );
}
