import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { E as Lock, Q as ArrowLeft, Z as ArrowRight, k as KeyRound, q as BellRing, w as Mail } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as cn, X as useStore, Y as useServerConfig, r as Button } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { n as BrandMark } from "./AppShell-B6uWFBnx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BL0sosjR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Google Identity Services, loaded on demand.
*
* `POST /auth/google` wants an ID token signed by Google, and only Google can
* produce one — so the app renders Google's own button and hands the credential
* it returns straight to the server, which verifies the signature. Nothing here
* ever sees a password, and the client id is public by design (spec 3: it isn't
* a secret; the server holds the verification side).
*
* Two switches have to be on for any of this to appear: `GOOGLE_CLIENT_ID` on the
* server, surfaced as `config.googleAuthEnabled`, and `VITE_GOOGLE_CLIENT_ID`
* here. With either missing the sign-in screen shows email only, rather than a
* button that can't work.
*/
var SDK_URL = "https://accounts.google.com/gsi/client";
/** The web client id this build was compiled with, or null if it wasn't given one. */
function googleClientId() {
	const id = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:4000/api",
		"VITE_GOOGLE_CLIENT_ID": "828220796194-q8pik10ecofke22a0uu17g758e7e5tli.apps.googleusercontent.com"
	}["VITE_GOOGLE_CLIENT_ID"];
	return id && id.trim() ? id.trim() : null;
}
var loading = null;
/**
* Load the SDK once per page. Concurrent callers share the same promise, so two
* buttons on screen don't pull the script twice.
*/
function loadGoogleIdentity() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("Google sign-in needs a browser."));
	if (window.google) return Promise.resolve(window.google);
	if (loading) return loading;
	loading = new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[src="${SDK_URL}"]`);
		const script = existing ?? document.createElement("script");
		const settle = () => {
			const api = window.google;
			if (api) resolve(api);
			else reject(/* @__PURE__ */ new Error("Google sign-in didn't load."));
		};
		script.addEventListener("load", settle, { once: true });
		script.addEventListener("error", () => {
			loading = null;
			reject(/* @__PURE__ */ new Error("Google sign-in didn't load."));
		}, { once: true });
		if (!existing) {
			script.src = SDK_URL;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
	});
	return loading;
}
/**
* Google's own sign-in button, rendered by their SDK.
*
* It has to be Google's button: the ID token `POST /auth/google` verifies can only
* come from their iframe, so a custom button styled to match the rest of the app
* would have nothing to hand the server. Renders nothing at all unless this build
* has a client id and the server reports Google auth is configured — an inert
* "Continue with Google" would be worse than none.
*/
function GoogleSignInButton({ enabled, onCredential }) {
	const host = (0, import_react.useRef)(null);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const clientId = googleClientId();
	const handler = (0, import_react.useRef)(onCredential);
	handler.current = onCredential;
	(0, import_react.useEffect)(() => {
		if (!enabled || !clientId) return;
		let cancelled = false;
		loadGoogleIdentity().then((api) => {
			if (cancelled || !host.current) return;
			api.accounts.id.initialize({
				client_id: clientId,
				callback: (response) => {
					if (response.credential) handler.current(response.credential);
				}
			});
			api.accounts.id.renderButton(host.current, {
				type: "standard",
				theme: "outline",
				size: "large",
				text: "continue_with",
				shape: "pill",
				logo_alignment: "center"
			});
		}).catch(() => {
			if (!cancelled) setFailed(true);
		});
		return () => {
			cancelled = true;
		};
	}, [enabled, clientId]);
	if (!enabled || !clientId || failed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: host,
		className: "flex justify-center [&>div]:w-full"
	});
}
var COPY = {
	SIGN_IN: {
		title: "Welcome back",
		subtitle: "Sign in to sync your alerts, portfolio and watchlist.",
		cta: "Sign in"
	},
	SIGN_UP: {
		title: "Create your account",
		subtitle: "Set your target. Go live your life. We'll wake you up when crypto gets there.",
		cta: "Create account"
	},
	FORGOT: {
		title: "Password help",
		subtitle: "Resetting your own password isn't available yet.",
		cta: "Back to sign in"
	}
};
function Login() {
	const { signIn, register, signInWithGoogle } = useStore();
	const { data: config } = useServerConfig();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("SIGN_IN");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const copy = COPY[mode];
	const emailValid = /.+@.+\..+/.test(email);
	const canSubmit = !busy && emailValid && password.length >= 6 && (mode !== "SIGN_UP" || name.trim().length > 0);
	/** Only a session the server issued gets us past this screen. */
	const finish = (ok, greeting) => {
		if (!ok) return;
		toast.success(greeting, { description: "Your alerts are watching the market." });
		navigate({ to: "/dashboard" });
	};
	const submit = async (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		setBusy(true);
		const ok = mode === "SIGN_UP" ? await register(email.trim(), password, name.trim()) : await signIn(email.trim(), password);
		setBusy(false);
		finish(ok, mode === "SIGN_UP" ? "Account created" : "Signed in");
	};
	const googleCredential = async (idToken) => {
		setBusy(true);
		const ok = await signInWithGoogle(idToken);
		setBusy(false);
		finish(ok, "Signed in with Google");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0",
			style: { background: "radial-gradient(720px 380px at 50% -5%, oklch(0.62 0.19 268 / 0.28), transparent 68%)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Home"]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-3xl p-6 shadow-glow md:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow",
							children: mode === "FORGOT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5 text-primary-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "size-5 text-primary-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-2xl font-bold",
							children: copy.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: copy.subtitle
						}),
						mode === "FORGOT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-warn",
									children: "No self-serve reset yet"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted-foreground",
									children: "We can't email you a reset link — that part of the account system isn't built. Nothing has been sent. If you can still sign in, change your password from Settings; otherwise you'll need whoever runs this deployment to reset it for you."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "h-11 w-full",
								onClick: () => setMode("SIGN_IN"),
								children: [
									copy.cta,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleSignInButton, {
									enabled: Boolean(config?.googleAuthEnabled),
									onCredential: (token) => void googleCredential(token)
								})
							}),
							config?.googleAuthEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-5 flex items-center gap-3 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
									"or ",
									mode === "SIGN_UP" ? "sign up" : "sign in",
									" with email",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => void submit(e),
								className: cn("space-y-3.5", !config?.googleAuthEnabled && "mt-6"),
								children: [
									mode === "SIGN_UP" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "login-name",
											children: "Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "login-name",
											className: "h-11",
											value: name,
											onChange: (e) => setName(e.target.value),
											placeholder: "Satoshi",
											autoComplete: "name"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "login-email",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "login-email",
												type: "email",
												className: "h-11 pl-9",
												value: email,
												onChange: (e) => setEmail(e.target.value),
												placeholder: "you@example.com",
												autoComplete: "email"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "login-password",
													children: "Password"
												}), mode === "SIGN_IN" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setMode("FORGOT"),
													className: "cursor-pointer text-xs text-primary hover:underline",
													children: "Forgot?"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "login-password",
													type: "password",
													className: "h-11 pl-9",
													value: password,
													onChange: (e) => setPassword(e.target.value),
													placeholder: "••••••••",
													autoComplete: mode === "SIGN_UP" ? "new-password" : "current-password"
												})]
											}),
											mode === "SIGN_UP" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "At least 6 characters."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										className: "h-11 w-full",
										disabled: !canSubmit,
										children: [busy ? "Signing in…" : copy.cta, !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
									})
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 text-center text-sm text-muted-foreground",
							children: [mode === "SIGN_IN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"New here?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setMode("SIGN_UP"),
									className: "cursor-pointer font-medium text-primary hover:underline",
									children: "Create an account"
								})
							] }), mode === "SIGN_UP" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Already have an account?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setMode("SIGN_IN"),
									className: "cursor-pointer font-medium text-primary hover:underline",
									children: "Sign in"
								})
							] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center text-xs text-muted-foreground",
					children: "Your account lives on the CoinWake server so alerts keep running with this tab closed. We never ask for a seed phrase or private key."
				})
			]
		})]
	});
}
//#endregion
export { Login as component };
