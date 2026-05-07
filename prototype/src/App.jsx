import { useState } from 'react';
import { TOKENS, FONT } from './tokens';
import PhoneFrame from './components/PhoneFrame';
import ClientApp from './client/ClientApp';
import TrainerApp from './trainer/TrainerApp';
import AdminWeb from './admin/AdminWeb';

const APPS = [
  { id: 'client', label: 'Client App', sub: 'Member experience', dark: true },
  { id: 'trainer', label: 'Trainer App', sub: 'PT workflow', dark: false },
  { id: 'admin', label: 'Admin Web', sub: 'Branch management', dark: false },
];

export default function App() {
  const [active, setActive] = useState('client');

  const cur = APPS.find(a => a.id === active);
  const isAdmin = active === 'admin';
  const isDark = cur.dark;
  const t = isAdmin ? TOKENS.light : (isDark ? TOKENS.dark : TOKENS.light);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0E10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: FONT.ui,
    }}>
      {/* Top nav bar */}
      <div style={{
        width: '100%',
        background: '#16161A',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 56,
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#FF6B4A,#E11D48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity={0.9}/>
            </svg>
          </div>
          <span style={{ color: 'rgba(235,235,245,0.5)', fontFamily: FONT.ui, fontSize: 13, fontWeight: 500 }}>Gym Culture</span>
          <span style={{ color: 'rgba(235,235,245,0.2)', fontSize: 13 }}>·</span>
          <span style={{ color: 'rgba(235,235,245,0.4)', fontFamily: FONT.ui, fontSize: 12 }}>Design Prototype</span>
        </div>

        {/* Switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 3,
        }}>
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setActive(app.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                background: active === app.id ? 'linear-gradient(135deg,#FF6B4A,#E11D48)' : 'transparent',
                color: active === app.id ? '#fff' : 'rgba(235,235,245,0.45)',
                fontFamily: FONT.ui,
                fontSize: 13,
                fontWeight: active === app.id ? 600 : 400,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {app.label}
            </button>
          ))}
        </div>

        {/* Right label */}
        <div style={{ color: 'rgba(235,235,245,0.3)', fontFamily: FONT.ui, fontSize: 12 }}>
          {cur.sub}
        </div>
      </div>

      {/* Content area */}
      {isAdmin ? (
        /* Admin — full browser layout */
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 56px)' }}>
            <AdminWeb />
          </div>
        </div>
      ) : (
        /* Mobile apps — phone frame */
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 32px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Subtle label above phone */}
            <div style={{ color: 'rgba(235,235,245,0.25)', fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              375 × 812 · iOS
            </div>
            <PhoneFrame darkMode={isDark}>
              {active === 'client' && <ClientApp t={t} />}
              {active === 'trainer' && <TrainerApp t={t} />}
            </PhoneFrame>
          </div>
        </div>
      )}
    </div>
  );
}
