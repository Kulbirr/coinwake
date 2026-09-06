/**
 * Two unit conversions, kept client-side on purpose.
 *
 * Every figure the app *reports* — profit, ROI, multiple, scenario ladders, alert
 * progress — is computed by the server, so there is one implementation of the
 * arithmetic that fires alerts and one set of estimate labels (spec 7/30). What is
 * left here is the price/market-cap identity used for live input hints, which has
 * to run on each keystroke: the "≈ $0.0012 per coin" line under a market-cap field
 * cannot wait for a round trip. These never feed a saved value or a displayed
 * result — if you need one of those, call the calculator API.
 */

/** Target Price = Target Market Cap / Circulating Supply */
export function priceFromMarketCap(marketCap: number, circulatingSupply: number): number {
  if (!circulatingSupply || !isFinite(circulatingSupply)) return 0;
  return marketCap / circulatingSupply;
}

export function marketCapFromPrice(price: number, circulatingSupply: number): number {
  return price * (circulatingSupply || 0);
}
