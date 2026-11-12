import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Trophy, Calendar, MapPin, Phone, Mail, Award, Users, Filter,
  CheckCircle2, User, UserCheck, UserPlus, Building, Clock, ChevronRight, ShieldCheck, X, Download, Printer, Check,
  Lock, QrCode, Camera,
  AlertTriangle,
  Flame, Wind, Sparkles, Medal, Activity, Layers, Search, RefreshCw,
  ListOrdered, ArrowLeft, Eye, Zap
} from 'lucide-react';
import { useI18n } from '../i18n';
import { getProfilePhotoUrl } from '../utils/profilePhoto';
import { getEventRegistrationStatus, isEventRegistrationClosed } from '../utils/eventRegistration';
import { STORAGE_KEYS } from '../store/persistence';
import { useGetPublishedResultsQuery } from '../store/api/athleteApi';

// Helper to determine banner image based on meet ID
const getBannerUrl = (meet: any) => {
  if (!meet) return '/images/banner_grand_prix.png';
  if (typeof meet === 'string') {
    if (meet.startsWith('http') || meet.startsWith('/images/')) return meet;
    return '/images/banner_grand_prix.png';
  }
  if (meet.bannerUrl) return meet.bannerUrl;
  if (meet.img) return meet.img;
  return '/images/banner_grand_prix.png';
};

// Realistic High-Density SVG 2D QR Code Matrix
const RealisticQRCode = ({ size = 150 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '8px', background: '#FFFFFF', padding: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
    <rect width="100" height="100" fill="#FFFFFF" />

    {/* Corner Finder Pattern - Top Left */}
    <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
    <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
    <rect x="13" y="13" width="10" height="10" rx="1.5" fill="var(--primary)" />

    {/* Corner Finder Pattern - Top Right */}
    <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
    <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
    <rect x="77" y="13" width="10" height="10" rx="1.5" fill="var(--primary)" />

    {/* Corner Finder Pattern - Bottom Left */}
    <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
    <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
    <rect x="13" y="77" width="10" height="10" rx="1.5" fill="var(--primary)" />

    {/* Alignment Pattern Bottom Right */}
    <rect x="73" y="73" width="14" height="14" rx="2" fill="#0F172A" />
    <rect x="76" y="76" width="8" height="8" rx="1" fill="#FFFFFF" />
    <rect x="78" y="78" width="4" height="4" fill="var(--primary)" />

    {/* Timing & Matrix Pixels */}
    <rect x="36" y="8" width="5" height="5" fill="#0F172A" />
    <rect x="44" y="8" width="5" height="5" fill="#0F172A" />
    <rect x="52" y="8" width="5" height="5" fill="#0F172A" />
    <rect x="60" y="8" width="5" height="5" fill="#0F172A" />

    <rect x="36" y="16" width="5" height="5" fill="var(--primary)" />
    <rect x="48" y="16" width="5" height="5" fill="#0F172A" />
    <rect x="56" y="16" width="5" height="5" fill="#0F172A" />

    <rect x="36" y="24" width="5" height="5" fill="#0F172A" />
    <rect x="44" y="24" width="5" height="5" fill="var(--primary)" />
    <rect x="52" y="24" width="5" height="5" fill="#0F172A" />
    <rect x="60" y="24" width="5" height="5" fill="var(--primary)" />

    <rect x="8" y="36" width="5" height="5" fill="#0F172A" />
    <rect x="16" y="36" width="5" height="5" fill="var(--primary)" />
    <rect x="24" y="36" width="5" height="5" fill="#0F172A" />
    <rect x="36" y="36" width="5" height="5" fill="#0F172A" />
    <rect x="44" y="36" width="5" height="5" fill="var(--primary)" />
    <rect x="56" y="36" width="5" height="5" fill="#0F172A" />
    <rect x="68" y="36" width="5" height="5" fill="#0F172A" />
    <rect x="76" y="36" width="5" height="5" fill="var(--primary)" />
    <rect x="84" y="36" width="5" height="5" fill="#0F172A" />

    <rect x="8" y="44" width="5" height="5" fill="var(--primary)" />
    <rect x="20" y="44" width="5" height="5" fill="#0F172A" />
    <rect x="28" y="44" width="5" height="5" fill="#0F172A" />
    <rect x="40" y="44" width="5" height="5" fill="#0F172A" />
    <rect x="60" y="44" width="5" height="5" fill="var(--primary)" />
    <rect x="72" y="44" width="5" height="5" fill="#0F172A" />
    <rect x="88" y="44" width="5" height="5" fill="#0F172A" />

    <rect x="8" y="52" width="5" height="5" fill="#0F172A" />
    <rect x="16" y="52" width="5" height="5" fill="#0F172A" />
    <rect x="24" y="52" width="5" height="5" fill="var(--primary)" />
    <rect x="36" y="52" width="5" height="5" fill="#0F172A" />
    <rect x="48" y="52" width="5" height="5" fill="var(--primary)" />
    <rect x="56" y="52" width="5" height="5" fill="#0F172A" />
    <rect x="68" y="52" width="5" height="5" fill="#0F172A" />
    <rect x="80" y="52" width="5" height="5" fill="var(--primary)" />

    <rect x="8" y="60" width="5" height="5" fill="var(--primary)" />
    <rect x="20" y="60" width="5" height="5" fill="#0F172A" />
    <rect x="28" y="60" width="5" height="5" fill="var(--primary)" />
    <rect x="44" y="60" width="5" height="5" fill="#0F172A" />
    <rect x="52" y="60" width="5" height="5" fill="#0F172A" />
    <rect x="64" y="60" width="5" height="5" fill="var(--primary)" />
    <rect x="76" y="60" width="5" height="5" fill="#0F172A" />
    <rect x="84" y="60" width="5" height="5" fill="#0F172A" />

    <rect x="36" y="68" width="5" height="5" fill="#0F172A" />
    <rect x="44" y="68" width="5" height="5" fill="var(--primary)" />
    <rect x="56" y="68" width="5" height="5" fill="#0F172A" />
    <rect x="64" y="68" width="5" height="5" fill="#0F172A" />

    <rect x="36" y="76" width="5" height="5" fill="var(--primary)" />
    <rect x="48" y="76" width="5" height="5" fill="#0F172A" />
    <rect x="56" y="76" width="5" height="5" fill="var(--primary)" />

    <rect x="36" y="84" width="5" height="5" fill="#0F172A" />
    <rect x="44" y="84" width="5" height="5" fill="#0F172A" />
    <rect x="52" y="84" width="5" height="5" fill="var(--primary)" />
    <rect x="60" y="84" width="5" height="5" fill="#0F172A" />
    <rect x="68" y="84" width="5" height="5" fill="var(--primary)" />

    {/* Center EAF Emblem circle */}
    <circle cx="50" cy="50" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="6" fill="var(--primary)" />
  </svg>
);

function getStartListRoundDetails(rawRound: string | undefined, heatNum?: number | string, rawStage?: string) {
  const r = (rawRound || '').toUpperCase().trim();
  const st = (rawStage || '').toUpperCase().trim();
  const h = Number(heatNum) || 1;

  // 1. CHAMPIONSHIP FINAL (Culmination / most recent round)
  if (
    r === 'FINAL' ||
    r === 'FN' ||
    r === 'FINALS' ||
    st === 'FINAL' ||
    (r.includes('FINAL') && !r.includes('SEMI') && !r.includes('QUARTER')) ||
    (st.includes('FINAL') && !st.includes('SEMI') && !st.includes('QUARTER'))
  ) {
    return {
      roundKey: 'FINAL',
      roundLabel: 'Championship Final',
      stageType: 'FINAL' as const,
      stageOrder: 4,
      badgeText: 'Final 🏆',
      badgeColor: '#D97706',
      sortWeight: 40,
      heatNum: 1,
    };
  }

  // 2. SEMI-FINALS (SF_1, SF_2, SEMI-FINAL 1, SEMIFINALS, etc.)
  if (r.startsWith('SF') || r.includes('SEMI') || st.startsWith('SF') || st.includes('SEMI')) {
    const heatMatch = r.match(/(?:SEMI|SF|HEAT|ROUND)[_\s-]*(\d+)/i) || r.match(/\d+/) || st.match(/\d+/);
    const num = heatMatch ? parseInt(heatMatch[1] || heatMatch[0], 10) : h;
    return {
      roundKey: `SF_${num}`,
      roundLabel: `Semi-Final ${num}`,
      stageType: 'SEMIFINAL' as const,
      stageOrder: 3,
      badgeText: `Semi-Final ${num}`,
      badgeColor: '#2563EB',
      sortWeight: 30 + num,
      heatNum: num,
    };
  }

  // 3. QUARTER-FINALS / ROUND 2 (QF_1, QF_2, ROUND 2, etc.)
  if (
    r.startsWith('QF') ||
    r.includes('QUARTER') ||
    r.includes('ROUND_2') ||
    r.includes('ROUND 2') ||
    r === 'R2' ||
    st.startsWith('QF') ||
    st.includes('QUARTER') ||
    st.includes('ROUND 2')
  ) {
    const qfMatch = r.match(/(?:QUARTER|QF|HEAT|ROUND)[_\s-]*(\d+)/i) || r.match(/\d+/) || st.match(/\d+/);
    const num = qfMatch ? parseInt(qfMatch[1] || qfMatch[0], 10) : h;
    return {
      roundKey: `QF_${num}`,
      roundLabel: `Quarter-Final ${num}`,
      stageType: 'QUARTERFINAL' as const,
      stageOrder: 2.5,
      badgeText: `Quarter-Final ${num}`,
      badgeColor: '#7C3AED',
      sortWeight: 20 + num,
      heatNum: num,
    };
  }

  // 4. PRELIMINARY HEATS (HEAT_1, HEAT 2, HEATS, ROUND 1, etc.)
  if (
    r.startsWith('HEAT') ||
    r === 'HEATS' ||
    r.includes('ROUND_1') ||
    r.includes('ROUND 1') ||
    r === 'R1' ||
    st.startsWith('HEAT') ||
    st === 'HEATS' ||
    st.includes('ROUND 1')
  ) {
    const heatMatch = r.match(/HEAT[_\s-]*(\d+)/i) || (!r.includes('ROUND') ? r.match(/\d+/) : null);
    const num = heatMatch ? parseInt(heatMatch[1] || heatMatch[0], 10) : h;
    return {
      roundKey: `HEAT_${num}`,
      roundLabel: `Round 1 - Heat ${num}`,
      stageType: 'HEAT' as const,
      stageOrder: 2,
      badgeText: `Heat ${num}`,
      badgeColor: '#EA580C',
      sortWeight: 10 + num,
      heatNum: num,
    };
  }

  // 5. PRELIMINARY ROUND
  if (r.includes('PRELIM') || st.includes('PRELIM')) {
    const pMatch = r.match(/\d+/);
    const num = pMatch ? parseInt(pMatch[0], 10) : h;
    return {
      roundKey: `PRELIM_${num}`,
      roundLabel: `Preliminary Round - Heat ${num}`,
      stageType: 'ROUND' as const,
      stageOrder: 1.8,
      badgeText: `Prelim ${num}`,
      badgeColor: '#0284C7',
      sortWeight: 8 + num,
      heatNum: num,
    };
  }

  // 6. QUALIFICATION FLIGHTS / GROUPS
  if (r.startsWith('FLIGHT') || r.includes('QUAL') || st.includes('QUAL')) {
    const grp = r.replace(/FLIGHT[_\s]/, '').replace(/QUAL[_\s]/, '').trim() || String(h);
    return {
      roundKey: `FLIGHT_${grp}`,
      roundLabel: `Qualification Group ${grp}`,
      stageType: 'ROUND' as const,
      stageOrder: 1.5,
      badgeText: `Group ${grp}`,
      badgeColor: '#0D9488',
      sortWeight: 5,
      heatNum: h,
    };
  }

  // 7. DEFAULT OTHER ROUNDS
  const safeStr = r || st || 'FINAL';
  return {
    roundKey: safeStr,
    roundLabel: safeStr.replace(/_/g, ' '),
    stageType: 'ROUND' as const,
    stageOrder: 1.0,
    badgeText: safeStr.replace(/_/g, ' '),
    badgeColor: '#475569',
    sortWeight: 15,
    heatNum: h,
  };
}

/**
 * Organizes rounds with the most recent / highest tournament stage at the top (Final -> Semi-Finals -> Heats)
 */
function compareRoundsRecentFirst(a: any, b: any) {
  // 1. Stage hierarchy: culminating / highest tournament stage first (Final [4] -> Semi-Final [3] -> Quarter-Final [2.5] -> Heat [2] -> Prelim [1.8] -> Group [1.5])
  const orderA = Number(a.stageOrder ?? (a.stageType === 'FINAL' ? 4 : a.stageType === 'SEMIFINAL' ? 3 : a.stageType === 'HEAT' ? 2 : 1));
  const orderB = Number(b.stageOrder ?? (b.stageType === 'FINAL' ? 4 : b.stageType === 'SEMIFINAL' ? 3 : b.stageType === 'HEAT' ? 2 : 1));

  if (orderA !== orderB) {
    return orderB - orderA; // Highest stage (Final) at the top!
  }

  // 2. If scheduledTime or publishedAt exist and differ, latest scheduled/published appears first
  const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
  const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0);
  if (timeA > 0 && timeB > 0 && timeA !== timeB) {
    return timeB - timeA;
  }

  // 3. Within the same stage and session, order by heat/group number ascending (Heat 1, Heat 2, Heat 3...)
  return (a.heatNum || 1) - (b.heatNum || 1);
}

interface CompetitionDetailProps {
  meet: any;
  meetId?: string;
  onBack: () => void;
  onRegister: (role: 'CLUB' | 'ATHLETE') => void;
  currentRole?: 'LANDING' | 'CLUB' | 'ATHLETE';
  currentAthlete?: any;
  onLoginSuccess?: (role: string, data: any) => void;
}

