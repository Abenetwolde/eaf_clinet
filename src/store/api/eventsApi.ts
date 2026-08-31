import { apiSlice } from './apiSlice';

// ─── Response Schemas (mirrors EACRMS Swagger) ───────────────────────────────

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'CANCELLED';

/** Derived lifecycle returned by GET /events/{id}/detail */
export type EventLifecycleStatus =
  | 'REGISTRATION_OPEN'
  | 'UPCOMING'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED';

/** Schedule entry as defined on EventRequest.schedule */
export interface EventScheduleItem {
  title: string;
  startsAt: string;        // ISO date-time
  endsAt: string;          // ISO date-time
  description?: string | null;
}

/** Event as returned by GET /events/published and GET /events */
export interface BackendEvent {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  rules?: string | null;
  schedule?: EventScheduleItem[] | null;
  venue?: string | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  organizerPhone?: string | null;
  disciplines?: string[] | null;
  bannerUrl?: string | null;
  registrationDeadline?: string | null;
  status: EventStatus;
  createdById?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  rejectionReason?: string | null;
  enrolledClubsCount?: number;
  totalAthletesEnrolled?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Full event detail as returned by GET /events/{id}/detail */
export interface EventDetail extends BackendEvent {
  lifecycleStatus?: EventLifecycleStatus;
}

// ─── Response wrappers ───────────────────────────────────────────────────────

export interface EventsListResponse {
  success: boolean;
  data: BackendEvent[];
}

export interface EventDetailResponse {
  success: boolean;
  data: EventDetail;
}

// ─── Event Registration (POST /events/{eventId}/registrations) ───────────────

/** Payment record created together with an event registration */
export interface EventPayment {
  id: string;
  reference?: string;
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | string;
  amount?: number;
  currency?: string;
  userId?: string;
  eventId?: string | null;
  athleteId?: string | null;
  registrationId?: string | null;
  externalTransactionId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
}

/** Mock checkout instructions returned by the test payment providers */
export interface MockCheckout {
  reference?: string;
  callbackEndpoint?: string;
  instructions?: string;
}

/** Payload for POST /events/{eventId}/registrations */
export interface CreateEventRegistrationRequest {
  athleteId: string;
  amount: number;
  currency?: string;
}

/** Response payload of POST /events/{eventId}/registrations */
export interface CreateEventRegistrationData {
  registration: Record<string, any>;
  payment: EventPayment;
  mockCheckout?: MockCheckout | null;
}

export interface CreateEventRegistrationResponse {
  success: boolean;
  data: CreateEventRegistrationData;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: EventPayment;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: EventPayment[];
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/** Formats an event's schedule into { date, dateString } for UI cards */
export function formatEventRange(schedule?: EventScheduleItem[] | null): { date: string; dateString: string } {
  if (!schedule || schedule.length === 0) return { date: '', dateString: '' };
  const sorted = [...schedule].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const start = new Date(sorted[0].startsAt);
  const end = new Date(sorted[sorted.length - 1].endsAt);
  if (isNaN(start.getTime())) return { date: '', dateString: '' };
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (isNaN(end.getTime())) return { date: iso(start), dateString: fmt(start) };
  if (start.toDateString() === end.toDateString()) return { date: iso(start), dateString: fmt(start) };
  const sameMonthYear = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startLabel = sameMonthYear
    ? start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { date: iso(start), dateString: `${startLabel} – ${fmt(end)}` };
}

/** Derives a UI lifecycle status the same way the detail endpoint does */
export function deriveEventStatus(ev: Pick<BackendEvent, 'schedule' | 'registrationDeadline'> & { lifecycleStatus?: EventLifecycleStatus }): string {
  if (ev.lifecycleStatus) return ev.lifecycleStatus;
  const now = Date.now();
  const starts = (ev.schedule || []).map(s => new Date(s.startsAt).getTime()).filter(t => !isNaN(t));
  const ends = (ev.schedule || []).map(s => new Date(s.endsAt).getTime()).filter(t => !isNaN(t));
  const start = starts.length ? Math.min(...starts) : NaN;
  const end = ends.length ? Math.max(...ends) : NaN;
  const deadline = ev.registrationDeadline ? new Date(ev.registrationDeadline).getTime() : NaN;
  if (!isNaN(start) && now >= start && now <= end) return 'LIVE';
  if (!isNaN(end) && now > end) return 'COMPLETED';
  if (!isNaN(start) && now < start) {
    if (!isNaN(deadline)) return now <= deadline ? 'REGISTRATION_OPEN' : 'REGISTRATION_CLOSED';
    return 'REGISTRATION_OPEN';
  }
  if (!isNaN(deadline)) return now <= deadline ? 'REGISTRATION_OPEN' : 'REGISTRATION_CLOSED';
  return 'UPCOMING';
}

// ─── RTK Query endpoints ──────────────────────────────────────────────────────

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /events/published — public, home page competition section */
    getPublishedEvents: builder.query<EventsListResponse, void>({
      query: () => '/events/published',
      providesTags: [{ type: 'Events' as const, id: 'LIST' }],
      keepUnusedDataFor: 3600,
    }),

    /** GET /events/{id}/detail — public, mobile-optimized event detail */
    getEventDetail: builder.query<EventDetail, string>({
      query: (id) => `/events/${id}/detail`,
      transformResponse: (response: EventDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Events' as const, id }],
      keepUnusedDataFor: 3600,
    }),

    /** POST /events/{eventId}/registrations — register athlete & create payment (auth) */
    createEventRegistration: builder.mutation<CreateEventRegistrationData, CreateEventRegistrationRequest & { eventId: string }>({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/registrations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Events' as const, id: arg.eventId },
        'Registrations',
      ],
    }),

    /** GET /payments/{paymentId}/status — poll a registration payment (auth) */
    getPaymentStatus: builder.query<EventPayment, string>({
      query: (paymentId) => `/payments/${paymentId}/status`,
      transformResponse: (response: PaymentStatusResponse) => response.data,
      providesTags: (_result, _error, paymentId) => [{ type: 'Registrations' as const, id: paymentId }],
    }),

    /** GET /payments/history — current user's payment history (auth) */
    getMyPayments: builder.query<EventPayment[], void>({
      query: () => '/payments/history',
      transformResponse: (response: PaymentHistoryResponse) => response.data || [],
      providesTags: ['Registrations'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublishedEventsQuery,
  useGetEventDetailQuery,
  useLazyGetEventDetailQuery,
  useCreateEventRegistrationMutation,
  useGetPaymentStatusQuery,
  useGetMyPaymentsQuery,
} = eventsApi;
