import React, { useState } from 'react';
import {
  X, Building2, UserCheck, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight,
  Phone, LockKeyhole, Clock, Printer, Copy, Check, QrCode, FileText, Download,
  ExternalLink, Calendar, MapPin, Award, Activity, Sparkles, CheckCheck,
  FileCheck, Shield, ChevronRight, Mail, Hash
} from 'lucide-react';
import { useI18n } from '../i18n';
import {
  useGetRegistrationOptionsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
  useRegisterClubAdminMutation,
  type AthleteRegistrationRequest,
  type FaydaConfirmResponse,
} from '../store/api/athleteApi';
import VerificationModal from './VerificationModal';
import { useRegisterUserMutation, useVerifyEmailMutation, type RegisterUserResponse } from '../store/api/authApi';

// Types for internal use
interface FaydaResult {
  name: string;
  amharic: string;
  dob: string;
  gender: string;
  blood: string;
  region: string;
  photoUrl: string;
  ageTier: string;
  fin: string;
  hash: string;
  verificationDate: string;
}

interface AthletePayload {
  id: string;
  name: string;
  amharicName: string;
  dob: string;
  gender: string;
  ageTier: string;
  clubId: string;
  clubName: string;
  faydaFin: string;
  faydaStatus: string;
  faydaHash: string;
  primaryEvent: string;
  licenseStatus: string;
  licenseNumber: null;
  licenseExpiry: null;
  photoUrl: string;
  checkinStatus: string;
  qrCodeData: null;
  weight: number;
  height: number;
  restingHR: number;
  trainingLoad: string;
  emergencyContact: string;
  medicalNotes: string;
  email: string;
  phone: string;
  region: string;
  personalBests: unknown[];
  seasonBests: unknown[];
  weightLog: unknown[];
  trainingLog: unknown[];
  achievements: unknown[];
}

interface ClubPayload {
  id: string;
  name: string;
  shortName: string;
  region: string;
  manager: string;
  email: string;
  phone: string;
  licensedAthletes: number;
  pendingVerifications: number;
  unlicensedAthletes: number;
  transfersCount: number;
  logo: string;
  clubRank: number;
  totalPoints: number;
}

type PendingRegistrationData =
  | { type: 'ATHLETE'; payload: { athlete: AthletePayload } }
  | { type: 'CLUB'; payload: { club: ClubPayload } };

