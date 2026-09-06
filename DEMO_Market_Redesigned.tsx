/**
 * DEMO: Market Page Redesign with Taste Skill Principles
 * 
 * This demonstrates applying redesign-skill + minimalist-ui to the existing Market.tsx
 * 
 * Key improvements from the audit:
 * 1. TYPOGRAPHY: Sora/Inter Tight → Geist + Editorial serif for headlines
 * 2. COLOR: Oversaturated purples → single warm accent, desaturated surfaces
 * 3. LAYOUT: Symmetric table → asymmetric bento grid with depth
 * 4. MOTION: Generic transitions → spring physics, staggered reveals
 * 5. STATES: Missing hover/active/loading → full state system
 * 6. DATA: tabular-nums already present ✓, adding monospace for all numbers
 */

// This is a CONCEPTUAL implementation showing the design direction.
// The actual implementation would be in src/routes/market.tsx

// ============================================================
// 1. DESIGN TOKENS (in styles.css or theme config)
// ============================================================

/*
@theme inline {
  --font-display: "Geist", "Sora", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Geist", "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Lyon Text", "Playfair Display", ui-serif, serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
  
  // Warm monochrome palette (minimalist-ui)
  --color-background: oklch(0.08 0.01 25);
  --color-surface: oklch(0.11 0.01 25);
  --color-surface-elevated: oklch(0.14 0.01 25);
  --color-border: oklch(1 0 0 / 0.06);
  --color-border-strong: oklch(1 0 0 / 0.12);
  
  // Single accent - warm copper (not purple)
  --color-accent: oklch(0.58 0.14 45);
  --color-accent-foreground: oklch(0.98 0 0);
  --color-accent-muted: oklch(0.58 0.14 45 / 0.15);
  
  // Semantic - using accent hue for profit/loss
  --color-profit: oklch(0.62 0.16 145);
  --color-loss: oklch(0.6 0.2 25);
  --color-warn: oklch(0.72 0.15 65);
  
  // Typography scale
  --text-display-xl: clamp(2.5rem, 4vw, 4rem);
  --text-display-lg: clamp(1.875rem, 3vw, 2.5rem);
  --text-display-md: clamp(1.5rem, 2.5vw, 2rem);
  --text-heading: clamp(1.25rem, 2vw, 1.5rem);
  --text-body-lg: 1.125rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
  --text-caption: 0.75rem;
  
  // Spacing rhythm (4px base)
  --space-1: 0.25rem;   // 4px
  --space-2: 0.5rem;    // 8px
  --space-3: 0.75rem;   // 12px
  --space-4: 1rem;      // 16px
  --space-5: 1.25rem;   // 20px
  --space-6: 1.5rem;    // 24px
  --space-8: 2rem;      // 32px
  --space-10: 2.5rem;   // 40px
  --space-12: 3rem;     // 48px
  --space-16: 4rem;     // 64px
  --space-20: 5rem;     // 80px
  
  // Motion - spring physics
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
  
  // Shadows - tinted, not black
  --shadow-card: 
    0 1px 0 0 oklch(1 0 0 / 0.03) inset,
    0 2px 8px -2px oklch(0 0 0 / 0.3);
  --shadow-card-hover:
    0 1px 0 0 oklch(1 0 0 / 0.03) inset,
    0 8px 24px -8px oklch(0 0 0 / 0.4);
  --shadow-glow-accent: 0 0 0 1px var(--color-accent), 0 12px 40px -12px var(--color-accent / 0.35);
  
  // Border radius - varied
  --radius-tight: 4px;
  --radius-base: 8px;
  --radius-soft: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
}
*/

// ============================================================
// 2. REDESIGNED MARKET PAGE COMPONENT
// ============================================================

