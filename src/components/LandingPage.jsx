import React, { useState, useRef } from 'react';
import { Trophy, Calendar, MapPin, ChevronRight, Mail, Phone, Globe, Users, Award, Activity, BookOpen, Search, Filter, Clock, CheckCircle, X, Send, Play, Image, Sparkles, ShieldCheck, ChevronLeft, ArrowRight, UserCheck } from 'lucide-react';
import CompetitionDetail from './CompetitionDetail';

/* ─────────────────────────────────────────────
   STATIC DATA & GALLERY IMAGES
   ───────────────────────────────────────────── */
const NEWS = [
  {
    id: 1,
    date: 'May 18, 2026',
    title: 'Ethiopia Finishes 24th African Championship with 15 Medals',
    summary: 'Ethiopia collected 7 gold, 4 silver, and 4 bronze medals at the 24th African Athletics Championship hosted in Accra, Ghana.',
    tag: 'Championship',
    img: '/images/d1.jpg',
    featured: true,
  },
  { id: 2, date: 'Apr 26, 2026', title: 'Ethiopian Heroes Dominate London Marathon', tag: 'Marathon', img: '/images/d2.jpeg' },
  { id: 3, date: 'Apr 26, 2026', title: '4th Ethiopia Tamirt 10KM Won by Nibret Kinde & Birtukan Mola', tag: 'Road Race', img: '/images/d3.jpeg' },
  { id: 4, date: 'Apr 26, 2026', title: '10-Day Athletics Judging Training Completed', tag: 'Training', img: '/images/d4.jpg' },
  { id: 5, date: 'May 10, 2026', title: 'Ethiopian Delegation Departs for African Championships', tag: 'Championship', img: '/images/d5.jpg' },
  { id: 6, date: 'May 10, 2026', title: 'National Team Official Send-Off Ceremony Held', tag: 'National Team', img: '/images/a1.jpg' },
];

const ENRICHED_MEETS = [
  {
    id: "MEET-2026-01",
    title: "Addis Ababa International Grand Prix 2026",
    amharic: "አዲስ አበባ ግራንድ ፕሪ 2026",
    venue: "Addis Ababa National Stadium",
    date: "2026-08-12",
    dateString: "August 12–14, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "5,000m", "10,000m", "800m", "1,500m", "3,000m Steeplechase", "Marathon"],
    region: "Addis Ababa",
    img: "/images/banner_grand_prix.png"
  },
  {
    id: "MEET-2026-02",
    title: "Ethiopian National Youth Olympic Games U18/U20",
    amharic: "ብሔራዊ የወጣቶች ኦሎምፒክ ጨዋታዎች",
    venue: "Hawassa International Stadium",
    date: "2026-09-05",
    dateString: "September 5–8, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "800m", "1,500m", "5,000m", "3,000m Steeplechase", "High Jump", "Long Jump"],
    region: "Sidama",
    img: "/images/banner_youth_games.png"
  },
  {
    id: "MEET-2026-03",
    title: "Jan Meda National Cross-Country Olympic Trials",
    amharic: "ጃን ሜዳ ብሔራዊ ምርጫ",
    venue: "Jan Meda Race Course, Addis Ababa",
    date: "2026-10-20",
    dateString: "October 20, 2026",
    status: "UPCOMING",
    disciplines: ["10km Senior Men", "10km Senior Women", "8km U20 Men", "6km U18 Mixed"],
    region: "Addis Ababa",
    img: "/images/banner_jan_meda.png"
  },
  {
    id: "MEET-2026-04",
    title: "Oromia Athletics Championship 2026",
    amharic: "የኦሮሚያ አትሌቲክስ ሻምፒዮና 2026",
    venue: "Asella Stadium",
    date: "2026-07-10",
    dateString: "July 10-12, 2026",
    status: "LIVE",
    disciplines: ["5,000m", "10,000m", "800m"],
    region: "Oromia",
    img: "/images/d1.jpg"
  },
  {
    id: "MEET-2026-05",
    title: "Amhara Track & Field Open",
    amharic: "የአማራ ትራክ እና ፊልድ ክፍት ውድድር",
    venue: "Bahir Dar International Stadium",
    date: "2026-11-14",
    dateString: "November 14-16, 2026",
    status: "UPCOMING",
    disciplines: ["800m", "1,500m", "High Jump"],
    region: "Amhara",
    img: "/images/runners_training.png"
  },
  {
    id: "MEET-2026-06",
    title: "Tigray Regional Athletics Meet",
    amharic: "የትግራይ ክልላዊ አትሌቲክስ ውድድር",
    venue: "Mekelle Stadium",
    date: "2026-06-25",
    dateString: "June 25-27, 2026",
    status: "REGISTRATION_CLOSED",
    disciplines: ["5,000m", "10,000m", "1,500m"],
    region: "Tigray",
    img: "/images/d2.jpeg"
  }
];

