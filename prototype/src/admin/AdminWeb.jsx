import { useState, createContext, useContext } from 'react';
import { TOKENS, FONT } from '../tokens';

const ThemeCtx = createContext(TOKENS.dark);
const useT = () => useContext(ThemeCtx);

const RoleCtx = createContext({ role: 'staff', setRole: () => {} });
const useRole = () => useContext(RoleCtx);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  const t = useT();
  const { role, setRole } = useRole();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
    { id: 'members',   label: 'Members',   icon: MembersIcon },
    { id: 'payments',  label: 'Payments',  icon: PayIcon },
    { id: 'trainers',  label: 'Trainers',  icon: TrainerIcon },
  ];
  return (
    <div style={{
      width: 220, background: t.bg, display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${t.sep}`, flexShrink: 0,
    }}>
      <div style={{ padding: '28px 24px 32px', borderBottom: `1px solid ${t.sep}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: '#0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            <svg width={18} height={18} viewBox="0 0 16 16" fill="none">
              <defs>
                <linearGradient id="db-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B4A"/>
                  <stop offset="100%" stopColor="#E11D48"/>
                </linearGradient>
              </defs>
              <rect x="0.5" y="3" width="3.5" height="10" rx="1.5" fill="url(#db-sidebar)"/>
              <rect x="4" y="6" width="8" height="4" rx="1" fill="url(#db-sidebar)"/>
              <rect x="12" y="3" width="3.5" height="10" rx="1.5" fill="url(#db-sidebar)"/>
            </svg>
          </div>
          <div>
            <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>GYM CULTURE</div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 11, marginTop: 1 }}>Admin Portal</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNav(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isActive ? t.accentTint : 'transparent',
              color: isActive ? t.accent : t.ink3,
              fontFamily: FONT.ui, fontSize: 14, fontWeight: isActive ? 600 : 400,
              marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
            }}>
              <Icon active={isActive} />
              {label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '16px 12px 24px', borderTop: `1px solid ${t.sep}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Role switcher */}
        <div style={{ display: 'flex', background: t.fillTint, borderRadius: 10, padding: 3 }}>
          {[{ id: 'staff', label: 'Staff' }, { id: 'owner', label: 'Owner' }].map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: role === r.id ? t.gradient : 'transparent',
              color: role === r.id ? '#fff' : t.ink3,
              fontFamily: FONT.ui, fontSize: 12, fontWeight: role === r.id ? 700 : 400,
              transition: 'all 0.15s',
            }}>{r.label}</button>
          ))}
        </div>
        {/* Branch badge */}
        <div style={{ padding: '10px 12px', borderRadius: 10, background: t.fillTint2 }}>
          <div style={{ color: t.ink4, fontFamily: FONT.ui, fontSize: 11, marginBottom: 4 }}>
            {role === 'owner' ? 'LOGGED IN AS' : 'CURRENT BRANCH'}
          </div>
          {role === 'owner' ? (
            <>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>Gaurav Shinde</div>
              <div style={{ color: t.accent, fontFamily: FONT.ui, fontSize: 11, marginTop: 2, fontWeight: 600 }}>Owner · All branches</div>
            </>
          ) : (
            <>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>Kandivali</div>
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 11, marginTop: 2 }}>Mumbai · Active</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared mini-components ───────────────────────────────────────────────────

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, borderRadius: 6, padding: '2px 8px',
      fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
    }}>{label}</span>
  );
}

function Card({ children, style }) {
  const t = useT();
  return (
    <div style={{
      background: t.bgElevated,
      borderRadius: 16,
      border: `1px solid ${t.sep}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, trend }) {
  const t = useT();
  const up = trend >= 0;
  return (
    <Card style={{ padding: '20px 24px' }}>
      <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        {trend !== 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            background: up ? 'rgba(34,160,107,0.12)' : 'rgba(214,42,42,0.12)',
            color: up ? t.good : t.bad,
            borderRadius: 6, padding: '2px 6px',
            fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
          }}>
            {up ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        <span style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12 }}>{sub}</span>
      </div>
    </Card>
  );
}

