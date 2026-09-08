import { useEffect, useRef, useState } from "react";

import { googleClientId, loadGoogleIdentity } from "@/lib/google-auth";

/**
 * Google's own sign-in button, rendered by their SDK.
 *
 * It has to be Google's button: the ID token `POST /auth/google` verifies can only
 * come from their iframe, so a custom button styled to match the rest of the app
 * would have nothing to hand the server. Renders nothing at all unless this build
 * has a client id and the server reports Google auth is configured — an inert
 * "Continue with Google" would be worse than none.
 */
export function GoogleSignInButton({
  enabled,
  onCredential,
}: {
  /** The server's `config.googleAuthEnabled`. */
  enabled: boolean;
  onCredential: (idToken: string) => void;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const clientId = googleClientId();

  // Kept in a ref so a new callback identity doesn't re-render the button.
  const handler = useRef(onCredential);
  handler.current = onCredential;

  useEffect(() => {
    if (!enabled || !clientId) return;
    let cancelled = false;

    void loadGoogleIdentity()
      .then((api) => {
        if (cancelled || !host.current) return;
        api.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) handler.current(response.credential);
          },
        });
        api.accounts.id.renderButton(host.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, clientId]);

  if (!enabled || !clientId || failed) return null;

  return <div ref={host} className="flex justify-center [&>div]:w-full" />;
}
