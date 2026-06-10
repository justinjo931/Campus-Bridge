import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import logoAsset from "@/assets/mgr-logo-official.png";
const logo = logoAsset;
import {
  LayoutDashboard, Users, MessagesSquare, BookOpen, Briefcase,
  Bell, Bookmark, UserCircle2, LogOut, Search, ShieldCheck, Loader2,
  TrendingUp, Sparkles, Target, Trophy, Flame, ChevronDown, Check,
} from "lucide-react";
import { getUser, signOut, type AuthUser, type Role } from "@/lib/auth";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mentorship", icon: Users, label: "Mentors" },
  { to: "/forum", icon: MessagesSquare, label: "Forum" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/placements", icon: Briefcase, label: "Placements" },
  { to: "/chat", icon: MessagesSquare, label: "Messages" },
  { to: "/profile", icon: UserCircle2, label: "Profile" },
  { to: "/admin", icon: ShieldCheck, label: "Admin" },
];

const newFeatures = [
  { to: "/dashboard", icon: TrendingUp, label: "Journey", color: "text-blue-500" },
  { to: "/dashboard", icon: Sparkles, label: "AI Career Twin", color: "text-violet-500" },
  { to: "/dashboard", icon: Target, label: "Dream Company", color: "text-rose-500" },
  { to: "/dashboard", icon: TrendingUp, label: "Career Wrapped", color: "text-emerald-500" },
  { to: "/dashboard", icon: Trophy, label: "Hall of Fame", color: "text-amber-500" },
];

const days = ["M", "T", "W", "T", "F", "S", "S"];

export function AppShell({
  children,
  title,
  subtitle,
  requireRole,
  hideHero,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  requireRole?: Role;
  hideHero?: boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/login", search: { redirect: pathname } as never, replace: true });
      setUser(null);
      return;
    }
    if (requireRole && u.role !== requireRole) {
      navigate({ to: "/dashboard", replace: true });
      setUser(null);
      return;
    }
    setUser(u);
  }, [navigate, pathname, requireRole]);

  function handleLogout() {
    signOut();
    navigate({ to: "/login", replace: true });
  }

  if (user === "loading" || user === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Verifying access…
        </div>
      </div>
    );
  }

  const visibleNav = nav.filter((n) => n.to !== "/admin" || user.role === "admin");

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.008_250)]">
      <div className="mx-auto max-w-[1600px] grid lg:grid-cols-[260px_1fr] gap-5 p-4 lg:p-5">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col rounded-3xl bg-card border border-border shadow-soft p-4 sticky top-5 self-start h-[calc(100vh-2.5rem)] overflow-y-auto">
          <Link to="/" className="flex items-center gap-3 px-2 py-2">
            <img src={logo} alt="MGR" width={40} height={40} className="rounded-lg" />
            <div>
              <div className="text-[15px] font-bold leading-tight">CampusBridge</div>
              <div className="text-[10px] text-muted-foreground">Dr. M.G.R. University</div>
            </div>
          </Link>

          <nav className="mt-4 space-y-1">
            {visibleNav.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <n.icon className="size-4" /> {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-border" />

          <div className="space-y-1">
            {newFeatures.map((f) => (
              <Link
                key={f.label}
                to={f.to}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="flex items-center gap-3">
                  <f.icon className={`size-4 ${f.color}`} /> {f.label}
                </span>
                <span className="text-[9px] font-bold tracking-wider text-primary bg-accent px-1.5 py-0.5 rounded">
                  NEW
                </span>
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* Streak card */}
          <div className="mt-4 rounded-2xl border border-border bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold">
              <Flame className="size-4 text-orange-500" /> 12-Day Streak
              <Flame className="size-4 text-orange-500" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Keep learning to maintain your streak!
            </p>
            <div className="mt-3 flex items-center justify-between">
              {days.map((d, i) => {
                const done = i < 5;
                const today = i === 5;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`size-5 grid place-items-center rounded-full text-[8px] font-bold ${
                        done
                          ? "bg-blue-500 text-white"
                          : today
                          ? "bg-amber-400 text-white ring-2 ring-amber-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done && <Check className="size-2.5" strokeWidth={3} />}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-muted-foreground mt-2.5">Longest Streak: 28 days</div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </aside>

        {/* MAIN */}
        <main className="min-w-0">
          <header className="flex items-center gap-3 rounded-2xl bg-card border border-border shadow-soft px-4 py-2.5 mb-5">
            <div className="flex items-center gap-2 flex-1 max-w-2xl rounded-full bg-muted/60 px-4 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <input
                placeholder="Search mentors, resources, forums..."
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex-1" />
            <button className="relative size-9 grid place-items-center rounded-full hover:bg-muted">
              <Bell className="size-[18px]" />
              <span className="absolute top-1 right-1 size-4 grid place-items-center bg-rose-500 text-white text-[9px] font-bold rounded-full">3</span>
            </button>
            <button className="size-9 grid place-items-center rounded-full hover:bg-muted">
              <Bookmark className="size-[18px]" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-border">
              <img
                src={`https://i.pravatar.cc/64?u=${encodeURIComponent(user.email)}`}
                alt=""
                className="size-9 rounded-full object-cover ring-2 ring-white"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-tight">Justinjo931</div>
                <div className="text-[11px] text-muted-foreground capitalize">{user.role}</div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </header>

          {!hideHero && (title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
