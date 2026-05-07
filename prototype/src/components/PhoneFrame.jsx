export default function PhoneFrame({ children, darkMode }) {
  return (
    <div style={{
      width: 375, height: 812, borderRadius: 48, flexShrink: 0,
      background: darkMode ? '#0B0B0D' : '#F7F5F3',
      boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.05)',
      border: `8px solid ${darkMode ? '#1a1a1e' : '#e0ddd9'}`,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Status bar */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'relative', zIndex: 10,
        color: darkMode ? '#F5F4F2' : '#0E0E10',
      }}>
        <span style={{ fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif', fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ width: 120, height: 30, background: darkMode ? '#1a1a1e' : '#e0ddd9', borderRadius: 20, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 6 }}/>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[4,3,3,2].map((h,i) => <div key={i} style={{ width: 3, height: h + 8, background: darkMode ? '#F5F4F2' : '#0E0E10', borderRadius: 1, opacity: i < 3 ? 1 : 0.3 }}/>)}
          </div>
          <svg width={16} height={12} viewBox="0 0 16 12" fill="none">
            <path d="M8 2.4A7.3 7.3 0 0 1 14.7 6M1.3 6A7.3 7.3 0 0 1 8 2.4M5.5 8.6A3.6 3.6 0 0 1 10.5 8.6M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke={darkMode ? '#F5F4F2' : '#0E0E10'} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg width={25} height={12} viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={darkMode ? 'rgba(245,244,242,0.35)' : 'rgba(14,14,16,0.35)'} strokeWidth="1"/>
            <rect x="2" y="2" width="17" height="8" rx="2" fill={darkMode ? '#F5F4F2' : '#0E0E10'}/>
            <path d="M23 4v4a2 2 0 0 0 0-4z" fill={darkMode ? 'rgba(245,244,242,0.4)' : 'rgba(14,14,16,0.4)'}/>
          </svg>
        </div>
      </div>
      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, top: 44, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
