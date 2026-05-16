import s from './Primitives.module.css';

// ─── Icons ───────────────────────────────────────────────────────────────────
const PATHS = {
  search:    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 0 4 4',
  bell:      'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  chevronR:  'M9 18l6-6-6-6',
  chevronL:  'M15 18l-6-6 6-6',
  chevronD:  'M6 9l6 6 6-6',
  check:     'M20 6 9 17l-5-5',
  plus:      'M12 5v14M5 12h14',
  ellipsis:  'M5 12h.01M12 12h.01M19 12h.01',
  dumbbell:  'M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z',
  sparkles:  'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z',
  play:      'M5 3l14 9-14 9V3z',
  moon:      'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  bolt:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  people:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  chart:     'M18 20V10M12 20V4M6 20v-6',
  forward:   'M5 4l10 8-10 8V4zM19 5v14',
  calendar:  'M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18',
  card:      'M1 4h22v16H1V4zM1 10h22',
  arrowD:    'M12 5v14M5 12l7 7 7-7',
  star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  fire:      'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072 2.143-.224 3.843 2 6z M12 22c3.314 0 6-2.686 6-6 0-1.5-.75-3-2-4-1 2-3 3-4 3s-2-1-2-3c-1.5 1.5-2 3-2 4 0 3.314 2.686 6 4 6z',
  nutrition: 'M12 22V12M12 12C12 7 7 2 2 2c0 5 5 10 10 10zM12 12c0-5 5-10 10-10-5 0-10 5-10 10',
  profile:   'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  home:      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  workout:   'M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M8 10h8M8 14h5',
  progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
  close:     'M18 6 6 18M6 6l12 12',
  settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  members:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  payments:  'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  trainers:  'M4 20v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, className }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${s.icon} ${className || ''}`}
    >
      <path d={PATHS[name] || PATHS.sparkles} />
    </svg>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 36, ring, color }) {
  return (
    <div
      className={`${s.avatar} ${ring ? s['avatar--ring'] : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: color || undefined,
      }}
    >
      {initials}
    </div>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────
export function TopBar({ subtitle, title, leading, trailing }) {
  return (
    <div className={s.topBar}>
      {leading && <div className={s.topBarLeading}>{leading}</div>}
      <div className={s.topBarBody}>
        {subtitle && <div className={s.topBarSubtitle}>{subtitle}</div>}
        <div className={s.topBarTitle}>{title}</div>
      </div>
      {trailing && <div className={s.topBarTrailing}>{trailing}</div>}
    </div>
  );
}

// ─── IconBtn ─────────────────────────────────────────────────────────────────
export function IconBtn({ name, size = 32, onClick }) {
  return (
    <button
      onClick={onClick}
      className={s.iconBtn}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={size * 0.55} color="var(--gc-ink2)" />
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, padding = 16, className, onClick, style }) {
  return (
    <div
      onClick={onClick}
      className={`${s.card} ${onClick ? s['card--clickable'] : ''} ${className || ''}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────────
export function SectionLabel({ children, action }) {
  return (
    <div className={s.sectionLabel}>
      <span className={s.sectionLabelText}>{children}</span>
      {action && <span className={s.sectionLabelAction}>{action}</span>}
    </div>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
export function Chip({ children, accent }) {
  return (
    <span className={`${s.chip} ${accent ? s['chip--accent'] : ''}`}>
      {children}
    </span>
  );
}

// ─── Numeric ─────────────────────────────────────────────────────────────────
export function Numeric({ value, unit, size = 20 }) {
  return (
    <span className={s.numeric} style={{ fontSize: size }}>
      {value}
      {unit && <span className={s.numericUnit} style={{ fontSize: size * 0.65 }}>{unit}</span>}
    </span>
  );
}

// ─── RingProgress ────────────────────────────────────────────────────────────
export function RingProgress({ value, size = 108, stroke = 11, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className={s.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={s.ringSvg}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke} fill="none"
        />
        <defs>
          <linearGradient id="gcRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#FFE3CC" />
            <stop offset="40%"  stopColor="#FFB07A" />
            <stop offset="100%" stopColor="#F25A1F" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#gcRingGrad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s ease',
            filter: 'drop-shadow(0 0 8px rgba(255,138,92,0.7))',
          }}
        />
      </svg>
      <div className={s.ringContent}>{children}</div>
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, height = 4 }) {
  return (
    <div className={s.progressTrack} style={{ height }}>
      <div className={s.progressFill} style={{ width: `${value}%` }} />
    </div>
  );
}

// ─── MuscleBar ───────────────────────────────────────────────────────────────
export function MuscleBar({ label, value }) {
  const color = value >= 85 ? 'var(--gc-good)' : value >= 60 ? 'var(--gc-warn)' : 'var(--gc-accent)';
  return (
    <div className={s.muscleBar}>
      <div className={s.muscleBarLabel}>{label}</div>
      <div className={s.muscleBarTrack}>
        <div className={s.muscleBarFill} style={{ width: `${value}%`, background: color }} />
      </div>
      <div className={s.muscleBarValue}>{value}%</div>
    </div>
  );
}

// ─── BottomTabBar ─────────────────────────────────────────────────────────────
export function BottomTabBar({ tabs, active, onSelect }) {
  return (
    <div className={s.tabBar}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onSelect(tab.key)} className={s.tabBtn}>
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? 'var(--gc-accent)' : 'var(--gc-ink3)'}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className={`${s.tabBtnLabel} ${isActive ? s['tabBtnLabel--active'] : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TensionOrb — brand metaphor for set/exercise state ─────────────────────
// states: 'rest' | 'load' | 'peak' | 'recovered'
export function TensionOrb({ state = 'rest', size = 28 }) {
  const cls = s.tensionOrb + ' ' + s[`tensionOrb--${state}`];
  return (
    <span className={cls} style={{ width: size, height: size }}>
      <span className={s.tensionOrbCore}/>
      {state === 'peak' && <span className={s.tensionOrbStress}/>}
      {state === 'recovered' && <span className={s.tensionOrbHalo}/>}
    </span>
  );
}
