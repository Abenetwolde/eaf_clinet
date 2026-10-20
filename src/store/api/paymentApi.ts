import { apiSlice } from "./apiSlice";

export interface InitiatePaymentResult {
  success: boolean;
  message: string;
  data: {
    reference: string;
    checkoutUrl: string;
    payment: any;
    registration?: any;
  };
}

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateEventPayment: builder.mutation<
      InitiatePaymentResult,
      { eventId: string; athleteId: string; amount: number; disciplines?: string[] }
    >({
      query: ({ eventId, ...body }) => ({
        url: `payments/telebirr/events/${eventId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events", "Registrations", "Competitions"],
    }),

    initiateLicensePayment: builder.mutation<
      InitiatePaymentResult,
      { type: "ATHLETE" | "COACH"; athleteId?: string; coachId?: string; amount: number; seasonYear?: number }
    >({
      query: (body) => ({
        url: "payments/telebirr/license",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Athletes", "Clubs"],
    }),

    initiateClubMembershipPayment: builder.mutation<
      InitiatePaymentResult,
      { clubId: string; amount: number; membershipYear?: number }
    >({
      query: (body) => ({
        url: "payments/telebirr/club-membership",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Clubs"],
    }),

    verifyPaymentStatus: builder.query<{ success: boolean; data: any }, string>({
      query: (reference) => `payments/telebirr/verify/${reference}`,
    }),

    // Sandbox / Test Simulator for Developer Evaluation
    simulateWebhookSuccess: builder.mutation<
      { code: number; message: string },
      { reference: string; amount: number }
    >({
      query: ({ reference, amount }) => ({
        url: "payments/telebirr/webhook",
        method: "POST",
        body: {
          merch_order_id: reference,
          total_amount: String(amount),
          trade_no: `TLB_SANDBOX_${Date.now()}`,
          payment_time: new Date().toISOString(),
          sign: "sandbox_dev_pass",
        },
      }),
      invalidatesTags: ["Athletes", "Clubs", "Events", "Registrations"],
    }),
  }),
});

export const {
  useInitiateEventPaymentMutation,
  useInitiateLicensePaymentMutation,
  useInitiateClubMembershipPaymentMutation,
  useVerifyPaymentStatusQuery,
  useLazyVerifyPaymentStatusQuery,
  useSimulateWebhookSuccessMutation,
} = paymentApi;
