import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Athlete } from '../../types';

const initialState: Athlete[] = [];

const athleteSlice = createSlice({
  name: 'athletes',
  initialState,
  reducers: {
    setAthletes(_state, action: PayloadAction<Athlete[]>) {
      return action.payload;
    },
    addAthlete(state, action: PayloadAction<Athlete>) {
      state.unshift(action.payload);
    },
    updateAthlete(state, action: PayloadAction<Athlete>) {
      const index = state.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      } else {
        state.unshift(action.payload);
      }
    },
    patchAthlete(state, action: PayloadAction<{ id: string; changes: Partial<Athlete> }>) {
      const index = state.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload.changes };
        }
    },
  },
});

export const { setAthletes, addAthlete, updateAthlete, patchAthlete } = athleteSlice.actions;
export default athleteSlice.reducer;
