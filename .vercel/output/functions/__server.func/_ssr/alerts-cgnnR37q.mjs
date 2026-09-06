import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { J as BellOff, K as Bell, q as BellRing, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { U as useAlertProgress, X as useStore, r as Button } from "./theme-DXxfDXZX.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as AlertCard } from "./AlertCard--NYFh12n.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-COUlkzTL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alerts-cgnnR37q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		status: "ACTIVE",
		label: "Active",
		icon: BellRing,
		empty: "No active alerts. Create one and we'll watch the market while you live your life."
	},
	{
		status: "TRIGGERED",
		label: "Triggered",
		icon: Bell,
		empty: "Nothing has hit its target yet. We'll move alerts here the moment they fire."
	},
	{
		status: "DISABLED",
		label: "Disabled",
		icon: BellOff,
		empty: "No disabled alerts. Pause an alert instead of deleting it to keep the target around."
	}
];
function Alerts() {
	const { alerts, getCoin, updateAlert, removeAlert, loading } = useStore();
	const { data: progressRows } = useAlertProgress();
	const { openAlertDialog } = useAppUi();
	const [tab, setTab] = (0, import_react.useState)("ACTIVE");
	/** Server-computed progress, by alert id (spec 30 — the browser doesn't judge). */
	const progressById = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of progressRows ?? []) map.set(row.alertId, row);
		return map;
	}, [progressRows]);
	const grouped = (0, import_react.useMemo)(() => {
		const buckets = {
			ACTIVE: [],
			TRIGGERED: [],
			DISABLED: []
		};
		for (const alert of alerts) buckets[alert.status].push(alert);
		return buckets;
	}, [alerts]);
	/** Null for portfolio alerts, and for coins the market feed hasn't loaded. */
	const coinFor = (alert) => alert.coinId ? getCoin(alert.coinId) ?? null : null;
	const handleToggle = async (alert) => {
		const nextStatus = alert.status === "DISABLED" ? "ACTIVE" : "DISABLED";
		if (await updateAlert(alert.id, { status: nextStatus })) toast.success(nextStatus === "ACTIVE" ? "Alert re-armed" : "Alert disabled");
	};
	const handleDelete = async (alert) => {
		if (await removeAlert(alert.id)) toast.success("Alert deleted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Price Alerts",
		subtitle: "Set the target once. We keep watching — loudly.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => openAlertDialog(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New alert"]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: tab,
			onValueChange: (v) => setTab(v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
				className: "w-full sm:w-auto",
				children: TABS.map(({ status, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: status,
					className: "flex-1 gap-1.5 sm:flex-none",
					children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num rounded-full bg-muted px-1.5 text-[10px] font-semibold",
						children: grouped[status].length
					})]
				}, status))
			}), TABS.map(({ status, label, icon: Icon, empty }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: status,
				className: "mt-5",
				children: grouped[status].length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-2xl px-6 py-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 font-display text-lg font-semibold",
							children: loading.alerts ? "Loading alerts…" : `No ${label} alerts`
						}),
						!loading.alerts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
							children: empty
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-5",
							onClick: () => openAlertDialog(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Create alert"]
						})] })
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
					children: grouped[status].map((alert) => {
						const coin = coinFor(alert);
						const targetPrice = alert.targetPrice;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertCard, {
							alert,
							coin,
							progress: progressById.get(alert.id),
							onEdit: coin ? () => openAlertDialog({
								coin,
								...targetPrice === void 0 ? {} : { defaultTargetPrice: targetPrice }
							}) : void 0,
							onToggle: () => void handleToggle(alert),
							onDelete: () => void handleDelete(alert)
						}, alert.id);
					})
				})
			}, status))]
		})
	});
}
//#endregion
export { Alerts as component };
