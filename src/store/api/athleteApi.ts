import { apiSlice } from './apiSlice';

export interface DisciplineOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface ClubOption {
  id: string;
  name: string;
  region?: string | null;
  city?: string | null;
}

export interface RegionOption {
  id: string;
  name: string;
  flag: string;
  flagImageUrl?: string | null;
}

export interface RegistrationOptionsData {
  disciplines: DisciplineOption[];
  clubs: ClubOption[];
  regions: RegionOption[];
}

export interface RegistrationOptionsResponse {
  success: boolean;
  data: RegistrationOptionsData;
}

export interface FaydaInitiateRequest {
  nin: string;
  FAN?: string;
}

export interface FaydaInitiateResponse {
  success: boolean;
  data: {
    verificationId: string;
    message: string;
    otp?: string;
  };
}

export interface FaydaConfirmRequest {
  verificationId: string;
  otp: string;
}

export interface FaydaDemographicData {
  nin: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | string;
  phoneNumber?: string;
  photoUrl?: string;
}

export interface FaydaConfirmResponse {
  success: boolean;
  data: {
    message: string;
    demographicData: FaydaDemographicData;
    verificationToken: string;
  };
}

export interface AthleteRegistrationRequest {
  email: string;
  password: string;
  phoneNumber: string;
  faydaVerificationToken: string;
  fanNumber?: string | null;
  sportIds?: string[];
  sportId?: string;
  clubId?: string | null;
  clubName?: string | null;
  region?: string;
  height?: number;
  weight?: number;
  emergencyContactPhone?: string;
  position?: string;
  dominantHand?: 'LEFT' | 'RIGHT' | 'AMBIDEXTROUS';
  dominantFoot?: 'LEFT' | 'RIGHT' | 'BOTH';
  bloodType?: string;
  nationality?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  amharicName?: string;
  faydaFin?: string;
  nin?: string;
  dateOfBirth?: string;
  gender?: string;
  photoUrl?: string;
  primaryEvent?: string;
}

export interface AthleteRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: 'DRAFT' | 'PENDING' | string;
    createdAt: string;
  };
}

export interface BackendAthleteItem {
  id: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  name?: string;
  amharicName?: string;
  photoUrl?: string;
  achievement?: string;
  primaryEvent?: string;
  clubId?: string | null;
  clubName?: string;
  faydaVerified?: boolean;
  personalBest?: string;
  ageTier?: string;
  gender?: string;
  quote?: string;
}

export interface AthleteListResponse {
  success: boolean;
  data: BackendAthleteItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetAthletesParams {
  search?: string;
  status?: string;
  clubId?: string;
  region?: string;
  limit?: number;
  page?: number;
}

export interface PublishedEvent {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  venue?: string | null;
  organizerName: string;
  status: string;
  disciplines?: string[] | null;
  bannerUrl?: string | null;
  schedule?: any;
  totalAthletesEnrolled?: number;
}

export interface EventApplicationResponse {
  id: string;
  eventId: string;
  title: string;
  disciplines: string[];
  appliedAt: string;
  statusLabel: string;
  organizer?: string;
  location?: string;
  city?: string | null;
  imageUrl?: string | null;
  athleteCount?: number;
  qrCodeValue?: string;
  qrCodeStatus?: string;
  registeredMemberName?: string;
  registeredMemberType?: string;
  registrationType?: string;
  clubName?: string | null;
  submissionStatus?: string;
}

export const athleteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAthletes: builder.query<BackendAthleteItem[], GetAthletesParams | void>({
      query: (params) => ({
        url: '/athletes',
        params: params || undefined,
      }),
      transformResponse: (response: AthleteListResponse) => response.data || [],
      providesTags: [{ type: 'Athletes' as const, id: 'LIST' }],
      keepUnusedDataFor: 86400,
    }),

    getRegistrationOptions: builder.query<RegistrationOptionsData, void>({
      query: () => '/meta/registration-options',
      transformResponse: (response: RegistrationOptionsResponse) => response.data,
      providesTags: ['Athletes'],
    }),

    initiateFayda: builder.mutation<FaydaInitiateResponse, FaydaInitiateRequest>({
      query: (body) => ({
        url: '/fayda/initiate',
        method: 'POST',
        body,
      }),
    }),

    confirmFaydaOtp: builder.mutation<FaydaConfirmResponse, FaydaConfirmRequest>({
      query: (body) => ({
        url: '/fayda/verify/confirm',
        method: 'POST',
        body,
      }),
    }),

