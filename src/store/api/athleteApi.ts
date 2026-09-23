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

export interface CoachRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  sportId?: string;
  clubId?: string;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
}

export interface CoachRegistrationResponse {
  success: boolean;
  message?: string;
  data?: any;
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

export interface UpdateAthleteProfileRequest {
  phoneNumber?: string;
  email?: string;
  primaryEvent?: string;
  region?: string;
  clubName?: string;
  clubId?: string;
  height?: number;
  weight?: number;
  photoUrl?: string;
  amharicName?: string;
}

export interface UpdateAthleteProfileResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    updatedFields: string[];
  };
}

export interface PersonalBestRecord {
  id: string;
  event: string;
  mark: string;
  date?: string | null;
  venue?: string | null;
}

export interface PersonalBestsResponse {
  success: boolean;
  data: PersonalBestRecord[];
}

export interface CreatePersonalBestRequest {
  event: string;
  mark: string;
  date?: string;
  venue?: string;
  scope?: 'ALL_TIME' | 'SEASON';
}

export interface CreatePersonalBestResponse {
  success: boolean;
  message?: string;
  data: PersonalBestRecord;
}

export interface TrainingLogEntryItem {
  id: string;
  date: string;
  type: string;
  distanceKm: number;
  durationMinutes: number;
  notes?: string | null;
}

export interface TrainingLogsResponse {
  success: boolean;
  data: TrainingLogEntryItem[];
}

export interface CreateTrainingLogRequest {
  date: string;
  type: string;
  distanceKm: number;
  durationMinutes: number;
  notes?: string;
}

export interface CreateTrainingLogResponse {
  success: boolean;
  message?: string;
  data: TrainingLogEntryItem;
}

export interface WeightLogEntryItem {
  id: string;
  date: string;
  weightKg: number;
  changeKg?: number;
}

export interface WeightLogsResponse {
  success: boolean;
  data: WeightLogEntryItem[];
}

export interface CreateWeightLogRequest {
  date: string;
  weightKg: number;
}

export interface CreateWeightLogResponse {
  success: boolean;
  message?: string;
  data: WeightLogEntryItem;
}

export interface UploadProfilePhotoResponse {
  success: boolean;
  message?: string;
  data: {
    photoUrl: string;
    athleteId: string;
    updatedFields?: string[];
  };
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

