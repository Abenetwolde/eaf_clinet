import React, { useState, useEffect } from 'react';
import { launchFaydaPortal, FAYDA_CONFIG } from '../constants/fayda';
import {
  KeyRound, Eye, EyeOff,
  X, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight,
  Clock, ExternalLink, Award, Activity, HeartPulse, User,
  Building2, Check, ArrowLeft, Sparkles, AlertCircle, Home,
  Phone, Mail, MapPin, Calendar, Hash, FileCheck, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';
import {
  useGetRegistrationOptionsQuery,
  useRegisterAthleteMutation,
  type AthleteRegistrationRequest,
} from '../store/api/athleteApi';
import FaydaVerifiedProfileModal, { FaydaResidentIdentity, formatFin } from './FaydaVerifiedProfileModal';
import ClubRegistrationForm from './ClubAdmin/ClubRegistrationForm';

// Types for internal use
export interface FaydaResult {
  name: string;
  amharic: string;
  dob: string;
  gender: string;
  blood: string;
  region: string;
  photoUrl: string;
  ageTier: string;
  fin: string;
  fan: string;
  hash: string;
  verificationDate: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  verificationToken?: string;
}

export interface AthletePayload {
  id: string;
  name: string;
  amharicName: string;
  dob: string;
  gender: string;
  ageTier: string;
  clubId: string;
  clubName: string;
  faydaFin: string;
  faydaFan: string;
  faydaStatus: string;
  faydaHash: string;
  primaryEvent: string;
  licenseStatus: string;
  licenseNumber: null | string;
  licenseExpiry: null | string;
  photoUrl: string;
  checkinStatus: string;
  qrCodeData: null | string;
  weight: number;
  height: number;
  restingHR: number;
  trainingLoad: string;
  emergencyContact: string;
  medicalNotes: string;
  email: string;
  phone: string;
  region: string;
  personalBests: Array<{ event: string; mark: string; isFat: boolean; date: string; venue: string }>;
  seasonBests: unknown[];
  weightLog: unknown[];
  trainingLog: unknown[];
  achievements: unknown[];
  medicalClearance?: {
    ecgStatus: string;
    fitToCompete: boolean;
    antiDopingCompliance: boolean;
  };
}

export interface ClubPayload {
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
  presidentName?: string;
  charterSigned?: boolean;
}

export interface OfficialPayload {
  id: string;
  role: 'COACH' | 'MEDICAL_HEAD' | 'OFFICIAL' | 'CLUB_PRESIDENT';
  name: string;
  amharicName?: string;
  faydaFin: string;
  faydaFan: string;
  photoUrl: string;
  email: string;
  phone: string;
  clubName?: string;
  specialization?: string;
  certificationLevel?: string;
  licenseNumber?: string;
  mohLicenseNumber?: string;
  hospitalAffiliation?: string;
  tueCoordinator?: boolean;
  officiatingRole?: string;
  waOfficialId?: string;
  charterAuthority?: string;
}

export type PendingRegistrationData =
  | { type: 'ATHLETE'; payload: { athlete: AthletePayload } }
  | { type: 'CLUB'; payload: { club: ClubPayload; targetSubPage?: string; session?: { token: string; refreshToken?: string; userId: string; userData?: any } } }
  | { type: 'OFFICIAL'; payload: { official: OfficialPayload } };

export type RegistrationRoleType = 'ATHLETE' | 'CLUB_PRESIDENT' | 'COACH' | 'MEDICAL_HEAD' | 'OFFICIAL';

// Step indicator bar with clean executive light styling (no tricolor)
function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-8 relative w-full overflow-x-auto pb-2">
      {steps.map((s, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-xs font-bold tracking-tight whitespace-nowrap ${
                  isActive ? 'text-slate-900 font-extrabold' : isDone ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 min-w-[24px] transition-all ${
                  i < current ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Synchronous resolver for Fayda National ID identity
 */
function resolveStoredFaydaIdentity(propIdentity?: FaydaResidentIdentity | null): FaydaResult | null {
  try {
    const raw = propIdentity
      ? { ...propIdentity, fin: propIdentity.nin, name: propIdentity.fullName, dob: propIdentity.birthDate, photoUrl: propIdentity.picture }
      : typeof window !== 'undefined'
        ? JSON.parse(sessionStorage.getItem('eaf_fayda_verified') || localStorage.getItem('eaf_fayda_verified') || 'null')
        : null;
    if (!raw) return null;
    const fin = raw.fin || raw.nin || '';
    const name = raw.name || raw.fullName || '';
    const dob = raw.dob || raw.birthDate || raw.birthdate || '';
    const verificationToken = raw.verificationToken || '';
    if (!fin || !name || !dob || !verificationToken) return null;
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return {
      name,
      amharic: raw.amharic || raw.fullNameAmharic || '',
      dob,
      gender: raw.gender || '',
      blood: raw.blood || '',
      region: raw.region || raw.address || '',
      photoUrl: raw.photoUrl || raw.picture || '',
      ageTier: raw.ageTier || (age <= 16 ? 'U16' : age <= 18 ? 'U18' : age <= 20 ? 'U20' : age >= 35 ? 'Masters' : 'Senior'),
      fin,
      fan: raw.fan || raw.fanNumber || '',
      hash: '',
      verificationDate: raw.verificationDate || raw.verifiedAt || '',
      phoneNumber: raw.phoneNumber || raw.phone || '',
      email: raw.email || '',
      address: raw.address || '',
      verificationToken,
    };
  } catch {
    return null;
  }
}

export default function RegistrationModal({
  role: initialRole,
  verifiedIdentity,
  onClose,
  onRegisterSuccess,
}: {
  role?: 'CLUB' | 'ATHLETE' | 'COACH' | 'MEDICAL_HEAD' | 'OFFICIAL' | string | null;
  verifiedIdentity?: FaydaResidentIdentity | null;
  onClose: () => void;
  onRegisterSuccess: (data: PendingRegistrationData) => void;
}) {
  const { t } = useI18n();

  const [activeRegType, setActiveRegType] = useState<'ATHLETE' | 'CLUB'>(() => {
    if (initialRole === 'CLUB') return 'CLUB';
    if (typeof window !== 'undefined' && window.location.search.includes('role=club')) return 'CLUB';
    return 'ATHLETE';
  });

  useEffect(() => {
    if (initialRole === 'CLUB') {
      setActiveRegType('CLUB');
    } else if (initialRole === 'ATHLETE') {
      setActiveRegType('ATHLETE');
    }
  }, [initialRole]);

  // Pre-load verified Fayda identity
  const initialFayda = resolveStoredFaydaIdentity(verifiedIdentity);
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(initialFayda);
  const [faydaFin, setFaydaFin] = useState<string>(initialFayda?.fin || '');
  const [faydaFan, setFaydaFan] = useState<string>(initialFayda?.fan || '');
  const [faydaVerificationToken, setFaydaVerificationToken] = useState<string | null>(initialFayda?.verificationToken || null);

  // Active registration workflow role
  const [selectedRole, setSelectedRole] = useState<RegistrationRoleType>('ATHLETE');

  // RTK Query API Hooks
  const { data: regOptions } = useGetRegistrationOptionsQuery();
  const [registerAthlete, { isLoading: isRegistering }] = useRegisterAthleteMutation();
  const [submissionError, setSubmissionError] = useState<string>('');

  // Step state:
  // Step 0: Fayda Authentication (the first section / step)
  // Step 1: Role Selection & Full Fayda User Info (after authenticate)
  // Step 2: Role Details & Digitization
  // Step 3: Review & Confirm
  const [step, setStep] = useState<number>(0);

  const isAlreadyCompleted = Boolean(
    typeof window !== 'undefined' && (
      localStorage.getItem('eaf_registration_status') === 'completed' ||
      sessionStorage.getItem('eaf_registration_status') === 'completed'
    )
  );

  // Already-registered Fayda check state
  const [isCheckingRegistered, setIsCheckingRegistered] = useState(false);
  const [registeredAccountInfo, setRegisteredAccountInfo] = useState<{
    isRegistered: boolean;
    message?: string;
    email?: string;
    phone?: string;
    fullName?: string;
    amharicName?: string;
    fin?: string;
    fan?: string;
    athleteId?: string;
    clubId?: string;
    clubName?: string;
    primaryEvent?: string;
    status?: string;
    photoUrl?: string;
    gender?: string;
    dateOfBirth?: string;
    region?: string;
    roles?: string[];
  } | null>(null);

  // Check if verified Fayda ID is already registered
  useEffect(() => {
    if (!faydaResult?.fin) {
      setRegisteredAccountInfo(null);
      return;
    }

    const checkFaydaRegistered = async () => {
      setIsCheckingRegistered(true);
      try {
        const cleanFin = (faydaResult.fin || '').replace(/\s+/g, '').trim();
        const endpoints = [
          `/api/v1/fayda/check-registered/${cleanFin}`,
          `/api/fayda/check-registered/${cleanFin}`,
        ];

        let foundData: any = null;
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep);
            if (res.ok) {
              const json = await res.json();
              if (json?.data) {
                foundData = json.data;
                break;
              }
            }
          } catch {}
        }

        if (foundData && foundData.isRegistered) {
          setRegisteredAccountInfo(foundData);
        } else {
          // Check against regOptions or local mock athletes
          const registeredFin = (regOptions as any)?.athletes?.some((a: any) => {
            const aFin = (a.faydaFin || a.fin || a.nin || '').replace(/\s+/g, '');
            return aFin && aFin === cleanFin;
          });
          if (registeredFin) {
            setRegisteredAccountInfo({
              isRegistered: true,
              message: 'This Fayda National ID is already registered in the Ethiopian Athletics Federation registry.',
            });
          } else {
            setRegisteredAccountInfo({ isRegistered: false });
          }
        }
      } catch {
        setRegisteredAccountInfo({ isRegistered: false });
      } finally {
        setIsCheckingRegistered(false);
      }
    };

    checkFaydaRegistered();
  }, [faydaResult?.fin, regOptions]);

  const handleOpenLoginModal = () => {
    onClose();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eaf_registered_fin', faydaResult?.fin || '');
      sessionStorage.setItem(
        'eaf_registration_success_msg',
        `Existing registration found for ${faydaResult?.name || "your account"}. Please sign in to access your portal.`
      );
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(
        new CustomEvent('navigateToPage', {
          detail: { page: 'LOGIN', credential: faydaResult?.fin || '' },
        })
      );
    }
  };

  const handleClearFaydaVerification = () => {
    setFaydaResult(null);
    setFaydaFin('');
    setFaydaFan('');
    setFaydaVerificationToken(null);
    setRegisteredAccountInfo(null);
    try {
      sessionStorage.removeItem('eaf_fayda_verified');
      sessionStorage.removeItem('fayda_auth_payload');
      sessionStorage.removeItem('fayda_photo');
      sessionStorage.removeItem('fayda_token');
      localStorage.removeItem('fayda_auth_payload');
      localStorage.removeItem('fayda_photo');
      localStorage.removeItem('fayda_token');
      localStorage.removeItem('eaf_fayda_verified');
    } catch {}
    setStep(0);
  };

  // Common account fields
  const [email, setEmail] = useState(initialFayda?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(initialFayda?.phoneNumber || '');
  const [region, setRegion] = useState(initialFayda?.region || '');

  // Club President specific
  const [clubName, setClubName] = useState('Ethiopian Electric Athletics Club');
  const [clubShortName, setClubShortName] = useState('EEAC');
  const [clubCity, setClubCity] = useState('Addis Ababa');
  const [clubAddress, setClubAddress] = useState('Mexico Square, EEP Compound, Bldg 4');
  const [clubOfficialEmail, setClubOfficialEmail] = useState('admin@eeac-athletics.et');
  const [clubOfficialPhone, setClubOfficialPhone] = useState('+251 11 551 2233');
  const [clubLogo, setClubLogo] = useState('⚡');
  const [supportingDocsNumber, setSupportingDocsNumber] = useState('RSB-AA-2024-C9842');
  const [charterAuthority, setCharterAuthority] = useState('Executive President & Charter Signatory');
  const [executiveTerm, setExecutiveTerm] = useState('2024 - 2028 Olympic Quadrennial');
  const [charterAgreed, setCharterAgreed] = useState(true);

  // Coach specific
  const [coachSpecialization, setCoachSpecialization] = useState('Endurance & Marathon High Performance');
  const [waCoachLevel, setWaCoachLevel] = useState('World Athletics Level 3 (High Performance)');
  const [coachLicenseNumber, setCoachLicenseNumber] = useState('WA-ETH-COA-2026-088');
  const [assignedTrainingCenter, setAssignedTrainingCenter] = useState('Bekoji High Altitude Center / EEAC');

  // Medical Head specific
  const [medicalDesignation, setMedicalDesignation] = useState('Team Physician (MD) & Sports Medicine Head');
  const [mohLicenseNumber, setMohLicenseNumber] = useState('MoH-ET-MD-2019-9482');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('Tikur Anbessa Hospital / National Sports Clinic');
  const [isTueCoordinator, setIsTueCoordinator] = useState(true);

  // Technical Official specific
  const [officiatingRole, setOfficiatingRole] = useState('Technical Delegate & Track Referee');
  const [waOfficialLevel, setWaOfficialLevel] = useState('World Athletics Level 2 Technical Official');
  const [waOfficialId, setWaOfficialId] = useState('WA-ETO-ETH-4412');

  // Athlete Digitization: Performance PBs & SBs
  const [primaryEvent, setPrimaryEvent] = useState<string[]>(['5,000m Long Distance']);
  const [selectedClubId, setSelectedClubId] = useState('NONE');
  const [weight, setWeight] = useState(58);
  const [height, setHeight] = useState(172);
  const [restingHR, setRestingHR] = useState(44);
  const [dominantFoot, setDominantFoot] = useState<'RIGHT' | 'LEFT'>('RIGHT');
  const [nationalRankingTier, setNationalRankingTier] = useState('Senior National Podium Tier (Top 5)');

  // Performance Personal Bests (PBs) list
  const [personalBests, setPersonalBests] = useState<Array<{ event: string; mark: string; isFat: boolean; date: string; venue: string }>>([
    { event: '5,000m Track', mark: '12:45.32', isFat: true, date: '2025-06-12', venue: 'FBK Games, Hengelo' },
    { event: '10,000m Track', mark: '26:54.10', isFat: true, date: '2025-05-24', venue: 'Prefontaine Classic, Eugene' },
  ]);
  const [newPbEvent, setNewPbEvent] = useState('Half Marathon');
  const [newPbMark, setNewPbMark] = useState('59:14');
  const [newPbVenue, setNewPbVenue] = useState('Valencia Half Marathon');

  // Medical Clearance & Fit-to-Compete
  const [ecgStatus, setEcgStatus] = useState('NORMAL_ECG_CERTIFIED');
  const [fitToCompeteAgreed, setFitToCompeteAgreed] = useState(true);
  const [antiDopingCompliance, setAntiDopingCompliance] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState('+251 91 123 4567');
  const [medicalNotes, setMedicalNotes] = useState('Blood Group O+ · Athletic sinus bradycardia resting HR 44 bpm');

  // UI state
  const [serverRegistrationId, setServerRegistrationId] = useState<string | null>(null);
  const [faydaError, setFaydaError] = useState('');
  const [isOidcLaunching, setIsOidcLaunching] = useState(false);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<PendingRegistrationData | null>(null);

  // Sync with prop changes
  useEffect(() => {
    if (verifiedIdentity) {
      const resolved = resolveStoredFaydaIdentity(verifiedIdentity);
      if (resolved) {
        setFaydaResult(resolved);
        setFaydaFin(resolved.fin);
        setFaydaFan(resolved.fan);
        if (resolved.phoneNumber) setPhone(resolved.phoneNumber);
        if (resolved.email) setEmail(resolved.email);
        if (resolved.region) setRegion(resolved.region);
        if (resolved.verificationToken) setFaydaVerificationToken(resolved.verificationToken);
        setStep(0); // Display retrieved information in Section 1
      }
    }
  }, [verifiedIdentity]);

  // Listen for popup messages & session storage updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FAYDA_OIDC_SUCCESS' && event.data.payload) {
        const payload = event.data.payload;
        const identity = payload.userInfo || payload.identity || {};
        const fullName = identity['name#en'] || identity.fullName || identity.name || '';
        const amharic = identity['name#am'] || identity.fullNameAmharic || '';
        const dob = identity.birthdate || identity.birthDate || '';
        const dobYear = parseInt(dob.substring(0, 4));
        const age = 2026 - (isNaN(dobYear) ? 1980 : dobYear);
        const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : age >= 35 ? `Masters Division (${age} yrs)` : 'Senior Division';
        const nin = identity.nin || identity.national_id || '';
        const cleanDigits = nin.replace(/\D/g, '');
        const fan = 'FAN-' + (cleanDigits.slice(-8) || '98421084');
        const phoneVal = identity.phone_number || identity.phoneNumber || '';
        const emailVal = identity.email || '';
        const photo = identity.picture || '';

        const resObj: FaydaResult = {
          name: fullName,
          amharic,
          dob,
          gender: (identity.gender || 'MALE').toUpperCase() === 'MALE' ? 'Male' : 'Female',
          blood: 'O+',
          region: 'Addis Ababa / Federal',
          photoUrl: photo,
          ageTier: tier,
          fin: nin,
          fan,
          hash: '0xFAYDA_' + cleanDigits.slice(-6),
          verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          phoneNumber: phoneVal,
          email: emailVal,
          address: 'Addis Ababa / Federal',
          verificationToken: payload.verificationToken || '',
        };

        setFaydaResult(resObj);
        setFaydaFin(nin);
        setFaydaFan(fan);
        setPhone(phoneVal);
        setEmail(emailVal);
        try {
          sessionStorage.setItem('eaf_fayda_verified', JSON.stringify(resObj));
          localStorage.setItem('eaf_fayda_verified', JSON.stringify(resObj));
        } catch (e) {}

        // Stay on Step 0 to display retrieved information in Section 1
        setStep(0);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Launch official Fayda portal
  const handleLaunchFaydaOidc = async (asPopup = false) => {
    setIsOidcLaunching(true);
    setFaydaError('');
    try {
      const redirectUri = FAYDA_CONFIG.redirectUri;
      await launchFaydaPortal(redirectUri, asPopup);
    } catch (err: any) {
      console.error('Failed to launch Fayda portal:', err);
      setFaydaError('Failed to connect to Fayda identity server. Please try again later.');
    } finally {
      setIsOidcLaunching(false);
    }
  };

  const handleAddPersonalBest = () => {
    if (!newPbEvent || !newPbMark) return;
    setPersonalBests(prev => [
      ...prev,
      {
        event: newPbEvent,
        mark: newPbMark,
        isFat: true,
        date: new Date().toISOString().split('T')[0],
        venue: newPbVenue
      }
    ]);
    setNewPbEvent('');
    setNewPbMark('');
    setNewPbVenue('');
  };

  const steps = ['1. Fayda Verification', '2. Athlete Details', '3. Review & Submit'];

  // Submission handler
  const handleSubmit = async () => {
    setSubmissionError('');

    // Club resolution
    const apiClubs = regOptions?.clubs || [];
    const matchedApiClub = apiClubs.find(c => c.id === selectedClubId);
    const club = selectedClubId === 'NONE'
      ? { id: 'NONE', name: 'Independent Athlete', shortName: 'Independent' }
      : matchedApiClub ? { id: matchedApiClub.id, name: matchedApiClub.name, shortName: matchedApiClub.name.split(' ')[0] } : null;

    if (selectedRole === 'ATHLETE' || !selectedRole) {
      // Validate inputs
      const athleteEmail = (email || faydaResult?.email || '').trim();
      if (!athleteEmail || !athleteEmail.includes('@')) {
        setSubmissionError('Please provide a valid email address for your official federation account.');
        return;
      }

      if (!password || password.length < 8) {
        setSubmissionError('Password must be at least 8 characters long.');
        return;
      }
      const tokenToUse = faydaVerificationToken || faydaResult?.verificationToken;
      if (!tokenToUse) {
        setSubmissionError('Complete the official Fayda verification flow before registering.');
        return;
      }

      const displayEvent = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;
      const newAthlete: AthletePayload = {
        id: '',
        name: faydaResult?.name || '',
        amharicName: faydaResult?.amharic || '',
        dob: faydaResult?.dob || '',
        gender: faydaResult?.gender || '',
        ageTier: faydaResult?.ageTier || '',
        clubId: club?.id || 'NONE',
        clubName: club?.shortName || club?.name || '',
        faydaFin: faydaResult?.fin || faydaFin || '',
        faydaFan: faydaResult?.fan || faydaFan || '',
        faydaStatus: 'VERIFIED',
        faydaHash: faydaResult?.hash || '',
        primaryEvent: displayEvent,
        licenseStatus: 'PENDING_APPROVAL',
        licenseNumber: '',
        licenseExpiry: '',
        photoUrl: faydaResult?.photoUrl || '',
        checkinStatus: 'NOT_CHECKED_IN',
        qrCodeData: null,
        weight, height, restingHR,
        trainingLoad: '',
        emergencyContact, medicalNotes,
        email: athleteEmail,
        phone: phone || faydaResult?.phoneNumber || '',
        region: faydaResult?.region || region || '',
        personalBests,
        seasonBests: personalBests.map(p => ({ event: p.event, mark: p.mark, year: 2026 })),
        weightLog: [],
        trainingLog: [],
        achievements: [],
        medicalClearance: {
          ecgStatus,
          fitToCompete: fitToCompeteAgreed,
          antiDopingCompliance,
        }
      };

      try {
        // Match discipline from backend API
        const availableSports = regOptions?.disciplines || [];
        const matchedSport = availableSports.find(s =>
          primaryEvent.some(p => p.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(p.toLowerCase()))
        ) || availableSports[0];

        const regPayload: AthleteRegistrationRequest = {
          email: athleteEmail,
          password,
          phoneNumber: newAthlete.phone,
          faydaVerificationToken: tokenToUse,
          fanNumber: newAthlete.faydaFan,
          sportIds: matchedSport ? [matchedSport.id] : undefined,
          sportId: matchedSport?.id,
          clubId: matchedApiClub ? matchedApiClub.id : (selectedClubId !== 'NONE' ? selectedClubId : undefined),
          clubName: matchedApiClub?.name,
          region: newAthlete.region,
          height: Number(height),
          weight: Number(weight),
          emergencyContactPhone: emergencyContact,
        };

        const apiResponse = await registerAthlete(regPayload).unwrap();
        const serverId = apiResponse.data?.id;
        if (!serverId) throw new Error('The server did not confirm athlete registration.');
        const serverStatus = apiResponse.data?.status || 'PENDING';

        setServerRegistrationId(serverId);
        newAthlete.id = serverId;
        newAthlete.licenseStatus = serverStatus;

        // Persist registration status marker
        try {
          const regMarker = {
            athleteId: serverId,
            status: serverStatus,
            email: athleteEmail,
            name: newAthlete.name,
            faydaFin: newAthlete.faydaFin,
            fanNumber: newAthlete.faydaFan,
            isRegistered: true,
            registeredAt: new Date().toISOString(),
          };
          localStorage.setItem('eaf_registration_status', 'completed');
          sessionStorage.setItem('eaf_registration_status', 'completed');
          localStorage.setItem('eaf_registered_athlete', JSON.stringify(regMarker));
          sessionStorage.setItem('eaf_registered_athlete', JSON.stringify(regMarker));
        } catch (e) {}

        setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
        setIsSubmittedPending(true);
        return;
      } catch (apiErr: any) {
        console.error('Registration API Error:', apiErr);
        const errMsg = apiErr?.data?.message || apiErr?.error || 'Registration failed. Please check your data or try again.';
        setSubmissionError(errMsg);
        return;
      }
    }

    if (selectedRole === 'CLUB_PRESIDENT') {
      try {
        const clubAdminPayload = {
          email: email.trim(),
          password,
          firstName: (faydaResult?.name || 'Club President').split(' ')[0],
          lastName: (faydaResult?.name || 'Club President').split(' ').slice(1).join(' ') || 'Admin',
          phoneNumber: phone.trim(),
          clubName: clubName.trim(),
          clubShortName: clubShortName.trim() || clubName.split(' ')[0],
          clubEmail: clubOfficialEmail.trim(),
          clubPhone: clubOfficialPhone.trim(),
          clubAddress: clubAddress.trim(),
          clubCity: clubCity.trim(),
          clubRegion: region,
          licenseNumber: 'ETH-CL-2026-' + Math.floor(100 + Math.random() * 900),
          logoUrl: clubLogo,
        };

        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/clubs/register-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubAdminPayload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Club registration failed. Please check your details and try again.');
        const persistedClub = json?.data?.club;
        if (!persistedClub?.id || !json?.data?.user?.id) {
          throw new Error('The server did not confirm the club account. Please try again.');
        }
        const serverId = persistedClub.id;

        const newClub: ClubPayload = {
          id: serverId,
          name: persistedClub.name || clubName,
          shortName: persistedClub.shortName || clubShortName || clubName.split(' ')[0] || 'Club',
          region: persistedClub.region || region,
          city: persistedClub.city || clubCity,
          address: persistedClub.address || clubAddress,
          manager: `${json.data.user.firstName || 'Club'} ${json.data.user.lastName || 'President'}`.trim(),
          email: persistedClub.email || clubOfficialEmail || email,
          phone: persistedClub.phone || clubOfficialPhone || phone,
          licensedAthletes: 0,
          pendingVerifications: 0,
          unlicensedAthletes: 0,
          transfersCount: 0,
          logo: persistedClub.logoUrl || clubLogo,
          logoUrl: persistedClub.logoUrl || clubLogo,
          clubRank: 1,
          totalPoints: 100,
          presidentName: faydaResult?.name || 'Club President',
          charterSigned: charterAgreed,
          verificationStatus: persistedClub.verificationStatus,
          status: persistedClub.verificationStatus === 'VERIFIED' ? 'ACTIVE' : persistedClub.verificationStatus,
        };
        setServerRegistrationId(serverId);
        setPendingRegistrationData({ type: 'CLUB', payload: { club: newClub } });
        setIsSubmittedPending(true);
        return;
      } catch (err: any) {
        setSubmissionError(err?.message || 'Club registration failed.');
        return;
      }
    }

    const officialPayload: OfficialPayload = {
      id: `${selectedRole}-2026-` + Math.floor(100 + Math.random() * 900),
      role: selectedRole,
      name: faydaResult?.name || '',
      amharicName: faydaResult?.amharic,
      faydaFin: faydaResult?.fin || faydaFin,
      faydaFan: faydaResult?.fan || faydaFan,
      photoUrl: faydaResult?.photoUrl || '/images/fayda_resident_photo.jpg',
      email,
      phone,
      clubName: selectedRole === 'COACH' ? clubName : undefined,
      specialization: selectedRole === 'COACH' ? coachSpecialization : undefined,
      certificationLevel: selectedRole === 'COACH' ? waCoachLevel : selectedRole === 'OFFICIAL' ? waOfficialLevel : undefined,
      licenseNumber: selectedRole === 'COACH' ? coachLicenseNumber : undefined,
      mohLicenseNumber: selectedRole === 'MEDICAL_HEAD' ? mohLicenseNumber : undefined,
      hospitalAffiliation: selectedRole === 'MEDICAL_HEAD' ? hospitalAffiliation : undefined,
      tueCoordinator: selectedRole === 'MEDICAL_HEAD' ? isTueCoordinator : undefined,
      officiatingRole: selectedRole === 'OFFICIAL' ? officiatingRole : undefined,
      waOfficialId: selectedRole === 'OFFICIAL' ? waOfficialId : undefined,
      charterAuthority: selectedRole === 'CLUB_PRESIDENT' ? charterAuthority : undefined,
    };

    setServerRegistrationId(officialPayload.id);
    setPendingRegistrationData({ type: 'OFFICIAL', payload: { official: officialPayload } });
    setIsSubmittedPending(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 0: FIRST SECTION / STEP OF THE FORM — FAYDA AUTHENTICATION BUTTON
  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: FIRST SECTION OF REGISTRATION — DISPLAY USER'S RETRIEVED INFO
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep0FaydaAuth = () => {
    // If not verified with Fayda yet, show the official authentication action
    if (!faydaResult) {
      return (
        <div className="flex flex-col items-center text-center max-w-xl mx-auto py-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <ShieldCheck size={36} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            National ID Verification
          </h3>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
            Verify your official identity with your Fayda National ID to begin your athletics registration. Your verified information will be retrieved securely.
          </p>

          {/* Primary Blue Button with Fayda Logo */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleLaunchFaydaOidc(false)}
            disabled={isOidcLaunching}
            className="w-full sm:w-auto min-w-[340px] px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg flex items-center justify-center gap-4 shadow-lg shadow-blue-500/25 transition-all cursor-pointer border-0"
          >
            <img
              src="/images/fayda_logo.png"
              alt="Fayda National ID Logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm bg-white p-0.5"
            />
            <div className="flex flex-col text-left">
              <span className="text-base sm:text-lg font-black leading-tight text-white flex items-center gap-2">
                {isOidcLaunching ? 'Connecting to Fayda...' : 'Authenticate with Fayda ID'}
                <ArrowRight size={18} />
              </span>
              <span className="text-xs text-blue-100 font-semibold opacity-90">
                National ID Digital Authentication
              </span>
            </div>
          </motion.button>

          {faydaError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold max-w-md">
              {faydaError}
            </div>
          )}
        </div>
      );
    }

    // When verified: DISPLAY USER'S RETRIEVED INFORMATION IN THE FIRST SECTION
    const isDuplicate = registeredAccountInfo?.isRegistered;

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/fayda_logo.png"
                alt="Fayda Logo"
                className="w-8 h-8 rounded-full object-cover shadow-sm bg-white p-0.5"
              />
              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  Verified Fayda Identity Information
                </h4>
                <p className="text-xs text-slate-500 m-0 mt-0.5 font-semibold">
                  Official identity details retrieved from the National ID Program (eSignet)
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-600" /> Authenticated Citizen
            </span>
          </div>

          {/* User Profile Header Card */}
          <div className="flex items-start sm:items-center gap-5 flex-wrap sm:flex-nowrap mb-6">
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200 relative group">
              <img
                src={faydaResult.photoUrl}
                alt="Biometric Portrait"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white shadow-xs" />
            </div>

            <div className="flex-1 min-w-[200px]">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
                {faydaResult.name}
              </h3>
              {faydaResult.amharic && (
                <div className="text-base font-bold text-blue-700 mt-0.5">
                  {faydaResult.amharic}
                </div>
              )}
              <div className="text-xs sm:text-sm text-slate-600 font-semibold mt-2 flex items-center gap-2 flex-wrap">
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  DOB: <strong>{faydaResult.dob}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Gender: <strong>{faydaResult.gender}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Blood: <strong>{faydaResult.blood}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Region: <strong>{faydaResult.region}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* SEPARATE FIN AND FAN CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* FIN CARD */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4.5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-blue-800 mb-1 flex items-center justify-between">
                <span>National ID Number (FIN)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-black">Permanent ID</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-wide mt-1">
                {formatFin(faydaResult.fin)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Unique citizen biometric identity reference
              </div>
            </div>

            {/* FAN CARD */}
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4.5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1 flex items-center justify-between">
                <span>Fayda Access Number (FAN)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black">Virtual Access</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-wide mt-1">
                {faydaResult.fan}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Tokenized authentication credential
              </div>
            </div>
          </div>

          {/* Contact Details Row */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-blue-500" />
              <span className="font-bold">Phone:</span>
              <span className="font-semibold">{faydaResult.phoneNumber || phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-blue-500" />
              <span className="font-bold">Email:</span>
              <span className="font-semibold">{faydaResult.email || email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-blue-500" />
              <span className="font-bold">Address:</span>
              <span className="font-semibold">{faydaResult.address || faydaResult.region}</span>
            </div>
          </div>
        </div>

        {/* ── DUPLICATE FAYDA ID ALERT / PROCEED ACTIONS ── */}
        {isCheckingRegistered ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-blue-600" />
            <span className="text-xs sm:text-sm font-bold">Verifying National ID status in Ethiopian Athletics Federation registry...</span>
          </div>
        ) : isDuplicate ? (
          <div className="space-y-4">
            {/* Prominent Duplicate Registration Notice */}
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-xs">
                  <AlertCircle size={26} />
                </div>
                <div>
                  <h5 className="text-base sm:text-lg font-black text-amber-900 m-0 leading-tight">
                    Registration Already Completed
                  </h5>
                  <p className="text-xs sm:text-sm text-amber-800 font-medium m-0 mt-1 max-w-lg leading-relaxed">
                    This Fayda National ID ({formatFin(faydaResult.fin)}) has already completed official registration with the Ethiopian Athletics Federation. Duplicate accounts cannot be created.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenLoginModal}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm whitespace-nowrap cursor-pointer border-0 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Display Retrieved Existing Registration Profile */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Retrieved Federation Account Details
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: {registeredAccountInfo?.status || "Active Registered"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block">Registered Athlete</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">
                    {registeredAccountInfo?.fullName || faydaResult.name}
                  </span>
                  {registeredAccountInfo?.amharicName && (
                    <span className="text-blue-700 font-bold block">{registeredAccountInfo.amharicName}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block">Affiliated Club</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">
                    {registeredAccountInfo?.clubName || "Independent Athlete"}
                  </span>
                  <span className="text-slate-500 font-semibold block">
                    Discipline: {registeredAccountInfo?.primaryEvent || "Athletics"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block">Contact Information</span>
                  <span className="font-mono font-bold text-slate-800 block">
                    {registeredAccountInfo?.email || faydaResult.email || "No email on file"}
                  </span>
                  <span className="font-mono text-slate-600 block">
                    {registeredAccountInfo?.phone || faydaResult.phoneNumber || ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={handleClearFaydaVerification}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
              >
                <RefreshCw size={14} /> Verify with a different National ID
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
            <button
              type="button"
              onClick={handleClearFaydaVerification}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
            >
              <RefreshCw size={14} /> Re-verify with different National ID
            </button>

            <button
              type="button"
              onClick={() => setStep(1)} // Advance to Step 1: Athlete Profile Details
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer border-0 transition-all ml-auto"
            >
              <span>Continue to Athlete Details</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {isDuplicate && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleClearFaydaVerification}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
            >
              <RefreshCw size={14} /> Re-verify with a different National ID
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: SECOND SECTION OF REGISTRATION — ROLE SELECTION
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep1RoleSelection = () => {
    const rolesConfig = [
      {
        id: 'ATHLETE',
        title: 'Athlete',
        subtitle: 'Competitors & Runners',
        desc: 'Track & field competitors, marathon runners, youth & senior divisions.',
        icon: <Activity size={24} className="text-blue-600" />,
        badge: 'Biometrics & PBs',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        id: 'CLUB_PRESIDENT',
        title: 'Club President',
        subtitle: 'Executive Leadership',
        desc: 'Club leadership, federation charter contracts & athlete transfers.',
        icon: <Building2 size={24} className="text-blue-600" />,
        badge: 'Charter Signatory',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        id: 'COACH',
        title: 'Coach & Technical',
        subtitle: 'Training & Conditioning',
        desc: 'Endurance, sprint and field coaches with World Athletics certifications.',
        icon: <Clock size={24} className="text-blue-600" />,
        badge: 'WA Accredited',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        id: 'MEDICAL_HEAD',
        title: 'Health & Medical Head',
        subtitle: 'Sports Medicine & Cardiac',
        desc: 'Team physicians, sports medicine, cardiac ECG clearances & TUE liaison.',
        icon: <HeartPulse size={24} className="text-blue-600" />,
        badge: 'MoH Licensed',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        id: 'OFFICIAL',
        title: 'Technical Official',
        subtitle: 'Track Referees & Judges',
        desc: 'Photo-finish FAT timing judges, track referees & race marshals.',
        icon: <Award size={24} className="text-blue-600" />,
        badge: 'WA Certified',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    ];

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-2xl font-black text-slate-900 tracking-tight m-0">
            Stage 2: Select Your Federation Role
          </h4>
          <p className="text-slate-600 text-sm m-0 mt-1">
            Choose the capacity in which you are registering with the Ethiopian Athletics Federation:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolesConfig.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                key={r.id}
                onClick={() => {
                  setSelectedRole(r.id as any);
                }}
                className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 shadow-sm ${
                  isSelected
                    ? 'border-blue-600 ring-4 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                      {r.icon}
                    </div>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${r.badgeBg}`}>
                      {r.badge}
                    </span>
                  </div>

                  <h5 className="text-base font-black text-slate-900 m-0">
                    {r.title}
                  </h5>
                  <div className="text-xs font-bold text-blue-700 mb-1.5">
                    {r.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed m-0">
                    {r.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-blue-600">
                  <span>{isSelected ? '✓ Selected Role' : 'Select Role'}</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stage 2 Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Fayda Info
          </button>

          <button
            type="button"
            onClick={() => setStep(2)} // Advance to Stage 3: Profile Details
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer border-0 shadow-sm"
          >
            <span>Continue to Profile Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };
  const validateStep2AndProceed = () => {
    setSubmissionError('');
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setSubmissionError('Please provide a valid official email address for your federation account.');
      return;
    }
    const trimmedPhone = (phone || '').trim();
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 8) {
      setSubmissionError('Please enter a valid phone number (e.g., 0911000000).');
      return;
    }
    if (!password || password.length < 8) {
      setSubmissionError('Please create a secure password of at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmissionError('Passwords do not match. Please re-enter your password.');
      return;
    }
    setStep(2);
  };

  const renderAccountCredentialsCard = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 my-2">
      <div className="flex items-center gap-2">
        <KeyRound size={18} className="text-slate-800" />
        <div>
          <h5 className="text-sm font-black text-slate-900 m-0">Account Credentials &amp; Sign-In Password</h5>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Establish the credentials you will use to log into the federation portal after registration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Account Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSubmissionError(''); }}
            placeholder="athlete@athletics.et"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-slate-800"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1 m-0">Used for official communications and password recovery.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Registered Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSubmissionError(''); }}
            placeholder="0911000000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-slate-800"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1 m-0">Used for SMS alerts and quick phone-number sign-in.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Create Sign-In Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSubmissionError(''); }}
              placeholder="At least 8 characters"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-slate-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 m-0">Minimum 8 characters.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Confirm Sign-In Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSubmissionError(''); }}
              placeholder="Re-enter password"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-slate-800"
              required
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-[10px] text-red-600 mt-1 m-0">Passwords do not match.</p>
          )}
        </div>
      </div>

      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck size={16} className="text-slate-700 shrink-0 mt-0.5" />
        <span>
          <strong>Sign-in flexibility:</strong> Once registered, you will be able to log in with your <strong>National ID (FIN)</strong>, <strong>Access Number (FAN)</strong>, <strong>Phone Number</strong>, or <strong>Email</strong> using this password.
        </span>
      </div>
    </div>
  );

  const renderStep2ProfileDetails = () => {
    if (selectedRole === 'ATHLETE' || !selectedRole) {
      // Use API-provided disciplines if available, otherwise fallback
      const apiDisciplines = regOptions?.disciplines?.length
        ? regOptions.disciplines.map(d => d.name)
        : null;
      const allDisciplines = apiDisciplines || [
        '100m', '400m', '800m', '1500m', '5000m', '10000m',
        '3000m Steeplechase', 'Marathon', 'Half Marathon', 'Cross Country',
      ];

      return (
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight m-0">
              Sports Affiliation &amp; Performance Digitization
            </h4>
            <p className="text-slate-600 text-sm m-0 mt-1">
              Select your competitive events, club affiliation, and personal bests.
            </p>
          </div>

          {/* Events selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Competitive Disciplines
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
              {allDisciplines.map(d => {
                const isSelected = primaryEvent.includes(d);
                return (
                  <label
                    key={d}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) setPrimaryEvent(primaryEvent.filter(item => item !== d));
                        else setPrimaryEvent([...primaryEvent, d]);
                      }}
                      className="accent-sky-600"
                    />
                    {d}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Club and Ranking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Club / Team Affiliation
              </label>
              <select
                value={selectedClubId}
                onChange={e => setSelectedClubId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm bg-white"
              >
                <option value="NONE">Independent / Unaffiliated Athlete</option>
                {(regOptions?.clubs || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Region / State (Federation Member)
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm bg-white"
              >
                {(regOptions?.regions || []).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PBs table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-900">Official Personal Bests (PBs)</span>
              <span className="text-xs font-bold text-emerald-700">Electronic Timing Certified</span>
            </div>

            <div className="space-y-2 mb-3">
              {personalBests.map((pb, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">{pb.event}</span>
                    <span className="font-black font-mono text-sky-700">{pb.mark}</span>
                    <span className="text-slate-500">{pb.venue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPersonalBests(personalBests.filter((_, i) => i !== idx))}
                    className="text-red-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text" placeholder="Event (e.g. Marathon)"
                value={newPbEvent} onChange={e => setNewPbEvent(e.target.value)}
                className="p-2 text-xs border border-slate-300 rounded-lg"
              />
              <input
                type="text" placeholder="Mark (e.g. 2:04:12)"
                value={newPbMark} onChange={e => setNewPbMark(e.target.value)}
                className="p-2 text-xs border border-slate-300 rounded-lg"
              />
              <input
                type="text" placeholder="Venue (e.g. Berlin)"
                value={newPbVenue} onChange={e => setNewPbVenue(e.target.value)}
                className="p-2 text-xs border border-slate-300 rounded-lg sm:col-span-1"
              />
              <button
                type="button" onClick={handleAddPersonalBest}
                className="p-2 text-xs font-black bg-sky-600 text-white rounded-lg hover:bg-sky-700 cursor-pointer border-0"
              >
                Add PB
              </button>
            </div>
          </div>

          {/* Biometrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number" value={height} onChange={e => setHeight(Number(e.target.value))}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resting HR (bpm)</label>
              <input
                type="number" value={restingHR} onChange={e => setRestingHR(Number(e.target.value))}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dominant Leg</label>
              <select
                value={dominantFoot} onChange={e => setDominantFoot(e.target.value as any)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="RIGHT">Right Leg</option>
                <option value="LEFT">Left Leg</option>
              </select>
            </div>
          </div>

          {renderAccountCredentialsCard()}

          {submissionError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={validateStep2AndProceed}
              className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm"
            >
              Continue to Review <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    // Stakeholders Details
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-xl font-black text-slate-900 tracking-tight m-0">
            {selectedRole === 'CLUB_PRESIDENT' && 'Club Governance & Signing Authority'}
            {selectedRole === 'COACH' && 'Coaching Accreditation & Licensing'}
            {selectedRole === 'MEDICAL_HEAD' && 'Medical Licensing & Hospital Credentials'}
            {selectedRole === 'OFFICIAL' && 'Technical Officiating Accreditation'}
          </h4>
          <p className="text-slate-600 text-sm m-0 mt-1">
            Enter your official accreditation credentials for federation licensing.
          </p>
        </div>

        {selectedRole === 'CLUB_PRESIDENT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Official Club Name *</label>
                <input
                  type="text" value={clubName} onChange={e => setClubName(e.target.value)}
                  placeholder="e.g. Ethiopian Electric Athletics Club"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Short Name / Code</label>
                <input
                  type="text" value={clubShortName} onChange={e => setClubShortName(e.target.value)}
                  placeholder="e.g. EEAC"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">City / Municipality *</label>
                <input
                  type="text" value={clubCity} onChange={e => setClubCity(e.target.value)}
                  placeholder="e.g. Addis Ababa"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Headquarters Address</label>
                <input
                  type="text" value={clubAddress} onChange={e => setClubAddress(e.target.value)}
                  placeholder="e.g. Mexico Square, Compound Bldg 4"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Official Club Email *</label>
                <input
                  type="email" value={clubOfficialEmail} onChange={e => setClubOfficialEmail(e.target.value)}
                  placeholder="e.g. info@club.et"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Official Club Phone</label>
                <input
                  type="tel" value={clubOfficialPhone} onChange={e => setClubOfficialPhone(e.target.value)}
                  placeholder="e.g. +251 11 551 2233"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            {/* Club Logo / Crest Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Club Emblem / Logo *</label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {['⚡', '🏃', '🦅', '🦁', '🏔️', '🌟', '🔥', '🛡️'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setClubLogo(sym)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border transition-all ${
                      clubLogo === sym
                        ? 'border-sky-500 bg-sky-50 shadow-sm ring-2 ring-sky-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={clubLogo.startsWith('http') || clubLogo.startsWith('/') ? clubLogo : ''}
                onChange={e => setClubLogo(e.target.value)}
                placeholder="Or paste custom Logo Image URL (e.g. https://... or /images/...)"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Representative Mandate</label>
                <input
                  type="text" value={charterAuthority} onChange={e => setCharterAuthority(e.target.value)}
                  placeholder="e.g. Executive President & Signatory"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Supporting Credentials / License Ref</label>
                <input
                  type="text" value={supportingDocsNumber} onChange={e => setSupportingDocsNumber(e.target.value)}
                  placeholder="e.g. RSB-AA-2024-C9842"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {selectedRole === 'COACH' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">World Athletics Certification Level</label>
              <select
                value={waCoachLevel} onChange={e => setWaCoachLevel(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="World Athletics Level 3 (High Performance)">World Athletics Level 3 (High Performance)</option>
                <option value="World Athletics Level 2 (Senior Specialization)">World Athletics Level 2 (Senior Specialization)</option>
                <option value="World Athletics Level 1 (Youth Development)">World Athletics Level 1 (Youth Development)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Coaching Specialization</label>
                <input
                  type="text" value={coachSpecialization} onChange={e => setCoachSpecialization(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Coach License Number</label>
                <input
                  type="text" value={coachLicenseNumber} onChange={e => setCoachLicenseNumber(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {selectedRole === 'MEDICAL_HEAD' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Medical Designation</label>
              <select
                value={medicalDesignation} onChange={e => setMedicalDesignation(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="Team Physician (MD) & Sports Medicine Head">Team Physician (MD) &amp; Sports Medicine Head</option>
                <option value="Cardiologist & ECG Clearance Officer">Cardiologist &amp; ECG Clearance Officer</option>
                <option value="Chief Sports Physiotherapist">Chief Sports Physiotherapist</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Ministry of Health License #</label>
                <input
                  type="text" value={mohLicenseNumber} onChange={e => setMohLicenseNumber(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
                <input
                  type="text" value={hospitalAffiliation} onChange={e => setHospitalAffiliation(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {selectedRole === 'OFFICIAL' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Officiating Role</label>
              <select
                value={officiatingRole} onChange={e => setOfficiatingRole(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="Technical Delegate & Track Referee">Technical Delegate &amp; Track Referee</option>
                <option value="Chief Photo-Finish & Timing Judge">Chief Photo-Finish &amp; Timing Judge</option>
                <option value="Starter & False-Start Official">Starter &amp; False-Start Official</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">World Athletics Level</label>
                <input
                  type="text" value={waOfficialLevel} onChange={e => setWaOfficialLevel(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Official ID</label>
                <input
                  type="text" value={waOfficialId} onChange={e => setWaOfficialId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {renderAccountCredentialsCard()}

        {submissionError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
          >
            Back
          </button>
          <button
            type="button"
            onClick={validateStep2AndProceed}
            className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm"
          >
            Continue to Review <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: FOURTH STEP / SECTION — REVIEW & CONFIRM REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep3ReviewAndConfirm = () => {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Review &amp; Confirm Registration
          </h4>
          <p className="text-slate-600 text-sm m-0 mt-1">
            Please verify your information before submitting to the federation.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
              <img
                src={faydaResult?.photoUrl || '/images/fayda_resident_photo.jpg'}
                alt="Portrait"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                ✓ Fayda Verified Identity
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1 mb-0">
                {faydaResult?.name}
              </h4>
              <div className="text-xs font-bold text-sky-700">
                Role: {(selectedRole || 'ATHLETE').replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-500">National ID (FIN)</span>
              <span className="font-mono font-black text-slate-900">{formatFin(faydaResult?.fin || '')}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-500">Fayda Access Number (FAN)</span>
              <span className="font-mono font-black text-emerald-700">{faydaResult?.fan}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-500">Account Email</span>
              <span className="font-black text-slate-900">{email}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-500">Mobile Phone</span>
              <span className="font-black text-slate-900">{phone}</span>
            </div>
            <div className="p-3 flex justify-between bg-emerald-50/50">
              <span className="font-bold text-emerald-800">Account Password</span>
              <span className="font-mono font-black text-emerald-700">•••••••• (Created &amp; Secured)</span>
            </div>

            {(selectedRole === 'ATHLETE' || !selectedRole) && (
              <>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Disciplines</span>
                  <span className="font-black text-slate-900">{primaryEvent.join(', ')}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Club</span>
                  <span className="font-black text-slate-900">{selectedClubId === 'NONE' ? 'Independent' : 'Registered Club'}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Ranking Tier</span>
                  <span className="font-black text-slate-900">{nationalRankingTier}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Personal Bests</span>
                  <span className="font-black text-slate-900">{personalBests.map(p => `${p.event} (${p.mark})`).join(' · ') || 'None'}</span>
                </div>
              </>
            )}

            {selectedRole === 'CLUB_PRESIDENT' && (
              <>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Club Name</span>
                  <span className="font-black text-slate-900">{clubName}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Mandate</span>
                  <span className="font-black text-slate-900">{charterAuthority}</span>
                </div>
              </>
            )}

            {selectedRole === 'COACH' && (
              <>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Certification</span>
                  <span className="font-black text-slate-900">{waCoachLevel}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">License #</span>
                  <span className="font-black text-slate-900">{coachLicenseNumber}</span>
                </div>
              </>
            )}

            {selectedRole === 'MEDICAL_HEAD' && (
              <>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Designation</span>
                  <span className="font-black text-slate-900">{medicalDesignation}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">MoH License #</span>
                  <span className="font-black text-slate-900">{mohLicenseNumber}</span>
                </div>
              </>
            )}

            {selectedRole === 'OFFICIAL' && (
              <>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">Officiating Role</span>
                  <span className="font-black text-slate-900">{officiatingRole}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold text-slate-500">WA Level</span>
                  <span className="font-black text-slate-900">{waOfficialLevel}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {submissionError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
          >
            Back
          </button>
          <button
            type="button"
            disabled={isRegistering}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm"
          >
            {isRegistering ? (
              <><RefreshCw size={18} className="animate-spin" /> Submitting Registration...</>
            ) : (
              <><CheckCircle2 size={18} /> Submit Registration &amp; Digitize Profile</>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN: LIGHT THEME WITH ICON ANIMATION
  // ─────────────────────────────────────────────────────────────────────────────
  const renderAlreadyCompletedScreen = () => (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
        <CheckCircle2 size={36} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Registration Already Completed
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6">
        Your registration has already been completed and recorded with the Ethiopian Athletics Federation. Registered members cannot submit duplicate registrations.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { method: 'FIN' } }));
            }
          }}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm cursor-pointer border-0 shadow-md shadow-blue-500/20"
        >
          Sign In to Portal
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderSuccessScreen = () => {
    if (!pendingRegistrationData) return null;
    const refNumber = serverRegistrationId || ('EAF-REG-2026-' + Math.floor(100000 + Math.random() * 900000));

    return (
      <div className="flex flex-col items-center text-center py-6 sm:py-8 max-w-xl mx-auto">
        {/* Animated Celebration Icon with Ping Ring */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg relative mb-5"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-25 animate-ping" />
          <CheckCircle2 size={42} className="text-emerald-600 relative z-10" />
        </motion.div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Registration Submitted Successfully
        </h3>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
          Your profile has been recorded with verified National ID credentials and forwarded to the Ethiopian Athletics Federation.
        </p>

        {/* Clean Light-Theme Tracking Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full text-left mb-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-500">Tracking Reference</span>
            <span className="text-sm font-black text-sky-700 font-mono">{refNumber}</span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={faydaResult?.photoUrl || '/images/fayda_resident_photo.jpg'}
              alt="Portrait"
              className="w-14 h-16 object-cover rounded-xl border border-slate-300 shadow-sm"
            />
            <div>
              <div className="text-base font-black text-slate-900">{faydaResult?.name}</div>
              <div className="text-xs font-bold text-sky-700">
                {(selectedRole || 'ATHLETE').replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                FIN: <strong className="font-mono">{formatFin(faydaResult?.fin || '')}</strong>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRegisterSuccess(pendingRegistrationData)}
          className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-sm cursor-pointer border-0"
        >
          Acknowledge &amp; Access Federation Portal
        </button>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // DEDICATED CLUB REGISTRATION FLOW (NO FAYDA REQUIRED)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeRegType === 'CLUB') {
    return (
      <ClubRegistrationForm
        onClose={onClose}
        onRegisterSuccess={(clubData: any) => {
          onRegisterSuccess({
            type: 'CLUB',
            payload: {
              club: clubData.payload.club,
              targetSubPage: clubData.payload.targetSubPage || 'REGISTER_MEMBER',
              session: clubData.payload.session,
            },
          });
        }}
        onSwitchToAthlete={() => setActiveRegType('ATHLETE')}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL PAGE VIEW (REPLACING MODAL & REMOVING GREEN/YELLOW/RED BORDER)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Page Header (No Tricolor Border!) */}
 

      {/* Main Full-Page Content Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 my-4 sm:my-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Top Registration Role Switcher */}
          {!isSubmittedPending && !isAlreadyCompleted && (
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveRegType('ATHLETE')}
                className="flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition bg-white text-blue-700 shadow-xs border border-slate-200 cursor-pointer"
              >
                <User size={16} />
                <span>🏃 Individual Athlete (Fayda National ID)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRegType('CLUB')}
                className="flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Building2 size={16} />
                <span>🏢 Athletics Club / Organization (No Fayda upfront)</span>
              </button>
            </div>
          )}

          {!isSubmittedPending && (
            <StepBar steps={steps} current={step} />
          )}

          {isSubmittedPending ? (
            renderSuccessScreen()
          ) : (
            <div>
              {step === 0 && renderStep0FaydaAuth()}
              {step === 1 && renderStep2ProfileDetails()}
              {step === 2 && renderStep3ReviewAndConfirm()}
            </div>
          )}
        </div>
      </main>

      {/* Citizen Profile ID Card Modal if triggered */}
      {showCitizenModal && faydaResult && (
        <FaydaVerifiedProfileModal
          isOpen={showCitizenModal}
          onClose={() => setShowCitizenModal(false)}
          identity={{
            nin: faydaResult.fin,
            fullName: faydaResult.name,
            fullNameAmharic: faydaResult.amharic,
            birthDate: faydaResult.dob,
            gender: faydaResult.gender,
            phoneNumber: faydaResult.phoneNumber || phone,
            email: faydaResult.email || email,
            address: faydaResult.address || faydaResult.region,
            picture: faydaResult.photoUrl,
            verificationToken: faydaVerificationToken || undefined,
            verifiedAt: faydaResult.verificationDate,
            ageTier: faydaResult.ageTier,
            hash: faydaResult.hash,
          }}
          onContinueRegistration={() => {
            setShowCitizenModal(false);
            setStep(1);
          }}
        />
      )}
    </div>
  );
}
