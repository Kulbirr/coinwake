import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-BA7_fbmK.js
var $$splitComponentImporter = () => import("./portfolio-fjjNUWPe.mjs");
var Route = createFileRoute("/portfolio")({
	validateSearch: (search) => ({ ...typeof search["add"] === "string" ? { add: search["add"] } : {} }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