function RevenueChart() {
  const t = useT();
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const values = [3.2, 4.1, 3.8, 4.9, 5.2, 6.1];
  const max = 7;
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600 }}>Revenue</div>
          <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13, marginTop: 2 }}>Monthly collection (₹ lakhs)</div>
        </div>
        <div style={{ background: t.accentTint, color: t.accent, borderRadius: 8, padding: '4px 10px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600 }}>+17.3% YoY</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
        {values.map((v, i) => {
          const barH = Math.round((v / max) * 100);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ color: t.ink3, fontFamily: FONT.mono, fontSize: 10, opacity: i === values.length - 1 ? 1 : 0.6 }}>
                {v}L
              </div>
              <div style={{
                width: '100%', borderRadius: '6px 6px 0 0',
                height: barH,
                background: i === values.length - 1 ? t.gradient : t.fillTint,
                transition: 'height 0.3s',
                minHeight: 4,
              }} />
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 11 }}>{months[i]}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TopTrainers() {
  const t = useT();
  const trainers = [
    { name: 'Priya Sharma',   clients: 14, revenue: '₹1,12,000', rating: 4.9 },
    { name: 'Rohit Malhotra', clients: 11, revenue: '₹88,000',   rating: 4.8 },
    { name: 'Ananya Iyer',    clients: 9,  revenue: '₹72,000',   rating: 4.7 },
    { name: 'Karan Mehta',    clients: 8,  revenue: '₹64,000',   rating: 4.6 },
  ];
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Trainers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {trainers.map((tr, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: t.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT.ui, fontSize: 13, fontWeight: 700, color: '#fff',
              opacity: 1 - i * 0.15,
            }}>{tr.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>{tr.name}</div>
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12 }}>{tr.clients} clients · ★ {tr.rating}</div>
            </div>
            <div style={{ color: t.ink2, fontFamily: FONT.mono, fontSize: 13, fontWeight: 600 }}>{tr.revenue}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentActivity() {
  const t = useT();
  const items = [
    { text: 'Sneha Kapoor joined as PT member',              time: '2m ago',  dot: t.good },
    { text: 'Payment ₹8,500 logged for Arjun Singh',         time: '18m ago', dot: t.accent },
    { text: 'Rohit Malhotra completed session with Meera',   time: '1h ago',  dot: t.ink4 },
    { text: 'Vikram Nair joined as gym member',              time: '3h ago',  dot: t.good },
    { text: 'Membership renewed for Divya Rao',              time: '5h ago',  dot: t.accent },
  ];
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? `1px solid ${t.sep}` : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, color: t.ink2, fontFamily: FONT.ui, fontSize: 13 }}>{item.text}</div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, flexShrink: 0 }}>{item.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const BRANCH_COLORS = ['#FF4664', '#FF8042', '#22A06B', '#A78BFA'];
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const BRANCHES = [
  { name: 'Kandivali', members: 247, ptMembers: 89,  trainers: 12, revenue: 6.1, status: 'active',   history: [4.8, 5.1, 5.4, 5.6, 5.9, 6.1] },
  { name: 'Borivali',  members: 198, ptMembers: 71,  trainers: 9,  revenue: 4.8, status: 'active',   history: [3.8, 3.9, 4.1, 4.3, 4.6, 4.8] },
  { name: 'Mira Road', members: 143, ptMembers: 52,  trainers: 7,  revenue: 3.4, status: 'active',   history: [2.8, 2.9, 3.0, 3.1, 3.2, 3.4] },
  { name: 'Malad',     members: 89,  ptMembers: 28,  trainers: 4,  revenue: 1.9, status: 'new',      history: [0.0, 0.0, 0.5, 0.9, 1.4, 1.9] },
  { name: 'Goregaon',  members: 0,   ptMembers: 0,   trainers: 0,  revenue: 0,   status: 'upcoming', history: [0, 0, 0, 0, 0, 0] },
];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function BranchHeatGrid({ t }) {
  const allVals = BRANCHES.flatMap(b => b.history).filter(v => v > 0);
  const globalMax = Math.max(...allVals);

  return (
    <Card style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600 }}>Branch Performance — 6 Months</div>
        <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13, marginTop: 2 }}>Cell intensity = revenue magnitude · darker = higher · ₹ lakhs</div>
      </div>

      {/* Month headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr) 80px 64px', gap: 6, marginBottom: 8, paddingRight: 2 }}>
        <div/>
        {MONTHS.map(m => (
          <div key={m} style={{ textAlign: 'center', fontFamily: FONT.mono, fontSize: 11, color: t.ink3, letterSpacing: '0.04em' }}>{m}</div>
        ))}
        <div style={{ textAlign: 'center', fontFamily: FONT.ui, fontSize: 10, color: t.ink4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>MoM trend</div>
        <div style={{ textAlign: 'right', fontFamily: FONT.ui, fontSize: 10, color: t.ink4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>6M growth</div>
      </div>

      {/* Branch rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {BRANCHES.map((b, bi) => {
          const color = bi < BRANCH_COLORS.length ? BRANCH_COLORS[bi] : t.ink4;
          const firstNonZero = b.history.find(v => v > 0);
          const last = b.history[5];
          const growth = firstNonZero
            ? Math.round(((last - firstNonZero) / firstNonZero) * 100)
            : null;

          // MoM changes for sparkline
          const momChanges = b.history.map((v, i) => i === 0 ? 0 : v - b.history[i - 1]);
          const momMax = Math.max(...momChanges.map(Math.abs), 0.1);
          const spW = 80, spH = 28;
          const spPts = momChanges.slice(1).map((v, i) => {
            const x = 4 + (i / (momChanges.length - 2)) * (spW - 8);
            const y = spH / 2 - (v / momMax) * (spH / 2 - 4);
            return [x, y];
          });
          const spPath = spPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

          return (
            <div key={b.name} style={{ display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr) 80px 64px', gap: 6, alignItems: 'center' }}>
              {/* Branch name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, opacity: b.status === 'upcoming' ? 0.3 : 1 }}/>
                <span style={{ fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: b.status === 'upcoming' ? t.ink4 : t.ink, whiteSpace: 'nowrap' }}>{b.name}</span>
              </div>

              {/* Heat cells */}
              {b.history.map((v, mi) => {
                const intensity = v > 0 ? 0.18 + (v / globalMax) * 0.78 : 0;
                const isLaunch = mi > 0 && b.history[mi - 1] === 0 && v > 0;
                const momDelta = mi > 0 ? v - b.history[mi - 1] : 0;
                return (
                  <div key={mi} style={{
                    height: 46, borderRadius: 10,
                    background: v > 0 ? hexToRgba(color, intensity) : t.fillTint,
                    border: isLaunch ? `1.5px solid ${color}` : `1px solid ${v > 0 ? hexToRgba(color, 0.15) : t.sep}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                    position: 'relative',
                  }}>
                    {v > 0 ? (
                      <>
                        <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: '#fff' }}>{v}</span>
                        {mi > 0 && momDelta !== 0 && (
                          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: momDelta > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,120,120,0.9)' }}>
                            {momDelta > 0 ? '+' : ''}{momDelta.toFixed(1)}
                          </span>
                        )}
                        {isLaunch && (
                          <div style={{ position: 'absolute', top: -7, right: -4, fontSize: 11, lineHeight: 1 }}>🚀</div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink4 }}>—</span>
                    )}
                  </div>
                );
              })}

              {/* MoM sparkline */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {firstNonZero ? (
                  <svg width={spW} height={spH} style={{ display: 'block' }}>
                    <line x1={4} y1={spH/2} x2={spW-4} y2={spH/2} stroke={t.sep} strokeWidth={0.5} strokeDasharray="2 3"/>
                    <path d={spPath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                    {spPts.length > 0 && (
                      <circle cx={spPts[spPts.length-1][0]} cy={spPts[spPts.length-1][1]} r={2.5} fill={color}/>
                    )}
                  </svg>
                ) : (
                  <span style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink4 }}>—</span>
                )}
              </div>

              {/* 6M growth badge */}
              <div style={{ textAlign: 'right' }}>
                {growth !== null ? (
                  <span style={{
                    fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
                    color: growth > 50 ? t.accent : t.good,
                    background: growth > 50 ? t.accentTint : 'rgba(34,160,107,0.1)',
                    borderRadius: 6, padding: '3px 8px',
                  }}>+{growth}%</span>
                ) : (
                  <span style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink4 }}>Soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale legend */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink4 }}>Low</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0.18, 0.35, 0.52, 0.69, 0.86, 1.0].map((a, i) => (
            <div key={i} style={{ width: 20, height: 12, borderRadius: 3, background: hexToRgba(BRANCH_COLORS[0], a) }}/>
          ))}
        </div>
        <span style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink4 }}>High</span>
        <span style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink4, marginLeft: 8 }}>· MoM trend = month-over-month change in ₹ lakhs · 🚀 = branch launch</span>
      </div>
    </Card>
  );
}

function BranchSparkline({ data, color }) {
  const w = 72, h = 24;
  const valid = data.filter(v => v > 0);
  if (valid.length < 2) return <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>—</span>;
  const min = Math.min(...valid), max = Math.max(...valid);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = v === 0 ? h : h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const growth = Math.round(((data[5] - data[0]) / (data[0] || data.find(v => v > 0) || 1)) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
        <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={2.5} fill={color}/>
      </svg>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color, fontWeight: 700 }}>+{growth}%</span>
    </div>
  );
}

function OwnerDashboard() {
  const t = useT();
  const active = BRANCHES.filter(b => b.status !== 'upcoming');
  const totalMembers  = active.reduce((s, b) => s + b.members, 0);
  const totalPT       = active.reduce((s, b) => s + b.ptMembers, 0);
  const totalRevenue  = active.reduce((s, b) => s + b.revenue, 0).toFixed(1);
  const totalTrainers = active.reduce((s, b) => s + b.trainers, 0);

  const maxRev = Math.max(...BRANCHES.map(b => b.revenue), 1);

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>All Branches</h1>
        <p style={{ margin: '4px 0 0', fontFamily: FONT.ui, fontSize: 14, color: t.ink3 }}>Friday, 9 May 2026 · Owner view · {active.length} active branches</p>
      </div>

      {/* Aggregate KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Total Members"    value={totalMembers}          sub="across all branches" trend={9.4} />
        <KPICard label="Active PT Members" value={totalPT}             sub="across all branches" trend={13.1} />
        <KPICard label="Monthly Revenue"  value={`₹${totalRevenue}L`}  sub="combined"            trend={15.8} />
        <KPICard label="Trainers"         value={totalTrainers}         sub="across all branches" trend={0} />
      </div>

      {/* Heat grid */}
      <BranchHeatGrid t={t} />

      {/* Branch breakdown */}
      <Card style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${t.sep}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600 }}>Branch Breakdown</div>
          <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13 }}>May 2026</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.bgGrouped }}>
              {['Branch', 'Members', 'PT Members', 'Trainers', 'Revenue', 'Status', '6-mo trend'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((b, i) => {
              const statusColor = b.status === 'active' ? t.good : b.status === 'new' ? t.accent : t.ink4;
              const statusBg = b.status === 'active' ? 'rgba(34,160,107,0.12)' : b.status === 'new' ? t.accentTint : t.fillTint;
              const color = i < BRANCH_COLORS.length ? BRANCH_COLORS[i] : t.ink4;
              return (
                <tr key={b.name} style={{ borderTop: `1px solid ${t.sep}` }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0, opacity: b.status === 'upcoming' ? 0.3 : 1 }}/>
                      <span style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: b.status === 'upcoming' ? t.ink3 : t.ink }}>{b.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{b.members || '—'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{b.ptMembers || '—'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{b.trainers || '—'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: b.revenue ? t.ink : t.ink4 }}>{b.revenue ? `₹${b.revenue}L` : '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: statusBg, color: statusColor, borderRadius: 6, padding: '2px 8px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <BranchSparkline data={b.history} color={color} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <RecentActivity />
    </div>
  );
}

function Dashboard() {
  const { role } = useRole();
  if (role === 'owner') return <OwnerDashboard />;
  const t = useT();
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Kandivali Branch</h1>
        <p style={{ margin: '4px 0 0', fontFamily: FONT.ui, fontSize: 14, color: t.ink3 }}>Friday, 9 May 2026 · All figures for current month</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Total Members" value="247" sub="vs last month" trend={8.2} />
        <KPICard label="Active PT Members" value="89" sub="vs last month" trend={12.4} />
        <KPICard label="Monthly Revenue" value="₹6.1L" sub="vs last month" trend={17.3} />
        <KPICard label="Trainers" value="12" sub="2 on leave" trend={0} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>
        <RevenueChart />
        <TopTrainers />
      </div>
      <RecentActivity />
    </div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────

const MEMBERS = [
  { id: 1, name: 'Sneha Kapoor',  type: 'PT',  trainer: 'Priya Sharma',   since: '2025-11-01', status: 'active',   phone: '+91 98765 43210', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 48 },
  { id: 2, name: 'Arjun Singh',   type: 'PT',  trainer: 'Rohit Malhotra', since: '2025-09-15', status: 'active',   phone: '+91 87654 32109', fee: '₹8,500/mo', nextPayment: '2026-05-15', sessions: 72 },
  { id: 3, name: 'Meera Pillai',  type: 'PT',  trainer: 'Rohit Malhotra', since: '2026-01-10', status: 'active',   phone: '+91 76543 21098', fee: '₹8,500/mo', nextPayment: '2026-06-10', sessions: 32 },
  { id: 4, name: 'Vikram Nair',   type: 'Gym', trainer: '—',              since: '2026-04-01', status: 'active',   phone: '+91 65432 10987', fee: '₹2,500/mo', nextPayment: '2026-06-01', sessions: 0 },
  { id: 5, name: 'Divya Rao',     type: 'Gym', trainer: '—',              since: '2025-08-20', status: 'active',   phone: '+91 54321 09876', fee: '₹2,500/mo', nextPayment: '2026-05-20', sessions: 0 },
  { id: 6, name: 'Rahul Verma',   type: 'PT',  trainer: 'Ananya Iyer',    since: '2025-12-05', status: 'inactive', phone: '+91 43210 98765', fee: '₹8,500/mo', nextPayment: '—',          sessions: 20 },
  { id: 7, name: 'Pooja Desai',   type: 'Gym', trainer: '—',              since: '2026-02-14', status: 'active',   phone: '+91 32109 87654', fee: '₹2,500/mo', nextPayment: '2026-06-14', sessions: 0 },
  { id: 8, name: 'Amit Joshi',    type: 'PT',  trainer: 'Karan Mehta',    since: '2026-03-01', status: 'active',   phone: '+91 21098 76543', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 24 },
];

function inputStyle(t) {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14,
    color: t.ink, background: t.bgGrouped, outline: 'none',
    boxSizing: 'border-box',
  };
}

function MemberDetail({ member, onBack, onLogPayment }) {
  const t = useT();
  const [activating, setActivating] = useState(false);
  return (
    <div>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        cursor: 'pointer', color: t.accent, fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
        padding: '0 0 20px',
      }}>← Back to Members</button>
      <Card style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: t.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT.display, fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{member.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink }}>{member.name}</h2>
              <Badge label={member.type === 'PT' ? 'PT Member' : 'Gym Member'} color={member.type === 'PT' ? t.accent : t.ink3} bg={member.type === 'PT' ? t.accentTint : t.fillTint} />
              <Badge label={member.status === 'active' ? 'Active' : 'Inactive'} color={member.status === 'active' ? t.good : t.bad} bg={member.status === 'active' ? 'rgba(34,160,107,0.12)' : 'rgba(214,42,42,0.12)'} />
            </div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 14 }}>{member.phone} · Member since {member.since}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${t.sep}` }}>
          {[
            { label: 'Trainer',             value: member.trainer },
            { label: 'Fee',                 value: member.fee },
            { label: 'Next Payment',        value: member.nextPayment },
            { label: 'Sessions Completed',  value: member.sessions > 0 ? member.sessions : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 15, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => onLogPayment(member)} style={{
          padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
        }}>Log Payment</button>
        {member.type === 'Gym' && (
          <button onClick={() => setActivating(v => !v)} style={{
            padding: '12px 20px', borderRadius: 12, border: `1px solid ${t.sep}`, cursor: 'pointer',
            background: 'none', color: t.ink, fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
          }}>Activate PT Membership</button>
        )}
        {member.status === 'inactive' && (
          <button style={{
            padding: '12px 20px', borderRadius: 12, border: `1px solid ${t.sep}`, cursor: 'pointer',
            background: 'none', color: t.good, fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
          }}>Reactivate Membership</button>
        )}
      </div>
      {activating && (
        <Card style={{ marginTop: 16, padding: 24, border: `1px solid ${t.accentRing}` }}>
          <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Activate PT Membership</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Assign Trainer</label>
              <select style={inputStyle(t)}>
                <option>Priya Sharma</option><option>Rohit Malhotra</option><option>Ananya Iyer</option><option>Karan Mehta</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Start Date</label>
              <input type="date" defaultValue="2026-05-09" style={inputStyle(t)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setActivating(false)} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
            }}>Confirm Activation</button>
            <button onClick={() => setActivating(false)} style={{
              padding: '10px 20px', borderRadius: 10, border: `1px solid ${t.sep}`, cursor: 'pointer',
              background: 'none', color: t.ink3, fontFamily: FONT.ui, fontSize: 14,
            }}>Cancel</button>
          </div>
        </Card>
      )}
    </div>
  );
}

function LogPaymentModal({ member, onClose }) {
  const t = useT();
  if (!member) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: t.bgElevated, borderRadius: 20, padding: 32, width: 420,
        border: `1px solid ${t.sep}`, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: t.ink, marginBottom: 4 }}>Log Payment</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 14, color: t.ink3, marginBottom: 24 }}>{member.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Amount (₹)', type: 'number', defaultValue: member.type === 'PT' ? 8500 : 2500 },
            { label: 'Payment Date', type: 'date',   defaultValue: '2026-05-09' },
          ].map(({ label, type, defaultValue }) => (
            <div key={label}>
              <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>{label}</label>
              <input type={type} defaultValue={defaultValue} style={{ ...inputStyle(t), padding: '12px 14px', borderRadius: 12, fontSize: type === 'number' ? 16 : 14, fontFamily: type === 'number' ? FONT.mono : FONT.ui }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Mode</label>
            <select style={{ ...inputStyle(t), padding: '12px 14px', borderRadius: 12 }}>
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Notes (optional)</label>
            <input type="text" placeholder="e.g. May monthly fee" style={{ ...inputStyle(t), padding: '12px 14px', borderRadius: 12 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 15, fontWeight: 600,
          }}>Confirm Payment</button>
          <button onClick={onClose} style={{
            padding: '12px 16px', borderRadius: 12, border: `1px solid ${t.sep}`, cursor: 'pointer',
            background: 'none', color: t.ink3, fontFamily: FONT.ui, fontSize: 15,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Members() {
  const t = useT();
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [selectedMember, setSelected]   = useState(null);
  const [paymentTarget, setPayTarget]   = useState(null);

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'pt'       && m.type === 'PT') ||
      (filter === 'gym'      && m.type === 'Gym') ||
      (filter === 'inactive' && m.status === 'inactive');
    return matchSearch && matchFilter;
  });

  if (selectedMember) return (
    <div style={{ padding: '32px 40px' }}>
      <MemberDetail member={selectedMember} onBack={() => setSelected(null)} onLogPayment={setPayTarget} />
      <LogPaymentModal member={paymentTarget} onClose={() => setPayTarget(null)} />
    </div>
  );

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Members</h1>
        <button style={{
          padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
        }}>+ Add Member</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, ...inputStyle(t) }}
        />
        {['all', 'pt', 'gym', 'inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: filter === f ? t.gradient : t.fillTint,
            color: filter === f ? '#fff' : t.ink3,
            fontFamily: FONT.ui, fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
          }}>{f === 'all' ? 'All' : f === 'pt' ? 'PT Members' : f === 'gym' ? 'Gym Only' : 'Inactive'}</button>
        ))}
      </div>
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.bgGrouped }}>
              {['Name', 'Type', 'Trainer', 'Fee', 'Next Payment', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} style={{ borderTop: `1px solid ${t.sep}`, cursor: 'pointer' }} onClick={() => setSelected(m)}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: t.gradient, opacity: 0.8 + (i % 3) * 0.07,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FONT.ui, fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>{m.name[0]}</div>
                    <div>
                      <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink }}>{m.name}</div>
                      <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3 }}>{m.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={m.type} color={m.type === 'PT' ? t.accent : t.ink3} bg={m.type === 'PT' ? t.accentTint : t.fillTint} />
                </td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 14, color: t.ink2 }}>{m.trainer}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{m.fee}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink3 }}>{m.nextPayment}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={m.status === 'active' ? 'Active' : 'Inactive'} color={m.status === 'active' ? t.good : t.bad} bg={m.status === 'active' ? 'rgba(34,160,107,0.12)' : 'rgba(214,42,42,0.12)'} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={e => { e.stopPropagation(); setPayTarget(m); }} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: t.accentTint, color: t.accent, fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
                  }}>Log Payment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <LogPaymentModal member={paymentTarget} onClose={() => setPayTarget(null)} />
    </div>
  );
}

