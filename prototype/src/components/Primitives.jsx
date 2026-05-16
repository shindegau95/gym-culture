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

// ─── RingProgress (brand-ref: progressring_animation.png — "Ring Progress") ──
// Travelling glow-head + faint track + soft outer drop-shadow.
export function RingProgress({ value, size = 108, stroke = 11, children, showMirror = false }) {
  const v = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);

  // Head position — angle starts at top (-π/2) and sweeps clockwise.
  const angle = -Math.PI / 2 + (v / 100) * 2 * Math.PI;
  const headX = size / 2 + r * Math.cos(angle);
  const headY = size / 2 + r * Math.sin(angle);

  // Unique gradient id per ring instance so multiple don't clash.
  const gid = `vis-ring-${size}-${Math.round(v * 100)}`;

  return (
    <div className={s.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={s.ringSvg}>
        <defs>
          <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#FFE3CC" />
            <stop offset="40%"  stopColor="#FFB07A" />
            <stop offset="100%" stopColor="#FF6A1B" />
          </linearGradient>
          <radialGradient id={`${gid}-head`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="#FFE3CC" />
            <stop offset="55%"  stopColor="#FF8E45" />
            <stop offset="100%" stopColor="#FF6A1B" />
          </radialGradient>
        </defs>

        {/* Faint track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,165,112,0.18)"
          strokeWidth={stroke} fill="none"
        />

        {/* Arc fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gid}-g)`} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 700ms cubic-bezier(0.32, 0.72, 0, 1)',
            filter: 'drop-shadow(0 0 10px rgba(255,142,69,0.55))',
          }}
        />

        {/* Travelling glow head (counter-rotated so it stays a dot, not stretched) */}
        {v > 0 && (
          <g
            className={s.ringHead}
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            transform={`rotate(${(v / 100) * 360 - 90} ${size / 2} ${size / 2})`}
          >
            <circle
              cx={size / 2 + r} cy={size / 2}
              r={stroke * 0.7}
              fill={`url(#${gid}-head)`}
              filter="url(#vis-ring-glow)"
            />
          </g>
        )}

        {/* Reusable filter — registered once, but inlining keeps the component self-contained */}
        <defs>
          <filter id="vis-ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className={s.ringContent}>{children}</div>
      {showMirror && (
        <div className={s.ringMirror}>
          <div className={s.ringMirrorFill} style={{ width: `${v}%` }}/>
        </div>
      )}
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

// ─── OrbFill — liquid sphere fills with recovery % (brand-ref: recovery_animation.png) ──
export function OrbFill({ value = 0, size = 140 }) {
  const v = Math.max(0, Math.min(100, value));
  // Liquid surface Y (SVG coords, viewBox 0–120) — inverted: 0%→120, 100%→0
  const surfaceY = 120 - (v * 1.20);
  const reactKey = `orb-${size}`;
  return (
    <div className={s.orbFill} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className={s.orbFillSvg} aria-hidden="true">
        <defs>
          <clipPath id={`orbClip-${reactKey}`}><circle cx="60" cy="60" r="58"/></clipPath>
          <linearGradient id={`orbLiquid-${reactKey}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#FF6A1B"/>
            <stop offset="60%"  stopColor="#FF8E45"/>
            <stop offset="100%" stopColor="#FFA570"/>
          </linearGradient>
          <radialGradient id={`orbHi-${reactKey}`} cx="0.3" cy="0.25" r="0.55">
            <stop offset="0%"   stopColor="rgba(255,230,210,0.55)"/>
            <stop offset="100%" stopColor="rgba(255,230,210,0)"/>
          </radialGradient>
        </defs>

        {/* Empty sphere body (dark, faintly lit) */}
        <circle cx="60" cy="60" r="58"
          fill="rgba(20,12,8,0.92)"
          stroke="rgba(255,165,112,0.35)" strokeWidth="0.6"/>

        {/* Liquid clipped to sphere; surface waves animate via CSS transform */}
        <g clipPath={`url(#orbClip-${reactKey})`}>
          <g className={s.orbWaveGroup} style={{ transform: `translateY(${surfaceY}px)` }}>
            <path
              className={s.orbWave}
              d="M-60,0 Q-30,-4 0,0 T60,0 T120,0 T180,0 L180,120 L-60,120 Z"
              fill={`url(#orbLiquid-${reactKey})`}
            />
            <path
              className={s.orbWaveBack}
              d="M-60,2 Q-30,-2 0,2 T60,2 T120,2 T180,2 L180,120 L-60,120 Z"
              fill={`url(#orbLiquid-${reactKey})`}
              opacity="0.55"
            />
          </g>
        </g>

        {/* Top-left specular highlight */}
        <ellipse cx="42" cy="30" rx="22" ry="10"
          fill={`url(#orbHi-${reactKey})`}
          transform="rotate(-22 42 30)"/>

        {/* Edge rim glow */}
        <circle cx="60" cy="60" r="58" fill="none"
          stroke="rgba(255,165,112,0.45)" strokeWidth="0.4"/>
      </svg>
      {/* Bottom mini progress strip mirror */}
      <div className={s.orbFillStrip}>
        <div className={s.orbFillStripFill} style={{ width: `${v}%` }}/>
      </div>
    </div>
  );
}

// ─── PulseProgressBar — bar with breathing pulse head (brand-ref: progressbar_animation.png) ──
export function PulseProgressBar({ value = 0, height = 8 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={s.pulseTrack} style={{ height }}>
      <div className={s.pulseFill} style={{ width: `${v}%` }}>
        <div className={s.pulseHead}/>
      </div>
    </div>
  );
}
