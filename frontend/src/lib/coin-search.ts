/**
 * Ranked coin matching over a list already in memory.
 *
 * Kept in the data layer (not the search UI) so a future React Native client can
 * reuse the exact same behaviour. Generic over anything with an identity, so it
 * ranks both full coins and the price-less results the server's search returns.
 */
export function rankCoinMatches<T extends { symbol: string; name: string; rank: number }>(
  coins: T[],
  query: string,
  limit = 12,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q)
    return coins
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);

  const scored: Array<{ coin: T; score: number }> = [];
  for (const coin of coins) {
    const symbol = coin.symbol.toLowerCase();
    const name = coin.name.toLowerCase();
    let score = -1;
    if (symbol === q) score = 0;
    else if (name === q) score = 1;
    else if (symbol.startsWith(q)) score = 2;
    else if (name.startsWith(q)) score = 3;
    else if (symbol.includes(q)) score = 4;
    else if (name.includes(q)) score = 5;
    if (score >= 0) scored.push({ coin, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.coin.rank - b.coin.rank)
    .slice(0, limit)
    .map((s) => s.coin);
}