// ─── Payments ─────────────────────────────────────────────────────────────────

const PAYMENTS = [
  { id: 'P001', member: 'Arjun Singh',  type: 'PT Monthly',   amount: 8500, date: '2026-05-08', mode: 'UPI',           status: 'confirmed' },
  { id: 'P002', member: 'Sneha Kapoor', type: 'PT Monthly',   amount: 8500, date: '2026-05-07', mode: 'Cash',          status: 'confirmed' },
  { id: 'P003', member: 'Divya Rao',    type: 'Gym Renewal',  amount: 2500, date: '2026-05-06', mode: 'UPI',           status: 'confirmed' },
  { id: 'P004', member: 'Amit Joshi',   type: 'PT Monthly',   amount: 8500, date: '2026-05-05', mode: 'Card',          status: 'confirmed' },
  { id: 'P005', member: 'Pooja Desai',  type: 'Gym Monthly',  amount: 2500, date: '2026-05-04', mode: 'UPI',           status: 'confirmed' },
  { id: 'P006', member: 'Meera Pillai', type: 'PT Monthly',   amount: 8500, date: '2026-05-03', mode: 'Cash',          status: 'confirmed' },
  { id: 'P007', member: 'Vikram Nair',  type: 'Gym Joining',  amount: 5000, date: '2026-04-30', mode: 'UPI',           status: 'confirmed' },
  { id: 'P008', member: 'Rahul Verma',  type: 'PT Monthly',   amount: 8500, date: '2026-04-28', mode: 'Bank Transfer', status: 'pending' },
];