export default function CompetitionDetail({
  meet: initialMeet,
  meetId,
  onBack,
  onRegister,
  currentRole = 'LANDING',
  currentAthlete,
  onLoginSuccess
}: CompetitionDetailProps) {
  const [liveEventDetail, setLiveEventDetail] = useState<any>(null);
  const [publicHubData, setPublicHubData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const effectiveId = (initialMeet as any)?.id || meetId;

  useEffect(() => {
    if (!effectiveId) return;
    let isMounted = true;
    setIsDetailLoading(true);

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('eaf_accessToken') || localStorage.getItem('token') || localStorage.getItem('eaf_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = "Bearer " + token;

        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';

        // 1. Fetch event detail
        const endpoints = [`${apiBase}/events/${effectiveId}/detail`];
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { headers });
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                if (isMounted) setLiveEventDetail(json.data);
                break;
              }
            }
          } catch {}
        }

        // 2. Fetch public competition hub (start lists, official results, medals, announcements)
        try {
          const hubRes = await fetch(`${apiBase}/events/${effectiveId}/public-hub`, { headers });
          if (hubRes.ok) {
            const hubJson = await hubRes.json();
            if (hubJson.success && hubJson.data && isMounted) {
              setPublicHubData(hubJson.data);
            }
          }
        } catch (hubErr) {
          console.warn('Public competition hub fetch notice:', hubErr);
        }
      } catch (err) {
        console.warn('Dynamic fetch competition detail notice:', err);
      } finally {
        if (isMounted) setIsDetailLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [effectiveId]);

  const meet = useMemo(() => {
    if (!liveEventDetail) return initialMeet;
    const scheduleDate = liveEventDetail.schedule?.[0]?.date || liveEventDetail.registrationDeadline?.slice(0, 10) || initialMeet?.date;
    const parsedDate = scheduleDate ? new Date(scheduleDate) : null;
    const dateStr = parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : (initialMeet?.dateString || '');

    return {
      ...initialMeet,
      ...liveEventDetail,
      title: liveEventDetail.title || initialMeet?.title,
      amharic: liveEventDetail.title || initialMeet?.amharic,
      venue: liveEventDetail.venue || initialMeet?.venue,
      date: scheduleDate || initialMeet?.date,
      dateString: dateStr,
      disciplines: Array.isArray(liveEventDetail.disciplines) ? liveEventDetail.disciplines : (initialMeet?.disciplines || []),
      description: liveEventDetail.description || initialMeet?.description,
      rules: liveEventDetail.rules || initialMeet?.rules,
      bannerUrl: liveEventDetail.bannerUrl || initialMeet?.bannerUrl || initialMeet?.img || '/images/banner_grand_prix.png',
      img: liveEventDetail.bannerUrl || initialMeet?.bannerUrl || initialMeet?.img || '/images/banner_grand_prix.png',
      status: getEventRegistrationStatus(liveEventDetail),
      organizerName: liveEventDetail.organizerName || initialMeet?.organizerName || '',
      organizerEmail: liveEventDetail.organizerEmail || initialMeet?.organizerEmail || '',
    };
  }, [initialMeet, liveEventDetail]);
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('about');
  // Results & Start List Filters
  const [resultEventFilter, setResultEventFilter] = useState<string>('ALL');
  const [resultClubFilter, setResultClubFilter] = useState<string>('ALL');
  const [resultAgeFilter, setResultAgeFilter] = useState<string>('ALL');
  const [resultGenderFilter, setResultGenderFilter] = useState<string>('ALL');
  const [resultRoundFilter, setResultRoundFilter] = useState<string>('ALL');
  const [resultSearchQuery, setResultSearchQuery] = useState<string>('');
  const [selectedDisciplineKey, setSelectedDisciplineKey] = useState<string>('ALL');
  const [selectedRoundStage, setSelectedRoundStage] = useState<string>('ALL');

  const [starterEventFilter, setStarterEventFilter] = useState<string>('ALL');
  const [starterGenderFilter, setStarterGenderFilter] = useState<string>('ALL');
  const [starterSearchQuery, setStarterSearchQuery] = useState<string>('');
  const [selectedStarterDisciplineKey, setSelectedStarterDisciplineKey] = useState<string | null>(null);
  const [selectedStarterRoundKey, setSelectedStarterRoundKey] = useState<string>('ALL');

  // Individual Meet Registration Modal State
  const [showIndividualModal, setShowIndividualModal] = useState<boolean>(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [registrationPass, setRegistrationPass] = useState<any>(null);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);

  // Auth modal state for competition sign in / register
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('athlete@example.com');
  const [authPassword, setAuthPassword] = useState<string>('athlete123');
  const [authError, setAuthError] = useState<string>('');

  // QR Code Scanner Modal State
  const [showQrScannerModal, setShowQrScannerModal] = useState<boolean>(false);
  const [scannedPassResult, setScannedPassResult] = useState<any>(null);
  const [qrScanError, setQrScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!showQrScannerModal || scannedPassResult) return;
    let active = true;
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scan = async () => {
      try {
        if (!('BarcodeDetector' in window)) {
          setQrScanError('QR scanning is not supported by this browser. Use a recent Chrome or Edge browser.');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) { stream.getTracks().forEach(track => track.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const Detector = (window as any).BarcodeDetector;
        const detector = new Detector({ formats: ['qr_code'] });
        const detect = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              active = false;
              const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
              const token = localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem('token') || localStorage.getItem('eaf_token');
              const response = await fetch(`${apiBase}/events/${meet.id}/check-ins/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ token: codes[0].rawValue }),
              });
              const payload = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(payload?.message || 'Could not validate this QR code.');
              setScannedPassResult(payload?.data);
              return;
            }
          } catch (err: any) {
            if (err?.name !== 'NotFoundException') setQrScanError(err?.message || 'Could not read this QR code.');
          }
          if (active) timer = setTimeout(detect, 250);
        };
        detect();
      } catch (err: any) {
        setQrScanError(err?.name === 'NotAllowedError' ? 'Allow camera access to scan a competition pass.' : err?.message || 'Camera could not be started.');
      }
    };
    setQrScanError('');
    scan();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [showQrScannerModal, scannedPassResult, meet.id]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter email and password');
      return;
    }
    setAuthError('');
    setShowAuthModal(false);

    const loggedInAthlete = currentAthlete;

    if (onLoginSuccess) {
      onLoginSuccess('ATHLETE', { athlete: loggedInAthlete });
    }

    if (meet.status === 'REGISTRATION_OPEN' || meet.status === 'UPCOMING' || String(meet.status).toUpperCase() === 'PUBLISHED') {
      setShowIndividualModal(true);
    }
  };

  // Use only Fayda identity and athlete details actually present in the authenticated session.
  const realAthleteData = useMemo(() => {
    let savedCitizen: any = null;
    try {
      const raw = localStorage.getItem('eaf_fayda_verified') || sessionStorage.getItem('eaf_fayda_verified');
      if (raw) savedCitizen = JSON.parse(raw);
    } catch {}
    return {
      fullName: currentAthlete?.name || savedCitizen?.name || savedCitizen?.fullName || 'Not provided',
      amharicName: currentAthlete?.amharicName || savedCitizen?.amharic || savedCitizen?.fullNameAmharic || '',
      faydaFin: currentAthlete?.faydaFin || savedCitizen?.fin || savedCitizen?.nin || '',
      dob: currentAthlete?.dob || savedCitizen?.dob || savedCitizen?.birthDate || '',
      gender: currentAthlete?.gender || savedCitizen?.gender || '',
      region: currentAthlete?.region || savedCitizen?.region || '',
      subcity: savedCitizen?.subcity || '',
      houseNo: '',
      club: currentAthlete?.clubName || currentAthlete?.club || '',
      primaryEvent: currentAthlete?.primaryEvent || '',
      photoUrl: getProfilePhotoUrl({
        photoUrl: currentAthlete?.photoUrl || savedCitizen?.photoUrl || savedCitizen?.photo,
        picture: currentAthlete?.user?.picture || savedCitizen?.picture,
        faydaFin: currentAthlete?.faydaFin || currentAthlete?.user?.faydaIdentity?.nin || savedCitizen?.fin || savedCitizen?.nin,
      }) || '/images/profile-placeholder.svg',
      emergencyContact: currentAthlete?.emergencyContact || '',
      seasonBest: currentAthlete?.seasonBests?.[0]?.mark || currentAthlete?.personalBests?.[0]?.mark || '',
      faydaVerified: Boolean(currentAthlete?.faydaStatus === 'VERIFIED' || savedCitizen?.verified),
      licenseNumber: currentAthlete?.licenseNumber || '',
      status: currentAthlete?.status || currentAthlete?.licenseStatus || 'Not recorded',
    };
  }, [currentAthlete, meet]);

  const faydaNationalIdData = realAthleteData;

  const availableDisciplines: string[] = Array.isArray(meet?.disciplines) ? meet.disciplines : [];
  useEffect(() => {
    setSelectedDisciplines((previous) => previous.filter((discipline) => availableDisciplines.includes(discipline)));
  }, [meet?.id, availableDisciplines.join('|')]);

  if (!meet) return null;

  // Registration approval check: users must complete registration and wait for admin approval
  const isRegistrationApproved = currentAthlete?.status === 'APPROVED' ||
    currentAthlete?.status === 'ACTIVE' ||
    currentAthlete?.licenseStatus === 'ACTIVE' ||
    currentAthlete?.licenseStatus === 'APPROVED';

  const isRegistrationPending = !isRegistrationApproved && Boolean(
    currentAthlete?.status === 'PENDING' ||
    currentAthlete?.licenseStatus === 'PENDING_APPROVAL' ||
    currentAthlete?.licenseStatus === 'PENDING' ||
    (typeof window !== 'undefined' && (localStorage.getItem('eaf_registered_athlete') || localStorage.getItem('eaf_registration_status')))
  );

  const handleApplyClick = () => {
    if (currentRole === 'CLUB') {
      window.dispatchEvent(
        new CustomEvent('eaf-open-club-enrollment', {
          detail: { competition: meet, competitionId: meet?.id },
        })
      );
      return;
    }
    const token = localStorage.getItem('eaf_accessToken') || localStorage.getItem('token') || localStorage.getItem('eaf_token');
    if (!token || currentRole !== 'ATHLETE') {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { method: 'FIN' } }));
      return;
    }
    if (isRegistrationPending) {
      return;
    }
    if (!isRegistrationApproved) {
      window.dispatchEvent(new CustomEvent('eaf-notify', { detail: { message: 'Your athlete registration must be approved before you can apply for a competition.', type: 'error' } }));
      return;
    }
    if (!availableDisciplines.length) {
      window.dispatchEvent(new CustomEvent('eaf-notify', { detail: { message: 'This competition has no published disciplines available for entry.', type: 'error' } }));
      return;
    }
    setSelectedDisciplines([availableDisciplines[0]]);
    setShowIndividualModal(true);
  };

  const handleToggleDiscipline = (disc: string) => {
    if (selectedDisciplines.includes(disc)) {
      if (selectedDisciplines.length > 1) {
        setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc));
      }
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  const handleSubmitMeetRegistration = async () => {
    if (isRegistrationPending || !isRegistrationApproved) return;
    if (!selectedDisciplines.length || selectedDisciplines.some((discipline) => !availableDisciplines.includes(discipline))) {
      window.dispatchEvent(new CustomEvent('eaf-notify', { detail: { message: 'Select at least one published discipline.', type: 'error' } }));
      return;
    }
    setIsPendingApproval(true);
    const token = localStorage.getItem('eaf_accessToken') || localStorage.getItem('token') || localStorage.getItem('eaf_token');
    const disciplinesToApply = selectedDisciplines;

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${apiBase}/events/${meet.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ eventId: meet.id, disciplines: disciplinesToApply }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'Competition entry failed.');
      const result = body?.data || body;
      if (!result || typeof result !== 'object') throw new Error('The server returned an invalid competition application response.');
      setRegistrationPass({
        passId: result.registrationNumber || result.id || '',
        bib: result.bibNumber || '',
        meetTitle: meet.title,
        venue: meet.venue,
        date: meet.date,
        bannerUrl: getBannerUrl(meet),
        athlete: realAthleteData,
        events: disciplinesToApply,
        registeredAt: result.createdAt || '',
        status: result.status || 'PENDING',
      });
    } catch (error: any) {
      setIsPendingApproval(false);
      window.dispatchEvent(new CustomEvent('eaf-notify', { detail: { message: error?.message || 'Competition entry could not be saved.', type: 'error' } }));
    }
  };

  // Dynamic about info prioritizing database values configured from admin hub
  const schedFirst = Array.isArray(meet?.schedule) && meet.schedule.length > 0 ? (meet.schedule[0] as any) : null;
  const dynamicStandards = meet?.standards || schedFirst?.standards || null;
  const dynamicPrizes = meet?.prizes || schedFirst?.prizes || null;

  const aboutInfo = {
    overview: meet?.description || meet?.overview || (''),
    rules: meet?.rules || '',
    standards: dynamicStandards || '',
    prizes: dynamicPrizes || ''
  };

  // Generate sub-events for Events Tab
  const isMeetRegOpen = !isEventRegistrationClosed(meet) && (
    meet.status === 'REGISTRATION_OPEN' ||
    meet.status === 'UPCOMING' ||
    String(meet.status).toUpperCase() === 'PUBLISHED'
  );

  const subEvents = meet.disciplines.map(d => {
    let gender = 'Mixed';
    if (d.toLowerCase().includes('men')) gender = 'Men';
    else if (d.toLowerCase().includes('women')) gender = 'Women';
    else {
      gender = 'Mixed';
    }

    let ageGroup = 'Senior';
    if (d.toLowerCase().includes('u20')) {
      ageGroup = 'U20';
    } else if (d.toLowerCase().includes('u18')) {
      ageGroup = 'U18';
    }

    return {
      name: d,
      gender,
      ageGroup,
      status: isMeetRegOpen ? 'Open' : 'Closed'
    };
  });

  // Official Start Lists and Live Competition Results (Real database records)
  const starterList = useMemo(() => {
    if (!publicHubData?.startLists || publicHubData.startLists.length === 0) return [];
    const items: any[] = [];
    for (const sl of publicHubData.startLists) {
      for (const entry of (sl.entries || [])) {
        const validAthleteName = entry.athleteName && entry.athleteName !== 'Athlete' ? entry.athleteName : '';
        const validAthleteUserName = entry.athlete?.user ? `${entry.athlete.user.firstName || ''} ${entry.athlete.user.lastName || ''}`.trim() : '';
        const resolvedName =
          validAthleteName ||
          (entry.name && entry.name !== 'Athlete' ? entry.name : '') ||
          validAthleteUserName ||
          (entry.fullName && entry.fullName !== 'Athlete' ? entry.fullName : '') ||
          (entry.athleteNameSnapshot && entry.athleteNameSnapshot !== 'Athlete' ? entry.athleteNameSnapshot : '') ||
          entry.athlete?.name ||
          (entry.relayTeam ? entry.relayTeam.teamName : '') ||
          entry.athleteName ||
          'Athlete';

        const validClubName = entry.clubName && entry.clubName !== 'Unattached' ? entry.clubName : '';
        const validAthleteClubName = entry.athlete?.club?.name || entry.athlete?.clubName;
        const resolvedClub =
          validClubName ||
          (typeof entry.club === 'string' && entry.club !== 'Unattached' ? entry.club : entry.club?.name) ||
          validAthleteClubName ||
          (entry.clubNameSnapshot && entry.clubNameSnapshot !== 'Unattached' ? entry.clubNameSnapshot : '') ||
          (typeof entry.delegation === 'string' ? entry.delegation : entry.delegation?.name) ||
          entry.teamName ||
          (entry.relayTeam ? entry.relayTeam.teamName : '') ||
          entry.clubName ||
          'Unattached';

        const validRegionName = entry.regionName && entry.regionName !== 'National' ? entry.regionName : '';
        const validAthleteRegion = entry.athlete?.club?.region || entry.athlete?.region || entry.club?.region;
        const resolvedRegion =
          validRegionName ||
          (typeof entry.region === 'string' && entry.region !== 'National' ? entry.region : entry.region?.name) ||
          validAthleteRegion ||
          entry.regionName ||
          'National';

        const resolvedAmharic =
          entry.amharicName ||
          entry.athlete?.amharicName ||
          (entry.athlete?.user?.firstNameAm ? `${entry.athlete.user.firstNameAm} ${entry.athlete.user.lastNameAm || ''}`.trim() : null) ||
          resolvedName;

        items.push({
          id: entry.id,
          name: resolvedName,
          amharicName: resolvedAmharic,
          club: resolvedClub,
          region: resolvedRegion,
          event: sl.discipline,
          gender: sl.gender === 'MEN' ? 'Men' : sl.gender === 'WOMEN' ? 'Women' : 'Mixed',
          ageGroup: sl.category || 'Senior',
          round: sl.round || 'Final',
          stage: sl.stage,
          heat: entry.heat || 1,
          lane: entry.lane ?? entry.order ?? '—',
          order: entry.order,
          bib: entry.bibNumber || entry.bib || '—',
          seedTime: entry.seedMark || entry.seedTime || 'NT',
          verified: !!entry.athlete?.uniqueRegistrationNumber || !!entry.verified,
          status: entry.status || 'CONFIRMED',
          version: sl.version,
          publishedAt: sl.publishedAt,
          scheduledTime: sl.scheduledTime,
        });
      }
    }
    return items;
  }, [publicHubData]);

  const { data: publishedResultsList } = useGetPublishedResultsQuery();

  const resultsData = useMemo(() => {
    const items: any[] = [];
    const seenAthleteRoundKeys = new Set<string>();

    // 1. From publicHubData.results (database event-specific hub)
    if (publicHubData?.results && Array.isArray(publicHubData.results)) {
      for (const res of publicHubData.results) {
        const roundStr = (res.round || 'FINAL').toUpperCase().trim();
        const discStr = (res.discipline || '').toLowerCase().trim();
        const genderStr = (res.gender || 'MIXED').toUpperCase().trim();

        for (const entry of (res.entries || [])) {
          const athleteKey = entry.athleteId || (entry.athleteName || '').toLowerCase().trim() || entry.bibNo;
          const uniqueKey = `${discStr}__${roundStr}__${genderStr}__${athleteKey}`;
          if (athleteKey && seenAthleteRoundKeys.has(uniqueKey)) continue;
          if (athleteKey) seenAthleteRoundKeys.add(uniqueKey);

          const pos = entry.position ?? 99;
          const resolvedName =
            entry.athleteName ||
            entry.athleteNameSnapshot ||
            entry.name ||
            entry.fullName ||
            (entry.athlete?.user ? `${entry.athlete.user.firstName || ''} ${entry.athlete.user.lastName || ''}`.trim() : '') ||
            'Athlete';
          const resolvedClub =
            (typeof entry.club === 'string' ? entry.club : entry.club?.name) ||
            entry.clubName ||
            entry.clubNameSnapshot ||
            entry.athlete?.club?.name ||
            'Unattached';

          items.push({
            id: entry.id || uniqueKey,
            rank: pos,
            name: resolvedName,
            club: resolvedClub,
            bib: entry.bibNo || '—',
            lane: entry.lane ? String(entry.lane) : '—',
            heat: entry.heat ? String(entry.heat) : '1',
            event: res.discipline,
            round: res.round || 'FINAL',
            gender: res.gender === 'MEN' ? 'Men' : res.gender === 'WOMEN' ? 'Women' : 'Mixed',
            ageGroup: res.category || 'Senior',
            time: entry.mark || entry.bestValidMark || '—',
            attempts: Array.isArray(entry.attempts) ? entry.attempts : [],
            bestValidMark: entry.bestValidMark || null,
            wind: res.windReading || null,
            verified: true,
            pb: !!entry.personalBest,
            sb: !!entry.seasonBest,
            nr: !!entry.nationalRecord,
            cr: !!entry.meetRecord,
            medal: entry.medal ? entry.medal.toLowerCase() : (pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : null),
            qualified: entry.qualified || null,
            reactionTime: entry.reactionTime || null,
            status: entry.status || 'FINISHED',
            flag: entry.flag || entry.status || 'OK',
            remarks: entry.remarks || '',
            dqReason: entry.remarks || '',
            resultStatusLabel: res.statusLabel || 'Official Result',
            version: res.version,
            publishedAt: res.publishedAt,
          });
        }
      }
    }

    // 2. From publishedResultsList (general published endpoint)
    if (publishedResultsList && Array.isArray(publishedResultsList)) {
      const currentTitle = meet?.title?.toLowerCase().trim();
      const matched = publishedResultsList.filter((pr: any) => 
        (effectiveId && pr.eventId === effectiveId) || 
        (meet?.id && pr.eventId === meet.id) || 
        (currentTitle && pr.eventTitle && pr.eventTitle.toLowerCase().trim() === currentTitle)
      );

      for (const res of matched) {
        const roundStr = (res.round || 'FINAL').toUpperCase().trim();
        const discStr = (res.discipline || '').toLowerCase().trim();
        const genderStr = (res.gender || 'MIXED').toUpperCase().trim();

        for (const entry of (res.entries || [])) {
          const athleteKey = entry.athleteId || (entry.athleteName || entry.name || '').toLowerCase().trim() || entry.bib || entry.bibNo;
          const uniqueKey = `${discStr}__${roundStr}__${genderStr}__${athleteKey}`;
          if (athleteKey && seenAthleteRoundKeys.has(uniqueKey)) continue;
          if (athleteKey) seenAthleteRoundKeys.add(uniqueKey);

          const pos = entry.rank ?? entry.position ?? 99;
          const resolvedName =
            entry.athleteName ||
            entry.name ||
            entry.athleteNameSnapshot ||
            entry.fullName ||
            'Athlete';
          const resolvedClub =
            (typeof entry.club === 'string' ? entry.club : entry.club?.name) ||
            entry.clubName ||
            entry.clubNameSnapshot ||
            'Unattached';

          items.push({
            id: entry.id || uniqueKey,
            rank: pos,
            name: resolvedName,
            club: resolvedClub,
            bib: entry.bib || entry.bibNo || '—',
            lane: entry.lane ? String(entry.lane) : '—',
            heat: entry.heat ? String(entry.heat) : '1',
            event: res.discipline,
            round: res.round || 'FINAL',
            gender: res.gender === 'MEN' ? 'Men' : res.gender === 'WOMEN' ? 'Women' : 'Mixed',
            ageGroup: res.category || 'Senior',
            time: entry.mark || entry.bestValidMark || entry.time || '—',
            attempts: Array.isArray(entry.attempts) ? entry.attempts : [],
            bestValidMark: entry.bestValidMark || null,
            wind: res.wind || res.windReading || null,
            verified: true,
            pb: !!entry.pb || entry.recordBadge === 'PB',
            sb: !!entry.sb || entry.recordBadge === 'SB',
            nr: !!entry.nr || entry.recordBadge === 'NR',
            cr: !!entry.cr || entry.recordBadge === 'CR',
            medal: entry.medal ? entry.medal.toLowerCase() : (pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : null),
            qualified: entry.qualified || null,
            reactionTime: entry.reactionTime || null,
            status: entry.status || 'FINISHED',
            flag: entry.flag || entry.status || 'OK',
            remarks: entry.remarks || '',
            dqReason: entry.remarks || '',
            resultStatusLabel: res.statusLabel || 'Official Result',
            version: res.version,
            publishedAt: res.publishedAt,
          });
        }
      }
    }

    return items.sort((a, b) => a.rank - b.rank);
  }, [publicHubData, publishedResultsList, effectiveId, meet?.id, meet?.title]);

  const medalStandings = publicHubData?.medalStandings || [];
  const announcements = publicHubData?.announcements || [];

  // Grouped disciplines and rounds for structured view
  const groupedDisciplines = useMemo(() => {
    const map = new Map<string, {
      key: string;
      discipline: string;
      gender: string;
      category: string;
      roundsMap: Map<string, {
        roundKey: string;
        roundLabel: string;
        stageType: 'FINAL' | 'SEMIFINAL' | 'HEAT' | 'ROUND';
        heatNumber?: number;
        wind?: string;
        statusLabel?: string;
        publishedAt?: string;
        entries: any[];
      }>;
    }>();

    for (const item of resultsData) {
      const discKey = `${item.event}__${item.gender}`;
      if (!map.has(discKey)) {
        map.set(discKey, {
          key: discKey,
          discipline: item.event,
          gender: item.gender,
          category: item.ageGroup,
          roundsMap: new Map()
        });
      }
      const discGroup = map.get(discKey)!;

      const rawRound = String(item.round || 'FINAL').trim();
      const rLower = rawRound.toLowerCase();
      let roundKey = rawRound;
      let roundLabel = rawRound;
      let stageType: 'FINAL' | 'SEMIFINAL' | 'HEAT' | 'ROUND' = 'ROUND';

      if (rLower.includes('final') && !rLower.includes('semi')) {
        stageType = 'FINAL';
        roundKey = 'FINAL';
        roundLabel = 'Championship Final 🏆';
      } else if (rLower.includes('semi')) {
        stageType = 'SEMIFINAL';
        const sMatch = rawRound.match(/\d+/);
        roundKey = rawRound;
        roundLabel = sMatch ? `Semi-Final ${sMatch[0]} ⚡` : 'Semi-Final ⚡';
      } else if (rLower.includes('heat') || rLower.includes('round 1') || rLower.includes('prelim')) {
        stageType = 'HEAT';
        const heatNum = item.heat && item.heat !== '—' ? item.heat : '1';
        roundKey = `HEAT_${heatNum}`;
        roundLabel = `Preliminary Heat ${heatNum} 🔥`;
      }

      if (!discGroup.roundsMap.has(roundKey)) {
        discGroup.roundsMap.set(roundKey, {
          roundKey,
          roundLabel,
          stageType,
          heatNumber: Number(item.heat) || undefined,
          wind: item.wind,
          statusLabel: item.resultStatusLabel,
          publishedAt: item.publishedAt,
          entries: []
        });
      }

      const roundObj = discGroup.roundsMap.get(roundKey)!;
      if (item.wind && !roundObj.wind) roundObj.wind = item.wind;

      // Ensure an athlete only appears once in this round's results
      const existingEntryIdx = roundObj.entries.findIndex(
        (e: any) =>
          (e.athleteId && item.athleteId && e.athleteId === item.athleteId) ||
          (e.name && item.name && e.name.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (e.bib && item.bib && e.bib !== '—' && e.bib === item.bib)
      );

      if (existingEntryIdx >= 0) {
        // If already present, keep the record with valid time or lower rank number
        if (!roundObj.entries[existingEntryIdx].time || roundObj.entries[existingEntryIdx].time === '—') {
          roundObj.entries[existingEntryIdx] = item;
        }
      } else {
        roundObj.entries.push(item);
      }
    }

    return Array.from(map.values()).map(d => ({
      key: d.key,
      discipline: d.discipline,
      gender: d.gender,
      category: d.category,
      totalEntries: Array.from(d.roundsMap.values()).reduce((sum, r) => sum + r.entries.length, 0),
      rounds: Array.from(d.roundsMap.values()).map(r => ({
        ...r,
        entries: r.entries.sort((a, b) => a.rank - b.rank)
      })).sort((a, b) => {
        const stageWeight = (s: string) => s === 'FINAL' ? 1 : s === 'SEMIFINAL' ? 2 : 3;
        return stageWeight(a.stageType) - stageWeight(b.stageType);
      })
    }));
  }, [resultsData]);

  const activeDiscipline = useMemo(() => {
    if (selectedDisciplineKey === 'ALL') return null;
    return groupedDisciplines.find(d => d.key === selectedDisciplineKey) || null;
  }, [groupedDisciplines, selectedDisciplineKey]);

  const handleDownloadCsv = (targetEntries?: any[], customName?: string) => {
    const data = targetEntries || resultsData;
    if (!data || data.length === 0) return;
    const headers = ['Rank', 'Bib', 'Athlete', 'Club', 'Event', 'Gender', 'Round', 'Heat', 'Lane', 'Result', 'Wind', 'Status', 'Qual'];
    const rows = data.map((r: any) => [
      r.rank,
      r.bib,
      `"${r.name}"`,
      `"${r.club}"`,
      `"${r.event}"`,
      r.gender,
      `"${r.round}"`,
      r.heat,
      r.lane,
      `"${r.time}"`,
      r.wind || '',
      r.status || 'OK',
      r.qualified || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = customName ? `EAF_Results_${customName}.csv` : `EAF_Results_${meet?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Competition'}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Structured Start Lists by Discipline and Round ──
  const groupedStarterDisciplines = useMemo(() => {
    const rawLists = publicHubData?.startLists;
    if (rawLists && Array.isArray(rawLists) && rawLists.length > 0) {
      const map = new Map<string, {
        key: string;
        discipline: string;
        gender: string;
        category: string;
        version?: number;
        publishedAt?: string;
        roundsMap: Map<string, {
          roundKey: string;
          roundLabel: string;
          stageType: 'HEAT' | 'SEMIFINAL' | 'FINAL' | 'ROUND';
          badgeText: string;
          badgeColor: string;
          sortWeight: number;
          heatNum: number;
          scheduledTime?: string;
          venue?: string;
          entries: any[];
        }>;
      }>();

      for (const sl of rawLists) {
        const genderStr = sl.gender === 'MEN' ? 'Men' : sl.gender === 'WOMEN' ? 'Women' : 'Mixed';
        const discKey = `${sl.discipline}__${genderStr}`;

        if (!map.has(discKey)) {
          map.set(discKey, {
            key: discKey,
            discipline: sl.discipline,
            gender: genderStr,
            category: sl.category || 'Senior',
            version: sl.version,
            publishedAt: sl.publishedAt,
            roundsMap: new Map(),
          });
        }
        const discGroup = map.get(discKey)!;

        const entries = sl.entries || [];
        // Register round even if empty
        const defaultRoundDetails = getStartListRoundDetails(sl.round, 1, sl.stage);
        if (entries.length === 0 && !discGroup.roundsMap.has(defaultRoundDetails.roundKey)) {
          discGroup.roundsMap.set(defaultRoundDetails.roundKey, {
            ...defaultRoundDetails,
            heatNum: defaultRoundDetails.heatNum,
            scheduledTime: sl.scheduledTime,
            publishedAt: sl.publishedAt,
            venue: sl.venue,
            entries: [],
          });
        }

        for (const entry of entries) {
          const roundDetails = getStartListRoundDetails(sl.round, entry.heat, sl.stage);
          if (!discGroup.roundsMap.has(roundDetails.roundKey)) {
            discGroup.roundsMap.set(roundDetails.roundKey, {
              ...roundDetails,
              heatNum: roundDetails.heatNum,
              scheduledTime: sl.scheduledTime,
              publishedAt: sl.publishedAt,
              venue: sl.venue,
              entries: [],
            });
          }
          const roundObj = discGroup.roundsMap.get(roundDetails.roundKey)!;

          const validAthleteName = entry.athleteName && entry.athleteName !== 'Athlete' ? entry.athleteName : '';
          const validAthleteUserName = entry.athlete?.user ? `${entry.athlete.user.firstName || ''} ${entry.athlete.user.lastName || ''}`.trim() : '';
          const resolvedName =
            validAthleteName ||
            (entry.name && entry.name !== 'Athlete' ? entry.name : '') ||
            validAthleteUserName ||
            (entry.fullName && entry.fullName !== 'Athlete' ? entry.fullName : '') ||
            (entry.athleteNameSnapshot && entry.athleteNameSnapshot !== 'Athlete' ? entry.athleteNameSnapshot : '') ||
            entry.athlete?.name ||
            (entry.relayTeam ? entry.relayTeam.teamName : '') ||
            entry.athleteName ||
            'Athlete';

          const validClubName = entry.clubName && entry.clubName !== 'Unattached' ? entry.clubName : '';
          const validAthleteClubName = entry.athlete?.club?.name || entry.athlete?.clubName;
          const resolvedClub =
            validClubName ||
            (typeof entry.club === 'string' && entry.club !== 'Unattached' ? entry.club : entry.club?.name) ||
            validAthleteClubName ||
            (entry.clubNameSnapshot && entry.clubNameSnapshot !== 'Unattached' ? entry.clubNameSnapshot : '') ||
            (typeof entry.delegation === 'string' ? entry.delegation : entry.delegation?.name) ||
            entry.teamName ||
            (entry.relayTeam ? entry.relayTeam.teamName : '') ||
            entry.clubName ||
            'Unattached';

          const validRegionName = entry.regionName && entry.regionName !== 'National' ? entry.regionName : '';
          const validAthleteRegion = entry.athlete?.club?.region || entry.athlete?.region || entry.club?.region;
          const resolvedRegion =
            validRegionName ||
            (typeof entry.region === 'string' && entry.region !== 'National' ? entry.region : entry.region?.name) ||
            validAthleteRegion ||
            entry.regionName ||
            'National';

          const resolvedAmharic =
            entry.amharicName ||
            entry.athlete?.amharicName ||
            (entry.athlete?.user?.firstNameAm ? `${entry.athlete.user.firstNameAm} ${entry.athlete.user.lastNameAm || ''}`.trim() : null) ||
            resolvedName;

          const alreadyExists = roundObj.entries.some((existing: any) =>
            (existing.id && entry.id && existing.id === entry.id) ||
            (existing.bib !== '—' && entry.bibNumber && existing.bib === entry.bibNumber) ||
            (existing.name.toLowerCase().trim() === resolvedName.toLowerCase().trim() && existing.lane === (entry.lane ?? entry.order ?? '—'))
          );

          if (!alreadyExists) {
            roundObj.entries.push({
              id: entry.id,
              name: resolvedName,
              amharicName: resolvedAmharic,
              club: resolvedClub,
              region: resolvedRegion,
              event: sl.discipline,
              gender: genderStr,
              ageGroup: sl.category || 'Senior',
              round: roundDetails.roundLabel,
              roundKey: roundDetails.roundKey,
              heat: entry.heat || roundDetails.heatNum,
              lane: entry.lane ?? entry.order ?? '—',
              order: entry.order,
              bib: entry.bibNumber || entry.bib || '—',
              seedTime: entry.seedMark || entry.seedTime || 'NT',
              verified: !!entry.athlete?.uniqueRegistrationNumber || !!entry.verified,
              status: entry.status || 'CONFIRMED',
              version: sl.version,
              publishedAt: sl.publishedAt,
              scheduledTime: sl.scheduledTime,
            });
          }
        }
      }

      return Array.from(map.values()).map((g) => {
        const sortedRounds = Array.from(g.roundsMap.values()).sort(compareRoundsRecentFirst);
        const totalAthletes = sortedRounds.reduce((acc, r) => acc + r.entries.length, 0);
        return {
          key: g.key,
          discipline: g.discipline,
          gender: g.gender,
          category: g.category,
          version: g.version,
          publishedAt: g.publishedAt,
          totalAthletes,
          totalHeats: sortedRounds.filter((r) => r.stageType === 'HEAT').length || 1,
          roundsCount: sortedRounds.length,
          stagesAvailable: Array.from(new Set(sortedRounds.map((r) => r.badgeText))),
          rounds: sortedRounds.map((r) => ({
            ...r,
            entries: [...r.entries].sort((a, b) => {
              const numA = parseInt(String(a.lane || a.order || '99'), 10) || 99;
              const numB = parseInt(String(b.lane || b.order || '99'), 10) || 99;
              return numA - numB;
            }),
          })),
        };
      });
    }

    if (starterList && starterList.length > 0) {
      const map = new Map<string, {
        key: string;
        discipline: string;
        gender: string;
        category: string;
        roundsMap: Map<string, {
          roundKey: string;
          roundLabel: string;
          stageType: 'HEAT' | 'SEMIFINAL' | 'FINAL' | 'ROUND';
          badgeText: string;
          badgeColor: string;
          sortWeight: number;
          heatNum: number;
          entries: any[];
        }>;
      }>();

      for (const item of starterList) {
        const discKey = `${item.event}__${item.gender}`;
        if (!map.has(discKey)) {
          map.set(discKey, {
            key: discKey,
            discipline: item.event,
            gender: item.gender,
            category: item.ageGroup || 'Senior',
            roundsMap: new Map(),
          });
        }
        const discGroup = map.get(discKey)!;
        const roundDetails = getStartListRoundDetails(item.round, item.heat, item.stage);
        if (!discGroup.roundsMap.has(roundDetails.roundKey)) {
          discGroup.roundsMap.set(roundDetails.roundKey, {
            ...roundDetails,
            heatNum: roundDetails.heatNum,
            scheduledTime: item.scheduledTime,
            publishedAt: item.publishedAt,
            entries: [],
          });
        }
        const roundObj = discGroup.roundsMap.get(roundDetails.roundKey)!;
        const isDuplicate = roundObj.entries.some((existing: any) =>
          (existing.id && item.id && existing.id === item.id) ||
          (existing.bib !== '—' && item.bib && existing.bib === item.bib) ||
          (existing.name?.toLowerCase().trim() === item.name?.toLowerCase().trim() && existing.lane === item.lane)
        );
        if (!isDuplicate) {
          roundObj.entries.push(item);
        }
      }

      return Array.from(map.values()).map((g) => {
        const sortedRounds = Array.from(g.roundsMap.values()).sort(compareRoundsRecentFirst);
        const totalAthletes = sortedRounds.reduce((acc, r) => acc + r.entries.length, 0);
        return {
          key: g.key,
          discipline: g.discipline,
          gender: g.gender,
          category: g.category,
          totalAthletes,
          totalHeats: sortedRounds.filter((r) => r.stageType === 'HEAT').length || 1,
          roundsCount: sortedRounds.length,
          stagesAvailable: Array.from(new Set(sortedRounds.map((r) => r.badgeText))),
          rounds: sortedRounds.map((r) => ({
            ...r,
            entries: [...r.entries].sort((a, b) => {
              const numA = parseInt(String(a.lane || a.order || '99'), 10) || 99;
              const numB = parseInt(String(b.lane || b.order || '99'), 10) || 99;
              return numA - numB;
            }),
          })),
        };
      });
    }

    return [];
  }, [publicHubData, starterList]);

  const activeStarterDiscipline = useMemo(() => {
    if (!selectedStarterDisciplineKey) return null;
    return groupedStarterDisciplines.find((d) => d.key === selectedStarterDisciplineKey) || null;
  }, [groupedStarterDisciplines, selectedStarterDisciplineKey]);

  const filteredStarterDisciplines = useMemo(() => {
    return groupedStarterDisciplines.filter((d) => {
      if (starterGenderFilter !== 'ALL' && d.gender !== starterGenderFilter) return false;
      if (starterSearchQuery.trim()) {
        const q = starterSearchQuery.toLowerCase().trim();
        const matchesDisc = d.discipline.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
        const matchesAthlete = d.rounds.some((r) =>
          r.entries.some(
            (e: any) =>
              String(e.name || e.athleteName || '').toLowerCase().includes(q) ||
              String(typeof e.club === 'string' ? e.club : (e.club?.name || e.clubName || '')).toLowerCase().includes(q) ||
              String(e.bib || e.bibNumber || '').toLowerCase().includes(q)
          )
        );
        return matchesDisc || matchesAthlete;
      }
      return true;
    });
  }, [groupedStarterDisciplines, starterGenderFilter, starterSearchQuery]);

  const handleDownloadStarterCsv = (entries: any[], filename: string) => {
    if (!entries || entries.length === 0) return;
    const headers = ['Lane/Order', 'Bib', 'Athlete Name', 'Club', 'Region', 'Discipline', 'Gender', 'Round', 'Heat', 'Seed Time', 'Status'];
    const rows = entries.map((st) => [
      st.lane,
      `"${st.bib}"`,
      `"${st.name}"`,
      `"${st.club}"`,
      `"${st.region}"`,
      `"${st.event}"`,
      st.gender,
      `"${st.round}"`,
      st.heat,
      `"${st.seedTime}"`,
      st.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStarters = useMemo(() => {
    return starterList.filter(s => {
      if (starterEventFilter !== 'ALL' && s.event !== starterEventFilter) return false;
      if (starterGenderFilter !== 'ALL' && s.gender !== starterGenderFilter) return false;
      if (starterSearchQuery.trim()) {
        const q = starterSearchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.club.toLowerCase().includes(q) && !String(s.bib).toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [starterList, starterEventFilter, starterGenderFilter, starterSearchQuery]);

  const filteredResults = useMemo(() => {
    return resultsData.filter(r => {
      if (resultEventFilter !== 'ALL' && r.event !== resultEventFilter) return false;
      if (resultClubFilter !== 'ALL' && r.club !== resultClubFilter) return false;
      if (resultAgeFilter !== 'ALL' && r.ageGroup !== resultAgeFilter) return false;
      if (resultGenderFilter !== 'ALL' && r.gender !== resultGenderFilter) return false;
      if (resultRoundFilter !== 'ALL' && r.round?.toLowerCase() !== resultRoundFilter.toLowerCase()) return false;
      if (resultSearchQuery.trim()) {
        const q = resultSearchQuery.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.club.toLowerCase().includes(q) && !String(r.bib).toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [resultsData, resultEventFilter, resultClubFilter, resultAgeFilter, resultGenderFilter, resultRoundFilter, resultSearchQuery]);

  const uniqueEvents = [...new Set(resultsData.map(r => r.event))];
  const uniqueClubs = [...new Set(resultsData.map(r => r.club))];
  const uniqueRounds = [...new Set(resultsData.map(r => r.round))].filter(Boolean);
  const uniqueStarterEvents = [...new Set(starterList.map(s => s.event))];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <span>← </span>{t('competitionDetail.back')}
      </button>

      {/* ── A. COMPETITION HEADER & BANNER ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          marginBottom: '32px'
        }}
      >
        <img
          src={getBannerUrl(meet)}
          alt={meet.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/images/banner_grand_prix.png';
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)'
          }}
        />

        {/* Banner Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '32px', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <span
              className="badge"
              style={{
                background: (meet.status === 'REGISTRATION_OPEN' || String(meet.status).toUpperCase() === 'PUBLISHED')
                  ? '#0E7490'
                  : meet.status === 'LIVE'
                  ? '#DC2626'
                  : '#B45309',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: 'none',
                padding: '6px 14px'
              }}
            >
              {(meet.status === 'REGISTRATION_OPEN' || String(meet.status).toUpperCase() === 'PUBLISHED')
                ? t('competitionDetail.regOpen')
                : meet.status === 'LIVE'
                ? t('competitionDetail.live')
                : t('competitionDetail.upcoming')}
            </span>
            <span
              className="badge badge-gold"
              style={{ border: '1px solid rgba(200, 168, 75, 0.4)', borderRadius: '8px', padding: '6px 14px', color: '#FFE082' }}
            >
              ★ {t('competitionDetail.gradeA')}
            </span>
          </div>

          <h1 style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '8px' }}>
            {meet.title}
          </h1>
          <p style={{ color: '#FFE082', fontSize: '1.05rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} /> {meet.venue}
          </p>
        </div>
      </div>

      {/* Grid of metadata card & registration panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>

        {/* Localized Metadata Card */}
        <div className="gov-card" style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            🏆 {t('competitionDetail.compInfo')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(11, 87, 142, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('competitionDetail.dateSchedule')}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
                  {meet.date || 'Date not recorded'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('competitionDetail.deadline')}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#DC2626', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {meet.registrationDeadline || 'Deadline not recorded'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(11, 87, 142, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('competitionDetail.organizer')}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
                  Ethiopian Athletics Federation (EAF) / Regional Committee
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(11, 87, 142, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('competitionDetail.contact')}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <span>📞 +251 11 551 7777</span>
                  <span>✉️ info@eaf.org.et</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Action Panel */}
        <div
          className="gov-card"
          style={{
            background: isEventRegistrationClosed(meet)
              ? 'linear-gradient(135deg, #334155 0%, #0F172A 100%)'
              : meet.status === 'LIVE'
                ? 'linear-gradient(135deg, #991B1B 0%, #450A0A 100%)'
                : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '32px',
            boxShadow: meet.status === 'LIVE'
              ? '0 16px 36px rgba(220, 38, 38, 0.28)'
              : isEventRegistrationClosed(meet)
                ? '0 16px 36px rgba(51, 65, 85, 0.25)'
                : '0 16px 36px rgba(2, 132, 199, 0.28)'
          }}
        >
          <div>
            <span style={{ background: '#FFFFFF', color: meet.status === 'LIVE' ? '#991B1B' : isEventRegistrationClosed(meet) ? '#334155' : 'var(--primary-dark)', fontWeight: 900, fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px', display: 'inline-block' }}>
              {isEventRegistrationClosed(meet) ? '🔒 REGISTRATION CLOSED' : meet.status === 'LIVE' ? '🔴 EVENT IS LIVE IN STADIUM' : `✦ ${t('competitionDetail.officialReg')}`}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              {isEventRegistrationClosed(meet) ? 'Registration Period Concluded' : meet.status === 'LIVE' ? 'Live Competition Underway' : t('competitionDetail.actionTitle')}
            </h3>
            <p style={{ color: '#E0F2FE', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {isEventRegistrationClosed(meet)
                ? 'Registration for this competition has been officially closed by the EAF Technical Committee. No new athlete entries are currently accepted.'
                : meet.status === 'LIVE'
                  ? 'This competition is currently underway live in stadium. Registration is closed. Track real-time live race results & rankings below.'
                  : currentRole === 'ATHLETE'
                    ? 'You are signed in. Click below to select your disciplines and submit your individual entry for this competition.'
                    : t('competitionDetail.regPanelSub')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isEventRegistrationClosed(meet) ? (
              <button
                disabled
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#94A3B8',
                  fontWeight: 800,
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Lock size={18} /> Registration Closed
              </button>
            ) : meet.status === 'LIVE' ? (
              <button
                onClick={() => setActiveTab('results')}
                className="btn-accent"
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  color: '#991B1B',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem' }}>
                  <Trophy size={20} color="#991B1B" /> View Live Results &amp; Leaderboard
                </span>
                <ChevronRight size={18} color="#991B1B" />
              </button>
            ) : isRegistrationPending && (currentRole === 'ATHLETE' || currentRole === 'CLUB') ? (
              <div
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  color: '#92400E',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)'
                }}
              >
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
                <span>Registration Pending Approval — Applications Locked</span>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="btn-accent"
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '14px',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  color: 'var(--primary-dark)',
                  fontWeight: 900,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem' }}>
                  {currentRole === 'CLUB' ? (
                    <>
                      <UserPlus size={20} color="var(--primary-dark)" /> Start Club Athlete Enrollment
                    </>
                  ) : (
                    <>
                      <UserCheck size={20} color="var(--primary-dark)" /> Apply for Competition
                    </>
                  )}
                </span>
                <ChevronRight size={18} color="var(--primary-dark)" />
              </button>
            )}

            {/* QR Scanner Icon Button */}
            <button
              onClick={() => setShowQrScannerModal(true)}
              title="Scan Athlete Competition Pass or BIB QR Code"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
            >
              <QrCode size={24} color="#FFFFFF" />
            </button>
          </div>
        </div>
      </div>

      {/* ── B. TABBED INFORMATION ARCHITECTURE ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '28px',
          overflowX: 'auto',
          gap: '8px'
        }}
      >
        {[
          { id: 'about', label: t('competitionDetail.tabAbout') },
          { id: 'events', label: t('competitionDetail.tabEvents') },
          { id: 'starters', label: `Start Lists (${starterList.length})` },
          { id: 'results', label: `Results (${resultsData.length})` },
          { id: 'medals', label: `Medals (${medalStandings.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>

        {/* 1. About Tab */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)', marginBottom: '12px' }}>
                {t('competitionDetail.eventOverview')}
              </h4>
              <p style={{ lineHeight: 1.7, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                {aboutInfo.overview}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📜 {t('competitionDetail.technicalRules')}
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-body)', fontSize: '0.88rem' }}>
                  {aboutInfo.rules}
                </p>
              </div>

              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏃 {t('competitionDetail.qualifyingStandards')}
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-body)', fontSize: '0.88rem' }}>
                  {aboutInfo.standards}
                </p>
              </div>

              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 {t('competitionDetail.prizePurse')}
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-body)', fontSize: '0.88rem' }}>
                  {aboutInfo.prizes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Events Tab */}
        {activeTab === 'events' && (
          <div className="gov-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t('competitionDetail.eventDiscipline')}</th>
                    <th>{t('common.gender')}</th>
                    <th>{t('competitionDetail.ageCategory')}</th>
                    <th>{t('competitionDetail.regStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subEvents.map((ev, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{ev.name}</td>
                      <td>
                        <span className={`badge ${ev.gender === 'Men' ? 'badge-blue' : ev.gender === 'Women' ? 'badge-amber' : 'badge-primary'}`}>
                          {ev.gender}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>
                          {ev.ageGroup}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ev.status === 'Open' ? 'badge-green' : 'badge-red'}`}>
                          {ev.status === 'Open' ? t('competitionDetail.open') : t('competitionDetail.closed')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Starter Lists Tab */}
        {activeTab === 'starters' && (
          <div>
            {groupedStarterDisciplines.length === 0 ? (
              <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>Official Start Lists Awaiting Publication</h4>
                <p style={{ fontSize: '0.85rem' }}>Official heat and lane assignments will be announced here once reviewed and authorized by competition referees.</p>
              </div>
            ) : selectedStarterDisciplineKey === null ? (
              /* ── A. DISCIPLINED LIST VIEW (DISCIPLINES OVERVIEW) ── */
              <div>
                {/* Search & Filter Header */}
                <div
                  className="gov-card"
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '18px',
                    marginBottom: '20px',
                    padding: '20px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-heading)' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(200,168,75,0.15)', color: '#C8A84B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ListOrdered size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', display: 'block' }}>Official Start Lists by Discipline</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select any discipline to view official rounds, heat allocations, and lane seeding.</span>
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} /> {groupedStarterDisciplines.length} Disciplines Available
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Search Athlete, Bib, or Discipline</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Type name, bib #, or discipline..."
                          value={starterSearchQuery}
                          onChange={e => setStarterSearchQuery(e.target.value)}
                          style={{ background: '#FFFFFF', paddingLeft: '34px' }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                        {starterSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setStarterSearchQuery('')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('common.gender')} Division</label>
                      <select 
                        className="form-select" 
                        value={starterGenderFilter} 
                        onChange={e => setStarterGenderFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">All Divisions</option>
                        <option value="Men">Men's Events</option>
                        <option value="Women">Women's Events</option>
                        <option value="Mixed">Mixed Events</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredStarterDisciplines.length === 0 ? (
                  <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>No disciplines matched your search filter.</p>
                    <button
                      type="button"
                      onClick={() => { setStarterSearchQuery(''); setStarterGenderFilter('ALL'); }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {filteredStarterDisciplines.map((disc) => (
                      <div
                        key={disc.key}
                        className="gov-card"
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '20px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'rgba(200, 168, 75, 0.12)',
                                color: '#C8A84B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900
                              }}>
                                <ListOrdered size={20} />
                              </div>
                              <div>
                                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>
                                  {disc.discipline}
                                </h4>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  {disc.gender} · {disc.category}
                                </div>
                              </div>
                            </div>
                            <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                              Official Published
                            </span>
                          </div>

                          {/* Available Stages / Rounds Tags */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {disc.rounds.map((rnd) => (
                              <span
                                key={rnd.roundKey}
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: rnd.stageType === 'FINAL' ? '#FEF3C7' : rnd.stageType === 'SEMIFINAL' ? '#EFF6FF' : '#FFF7ED',
                                  color: rnd.badgeColor,
                                  border: `1px solid ${rnd.badgeColor}30`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {rnd.stageType === 'FINAL' ? <Trophy size={11} /> : rnd.stageType === 'SEMIFINAL' ? <Zap size={11} /> : <Flame size={11} />}
                                {rnd.badgeText} ({rnd.entries.length})
                              </span>
                            ))}
                          </div>

                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Users size={14} style={{ color: 'var(--primary)' }} />
                              <strong>{disc.totalAthletes}</strong> Athletes
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Layers size={14} style={{ color: 'var(--primary)' }} />
                              <strong>{disc.rounds.length}</strong> {disc.rounds.length === 1 ? 'Round' : 'Rounds/Heats'}
                            </span>
                          </div>
                        </div>

                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStarterDisciplineKey(disc.key);
                            setSelectedStarterRoundKey('ALL');
                          }}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={16} />
                          View Start Lists
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ── B. DISCIPLINE ROUND DETAIL VIEW ── */
              <div>
                {activeStarterDiscipline && (
                  <div>
                    {/* Discipline Breadcrumb & Top Bar */}
                    <div
                      className="gov-card"
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        marginBottom: '18px',
                        padding: '18px 22px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedStarterDisciplineKey(null)}
                          className="btn btn-secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.82rem',
                            padding: '7px 14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            borderRadius: '8px'
                          }}
                        >
                          <ArrowLeft size={15} /> Back to Disciplines List
                        </button>
                        <div>
                          <h3 style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{activeStarterDiscipline.discipline}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                              {activeStarterDiscipline.gender} · {activeStarterDiscipline.category}
                            </span>
                            {activeStarterDiscipline.rounds.length > 1 && (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D' }}>
                                {activeStarterDiscipline.rounds.length} Rounds (Recent-First)
                              </span>
                            )}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Official lane seedings, heat allocations, and trial orders certified under World Athletics Technical Rules.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const allEntries = activeStarterDiscipline.rounds.flatMap(r => r.entries);
                            handleDownloadStarterCsv(allEntries, `StartList_${activeStarterDiscipline.discipline}_${activeStarterDiscipline.gender}`);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <Download size={14} /> Export CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <Printer size={14} /> Print
                        </button>
                      </div>
                    </div>

                    {/* Quick Search inside this discipline */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ position: 'relative', maxWidth: '340px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Search athlete, bib, or club in this event..."
                          value={starterSearchQuery}
                          onChange={e => setStarterSearchQuery(e.target.value)}
                          style={{ background: '#FFFFFF', paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
                        />
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                        {starterSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setStarterSearchQuery('')}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Round / Heat Selector Pills (if more than 1 round exists) */}
                    {activeStarterDiscipline.rounds.length > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          overflowX: 'auto',
                          paddingBottom: '8px',
                          marginBottom: '16px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedStarterRoundKey('ALL')}
                          className={`btn ${selectedStarterRoundKey === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            fontSize: '0.8rem',
                            padding: '6px 14px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Layers size={13} />
                          All Rounds / Heats ({activeStarterDiscipline.totalAthletes})
                        </button>
                        {activeStarterDiscipline.rounds.map((rnd, idx) => {
                          const isSelected = selectedStarterRoundKey === rnd.roundKey;
                          return (
                            <button
                              key={rnd.roundKey}
                              type="button"
                              onClick={() => setSelectedStarterRoundKey(rnd.roundKey)}
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                              style={{
                                fontSize: '0.8rem',
                                padding: '6px 14px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              {rnd.stageType === 'FINAL' ? <Trophy size={13} /> : rnd.stageType === 'SEMIFINAL' ? <Zap size={13} /> : <Flame size={13} />}
                              <span>{rnd.roundLabel}</span>
                              {idx === 0 && activeStarterDiscipline.rounds.length > 1 && (
                                <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: isSelected ? 'rgba(255,255,255,0.3)' : '#DCFCE7', color: isSelected ? '#FFFFFF' : '#15803D', fontWeight: 800 }}>
                                  Latest
                                </span>
                              )}
                              <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
                                {rnd.entries.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Display Rounds / Heats Accordingly */}
                    {(() => {
                      const roundsToRender = selectedStarterRoundKey === 'ALL'
                        ? activeStarterDiscipline.rounds
                        : activeStarterDiscipline.rounds.filter(r => r.roundKey === selectedStarterRoundKey);

                      if (roundsToRender.length === 0) {
                        return (
                          <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '36px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                            <p style={{ fontWeight: 700 }}>No entries found for this round.</p>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {roundsToRender.map((round) => {
                            const filteredEntries = round.entries.filter((st: any) => {
                              if (!starterSearchQuery.trim()) return true;
                              const q = starterSearchQuery.toLowerCase().trim();
                              const nameStr = String(st.name || st.athleteName || st.athleteNameSnapshot || '').toLowerCase();
                              const amharicStr = String(st.amharicName || '').toLowerCase();
                              const clubStr = String(typeof st.club === 'string' ? st.club : (st.club?.name || st.clubName || '')).toLowerCase();
                              const bibStr = String(st.bib || st.bibNumber || '').toLowerCase();
                              return nameStr.includes(q) || amharicStr.includes(q) || clubStr.includes(q) || bibStr.includes(q);
                            });

                            const isTopRound = activeStarterDiscipline.rounds.length > 1 && round.roundKey === activeStarterDiscipline.rounds[0].roundKey;

                            return (
                              <div
                                key={round.roundKey}
                                className="gov-card"
                                style={{
                                  background: '#FFFFFF',
                                  borderRadius: '18px',
                                  border: isTopRound ? '2px solid rgba(217, 119, 6, 0.4)' : '1px solid #E2E8F0',
                                  overflow: 'hidden',
                                  padding: 0,
                                  boxShadow: isTopRound ? '0 4px 14px rgba(217, 119, 6, 0.08)' : '0 2px 8px rgba(0,0,0,0.03)'
                                }}
                              >
                                {/* Round Header Bar */}
                                <div
                                  style={{
                                    padding: '16px 20px',
                                    background: isTopRound ? 'linear-gradient(90deg, #FEF3C7 0%, #FFFBEB 100%)' : '#F8FAFC',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        background: round.stageType === 'FINAL' ? '#FEF3C7' : round.stageType === 'SEMIFINAL' ? '#EFF6FF' : '#FFF7ED',
                                        color: round.badgeColor,
                                        border: `1px solid ${round.badgeColor}30`
                                      }}
                                    >
                                      {round.stageType === 'FINAL' ? <Trophy size={14} /> : round.stageType === 'SEMIFINAL' ? <Zap size={14} /> : <Flame size={14} />}
                                      {round.roundLabel}
                                    </span>
                                    {isTopRound && (
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '3px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          background: '#FEF3C7',
                                          color: '#B45309',
                                          border: '1px solid #FCD34D'
                                        }}
                                      >
                                        <Sparkles size={11} /> Top / Recent Stage
                                      </span>
                                    )}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                      {round.entries.length} {round.entries.length === 1 ? 'Athlete Allocated' : 'Athletes Allocated'}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {round.scheduledTime && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={13} style={{ color: 'var(--primary)' }} /> {round.scheduledTime}
                                      </span>
                                    )}
                                    {round.venue && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={13} style={{ color: 'var(--primary)' }} /> {round.venue}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Start List Table */}
                                {filteredEntries.length === 0 ? (
                                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No athletes match the search query in this heat.
                                  </div>
                                ) : (
                                  <div className="table-responsive">
                                    <table className="gov-table" style={{ margin: 0 }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: '80px', textAlign: 'center' }}>Lane / Pos</th>
                                          <th style={{ width: '80px' }}>{t('competitionDetail.bib')}</th>
                                          <th>{t('competitionDetail.athleteName')}</th>
                                          <th>{t('competitionDetail.clubDelegation')}</th>
                                          <th style={{ width: '90px', textAlign: 'center' }}>Heat #</th>
                                          <th style={{ width: '120px' }}>{t('competitionDetail.seedTime')}</th>
                                          <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredEntries.map((st: any, i: number) => (
                                          <tr key={st.id || i} style={{ opacity: st.status === 'WITHDRAWN' ? 0.6 : 1 }}>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', textAlign: 'center', fontSize: '0.95rem' }}>
                                              {st.lane ?? st.order ?? '—'}
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                                              #{st.bib || st.bibNumber || '—'}
                                            </td>
                                            <td>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>
                                                  {st.name || st.athleteName || 'Athlete'}
                                                </span>
                                                {st.verified && (
                                                  <span 
                                                    title={t('competitionDetail.verified')} 
                                                    style={{ 
                                                      display: 'inline-flex', 
                                                      alignItems: 'center', 
                                                      background: '#DCFCE7', 
                                                      color: '#15803D', 
                                                      borderRadius: '50%', 
                                                      padding: '2px'
                                                    }}
                                                  >
                                                    <CheckCircle2 size={12} fill="#15803D" stroke="#DCFCE7" />
                                                  </span>
                                                )}
                                              </div>
                                              {st.amharicName && st.amharicName !== (st.name || st.athleteName) && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.amharicName}</div>
                                              )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                              <div style={{ color: 'var(--text-heading)' }}>
                                                {typeof st.club === 'string' ? st.club : (st.club?.name || st.clubName || 'Unattached')}
                                              </div>
                                              {(st.region || st.regionName) && (st.region !== st.club) && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                  {typeof st.region === 'string' ? st.region : (st.region?.name || st.regionName)}
                                                </div>
                                              )}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-heading)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                                              {st.heat}
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-heading)' }}>
                                              {st.seedTime || st.seedMark || 'NT'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              <span
                                                className={`badge ${st.status === 'WITHDRAWN' ? 'badge-red' : 'badge-green'}`}
                                                style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                                              >
                                                {st.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Bottom Back Button */}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedStarterDisciplineKey(null)}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.82rem',
                          padding: '7px 14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: '8px'
                        }}
                      >
                        <ArrowLeft size={15} /> Back to Disciplines List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Live Results Tab */}
        {activeTab === 'results' && (
          <div>
            {resultsData.length === 0 ? (
              <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Trophy size={32} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-heading)', marginBottom: '8px' }}>
                  {t('competitionDetail.resultsPending')}
                </h4>
                <p style={{ fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                  {t('competitionDetail.resultsPendingSub')} Results are officially verified by Technical Referees under World Athletics Technical Rules TR 8 & TR 20 before publication.
                </p>
                <div style={{ display: 'inline-flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('starters')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    View Official Start Lists →
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    View Timetable
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* World Athletics Status Notices */}
                {resultsData.some((r: any) => r.resultStatusLabel?.toLowerCase().includes('provisional')) && (
                  <div style={{
                    padding: '14px 18px',
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <Clock size={22} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h5 style={{ fontWeight: 800, color: '#92400E', fontSize: '0.9rem', marginBottom: '2px' }}>
                        World Athletics TR 8 Provisional Protest Window Active (30 Minutes)
                      </h5>
                      <p style={{ fontSize: '0.82rem', color: '#B45309', margin: 0, lineHeight: '1.4' }}>
                        Provisional results have been published. Under World Athletics Technical Rule 8, an official 30-minute protest window is currently open from the publication timestamp. Protests regarding finishing times, lane infringements, or technical violations must be submitted in writing to the Technical Delegate before results become official.
                      </p>
                    </div>
                  </div>
                )}

                {resultsData.some((r: any) => r.resultStatusLabel?.toLowerCase().includes('appeal')) && (
                  <div style={{
                    padding: '14px 18px',
                    background: '#F3E8FF',
                    border: '1px solid #D8B4FE',
                    borderRadius: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <AlertTriangle size={22} style={{ color: '#7E22CE', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h5 style={{ fontWeight: 800, color: '#581C87', fontSize: '0.9rem', marginBottom: '2px' }}>
                        Official Result Under Appeal (Jury of Appeal Review)
                      </h5>
                      <p style={{ fontSize: '0.82rem', color: '#6B21A8', margin: 0, lineHeight: '1.4' }}>
                        An official appeal has been lodged regarding finishing positions. The Jury of Appeal is reviewing the case under WA Technical Rules. Standings and medal awards remain provisional pending resolution.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── B. RESULTS FILTER & TOOLBAR ── */}
                <div
                  className="gov-card"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    marginBottom: '20px',
                    padding: '20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(21, 128, 61, 0.1)', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0, color: 'var(--text-heading)' }}>
                          Official Championship Results & Progression
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          World Athletics TR 8 & TR 20 Certified Finish Times, Rounds & Wind Readings
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleDownloadCsv()}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Printer size={14} /> Print
                      </button>
                    </div>
                  </div>

                  {/* Filter Inputs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Search Finisher or Bib</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Search athlete, club, or bib #..."
                          value={resultSearchQuery}
                          onChange={e => setResultSearchQuery(e.target.value)}
                          style={{ background: '#F8FAFC', paddingLeft: '34px', fontSize: '0.85rem' }}
                        />
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Gender Category</label>
                      <select 
                        className="form-select" 
                        value={resultGenderFilter} 
                        onChange={e => setResultGenderFilter(e.target.value)}
                        style={{ background: '#F8FAFC', fontSize: '0.85rem' }}
                      >
                        <option value="ALL">All Genders (Men & Women)</option>
                        <option value="Men">Men Only ♂</option>
                        <option value="Women">Women Only ♀</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Club / Regional Delegation</label>
                      <select 
                        className="form-select" 
                        value={resultClubFilter} 
                        onChange={e => setResultClubFilter(e.target.value)}
                        style={{ background: '#F8FAFC', fontSize: '0.85rem' }}
                      >
                        <option value="ALL">All Delegations ({uniqueClubs.length})</option>
                        {uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* ── C. DISCIPLINE SELECTOR PILLS ── */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Select Event Discipline
                    </label>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      <button
                        onClick={() => {
                          setSelectedDisciplineKey('ALL');
                          setSelectedRoundStage('ALL');
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '12px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          border: selectedDisciplineKey === 'ALL' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                          background: selectedDisciplineKey === 'ALL' ? 'var(--primary)' : '#F8FAFC',
                          color: selectedDisciplineKey === 'ALL' ? '#FFFFFF' : 'var(--text-main)',
                        }}
                      >
                        All Disciplines ({resultsData.length})
                      </button>

                      {groupedDisciplines
                        .filter(d => resultGenderFilter === 'ALL' || d.gender === resultGenderFilter)
                        .map(disc => {
                          const isSelected = selectedDisciplineKey === disc.key;
                          return (
                            <button
                              key={disc.key}
                              onClick={() => {
                                setSelectedDisciplineKey(disc.key);
                                setSelectedRoundStage('ALL');
                              }}
                              style={{
                                padding: '7px 14px',
                                borderRadius: '12px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                                background: isSelected ? 'rgba(21, 128, 61, 0.08)' : '#F8FAFC',
                                color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                              }}
                            >
                              <span>{disc.discipline}</span>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                background: isSelected ? 'var(--primary)' : '#E2E8F0',
                                color: isSelected ? '#FFFFFF' : '#475569',
                                fontWeight: 800
                              }}>
                                {disc.gender === 'Men' ? '♂ Men' : disc.gender === 'Women' ? '♀ Women' : 'Mixed'} · {disc.rounds.length} {disc.rounds.length === 1 ? 'Round' : 'Rounds'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* ── D. ORGANIZED ROUND DISPLAY ── */}
                {(() => {
                  // Determine disciplines to render: either activeDiscipline or all matching groupedDisciplines
                  const disciplinesToRender = activeDiscipline
                    ? [activeDiscipline]
                    : groupedDisciplines.filter(d => resultGenderFilter === 'ALL' || d.gender === resultGenderFilter);

                  if (disciplinesToRender.length === 0) {
                    return (
                      <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '36px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                        <p style={{ fontWeight: 700 }}>No results match the selected filter criteria.</p>
                      </div>
                    );
                  }

                  return disciplinesToRender.map(disc => {
                    // Check if discipline has any entries matching search/club
                    const filteredRounds = disc.rounds.map(round => {
                      const filteredEntries = round.entries.filter(r => {
                        if (resultClubFilter !== 'ALL' && r.club !== resultClubFilter) return false;
                        if (resultSearchQuery.trim()) {
                          const q = resultSearchQuery.toLowerCase();
                          if (!r.name.toLowerCase().includes(q) && !r.club.toLowerCase().includes(q) && !String(r.bib).toLowerCase().includes(q)) {
                            return false;
                          }
                        }
                        return true;
                      });
                      return { ...round, entries: filteredEntries };
                    }).filter(round => round.entries.length > 0);

                    if (filteredRounds.length === 0) return null;

                    return (
                      <div
                        key={disc.key}
                        style={{
                          marginBottom: '28px',
                          background: '#FFFFFF',
                          borderRadius: '20px',
                          border: '1px solid #E2E8F0',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Discipline Title Banner */}
                        <div style={{
                          padding: '16px 22px',
                          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.25rem' }}>
                              {disc.gender === 'Women' ? '♀' : '♂'}
                            </span>
                            <div>
                              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#F8FAFC' }}>
                                {disc.discipline} — {disc.gender === 'Men' ? "Men's" : disc.gender === 'Women' ? "Women's" : "Mixed"}
                              </h3>
                              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                                Category: {disc.category} · {disc.rounds.length} {disc.rounds.length === 1 ? 'Contested Stage' : 'Progression Rounds'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'rgba(255, 255, 255, 0.1)',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}>
                              WA Technical Rule TR 20 Progression
                            </span>
                          </div>
                        </div>

                        {/* Round Switcher Tabs (If multiple rounds exist for this discipline) */}
                        {disc.rounds.length > 1 && (
                          <div style={{
                            padding: '10px 18px',
                            background: '#F8FAFC',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto'
                          }}>
                            <button
                              onClick={() => setSelectedRoundStage('ALL')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '10px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: selectedRoundStage === 'ALL' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                                background: selectedRoundStage === 'ALL' ? 'var(--primary)' : '#FFFFFF',
                                color: selectedRoundStage === 'ALL' ? '#FFFFFF' : '#334155',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Layers size={13} />
                              All Stages ({filteredRounds.reduce((acc, r) => acc + r.entries.length, 0)})
                            </button>

                            {disc.rounds.map(r => {
                              const isStageActive = selectedRoundStage === r.roundKey;
                              return (
                                <button
                                  key={r.roundKey}
                                  onClick={() => setSelectedRoundStage(r.roundKey)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    border: isStageActive ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                                    background: isStageActive ? 'var(--primary)' : '#FFFFFF',
                                    color: isStageActive ? '#FFFFFF' : '#334155',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  {r.stageType === 'FINAL' ? <Trophy size={13} /> : <Flame size={13} />}
                                  {r.roundLabel} ({r.entries.length})
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Render Rounds */}
                        <div style={{ padding: '16px' }}>
                          {filteredRounds
                            .filter(r => selectedRoundStage === 'ALL' || r.roundKey === selectedRoundStage)
                            .map((round, rIdx) => {
                              const isFinal = round.stageType === 'FINAL';

                              return (
                                <div
                                  key={round.roundKey}
                                  style={{
                                    marginBottom: rIdx < filteredRounds.length - 1 ? '24px' : '0',
                                    border: isFinal ? '1.5px solid #FDE047' : '1px solid #E2E8F0',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: isFinal ? 'rgba(254, 240, 138, 0.03)' : '#FFFFFF'
                                  }}
                                >
                                  {/* Stage Header Info Strip */}
                                  <div style={{
                                    padding: '12px 18px',
                                    background: isFinal ? 'linear-gradient(90deg, #FEF9C3 0%, #FFFFFF 100%)' : '#F8FAFC',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {isFinal ? (
                                        <div style={{ background: '#FDE047', color: '#854D0E', padding: '4px 8px', borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Trophy size={14} /> CHAMPIONSHIP FINAL
                                        </div>
                                      ) : (
                                        <div style={{ background: '#E2E8F0', color: '#334155', padding: '4px 8px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Flame size={14} /> {round.roundLabel.toUpperCase()}
                                        </div>
                                      )}

                                      {round.wind && (
                                        <span style={{
                                          fontSize: '0.78rem',
                                          fontFamily: 'var(--font-mono)',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          background: '#FFFFFF',
                                          border: '1px solid #CBD5E1',
                                          color: '#475569',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          <Wind size={12} /> Wind: {round.wind} m/s
                                        </span>
                                      )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                        fontSize: '0.72rem',
                                        color: '#15803D',
                                        background: '#DCFCE7',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontWeight: 800
                                      }}>
                                        ✓ Official Result
                                      </span>

                                      {!isFinal && (
                                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                                          TR 20: 3 First (Q) + next 2 fastest (q) advance
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Finisher Table */}
                                  <div className="table-responsive">
                                    <table className="gov-table" style={{ margin: 0 }}>
                                      <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                          <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                                          <th style={{ width: '70px', textAlign: 'center' }}>Bib</th>
                                          <th style={{ width: '90px' }}>Lane / Heat</th>
                                          <th>Finisher / Athlete</th>
                                          <th>Club / Regional Delegation</th>
                                          <th style={{ width: '130px' }}>Result / Time</th>
                                          <th style={{ width: '80px' }}>Wind</th>
                                          <th style={{ width: '130px' }}>Progression / Records</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {round.entries.map((r: any, eIdx: number) => {
                                          const isDQ = r.status === 'DQ' || r.flag === 'DQ';
                                          const isDNF = r.status === 'DNF' || r.flag === 'DNF';
                                          const isDNS = r.status === 'DNS' || r.flag === 'DNS';

                                          // Medal Styling
                                          const isGold = r.rank === 1 && isFinal;
                                          const isSilver = r.rank === 2 && isFinal;
                                          const isBronze = r.rank === 3 && isFinal;

                                          let rowBg = undefined;
                                          if (isGold) rowBg = 'rgba(254, 240, 138, 0.25)';
                                          else if (isSilver) rowBg = 'rgba(241, 245, 249, 0.8)';
                                          else if (isBronze) rowBg = 'rgba(255, 237, 213, 0.4)';

                                          return (
                                            <tr key={r.id || eIdx} style={{ background: rowBg }}>
                                              {/* Rank Column */}
                                              <td style={{ textAlign: 'center', fontWeight: 800 }}>
                                                {isDQ ? (
                                                  <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>DQ</span>
                                                ) : isDNF ? (
                                                  <span className="badge" style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569' }}>DNF</span>
                                                ) : isDNS ? (
                                                  <span className="badge" style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#B45309' }}>DNS</span>
                                                ) : isGold ? (
                                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FEF08A', color: '#854D0E', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, border: '1px solid #FDE047' }}>
                                                    🥇 1st
                                                  </div>
                                                ) : isSilver ? (
                                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#E2E8F0', color: '#334155', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, border: '1px solid #CBD5E1' }}>
                                                    🥈 2nd
                                                  </div>
                                                ) : isBronze ? (
                                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, border: '1px solid #FDBA74' }}>
                                                    🥉 3rd
                                                  </div>
                                                ) : (
                                                  <span style={{ color: '#475569' }}>{r.rank}</span>
                                                )}
                                              </td>

                                              {/* Bib Column */}
                                              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748B', fontSize: '0.88rem' }}>
                                                #{r.bib}
                                              </td>

                                              {/* Lane / Heat Column */}
                                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#475569' }}>
                                                L{r.lane} · H{r.heat}
                                              </td>

                                              {/* Athlete Column */}
                                              <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <span style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                                                    {r.name}
                                                  </span>
                                                  {r.verified && (
                                                    <span
                                                      title="Verified Ethiopian National Athlete"
                                                      style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        background: '#DCFCE7',
                                                        color: '#15803D',
                                                        borderRadius: '50%',
                                                        padding: '2px'
                                                      }}
                                                    >
                                                      <CheckCircle2 size={12} fill="#15803D" stroke="#DCFCE7" />
                                                    </span>
                                                  )}
                                                </div>
                                              </td>

                                              {/* Club Column */}
                                              <td>
                                                <span style={{
                                                  fontWeight: 700,
                                                  fontSize: '0.85rem',
                                                  color: '#1E293B',
                                                  background: '#F1F5F9',
                                                  padding: '3px 8px',
                                                  borderRadius: '6px',
                                                  display: 'inline-block'
                                                }}>
                                                  {r.club}
                                                </span>
                                              </td>

                                              {/* Result / Mark Column */}
                                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                                                {isDQ ? (
                                                  <div style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    <span>DQ</span>
                                                    {r.dqReason && (
                                                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#EF4444' }}>
                                                        {r.dqReason}
                                                      </span>
                                                    )}
                                                  </div>
                                                ) : isDNF || isDNS ? (
                                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                                                ) : (
                                                  <div>
                                                    <span>{r.time}</span>
                                                    {r.reactionTime && (
                                                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
                                                        RT: {r.reactionTime}
                                                      </span>
                                                    )}
                                                    {Array.isArray(r.attempts) && r.attempts.length > 0 && (
                                                      <div style={{ display: 'flex', gap: '3px', marginTop: '4px', fontSize: '0.7rem' }}>
                                                        {r.attempts.map((att: any, aIdx: number) => {
                                                          const markVal = typeof att === 'object' ? att.mark : String(att);
                                                          return (
                                                            <span
                                                              key={aIdx}
                                                              style={{
                                                                padding: '1px 4px',
                                                                borderRadius: '3px',
                                                                background: markVal === 'X' ? '#FEE2E2' : markVal === '-' ? '#F1F5F9' : markVal === r.time ? '#DCFCE7' : '#F8FAFC',
                                                                color: markVal === 'X' ? '#DC2626' : markVal === r.time ? '#15803D' : '#334155',
                                                                fontWeight: markVal === r.time ? 800 : 500,
                                                                border: '1px solid #E2E8F0'
                                                              }}
                                                            >
                                                              {markVal}
                                                            </span>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </td>

                                              {/* Wind Column */}
                                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                {r.wind ? `${r.wind} m/s` : (round.wind ? `${round.wind} m/s` : '—')}
                                              </td>

                                              {/* Progression & Records Column */}
                                              <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                  {/* World Athletics Qualification Indicators */}
                                                  {r.qualified === 'Q' && (
                                                    <span style={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 900,
                                                      padding: '2px 8px',
                                                      borderRadius: '6px',
                                                      background: '#15803D',
                                                      color: '#FFFFFF',
                                                      boxShadow: '0 2px 4px rgba(21, 128, 61, 0.2)'
                                                    }} title="Automatic Qualifier">
                                                      Q
                                                    </span>
                                                  )}
                                                  {r.qualified === 'q' && (
                                                    <span style={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 900,
                                                      padding: '2px 8px',
                                                      borderRadius: '6px',
                                                      background: '#0284C7',
                                                      color: '#FFFFFF',
                                                      boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                                                    }} title="Time Qualifier">
                                                      q
                                                    </span>
                                                  )}

                                                  {r.nr && <span className="badge badge-red" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>NR</span>}
                                                  {r.cr && <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#F3E8FF', color: '#7E22CE', border: '1px solid #D8B4FE' }}>CR</span>}
                                                  {r.pb && <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>PB</span>}
                                                  {r.sb && <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>SB</span>}
                                                  {r.time && String(r.time).includes('[A]') && (
                                                    <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                                                      ALT [A]
                                                    </span>
                                                  )}

                                                  {!r.qualified && !r.nr && !r.cr && !r.pb && !r.sb && (
                                                    <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>—</span>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* 5. Official Medal Standings Tab */}
        {activeTab === 'medals' && (
          <div>
            {medalStandings.length === 0 ? (
              <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', borderRadius: '18px' }}>
                <Trophy size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>Medal Table Pending</h4>
                <p style={{ fontSize: '0.85rem' }}>Club and regional medal standings are computed automatically as results are confirmed.</p>
              </div>
            ) : (
              <div className="gov-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
                    Championship Club Medal Standings
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Official ranking by Gold, Silver, and Bronze medal acquisitions
                  </p>
                </div>
                <div className="table-responsive">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                        <th>Club / Delegation</th>
                        <th style={{ textAlign: 'center' }}>🥇 Gold</th>
                        <th style={{ textAlign: 'center' }}>🥈 Silver</th>
                        <th style={{ textAlign: 'center' }}>🥉 Bronze</th>
                        <th style={{ textAlign: 'center' }}>Total Medals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medalStandings.map((m: any, idx: number) => (
                        <tr key={idx} style={{ background: idx === 0 ? 'rgba(217, 167, 44, 0.08)' : undefined }}>
                          <td style={{ fontWeight: 800, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                            {m.rank || idx + 1}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                            {m.clubName}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#D97706' }}>
                            {m.gold}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#64748B' }}>
                            {m.silver}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#B45309' }}>
                            {m.bronze}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 900, color: 'var(--primary)' }}>
                            {m.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Official Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            {announcements.length === 0 ? (
              <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', borderRadius: '18px' }}>
                <Clock size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>No Bulletins Published Yet</h4>
                <p style={{ fontSize: '0.85rem' }}>Official competition releases, jury notices, and schedule updates will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {announcements.map((ann: any) => (
                  <div
                    key={ann.id}
                    className="gov-card"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                        {ann.category || 'Official Bulletin'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(ann.publishedAt || ann.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)', marginBottom: '8px' }}>
                      {ann.title}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {ann.content}
                    </p>
                    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Announced by: <strong>{ann.authorName || 'Federation Competition Office'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── INDIVIDUAL ATHLETE MEET REGISTRATION MODAL ── */}
      {showIndividualModal && (
        <div className="modal-backdrop" onClick={() => { setShowIndividualModal(false); setRegistrationPass(null); setIsPendingApproval(false); }} style={{ zIndex: 9999, padding: '24px 16px', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '0', maxWidth: '1100px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', boxShadow: '0 32px 72px rgba(15,23,42,0.35)' }}>

            {/* Modal Header with Event Banner */}
            <div className="modal-bleed-banner" style={{ position: 'relative', height: '140px', background: '#0F172A' }}>
              <img src={getBannerUrl(meet)} alt={meet.title} onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner_grand_prix.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F172A 0%, transparent 100%)' }} />

              <button
                onClick={() => { setShowIndividualModal(false); setRegistrationPass(null); setIsPendingApproval(false); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'absolute', bottom: '16px', left: '28px', zIndex: 5, color: '#FFF' }}>
                <span className="badge badge-green" style={{ marginBottom: '4px', display: 'inline-flex', gap: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                  <ShieldCheck size={13} /> {t('competitionDetail.modalRegisterTitle')}
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFF', margin: 0 }}>{meet.title}</h3>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="modal-bleed-body" style={{ padding: '32px 40px' }}>
              {isRegistrationPending && (
                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '16px', padding: '16px 20px', color: '#92400E', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '4px' }}>Registration Pending Admin Approval</h4>
                    <p style={{ fontSize: '0.85rem', color: '#B45309', margin: 0, lineHeight: 1.5 }}>
                      Your registration has been submitted and is currently pending approval by the Ethiopian Athletics Federation Admin. You must wait for admin approval before applying for competitions. Once approved, you can select disciplines and submit your entries.
                    </p>
                  </div>
                </div>
              )}
              {isPendingApproval ? (
                /* Application Submitted — Waiting EAF Approval Screen */
                <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)' }}>
                    <Clock size={36} />
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '6px 14px', fontWeight: 900, marginBottom: '12px' }}>
                    ⏳ {t('competitionDetail.modalPendingBadge')}
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                    {t('competitionDetail.modalSubmittedTitle')}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '580px', lineHeight: 1.6, marginBottom: '24px' }}>
                    {t('competitionDetail.modalSubmittedSub', { meet: meet.title })}
                  </p>

                  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '520px', marginBottom: '28px', textAlign: 'left' }}>
                    <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.trackingRef')}</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>{registrationPass?.passId || 'Pending federation reference'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.athleteName').toUpperCase()}</span>
                        <strong style={{ color: '#0F172A' }}>{faydaNationalIdData.fullName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.disciplinesEnrolled')}</span>
                        <strong style={{ color: 'var(--primary-dark)' }}>{selectedDisciplines.join(', ') || 'Not selected'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.seedTime')}</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>{faydaNationalIdData.seasonBest || 'Not recorded'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '420px' }}>
                    <button
                      onClick={() => { setShowIndividualModal(false); setIsPendingApproval(false); }}
                      className="btn-accent"
                      style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', fontWeight: 900, border: 'none', cursor: 'pointer', justifyContent: 'center' }}
                    >
                      {t('competitionDetail.acknowledge')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Fayda Ethiopian Digital National ID Card Block */}
                  <div style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', border: '2px solid #BFDBFE', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #DBEAFE', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🇪🇹</span>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#1E3A8A', letterSpacing: '0.04em' }}>{t('competitionDetail.nationalIdTitle')}</div>
                          <div style={{ fontSize: '0.65rem', color: '#3B82F6', fontWeight: 800 }}>የኢትዮጵያ ብሔራዊ ዲጂታል መታወቂያ</div>
                        </div>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                        <ShieldCheck size={13} /> {t('competitionDetail.authenticated')}
                      </span>
                    </div>

                    <div className="wrap-on-mobile" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      {/* Formal Passport Photo Display */}
                      <div style={{ position: 'relative', width: '100px', height: '130px', borderRadius: '12px', overflow: 'hidden', border: '3px solid #3B82F6', boxShadow: '0 6px 16px rgba(59,130,246,0.2)', background: '#FFF', flexShrink: 0 }}>
                        <img
                          src={faydaNationalIdData.photoUrl}
                          alt="Passport Photo"
                          onError={(event) => { event.currentTarget.src = '/images/profile-placeholder.svg'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', bottom: 0, insetX: 0, background: 'rgba(15,23,42,0.85)', color: '#FFF', fontSize: '0.55rem', fontWeight: 900, textAlign: 'center', padding: '2px 0' }}>
                          {t('competitionDetail.passportBiometric')}
                        </span>
                      </div>

                      <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 18px', fontSize: '0.83rem', flex: 1 }}>
                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.fullName')}</span>
                          <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>{faydaNationalIdData.fullName}</strong>
                          <div style={{ color: 'var(--primary-dark)', fontSize: '0.76rem', fontWeight: 700 }}>{faydaNationalIdData.amharicName}</div>
                        </div>

                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('athleteProfile.faydaFin')}</span>
                          <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>{faydaNationalIdData.faydaFin}</strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('athleteProfile.dateOfBirth')}</span>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{faydaNationalIdData.dob}</span>
                        </div>

                        <div>
                          <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('common.gender')}</span>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{faydaNationalIdData.gender}</span>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.regionStateAddress')}</span>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{faydaNationalIdData.region} · {faydaNationalIdData.subcity} ({faydaNationalIdData.houseNo})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Grid: Disciplines Selection + Competition Related Metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>

                    {/* Left Column: Disciplines Selection */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'block' }}>
                        {t('competitionDetail.selectDisciplines')}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {meet.disciplines.map(d => {
                          const checked = selectedDisciplines.includes(d);
                          return (
                            <label
                              key={d}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: checked ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                                background: checked ? '#F0F9FF' : '#FFFFFF',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: checked ? 'var(--primary-dark)' : '#334155',
                                transition: 'all 0.15s'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleDiscipline(d)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                              />
                              {d}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Competition Entry Related Fields */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                        {t('competitionDetail.techParams')}
                      </h4>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t('competitionDetail.targetSeedTime')}</label>
                        <input className="form-input" defaultValue={realAthleteData.seasonBest} style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t('competitionDetail.primaryClub')}</label>
                        <input className="form-input" defaultValue={realAthleteData.club} style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t('competitionDetail.emergencyContact')}</label>
                        <input className="form-input" defaultValue={realAthleteData.emergencyContact} style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.85rem' }} />
                      </div>
                    </div>

                  </div>

                  {/* Submit Enrollment Button */}
                  <button
                    onClick={handleSubmitMeetRegistration}
                    className="btn-accent"
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)' }}
                  >
                    {t('competitionDetail.submitEntry')}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── SIGN IN / REGISTER MODAL FOR COMPETITION ENTRY ── */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)} style={{ zIndex: 9999, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px 28px', maxWidth: '480px', width: '95%', borderRadius: '24px', boxShadow: '0 25px 60px rgba(15,23,42,0.3)', border: '1px solid #E2E8F0', background: '#FFFFFF', position: 'relative' }}>
            
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Trophy size={28} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
                Sign In / Register
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                Sign in to your athlete account to enter<br />
                <strong style={{ color: '#0F172A' }}>{meet.title}</strong>
              </p>
            </div>

            {authError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {authError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                className="btn-accent"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.98rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', cursor: 'pointer', justifyContent: 'center', marginTop: '4px' }}
              >
                Sign In &amp; Continue to Event Registration
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>New Athlete?</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* Mini Create Account / Fayda Registration Option */}
            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false);
                onRegister('ATHLETE');
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                background: '#F1F5F9',
                color: 'var(--primary-dark)',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
            >
              <ShieldCheck size={18} color="var(--primary)" />
              Register as Athlete with Fayda ID
            </button>

          </div>
        </div>
      )}

      {/* ── QR CODE SCANNER MODAL FOR ATHLETE PASS & ACCREDITATION ── */}
      {showQrScannerModal && (
        <div className="modal-backdrop" onClick={() => { setShowQrScannerModal(false); setScannedPassResult(null); }} style={{ zIndex: 9999, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px 28px', maxWidth: '760px', width: '95%', borderRadius: '24px', boxShadow: '0 25px 60px rgba(15,23,42,0.35)', border: '1px solid #E2E8F0', background: '#FFFFFF', position: 'relative' }}>
            
            {/* Close button */}
            <button
              onClick={() => { setShowQrScannerModal(false); setScannedPassResult(null); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.12)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <QrCode size={30} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                EAF Athlete Pass QR Scanner
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Scan Competition Entry Pass, BIB Number, or Athlete Accreditation QR Code
              </p>
            </div>

            {scannedPassResult ? (
              <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '20px', maxHeight: '65vh', overflowY: 'auto' }}>
                {(() => {
                  const attendee = scannedPassResult.attendee;
                  const athlete = attendee?.athlete;
                  const user = athlete?.user;
                  const event = attendee?.event;
                  const club = athlete?.club || attendee?.club;
                  const registration = athlete?.eventRegistrations?.[0];
                  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || club?.name || 'Attendee';
                  const photo = athlete ? getProfilePhotoUrl({ photoUrl: athlete.photoUrl, faydaNin: athlete.faydaIdentity?.nin }) : club?.logoUrl;
                  const rows: [string, string][] = [
                    ['Check-in', 'Successful'], ['Event', event?.title || meet.title], ['Venue', event?.venue || 'Not provided'],
                    ['Event dates', [event?.startDate && new Date(event.startDate).toLocaleDateString(), event?.endDate && new Date(event.endDate).toLocaleDateString()].filter(Boolean).join(' – ') || 'Not provided'],
                    ['Registration', registration?.status || 'Confirmed'], ['Disciplines', registration?.disciplines?.join(', ') || athlete?.primaryEvent || 'Not provided'],
                    ['Club', club?.name || athlete?.clubName || 'Independent'], ['Club verification', club?.verificationStatus || 'Not applicable'],
                    ['Date of birth', athlete?.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : 'Not provided'],
                    ['Gender', athlete?.gender || 'Not provided'], ['Nationality', athlete?.nationality || 'Not provided'], ['Region', athlete?.region || 'Not provided'],
                    ['Email', user?.email || 'Not provided'], ['Phone', user?.phoneNumber || 'Not provided'],
                    ['Height', athlete?.height ? `${athlete.height} cm` : 'Not provided'], ['Position', athlete?.position || 'Not provided'],
                    ['Jersey number', athlete?.jerseyNumber?.toString() || 'Not provided'],
                    ['Sports', athlete?.athleteSports?.map((item: any) => item.sport?.name).filter(Boolean).join(', ') || 'Not provided'],
                    ['Fayda verification', athlete?.faydaIdentity?.verified ? `Verified${athlete.faydaIdentity?.verifiedAt ? ` · ${new Date(athlete.faydaIdentity.verifiedAt).toLocaleDateString()}` : ''}` : 'Not verified'],
                    ['Fayda NIN', athlete?.faydaIdentity?.nin || 'Not available'], ['Athlete status', athlete?.status || 'Not applicable'],
                    ['Entry payment', registration?.payment?.status || 'Not applicable'],
                    ['Personal bests', athlete?.personalBests?.map((pb: any) => `${pb.event}: ${pb.mark}${pb.venue ? ` (${pb.venue})` : ''}`).join(' · ') || 'No results recorded'],
                  ];
                  return <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
                      {photo && <img src={photo} alt="Attendee" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '50%', border: '3px solid #86EFAC' }} />}
                      <div style={{ textAlign: 'left' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '4px 12px', fontWeight: 900, marginBottom: '6px', display: 'inline-block' }}>Checked in</span>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>{name}</h4>
                        {athlete?.id && <div style={{ fontSize: '0.8rem', color: '#475569' }}>Athlete ID: {athlete.id}</div>}
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '16px', textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.83rem' }}>
                      {rows.map(([label, value]) => <div key={label}><span style={{ color: '#64748B', fontWeight: 700 }}>{label}:</span><br /><strong style={{ color: '#0F172A', overflowWrap: 'anywhere' }}>{value}</strong></div>)}
                    </div>
                  </>;
                })()}

                <button
                  onClick={() => { setScannedPassResult(null); setQrScanError(''); }}
                  style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#16A34A', color: '#FFF', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                >
                  Scan Another Pass
                </button>
              </div>
            ) : (
              /* Live camera scanner */
              <div>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  background: '#0F172A',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  marginBottom: '20px'
                }}>
                  <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Scanner Grid Overlay */}
                  <div style={{ position: 'absolute', inset: '30px', border: '2px dashed var(--primary)', borderRadius: '16px', opacity: 0.8 }} />
                  
                  {/* Scanner Corner Guides */}
                  <div style={{ position: 'absolute', top: '24px', left: '24px', width: '20px', height: '20px', borderTop: '4px solid #38BDF8', borderLeft: '4px solid #38BDF8' }} />
                  <div style={{ position: 'absolute', top: '24px', right: '24px', width: '20px', height: '20px', borderTop: '4px solid #38BDF8', borderRight: '4px solid #38BDF8' }} />
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', width: '20px', height: '20px', borderBottom: '4px solid #38BDF8', borderLeft: '4px solid #38BDF8' }} />
                  <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '20px', height: '20px', borderBottom: '4px solid #38BDF8', borderRight: '4px solid #38BDF8' }} />

                  {/* Animated Scan Line */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '80%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #22C55E, transparent)',
                      boxShadow: '0 0 15px #22C55E',
                      animation: 'scanLine 2s infinite ease-in-out'
                    }}
                  />

                  <div style={{ position: 'absolute', color: '#FFFFFF', textAlign: 'center', zIndex: 2, padding: '0 20px', textShadow: '0 1px 4px #0F172A' }}>
                    <Camera size={36} color="#38BDF8" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#F8FAFC', fontWeight: 700 }}>Align the competition QR pass within the frame</div>
                    <div style={{ fontSize: '0.72rem', color: '#F8FAFC', marginTop: '4px' }}>The pass will be checked against this event</div>
                  </div>
                </div>

                {/* Scan Line CSS Animation */}
                <style>{`
                  @keyframes scanLine {
                    0% { top: 20%; }
                    50% { top: 80%; }
                    100% { top: 20%; }
                  }
                `}</style>
                {qrScanError && <div role="alert" style={{ color: '#B91C1C', background: '#FEF2F2', padding: '10px 12px', borderRadius: 10, fontSize: '0.84rem', marginBottom: 12 }}>{qrScanError}</div>}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
