import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { K as Bell, S as Monitor, T as LogOut, a as User, f as Smartphone, g as Send, i as Volume2, k as KeyRound, p as Siren, q as BellRing, r as VolumeX, w as Mail } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as cn, I as isPushEnabled, L as push, R as pushSupport, T as enablePush, V as requestBrowserNotifications, X as useStore, Y as useServerConfig, g as alarmEngine, r as Button, w as disablePush } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { t as Badge } from "./badge-CgxlUbIx.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-COBT5RTn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function Section({ icon: Icon, title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-2xl p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5 text-primary" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-sm text-muted-foreground",
				children: description
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children
		})]
	});
}
/** One labelled switch over a server-side settings flag. */
function ToggleRow({ icon: Icon, label, hint, checked, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: hint
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			disabled: disabled ?? false,
			onCheckedChange: onChange,
			"aria-label": label
		})]
	});
}
function SettingsPage() {
	const { user, settings, signOut, alarmSoundEnabled, setAlarmSoundEnabled, alerts, updateSettings, updateProfile, changePassword } = useStore();
	const { data: config } = useServerConfig();
	const [permission, setPermission] = (0, import_react.useState)("default");
	const [name, setName] = (0, import_react.useState)(user?.name ?? "");
	const [savingProfile, setSavingProfile] = (0, import_react.useState)(false);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [savingPassword, setSavingPassword] = (0, import_react.useState)(false);
	const [pushOn, setPushOn] = (0, import_react.useState)(false);
	const [pushBusy, setPushBusy] = (0, import_react.useState)(false);
	const support = pushSupport();
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !("Notification" in window)) {
			setPermission("unsupported");
			return;
		}
		setPermission(Notification.permission);
		isPushEnabled().then(setPushOn);
	}, []);
	(0, import_react.useEffect)(() => {
		setName(user?.name ?? "");
	}, [user]);
	const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
	const toggleAlarm = async (on) => {
		if (!on) {
			alarmEngine.stop();
			setAlarmSoundEnabled(false);
			return;
		}
		if (!await alarmEngine.unlock()) {
			toast.error("Your browser blocked audio", { description: "Interact with the page once more, then try again." });
			return;
		}
		alarmEngine.test(.22);
		setAlarmSoundEnabled(true);
		toast.success("Alarm armed", { description: `Watching ${activeCount} active alerts.` });
	};
	const askNotifications = async () => {
		const next = await requestBrowserNotifications();
		setPermission(next);
		if (next === "granted") {
			toast.success("Browser notifications enabled");
			updateSettings({ notifications: { browser: true } });
		} else if (next === "denied") toast.error("Notifications blocked", { description: "Re-enable them in your browser's site settings." });
	};
	const togglePush = async (on) => {
		setPushBusy(true);
		if (!on) {
			await disablePush();
			setPushOn(false);
			setPushBusy(false);
			await updateSettings({ notifications: { push: false } });
			return;
		}
		const result = await enablePush();
		setPushBusy(false);
		if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
		if (!result.ok) {
			toast.error(result.reason, result.hint ? { description: result.hint } : void 0);
			return;
		}
		setPushOn(true);
		await updateSettings({ notifications: { push: true } });
		toast.success("Push notifications on", { description: "We can now wake you with this tab closed." });
	};
	const sendTestPush = async () => {
		setPushBusy(true);
		try {
			const { devices } = await push.test();
			toast.success(devices > 0 ? `Test sent to ${devices} ${devices === 1 ? "device" : "devices"}` : "No devices subscribed yet");
		} catch {
			toast.error("We couldn't send the test notification.");
		} finally {
			setPushBusy(false);
		}
	};
	const saveProfile = async (e) => {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed || trimmed === user?.name) return;
		setSavingProfile(true);
		const ok = await updateProfile({ name: trimmed });
		setSavingProfile(false);
		if (ok) toast.success("Profile updated");
	};
	const savePassword = async (e) => {
		e.preventDefault();
		if (newPassword.length < 6) return;
		setSavingPassword(true);
		const ok = await changePassword({
			...user?.hasPassword ? { currentPassword } : {},
			newPassword
		});
		setSavingPassword(false);
		if (!ok) return;
		setCurrentPassword("");
		setNewPassword("");
		toast.success(user?.hasPassword ? "Password changed" : "Password set", { description: "Other devices have been signed out." });
	};
	const notifications = settings?.notifications;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Settings",
		subtitle: "Alarm, notifications and your account.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					icon: Siren,
					title: "Loud crypto alarm",
					description: "A repeating alarm that won't stop until you tap it — impossible to sleep through.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [alarmSoundEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4 text-profit" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4 text-warn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: alarmSoundEnabled ? "Alarm armed" : "Alarm muted"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: alarmSoundEnabled ? `Watching ${activeCount} active ${activeCount === 1 ? "alert" : "alerts"}.` : "Browsers block audio until you allow it."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: alarmSoundEnabled,
								onCheckedChange: (v) => void toggleAlarm(v),
								"aria-label": "Enable alarm sound"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "mt-3 w-full",
							onClick: () => void alarmEngine.test(.25),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), " Test alarm sound"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2.5 text-xs text-muted-foreground",
							children: "Test it once now so you know exactly what 3am sounds like."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					icon: Bell,
					title: "Notifications",
					description: "How we reach you when a target is hit — the server sends these, so they arrive with the app closed.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium",
										children: "Browser notifications"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: permission === "unsupported" ? "This browser doesn't support notifications." : permission === "granted" ? "Allowed — we can reach you outside the tab." : permission === "denied" ? "Blocked in your browser settings." : "Not requested yet."
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: cn("shrink-0 text-[10px] uppercase", permission === "granted" ? "border-profit/40 bg-profit/10 text-profit" : permission === "denied" ? "border-loss/40 bg-loss/10 text-loss" : "border-warn/40 bg-warn/10 text-warn"),
									children: permission
								})]
							}),
							permission !== "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full",
								disabled: permission === "unsupported",
								onClick: () => void askNotifications(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), " Enable browser notifications"]
							}),
							support.supported ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
								icon: Smartphone,
								label: "Push notifications",
								hint: pushOn ? "This device is subscribed." : config?.pushEnabled === false ? "The server has no push keys configured." : "Reach this device with the app closed.",
								checked: pushOn,
								disabled: pushBusy || config?.pushEnabled === false,
								onChange: (v) => void togglePush(v)
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-warn",
										children: "Push isn't available here"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-muted-foreground",
										children: support.reason
									}),
									support.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-muted-foreground",
										children: support.hint
									})
								]
							}),
							pushOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full",
								disabled: pushBusy,
								onClick: () => void sendTestPush(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Send a test notification"]
							}),
							notifications && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
									icon: Mail,
									label: "Email",
									hint: "A message to your inbox for every trigger.",
									checked: notifications.email,
									onChange: (v) => void updateSettings({ notifications: { email: v } })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
									icon: BellRing,
									label: "Price alerts",
									hint: "Coin targets: price, market cap and % moves.",
									checked: notifications.priceAlerts,
									onChange: (v) => void updateSettings({ notifications: { priceAlerts: v } })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
									icon: BellRing,
									label: "Portfolio alerts",
									hint: "Total value, profit, ROI and drawdown targets.",
									checked: notifications.portfolioAlerts,
									onChange: (v) => void updateSettings({ notifications: { portfolioAlerts: v } })
								})
							] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: "mt-2 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/notifications",
							children: "Open notification centre"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					icon: User,
					title: "Profile",
					description: "Your account on the CoinWake server, shared by every device you sign in on.",
					children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: (e) => void saveProfile(e),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "profile-name",
									children: "Display name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "profile-name",
									className: "h-11",
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Satoshi"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "profile-email",
										children: "Email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "profile-email",
										className: "h-11",
										value: user.email ?? "—",
										readOnly: true,
										disabled: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: user.email ? "Changing the email on an account isn't supported yet." : "This account signed in with a wallet, so it has no email."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "flex-1",
									disabled: savingProfile || !name.trim() || name.trim() === user.name,
									children: savingProfile ? "Saving…" : "Save profile"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									onClick: () => void signOut(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Signed in with ",
									user.authProviders.join(", "),
									"."
								]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface/50 px-4 py-5 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "You're browsing as a guest. Sign in to sync alerts and your portfolio."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-3.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Sign in"
							})
						})]
					})
				}),
				user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					icon: KeyRound,
					title: user.hasPassword ? "Change password" : "Set a password",
					description: user.hasPassword ? "Changing it signs out your other devices." : "Add one so you can sign in without Google or your wallet.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: (e) => void savePassword(e),
						children: [
							user.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "current-password",
									children: "Current password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "current-password",
									type: "password",
									className: "h-11",
									value: currentPassword,
									onChange: (e) => setCurrentPassword(e.target.value),
									autoComplete: "current-password",
									placeholder: "••••••••"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "new-password",
										children: "New password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "new-password",
										type: "password",
										className: "h-11",
										value: newPassword,
										onChange: (e) => setNewPassword(e.target.value),
										autoComplete: "new-password",
										placeholder: "••••••••"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "At least 6 characters."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								disabled: savingPassword || newPassword.length < 6 || user.hasPassword && currentPassword.length < 6,
								children: savingPassword ? "Saving…" : user.hasPassword ? "Change password" : "Set password"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					icon: Monitor,
					title: "Appearance",
					description: "CoinWake is built dark-first for late-night market watching.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: "Dark"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Green means profit, red means loss, amber means an alert is close. The server stores a theme preference for a future light mode; this build renders dark either way."
						})]
					})
				})
			]
		}), config?.disclaimer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-5 text-center text-xs text-muted-foreground",
			children: config.disclaimer
		})]
	});
}
//#endregion
export { SettingsPage as component };
