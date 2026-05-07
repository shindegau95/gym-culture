import { FONT } from '../tokens';

// ─── Icons ───────────────────────────────────────────────────────────────────
const PATHS = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 0 4 4',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  chevronR: 'M9 18l6-6-6-6',
  chevronL: 'M15 18l-6-6 6-6',
  chevronD: 'M6 9l6 6 6-6',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  ellipsis: 'M5 12h.01M12 12h.01M19 12h.01',
  dumbbell: 'M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z',
  sparkles: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z',
  apple: 'M12 4.5c.9-1.1 2.3-1.7 3.5-1.5-.2 1.5-.9 2.8-1.9 3.7C12.7 7.8 11.2 7.4 10 6c.5-1 1.3-1.5 2-1.5zM8 7c2 0 4 1 5 2.5C14 11 14.5 13 14 15c-.7 2.5-2.5 4.5-4.5 5C7 20 5 18 3 18s-3-1-3-3c0-2 1.5-3.5 3-4C4.5 10 5.5 7 8 7z',
  play: 'M5 3l14 9-14 9V3z',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  people: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  forward: 'M5 4l10 8-10 8V4zM19 5v14',
  calendar: 'M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18',
  card: 'M1 4h22v16H1V4zM1 10h22',
  arrowD: 'M12 5v14M5 12l7 7 7-7',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  weight: 'M6 2h12l2 7H4L6 2zM4 9h16v13H4V9z',
  fire: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072 2.143-.224 3.843 2 6z M12 22c3.314 0 6-2.686 6-6 0-1.5-.75-3-2-4-1 2-3 3-4 3s-2-1-2-3c-1.5 1.5-2 3-2 4 0 3.314 2.686 6 4 6z',
  nutrition: 'M12 22V12M12 12C12 7 7 2 2 2c0 5 5 10 10 10zM12 12c0-5 5-10 10-10-5 0-10 5-10 10',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  workout: 'M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M8 10h8M8 14h5',
  progress: 'M22 12h-4l-3 9L9 3l-3 9H2',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6 6 18M6 6l12 12',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  members: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  payments: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  branches: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z',
  trainers: 'M4 20v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style }) {
  const d = PATHS[name] || PATHS.sparkles;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={d}/>
    </svg>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 36, t, color, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color || t.fillTint,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT.ui, fontSize: size * 0.35, fontWeight: 700, color: t.ink2,
      border: ring ? `2px solid ${t.accent}` : 'none',
    }}>
      {initials}
    </div>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────
export function TopBar({ t, subtitle, title, leading, trailing }) {
  return (
    <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && (
          <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {subtitle}
          </div>
        )}
        <div style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: -0.8, lineHeight: 1.05 }}>
          {title}
        </div>
      </div>
      {trailing && <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>{trailing}</div>}
    </div>
  );
}

// ─── IconBtn ─────────────────────────────────────────────────────────────────
export function IconBtn({ name, t, size = 32, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2, background: t.fillTint,
      border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={name} size={size * 0.55} color={t.ink2}/>
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ t, children, padding = 16, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: t.bgElevated, borderRadius: 18, border: `0.5px solid ${t.sep}`,
      padding, cursor: onClick ? 'pointer' : undefined, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────────
export function SectionLabel({ t, children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '14px 0 2px' }}>
      <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 700, color: t.ink, letterSpacing: -0.1 }}>{children}</span>
      {action && <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.accent, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
export function Chip({ t, children, accent }) {
  return (
    <span style={{
      fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: accent ? t.accent : t.ink3,
      background: accent ? t.accentTint : t.fillTint,
      padding: '4px 8px', borderRadius: 6, letterSpacing: 0.2,
    }}>
      {children}
    </span>
  );
}

// ─── Numeric ─────────────────────────────────────────────────────────────────
export function Numeric({ value, unit, t, size = 20, style }) {
  return (
    <span style={{ fontFamily: FONT.mono, fontSize: size, fontWeight: 600, color: t.ink, letterSpacing: -0.5, ...style }}>
      {value}{unit && <span style={{ fontSize: size * 0.65, fontWeight: 500, color: t.ink3, marginLeft: 2 }}>{unit}</span>}
    </span>
  );
}

// ─── RingProgress ────────────────────────────────────────────────────────────
export function RingProgress({ value, size = 108, stroke = 11, t, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={t.fillTint} strokeWidth={stroke} fill="none"/>
        <defs>
          <linearGradient id="gcRingGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6B4A"/>
            <stop offset="100%" stopColor="#E11D48"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#gcRingGrad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        {children}
      </div>
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, t, height = 4 }) {
  return (
    <div style={{ height, borderRadius: height / 2, background: t.fillTint, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: t.gradient, borderRadius: height / 2, transition: 'width 0.6s ease' }}/>
    </div>
  );
}

// ─── MuscleBar ───────────────────────────────────────────────────────────────
export function MuscleBar({ label, value, t }) {
  const color = value >= 85 ? t.good : value >= 60 ? t.warn : t.accent;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 70, fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: t.ink }}>{label}</div>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: t.fillTint, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }}/>
      </div>
      <div style={{ width: 40, textAlign: 'right', fontFamily: FONT.mono, fontSize: 12, fontWeight: 600, color: t.ink }}>{value}%</div>
    </div>
  );
}

// ─── BottomTabBar ─────────────────────────────────────────────────────────────
export function BottomTabBar({ t, tabs, active, onSelect }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: t.bgScrim, backdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${t.sep}`,
      display: 'flex', paddingBottom: 20, paddingTop: 8,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onSelect(tab.key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'transparent', border: 0, cursor: 'pointer', padding: '4px 0',
          }}>
            <Icon name={tab.icon} size={22} color={isActive ? t.accent : t.ink3} strokeWidth={isActive ? 2.2 : 1.8}/>
            <span style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? t.accent : t.ink3, letterSpacing: 0.3 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
