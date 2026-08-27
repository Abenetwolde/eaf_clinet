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

export interface RegistrationOptionsData {
  disciplines: DisciplineOption[];
  clubs: ClubOption[];
  regions: string[];
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

  }),
  overrideExisting: false,
});

export const {
  useGetAthletesQuery,
  useGetRegistrationOptionsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
} = athleteApi;
