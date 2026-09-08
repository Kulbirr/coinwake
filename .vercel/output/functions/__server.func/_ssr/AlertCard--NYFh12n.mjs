import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { K as Bell, b as Pencil, s as Trash2, v as Power } from "../_libs/lucide-react.mjs";
import { C as cn, H as timeAgo, O as formatAlertValue, S as alertThresholdLabel, _ as alertConditionLabel, b as alertSubject, i as CoinLogo, j as formatPercent, n as ALERT_METRIC_LABEL, r as Button, t as ALERT_KIND_LABEL, y as alertProgressUnit } from "./theme-DXxfDXZX.mjs";
import { t as Badge } from "./badge-CgxlUbIx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AlertCard--NYFh12n.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS_STYLE = {
	ACTIVE: "border-profit/40 bg-profit/10 text-profit",
	TRIGGERED: "border-warn/40 bg-warn/10 text-warn",
	DISABLED: "border-border bg-muted text-muted-foreground"
};
/**
* Progress from the value an alert was armed at toward its target.
*
* The figures come from `GET /alerts/progress`, not from arithmetic here: the
* server is the only place that knows the peak a drawdown is measured against,
* and one implementation means the bar can't disagree with the engine that will
* actually fire (spec 30).
*/
function AlertProgressBar({ alert, progress }) {
	const unit = alertProgressUnit(alert);
	const fmt = (value) => formatAlertValue(unit, value);
	if (!progress) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }),
			"Watching for ",
			alertConditionLabel(alert),
			" — waiting for the next check."
		]
	});
	const percent = Math.max(0, Math.min(100, progress.percent));
	const gap = progress.current === 0 ? null : progress.remaining / progress.current * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: [
					ALERT_METRIC_LABEL[alert.kind],
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num text-foreground",
						children: fmt(progress.current)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "num font-semibold",
				children: [percent.toFixed(1), "%"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 h-2 overflow-hidden rounded-full bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-[width] duration-700 ease-out", alert.condition === "ABOVE" ? "bg-gradient-to-r from-primary to-profit" : "bg-gradient-to-r from-primary to-loss"),
				style: { width: `${percent}%` }
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1.5 flex items-center justify-between text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Target ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-foreground",
				children: fmt(progress.target)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "num",
				children: [
					fmt(Math.abs(progress.remaining)),
					" away",
					gap === null ? "" : ` · ${formatPercent(gap)}`
				]
			})]
		})
	] });
}
/**
* One alert, any kind. `coin` is null for portfolio alerts and for coins outside
* the loaded market feed, so nothing here may assume there is one.
*/
function AlertCard({ alert, coin, progress, onEdit, onToggle, onDelete }) {
	const subject = alertSubject(alert, coin);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [
					coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/coin/$coinId",
						params: { coinId: coin.id },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
							coin,
							size: 40
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/coin/$coinId",
									params: { coinId: coin.id },
									className: "truncate font-semibold hover:text-primary",
									children: subject
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-semibold",
									children: subject
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: cn("gap-1 text-[10px]", STATUS_STYLE[alert.status]),
									children: alert.status
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground",
								children: [
									alert.kind !== "PRICE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ALERT_KIND_LABEL[alert.kind] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "·"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										ALERT_METRIC_LABEL[alert.kind],
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num text-foreground",
											children: alertConditionLabel(alert)
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: alert.repeat === "ONCE" ? "One-time" : "Recurring" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeAgo(alert.createdAt) })
								]
							}),
							alert.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 inline-block rounded-md bg-surface px-2 py-0.5 text-xs text-foreground",
								children: alert.name
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1",
						children: [
							onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8",
								onClick: onEdit,
								"aria-label": "Edit",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}),
							onToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8",
								onClick: onToggle,
								"aria-label": alert.status === "DISABLED" ? "Enable" : "Disable",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: cn("size-4", alert.status === "ACTIVE" && "text-profit") })
							}),
							onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-8 text-muted-foreground hover:text-loss",
								onClick: onDelete,
								"aria-label": "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3.5",
				children: alert.status === "ACTIVE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertProgressBar, {
					alert,
					progress
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), alert.status === "TRIGGERED" ? `Triggered ${alert.triggeredAt ? timeAgo(alert.triggeredAt) : ""} at ${alertThresholdLabel(alert)}` : "Disabled — not watching this target."]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Notify:" }),
					alert.notify.browser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: "Browser"
					}),
					alert.notify.alarm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: "Alarm"
					}),
					alert.notify.push && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: "Push"
					}),
					alert.notify.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: "Email"
					})
				]
			})
		]
	});
}
//#endregion
export { AlertProgressBar as n, AlertCard as t };
