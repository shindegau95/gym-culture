import { useState, createContext, useContext } from 'react';
import { TOKENS } from '../tokens';
import visMark from '../assets/vis-mark.png';
import s from './AdminWeb.module.css';

const ThemeCtx = createContext(TOKENS.dark);
const useT = () => useContext(ThemeCtx);

const RoleCtx = createContext({ role: 'staff', setRole: () => {} });
const useRole = () => useContext(RoleCtx);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  const { role, setRole } = useRole();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
    { id: 'members',   label: 'Members',   icon: MembersIcon },
    { id: 'payments',  label: 'Payments',  icon: PayIcon },
    { id: 'trainers',  label: 'Trainers',  icon: TrainerIcon },
  ];
  return (
    <div className={s.sidebar}>
      <div className={s.sidebarBrand}>
        <div className={s.sidebarBrandRow}>
          <img src={visMark} alt="Vis" className={s.sidebarMark} />
          <div>
            <div className={s.sidebarTitle}>vis</div>
            <div className={s.sidebarSubtitle}>Admin Portal</div>
          </div>
        </div>
      </div>
      <nav className={s.sidebarNav}>
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNav(id)}
              className={`${s.sidebarItem} ${isActive ? s['sidebarItem--active'] : ''}`}>
              <Icon active={isActive} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className={s.sidebarFoot}>
        <div className={s.roleSwitcher}>
          {[{ id: 'staff', label: 'Staff' }, { id: 'owner', label: 'Owner' }].map(r => (
            <button key={r.id} onClick={() => setRole(r.id)}
              className={`${s.roleBtn} ${role === r.id ? s['roleBtn--active'] : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
        {role === 'owner' && <BrandColorPicker/>}
        <div className={s.branchBadge}>
          <div className={s.branchEyebrow}>{role === 'owner' ? 'LOGGED IN AS' : 'CURRENT BRANCH'}</div>
          {role === 'owner' ? (
            <>
              <div className={s.branchName}>Gaurav Shinde</div>
              <div className={`${s.branchSub} ${s.ownerSub}`}>Owner · All branches</div>
            </>
          ) : (
            <>
              <div className={s.branchName}>Kandivali</div>
              <div className={s.branchSub}>Mumbai · Active</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BrandColorPicker — Owner-only tenant accent override (mock) ─────────────
// Maps to backend GymBrand.primary_color column (see spec §5).
const BRAND_PRESETS = [
  { id: 'vis',     label: 'Vis',     accent: '#F25A1F', soft: '#FF8A5C', deep: '#8A2E08', light: { accent: '#F25A1F' }, dark: { accent: '#FF6A2C' } },
  { id: 'iron',    label: 'Iron',    accent: '#B43F00', soft: '#FF7A30', deep: '#5A1F00', light: { accent: '#B43F00' }, dark: { accent: '#E25510' } },
  { id: 'amber',   label: 'Amber',   accent: '#E08A00', soft: '#FFB855', deep: '#7A4400', light: { accent: '#C97500' }, dark: { accent: '#FFA033' } },
  { id: 'crimson', label: 'Crimson', accent: '#C92330', soft: '#FF6878', deep: '#6A0E15', light: { accent: '#C92330' }, dark: { accent: '#FF4054' } },
];

function BrandColorPicker() {
  const [active, setActive] = useState('vis');
  const apply = (b) => {
    setActive(b.id);
    const r = document.documentElement;
    const isDark = r.getAttribute('data-theme') === 'dark';
    const accent = isDark ? b.dark.accent : b.light.accent;
    r.style.setProperty('--gc-accent',      accent);
    r.style.setProperty('--gc-accent-soft', b.soft);
    r.style.setProperty('--gc-gradient',
      `linear-gradient(135deg, ${b.soft} 0%, ${accent} 50%, ${b.deep} 100%)`);
    r.style.setProperty('--gc-accent-tint',
      accent.replace('#','rgba(').replace(/(..)(..)(..)/, (_,a,b2,c) =>
        `${parseInt(a,16)},${parseInt(b2,16)},${parseInt(c,16)},0.10)`));
    r.style.setProperty('--gc-accent-ring',
      accent.replace('#','rgba(').replace(/(..)(..)(..)/, (_,a,b2,c) =>
        `${parseInt(a,16)},${parseInt(b2,16)},${parseInt(c,16)},0.30)`));
  };
  return (
    <div className={s.brandPicker}>
      <div className={s.brandPickerLabel}>Brand accent</div>
      <div className={s.brandPickerRow}>
        {BRAND_PRESETS.map(b => (
          <button
            key={b.id}
            onClick={() => apply(b)}
            className={`${s.brandSwatch} ${active === b.id ? s['brandSwatch--active'] : ''}`}
            style={{ background: `linear-gradient(135deg, ${b.soft}, ${b.accent}, ${b.deep})` }}
            title={b.label}
            aria-label={b.label}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shared mini-components ───────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span className={s.badge} style={{ background: bg, color }}>{label}</span>
  );
}

function Card({ children, className, style }) {
  return (
    <div className={`${s.card} ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend }) {
  const up = trend >= 0;
  return (
    <Card className={s.kpiCard}>
      <div className={s.kpiLabel}>{label}</div>
      <div className={s.kpiValue}>{value}</div>
      <div className={s.kpiTrendRow}>
        {trend !== 0 && (
          <span className={`${s.trendPill} ${up ? s['trendPill--up'] : s['trendPill--down']}`}>
            {up ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        <span className={s.kpiSub}>{sub}</span>
      </div>
    </Card>
  );
}

function RevenueChart() {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const values = [3.2, 4.1, 3.8, 4.9, 5.2, 6.1];
  const max = 7;
  return (
    <Card className={s.chartCard}>
      <div className={s.chartHeader}>
        <div>
          <div className={s.chartTitle}>Revenue</div>
          <div className={s.chartSub}>Monthly collection (₹ lakhs)</div>
        </div>
        <div className={s.chartBadge}>+17.3% YoY</div>
      </div>
      <div className={s.barRow}>
        {values.map((v, i) => {
          const barH = Math.round((v / max) * 100);
          const isLast = i === values.length - 1;
          return (
            <div key={i} className={s.barCol}>
              <div className={`${s.barNum} ${isLast ? s['barNum--last'] : ''}`}>{v}L</div>
              <div className={`${s.bar} ${isLast ? s['bar--last'] : ''}`} style={{ height: barH }} />
              <div className={s.barLabel}>{months[i]}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TopTrainers() {
  const trainers = [
    { name: 'Priya Sharma',   clients: 14, rating: 4.9 },
    { name: 'Rohit Malhotra', clients: 11, rating: 4.8 },
    { name: 'Ananya Iyer',    clients: 9,  rating: 4.7 },
    { name: 'Karan Mehta',    clients: 8,  rating: 4.6 },
  ].sort((a, b) => b.rating - a.rating);
  return (
    <Card className={s.chartCard}>
      <div className={s.simpleHead}>Top Trainers</div>
      <div className={s.trainerStack}>
        {trainers.map((tr, i) => (
          <button key={i} className={s.trainerRow} type="button">
            <div className={s.trainerAvatar} style={{ opacity: 1 - i * 0.12 }}>{tr.name[0]}</div>
            <div className={s.trainerBody}>
              <div className={s.trainerName}>{tr.name}</div>
              <div className={s.trainerMeta}>{tr.clients} clients</div>
            </div>
            <div className={s.trainerRating}>★ {tr.rating}</div>
          </button>
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
    <Card className={s.chartCard}>
      <div className={s.simpleHead}>Recent Activity</div>
      <div>
        {items.map((item, i) => (
          <div key={i} className={s.activityRow}>
            <div className={s.activityDot} style={{ background: item.dot }} />
            <div className={s.activityText}>{item.text}</div>
            <div className={s.activityTime}>{item.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const BRANCH_COLORS = ['#FF6A2C', '#FFB13D', '#22A06B', '#5B8DEF'];
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

function BranchHeatGrid() {
  const t = useT();
  const allVals = BRANCHES.flatMap(b => b.history).filter(v => v > 0);
  const globalMax = Math.max(...allVals);

  return (
    <Card className={s.heatCard}>
      <div className={s.heatHead}>
        <div className={s.chartTitle}>Branch Performance — 6 Months</div>
        <div className={s.chartSub}>Cell intensity = revenue magnitude · darker = higher · ₹ lakhs</div>
      </div>

      <div className={s.heatGrid}>
        <div/>
        {MONTHS.map(m => <div key={m} className={s.heatMonth}>{m}</div>)}
        <div className={s.heatColLabelMid}>MoM trend</div>
        <div className={s.heatColLabelEnd}>6M growth</div>
      </div>

      <div className={s.heatRows}>
        {BRANCHES.map((b, bi) => {
          const color = bi < BRANCH_COLORS.length ? BRANCH_COLORS[bi] : t.ink4;
          const firstNonZero = b.history.find(v => v > 0);
          const last = b.history[5];
          const growth = firstNonZero ? Math.round(((last - firstNonZero) / firstNonZero) * 100) : null;

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
            <div key={b.name} className={s.heatRow}>
              <div className={s.heatBranchCell}>
                <div className={`${s.heatBranchSwatch} ${b.status === 'upcoming' ? s['heatBranchSwatch--upcoming'] : ''}`}
                  style={{ background: color }} />
                <span className={`${s.heatBranchName} ${b.status === 'upcoming' ? s['heatBranchName--upcoming'] : ''}`}>{b.name}</span>
              </div>

              {b.history.map((v, mi) => {
                const intensity = v > 0 ? 0.18 + (v / globalMax) * 0.78 : 0;
                const isLaunch = mi > 0 && b.history[mi - 1] === 0 && v > 0;
                const momDelta = mi > 0 ? v - b.history[mi - 1] : 0;
                const cellStyle = v > 0
                  ? {
                      background: hexToRgba(color, intensity),
                      border: isLaunch ? `1.5px solid ${color}` : `1px solid ${hexToRgba(color, 0.15)}`,
                    }
                  : undefined;
                return (
                  <div key={mi} className={`${s.heatCell} ${v > 0 ? '' : s['heatCell--empty']}`} style={cellStyle}>
                    {v > 0 ? (
                      <>
                        <span className={s.heatCellVal}>{v}</span>
                        {mi > 0 && momDelta !== 0 && (
                          <span className={`${s.heatCellDelta} ${momDelta < 0 ? s['heatCellDelta--neg'] : ''}`}>
                            {momDelta > 0 ? '+' : ''}{momDelta.toFixed(1)}
                          </span>
                        )}
                        {isLaunch && <div className={s.launchEmoji}>🚀</div>}
                      </>
                    ) : (
                      <span className={s.heatCellEmpty}>—</span>
                    )}
                  </div>
                );
              })}

              <div className={s.spkWrap}>
                {firstNonZero ? (
                  <svg width={spW} height={spH} className={s.spkSvg}>
                    <line x1={4} y1={spH/2} x2={spW-4} y2={spH/2} stroke={t.sep} strokeWidth={0.5} strokeDasharray="2 3"/>
                    <path d={spPath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                    {spPts.length > 0 && (
                      <circle cx={spPts[spPts.length-1][0]} cy={spPts[spPts.length-1][1]} r={2.5} fill={color}/>
                    )}
                  </svg>
                ) : (
                  <span className={s.spkEmpty}>—</span>
                )}
              </div>

              <div className={s.heatGrowth}>
                {growth !== null ? (
                  <span className={`${s.heatGrowthBadge} ${growth > 50 ? s['heatGrowthBadge--high'] : s['heatGrowthBadge--low']}`}>+{growth}%</span>
                ) : (
                  <span className={s.spkEmpty}>Soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={s.heatLegend}>
        <span className={s.heatLegendLabel}>Low</span>
        <div className={s.heatLegendCells}>
          {[0.18, 0.35, 0.52, 0.69, 0.86, 1.0].map((a, i) => (
            <div key={i} className={s.heatLegendCell} style={{ background: hexToRgba(BRANCH_COLORS[0], a) }}/>
          ))}
        </div>
        <span className={s.heatLegendLabel}>High</span>
        <span className={`${s.heatLegendLabel} ${s.heatLegendNote}`}>· MoM trend = month-over-month change in ₹ lakhs · 🚀 = branch launch</span>
      </div>
    </Card>
  );
}

function BranchSparkline({ data, color }) {
  const w = 72, h = 24;
  const valid = data.filter(v => v > 0);
  if (valid.length < 2) return <span className={s.spkEmpty}>—</span>;
  const min = Math.min(...valid), max = Math.max(...valid);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = v === 0 ? h : h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const growth = Math.round(((data[5] - data[0]) / (data[0] || data.find(v => v > 0) || 1)) * 100);
  return (
    <div className={s.sparklineRow}>
      <svg width={w} height={h} className={s.spkInline}>
        <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={2.5} fill={color}/>
      </svg>
      <span className={s.spkText} style={{ color }}>+{growth}%</span>
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

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>All Branches</h1>
        <p className={s.pageSub}>Friday, 9 May 2026 · Owner view · {active.length} active branches</p>
      </div>

      <div className={s.kpiGrid}>
        <KPICard label="Total Members"     value={totalMembers}          sub="across all branches" trend={9.4} />
        <KPICard label="Active PT Members" value={totalPT}               sub="across all branches" trend={13.1} />
        <KPICard label="Monthly Revenue"   value={`₹${totalRevenue}L`}   sub="combined"            trend={15.8} />
        <KPICard label="Trainers"          value={totalTrainers}         sub="across all branches" trend={0} />
      </div>

      <BranchHeatGrid />

      <Card className={s.tableCard}>
        <div className={s.tableHead}>
          <div className={s.tableHeadTitle}>Branch Breakdown</div>
          <div className={s.tableHeadSub}>May 2026</div>
        </div>
        <table className={s.dataTable}>
          <thead>
            <tr>
              {['Branch', 'Members', 'PT Members', 'Trainers', 'Revenue', 'Status', '6-mo trend'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((b, i) => {
              const statusColor = b.status === 'active' ? t.good : b.status === 'new' ? t.accent : t.ink4;
              const statusBg = b.status === 'active' ? 'rgba(34,160,107,0.12)' : b.status === 'new' ? t.accentTint : t.fillTint;
              const color = i < BRANCH_COLORS.length ? BRANCH_COLORS[i] : t.ink4;
              return (
                <tr key={b.name}>
                  <td>
                    <div className={s.branchCell}>
                      <div className={s.branchCellSwatch}
                        style={{ background: color, opacity: b.status === 'upcoming' ? 0.3 : 1 }} />
                      <span className={`${s.branchCellName} ${b.status === 'upcoming' ? s['branchCellName--upcoming'] : ''}`}>{b.name}</span>
                    </div>
                  </td>
                  <td className={s.tdMono}>{b.members || '—'}</td>
                  <td className={s.tdMono}>{b.ptMembers || '—'}</td>
                  <td className={s.tdMono}>{b.trainers || '—'}</td>
                  <td className={`${s.tdRevenue} ${!b.revenue ? s['tdMono--mute'] : ''}`}>{b.revenue ? `₹${b.revenue}L` : '—'}</td>
                  <td>
                    <Badge label={b.status} color={statusColor} bg={statusBg} />
                  </td>
                  <td>
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
  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Kandivali Branch</h1>
        <p className={s.pageSub}>Friday, 9 May 2026 · All figures for current month</p>
      </div>
      <div className={s.kpiGrid}>
        <KPICard label="Total Members" value="247" sub="vs last month" trend={8.2} />
        <KPICard label="Active PT Members" value="89" sub="vs last month" trend={12.4} />
        <KPICard label="Monthly Revenue" value="₹6.1L" sub="vs last month" trend={17.3} />
        <KPICard label="Trainers" value="12" sub="2 on leave" trend={0} />
      </div>
      <div className={s.dashCols}>
        <RevenueChart />
        <TopTrainers />
      </div>
      <RecentActivity />
    </div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────
const BRANCH_FILTERS = [
  { id: 'all',       label: 'All branches' },
  { id: 'kandivali', label: 'Kandivali' },
  { id: 'borivali',  label: 'Borivali' },
  { id: 'mira-road', label: 'Mira Road' },
];

const MEMBERS = [
  { id: 1, name: 'Sneha Kapoor',  branch: 'kandivali', type: 'PT',  trainer: 'Priya Sharma',   since: '2025-11-01', status: 'active',   phone: '+91 98765 43210', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 48 },
  { id: 2, name: 'Arjun Singh',   branch: 'kandivali', type: 'PT',  trainer: 'Rohit Malhotra', since: '2025-09-15', status: 'active',   phone: '+91 87654 32109', fee: '₹8,500/mo', nextPayment: '2026-05-15', sessions: 72 },
  { id: 3, name: 'Meera Pillai',  branch: 'borivali',  type: 'PT',  trainer: 'Rohit Malhotra', since: '2026-01-10', status: 'active',   phone: '+91 76543 21098', fee: '₹8,500/mo', nextPayment: '2026-06-10', sessions: 32 },
  { id: 4, name: 'Vikram Nair',   branch: 'kandivali', type: 'Gym', trainer: '—',              since: '2026-04-01', status: 'active',   phone: '+91 65432 10987', fee: '₹2,500/mo', nextPayment: '2026-06-01', sessions: 0 },
  { id: 5, name: 'Divya Rao',     branch: 'borivali',  type: 'Gym', trainer: '—',              since: '2025-08-20', status: 'active',   phone: '+91 54321 09876', fee: '₹2,500/mo', nextPayment: '2026-05-20', sessions: 0 },
  { id: 6, name: 'Rahul Verma',   branch: 'mira-road', type: 'PT',  trainer: 'Ananya Iyer',    since: '2025-12-05', status: 'inactive', phone: '+91 43210 98765', fee: '₹8,500/mo', nextPayment: '—',          sessions: 20 },
  { id: 7, name: 'Pooja Desai',   branch: 'mira-road', type: 'Gym', trainer: '—',              since: '2026-02-14', status: 'active',   phone: '+91 32109 87654', fee: '₹2,500/mo', nextPayment: '2026-06-14', sessions: 0 },
  { id: 8, name: 'Amit Joshi',    branch: 'kandivali', type: 'PT',  trainer: 'Karan Mehta',    since: '2026-03-01', status: 'active',   phone: '+91 21098 76543', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 24 },
];

function MemberDetail({ member, onBack, onLogPayment }) {
  const t = useT();
  const [activating, setActivating] = useState(false);
  return (
    <div>
      <button onClick={onBack} className={s.backBtn}>← Back to Members</button>
      <Card className={s.detailCard}>
        <div className={s.detailRow}>
          <div className={s.detailAvatar}>{member.name[0]}</div>
          <div className={s.detailHeadInfo}>
            <div className={s.detailNameRow}>
              <h2 className={s.detailName}>{member.name}</h2>
              <Badge label={member.type === 'PT' ? 'PT Member' : 'Gym Member'} color={member.type === 'PT' ? t.accent : t.ink3} bg={member.type === 'PT' ? t.accentTint : t.fillTint} />
              <Badge label={member.status === 'active' ? 'Active' : 'Inactive'} color={member.status === 'active' ? t.good : t.bad} bg={member.status === 'active' ? 'rgba(34,160,107,0.12)' : 'rgba(214,42,42,0.12)'} />
            </div>
            <div className={s.detailMeta}>{member.phone} · Member since {member.since}</div>
          </div>
        </div>
        <div className={s.detailFacts}>
          {[
            { label: 'Trainer',             value: member.trainer },
            { label: 'Fee',                 value: member.fee },
            { label: 'Next Payment',        value: member.nextPayment },
            { label: 'Sessions Completed',  value: member.sessions > 0 ? member.sessions : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className={s.factLabel}>{label}</div>
              <div className={s.factValue}>{value}</div>
            </div>
          ))}
        </div>
      </Card>
      <div className={s.detailActionRow}>
        <button onClick={() => onLogPayment(member)} className={s.actionBtnPrimary}>Log Payment</button>
        {member.type === 'Gym' && (
          <button onClick={() => setActivating(v => !v)} className={s.actionBtn}>Activate PT Membership</button>
        )}
        {member.status === 'inactive' && (
          <button className={`${s.actionBtn} ${s['actionBtn--good']}`}>Reactivate Membership</button>
        )}
      </div>
      {activating && (
        <Card className={s.activatePanel}>
          <div className={s.activateTitle}>Activate PT Membership</div>
          <div className={s.activateGrid}>
            <div>
              <label className={s.fieldLabel}>Assign Trainer</label>
              <select className={s.input}>
                <option>Priya Sharma</option><option>Rohit Malhotra</option><option>Ananya Iyer</option><option>Karan Mehta</option>
              </select>
            </div>
            <div>
              <label className={s.fieldLabel}>Start Date</label>
              <input type="date" defaultValue="2026-05-09" className={s.input} />
            </div>
          </div>
          <div className={s.activateBtnRow}>
            <button onClick={() => setActivating(false)} className={s.smallPrimary}>Confirm Activation</button>
            <button onClick={() => setActivating(false)} className={s.smallSecondary}>Cancel</button>
          </div>
        </Card>
      )}
    </div>
  );
}

function LogPaymentModal({ member, onClose }) {
  if (!member) return null;
  return (
    <div className={s.modalScrim} onClick={onClose}>
      <div className={s.modalCard} onClick={e => e.stopPropagation()}>
        <div className={s.modalTitle}>Log Payment</div>
        <div className={s.modalSub}>{member.name}</div>
        <div className={s.modalBody}>
          {[
            { label: 'Amount (₹)', type: 'number', defaultValue: member.type === 'PT' ? 8500 : 2500 },
            { label: 'Payment Date', type: 'date',   defaultValue: '2026-05-09' },
          ].map(({ label, type, defaultValue }) => (
            <div key={label}>
              <label className={s.fieldLabel}>{label}</label>
              <input type={type} defaultValue={defaultValue}
                className={`${s.input} ${s.inputModal} ${type === 'number' ? s.inputNum : ''}`} />
            </div>
          ))}
          <div>
            <label className={s.fieldLabel}>Mode</label>
            <select className={`${s.input} ${s.inputModal}`}>
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className={s.fieldLabel}>Notes (optional)</label>
            <input type="text" placeholder="e.g. May monthly fee" className={`${s.input} ${s.inputModal}`} />
          </div>
        </div>
        <div className={s.modalActions}>
          <button onClick={onClose} className={s.modalConfirm}>Confirm Payment</button>
          <button onClick={onClose} className={s.modalCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Members() {
  const t = useT();
  const { role } = useRole();
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [branch, setBranch]             = useState('all');
  const [selectedMember, setSelected]   = useState(null);
  const [paymentTarget, setPayTarget]   = useState(null);

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'pt'       && m.type === 'PT') ||
      (filter === 'gym'      && m.type === 'Gym') ||
      (filter === 'inactive' && m.status === 'inactive');
    const matchBranch = branch === 'all' || m.branch === branch;
    return matchSearch && matchFilter && matchBranch;
  });

  if (selectedMember) return (
    <div className={s.page}>
      <MemberDetail member={selectedMember} onBack={() => setSelected(null)} onLogPayment={setPayTarget} />
      <LogPaymentModal member={paymentTarget} onClose={() => setPayTarget(null)} />
    </div>
  );

  return (
    <div className={s.page}>
      <div className={s.pageHeaderRow}>
        <h1 className={s.pageTitle}>Members</h1>
        <button className={s.gradBtn}>+ Add Member</button>
      </div>
      {role === 'owner' && (
        <div className={s.branchRow}>
          {BRANCH_FILTERS.map(b => (
            <button key={b.id} onClick={() => setBranch(b.id)}
              className={`${s.branchChip} ${branch === b.id ? s['branchChip--active'] : ''}`}>
              {b.label}
            </button>
          ))}
        </div>
      )}
      <div className={s.searchRow}>
        <input
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={s.input}
        />
        {['all', 'pt', 'gym', 'inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`${s.filterChip} ${filter === f ? s['filterChip--active'] : ''}`}>
            {f === 'all' ? 'All' : f === 'pt' ? 'PT Members' : f === 'gym' ? 'Gym Only' : 'Inactive'}
          </button>
        ))}
      </div>
      <Card className={s.tableCard}>
        <table className={s.dataTable}>
          <thead>
            <tr>
              {['Name', 'Type', 'Trainer', 'Fee', 'Next Payment', 'Status', ''].map(h => (
                <th key={h} className={s.thMembers}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} className={s.tableRowClick} onClick={() => setSelected(m)}>
                <td>
                  <div className={s.memberCell}>
                    <div className={s.memberAvatar} style={{ opacity: 0.8 + (i % 3) * 0.07 }}>{m.name[0]}</div>
                    <div>
                      <div className={s.memberName}>{m.name}</div>
                      <div className={s.memberPhone}>{m.phone}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge label={m.type} color={m.type === 'PT' ? t.accent : t.ink3} bg={m.type === 'PT' ? t.accentTint : t.fillTint} />
                </td>
                <td className={s.memberTrainer}>{m.trainer}</td>
                <td className={s.memberFee}>{m.fee}</td>
                <td className={s.memberDate}>{m.nextPayment}</td>
                <td>
                  <Badge label={m.status === 'active' ? 'Active' : 'Inactive'} color={m.status === 'active' ? t.good : t.bad} bg={m.status === 'active' ? 'rgba(34,160,107,0.12)' : 'rgba(214,42,42,0.12)'} />
                </td>
                <td>
                  <button onClick={e => { e.stopPropagation(); setPayTarget(m); }} className={s.logBtn}>Log Payment</button>
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
    <div className={s.page}>
      <div className={s.pageHeaderRow}>
        <div>
          <h1 className={s.pageTitle}>Payment Log</h1>
          <p className={s.pageSub}>Collected this month: <span className={s.totalGood}>₹{total.toLocaleString('en-IN')}</span></p>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)} className={`${s.input} ${s.monthSelect}`}>
          <option>May 2026</option><option>April 2026</option><option>March 2026</option>
        </select>
      </div>
      <Card className={s.tableCard}>
        <table className={s.dataTable}>
          <thead>
            <tr>
              {['Ref', 'Member', 'Type', 'Amount', 'Date', 'Mode', 'Status'].map(h => (
                <th key={h} className={s.thMembers}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.id}>
                <td className={s.tdRef}>{p.id}</td>
                <td className={s.tdMember}>{p.member}</td>
                <td className={s.tdType}>{p.type}</td>
                <td className={s.tdAmount}>₹{p.amount.toLocaleString('en-IN')}</td>
                <td className={s.tdDate}>{p.date}</td>
                <td><Badge label={p.mode} color={t.ink2} bg={t.fillTint} /></td>
                <td>
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
  { name: 'Priya Sharma',   branch: 'kandivali', clients: 14, active: true,  speciality: 'Strength & Hypertrophy',  exp: '6 yrs', phone: '+91 98001 12345', expRating: 4.9, feedbackRating: 4.8, progressRating: 4.7 },
  { name: 'Rohit Malhotra', branch: 'kandivali', clients: 11, active: true,  speciality: 'Fat Loss & Conditioning', exp: '4 yrs', phone: '+91 97002 23456', expRating: 4.6, feedbackRating: 4.8, progressRating: 4.5 },
  { name: 'Ananya Iyer',    branch: 'borivali',  clients: 9,  active: true,  speciality: 'Functional Training',     exp: '3 yrs', phone: '+91 96003 34567', expRating: 4.3, feedbackRating: 4.7, progressRating: 4.4 },
  { name: 'Karan Mehta',    branch: 'mira-road', clients: 8,  active: true,  speciality: 'Powerlifting',            exp: '5 yrs', phone: '+91 95004 45678', expRating: 4.7, feedbackRating: 4.6, progressRating: 4.8 },
  { name: 'Divya Bose',     branch: 'borivali',  clients: 6,  active: false, speciality: 'Yoga & Mobility',         exp: '2 yrs', phone: '+91 94005 56789', expRating: 4.1, feedbackRating: 4.5, progressRating: 4.2 },
];

function ScoreRing({ label, value }) {
  const size = 60;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - (value / 5));
  return (
    <div className={s.scoreRing}>
      <div className={s.scoreRingWrap}>
        <svg width={size} height={size} className={s.scoreSvg}>
          <circle cx={size/2} cy={size/2} r={r} className={s.scoreTrack} strokeWidth={4} />
          <circle cx={size/2} cy={size/2} r={r} className={s.scoreFill}
            stroke="url(#rg)" strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={fill}
          />
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF9C66"/>
              <stop offset="100%" stopColor="#FF6A2C"/>
            </linearGradient>
          </defs>
        </svg>
        <div className={s.scoreCenter}>{value}</div>
      </div>
      <div className={s.scoreLabel}>{label}</div>
    </div>
  );
}

function Trainers() {
  const { role } = useRole();
  const [branch, setBranch] = useState('all');
  const filtered = TRAINERS.filter(tr => branch === 'all' || tr.branch === branch);
  return (
    <div className={s.page}>
      <div className={s.pageHeaderRow}>
        <h1 className={s.pageTitle}>Trainers</h1>
        <button className={s.gradBtn}>+ Add Trainer</button>
      </div>
      {role === 'owner' && (
        <div className={s.branchRow}>
          {BRANCH_FILTERS.map(b => (
            <button key={b.id} onClick={() => setBranch(b.id)}
              className={`${s.branchChip} ${branch === b.id ? s['branchChip--active'] : ''}`}>
              {b.label}
            </button>
          ))}
        </div>
      )}
      <div className={s.trainerGrid}>
        {filtered.map((tr, i) => (
          <Card key={i} className={s.trainerCard}>
            <div className={s.trainerHead}>
              <div className={s.trainerCardAvatar} style={{ opacity: 0.85 + i * 0.03 }}>{tr.name[0]}</div>
              <div>
                <div className={s.trainerCardName}>{tr.name}</div>
                <div className={s.trainerStatusRow}>
                  <div className={`${s.statusDot} ${!tr.active ? s['statusDot--inactive'] : ''}`} />
                  <span className={`${s.statusLabel} ${!tr.active ? s['statusLabel--inactive'] : ''}`}>{tr.active ? 'Active' : 'On Leave'}</span>
                </div>
              </div>
            </div>
            <div className={s.trainerSpec}>{tr.speciality}</div>
            <div className={s.trainerExp}>{tr.exp} · {tr.phone}</div>
            <div className={s.scoreRow}>
              <ScoreRing label="Experience"  value={tr.expRating} />
              <ScoreRing label="Feedback"    value={tr.feedbackRating} />
              <ScoreRing label="Progress"    value={tr.progressRating} />
            </div>
            <div className={s.trainerFooter}>
              <div>
                <div className={s.trainerCount}>{tr.clients}</div>
                <div className={s.trainerCountLabel}>active clients</div>
              </div>
              <button className={s.viewProfileBtn}>View Profile</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function DashIcon({ active }) {
  const c = active ? '#FF6A2C' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={1} width={6} height={6} rx={2} fill={c} opacity={active ? 1 : 0.5}/>
    <rect x={11} y={1} width={6} height={6} rx={2} fill={c} opacity={active ? 0.6 : 0.3}/>
    <rect x={1} y={11} width={6} height={6} rx={2} fill={c} opacity={active ? 0.6 : 0.3}/>
    <rect x={11} y={11} width={6} height={6} rx={2} fill={c} opacity={active ? 0.4 : 0.2}/>
  </svg>;
}
function MembersIcon({ active }) {
  const c = active ? '#FF6A2C' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <circle cx={7} cy={6} r={3.5} stroke={c} strokeWidth={1.5}/>
    <path d="M1 15c0-3 2.7-5 6-5s6 2 6 5" stroke={c} strokeWidth={1.5} strokeLinecap="round"/>
    <circle cx={14} cy={7} r={2.5} stroke={c} strokeWidth={1.5} opacity={0.6}/>
    <path d="M17 15c0-2-1.3-3.5-3-3.5" stroke={c} strokeWidth={1.5} strokeLinecap="round" opacity={0.6}/>
  </svg>;
}
function PayIcon({ active }) {
  const c = active ? '#FF6A2C' : 'currentColor';
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={4} width={16} height={11} rx={2.5} stroke={c} strokeWidth={1.5}/>
    <path d="M1 8h16" stroke={c} strokeWidth={1.5}/>
    <rect x={3} y={11} width={4} height={1.5} rx={0.75} fill={c}/>
  </svg>;
}
function TrainerIcon({ active }) {
  const c = active ? '#FF6A2C' : 'currentColor';
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
  const themeAttr = t === TOKENS.light ? 'light' : 'dark';

  return (
    <ThemeCtx.Provider value={t}>
      <RoleCtx.Provider value={{ role, setRole }}>
        <div data-theme={themeAttr} className={s.shell}>
          <Sidebar active={page} onNav={setPage} />
          <div className={s.main}>
            <Page />
          </div>
        </div>
      </RoleCtx.Provider>
    </ThemeCtx.Provider>
  );
}
