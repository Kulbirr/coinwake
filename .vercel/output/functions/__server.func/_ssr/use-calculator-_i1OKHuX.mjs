import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { B as ChevronDown, m as Sigma } from "../_libs/lucide-react.mjs";
import { C as cn, D as errorMessage, E as errorHint, G as useCoin, J as useScenarioCalculator, K as useMarketCapCalculator, X as useStore, Y as useServerConfig, q as useProfitCalculator } from "./theme-DXxfDXZX.mjs";
import { n as marketCapFromPrice } from "./app-ui-S8GmjT34.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-calculator-_i1OKHuX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Transparency panel — every derived number in the app can show its formula so
* users never have to trust a black box.
*/
function HowCalculated({ rows, className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border border-border bg-surface/40", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((v) => !v),
			"aria-expanded": open,
			className: "flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigma, { className: "size-3.5" }),
				"How is this calculated?",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("ml-auto size-4 transition-transform", open && "rotate-180") })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "space-y-2.5 border-t border-border px-3.5 py-3",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs font-medium text-foreground",
					children: row.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
					className: "num text-xs text-muted-foreground",
					children: [row.formula, row.result !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" = ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: row.result
					})] })]
				})]
			}, row.label))
		})]
	});
}
var DEFAULT_SCENARIO_CAPS = [
	1e6,
	5e6,
	1e7,
	5e7,
	1e8
];
/** The server caps `marketCaps` at 24 entries, so the table can't grow past it. */
var MAX_SCENARIOS = 24;
var num = (value) => {
	const parsed = Number(value.replace(/,/g, ""));
	return Number.isFinite(parsed) ? parsed : 0;
};
/** A positive figure, or nothing — so a blank field is omitted, not sent as 0. */
var positive = (value) => {
	const parsed = num(value);
	return parsed > 0 ? parsed : void 0;
};
function makeFields(overrides) {
	return {
		coinId: "",
		mode: "PRICE",
		quantity: "",
		purchasePrice: "",
		currentPrice: "",
		targetPrice: "",
		targetMarketCap: "",
		supplyOverride: "",
		...overrides
	};
}
/** One request per pause in typing, not one per keystroke (spec 31). */
function useDebounced(value, ms) {
	const [settled, setSettled] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setSettled(value), ms);
		return () => clearTimeout(timer);
	}, [value, ms]);
	return settled;
}
/**
* Everything the calculator screen displays, from the server's calculator API.
*
* The screen only renders what comes back: the numbers, the disclaimer, and the
* estimate labels are all the server's words, so the calculator can never quietly
* disagree with the engine that fires alerts (spec 7/30/43). Figures are optional
* rather than zero-filled — an unanswered question reads "—", not "$0.00" — and
* whether a market-cap target is even possible is the server's call, so a coin with
* no reported supply comes back with an error that says what to type instead.
*/
function useCalculator(initial = {}) {
	const { coins } = useStore();
	const { data: config } = useServerConfig();
	const [fields, setFields] = (0, import_react.useState)(() => makeFields(initial));
	const [scenarioCaps, setScenarioCaps] = (0, import_react.useState)(() => [...DEFAULT_SCENARIO_CAPS]);
	const set = (0, import_react.useCallback)((key, value) => {
		setFields((f) => ({
			...f,
			[key]: value
		}));
	}, []);
	const cachedCoin = (0, import_react.useMemo)(() => coins.find((c) => c.id === fields.coinId), [coins, fields.coinId]);
	const remoteCoin = useCoin(cachedCoin ? void 0 : fields.coinId.trim() || void 0);
	const coin = cachedCoin ?? remoteCoin.data;
	/** Pick a coin and reset the targets so another coin's numbers never linger. */
	const selectCoin = (0, import_react.useCallback)((next) => {
		setFields((f) => ({
			...f,
			coinId: next.id,
			currentPrice: "",
			supplyOverride: "",
			targetPrice: String(Number((next.price * 3).toPrecision(6))),
			targetMarketCap: String(Math.round((next.marketCap || 0) * 5))
		}));
	}, []);
	const form = useDebounced(fields, 350);
	const coinId = form.coinId.trim();
	const quantity = num(form.quantity);
	const purchasePrice = num(form.purchasePrice);
	const priceOverride = positive(form.currentPrice);
	const supplyOverride = positive(form.supplyOverride);
	const typedTargetPrice = positive(form.targetPrice);
	const typedTargetCap = positive(form.targetMarketCap);
	const profitInput = coinId && form.mode === "PRICE" && quantity > 0 && typedTargetPrice !== void 0 ? {
		coinId,
		quantity,
		purchasePrice,
		targetPrice: typedTargetPrice,
		...priceOverride === void 0 ? {} : { currentPrice: priceOverride }
	} : void 0;
	const capInput = coinId && form.mode === "MARKET_CAP" && typedTargetCap !== void 0 ? {
		coinId,
		targetMarketCap: typedTargetCap,
		quantity,
		purchasePrice,
		...priceOverride === void 0 ? {} : { currentPrice: priceOverride },
		...supplyOverride === void 0 ? {} : { circulatingSupply: supplyOverride }
	} : void 0;
	const ladderCaps = (0, import_react.useMemo)(() => [...scenarioCaps].sort((a, b) => a - b), [scenarioCaps]);
	const scenarioInput = coinId && ladderCaps.length > 0 ? {
		coinId,
		quantity,
		purchasePrice,
		marketCaps: ladderCaps,
		...supplyOverride === void 0 ? {} : { circulatingSupply: supplyOverride }
	} : void 0;
	const profitQuery = useProfitCalculator(profitInput);
	const capQuery = useMarketCapCalculator(capInput);
	const scenarioQuery = useScenarioCalculator(scenarioInput);
	const profit = profitQuery.data;
	const cap = capQuery.data;
	const ladder = scenarioQuery.data;
	const view = (0, import_react.useMemo)(() => {
		const byPrice = form.mode === "PRICE";
		const result = byPrice ? profit?.result : cap?.result.profit;
		const currentPrice = byPrice ? profit?.result.currentPrice ?? priceOverride ?? coin?.price : cap?.result.currentPrice ?? priceOverride ?? coin?.price;
		const targetPrice = byPrice ? typedTargetPrice : cap?.result.targetPrice;
		const supply = cap?.result.circulatingSupply ?? supplyOverride ?? coin?.circulatingSupply;
		const currentMarketCap = byPrice ? currentPrice !== void 0 && supply !== void 0 ? marketCapFromPrice(currentPrice, supply) : void 0 : cap?.result.currentMarketCap;
		const targetMarketCap = byPrice ? targetPrice !== void 0 && supply !== void 0 ? marketCapFromPrice(targetPrice, supply) : void 0 : cap?.result.targetMarketCap;
		const active = byPrice ? profit : cap;
		return {
			result,
			currentPrice,
			targetPrice,
			supply,
			currentMarketCap,
			targetMarketCap,
			scenarios: ladder?.scenarios ?? [],
			/** True when a figure above rests on a supply the user typed (spec 7/15). */
			supplyEstimated: Boolean(cap?.supplyEstimated ?? ladder?.supplyEstimated),
			/** The server's wording for that, verbatim — never paraphrase an estimate. */
			supplyNote: cap?.supplyNote ?? ladder?.supplyNote,
			/** Why ROI and multiple are missing, in the server's words. */
			costBasisNote: active?.costBasisNote ?? ladder?.costBasisNote,
			disclaimer: active?.disclaimer ?? ladder?.disclaimer ?? config?.disclaimer
		};
	}, [
		form.mode,
		profit,
		cap,
		ladder,
		coin,
		priceOverride,
		supplyOverride,
		typedTargetPrice,
		config?.disclaimer
	]);
	const addScenario = (0, import_react.useCallback)((marketCap) => {
		if (!Number.isFinite(marketCap) || marketCap <= 0) return;
		setScenarioCaps((list) => list.includes(marketCap) || list.length >= MAX_SCENARIOS ? list : [...list, marketCap]);
	}, []);
	/**
	* By market cap, not by id: the server mints scenario ids per request, so the
	* value in the row is the only identity that survives the next response.
	*/
	const removeScenario = (0, import_react.useCallback)((marketCap) => {
		setScenarioCaps((list) => list.filter((c) => c !== marketCap));
	}, []);
	/** The failing request's message and hint, already fit to show (spec 35). */
	const failure = profitQuery.error ?? capQuery.error ?? scenarioQuery.error;
	return {
		fields,
		set,
		coin,
		selectCoin,
		addScenario,
		removeScenario,
		scenarioFull: scenarioCaps.length >= MAX_SCENARIOS,
		pending: profitQuery.isFetching || capQuery.isFetching || scenarioQuery.isFetching,
		error: failure ? errorMessage(failure) : void 0,
		hint: failure ? errorHint(failure) : void 0,
		...view
	};
}
//#endregion
export { useCalculator as n, HowCalculated as t };
