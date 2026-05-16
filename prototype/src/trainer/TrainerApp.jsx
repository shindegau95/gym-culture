import { useState, useEffect } from "react";
import {
  Icon,
  Avatar,
  TopBar,
  IconBtn,
  Card,
  SectionLabel,
  Chip,
  Numeric,
  RingProgress,
  BottomTabBar,
} from "../components/Primitives";
import s from "./TrainerApp.module.css";

const SESSIONS = [
  { time: "07:00", name: "Aarav Mehta", plan: "Push · Wk 4 · Day 2", status: "done", dur: "52 min", initials: "AM", restDay: false },
  { time: "09:30", name: "Priya Shah", plan: "Lower Body · Hypertrophy", status: "live", dur: "00:42", initials: "PS", restDay: false, collision: { name: "Karan Singh", initials: "KS" } },
  { time: "11:00", name: "Rohan Verma", plan: "Pull · Strength Block", status: "next", dur: "60 min", initials: "RV", restDay: false },
  { time: "14:00", name: "Saanvi Desai", plan: "Active recovery · Mobility", status: "upcoming", dur: "30 min", initials: "SD", restDay: true },
  { time: "16:00", name: "Neha Iyer", plan: "Conditioning · HIIT", status: "upcoming", dur: "45 min", initials: "NI", restDay: false },
  { time: "18:30", name: "Aman Thakur", plan: "Push · Wk 3 · Day 1", status: "upcoming", dur: "60 min", initials: "AT", restDay: false },
];

const CLIENTS = [
  { name: "Aarav Mehta", goal: "Muscle Gain", adherence: 94, initials: "AM", plan: "PPL — Wk 4", flagged: false, new: false, weight: [78, 78.5, 79, 79.2, 79.8, 80], bench: [70, 75, 80, 82.5, 85, 87.5] },
  { name: "Priya Shah", goal: "Fat Loss", adherence: 88, initials: "PS", plan: "Hypertrophy", flagged: false, new: false, weight: [65, 64.5, 64, 63.8, 63.5, 63.2], bench: [30, 32.5, 35, 35, 37.5, 40] },
  { name: "Rohan Verma", goal: "Strength", adherence: 76, initials: "RV", plan: "Strength block", flagged: true, new: false, weight: [85, 85, 85.5, 86, 86, 86.5], bench: [80, 85, 90, 90, 92.5, 95] },
  { name: "Saanvi Desai", goal: "Body Recomp", adherence: 91, initials: "SD", plan: "Recomp — Wk 2", flagged: false, new: false, weight: [58, 57.8, 57.5, 57.3, 57, 56.8], bench: [20, 22.5, 25, 25, 27.5, 30] },
  { name: "Neha Iyer", goal: "Endurance", adherence: 82, initials: "NI", plan: "Conditioning", flagged: false, new: true, weight: [70, 70, 69.8, 69.5, 69.2, 69], bench: [40, 42.5, 45, 45, 47.5, 50] },
  { name: "Aman Thakur", goal: "Muscle Gain", adherence: 95, initials: "AT", plan: "Bulk block", flagged: false, new: false, weight: [72, 72.5, 73, 73.5, 74, 74.5], bench: [60, 65, 67.5, 70, 72.5, 75] },
];

const adherenceClass = (v) => v >= 85 ? s['adherenceText--good'] : v >= 70 ? s['adherenceText--warn'] : s['adherenceText--bad'];
const adherenceFillClass = (v) => v >= 90 ? s['adherenceFill--good'] : v >= 80 ? s['adherenceFill--warn'] : s['adherenceFill--bad'];
const adherenceTextClass2 = (v) => v >= 90 ? s['adherenceText--good'] : v >= 80 ? s['adherenceText--warn'] : s['adherenceText--bad'];