function Payments() {
  const t = useT();
  const [month, setMonth] = useState('May 2026');
  const total = PAYMENTS.filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Payment Log</h1>
          <p style={{ margin: '4px 0 0', fontFamily: FONT.ui, fontSize: 14, color: t.ink3 }}>Collected this month: <span style={{ color: t.good, fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</span></p>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...inputStyle(t), width: 'auto', padding: '10px 16px', borderRadius: 12, cursor: 'pointer' }}>
          <option>May 2026</option><option>April 2026</option><option>March 2026</option>
        </select>
      </div>
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.bgGrouped }}>
              {['Ref', 'Member', 'Type', 'Amount', 'Date', 'Mode', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${t.sep}` }}>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{p.id}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 500, color: t.ink }}>{p.member}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink2 }}>{p.type}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: t.ink }}>₹{p.amount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink3 }}>{p.date}</td>
                <td style={{ padding: '14px 16px' }}><Badge label={p.mode} color={t.ink2} bg={t.fillTint} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge
                    label={p.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    color={p.status === 'confirmed' ? t.good : t.warn}
                    bg={p.status === 'confirmed' ? 'rgba(34,160,107,0.12)' : 'rgba(224,134,0,0.12)'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Trainers ─────────────────────────────────────────────────────────────────

const TRAINERS = [
  { name: 'Priya Sharma',   clients: 14, active: true,  speciality: 'Strength & Hypertrophy',  exp: '6 yrs', phone: '+91 98001 12345', expRating: 4.9, feedbackRating: 4.8, progressRating: 4.7 },
  { name: 'Rohit Malhotra', clients: 11, active: true,  speciality: 'Fat Loss & Conditioning', exp: '4 yrs', phone: '+91 97002 23456', expRating: 4.6, feedbackRating: 4.8, progressRating: 4.5 },
  { name: 'Ananya Iyer',    clients: 9,  active: true,  speciality: 'Functional Training',     exp: '3 yrs', phone: '+91 96003 34567', expRating: 4.3, feedbackRating: 4.7, progressRating: 4.4 },
  { name: 'Karan Mehta',    clients: 8,  active: true,  speciality: 'Powerlifting',            exp: '5 yrs', phone: '+91 95004 45678', expRating: 4.7, feedbackRating: 4.6, progressRating: 4.8 },
  { name: 'Divya Bose',     clients: 6,  active: false, speciality: 'Yoga & Mobility',         exp: '2 yrs', phone: '+91 94005 56789', expRating: 4.1, feedbackRating: 4.5, progressRating: 4.2 },
];

function ScoreRing({ label, value, t }) {
  const size = 60;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - (value / 5));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.fillTint} strokeWidth={4} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="url(#rg)" strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={fill}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7B5A"/>
              <stop offset="100%" stopColor="#FF2D55"/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: t.ink,
        }}>{value}</div>
      </div>
      <div style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink3, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

function Trainers() {
  const t = useT();
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Trainers</h1>
        <button style={{
          padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
        }}>+ Add Trainer</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {TRAINERS.map((tr, i) => (
          <Card key={i} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                background: t.gradient, opacity: 0.85 + i * 0.03,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT.display, fontSize: 18, fontWeight: 700, color: '#fff',
              }}>{tr.name[0]}</div>
              <div>
                <div style={{ fontFamily: FONT.ui, fontSize: 15, fontWeight: 700, color: t.ink }}>{tr.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tr.active ? t.good : t.ink4 }} />
                  <span style={{ fontFamily: FONT.ui, fontSize: 12, color: tr.active ? t.good : t.ink3 }}>{tr.active ? 'Active' : 'On Leave'}</span>
                </div>
              </div>
            </div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13, marginBottom: 2 }}>{tr.speciality}</div>
            <div style={{ color: t.ink4, fontFamily: FONT.ui, fontSize: 12, marginBottom: 16 }}>{tr.exp} · {tr.phone}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 4 }}>
              <ScoreRing label="Experience"  value={tr.expRating}      t={t} />
              <ScoreRing label="Feedback"    value={tr.feedbackRating} t={t} />
              <ScoreRing label="Progress"    value={tr.progressRating} t={t} />
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.sep}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink }}>{tr.clients}</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3 }}>active clients</div>
              </div>
              <button style={{
                padding: '8px 14px', borderRadius: 10, border: `1px solid ${t.sep}`, cursor: 'pointer',
                background: 'none', color: t.ink3, fontFamily: FONT.ui, fontSize: 13,
              }}>View Profile</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function DashIcon({ active }) {
  const c = active ? '#FF4664' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={1} width={6} height={6} rx={2} fill={c} opacity={active ? 1 : 0.5}/>
    <rect x={11} y={1} width={6} height={6} rx={2} fill={c} opacity={active ? 0.6 : 0.3}/>
    <rect x={1} y={11} width={6} height={6} rx={2} fill={c} opacity={active ? 0.6 : 0.3}/>
    <rect x={11} y={11} width={6} height={6} rx={2} fill={c} opacity={active ? 0.4 : 0.2}/>
  </svg>;
}
function MembersIcon({ active }) {
  const c = active ? '#FF4664' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <circle cx={7} cy={6} r={3.5} stroke={c} strokeWidth={1.5}/>
    <path d="M1 15c0-3 2.7-5 6-5s6 2 6 5" stroke={c} strokeWidth={1.5} strokeLinecap="round"/>
    <circle cx={14} cy={7} r={2.5} stroke={c} strokeWidth={1.5} opacity={0.6}/>
    <path d="M17 15c0-2-1.3-3.5-3-3.5" stroke={c} strokeWidth={1.5} strokeLinecap="round" opacity={0.6}/>
  </svg>;
}
function PayIcon({ active }) {
  const c = active ? '#FF4664' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={4} width={16} height={11} rx={2.5} stroke={c} strokeWidth={1.5}/>
    <path d="M1 8h16" stroke={c} strokeWidth={1.5}/>
    <rect x={3} y={11} width={4} height={1.5} rx={0.75} fill={c}/>
  </svg>;
}
function TrainerIcon({ active }) {
  const c = active ? '#FF4664' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <path d="M2 9h3l2-5 3 9 2-4h4" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function AdminWeb({ t = TOKENS.dark }) {
  const [page, setPage] = useState('dashboard');
  const [role, setRole] = useState('staff');
  const pages = { dashboard: Dashboard, members: Members, payments: Payments, trainers: Trainers };
  const Page = pages[page] || Dashboard;

  return (
    <ThemeCtx.Provider value={t}>
      <RoleCtx.Provider value={{ role, setRole }}>
        <div style={{ display: 'flex', width: '100%', height: '100%', background: t.bgGrouped, fontFamily: FONT.ui }}>
          <Sidebar active={page} onNav={setPage} />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Page />
          </div>
        </div>
      </RoleCtx.Provider>
    </ThemeCtx.Provider>
  );
}
