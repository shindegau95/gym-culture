import { useState, useEffect } from 'react';
import { FONT } from '../tokens';
import { Icon, Avatar, TopBar, IconBtn, Card, SectionLabel, Chip, Numeric, RingProgress, BottomTabBar, ProgressBar } from '../components/Primitives';

const SESSIONS = [
  { time: '07:00', name: 'Aarav Mehta',  plan: 'Push · Wk 4 · Day 2',            status: 'done',     dur: '52 min', initials: 'AM', restDay: false },
  { time: '09:30', name: 'Priya Shah',   plan: 'Lower Body · Hypertrophy',         status: 'live',     dur: '00:42',  initials: 'PS', restDay: false,
    collision: { name: 'Karan Singh', initials: 'KS' } },
  { time: '11:00', name: 'Rohan Verma',  plan: 'Pull · Strength Block',            status: 'next',     dur: '60 min', initials: 'RV', restDay: false },
  { time: '14:00', name: 'Saanvi Desai', plan: 'Active recovery · Mobility',       status: 'upcoming', dur: '30 min', initials: 'SD', restDay: true },
  { time: '16:00', name: 'Neha Iyer',    plan: 'Conditioning · HIIT',              status: 'upcoming', dur: '45 min', initials: 'NI', restDay: false },
  { time: '18:30', name: 'Aman Thakur',  plan: 'Push · Wk 3 · Day 1',             status: 'upcoming', dur: '60 min', initials: 'AT', restDay: false },
];

const CLIENTS = [
  { name: 'Aarav Mehta',  goal: 'Muscle Gain',   adherence: 94, initials: 'AM', plan: 'PPL — Wk 4',      flagged: false, new: false,  weight: [78,78.5,79,79.2,79.8,80], bench: [70,75,80,82.5,85,87.5] },
  { name: 'Priya Shah',   goal: 'Fat Loss',       adherence: 88, initials: 'PS', plan: 'Hypertrophy',     flagged: false, new: false,  weight: [65,64.5,64,63.8,63.5,63.2], bench: [30,32.5,35,35,37.5,40] },
  { name: 'Rohan Verma',  goal: 'Strength',       adherence: 76, initials: 'RV', plan: 'Strength block',  flagged: true,  new: false,  weight: [85,85,85.5,86,86,86.5], bench: [80,85,90,90,92.5,95] },
  { name: 'Saanvi Desai', goal: 'Body Recomp',    adherence: 91, initials: 'SD', plan: 'Recomp — Wk 2',   flagged: false, new: false,  weight: [58,57.8,57.5,57.3,57,56.8], bench: [20,22.5,25,25,27.5,30] },
  { name: 'Neha Iyer',    goal: 'Endurance',      adherence: 82, initials: 'NI', plan: 'Conditioning',    flagged: false, new: true,   weight: [70,70,69.8,69.5,69.2,69], bench: [40,42.5,45,45,47.5,50] },
  { name: 'Aman Thakur',  goal: 'Muscle Gain',   adherence: 95, initials: 'AT', plan: 'Bulk block',      flagged: false, new: false,  weight: [72,72.5,73,73.5,74,74.5], bench: [60,65,67.5,70,72.5,75] },
];

