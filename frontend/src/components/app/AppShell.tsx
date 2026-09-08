import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  BellRing,
  Calculator,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";

import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { alarmEngine, requestBrowserNotifications } from "@/lib/alarm";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Portfolio", to: "/portfolio", icon: Wallet },
  { label: "Price Alerts", to: "/alerts", icon: Bell },
  { label: "Profit Calculator", to: "/calculator", icon: Calculator },
  { label: "Watchlist", to: "/watchlist", icon: Eye },
  { label: "Market", to: "/market", icon: BarChart3 },
  { label: "Settings", to: "/settings", icon: Settings },
];

const MOBILE_NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", to: "/portfolio", icon: Wallet },
  { label: "Alerts", to: "/alerts", icon: Bell },
  { label: "Calculator", to: "/calculator", icon: Calculator },
  { label: "Profile", to: "/settings", icon: User },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
        <BellRing className="size-5 text-primary-foreground" />
      </span>
      <span className="font-display text-[1.05rem] font-semibold leading-none tracking-tight">
        Coin<span className="text-primary">Wake</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AlarmStatusCard() {
  const { alarmSoundEnabled, setAlarmSoundEnabled, alerts } = useStore();
  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  const enable = async () => {
    await alarmEngine.test(0.22);
    await requestBrowserNotifications();
    setAlarmSoundEnabled(true);
  };

  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {alarmSoundEnabled ? (
          <Volume2 className="size-3.5 text-profit" />
        ) : (
          <VolumeX className="size-3.5 text-warn" />
        )}
        {alarmSoundEnabled ? "Alarm armed" : "Alarm muted"}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {alarmSoundEnabled
          ? `Watching ${activeCount} active ${activeCount === 1 ? "alert" : "alerts"}. Go live your life.`
          : "Browsers block audio until you allow it. Enable the alarm so we can wake you up."}
      </p>
      {!alarmSoundEnabled && (
        <Button size="sm" className="mt-2.5 w-full" onClick={() => void enable()}>
          Enable &amp; test alarm
        </Button>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useStore();

  if (!user) {
    return (
      <Button asChild size="sm" className="shrink-0">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-2.5 transition-colors hover:bg-surface">
          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold uppercase text-primary-foreground">
            {user.name.slice(0, 2)}
          </span>
          <span className="hidden max-w-24 truncate text-sm font-medium sm:block">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span>{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings">
            <Settings className="size-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/notifications">
            <Bell className="size-4" /> Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { notifications } = useStore();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <BrandMark className="px-1" />
        <div className="mt-7 flex-1 overflow-y-auto">
          <NavList />
        </div>
        <AlarmStatusCard />
      </aside>

      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-5">
                <BrandMark />
                <div className="mt-7">
                  <NavList onNavigate={() => setMobileNavOpen(false)} />
                </div>
                <div className="mt-5">
                  <AlarmStatusCard />
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-input bg-surface/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface md:max-w-md"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Search crypto…</span>
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium md:inline">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            aria-label="Toggle theme"
                            onClick={() => toggleTheme()}
                          >
                            {theme === "dark" ? (
                              <Moon className="size-5" />
                            ) : (
                              <Sun className="size-5" />
                            )}
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="relative"
                            aria-label="Notifications"
                          >
                            <Link to="/notifications">
                              <Bell className={cn("size-5", pathname === "/notifications" && "text-primary")} />
                              {unread > 0 && (
                                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-loss text-[10px] font-bold text-primary-foreground">
                                  {unread > 9 ? "9+" : unread}
                                </span>
                              )}
                            </Link>
                          </Button>
                                                    <UserMenu />
                                                 </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 md:px-6 md:pb-12">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {title && (
                  <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch">
          {MOBILE_NAV.map(({ label, to, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <CoinSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
