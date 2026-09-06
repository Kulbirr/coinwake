import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calculator,
  Eye,
  LineChart,
  Siren,
  Smartphone,
  Target,
  TrendingUp,
} from "lucide-react";

import { BrandMark } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta } from "@/components/app/Delta";
import { PriceChart } from "@/components/app/PriceChart";
import { PriceValue } from "@/components/app/PriceValue";
import { CoinSparkline } from "@/components/app/Sparkline";
import { Button } from "@/components/ui/button";
import type { Coin } from "@/lib/api";
import { formatCompact } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Landing,
});

const PREVIEW_IDS = ["bitcoin", "ethereum", "solana", "bonk"];
const WATCH_IDS = ["solana", "bonk", "pepe", "sui"];

const isCoin = (c: Coin | undefined): c is Coin => c !== undefined;

const FEATURES = [
  {
    icon: Bell,
    emoji: "🔔",
    title: "Smart Price Alerts",
    body: "Set as many price and market-cap targets per coin as you like. Above, below, one-time or recurring.",
  },
  {
    icon: Siren,
    emoji: "🚨",
    title: "Loud CoinWake",
    body: "A full-screen, repeating alarm that won't stop until you tap it. Impossible to sleep through a moonshot.",
  },
  {
    icon: Calculator,
    emoji: "💰",
    title: "Profit Calculator",
    body: "Know exactly what your bag is worth at any price — or any market cap — before you ape in.",
  },
  {
    icon: Target,
    emoji: "📈",
    title: "Market Cap Targets",
    body: "Think in market caps, not prices. We convert with real circulating supply, never total supply.",
  },
  {
    icon: Eye,
    emoji: "👀",
    title: "Watchlists",
    body: "Track the coins you care about with live prices, distance-to-target and instant alerting.",
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Push Notifications",
    body: "Browser and push notifications wherever you are. Set your target, then go live your life.",
  },
];

function DashboardPreview() {
  const { coins } = useStore();
  const preview = PREVIEW_IDS.map((id) => coins.find((c) => c.id === id)).filter(isCoin);
  const lead = preview[0];
  const sol = coins.find((c) => c.id === "solana");

  if (!lead || !sol) return null;

  return (
    <div className="glass rounded-3xl p-3 shadow-glow md:p-4">
      <div className="rounded-2xl border border-border bg-background/60 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Portfolio Value
            </div>
            <div className="num mt-1 text-2xl font-semibold md:text-3xl">$12,450</div>
          </div>
          <Delta value={24.5} size="md" />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <PriceChart coin={lead} range="7D" height={150} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border bg-surface/60 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bell className="size-3.5 text-primary" /> Active alert
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <CoinLogo coin={sol} size={24} />
              <span className="text-sm font-semibold">SOL → $250</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              {/* A fixed width, like the figures around it: this card is a product
                  illustration, and real alert progress is the server's to report. */}
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/60 p-3">
            <div className="text-xs text-muted-foreground">Total Profit</div>
            <div className="num mt-1 text-lg font-semibold text-profit">+$7,450</div>
            <div className="mt-1 text-xs text-profit">ROI +149%</div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {preview.map((coin) => (
            <div key={coin.id} className="flex items-center gap-3 rounded-lg px-1 py-1">
              <CoinLogo coin={coin} size={26} />
              <span className="text-sm font-medium">{coin.symbol}</span>
              <CoinSparkline coinId={coin.id} width={64} height={22} />
              <PriceValue value={coin.price} className="ml-auto text-sm" />
              <Delta value={coin.change24h} arrow={false} className="w-16 justify-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveWatchRows() {
  const { coins } = useStore();
  const rows = WATCH_IDS.map((id) => coins.find((c) => c.id === id)).filter(isCoin);

  return (
    <>
      {rows.map((coin) => (
        <div
          key={coin.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3"
        >
          <CoinLogo coin={coin} size={30} />
          <div>
            <div className="text-sm font-medium">{coin.symbol}</div>
            <div className="text-xs text-muted-foreground">{formatCompact(coin.marketCap)}</div>
          </div>
          <CoinSparkline coinId={coin.id} width={72} height={26} />
          <div className="ml-auto text-right">
            <PriceValue value={coin.price} className="text-sm font-semibold" />
            <div className="mt-0.5">
              <Delta value={coin.change24h} arrow={false} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Open dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-profit opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-profit" />
              </span>
              Live market watch · 12 coins tracked
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Never Miss Your <span className="text-gradient">Crypto Target.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Set price and market-cap alerts, calculate your potential profits, and let CoinWake
              watch the market for you.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link to="/dashboard">
                  Start Tracking <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/calculator">
                  <Calculator className="size-4" /> Try Profit Calculator
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm italic text-muted-foreground">
              "Set your target. Go live your life. We'll wake you up when crypto gets there."
            </p>
          </div>
          <DashboardPreview />
        </section>

        {/* Features */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold md:text-4xl">
              Everything you need to catch the top
            </h2>
            <p className="mt-3 text-muted-foreground">
              CoinMarketCap + portfolio tracker + profit calculator + alarm clock — in one premium
              dashboard.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, emoji, title, body }) => (
              <div
                key={title}
                className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 text-xl">
                  <span aria-hidden>{emoji}</span>
                </div>
                <h3 className="mt-4 flex items-center gap-2 font-display text-lg font-semibold">
                  <Icon className="size-4 text-primary" />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Market-cap teaser */}
        <section className="grid gap-6 py-12 md:py-16 lg:grid-cols-2">
          <div className="glass rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <TrendingUp className="size-4" /> Market-cap math, done right
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold">
              What happens if MoonPup hits $10M?
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter a target market cap and we convert it to a price using{" "}
              <span className="text-foreground">circulating supply</span> — never total supply — so
              your projected profit is honest.
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                { cap: "$1M", value: "$175", roi: "+157%" },
                { cap: "$10M", value: "$1,750", roi: "+2,157%" },
                { cap: "$100M", value: "$17,500", roi: "+22,157%" },
              ].map((row) => (
                <div
                  key={row.cap}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2.5"
                >
                  <span className="num text-sm text-muted-foreground">{row.cap} cap</span>
                  <span className="num text-sm font-semibold">{row.value}</span>
                  <span className="num text-sm font-semibold text-profit">{row.roi}</span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-6 w-full" variant="outline">
              <Link to="/calculator">
                Open the calculator <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="glass flex flex-col justify-between rounded-3xl p-6 md:p-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-warn">
                <LineChart className="size-4" /> Live watchlist
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold">
                Prices that move while you watch
              </h3>
            </div>
            <div className="mt-5 space-y-2">
              <LiveWatchRows />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-glow md:px-10">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(600px 300px at 50% 0%, oklch(0.62 0.19 268 / 0.25), transparent 70%)",
              }}
            />
            <h2 className="relative font-display text-3xl font-bold md:text-5xl">
              Set your target. <span className="text-gradient">We'll wake you up.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              Start tracking your portfolio and never sleep through another target again.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/dashboard">
                  Start Tracking <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link to="/calculator">Try Profit Calculator</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <BrandMark />
          <p>Demo build with realistic mock market data. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
