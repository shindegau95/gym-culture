// Vis brand tokens — warm tangerine family, sampled from `docs/brand-ref/light_ref.png`.
// Single hero "sun-disc" orange + soft cream surfaces in light; same orange shifts
// to glow on warm charcoal in dark.

const ORANGE = {
  blush:    '#FFE6D2',  // sun-disc outer fade
  peach:    '#FFD0A8',  // sun-disc mid fade
  apricot:  '#FFA570',  // soft accent
  tangerine:'#FF8E45',  // core (brand primary, sampled from sun-disc center)
  rust:     '#C44510',
  burnt:    '#8A2E08',
  charcoal: '#1B0F08',
};

const ORB = 'radial-gradient(circle at 32% 28%, #FFE6D2 0%, #FFA570 40%, #FF8E45 70%, #8A2E08 100%)';

export const TOKENS = {
  light: {
    bg:         '#F2EBE0',
    bgElevated: '#FBF6EE',
    bgGrouped:  '#EAE2D5',
    bgScrim:    'rgba(242,235,224,0.86)',

    ink:   '#1B1108',
    ink2:  '#3A2A1F',
    ink3:  'rgba(60,40,28,0.58)',
    ink4:  'rgba(60,40,28,0.28)',

    sep:        'rgba(60,40,28,0.10)',
    sepStrong:  'rgba(60,40,28,0.20)',
    fillTint:   'rgba(120,80,50,0.06)',
    fillTint2:  'rgba(120,80,50,0.03)',

    accent:     ORANGE.tangerine,
    accentSoft: ORANGE.apricot,
    accentInk:  '#FFFFFF',
    accentTint: 'rgba(255,142,69,0.10)',
    accentRing: 'rgba(255,142,69,0.30)',

    gradient:     'linear-gradient(135deg, #FFD0A8 0%, #FFA570 40%, #FF8E45 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,165,112,0.10), rgba(255,142,69,0.10))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF8E45 0%, #FFA570 28%, #FFD0A8 55%, transparent 78%)',

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

    accent:     ORANGE.tangerine,
    accentSoft: ORANGE.apricot,
    accentInk:  '#0F0A07',
    accentTint: 'rgba(255,142,69,0.14)',
    accentRing: 'rgba(255,142,69,0.40)',

    gradient:     'linear-gradient(135deg, #FFA570 0%, #FF8E45 50%, #8A2E08 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,165,112,0.16), rgba(138,46,8,0.20))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF8E45 0%, #C44510 30%, rgba(138,46,8,0.55) 60%, transparent 80%)',

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
