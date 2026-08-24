import React, { useState } from 'react';
import {
  Trophy, Calendar, MapPin, Phone, Mail, Award, Users, Filter,
  CheckCircle2, User, UserCheck, Building, Clock, ChevronRight, ShieldCheck, X, Download, Printer, Check,
  Lock, QrCode, Camera
} from 'lucide-react';
import { MOCK_ATHLETES, MOCK_EVENT_RESULTS, MOCK_CLUBS } from '../data/mockData';
import { useI18n } from '../i18n';

// Helper to determine banner image based on meet ID
const getBannerUrl = (meetId) => {
  if (meetId === 'MEET-2026-01') return '/images/banner_grand_prix.png';
  if (meetId === 'MEET-2026-02') return '/images/banner_youth_games.png';
  if (meetId === 'MEET-2026-03') return '/images/banner_jan_meda.png';
  return 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=900&auto=format&fit=crop&q=80';
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

interface CompetitionDetailProps {
  meet: any;
  onBack: () => void;
  onRegister: (role: 'CLUB' | 'ATHLETE') => void;
  currentRole?: 'LANDING' | 'CLUB' | 'ATHLETE';
  currentAthlete?: any;
  onLoginSuccess?: (role: string, data: any) => void;
}

export default function CompetitionDetail({
  meet,
  onBack,
  onRegister,
  currentRole = 'LANDING',
  currentAthlete,
  onLoginSuccess
}: CompetitionDetailProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('about');
  // Results Filters
  const [resultEventFilter, setResultEventFilter] = useState<string>('ALL');
  const [resultClubFilter, setResultClubFilter] = useState<string>('ALL');
  const [resultAgeFilter, setResultAgeFilter] = useState<string>('ALL');
  const [resultGenderFilter, setResultGenderFilter] = useState<string>('ALL');

  // Individual Meet Registration Modal State
  const [showIndividualModal, setShowIndividualModal] = useState<boolean>(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(meet ? [meet.disciplines[0]] : []);
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter email and password');
      return;
    }
    setAuthError('');
    setShowAuthModal(false);

    const lowerEmail = authEmail.toLowerCase();
    let loggedInAthlete = currentAthlete || MOCK_ATHLETES[0];
    if (lowerEmail.includes('haile') || lowerEmail.includes('athlete') || lowerEmail.includes('runner')) {
      const found = MOCK_ATHLETES.find(a => a.name.toLowerCase().includes('haile')) || MOCK_ATHLETES[0];
      if (found) loggedInAthlete = found;
    }

    if (onLoginSuccess) {
      onLoginSuccess('ATHLETE', { athlete: loggedInAthlete });
    }

    if (meet.status === 'REGISTRATION_OPEN' || meet.status === 'UPCOMING') {
      setShowIndividualModal(true);
    }
  };

  if (!meet) return null;


  // Ethiopian Fayda National ID Mock Profile Data
  const faydaNationalIdData = {
    fullName: 'Haile Demisse Tadesse',
    amharicName: 'ኃይሌ ደሚሴ ታደሰ',
    faydaFin: '9840-3920-1124',
    dob: '2002-04-12 (Age 24)',
    gender: 'Male / ወንድ',
    region: 'Addis Ababa City Administration (አዲስ አበባ ከተማ አስተዳደር)',
    subcity: 'Bole Sub-City, Woreda 03',
    houseNo: 'House No. 482/09',
    photoUrl: '/images/athlete_haile.jpeg',
    faydaVerified: true,
    club: 'Independent / Unaffiliated Athlete'
  };

  const handleToggleDiscipline = (disc) => {
    if (selectedDisciplines.includes(disc)) {
      if (selectedDisciplines.length > 1) {
        setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc));
      }
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  const handleSubmitMeetRegistration = () => {
    const pass = {
      passId: `EAF-PASS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bib: `BIB-9042`,
      meetTitle: meet.title,
      venue: meet.venue,
      date: meet.date,
      bannerUrl: getBannerUrl(meet.id),
      athlete: faydaNationalIdData,
      events: selectedDisciplines,
      registeredAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setRegistrationPass(pass);
  };

  // Mock static info for About Tab based on Meet
  const aboutInfo = {
    overview: meet.id === 'MEET-2026-01'
      ? 'The Addis Ababa International Grand Prix is the pinnacle track and field event in Ethiopia, gathering world-class runners, local elite athletes, and international competitors. Sanctioned by EAF and accredited under regional development programs.'
      : meet.id === 'MEET-2026-02'
        ? 'The National Youth Olympic Games (U18/U20) serves as the primary talent identification platform in Ethiopia. The championship aims to discover the next generation of distance runners to represent Ethiopia in international youth competitions.'
        : 'The Jan Meda Cross-Country trials hold deep historical significance as the ultimate selection criteria for the Ethiopian National Team representing the nation in the World Athletics Cross Country Championships.',
    rules: 'All participants must comply with World Athletics Technical Rules and EAF local statutes. Athletes must hold an active EAF Athlete License for the 2026 season. Doping control will be carried out in accordance with WADA guidelines.',
    standards: meet.id === 'MEET-2026-01'
      ? '5,000m Men: Under 13:45.00 | 10,000m Women: Under 32:30.00 | 800m Men: Under 1:48.00. Standards must be achieved in EAF-certified events.'
      : meet.id === 'MEET-2026-02'
        ? 'Open to athletes aged U18 (born 2009-2010) and U20 (born 2007-2008). Must be affiliated with an EAF-registered regional club or academy.'
        : 'Open entry for registered club teams (max 6 runners per category). Top 4 finishers automatically qualify for selection pools.',
    prizes: meet.id === 'MEET-2026-01'
      ? 'Gold: 100,000 ETB | Silver: 60,000 ETB | Bronze: 40,000 ETB. A special record-breaking bonus of 150,000 ETB is awarded for breaking national records.'
      : meet.id === 'MEET-2026-02'
        ? 'EAF youth development grants: 30,000 ETB for top finishers. Training gear packages provided by Adidas Ethiopia for top 6 finalists.'
        : 'National team training camp selection for top 6. Cash prizes up to 50,000 ETB for club delegations.'
  };

  // Generate sub-events for Events Tab
  const subEvents = meet.disciplines.map(d => {
    let gender = 'Mixed';
    if (d.toLowerCase().includes('men')) gender = 'Men';
    else if (d.toLowerCase().includes('women')) gender = 'Women';
    else {
      gender = d.length % 2 === 0 ? 'Men' : 'Women';
    }

    let ageGroup = 'Senior';
    if (meet.id === 'MEET-2026-02') {
      ageGroup = d.length % 2 === 0 ? 'U20' : 'U18';
    } else if (d.toLowerCase().includes('u20')) {
      ageGroup = 'U20';
    } else if (d.toLowerCase().includes('u18')) {
      ageGroup = 'U18';
    }

    return {
      name: d,
      gender,
      ageGroup,
      status: meet.status === 'REGISTRATION_OPEN' ? 'Open' : 'Closed'
    };
  });

  // Generate Starter Lists
  const starterList = MOCK_ATHLETES.map((ath, idx) => ({
    bib: `BIB-30${idx + 1}`,
    name: ath.name,
    amharicName: ath.amharicName,
    club: ath.clubName,
    event: meet.disciplines[idx % meet.disciplines.length] || '1,500m',
    gender: ath.gender,
    ageGroup: ath.ageTier,
    seedTime: idx === 0 ? '12:51.44' : idx === 1 ? '1:57.20' : idx === 2 ? '3:38.10' : idx === 3 ? '29:42.10' : '2:04.50',
    verified: ath.faydaStatus === 'VERIFIED'
  }));

  // Fetch Results if available
  const rawResults = MOCK_EVENT_RESULTS[meet.id] || [];

  const resultsData = [];
  rawResults.forEach(disciplineBlock => {
    disciplineBlock.results.forEach(res => {
      const matchingAthlete = MOCK_ATHLETES.find(a => a.name === res.athleteName);

      let gender = disciplineBlock.discipline.toLowerCase().includes('women') ? 'Women' : 'Men';
      if (matchingAthlete) {
        gender = matchingAthlete.gender;
      } else if (res.athleteName.includes('Tigist') || res.athleteName.includes('Almaz') || res.athleteName.includes('Worknesh') || res.athleteName.includes('Hirut') || res.athleteName.includes('Netsanet')) {
        gender = 'Women';
      }

      let ageTier = matchingAthlete ? matchingAthlete.ageTier : 'Senior';
      if (meet.id === 'MEET-2026-02') {
        ageTier = res.athleteName.includes('Abel') ? 'U18' : 'U20';
      }

      resultsData.push({
        rank: res.pos,
        bib: matchingAthlete ? matchingAthlete.id.replace('ATH-2026-', 'BIB-') : `BIB-${Math.floor(100 + Math.random() * 800)}`,
        name: res.athleteName,
        club: res.club,
        time: res.time,
        pb: res.pb,
        sb: res.sb,
        nr: res.pos === 1 && meet.id === 'MEET-2026-01' && disciplineBlock.discipline === '800m',
        event: disciplineBlock.discipline,
        gender,
        ageGroup: ageTier,
        verified: matchingAthlete ? matchingAthlete.faydaStatus === 'VERIFIED' : true
      });
    });
  });

  const filteredResults = resultsData.filter(r => {
    if (resultEventFilter !== 'ALL' && r.event !== resultEventFilter) return false;
    if (resultClubFilter !== 'ALL' && r.club !== resultClubFilter) return false;
    if (resultAgeFilter !== 'ALL' && r.ageGroup !== resultAgeFilter) return false;
    if (resultGenderFilter !== 'ALL' && r.gender !== resultGenderFilter) return false;
    return true;
  });

  const uniqueEvents = [...new Set(resultsData.map(r => r.event))];
  const uniqueClubs = [...new Set(resultsData.map(r => r.club))];

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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${getBannerUrl(meet.id)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
                background: meet.status === 'REGISTRATION_OPEN' ? '#0E7490' : meet.status === 'LIVE' ? '#DC2626' : '#B45309',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: 'none',
                padding: '6px 14px'
              }}
            >
              {meet.status === 'REGISTRATION_OPEN' ? t('competitionDetail.regOpen') : meet.status === 'LIVE' ? t('competitionDetail.live') : t('competitionDetail.upcoming')}
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
                  {meet.date} | 08:00 AM EAT
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
                  August 05, 2026 
                  <span className="badge badge-red" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>{t('competitionDetail.urgent')}</span>
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
            background: meet.status === 'REGISTRATION_CLOSED'
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
              : meet.status === 'REGISTRATION_CLOSED'
                ? '0 16px 36px rgba(51, 65, 85, 0.25)'
                : '0 16px 36px rgba(2, 132, 199, 0.28)'
          }}
        >
          <div>
            <span style={{ background: '#FFFFFF', color: meet.status === 'LIVE' ? '#991B1B' : meet.status === 'REGISTRATION_CLOSED' ? '#334155' : 'var(--primary-dark)', fontWeight: 900, fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px', display: 'inline-block' }}>
              {meet.status === 'REGISTRATION_CLOSED' ? '🔒 REGISTRATION CLOSED' : meet.status === 'LIVE' ? '🔴 EVENT IS LIVE IN STADIUM' : `✦ ${t('competitionDetail.officialReg')}`}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              {meet.status === 'REGISTRATION_CLOSED' ? 'Registration Period Concluded' : meet.status === 'LIVE' ? 'Live Competition Underway' : t('competitionDetail.actionTitle')}
            </h3>
            <p style={{ color: '#E0F2FE', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {meet.status === 'REGISTRATION_CLOSED'
                ? 'Registration for this competition has been officially closed by the EAF Technical Committee. No new athlete entries are currently accepted.'
                : meet.status === 'LIVE'
                  ? 'This competition is currently underway live in stadium. Registration is closed. Track real-time live race results & rankings below.'
                  : currentRole === 'ATHLETE'
                    ? 'You are signed in. Click below to select your disciplines and submit your individual entry for this competition.'
                    : t('competitionDetail.regPanelSub')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {meet.status === 'REGISTRATION_CLOSED' ? (
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
            ) : currentRole === 'ATHLETE' ? (
              <button
                onClick={() => setShowIndividualModal(true)}
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
                  border: 'none'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem' }}>
                  <UserCheck size={20} color="var(--primary-dark)" /> Register for Competition
                </span>
                <ChevronRight size={18} color="var(--primary-dark)" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
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
                  border: 'none'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem' }}>
                  <User size={20} color="var(--primary-dark)" /> Sign In / Register
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
          { id: 'starters', label: t('competitionDetail.tabStarters') },
          { id: 'results', label: t('competitionDetail.tabResults') },
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
          <div className="gov-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t('competitionDetail.bib')}</th>
                    <th>{t('competitionDetail.athleteName')}</th>
                    <th>{t('competitionDetail.clubDelegation')}</th>
                    <th>{t('common.event')}</th>
                    <th>{t('competitionDetail.genderDiv')}</th>
                    <th>{t('competitionDetail.seedTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {starterList.map((st, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>{st.bib}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{st.name}</span>
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.amharicName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{st.club}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{st.event}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span className={`badge ${st.gender === 'Male' ? 'badge-blue' : 'badge-amber'}`} style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                            {st.gender === 'Male' ? 'M' : 'F'}
                          </span>
                          <span className="badge" style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '2px 6px', fontSize: '0.65rem' }}>
                            {st.ageGroup}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{st.seedTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Live Results Tab */}
        {activeTab === 'results' && (
          <div>
            {resultsData.length === 0 ? (
              <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', borderRadius: '18px' }}>
                <Trophy size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>{t('competitionDetail.resultsPending')}</h4>
                <p style={{ fontSize: '0.85rem' }}>{t('competitionDetail.resultsPendingSub')}</p>
              </div>
            ) : (
              <div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-heading)' }}>
                    <Filter size={18} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('competitionDetail.filterResults')}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('competitionDetail.eventType')}</label>
                      <select 
                        className="form-select" 
                        value={resultEventFilter} 
                        onChange={e => setResultEventFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">{t('competitionDetail.allEvents')}</option>
                        {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('competitionDetail.clubDelegation')}</label>
                      <select 
                        className="form-select" 
                        value={resultClubFilter} 
                        onChange={e => setResultClubFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">{t('competitionDetail.allClubs')}</option>
                        {uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('common.gender')}</label>
                      <select 
                        className="form-select" 
                        value={resultGenderFilter} 
                        onChange={e => setResultGenderFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">{t('competitionDetail.allGenders')}</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('competitionDetail.ageCategory')}</label>
                      <select 
                        className="form-select" 
                        value={resultAgeFilter} 
                        onChange={e => setResultAgeFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">{t('competitionDetail.allCategories')}</option>
                        <option value="Senior">{t('competitionDetail.senior')}</option>
                        <option value="U20">U20</option>
                        <option value="U18">U18</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredResults.length === 0 ? (
                  <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '36px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                    <p style={{ fontWeight: 700 }}>{t('competitionDetail.noFilterResults')}</p>
                  </div>
                ) : (
                  <div className="gov-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
                    <div className="table-responsive">
                      <table className="gov-table">
                        <thead>
                          <tr>
                            <th style={{ width: '80px' }}>{t('competitionDetail.rank')}</th>
                            <th style={{ width: '100px' }}>{t('competitionDetail.bib')}</th>
                            <th>{t('competitionDetail.athleteName')}</th>
                            <th>{t('competitionDetail.clubRegion')}</th>
                            <th>{t('common.event')}</th>
                            <th>{t('competitionDetail.timeDistance')}</th>
                            <th>{t('competitionDetail.recordStatus')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResults.map((r, i) => (
                            <tr key={i} style={{ background: r.rank <= 3 ? `rgba(200, 168, 75, 0.03)` : undefined }}>
                              <td style={{ fontWeight: 800 }}>
                                {r.rank === 1 ? '🥇 1st' : r.rank === 2 ? '🥈 2nd' : r.rank === 3 ? '🥉 3rd' : `${r.rank}th`}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>{r.bib}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{r.name}</span>
                                  {r.verified && (
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
                              </td>
                              <td style={{ fontWeight: 600 }}>{r.club}</td>
                              <td style={{ fontWeight: 700 }}>{r.event}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{r.time}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {r.nr && <span className="badge badge-red" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>NR</span>}
                                  {r.pb && <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>PB</span>}
                                  {r.sb && <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>SB</span>}
                                  {!r.nr && !r.pb && !r.sb && <span style={{ color: 'var(--text-dim, #ccc)', fontSize: '0.78rem' }}>—</span>}
                                </div>
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
          </div>
        )}

      </div>

      {/* ── INDIVIDUAL ATHLETE MEET REGISTRATION MODAL ── */}
      {showIndividualModal && (
        <div className="modal-backdrop" onClick={() => { setShowIndividualModal(false); setRegistrationPass(null); setIsPendingApproval(false); }} style={{ zIndex: 9999, padding: '24px 16px', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '0', maxWidth: '1100px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', boxShadow: '0 32px 72px rgba(15,23,42,0.35)' }}>

            {/* Modal Header with Event Banner */}
            <div className="modal-bleed-banner" style={{ position: 'relative', height: '140px', background: '#0F172A' }}>
              <img src={getBannerUrl(meet.id)} alt={meet.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
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
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>COMP-ACC-2026-984210</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.athleteName').toUpperCase()}</span>
                        <strong style={{ color: '#0F172A' }}>{faydaNationalIdData.fullName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.disciplinesEnrolled')}</span>
                        <strong style={{ color: 'var(--primary-dark)' }}>{selectedDisciplines.join(', ') || '1,500m'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>{t('competitionDetail.seedTime')}</span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>12:54.20</strong>
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
                        <input className="form-input" defaultValue="12:54.20" style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t('competitionDetail.primaryClub')}</label>
                        <input className="form-input" defaultValue="Bekoji Athletics Club" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 800 }}>{t('competitionDetail.emergencyContact')}</label>
                        <input className="form-input" defaultValue="Ato Bekele Negash (+251 91 111 2233)" style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.85rem' }} />
                      </div>
                    </div>

                  </div>

                  {/* Submit Enrollment Button */}
                  <button
                    onClick={() => setIsPendingApproval(true)}
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

            {/* Demo Credentials Box */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.82rem', color: '#1E40AF' }}>
              <div style={{ fontWeight: 800, marginBottom: '2px' }}>💡 Demo Test Credentials:</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>athlete@example.com / athlete123</div>
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px 28px', maxWidth: '520px', width: '95%', borderRadius: '24px', boxShadow: '0 25px 60px rgba(15,23,42,0.35)', border: '1px solid #E2E8F0', background: '#FFFFFF', position: 'relative' }}>
            
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
              /* Verified Scan Result Screen */
              <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '4px 12px', fontWeight: 900, marginBottom: '12px', display: 'inline-block' }}>
                  ✅ PASS VERIFIED &amp; ACCREDITED
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                  {scannedPassResult.athleteName}
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '16px' }}>
                  {scannedPassResult.bib} · PASS ID: {scannedPassResult.passId}
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div><span style={{ color: '#64748B', fontWeight: 700 }}>Event:</span> <strong>{meet.title}</strong></div>
                  <div><span style={{ color: '#64748B', fontWeight: 700 }}>Disciplines:</span> <strong>{scannedPassResult.disciplines.join(', ')}</strong></div>
                  <div><span style={{ color: '#64748B', fontWeight: 700 }}>Fayda FIN:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>{scannedPassResult.faydaFin}</strong></div>
                  <div><span style={{ color: '#64748B', fontWeight: 700 }}>Venue Access:</span> <strong style={{ color: '#16A34A' }}>Staging Tunnel &amp; Track Access Granted</strong></div>
                </div>

                <button
                  onClick={() => setScannedPassResult(null)}
                  style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#16A34A', color: '#FFF', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                >
                  Scan Another Pass
                </button>
              </div>
            ) : (
              /* Simulated Camera Scanner Box */
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

                  <div style={{ color: '#94A3B8', textAlign: 'center', zIndex: 2, padding: '0 20px' }}>
                    <Camera size={36} color="#38BDF8" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#F8FAFC', fontWeight: 700 }}>Align Athlete QR Pass within frame</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>Camera feed active · Searching for barcode...</div>
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

                <button
                  type="button"
                  onClick={() => {
                    const sampleAthlete = currentAthlete || MOCK_ATHLETES[0];
                    setScannedPassResult({
                      athleteName: sampleAthlete.name || 'Haile Demisse Tadesse',
                      bib: 'BIB-9042',
                      passId: `EAF-PASS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      disciplines: meet.disciplines ? meet.disciplines.slice(0, 2) : ['5,000m'],
                      faydaFin: sampleAthlete.faydaFin || '9840-3920-1124',
                    });
                  }}
                  className="btn-accent"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#FFF',
                    border: 'none',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                >
                  ⚡ Simulate Scan Pass &amp; Verify Access
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
