// EOSCRMS — Ethiopian Athletics Federation Registry
// NOTE: name, dob are fetched from Fayda API — not entered manually

import type { Club, Athlete, Transfer } from '../types';

export const MOCK_CLUBS: Club[] = [];

// Athletes — name/dob sourced from Fayda; all other fields are sports-specific
export const MOCK_ATHLETES: Athlete[] = [];

export const MOCK_TRANSFERS: Transfer[] = [];

export const MOCK_MEETS: any[] = [];

export const MOCK_NEWS: any[] = [];

export const MOCK_EVENT_RESULTS: Record<string, Array<{ discipline: string; results: Array<{ pos: number; athleteName: string; club: string; time: string; pb: boolean; sb: boolean; nat: string; }> }>> = {};

export const MOCK_LIVE_SPLITS: any[] = [];
