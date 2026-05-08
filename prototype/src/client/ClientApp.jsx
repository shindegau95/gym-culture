import { useState, useEffect } from 'react';
import { FONT } from '../tokens';
import { Icon, Avatar, TopBar, IconBtn, Card, SectionLabel, Chip, Numeric, RingProgress, MuscleBar, BottomTabBar, ProgressBar } from '../components/Primitives';

// ─── Home ────────────────────────────────────────────────────────────────────
function ClientHome({ t, onStartWorkout, onViewCoach }) {
  const muscles = [
    { l: 'Chest',     v: 42 },
    { l: 'Back',      v: 88 },
    { l: 'Legs',      v: 95 },
    { l: 'Shoulders', v: 65 },
    { l: 'Arms',      v: 58 },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t}
        subtitle="Friday · May 1"
        title="Hey, Aarav"
        leading={<Avatar initials="AR" size={32} t={t} ring/>}
        trailing={<><IconBtn name="search" t={t}/><IconBtn name="bell" t={t}/></>}
      />
      {/* Hero */}
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ background: t.gradient, borderRadius: 22, padding: 20, position: 'relative', overflow: 'hidden', color: '#fff' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', right: 30, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }}/>
            <span style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Today's session</span>
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1 }}>Chest & Triceps</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600 }}>6 <span style={{ fontSize: 12, opacity: 0.85, fontFamily: FONT.ui }}>exercises</span></span>
            <span style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 600 }}>55<span style={{ fontSize: 12, opacity: 0.85, fontFamily: FONT.ui }}>min</span></span>
            <button onClick={onViewCoach} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: 0, cursor: 'pointer' }}>
              <Avatar initials="RK" size={18} t={t} color="rgba(255,255,255,0.3)"/>
              <span style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: '#fff' }}>Coach Rohan</span>
            </button>
          </div>
          <button onClick={onStartWorkout} style={{
            marginTop: 14, width: '100%', height: 44, borderRadius: 12, border: 0, cursor: 'pointer',
            background: '#fff', color: t.accent,
            fontFamily: FONT.ui, fontSize: 15, fontWeight: 700, letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="play" size={14} color={t.accent}/> Start workout
          </button>
        </div>
      </div>
      {/* Muscle recovery */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t} action="Details">Muscle recovery</SectionLabel>
        <Card t={t} padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {muscles.map(m => <MuscleBar key={m.l} label={m.l} value={m.v} t={t}/>)}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${t.sep}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: t.accent, flexShrink: 0 }}/>
            <span style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink2, fontWeight: 500, lineHeight: 1.4 }}>Today's session targets <strong style={{ color: t.ink }}>chest + arms</strong> — the two least-recovered groups.</span>
          </div>
        </Card>
      </div>
      {/* Up next */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t} action="Plan">Up next</SectionLabel>
        <Card t={t} padding={0}>
          {[
            { d: 'Sat', n: '02', s: 'Pull · Back & Biceps', m: '50 min', rest: false },
            { d: 'Sun', n: '03', s: 'Active recovery',       m: '30 min', rest: true },
            { d: 'Mon', n: '04', s: 'Legs · Quad focus',     m: '60 min', rest: false },
          ].map((d, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
              <div style={{ width: 44 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: t.ink }}>{d.n} May</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: 700, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{d.d}</div>
              </div>
              <div style={{ width: 1, alignSelf: 'stretch', background: t.sep, position: 'relative' }}>
                <div style={{ position: 'absolute', left: -3, top: 6, width: 7, height: 7, borderRadius: '50%', background: d.rest ? t.ink3 : t.accent }}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink, letterSpacing: -0.2 }}>{d.s}</span>
                  {d.rest && <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, padding: '2px 6px', borderRadius: 5, background: t.fillTint, textTransform: 'uppercase', letterSpacing: 0.4 }}>Rest</span>}
                </div>
                <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink3, marginTop: 1 }}>{d.m}</div>
              </div>
              <Icon name="chevronR" size={16} color={t.ink4}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Active Session ──────────────────────────────────────────────────────────
