import { useState } from 'react';
import { TOKENS, FONT } from './tokens';
import PhoneFrame from './components/PhoneFrame';
import ClientApp from './client/ClientApp';
import TrainerApp from './trainer/TrainerApp';
import AdminWeb from './admin/AdminWeb';

const APPS = [
  { id: 'client', label: 'Client App', sub: 'Member experience' },
  { id: 'trainer', label: 'Trainer App', sub: 'PT workflow' },
  { id: 'admin', label: 'Admin Web', sub: 'Branch management' },
];

export default function App() {
  const [active, setActive] = useState('client');
  const [isDark, setIsDark] = useState(true);

  const cur = APPS.find(a => a.id === active);
  const isAdmin = active === 'admin';
  const t = isDark ? TOKENS.dark : TOKENS.light;

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
            background: '#0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <defs>
                <linearGradient id="db-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B4A"/>
                  <stop offset="100%" stopColor="#E11D48"/>
                </linearGradient>
              </defs>
              <rect x="0.5" y="3" width="3.5" height="10" rx="1.5" fill="url(#db-nav)"/>
              <rect x="4" y="6" width="8" height="4" rx="1" fill="url(#db-nav)"/>
              <rect x="12" y="3" width="3.5" height="10" rx="1.5" fill="url(#db-nav)"/>
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

        {/* Right: theme toggle + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
              color: 'rgba(235,235,245,0.6)', fontFamily: FONT.ui, fontSize: 12,
              transition: 'all 0.15s',
            }}
          >
            {isDark
              ? <svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              : <svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a.5.5 0 0 0-.6.6A6 6 0 1 0 13.4 10.6a.5.5 0 0 0-.6-.6h.7z" fill="currentColor"/></svg>
            }
            {isDark ? 'Light' : 'Dark'}
          </button>
          <div style={{ color: 'rgba(235,235,245,0.3)', fontFamily: FONT.ui, fontSize: 12 }}>
            {cur.sub}
          </div>
        </div>
      </div>

      {/* Content area */}
      {isAdmin ? (
        /* Admin — full browser layout */
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 56px)' }}>
            <AdminWeb t={t} />
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
