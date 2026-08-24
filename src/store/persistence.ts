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
} as const;

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
