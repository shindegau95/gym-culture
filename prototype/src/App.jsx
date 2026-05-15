import { useState } from 'react';
import { TOKENS } from './tokens';
import PhoneFrame from './components/PhoneFrame';
import ClientApp from './client/ClientApp';
import TrainerApp from './trainer/TrainerApp';
import AdminWeb from './admin/AdminWeb';
import s from './App.module.css';

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
    <div className={s.shell}>
      <div className={s.nav}>
        <div className={s.brand}>
          <div className={s.brandMark}>
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
          <span className={s.brandTitle}>Vis</span>
          <span className={s.brandDot}>·</span>
          <span className={s.brandSub}>Design Prototype</span>
        </div>

        <div className={s.switcher}>
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setActive(app.id)}
              className={`${s.switchBtn} ${active === app.id ? s['switchBtn--active'] : ''}`}
            >
              {app.label}
            </button>
          ))}
        </div>

        <div className={s.right}>
          <button
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={s.themeBtn}
          >
            {isDark
              ? <svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              : <svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a.5.5 0 0 0-.6.6A6 6 0 1 0 13.4 10.6a.5.5 0 0 0-.6-.6h.7z" fill="currentColor"/></svg>
            }
            {isDark ? 'Light' : 'Dark'}
          </button>
          <div className={s.subLabel}>{cur.sub}</div>
        </div>
      </div>

      {isAdmin ? (
        <div className={s.adminWrap}>
          <div className={s.adminInner}>
            <AdminWeb t={t} />
          </div>
        </div>
      ) : (
        <div className={s.phoneStage}>
          <div className={s.phoneStack}>
            <div className={s.phoneCaption}>375 × 812 · iOS</div>
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
