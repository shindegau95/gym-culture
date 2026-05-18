// Vis brand palette — canonical tokens (see CLAUDE.md "Brand Palette").
//   #FF7A1A primary glowing orange — main orb fill + CTA
//   #FF5E00 deep emissive orange   — inner glow / hotspots
//   #FF9B4A soft warm orange       — gradient transitions
//   #FFC27A highlight orange       — reflections / specular
//   #A94400 burnt orange shadow    — depth + lower orb shading
//   #FF6A00 ambient glow orange    — outer bloom / glow
//   #F7F1E8 warm cream             — light theme background tint
//   #2A1812 smoked glass brown     — upper orb dark glass
//   #050505 near-black background  — main dark background
//   #0E0E0E card black             — elevated surfaces

const ORANGE = {
  highlight: '#FFC27A',  // specular / reflections
  blush:     '#FFE0C6',  // derived lighter cream-peach (outer fade)
  peach:     '#FFC27A',  // alias of highlight
  apricot:   '#FF9B4A',  // soft warm — gradient transitions
  tangerine: '#FF7A1A',  // PRIMARY — main CTA + orb fill
  glow:      '#FF6A00',  // ambient bloom / outer glow
  rust:      '#FF5E00',  // deep emissive — inner glow / hotspots
  burnt:     '#A94400',  // shadow / lower orb
  smoked:    '#2A1812',  // upper orb dark glass (dark theme shell)
  charcoal:  '#1B0F08',  // warm ink anchor
};

const ORB = 'radial-gradient(circle at 32% 28%, #FFE0C6 0%, #FFC27A 22%, #FF9B4A 50%, #FF7A1A 78%, #A94400 100%)';

export const TOKENS = {
  light: {
    bg:         '#F7F1E8',
    bgElevated: '#F5EBDD',
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
    accentInk:  '#FFF6EA',
    accentTint: 'rgba(255,122,26,0.10)',
    accentRing: 'rgba(255,122,26,0.30)',

    gradient:     'linear-gradient(180deg, #FF7A1A 0%, #FF7A1A 55%, #FF5E00 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,155,74,0.10), rgba(255,122,26,0.10))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF7A1A 0%, #FF9B4A 28%, #FFE0C6 55%, transparent 78%)',

    good: '#3F9D5E',
    warn: '#C97B1B',
    bad:  '#B4350F',
  },
  dark: {
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

    accent:     ORANGE.tangerine,
    accentSoft: ORANGE.apricot,
    accentInk:  '#050505',
    accentTint: 'rgba(255,122,26,0.14)',
    accentRing: 'rgba(255,122,26,0.40)',

    gradient:     'linear-gradient(180deg, #FF7A1A 0%, #FF7A1A 55%, #FF5E00 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(255,155,74,0.16), rgba(255,94,0,0.20))',
    gradientOrb:  ORB,
    gradientPage: 'radial-gradient(60% 70% at 78% 35%, #FF7A1A 0%, #FF5E00 30%, rgba(169,68,0,0.55) 60%, transparent 80%)',

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
