import { useState, useEffect } from 'react';
import { Icon, Avatar, TopBar, IconBtn, Card, SectionLabel, Chip, Numeric, MuscleBar, BottomTabBar, ProgressBar, TensionOrb, OrbFill, PulseProgressBar } from '../components/Primitives';
import s from './ClientApp.module.css';

// ─── Home ────────────────────────────────────────────────────────────────────
function ClientHome({ t, onStartWorkout, onViewCoach, onViewRecovery }) {
  const muscles = [
    { l: 'Legs',      v: 95, lastTrained: '4 days ago', strain: 'Low',      tone: 'Fully recovered. Ready for max load.' },
    { l: 'Back',      v: 88, lastTrained: '3 days ago', strain: 'Low',      tone: 'Recovered. Heavy pulls OK today.' },
    { l: 'Shoulders', v: 65, lastTrained: '2 days ago', strain: 'Moderate', tone: 'Light isolation only — avoid overhead press.' },
    { l: 'Arms',      v: 58, lastTrained: '2 days ago', strain: 'Moderate', tone: 'Today\'s push will hit triceps.' },
    { l: 'Chest',     v: 42, lastTrained: 'Yesterday',  strain: 'High',     tone: 'Today\'s session targets chest — prep mentally.' },
  ];
  const [muscleIdx, setMuscleIdx] = useState(0);
  const m = muscles[muscleIdx];
  return (
    <div className={s.page}>
      <TopBar t={t}
        subtitle="Friday · May 1"
        title="Hey, Aarav"
        leading={<Avatar initials="AR" size={32} t={t} ring/>}
        trailing={<><IconBtn name="search" t={t}/><IconBtn name="bell" t={t}/></>}
      />
      <div className={s.heroPad}>
        <div className={s.heroStage}>
          <div className={s.hero}>
            {/* Large orb sits in the card background, anchored right, clipped off-edge */}
            <div className={s.heroOrbBg} aria-hidden="true">
              <OrbFill value={42} size={240} showStrip={false}/>
            </div>
            <div className={s.heroContent}>
              <div className={s.heroEyebrow}>
                <span className={s.heroDot}/>
                <span className={s.heroEyebrowText}>Today's session</span>
              </div>
              <div className={s.heroTitle}>Chest & Triceps</div>
              <div className={s.heroMetaRow}>
                <span className={s.heroNumber}>6<span className={s.heroNumberUnit}>exercises</span></span>
                <span className={s.heroNumber}>55<span className={s.heroNumberUnit}>min</span></span>
                <button onClick={onViewCoach} className={s.heroCoachBtn}>
                  <Avatar initials="RK" size={20} t={t} color="rgba(255,94,31,0.85)"/>
                  <span className={s.heroCoachLabel}>Coach Rohan</span>
                </button>
              </div>
              <button onClick={onStartWorkout} className={s.heroStartBtn}>
                <span>Start workout</span>
                <span className={s.heroStartBtnArrow}>
                  <Icon name="play" size={10} color="#fff" strokeWidth={2.4}/>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <SectionLabel t={t} action={<span onClick={() => onViewRecovery && onViewRecovery(muscleIdx)} style={{cursor:'pointer'}}>All groups</span>}>Muscle recovery</SectionLabel>
        <div className={`${s.recoveryCard} vis-refract`}>
          <div className={s.recoveryBgA}/>
          <div className={s.recoveryBgB}/>
          <div className={s.recoveryInner}>
            <div className={s.recoveryHeader}>
              <div className={s.recoveryLabel}>{m.l}</div>
              <div className={s.recoveryStrain} data-strain={m.strain.toLowerCase()}>
                <span className={s.recoveryStrainDot}/> {m.strain} strain
              </div>
            </div>
            <div className={s.recoveryBody}>
              <OrbFill value={m.v} size={132}/>
              <div className={s.recoveryStats}>
                <div className={s.recoveryValueRow}>
                  <span className={s.recoveryValue}>{m.v}</span>
                  <span className={s.recoveryUnit}>%</span>
                </div>
                <div className={s.recoveryValueCaption}>recovered</div>
                <div className={s.recoveryMeta}>
                  <div className={s.recoveryMetaItem}>{m.lastTrained}</div>
                  <div className={s.recoveryMetaItem}>{m.tone}</div>
                </div>
              </div>
            </div>
            <div className={s.recoveryNav}>
              <button
                className={s.recoveryNavBtn}
                onClick={() => setMuscleIdx((muscleIdx - 1 + muscles.length) % muscles.length)}
                aria-label="Previous"
              >‹</button>
              <div className={s.recoveryDots}>
                {muscles.map((_, i) => (
                  <span key={i} className={`${s.recoveryDot} ${i === muscleIdx ? s['recoveryDot--active'] : ''}`}/>
                ))}
              </div>
              <button
                className={s.recoveryNavBtn}
                onClick={() => setMuscleIdx((muscleIdx + 1) % muscles.length)}
                aria-label="Next"
              >›</button>
            </div>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <SectionLabel t={t} action="Plan">Up next</SectionLabel>
        <Card t={t} padding={0}>
          {[
            { d: 'Sat', n: '02', s: 'Pull · Back & Biceps', m: '50 min', rest: false },
            { d: 'Sun', n: '03', s: 'Active recovery',       m: '30 min', rest: true },
            { d: 'Mon', n: '04', s: 'Legs · Quad focus',     m: '60 min', rest: false },
          ].map((d, i) => (
            <div key={i} className={s.scheduleRow}>
              <div className={s.scheduleDate}>
                <div className={s.scheduleNum}>{d.n} May</div>
                <div className={s.scheduleDay}>{d.d}</div>
              </div>
              <div className={s.scheduleRail}>
                <div className={`${s.scheduleRailDot} ${d.rest ? s['scheduleRailDot--rest'] : ''}`}/>
              </div>
              <div className={s.scheduleBody}>
                <div className={s.scheduleTitleRow}>
                  <span className={s.scheduleTitle}>{d.s}</span>
                  {d.rest && <span className={s.scheduleRestPill}>Rest</span>}
                </div>
                <div className={s.scheduleSub}>{d.m}</div>
              </div>
              <Icon name="chevronR" size={16} color="var(--gc-ink4)"/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Active Session ──────────────────────────────────────────────────────────
function SetRow({ idx, set, active }) {
  return (
    <div className={`${s.setRow} ${active ? s['setRow--active'] : ''}`}>
      <div className={`${s.setIdx} ${set.done ? s['setIdx--done'] : ''}`}>{idx}</div>
      <div className={`${s.setWeight} ${set.done ? s['setWeight--done'] : ''}`}>
        {set.weight}<span className={s.setUnit}>kg</span>
      </div>
      <div className={`${s.setReps} ${set.done ? s['setReps--done'] : !set.reps ? s['setReps--empty'] : ''}`}>
        {set.reps || '–'}
      </div>
      <div className={`${s.setRpe} ${!set.rpe ? s['setRpe--empty'] : ''}`}>{set.rpe || '–'}</div>
      <div className={s.setStatus}>
        {set.done ? (
          <div className={s.setCheck}>
            <Icon name="check" size={12} color="#fff" strokeWidth={2.6}/>
          </div>
        ) : (
          <div className={`${s.setCircle} ${active ? s['setCircle--active'] : ''}`}/>
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
  const restCirc = 213.6;

  return (
    <div className={s.sessionPage}>
      <div className={s.sessionHead}>
        <button onClick={onClose} className={s.endBtn}>End</button>
        <div className={s.sessionHeadCenter}>
          <div className={s.sessionLive}>
            <span className={s.sessionLiveDot}/>
            Live · {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
          <div className={s.sessionExName}>Bench Press</div>
        </div>
        <IconBtn name="ellipsis" t={t} size={32}/>
      </div>

      <div className={s.restPad}>
        <Card t={t} padding={18} className={`${s.restCard} ${resting ? s['restCard--resting'] : ''}`}>
          <div className={s.restRingWrap}>
            <svg width={80} height={80} className={s.restSvg}>
              <circle cx={40} cy={40} r={34} className={`${s.restCircleBg} ${resting ? s['restCircleBg--resting'] : ''}`} strokeWidth={6}/>
              <circle cx={40} cy={40} r={34} className={`${s.restCircleFg} ${resting ? s['restCircleFg--resting'] : ''}`} strokeWidth={6}
                strokeDasharray={restCirc} strokeDashoffset={restCirc * (1 - restTime / 60)}/>
            </svg>
            <div className={s.restRingCenter}>
              <span className={`${s.restRingNumber} ${resting ? s['restRingNumber--resting'] : ''}`}>0:{String(restTime).padStart(2,'0')}</span>
            </div>
          </div>
          <div className={s.restBody}>
            <div className={s.restEyebrow}>Resting</div>
            <div className={s.restTitle}>Set 3 up next</div>
            <div className={s.restMeta}>92.5 kg × 8</div>
            <div className={s.restButtons}>
              <button onClick={() => { setResting(false); setRestTime(60); }}
                className={`${s.restSkipBtn} ${resting ? s['restSkipBtn--resting'] : ''}`}>
                <Icon name="forward" size={11} color={resting ? 'var(--gc-accent)' : '#fff'}/> Skip
              </button>
              <button className={`${s.restPlusBtn} ${resting ? s['restPlusBtn--resting'] : ''}`}>+15s</button>
            </div>
          </div>
        </Card>
      </div>

      <div className={s.section}>
        <SectionLabel t={t} action="2 / 6">Bench Press</SectionLabel>
        <Card t={t} padding={12}>
          <div className={s.setHeader}>
            {['SET','WEIGHT','REPS','RPE',''].map((h, i) => (
              <div key={i} className={s.setHeaderCell}>{h}</div>
            ))}
          </div>
          {sets.map((set, i) => <SetRow key={i} idx={i+1} set={set} active={i === 2}/>)}
          <button className={s.addSetBtn}>
            <Icon name="plus" size={13} color="var(--gc-accent)"/> Add set
          </button>
        </Card>
      </div>

      <div className={s.section}>
        <SectionLabel t={t}>Up next</SectionLabel>
        <Card t={t} padding={0}>
          {[
            { n: 'Incline DB Press', d: '3 × 10 @ 24kg' },
            { n: 'Cable Fly',        d: '3 × 12 @ 14kg' },
            { n: 'Close-Grip Bench', d: '3 × 8 @ 70kg' },
          ].map((e, i) => (
            <div key={i} className={s.exerciseRow}>
              <div className={s.exerciseIcon}>
                <Icon name="dumbbell" size={14} color="var(--gc-ink2)"/>
              </div>
              <div className={s.exerciseBody}>
                <div className={s.exerciseName}>{e.n}</div>
                <div className={s.exerciseMeta}>{e.d}</div>
              </div>
              <Icon name="chevronR" size={14} color="var(--gc-ink4)"/>
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
  // state: rest / load / peak / recovered — drives brand TensionOrb visual
  const exercises = [
    { name: 'Bench Press',       sets: 4, reps: '6–8',  weight: '90 kg', state: 'recovered' },
    { name: 'Incline DB Press',  sets: 3, reps: '10',   weight: '24 kg', state: 'recovered' },
    { name: 'Cable Fly',         sets: 3, reps: '12',   weight: '14 kg', state: 'load' },
    { name: 'Close-Grip Bench',  sets: 3, reps: '8',    weight: '70 kg', state: 'peak' },
    { name: 'Overhead Press',    sets: 3, reps: '8–10', weight: '50 kg', state: 'rest' },
    { name: 'Tricep Pushdown',   sets: 3, reps: '12',   weight: '20 kg', state: 'rest' },
  ];
  return (
    <div className={s.page}>
      <TopBar t={t} subtitle="Week 6 · Hypertrophy block" title="Workout Plan"
        trailing={<IconBtn name="calendar" t={t}/>}
      />
      <div className={s.weekPad}>
        <Card t={t} padding={16}>
          <div className={s.weekHeader}>
            <span className={s.weekHeaderTitle}>This week</span>
            <span className={s.weekHeaderSub}>4 / 5 sessions</span>
          </div>
          <div className={s.weekStrip}>
            {days.map((day, i) => {
              const tileClass = day.today
                ? `${s.weekTile} ${s['weekTile--today']}`
                : day.done
                  ? `${s.weekTile} ${s['weekTile--done']}`
                  : s.weekTile;
              return (
                <div key={i} className={s.weekDay}>
                  <div className={tileClass}>
                    {day.rest
                      ? <span className={s.weekTileRest}>—</span>
                      : day.done
                        ? <Icon name="check" size={13} color={day.today ? '#fff' : 'var(--gc-accent)'} strokeWidth={2.5}/>
                        : <Icon name="dumbbell" size={12} color="var(--gc-ink4)"/>
                    }
                  </div>
                  <span className={`${s.weekDayLabel} ${day.today ? s['weekDayLabel--today'] : ''}`}>{day.d}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className={s.section}>
        <SectionLabel t={t}>Today · Chest & Triceps</SectionLabel>
        <Card t={t} padding={0}>
          <div className={s.tableHead}>
            <span className={s.tableHeadCell}/>
            {['Exercise','Sets','Reps','Target'].map(h => (
              <span key={h} className={s.tableHeadCell}>{h}</span>
            ))}
          </div>
          {exercises.map((ex, i) => (
            <div key={i} className={s.tableRow}>
              <div className={s.tableOrbCell}><TensionOrb state={ex.state} size={22}/></div>
              <div className={s.tableExName}>{ex.name}</div>
              <div className={s.tableNum}>{ex.sets}</div>
              <div className={s.tableNum}>{ex.reps}</div>
              <div className={s.tableTarget}>{ex.weight}</div>
            </div>
          ))}
        </Card>
        <button onClick={onStartWorkout} className={s.startBtn}>
          <Icon name="play" size={14} color="#fff"/> Start Today's Session
        </button>
      </div>
    </div>
  );
}

// ─── Muscle Recovery Detail ──────────────────────────────────────────────────
function RecoveryDetail({ t, onBack, startIdx = 0 }) {
  const FACTORS = [
    { k: 'sleep',    l: 'Sleep',         color: '#FF5E1F' },
    { k: 'nutrition',l: 'Nutrition',     color: '#FF6A3D' },
    { k: 'training', l: 'Training load', color: '#FFB07A' },
    { k: 'hydration',l: 'Hydration',     color: '#5BCB85' },
  ];
  const groups = [
    { l: 'Shoulders', v: 65, trend: [42,48,52,55,60,62,65], lastTrained: '2 days ago', tone: 'Light isolation only — avoid overhead press.',
      factors: { sleep: 78, nutrition: 84, training: 65, hydration: 88 },
      tip: 'Moderate residual fatigue. Light isolation only; add 5 min mobility to clear it before tomorrow.' },
    { l: 'Legs',      v: 95, trend: [60,68,75,82,88,92,95], lastTrained: '4 days ago', tone: 'Fully recovered. Ready for max load.',
      factors: { sleep: 88, nutrition: 90, training: 25, hydration: 92 },
      tip: 'Legs fully recovered. Tomorrow is a green light for max-effort squats.' },
    { l: 'Back',      v: 88, trend: [55,62,70,76,82,86,88], lastTrained: '3 days ago', tone: 'Recovered. Heavy pulls OK today.',
      factors: { sleep: 82, nutrition: 85, training: 35, hydration: 85 },
      tip: 'Back is fresh. Prioritise compound pulls before isolation.' },
    { l: 'Arms',      v: 58, trend: [30,38,42,48,52,55,58], lastTrained: '2 days ago', tone: 'Today\'s push will hit triceps.',
      factors: { sleep: 72, nutrition: 80, training: 70, hydration: 78 },
      tip: 'Triceps still mending. Keep volume moderate; dose protein in the next meal.' },
    { l: 'Chest',     v: 42, trend: [12,18,24,30,34,38,42], lastTrained: 'Yesterday',  tone: 'Today\'s session targets chest — prep mentally.',
      factors: { sleep: 64, nutrition: 70, training: 90, hydration: 72 },
      tip: 'Heavy chest day yesterday. Warm up thoroughly; start sub-max today.' },
  ];
  const [idx, setIdx] = useState(startIdx);
  const m = groups[idx];

  // Trend chart geometry
  const W = 280, H = 90;
  const maxT = 100;
  const points = m.trend.map((v, i) => {
    const x = (i / (m.trend.length - 1)) * W;
    const y = H - (v / maxT) * (H - 8) - 4;
    return [x, y];
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`;
  const last = points[points.length - 1];

  return (
    <div className={s.page}>
      {/* Reference header: back chevron, "Muscle recovery" title, "All groups" pill */}
      <div className={s.recoveryDetailHeader}>
        <button onClick={onBack} className={s.recoveryDetailBack} aria-label="Back">
          <Icon name="chevronL" size={18} color="var(--gc-ink)" strokeWidth={2.2}/>
          <span>Muscle recovery</span>
        </button>
        <span className={s.recoveryDetailAllPill}>All groups</span>
      </div>

      {/* Hero — title + status pill, then orb + big % */}
      <div className={s.section}>
        <div className={s.recoveryDetailCard}>
          <div className={s.recoveryDetailTop}>
            <div className={s.recoveryDetailTitle}>{m.l}</div>
            <div className={s.recoveryStatusPill}>{m.v}% recovered</div>
          </div>
          <div className={s.recoveryDetailBody}>
            <OrbFill value={m.v} size={156} showStrip={false}/>
            <div className={s.recoveryDetailStats}>
              <div className={s.recoveryValueRow}>
                <span className={s.recoveryValue}>{m.v}</span>
                <span className={s.recoveryUnit}>%</span>
              </div>
              <div className={s.recoveryValueCaption}>recovered</div>
              <div className={s.recoveryDetailMetaList}>
                <div className={s.recoveryDetailMetaItem}>{m.lastTrained}</div>
                <div className={s.recoveryDetailTone}>{m.tone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group selector below hero card */}
      <div className={s.recoveryDetailGroups}>
        {groups.map((g, i) => (
          <button
            key={g.l}
            onClick={() => setIdx(i)}
            className={`${s.recoveryGroupChip} ${i === idx ? s['recoveryGroupChip--active'] : ''}`}
          >{g.l}</button>
        ))}
      </div>

      {/* Trend chart */}
      <div className={s.section}>
        <SectionLabel t={t} action="Last 7 days">Recovery trend</SectionLabel>
        <div className={s.recoveryTrendCard}>
          <div className={s.recoveryTrendBody}>
            <div className={s.recoveryTrendAxis}>
              {['25','50','75','100'].map(p => <span key={p}>{p}%</span>)}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className={s.recoveryTrendSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5E1F" stopOpacity="0.32"/>
                  <stop offset="100%" stopColor="#FF5E1F" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* gridlines at 25/50/75/100 */}
              {[0.25, 0.5, 0.75, 1].map((p, i) => (
                <line key={i} x1="0" x2={W} y1={H - p * (H - 8) - 4} y2={H - p * (H - 8) - 4}
                  stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" strokeDasharray="2 3"/>
              ))}
              <path d={areaD} fill="url(#trendArea)"/>
              <path d={pathD} fill="none" stroke="#FF5E1F" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
              {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 3.2 : 2}
                  fill={i === points.length - 1 ? '#FFDCC4' : '#FF5E1F'}
                  stroke="#E04A11" strokeWidth={i === points.length - 1 ? 1.2 : 0}/>
              ))}
            </svg>
          </div>
          <div className={s.recoveryTrendDays}>
            <span style={{ width: 28 }}/>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => <span key={i}>{d}</span>)}
          </div>
        </div>
      </div>

      {/* Factors with icons + per-factor color */}
      <div className={s.section}>
        <SectionLabel t={t}>Recovery factors</SectionLabel>
        <div className={s.recoveryFactorsCard}>
          {FACTORS.map(f => {
            const v = m.factors[f.k] ?? 0;
            return (
              <div key={f.k} className={s.recoveryFactor}>
                <span className={s.recoveryFactorIcon} style={{ color: f.color, background: `${f.color}1F` }}>
                  <FactorIcon name={f.k} color={f.color}/>
                </span>
                <span className={s.recoveryFactorLabel}>{f.l}</span>
                <div className={s.recoveryFactorTrack}>
                  <div className={s.recoveryFactorFill} style={{ width: `${v}%`, background: f.color, boxShadow: `0 0 10px ${f.color}55` }}/>
                </div>
                <span className={s.recoveryFactorValue}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className={s.section}>
        <div className={s.recoveryTipCard}>
          <div className={s.recoveryTipBadge}>Tip</div>
          <div className={s.recoveryTipBody}>{m.tip}</div>
        </div>
      </div>
    </div>
  );
}

// Factor icons — small line icons for sleep/nutrition/training/hydration
function FactorIcon({ name, color }) {
  const sw = 1.8;
  switch (name) {
    case 'sleep':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'nutrition':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 4c-3 0-5 2-5 5 0 4 5 11 5 11s5-7 5-11c0-3-2-5-5-5zM10 3c0 1 1 2 2 2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'training':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'hydration':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3s-6 7-6 11a6 6 0 1 0 12 0c0-4-6-11-6-11z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return null;
  }
}

// ─── Coach Profile ─────────────────────────────────────────────────────────
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
    <div className={s.page}>
      <div className={s.backRow}>
        <button onClick={onBack} className={s.backBtn}>← Back</button>
      </div>
      <div className={s.coachHero}>
        <div className={s.coachAvatar}>R</div>
        <div className={s.coachName}>Coach Rohan</div>
        <div className={s.coachSub}>Strength & Hypertrophy · Kandivali</div>
        <div className={s.coachStats}>
          {stats.map(stat => (
            <div key={stat.l} className={s.coachStat}>
              <div className={s.coachStatValue}>{stat.v}</div>
              <div className={s.coachStatLabel}>{stat.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.section}>
        <SectionLabel t={t}>Your programme</SectionLabel>
        <Card t={t} padding={16}>
          <div className={s.programmeTitle}>Hypertrophy Block — 12 weeks</div>
          <div className={s.programmeBody}>5-day PPL split focusing on progressive overload. Primary goal: lean mass gain with gradual body recomposition. Currently in week 6.</div>
          <div className={s.programmeTags}>
            {['PPL Split', '5 days/wk', 'Progressive Overload', 'Hypertrophy'].map(tag => (
              <span key={tag} className={s.programmeTag}>{tag}</span>
            ))}
          </div>
        </Card>

        <SectionLabel t={t}>Certifications</SectionLabel>
        <Card t={t} padding={0}>
          {certs.map((c, i) => (
            <div key={i} className={s.certRow}>
              <div className={s.certIcon}>
                <Icon name="star" size={13} color="var(--gc-accent)" strokeWidth={2}/>
              </div>
              <span className={s.certText}>{c}</span>
            </div>
          ))}
        </Card>

        <SectionLabel t={t}>Availability</SectionLabel>
        <Card t={t} padding={0}>
          {schedule.map((row, i) => (
            <div key={i} className={s.scheduleListRow}>
              <span className={s.scheduleListDay}>{row.day}</span>
              <span className={`${s.scheduleListTime} ${row.time === 'Off' ? s['scheduleListTime--off'] : ''}`}>{row.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────
function MiniChart({ data, color, height = 80 }) {
  const w = 300, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 8) + 4;
    const y = h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${w-4},${h} L4,${h} Z`;
  const gradId = `cg${color.replace('#','')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={s.progChart} style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`}/>
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
    <div className={s.page}>
      <TopBar t={t} subtitle="Week 6 · Hypertrophy block" title="Progress" trailing={<IconBtn name="calendar" t={t}/>}/>
      <div className={s.section}>
        <SectionLabel t={t}>Body weight</SectionLabel>
        <Card t={t} padding={16}>
          <div className={s.progHead}>
            <div>
              <Numeric value="78.8" unit="kg" t={t} size={26}/>
              <span className={s.progDelta}>↓ 3.2 kg</span>
            </div>
            <Chip t={t}>12 weeks</Chip>
          </div>
          <MiniChart data={weightData} color={t.good}/>
          <div className={s.progAxis}>
            {['Feb','Mar','Apr','May'].map(m => <span key={m} className={s.progAxisLabel}>{m}</span>)}
          </div>
        </Card>

        <SectionLabel t={t}>Strength — Bench Press 1RM est.</SectionLabel>
        <Card t={t} padding={16}>
          <div className={s.progHead}>
            <div>
              <Numeric value="107" unit="kg" t={t} size={26}/>
              <span className={s.progDelta}>↑ 22.5 kg</span>
            </div>
            <Chip t={t}>12 weeks</Chip>
          </div>
          <MiniChart data={benchData} color={t.accent}/>
        </Card>

        <SectionLabel t={t}>Personal records</SectionLabel>
        <Card t={t} padding={0}>
          {prs.map((p, i) => (
            <div key={i} className={s.prRow}>
              <div className={s.prIcon}>
                <Icon name="star" size={15} color="var(--gc-accent)" strokeWidth={2}/>
              </div>
              <div className={s.prBody}>
                <div className={s.prName}>{p.ex}</div>
                <div className={s.prWeek}>{p.w}</div>
              </div>
              <span className={s.prValue}>{p.val}</span>
            </div>
          ))}
        </Card>

        <SectionLabel t={t}>Body measurements</SectionLabel>
        <Card t={t} padding={14}>
          <div className={s.measureStack}>
            {stats.map(stat => (
              <div key={stat.l} className={s.measureRow}>
                <span className={s.measureLabel}>{stat.l}</span>
                <div className={s.measureBody}>
                  <span className={s.measureBefore}>{stat.before}</span>
                  <Icon name="chevronR" size={12} color="var(--gc-ink4)"/>
                  <span className={s.measureAfter}>{stat.after}</span>
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
function MacroRing({ value, max, color, label }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28, sw = 5, c = 2 * Math.PI * r;
  return (
    <div className={s.macroRing}>
      <div className={s.macroRingWrap}>
        <svg width={66} height={66} className={s.macroRingSvg}>
          <circle cx={33} cy={33} r={r} className={s.macroRingTrack} strokeWidth={sw}/>
          <circle cx={33} cy={33} r={r} className={s.macroRingFg} stroke={color} strokeWidth={sw}
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}/>
        </svg>
        <div className={s.macroRingCenter}>
          <span className={s.macroRingValue}>{value}<span className={s.macroRingValueUnit}>g</span></span>
        </div>
      </div>
      <span className={s.macroRingLabel}>{label}</span>
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
    <div className={s.page}>
      <TopBar t={t} subtitle="Friday · May 1" title="Nutrition" trailing={<IconBtn name="calendar" t={t}/>}/>
      <div className={s.macroSummary}>
        <Card t={t} padding={18}>
          <div className={s.macroHead}>
            <div>
              <div className={s.macroEyebrow}>Daily target</div>
              <div className={s.macroTargetRow}>
                <Numeric value="2,250" t={t} size={28}/>
                <span className={s.macroUnit}>kcal</span>
              </div>
            </div>
            <div className={s.macroConsumedHead}>
              <div className={s.macroConsumedLabel}>Consumed</div>
              <div className={s.macroConsumed}>1,700</div>
            </div>
          </div>
          <ProgressBar value={75} t={t} height={6}/>
          <div className={s.macroRingsRow}>
            <MacroRing value={178} max={200} color={t.accent} label="Protein"/>
            <MacroRing value={230} max={280} color={t.warn} label="Carbs"/>
            <MacroRing value={62} max={75} color={t.good} label="Fat"/>
          </div>
          <div className={s.coachNote}>
            <div className={s.coachNoteTitle}>Coach Rohan's note</div>
            <div className={s.coachNoteBody}>Heavy push day today — prioritise the post-workout shake within 30 min. Hit 180g+ protein.</div>
          </div>
        </Card>
      </div>

      <div className={s.section}>
        <SectionLabel t={t}>Meal schedule</SectionLabel>
        <Card t={t} padding={0}>
          {meals.map((m, i) => (
            <div key={i} className={s.mealRow}>
              <div className={s.mealHead}>
                <div className={s.mealTitleRow}>
                  <span className={s.mealName}>{m.name}</span>
                  <span className={s.mealTime}>{m.time}</span>
                </div>
                <span className={s.mealKcal}>{m.kcal} kcal</span>
              </div>
              <div className={s.mealItems}>
                {m.items.map((item, j) => (
                  <div key={j} className={s.mealItem}>
                    <span className={s.mealItemDot}/>
                    <span className={s.mealItemText}>{item}</span>
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
  const [recoveryIdx, setRecoveryIdx] = useState(null); // null = hidden; else opens detail at idx

  const tabs = [
    { key: 'home',      label: 'Home',      icon: 'home' },
    { key: 'workout',   label: 'Workout',   icon: 'dumbbell' },
    { key: 'progress',  label: 'Progress',  icon: 'progress' },
    { key: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
  ];

  if (inSession) return (
    <div className={s.sessionWrap}>
      <ClientSession t={t} onClose={() => setInSession(false)}/>
    </div>
  );

  if (viewCoach) return (
    <div className={s.coachWrap}>
      <CoachProfile t={t} onBack={() => setViewCoach(false)}/>
    </div>
  );

  if (recoveryIdx !== null) return (
    <div className={s.shell}>
      <div className={s.scroll}>
        <RecoveryDetail t={t} startIdx={recoveryIdx} onBack={() => setRecoveryIdx(null)}/>
      </div>
      <BottomTabBar t={t} tabs={tabs} active={tab} onSelect={setTab}/>
    </div>
  );

  return (
    <div className={s.shell}>
      <div className={s.scroll}>
        {tab === 'home'      && <ClientHome t={t} onStartWorkout={() => setInSession(true)} onViewCoach={() => setViewCoach(true)} onViewRecovery={(i) => setRecoveryIdx(i)}/>}
        {tab === 'workout'   && <ClientWorkout t={t} onStartWorkout={() => setInSession(true)}/>}
        {tab === 'progress'  && <ClientProgress t={t}/>}
        {tab === 'nutrition' && <ClientNutrition t={t}/>}
      </div>
      <BottomTabBar t={t} tabs={tabs} active={tab} onSelect={setTab}/>
    </div>
  );
}
