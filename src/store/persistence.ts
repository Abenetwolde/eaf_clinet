// ─────────────────────────────────────────────────────────────────────────────
// localStorage persistence keys + safe helpers
//
// Single source of truth for every localStorage key used by the Redux slices.
// Existing keys are kept as-is to avoid breaking previously saved sessions;
// new keys are only added where a slice genuinely needs to persist new data.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  role: 'eaf_currentRole',
  currentAthleteId: 'eaf_currentAthleteId',
  currentClubId: 'eaf_currentClubId',
  athletes: 'eaf_athletes',
  clubs: 'eaf_clubs',
  transfers: 'eaf_transfers',
  accessToken: 'eaf_accessToken',
  refreshToken: 'eaf_refreshToken',
  userId: 'eaf_userId',
  userData: 'eaf_userData',
} as const;

// Remove client-side club, athlete, and transfer fixtures cached by older builds.
// The backend registry is now the source of truth for these records.
const CLUB_ATHLETE_RESET_KEY = 'eaf_club_athlete_data_reset_v1';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(CLUB_ATHLETE_RESET_KEY) !== 'done') {
      [STORAGE_KEYS.clubs, STORAGE_KEYS.athletes, STORAGE_KEYS.transfers,
        STORAGE_KEYS.currentClubId, STORAGE_KEYS.currentAthleteId].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(CLUB_ATHLETE_RESET_KEY, 'done');
    }
  } catch {
    // Storage can be unavailable in private browsing; keep the app usable.
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode / quota); never crash the app.
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures.
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export function clearAllSessionData(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.clear();
  } catch {}

  const keysToRemove = [
    STORAGE_KEYS.role,
    STORAGE_KEYS.currentAthleteId,
    STORAGE_KEYS.currentClubId,
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.userId,
    STORAGE_KEYS.userData,
    "token",
    "eaf_token",
    "eaf_accessToken",
    "eaf_refreshToken",
    "eaf_userId",
    "eaf_userData",
    "eaf_currentRole",
    "eaf_currentAthleteId",
    "eaf_currentClubId",
    "eaf_currentClub",
    "eaf_registered_athlete",
    "eaf_registered_info",
    "eaf_user_avatar",
    "fayda_auth_payload",
    "fayda_photo",
    "fayda_token",
    "eaf_fayda_verified",
    "eaf_registration_status",
  ];

  for (const k of keysToRemove) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}
