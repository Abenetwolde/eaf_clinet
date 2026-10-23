import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { STORAGE_KEYS, removeItem } from "../persistence";
import { logout, setToken } from "../slices/authSlice";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.token || (typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem("token") || localStorage.getItem("eaf_token")
      : null);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth?.refreshToken || (typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.refreshToken)
      : null);

    if (refreshToken) {
      // Attempt token refresh with backend
      const refreshResult = await rawBaseQuery(
        {
          url: "auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = (refreshResult.data as any).data || refreshResult.data;
        const newAccessToken = data.accessToken || data.token;
        if (newAccessToken) {
          api.dispatch(setToken(newAccessToken));
          // Retry the original query with the new access token
          result = await rawBaseQuery(args, api, extraOptions);
          return result;
        }
      }
    }

    const hadToken = Boolean(
      state.auth?.token ||
      (typeof window !== "undefined" && (
        localStorage.getItem(STORAGE_KEYS.accessToken) ||
        localStorage.getItem("token") ||
        localStorage.getItem("eaf_token")
      ))
    );

    // Only auto-logout if there was an active authenticated session
    if (hadToken) {
      api.dispatch(logout());
      if (typeof window !== "undefined") {
        removeItem(STORAGE_KEYS.accessToken);
        removeItem(STORAGE_KEYS.refreshToken);
        removeItem(STORAGE_KEYS.userId);
        removeItem(STORAGE_KEYS.userData);
        removeItem(STORAGE_KEYS.role);
        removeItem(STORAGE_KEYS.currentAthleteId);
        removeItem(STORAGE_KEYS.currentClubId);
        localStorage.removeItem("token");
        localStorage.removeItem("eaf_token");
        localStorage.removeItem("eaf_currentClub");
        window.dispatchEvent(
          new CustomEvent("eaf:session-expired", {
            detail: {
              message: (result.error.data as any)?.message || "Your session has expired. Please sign in again to continue.",
            },
          })
        );
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Athletes", "Clubs", "Competitions", "Events", "News", "Registrations", "Results", "Users", "Gallery", "Content", "Inquiries"],
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
    getGallery: builder.query<any[], void>({
      query: () => "gallery",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Gallery" as any],
    }),
    getSiteContent: builder.query<any, void>({
      query: () => "content/public",
      transformResponse: (response: any) => response?.data || response || null,
      providesTags: ["Content" as any],
    }),
    submitContactForm: builder.mutation<any, { name: string; email: string; subject: string; message: string }>({
      query: (body) => ({
        url: "content/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inquiries" as any],
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
  useGetGalleryQuery,
  useGetSiteContentQuery,
  useSubmitContactFormMutation,
} = apiSlice;
