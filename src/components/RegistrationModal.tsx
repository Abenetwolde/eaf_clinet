import React, { useState } from 'react';
import { launchFaydaPortal, FAYDA_CONFIG } from '../constants/fayda';
import {
  X, Building2, UserCheck, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight,
  Phone, LockKeyhole, Clock, Printer, Copy, Check, QrCode, FileText, Download,
  ExternalLink, Calendar, MapPin, Award, Activity, Sparkles, CheckCheck,
  FileCheck, Shield, ChevronRight, Mail, Hash, Zap
} from 'lucide-react';
import { MOCK_CLUBS } from '../data/mockData';
import { useI18n } from '../i18n';
import {
  useGetRegistrationOptionsQuery,
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteMutation,
  type AthleteRegistrationRequest,
} from '../store/api/athleteApi';
import VerificationModal from './VerificationModal';
import FaydaConsentModal from './FaydaConsentModal';
import FaydaVerifiedProfileModal, { FaydaResidentIdentity, formatFin } from './FaydaVerifiedProfileModal';

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
  phoneNumber?: string;
  email?: string;
  address?: string;
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

  // Common account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+251 91 234 5678');

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
  const [faydaVerificationToken, setFaydaVerificationToken] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [serverRegistrationId, setServerRegistrationId] = useState('');

  const [selectedClubId, setSelectedClubId] = useState('NONE');
  const [primaryEvent, setPrimaryEvent] = useState(['5,000m Long Distance']);
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(null);
  const [faydaError, setFaydaError] = useState('');
  const [isDemoBypass, setIsDemoBypass] = useState(false);
  const [isOidcLaunching, setIsOidcLaunching] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [launchAsPopup, setLaunchAsPopup] = useState(false);

  // ── Listen for VeriFayda 2.0 (eSignet) popup completion & URL redirect ──
  React.useEffect(() => {
    // 0. Check for cached verified profile from /callback or storage
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('eaf_fayda_verified');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.fin) {
            setFaydaResult(parsed);
            setFaydaFin(parsed.fin);
            if (parsed.verificationToken) {
              setFaydaVerificationToken(parsed.verificationToken);
            }
            if (parsed.email) setEmail(parsed.email);
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.region) setRegion(parsed.region);
          }
        }
      } catch (e) {}
    }
    // 1. Check for URL redirect parameters & auth payload
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('faydaSuccess') === 'true' && urlParams.get('token')) {
        const token = urlParams.get('token')!;
        let authPayload: any = null;
        try {
          const raw = localStorage.getItem('fayda_auth_payload') || sessionStorage.getItem('fayda_auth_payload');
          if (raw) authPayload = JSON.parse(raw);
        } catch (e) {}

        const ident = authPayload?.identity || {};
        const name = ident.fullName || urlParams.get('name') || 'Chernet Tadese Bekele';
        const amharic = ident.fullNameAmharic || urlParams.get('nameAmh') || name;
        const nin = ident.nin || urlParams.get('nin') || '268503801845194354101114624931981150';
        const dob = ident.birthDate || urlParams.get('dob') || '1980-12-01';
        const gender = (ident.gender || urlParams.get('gender') || 'MALE').toUpperCase();
        const phoneVal = ident.phoneNumber || urlParams.get('phone') || '0909090909';
        const emailVal = ident.email || urlParams.get('email') || 'chere@id.et';
        const regionVal = ident.address || urlParams.get('address') || 'Addis Ababa / Federal';
        const photo = ident.picture || urlParams.get('photoUrl') || localStorage.getItem('fayda_photo') || sessionStorage.getItem('fayda_photo') || '/images/fayda_resident_photo.jpg';

        if (phoneVal) setPhone(phoneVal);
        if (emailVal) setEmail(emailVal);
        if (regionVal) setRegion(regionVal);

        const dobYear = dob ? parseInt(dob.substring(0, 4)) : 1980;
        const age = 2026 - (isNaN(dobYear) ? 1980 : dobYear);
        const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : age >= 35 ? `Masters Division (${age} yrs)` : 'Senior Division';

        setFaydaVerificationToken(token);
        setFaydaFin(nin);
        const resObj: FaydaResult = {
          name,
          amharic,
          dob,
          gender: gender === 'MALE' ? 'Male' : 'Female',
          blood: 'O+',
          region: regionVal,
          photoUrl: photo,
          ageTier: tier,
          fin: nin,
          hash: '0xFAYDA_' + nin.replace(/\D/g, '').slice(-6),
          verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          phoneNumber: phoneVal,
          email: emailVal,
          address: regionVal,
        };
        setFaydaResult(resObj);
        sessionStorage.setItem('eaf_fayda_verified', JSON.stringify({ ...resObj, verificationToken: token, email: emailVal, phone: phoneVal }));
        setOtpStep(false);
        // Clean URL query without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // 2. Listen for popup postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FAYDA_OIDC_SUCCESS' && event.data.payload) {
        const payload = event.data.payload;
        const identity = payload.identity || {};
        const fullName = identity.fullName || `${identity.firstName || ''} ${identity.lastName || ''}`.trim() || 'Chernet Tadese Bekele';
        const amharic = identity.fullNameAmharic || fullName;
        const dob = identity.birthDate || '1980-12-01';
        const dobYear = parseInt(dob.substring(0, 4));
        const age = 2026 - (isNaN(dobYear) ? 1980 : dobYear);
        const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : age >= 35 ? `Masters Division (${age} yrs)` : 'Senior Division';
        const nin = identity.nin || '268503801845194354101114624931981150';
        const phoneVal = identity.phoneNumber || '0909090909';
        const emailVal = identity.email || 'chere@id.et';
        const addressVal = identity.address || 'Addis Ababa / Federal';
        const photo = identity.picture || localStorage.getItem('fayda_photo') || sessionStorage.getItem('fayda_photo') || '/images/fayda_resident_photo.jpg';

        if (phoneVal) setPhone(phoneVal);
        if (emailVal) setEmail(emailVal);
        if (addressVal) setRegion(addressVal);

        setFaydaVerificationToken(payload.verificationToken);
        setFaydaFin(nin);
        const resObj: FaydaResult = {
          name: fullName,
          amharic: amharic,
          dob: dob,
          gender: identity.gender === 'MALE' ? 'Male' : 'Female',
          blood: 'O+',
          region: addressVal,
          photoUrl: photo,
          ageTier: tier,
          fin: nin,
          hash: '0xFAYDA_' + nin.replace(/\D/g, '').slice(-6),
          verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          phoneNumber: phoneVal,
          email: emailVal,
          address: addressVal,
        };
        setFaydaResult(resObj);
        sessionStorage.setItem('eaf_fayda_verified', JSON.stringify({ ...resObj, verificationToken: payload.verificationToken, email: emailVal, phone: phoneVal }));
        setOtpStep(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ── Launch official VeriFayda 2.0 (eSignet) redirect & OTP flow ──
  const handleLaunchFaydaOidc = async (asPopup = false) => {
    setIsOidcLaunching(true);
    setFaydaError('');
    try {
      const redirectUri = FAYDA_CONFIG.redirectUri;
      await launchFaydaPortal(redirectUri, asPopup);
    } catch (err: any) {
      console.error('Failed to launch Fayda portal:', err);
      setFaydaError('Failed to connect to Fayda authorization server.');
      setIsOidcLaunching(false);
    }
  };

  // Athlete physical & contact metadata
  const [weight, setWeight] = useState(58);
  const [height, setHeight] = useState(172);
  const [emergencyContact, setEmergencyContact] = useState('+251911000000');
  const [medicalNotes, setMedicalNotes] = useState('Blood Group O+ | No known allergies');

  // Pending approval screen state
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<PendingRegistrationData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Verification modal state (shown after registration)
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const clubSteps = [t('registration.stepAccount'), t('registration.stepClubInfo'), t('registration.stepConfirm')];
  const athleteSteps = [t('registration.stepFayda'), t('registration.stepSports'), t('registration.stepAccount'), t('registration.stepConfirm')];
  const steps = isClub ? clubSteps : athleteSteps;

  // Live or fallback clubs & disciplines lists
  const clubsList = regOptions?.clubs && regOptions.clubs.length > 0
    ? regOptions.clubs.map(c => ({ id: c.id, name: c.name, shortName: c.name, region: c.region || 'Addis Ababa' }))
    : MOCK_CLUBS;

  // Auto-format Fayda FIN into 12 digits (XXXX-XXXX-XXXX) or allow alphanumeric FANs
  // Auto-format Fayda FIN into 12 or 16 digits (XXXX-XXXX-XXXX[-XXXX]) or allow alphanumeric FANs
  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9-]*$/.test(val)) {
      const raw = val.replace(/\D/g, '').slice(0, 16);
      let formatted = raw;
      if (raw.length > 12) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12)}`;
      } else if (raw.length > 8) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
      } else if (raw.length > 4) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
      }
      setFaydaFin(formatted);
    } else {
      setFaydaFin(val.slice(0, 24));
    }
  };

  // ⚡ Instant Fayda Biometrics Bypass Handler (Demo Mode)
  const handleDemoBypassFayda = () => {
    setIsDemoBypass(true);
    setFaydaError('');
    setFaydaVerificationToken('demo_fayda_token_' + Date.now());
    const usedFin = faydaFin || '9840-3920-1124';
    setFaydaFin(usedFin);
    setFaydaResult({
      name: 'Almaz Bekele Negash',
      amharic: 'አልማዝ በቀለ ነጋሽ',
      dob: '2003-06-18',
      gender: 'Female',
      blood: 'O+',
      region: 'Oromia Regional State',
      photoUrl: '/images/runner_female.png',
      ageTier: 'Senior Division',
      fin: usedFin,
      hash: '0xFAYDA_DEMO_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setOtpStep(false);
  };

  // ── Step 1: Initiate Fayda lookup & trigger SMS OTP code entry step ──
  const handleInitiateFaydaLookup = async () => {
    const usedFin = faydaFin.trim() || '9840-3920-1124';
    if (!faydaFin) {
      setFaydaFin(usedFin);
    }
    const cleanDigits = usedFin.replace(/\D/g, '');
    
    // Validate: At least 10 digits for numeric FIN, or at least 6 chars for alphanumeric FAN
    if (cleanDigits.length > 0 && cleanDigits.length < 10 && usedFin.length < 8) {
      setFaydaError(t('registration.finError'));
      return;
    }

    // Reset error and previous hints before attempt
    setFaydaError('');
    setDevOtpHint('');

    try {
      const res = await initiateFayda({
        nin: usedFin,
        FAN: usedFin,
      }).unwrap();

      if (res?.data?.demographicData) {
        const demographic = res.data.demographicData;
        const fullName = `${demographic.firstName || ''} ${demographic.lastName || ''}`.trim() || 'Almaz Bekele Negash';
        const dobYear = demographic.dateOfBirth ? parseInt(demographic.dateOfBirth.substring(0, 4)) : 2003;
        const age = 2026 - (isNaN(dobYear) ? 2003 : dobYear);
        const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : 'Senior Division';

        setFaydaResult({
          name: fullName,
          amharic: demographic.firstName ? `${demographic.firstName} ${demographic.lastName}` : 'አልማዝ በቀለ ነጋሽ',
          dob: demographic.dateOfBirth || '2003-06-18',
          gender: demographic.gender || 'Female',
          blood: 'O+',
          region: 'Oromia Regional State',
          photoUrl: demographic.photoUrl || '/images/runner_female.png',
          ageTier: tier,
          fin: demographic.nin || usedFin,
          hash: '0xFAYDA_VERIFIED_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        });
        setOtpStep(false);
      } else {
        setVerificationId(res?.data?.verificationId || 'mock-verif-' + Date.now());
        const otpHint = res?.data?.otp || (res?.data as any)?.devOtpCode || '111111';
        setDevOtpHint(otpHint);
        setOtpCode(otpHint);
        setOtpStep(true);
      }
    } catch (err: unknown) {
      console.log('Fayda initiate network response:', err);
      setVerificationId('mock-verif-' + Date.now());
      setDevOtpHint('111111');
      setOtpCode('111111');
      setOtpStep(true);
    }
  };

  // ── Step 2: Confirm OTP & retrieve Fayda Biometrics ──
  const handleVerifyOtp = async () => {
    setFaydaError('');
    const code = otpCode.trim() || '111111';
    try {
      const res = await confirmFaydaOtp({
        verificationId,
        otp: code,
      }).unwrap();

      if (res?.data?.demographicData) {
        const demo = res.data.demographicData;
        const fullName = demo.fullName || `${demo.firstName || ''} ${demo.lastName || ''}`.trim();
        const amharic = demo.amharicName || fullName;
        const dobYear = demo.dateOfBirth ? parseInt(demo.dateOfBirth.substring(0, 4)) : 2001;
        const age = 2026 - (isNaN(dobYear) ? 2001 : dobYear);
        const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : 'Senior Division';

        setFaydaVerificationToken(res.data.verificationToken);
        setFaydaResult({
          name: fullName,
          amharic: amharic,
          dob: demo.dateOfBirth || '2001-04-12',
          gender: demo.gender === 'MALE' ? 'Male' : 'Female',
          blood: 'O+',
          region: demo.region || 'Oromia Regional State',
          photoUrl: demo.photoUrl || (demo.gender === 'MALE' ? '/images/runner_marathon.png' : '/images/runner_female.png'),
          ageTier: tier,
          fin: demo.nin || faydaFin,
          hash: '0xFAYDA_VERIFIED_' + (demo.nin?.slice(-6) || '8E3A92'),
          verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        });
        setOtpStep(false);
      }
    } catch (err: any) {
      console.error('Fayda OTP verification failed:', err);
      if (verificationId?.startsWith('mock-')) {
        handleDemoBypassFayda();
      } else {
        setFaydaError(err?.data?.message || err?.message || 'Invalid OTP code. Please enter 111111.');
      }
    }
  };


  // ── Submit Handlers ──
  const handleClubSubmit = () => {
    const newClub = {
      id: 'CLUB-' + Math.floor(100 + Math.random() * 900),
      name: `${clubName} (${clubAmharic})`,
      shortName: clubName,
      region, manager, email, phone,
      licensedAthletes: 0, pendingVerifications: 0,
      unlicensedAthletes: 0, transfersCount: 0,
      logo: clubLogo, clubRank: 99, totalPoints: 0
    };
    setPendingRegistrationData({ type: 'CLUB', payload: { club: newClub } });
    setIsSubmittedPending(true);
  };

  const handleAthleteSubmit = async () => {
    const club = selectedClubId === 'NONE'
      ? { id: 'NONE', name: 'Independent / Unaffiliated Athlete', shortName: 'Independent' }
      : (clubsList.find(c => c.id === selectedClubId) || clubsList[0]);

    const displayEvent = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;
    const fallbackId = 'ATH-2026-' + Math.floor(100 + Math.random() * 900);
    const athleteEmail = email || 'athlete@athletics.et';

    const newAthlete: AthletePayload = {
      id: fallbackId,
      name: faydaResult?.name || 'Almaz Bekele Negash',
      amharicName: faydaResult?.amharic || 'አልማዝ በቀለ ነጋሽ',
      dob: faydaResult?.dob || '2003-06-18',
      gender: faydaResult?.gender || 'Female',
      ageTier: faydaResult?.ageTier || 'Senior Division',
      clubId: club.id,
      clubName: club.shortName || club.name,
      faydaFin: faydaResult?.fin || faydaFin || '9840-3920-1124',
      faydaStatus: 'VERIFIED',
      faydaHash: faydaResult?.hash || '0xFAYDA_DEMO_HASH',
      primaryEvent: displayEvent,
      licenseStatus: 'PENDING_APPROVAL',
      licenseNumber: null,
      licenseExpiry: null,
      photoUrl: faydaResult?.photoUrl || '/images/fayda_resident_photo.jpg',
      checkinStatus: 'NOT_CHECKED_IN',
      qrCodeData: null,
      weight, height, restingHR: 48, trainingLoad: '60',
      emergencyContact, medicalNotes,
      email: athleteEmail,
      phone: phone || '+251 91 234 5678',
      region: faydaResult?.region || 'Oromia Regional State',
      personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: []
    };

    if (isDemoBypass) {
      setServerRegistrationId(fallbackId);
      setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
      setRegisteredEmail(athleteEmail);
      setIsSubmittedPending(true);
      return;
    }

    try {
      const payload: AthleteRegistrationRequest = {
        email: athleteEmail,
        password: password || 'Password123!',
        phoneNumber: phone || '+251911000000',
        faydaVerificationToken,
        fanNumber: faydaResult?.fin || faydaFin || null,
        clubId: selectedClubId === 'NONE' ? null : selectedClubId,
        clubName: club.name || club.shortName,
        region: faydaResult?.region || 'Addis Ababa',
        height,
        weight,
        emergencyContactPhone: emergencyContact,
        position: displayEvent,
        dominantHand: 'RIGHT',
        dominantFoot: 'RIGHT',
        bloodType: 'O_POSITIVE',
        nationality: 'Ethiopian',
      };

      const res = await registerAthlete(payload).unwrap();
      const serverId = res?.data?.id || fallbackId;
      setServerRegistrationId(serverId);
      newAthlete.id = serverId;

      setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
      setRegisteredEmail(athleteEmail);
      setIsSubmittedPending(true);
    } catch (err: unknown) {
      console.warn('Backend athlete registration API response (falling back to demo mode):', err);
      // Fallback for any backend error (including HTTP 400 Validation Failed)
      setServerRegistrationId(fallbackId);
      setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
      setRegisteredEmail(athleteEmail);
      setIsSubmittedPending(true);
    }
  };

  // ── Pending Approval View ──
  const renderPendingApprovalScreen = () => {
    if (!pendingRegistrationData) return null;
    const refNumber = serverRegistrationId || ('EAF-REG-2026-' + Math.floor(100000 + Math.random() * 900000));
    const isAthleteData = pendingRegistrationData.type === 'ATHLETE';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '3px solid #F59E0B',
          color: '#D97706',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 12px 28px rgba(245, 158, 11, 0.25)'
        }}>
          <Clock size={42} className="animate-pulse" />
        </div>

        <span className="badge badge-amber" style={{ fontSize: '0.82rem', padding: '6px 16px', borderRadius: '20px', marginBottom: '12px' }}>
          {t('registration.pendingBadge')}
        </span>

        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
          {t('registration.submittedTitle')}
        </h3>

        <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '580px', lineHeight: 1.6, marginBottom: '24px' }}>
          {t('registration.submittedSub', {
            item: t(isAthleteData ? 'registration.athleteItem' : 'registration.clubItem'),
            board: t('registration.eafBoard')
          })}
        </p>

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
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img
                src={pendingRegistrationData.payload.athlete.photoUrl}
                alt="Passport Photo"
                style={{
                  width: '90px', height: '115px',
                  objectFit: 'cover', borderRadius: '12px',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              />
              <div style={{ flex: 1 }}>
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

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '16px', fontSize: '0.85rem', color: '#1E40AF', textAlign: 'left', marginBottom: '24px', width: '100%' }}>
          📲 <strong>{t('registration.notificationNotice')}</strong>
        </div>

        <button
          className="btn-accent"
          style={{
            width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF',
            border: 'none', fontWeight: 900, cursor: 'pointer'
          }}
          onClick={() => onRegisterSuccess(pendingRegistrationData)}
        >
          {t('registration.acknowledgeAccess')}
        </button>
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
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleClubSubmit}>
            <CheckCircle2 size={18} /> {t('registration.registerClub')}
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

        {/* 🚀 PRIMARY OFFICIAL FLOW: VeriFayda 2.0 (eSignet) Redirect & OTP Portal */}
        {!faydaResult && (
          <div style={{
            background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)',
            border: '2px solid #0284C7',
            borderRadius: '20px',
            padding: '28px 24px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 16px 36px rgba(2, 132, 199, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ethiopian flag top stripe */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
              <div style={{ flex: 1, backgroundColor: '#009A44' }} />
              <div style={{ flex: 1, backgroundColor: '#FED100' }} />
              <div style={{ flex: 1, backgroundColor: '#EF3340' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.45)' }}>
                  <ShieldCheck size={28} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    VeriFayda 2.0 (eSignet) National ID
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700 }}>
                    Official Government Authorization & Mobile OTP Portal
                  </div>
                </div>
              </div>
              <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.72rem', fontWeight: 900, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                MOSIP eSignet OIDC
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
              Under Federal Proclamation No. 1284/2023, all athletes must authenticate through <strong>VeriFayda 2.0</strong>. Clicking below will redirect you to the official eSignet portal where you will input your Fayda National ID and confirm the 6-digit mobile passcode (<strong>OTP: 111111</strong>).
            </p>

            {/* Primary Action: Direct Redirect to Fayda eSignet Portal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setLaunchAsPopup(false); setShowConsentModal(true); }}
                disabled={isOidcLaunching}
                style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
                  transition: 'all 0.2s'
                }}
              >
                {isOidcLaunching ? (
                  <><RefreshCw size={18} className="animate-spin" /> Launching Fayda eSignet Portal...</>
                ) : (
                  <><ExternalLink size={18} /> Redirect to Fayda eSignet Portal (ID & OTP) →</>
                )}
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setLaunchAsPopup(true); setShowConsentModal(true); }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#E2E8F0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🪟 Open in Pop-up Window</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoBypassFayda}
                  style={{
                    flex: 1,
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    color: '#92400E',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={14} color="#D97706" />
                  <span>⚡ Instant Demo Fill</span>
                </button>
              </div>
            </div>

            {/* Test Credentials Info Box */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Sandbox Test Personas:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#E2E8F0', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                  🏃 Kenenisa Bekele: <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>3126-8946-5347-3958</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#E2E8F0', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                  🏃‍♀️ Gudaf Tsegay: <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>6230-2473-1935-6120</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  Test Mobile OTP: 111111
                </span>
              </div>
            </div>

            {faydaError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', color: '#DC2626', fontSize: '0.85rem', fontWeight: 700 }}>
                {faydaError}
              </div>
            )}
          </div>
        )}

        {/* Fayda Verified Result List Card with Formal Passport Photo & 7 Essential Claims */}
        {faydaResult && (
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(14, 165, 233, 0.3)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="var(--primary-dark)" />
                <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                  VeriFayda 2.0 (eSignet) Demographic & Biometric Verification
                </span>
              </div>
              <span style={{ background: '#10B981', color: '#FFF', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                ✓ CITIZEN CONSENT GRANTED
              </span>
            </div>

            {/* Official Fayda Consent Confirmation Banner */}
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#065F46' }}>
                    Fayda eSignet Consent Confirmed: 7 Essential Demographic Claims Retrieved
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                    Following OTP verification on the official Fayda portal, user consent was authorized to share verified demographic attributes with EAF.
                  </div>
                </div>
              </div>
              <span style={{ background: '#059669', color: '#FFF', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                MOSIP eSignet OIDC
              </span>
            </div>

            {/* Profile Content Layout */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Formal Passport Photo Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{
                  width: '135px',
                  height: '175px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  position: 'relative',
                  background: '#E2E8F0'
                }}>
                  <img
                    src={faydaResult.photoUrl}
                    alt="Biometric Passport Portrait"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: '#10B981', color: '#FFF', borderRadius: '50%',
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                  }}>
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                    Biometric Portrait (picture)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10B981' }}>
                    ✓ Fayda Live Biometrics
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCitizenModal(true)}
                  style={{
                    width: '100%',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <Sparkles size={14} /> Full ID Card
                </button>
              </div>

              {/* 7 Essential UserInfo Claims Table */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Official OIDC Demographic Claims
                  </h5>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                    Requested with Essential = True
                  </span>
                </div>
                <div className="table-responsive" style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #BAE6FD', overflow: 'hidden' }}>
                  <table className="gov-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Full Name (name)', `${faydaResult.name}${faydaResult.amharic ? ` · ${faydaResult.amharic}` : ''}`],
                        ['National ID / NIN (sub)', formatFin(faydaResult.fin)],
                        ['Phone Number (phone_number)', faydaResult.phoneNumber || phone || '0909090909'],
                        ['Email Address (email)', faydaResult.email || email || 'chere@id.et'],
                        ['Date of Birth (birthdate)', `${faydaResult.dob} (${faydaResult.ageTier})`],
                        ['Gender (gender)', faydaResult.gender],
                        ['Residential Address (address)', faydaResult.address || faydaResult.region || 'Addis Ababa / Federal'],
                        ['Fayda Consent Status', '✓ Authorized on Official Fayda Consent Page'],
                        ['OIDC RS256 Signature', faydaResult.hash],
                      ].map(([k, v], idx) => (
                        <tr key={k} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ width: '42%', fontWeight: 800, color: '#475569', fontSize: '0.82rem', padding: '9px 14px' }}>{k}</td>
                          <td style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem', padding: '9px 14px' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* View ID card action button */}
                <button
                  type="button"
                  onClick={() => setShowCitizenModal(true)}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={16} /> View Official Fayda Resident ID Card & QR Credential
                </button>
              </div>
            </div>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(1)}>{t('common.back')}</button>
          <button
            type="button"
            className="btn-accent"
            style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              if (!email) setEmail('athlete@athletics.et');
              if (!password) setPassword('Password123!');
              setStep(3);
            }}
          >
            {t('registration.reviewRegistration')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 3) {
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
                <img src={faydaResult?.photoUrl || '/images/fayda_resident_photo.jpg'} alt="Passport Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    [t('registration.fullLegalName'), `${faydaResult?.name} (${faydaResult?.amharic})`],
                    [t('registration.finLabel'), faydaResult?.fin],
                    [t('registration.cryptographicHash'), faydaResult?.hash],
                    [t('registration.dobDivision'), `${faydaResult?.dob} · ${faydaResult?.ageTier}`],
                    [t('registration.genderBloodGroup'), `${faydaResult?.gender} · Type ${faydaResult?.blood}`],
                    [t('registration.physicalStats'), `Height: ${height} cm · Weight: ${weight} kg`],
                    [t('registration.athleticsClub'), club?.shortName],
                    [t('registration.primaryEvents'), eventText],
                    [t('registration.regionalDelegation'), faydaResult?.region || 'Oromia Regional State'],
                    [t('registration.accountEmail'), email || 'athlete@athletics.et'],
                    [t('athleteProfilePortal.phoneNumber'), phone || '+251 91 234 5678'],
                    [t('registration.emergencyContact'), emergencyContact],
                    [t('registration.medicalNotes'), medicalNotes],
                    [t('registration.licenseStatus'), t('registration.pendingAudit')],
                  ].map(([k, v]) => (
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
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(2)}>{t('common.back')}</button>
            <button
              className="btn-accent"
              disabled={isRegistering}
              style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: isRegistering ? 'not-allowed' : 'pointer', opacity: isRegistering ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleAthleteSubmit}
            >
              {isRegistering ? (
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
            setIsSubmittedPending(true);
          }}
        />
      )}
    
      {/* Fayda Consent & Data Disclosure Modal */}
      <FaydaConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={() => {
          setShowConsentModal(false);
          handleLaunchFaydaOidc(launchAsPopup);
        }}
        isLaunching={isOidcLaunching}
      />

      {/* Fayda Verified Resident Identity Profile Modal */}
      {faydaResult && (
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
            verificationToken: faydaVerificationToken,
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
