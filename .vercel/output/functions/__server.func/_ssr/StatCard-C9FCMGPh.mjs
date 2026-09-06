import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { C as cn, o as Delta } from "./theme-DXxfDXZX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatCard-C9FCMGPh.js
var import_jsx_runtime = require_jsx_runtime();
/** Headline metric tile used across the dashboard and detail pages. */
function StatCard({ label, value, delta, sub, icon: Icon, tone = "neutral", className }) {
	const toneRing = {
		neutral: "",
		profit: "border-profit/25",
		loss: "border-loss/25",
		warn: "border-warn/25",
		primary: "border-primary/30"
	}[tone];
	const toneText = {
		neutral: "text-foreground",
		profit: "text-profit",
		loss: "text-loss",
		warn: "text-warn",
		primary: "text-foreground"
	}[tone];
	const toneIcon = {
		neutral: "text-muted-foreground",
		profit: "text-profit",
		loss: "text-loss",
		warn: "text-warn",
		primary: "text-primary"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("glass relative overflow-hidden rounded-2xl p-4 md:p-5", toneRing, className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
					children: label
				}), Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4 shrink-0", toneIcon) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("num mt-2.5 text-xl font-semibold tracking-tight md:text-2xl", toneText),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-2",
				children: [delta !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, { value: delta }), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-xs text-muted-foreground",
					children: sub
				})]
			})
		]
	});
}
//#endregion
export { StatCard as t };
