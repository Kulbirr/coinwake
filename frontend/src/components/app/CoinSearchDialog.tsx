import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta } from "@/components/app/Delta";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { rankCoinMatches } from "@/lib/coin-search";
import { coins as coinsApi, errorMessage, useCoinSearch, useDexSearch } from "@/lib/api";
import type { Coin, CoinSearchResult } from "@/lib/api";
import { formatCompact, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

/**
 * Global coin search. When `onSelect` is provided it acts as a picker, otherwise
 * it navigates to the coin detail page.
 *
 * Two tiers, because the live feed only carries the top coins: the loaded market
 * list is matched instantly and in full, and anything else comes from
 * `/coins/search`, which reaches the whole provider catalogue. A search result has
 * no price — the endpoint returns identity only — so picking one fetches the coin
 * before handing it to `onSelect`.
 */
export function CoinSearchDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Search crypto",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (coin: Coin) => void;
  title?: string;
}) {
  const { coins } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [deferred, setDeferred] = useState("");
  const [fetching, setFetching] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // One request per pause in typing, not one per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDeferred(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const local = useMemo(() => rankCoinMatches(coins, query), [coins, query]);
  const { data: remote, isFetching } = useCoinSearch(deferred);
  const { data: dexRemote, isFetching: isDexFetching } = useDexSearch(deferred);

  /** Only what the loaded feed doesn't already show, so nothing appears twice. */
  const extra = useMemo(() => {
    if (!remote) return [];
    const known = new Set(local.map((c) => c.id));
    return remote.filter((r) => !known.has(r.id));
  }, [remote, local]);

  /** DexScreener results not already in local or CoinGecko remote. */
  const dexExtra = useMemo(() => {
    if (!dexRemote) return [];
    const known = new Set([...local.map((c) => c.id), ...extra.map((c) => c.id)]);
    return dexRemote.filter((r) => !known.has(r.id));
  }, [dexRemote, local, extra]);

  const choose = (coin: Coin) => {
    onOpenChange(false);
    if (onSelect) onSelect(coin);
    else void navigate({ to: "/coin/$coinId", params: { coinId: coin.id } });
  };

  /**
   * A search hit only carries an id, so navigation can go straight there and let
   * the detail page load it — but a picker needs the priced coin in hand.
   */
  const chooseRemote = async (result: CoinSearchResult) => {
    if (!onSelect) {
      onOpenChange(false);
      void navigate({ to: "/coin/$coinId", params: { coinId: result.id } });
      return;
    }
    setFetching(result.id);
    try {
      const { coin } = await coinsApi.get(result.id);
      onOpenChange(false);
      onSelect(coin);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setFetching(null);
    }
  };

  const searching = (isFetching || isDexFetching) && deferred.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={`${title} — try "SOL", "BONK", "Bitcoin"…`}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          {searching ? "Searching every listed coin…" : `No coins match "${query}".`}
        </CommandEmpty>
        {local.length > 0 && (
          <CommandGroup heading={query ? "Results" : "Top coins"}>
            {local.map((coin) => (
              // cmdk filters on `value`; we already rank + filter, so make every
              // item match by keying the value to the live query.
              <CommandItem
                key={coin.id}
                value={`${coin.symbol} ${coin.name} ${query}`}
                onSelect={() => choose(coin)}
                className="cursor-pointer gap-3 py-2.5"
              >
                <CoinLogo coin={coin} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{coin.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {coin.symbol} · MCap {formatCompact(coin.marketCap)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="num text-sm font-semibold">{formatPrice(coin.price)}</span>
                  <Delta value={coin.change24h} arrow={false} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {extra.length > 0 && (
          <CommandGroup heading="More coins">
            {extra.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.symbol} ${result.name} ${query}`}
                onSelect={() => void chooseRemote(result)}
                className="cursor-pointer gap-3 py-2.5"
              >
                <CoinLogo
                  coin={{ symbol: result.symbol, color: result.color, logo: result.logo }}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{result.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.symbol}
                    {result.rank > 0 ? ` · Rank #${result.rank}` : ""}
                  </div>
                </div>
                {fetching === result.id && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {dexExtra.length > 0 && (
          <CommandGroup heading="DEX (Solana)">
            {dexExtra.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.symbol} ${result.name} ${query}`}
                onSelect={() => void chooseRemote(result)}
                className="cursor-pointer gap-3 py-2.5"
              >
                <CoinLogo
                  coin={{ symbol: result.symbol, color: result.color, logo: result.logo }}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{result.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.symbol} · DEX
                  </div>
                </div>
                {fetching === result.id && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {searching && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Searching every listed coin…
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
