// Vis brand tokens — warm orange family only. See docs §17.
// All semantic surfaces derive from a single palette; cool tones forbidden.

const ORANGE = {
  peach:    '#FFD1A8',
  coral:    '#FF8A5C',
  flame:    '#FF6A2C',
  ember:    '#F25A1F',
  rust:     '#C44510',
  burnt:    '#8A2E08',
  charcoal: '#1B0F08',
};

const ORB = 'radial-gradient(circle at 32% 28%, #FFD1A8 0%, #FF8A5C 35%, #F25A1F 65%, #8A2E08 100%)';

export const TOKENS = {
  light: {
    bg:         '#FAF6F2',
    bgElevated: '#FFFFFF',
    bgGrouped:  '#F0E9E1',
    bgScrim:    'rgba(250,246,242,0.86)',

    ink:   '#1B0F08',
    ink2:  '#3A2A1F',
    ink3:  'rgba(60,40,28,0.62)',
    ink4:  'rgba(60,40,28,0.30)',

    sep:        'rgba(60,40,28,0.12)',
    sepStrong:  'rgba(60,40,28,0.22)',
    fillTint:   'rgba(120,80,50,0.08)',
    fillTint2:  'rgba(120,80,50,0.04)',

    accent:     ORANGE.ember,
    accentSoft: ORANGE.coral,
    accentInk:  '#FFFFFF',
    accentTint: 'rgba(242,90,31,0.10)',
    accentRing: 'rgba(242,90,31,0.30)',

    gradient:     'linear-gradient(135deg, #FFD1A8 0%, #FF8A5C 45%, #F25A1F 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,138,92,0.10), rgba(242,90,31,0.10))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(ellipse at top, #FFE9D6 0%, #FAF6F2 55%)',

    good: '#3F9D5E',
    warn: '#C97B1B',
    bad:  '#B4350F',
  },
  dark: {
    bg:         '#0F0A07',
    bgElevated: '#1A1108',
    bgGrouped:  '#0C0805',
    bgScrim:    'rgba(15,10,7,0.84)',

    ink:   '#FAF6F2',
    ink2:  '#E8DCCB',
    ink3:  'rgba(250,235,215,0.62)',
    ink4:  'rgba(250,235,215,0.30)',

    sep:        'rgba(255,210,170,0.10)',
    sepStrong:  'rgba(255,210,170,0.18)',
    fillTint:   'rgba(255,170,110,0.10)',
    fillTint2:  'rgba(255,170,110,0.05)',

    accent:     ORANGE.flame,
    accentSoft: '#FF9466',
    accentInk:  '#0F0A07',
    accentTint: 'rgba(255,106,44,0.14)',
    accentRing: 'rgba(255,106,44,0.40)',

    gradient:     'linear-gradient(135deg, #FF8A5C 0%, #F25A1F 50%, #8A2E08 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,138,92,0.16), rgba(138,46,8,0.20))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(ellipse at top, #2A1408 0%, #0F0A07 60%)',

    good: '#5BCB85',
    warn: '#F2A640',
    bad:  '#FF6A3D',
  },
};

export const FONT = {
  ui:      '"DM Sans", -apple-system, "SF Pro Text", system-ui, sans-serif',
  display: '"DM Sans", -apple-system, "SF Pro Display", system-ui, sans-serif',
  mono:    '"DM Mono", "SF Mono", ui-monospace, Menlo, monospace',
};
