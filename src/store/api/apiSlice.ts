import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Athlete, Club, Meet } from '../../types';
import type { RootState } from '../store';
import { refreshTokens } from '../slices/authSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';


const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth?.token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('eaf_accessToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('eaf_token')
        : null);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken =
      state.auth?.refreshToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('eaf_refreshToken') : null);

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        // Documented shape: {success, data: {accessToken, refreshToken}} — token
        // rotation revokes the old refresh token, so both must be persisted.
        const rd = refreshResult.data as {
          data?: { accessToken?: string; token?: string; refreshToken?: string };
          accessToken?: string;
          token?: string;
          refreshToken?: string;
        };
        const newToken = rd.data?.accessToken || rd.data?.token || rd.accessToken || rd.token;
        const newRefreshToken = rd.data?.refreshToken || rd.refreshToken;
        if (newToken) {
          // Update Redux state too, so the retried request's prepareHeaders
          // picks up the fresh token (state.auth.token takes precedence).
          api.dispatch(refreshTokens({ token: newToken, refreshToken: newRefreshToken }));
          try {
            localStorage.setItem('eaf_accessToken', newToken);
          } catch {}
          result = await rawBaseQuery(args, api, extraOptions);
        }
      } else {
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Athletes', 'Clubs', 'Competitions', 'Events', 'News', 'Registrations', 'Results', 'Users', 'Gallery'],
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

