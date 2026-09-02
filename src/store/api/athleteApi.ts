import { apiSlice } from './apiSlice';
import type { Athlete } from '../../types';

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
    verification?: {
      message?: string;
      code?: string;
    };
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

export interface ClubAdminRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  clubName: string;
  clubShortName?: string;
  clubEmail?: string;
  clubPhone?: string;
  clubAddress?: string;
  clubCity?: string;
  clubRegion?: string;
  logoUrl?: string;
}

export interface ClubAdminRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string | null;
      status: string;
    };
    club: {
      id: string;
      name: string;
      shortName?: string | null;
      email?: string | null;
      phone?: string | null;
      region?: string | null;
      verificationStatus: string;
    };
    verification?: {
      code?: string;
      expiresAt?: string;
    };
  };
}

export interface GetPublicAthletesParams {
  featured?: boolean;
  status?: string;
  search?: string;
  club?: string;
  region?: string;
  page?: number;
  limit?: number;
}

export interface GetAthletesParams {
  search?: string;
  status?: string;
  clubId?: string;
  region?: string;
  page?: number;
  limit?: number;
}

export interface PublicAthletePersonalBest {
  event?: string;
  discipline?: string;
  mark: string;
  date?: string | null;
  venue?: string | null;
}

export interface PublicAthleteDetailData {
  id: string;
  name: string;
  amharicName?: string | null;
  photoUrl?: string | null;
  faydaFin?: string | null;
  faydaVerified?: boolean;
  faydaVerifiedAt?: string | null;
  primaryEvent?: string;
  clubId?: string | null;
  clubName?: string;
  region?: string | null;
  ageTier?: 'Senior' | 'U20' | 'Junior' | 'Youth' | string;
  gender?: 'MALE' | 'FEMALE' | string;
  dateOfBirth?: string;
  nationality?: string;
  pb?: string;
  personalBests?: PublicAthletePersonalBest[];
  achievement?: string | null;
  achievements?: string[];
  quote?: string | null;
  status?: string;
}

export interface PublicAthleteDetailResponse {
  success: boolean;
  data: PublicAthleteDetailData;
}

/** GET /athletes/profile — authenticated athlete's own dashboard profile */
export interface MyAthletePersonalBest {
  id?: string;
  event?: string;
  mark?: string;
  date?: string | null;
  venue?: string | null;
}

export interface MyAthleteProfileData {
  id: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    status?: string;
  };
  name?: string;
  amharicName?: string | null;
  fanNumber?: string | null;
  photoUrl?: string | null;
  faydaVerified?: boolean;
  faydaVerifiedAt?: string | null;
  primaryEvent?: string | null;
  clubId?: string | null;
  clubName?: string | null;
  region?: string | null;
  ageTier?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  contact?: {
    phoneNumber?: string | null;
    email?: string | null;
  };
  fitnessStats?: {
    heightCm?: number | null;
    weightKg?: number | null;
    ageYears?: number;
  };
  careerRecords?: { label?: string; value?: string }[];
  personalBests?: {
    allTime?: MyAthletePersonalBest[];
    season?: MyAthletePersonalBest[];
  };
  summaryCounts?: {
    trainingSessions?: number;
    weightEntries?: number;
    appliedCompetitions?: number;
  };
}

export interface MyAthleteProfileResponse {
  success: boolean;
  data: MyAthleteProfileData;
}

/** GET /athletes/applications — the athlete's submitted event entries */
export interface MyApplicationEntry {
  id: string;
  eventId: string;
  title: string;
  disciplines: string[];
  appliedAt: string;
  statusLabel: string;
  organizer?: string;
  location?: string | null;
  imageUrl?: string | null;
  clubName?: string | null;
}

export interface MyApplicationsResponse {
  success: boolean;
  data: MyApplicationEntry[];
}

