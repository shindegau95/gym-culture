import { useState, useEffect } from 'react';
import { TOKENS } from './tokens';
import PhoneFrame from './components/PhoneFrame';
import ClientApp from './client/ClientApp';
import TrainerApp from './trainer/TrainerApp';
import AdminWeb from './admin/AdminWeb';
import visMark from './assets/vis-mark.png';
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className={s.shell} data-theme={isDark ? 'dark' : 'light'}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="vis-refract" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise"/>
            <feGaussianBlur in="noise" stdDeviation="1.4" result="noiseBlur"/>
            <feDisplacementMap in="SourceGraphic" in2="noiseBlur" scale="10" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>
      <div className={s.nav}>
        <div className={s.brand}>
          <img src={visMark} alt="Vis" className={s.brandMark} />
          <span className={s.brandWordmark}>vis</span>
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
