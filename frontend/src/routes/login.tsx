import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BellRing, KeyRound, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/app/AppShell";
import { GoogleSignInButton } from "@/components/app/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerConfig } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: Login,
});

/**
 * `FORGOT` has no endpoint behind it — the API has register, login, refresh,
 * Google and wallet, and no password reset — so that mode explains the situation
 * instead of pretending to send a link.
 */
type Mode = "SIGN_IN" | "SIGN_UP" | "FORGOT";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  SIGN_IN: {
    title: "Welcome back",
    subtitle: "Sign in to sync your alerts, portfolio and watchlist.",
    cta: "Sign in",
  },
  SIGN_UP: {
    title: "Create your account",
    subtitle: "Set your target. Go live your life. We'll wake you up when crypto gets there.",
    cta: "Create account",
  },
  FORGOT: {
    title: "Password help",
    subtitle: "Resetting your own password isn't available yet.",
    cta: "Back to sign in",
  },
};

function Login() {
  const { signIn, register, signInWithGoogle } = useStore();
  const { data: config } = useServerConfig();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("SIGN_IN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const copy = COPY[mode];
  const emailValid = /.+@.+\..+/.test(email);
  const canSubmit =
    !busy && emailValid && password.length >= 6 && (mode !== "SIGN_UP" || name.trim().length > 0);

  /** Only a session the server issued gets us past this screen. */
  const finish = (ok: boolean, greeting: string) => {
    if (!ok) return; // The store already showed the server's message (spec 35).
    toast.success(greeting, { description: "Your alerts are watching the market." });
    void navigate({ to: "/dashboard" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    const ok =
      mode === "SIGN_UP"
        ? await register(email.trim(), password, name.trim())
        : await signIn(email.trim(), password);
    setBusy(false);
    finish(ok, mode === "SIGN_UP" ? "Account created" : "Signed in");
  };

  const googleCredential = async (idToken: string) => {
    setBusy(true);
    const ok = await signInWithGoogle(idToken);
    setBusy(false);
    finish(ok, "Signed in with Google");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 380px at 50% -5%, oklch(0.62 0.19 268 / 0.28), transparent 68%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </Button>
        </div>

        <div className="glass rounded-3xl p-6 shadow-glow md:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
            {mode === "FORGOT" ? (
              <KeyRound className="size-5 text-primary-foreground" />
            ) : (
              <BellRing className="size-5 text-primary-foreground" />
            )}
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">{copy.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{copy.subtitle}</p>

          {mode === "FORGOT" ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm">
                <p className="font-medium text-warn">No self-serve reset yet</p>
                <p className="mt-1 text-muted-foreground">
                  We can't email you a reset link — that part of the account system isn't built.
                  Nothing has been sent. If you can still sign in, change your password from
                  Settings; otherwise you'll need whoever runs this deployment to reset it for you.
                </p>
              </div>
              <Button className="h-11 w-full" onClick={() => setMode("SIGN_IN")}>
                {copy.cta} <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <GoogleSignInButton
                  enabled={Boolean(config?.googleAuthEnabled)}
                  onCredential={(token) => void googleCredential(token)}
                />
              </div>
              {config?.googleAuthEnabled && (
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or {mode === "SIGN_UP" ? "sign up" : "sign in"} with email
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}

              <form
                onSubmit={(e) => void submit(e)}
                className={cn("space-y-3.5", !config?.googleAuthEnabled && "mt-6")}
              >
                {mode === "SIGN_UP" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="login-name">Name</Label>
                    <Input
                      id="login-name"
                      className="h-11"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Satoshi"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      className="h-11 pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    {mode === "SIGN_IN" && (
                      <button
                        type="button"
                        onClick={() => setMode("FORGOT")}
                        className="cursor-pointer text-xs text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      className="h-11 pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === "SIGN_UP" ? "new-password" : "current-password"}
                    />
                  </div>
                  {mode === "SIGN_UP" && (
                    <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                  )}
                </div>

                <Button type="submit" className="h-11 w-full" disabled={!canSubmit}>
                  {busy ? "Signing in…" : copy.cta}
                  {!busy && <ArrowRight className="size-4" />}
                </Button>
              </form>
            </>
          )}

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "SIGN_IN" && (
              <>
                New here?{" "}
                <button
                  onClick={() => setMode("SIGN_UP")}
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
            {mode === "SIGN_UP" && (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("SIGN_IN")}
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your account lives on the CoinWake server so alerts keep running with this tab closed. We
          never ask for a seed phrase or private key.
        </p>
      </div>
    </div>
  );
}
