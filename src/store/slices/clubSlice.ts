import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Club, Transfer } from '../../types';

export interface ClubState {
  clubs: Club[];
  transfers: Transfer[];
}

const initialState: ClubState = {
  clubs: [],
  transfers: [],
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    addClub(state, action: PayloadAction<Club>) {
      state.clubs.unshift(action.payload);
    },
    addTransfer(state, action: PayloadAction<Transfer>) {
      state.transfers.unshift(action.payload);
    },
  },
});

export const { addClub, addTransfer } = clubSlice.actions;
export default clubSlice.reducer;
