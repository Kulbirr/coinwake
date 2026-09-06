import { useEffect, useState } from "react";

import type { Coin } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * A coin's logo, with the coloured monogram as the fallback.
 *
 * `logo` is optional because some sources give identity without art — a search
 * result carries only symbol and colour. Whenever the image is missing or fails
 * to load (a dead CoinGecko URL, an offline tab) we fall back to the initials so
 * a row never renders a broken-image icon.
 */
export function CoinLogo({
  coin,
  size = 36,
  className,
}: {
  coin: Pick<Coin, "symbol" | "color"> & { logo?: string };
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // A new coin (same slot, different logo) has to retry rather than stay hidden.
  useEffect(() => setFailed(false), [coin.logo]);

  if (coin.logo && !failed) {
    return (
      <img
        src={coin.logo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("inline-block shrink-0 rounded-full object-cover", className)}
        style={{
          width: size,
          height: size,
          background: `${coin.color}12`,
          border: `1px solid ${coin.color}33`,
        }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(140deg, ${coin.color}44, ${coin.color}12)`,
        border: `1px solid ${coin.color}55`,
        color: coin.color,
      }}
      aria-hidden
    >
      {coin.symbol.slice(0, 3)}
    </span>
  );
}
