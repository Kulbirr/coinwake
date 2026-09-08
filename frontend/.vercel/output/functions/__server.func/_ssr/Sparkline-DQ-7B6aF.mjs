import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { W as useChart, X as useStore } from "./theme-DXxfDXZX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Sparkline-DQ-7B6aF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Lightweight inline trend line for table rows and cards.
*
* Presentational on purpose: it takes points rather than fetching them, so the
* screen decides how many charts to pull. A 50-row table asking for its own data
* would be 50 cold chart requests, and the server would have to make 50 upstream
* calls to fill them (spec 31) — so this component can't be the one to decide.
*/
function Sparkline({ points, loading = false, width = 96, height = 32, id }) {
	const shape = (0, import_react.useMemo)(() => {
		const prices = (points ?? []).map((p) => p.price).filter((p) => Number.isFinite(p));
		if (prices.length < 2) return null;
		const min = Math.min(...prices);
		const max = Math.max(...prices);
		const span = max - min || max || 1;
		const coords = prices.map((price, i) => {
			const x = i / (prices.length - 1) * width;
			const y = height - (price - min) / span * (height - 2) - 1;
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		});
		const first = prices[0] ?? 0;
		const last = prices[prices.length - 1] ?? 0;
		return {
			path: `M${coords.join("L")}`,
			area: `M0,${height} L${coords.join("L")} L${width},${height} Z`,
			up: last >= first
		};
	}, [
		points,
		width,
		height
	]);
	if (!shape) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: 0,
			x2: width,
			y1: height / 2,
			y2: height / 2,
			stroke: "var(--border)",
			strokeWidth: 1.5,
			strokeDasharray: loading ? "3 3" : void 0,
			className: loading ? "animate-pulse" : void 0
		})
	});
	const stroke = shape.up ? "var(--profit)" : "var(--loss)";
	const gradientId = `spark-${id}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: gradientId,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: stroke,
					stopOpacity: .28
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: stroke,
					stopOpacity: 0
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: shape.area,
				fill: `url(#${gradientId})`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: shape.path,
				fill: "none",
				stroke,
				strokeWidth: 1.5,
				strokeLinejoin: "round"
			})
		]
	});
}
/**
* The self-fetching variant, for a coin that isn't in the loaded market list.
*
* Prefers the 7-day series that already rides along on the market feed, and only
* falls back to a chart request when the store has never seen the coin — a row of
* five of these used to mean five cold upstream `market_chart` calls, which the
* provider rate limits (spec 31). Screens rendering coins straight from the store
* therefore cost nothing extra; pass `points` to `Sparkline` directly if you
* already have them.
*/
function CoinSparkline({ coinId, width, height }) {
	const cached = useStore().getCoin(coinId)?.sparkline7d;
	const { data, isPending } = useChart(cached ? void 0 : coinId, "7D");
	const points = (0, import_react.useMemo)(() => cached ? cached.map((price) => ({
		t: 0,
		price
	})) : data, [cached, data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
		points,
		loading: !cached && isPending,
		id: coinId,
		...width === void 0 ? {} : { width },
		...height === void 0 ? {} : { height }
	});
}
//#endregion
export { CoinSparkline as t };
