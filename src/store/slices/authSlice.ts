import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, Club, Athlete } from '../../types';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../../data/mockData';
import {
  STORAGE_KEYS,
  readJSON,
  readString,
  writeString,
  removeItem,
} from '../persistence';

export interface AuthState {
  role: Role;
  status: 'idle' | 'authenticated';
  club: Club;
  athlete: Athlete;
  token: string | null;
}

function readInitialRole(): Role {
  const saved = readString(STORAGE_KEYS.role);
  if (saved === 'CLUB' || saved === 'ATHLETE' || saved === 'LANDING') return saved;
  return 'LANDING';
}

function readInitialClub(): Club {
  const savedId = readString(STORAGE_KEYS.currentClubId);
  if (savedId) {
    const pool: Club[] = readJSON<Club[]>(STORAGE_KEYS.clubs, MOCK_CLUBS);
    const found = pool.find((c) => c.id === savedId);
    if (found) return found;
  }
  return MOCK_CLUBS[0];
}

function readInitialAthlete(): Athlete {
  const savedId = readString(STORAGE_KEYS.currentAthleteId);
  if (savedId) {
    const pool: Athlete[] = readJSON<Athlete[]>(STORAGE_KEYS.athletes, MOCK_ATHLETES);
    const found = pool.find((a) => a.id === savedId);
    if (found) return found;
  }
  return MOCK_ATHLETES[0];
}

const initialRole = readInitialRole();

const initialState: AuthState = {
  role: initialRole,
  status: initialRole === 'LANDING' ? 'idle' : 'authenticated',
  club: readInitialClub(),
  athlete: readInitialAthlete(),
  token: null,
};

function persistSession(role: Role, athlete?: Athlete | null, club?: Club | null) {
  writeString(STORAGE_KEYS.role, role);
  if (athlete) writeString(STORAGE_KEYS.currentAthleteId, athlete.id);
  if (club) writeString(STORAGE_KEYS.currentClubId, club.id);
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
      state.status = action.payload === 'LANDING' ? 'idle' : 'authenticated';
      persistSession(action.payload, state.athlete, state.club);
    },
    setClub(state, action: PayloadAction<Club>) {
      state.club = action.payload;
      writeString(STORAGE_KEYS.currentClubId, action.payload.id);
    },
    setAthlete(state, action: PayloadAction<Athlete>) {
      state.athlete = action.payload;
      writeString(STORAGE_KEYS.currentAthleteId, action.payload.id);
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    login(
      state,
      action: PayloadAction<{ role: Role; club?: Club; athlete?: Athlete; token?: string }>
    ) {
      const { role, club, athlete, token } = action.payload;
      state.role = role;
      state.status = role === 'LANDING' ? 'idle' : 'authenticated';
      if (club) state.club = club;
      if (athlete) state.athlete = athlete;
      if (token !== undefined) state.token = token;
      persistSession(role, athlete ?? state.athlete, club ?? state.club);
    },
    logout(state) {
      state.role = 'LANDING';
      state.status = 'idle';
      state.token = null;
      removeItem(STORAGE_KEYS.role);
      removeItem(STORAGE_KEYS.currentAthleteId);
      removeItem(STORAGE_KEYS.currentClubId);
    },
  },
});

export const { setRole, setClub, setAthlete, setToken, login, logout } = authSlice.actions;
export default authSlice.reducer;
