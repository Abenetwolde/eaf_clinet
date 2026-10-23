import { apiSlice } from './apiSlice';

export interface ClubCompetition {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  rules?: string[];
  disciplines: string[];
  schedule?: Array<{ startsAt?: string; endsAt?: string }>;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  isRegistrationOpen: boolean;
  bannerUrl?: string | null;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  registeredCount?: number;
}

export interface EligibleAthlete {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  amharicName?: string;
  gender: string;
  category: string;
  dateOfBirth: string;
  photoUrl?: string;
  primaryEvent: string;
  discipline: string;
  faydaFin?: string;
  faydaFan?: string;
  faydaStatus: 'verified' | 'unverified';
  phone?: string;
  email?: string;
  isEligible: boolean;
  ineligibilityReasons: string[];
  isRegistered: boolean;
  registeredDisciplines: string[];
  personalRecords: Array<{
    discipline: string;
    mark: string;
    venue: string;
    date: string;
  }>;
}

export interface EligibleAthletesResponse {
  club: {
    id: string;
    name: string;
    shortName?: string;
    region?: string;
    licenseNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  competition: {
    id: string;
    title: string;
    category: string;
    venue: string;
    disciplines: string[];
    registrationDeadline: string;
  };
  athletes: EligibleAthlete[];
}

export interface SubmitCompetitionApplicationPayload {
  athletes: Array<{
    athleteId: string;
    athleteName?: string;
    disciplines: string[];
    seedMark?: string;
  }>;
  representative?: {
    name: string;
    phone: string;
    email?: string;
    roleTitle?: string;
  };
  declarations?: {
    authorizedRepConfirmed: boolean;
    athleteConsentConfirmed: boolean;
    medicalClearanceConfirmed: boolean;
  };
  supportingDocuments?: Array<{
    title: string;
    url: string;
    fileType?: string;
  }>;
  notes?: string;
}

export interface ClubApplication {
  id: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | string;
  type: string;
  eventId: string | null;
  eventTitle: string;
  athleteCount: number;
  athleteEntries: Array<{
    athleteId: string;
    athleteName: string;
    disciplines: string[];
    seedMark?: string;
  }>;
  representative?: {
    name: string;
    phone: string;
    email?: string;
    roleTitle?: string;
  };
  declarations?: {
    authorizedRepConfirmed?: boolean;
    athleteConsentConfirmed?: boolean;
    medicalClearanceConfirmed?: boolean;
  };
  supportingDocuments?: Array<{
    title: string;
    url: string;
    fileType?: string;
  }>;
  notes?: string;
  decisionNote?: string | null;
  reviewer?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ClubCoach {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    faydaIdentity?: {
      nin: string;
      faydaSub?: string;
      verified: boolean;
      verifiedAt?: string;
    } | null;
  };
  sport?: {
    id: string;
    name: string;
  };
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  status: string;
  createdAt: string;
}

export const clubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClubCompetitions: builder.query<ClubCompetition[], string>({
      query: (clubId) => `/clubs/${clubId}/competitions`,
      transformResponse: (response: { success: boolean; data: ClubCompetition[] }) => response.data || [],
      providesTags: ['Competitions', 'Events'],
    }),

    getEligibleAthletesForCompetition: builder.query<
      EligibleAthletesResponse,
      { clubId: string; eventId: string }
    >({
      query: ({ clubId, eventId }) => `/clubs/${clubId}/athletes/eligible-for-competition/${eventId}`,
      transformResponse: (response: { success: boolean; data: EligibleAthletesResponse }) => response.data,
      providesTags: ['Athletes'],
    }),

    submitClubCompetitionApplication: builder.mutation<
      { success: boolean; message: string; data: any },
      { clubId: string; eventId: string; body: SubmitCompetitionApplicationPayload }
    >({
      query: ({ clubId, eventId, body }) => ({
        url: `/clubs/${clubId}/competitions/${eventId}/applications`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Competitions', 'Events', 'Athletes', 'Registrations'],
    }),

    getClubApplications: builder.query<ClubApplication[], string>({
      query: (clubId) => `/clubs/${clubId}/applications`,
      transformResponse: (response: { success: boolean; data: ClubApplication[] }) => response.data || [],
      providesTags: ['Competitions', 'Events', 'Registrations'],
    }),

    getClubCoaches: builder.query<ClubCoach[], string>({
      query: (clubId) => `/coaches/club/${clubId}`,
      transformResponse: (response: { success: boolean; data: ClubCoach[] }) => response.data || [],
      providesTags: ['Athletes'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClubCompetitionsQuery,
  useGetEligibleAthletesForCompetitionQuery,
  useSubmitClubCompetitionApplicationMutation,
  useGetClubApplicationsQuery,
  useGetClubCoachesQuery,
} = clubApi;
