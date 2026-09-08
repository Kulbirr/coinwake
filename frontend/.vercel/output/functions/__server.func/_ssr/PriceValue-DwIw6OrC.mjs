import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { C as cn, M as formatPrice } from "./theme-DXxfDXZX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PriceValue-DwIw6OrC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Live price that briefly flashes green/red whenever the feed moves it. */
function PriceValue({ value, className, format = formatPrice }) {
	const previous = (0, import_react.useRef)(value);
	const [direction, setDirection] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (value === previous.current) return void 0;
		setDirection(value > previous.current ? "up" : "down");
		previous.current = value;
		const timer = setTimeout(() => setDirection(null), 700);
		return () => clearTimeout(timer);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("num rounded-sm px-1 -mx-1 transition-colors", direction === "up" && "flash-up text-profit", direction === "down" && "flash-down text-loss", className),
		children: format(value)
	});
}
//#endregion
export { PriceValue as t };
