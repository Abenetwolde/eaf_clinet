import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Athlete, Club, Meet } from '../../types';
import type { RootState } from '../store';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('eaf_token') : null);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Athletes', 'Clubs', 'Competitions', 'Events', 'News', 'Registrations', 'Results', 'Users'],
  endpoints: (builder) => ({
    getAthletes: builder.query<Athlete[], void>({
      query: () => 'athletes',
      providesTags: ['Athletes'],
    }),
    getClubs: builder.query<Club[], void>({
      query: () => 'clubs',
      providesTags: ['Clubs'],
    }),
    getCompetitions: builder.query<Meet[], void>({
      query: () => 'competitions',
      providesTags: ['Competitions'],
    }),
    getResults: builder.query<Record<string, unknown>, void>({
      query: () => 'results',
      providesTags: ['Results'],
    }),
  }),
});

export const {
  useGetAthletesQuery,
  useGetClubsQuery,
  useGetCompetitionsQuery,
  useGetResultsQuery,
} = apiSlice;
