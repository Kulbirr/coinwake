import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-DYZmOnb-.js
var $$splitComponentImporter = () => import("./portfolio-aoQ0RPmi.mjs");
var Route = createFileRoute("/portfolio")({
	validateSearch: (search) => ({ ...typeof search["add"] === "string" ? { add: search["add"] } : {} }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