    registerAthlete: builder.mutation<AthleteRegistrationResponse, AthleteRegistrationRequest>({
      query: (body) => ({
        url: '/athletes/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    registerAthleteByClubAdmin: builder.mutation<AthleteRegistrationResponse, AthleteRegistrationRequest>({
      query: (body) => ({
        url: '/athletes/register/by-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    registerCoachByClubAdmin: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: '/coaches/register/by-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    getPublishedEvents: builder.query<PublishedEvent[], void>({
      query: () => '/events/published',
      transformResponse: (response: { success: boolean; data: PublishedEvent[] }) => response.data || [],
      providesTags: ['Athletes'],
    }),

    getAthleteApplications: builder.query<EventApplicationResponse[], void>({
      query: () => '/athletes/profile/applications',
      transformResponse: (response: { success: boolean; data: EventApplicationResponse[] }) => response.data || [],
      providesTags: ['Athletes'],
    }),

    getAthleteDashboard: builder.query<any, void>({
      query: () => '/athletes/profile',
      transformResponse: (response: any) => response?.data || null,
      providesTags: ['Athletes'],
    }),
    getAthletePersonalBests: builder.query<any, void>({
      query: () => '/athletes/profile/personal-bests',
      transformResponse: (response: any) => response?.data || { allTime: [], season: [] },
      providesTags: ['Athletes'],
    }),
    getAthleteTrainingLogs: builder.query<any[], void>({
      query: () => '/athletes/profile/training-logs',
      transformResponse: (response: any) => response?.data || [],
      providesTags: ['Athletes'],
    }),
    getAthleteWeightLogs: builder.query<any[], void>({
      query: () => '/athletes/profile/weight-logs',
      transformResponse: (response: any) => response?.data || [],
      providesTags: ['Athletes'],
    }),
    getMyAthleteResults: builder.query<any[], void>({
      query: () => '/results/my-results',
      transformResponse: (response: any) => response?.data?.data || [],
      providesTags: ['Results' as any],
    }),

    updateAthleteProfile: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: '/athletes/profile', method: 'PATCH', body }),
      invalidatesTags: ['Athletes'],
    }),

    createAthletePersonalBest: builder.mutation<any, { event: string; mark: string; date?: string; venue?: string }>({
      query: (body) => ({ url: '/athletes/profile/personal-bests', method: 'POST', body }),
      invalidatesTags: ['Athletes'],
    }),

    createAthleteTrainingLog: builder.mutation<any, { date: string; type: string; distanceKm: number; durationMinutes: number; notes?: string }>({
      query: (body) => ({ url: '/athletes/profile/training-logs', method: 'POST', body }),
      invalidatesTags: ['Athletes'],
    }),

    createAthleteWeightLog: builder.mutation<any, { date: string; weightKg: number }>({
      query: (body) => ({ url: '/athletes/profile/weight-logs', method: 'POST', body }),
      invalidatesTags: ['Athletes'],
    }),

    applyForEvent: builder.mutation<
      { success: boolean; message: string; data: any },
      { eventId: string; athleteId?: string; disciplines?: string[] }
    >({
      query: ({ eventId, disciplines }) => ({
        url: `/events/${eventId}/apply`,
        method: 'POST',
        body: { eventId, disciplines },
      }),
      invalidatesTags: ['Athletes'],
    }),

    getAthleteNotifications: builder.query<any[], void>({
      query: () => '/athletes/profile/notifications',
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ['Athletes'],
    }),

    getPublishedResults: builder.query<any[], void>({
      query: () => '/results/published',
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ['Results' as any],
    }),

    getResultDetail: builder.query<any, string>({
      query: (id) => `/results/${id}`,
      transformResponse: (response: any) => response?.data || response || null,
      providesTags: ['Results' as any],
    }),

    getMyClubResults: builder.query<any, void>({
      query: () => '/results/my-club',
      transformResponse: (response: any) => response?.data || response || null,
      providesTags: ['Results' as any],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAthletesQuery,
  useGetRegistrationOptionsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
  useRegisterAthleteByClubAdminMutation,
  useRegisterCoachByClubAdminMutation,
  useGetPublishedEventsQuery,
  useGetAthleteApplicationsQuery,
  useGetAthleteDashboardQuery,
  useGetAthletePersonalBestsQuery,
  useGetAthleteTrainingLogsQuery,
  useGetAthleteWeightLogsQuery,
  useGetMyAthleteResultsQuery,
  useUpdateAthleteProfileMutation,
  useCreateAthletePersonalBestMutation,
  useCreateAthleteTrainingLogMutation,
  useCreateAthleteWeightLogMutation,
  useApplyForEventMutation,
  useGetAthleteNotificationsQuery,
  useGetPublishedResultsQuery,
  useGetResultDetailQuery,
  useGetMyClubResultsQuery,
} = athleteApi;
