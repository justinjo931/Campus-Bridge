import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, Target, BrainCircuit, Sparkles, Mail, ArrowRight,
  Trophy, Crown, Award, Star, Flame, Shield, FileText, Map, Briefcase,
  MessageSquare, Wand2, Lightbulb, Lock, ChevronRight, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CampusBridge" }] }),
  component: Dashboard,
});

/* ---------- helpers ---------- */

function GrowthChart() {
  const pts = [18, 32, 50, 62, 70, 78];
  const w = 520, h = 200, pad = 28;
  const step = (w - pad * 2) / (pts.length - 1);
  const coords = pts.map((v, i) => [pad + i * step, h - pad - (v / 100) * (h - pad * 2)] as const);
  const line = coords.map((c, i) => (i === 0 ? `M ${c[0]} ${c[1]}` : `L ${c[0]} ${c[1]}`)).join(" ");
  const area = `${line} L ${coords.at(-1)![0]} ${h - pad} L ${coords[0][0]} ${h - pad} Z`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)}
                stroke="currentColor" className="text-border" strokeDasharray="3 4" strokeWidth="0.6" />
        ))}
        {["100%", "75%", "50%", "25%", "0%"].map((l, i) => (
          <text key={l} x={4} y={pad + i * ((h - pad * 2) / 4) + 3} className="fill-muted-foreground" fontSize="8">{l}</text>
        ))}
        <path d={area} fill="url(#ag)" />
        <path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />
        ))}
        {/* End label */}
        <g transform={`translate(${coords.at(-1)![0] - 22}, ${coords.at(-1)![1] - 26})`}>
          <rect width="44" height="20" rx="6" fill="#3b82f6" />
          <text x="22" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">78%</text>
        </g>
      </svg>
      <div className="flex justify-between px-7 text-[10px] text-muted-foreground -mt-1">
        {["Joined", "1 Month", "2 Months", "3 Months"].map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function Bar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-medium w-28">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right">{value}%</span>
    </div>
  );
}

function RadarChart() {
  const labels = ["Coding", "DSA", "Communication", "Cloud", "AI/ML", "Leadership"];
  const values = [85, 78, 70, 62, 80, 68];
  const cx = 130, cy = 130, R = 90;
  const angle = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const pt = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;
  const poly = values.map((v, i) => pt(i, (v / 100) * R).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 260" className="w-full h-56">
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={Array.from({ length: 6 }, (_, i) => pt(i, R * s).join(",")).join(" ")}
          fill="none" stroke="currentColor" className="text-border" strokeWidth="0.7"
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i, R)[0]} y2={pt(i, R)[1]} stroke="currentColor" className="text-border" strokeWidth="0.5" />
      ))}
      <polygon points={poly} fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="2" />
      {values.map((_, i) => {
        const [x, y] = pt(i, (values[i] / 100) * R);
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + 18);
        return (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10"
                className="fill-foreground" fontWeight="600">{l}</text>
        );
      })}
    </svg>
  );
}

/* ---------- main ---------- */

