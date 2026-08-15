import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Club, Transfer } from '../../types';
import { MOCK_CLUBS, MOCK_TRANSFERS } from '../../data/mockData';
import { STORAGE_KEYS, readJSON, writeJSON } from '../persistence';

export interface ClubState {
  clubs: Club[];
  transfers: Transfer[];
}

const initialState: ClubState = {
  clubs: readJSON<Club[]>(STORAGE_KEYS.clubs, MOCK_CLUBS),
  transfers: readJSON<Transfer[]>(STORAGE_KEYS.transfers, MOCK_TRANSFERS),
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    addClub(state, action: PayloadAction<Club>) {
      state.clubs.unshift(action.payload);
      writeJSON(STORAGE_KEYS.clubs, state.clubs);
    },
    addTransfer(state, action: PayloadAction<Transfer>) {
      state.transfers.unshift(action.payload);
      writeJSON(STORAGE_KEYS.transfers, state.transfers);
    },
  },
});

export const { addClub, addTransfer } = clubSlice.actions;
export default clubSlice.reducer;