    /** PATCH /athletes/profile — update editable profile attributes */
    updateMyAthleteProfile: builder.mutation<UpdateAthleteProfileResponse, UpdateAthleteProfileRequest>({
      query: (body) => ({
        url: '/athletes/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    /** GET /athletes/profile/personal-bests — my all-time and season PBs */
    getMyPersonalBests: builder.query<PersonalBestRecord[], void>({
      query: () => '/athletes/profile/personal-bests',
      transformResponse: (response: PersonalBestsResponse) => response.data || [],
      providesTags: ['Athletes'],
    }),

    /** POST /athletes/profile/personal-bests — record a new personal best */
    addMyPersonalBest: builder.mutation<CreatePersonalBestResponse, CreatePersonalBestRequest>({
      query: (body) => ({
        url: '/athletes/profile/personal-bests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    /** GET /athletes/profile/training-logs — workout history */
    getMyTrainingLogs: builder.query<TrainingLogEntryItem[], void>({
      query: () => '/athletes/profile/training-logs',
      transformResponse: (response: TrainingLogsResponse) => response.data || [],
      providesTags: ['Athletes'],
    }),

    /** POST /athletes/profile/training-logs — log a workout */
    addMyTrainingLog: builder.mutation<CreateTrainingLogResponse, CreateTrainingLogRequest>({
      query: (body) => ({
        url: '/athletes/profile/training-logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    /** GET /athletes/profile/weight-logs — weight history & delta */
    getMyWeightLogs: builder.query<WeightLogEntryItem[], void>({
      query: () => '/athletes/profile/weight-logs',
      transformResponse: (response: WeightLogsResponse) => response.data || [],
      providesTags: ['Athletes'],
    }),

    /** POST /athletes/profile/weight-logs — log a new weight entry */
    addMyWeightLog: builder.mutation<CreateWeightLogResponse, CreateWeightLogRequest>({
      query: (body) => ({
        url: '/athletes/profile/weight-logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    /** POST /athletes/profile/photo — upload profile photo (multipart/form-data) */
    uploadMyProfilePhoto: builder.mutation<UploadProfilePhotoResponse, FormData>({
      query: (formData) => ({
        url: '/athletes/profile/photo',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Athletes'],
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

    registerAthleteByAdmin: builder.mutation<AthleteRegistrationResponse, AthleteRegistrationRequest>({
      query: (body) => ({
        url: '/athletes/register/by-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Athletes'],
    }),

    registerCoachByAdmin: builder.mutation<CoachRegistrationResponse, CoachRegistrationRequest>({
      query: (body) => ({
        url: '/coaches/register/by-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coaches' as any],
    }),

    registerCoach: builder.mutation<CoachRegistrationResponse, CoachRegistrationRequest>({
      query: (body) => ({
        url: '/coaches/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coaches' as any],
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
  useUpdateMyAthleteProfileMutation,
  useGetMyPersonalBestsQuery,
  useAddMyPersonalBestMutation,
  useGetMyTrainingLogsQuery,
  useAddMyTrainingLogMutation,
  useGetMyWeightLogsQuery,
  useAddMyWeightLogMutation,
  useUploadMyProfilePhotoMutation,
  useGetMyApplicationsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
  useRegisterAthleteByAdminMutation,
  useRegisterCoachByAdminMutation,
  useRegisterCoachMutation,
  useRegisterClubAdminMutation,
} = athleteApi;

/** Identity basics carried over from the auth session (login / userData). */
export interface AthleteProfileSeed {
  name?: string;
  email?: string;
}

/** Build the portal's Athlete object from the backend dashboard profile
 *  (GET /athletes/profile). Safely falls back to local registration cache
 *  or seed for fields that may not be populated on the backend yet. */
export function mapMyProfileToAthlete(
  profile: MyAthleteProfileData,
  seed?: AthleteProfileSeed,
  localCache?: Partial<Athlete>,
): Athlete {
  const name =
    profile.name ||
    `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim() ||
    localCache?.name ||
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

  const pbs = toPb(profile.personalBests?.allTime);
  const sbs = toPb(profile.personalBests?.season);

  return {
    id: profile.id,
    name,
    amharicName: profile.amharicName || localCache?.amharicName || undefined,
    dob: profile.dateOfBirth || localCache?.dob || '',
    gender: profile.gender || localCache?.gender || '',
    ageTier: profile.ageTier || localCache?.ageTier || '',
    clubId: profile.clubId || localCache?.clubId || undefined,
    clubName: profile.clubName || localCache?.clubName || undefined,
    region: profile.region || localCache?.region || undefined,
    faydaFin: profile.fanNumber || localCache?.faydaFin || undefined,
    faydaStatus: (profile.faydaVerified || localCache?.faydaStatus === 'VERIFIED') ? 'VERIFIED' : 'PENDING',
    primaryEvent: profile.primaryEvent || localCache?.primaryEvent || undefined,
    licenseStatus: localCache?.licenseStatus || 'PENDING',
    licenseNumber: localCache?.licenseNumber || undefined,
    licenseExpiry: localCache?.licenseExpiry || undefined,
    photoUrl: profile.photoUrl || localCache?.photoUrl || '',
    checkinStatus: localCache?.checkinStatus || 'NOT_CHECKED_IN',
    email: profile.contact?.email || localCache?.email || seed?.email || undefined,
    phone: profile.contact?.phoneNumber || localCache?.phone || undefined,
    height: profile.fitnessStats?.heightCm ?? localCache?.height ?? undefined,
    weight: profile.fitnessStats?.weightKg ?? localCache?.weight ?? undefined,
    personalBests: pbs.length > 0 ? pbs : (localCache?.personalBests || []),
    seasonBests: sbs.length > 0 ? sbs : (localCache?.seasonBests || []),
    weightLog: localCache?.weightLog || [],
    trainingLog: localCache?.trainingLog || [],
    achievements: localCache?.achievements || [],
    appliedCompetitions: localCache?.appliedCompetitions || [],
    emergencyContact: localCache?.emergencyContact || undefined,
    medicalNotes: localCache?.medicalNotes || undefined,
  };
}
