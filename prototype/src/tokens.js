// Vis brand tokens — warm tangerine family, sampled from `docs/brand-ref/light_ref.png`.
// Single hero "sun-disc" orange + soft cream surfaces in light; same orange shifts
// to glow on warm charcoal in dark.

const ORANGE = {
  blush:    '#FFDCC4',  // outer fade
  peach:    '#FFB890',  // mid fade
  apricot:  '#FF8A4D',  // soft accent
  tangerine:'#FF5E1F',  // core — sampled from reference Start workout pill / TODAY'S SESSION eyebrow
  rust:     '#D04510',
  burnt:    '#8A2E08',
  charcoal: '#1B0F08',
};

const ORB = 'radial-gradient(circle at 32% 28%, #FFDCC4 0%, #FF8A4D 38%, #FF5E1F 70%, #8A2E08 100%)';

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
    accentTint: 'rgba(255,94,31,0.10)',
    accentRing: 'rgba(255,94,31,0.30)',

    gradient:     'linear-gradient(180deg, #FF7A2E 0%, #FF5E1F 55%, #E04A11 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,138,77,0.10), rgba(255,94,31,0.10))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF5E1F 0%, #FF8A4D 28%, #FFDCC4 55%, transparent 78%)',

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
    accentTint: 'rgba(255,94,31,0.14)',
    accentRing: 'rgba(255,94,31,0.40)',

    gradient:     'linear-gradient(180deg, #FF7A2E 0%, #FF5E1F 55%, #D04510 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,138,77,0.16), rgba(208,69,16,0.20))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF5E1F 0%, #D04510 30%, rgba(138,46,8,0.55) 60%, transparent 80%)',

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
