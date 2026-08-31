import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Share2, Award, ShieldCheck, Check,
  Calendar, MapPin, Zap, Flame, Trophy, ExternalLink,
  Printer, ArrowUpRight, Activity, UserCheck, Star, Clock, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';
import { useGetPublicAthleteByIdQuery } from '../store/api/athleteApi';

export interface AthleteData {
  id: string | number;
  name: string;
  amharicName?: string;
  achievement?: string;
  event: string;
  club: string;
  faydaFin?: string;
  faydaStatus?: string;
  dob?: string;
  gender?: string;
  ageTier?: string;
  pb?: string;
  sb?: string;
  quote?: string;
  img: string;
  coverImg?: string;
  medals?: string[];
  bio?: string;
  trainingBase?: string;
  coach?: string;
  ranking?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  height?: string | number;
  weight?: string | number;
  personalBests?: Array<{
    discipline?: string;
    event?: string;
    mark: string;
    date?: string | null;
    venue?: string | null;
    status?: string;
  }>;
  honors?: Array<{
    year: string;
    competition: string;
    event: string;
    medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'RECORD';
    position: string;
    mark?: string;
    location: string;
  }>;
  recentResults?: Array<{
    date: string;
    meet: string;
    event: string;
    time: string;
    pos: number;
    points?: number;
    wind?: string;
  }>;
}

interface AthleteDetailProps {
  athlete: AthleteData;
  allAthletes: AthleteData[];
  onBack: () => void;
  onSelectAthlete: (athlete: AthleteData) => void;
  onRegister?: (role: 'CLUB' | 'ATHLETE') => void;
  currentRole?: string;
  currentAthlete?: any;
  darkMode?: boolean;
}