// ─── Home / Today ─────────────────────────────────────────────────────────────
function TrainerHome({ t, onSession }) {
  const [focused, setFocused] = useState(1);
  const [query, setQuery] = useState('');
  const [collisionOpen, setCollisionOpen] = useState(false);
  const fc = SESSIONS[focused];

  const dotColor = (s) => {
    if (s.restDay) return t.ink3;
    if (s.status === 'live') return t.accent;
    if (s.status === 'done') return t.good;
    if (s.status === 'next') return t.accent;
    return t.ink4;
  };

  const filtered = SESSIONS.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t}
        subtitle="Thursday · May 1"
        title="Today"
        leading={<Avatar initials="VK" size={32} t={t} ring/>}
        trailing={<><IconBtn name="search" t={t}/><IconBtn name="bell" t={t}/></>}
      />

      {/* Client switcher */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.bgElevated, border: `0.5px solid ${t.sep}`, borderRadius: 14, padding: '6px 6px 6px 10px' }}>
          <Icon name="search" size={15} color={t.ink3}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search client…"
            style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontFamily: FONT.ui, fontSize: 13, color: t.ink, padding: '4px 0' }}/>
          <div style={{ display: 'flex', gap: 4, overflow: 'hidden', maxWidth: 160 }}>
            {SESSIONS.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6).map((s) => {
              const idx = SESSIONS.indexOf(s);
              const isActive = idx === focused;
              return (
                <button key={s.time} onClick={() => setFocused(idx)} style={{ position: 'relative', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                  <Avatar initials={s.initials} size={30} t={t} ring={isActive}/>
                  {s.status === 'live' && <span style={{ position: 'absolute', right: -1, top: -1, width: 8, height: 8, borderRadius: '50%', background: t.accent, border: `2px solid ${t.bgElevated}` }}/>}
                  {s.restDay && <span style={{ position: 'absolute', right: -1, top: -1, width: 8, height: 8, borderRadius: '50%', background: t.ink3, border: `2px solid ${t.bgElevated}` }}/>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero ring */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card t={t} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {fc.restDay ? (
            <div style={{ width: 100, height: 100, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
              <svg width={100} height={100}><circle cx={50} cy={50} r={44} stroke={t.fillTint} strokeWidth={10} fill="none" strokeDasharray="4 7"/></svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Icon name="moon" size={24} color={t.ink2}/>
                <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>Rest</span>
              </div>
            </div>
          ) : (
            <RingProgress value={fc.status === 'done' ? 100 : fc.status === 'live' ? 65 : 0} size={100} stroke={10} t={t}>
              {fc.status === 'done' ? (
                <><Icon name="check" size={28} color={t.good}/><span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.good, textTransform: 'uppercase', letterSpacing: 0.5 }}>Done</span></>
              ) : fc.status === 'live' ? (
                <><Numeric value="00:42" t={t} size={18}/><span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>● Live</span></>
              ) : (
                <><Numeric value={fc.time} t={t} size={16}/><span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Up next</span></>
              )}
            </RingProgress>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{fc.restDay ? 'Rest day' : 'Focused client'}</div>
            <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: t.ink, letterSpacing: -0.4, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fc.name}</div>
            <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3, marginTop: 2, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fc.plan}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              {[{ l: 'Sessions', v: '6' }, { l: 'Active', v: '24' }, { l: 'Adherence', v: '87%' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 600, color: t.ink }}>{s.v}</div>
                  <div style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Schedule */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t} action="See all">Schedule</SectionLabel>
        <Card t={t} padding={0}>
          {SESSIONS.map((s, i) => {
            const isFocused = i === focused;
            return (
              <div key={s.time} style={{ borderBottom: i === SESSIONS.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
                <div onClick={() => setFocused(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', cursor: 'pointer',
                  background: isFocused ? t.gradientSoft : 'transparent', position: 'relative',
                }}>
                  {isFocused && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: '0 2px 2px 0', background: t.gradient }}/>}
                  <div style={{ width: 44, textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: t.ink }}>{s.time}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 10, color: t.ink3 }}>{s.dur}</div>
                  </div>
                  <div style={{ width: 1, alignSelf: 'stretch', background: t.sep, position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', left: -3, top: 6, width: 7, height: 7, borderRadius: '50%', background: dotColor(s), boxShadow: s.status === 'live' ? `0 0 0 3px ${t.accentRing}` : 'none' }}/>
                  </div>
                  <div style={{ position: 'relative', width: s.collision ? 46 : 32, height: 32, flexShrink: 0 }}>
                    <Avatar initials={s.initials} size={32} t={t}/>
                    {s.collision && <div style={{ position: 'absolute', left: 16, top: 0 }}><Avatar initials={s.collision.initials} size={32} t={t} color={t.fillTint}/></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                      {s.collision && <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.warn, background: 'rgba(224,134,0,0.12)', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase' }}>+1</span>}
                      {s.restDay && <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, background: t.fillTint, padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase' }}>Rest</span>}
                    </div>
                    <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 1, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.plan}</div>
                  </div>
                  {s.status === 'live' ? (
                    <button onClick={(e) => { e.stopPropagation(); onSession(s); }} style={{ padding: '5px 10px', borderRadius: 999, background: t.gradient, color: '#fff', fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }}/>Live
                    </button>
                  ) : s.status === 'done' ? (
                    <Icon name="check" size={17} color={t.good}/>
                  ) : (
                    <Icon name="chevronR" size={15} color={t.ink4}/>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t}>Quick actions</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'plus',     label: 'New plan',   sub: 'Build from template' },
            { icon: 'people',   label: 'Add client', sub: 'QR onboarding' },
            { icon: 'sparkles', label: 'AI diet',    sub: 'Generate macros' },
            { icon: 'chart',    label: 'Reports',    sub: 'Weekly summary' },
          ].map(a => (
            <Card key={a.label} t={t} padding={14} style={{ cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: t.gradientSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon name={a.icon} size={18} color={t.accent}/>
              </div>
              <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink }}>{a.label}</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 2 }}>{a.sub}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Clients ─────────────────────────────────────────────────────────────────
function ClientDetail({ client, t, onBack }) {
  const [dtab, setDtab] = useState('overview');
  const miniChart = (data, color) => {
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 280 + 4;
      const y = 64 - 4 - ((v - min) / (max - min || 1)) * 52;
      return [x, y];
    });
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return (
      <svg viewBox="0 0 288 68" preserveAspectRatio="none" style={{ width: '100%', height: 68, display: 'block' }}>
        <path d={`${path} L284,68 L4,68 Z`} fill={color} fillOpacity="0.1"/>
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"/>
      </svg>
    );
  };
  return (
    <div style={{ paddingBottom: 100, background: t.bg }}>
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 0, color: t.accent, fontFamily: FONT.ui, fontSize: 15, fontWeight: 590, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="chevronL" size={18} color={t.accent}/> Clients
        </button>
      </div>
      {/* Profile header */}
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar initials={client.initials} size={56} t={t}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink, letterSpacing: -0.5 }}>{client.name}</div>
          <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, marginTop: 2 }}>{client.goal} · {client.plan}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700, color: client.adherence >= 85 ? t.good : client.adherence >= 70 ? t.warn : t.bad }}>{client.adherence}%</span>
            <span style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3 }}>adherence</span>
            {client.flagged && <Chip t={t}>⚑ Flagged</Chip>}
            {client.new && <Chip t={t} accent>New</Chip>}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', padding: '14px 16px 0', gap: 0, borderBottom: `0.5px solid ${t.sep}` }}>
        {['overview','workout','diet'].map(tab => (
          <button key={tab} onClick={() => setDtab(tab)} style={{
            flex: 1, padding: '8px 0', background: 'transparent', border: 0, cursor: 'pointer',
            borderBottom: dtab === tab ? `2px solid ${t.accent}` : '2px solid transparent',
            fontFamily: FONT.ui, fontSize: 13, fontWeight: dtab === tab ? 700 : 500,
            color: dtab === tab ? t.accent : t.ink3, textTransform: 'capitalize',
          }}>{tab}</button>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        {dtab === 'overview' && (
          <>
            <SectionLabel t={t}>Body weight (6 weeks)</SectionLabel>
            <Card t={t} padding={14}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Numeric value={`${client.weight[client.weight.length - 1]}`} unit="kg" t={t} size={22}/>
                <span style={{ fontFamily: FONT.ui, fontSize: 13, color: t.good, fontWeight: 600 }}>
                  {client.weight[client.weight.length-1] < client.weight[0] ? '↓' : '↑'} {Math.abs(client.weight[client.weight.length-1] - client.weight[0]).toFixed(1)} kg
                </span>
              </div>
              {miniChart(client.weight, t.good)}
            </Card>
            <SectionLabel t={t}>Bench press (6 weeks)</SectionLabel>
            <Card t={t} padding={14}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Numeric value={`${client.bench[client.bench.length - 1]}`} unit="kg" t={t} size={22}/>
                <span style={{ fontFamily: FONT.ui, fontSize: 13, color: t.accent, fontWeight: 600 }}>↑ {(client.bench[client.bench.length-1] - client.bench[0]).toFixed(1)} kg</span>
              </div>
              {miniChart(client.bench, t.accent)}
            </Card>
          </>
        )}
        {dtab === 'workout' && (
          <>
            <SectionLabel t={t}>Current plan — {client.plan}</SectionLabel>
            <Card t={t} padding={0}>
              {[['Mon','Push · Chest, Shoulders, Tri','6 ex'],['Tue','Pull · Back, Biceps','5 ex'],['Wed','Legs · Quad focus','6 ex'],['Thu','Rest · Mobility','3 ex'],['Fri','Push · Chest, Triceps','6 ex'],['Sat','Pull · Back, Biceps','5 ex'],['Sun','Rest · Active recovery','2 ex']].map(([d,n,c], i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
                  <span style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', width: 28 }}>{d}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink }}>{n}</div>
                    <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3 }}>{c}</div>
                  </div>
                  <Icon name="chevronR" size={14} color={t.ink4}/>
                </div>
              ))}
            </Card>
          </>
        )}
        {dtab === 'diet' && (
          <>
            <SectionLabel t={t}>Nutrition plan</SectionLabel>
            <Card t={t} padding={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>Daily target</div>
                  <Numeric value="2,400" unit="kcal" t={t} size={22}/>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[['185g','Protein',t.accent],['260g','Carbs',t.warn],['68g','Fat',t.good]].map(([v,l,c]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                      <div style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink3, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '12px 0 0', borderTop: `0.5px solid ${t.sep}` }}>
                <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Meals</div>
                {['Breakfast · 500kcal','Pre-workout · 240kcal','Lunch · 720kcal','Post-workout · 340kcal','Dinner · 600kcal'].map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < 4 ? `0.5px solid ${t.sep}` : 'none' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent, flexShrink: 0 }}/>
                    <span style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink, flex: 1 }}>{m.split(' · ')[0]}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>{m.split(' · ')[1]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function TrainerClients({ t }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  if (selected) return <ClientDetail client={selected} t={t} onBack={() => setSelected(null)}/>;

  const filtered = CLIENTS.filter(c => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'flagged' && !c.flagged) return false;
    if (filter === 'new' && !c.new) return false;
    return true;
  });

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t} subtitle={`${CLIENTS.length} active clients`} title="Clients" trailing={<IconBtn name="plus" t={t}/>}/>
      <div style={{ padding: '0 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.bgElevated, border: `0.5px solid ${t.sep}`, borderRadius: 12, padding: '8px 12px', marginBottom: 10 }}>
          <Icon name="search" size={15} color={t.ink3}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or goal…"
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontFamily: FONT.ui, fontSize: 14, color: t.ink }}/>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','flagged','new'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 999, border: 0, cursor: 'pointer',
              background: filter === f ? t.accent : t.fillTint,
              color: filter === f ? '#fff' : t.ink2,
              fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 16px' }}>
        <Card t={t} padding={0}>
          {filtered.map((c, i) => (
            <div key={c.name} onClick={() => setSelected(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < filtered.length - 1 ? `0.5px solid ${t.sep}` : 'none', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <Avatar initials={c.initials} size={40} t={t}/>
                {c.new && <span style={{ position: 'absolute', right: -1, top: -1, width: 8, height: 8, borderRadius: '50%', background: t.accent, border: `2px solid ${t.bgElevated}` }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: FONT.ui, fontSize: 15, fontWeight: 600, color: t.ink }}>{c.name}</span>
                  {c.flagged && <Icon name="bolt" size={12} color={t.warn}/>}
                </div>
                <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3, marginTop: 1 }}>{c.goal} · {c.plan}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700, color: c.adherence >= 85 ? t.good : c.adherence >= 70 ? t.warn : t.bad }}>{c.adherence}%</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink3 }}>adherence</div>
              </div>
              <Icon name="chevronR" size={15} color={t.ink4}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Plan Builder ─────────────────────────────────────────────────────────────
function TrainerPlan({ t }) {
  const [day, setDay] = useState(0);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const exercises = [
    [
      { name: 'Bench Press',      sets: '4 × 8', load: '90 kg',  muscle: 'Chest',   rpe: 8 },
      { name: 'Incline DB Press', sets: '3 × 10', load: '22 kg', muscle: 'Chest',   rpe: 7 },
      { name: 'Overhead Press',   sets: '4 × 6', load: '52 kg',  muscle: 'Shoulders', rpe: 8 },
      { name: 'Lateral Raise',    sets: '3 × 12', load: '8 kg',  muscle: 'Shoulders', rpe: 6 },
      { name: 'Tricep Pushdown',  sets: '3 × 12', load: '32 kg', muscle: 'Triceps', rpe: 7 },
    ],
    [
      { name: 'Deadlift',     sets: '4 × 5',  load: '140 kg', muscle: 'Back',  rpe: 9 },
      { name: 'Pull-Up',      sets: '4 × 8',  load: 'BW',     muscle: 'Back',  rpe: 8 },
      { name: 'Barbell Row',  sets: '3 × 8',  load: '70 kg',  muscle: 'Back',  rpe: 7 },
      { name: 'Hammer Curl',  sets: '3 × 10', load: '14 kg',  muscle: 'Biceps', rpe: 7 },
    ],
    [
      { name: 'Back Squat',    sets: '5 × 5',  load: '125 kg', muscle: 'Legs', rpe: 9 },
      { name: 'Walking Lunge', sets: '3 × 12', load: '20 kg',  muscle: 'Legs', rpe: 7 },
      { name: 'Leg Extension', sets: '3 × 12', load: '50 kg',  muscle: 'Legs', rpe: 7 },
    ],
    null, // Rest
    [
      { name: 'Bench Press',      sets: '4 × 8',  load: '92.5 kg', muscle: 'Chest',   rpe: 8 },
      { name: 'Cable Fly',        sets: '3 × 12', load: '14 kg',   muscle: 'Chest',   rpe: 6 },
      { name: 'Close-Grip Bench', sets: '3 × 8',  load: '70 kg',   muscle: 'Triceps', rpe: 8 },
      { name: 'Dips',             sets: '3 × AMRAP', load: 'BW',   muscle: 'Triceps', rpe: 9 },
    ],
    [
      { name: 'Deadlift',    sets: '4 × 5',  load: '145 kg', muscle: 'Back',   rpe: 9 },
      { name: 'Pull-Up',     sets: '4 × 8',  load: 'BW+5',   muscle: 'Back',   rpe: 8 },
      { name: 'EZ-Bar Curl', sets: '3 × 10', load: '30 kg',  muscle: 'Biceps', rpe: 7 },
    ],
    null, // Rest
  ];
  const curEx = exercises[day];

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t} subtitle="Push/Pull/Legs — Week 4" title="Plan builder"
        leading={<IconBtn name="chevronL" t={t}/>} trailing={<IconBtn name="ellipsis" t={t}/>}/>
      {/* Week strip */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card t={t} padding={12}>
          <div style={{ display: 'flex', gap: 5 }}>
            {days.map((d, i) => {
              const isRest = exercises[i] === null;
              const isActive = i === day;
              return (
                <button key={d} onClick={() => setDay(i)} style={{
                  flex: 1, height: 54, borderRadius: 10, padding: 0, cursor: 'pointer', border: 0,
                  background: isActive ? t.gradient : isRest ? t.fillTint2 : t.accentTint,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                }}>
                  <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: isActive ? '#fff' : t.ink3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</span>
                  {isRest ? <Icon name="moon" size={13} color={isActive ? '#fff' : t.ink3}/> : <Icon name="dumbbell" size={13} color={isActive ? '#fff' : t.accent}/>}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Exercises */}
      <div style={{ padding: '0 16px' }}>
        {curEx ? (
          <>
            <SectionLabel t={t} action="+ Add">Exercises</SectionLabel>
            <Card t={t} padding={0}>
              {curEx.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < curEx.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: t.fillTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: t.ink2 }}>{i+1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink }}>{e.name}</div>
                    <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 1 }}>{e.muscle} · RPE {e.rpe}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: t.ink }}>{e.sets}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>{e.load}</div>
                  </div>
                  <Icon name="chevronR" size={14} color={t.ink4}/>
                </div>
              ))}
            </Card>
            {/* AI suggestion */}
            <div style={{ marginTop: 12 }}>
              <Card t={t} padding={14} style={{ background: t.gradientSoft, border: `0.5px solid ${t.accentRing}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="sparkles" size={16} color="#fff"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI suggestion</div>
                    <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink, marginTop: 3, lineHeight: 1.4 }}>Add Chest Fly for upper pec isolation — complements Bench press well on this push day.</div>
                    <button style={{ marginTop: 8, background: t.gradient, color: '#fff', border: 0, borderRadius: 999, padding: '6px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="plus" size={12} color="#fff"/> Add
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card t={t} padding={24} style={{ textAlign: 'center' }}>
            <Icon name="moon" size={32} color={t.ink3} style={{ margin: '0 auto 10px' }}/>
            <div style={{ fontFamily: FONT.ui, fontSize: 16, fontWeight: 600, color: t.ink }}>Rest day</div>
            <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, marginTop: 4 }}>Active recovery — mobility recommended</div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Live Session (Trainer) ───────────────────────────────────────────────────
function TrainerSession({ t, onClose }) {
  const [restTime, setRestTime] = useState(42);
  const [resting, setResting] = useState(true);
  useEffect(() => {
    if (!resting) return;
    const id = setInterval(() => setRestTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resting]);
  const sets = [
    { weight: 100, reps: 6, rpe: 7, done: true },
    { weight: 105, reps: 6, rpe: 8, done: true },
    { weight: 110, reps: 0, done: false },
    { weight: 110, reps: 0, done: false },
  ];
  return (
    <div style={{ paddingBottom: 100, background: t.bg }}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 0, color: t.accent, fontFamily: FONT.ui, fontSize: 15, fontWeight: 590, cursor: 'pointer' }}>End</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, color: t.accent, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }}/>Live · 00:42
          </div>
          <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink, marginTop: 1 }}>Priya Shah</div>
        </div>
        <IconBtn name="ellipsis" t={t}/>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <Card t={t} padding={18} style={{ background: resting ? t.gradient : t.bgElevated, border: 'none', display: 'flex', alignItems: 'center', gap: 16, color: resting ? '#fff' : t.ink }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={34} stroke={resting ? 'rgba(255,255,255,0.25)' : t.fillTint} strokeWidth={6} fill="none"/>
              <circle cx={40} cy={40} r={34} stroke={resting ? '#fff' : t.accent} strokeWidth={6} fill="none"
                strokeLinecap="round" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - restTime / 60)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600, color: resting ? '#fff' : t.ink }}>0:{String(restTime).padStart(2,'0')}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.8 }}>Resting</div>
            <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 600, marginTop: 3 }}>Set 3 up next</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 12, marginTop: 2, opacity: 0.8 }}>110 kg × 6 · RPE 8</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setResting(false); setRestTime(60); }} style={{ background: resting ? '#fff' : t.gradient, color: resting ? t.accent : '#fff', border: 0, borderRadius: 999, padding: '6px 12px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="forward" size={11} color={resting ? t.accent : '#fff'}/> Skip
              </button>
              <button style={{ background: 'rgba(255,255,255,0.15)', color: resting ? '#fff' : t.ink2, border: 0, borderRadius: 999, padding: '6px 12px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+15s</button>
            </div>
          </div>
        </Card>
      </div>
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t} action="2 / 6">Barbell Back Squat</SectionLabel>
        <Card t={t} padding={12}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 55px 26px', gap: 6, padding: '6px 0 8px', borderBottom: `0.5px solid ${t.sep}` }}>
            {['SET','WEIGHT','REPS','RPE',''].map((h, i) => <div key={i} style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, letterSpacing: 0.6 }}>{h}</div>)}
          </div>
          {sets.map((set, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 1fr 55px 26px', alignItems: 'center', gap: 6,
              padding: '9px 0', borderBottom: `0.5px solid ${t.sep}`,
              background: i === 2 ? t.gradientSoft : 'transparent', borderRadius: i === 2 ? 8 : 0,
              marginLeft: i === 2 ? -6 : 0, marginRight: i === 2 ? -6 : 0,
              paddingLeft: i === 2 ? 6 : 0, paddingRight: i === 2 ? 6 : 0,
            }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: set.done ? t.ink3 : t.ink }}>{i+1}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 600, color: set.done ? t.ink2 : t.ink }}>{set.weight}<span style={{ fontSize: 10, color: t.ink3, marginLeft: 2 }}>kg</span></div>
              <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 600, color: set.reps ? (set.done ? t.ink2 : t.ink) : t.ink4 }}>{set.reps || '–'}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 12, color: set.rpe ? t.ink2 : t.ink4, textAlign: 'right' }}>{set.rpe || '–'}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {set.done ? (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.good, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={12} color="#fff" strokeWidth={2.6}/>
                  </div>
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${i === 2 ? t.accent : t.ink4}`, background: i === 2 ? t.accentTint : 'transparent' }}/>
                )}
              </div>
            </div>
          ))}
          <button style={{ marginTop: 8, width: '100%', height: 36, borderRadius: 10, background: t.fillTint2, border: 0, cursor: 'pointer', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Icon name="plus" size={13} color={t.accent}/> Add set
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function TrainerProfile({ t }) {
  const monthStats = [
    { l: 'Sessions', v: '112', sub: '+8 vs last month' },
    { l: 'Revenue',  v: '₹1.1L', sub: 'May 2026' },
    { l: 'Avg Rating', v: '4.9★', sub: 'from 38 reviews' },
  ];
  const certs = ['NSCA-CSCS', 'Precision Nutrition L1', 'FMS Level 2'];
  const specialties = ['Strength & Hypertrophy', 'Progressive Overload', 'Fat Loss', 'Powerlifting'];
  const settings = [
    { label: 'Session reminders', sub: '30 min before each session', toggle: true,  on: true  },
    { label: 'Client progress alerts', sub: 'Notify on missed sessions', toggle: true,  on: true  },
    { label: 'Payment notifications',  sub: 'When client fee is logged',  toggle: true,  on: false },
    { label: 'Branch',       sub: 'Kandivali, Mumbai',   toggle: false },
    { label: 'Contact',      sub: '+91 98001 12345',      toggle: false },
    { label: 'Member since', sub: 'March 2020',           toggle: false },
  ];

  const topClients = CLIENTS.slice(0, 3);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ padding: '32px 16px 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0, bottom: '40%',
          background: `linear-gradient(180deg, ${t.accentTint} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}/>
        <div style={{
          width: 80, height: 80, borderRadius: 26, margin: '0 auto 12px',
          background: t.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.display, fontSize: 30, fontWeight: 700, color: '#fff',
          boxShadow: `0 8px 24px ${t.accentRing}`,
          position: 'relative',
        }}>V</div>
        <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink, letterSpacing: -0.4 }}>Vikram Khanna</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, marginTop: 3 }}>Personal Trainer · Kandivali</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {specialties.map(s => (
            <span key={s} style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.accent, background: t.accentTint, borderRadius: 6, padding: '3px 8px' }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Month stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {monthStats.map(s => (
            <Card t={t} key={s.l} padding={14}>
              <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: t.ink }}>{s.v}</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 2 }}>{s.l}</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 10, color: t.ink4, marginTop: 3 }}>{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Client adherence summary */}
        <SectionLabel t={t}>Client adherence</SectionLabel>
        <Card t={t} padding={0}>
          {topClients.map((c, i, arr) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
              <Avatar initials={c.initials} size={36} t={t}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink }}>{c.name}</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 1 }}>{c.goal} · {c.plan}</div>
                <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: t.fillTint, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.adherence}%`, background: c.adherence >= 90 ? t.good : c.adherence >= 80 ? t.warn : t.bad, borderRadius: 2 }}/>
                </div>
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: c.adherence >= 90 ? t.good : c.adherence >= 80 ? t.warn : t.bad }}>{c.adherence}%</span>
            </div>
          ))}
          <div style={{ padding: '10px 14px', borderTop: `0.5px solid ${t.sep}` }}>
            <span style={{ fontFamily: FONT.ui, fontSize: 13, color: t.accent, fontWeight: 600 }}>See all {CLIENTS.length} clients →</span>
          </div>
        </Card>

        {/* Certifications */}
        <SectionLabel t={t}>Certifications</SectionLabel>
        <Card t={t} padding={0}>
          {certs.map((c, i, arr) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: t.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="star" size={14} color={t.accent} strokeWidth={2}/>
              </div>
              <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 500, color: t.ink }}>{c}</span>
            </div>
          ))}
        </Card>

        {/* Settings */}
        <SectionLabel t={t}>Settings</SectionLabel>
        <Card t={t} padding={0}>
          {settings.map((s, i, arr) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 500, color: t.ink }}>{s.label}</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3, marginTop: 1 }}>{s.sub}</div>
              </div>
              {s.toggle ? (
                <div style={{
                  width: 42, height: 24, borderRadius: 12, padding: 3,
                  background: s.on ? t.gradient : t.fillTint,
                  display: 'flex', alignItems: 'center',
                  justifyContent: s.on ? 'flex-end' : 'flex-start',
                  transition: 'all 0.2s', flexShrink: 0,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff' }}/>
                </div>
              ) : (
                <Icon name="chevronR" size={14} color={t.ink4}/>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Trainer App Shell ────────────────────────────────────────────────────────
export default function TrainerApp({ t }) {
  const [tab, setTab] = useState('home');
  const [inSession, setInSession] = useState(false);
  const tabs = [
    { key: 'home',    label: 'Today',   icon: 'home' },
    { key: 'clients', label: 'Clients', icon: 'people' },
    { key: 'plan',    label: 'Plan',    icon: 'workout' },
    { key: 'profile', label: 'Profile', icon: 'profile' },
  ];
  if (inSession) return (
    <div style={{ height: '100%', background: t.bg }}>
      <TrainerSession t={t} onClose={() => setInSession(false)}/>
    </div>
  );
  return (
    <div style={{ height: '100%', position: 'relative', background: t.bg }}>
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home'    && <TrainerHome t={t} onSession={() => setInSession(true)}/>}
        {tab === 'clients' && <TrainerClients t={t}/>}
        {tab === 'plan'    && <TrainerPlan t={t}/>}
        {tab === 'profile' && <TrainerProfile t={t}/>}
      </div>
      <BottomTabBar t={t} tabs={tabs} active={tab} onSelect={setTab}/>
    </div>
  );
}
