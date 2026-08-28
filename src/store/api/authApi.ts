import { apiSlice } from './apiSlice';

// ── Request Types ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyPhoneRequest {
  otp: string;
}

export interface RequestPhoneOtpRequest {
  // No body needed — server uses JWT to find the user
}

export interface ResendVerificationRequest {
  type: 'EMAIL' | 'PHONE';
}

// ── Response Types ──

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    accessToken: string;
    userId: string;
    userRole: string;
    userName: string;
    fanNumber?: string | null;
    clubId?: string | null;
    clubName?: string | null;
    refreshToken: string;
    status: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      status: string;
      roles: string[];
    };
  };
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export interface MeResponse {
  success: boolean;
  data: UserData & {
    roles: string[];
    permissions: string[];
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  data: {
    message: string;
    accountActive: boolean;
    note?: string;
  };
}

export interface VerifyPhoneResponse {
  success: boolean;
  data: {
    message: string;
    accountActive: boolean;
    note?: string;
  };
}

export interface RequestPhoneOtpResponse {
  success: boolean;
  data: {
    message: string;
    otp?: string;
  };
}

export interface ResendVerificationResponse {
  success: boolean;
  data: {
    message?: string;
  };
}

export interface VerificationStatusResponse {
  success: boolean;
  data: {
    email: string;
    emailVerified: boolean;
    emailVerifiedAt?: string | null;
    hasPhone: boolean;
    phoneVerified: boolean;
    phoneVerifiedAt?: string | null;
    accountStatus: string;
    canLogin: boolean;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ── API Endpoints ──

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    // POST /auth/register
    registerUser: builder.mutation<RegisterUserResponse, RegisterUserRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    // GET /auth/me
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Users'],
    }),

    // POST /auth/logout
    logoutApi: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // POST /auth/verify/email
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (body) => ({
        url: '/auth/verify/email',
        method: 'POST',
        body,
      }),
    }),

    // POST /auth/verify/phone/request
    requestPhoneOtp: builder.mutation<RequestPhoneOtpResponse, void>({
      query: () => ({
        url: '/auth/verify/phone/request',
        method: 'POST',
      }),
    }),

    // POST /auth/verify/phone
    verifyPhone: builder.mutation<VerifyPhoneResponse, VerifyPhoneRequest>({
      query: (body) => ({
        url: '/auth/verify/phone',
        method: 'POST',
        body,
      }),
    }),

    // POST /auth/verify/resend
    resendVerification: builder.mutation<ResendVerificationResponse, ResendVerificationRequest>({
      query: (body) => ({
        url: '/auth/verify/resend',
        method: 'POST',
        body,
      }),
    }),

    // GET /auth/verify/status
    getVerificationStatus: builder.query<VerificationStatusResponse, void>({
      query: () => '/auth/verify/status',
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterUserMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutApiMutation,
  useVerifyEmailMutation,
  useRequestPhoneOtpMutation,
  useVerifyPhoneMutation,
  useResendVerificationMutation,
  useGetVerificationStatusQuery,
  useLazyGetVerificationStatusQuery,
} = authApi;
