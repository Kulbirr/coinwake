import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calculator-C_UHmOOA.js
var $$splitComponentImporter = () => import("./calculator-BI3GQiM_.mjs");
var Route = createFileRoute("/calculator")({
	validateSearch: (search) => ({ ...typeof search["coin"] === "string" ? { coin: search["coin"] } : {} }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
