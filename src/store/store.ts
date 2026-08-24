import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import athleteReducer from './slices/athleteSlice';
import clubReducer from './slices/clubSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    athletes: athleteReducer,
    club: clubReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
