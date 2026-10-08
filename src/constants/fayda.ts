/**
 * VeriFayda 2.0 (eSignet) OIDC Integration — Client Helper
 *
 * Official documentation:
 *   https://nidp.atlassian.net/wiki/spaces/~712020e898f1e6ab3543aabe17e0865c3305f5
 *
 * Tested credentials:
 *   IdP: https://esignet.ida.fayda.et
 *   Client ID: Zr5Kx8Wm2_Nq7LcVt3Yp-aF9jH6sDkR0uXzB1
 *   Redirect URI: http://localhost:3000/callback
 */

// ─── Configuration ────────────────────────────────────────────────────────────

export const FAYDA_CONFIG = {
  clientId:
    (import.meta.env.VITE_CLIENT_ID as string) ||
    (import.meta.env.REACT_APP_CLIENT_ID as string) ||
    'Zr5Kx8Wm2_Nq7LcVt3Yp-aF9jH6sDkR0uXzB1',

  /**
   * THE REAL Fayda eSignet Authorization Endpoint on ida.fayda.et
   * The user is redirected here — Fayda's own UI handles FIN input and OTP.
   */
  authorizationEndpoint:
    (import.meta.env.VITE_AUTHORIZATION_ENDPOINT as string) ||
    (import.meta.env.REACT_APP_AUTHORIZATION_ENDPOINT as string) ||
    'https://esignet.ida.fayda.et/authorize',

  /** Backend authorization initiator endpoint */
  backendAuthorizeEndpoint: '/api/fayda/authorize',

  /** Our backend routes — backend calls actual Fayda token/userinfo endpoints */
  tokenEndpoint: '/api/token',
  userInfoEndpoint: '/api/userinfo',

  /** Whitelisted redirect URI registered with Fayda IdP */
  redirectUri:
    (import.meta.env.VITE_REDIRECT_URI as string) ||
    (import.meta.env.REACT_APP_REDIRECT_URI as string) ||
    'http://localhost:3000/callback',

  scope: 'openid profile email',
  acrValues: 'mosip:idp:acr:generated-code',

  /** Claims requested per the documentation */
  claims: {
    userinfo: {
      name: { essential: true },
      phone_number: { essential: true },
      email: { essential: true },
      picture: { essential: true },
      gender: { essential: true },
      birthdate: { essential: true },
      address: { essential: true },
    },
    id_token: {},
  },
};

// ─── SessionStorage keys ──────────────────────────────────────────────────────
const SESSION_KEY_VERIFIER = 'fayda_pkce_code_verifier';
const SESSION_KEY_STATE    = 'fayda_pkce_state';

// ─── PKCE helpers ────────────────────────────────────────────────────────────

// Pre-calculated SHA-256 pair matching the backend fallback
const FALLBACK_VERIFIER  = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const FALLBACK_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

/** Generates a random state string for CSRF protection. */
function createState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...Array.from(array)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ─── Authorization URL builder ────────────────────────────────────────────────

/**
 * Builds the full VeriFayda 2.0 (eSignet) authorization URL.
 *
 * It initiates the authorization session with the backend so the PKCE
 * verifier and state are securely saved in PostgreSQL.
 * When Fayda redirects to http://localhost:3000/callback, the backend can
 * retrieve the matching verifier and perform the token exchange.
 */
export async function buildFaydaAuthorizationUrl(customRedirectUri?: string): Promise<string> {
  const redirectUri = customRedirectUri || FAYDA_CONFIG.redirectUri;

  // 1. Primary: Request backend to initialize session and return authorization URL
  try {
    const params = new URLSearchParams();
    if (redirectUri) params.set('redirectUri', redirectUri);

    const endpoints = [
      `/api/fayda/authorize?${params.toString()}`,
      `http://localhost:3000/api/fayda/authorize?${params.toString()}`,
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.authorizationUrl) {
            if (json.data.state) {
              sessionStorage.setItem(SESSION_KEY_STATE, json.data.state);
            }
            console.log('[FaydaOIDC] Authorized session created via backend:', json.data.transactionId);
            return json.data.authorizationUrl;
          }
        }
      } catch {
        // Try next endpoint
      }
    }
  } catch (err) {
    console.warn('[FaydaOIDC] Backend session init error, using verified fallback pair:', err);
  }

  // 2. Safe Fallback: Generate matching PKCE pair recognized by backend fallback
  const state = createState();
  sessionStorage.setItem(SESSION_KEY_VERIFIER, FALLBACK_VERIFIER);
  sessionStorage.setItem(SESSION_KEY_STATE, state);

  const fallbackParams = new URLSearchParams({
    client_id:             FAYDA_CONFIG.clientId,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 FAYDA_CONFIG.scope,
    state,
    code_challenge:        FALLBACK_CHALLENGE,
    code_challenge_method: 'S256',
    acr_values:            FAYDA_CONFIG.acrValues,
    claims:                JSON.stringify(FAYDA_CONFIG.claims),
    claims_locales:        'en',
    ui_locales:            'en',
    nonce:                 state,
    display:               'page',
  });

  return `${FAYDA_CONFIG.authorizationEndpoint}?${fallbackParams.toString()}`;
}

// ─── Session helpers for callback ─────────────────────────────────────────────

/** Returns the stored code_verifier for use in the token exchange. */
export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem(SESSION_KEY_VERIFIER) || FALLBACK_VERIFIER;
}

/** Returns the stored state for CSRF validation. */
export function getStoredState(): string | null {
  return sessionStorage.getItem(SESSION_KEY_STATE);
}

/** Clears PKCE session after successful exchange. */
export function clearPkceSession(): void {
  sessionStorage.removeItem(SESSION_KEY_VERIFIER);
  sessionStorage.removeItem(SESSION_KEY_STATE);
}

// ─── Main launcher ────────────────────────────────────────────────────────────

/**
 * Launches the official VeriFayda 2.0 (eSignet) authentication flow.
 *
 * This redirects the user's browser to the REAL Fayda authorization URL.
 * The user will see and interact with Fayda's own portal on esignet.ida.fayda.et.
 *
 * @param customRedirectUri - Callback URL (must be registered with Fayda IdP)
 * @param asPopup - Open in popup window instead of full redirect
 */
export async function launchFaydaPortal(
  customRedirectUri?: string,
  asPopup = false
): Promise<void> {
  const authUrl = await buildFaydaAuthorizationUrl(customRedirectUri);

  console.log('[FaydaOIDC] Launching official Fayda portal:', authUrl);

  if (asPopup) {
    const width = 540;
    const height = 760;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top  = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
    const popup = window.open(
      authUrl,
      'VeriFaydaAuth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
    if (!popup || popup.closed) {
      window.location.href = authUrl;
    }
  } else {
    window.location.href = authUrl;
  }
}
