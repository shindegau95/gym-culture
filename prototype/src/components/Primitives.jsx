import { useEffect, useRef, useMemo } from 'react';
import s from './Primitives.module.css';

// ─── Liquid wave path builder ───────────────────────────────────────────────
// Generates a cubic-bezier SVG path that curves naturally across the orb.
// Sum of 3 non-commensurate sinusoids → quasi-periodic, never repeats cleanly.
// `tilt` rotates the surface slightly (asymmetric gravity feel).
function buildWavePath(baseY, t, amp, tilt) {
  const pts = [];
  for (let x = -30; x <= 130; x += 16) {
    const phase = x / 28 + t;
    const y =
      baseY +
      Math.sin(phase) * amp * 0.55 +
      Math.sin(phase * 0.43 + t * 0.7) * amp * 0.35 +
      Math.sin(phase * 2.1 + t * 1.2) * amp * 0.12 +
      (x - 50) * tilt * 0.012;
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const dx = x1 - x0;
    d += ` C ${(x0 + dx * 0.4).toFixed(2)},${y0.toFixed(2)} ${(x1 - dx * 0.4).toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  d += ' L 130,120 L -30,120 Z';
  return d;
}

function buildMeniscusPath(baseY, t, amp, tilt) {
  const pts = [];
  for (let x = -30; x <= 130; x += 16) {
    const phase = x / 28 + t;
    const y =
      baseY +
      Math.sin(phase) * amp * 0.55 +
      Math.sin(phase * 0.43 + t * 0.7) * amp * 0.35 +
      (x - 50) * tilt * 0.012;
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const dx = x1 - x0;
    d += ` C ${(x0 + dx * 0.4).toFixed(2)},${y0.toFixed(2)} ${(x1 - dx * 0.4).toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  return d;
}

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
  dumbbell:  'M2 12h20 M4 10h2v4H4z M7 7h2v10H7z M15 7h2v10h-2z M18 10h2v4h-2z',
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
  workout:   'M2 12h20 M4 10h2v4H4z M7 7h2v10H7z M15 7h2v10h-2z M18 10h2v4h-2z',
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
            <stop offset="0%"   stopColor="var(--vis-amber-highlight)" />
            <stop offset="40%"  stopColor="var(--vis-amber-highlight)" />
            <stop offset="100%" stopColor="var(--vis-amber-primary)" />
          </linearGradient>
          <radialGradient id={`${gid}-head`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"   stopColor="var(--vis-amber-highlight)" />
            <stop offset="55%"  stopColor="var(--vis-amber-soft)" />
            <stop offset="100%" stopColor="var(--vis-amber-primary)" />
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

// ─── OrbFill — molten-amber-in-smoked-glass sphere ──────────────────────────
// Layered physical render (see CLAUDE.md "Orb visual recipe").
// Liquid surface is JS-driven: bezier path rebuilt every frame from a sum of
// non-commensurate sinusoids + asymmetric tilt → quasi-periodic, never loops.
// Light & dark themes both show liquid; theme only swaps body/dome colors.
//
// Layers (low→high z):
//   1 atmospheric bloom (huge blurred amber halo behind)
//   2 body radial (warm sphere base + peach hotspot)
//   3 liquid bezier wave (back + front + meniscus stroke) — JS-animated
//   4 emissive core (bright amber glow at bottom of liquid)
//   5 subsurface glow (amber bleed at liquid line into glass above)
//   6 smoked-glass dome (dark brown top / cream ivory in light)
//   7 inner-shadow vignette (sphericality)
//   8 specular reflections (big soft top-left + tiny crisp hotspot)
//   + outer cinematic 3-layer box-shadow glow on container
export function OrbFill({ value = 0, size = 140, showStrip = true }) {
  const v = Math.max(0, Math.min(100, value));
  const surfaceY = 100 - v; // SVG units (viewBox 0–100)
  const reactKey = useMemo(() => `orb-${Math.random().toString(36).slice(2, 9)}`, []);

  const refFront = useRef(null);
  const refBack = useRef(null);
  const refOcc = useRef(null);
  const refMen = useRef(null);
  const refSubsurface = useRef(null);
  const refCore = useRef(null);
  const refOrb = useRef(null);

  // Initial paths so first paint isn't blank
  const initFront = buildWavePath(surfaceY, 0, 2.6, 0);
  const initBack  = buildWavePath(surfaceY + 0.8, 1.5, 3.6, 0);
  const initMen   = buildMeniscusPath(surfaceY, 0, 2.6, 0);

  // Energy scales with recovery — higher v = more vigorous fluid response
  const energy = 0.55 + 0.55 * (v / 100);

  // Mutable physics state — refs (NOT React state) so 60fps integration
  // doesn't trigger re-renders.
  const sim = useRef({
    tilt: 0, tiltVel: 0, tiltImpulse: 0,
    slosh: 0, sloshVel: 0, sloshImpulse: 0,
    level: 0, levelVel: 0, levelImpulse: 0,
    lastT: 0,
    nextImpulse: 0,
  });

  useEffect(() => {
    let raf;
    const start = performance.now();
    sim.current.lastT = start;
    sim.current.nextImpulse = start + 700 + Math.random() * 1200;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - sim.current.lastT) / 1000);
      sim.current.lastT = now;
      const t = (now - start) / 1000;
      const s = sim.current;

      // Periodic random impulses — kick the spring like a real liquid disturbed
      if (now >= s.nextImpulse) {
        s.tiltImpulse  += (Math.random() - 0.5) * 3.2 * energy;
        s.sloshImpulse += (Math.random() - 0.5) * 2.4 * energy;
        s.levelImpulse += (Math.random() - 0.5) * 0.9 * energy;
        s.nextImpulse = now + 500 + Math.random() * 1400;
      }
      // Impulses decay toward zero (damped energy dissipation)
      s.tiltImpulse  *= Math.exp(-1.4 * dt);
      s.sloshImpulse *= Math.exp(-1.4 * dt);
      s.levelImpulse *= Math.exp(-2.2 * dt);

      // Continuous quasi-periodic drift — sum of non-commensurate sines so
      // motion never loops cleanly
      const driftTilt  = energy * (1.6 * Math.sin(t * 0.42 + 0.7) + 0.7 * Math.sin(t * 0.91 + 1.4) + 0.35 * Math.sin(t * 1.73));
      const driftSlosh = energy * (1.4 * Math.sin(t * 0.55)        + 0.8 * Math.sin(t * 1.17 + 0.7) + 0.30 * Math.sin(t * 2.03 + 0.2));
      const driftLevel = energy * (0.45 * Math.sin(t * 0.38 + 0.3) + 0.25 * Math.sin(t * 0.81 + 1.1));

      const tiltTarget  = driftTilt  + s.tiltImpulse;
      const sloshTarget = driftSlosh + s.sloshImpulse;
      const levelTarget = driftLevel + s.levelImpulse;

      // Damped spring integrator (heavy molten amber — higher mass, lower damping)
      // F = k(target - x) - d * v
      const k = 24, d = 3.0;
      s.tiltVel  += (k * (tiltTarget  - s.tilt)  - d * s.tiltVel)  * dt;
      s.sloshVel += (k * (sloshTarget - s.slosh) - d * s.sloshVel) * dt;
      // Level spring is heavier (slower, more inertia)
      const kL = 14, dL = 2.4;
      s.levelVel += (kL * (levelTarget - s.level) - dL * s.levelVel) * dt;
      s.tilt  += s.tiltVel  * dt;
      s.slosh += s.sloshVel * dt;
      s.level += s.levelVel * dt;

      const ampF = 2.6 + energy * 1.8;
      const ampB = 3.6 + energy * 2.2;
      const baseY = surfaceY + s.level;
      // phaseShift = horizontal slosh — front and back wave drift in opposite phase
      const phaseF =  s.slosh * 0.18;
      const phaseB = -s.slosh * 0.22 + 1.5;

      const frontD = buildWavePath(baseY,                  t * 0.95 + phaseF, ampF,  s.tilt);
      const backD  = buildWavePath(baseY + 0.9 + s.level * 0.4, t * 0.62 + phaseB, ampB, -s.tilt * 0.6);
      const menD   = buildMeniscusPath(baseY,              t * 0.95 + phaseF, ampF,  s.tilt);

      if (refFront.current) refFront.current.setAttribute('d', frontD);
      if (refOcc.current)   refOcc.current.setAttribute('d',   frontD);
      if (refBack.current)  refBack.current.setAttribute('d',  backD);
      if (refMen.current)   refMen.current.setAttribute('d',   menD);

      if (refSubsurface.current) {
        refSubsurface.current.style.setProperty('--orb-liquid-y', `${baseY}%`);
      }

      // Caustic drift — bright core inside liquid drifts horizontally,
      // pulses asymmetrically. Visible light "moving" inside the orb.
      if (refCore.current) {
        const cx = 50 + s.slosh * 0.55 + Math.sin(t * 0.31) * 3.5;
        const cy = 88 + s.tilt * 0.35;
        const intensity = 0.85 + 0.18 * Math.sin(t * 0.73 + 1.1);
        refCore.current.style.setProperty('--orb-core-x', `${cx}%`);
        refCore.current.style.setProperty('--orb-core-y', `${cy}%`);
        refCore.current.style.setProperty('--orb-core-i', intensity.toFixed(3));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [surfaceY, energy]);

  return (
    <div className={s.orbFill}>
      <div ref={refOrb} className={s.orb} style={{ width: size, height: size }}>
        {/* L1 — atmospheric bloom */}
        <div className={s.orbBloom} aria-hidden="true"/>

        {/* L2 — glass shell tint (very subtle — orb is TRANSPARENT, shows card behind) */}
        <div className={s.orbGlassTint} aria-hidden="true"/>

        {/* L3 — liquid (bezier wave, JS-animated).
            Volumetric radial gradient: bright amber core at bottom-center →
            burnt deep amber at edges → dark rim. Models gravity (densest at base)
            and sphere occlusion (darkest where liquid meets glass curvature). */}
        <div className={s.orbLiquidClip} aria-hidden="true">
          <svg viewBox="0 0 100 100" className={s.orbLiquidSvg} preserveAspectRatio="none">
            <defs>
              {/* Liquid fill — physically plausible: light enters from ABOVE.
                  Bright at liquid surface (top), deepest amber at the floor.
                  Uses shared --vis-orb-fill-* (theme-independent) so the orb
                  keeps its honey/yellow tone in light theme too. */}
              <linearGradient id={`orbAmber-${reactKey}`} x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%"   stopColor="var(--vis-orb-fill-highlight)"/>
                <stop offset="22%"  stopColor="var(--vis-orb-fill-soft)"/>
                <stop offset="55%"  stopColor="var(--vis-orb-fill-primary)"/>
                <stop offset="82%"  stopColor="var(--vis-orb-fill-deep)"/>
                <stop offset="100%" stopColor="var(--vis-orb-fill-ember)"/>
              </linearGradient>
              {/* Edge occlusion — theme-flipping (dark = brown depth, light = tangerine rim) */}
              <radialGradient id={`orbLiquidOcc-${reactKey}`} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
                <stop offset="70%"  stopColor="rgba(0,0,0,0)"/>
                <stop offset="92%"  stopColor="var(--vis-orb-edge-soft)"/>
                <stop offset="100%" stopColor="var(--vis-orb-edge-deep)"/>
              </radialGradient>
              {/* Meniscus — bright cream stroke softened to feel physically thick */}
              <linearGradient id={`orbMen-${reactKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,236,210,0.92)"/>
                <stop offset="100%" stopColor="rgba(255,236,210,0)"/>
              </linearGradient>
            </defs>
            <path ref={refBack}  className={s.orbWaveBack}  d={initBack}  fill={`url(#orbAmber-${reactKey})`} opacity="0.7"/>
            <path ref={refFront} className={s.orbWaveFront} d={initFront} fill={`url(#orbAmber-${reactKey})`}/>
            {/* Edge occlusion — same wave shape, darker fill near sphere edge */}
            <path ref={refOcc} d={initFront} fill={`url(#orbLiquidOcc-${reactKey})`}/>
            <path ref={refMen}   className={s.orbMeniscusPath} d={initMen} stroke={`url(#orbMen-${reactKey})`} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* L4 — emissive core (bottom of liquid glows volumetrically; drifts) */}
        <div
          ref={refCore}
          className={s.orbCore}
          style={{ '--orb-core-x': '50%', '--orb-core-y': '88%', '--orb-core-i': 1 }}
          aria-hidden="true"
        />

        {/* L5 — subsurface glow at liquid line, bleeds upward */}
        <div
          ref={refSubsurface}
          className={s.orbSubsurface}
          style={{ '--orb-liquid-y': `${surfaceY}%` }}
          aria-hidden="true"
        />

        {/* L6 — smoked-glass dome (theme-aware) */}
        <div className={s.orbDome} aria-hidden="true"/>

        {/* L7 — inner shadow vignette */}
        <div className={s.orbInner} aria-hidden="true"/>

        {/* L8 — specular reflections */}
        <div className={s.orbHiMain} aria-hidden="true"/>
        <div className={s.orbHiSpark} aria-hidden="true"/>

        {/* L9 — fresnel rim (top bright, fades around) */}
        <div className={s.orbFresnel} aria-hidden="true"/>
      </div>

      {/* Bottom contact shadow — replaces uniform outer halo. Light from the
          liquid scatters DOWN onto the card surface, not as a uniform ring. */}
      <div className={s.orbContactShadow} aria-hidden="true"/>

      {showStrip && (
        <div className={s.orbFillStrip}>
          <div className={s.orbFillStripFill} style={{ width: `${v}%` }}/>
        </div>
      )}
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
