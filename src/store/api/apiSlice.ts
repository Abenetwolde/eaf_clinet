import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("eaf_token") : null);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Athletes", "Clubs", "Competitions", "Events", "News", "Registrations", "Results", "Users"],
  endpoints: (builder) => ({
    getAthletes: builder.query<any[], void>({
      query: () => "athletes/public",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Athletes"],
    }),
    getClubs: builder.query<any[], void>({
      query: () => "clubs/verified",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Clubs"],
    }),
    getCompetitions: builder.query<any[], void>({
      query: () => "events/published",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Competitions", "Events"],
    }),
    getPublishedEvents: builder.query<any[], void>({
      query: () => "events/published",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Events"],
    }),
    getOverviewStats: builder.query<any, void>({
      query: () => "admin/overview",
      transformResponse: (response: any) => response?.data || null,
    }),
    getResults: builder.query<Record<string, unknown>, void>({
      query: () => "results/published",
      transformResponse: (response: any) => response?.data || response || {},
      providesTags: ["Results"],
    }),
  }),
});

export const {
  useGetAthletesQuery,
  useGetClubsQuery,
  useGetCompetitionsQuery,
  useGetPublishedEventsQuery,
  useGetOverviewStatsQuery,
  useGetResultsQuery,
} = apiSlice;