export const athleteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicAthletes: builder.query<BackendAthleteItem[], GetPublicAthletesParams | void>({
      query: (params) => ({
        url: '/athletes/public',
        params: {
          limit: 50,
          ...(params || {}),
        },
      }),
      transformResponse: (response: AthleteListResponse) => response.data || [],
      providesTags: [{ type: 'Athletes' as const, id: 'PUBLIC_LIST' }],
      keepUnusedDataFor: 86400,
    }),

    getPublicAthleteById: builder.query<PublicAthleteDetailData, string>({
      query: (id) => `/athletes/public/${id}`,
      transformResponse: (response: PublicAthleteDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Athletes' as const, id }],
      keepUnusedDataFor: 86400,
    }),

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

    /** GET /athletes/profile — my athlete record (id is required for event registrations) */
    getMyAthleteProfile: builder.query<MyAthleteProfileData, void>({
      query: () => '/athletes/profile',
      transformResponse: (response: MyAthleteProfileResponse) => response.data,
      providesTags: ['Athletes'],
    }),

    /** GET /athletes/applications — my submitted event entries */
    getMyApplications: builder.query<MyApplicationEntry[], void>({
      query: () => '/athletes/applications',
      transformResponse: (response: MyApplicationsResponse) => response.data || [],
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

    registerClubAdmin: builder.mutation<ClubAdminRegisterResponse, ClubAdminRegisterRequest>({
      query: (body) => ({
        url: '/clubs/register-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clubs'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPublicAthletesQuery,
  useGetPublicAthleteByIdQuery,
  useGetAthletesQuery,
  useGetRegistrationOptionsQuery,
  useGetMyAthleteProfileQuery,
  useGetMyApplicationsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
  useRegisterClubAdminMutation,
} = athleteApi;

/** Identity basics carried over from the auth session (login / userData). */
export interface AthleteProfileSeed {
  name?: string;
  email?: string;
}

/** Build the portal's Athlete object from the backend dashboard profile
 *  (GET /athletes/profile). Constructs a CLEAN record — it never merges
 *  with mock/demo data, so a registered athlete only ever sees their own
 *  information. */
export function mapMyProfileToAthlete(
  profile: MyAthleteProfileData,
  seed?: AthleteProfileSeed,
): Athlete {
  const name =
    profile.name ||
    `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim() ||
    seed?.name ||
    'Athlete';

  const toPb = (list?: MyAthletePersonalBest[]) =>
    (list || [])
      .filter((pb) => pb && (pb.event || pb.mark))
      .map((pb) => ({
        event: pb.event || '',
        mark: pb.mark || undefined,
        date: pb.date || undefined,
        venue: pb.venue || undefined,
        time: pb.mark || undefined,
      }));

  return {
    id: profile.id,
    name,
    amharicName: profile.amharicName || undefined,
    dob: profile.dateOfBirth || '',
    gender: profile.gender || '',
    ageTier: profile.ageTier || '',
    clubId: profile.clubId || undefined,
    clubName: profile.clubName || undefined,
    region: profile.region || undefined,
    faydaFin: profile.fanNumber || undefined,
    faydaStatus: profile.faydaVerified ? 'VERIFIED' : 'PENDING',
    primaryEvent: profile.primaryEvent || undefined,
    licenseStatus: 'PENDING',
    licenseNumber: undefined,
    licenseExpiry: undefined,
    photoUrl: profile.photoUrl || '',
    checkinStatus: 'NOT_CHECKED_IN',
    email: profile.contact?.email || seed?.email || undefined,
    phone: profile.contact?.phoneNumber || undefined,
    height: profile.fitnessStats?.heightCm ?? undefined,
    weight: profile.fitnessStats?.weightKg ?? undefined,
    personalBests: toPb(profile.personalBests?.allTime),
    seasonBests: toPb(profile.personalBests?.season),
    weightLog: [],
    trainingLog: [],
    achievements: [],
    appliedCompetitions: [],
  };
}
