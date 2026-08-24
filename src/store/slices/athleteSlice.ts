import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Athlete } from '../../types';
import { MOCK_ATHLETES } from '../../data/mockData';
import { STORAGE_KEYS, readJSON, writeJSON } from '../persistence';

function readInitialAthletes(): Athlete[] {
  return readJSON<Athlete[]>(STORAGE_KEYS.athletes, MOCK_ATHLETES);
}

function persist(state: Athlete[]) {
  writeJSON(STORAGE_KEYS.athletes, state);
}

const initialState: Athlete[] = readInitialAthletes();

const athleteSlice = createSlice({
  name: 'athletes',
  initialState,
  reducers: {
    setAthletes(_state, action: PayloadAction<Athlete[]>) {
      persist(action.payload);
      return action.payload;
    },
    addAthlete(state, action: PayloadAction<Athlete>) {
      state.unshift(action.payload);
      persist(state);
    },
    updateAthlete(state, action: PayloadAction<Athlete>) {
      const index = state.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      } else {
        state.unshift(action.payload);
      }
      persist(state);
    },
    patchAthlete(state, action: PayloadAction<{ id: string; changes: Partial<Athlete> }>) {
      const index = state.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload.changes };
        persist(state);
      }
    },
  },
});

export const { setAthletes, addAthlete, updateAthlete, patchAthlete } = athleteSlice.actions;
export default athleteSlice.reducer;