const ATHLETES = [
  {
    id: 1,
    name: 'Tigst Assefa',
    amharicName: 'ትዕግስት አሰፋ',
    achievement: '2023 Berlin Marathon World Record — 2:11:53',
    event: 'Marathon',
    club: 'Ethiopian National Team / Adidas',
    faydaFin: '9840-2210-4491',
    faydaStatus: 'VERIFIED',
    dob: '1996-12-03',
    gender: 'Female',
    ageTier: 'Senior',
    pb: '2:11:53 (World Record)',
    quote: 'Hard work in Bekoji and dedication to my country bring world records to Ethiopia.',
    img: '/images/a1.jpg',
    medals: ['🥇 Berlin Marathon 2023 (WR)', '🥇 Berlin Marathon 2022', '🥈 Olympic Games 2024'],
  },
  {
    id: 2,
    name: 'Selemon Barega',
    amharicName: 'ሰለሞን ባረጋ',
    achievement: 'Olympic 10,000m Champion — Tokyo 2020',
    event: '5,000m / 10,000m',
    club: 'Ethiopian National Team / Defense AC',
    faydaFin: '4410-9830-1120',
    faydaStatus: 'VERIFIED',
    dob: '2000-01-20',
    gender: 'Male',
    ageTier: 'Senior',
    pb: '12:43.02 (5000m) / 26:44.73 (10000m)',
    quote: 'Stepping onto the track with the green, yellow, and red flag is my greatest honor.',
    img: '/images/a2.jpg',
    medals: ['🥇 Tokyo 2020 Olympic Gold 10,000m', '🥇 World Indoor Champion 3000m', '🥈 World Championships Silver'],
  },
  {
    id: 3,
    name: 'Haile Demisse Tadesse',
    amharicName: 'ኃይሌ ደሚሴ ታደሰ',
    achievement: 'Addis Ababa Grand Prix 5,000m Champion',
    event: '5,000m / 10,000m',
    club: 'Defense Athletics Club',
    faydaFin: '9840-3920-1124',
    faydaStatus: 'VERIFIED',
    dob: '2002-04-12',
    gender: 'Male',
    ageTier: 'Senior',
    pb: '12:51.44 (5000m) / 26:58.20 (10000m)',
    quote: 'Every altitude training run in Entoto prepares us to conquer global competitions.',
    img: '/images/runner_marathon.png',
    medals: ['🥇 2025 Addis Ababa GP Gold', '🥈 National Championships Silver'],
  },
  {
    id: 4,
    name: 'Sifan Mengistu Wolde',
    amharicName: 'ሲፋን መንግስቱ ወልዴ',
    achievement: 'Ethiopian Olympic Trials 10,000m Champion',
    event: '10,000m / Marathon',
    club: 'Oromia Police Sports Club',
    faydaFin: '6021-9983-4112',
    faydaStatus: 'VERIFIED',
    dob: '2004-01-30',
    gender: 'Female',
    ageTier: 'Senior',
    pb: '29:42.10 (10000m) / 1:04:30 (Half Marathon)',
    quote: 'Perseverance and faith turn every challenging kilometer into victory.',
    img: '/images/runner_female.png',
    medals: ['🥇 2025 Ethiopian Olympic Trial Champion', '🥇 Hawassa Half Marathon Winner'],
  }
];

const GALLERY_IMAGES = [
  { id: 1, title: 'African Championships 2026 Medal Ceremony', category: 'Championships', img: '/images/d1.jpg', location: 'Accra Stadium', date: 'May 2026' },
  { id: 2, title: 'London Marathon Ethiopian Elite Champions', category: 'Marathons', img: '/images/d2.jpeg', location: 'London, UK', date: 'April 2026' },
  { id: 3, title: '4th Ethiopia Tamirt 10KM Start Line', category: 'Track & Field', img: '/images/d3.jpeg', location: 'Addis Ababa', date: 'April 2026' },
  { id: 4, title: 'Technical Athletics Officials & Judging Seminar', category: 'Ceremonies', img: '/images/d4.jpg', location: 'EAF HQ', date: 'April 2026' },
  { id: 5, title: 'National Team Delegation Send-Off Ceremony', category: 'Ceremonies', img: '/images/d5.jpg', location: 'Skylight Hotel', date: 'May 2026' },
  { id: 6, title: 'Tigst Assefa Berlin World Record Moment', category: 'Marathons', img: '/images/a1.jpg', location: 'Berlin, Germany', date: 'September 2023' },
  { id: 7, title: 'Selemon Barega Olympic Gold Victory Lap', category: 'Championships', img: '/images/a2.jpg', location: 'Tokyo Olympic Stadium', date: 'August 2021' },
  { id: 8, title: 'High Altitude Endurance Training in Sululta', category: 'Track & Field', img: '/images/runners_training.png', location: 'Sululta, Ethiopia', date: 'June 2026' },
];

const STRUCTURE_ITEMS = [
  { icon: <Users size={22} color="#0EA5E9" />, title: 'General Assembly', amharic: 'ጠቅላላ ጉባኤ' },
  { icon: <Award size={22} color="#0EA5E9" />, title: 'Executive Committee', amharic: 'ስራ አስፈጻሚ' },
  { icon: <Activity size={22} color="#0EA5E9" />, title: 'Technical Committee', amharic: 'ቴክኒካዊ ኮሚቴ' },
  { icon: <BookOpen size={22} color="#0EA5E9" />, title: 'Training & Research', amharic: 'ስልጠናና ምርምር' },
];

const QUICK_LINKS = [
  ['Home', 'ቅድመ ገፅ', '#home'],
  ['News', 'ዜና', '#news'],
  ['Competitions', 'ውድድሮች', '#competitions'],
  ['Results', 'ውጤት', '#competitions'],
  ['Athlete Profile', 'አትሌት ፕሮፋይል', '#athletes'],
  ['Gallery', 'ምስል', '#media'],
  ['Contact', 'ያግኙን', '#contact'],
];

const TAG_COLORS = {
  Championship:   { bg: '#E0F2FE', color: '#0369A1' },
  Marathon:       { bg: '#FEF3C7', color: '#B45309' },
  'Road Race':    { bg: '#DCFCE7', color: '#15803D' },
  Training:       { bg: '#F3E8FF', color: '#6B21A8' },
  'National Team':{ bg: '#FEE2E2', color: '#B91C1C' },
};

/* ─────────────────────────────────────────────
   VECTOR ILLUSTRATION COMPONENTS
   ───────────────────────────────────────────── */