function SetRow({ idx, set, t, active }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 1fr 1fr 60px 26px', alignItems: 'center', gap: 6,
      padding: '9px 0', borderBottom: `0.5px solid ${t.sep}`,
      background: active ? t.gradientSoft : 'transparent',
      borderRadius: active ? 10 : 0,
      marginLeft: active ? -8 : 0, marginRight: active ? -8 : 0,
      paddingLeft: active ? 8 : 0, paddingRight: active ? 8 : 0,
    }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: set.done ? t.ink3 : t.ink }}>{idx}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 600, color: set.done ? t.ink2 : t.ink, letterSpacing: -0.3 }}>
        {set.weight}<span style={{ fontSize: 10, color: t.ink3, marginLeft: 2 }}>kg</span>
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 600, color: set.done ? t.ink2 : set.reps ? t.ink : t.ink4 }}>
        {set.reps || '–'}
      </div>
      <div style={{ textAlign: 'right', fontFamily: FONT.mono, fontSize: 12, color: set.rpe ? t.ink2 : t.ink4 }}>{set.rpe || '–'}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {set.done ? (
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.good, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={12} color="#fff" strokeWidth={2.6}/>
          </div>
        ) : (
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${active ? t.accent : t.ink4}`, background: active ? t.accentTint : 'transparent' }}/>
        )}
      </div>
    </div>
  );
}

function ClientSession({ t, onClose }) {
  const [restTime, setRestTime] = useState(48);
  const [resting, setResting] = useState(true);
  const [elapsed, setElapsed] = useState(2 * 60 + 14);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!resting) return;
    const id = setInterval(() => setRestTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resting]);

  const sets = [
    { weight: 90, reps: 8, rpe: 7, done: true },
    { weight: 92.5, reps: 8, rpe: 8, done: true },
    { weight: 92.5, reps: 0, done: false },
    { weight: 92.5, reps: 0, done: false },
  ];

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div style={{ paddingBottom: 100, background: t.bg, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '8px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 0, color: t.accent, fontFamily: FONT.ui, fontSize: 15, fontWeight: 590, cursor: 'pointer' }}>End</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: 0.6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, animation: 'gcPulse 1.4s ease-in-out infinite' }}/>
            Live · {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
          <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink, marginTop: 1 }}>Bench Press</div>
        </div>
        <IconBtn name="ellipsis" t={t} size={32}/>
      </div>

      {/* Rest timer */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card t={t} padding={18} style={{ background: resting ? t.gradient : t.bgElevated, border: 'none', display: 'flex', alignItems: 'center', gap: 16, color: resting ? '#fff' : t.ink }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
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
            <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.8 }}>Resting</div>
            <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 600, letterSpacing: -0.3, marginTop: 3 }}>Set 3 up next</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 12, marginTop: 3, opacity: 0.8 }}>92.5 kg × 8</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setResting(false); setRestTime(60); }} style={{
                background: resting ? '#fff' : t.gradient, color: resting ? t.accent : '#fff',
                border: 0, borderRadius: 999, padding: '6px 12px',
                fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name="forward" size={11} color={resting ? t.accent : '#fff'}/> Skip
              </button>
              <button style={{ background: 'rgba(255,255,255,0.15)', color: resting ? '#fff' : t.ink2, border: 0, borderRadius: 999, padding: '6px 12px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+15s</button>
            </div>
          </div>
        </Card>
      </div>

      {/* Current exercise sets */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t} action="2 / 6">Bench Press</SectionLabel>
        <Card t={t} padding={12}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 60px 26px', gap: 6, padding: '6px 0 8px', borderBottom: `0.5px solid ${t.sep}` }}>
            {['SET','WEIGHT','REPS','RPE',''].map((h, i) => (
              <div key={i} style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: 700, color: t.ink3, letterSpacing: 0.6 }}>{h}</div>
            ))}
          </div>
          {sets.map((set, i) => <SetRow key={i} idx={i+1} set={set} t={t} active={i === 2}/>)}
          <button style={{ marginTop: 8, width: '100%', height: 36, borderRadius: 10, background: t.fillTint2, border: 0, cursor: 'pointer', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Icon name="plus" size={13} color={t.accent}/> Add set
          </button>
        </Card>
      </div>

      {/* Up next exercises */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t}>Up next</SectionLabel>
        <Card t={t} padding={0}>
          {[
            { n: 'Incline DB Press', d: '3 × 10 @ 24kg' },
            { n: 'Cable Fly',        d: '3 × 12 @ 14kg' },
            { n: 'Close-Grip Bench', d: '3 × 8 @ 70kg' },
          ].map((e, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: t.fillTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="dumbbell" size={14} color={t.ink2}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 590, color: t.ink }}>{e.n}</div>
                <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>{e.d}</div>
              </div>
              <Icon name="chevronR" size={14} color={t.ink4}/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Workout ─────────────────────────────────────────────────────────────────
function ClientWorkout({ t, onStartWorkout }) {
  const days = [
    { d: 'Mon', label: 'Push',          done: true,  rest: false },
    { d: 'Tue', label: 'Pull',          done: true,  rest: false },
    { d: 'Wed', label: 'Rest',          done: true,  rest: true  },
    { d: 'Thu', label: 'Legs',          done: true,  rest: false },
    { d: 'Fri', label: 'Push',          done: false, rest: false, today: true },
    { d: 'Sat', label: 'Pull',          done: false, rest: false },
    { d: 'Sun', label: 'Rest',          done: false, rest: true  },
  ];
  const exercises = [
    { name: 'Bench Press',       sets: 4, reps: '6–8', weight: '90 kg',   pr: false },
    { name: 'Incline DB Press',  sets: 3, reps: '10',  weight: '24 kg',   pr: false },
    { name: 'Cable Fly',         sets: 3, reps: '12',  weight: '14 kg',   pr: false },
    { name: 'Close-Grip Bench',  sets: 3, reps: '8',   weight: '70 kg',   pr: false },
    { name: 'Overhead Press',    sets: 3, reps: '8–10', weight: '50 kg',  pr: false },
    { name: 'Tricep Pushdown',   sets: 3, reps: '12',  weight: '20 kg',   pr: false },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t} subtitle="Week 6 · Hypertrophy block" title="Workout Plan"
        trailing={<IconBtn name="calendar" t={t}/>}
      />
      {/* Week strip */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card t={t} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink }}>This week</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>4 / 5 sessions</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {days.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 10,
                  background: day.today ? t.gradient : day.done ? t.accentTint : t.fillTint,
                  border: day.today ? 'none' : `1.5px solid ${day.done ? t.accentRing : t.sep}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {day.rest
                    ? <span style={{ fontSize: 12 }}>—</span>
                    : day.done
                      ? <Icon name="check" size={13} color={day.today ? '#fff' : t.accent} strokeWidth={2.5}/>
                      : <Icon name="dumbbell" size={12} color={t.ink4}/>
                  }
                </div>
                <span style={{ fontFamily: FONT.ui, fontSize: 9, fontWeight: day.today ? 700 : 400, color: day.today ? t.accent : t.ink3, letterSpacing: 0.2 }}>{day.d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* Today's session */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t}>Today · Chest & Triceps</SectionLabel>
        <Card t={t} padding={0}>
          {/* header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 48px 64px', gap: 6, padding: '10px 14px 8px', borderBottom: `0.5px solid ${t.sep}` }}>
            {['Exercise','Sets','Reps','Target'].map(h => (
              <span key={h} style={{ fontFamily: FONT.ui, fontSize: 10, fontWeight: 700, color: t.ink3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {exercises.map((ex, i, arr) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 40px 48px 64px', gap: 6,
              padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink }}>{ex.name}</div>
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{ex.sets}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 13, color: t.ink2 }}>{ex.reps}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{ex.weight}</div>
            </div>
          ))}
        </Card>
        <button onClick={onStartWorkout} style={{
          marginTop: 16, width: '100%', height: 48, borderRadius: 14, border: 0, cursor: 'pointer',
          background: t.gradient, color: '#fff',
          fontFamily: FONT.ui, fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="play" size={14} color="#fff"/> Start Today's Session
        </button>
      </div>
    </div>
  );
}

// ─── Coach Profile ─────────────────────────────────────────────────────────────
function CoachProfile({ t, onBack }) {
  const stats = [
    { l: 'Clients', v: '14' },
    { l: 'Exp', v: '6 yrs' },
    { l: 'Rating', v: '4.9★' },
  ];
  const certs = ['NSCA-CSCS', 'Precision Nutrition L1', 'FMS Level 2'];
  const schedule = [
    { day: 'Mon–Fri', time: '06:00 – 20:00' },
    { day: 'Sat',     time: '07:00 – 14:00' },
    { day: 'Sun',     time: 'Off' },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: t.accent, fontFamily: FONT.ui, fontSize: 15, fontWeight: 590, padding: 0 }}>← Back</button>
      </div>
      {/* Hero */}
      <div style={{ padding: '16px 16px 20px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 26, margin: '0 auto 12px',
          background: t.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.display, fontSize: 30, fontWeight: 700, color: '#fff',
        }}>R</div>
        <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 700, color: t.ink, letterSpacing: -0.4 }}>Coach Rohan</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, marginTop: 4 }}>Strength & Hypertrophy · Kandivali</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: t.ink }}>{s.v}</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 16px' }}>
        {/* Your programme */}
        <SectionLabel t={t}>Your programme</SectionLabel>
        <Card t={t} padding={16}>
          <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 700, color: t.ink, marginBottom: 4 }}>Hypertrophy Block — 12 weeks</div>
          <div style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, lineHeight: 1.5 }}>5-day PPL split focusing on progressive overload. Primary goal: lean mass gain with gradual body recomposition. Currently in week 6.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['PPL Split', '5 days/wk', 'Progressive Overload', 'Hypertrophy'].map(tag => (
              <span key={tag} style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.accent, background: t.accentTint, borderRadius: 6, padding: '3px 8px' }}>{tag}</span>
            ))}
          </div>
        </Card>
        {/* Certifications */}
        <SectionLabel t={t}>Certifications</SectionLabel>
        <Card t={t} padding={0}>
          {certs.map((c, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: t.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="star" size={13} color={t.accent} strokeWidth={2}/>
              </div>
              <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 500, color: t.ink }}>{c}</span>
            </div>
          ))}
        </Card>
        {/* Availability */}
        <SectionLabel t={t}>Availability</SectionLabel>
        <Card t={t} padding={0}>
          {schedule.map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: i < arr.length - 1 ? `0.5px solid ${t.sep}` : 'none' }}>
              <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink }}>{s.day}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 12, color: s.time === 'Off' ? t.ink4 : t.ink3 }}>{s.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────
function MiniChart({ data, t, color, height = 80 }) {
  const w = 300, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 8) + 4;
    const y = h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${w-4},${h} L4,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={`cg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#cg${color.replace('#','')})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.slice(-1).map(([x, y]) => (
        <g key="dot">
          <circle cx={x} cy={y} r={5} fill={color} fillOpacity="0.2"/>
          <circle cx={x} cy={y} r={2.5} fill={color}/>
        </g>
      ))}
    </svg>
  );
}

function ClientProgress({ t }) {
  const weightData = [82, 81.5, 81, 80.8, 80.5, 80.2, 80, 79.8, 79.5, 79.2, 79, 78.8];
  const benchData = [70, 72.5, 75, 75, 77.5, 80, 80, 82.5, 82.5, 85, 87.5, 92.5];
  const prs = [
    { ex: 'Bench Press',   val: '92.5 kg', w: 'Wk 6' },
    { ex: 'Deadlift',      val: '145 kg',  w: 'Wk 5' },
    { ex: 'Back Squat',    val: '130 kg',  w: 'Wk 4' },
  ];
  const stats = [
    { l: 'Chest', before: '98cm', after: '102cm' },
    { l: 'Waist', before: '84cm', after: '80cm' },
    { l: 'Weight', before: '82kg', after: '78.8kg' },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t} subtitle="Week 6 · Hypertrophy block" title="Progress" trailing={<IconBtn name="calendar" t={t}/>}/>
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t}>Body weight</SectionLabel>
        <Card t={t} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <Numeric value="78.8" unit="kg" t={t} size={26}/>
              <span style={{ fontFamily: FONT.ui, fontSize: 12, color: t.good, fontWeight: 600, marginLeft: 8 }}>↓ 3.2 kg</span>
            </div>
            <Chip t={t}>12 weeks</Chip>
          </div>
          <MiniChart data={weightData} t={t} color={t.good}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Feb','Mar','Apr','May'].map(m => <span key={m} style={{ fontFamily: FONT.mono, fontSize: 10, color: t.ink3 }}>{m}</span>)}
          </div>
        </Card>

        <SectionLabel t={t}>Strength — Bench Press 1RM est.</SectionLabel>
        <Card t={t} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <Numeric value="107" unit="kg" t={t} size={26}/>
              <span style={{ fontFamily: FONT.ui, fontSize: 12, color: t.good, fontWeight: 600, marginLeft: 8 }}>↑ 22.5 kg</span>
            </div>
            <Chip t={t}>12 weeks</Chip>
          </div>
          <MiniChart data={benchData} t={t} color={t.accent}/>
        </Card>

        <SectionLabel t={t}>Personal records</SectionLabel>
        <Card t={t} padding={0}>
          {prs.map((p, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: t.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="star" size={15} color={t.accent} strokeWidth={2}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: t.ink }}>{p.ex}</div>
                <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, marginTop: 1 }}>{p.w}</div>
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, color: t.accent }}>{p.val}</span>
            </div>
          ))}
        </Card>

        <SectionLabel t={t}>Body measurements</SectionLabel>
        <Card t={t} padding={14}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: t.ink, width: 54 }}>{s.l}</span>
                <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{s.before}</span>
                  <Icon name="chevronR" size={12} color={t.ink4}/>
                  <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: t.good }}>{s.after}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Nutrition ────────────────────────────────────────────────────────────────
function MacroRing({ value, max, color, label, t }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28, s = 5, c = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 66, height: 66 }}>
        <svg width={66} height={66} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={33} cy={33} r={r} stroke={t.fillTint} strokeWidth={s} fill="none"/>
          <circle cx={33} cy={33} r={r} stroke={color} strokeWidth={s} fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: t.ink }}>{value}<span style={{ fontSize: 9, color: t.ink3 }}>g</span></span>
        </div>
      </div>
      <span style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.ink3 }}>{label}</span>
    </div>
  );
}

function ClientNutrition({ t }) {
  const meals = [
    { name: 'Breakfast', time: '07:30', kcal: 480, items: ['Oats with almonds & banana', '2 boiled eggs', 'Green tea'] },
    { name: 'Pre-workout', time: '09:00', kcal: 220, items: ['Banana', 'Peanut butter toast', 'BCAA shake'] },
    { name: 'Lunch', time: '13:00', kcal: 680, items: ['Dal chawal (2 bowls)', 'Paneer sabzi', 'Cucumber raita'] },
    { name: 'Post-workout', time: '16:30', kcal: 320, items: ['Whey protein shake', 'Sweet potato', 'Coconut water'] },
    { name: 'Dinner', time: '20:00', kcal: 550, items: ['Multigrain roti (3)', 'Mixed veg curry', 'Curd'] },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar t={t} subtitle="Friday · May 1" title="Nutrition" trailing={<IconBtn name="calendar" t={t}/>}/>
      {/* Macro summary */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card t={t} padding={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, color: t.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>Daily target</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <Numeric value="2,250" t={t} size={28}/>
                <span style={{ fontFamily: FONT.ui, fontSize: 13, color: t.ink3, fontWeight: 500 }}>kcal</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.ui, fontSize: 11, color: t.ink3, fontWeight: 500 }}>Consumed</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, color: t.good, marginTop: 2 }}>1,700</div>
            </div>
          </div>
          <ProgressBar value={75} t={t} height={6}/>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 18 }}>
            <MacroRing value={178} max={200} color={t.accent} label="Protein" t={t}/>
            <MacroRing value={230} max={280} color={t.warn} label="Carbs" t={t}/>
            <MacroRing value={62} max={75} color={t.good} label="Fat" t={t}/>
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: t.gradientSoft, border: `0.5px solid ${t.accentRing}` }}>
            <div style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 3 }}>Coach Rohan's note</div>
            <div style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink2, lineHeight: 1.4 }}>Heavy push day today — prioritise the post-workout shake within 30 min. Hit 180g+ protein.</div>
          </div>
        </Card>
      </div>
      {/* Meals */}
      <div style={{ padding: '0 16px' }}>
        <SectionLabel t={t}>Meal schedule</SectionLabel>
        <Card t={t} padding={0}>
          {meals.map((m, i, arr) => (
            <div key={i} style={{ padding: '14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.sep}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 700, color: t.ink }}>{m.name}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>{m.time}</span>
                </div>
                <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: t.ink2 }}>{m.kcal} kcal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {m.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.ink4, flexShrink: 0 }}/>
                    <span style={{ fontFamily: FONT.ui, fontSize: 12, color: t.ink2, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Client App Shell ─────────────────────────────────────────────────────────
export default function ClientApp({ t }) {
  const [tab, setTab] = useState('home');
  const [inSession, setInSession] = useState(false);
  const [viewCoach, setViewCoach] = useState(false);

  const tabs = [
    { key: 'home',      label: 'Home',      icon: 'home' },
    { key: 'workout',   label: 'Workout',   icon: 'dumbbell' },
    { key: 'progress',  label: 'Progress',  icon: 'progress' },
    { key: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
  ];

  if (inSession) return (
    <div style={{ height: '100%', position: 'relative' }}>
      <ClientSession t={t} onClose={() => setInSession(false)}/>
    </div>
  );

  if (viewCoach) return (
    <div style={{ height: '100%', overflowY: 'auto', background: t.bg }}>
      <CoachProfile t={t} onBack={() => setViewCoach(false)}/>
    </div>
  );

  return (
    <div style={{ height: '100%', position: 'relative', background: t.bg }}>
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home'      && <ClientHome t={t} onStartWorkout={() => setInSession(true)} onViewCoach={() => setViewCoach(true)}/>}
        {tab === 'workout'   && <ClientWorkout t={t} onStartWorkout={() => setInSession(true)}/>}
        {tab === 'progress'  && <ClientProgress t={t}/>}
        {tab === 'nutrition' && <ClientNutrition t={t}/>}
      </div>
      <BottomTabBar t={t} tabs={tabs} active={tab} onSelect={setTab}/>
    </div>
  );
}
