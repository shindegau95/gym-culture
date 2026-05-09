import s from './PhoneFrame.module.css';

const SIGNAL_HEIGHTS = [12, 11, 11, 10];

export default function PhoneFrame({ children, darkMode }) {
  return (
    <div data-theme={darkMode ? 'dark' : 'light'} className={s.frame}>
      <div className={s.statusBar}>
        <span className={s.statusTime}>9:41</span>
        <div className={s.statusIsland} />
        <div className={s.statusIcons}>
          <div className={s.signalBars}>
            {SIGNAL_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`${s.signalBar} ${i >= 3 ? s['signalBar--dim'] : ''}`}
                style={{ height: h }}
              />
            ))}
          </div>
          <svg width={16} height={12} viewBox="0 0 16 12" fill="none">
            <path d="M8 2.4A7.3 7.3 0 0 1 14.7 6M1.3 6A7.3 7.3 0 0 1 8 2.4M5.5 8.6A3.6 3.6 0 0 1 10.5 8.6M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" className={s.iconStroke} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg width={25} height={12} viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" className={s.batteryStroke} strokeWidth="1"/>
            <rect x="2" y="2" width="17" height="8" rx="2" className={s.batteryFill}/>
            <path d="M23 4v4a2 2 0 0 0 0-4z" className={s.batteryNub}/>
          </svg>
        </div>
      </div>
      <div className={s.content}>
        {children}
      </div>
    </div>
  );
}