const VectorRunnerDecoration = () => (
  <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15 }}>
    <path d="M40 240 Q 120 180, 200 220 T 320 160" stroke="#0EA5E9" strokeWidth="6" strokeDasharray="8 8" fill="none" />
    <path d="M20 260 Q 100 200, 180 240 T 300 180" stroke="#38BDF8" strokeWidth="4" fill="none" />
    <circle cx="220" cy="80" r="35" fill="url(#grad1)" />
    <polygon points="120,40 140,80 180,90 150,120 160,160 120,140 80,160 90,120 60,90 100,80" fill="none" stroke="#F59E0B" strokeWidth="2" />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
      </linearGradient>
    </defs>
  </svg>
);

const VectorTrackLines = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
    <path d="M-50 180 C 200 80, 400 220, 850 40" stroke="#0EA5E9" strokeWidth="8" />
    <path d="M-50 160 C 200 60, 400 200, 850 20" stroke="#0EA5E9" strokeWidth="6" />
    <path d="M-50 140 C 200 40, 400 180, 850 0" stroke="#F59E0B" strokeWidth="6" />
  </svg>
);

export default function LandingPage({ onSelectRole, onRegister, language = 'en', publicSubPage = 'HOME', onChangePublicSubPage }) {
  const [selectedMeetId, setSelectedMeetId] = useState(null);
  const [selectedAthleteModal, setSelectedAthleteModal] = useState(null);
  const [selectedGalleryTab, setSelectedGalleryTab] = useState('All');
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Search/Filter states
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortByDate, setSortByDate] = useState('UPCOMING_FIRST');

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  const bannerScrollRef = useRef(null);

  const handleScrollBanners = (direction) => {
    if (bannerScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      bannerScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactSuccess(false);
    }, 4000);
  };

  // Localized string packs
  const loc = {
    heroTitle: language === 'en' 
      ? 'EAF Digital Athlete Portal: Verify, Register & Track Live results in Real-time' 
      : 'የኢትዮጵያ አትሌቲክስ ዲጂታል ፖርታል: ይመዝገቡ፣ ያረጋግጡ እና ውጤቶችን በቀጥታ ይከታተሉ',
    heroSubtitle: language === 'en'
      ? 'Welcome to the official digital hub of the Ethiopian Athletics Federation. Verify your Fayda ID, register your club, and access live starter lists and real-time results.'
      : 'ወደ የኢትዮጵያ አትሌቲክስ ፌዴሬሽን ይፋዊ የዲጂታል መድረክ እንኳን በደህና መጡ። የፋይዳ ብሔራዊ መታወቂያዎን ያረጋግጡ፣ ክለብዎን ይመዝግቡ እና የቀጥታ ውድድር ውጤቶችን ያግኙ።',
    btnPrimary: language === 'en' ? 'Register / Verify EAF ID' : 'የኢፌአ መታወቂያ ይመዝገቡ/ያረጋግጡ',
    btnSecondary: language === 'en' ? 'Explore Competitions & Live Results' : 'ውድድሮች እና የቀጥታ ውጤቶችን ያስሱ',
    searchPlaceholder: language === 'en' ? 'Search by competition, athlete, or event...' : 'በውድድር ስም፣ አትሌት ወይም ስፖርት አይነት ይፈልጉ...',
    regionLabel: language === 'en' ? 'Region / State' : 'ክልል / መገኛ',
    statusLabel: language === 'en' ? 'Status' : 'የውድድር ሁኔታ',
    startDateLabel: language === 'en' ? 'Start Date' : 'የመጀመሪያ ቀን',
    endDateLabel: language === 'en' ? 'End Date' : 'የመጨረሻ ቀን',
    sortLabel: language === 'en' ? 'Sort Date' : 'ቅደም ተከተል',
    sortUpcoming: language === 'en' ? 'Upcoming First' : 'መጪ ውድድር ይቀድም',
    sortOldest: language === 'en' ? 'Oldest First' : 'ቀደምት ውድድር ይቀድም',
    
    all: language === 'en' ? 'All' : 'ሁሉም',
    regOpen: language === 'en' ? 'Open for Registration' : 'ምዝገባ ክፍት ነው',
    regClosed: language === 'en' ? 'Registration Closed' : 'ምዝገባ ተዘግቷል',
    live: language === 'en' ? 'Live' : 'በቀጥታ ስርጭት',
    upcoming: language === 'en' ? 'Upcoming' : 'መጪ ውድድር',

    newsTitle: language === 'en' ? 'Latest News & Updates' : 'አዳዲስ ዜናዎች',
    competitionsTitle: language === 'en' ? 'Competitions & Championship Hub' : 'የውድድሮች ማዕከል',
    athletesTitle: language === 'en' ? 'Featured Ethiopian Athletics Stars' : 'የኢትዮጵያ አትሌቲክስ ኮከቦች',
    aboutTitle: language === 'en' ? 'About Ethiopian Athletics Federation' : 'ስለ ኢትዮጵያ አትሌቲክስ ፌዴሬሽን',
    structureTitle: language === 'en' ? 'Federation Governance Structure' : 'የፌዴሬሽኑ መዋቅር',
    partnersTitle: language === 'en' ? 'Official Federation Sponsors & Corporate Partners' : 'ስፖንሰሮች እና አጋሮች',
  };

  const filteredMeets = ENRICHED_MEETS.filter(meet => {
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchTitle = meet.title.toLowerCase().includes(q) || (meet.amharic && meet.amharic.toLowerCase().includes(q));
      const matchVenue = meet.venue.toLowerCase().includes(q);
      const matchEvent = meet.disciplines.some(d => d.toLowerCase().includes(q));
      if (!matchTitle && !matchVenue && !matchEvent) return false;
    }
    if (regionFilter !== 'ALL' && meet.region !== regionFilter) return false;
    if (statusFilter !== 'ALL' && meet.status !== statusFilter) return false;
    if (startDate && new Date(meet.date) < new Date(startDate)) return false;
    if (endDate && new Date(meet.date) > new Date(endDate)) return false;
    return true;
  });

  const sortedMeets = [...filteredMeets].sort((a, b) => {
    const dA = new Date(a.date);
    const dB = new Date(b.date);
    return sortByDate === 'UPCOMING_FIRST' ? dA - dB : dB - dA;
  });

  if (selectedMeetId) {
    const meetObj = ENRICHED_MEETS.find(m => m.id === selectedMeetId);
    return (
      <CompetitionDetail 
        meet={meetObj}
        onBack={() => setSelectedMeetId(null)}
        onRegister={onRegister}
        language={language}
      />
    );
  }

  const filteredGallery = selectedGalleryTab === 'All' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === selectedGalleryTab);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── 1. HERO SECTION WITH VECTOR GRAPHICS ── */}
      {publicSubPage === 'HOME' && (
        <section 
          id="home" 
          style={{
            position: 'relative', 
            minHeight: '520px',
            background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 40%, #FFFFFF 100%)',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 24px 70px',
            margin: '0',
            overflow: 'hidden'
          }}
        >
          {/* Vector decorative background accents */}
          <VectorTrackLines />
          <div style={{ position: 'absolute', right: '-40px', top: '20px', pointerEvents: 'none' }}>
            <VectorRunnerDecoration />
          </div>
          <div style={{ position: 'absolute', left: '-60px', bottom: '10px', pointerEvents: 'none', transform: 'scaleX(-1)' }}>
            <VectorRunnerDecoration />
          </div>

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '920px', margin: '0 auto' }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #BAE6FD', padding: '6px 16px', borderRadius: '30px', boxShadow: '0 4px 14px rgba(14,165,233,0.12)', marginBottom: '20px' }}>
              <Sparkles size={16} color="#0EA5E9" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284C7', letterSpacing: '0.04em' }}>
                ETHIOPIAN ATHLETICS FEDERATION — BIOMETRIC PLATFORM
              </span>
            </div>

            <h1 style={{
              color: '#0F172A',
              fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
              fontWeight: 900, 
              lineHeight: 1.15, 
              marginBottom: '18px',
              letterSpacing: '-0.025em'
            }}>
              {loc.heroTitle}
            </h1>

            <p style={{
              color: '#475569', 
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              maxWidth: '720px', 
              margin: '0 auto 36px', 
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              {loc.heroSubtitle}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              {/* Primary CTA */}
              <button 
                onClick={() => onRegister('ATHLETE')}
                className="btn-accent"
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(2, 132, 199, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.25s ease'
                }}
              >
                <CheckCircle size={20} />
                {loc.btnPrimary}
              </button>

              {/* Secondary CTA */}
              <button 
                onClick={() => {
                  const el = document.getElementById('competitions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'none'; }}
              >
                <Trophy size={20} color="#0EA5E9" />
                {loc.btnSecondary}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. INTEGRATED SEARCH BAR & FILTER WIDGET ── */}
      {(publicSubPage === 'HOME' || publicSubPage === 'COMPETITIONS') && (
        <div style={{ padding: '0 24px', position: 'relative', zIndex: 10, marginTop: publicSubPage === 'COMPETITIONS' ? '40px' : 0 }}>
          <div 
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
              padding: '28px',
              width: '100%',
              maxWidth: '1200px',
              margin: publicSubPage === 'HOME' ? '-35px auto 40px' : '0 auto 40px',
              color: '#0F172A',
            }}
          >
            {/* Free-text Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search 
                size={22} 
                style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#0EA5E9' }} 
              />
              <input 
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder={loc.searchPlaceholder}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '16px 16px 16px 54px',
                  color: '#0F172A',
                  fontSize: '1.02rem',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#0EA5E9'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            {/* Filter Widgets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>{loc.regionLabel}</label>
                <select 
                  className="form-select" 
                  value={regionFilter} 
                  onChange={e => setRegionFilter(e.target.value)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '12px', padding: '11px 14px' }}
                >
                  <option value="ALL">{language === 'en' ? 'All Regions' : 'ሁሉም ክልሎች'}</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Oromia">Oromia</option>
                  <option value="Amhara">Amhara</option>
                  <option value="Sidama">Sidama</option>
                  <option value="Tigray">Tigray</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>{loc.statusLabel}</label>
                <select 
                  className="form-select" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '12px', padding: '11px 14px' }}
                >
                  <option value="ALL">{loc.all}</option>
                  <option value="REGISTRATION_OPEN">{loc.regOpen}</option>
                  <option value="REGISTRATION_CLOSED">{loc.regClosed}</option>
                  <option value="LIVE">{loc.live}</option>
                  <option value="UPCOMING">{loc.upcoming}</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>{loc.startDateLabel}</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '12px', width: '100%', padding: '11px 14px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>{loc.endDateLabel}</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '12px', width: '100%', padding: '11px 14px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>{loc.sortLabel}</label>
                <select 
                  className="form-select" 
                  value={sortByDate} 
                  onChange={e => setSortByDate(e.target.value)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '12px', padding: '11px 14px' }}
                >
                  <option value="UPCOMING_FIRST">{loc.sortUpcoming}</option>
                  <option value="OLDEST_FIRST">{loc.sortOldest}</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── 3. COMPETITIONS HUB WITH SCROLLABLE BANNERS & VIEW MORE BUTTON ── */}
      {(publicSubPage === "HOME" || publicSubPage === "COMPETITIONS") && (
        <section id="competitions" style={{ background: '#F8FAFC', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
                  {loc.competitionsTitle}
                </h2>
                <p style={{ color: '#0EA5E9', fontWeight: 700, fontSize: '0.95rem' }}>
                  {language === 'en' ? 'Active Events, Starter Lists & Schedules' : 'አሁን ያሉ ውድድሮች እና የጊዜ ሰሌዳዎች'}
                </p>
              </div>

              {/* Scroll Controls for Banners */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => handleScrollBanners('left')}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <ChevronLeft size={20} color="#0F172A" />
                </button>
                <button 
                  onClick={() => handleScrollBanners('right')}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <ChevronRight size={20} color="#0F172A" />
                </button>
              </div>
            </div>

            {/* Scrollable Horizontal Banner Cards Container */}
            {sortedMeets.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
                <Trophy size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <h4 style={{ fontWeight: 800 }}>{language === 'en' ? 'No Competitions Found' : 'ምንም ውድድሮች አልተገኙም'}</h4>
              </div>
            ) : (
              <div 
                ref={bannerScrollRef}
                style={{ 
                  display: 'flex', 
                  gap: '24px', 
                  overflowX: 'auto', 
                  paddingBottom: '16px',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'thin'
                }}
              >
                {sortedMeets.map(meet => {
                  const badgeColor = meet.status === 'REGISTRATION_OPEN' ? '#0EA5E9' : meet.status === 'LIVE' ? '#EF4444' : meet.status === 'UPCOMING' ? '#F59E0B' : '#64748B';
                  const statusName = meet.status === 'REGISTRATION_OPEN' ? loc.regOpen : meet.status === 'LIVE' ? loc.live : meet.status === 'UPCOMING' ? loc.upcoming : loc.regClosed;
                  
                  return (
                    <div 
                      key={meet.id} 
                      className="hover-lift" 
                      onClick={() => setSelectedMeetId(meet.id)}
                      style={{
                        minWidth: '360px',
                        maxWidth: '380px',
                        flexShrink: 0,
                        scrollSnapAlign: 'start',
                        position: 'relative', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        minHeight: '340px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'flex-end', 
                        cursor: 'pointer',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)'
                      }}
                    >
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${meet.img})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                      }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }} />
                      
                      <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                        <span style={{
                          background: badgeColor, 
                          color: '#FFFFFF',
                          borderRadius: '8px', 
                          padding: '4px 12px',
                          fontSize: '0.75rem', 
                          fontWeight: 800, 
                          letterSpacing: '0.04em',
                          marginBottom: '12px', 
                          display: 'inline-block',
                        }}>{statusName}</span>

                        <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.3 }}>
                          {language === 'en' ? meet.title : meet.amharic || meet.title}
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#FDE047', fontWeight: 700 }}>
                            <MapPin size={14} /> {meet.venue}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>
                            <Calendar size={14} /> {meet.dateString}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                            📍 {meet.region}
                          </span>
                          
                          <span style={{ color: '#38BDF8', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {language === 'en' ? 'View Details' : 'ዝርዝር'} <ChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MORE COMPETITIONS BUTTON */}
            {publicSubPage === 'HOME' && (
              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <button 
                  className="btn-accent" 
                  style={{ 
                    padding: '14px 36px', 
                    borderRadius: '14px', 
                    fontSize: '0.98rem', 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                    color: '#FFF',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => onChangePublicSubPage('COMPETITIONS')}
                >
                  <Trophy size={18} />
                  View All Ethiopian Competitions ({ENRICHED_MEETS.length}) →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4. FEATURED ATHLETES SPOTLIGHT (PLACED ABOVE NEWS SECTION AS REQUESTED!) ── */}
      {(publicSubPage === "HOME" || publicSubPage === "ATHLETES") && (
        <section id="athletes" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>{loc.athletesTitle}</h2>
                <p style={{ color: '#0EA5E9', fontWeight: 700, marginTop: '4px' }}>
                  Click on any athlete card to view full biometric & competition profile details
                </p>
              </div>

              {publicSubPage === 'HOME' && (
                <button 
                  className="btn-gov-secondary"
                  onClick={() => onChangePublicSubPage('ATHLETES')}
                  style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 800 }}
                >
                  View All Athletes →
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {(publicSubPage === "HOME" ? ATHLETES.slice(0, 4) : ATHLETES).map(athlete => (
                <div 
                  key={athlete.id} 
                  className="hover-lift"
                  onClick={() => setSelectedAthleteModal(athlete)}
                  style={{
                    position: 'relative', 
                    minHeight: 400,
                    borderRadius: 24, 
                    overflow: 'hidden',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${athlete.img})`,
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.35) 55%, transparent 100%)' }} />
                  
                  {/* Fayda Badge */}
                  <div style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 3,
                    background: 'rgba(16, 185, 129, 0.95)', color: '#FFFFFF',
                    fontSize: '0.72rem', fontWeight: 800,
                    padding: '4px 10px', borderRadius: 8,
                    display: 'inline-flex', alignItems: 'center', gap: 4
                  }}>
                    <ShieldCheck size={14} /> Fayda Verified
                  </div>

                  <div style={{ position: 'relative', zIndex: 2, padding: '24px' }}>
                    <span style={{ color: '#FDE047', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      {athlete.achievement}
                    </span>
                    <h3 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, lineHeight: 1.2 }}>
                      {athlete.name}
                    </h3>
                    <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>
                      {athlete.amharicName}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#FFF',
                        borderRadius: 8, padding: '4px 10px',
                        fontSize: '0.75rem', fontWeight: 800,
                      }}>{athlete.event}</span>
                      <span style={{ color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600 }}>
                        {athlete.club}
                      </span>
                    </div>

                    <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', color: '#FDE047', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Full Athlete Profile & PB Stats <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. NEWS TICKER & LATEST NEWS ── */}
      {(publicSubPage === "HOME" || publicSubPage === "UPDATES") && (
        <>
          {/* Live Ticker Bar */}
          <div style={{
            background: '#0F172A', color: '#FFF', height: 44,
            display: 'flex', alignItems: 'center', overflow: 'hidden',
            borderTop: '2px solid #0EA5E9', borderBottom: '2px solid #0EA5E9',
          }}>
            <div style={{
              flexShrink: 0, padding: '0 20px',
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#0EA5E9', color: '#FFF', height: '100%',
              fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.06em',
              whiteSpace: 'nowrap', zIndex: 1,
            }}>
              <span>🔴</span>
              {language === 'en' ? 'LIVE EAF TICKER' : 'የቀጥታ ዜና'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <style>{`
                @keyframes ticker-scroll {
                  0%   { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .ticker-inner {
                  display: inline-block;
                  white-space: nowrap;
                  animation: ticker-scroll 32s linear infinite;
                  font-size: 0.88rem;
                  font-weight: 600;
                  padding-left: 40px;
                }
              `}</style>
              <span className="ticker-inner">
                {language === 'en' 
                  ? 'Ethiopia wins 15 medals at 24th African Athletics Championship · EAF launches biometric athlete licensing with Fayda ID · Addis Ababa Grand Prix entries open ·'
                  : 'ኢትዮጵያ በ24ኛው የአፍሪካ አትሌቲክስ ሻምፒዮና 15 ሜዳሊያዎችን አሸንፋለች · ፌዴሬሽኑ የፋይዳ ባዮሜትሪክ ምዝገባን በይፋ ጀምሯል · የአዲስ አበባ ግራንድ ፕሪ ምዝገባ ተጀምሯል ·'}
              </span>
            </div>
          </div>

          {/* Latest News Section */}
          <section id="news" style={{ background: '#F8FAFC', padding: '60px 24px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>{loc.newsTitle}</h2>
                <p style={{ color: '#0EA5E9', fontWeight: 700, marginTop: '4px' }}>
                  Official federation announcements, marathon victories & national team updates
                </p>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Featured Main News */}
                <div style={{
                  flex: '1.5 1 340px',
                  backgroundImage: `url(${NEWS[0].img})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  minHeight: 420, borderRadius: 24, overflow: 'hidden',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', cursor: 'pointer',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)'
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 55%, transparent 100%)' }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: 32 }}>
                    <span style={{
                      background: '#0EA5E9', color: '#FFF',
                      borderRadius: 8, padding: '4px 12px',
                      fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em',
                      marginBottom: 12, display: 'inline-block',
                    }}>LATEST ANNOUNCEMENT</span>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: 8, fontWeight: 600 }}>{NEWS[0].date}</div>
                    <h3 style={{ color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>
                      {NEWS[0].title}
                    </h3>
                    <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>
                      {NEWS[0].summary}
                    </p>
                    <span style={{ color: '#38BDF8', fontWeight: 800, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {language === 'en' ? 'Read Full Article →' : 'ተጨማሪ ያንብቡ →'}
                    </span>
                  </div>
                </div>

                {/* Side Stack News Items */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {NEWS.slice(1).map(item => {
                    const tc = TAG_COLORS[item.tag] || { bg: '#F1F5F9', color: '#475569' };
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex', background: '#FFFFFF', borderRadius: 16,
                          overflow: 'hidden', border: '1px solid #E2E8F0', cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                      >
                        <img src={item.img} alt={item.title}
                          style={{ width: 90, height: 80, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 }}>{item.date}</div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.35, marginBottom: 6, color: '#0F172A' }}>
                            {item.title}
                          </div>
                          <span style={{
                            background: tc.bg, color: tc.color,
                            borderRadius: 6, padding: '2px 8px',
                            fontSize: '0.72rem', fontWeight: 800,
                          }}>{item.tag}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 6. ABOUT & FEDERATION GOVERNANCE ── */}
      {publicSubPage === 'HOME' && (
        <section id="about" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 360px' }}>
              <h2 style={{ color: '#0F172A', fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
                {loc.aboutTitle}
              </h2>
              <p style={{ color: '#334155', lineHeight: 1.8, marginBottom: 18, fontSize: '0.98rem' }}>
                The Ethiopian Athletics Federation (EAF) is the national governing body for athletics in Ethiopia, officially recognized by World Athletics (WA) and a member of the African Athletics Confederation (AAC). Founded in 1964, EAF governs all track and field, road, cross-country, and marathon events in Ethiopia.
              </p>
              <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 28, fontSize: '0.92rem' }}>
                EAF oversees the licensing of athletes and clubs through biometric Fayda digital IDs, organizes national championships, selects national teams for international competitions, and develops grassroots talent across all Ethiopian regional states.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Founded', value: '1964' },
                  { label: 'Licensed Clubs', value: '48 Clubs' },
                  { label: 'World Athletics', value: 'Member ✓' },
                  { label: 'African Athletics', value: 'Member ✓' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: '#F8FAFC', borderRadius: 14,
                    padding: '16px 18px', textAlign: 'center',
                    border: '1px solid #E2E8F0',
                    borderTop: '3px solid #0EA5E9',
                  }}>
                    <div style={{ color: '#0F172A', fontSize: '1.1rem', fontWeight: 900 }}>{s.value}</div>
                    <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 320px' }}>
              <h3 style={{ color: '#0F172A', fontSize: '1.4rem', fontWeight: 900, marginBottom: 24 }}>
                {loc.structureTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {STRUCTURE_ITEMS.map(item => (
                  <div key={item.title}
                    style={{
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: 16, padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F0F9FF'; e.currentTarget.style.borderColor = '#0EA5E9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  >
                    {item.icon}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.98rem' }}>{item.title}</div>
                      <div style={{ color: '#0EA5E9', fontSize: '0.8rem', marginTop: 2, fontWeight: 700 }}>{item.amharic}</div>
                    </div>
                    <ChevronRight size={18} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. SPONSORS & PARTNERS (IN ORIGINAL OWN COLOR & INFINITE HORIZONTAL MARQUEE SCROLL) ── */}
      {publicSubPage === 'HOME' && (
        <section style={{ background: '#F8FAFC', padding: '56px 24px', textAlign: 'center', borderTop: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', marginBottom: 28 }}>
            <h3 style={{ color: '#0F172A', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {loc.partnersTitle}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: 4 }}>Supporting Ethiopian athletics excellence across global arenas</p>
          </div>

          <style>{`
            @keyframes sponsor-marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .sponsor-track {
              display: flex;
              align-items: center;
              gap: 60px;
              width: max-content;
              animation: sponsor-marquee 24s linear infinite;
            }
            .sponsor-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div style={{ overflow: 'hidden', position: 'relative', width: '100%', padding: '10px 0' }}>
            <div className="sponsor-track">
              {[
                { src: '/images/800px-Adidas_Logo.svg_.png',              alt: 'Adidas',        h: 46 },
                { src: '/images/ETHIO-TELECOM-1200px-logo-1-1024x269.jpg', alt: 'Ethio Telecom', h: 48 },
                { src: '/images/TeleBirr-Logo-1024x468.png',              alt: 'Telebirr',      h: 46 },
                { src: '/images/Cocacola-logo.jpg',                       alt: 'Coca-Cola',     h: 52 },
                { src: '/images/OROMIA-1024x279.jpg',                     alt: 'Oromia Bank',   h: 46 },
                // Repeated for infinite smooth scroll loop
                { src: '/images/800px-Adidas_Logo.svg_.png',              alt: 'Adidas 2',      h: 46 },
                { src: '/images/ETHIO-TELECOM-1200px-logo-1-1024x269.jpg', alt: 'Ethio Telecom 2', h: 48 },
                { src: '/images/TeleBirr-Logo-1024x468.png',              alt: 'Telebirr 2',    h: 46 },
                { src: '/images/Cocacola-logo.jpg',                       alt: 'Coca-Cola 2',   h: 52 },
                { src: '/images/OROMIA-1024x279.jpg',                     alt: 'Oromia Bank 2', h: 46 },
              ].map((s, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', padding: '12px 28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={s.src}
                    alt={s.alt}
                    style={{
                      height: s.h,
                      objectFit: 'contain',
                      maxWidth: '180px',
                      filter: 'none', // ORIGINAL OWN COLOR
                      opacity: 1,     // FULL VISIBILITY
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. MEDIA & PHOTO/VIDEO GALLERY PAGE (WHEN MEDIA TAB IS ACTIVE) ── */}
      {publicSubPage === 'MEDIA' && (
        <section id="media" style={{ padding: '60px 24px', minHeight: '75vh', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E0F2FE', color: '#0284C7', padding: '6px 16px', borderRadius: '30px', fontWeight: 800, fontSize: '0.82rem', marginBottom: '12px' }}>
                <Image size={16} /> EAF OFFICIAL MEDIA GALLERY
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A' }}>High-Resolution Photo & Video Gallery</h2>
              <p style={{ color: '#64748B', marginTop: '8px', fontSize: '1rem', maxWidth: '600px', margin: '8px auto 0' }}>
                Explore historic championship moments, marathon victories, send-off ceremonies, and athlete training sessions
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: 36 }}>
              {['All', 'Championships', 'Marathons', 'Track & Field', 'Ceremonies'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedGalleryTab(tab)}
                  style={{
                    background: selectedGalleryTab === tab ? '#0EA5E9' : '#FFFFFF',
                    color: selectedGalleryTab === tab ? '#FFFFFF' : '#475569',
                    border: selectedGalleryTab === tab ? 'none' : '1px solid #CBD5E1',
                    padding: '10px 22px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: selectedGalleryTab === tab ? '0 4px 14px rgba(14, 165, 233, 0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredGallery.map(item => (
                <div 
                  key={item.id}
                  className="hover-lift"
                  onClick={() => setActiveLightboxImg(item)}
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    height: '280px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(14, 165, 233, 0.9)', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {item.category}
                  </div>
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, color: '#FFF' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', gap: '10px' }}>
                      <span>📍 {item.location}</span>
                      <span>🗓️ {item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. FOOTER WITH RGB(14, 165, 233) BACKGROUND & CONTACT FORM ── */}
      <footer id="contact" style={{ background: 'rgb(14, 165, 233)', color: '#FFFFFF', padding: '60px 24px 30px', borderTop: '4px solid #0284C7' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          {/* Top Grid: Logo + Quick Links + Direct Contact + Contact Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, marginBottom: 48 }}>

            {/* Col 1: Logo & Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFFFF', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/images/logo.jpeg"
                    alt="EAF Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>
                    Ethiopian Athletics Federation
                  </div>
                  <div style={{ color: '#FEF08A', fontSize: '0.78rem', fontWeight: 800 }}>
                    የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
                  </div>
                </div>
              </div>
              <p style={{ color: '#E0F2FE', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                The official national governing body for track, field, road, cross-country and marathon athletics in Ethiopia since 1964.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map(social => (
                  <a key={social} href="#social" 
                    style={{
                      padding: '8px 12px', borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.2)', color: '#FFF',
                      fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none'
                    }}
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 style={{ color: '#FEF08A', fontWeight: 900, fontSize: '1rem', marginBottom: 20, letterSpacing: '0.04em' }}>
                Quick Links / ፈጣን አገናኞች
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUICK_LINKS.map(([en, am, href]) => (
                  <a 
                    key={en} 
                    href={href}
                    onClick={(e) => {
                      if (href === '#media') { e.preventDefault(); onChangePublicSubPage('MEDIA'); }
                      else if (href === '#competitions') { e.preventDefault(); onChangePublicSubPage('COMPETITIONS'); }
                      else if (href === '#athletes') { e.preventDefault(); onChangePublicSubPage('ATHLETES'); }
                      else if (href === '#home') { e.preventDefault(); onChangePublicSubPage('HOME'); }
                    }}
                    style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
                  >
                    {en} / {am}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 3: Direct Contact Details */}
            <div>
              <h4 style={{ color: '#FEF08A', fontWeight: 900, fontSize: '1rem', marginBottom: 20, letterSpacing: '0.04em' }}>
                Federation HQ / ያናግሩን
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Phone size={18} />, text: '+251 11 551 7777' },
                  { icon: <Mail size={18} />, text: 'info@eaf.org.et' },
                  { icon: <Globe size={18} />, text: 'www.eaf.org.et' },
                  { icon: <MapPin size={18} />, text: 'Addis Ababa National Stadium Compound, Ethiopia' },
                ].map(c => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ color: '#FEF08A', flexShrink: 0 }}>{c.icon}</span>
                    {c.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4: FOOTER CONTACT FORM (NEWLY ADDED) */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '20px', color: '#0F172A', boxShadow: '0 12px 28px rgba(0,0,0,0.15)' }}>
              <h4 style={{ color: '#0F172A', fontWeight: 900, fontSize: '1.1rem', marginBottom: 6 }}>
                Send Federation Inquiry
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 14 }}>
                Get in touch with EAF licensing, event directors or media team
              </p>

              {contactSuccess ? (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', borderRadius: '12px', padding: '14px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 800 }}>
                  ✓ Message Sent Successfully! Our team will respond shortly.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Your Full Name"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Subject / Concern"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <textarea 
                    placeholder="Message Details..."
                    rows={2}
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'none' }}
                  />
                  <button 
                    type="submit" 
                    style={{ background: '#0EA5E9', color: '#FFF', fontWeight: 900, border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.88rem' }}
                  >
                    <Send size={14} /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600 }}>
              © 2026 Ethiopian Athletics Federation — የኢትዮጵያ አትሌቲክስ ፌዴሬሽን. All rights reserved.
            </p>
            <p style={{ color: '#FEF08A', fontSize: '0.82rem', fontWeight: 800 }}>
              EOSCRMS Government Portal System v4.2
            </p>
          </div>

        </div>
      </footer>

      {/* ── ATHLETE DETAIL MODAL ── */}
      {selectedAthleteModal && (
        <div className="modal-backdrop" onClick={() => setSelectedAthleteModal(null)} style={{ zIndex: 9999, padding: '24px 16px' }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ padding: '40px 44px', maxWidth: '820px', width: '95%', margin: '20px auto', borderRadius: '24px', boxShadow: '0 32px 64px rgba(15, 23, 42, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img 
                  src={selectedAthleteModal.img} 
                  alt={selectedAthleteModal.name} 
                  style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '3px solid #0EA5E9', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }} 
                />
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                    <ShieldCheck size={14} /> Fayda Verified ({selectedAthleteModal.faydaFin})
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                    {selectedAthleteModal.name}
                  </h3>
                  <div style={{ fontSize: '1.05rem', color: '#0EA5E9', fontWeight: 800 }}>
                    {selectedAthleteModal.amharicName}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAthleteModal(null)} style={{ background: '#F1F5F9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            {/* Athlete Bio & Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#F8FAFC', padding: '20px', borderRadius: '18px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Primary Event</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{selectedAthleteModal.event}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Club Affiliation</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0EA5E9', marginTop: '2px' }}>{selectedAthleteModal.club}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Personal Best</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{selectedAthleteModal.pb}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Age Division</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>{selectedAthleteModal.ageTier}</div>
              </div>
            </div>

            {/* Athlete Quote */}
            {selectedAthleteModal.quote && (
              <div style={{ background: '#F0F9FF', borderLeft: '4px solid #0EA5E9', padding: '16px 20px', borderRadius: '12px', fontStyle: 'italic', color: '#0369A1', marginBottom: '24px', fontWeight: 600 }}>
                "{selectedAthleteModal.quote}"
              </div>
            )}

            {/* Medals & Honors */}
            <div>
              <h4 style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.1rem', marginBottom: '12px' }}>Career Honors & Medal Achievements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedAthleteModal.medals ? selectedAthleteModal.medals.map((m, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px', fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                    {m}
                  </div>
                )) : (
                  <div style={{ color: '#64748B' }}>National team elite record holder</div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setSelectedAthleteModal(null)}
              className="btn-accent"
              style={{ width: '100%', marginTop: '28px', padding: '14px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Close Profile View
            </button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL FOR GALLERY IMAGES ── */}
      {activeLightboxImg && (
        <div className="modal-backdrop" onClick={() => setActiveLightboxImg(null)} style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', border: 'none', maxWidth: '900px', width: '95%', textAlign: 'center', color: '#FFF' }}>
            <img src={activeLightboxImg.img} alt={activeLightboxImg.title} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
            <h3 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 900, marginTop: '16px' }}>{activeLightboxImg.title}</h3>
            <p style={{ color: '#38BDF8', fontSize: '0.95rem' }}>📍 {activeLightboxImg.location} · 🗓️ {activeLightboxImg.date}</p>
            <button onClick={() => setActiveLightboxImg(null)} style={{ marginTop: '20px', background: '#FFFFFF', color: '#0F172A', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
