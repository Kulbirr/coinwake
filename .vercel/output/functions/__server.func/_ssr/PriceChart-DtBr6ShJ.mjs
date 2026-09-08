import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { M as formatPrice, W as useChart } from "./theme-DXxfDXZX.mjs";
import { a as CartesianGrid, c as ResponsiveContainer, i as Area, l as Tooltip, n as YAxis, r as XAxis, s as ReferenceLine, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PriceChart-DtBr6ShJ.js
var import_jsx_runtime = require_jsx_runtime();
var CHART_RANGES = [
	"1H",
	"24H",
	"7D",
	"30D",
	"3M",
	"1Y"
];
function PriceChart({ coin, range, alertLevels = [], height = 320 }) {
	const { data, isPending, isError } = useChart(coin.id, range);
	const points = data ?? [];
	if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "flex w-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground",
		children: isPending ? "Loading price history…" : isError ? "Price history isn't available right now." : `No ${range} history for ${coin.symbol} yet.`
	});
	const prices = points.map((d) => d.price);
	const levelPrices = alertLevels.map((a) => a.price);
	const min = Math.min(...prices, ...levelPrices);
	const max = Math.max(...prices, ...levelPrices);
	const pad = (max - min) * .12 || max * .05;
	const first = points[0];
	const last = points[points.length - 1];
	const stroke = first !== void 0 && last !== void 0 && last.price >= first.price ? "var(--profit)" : "var(--loss)";
	const timeFmt = (t) => {
		const d = new Date(t);
		if (range === "1H" || range === "24H") return d.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: points,
				margin: {
					top: 10,
					right: 12,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: `grad-${coin.id}`,
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: stroke,
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: stroke,
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--border)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "t",
						tickFormatter: timeFmt,
						stroke: "var(--muted-foreground)",
						fontSize: 11,
						tickLine: false,
						axisLine: false,
						minTickGap: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: [min - pad, max + pad],
						tickFormatter: (v) => formatPrice(v),
						stroke: "var(--muted-foreground)",
						fontSize: 11,
						tickLine: false,
						axisLine: false,
						width: 78
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--popover)",
							border: "1px solid var(--border)",
							borderRadius: 12,
							fontSize: 12
						},
						labelFormatter: (v) => timeFmt(Number(v)),
						formatter: (v) => [formatPrice(v), coin.symbol]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "price",
						stroke,
						strokeWidth: 2,
						fill: `url(#grad-${coin.id})`,
						isAnimationActive: false
					}),
					alertLevels.map((level, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: level.price,
						stroke: level.tone === "up" ? "var(--warn)" : "var(--loss)",
						strokeDasharray: "6 5",
						label: {
							value: `${level.label} ${formatPrice(level.price)}`,
							position: "insideTopRight",
							fill: level.tone === "up" ? "var(--warn)" : "var(--loss)",
							fontSize: 11
						}
					}, `${level.price}-${i}`))
				]
			})
		})
	});
}
//#endregion
export { PriceChart as n, CHART_RANGES as t };