function Dashboard() {
  const heroStats = [
    { icon: TrendingUp, label: "Growth Score", value: "78%", sub: "↑ 8%", subMuted: "vs last month", tone: "text-emerald-600" },
    { icon: Shield, label: "Level", value: "Level 8", sub: "Builder", iconBg: "from-blue-500 to-indigo-500" },
    { icon: Flame, label: "Streak", value: "12 Days", sub: "Keep it up!", iconClr: "text-orange-500" },
    { icon: Trophy, label: "Rank", value: "#12", sub: "Among AI Students", iconClr: "text-amber-500" },
    { icon: Target, label: "Dream Company", value: "Zoho", sub: "Readiness: 62%", iconClr: "text-rose-500" },
  ];

  const aiActions = [
    { icon: FileText, label: "Improve my Resume" },
    { icon: Map, label: "Suggest a Roadmap" },
    { icon: Briefcase, label: "Find Internships" },
    { icon: MessageSquare, label: "Prepare for Interviews" },
    { icon: Wand2, label: "Recommend Skills" },
  ];

  return (
    <AppShell hideHero>
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-5">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-soft p-6 lg:p-7">
            <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-90 hidden md:block">
              {/* 3D growth illustration */}
              <svg viewBox="0 0 320 280" className="w-full h-full">
                <defs>
                  <linearGradient id="bar1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="bar2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="arrowG" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <ellipse cx="180" cy="240" rx="120" ry="10" fill="#3b82f6" opacity="0.08" />
                <rect x="90" y="180" width="34" height="60" rx="6" fill="url(#bar2)" opacity="0.55" />
                <rect x="135" y="150" width="34" height="90" rx="6" fill="url(#bar2)" opacity="0.7" />
                <rect x="180" y="120" width="34" height="120" rx="6" fill="url(#bar1)" />
                <rect x="225" y="90" width="34" height="150" rx="6" fill="url(#bar1)" />
                <path d="M 80 210 Q 150 180 220 130 T 285 50" fill="none" stroke="url(#arrowG)" strokeWidth="6" strokeLinecap="round" />
                <polygon points="280,40 295,55 270,65" fill="#3b82f6" />
              </svg>
            </div>

            <div className="relative">
              <h1 className="text-[28px] font-bold tracking-tight">Good Evening, Justin 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">Keep pushing forward! You're building your future every day.</p>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {heroStats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-white/70 backdrop-blur p-3.5 shadow-soft">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <s.icon className={`size-3.5 ${s.iconClr ?? "text-muted-foreground"}`} />
                      {s.label}
                    </div>
                    <div className="text-lg font-bold mt-1.5 leading-tight">{s.value}</div>
                    <div className={`text-[11px] mt-0.5 ${s.tone ?? "text-muted-foreground"}`}>
                      {s.sub} {s.subMuted && <span className="text-muted-foreground">{s.subMuted}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-elegant">
                  Continue Journey <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button variant="outline" className="rounded-xl">View My Profile</Button>

                <div className="ml-auto hidden lg:block rounded-2xl bg-white/80 backdrop-blur border border-border shadow-soft p-3 w-64">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-blue-500" /> You're doing great!
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">5 milestones achieved</div>
                  <Progress value={62} className="h-1.5 mt-2" />
                  <button className="text-[11px] text-primary font-semibold mt-2">View Milestones →</button>
                </div>
              </div>
            </div>
          </section>

          {/* ROW 1 */}
          <section className="grid lg:grid-cols-3 gap-5">
            {/* Journey */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="size-4 text-blue-500" /> CampusBridge Journey
                </div>
                <select className="text-[11px] text-muted-foreground border border-border rounded-lg px-2 py-1 bg-card">
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Overall Growth Score</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-blue-600">78%</div>
                <div className="text-xs font-semibold text-emerald-600">↑ 32% <span className="text-muted-foreground font-normal">since you joined</span></div>
              </div>
              <div className="mt-2 rounded-2xl bg-gradient-to-br from-sky-50/60 to-blue-50/30 border border-sky-100/60 p-2">
                <GrowthChart />
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ["Skills Improved", "+18", "text-blue-500"],
                  ["Connections Made", "+32", "text-violet-500"],
                  ["Certifications Earned", "+6", "text-amber-500"],
                  ["Sessions Attended", "+14", "text-emerald-500"],
                  ["Projects Built", "+4", "text-rose-500"],
                ].map(([l, v, c]) => (
                  <li key={l} className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 text-muted-foreground`}>
                      <span className={`size-1.5 rounded-full ${c.replace("text-", "bg-")}`} /> {l}
                    </span>
                    <span className="font-bold tabular-nums">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 px-3.5 py-3">
                <p className="text-xs text-foreground leading-relaxed">
                  <Sparkles className="size-3.5 inline text-blue-500 mr-1" />
                  <span className="font-semibold">Amazing progress!</span> You've grown 32% in the last 3 months.
                  <br />
                  <span className="text-muted-foreground">Keep going! Your consistency is your superpower. 🚀</span>
                </p>
              </div>
            </div>

            {/* Dream Company */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="size-4 text-rose-500" /> Dream Company Tracker
                </div>
                <button className="text-[11px] text-primary font-semibold">View All</button>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-white border border-border grid place-items-center font-bold text-[10px] tracking-wider text-rose-600">ZOHO</div>
                  <div className="font-semibold text-sm">Zoho Corporation</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Readiness Score</div>
                  <div className="text-xl font-bold text-blue-600">62%</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Bar label="Aptitude" value={80} color="bg-emerald-500" icon={BrainCircuit} />
                <Bar label="DSA" value={45} color="bg-amber-500" icon={BrainCircuit} />
                <Bar label="Projects" value={70} color="bg-emerald-500" icon={Briefcase} />
                <Bar label="System Design" value={40} color="bg-amber-500" icon={Map} />
                <Bar label="Communication" value={75} color="bg-emerald-500" icon={MessageSquare} />
              </div>
              <div className="mt-5 rounded-2xl bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground flex items-center gap-2">
                ⏱ Estimated readiness in <span className="font-semibold text-foreground">6 months</span>
              </div>
            </div>

            {/* Placement Probability */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BrainCircuit className="size-4 text-violet-500" /> Placement Probability
                </div>
                <span className="rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold px-2 py-0.5">AI-Powered Insights</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { l: "Service Companies", v: 90, t: "High Chance", bg: "bg-emerald-50 border-emerald-100", clr: "text-emerald-600", sub: "text-emerald-600" },
                  { l: "Product Companies", v: 65, t: "Good Chance", bg: "bg-blue-50 border-blue-100", clr: "text-blue-600", sub: "text-blue-600" },
                  { l: "Startups", v: 80, t: "High Chance", bg: "bg-emerald-50 border-emerald-100", clr: "text-emerald-600", sub: "text-emerald-600" },
                  { l: "Core Companies", v: 50, t: "Moderate Chance", bg: "bg-amber-50 border-amber-100", clr: "text-amber-600", sub: "text-amber-600" },
                ].map((c) => (
                  <div key={c.l} className={`rounded-2xl border ${c.bg} p-3.5`}>
                    <div className="text-[11px] text-muted-foreground font-medium">{c.l}</div>
                    <div className={`text-2xl font-bold mt-1 ${c.clr}`}>{c.v}%</div>
                    <div className={`text-[11px] mt-0.5 ${c.sub} font-medium`}>{c.t}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full rounded-xl">
                View Detailed Analysis <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </section>

          {/* ROW 2 */}
          <section className="grid lg:grid-cols-3 gap-5">
            {/* Career Wrapped 2026 */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-violet-500" /> Career Wrapped 2026
                </div>
                <span className="text-[10px] font-semibold rounded-full bg-violet-100 text-violet-700 px-2 py-0.5">Preview</span>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-5 text-white"
                style={{ background: "linear-gradient(135deg,#0b1e54 0%,#3b1e8a 50%,#6b21a8 100%)" }}>
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 300" preserveAspectRatio="none">
                  <path d="M0,180 Q75,140 150,180 T300,180 L300,300 L0,300 Z" fill="#a855f7" opacity="0.4" />
                  <path d="M0,210 Q75,170 150,210 T300,210 L300,300 L0,300 Z" fill="#ec4899" opacity="0.3" />
                </svg>
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl font-extrabold tracking-tight">2026</div>
                    <Button size="sm" className="rounded-full bg-white text-violet-900 hover:bg-white/90 text-xs h-7">
                      See Full Wrap
                    </Button>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Your year. Your growth. Your story.</p>
                  <div className="mt-5 grid grid-cols-4 gap-2 text-xs">
                    {[
                      ["📁", "Projects Built", "8"],
                      ["🛡️", "Certifications", "5"],
                      ["⚡", "Problems Solved", "320"],
                      ["👥", "Connections Made", "45"],
                    ].map(([e, l, v]) => (
                      <div key={l}>
                        <div className="text-base">{e}</div>
                        <div className="text-[9px] opacity-75 mt-1 leading-tight">{l}</div>
                        <div className="font-bold text-base">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] opacity-70">Top Skill</div>
                        <div className="font-bold text-sm">Python</div>
                      </div>
                      <div>
                        <div className="text-[10px] opacity-70">Growth Score</div>
                        <div className="font-bold text-sm text-emerald-300">+78%</div>
                      </div>
                    </div>
                    <div className="size-10 rounded-full bg-emerald-400 grid place-items-center">
                      <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.4c-.2.3-.5.4-.8.2-2.2-1.3-5-1.6-8.3-.9-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 3.6-.8 6.7-.4 9.1 1.1.4.2.5.6.3.9zm1.2-2.7c-.2.4-.6.5-1 .3-2.5-1.5-6.3-2-9.3-1.1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.4-1 7.6-.5 10.5 1.3.3.2.5.7.3 1zm.1-2.8c-3-1.8-7.9-2-10.8-1.1-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.4-1 8.7-.8 12.1 1.3.5.3.7.9.4 1.4-.3.4-.9.5-1.1.2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Me Letter */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-rose-500" /> Future Me Letter
              </div>
              <p className="text-xs text-muted-foreground mt-2">Your future self is waiting!</p>

              <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5">
                <div className="text-[10px] text-muted-foreground">You wrote a letter on</div>
                <div className="text-sm font-bold mt-0.5">📜 06 June 2026</div>
              </div>

              <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Lock className="size-3" /> Unlocks on
                </div>
                <div className="text-sm font-bold mt-0.5">🔒 06 June 2027</div>
              </div>

              <div className="flex-1" />
              <Button variant="outline" className="mt-4 w-full rounded-xl bg-violet-50/50 border-violet-200 text-violet-700 hover:bg-violet-100">
                View Letter
              </Button>
            </div>

            {/* Leaderboard */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="size-4 text-amber-500" /> Top Mentors Leaderboard
                </div>
                <button className="text-[11px] text-primary font-semibold flex items-center">View All <ChevronRight className="size-3" /></button>
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  { rank: 1, name: "Arun Prakash", badge: "Hall of Fame", img: 11, score: 982, rating: 4.9, Icon: Crown, badgeClr: "bg-amber-100 text-amber-700", rankClr: "bg-amber-500" },
                  { rank: 2, name: "Harini S.", badge: "Platinum", img: 32, score: 876, rating: 4.8, Icon: Award, badgeClr: "bg-slate-200 text-slate-700", rankClr: "bg-slate-400" },
                  { rank: 3, name: "Vignesh K.", badge: "Gold", img: 13, score: 764, rating: 4.6, Icon: Award, badgeClr: "bg-yellow-100 text-yellow-700", rankClr: "bg-orange-400" },
                ].map((m) => (
                  <li key={m.rank} className="flex items-center gap-3">
                    <div className={`size-7 grid place-items-center rounded-full ${m.rankClr} text-white text-xs font-bold`}>{m.rank}</div>
                    <img src={`https://i.pravatar.cc/80?img=${m.img}`} alt={m.name} className="size-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{m.name}</div>
                      <div className={`inline-flex items-center gap-1 mt-0.5 rounded-full ${m.badgeClr} text-[10px] font-semibold px-2 py-0.5`}>
                        <m.Icon className="size-2.5" /> {m.badge}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground">Impact Score</div>
                      <div className="text-sm font-bold tabular-nums flex items-center justify-end gap-1">
                        {m.score}
                        <Star className="size-3 fill-amber-400 text-amber-400 ml-1" />
                        <span className="text-xs">{m.rating}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* RIGHT RAIL */}
        <aside className="space-y-5">
          {/* AI Assistant */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="size-8 grid place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1">CampusBridge AI <Sparkles className="size-3 text-amber-400" /></div>
                <div className="text-[11px] text-muted-foreground">Your personal career assistant</div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mt-4 mb-2">How can I help you today?</div>
            <div className="space-y-1.5">
              {aiActions.map((a) => (
                <button key={a.label} className="w-full flex items-center gap-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/40 px-3 py-2.5 text-[13px] font-medium text-left transition-colors">
                  <a.icon className="size-4 text-blue-500" />
                  <span className="flex-1">{a.label}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button className="w-full mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-95 shadow-elegant">
              <Sparkles className="size-4 mr-1.5" /> Chat with AI
            </Button>
          </div>

          {/* Skill DNA */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="size-4 text-blue-500" /> Skill DNA
              </div>
              <button className="text-[11px] text-primary font-semibold">View Full</button>
            </div>
            <RadarChart />
            <div className="mt-2 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] flex items-start gap-2">
              <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <span><span className="font-semibold">Tip:</span> Focus more on DSA & System Design</span>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
