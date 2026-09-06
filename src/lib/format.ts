export function formatPrice(value: number | undefined | null): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs === 0) return "$0.00";
  if (abs >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (abs >= 1) return `$${value.toFixed(2)}`;
  if (abs >= 0.01) return `$${value.toFixed(4)}`;
  if (abs >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(10).replace(/0+$/, "")}`;
}

export function formatUsd(value: number | undefined | null, digits = 2): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatCompact(value: number | undefined | null, prefix = "$"): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      return `${value < 0 ? "-" : ""}${prefix}${(abs / size).toFixed(2)}${suffix}`;
    }
  }
  return `${prefix}${value.toFixed(2)}`;
}

export function formatNumber(value: number | undefined | null, digits = 2): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function formatSupply(value: number | undefined | null): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  return formatCompact(value, "");
}

export function formatPercent(value: number | undefined | null, digits = 2): string {
  if (value === undefined || value === null || !isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/**
 * Whether a figure should read as a gain — the test behind a "+" prefix or a green
 * tone. The API reports some figures as null (ROI with no cost basis, say), and an
 * unknown value is not a loss, so it stays neutral instead of turning red.
 */
export function isGain(value: number | undefined | null): boolean {
  return value === undefined || value === null || value >= 0;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