// ─── Home / Today ─────────────────────────────────────────────────────────────
function TrainerHome({ t, onSession }) {
  const [focused, setFocused] = useState(1);
  const [query, setQuery] = useState("");
  const fc = SESSIONS[focused];

  const dotClass = (sess) => {
    if (sess.restDay) return s['scheduleDot--rest'];
    if (sess.status === "live") return s['scheduleDot--live'];
    if (sess.status === "done") return s['scheduleDot--done'];
    if (sess.status === "next") return s['scheduleDot--next'];
    return '';
  };

  return (
    <div className={s.page}>
      <TopBar t={t} subtitle="Thursday · May 1" title="Today"
        leading={<Avatar initials="VK" size={32} t={t} ring />}
        trailing={<><IconBtn name="search" t={t} /><IconBtn name="bell" t={t} /></>}
      />

      <div className={s.searchPad}>
        <div className={s.searchBar}>
          <Icon name="search" size={15} color="var(--gc-ink3)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client…" className={s.searchInput} />
          <div className={s.searchAvatars}>
            {SESSIONS.filter(sess => !query || sess.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6).map(sess => {
              const idx = SESSIONS.indexOf(sess);
              const isActive = idx === focused;
              return (
                <button key={sess.time} onClick={() => setFocused(idx)} className={s.searchAvatarBtn}>
                  <Avatar initials={sess.initials} size={30} t={t} ring={isActive} />
                  {sess.status === "live" && <span className={s.searchAvatarBadge} />}
                  {sess.restDay && <span className={`${s.searchAvatarBadge} ${s['searchAvatarBadge--rest']}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={s.heroPad}>
        <div className={s.heroStage}>
          <div className={`${s.hero} vis-refract`}>
            <div className={`${s.heroContent} ${s.heroCard}`}>
            {fc.restDay ? (
              <div className={s.heroRing}>
                <svg width={100} height={100}>
                  <circle cx={50} cy={50} r={44} stroke="var(--gc-fill-tint)" strokeWidth={10} fill="none" strokeDasharray="4 7" />
                </svg>
                <div className={s.heroRingRest}>
                  <Icon name="moon" size={24} color="var(--gc-ink2)" />
                  <span className={s.heroRingRestLabel}>Rest</span>
                </div>
              </div>
            ) : (
              <RingProgress value={fc.status === "done" ? 100 : fc.status === "live" ? 65 : 0} size={100} stroke={10} t={t}>
                {fc.status === "done" ? (
                  <>
                    <Icon name="check" size={28} color="var(--gc-good)" />
                    <span className={s.heroRingDoneLabel}>Done</span>
                  </>
                ) : fc.status === "live" ? (
                  <>
                    <Numeric value="00:42" t={t} size={18} />
                    <span className={s.heroRingLiveLabel}>● Live</span>
                  </>
                ) : (
                  <>
                    <Numeric value={fc.time} t={t} size={16} />
                    <span className={s.heroRingNextLabel}>Up next</span>
                  </>
                )}
              </RingProgress>
            )}
            <div className={s.heroBody}>
              <div className={s.heroEyebrow}>{fc.restDay ? "Rest day" : "Focused client"}</div>
              <div className={s.heroName}>{fc.name}</div>
              <div className={s.heroPlan}>{fc.plan}</div>
              <div className={s.heroStats}>
                {[{ l: "Sessions", v: "6" }, { l: "Active", v: "24" }, { l: "Adherence", v: "87%" }].map(stat => (
                  <div key={stat.l}>
                    <div className={s.heroStatVal}>{stat.v}</div>
                    <div className={s.heroStatLabel}>{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <SectionLabel t={t} action="See all">Schedule</SectionLabel>
        <Card t={t} padding={0}>
          {SESSIONS.map((sess, i) => {
            const isFocused = i === focused;
            return (
              <div key={sess.time} className={s.scheduleItem}>
                <div onClick={() => setFocused(i)} className={`${s.scheduleRow} ${isFocused ? s['scheduleRow--focused'] : ''}`}>
                  {isFocused && <span className={s.scheduleAccentBar} />}
                  <div className={s.scheduleTime}>
                    <div className={s.scheduleTimeNum}>{sess.time}</div>
                    <div className={s.scheduleTimeDur}>{sess.dur}</div>
                  </div>
                  <div className={s.scheduleRail}>
                    <div className={`${s.scheduleDot} ${dotClass(sess)}`} />
                  </div>
                  <div className={`${s.scheduleAvatarStack} ${sess.collision ? s['scheduleAvatarStack--collide'] : ''}`}>
                    <Avatar initials={sess.initials} size={32} t={t} />
                    {sess.collision && (
                      <div className={s.scheduleAvatarSecond}>
                        <Avatar initials={sess.collision.initials} size={32} t={t} color="var(--gc-fill-tint)" />
                      </div>
                    )}
                  </div>
                  <div className={s.scheduleBody}>
                    <div className={s.scheduleTitleRow}>
                      <span className={s.scheduleName}>{sess.name}</span>
                      {sess.collision && <span className={s.collisionPill}>+1</span>}
                      {sess.restDay && <span className={s.restPill}>Rest</span>}
                    </div>
                    <div className={s.schedulePlan}>{sess.plan}</div>
                  </div>
                  {sess.status === "live" ? (
                    <button onClick={(e) => { e.stopPropagation(); onSession(sess); }} className={s.liveBtn}>
                      <span className={s.liveBtnDot} />
                      Live
                    </button>
                  ) : sess.status === "done" ? (
                    <Icon name="check" size={17} color="var(--gc-good)" />
                  ) : (
                    <Icon name="chevronR" size={15} color="var(--gc-ink4)" />
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div className={s.section}>
        <SectionLabel t={t}>Quick actions</SectionLabel>
        <div className={s.quickGrid}>
          {[
            { icon: "plus", label: "New plan", sub: "Build from template" },
            { icon: "people", label: "Add client", sub: "QR onboarding" },
            { icon: "sparkles", label: "AI diet", sub: "Generate macros" },
            { icon: "chart", label: "Reports", sub: "Weekly summary" },
          ].map(a => (
            <Card key={a.label} t={t} padding={14} className={s.quickCard}>
              <div className={s.quickIcon}>
                <Icon name={a.icon} size={18} color="var(--gc-accent)" />
              </div>
              <div className={s.quickLabel}>{a.label}</div>
              <div className={s.quickSub}>{a.sub}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Clients ─────────────────────────────────────────────────────────────────
function ClientDetail({ client, t, onBack }) {
  const [dtab, setDtab] = useState("overview");
  const miniChart = (data, color) => {
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 280 + 4;
      const y = 64 - 4 - ((v - min) / (max - min || 1)) * 52;
      return [x, y];
    });
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    return (
      <svg viewBox="0 0 288 68" preserveAspectRatio="none" className={s.miniChart}>
        <path d={`${path} L284,68 L4,68 Z`} fill={color} fillOpacity="0.1" />
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  };
  return (
    <div className={`${s.page} ${s.shell}`}>
      <div className={s.detailBackPad}>
        <button onClick={onBack} className={s.detailBackBtn}>
          <Icon name="chevronL" size={18} color="var(--gc-accent)" /> Clients
        </button>
      </div>
      <div className={s.detailHero}>
        <Avatar initials={client.initials} size={56} t={t} />
        <div className={s.detailHeroBody}>
          <div className={s.detailName}>{client.name}</div>
          <div className={s.detailGoal}>{client.goal} · {client.plan}</div>
          <div className={s.detailMetaRow}>
            <span className={`${s.adherenceTextLg} ${adherenceClass(client.adherence)}`}>{client.adherence}%</span>
            <span className={s.adherenceLabel}>adherence</span>
            {client.flagged && <Chip t={t}>⚑ Flagged</Chip>}
            {client.new && <Chip t={t} accent>New</Chip>}
          </div>
        </div>
      </div>
      <div className={s.detailTabs}>
        {["overview", "workout", "diet"].map(tab => (
          <button key={tab} onClick={() => setDtab(tab)}
            className={`${s.detailTab} ${dtab === tab ? s['detailTab--active'] : ''}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className={s.section}>
        {dtab === "overview" && (
          <>
            <SectionLabel t={t}>Body weight (6 weeks)</SectionLabel>
            <Card t={t} padding={14}>
              <div className={s.chartHead}>
                <Numeric value={`${client.weight[client.weight.length - 1]}`} unit="kg" t={t} size={22} />
                <span className={`${s.chartDelta} ${s['chartDelta--good']}`}>
                  {client.weight[client.weight.length - 1] < client.weight[0] ? "↓" : "↑"}{" "}
                  {Math.abs(client.weight[client.weight.length - 1] - client.weight[0]).toFixed(1)} kg
                </span>
              </div>
              {miniChart(client.weight, t.good)}
            </Card>
            <SectionLabel t={t}>Bench press (6 weeks)</SectionLabel>
            <Card t={t} padding={14}>
              <div className={s.chartHead}>
                <Numeric value={`${client.bench[client.bench.length - 1]}`} unit="kg" t={t} size={22} />
                <span className={`${s.chartDelta} ${s['chartDelta--accent']}`}>
                  ↑ {(client.bench[client.bench.length - 1] - client.bench[0]).toFixed(1)} kg
                </span>
              </div>
              {miniChart(client.bench, t.accent)}
            </Card>
          </>
        )}
        {dtab === "workout" && (
          <>
            <SectionLabel t={t}>Current plan — {client.plan}</SectionLabel>
            <Card t={t} padding={0}>
              {[
                ["Mon", "Push · Chest, Shoulders, Tri", "6 ex"],
                ["Tue", "Pull · Back, Biceps", "5 ex"],
                ["Wed", "Legs · Quad focus", "6 ex"],
                ["Thu", "Rest · Mobility", "3 ex"],
                ["Fri", "Push · Chest, Triceps", "6 ex"],
                ["Sat", "Pull · Back, Biceps", "5 ex"],
                ["Sun", "Rest · Active recovery", "2 ex"],
              ].map(([d, n, c], i) => (
                <div key={i} className={s.planRow}>
                  <span className={s.planRowDay}>{d}</span>
                  <div className={s.planRowBody}>
                    <div className={s.planRowTitle}>{n}</div>
                    <div className={s.planRowSub}>{c}</div>
                  </div>
                  <Icon name="chevronR" size={14} color="var(--gc-ink4)" />
                </div>
              ))}
            </Card>
          </>
        )}
        {dtab === "diet" && (
          <>
            <SectionLabel t={t}>Nutrition plan</SectionLabel>
            <Card t={t} padding={16}>
              <div className={s.dietHead}>
                <div>
                  <div className={s.dietEyebrow}>Daily target</div>
                  <Numeric value="2,400" unit="kcal" t={t} size={22} />
                </div>
                <div className={s.macroGroup}>
                  {[
                    ["185g", "Protein", "var(--gc-accent)"],
                    ["260g", "Carbs", "var(--gc-warn)"],
                    ["68g", "Fat", "var(--gc-good)"],
                  ].map(([v, l, c]) => (
                    <div key={l} className={s.macroItem}>
                      <div className={s.macroValue} style={{ color: c }}>{v}</div>
                      <div className={s.macroLabel}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.mealsBlock}>
                <div className={s.mealsHead}>Meals</div>
                {[
                  "Breakfast · 500kcal",
                  "Pre-workout · 240kcal",
                  "Lunch · 720kcal",
                  "Post-workout · 340kcal",
                  "Dinner · 600kcal",
                ].map((m, i) => (
                  <div key={i} className={s.mealRow}>
                    <span className={s.mealDot} />
                    <span className={s.mealName}>{m.split(" · ")[0]}</span>
                    <span className={s.mealKcal}>{m.split(" · ")[1]}</span>
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  if (selected) return <ClientDetail client={selected} t={t} onBack={() => setSelected(null)} />;

  const filtered = CLIENTS.filter(c => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "flagged" && !c.flagged) return false;
    if (filter === "new" && !c.new) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <TopBar t={t} subtitle={`${CLIENTS.length} active clients`} title="Clients" trailing={<IconBtn name="plus" t={t} />} />
      <div className={s.searchPadAlt}>
        <div className={`${s.searchBar} ${s['searchBar--alt']}`}>
          <Icon name="search" size={15} color="var(--gc-ink3)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or goal…"
            className={`${s.searchInput} ${s['searchInput--alt']}`} />
        </div>
        <div className={s.filterRow}>
          {["all", "flagged", "new"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`${s.filterBtn} ${filter === f ? s['filterBtn--active'] : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className={s.section}>
        <Card t={t} padding={0}>
          {filtered.map(c => (
            <div key={c.name} onClick={() => setSelected(c)} className={s.clientRow}>
              <div className={s.clientAvatarWrap}>
                <Avatar initials={c.initials} size={40} t={t} />
                {c.new && <span className={s.clientNewDot} />}
              </div>
              <div className={s.clientBody}>
                <div className={s.clientHeadRow}>
                  <span className={s.clientName}>{c.name}</span>
                  {c.flagged && <Icon name="bolt" size={12} color="var(--gc-warn)" />}
                </div>
                <div className={s.clientMeta}>{c.goal} · {c.plan}</div>
              </div>
              <div className={s.clientAdherenceCol}>
                <div className={`${s.adherenceTextLg} ${adherenceClass(c.adherence)}`}>{c.adherence}%</div>
                <div className={s.clientAdherenceLabel}>adherence</div>
              </div>
              <Icon name="chevronR" size={15} color="var(--gc-ink4)" />
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
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const exercises = [
    [
      { name: "Bench Press", sets: "4 × 8", load: "90 kg", muscle: "Chest", rpe: 8 },
      { name: "Incline DB Press", sets: "3 × 10", load: "22 kg", muscle: "Chest", rpe: 7 },
      { name: "Overhead Press", sets: "4 × 6", load: "52 kg", muscle: "Shoulders", rpe: 8 },
      { name: "Lateral Raise", sets: "3 × 12", load: "8 kg", muscle: "Shoulders", rpe: 6 },
      { name: "Tricep Pushdown", sets: "3 × 12", load: "32 kg", muscle: "Triceps", rpe: 7 },
    ],
    [
      { name: "Deadlift", sets: "4 × 5", load: "140 kg", muscle: "Back", rpe: 9 },
      { name: "Pull-Up", sets: "4 × 8", load: "BW", muscle: "Back", rpe: 8 },
      { name: "Barbell Row", sets: "3 × 8", load: "70 kg", muscle: "Back", rpe: 7 },
      { name: "Hammer Curl", sets: "3 × 10", load: "14 kg", muscle: "Biceps", rpe: 7 },
    ],
    [
      { name: "Back Squat", sets: "5 × 5", load: "125 kg", muscle: "Legs", rpe: 9 },
      { name: "Walking Lunge", sets: "3 × 12", load: "20 kg", muscle: "Legs", rpe: 7 },
      { name: "Leg Extension", sets: "3 × 12", load: "50 kg", muscle: "Legs", rpe: 7 },
    ],
    null,
    [
      { name: "Bench Press", sets: "4 × 8", load: "92.5 kg", muscle: "Chest", rpe: 8 },
      { name: "Cable Fly", sets: "3 × 12", load: "14 kg", muscle: "Chest", rpe: 6 },
      { name: "Close-Grip Bench", sets: "3 × 8", load: "70 kg", muscle: "Triceps", rpe: 8 },
      { name: "Dips", sets: "3 × AMRAP", load: "BW", muscle: "Triceps", rpe: 9 },
    ],
    [
      { name: "Deadlift", sets: "4 × 5", load: "145 kg", muscle: "Back", rpe: 9 },
      { name: "Pull-Up", sets: "4 × 8", load: "BW+5", muscle: "Back", rpe: 8 },
      { name: "EZ-Bar Curl", sets: "3 × 10", load: "30 kg", muscle: "Biceps", rpe: 7 },
    ],
    null,
  ];
  const curEx = exercises[day];

  return (
    <div className={s.page}>
      <TopBar t={t} subtitle="Push/Pull/Legs — Week 4" title="Plan builder"
        leading={<IconBtn name="chevronL" t={t} />} trailing={<IconBtn name="ellipsis" t={t} />} />

      <div className={s.heroPad}>
        <Card t={t} padding={12}>
          <div className={s.planWeekStrip}>
            {days.map((d, i) => {
              const isRest = exercises[i] === null;
              const isActive = i === day;
              const cls = `${s.planDayBtn} ${isRest ? s['planDayBtn--rest'] : ''} ${isActive ? s['planDayBtn--active'] : ''}`;
              return (
                <button key={d} onClick={() => setDay(i)} className={cls}>
                  <span className={`${s.planDayLabel} ${isActive ? s['planDayLabel--active'] : ''}`}>{d}</span>
                  {isRest
                    ? <Icon name="moon" size={13} color={isActive ? "#fff" : "var(--gc-ink3)"} />
                    : <Icon name="dumbbell" size={13} color={isActive ? "#fff" : "var(--gc-accent)"} />
                  }
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className={s.section}>
        {curEx ? (
          <>
            <SectionLabel t={t} action="+ Add">Exercises</SectionLabel>
            <Card t={t} padding={0}>
              {curEx.map((e, i) => (
                <div key={i} className={s.exerciseRow}>
                  <div className={s.exerciseNumBox}>
                    <span className={s.exerciseNum}>{i + 1}</span>
                  </div>
                  <div className={s.exerciseBody}>
                    <div className={s.exerciseName}>{e.name}</div>
                    <div className={s.exerciseMeta}>{e.muscle} · RPE {e.rpe}</div>
                  </div>
                  <div className={s.exerciseLoad}>
                    <div className={s.exerciseSets}>{e.sets}</div>
                    <div className={s.exerciseLoadVal}>{e.load}</div>
                  </div>
                  <Icon name="chevronR" size={14} color="var(--gc-ink4)" />
                </div>
              ))}
            </Card>
            <div className={s.aiCard}>
              <Card t={t} padding={14} className={s.aiInner}>
                <div className={s.aiRow}>
                  <div className={s.aiBadge}>
                    <Icon name="sparkles" size={16} color="#fff" />
                  </div>
                  <div className={s.aiBody}>
                    <div className={s.aiHead}>AI suggestion</div>
                    <div className={s.aiText}>
                      Add Chest Fly for upper pec isolation — complements Bench press well on this push day.
                    </div>
                    <button className={s.aiBtn}>
                      <Icon name="plus" size={12} color="#fff" /> Add
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card t={t} padding={24} className={s.restCard}>
            <Icon name="moon" size={32} color="var(--gc-ink3)" className={s.restCardIcon} />
            <div className={s.restCardTitle}>Rest day</div>
            <div className={s.restCardSub}>Active recovery — mobility recommended</div>
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
  const restCirc = 213.6;
  return (
    <div className={s.page}>
      <div className={s.sessionHead}>
        <button onClick={onClose} className={s.endBtn}>End</button>
        <div className={s.sessionHeadCenter}>
          <div className={s.sessionLive}>
            <span className={s.sessionLiveDot} />
            Live · 00:42
          </div>
          <div className={s.sessionClient}>Priya Shah</div>
        </div>
        <IconBtn name="ellipsis" t={t} />
      </div>
      <div className={s.restPad}>
        <Card t={t} padding={18} className={`${s.timerCard} ${resting ? s['timerCard--resting'] : ''}`}>
          <div className={s.timerRing}>
            <svg width={80} height={80} className={s.timerSvg}>
              <circle cx={40} cy={40} r={34} className={`${s.timerCircleBg} ${resting ? s['timerCircleBg--resting'] : ''}`} strokeWidth={6} />
              <circle cx={40} cy={40} r={34} className={`${s.timerCircleFg} ${resting ? s['timerCircleFg--resting'] : ''}`} strokeWidth={6}
                strokeDasharray={restCirc} strokeDashoffset={restCirc * (1 - restTime / 60)} />
            </svg>
            <div className={s.timerCenter}>
              <span className={`${s.timerNumber} ${resting ? s['timerNumber--resting'] : ''}`}>0:{String(restTime).padStart(2, "0")}</span>
            </div>
          </div>
          <div className={s.timerBody}>
            <div className={s.timerEyebrow}>Resting</div>
            <div className={s.timerTitle}>Set 3 up next</div>
            <div className={s.timerMeta}>110 kg × 6 · RPE 8</div>
            <div className={s.timerBtnRow}>
              <button onClick={() => { setResting(false); setRestTime(60); }}
                className={`${s.skipBtn} ${resting ? s['skipBtn--resting'] : ''}`}>
                <Icon name="forward" size={11} color={resting ? 'var(--gc-accent)' : '#fff'} /> Skip
              </button>
              <button className={`${s.plusBtn} ${resting ? s['plusBtn--resting'] : ''}`}>+15s</button>
            </div>
          </div>
        </Card>
      </div>
      <div className={s.section}>
        <SectionLabel t={t} action="2 / 6">Barbell Back Squat</SectionLabel>
        <Card t={t} padding={12}>
          <div className={s.setHeader}>
            {["SET", "WEIGHT", "REPS", "RPE", ""].map((h, i) => (
              <div key={i} className={s.setHeaderCell}>{h}</div>
            ))}
          </div>
          {sets.map((set, i) => {
            const active = i === 2;
            return (
              <div key={i} className={`${s.setRow} ${active ? s['setRow--active'] : ''}`}>
                <div className={`${s.setIdx} ${set.done ? s['setIdx--done'] : ''}`}>{i + 1}</div>
                <div className={`${s.setWeight} ${set.done ? s['setWeight--done'] : ''}`}>
                  {set.weight}<span className={s.setUnit}>kg</span>
                </div>
                <div className={`${s.setReps} ${!set.reps ? s['setReps--empty'] : set.done ? s['setReps--done'] : ''}`}>
                  {set.reps || "–"}
                </div>
                <div className={`${s.setRpe} ${!set.rpe ? s['setRpe--empty'] : ''}`}>{set.rpe || "–"}</div>
                <div className={s.setStatus}>
                  {set.done ? (
                    <div className={s.setCheck}>
                      <Icon name="check" size={12} color="#fff" strokeWidth={2.6} />
                    </div>
                  ) : (
                    <div className={`${s.setCircle} ${active ? s['setCircle--active'] : ''}`} />
                  )}
                </div>
              </div>
            );
          })}
          <button className={s.addSetBtn}>
            <Icon name="plus" size={13} color="var(--gc-accent)" /> Add set
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function TrainerProfile({ t }) {
  const monthStats = [
    { l: "Sessions", v: "112", sub: "+8 vs last month" },
    { l: "Revenue", v: "₹1.1L", sub: "May 2026" },
    { l: "Avg Rating", v: "4.9★", sub: "from 38 reviews" },
  ];
  const certs = ["NSCA-CSCS", "Precision Nutrition L1", "FMS Level 2"];
  const specialties = ["Strength & Hypertrophy", "Progressive Overload", "Fat Loss", "Powerlifting"];
  const settings = [
    { label: "Session reminders", sub: "30 min before each session", toggle: true, on: true },
    { label: "Client progress alerts", sub: "Notify on missed sessions", toggle: true, on: true },
    { label: "Payment notifications", sub: "When client fee is logged", toggle: true, on: false },
    { label: "Branch", sub: "Kandivali, Mumbai", toggle: false },
    { label: "Contact", sub: "+91 98001 12345", toggle: false },
    { label: "Member since", sub: "March 2020", toggle: false },
  ];
  const topClients = CLIENTS.slice(0, 3);

  return (
    <div className={s.page}>
      <div className={s.profileHero}>
        <div className={s.profileHeroBg} />
        <div className={s.profileAvatar}>V</div>
        <div className={s.profileName}>Vikram Khanna</div>
        <div className={s.profileSub}>Personal Trainer · Kandivali</div>
        <div className={s.specialtyRow}>
          {specialties.map(sp => (
            <span key={sp} className={s.specialty}>{sp}</span>
          ))}
        </div>
      </div>

      <div className={s.section}>
        <div className={s.statsGrid}>
          {monthStats.map(stat => (
            <Card t={t} key={stat.l} padding={14}>
              <div className={s.statValue}>{stat.v}</div>
              <div className={s.statLabel}>{stat.l}</div>
              <div className={s.statSub}>{stat.sub}</div>
            </Card>
          ))}
        </div>

        <SectionLabel t={t}>Client adherence</SectionLabel>
        <Card t={t} padding={0}>
          {topClients.map(c => (
            <div key={c.name} className={s.adherenceRow}>
              <Avatar initials={c.initials} size={36} t={t} />
              <div className={s.adherenceBody}>
                <div className={s.adherenceName}>{c.name}</div>
                <div className={s.adherenceMeta}>{c.goal} · {c.plan}</div>
                <div className={s.adherenceTrack}>
                  <div className={`${s.adherenceFill} ${adherenceFillClass(c.adherence)}`}
                    style={{ width: `${c.adherence}%` }} />
                </div>
              </div>
              <span className={`${s.adherenceText} ${adherenceTextClass2(c.adherence)}`}>{c.adherence}%</span>
            </div>
          ))}
          <div className={s.seeAllRow}>
            <span className={s.seeAllText}>See all {CLIENTS.length} clients →</span>
          </div>
        </Card>

        <SectionLabel t={t}>Certifications</SectionLabel>
        <Card t={t} padding={0}>
          {certs.map(c => (
            <div key={c} className={s.certRow}>
              <div className={s.certIcon}>
                <Icon name="star" size={14} color="var(--gc-accent)" strokeWidth={2} />
              </div>
              <span className={s.certText}>{c}</span>
            </div>
          ))}
        </Card>

        <SectionLabel t={t}>Settings</SectionLabel>
        <Card t={t} padding={0}>
          {settings.map(item => (
            <div key={item.label} className={s.settingRow}>
              <div className={s.settingBody}>
                <div className={s.settingLabel}>{item.label}</div>
                <div className={s.settingSub}>{item.sub}</div>
              </div>
              {item.toggle ? (
                <div className={`${s.toggle} ${item.on ? s['toggle--on'] : ''}`}>
                  <div className={s.toggleNub} />
                </div>
              ) : (
                <Icon name="chevronR" size={14} color="var(--gc-ink4)" />
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
  const [tab, setTab] = useState("home");
  const [inSession, setInSession] = useState(false);
  const tabs = [
    { key: "home", label: "Today", icon: "home" },
    { key: "clients", label: "Clients", icon: "people" },
    { key: "plan", label: "Plan", icon: "workout" },
    { key: "profile", label: "Profile", icon: "profile" },
  ];
  if (inSession) return (
    <div className={s.sessionShell}>
      <TrainerSession t={t} onClose={() => setInSession(false)} />
    </div>
  );
  return (
    <div className={s.shell}>
      <div className={s.scroll}>
        {tab === "home" && <TrainerHome t={t} onSession={() => setInSession(true)} />}
        {tab === "clients" && <TrainerClients t={t} />}
        {tab === "plan" && <TrainerPlan t={t} />}
        {tab === "profile" && <TrainerProfile t={t} />}
      </div>
      <BottomTabBar t={t} tabs={tabs} active={tab} onSelect={setTab} />
    </div>
  );
}