import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Bell, Search, Star, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta } from "@/components/app/Delta";
import { PriceValue } from "@/components/app/PriceValue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppUi } from "@/lib/app-ui";
import { rankCoinMatches } from "@/lib/coin-search";
import { formatCompact, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type SortKey = "rank" | "price" | "change24h" | "marketCap" | "volume24h";

interface CoinRow {
  coin: any;
  watched: boolean;
  progress: any;
  delay: number;
}

const SORT_CONFIG: Record<SortKey, { label: string; accessor: keyof any; defaultDir: "asc" | "desc" }> = {
  rank: { label: "#", accessor: "rank", defaultDir: "asc" },
  price: { label: "Price", accessor: "price", defaultDir: "desc" },
  change24h: { label: "24h", accessor: "change24h", defaultDir: "desc" },
  marketCap: { label: "Market Cap", accessor: "marketCap", defaultDir: "desc" },
  volume24h: { label: "Volume", accessor: "volume24h", defaultDir: "desc" },
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

// Staggered row animation
const Row = motion.tr;
const TableBody = motion.tbody;
const TableRow = motion.tr;

// Search input with focus glow
const SearchInput = motion(Input);

// Coin cell with hover reveal
const CoinCell = motion.td;

// Action buttons with spring hover
const ActionButton = motion(Button);

// Empty state illustration
const EmptyState = motion.div;

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Route = createFileRoute("/market")({
  component: Market,
});

function Market() {
  const { coins, watchlist, toggleWatchlist } = useStore();
  const { openAlertDialog } = useAppUi();
  
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  const rows = useMemo(() => {
    const base = query.trim() 
      ? rankCoinMatches(coins, query, coins.length) 
      : coins.slice();
    
    if (query.trim()) return base;
    
    return base.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      return dir === "asc" ? av - bv : bv - av;
    });
  }, [coins, query, sort, dir]);

  // Create row data with animation delays
  const rowData: CoinRow[] = useMemo(() => 
    rows.map((coin, index) => ({
      coin,
      watched: watchlist.includes(coin.id),
      delay: index * 0.04, // 40ms stagger
    })),
    [rows, watchlist]
  );

  const toggleSort = (key: SortKey) => {
    if (sort === key) {
      setDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setDir(SORT_CONFIG[key].defaultDir);
    }
  };

  const handleRowClick = (coinId: string) => {
    // Navigate to coin detail
  };

  return (
    <AppShell
      title="Markets"
      subtitle={query ? `Showing ${rows.length} results for "${query}"` : `Live prices across ${coins.length} coins`}
    >
      {/* ===== SEARCH SECTION ===== */}
      <section className="mb-8" style={{ "--stagger-delay": "0ms" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative max-w-xl">
            <Search 
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60" 
              aria-hidden="true"
            />
            <SearchInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search markets — try \"SOL\", \"BONK\", \"Bitcoin\"…"
              className={cn(
                "h-12 pl-12 pr-4 text-base bg-surface/60 border-border/50",
                "placeholder:text-muted-foreground/40",
                "focus:border-accent focus:ring-2 focus:ring-accent/20",
                "transition-all duration-300 ease-spring",
                isSearchFocused && "border-accent/50 ring-2 ring-accent/20 shadow-glow-accent",
                "hover:border-border/80"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <motion.button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-accent-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Clear search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            )}
          </div>
          
          {/* Results count */}
          <motion.p
            className="mt-3 text-sm text-muted-foreground"
            initial={false}
            animate={{ opacity: query ? 1 : 0, height: query ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
          >
            {rows.length} {rows.length === 1 ? "market" : "markets"} found
            {query && <span className="text-accent"> for "{query}"</span>}
          </motion.p>
        </motion.div>
      </section>

      {/* ===== TABLE / GRID ===== */}
      <div className="rounded-2xl border border-border/50 bg-surface/40 backdrop-blur-xl overflow-hidden">
        {/* Desktop: Data Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]" role="grid">
            <thead>
              <tr className="border-b border-border/40 bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="w-10 py-4 px-4 font-medium text-muted-foreground/50">#</th>
                <th className="w-8 py-4" aria-hidden="true"></th>
                {Object.entries(SORT_CONFIG).map(([key, config]) => (
                  <motion.th
                    key={key}
                    className="py-4 px-4 font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort(key as SortKey)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      {config.label}
                      <SortIcon column={key as SortKey} />
                    </div>
                  </motion.th>
                ))}
                <th className="w-28 py-4 px-4 text-right font-medium text-muted-foreground/50">Actions</th>
              </tr>
            </thead>
            
            <AnimatePresence mode="popLayout">
              <TableBody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {rowData.length === 0 ? (
                  <EmptyState
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 px-8 text-center"
                    style={{ "--index": 0 }}
                  >
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-surface border border-border/50">
                      <Search className="size-7 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">No markets match "{query}"</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                      Try adjusting your search or browse the full list below.
                    </p>
                  </EmptyState>
                ) : (
                  rowData.map(({ coin, watched, delay }) => (
                    <TableRow
                      key={coin.id}
                      className="border-b border-border/30 transition-colors duration-200"
                      style={{ "--row-delay": `${delay}s` }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.16, 1, 0.3, 1],
                        delay: delay 
                      }}
                      whileHover={{ 
                        backgroundColor: "var(--color-surface-elevated)",
                        x: 4 
                      }}
                      onMouseEnter={() => setHoveredRow(coin.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Rank */}
                      <CoinCell className="py-4 px-4 font-mono text-xs text-muted-foreground/50 tabular-nums">
                        {coin.rank}
                      </CoinCell>
                      
                      {/* Coin Info */}
                      <CoinCell className="py-4 px-4">
                        <Link
                          to="/coin/$coinId"
                          params={{ coinId: coin.id }}
                          className="flex items-center gap-3 group hover:text-foreground transition-colors"
                        >
                          <CoinLogo coin={coin} size={36} />
                          <div className="min-w-0">
                            <span className="block font-medium truncate">{coin.symbol}</span>
                            <span className="block text-xs text-muted-foreground truncate">{coin.name}</span>
                          </div>
                          {/* Trending indicator */}
                          {(coin.change24h > 20 || coin.change24h < -20) && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                                coin.change24h > 20 
                                  ? "bg-profit/15 text-profit border border-profit/30"
                                  : "bg-loss/15 text-loss border border-loss/30"
                              )}
                            >
                              {coin.change24h > 20 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                              Trending
                            </motion.span>
                          )}
                        </Link>
                      </CoinCell>
                      
                      {/* Price */}
                      <CoinCell className="py-4 px-4 font-mono tabular-nums text-base font-medium">
                        <PriceValue value={coin.price} className="text-sm" />
                      </CoinCell>
                      
                      {/* 24h Change */}
                      <CoinCell className="py-4 px-4">
                        <Delta value={coin.change24h} arrow={true} className="font-mono tabular-nums" />
                      </CoinCell>
                      
                      {/* Market Cap */}
                      <CoinCell className="py-4 px-4 font-mono tabular-nums text-muted-foreground">
                        {formatCompact(coin.marketCap)}
                      </CoinCell>
                      
                      {/* Volume */}
                      <CoinCell className="py-4 px-4 font-mono tabular-nums text-muted-foreground">
                        {formatCompact(coin.volume24h)}
                      </CoinCell>
                      
                      {/* Actions */}
                      <CoinCell className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl bg-surface/60 border border-border/50 hover:bg-accent-muted hover:border-accent/30 hover:text-accent transition-all duration-300 ease-spring"
                            aria-label={`Set alert for ${coin.symbol}`}
                            onClick={() => openAlertDialog({ coin })}
                            whileHover={{ scale: 1.08, boxShadow: "0 4px 12px -4px var(--color-accent / 0.3)" }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <Bell className="size-4.5" />
                          </ActionButton>
                          
                          <ActionButton
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-9 rounded-xl bg-surface/60 border transition-all duration-300 ease-spring",
                              watched 
                                ? "border-warn/30 text-warn bg-warn/10" 
                                : "border-border/50 text-muted-foreground/60 hover:border-accent/30 hover:text-accent hover:bg-accent-muted"
                            )}
                            aria-label={watched 
                              ? `Remove ${coin.symbol} from watchlist` 
                              : `Watch ${coin.symbol}`}
                            onClick={() => toggleWatchlist(coin.id)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92, rotate: 180 }}
                          >
                            <Star 
                              className={cn("size-4.5 transition-transform", watched && "fill-current scale-100")}
                            />
                          </ActionButton>
                        </div>
                      </CoinCell>
                    </TableRow>
                  ))}
                )}
              </TableBody>
            </AnimatePresence>
          </table>
        </div>

        {/* Mobile: Card Grid */}
        <div className="lg:hidden p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {rowData.length === 0 ? (
              <EmptyState
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 px-4 text-center"
              >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface border border-border/50">
                  <Search className="size-6 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-base font-semibold">No markets match "{query}"</h3>
              </EmptyState>
            ) : (
              rowData.map(({ coin, watched, delay }) => (
                <motion.div
                  key={coin.id}
                  className="group relative rounded-2xl border border-border/40 bg-surface/60 p-4 transition-all duration-300 ease-spring"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1],
                    delay 
                  }}
                  whileHover={{ 
                    y: -2, 
                    boxShadow: "0 12px 32px -8px oklch(0 0 0 / 0.4)",
                    borderColor: "var(--color-border-strong)"
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/coin/$coinId"
                      params={{ coinId: coin.id }}
                      className="flex-1 flex items-center gap-3 min-w-0 group"
                    >
                      <CoinLogo coin={coin} size={40} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold truncate">{coin.symbol}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">{coin.name}</span>
                          {coin.rank <= 10 && (
                            <span className="font-mono text-[10px] font-semibold text-muted-foreground/60 tabular-nums">#{coin.rank}</span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="font-mono tabular-nums font-medium">
                            <PriceValue value={coin.price} className="inline" />
                          </span>
                          <Delta value={coin.change24h} arrow={true} className="font-mono tabular-nums" />
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ActionButton
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-9 rounded-xl bg-surface/60 border transition-all duration-300 ease-spring",
                          watched 
                            ? "border-warn/30 text-warn bg-warn/10" 
                            : "border-border/50 text-muted-foreground/60 hover:border-accent/30 hover:text-accent hover:bg-accent-muted"
                        )}
                        aria-label={watched ? `Unwatch ${coin.symbol}` : `Watch ${coin.symbol}`}
                        onClick={() => toggleWatchlist(coin.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9, rotate: 180 }}
                      >
                        <Star className={cn("size-4.5", watched && "fill-current")} />
                      </ActionButton>
                      
                      <ActionButton
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-xl bg-surface/60 border border-border/50 hover:bg-accent-muted hover:border-accent/30 hover:text-accent transition-all duration-300 ease-spring"
                        aria-label={`Alert for ${coin.symbol}`}
                        onClick={() => openAlertDialog({ coin })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Bell className="size-4.5" />
                      </ActionButton>
                    </div>
                  </div>
                  
                  {/* Secondary row - Market Cap & Volume */}
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-mono tabular-nums">
                    <span>MCap <span className="text-foreground font-medium ml-1">{formatCompact(coin.marketCap)}</span></span>
                    <span>Vol <span className="text-foreground font-medium ml-1">{formatCompact(coin.volume24h)}</span></span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

// ============================================================
// SORT ICON COMPONENT
// ============================================================

function SortIcon({ column }: { column: SortKey }) {
  if (sort !== column) return null;
  return (
    <motion.span
      animate={{ rotate: dir === "asc" ? 0 : 180 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="inline-flex"
    >
      {dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
    </motion.span>
  );
}

export default Market;