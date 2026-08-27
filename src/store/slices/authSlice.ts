import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, Club, Athlete } from '../../types';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../../data/mockData';
import {
  STORAGE_KEYS,
  readJSON,
  readString,
  writeString,
  writeJSON,
  removeItem,
} from '../persistence';

export interface UserDataFromApi {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  status: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuthState {
  role: Role;
  status: 'idle' | 'authenticated' | 'loading';
  club: Club;
  athlete: Athlete;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  userData: UserDataFromApi | null;
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

function readInitialToken(): string | null {
  return readString(STORAGE_KEYS.accessToken);
}

function readInitialRefreshToken(): string | null {
  return readString(STORAGE_KEYS.refreshToken);
}

function readInitialUserId(): string | null {
  return readString(STORAGE_KEYS.userId);
}

function readInitialUserData(): UserDataFromApi | null {
  return readJSON<UserDataFromApi | null>(STORAGE_KEYS.userData, null);
}

const initialRole = readInitialRole();
const savedToken = readInitialToken();

const initialState: AuthState = {
  role: initialRole,
  status: savedToken && initialRole !== 'LANDING' ? 'authenticated' : initialRole === 'LANDING' ? 'idle' : 'idle',
  club: readInitialClub(),
  athlete: readInitialAthlete(),
  token: savedToken,
  refreshToken: readInitialRefreshToken(),
  userId: readInitialUserId(),
  userData: readInitialUserData(),
};

function persistSession(
  role: Role,
  athlete?: Athlete | null,
  club?: Club | null,
  token?: string | null,
  refreshToken?: string | null,
  userId?: string | null,
  userData?: UserDataFromApi | null,
) {
  writeString(STORAGE_KEYS.role, role);
  if (athlete) writeString(STORAGE_KEYS.currentAthleteId, athlete.id);
  if (club) writeString(STORAGE_KEYS.currentClubId, club.id);
  if (token !== undefined) {
    if (token) writeString(STORAGE_KEYS.accessToken, token);
    else removeItem(STORAGE_KEYS.accessToken);
  }
  if (refreshToken !== undefined) {
    if (refreshToken) writeString(STORAGE_KEYS.refreshToken, refreshToken);
    else removeItem(STORAGE_KEYS.refreshToken);
  }
  if (userId !== undefined) {
    if (userId) writeString(STORAGE_KEYS.userId, userId);
    else removeItem(STORAGE_KEYS.userId);
  }
  if (userData !== undefined) {
    if (userData) writeJSON(STORAGE_KEYS.userData, userData);
    else removeItem(STORAGE_KEYS.userData);
  }
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
      if (action.payload) writeString(STORAGE_KEYS.accessToken, action.payload);
      else removeItem(STORAGE_KEYS.accessToken);
    },
    setUserData(state, action: PayloadAction<UserDataFromApi | null>) {
      state.userData = action.payload;
      if (action.payload) writeJSON(STORAGE_KEYS.userData, action.payload);
      else removeItem(STORAGE_KEYS.userData);
    },
    setAuthLoading(state) {
      state.status = 'loading';
    },
    login(
      state,
      action: PayloadAction<{
        role: Role;
        club?: Club;
        athlete?: Athlete;
        token?: string;
        refreshToken?: string;
        userId?: string;
        userData?: UserDataFromApi;
      }>
    ) {
      const { role, club, athlete, token, refreshToken, userId, userData } = action.payload;
      state.role = role;
      state.status = role === 'LANDING' ? 'idle' : 'authenticated';
      if (club) state.club = club;
      if (athlete) state.athlete = athlete;
      if (token !== undefined) state.token = token;
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
      if (userId !== undefined) state.userId = userId;
      if (userData !== undefined) state.userData = userData;
      persistSession(
        role,
        athlete ?? state.athlete,
        club ?? state.club,
        token,
        refreshToken,
        userId,
        userData,
      );
    },
    logout(state) {
      state.role = 'LANDING';
      state.status = 'idle';
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.userData = null;
      removeItem(STORAGE_KEYS.role);
      removeItem(STORAGE_KEYS.currentAthleteId);
      removeItem(STORAGE_KEYS.currentClubId);
      removeItem(STORAGE_KEYS.accessToken);
      removeItem(STORAGE_KEYS.refreshToken);
      removeItem(STORAGE_KEYS.userId);
      removeItem(STORAGE_KEYS.userData);
    },
  },
});

export const { setRole, setClub, setAthlete, setToken, setUserData, setAuthLoading, login, logout } = authSlice.actions;
export default authSlice.reducer;
