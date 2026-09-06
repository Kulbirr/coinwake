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

const SDK_URL = "https://accounts.google.com/gsi/client";

/** The web client id this build was compiled with, or null if it wasn't given one. */
export function googleClientId(): string | null {
  const id = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;
  return id && id.trim() ? id.trim() : null;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "small" | "medium" | "large";
          text?: "signin_with" | "signup_with" | "continue_with";
          shape?: "rectangular" | "pill";
          width?: number;
          logo_alignment?: "left" | "center";
        },
      ) => void;
      cancel: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

let loading: Promise<GoogleIdentityApi> | null = null;

/**
 * Load the SDK once per page. Concurrent callers share the same promise, so two
 * buttons on screen don't pull the script twice.
 */
export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in needs a browser."));
  }
  if (window.google) return Promise.resolve(window.google);
  if (loading) return loading;

  loading = new Promise<GoogleIdentityApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const script = existing ?? document.createElement("script");
    const settle = () => {
      const api = window.google;
      if (api) resolve(api);
      else reject(new Error("Google sign-in didn't load."));
    };
    script.addEventListener("load", settle, { once: true });
    script.addEventListener(
      "error",
      () => {
        // Let a later attempt retry rather than caching the failure forever.
        loading = null;
        reject(new Error("Google sign-in didn't load."));
      },
      { once: true },
    );
    if (!existing) {
      script.src = SDK_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return loading;
}
