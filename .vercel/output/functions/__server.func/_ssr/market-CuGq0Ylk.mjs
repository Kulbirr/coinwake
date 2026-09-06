import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { $ as ArrowDown, K as Bell, Y as ArrowUp, _ as Search, u as Star } from "../_libs/lucide-react.mjs";
import { B as rankCoinMatches, C as cn, X as useStore, i as CoinLogo, k as formatCompact, o as Delta, r as Button } from "./theme-DXxfDXZX.mjs";
import { t as Input } from "./label-SOE_QdsM.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-CuGq0Ylk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLUMNS = [
	{
		key: "price",
		label: "Price"
	},
	{
		key: "change24h",
		label: "24h"
	},
	{
		key: "marketCap",
		label: "Market cap"
	},
	{
		key: "volume24h",
		label: "Volume"
	}
];
function Market() {
	const { coins, watchlist, toggleWatchlist } = useStore();
	const { openAlertDialog } = useAppUi();
	const [query, setQuery] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("rank");
	const [dir, setDir] = (0, import_react.useState)("asc");
	const rows = (0, import_react.useMemo)(() => {
		const base = query.trim() ? rankCoinMatches(coins, query, coins.length) : coins.slice();
		if (query.trim()) return base;
		return base.sort((a, b) => {
			const av = a[sort];
			const bv = b[sort];
			return dir === "asc" ? av - bv : bv - av;
		});
	}, [
		coins,
		query,
		sort,
		dir
	]);
	const toggleSort = (key) => {
		if (sort === key) setDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSort(key);
			setDir(key === "rank" ? "asc" : "desc");
		}
	};
	const SortIcon = ({ column }) => {
		if (sort !== column || query.trim()) return null;
		return dir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Market",
		subtitle: `Live prices across ${coins.length} coins. Click a column to sort.`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass rounded-2xl p-4 md:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search name or symbol…",
					className: "h-10 pl-9"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[820px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2.5 pr-3 font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggleSort("rank"),
									className: "flex cursor-pointer items-center gap-1 hover:text-foreground",
									children: ["# Coin ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "rank" })]
								})
							}),
							COLUMNS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2.5 pr-3 font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggleSort(col.key),
									className: "flex cursor-pointer items-center gap-1 hover:text-foreground",
									children: [
										col.label,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: col.key })
									]
								})
							}, col.key)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-24 py-2.5" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						colSpan: 6,
						className: "py-8 text-center text-muted-foreground",
						children: [
							"No coins match \"",
							query,
							"\"."
						]
					}) }), rows.map((coin) => {
						const watched = watchlist.includes(coin.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 transition-colors hover:bg-surface/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/coin/$coinId",
										params: { coinId: coin.id },
										className: "flex items-center gap-2.5 hover:text-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num w-5 text-xs text-muted-foreground",
												children: coin.rank
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
												coin,
												size: 30
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block font-medium",
												children: coin.symbol
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-xs text-muted-foreground",
												children: coin.name
											})] })
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
										value: coin.price,
										className: "text-sm font-medium"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
										value: coin.change24h,
										arrow: false
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3 text-muted-foreground",
									children: formatCompact(coin.marketCap)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3 text-muted-foreground",
									children: formatCompact(coin.volume24h)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "size-8",
											"aria-label": `Set alert for ${coin.symbol}`,
											onClick: () => openAlertDialog({ coin }),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: cn("size-8", watched ? "text-warn" : "text-muted-foreground"),
											"aria-label": watched ? `Remove ${coin.symbol} from watchlist` : `Watch ${coin.symbol}`,
											onClick: () => toggleWatchlist(coin.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", watched && "fill-warn") })
										})]
									})
								})
							]
						}, coin.id);
					})] })]
				})
			})]
		})
	});
}
//#endregion
export { Market as component };