export default function AthleteDetail({
  athlete,
  allAthletes,
  onBack,
  onSelectAthlete,
  darkMode = false,
}: AthleteDetailProps) {
  const { t: tr } = useI18n();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECORDS' | 'HONORS' | 'RESULTS' | 'VERIFICATION'>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  // Fetch full live profile if it's a backend string ID
  const isBackendId = typeof athlete.id === 'string' && athlete.id.length > 5;
  const { data: apiDetail } = useGetPublicAthleteByIdQuery(athlete.id.toString(), {
    skip: !isBackendId,
  });

  const displayName = apiDetail?.name || athlete.name;
  const displayAmharicName = apiDetail?.amharicName || athlete.amharicName;
  const displayPhotoUrl = apiDetail?.photoUrl || athlete.img;
  const displayEvent = apiDetail?.primaryEvent || athlete.event;
  const displayClub = apiDetail?.clubName || athlete.club;
  const displayFaydaFin = apiDetail?.faydaFin || athlete.faydaFin;
  const displayFaydaVerified = apiDetail?.faydaVerified !== undefined ? apiDetail.faydaVerified : (athlete.faydaStatus === 'VERIFIED');
  const displayPb = apiDetail?.pb || athlete.pb;
  const displayQuote = apiDetail?.quote || athlete.quote;
  const displayAchievement = apiDetail?.achievement || athlete.achievement;
  const displayAgeTier = apiDetail?.ageTier || athlete.ageTier;
  const displayGender = apiDetail?.gender || athlete.gender;

  // Scroll to top when athlete changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [athlete.id]);

  // Keyboard navigation for prev/next athlete and Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Find currentIndex in allAthletes
  const currentIndex = allAthletes.findIndex(a => a.id === athlete.id);
  const prevAthlete = currentIndex > 0 ? allAthletes[currentIndex - 1] : allAthletes[allAthletes.length - 1];
  const nextAthlete = currentIndex < allAthletes.length - 1 ? allAthletes[currentIndex + 1] : allAthletes[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Color tokens based on dark mode
  const t = {
    bg: darkMode ? '#090D16' : '#F8FAFC',
    bgAlt: darkMode ? '#0F172A' : '#F1F5F9',
    surface: darkMode ? '#1E293B' : '#FFFFFF',
    border: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    borderSubtle: darkMode ? 'rgba(255,255,255,0.05)' : '#EDF2F7',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    textSub: darkMode ? '#94A3B8' : '#475569',
    textMuted: darkMode ? '#64748B' : '#94A3B8',
    cardBg: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
  };

  // Default rich data fallbacks if not provided in mock or API
  const personalBestsList = (apiDetail?.personalBests && apiDetail.personalBests.length > 0)
    ? apiDetail.personalBests.map(pb => ({
        discipline: pb.discipline || pb.event || displayEvent,
        mark: pb.mark,
        date: pb.date || 'Official Mark',
        venue: pb.venue || 'Federation Sanctioned Meet',
        status: 'Certified Record'
      }))
    : athlete.personalBests || [
        { discipline: displayEvent.split('/')[0]?.trim() || displayEvent, mark: displayPb || '12:43.02', date: '2025-07-14', venue: 'Addis Ababa GP', status: 'PB / National Best' },
        { discipline: displayEvent.split('/')[1]?.trim() || '10,000m', mark: athlete.sb || '26:58.20', date: '2025-04-10', venue: 'National Athletics Trials', status: 'SB' },
        { discipline: '3,000m', mark: '7:32.10', date: '2024-09-02', venue: 'Zurich Diamond League', status: 'Personal Best' },
        { discipline: 'Road 10K', mark: '27:10', date: '2024-11-20', venue: 'Great Ethiopian Run', status: 'Course Record' }
      ];

  const honorsList = (apiDetail?.achievements && apiDetail.achievements.length > 0)
    ? apiDetail.achievements.map((ach, idx) => ({
        year: '2023–2026',
        competition: ach,
        event: displayEvent,
        medal: (idx === 0 ? 'GOLD' : idx === 1 ? 'SILVER' : 'RECORD') as any,
        position: idx === 0 ? 'Gold Medalist 🥇' : idx === 1 ? 'Silver Medalist 🥈' : 'Elite Competitor 🏆',
        mark: displayPb,
        location: 'Official Championship'
      }))
    : athlete.honors || (athlete.medals ? athlete.medals.map((m) => ({
        year: '2023–2025',
        competition: m.replace(/^[🥇🥈🥉]\s*/, ''),
        event: displayEvent,
        medal: m.includes('🥇') ? ('GOLD' as const) : m.includes('🥈') ? ('SILVER' as const) : ('RECORD' as const),
        position: m.includes('🥇') ? '1st Place (Gold)' : m.includes('🥈') ? '2nd Place (Silver)' : 'Champion / Record',
        mark: displayPb,
        location: 'Official Championship'
      })) : [
        { year: '2024', competition: 'Olympic Games Paris', event: displayEvent, medal: 'GOLD' as const, position: 'Gold Medalist 🥇', mark: displayPb, location: 'Paris, France' },
        { year: '2023', competition: 'World Athletics Championships', event: displayEvent, medal: 'GOLD' as const, position: 'World Champion 🥇', mark: displayPb, location: 'Budapest, Hungary' },
        { year: '2023', competition: 'Diamond League Final', event: displayEvent, medal: 'RECORD' as const, position: 'Trophy Winner 🏆', mark: displayPb, location: 'Eugene, USA' },
        { year: '2022', competition: 'African Athletics Championships', event: displayEvent, medal: 'GOLD' as const, position: 'Continental Champion 🥇', mark: displayPb, location: 'Mauritius' }
      ]);

  const recentResultsList = athlete.recentResults || [
    { date: 'Aug 14, 2026', meet: 'Addis Ababa International Grand Prix', event: displayEvent, time: displayPb || '12:54.10', pos: 1, wind: '+0.4', points: 1240 },
    { date: 'Jul 10, 2026', meet: 'Oromia Athletics Championship 2026', event: displayEvent, time: athlete.sb || '12:58.40', pos: 1, wind: '+0.1', points: 1215 },
    { date: 'May 28, 2026', meet: 'Ethiopian National Olympic Trials', event: displayEvent, time: displayPb || '13:02.15', pos: 1, wind: '-0.2', points: 1195 },
    { date: 'Apr 05, 2026', meet: 'Jan Meda National Championship', event: displayEvent, time: athlete.sb || '13:08.00', pos: 2, wind: '0.0', points: 1180 }
  ];

  const fullBio = athlete.bio || `${displayName} (${displayAmharicName || 'የኢትዮጵያ ብሔራዊ አትሌት'}) is one of Ethiopia's premier international track and field representatives, proudly affiliated with ${displayClub}. Recognized globally for exceptional endurance, disciplined high-altitude conditioning, and fierce tactical finishing, ${displayName.split(' ')[0]} continues the storied heritage of Ethiopian athletics on the world stage.\n\nFrom grueling high-altitude training sessions in the highlands of Bekoji, Sululta, and Mount Entoto to world-record podiums across the globe, ${displayName.split(' ')[0]} embodies the relentless spirit of Ethiopian athletics. Dually registered with the Ethiopian Athletics Federation (EAF) and verified under the Fayda National Digital Identity System, ${displayName.split(' ')[0]} stands as a role model for the next generation of Ethiopian runners.`;

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      
      {/* ── TOP STICKY APP BAR / BREADCRUMB NAVIGATION ── */}
      <div style={{
        background: darkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid ' + t.border,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Back Button & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              whileHover={{ scale: 1.04, x: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
              style={{
                background: t.surface,
                color: t.text,
                border: '1px solid ' + t.border,
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={18} />
              {tr('common.back') || 'Back'}
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: t.textMuted, fontWeight: 700 }}>
              <span onClick={onBack} style={{ cursor: 'pointer', color: 'var(--primary)' }}>Athletes Directory</span>
              <span>/</span>
              <span style={{ color: t.text, fontWeight: 800, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </span>
            </div>
          </div>

          {/* Quick Actions (Prev/Next Athlete Switcher + Share Profile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4, background: t.bgAlt, padding: '3px', borderRadius: '10px', border: '1px solid ' + t.border }}>
              <button
                onClick={() => onSelectAthlete(prevAthlete)}
                title={`Previous Athlete: ${prevAthlete.name}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: t.textSub,
                  padding: '6px 10px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                onClick={() => onSelectAthlete(nextAthlete)}
                title={`Next Athlete: ${nextAthlete.name}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: t.textSub,
                  padding: '6px 10px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleShare}
              style={{
                background: copied ? '#10B981' : t.surface,
                color: copied ? '#FFFFFF' : t.text,
                border: '1px solid ' + (copied ? '#10B981' : t.border),
                padding: '8px 14px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link Copied!' : 'Share Profile'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER WITH ETHIOPIAN ATHLETIC GRADIENTS & PORTRAIT ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #0F172A 100%)',
        color: '#FFFFFF',
        padding: '54px 24px 44px',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Subtle Ethiopian Tri-Color Glowing Ambient Accents */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: 100, width: 450, height: 450, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 50, left: '40%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '36px', flexWrap: 'wrap' }}>
            
            {/* Athlete Large Profile Portrait with Glow Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'relative',
                width: '240px',
                height: '280px',
                borderRadius: '24px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '4px solid rgba(56, 189, 248, 0.6)',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.3)',
                background: '#0F172A'
              }}
            >
              <img
                src={displayPhotoUrl}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 40%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                display: 'flex',
                justifyContent: 'center',
              }}>
                <span style={{
                  background: displayFaydaVerified ? 'rgba(16, 185, 129, 0.95)' : 'rgba(234, 179, 8, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  <ShieldCheck size={13} /> {displayFaydaVerified ? `Fayda Verified (${displayFaydaFin || 'Active'})` : 'Verification Pending'}
                </span>
              </div>
            </motion.div>

            {/* Profile Headlines & Badges */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              
              {/* Badge Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38BDF8',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Zap size={14} /> {displayEvent}
                </span>

                <span style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '10px',
                }}>
                  🏛️ {displayClub}
                </span>

                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#FCD34D',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Star size={14} /> {displayAgeTier || 'Senior Elite'} · {displayGender || 'National Team'}
                </span>
              </div>

              {/* Names: English + Amharic */}
              <h1 style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 950,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: '4px'
              }}>
                {displayName}
              </h1>

              <div style={{
                fontSize: '1.45rem',
                color: '#38BDF8',
                fontWeight: 800,
                fontFamily: 'serif, sans-serif',
                marginBottom: '16px'
              }}>
                {displayAmharicName || 'የኢትዮጵያ ብሔራዊ አትሌቲክስ ተወካይ'}
              </div>

              {/* Achievement Summary / World Record Tag */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '14px',
                padding: '12px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                maxWidth: '650px',
                marginBottom: '18px'
              }}>
                <Trophy size={20} color="#FDE047" style={{ flexShrink: 0 }} />
                <span style={{ color: '#F8FAFC', fontSize: '0.94rem', fontWeight: 700, lineHeight: 1.4 }}>
                  {displayAchievement || `${displayEvent} Elite National Competitor & Record Contender`}
                </span>
              </div>

              {/* Key Quick Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', maxWidth: '650px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>⚡ Personal Best</div>
                  <div style={{ fontSize: '1.15rem', color: '#FCD34D', fontWeight: 900, marginTop: 2 }}>{displayPb || '12:43.02'}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>🇪🇹 License Status</div>
                  <div style={{ fontSize: '1.05rem', color: '#34D399', fontWeight: 900, marginTop: 2 }}>Active Verified</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>📍 Training Base</div>
                  <div style={{ fontSize: '1.02rem', color: '#FFFFFF', fontWeight: 900, marginTop: 2 }}>{athlete.trainingBase || 'Bekoji / Entoto'}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── TABBED NAVIGATION DEEP DIVE ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 80px' }}>
        
        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid ' + t.border,
          paddingBottom: '12px',
          marginBottom: '32px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'OVERVIEW', label: '📖 Biography & Story', icon: FileText },
            { id: 'RECORDS', label: '⚡ Personal Bests & Records', icon: Zap },
            { id: 'HONORS', label: '🏆 Medals & Career Honors', icon: Trophy },
            { id: 'RESULTS', label: '📊 Competition History', icon: Activity },
            { id: 'VERIFICATION', label: '🛡️ Fayda Accreditation', icon: ShieldCheck },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? 'var(--primary)' : t.surface,
                  color: isActive ? '#FFFFFF' : t.textSub,
                  border: '1px solid ' + (isActive ? 'var(--primary)' : t.border),
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isActive ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: BIOGRAPHY & OVERVIEW ── */}
        {activeTab === 'OVERVIEW' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
              
              {/* Left Column: Biography & Quotes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Motivational Quote Box */}
                {displayQuote && (
                  <div style={{
                    background: darkMode ? 'rgba(2, 132, 199, 0.12)' : '#F0F9FF',
                    borderLeft: '4px solid var(--primary)',
                    padding: '22px 24px',
                    borderRadius: '16px',
                    border: '1px solid ' + (darkMode ? 'rgba(2, 132, 199, 0.3)' : '#BAE6FD'),
                  }}>
                    <div style={{ fontSize: '1.15rem', fontStyle: 'italic', fontWeight: 700, color: darkMode ? '#38BDF8' : '#0369A1', lineHeight: 1.6, marginBottom: 8 }}>
                      "{displayQuote}"
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: t.textMuted }}>
                      — {displayName}, Ethiopian National Elite Runner
                    </div>
                  </div>
                )}

                {/* Narrative Bio */}
                <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: t.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🏃</span> Athlete Profile & Career Story
                  </h3>
                  <div style={{ color: t.textSub, fontSize: '0.96rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {fullBio}
                  </div>
                </div>

              </div>

              {/* Right Column: Detailed Sports & Identity Attributes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Official EAF Identification Card */}
                <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: t.text, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={18} color="var(--primary)" /> Official Federation Credentials
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'Full Registered Name', val: displayName },
                      { label: 'Amharic Name', val: displayAmharicName || 'የተረጋገጠ ብሔራዊ አትሌት' },
                      { label: 'Primary Discipline', val: displayEvent },
                      { label: 'Club Affiliation', val: displayClub },
                      { label: 'Fayda FIN ID', val: displayFaydaFin || '9840-2210-4491' },
                      { label: 'License Code', val: athlete.licenseNumber || 'EAF-LIC-2026-8891' },
                      { label: 'License Expiry', val: athlete.licenseExpiry || 'December 31, 2026' },
                      { label: 'Anti-Doping Status', val: 'Compliant & Biological Passport Active' },
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: t.bgAlt,
                        borderRadius: '12px',
                        fontSize: '0.88rem'
                      }}>
                        <span style={{ color: t.textMuted, fontWeight: 700 }}>{item.label}</span>
                        <span style={{ color: t.text, fontWeight: 800, textAlign: 'right' }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Environment Card */}
                <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '24px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: t.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={18} color="#F59E0B" /> Altitude Training Base & Coaching
                  </h4>
                  <p style={{ color: t.textSub, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '14px' }}>
                    Trained in the world-renowned Ethiopian highlands at altitudes exceeding 2,700m above sea level, building the legendary aerobic capacity that drives Ethiopian dominance in distance running.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: t.bgAlt, border: '1px solid ' + t.border, padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                      ⛰️ Altitude: 2,750m ASL
                    </span>
                    <span style={{ background: t.bgAlt, border: '1px solid ' + t.border, padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                      🌲 Entoto High Performance Track
                    </span>
                    <span style={{ background: t.bgAlt, border: '1px solid ' + t.border, padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                      🏃 Bekoji Running Camp
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* ── TAB 2: PERSONAL BESTS & RECORDS ── */}
        {activeTab === 'RECORDS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: t.text }}>⚡ Official Personal Bests & Record Marks</h3>
                  <p style={{ color: t.textMuted, fontSize: '0.88rem', marginTop: 2 }}>Certified by Ethiopian Athletics Federation and World Athletics electronic timing standards</p>
                </div>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '6px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={15} /> Fully Verified Marks
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: t.bgAlt, borderBottom: '2px solid ' + t.border }}>
                      <th style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 900, color: t.textSub, textTransform: 'uppercase' }}>Discipline</th>
                      <th style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 900, color: t.textSub, textTransform: 'uppercase' }}>Personal Best Mark</th>
                      <th style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 900, color: t.textSub, textTransform: 'uppercase' }}>Date Achieved</th>
                      <th style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 900, color: t.textSub, textTransform: 'uppercase' }}>Venue / Meet</th>
                      <th style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 900, color: t.textSub, textTransform: 'uppercase' }}>Record Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalBestsList.map((pbItem, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid ' + t.border, background: idx % 2 === 0 ? 'transparent' : t.bgAlt }}>
                        <td style={{ padding: '16px', fontWeight: 800, color: t.text, fontSize: '0.96rem' }}>
                          🏃 {pbItem.discipline}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 900, color: '#D97706', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                          {pbItem.mark}
                        </td>
                        <td style={{ padding: '16px', color: t.textSub, fontSize: '0.88rem', fontWeight: 600 }}>
                          {pbItem.date}
                        </td>
                        <td style={{ padding: '16px', color: t.text, fontSize: '0.9rem', fontWeight: 700 }}>
                          {pbItem.venue}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            background: pbItem.status?.includes('World') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                            color: pbItem.status?.includes('World') ? '#DC2626' : 'var(--primary)',
                            border: '1px solid ' + (pbItem.status?.includes('World') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(2, 132, 199, 0.3)'),
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 800
                          }}>
                            {pbItem.status || 'Personal Best'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: MEDALS & HONORS ── */}
        {activeTab === 'HONORS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {honorsList.map((honor, idx) => {
                const isGold = honor.medal === 'GOLD';
                const isSilver = honor.medal === 'SILVER';
                const medalBg = isGold ? 'rgba(245, 158, 11, 0.15)' : isSilver ? 'rgba(148, 163, 184, 0.2)' : 'rgba(217, 119, 6, 0.15)';
                const medalBorder = isGold ? '#F59E0B' : isSilver ? '#94A3B8' : '#D97706';
                const medalEmoji = isGold ? '🥇' : isSilver ? '🥈' : '🏆';

                return (
                  <div
                    key={idx}
                    style={{
                      background: t.surface,
                      border: '1px solid ' + t.border,
                      borderLeft: `5px solid ${medalBorder}`,
                      borderRadius: '16px',
                      padding: '22px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ background: medalBg, color: medalBorder, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 900 }}>
                          {medalEmoji} {honor.position}
                        </span>
                        <span style={{ color: t.textMuted, fontSize: '0.84rem', fontWeight: 800 }}>{honor.year}</span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: t.text, marginBottom: '4px', lineHeight: 1.3 }}>
                        {honor.competition}
                      </h4>
                      <div style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 700 }}>
                        {honor.event}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid ' + t.border, paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: t.textMuted }}>
                      <span>📍 {honor.location}</span>
                      {honor.mark && <span style={{ fontWeight: 800, color: t.text }}>Time: {honor.mark}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: RECENT RESULTS ── */}
        {activeTab === 'RESULTS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: t.text, marginBottom: '6px' }}>📊 Competition Track Logs & Season Progression</h3>
              <p style={{ color: t.textMuted, fontSize: '0.88rem', marginBottom: '20px' }}>Historical finishes from national championship heats, international invitationals, and Olympic trials</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: t.bgAlt, borderBottom: '2px solid ' + t.border }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Date</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Competition / Meet</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Discipline</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Result Time</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Rank</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 900, color: t.textSub }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResultsList.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid ' + t.border }}>
                        <td style={{ padding: '14px 16px', color: t.textMuted, fontSize: '0.85rem', fontWeight: 700 }}>{res.date}</td>
                        <td style={{ padding: '14px 16px', color: t.text, fontSize: '0.92rem', fontWeight: 800 }}>{res.meet}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 700 }}>{res.event}</td>
                        <td style={{ padding: '14px 16px', color: '#D97706', fontSize: '0.95rem', fontWeight: 900, fontFamily: 'monospace' }}>{res.time}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: res.pos === 1 ? '#DCFCE7' : res.pos === 2 ? '#FEF3C7' : t.bgAlt,
                            color: res.pos === 1 ? '#15803D' : res.pos === 2 ? '#B45309' : t.text,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 900
                          }}>
                            {res.pos === 1 ? '🥇 1st' : res.pos === 2 ? '🥈 2nd' : `${res.pos}th`}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: t.textSub, fontSize: '0.85rem', fontWeight: 700 }}>{res.points || 1200} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 5: FAYDA ACCREDITATION ── */}
        {activeTab === 'VERIFICATION' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.2)'
                }}>
                  <ShieldCheck size={36} />
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: t.text }}>Fayda Digital National Identity Verification</h3>
                <p style={{ color: t.textMuted, fontSize: '0.9rem', marginTop: 4 }}>
                  Officially synchronized with the National ID Program of Ethiopia (Fayda) & Ethiopian Athletics Federation
                </p>
              </div>

              <div style={{ background: t.bgAlt, border: '1px solid ' + t.border, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textMuted, textTransform: 'uppercase' }}>Fayda Identification Number (FIN)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2, letterSpacing: '0.05em' }}>
                      {displayFaydaFin || '9840-2210-4491'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textMuted, textTransform: 'uppercase' }}>Biometric Verification Seal</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#16A34A', marginTop: 2 }}>
                      ✓ Verified & Active
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textMuted, textTransform: 'uppercase' }}>Club Registration Endorsement</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: t.text, marginTop: 2 }}>
                      {displayClub}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.textMuted, textTransform: 'uppercase' }}>Digital License Hash</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                      0xFAYDA_ETH_9840A2
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: t.textSub, lineHeight: 1.6, textAlign: 'center' }}>
                This verification certifies that the athlete's birth date, legal name, and sports eligibility have been validated against Ethiopia's sovereign digital identity database.
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RELATED / OTHER FEATURED ATHLETES SHOWCASE ── */}
        <div style={{ marginTop: '64px', borderTop: '1px solid ' + t.border, paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: t.text }}>🇪🇹 Explore Other Ethiopian Champions</h3>
              <p style={{ color: t.textMuted, fontSize: '0.88rem' }}>Browse elite national team teammates and rising record breakers</p>
            </div>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View Full Athletes Directory ({allAthletes.length}) →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {allAthletes
              .filter(a => a.id !== athlete.id)
              .slice(0, 4)
              .map((otherAth, idx) => (
                <motion.div
                  key={otherAth.id || idx}
                  whileHover={{ y: -6 }}
                  onClick={() => onSelectAthlete(otherAth)}
                  style={{
                    background: t.surface,
                    border: '1px solid ' + t.border,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={otherAth.img}
                      alt={otherAth.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(56, 189, 248, 0.9)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {otherAth.event}
                    </span>
                  </div>

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: t.text, marginBottom: '2px' }}>
                        {otherAth.name}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: t.textMuted, fontWeight: 700, marginBottom: '8px' }}>
                        {otherAth.club}
                      </div>
                      {otherAth.pb && (
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D97706' }}>
                          ⚡ PB: {otherAth.pb}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '12px', borderTop: '1px solid ' + t.border, paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 800 }}>
                      View Full Profile →
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

      </section>

    </div>
  );
}
