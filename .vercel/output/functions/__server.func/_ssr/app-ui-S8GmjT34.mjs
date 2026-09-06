import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime, n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { $ as ArrowDown, B as ChevronDown, J as BellOff, K as Bell, N as ExternalLink, R as ChevronUp, V as Check, Y as ArrowUp, tt as AlarmClock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as cn, M as formatPrice, O as formatAlertValue, V as requestBrowserNotifications, X as useStore, a as CoinSearchDialog, c as DialogContent, d as DialogHeader, f as DialogTitle, g as alarmEngine, i as CoinLogo, j as formatPercent, k as formatCompact, l as DialogDescription, r as Button, s as Dialog, t as ALERT_KIND_LABEL, u as DialogFooter } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-ui-S8GmjT34.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Full-screen takeover shown when an alert fires. Mobile-first: the three
* actions are thumb-sized and stack above the fold on small screens.
*
* Renders every alert kind, not just price — a market-cap or portfolio alert has
* no coin and no target price, so the figures come pre-resolved from the store.
*/
function AlarmOverlay() {
	const { activeAlarm, stopAlarm, snoozeAlarm, alarmSoundEnabled } = useStore();
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!activeAlarm) {
			setElapsed(0);
			return;
		}
		const timer = setInterval(() => setElapsed((s) => s + 1), 1e3);
		return () => clearInterval(timer);
	}, [activeAlarm]);
	(0, import_react.useEffect)(() => {
		if (!activeAlarm) return void 0;
		const onKey = (e) => {
			if (e.key === "Escape") stopAlarm();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeAlarm, stopAlarm]);
	if (!activeAlarm) return null;
	const { alert, coin, subject, previous, target, current } = activeAlarm;
	const fmt = (value) => formatAlertValue(activeAlarm.unit, value);
	const reached = alert.condition === "ABOVE" ? "REACHED" : "FELL TO";
	const headline = target === null ? `${subject} ALERT TRIGGERED` : `${subject} ${reached} ${fmt(target)}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alertdialog",
		"aria-modal": "true",
		"aria-label": `Alert: ${headline}`,
		className: "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 animate-pulse",
			style: { background: "radial-gradient(900px 600px at 50% 0%, oklch(0.66 0.21 22 / 0.28), transparent 65%)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "alarm-pulse relative w-full max-w-lg rounded-3xl border border-loss/40 bg-card/90 p-6 text-center shadow-2xl md:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-3xl tracking-[0.3em] md:text-4xl",
					children: "🚨🚨🚨"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs font-bold uppercase tracking-[0.35em] text-loss",
					children: ALERT_KIND_LABEL[alert.kind]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center justify-center gap-3",
					children: [coin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
						coin,
						size: 44
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold md:text-3xl",
						children: headline
					})]
				}),
				alert.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 inline-block rounded-full border border-warn/30 bg-warn/10 px-3 py-1 text-sm font-medium text-warn",
					children: alert.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/70 p-4",
					children: [
						{
							label: "When set",
							value: previous,
							tone: "text-muted-foreground"
						},
						{
							label: "Target",
							value: target,
							tone: "text-warn"
						},
						{
							label: "Now",
							value: current,
							tone: "text-profit"
						}
					].map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-wider text-muted-foreground",
						children: cell.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `num mt-1 text-sm font-semibold md:text-base ${cell.tone}`,
						children: fmt(cell.value)
					})] }, cell.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						onClick: stopAlarm,
						className: "h-14 bg-loss text-base font-bold tracking-wide text-primary-foreground hover:bg-loss/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-5" }), " STOP ALARM"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "secondary",
							className: "h-12",
							onClick: snoozeAlarm,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmClock, { className: "size-4" }), " Pause alert"]
						}), coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							className: "h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/coin/$coinId",
								params: { coinId: coin.id },
								onClick: stopAlarm,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " View coin"]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							className: "h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/portfolio",
								onClick: stopAlarm,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " View portfolio"]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted-foreground",
					children: alarmSoundEnabled ? `Ringing for ${elapsed}s — press Escape or STOP to silence.` : "Sound is muted. Enable the alarm in Settings so we can wake you next time."
				})
			]
		})]
	});
}
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
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
function priceFromMarketCap(marketCap, circulatingSupply) {
	if (!circulatingSupply || !isFinite(circulatingSupply)) return 0;
	return marketCap / circulatingSupply;
}
function marketCapFromPrice(price, circulatingSupply) {
	return price * (circulatingSupply || 0);
}
var MODES = [
	{
		value: "PRICE",
		label: "Price"
	},
	{
		value: "MARKET_CAP",
		label: "Market cap"
	},
	{
		value: "PERCENT",
		label: "% move"
	}
];
function CreateAlertDialog({ open, onOpenChange, coin: initialCoin, defaultTargetPrice }) {
	const { coins, addAlert, alarmSoundEnabled, setAlarmSoundEnabled } = useStore();
	const [coinId, setCoinId] = (0, import_react.useState)(initialCoin?.id ?? "solana");
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("PRICE");
	const [condition, setCondition] = (0, import_react.useState)("ABOVE");
	const [target, setTarget] = (0, import_react.useState)("");
	const [marketCapTarget, setMarketCapTarget] = (0, import_react.useState)("");
	const [percentTarget, setPercentTarget] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [repeat, setRepeat] = (0, import_react.useState)("ONCE");
	const [cooldown, setCooldown] = (0, import_react.useState)("5");
	const [notify, setNotify] = (0, import_react.useState)({
		browser: true,
		alarm: true,
		push: false
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const coin = (0, import_react.useMemo)(() => coins.find((c) => c.id === coinId), [coins, coinId]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const next = initialCoin?.id ?? coinId;
		setCoinId(next);
		const seed = coins.find((c) => c.id === next);
		const suggested = defaultTargetPrice ?? (seed ? seed.price * 1.25 : 0);
		setTarget(suggested ? String(Number(suggested.toPrecision(6))) : "");
		setMarketCapTarget("");
		setPercentTarget("");
		setMode("PRICE");
		setCondition("ABOVE");
		setName("");
		setRepeat("ONCE");
		setCooldown("5");
	}, [
		open,
		initialCoin?.id,
		defaultTargetPrice
	]);
	const supply = coin?.circulatingSupply ?? 0;
	/**
	* The price each mode implies, for the "x% away" hint. The server does its own
	* conversion when it evaluates the alert (spec 30) — this is display only.
	*/
	const impliedPrice = (() => {
		if (mode === "PRICE") return Number(target) || 0;
		if (mode === "MARKET_CAP") return priceFromMarketCap(Number(marketCapTarget) || 0, supply);
		const pct = Number(percentTarget) || 0;
		return coin ? coin.price * (1 + pct / 100) : 0;
	})();
	const distance = coin && coin.price ? (impliedPrice - coin.price) / coin.price * 100 : 0;
	const valid = Boolean(coin) && (mode === "PERCENT" ? Number(percentTarget) !== 0 && !saving : impliedPrice > 0 && !saving);
	const submit = async () => {
		if (!coin || !valid) return;
		if (notify.alarm && !alarmSoundEnabled) {
			if (await alarmEngine.unlock()) setAlarmSoundEnabled(true);
		}
		if (notify.browser || notify.push) await requestBrowserNotifications();
		const shared = {
			coinId: coin.id,
			...name.trim() ? { name: name.trim() } : {},
			condition,
			repeat,
			cooldownMinutes: Number(cooldown) || 5,
			notify
		};
		const input = mode === "MARKET_CAP" ? {
			...shared,
			kind: "MARKET_CAP",
			targetMarketCap: Number(marketCapTarget)
		} : mode === "PERCENT" ? {
			...shared,
			kind: "PERCENT",
			targetPercent: Number(percentTarget)
		} : {
			...shared,
			kind: "PRICE",
			targetPrice: Number(target)
		};
		setSaving(true);
		const saved = await addAlert(input);
		setSaving(false);
		if (!saved) return;
		toast.success(`Alert created for ${coin.symbol}`, { description: mode === "PERCENT" ? `We'll wake you on a ${formatPercent(Number(percentTarget))} move.` : `We'll wake you at ${formatPrice(impliedPrice)}.` });
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92vh] max-w-md overflow-y-auto rounded-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display text-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5 text-primary" }), " Create alert"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Set your target. Go live your life. We'll wake you up when crypto gets there." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setPickerOpen(true),
								className: "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-input bg-surface/50 px-3 py-2.5 text-left transition-colors hover:bg-surface",
								children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 32
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-semibold",
											children: coin.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												coin.symbol,
												" · ",
												formatPrice(coin.price)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-primary",
										children: "Change"
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Search coin…"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Condition" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [{
									value: "ABOVE",
									label: "Rises to",
									icon: ArrowUp
								}, {
									value: "BELOW",
									label: "Falls to",
									icon: ArrowDown
								}].map(({ value, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setCondition(value),
									className: cn("flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all", condition === value ? value === "ABOVE" ? "border-profit/50 bg-profit/12 text-profit" : "border-loss/50 bg-loss/12 text-loss" : "border-input text-muted-foreground hover:bg-surface"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
								}, value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex rounded-lg border border-input p-0.5",
										children: MODES.map(({ value, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setMode(value),
											disabled: value === "MARKET_CAP" && !supply,
											className: cn("cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40", mode === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
											children: label
										}, value))
									})]
								}),
								mode === "PRICE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									inputMode: "decimal",
									step: "any",
									value: target,
									onChange: (e) => setTarget(e.target.value),
									placeholder: "250",
									className: "num h-11 text-base"
								}) : mode === "PERCENT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									inputMode: "decimal",
									step: "any",
									value: percentTarget,
									onChange: (e) => setPercentTarget(e.target.value),
									placeholder: "10",
									className: "num h-11 text-base"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Measured from the price when you save this alert",
										coin ? ` (${formatPrice(coin.price)} now)` : "",
										" —",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: formatPrice(impliedPrice)
										}),
										" at today's price."
									]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									inputMode: "decimal",
									step: "any",
									value: marketCapTarget,
									onChange: (e) => setMarketCapTarget(e.target.value),
									placeholder: "10000000",
									className: "num h-11 text-base"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										formatCompact(Number(marketCapTarget) || 0),
										" ÷ ",
										supply.toLocaleString("en-US"),
										" ",
										"circulating =",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: formatPrice(impliedPrice)
										})
									]
								})] }),
								coin && valid && mode !== "PERCENT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										formatPrice(coin.price),
										" now ·",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: distance >= 0 ? "text-profit" : "text-loss",
											children: [
												formatPercent(Math.abs(distance)),
												" ",
												distance >= 0 ? "away up" : "away down"
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "alert-name",
								children: "Alert name (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "alert-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "First Take Profit",
								className: "h-11"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Repeat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: repeat,
									onValueChange: (v) => setRepeat(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "ONCE",
										children: "One-time"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "RECURRING",
										children: "Recurring"
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cooldown" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: cooldown,
									onValueChange: setCooldown,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
										"1",
										"5",
										"15",
										"60"
									].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: m,
										children: [m, " min"]
									}, m)) })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-xl border border-border bg-surface/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs uppercase tracking-wider text-muted-foreground",
								children: "Notify me with"
							}), [
								{
									key: "browser",
									label: "Browser notification"
								},
								{
									key: "alarm",
									label: "Loud alarm"
								},
								{
									key: "push",
									label: "Push notification"
								}
							].map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-center gap-2.5 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: notify[key],
									onCheckedChange: (v) => setNotify((n) => ({
										...n,
										[key]: Boolean(v)
									}))
								}), label]
							}, key))]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11 w-full",
					disabled: !valid,
					onClick: () => void submit(),
					children: saving ? "Creating…" : "Create alert"
				}) })
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSearchDialog, {
		open: pickerOpen,
		onOpenChange: setPickerOpen,
		onSelect: (c) => {
			setCoinId(c.id);
			setTarget(String(Number((c.price * 1.25).toPrecision(6))));
		},
		title: "Pick a coin"
	})] });
}
var AppUiContext = (0, import_react.createContext)(null);
/**
* Mounts the app-wide overlays (alarm takeover, alert creator, quick search)
* once and exposes imperative openers so any card or button can raise them
* without threading dialog state through the tree.
*/
function AppUiProvider({ children }) {
	const [alertOpen, setAlertOpen] = (0, import_react.useState)(false);
	const [alertReq, setAlertReq] = (0, import_react.useState)({});
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const openAlertDialog = (0, import_react.useCallback)((req = {}) => {
		setAlertReq(req);
		setAlertOpen(true);
	}, []);
	const openSearch = (0, import_react.useCallback)(() => setSearchOpen(true), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppUiContext.Provider, {
		value: {
			openAlertDialog,
			openSearch
		},
		children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateAlertDialog, {
				open: alertOpen,
				onOpenChange: setAlertOpen,
				coin: alertReq.coin,
				defaultTargetPrice: alertReq.defaultTargetPrice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSearchDialog, {
				open: searchOpen,
				onOpenChange: setSearchOpen
			})
		]
	});
}
function useAppUi() {
	const ctx = (0, import_react.useContext)(AppUiContext);
	if (!ctx) throw new Error("useAppUi must be used inside AppUiProvider");
	return ctx;
}
//#endregion
export { marketCapFromPrice as n, useAppUi as r, AppUiProvider as t };
