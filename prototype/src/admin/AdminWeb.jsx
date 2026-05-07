import { useState } from 'react';
import { TOKENS, FONT } from '../tokens';

const t = TOKENS.light;

// ─── Mini Components ─────────────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
    { id: 'members', label: 'Members', icon: MembersIcon },
    { id: 'payments', label: 'Payments', icon: PayIcon },
    { id: 'trainers', label: 'Trainers', icon: TrainerIcon },
  ];
  return (
    <div style={{
      width: 220, background: '#0E0E10', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#FF6B4A,#E11D48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity={0.9}/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#F5F4F2', fontFamily: FONT.display, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>GYM CULTURE</div>
            <div style={{ color: 'rgba(235,235,245,0.4)', fontFamily: FONT.ui, fontSize: 11, marginTop: 1 }}>Admin Portal</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNav(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isActive ? 'rgba(225,29,72,0.15)' : 'transparent',
              color: isActive ? '#FF4664' : 'rgba(235,235,245,0.5)',
              fontFamily: FONT.ui, fontSize: 14, fontWeight: isActive ? 600 : 400,
              marginBottom: 2, transition: 'all 0.15s',
              textAlign: 'left',
            }}>
              <Icon active={isActive} />
              {label}
            </button>
          );
        })}
      </nav>
      {/* Branch */}
      <div style={{ padding: '16px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ color: 'rgba(235,235,245,0.4)', fontFamily: FONT.ui, fontSize: 11, marginBottom: 4 }}>CURRENT BRANCH</div>
          <div style={{ color: '#F5F4F2', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>Andheri West</div>
          <div style={{ color: 'rgba(235,235,245,0.4)', fontFamily: FONT.ui, fontSize: 11, marginTop: 2 }}>Mumbai · Active</div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, trend, color }) {
  const up = trend >= 0;
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '1px solid rgba(60,60,67,0.1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          background: up ? 'rgba(34,160,107,0.1)' : 'rgba(214,42,42,0.1)',
          color: up ? t.good : t.bad,
          borderRadius: 6, padding: '2px 6px',
          fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
        }}>
          {up ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12 }}>{sub}</span>
      </div>
    </div>
  );
}