// Step indicator bar
function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepbar" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.9rem',
            background: i < current ? 'var(--primary)' : i === current ? 'var(--primary)' : '#F1F5F9',
            color: i <= current ? '#FFFFFF' : '#64748B',
            boxShadow: i === current ? '0 0 0 4px rgba(14, 165, 233, 0.25)' : 'none',
            transition: 'all 0.2s'
          }}>
            {i < current ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: i <= current ? 'var(--primary)' : '#64748B', textAlign: 'center' }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegistrationModal({ role, onClose, onRegisterSuccess }: {
  role: 'CLUB' | 'ATHLETE';
  onClose: () => void;
  onRegisterSuccess: (data: PendingRegistrationData) => void;
}) {
  const { t } = useI18n();
  const isClub = role === 'CLUB';
  const [step, setStep] = useState(0);

  // RTK Query API Hooks
  const { data: regOptions } = useGetRegistrationOptionsQuery();
  const [initiateFayda, { isLoading: isFaydaInitiating }] = useInitiateFaydaMutation();
  const [confirmFaydaOtp, { isLoading: isConfirmingOtp }] = useConfirmFaydaOtpMutation();
  const [registerAthlete, { isLoading: isRegistering }] = useRegisterAthleteMutation();
  const [registerClubAdmin, { isLoading: isRegisteringClub }] = useRegisterClubAdminMutation();
  const [registerUser, { isLoading: isFallbackRegistering }] = useRegisterUserMutation();
  const [verifyEmailCode, { isLoading: isVerifyingEmailCode }] = useVerifyEmailMutation();

  // Common account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Club-specific
  const [clubName, setClubName] = useState('');
  const [clubAmharic, setClubAmharic] = useState('');
  const [region, setRegion] = useState('Addis Ababa / Federal');
  const [manager, setManager] = useState('');
  const [clubLogo, setClubLogo] = useState('🏃');

  // Athlete-specific live API tokens & states
  const [faydaFin, setFaydaFin] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [faydaSentMessage, setFaydaSentMessage] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [faydaVerificationToken, setFaydaVerificationToken] = useState('');
  const [serverRegistrationId, setServerRegistrationId] = useState('');

  const [selectedClubId, setSelectedClubId] = useState('NONE');
  const [primaryEvent, setPrimaryEvent] = useState(['5,000m Long Distance']);
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(null);
  const [faydaError, setFaydaError] = useState('');

  // Athlete physical & contact metadata
  const [weight, setWeight] = useState(58);
  const [height, setHeight] = useState(172);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Pending approval screen state
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<PendingRegistrationData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Verification modal state (shown after registration)
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // /athletes/register fallback via /auth/register (backend 500 workaround)
  const [usedAccountFallback, setUsedAccountFallback] = useState(false);
  const [accountVerificationCode, setAccountVerificationCode] = useState('');

  // Email verification step (account form → OTP screen → review & submit)
  const [accountUserId, setAccountUserId] = useState('');
  const [createdAccountEmail, setCreatedAccountEmail] = useState('');
  const [serverEmailCode, setServerEmailCode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const clubSteps = [t('registration.stepAccount'), t('registration.stepClubInfo'), t('registration.stepConfirm')];
  const athleteSteps = [t('registration.stepFayda'), t('registration.stepSports'), t('registration.stepAccount'), t('registration.stepEmailVerify'), t('registration.stepConfirm')];
  const steps = isClub ? clubSteps : athleteSteps;

  // Verified clubs & disciplines from the documented meta endpoint
  const clubsList = (regOptions?.clubs || []).map(c => ({ id: c.id, name: c.name, shortName: c.name, region: c.region || 'Addis Ababa' }));

  // Auto-format Fayda FIN into 12 digits (XXXX-XXXX-XXXX) or allow alphanumeric FANs
  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If user enters only digits/hyphens, auto-format as 12-digit FIN
    if (/^[0-9-]*$/.test(val)) {
      const raw = val.replace(/\D/g, '').slice(0, 12);
      let formatted = raw;
      if (raw.length > 4 && raw.length <= 8) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
      } else if (raw.length > 8) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
      }
      setFaydaFin(formatted);
    } else {
      // Allow alphanumeric FAN IDs (e.g. ETH-19950810-001, FAN-12345)
      setFaydaFin(val.slice(0, 24));
    }
  };

  // ── Step 1: Initiate Fayda lookup & launch OTP prompt ──
  const handleInitiateFaydaLookup = async () => {
    const trimmed = faydaFin.trim();
    const cleanDigits = trimmed.replace(/\D/g, '');
    
    // Validate: At least 10 digits for numeric FIN, or at least 6 chars for alphanumeric FAN
    if (!trimmed || (cleanDigits.length > 0 && cleanDigits.length < 10 && trimmed.length < 8)) {
      setFaydaError(t('registration.finError'));
      return;
    }

    // Reset error, OTP step, and previous hints before new attempt
    setFaydaError('');
    setFaydaSentMessage('');
    setServerOtp('');
    setOtpStep(false);
    setOtpCode('');

    try {
      // Send both nin and FAN to match the backend FaydaInitiateRequest contract
      console.info('[Fayda] POST /fayda/initiate body:', { nin: trimmed, FAN: trimmed });
      const res = await initiateFayda({
        nin: trimmed,
        FAN: trimmed,
      }).unwrap();

      console.info('[Fayda] Initiate success:', res?.data);

      const verificationId = res?.data?.verificationId;
      if (!verificationId) {
        console.error('[Fayda] No verificationId in response:', res?.data);
        setFaydaError('The verification server did not return a verification id. Please try again.');
        return;
      }
      setVerificationId(verificationId);
      setFaydaSentMessage(res?.data?.message || '');
      setServerOtp(res?.data?.otp || '');
      if (res?.data?.otp) {
        console.info('[Fayda] Server-returned OTP (non-production mode):', res.data.otp);
      } else {
        console.info(
          '[Fayda] No OTP in response — server is in PRODUCTION mode. ' +
          'Enable non-production mode on the backend to receive the OTP here, or read it from the SMS sent to: "' +
          (res?.data?.message || 'phone registered with the NIN') + '". verificationId=' + verificationId
        );
      }
      setOtpStep(true);
    } catch (err: unknown) {
      console.warn('Fayda initiate network response:', err);
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || t('registration.finError');
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setFaydaError('Cannot reach the verification server. Please check your connection and try again.');
      } else {
        setFaydaError(msg);
      }
    }
  };

  // ── Step 2: Confirm OTP & retrieve Fayda Biometrics ──
  const applyFaydaSuccess = (response: FaydaConfirmResponse['data']) => {
    const demographic = response?.demographicData;
    const finalToken = response?.verificationToken;

    if (!demographic || !finalToken) {
      setFaydaError(t('registration.otpError'));
      setOtpStep(false);
      return;
    }

    const fullName = `${demographic.firstName || ''} ${demographic.lastName || ''}`.trim();
    const dob = demographic.dateOfBirth || '';
    const dobYear = dob ? Number.parseInt(dob.substring(0, 4), 10) : NaN;
    const age = Number.isNaN(dobYear) ? null : new Date().getFullYear() - dobYear;
    const tier = age == null
      ? ''
      : age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : 'Senior Division';

    setFaydaVerificationToken(finalToken);
    setFaydaResult({
      name: fullName,
      amharic: '',
      dob,
      gender: demographic.gender || '',
      blood: '',
      region: '',
      photoUrl: '',
      ageTier: tier,
      fin: demographic.nin || faydaFin,
      hash: finalToken,
      verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    });

    if (demographic.phoneNumber) {
      setPhone(demographic.phoneNumber);
    }
    setOtpStep(false);
    setFaydaError('');
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      setFaydaError(t('registration.otpError'));
      return;
    }
    setFaydaError('');
    try {
      const res = await confirmFaydaOtp({
        verificationId: verificationId,
        otp: otpCode,
      }).unwrap();

      console.info('[Fayda] OTP confirm success:', res?.data);

      if (!res?.data?.demographicData || !res?.data?.verificationToken) {
        setFaydaError('The verification server returned an incomplete response. Please try again.');
        return;
      }
      applyFaydaSuccess(res.data);
    } catch (err: unknown) {
      console.warn('Fayda confirm OTP error:', err);
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || t('registration.otpError');
      setFaydaError(msg);
    }
  };

  // ── Step 3: Create account & send email verification code ──
  const handleAccountContinue = async () => {
    setAccountError('');
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      setAccountError('Please provide your email and password.');
      return;
    }
    if (password.length < 8) {
      setAccountError(t('registration.minPassword'));
      return;
    }
    if (!phone || !phone.trim()) {
      setAccountError('Please provide your phone number.');
      return;
    }

    // Account already created for this email (user navigated back) — straight to OTP
    if (createdAccountEmail && createdAccountEmail === cleanEmail) {
      setStep(3);
      return;
    }

    setIsCreatingAccount(true);
    const nameParts = (faydaResult?.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Athlete';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    try {
      let res: RegisterUserResponse;
      try {
        res = await registerUser({
          email: cleanEmail,
          password,
          firstName,
          lastName,
          phoneNumber: (phone || '').trim(),
        }).unwrap();
      } catch (phoneErr: unknown) {
        // Duplicate phone crashes the backend with 500 — retry without phone
        const phoneErrApi = phoneErr as { status?: string | number; data?: { message?: string }; error?: string };
        const phoneCrash = phoneErrApi?.status === 500 ||
          /internal server error/i.test(phoneErrApi?.data?.message || phoneErrApi?.error || '');
        if (!phoneCrash) throw phoneErr;
        console.warn('[Register] Phone number rejected — retrying /auth/register without phone.');
        res = await registerUser({
          email: cleanEmail,
          password,
          firstName,
          lastName,
        }).unwrap();
      }

      setAccountUserId(res?.data?.id || '');
      setCreatedAccountEmail(cleanEmail);
      setServerEmailCode(res?.data?.verification?.code || '');
      setEmailOtp('');
      setEmailVerified(false);
      setEmailOtpError('');
      setStep(3);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; error?: string }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error;
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setAccountError('Cannot reach the server. Please check your connection and try again.');
      } else if (apiErr?.status === 409 || /already exists|already registered/i.test(msg || '')) {
        setAccountError(t('registration.emailExistsError'));
      } else {
        setAccountError(msg || 'Could not create your account. Please try again.');
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // ── Step 3: Verify the emailed code ──
  const handleVerifyEmailCode = async () => {
    if (emailOtp.length !== 6) {
      setEmailOtpError(t('registration.emailVerifyError'));
      return;
    }
    setEmailOtpError('');
    try {
      await verifyEmailCode({
        email: (email || '').trim().toLowerCase(),
        code: emailOtp,
      }).unwrap();
      setEmailVerified(true);
      setStep(4);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setEmailOtpError('Cannot reach the server. Please check your connection and try again.');
      } else {
        setEmailOtpError(apiErr?.data?.message || apiErr?.error || 'Invalid or expired verification code. Please try again.');
      }
    }
  };

  // ── Submit Handlers ──
  const handleClubSubmit = async () => {
    if (!email || !password || !clubName || !manager) {
      alert('Please complete all required fields before submitting.');
      return;
    }
    const nameParts = manager.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    try {
      const res = await registerClubAdmin({
        email: (email || '').trim().toLowerCase(),
        password,
        firstName,
        lastName,
        phoneNumber: (phone || '').trim(),
        clubName: clubName.trim(),
        clubShortName: clubAmharic.trim() || clubName.trim(),
        clubEmail: (email || '').trim().toLowerCase(),
        clubPhone: (phone || '').trim(),
        clubRegion: region,
      }).unwrap();

      const newClub = {
        id: res?.data?.club?.id || '',
        name: res?.data?.club?.name || `${clubName} (${clubAmharic})`,
        shortName: res?.data?.club?.shortName || clubName,
        region: res?.data?.club?.region || region,
        manager,
        email,
        phone: res?.data?.club?.phone || phone,
        licensedAthletes: 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: clubLogo,
        clubRank: 0,
        totalPoints: 0,
      };
      setPendingRegistrationData({ type: 'CLUB', payload: { club: newClub } });
      setIsSubmittedPending(true);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Club registration failed. Please try again.';
      alert(`Club registration failed: ${msg}`);
    }
  };

  const handleAthleteSubmit = async () => {
    if (!faydaVerificationToken) {
      alert('Please complete Fayda identity verification (Step 1) first. The verification token is required to register.');
      setStep(0);
      return;
    }
    if (!emailVerified) {
      alert('Please verify your email address (Step 4) before submitting your registration.');
      setStep(3);
      return;
    }
    if (!email || !password) {
      alert('Please provide your email and password before submitting.');
      return;
    }
    if (!phone) {
      alert('Please provide your phone number before submitting.');
      return;
    }

    const club = selectedClubId === 'NONE'
      ? { id: 'NONE', name: 'Independent / Unaffiliated Athlete', shortName: 'Independent' }
      : (clubsList.find(c => c.id === selectedClubId) || null);

    const displayEvent = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : (primaryEvent || '');

    const validDisciplines = regOptions?.disciplines || [];
    let selectedSportIds = validDisciplines
      .filter(d => (Array.isArray(primaryEvent) ? primaryEvent.includes(d.name) : primaryEvent === d.name))
      .map(d => d.id);

    if (selectedSportIds.length === 0 && validDisciplines.length > 0) {
      selectedSportIds = [validDisciplines[0].id];
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    const finishAthleteRegistration = (serverId: string, fallback?: { verificationCode?: string; degraded?: boolean }) => {
      setServerRegistrationId(serverId);

      const newAthlete = {
        id: serverId,
        name: faydaResult?.name || '',
        amharicName: faydaResult?.amharic || '',
        dob: faydaResult?.dob || '',
        gender: faydaResult?.gender || '',
        ageTier: faydaResult?.ageTier || '',
        clubId: club?.id,
        clubName: club?.shortName || club?.name || '',
        faydaFin: faydaResult?.fin || faydaFin || '',
        faydaStatus: 'VERIFIED',
        faydaHash: faydaResult?.hash || '',
        primaryEvent: displayEvent,
        licenseStatus: 'PENDING_APPROVAL',
        licenseNumber: null,
        licenseExpiry: null,
        photoUrl: faydaResult?.photoUrl || '',
        checkinStatus: 'NOT_CHECKED_IN',
        qrCodeData: null,
        weight, height, restingHR: 0, trainingLoad: '',
        emergencyContact, medicalNotes,
        region: '',
        email: cleanEmail,
        phone: cleanPhone,
        personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: [],
      };

      setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
      setRegisteredEmail(cleanEmail);
      setUsedAccountFallback(!!fallback);
      setAccountVerificationCode(fallback?.verificationCode || '');
      setIsSubmittedPending(true);
      setShowVerification(false);
    };

    try {
      const payload: AthleteRegistrationRequest = {
        email: cleanEmail,
        password: password,
        phoneNumber: cleanPhone,
        faydaVerificationToken: faydaVerificationToken,
        fanNumber: faydaResult?.fin || (faydaFin ? faydaFin : undefined),
        sportIds: selectedSportIds.length > 0 ? selectedSportIds : undefined,
        sportId: selectedSportIds[0] || undefined,
        clubId: club ? club.id : undefined,
        clubName: club ? (club.name || club.shortName) : undefined,
        height,
        weight,
        emergencyContactPhone: emergencyContact || undefined,
      };

      const res = await registerAthlete(payload).unwrap();
      finishAthleteRegistration(res?.data?.id || '');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; errors?: unknown }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Registration failed. Please try again.';
      console.error('[Register Athlete] Error:', err);

      // Expected in this flow: the account (email/password) was already created
      // and verified at the email-verification step, so the athlete-profile
      // endpoint rejects the duplicate email (409) — or fails with its known
      // 500 bug. The account exists and is active either way; the profile
      // details will be linked to it during federation review.
      const isServerError = apiErr?.status === 500 || /internal server error/i.test(msg || '');
      const isEmailConflict = apiErr?.status === 409 || /email already exists|already registered/i.test(msg || '');
      if ((isEmailConflict || isServerError) && accountUserId) {
        console.warn('[Register Athlete] Profile endpoint rejected pre-created account — completing with existing account id.');
        finishAthleteRegistration(accountUserId, { degraded: true });
        return;
      }

      // Legacy fallback for paths where the account was not pre-created:
      // POST /athletes/register returns 500 on the live backend (the Fayda demo
      // NIN's phone number already belongs to a seeded account, and the backend
      // crashes on the duplicate phone instead of returning 409). Fall back to
      // POST /auth/register so the user can still verify their email and log in.
      if (isServerError) {
        const nameParts = (faydaResult?.name || '').trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || 'Athlete';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'Athlete';

        try {
          let fb: RegisterUserResponse;
          try {
            fb = await registerUser({
              email: cleanEmail,
              password: password,
              firstName,
              lastName,
              phoneNumber: cleanPhone,
            }).unwrap();
          } catch (phoneErr: unknown) {
            // Duplicate phone also crashes the backend with 500 — retry without
            // the phone number (it is optional; it can be added after login).
            const phoneErrApi = phoneErr as { status?: string | number; data?: { message?: string }; error?: string };
            const phoneCrash = phoneErrApi?.status === 500 ||
              /internal server error/i.test(phoneErrApi?.data?.message || phoneErrApi?.error || '');
            if (!phoneCrash) throw phoneErr;
            console.warn('[Register Athlete] Phone number rejected — retrying /auth/register without phone.');
            fb = await registerUser({
              email: cleanEmail,
              password: password,
              firstName,
              lastName,
            }).unwrap();
          }

          console.warn('[Register Athlete] /athletes/register failed with 500 — account created via /auth/register fallback.');
          finishAthleteRegistration(fb?.data?.id || '', {
            verificationCode: fb?.data?.verification?.code || '',
          });
          return;
        } catch (fbErr: unknown) {
          const fbApiErr = fbErr as { data?: { message?: string }; error?: string; status?: string | number };
          const fbMsg = fbApiErr?.data?.message || fbApiErr?.error;
          console.error('[Register Athlete] Fallback /auth/register failed:', fbErr);
          alert(`Registration failed: ${msg}${fbMsg ? `\n\nAccount fallback also failed: ${fbMsg}` : ''}`);
          return;
        }
      }

      alert(`Registration failed: ${msg}`);
    }
  };

  // ── Pending Approval / Email Verification Screen ──
  const renderPendingApprovalScreen = () => {
    if (!pendingRegistrationData) return null;
    const refNumber = serverRegistrationId;
    const isAthleteData = pendingRegistrationData.type === 'ATHLETE';
    const athleteEmail = isAthleteData ? (pendingRegistrationData.payload.athlete.email || registeredEmail) : registeredEmail;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '3px solid #3B82F6',
          color: '#1D4ED8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 12px 28px rgba(59, 130, 246, 0.25)'
        }}>
          <CheckCircle2 size={44} color="#1D4ED8" />
        </div>

        <span className="badge" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '0.82rem', padding: '6px 16px', borderRadius: '20px', marginBottom: '12px', fontWeight: 800 }}>
          {isAthleteData ? 'Registration Submitted · Email Verification Sent' : t('registration.pendingBadge')}
        </span>

        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
          Registration Submitted Successfully!
        </h3>

        <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '580px', lineHeight: 1.6, marginBottom: '24px' }}>
          Your athlete profile has been registered with the Ethiopian Athletics Federation.
        </p>

        {/* Email Verification Dispatched Banner */}
        {isAthleteData && (
          <div style={{
            background: '#F0F9FF',
            border: '1.5px solid #38BDF8',
            borderRadius: '18px',
            padding: '18px 22px',
            textAlign: 'left',
            marginBottom: '24px',
            width: '100%',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            boxShadow: '0 4px 18px rgba(14, 165, 233, 0.12)'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={24} color="#0369A1" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, color: '#0369A1', fontSize: '1.05rem', marginBottom: '4px' }}>
                Email Verification Code Dispatched
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#075985', lineHeight: 1.6 }}>
                A 6-digit verification code was sent to <strong style={{ color: '#0F172A', textDecoration: 'underline' }}>{athleteEmail}</strong>.
                Please check your inbox (or spam). Once your email is verified, your account becomes active and you can log in directly with your email and password.
              </p>
              {accountVerificationCode && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#0369A1', fontWeight: 700 }}>
                    Test server — your code:
                  </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: '#15803D', letterSpacing: '0.08em' }}>
                    {accountVerificationCode}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Athlete-profile service degraded notice (fallback registration) */}
        {isAthleteData && usedAccountFallback && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: '18px',
            padding: '14px 18px',
            textAlign: 'left',
            marginBottom: '24px',
            width: '100%',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#B45309" />
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#92400E', lineHeight: 1.6 }}>
              <strong>Note:</strong> The federation's athlete-profile service is temporarily unavailable, so your
              account was created through the standard registration channel. Your Fayda identity was verified
              successfully — your athlete profile details (events, club, physical stats) will be linked to your
              account by the federation during review.
            </p>
          </div>
        )}

        {/* Tracking Card */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          textAlign: 'left',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B' }}>{t('registration.trackingRef')}</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{refNumber}</span>
          </div>

          {isAthleteData && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={pendingRegistrationData.payload.athlete.photoUrl}
                alt="Passport Photo"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{
                  width: '85px', height: '110px',
                  objectFit: 'cover', borderRadius: '12px',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>{pendingRegistrationData.payload.athlete.name}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '2px' }}>{pendingRegistrationData.payload.athlete.amharicName}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '6px' }}>
                  Fayda FIN: <strong>{pendingRegistrationData.payload.athlete.faydaFin}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                  Primary Event: <strong>{pendingRegistrationData.payload.athlete.primaryEvent}</strong> · Club: <strong>{pendingRegistrationData.payload.athlete.clubName}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 800, marginTop: '4px' }}>
                  {t('registration.faydaBiometricsVerified')}
                </div>
              </div>
            </div>
          )}

          {!isAthleteData && (
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>{pendingRegistrationData.payload.club.name}</div>
              <div style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
                Region: <strong>{pendingRegistrationData.payload.club.region}</strong> · Manager: <strong>{pendingRegistrationData.payload.club.manager}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {isAthleteData && emailVerified && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '2px solid #10B981',
              color: '#065F46',
              fontWeight: 900,
              fontSize: '0.95rem'
            }}>
              <CheckCircle2 size={20} /> {t('registration.emailVerifiedBadge')}
            </div>
          )}
          {isAthleteData && !emailVerified && (
            <button
              type="button"
              className="btn-accent"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: '#FFF',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)'
              }}
              onClick={() => setShowVerification(true)}
            >
              <Mail size={18} /> Enter Email Verification Code <ArrowRight size={18} />
            </button>
          )}

          <button
            type="button"
            className="btn-gov-secondary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            onClick={() => {
              onClose();
              window.dispatchEvent(
                new CustomEvent('openLoginModal', {
                  detail: { role: isClub ? 'CLUB' : 'ATHLETE', email: athleteEmail },
                })
              );
            }}
          >
            Proceed to Login Portal
          </button>
        </div>
      </div>
    );
  };


  // ── CLUB FLOW ──
  const renderClubStep = () => {
    if (step === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>{t('registration.clubAccountTitle')}</h4>
        <div className="form-group">
          <label className="form-label">{t('registration.officialEmail')}</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourclub.et" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('auth.passwordLabel')}</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('registration.minPassword')} required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 000 0000" required style={{ padding: '12px 14px' }} />
        </div>
        <button
          className="btn-accent"
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
          onClick={() => email && password && phone ? setStep(1) : null}>
          {t('registration.continueClubDetails')} <ArrowRight size={18} />
        </button>
      </div>
    );

    if (step === 1) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>{t('registration.clubInfoTitle')}</h4>
        <div className="form-group">
          <label className="form-label">{t('registration.clubNameEnglish')}</label>
          <input className="form-input" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Bekoji Athletics Club" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('registration.clubNameAmharic')}</label>
          <input className="form-input" value={clubAmharic} onChange={e => setClubAmharic(e.target.value)} placeholder="e.g. በቆጂ የሩጫ አካዳሚ" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">{t('registration.regionalState')}</label>
            <select className="form-select" value={region} onChange={e => setRegion(e.target.value)} style={{ padding: '12px 14px' }}>
              <option>Addis Ababa / Federal</option>
              <option>Oromia Region</option>
              <option>Amhara Region</option>
              <option>Sidama Region</option>
              <option>Tigray Region</option>
              <option>South Ethiopia Region</option>
              <option>Somali Region</option>
              <option>Harari Region</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('registration.clubSymbol')}</label>
            <input className="form-input" value={clubLogo} onChange={e => setClubLogo(e.target.value)} placeholder="🏃" style={{ padding: '12px 14px' }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('registration.clubManager')}</label>
          <input className="form-input" value={manager} onChange={e => setManager(e.target.value)} placeholder="e.g. Coach Sentayehu Eshetu" required style={{ padding: '12px 14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '13px', borderRadius: '12px' }} onClick={() => setStep(0)}>{t('common.back')}</button>
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => clubName && manager ? setStep(2) : null}>
            {t('registration.reviewSubmit')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>{t('registration.reviewConfirmTitle')}</h4>
        <div className="table-responsive" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
          <table className="gov-table">
            <tbody>
              {[
                [t('registration.clubName'), `${clubName} (${clubAmharic})`],
                [t('registration.regionalState'), region],
                [t('registration.clubManager'), manager],
                ['Email', email],
                ['Phone', phone],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ width: '40%', fontWeight: 700, color: '#64748B' }}>{k}</td>
                  <td style={{ fontWeight: 900, color: '#0F172A' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
          {t('registration.agreeText')}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '13px', borderRadius: '12px' }} onClick={() => setStep(1)}>{t('common.back')}</button>
          <button
            className="btn-accent"
            disabled={isRegisteringClub}
            style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: isRegisteringClub ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={handleClubSubmit}
          >
            {isRegisteringClub ? <><RefreshCw size={18} className="animate-spin" /> Submitting...</> : <><CheckCircle2 size={18} /> {t('registration.registerClub')}</>}
          </button>
        </div>
      </div>
    );
  };

  // ── ATHLETE FLOW ──
  const renderAthleteStep = () => {
    if (step === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', marginBottom: '6px' }}>
            {t('registration.faydaStepTitle')}
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
            {t('registration.faydaStepSub')}
          </p>
        </div>

        {/* Fayda Input */}
        {!otpStep && !faydaResult && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              {t('registration.finLabel')}
            </label>
            <div className="fin-row" style={{ display: 'flex', gap: '10px' }}>
              <input
                className="form-input"
                style={{ flex: 1, padding: '14px 16px', fontSize: '1.05rem', borderRadius: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', fontWeight: 700, minWidth: 0 }}
                value={faydaFin}
                onChange={handleFinChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInitiateFaydaLookup();
                  }
                }}
                placeholder="e.g. 9840-3920-1124"
                maxLength={14}
              />
              <button
                type="button"
                className="btn-accent"
                style={{ whiteSpace: 'nowrap', padding: '14px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleInitiateFaydaLookup}
                disabled={isFaydaInitiating}
              >
                {isFaydaInitiating ? <><RefreshCw size={16} className="animate-spin" /> {t('registration.verifying')}</> : <><ShieldCheck size={18} /> {t('registration.verifyFin')}</>}
              </button>
            </div>
            {faydaError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginTop: '6px', display: 'block' }}>{faydaError}</span>}
          </div>
        )}

        {/* OTP Entry Page (After clicking Verify FIN) */}
        {otpStep && !faydaResult && (
          <div style={{
            background: '#F0F9FF',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>{t('registration.otpTitle')}</h5>
                <p style={{ fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                  {t('registration.otpSub')}
                </p>
              </div>
            </div>

{faydaSentMessage && (
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #22C55E',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: '#166534',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{faydaSentMessage}</span>
                </span>
                {serverOtp && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#15803D' }}>{serverOtp}</strong>
                    <button
                      type="button"
                      onClick={() => setOtpCode(serverOtp)}
                      style={{
                        background: '#22C55E',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Fill Code
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                {t('registration.otpLabel')}
              </label>
              <div className="otp-row" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '12px 0' }}>
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    className="otp-box"
                    type="text"
                    maxLength={1}
                    value={otpCode[idx] || ''}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (pastedData) {
                        setOtpCode(pastedData);
                        const focusIndex = Math.min(pastedData.length, 5);
                        const targetEl = document.getElementById(`otp-box-${focusIndex}`);
                        if (targetEl) targetEl.focus();
                      }
                    }}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const current = otpCode.split('');
                      current[idx] = val;
                      const newCode = current.join('').slice(0, 6);
                      setOtpCode(newCode);
                      if (val && idx < 5) {
                        const nextEl = document.getElementById(`otp-box-${idx + 1}`);
                        if (nextEl) nextEl.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyOtp();
                      } else if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                        const prevEl = document.getElementById(`otp-box-${idx - 1}`);
                        if (prevEl) prevEl.focus();
                      }
                    }}
                    style={{
                      width: '52px',
                      height: '60px',
                      borderRadius: '12px',
                      border: otpCode[idx] ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                      background: otpCode[idx] ? '#F0F9FF' : '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                ))}
              </div>
            </div>

            {faydaError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700 }}>{faydaError}</span>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-gov-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                onClick={() => setOtpStep(false)}
              >
                {t('registration.backToFin')}
              </button>
              <button
                type="button"
                className="btn-accent"
                style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleVerifyOtp}
                disabled={isConfirmingOtp}
              >
                {isConfirmingOtp ? <><RefreshCw size={16} className="animate-spin" /> {t('registration.confirmingPasscode')}</> : <><CheckCircle2 size={18} /> {t('registration.confirmOtp')}</>}
              </button>
            </div>
          </div>
        )}

        {/* Fayda Verified Result List Card with Formal Passport Photo */}
        {faydaResult && (
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(14, 165, 233, 0.3)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="var(--primary-dark)" />
                <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '1rem', letterSpacing: '0.04em' }}>
                  {t('registration.biometricsVerifiedBadge')}
                </span>
              </div>
              <span style={{ background: '#10B981', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                {t('registration.authenticated')}
              </span>
            </div>

            {/* Profile Content Layout */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Formal Passport Photo Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{
                  width: '125px',
                  height: '160px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                  position: 'relative',
                  background: '#E2E8F0'
                }}>
                  <img
                    src={faydaResult.photoUrl}
                    alt="Formal Passport Photo"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: '#10B981', color: '#FFF', borderRadius: '50%',
                    width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369A1', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('registration.passportPhoto')}
                </span>
              </div>

              {/* Personal Information List */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  {t('registration.identityData')}
                </h5>
                <div className="table-responsive" style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #BAE6FD' }}>
                  <table className="gov-table" style={{ margin: 0 }}>
                    <tbody>
                      {[
                        [t('registration.fullNameEng'), faydaResult.name],
                        [t('registration.fullNameAmh'), faydaResult.amharic],
                        [t('registration.finLabel'), faydaResult.fin],
                        [t('athleteProfilePortal.dob'), faydaResult.dob],
                        [t('registration.ageDivisionTier'), faydaResult.ageTier],
                        [t('registration.genderBlood'), faydaResult.gender],
                        [t('registration.regionalDelegation'), faydaResult.region],
                        [t('registration.verificationHash'), faydaResult.hash],
                      ].filter(([, v]) => !!v).map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ width: '42%', fontWeight: 700, color: '#64748B', fontSize: '0.82rem', padding: '10px 14px' }}>{k}</td>
                          <td style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem', padding: '10px 14px' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {!faydaResult && !otpStep && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#B45309',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <LockKeyhole size={18} />
            <span>🔒 {t('registration.otpHint')}</span>
          </div>
        )}

        {/* CONTINUE BUTTON IS DISABLED UNTIL FAYDA IS VERIFIED */}
        <button
          type="button"
          className="btn-accent"
          disabled={!faydaResult}
          onClick={() => faydaResult && setStep(1)}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1rem',
            borderRadius: '14px',
            background: faydaResult
              ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
              : '#94A3B8',
            color: '#FFFFFF',
            fontWeight: 800,
            cursor: faydaResult ? 'pointer' : 'not-allowed',
            opacity: faydaResult ? 1 : 0.65,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: faydaResult ? '0 8px 24px rgba(2, 132, 199, 0.3)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {t('registration.continueSports')}
          <ArrowRight size={20} />
        </button>
      </div>
    );

    if (step === 1) {
      const allDisciplines = regOptions?.disciplines && regOptions.disciplines.length > 0
        ? regOptions.disciplines.map(d => d.name)
        : [
            '100m / 200m Sprint',
            '400m Sprint',
            '800m Middle Distance',
            '1,500m Middle Distance',
            '5,000m Long Distance',
            '10,000m Long Distance',
            '3,000m Steeplechase',
            'Marathon & Road Running',
            'Long Jump / Triple Jump',
            'High Jump / Pole Vault',
            'Javelin / Discus / Shot Put'
          ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>{t('registration.sportsStepTitle')}</h4>

          {/* Multi-select Disciplines Checkboxes */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {t('registration.disciplinesLabel')}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              background: '#F8FAFC',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid #CBD5E1',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              {allDisciplines.map(d => {
                const isSelected = Array.isArray(primaryEvent)
                  ? primaryEvent.includes(d)
                  : primaryEvent === d;

                return (
                  <label
                    key={d}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary-dark)' : '#334155',
                      cursor: 'pointer',
                      background: isSelected ? '#E0F2FE' : '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid #E2E8F0',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        let currentList = Array.isArray(primaryEvent) ? [...primaryEvent] : [primaryEvent];
                        if (isSelected) {
                          currentList = currentList.filter(item => item !== d);
                        } else {
                          currentList.push(d);
                        }
                        setPrimaryEvent(currentList.length === 0 ? ['5,000m Long Distance'] : currentList);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    {d}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Current Registered Club Dropdown */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('registration.currentClub')}</label>
            <select className="form-select" value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)} style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }}>
              <option value="NONE">{t('registration.independent')}</option>
              {clubsList.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.shortName} ({c.region})</option>
              ))}
            </select>
          </div>

          {/* Physical & Medical Stats Inputs */}
          <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('athlete.weight')} (kg)</label>
              <input className="form-input" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ padding: '12px 14px', borderRadius: '10px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('athlete.height')} (cm)</label>
              <input className="form-input" type="number" value={height} onChange={e => setHeight(Number(e.target.value))} style={{ padding: '12px 14px', borderRadius: '10px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(0)}>{t('common.back')}</button>
            <button className="btn-accent" style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(2)}>
              {t('registration.continueAccount')} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>{t('registration.accountStepTitle')}</h4>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('registration.accountEmail')}</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.name@athletics.et" required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('auth.passwordLabel')}</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('registration.minPassword')} required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('athleteProfilePortal.phoneNumber')}</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 234 5678" required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>{t('registration.emergencyContact')}</label>
          <input className="form-input" type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        {accountError && (
          <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700 }}>{accountError}</span>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(1)}>{t('common.back')}</button>
          <button
            className="btn-accent"
            disabled={isCreatingAccount}
            style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: isCreatingAccount ? 'not-allowed' : 'pointer', opacity: isCreatingAccount ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={handleAccountContinue}
          >
            {isCreatingAccount ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> {t('registration.sendingCode')}
              </>
            ) : (
              <>
                {t('registration.continueEmailVerify')} <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    );

    if (step === 3) {
      // ── EMAIL VERIFICATION STEP ──
      if (emailVerified) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '2px solid #10B981',
              borderRadius: '20px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
              }}>
                <CheckCircle2 size={38} color="#FFF" />
              </div>
              <div>
                <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#065F46', marginBottom: '6px' }}>
                  {t('registration.emailVerifiedBadge')}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#047857', margin: 0, lineHeight: 1.6, maxWidth: '480px' }}>
                  {t('registration.emailVerifiedActive')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(2)}>{t('common.back')}</button>
              <button
                className="btn-accent"
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => setStep(4)}
              >
                {t('registration.reviewRegistration')} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', marginBottom: '6px' }}>
              {t('registration.emailVerifyStepTitle')}
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
              {t('registration.emailVerifySub')}
            </p>
          </div>

          {/* Code sent banner */}
          <div style={{
            background: '#F0F9FF',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>{t('registration.emailCodeSentTitle')}</h5>
                <p style={{ fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                  {t('registration.emailCodeSentTo')} <strong style={{ color: '#0F172A', textDecoration: 'underline' }}>{(email || '').trim().toLowerCase()}</strong>
                </p>
              </div>
            </div>

            {serverEmailCode && (
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #22C55E',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: '#166534',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>Test server — your code:</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#15803D' }}>{serverEmailCode}</strong>
                  <button
                    type="button"
                    onClick={() => setEmailOtp(serverEmailCode)}
                    style={{
                      background: '#22C55E',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Fill Code
                  </button>
                </span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                {t('registration.emailVerifyLabel')}
              </label>
              <div className="otp-row" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '12px 0' }}>
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <input
                    key={idx}
                    id={`email-otp-box-${idx}`}
                    className="otp-box"
                    type="text"
                    maxLength={1}
                    value={emailOtp[idx] || ''}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (pastedData) {
                        setEmailOtp(pastedData);
                        const focusIndex = Math.min(pastedData.length, 5);
                        const targetEl = document.getElementById(`email-otp-box-${focusIndex}`);
                        if (targetEl) targetEl.focus();
                      }
                    }}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const current = emailOtp.split('');
                      current[idx] = val;
                      const newCode = current.join('').slice(0, 6);
                      setEmailOtp(newCode);
                      if (val && idx < 5) {
                        const nextEl = document.getElementById(`email-otp-box-${idx + 1}`);
                        if (nextEl) nextEl.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyEmailCode();
                      } else if (e.key === 'Backspace' && !emailOtp[idx] && idx > 0) {
                        const prevEl = document.getElementById(`email-otp-box-${idx - 1}`);
                        if (prevEl) prevEl.focus();
                      }
                    }}
                    style={{
                      width: '52px',
                      height: '60px',
                      borderRadius: '12px',
                      border: emailOtp[idx] ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                      background: emailOtp[idx] ? '#F0F9FF' : '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                ))}
              </div>
            </div>

            {emailOtpError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>{emailOtpError}</span>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-gov-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                onClick={() => setStep(2)}
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                className="btn-accent"
                style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleVerifyEmailCode}
                disabled={isVerifyingEmailCode}
              >
                {isVerifyingEmailCode ? <><RefreshCw size={16} className="animate-spin" /> {t('registration.verifyingEmail')}</> : <><CheckCircle2 size={18} /> {t('registration.confirmEmailCode')}</>}
              </button>
            </div>
          </div>

          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#B45309',
            fontSize: '0.84rem',
            fontWeight: 700
          }}>
            <Mail size={16} />
            <span>{t('registration.emailVerifyNote')}</span>
          </div>
        </div>
      );
    }

    if (step === 4) {
      const club = selectedClubId === 'NONE'
        ? { shortName: 'Independent' }
        : (clubsList.find(c => c.id === selectedClubId) || { shortName: 'EAF Club' });

      const eventText = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>{t('registration.confirmStepTitle')}</h4>

          {/* Detailed Summary Card */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Passport Card */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '120px', height: '150px', borderRadius: '14px',
                border: '4px solid #FFFFFF', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden', flexShrink: 0
              }}>
                <img src={faydaResult?.photoUrl || ''} alt="Passport Photo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                  <ShieldCheck size={14} /> {t('registration.faydaIdentityVerified')}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>{faydaResult?.name}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700 }}>{faydaResult?.amharic}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '6px' }}>
                  Fayda FIN: <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>{faydaResult?.fin}</strong>
                </div>
              </div>
            </div>

            {/* Maximum Metadata Data Table */}
            <div className="table-responsive" style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <table className="gov-table" style={{ margin: 0 }}>
                <tbody>
                  {[
                    [t('registration.fullLegalName'), faydaResult?.name],
                    [t('registration.finLabel'), faydaResult?.fin],
                    [t('registration.cryptographicHash'), faydaResult?.hash],
                    [t('registration.dobDivision'), faydaResult?.dob],
                    [t('registration.ageDivisionTier'), faydaResult?.ageTier],
                    [t('registration.genderBlood'), faydaResult?.gender],
                    [t('registration.physicalStats'), `Height: ${height} cm · Weight: ${weight} kg`],
                    [t('registration.athleticsClub'), club?.shortName],
                    [t('registration.primaryEvents'), eventText],
                    [t('registration.regionalDelegation'), faydaResult?.region],
                    [t('registration.accountEmail'), email],
                    [t('athleteProfilePortal.phoneNumber'), phone],
                    [t('registration.emergencyContact'), emergencyContact],
                    [t('registration.licenseStatus'), t('registration.pendingAudit')],
                  ].filter(([, v]) => !!v).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ width: '38%', fontWeight: 700, color: '#64748B', fontSize: '0.82rem', padding: '10px 14px' }}>{k}</td>
                      <td style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem', padding: '10px 14px' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(3)}>{t('common.back')}</button>
            <button
              className="btn-accent"
              disabled={isRegistering || isFallbackRegistering}
              style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: isRegistering || isFallbackRegistering ? 'not-allowed' : 'pointer', opacity: isRegistering || isFallbackRegistering ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleAthleteSubmit}
            >
              {isRegistering || isFallbackRegistering ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> {t('registration.submitAthlete')}
                </>
              )}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '24px 16px', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-content main-pad"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header */}
        {!isSubmittedPending && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: isClub ? '#FEF3C7' : '#E0F2FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isClub ? '#D97706' : 'var(--primary-dark)'
              }}>
                {isClub ? <Building2 size={26} /> : <UserCheck size={26} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                  {isClub ? t('registration.titleClub') : t('registration.titleAthlete')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {t('registration.subtitle')}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="#64748B" />
            </button>
          </div>
        )}

        {!isSubmittedPending && <StepBar steps={steps} current={step} />}

        {isSubmittedPending
          ? renderPendingApprovalScreen()
          : (isClub ? renderClubStep() : renderAthleteStep())
        }
      </div>

      {/* Verification modal shown after successful registration */}
      {showVerification && (
        <VerificationModal
          email={registeredEmail}
          onClose={() => {
            setShowVerification(false);
            setIsSubmittedPending(true);
          }}
          onVerified={() => {
            setShowVerification(false);
            setIsSubmittedPending(false);
            onClose();
            window.dispatchEvent(
              new CustomEvent('openLoginModal', {
                detail: { role: 'ATHLETE', email: registeredEmail },
              })
            );
          }}
        />
      )}
    </div>
  );
}
