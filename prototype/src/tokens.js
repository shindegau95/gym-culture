// Vis brand palette — canonical per-theme tokens (see CLAUDE.md "Brand Palette").
// Anchors flip per theme via CSS vars (--vis-amber-*). Light hexes are deeper
// for AA text contrast on the warm cream background; dark stays cinematic neon.

const AMBER = {
  light: {
    highlight: '#FFE3C2',
    soft:      '#FFA366',
    primary:   '#E06313', // CTA + orb fill (deeper for contrast)
    deep:      '#FF5500',
    ember:     '#F26200', // vibrant dark tangerine — orb liquid floor (no brown)
    shadow:    '#C45100',
    glow:      '#FF6A00',
    cream:     '#FFF3E8',
    smoke:     '#EFE1D5',
  },
  dark: {
    highlight: '#FFC27A',
    soft:      '#FF9B4A',
    primary:   '#FF7A1A',
    deep:      '#FF5E00',
    ember:     '#D9590B', // dark tangerine, yellow undertone — orb liquid floor (replaces brown)
    shadow:    '#A94400',
    glow:      '#FF6A00',
    cream:     '#1A1310', // glass tint, not page bg
    smoke:     '#2A1812',
  },
};

function orb(a) {
  return `radial-gradient(circle at 32% 28%, ${a.highlight} 0%, ${a.highlight} 22%, ${a.soft} 50%, ${a.primary} 78%, ${a.ember} 100%)`;
}

function gradientPrimary(a) {
  return `linear-gradient(180deg, ${a.primary} 0%, ${a.primary} 55%, ${a.deep} 100%)`;
}

export const TOKENS = {
  light: {
    amber: AMBER.light,

    bg:         '#F9F6F0',
    bgElevated: '#FFFFFF',
    bgGrouped:  '#F4EDDF',
    bgScrim:    'rgba(249,246,240,0.88)',

    ink:   '#1B1108',
    ink2:  '#3A2A1F',
    ink3:  'rgba(60,40,28,0.58)',
    ink4:  'rgba(60,40,28,0.28)',

    sep:        'rgba(60,40,28,0.10)',
    sepStrong:  'rgba(60,40,28,0.20)',
    fillTint:   'rgba(120,80,50,0.06)',
    fillTint2:  'rgba(120,80,50,0.03)',

    accent:     AMBER.light.primary,
    accentSoft: AMBER.light.soft,
    accentInk:  '#FFF6EA',
    accentTint: 'rgba(224,99,19,0.10)',
    accentRing: 'rgba(224,99,19,0.30)',

    gradient:     gradientPrimary(AMBER.light),
    gradientSoft: 'linear-gradient(135deg, rgba(255,163,102,0.12), rgba(224,99,19,0.12))',
    gradientOrb:  orb(AMBER.light),
    gradientPage: `radial-gradient(60% 70% at 78% 35%, ${AMBER.light.primary} 0%, ${AMBER.light.soft} 28%, ${AMBER.light.highlight} 55%, transparent 78%)`,

    good: '#3F9D5E',
    warn: '#C97B1B',
    bad:  '#B4350F',
  },
  dark: {
    amber: AMBER.dark,

    bg:         '#050505',
    bgElevated: '#0E0E0E',
    bgGrouped:  '#050505',
    bgScrim:    'rgba(15,10,7,0.84)',

    ink:   '#FAF6F2',
    ink2:  '#E8DCCB',
    ink3:  'rgba(250,235,215,0.62)',
    ink4:  'rgba(250,235,215,0.30)',

    sep:        'rgba(255,210,170,0.10)',
    sepStrong:  'rgba(255,210,170,0.18)',
    fillTint:   'rgba(255,170,110,0.10)',
    fillTint2:  'rgba(255,170,110,0.05)',

    accent:     AMBER.dark.primary,
    accentSoft: AMBER.dark.soft,
    accentInk:  '#050505',
    accentTint: 'rgba(255,122,26,0.14)',
    accentRing: 'rgba(255,122,26,0.40)',

    gradient:     gradientPrimary(AMBER.dark),
    gradientSoft: 'linear-gradient(135deg, rgba(255,155,74,0.16), rgba(255,94,0,0.20))',
    gradientOrb:  orb(AMBER.dark),
    gradientPage: `radial-gradient(60% 70% at 78% 35%, ${AMBER.dark.primary} 0%, ${AMBER.dark.deep} 30%, rgba(169,68,0,0.55) 60%, transparent 80%)`,

    good: '#5BCB85',
    warn: '#F2A640',
    bad:  '#FF6A3D',
  },
};

export const FONT = {
  ui:      '"Geist", -apple-system, "SF Pro Text", system-ui, sans-serif',
  display: '"Geist", -apple-system, "SF Pro Display", system-ui, sans-serif',
  mono:    '"Geist Mono", "SF Mono", ui-monospace, Menlo, monospace',
};