function RevenueChart() {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const values = [3.2, 4.1, 3.8, 4.9, 5.2, 6.1];
  const max = 7;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid rgba(60,60,67,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600 }}>Revenue</div>
          <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13, marginTop: 2 }}>Monthly collection (₹ lakhs)</div>
        </div>
        <div style={{
          background: t.accentTint, color: t.accent, borderRadius: 8, padding: '4px 10px',
          fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
        }}>+17.3% YoY</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: '100%', borderRadius: '6px 6px 0 0',
              height: `${(v / max) * 100}%`,
              background: i === values.length - 1 ? t.gradient : 'rgba(60,60,67,0.08)',
              transition: 'height 0.3s',
            }} />
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 11 }}>{months[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTrainers() {
  const trainers = [
    { name: 'Priya Sharma', clients: 14, revenue: '₹1,12,000', rating: 4.9 },
    { name: 'Rohit Malhotra', clients: 11, revenue: '₹88,000', rating: 4.8 },
    { name: 'Ananya Iyer', clients: 9, revenue: '₹72,000', rating: 4.7 },
    { name: 'Karan Mehta', clients: 8, revenue: '₹64,000', rating: 4.6 },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid rgba(60,60,67,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Trainers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {trainers.map((tr, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: `hsl(${i * 60 + 10},60%,85%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT.ui, fontSize: 13, fontWeight: 700,
              color: `hsl(${i * 60 + 10},50%,35%)`,
            }}>{tr.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 13, fontWeight: 600 }}>{tr.name}</div>
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12 }}>{tr.clients} clients · ★ {tr.rating}</div>
            </div>
            <div style={{ color: t.ink2, fontFamily: FONT.mono, fontSize: 13, fontWeight: 600 }}>{tr.revenue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  const items = [
    { type: 'new_member', text: 'Sneha Kapoor joined as PT member', time: '2m ago', dot: t.good },
    { type: 'payment', text: 'Payment ₹8,500 logged for Arjun Singh', time: '18m ago', dot: t.accent },
    { type: 'session', text: 'Rohit Malhotra completed session with Meera', time: '1h ago', dot: t.ink4 },
    { type: 'new_member', text: 'Vikram Nair joined as gym member', time: '3h ago', dot: t.good },
    { type: 'payment', text: 'Membership renewed for Divya Rao', time: '5h ago', dot: t.accent },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid rgba(60,60,67,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? `1px solid ${t.sep}` : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: t.ink2, fontFamily: FONT.ui, fontSize: 13 }}>{item.text}</div>
            </div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, flexShrink: 0 }}>{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Andheri West Branch</h1>
        <p style={{ margin: '4px 0 0', fontFamily: FONT.ui, fontSize: 14, color: t.ink3 }}>Thursday, 8 May 2026 · All figures for current month</p>
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
  { id: 1, name: 'Sneha Kapoor', type: 'PT', trainer: 'Priya Sharma', since: '2025-11-01', status: 'active', phone: '+91 98765 43210', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 48 },
  { id: 2, name: 'Arjun Singh', type: 'PT', trainer: 'Rohit Malhotra', since: '2025-09-15', status: 'active', phone: '+91 87654 32109', fee: '₹8,500/mo', nextPayment: '2026-05-15', sessions: 72 },
  { id: 3, name: 'Meera Pillai', type: 'PT', trainer: 'Rohit Malhotra', since: '2026-01-10', status: 'active', phone: '+91 76543 21098', fee: '₹8,500/mo', nextPayment: '2026-06-10', sessions: 32 },
  { id: 4, name: 'Vikram Nair', type: 'Gym', trainer: '—', since: '2026-04-01', status: 'active', phone: '+91 65432 10987', fee: '₹2,500/mo', nextPayment: '2026-06-01', sessions: 0 },
  { id: 5, name: 'Divya Rao', type: 'Gym', trainer: '—', since: '2025-08-20', status: 'active', phone: '+91 54321 09876', fee: '₹2,500/mo', nextPayment: '2026-05-20', sessions: 0 },
  { id: 6, name: 'Rahul Verma', type: 'PT', trainer: 'Ananya Iyer', since: '2025-12-05', status: 'inactive', phone: '+91 43210 98765', fee: '₹8,500/mo', nextPayment: '—', sessions: 20 },
  { id: 7, name: 'Pooja Desai', type: 'Gym', trainer: '—', since: '2026-02-14', status: 'active', phone: '+91 32109 87654', fee: '₹2,500/mo', nextPayment: '2026-06-14', sessions: 0 },
  { id: 8, name: 'Amit Joshi', type: 'PT', trainer: 'Karan Mehta', since: '2026-03-01', status: 'active', phone: '+91 21098 76543', fee: '₹8,500/mo', nextPayment: '2026-06-01', sessions: 24 },
];

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, borderRadius: 6, padding: '2px 8px',
      fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
    }}>{label}</span>
  );
}

function MemberDetail({ member, onBack, onLogPayment }) {
  const [activating, setActivating] = useState(false);
  return (
    <div>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        cursor: 'pointer', color: t.accent, fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
        padding: '0 0 20px', marginBottom: 4,
      }}>← Back to Members</button>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px', border: '1px solid rgba(60,60,67,0.1)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#FF6B4A,#E11D48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT.display, fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{member.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink }}>{member.name}</h2>
              <Badge label={member.type === 'PT' ? 'PT Member' : 'Gym Member'} color={member.type === 'PT' ? t.accent : t.ink3} bg={member.type === 'PT' ? t.accentTint : t.fillTint} />
              <Badge label={member.status === 'active' ? 'Active' : 'Inactive'} color={member.status === 'active' ? t.good : t.bad} bg={member.status === 'active' ? 'rgba(34,160,107,0.1)' : 'rgba(214,42,42,0.1)'} />
            </div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 14 }}>{member.phone} · Member since {member.since}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${t.sep}` }}>
          {[
            { label: 'Trainer', value: member.trainer },
            { label: 'Fee', value: member.fee },
            { label: 'Next Payment', value: member.nextPayment },
            { label: 'Sessions Completed', value: member.sessions > 0 ? member.sessions : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              <div style={{ color: t.ink, fontFamily: FONT.ui, fontSize: 15, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => onLogPayment(member)} style={{
          padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.gradient, color: '#fff',
          fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
        }}>Log Payment</button>
        {member.type === 'Gym' && (
          <button onClick={() => setActivating(true)} style={{
            padding: '12px 20px', borderRadius: 12, border: `1px solid ${t.sep}`, cursor: 'pointer',
            background: '#fff', color: t.ink,
            fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
          }}>Activate PT Membership</button>
        )}
        {member.status === 'inactive' && (
          <button style={{
            padding: '12px 20px', borderRadius: 12, border: `1px solid ${t.sep}`, cursor: 'pointer',
            background: '#fff', color: t.good,
            fontFamily: FONT.ui, fontSize: 14, fontWeight: 500,
          }}>Reactivate Membership</button>
        )}
      </div>
      {activating && (
        <div style={{
          marginTop: 16, background: '#fff', borderRadius: 16, padding: '24px',
          border: `1px solid ${t.accentRing}`,
        }}>
          <div style={{ color: t.ink, fontFamily: FONT.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Activate PT Membership</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Assign Trainer</label>
              <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14, color: t.ink }}>
                <option>Priya Sharma</option><option>Rohit Malhotra</option><option>Ananya Iyer</option><option>Karan Mehta</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Start Date</label>
              <input type="date" defaultValue="2026-05-08" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14, color: t.ink, boxSizing: 'border-box' }} />
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
        </div>
      )}
    </div>
  );
}

function LogPaymentModal({ member, onClose }) {
  if (!member) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px', width: 420,
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: t.ink, marginBottom: 4 }}>Log Payment</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 14, color: t.ink3, marginBottom: 24 }}>{member.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Amount (₹)</label>
            <input type="number" defaultValue={member.type === 'PT' ? 8500 : 2500} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${t.sep}`, fontFamily: FONT.mono, fontSize: 16, color: t.ink, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Payment Date</label>
            <input type="date" defaultValue="2026-05-08" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14, color: t.ink, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Mode</label>
            <select style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14, color: t.ink }}>
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: t.ink3, fontFamily: FONT.ui, fontSize: 12, marginBottom: 6 }}>Notes (optional)</label>
            <input type="text" placeholder="e.g. May monthly fee" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${t.sep}`, fontFamily: FONT.ui, fontSize: 14, color: t.ink, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'pt' && m.type === 'PT') || (filter === 'gym' && m.type === 'Gym') || (filter === 'inactive' && m.status === 'inactive');
    return matchSearch && matchFilter;
  });

  if (selectedMember) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 900 }}>
        <MemberDetail member={selectedMember} onBack={() => setSelectedMember(null)} onLogPayment={setPaymentTarget} />
        <LogPaymentModal member={paymentTarget} onClose={() => setPaymentTarget(null)} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
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
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 12, border: `1px solid ${t.sep}`,
            fontFamily: FONT.ui, fontSize: 14, color: t.ink, outline: 'none',
            background: '#fff',
          }}
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
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(60,60,67,0.1)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
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
              <tr key={m.id} style={{ borderTop: `1px solid ${t.sep}`, cursor: 'pointer' }} onClick={() => setSelectedMember(m)}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `hsl(${i * 47 + 20},55%,85%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FONT.ui, fontSize: 13, fontWeight: 700,
                      color: `hsl(${i * 47 + 20},45%,35%)`,
                    }}>{m.name[0]}</div>
                    <div>
                      <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink }}>{m.name}</div>
                      <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3 }}>{m.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={m.type === 'PT' ? 'PT' : 'Gym'} color={m.type === 'PT' ? t.accent : t.ink3} bg={m.type === 'PT' ? t.accentTint : t.fillTint} />
                </td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 14, color: t.ink2 }}>{m.trainer}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{m.fee}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink3 }}>{m.nextPayment}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={m.status === 'active' ? 'Active' : 'Inactive'} color={m.status === 'active' ? t.good : t.bad} bg={m.status === 'active' ? 'rgba(34,160,107,0.1)' : 'rgba(214,42,42,0.1)'} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={e => { e.stopPropagation(); setPaymentTarget(m); }} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: t.accentTint, color: t.accent, fontFamily: FONT.ui, fontSize: 12, fontWeight: 600,
                  }}>Log Payment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LogPaymentModal member={paymentTarget} onClose={() => setPaymentTarget(null)} />
    </div>
  );
}

// ─── Payments ─────────────────────────────────────────────────────────────────

const PAYMENTS = [
  { id: 'P001', member: 'Arjun Singh', type: 'PT Monthly', amount: 8500, date: '2026-05-08', mode: 'UPI', status: 'confirmed' },
  { id: 'P002', member: 'Sneha Kapoor', type: 'PT Monthly', amount: 8500, date: '2026-05-07', mode: 'Cash', status: 'confirmed' },
  { id: 'P003', member: 'Divya Rao', type: 'Gym Renewal', amount: 2500, date: '2026-05-06', mode: 'UPI', status: 'confirmed' },
  { id: 'P004', member: 'Amit Joshi', type: 'PT Monthly', amount: 8500, date: '2026-05-05', mode: 'Card', status: 'confirmed' },
  { id: 'P005', member: 'Pooja Desai', type: 'Gym Monthly', amount: 2500, date: '2026-05-04', mode: 'UPI', status: 'confirmed' },
  { id: 'P006', member: 'Meera Pillai', type: 'PT Monthly', amount: 8500, date: '2026-05-03', mode: 'Cash', status: 'confirmed' },
  { id: 'P007', member: 'Vikram Nair', type: 'Gym Joining', amount: 5000, date: '2026-04-30', mode: 'UPI', status: 'confirmed' },
  { id: 'P008', member: 'Rahul Verma', type: 'PT Monthly', amount: 8500, date: '2026-04-28', mode: 'Bank Transfer', status: 'pending' },
];

function Payments() {
  const [month, setMonth] = useState('May 2026');
  const total = PAYMENTS.filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Payment Log</h1>
          <p style={{ margin: '4px 0 0', fontFamily: FONT.ui, fontSize: 14, color: t.ink3 }}>Collected this month: <span style={{ color: t.good, fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</span></p>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{
          padding: '10px 16px', borderRadius: 12, border: `1px solid ${t.sep}`,
          fontFamily: FONT.ui, fontSize: 14, color: t.ink, background: '#fff', cursor: 'pointer',
        }}>
          <option>May 2026</option><option>April 2026</option><option>March 2026</option>
        </select>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(60,60,67,0.1)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.bgGrouped }}>
              {['Ref', 'Member', 'Type', 'Amount', 'Date', 'Mode', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p, i) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${t.sep}` }}>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{p.id}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 500, color: t.ink }}>{p.member}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink2 }}>{p.type}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: t.ink }}>₹{p.amount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 16px', fontFamily: FONT.ui, fontSize: 13, color: t.ink3 }}>{p.date}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={p.mode} color={t.ink2} bg={t.fillTint} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={p.status === 'confirmed' ? 'Confirmed' : 'Pending'} color={p.status === 'confirmed' ? t.good : t.warn} bg={p.status === 'confirmed' ? 'rgba(34,160,107,0.1)' : 'rgba(224,134,0,0.1)'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Trainers ─────────────────────────────────────────────────────────────────

const TRAINERS = [
  { name: 'Priya Sharma', clients: 14, active: true, speciality: 'Strength & Hypertrophy', exp: '6 yrs', phone: '+91 98001 12345' },
  { name: 'Rohit Malhotra', clients: 11, active: true, speciality: 'Fat Loss & Conditioning', exp: '4 yrs', phone: '+91 97002 23456' },
  { name: 'Ananya Iyer', clients: 9, active: true, speciality: 'Functional Training', exp: '3 yrs', phone: '+91 96003 34567' },
  { name: 'Karan Mehta', clients: 8, active: true, speciality: 'Powerlifting', exp: '5 yrs', phone: '+91 95004 45678' },
  { name: 'Divya Bose', clients: 6, active: false, speciality: 'Yoga & Mobility', exp: '2 yrs', phone: '+91 94005 56789' },
];

function Trainers() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, color: t.ink, letterSpacing: '-0.5px' }}>Trainers</h1>
        <button style={{
          padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
        }}>+ Add Trainer</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {TRAINERS.map((tr, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid rgba(60,60,67,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, background: `hsl(${i * 60 + 10},55%,85%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT.display, fontSize: 18, fontWeight: 700,
                color: `hsl(${i * 60 + 10},45%,35%)`, flexShrink: 0,
              }}>{tr.name[0]}</div>
              <div>
                <div style={{ fontFamily: FONT.ui, fontSize: 15, fontWeight: 700, color: t.ink }}>{tr.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tr.active ? t.good : t.ink4 }} />
                  <span style={{ fontFamily: FONT.ui, fontSize: 12, color: tr.active ? t.good : t.ink3 }}>{tr.active ? 'Active' : 'On Leave'}</span>
                </div>
              </div>
            </div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 13, marginBottom: 4 }}>{tr.speciality}</div>
            <div style={{ color: t.ink3, fontFamily: FONT.ui, fontSize: 12 }}>{tr.exp} experience · {tr.phone}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Icon components ──────────────────────────────────────────────────────

function DashIcon({ active }) {
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={1} width={6} height={6} rx={2} fill={active ? '#FF4664' : 'currentColor'} opacity={active ? 1 : 0.5}/>
    <rect x={11} y={1} width={6} height={6} rx={2} fill={active ? '#FF4664' : 'currentColor'} opacity={active ? 0.6 : 0.3}/>
    <rect x={1} y={11} width={6} height={6} rx={2} fill={active ? '#FF4664' : 'currentColor'} opacity={active ? 0.6 : 0.3}/>
    <rect x={11} y={11} width={6} height={6} rx={2} fill={active ? '#FF4664' : 'currentColor'} opacity={active ? 0.4 : 0.2}/>
  </svg>;
}

function MembersIcon({ active }) {
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <circle cx={7} cy={6} r={3.5} stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5}/>
    <path d="M1 15c0-3 2.7-5 6-5s6 2 6 5" stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5} strokeLinecap="round"/>
    <circle cx={14} cy={7} r={2.5} stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5} opacity={0.6}/>
    <path d="M17 15c0-2-1.3-3.5-3-3.5" stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5} strokeLinecap="round" opacity={0.6}/>
  </svg>;
}

function PayIcon({ active }) {
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <rect x={1} y={4} width={16} height={11} rx={2.5} stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5}/>
    <path d="M1 8h16" stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5}/>
    <rect x={3} y={11} width={4} height={1.5} rx={0.75} fill={active ? '#FF4664' : 'currentColor'}/>
  </svg>;
}

function TrainerIcon({ active }) {
  return <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <path d="M2 9h3l2-5 3 9 2-4h4" stroke={active ? '#FF4664' : 'currentColor'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function AdminWeb() {
  const [page, setPage] = useState('dashboard');

  const pages = { dashboard: Dashboard, members: Members, payments: Payments, trainers: Trainers };
  const Page = pages[page] || Dashboard;

  return (
    <div style={{ display: 'flex', height: '100%', background: t.bgGrouped, fontFamily: FONT.ui }}>
      <Sidebar active={page} onNav={setPage} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Page />
      </div>
    </div>
  );
}
