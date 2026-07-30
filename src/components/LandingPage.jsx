import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, ChevronRight, Mail, Phone, Globe, Users, Award, Activity, BookOpen, Search, Filter, Clock, CheckCircle } from 'lucide-react';
import CompetitionDetail from './CompetitionDetail';

/* ─────────────────────────────────────────────
   STATIC DATA
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
    achievement: '2023 Berlin Marathon World Record — 2:11:53',
    event: 'Marathon',
    club: 'Adidas / Ethiopia',
    img: '/images/a1.jpg',
  },
  {
    id: 2,
    name: 'Selemon Barega',
    achievement: 'Olympic 10,000m Champion — Tokyo 2020',
    event: '5,000m / 10,000m',
    club: 'Ethiopian National Team',
    img: '/images/a2.jpg',
  },
];

const STRUCTURE_ITEMS = [
  { icon: <Users size={22} color="#1B2B4B" />, title: 'General Assembly', amharic: 'ጠቅላላ ጉባኤ' },
  { icon: <Award size={22} color="#1B2B4B" />, title: 'Executive Committee', amharic: 'ስራ አስፈጻሚ' },
  { icon: <Activity size={22} color="#1B2B4B" />, title: 'Technical Committee', amharic: 'ቴክኒካዊ ኮሚቴ' },
  { icon: <BookOpen size={22} color="#1B2B4B" />, title: 'Training & Research', amharic: 'ስልጠናና ምርምር' },
];

const QUICK_LINKS = [
  ['Home', 'ቅድመ ገፅ', '#home'],
  ['News', 'ዜና', '#news'],
  ['Competitions', 'ውድድሮች', '#competitions'],
  ['Results', 'ውጤት', '#competitions'],
  ['Athlete Profile', 'አትሌት ፕሮፋይል', '#athletes'],
  ['Gallery', 'ምስል', '#home'],
  ['Contact', 'ያግኙን', '#contact'],
];

const TAG_COLORS = {
  Championship:   { bg: '#EDF3FA', color: '#1B2B4B' },
  Marathon:       { bg: '#FDF6E3', color: '#92620A' },
  'Road Race':    { bg: '#EEF4FF', color: '#1565C0' },
  Training:       { bg: '#F3F0FF', color: '#5B21B6' },
  'National Team':{ bg: '#FEF2F2', color: '#991B1B' },
};

/* ─────────────────────────────────────────────
   INLINE SVG SOCIAL ICONS
   ───────────────────────────────────────────── */
const IconFacebook = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const IconTwitter = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>);
const IconInstagram = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
const IconYoutube = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>);

export default function LandingPage({ onSelectRole, onRegister, language = 'en', publicSubPage = 'HOME', onChangePublicSubPage }) {
  const [selectedMeetId, setSelectedMeetId] = useState(null);

  // Search/Filter states
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortByDate, setSortByDate] = useState('UPCOMING_FIRST'); // 'UPCOMING_FIRST' | 'OLDEST_FIRST'

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
    
    // Status titles
    all: language === 'en' ? 'All' : 'ሁሉም',
    regOpen: language === 'en' ? 'Open for Registration' : 'ምዝገባ ክፍት ነው',
    regClosed: language === 'en' ? 'Registration Closed' : 'ምዝገባ ተዘግቷል',
    live: language === 'en' ? 'Live' : 'በቀጥታ ስርጭት',
    upcoming: language === 'en' ? 'Upcoming' : 'መጪ ውድድር',

    // Section Titles
    newsTitle: language === 'en' ? 'Latest News' : 'አዳዲስ ዜናዎች',
    competitionsTitle: language === 'en' ? 'Competitions Hub' : 'የውድድሮች ማዕከል',
    athletesTitle: language === 'en' ? 'Ethiopian Athletics Stars' : 'የኢትዮጵያ አትሌቲክስ ኮከቦች',
    aboutTitle: language === 'en' ? 'About Ethiopian Athletics Federation' : 'ስለ ኢትዮጵያ አትሌቲክስ ፌዴሬሽን',
    structureTitle: language === 'en' ? 'Our Structure' : 'የፌዴሬሽኑ መዋቅር',
    partnersTitle: language === 'en' ? 'Our Partners & Sponsors' : 'ስፖንሰሮች እና አጋሮች',
  };

  const handleExploreClick = () => {
    const el = document.getElementById('competitions');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Perform filtering
  const filteredMeets = ENRICHED_MEETS.filter(meet => {
    // 1. Text Search
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchTitle = meet.title.toLowerCase().includes(q) || (meet.amharic && meet.amharic.toLowerCase().includes(q));
      const matchVenue = meet.venue.toLowerCase().includes(q);
      const matchEvent = meet.disciplines.some(d => d.toLowerCase().includes(q));
      
      // Check if athlete matches Tigst or Selemon or Haile
      const matchAthlete = (q.includes('tigst') && meet.title.includes('Grand Prix')) || 
                           (q.includes('sifan') && meet.title.includes('Oromia')) ||
                           (q.includes('haile') && meet.title.includes('Grand Prix')) ||
                           (q.includes('abel') && meet.title.includes('Youth'));

      if (!matchTitle && !matchVenue && !matchEvent && !matchAthlete) return false;
    }

    // 2. Region filter
    if (regionFilter !== 'ALL' && meet.region !== regionFilter) return false;

    // 3. Status filter
    if (statusFilter !== 'ALL' && meet.status !== statusFilter) return false;

    // 4. Date ranges
    if (startDate && new Date(meet.date) < new Date(startDate)) return false;
    if (endDate && new Date(meet.date) > new Date(endDate)) return false;

    return true;
  });

  // Sort logic
  const sortedMeets = [...filteredMeets].sort((a, b) => {
    const dA = new Date(a.date);
    const dB = new Date(b.date);
    return sortByDate === 'UPCOMING_FIRST' ? dA - dB : dB - dA;
  });

  // If a competition is selected, render the Competition Detail Page / Event Hub
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

  return (
    <div style={{ background: '#FFFFFF' }}>
      
      {/* ── 1. HERO SECTION ── */}
      {publicSubPage === 'HOME' && (
      <section 
        id="home" 
        style={{
          position: 'relative', 
          minHeight: '520px',
          background: 'radial-gradient(circle at 50% 0%, #F8FAFC, #E2E8F0 70%)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '100px 24px 80px'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
          <h1 style={{
            color: '#0F172A',
            fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
            fontWeight: 900, 
            lineHeight: 1.15, 
            marginBottom: '16px',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            {loc.heroTitle}
          </h1>

          <p style={{
            color: '#475569', 
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            maxWidth: '680px', 
            margin: '0 auto 32px', 
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            {loc.heroSubtitle}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            {/* Primary CTA */}
            <button 
              onClick={() => onRegister('ATHLETE')}
              className="btn-accent"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <CheckCircle size={18} />
              {loc.btnPrimary}
            </button>

            {/* Secondary CTA */}
            <button 
              onClick={handleExploreClick}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '14px 28px',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'none'; }}
            >
              <Trophy size={18} />
              {loc.btnSecondary}
            </button>
          </div>
        </div>
      </section>
      )}

      {/* ── 2. INTEGRATED SEARCH BAR & FILTER WIDGET ── */}
      {(publicSubPage === 'HOME' || publicSubPage === 'COMPETITIONS') && (
        <div style={{ padding: '0 16px', position: 'relative', zIndex: 10, marginTop: publicSubPage === 'COMPETITIONS' ? '40px' : 0 }}>
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
            padding: '24px',
            width: '100%',
            maxWidth: '1150px',
            margin: '-50px auto 40px',
            color: '#0F172A',
          }}
        >
          {/* Free-text Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} 
            />
            <input 
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder={loc.searchPlaceholder}
              style={{
                width: '100%',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '14px 16px 14px 48px',
                color: '#0F172A',
                fontSize: '0.98rem',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#0284C7'}
              onBlur={e => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Filter Widgets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            
            {/* Region Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#475569', fontSize: '0.8rem' }}>{loc.regionLabel}</label>
              <select 
                className="form-select" 
                value={regionFilter} 
                onChange={e => setRegionFilter(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px' }}
              >
                <option value="ALL">{language === 'en' ? 'All Regions' : 'ሁሉም ክልሎች'}</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Oromia">Oromia</option>
                <option value="Amhara">Amhara</option>
                <option value="Sidama">Sidama</option>
                <option value="Tigray">Tigray</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#475569', fontSize: '0.8rem' }}>{loc.statusLabel}</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px' }}
              >
                <option value="ALL">{loc.all}</option>
                <option value="REGISTRATION_OPEN">{loc.regOpen}</option>
                <option value="REGISTRATION_CLOSED">{loc.regClosed}</option>
                <option value="LIVE">{loc.live}</option>
                <option value="UPCOMING">{loc.upcoming}</option>
              </select>
            </div>

            {/* Start Date Picker */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#475569', fontSize: '0.8rem' }}>{loc.startDateLabel}</label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px', width: '100%', padding: '9px 12px' }}
              />
            </div>

            {/* End Date Picker */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#475569', fontSize: '0.8rem' }}>{loc.endDateLabel}</label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px', width: '100%', padding: '9px 12px' }}
              />
            </div>

            {/* Sort Toggle */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#475569', fontSize: '0.8rem' }}>{loc.sortLabel}</label>
              <select 
                className="form-select" 
                value={sortByDate} 
                onChange={e => setSortByDate(e.target.value)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '10px' }}
              >
                <option value="UPCOMING_FIRST">{loc.sortUpcoming}</option>
                <option value="OLDEST_FIRST">{loc.sortOldest}</option>
              </select>
            </div>

          </div>
        </div>
        </div>
      )}

      {/* ── 4. COMPETITIONS HUB ── */}
      {/* ── 4. COMPETITIONS HUB ── */}
      {(publicSubPage === "HOME" || publicSubPage === "COMPETITIONS") && (
      <section id="competitions" style={{ background: '#F8FAFC', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030', marginBottom: 4 }}>
              {loc.competitionsTitle}
            </h2>
            <p style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {language === 'en' ? 'Active Events & Schedules' : 'አሁን ያሉ ውድድሮች እና የጊዜ ሰሌዳዎች'}
            </p>
          </div>

          {/* Grid list of filtered competitions */}
          {sortedMeets.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Trophy size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <h4 style={{ fontWeight: 800 }}>{language === 'en' ? 'No Competitions Found' : 'ምንም ውድድሮች አልተገኙም'}</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{language === 'en' ? 'Adjust your filters or query to explore other meets.' : 'እባክዎን ሌሎች ውድድሮችን ለማግኘት ማጣሪያዎችን ያስተካክሉ።'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              {(publicSubPage === "HOME" ? sortedMeets.slice(0, 3) : sortedMeets).map(meet => {
                const badgeColor = meet.status === 'REGISTRATION_OPEN' ? '#0E7490' : meet.status === 'LIVE' ? '#DC2626' : meet.status === 'UPCOMING' ? '#B45309' : '#64748B';
                const statusName = meet.status === 'REGISTRATION_OPEN' ? loc.regOpen : meet.status === 'LIVE' ? loc.live : meet.status === 'UPCOMING' ? loc.upcoming : loc.regClosed;
                
                return (
                  <div 
                    key={meet.id} 
                    className="hover-lift" 
                    onClick={() => setSelectedMeetId(meet.id)}
                    style={{
                      position: 'relative', 
                      borderRadius: '20px', 
                      overflow: 'hidden',
                      minHeight: '300px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'flex-end', 
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${meet.img})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 60%, transparent 100%)' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                      {/* Urgency/Status Badge */}
                      <span style={{
                        background: badgeColor, 
                        color: '#0F172A',
                        borderRadius: '8px', 
                        padding: '4px 12px',
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        letterSpacing: '0.04em',
                        marginBottom: '10px', 
                        display: 'inline-block',
                      }}>{statusName}</span>

                      <h3 style={{ color: '#0F172A', fontSize: '1.25rem', fontWeight: 900, marginBottom: '6px', lineHeight: 1.3 }}>
                        {language === 'en' ? meet.title : meet.amharic || meet.title}
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#FFE082', fontWeight: 600 }}>
                          <MapPin size={14} /> {meet.venue}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 600 }}>
                          <Calendar size={14} /> {meet.dateString}
                        </span>
                      </div>

                      {/* Region badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#0F172A', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                          📍 {meet.region}
                        </span>
                        
                        <span style={{ color: '#FFE082', fontSize: '0.85rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          {language === 'en' ? 'View Details' : 'ውጤቶች/ዝርዝር'} <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}
{/* ── NEWS TICKER ── */}
      {publicSubPage === "HOME" && (
      <>
      <div style={{
        background: '#1B2B4B', color: '#fff', height: 42,
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        borderTop: '2px solid #152238', borderBottom: '2px solid #152238',
      }}>
        <div style={{
          flexShrink: 0, padding: '0 18px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#152238', height: '100%',
          fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.06em',
          whiteSpace: 'nowrap', zIndex: 1,
        }}>
          <span style={{ color: '#ff4444', fontSize: '0.9rem' }}>🔴</span>
          {language === 'en' ? 'LIVE TICKER' : 'የቀጥታ ዜና'}
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
              font-size: 0.85rem;
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
      </>
      )}
{/* ── 3. LATEST NEWS ── */}
      {/* ── 3. LATEST NEWS ── */}
      {publicSubPage === "HOME" && (
      <section id="news" style={{ background: '#FFFFFF', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030' }}>{loc.newsTitle}</h2>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Featured */}
            <div style={{
              flex: '1.5 1 340px',
              backgroundImage: `url(${NEWS[0].img})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              minHeight: 420, borderRadius: 16, overflow: 'hidden',
              position: 'relative', display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', cursor: 'pointer',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,8,20,0.95) 0%, rgba(0,8,20,0.45) 55%, transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, padding: 28 }}>
                <span style={{
                  background: '#0284C7', color: '#fff',
                  borderRadius: 999, padding: '4px 12px',
                  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                  marginBottom: 10, display: 'inline-block',
                }}>LATEST</span>
                <div style={{ color: '#8FA8BC', fontSize: '0.8rem', marginBottom: 6 }}>{NEWS[0].date}</div>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>
                  {NEWS[0].title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 14 }}>
                  {NEWS[0].summary}
                </p>
                <span style={{ color: '#FFE082', fontWeight: 700, fontSize: '0.9rem' }}>
                  {language === 'en' ? 'Read More →' : 'ተጨማሪ ያንብቡ →'}
                </span>
              </div>
            </div>

            {/* Side stack */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NEWS.slice(1).map(item => {
                const tc = TAG_COLORS[item.tag] || { bg: '#F0F0F0', color: '#444' };
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', background: '#fff', borderRadius: 10,
                      overflow: 'hidden', border: '1px solid #E8EEF4', cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <img src={item.img} alt={item.title}
                      style={{ width: 80, height: 72, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ padding: '8px 12px 8px 10px', flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#5A7A94', fontSize: '0.73rem', marginBottom: 4 }}>{item.date}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.35, marginBottom: 5, color: '#0B2A42' }}>
                        {item.title}
                      </div>
                      <span style={{
                        background: tc.bg, color: tc.color,
                        borderRadius: 6, padding: '2px 8px',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>{item.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}
{/* ── 5. ATHLETE SPOTLIGHT ── */}
      {/* ── 5. ATHLETE SPOTLIGHT ── */}
      {(publicSubPage === "HOME" || publicSubPage === "ATHLETES") && (
      <section id="athletes" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030' }}>{loc.athletesTitle}</h2>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {(publicSubPage === "HOME" ? ATHLETES.slice(0, 4) : ATHLETES).map(athlete => (
              <div key={athlete.id} style={{
                position: 'relative', flex: '1 1 320px', minHeight: 420,
                borderRadius: 20, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                cursor: 'pointer',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${athlete.img})`,
                  backgroundSize: 'cover', backgroundPosition: 'top center',
                }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,5,18,0.95) 0%, rgba(0,5,18,0.4) 50%, transparent 100%)' }} />
                <div style={{
                  position: 'absolute', top: 14, right: 14, zIndex: 3,
                  background: '#C8A84B', color: '#1a1000',
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '5px 10px', borderRadius: 9,
                  maxWidth: 160, textAlign: 'center', lineHeight: 1.3,
                }}>
                  {athlete.achievement}
                </div>
                <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, marginBottom: 5, lineHeight: 1.2 }}>
                    {athlete.name}
                  </h3>
                  <p style={{ color: '#C8A84B', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>
                    {athlete.achievement}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.15)', color: '#fff',
                      borderRadius: 999, padding: '4px 11px',
                      fontSize: '0.73rem', fontWeight: 700,
                    }}>{athlete.event}</span>
                    <span style={{ color: '#8FA8BC', fontSize: '0.78rem', fontWeight: 600, alignSelf: 'center' }}>
                      {athlete.club}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}
{publicSubPage === 'HOME' && (
<>
{/* ── 6. ABOUT ── */}
      <section id="about" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {/* Left */}
          <div style={{ flex: '1 1 340px' }}>
            <h2 style={{ color: '#0B2030', fontSize: '1.9rem', fontWeight: 900, marginBottom: 8 }}>
              {loc.aboutTitle}
            </h2>
            <p style={{ color: '#2D3748', lineHeight: 1.8, marginBottom: 16, fontSize: '0.95rem' }}>
              The Ethiopian Athletics Federation (EAF) is the national governing body for athletics in Ethiopia, officially recognized by World Athletics (WA) and a member of the African Athletics Confederation (AAC). Founded in 1964, EAF governs all track and field, road, cross-country, mountain, and ultra-running events in Ethiopia.
            </p>
            <p style={{ color: '#4A5568', lineHeight: 1.8, marginBottom: 28, fontSize: '0.9rem' }}>
              EAF oversees the licensing of athletes and clubs, organizes national championships, selects and manages national teams for international competitions, and develops the sport at grassroots level across all Ethiopian regions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Founded', value: '1964' },
                { label: 'Members', value: '48 Clubs' },
                { label: 'World Athletics', value: 'Member ✓' },
                { label: 'African Athletics', value: 'Member ✓' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff', borderRadius: 10,
                  padding: '14px 16px', textAlign: 'center',
                  border: '1px solid #E8EEF4',
                  borderTop: '3px solid var(--primary)',
                }}>
                  <div style={{ color: '#1B2B4B', fontSize: '1rem', fontWeight: 900 }}>{s.value}</div>
                  <div style={{ color: '#5A7A94', fontSize: '0.75rem', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#0B2030', fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
              {loc.structureTitle}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STRUCTURE_ITEMS.map(item => (
                <div key={item.title}
                  style={{
                    background: '#F8FAFC', border: '1px solid #D0E0ED',
                    borderRadius: 12, padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EDF3FA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  {item.icon}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#0B2030', fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
                    <div style={{ color: '#1B2B4B', fontSize: '0.78rem', marginTop: 2, opacity: 0.8 }}>{item.amharic}</div>
                  </div>
                  <ChevronRight size={16} color="#9AB4A2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SPONSORS ── */}
      <section style={{ background: '#FFFFFF', padding: '48px 24px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <h3 style={{ color: '#5A7A94', fontWeight: 700, fontSize: '0.95rem', marginBottom: 32, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {loc.partnersTitle}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 48, maxWidth: 900, margin: '0 auto' }}>
          {[
            { src: '/images/800px-Adidas_Logo.svg_.png',              alt: 'Adidas',        h: 34 },
            { src: '/images/ETHIO-TELECOM-1200px-logo-1-1024x269.jpg', alt: 'Ethio Telecom', h: 38 },
            { src: '/images/TeleBirr-Logo-1024x468.png',              alt: 'Telebirr',      h: 36 },
            { src: '/images/Cocacola-logo.jpg',                       alt: 'Coca-Cola',     h: 46 },
            { src: '/images/OROMIA-1024x279.jpg',                     alt: 'Oromia Bank',   h: 34 },
          ].map(s => (
            <img
              key={s.alt}
              src={s.src}
              alt={s.alt}
              style={{
                height: s.h,
                objectFit: 'contain',
                filter: 'grayscale(1)',
                opacity: 0.65,
                transition: 'filter 0.25s, opacity 0.25s',
                cursor: 'pointer',
                maxWidth: '160px',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.65'; }}
            />
          ))}
        </div>
      </section>

      {/* ── 8. FOOTER ── */}
      <footer id="contact" style={{ background: '#1A1F2E', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 40 }}>

            {/* Left */}
            <div style={{ flex: '1 1 220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <img
                  src="/images/logo.jpeg"
                  alt="EAF Logo"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#fff', padding: 3, objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                    Ethiopian Athletics Federation
                  </div>
                  <div style={{ color: '#C8A84B', fontSize: '0.75rem', fontWeight: 600 }}>
                    የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: 18 }}>
                The national governing body for athletics in Ethiopia since 1964.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { icon: <IconFacebook size={16} />, label: 'Facebook',  href: 'https://www.facebook.com/EthiopianAthleticsFederation' },
                  { icon: <IconTwitter size={16} />,  label: 'Twitter',   href: 'https://twitter.com/eaf_ethio' },
                  { icon: <IconInstagram size={16} />, label: 'Instagram', href: 'https://instagram.com/ethiopian.athletics' },
                  { icon: <IconYoutube size={16} />,  label: 'YouTube',   href: 'https://youtube.com/@EthiopianAthleticsFederation1' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifycontent: 'center',
                      color: '#fff', textDecoration: 'none', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1B2B4B'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Middle */}
            <div style={{ flex: '1 1 180px' }}>
              <h4 style={{ color: '#C8A84B', fontWeight: 800, fontSize: '0.9rem', marginBottom: 16, letterSpacing: '0.05em' }}>
                Quick Links — ፈጣን አገናኞች
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICK_LINKS.map(([en, am, href]) => (
                  <a key={en} href={href}
                    style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    {en} / {am}
                  </a>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ flex: '1 1 220px' }}>
              <h4 style={{ color: '#C8A84B', fontWeight: 800, fontSize: '0.9rem', marginBottom: 16, letterSpacing: '0.05em' }}>
                Contact Us — ያናግሩን
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { icon: <Phone size={15} />, text: '+251 11 551 7777' },
                  { icon: <Mail size={15} />, text: 'info@eaf.org.et' },
                  { icon: <Globe size={15} />, text: 'www.eaf.org.et' },
                  { icon: <MapPin size={15} />, text: 'Addis Ababa, Ethiopia' },
                ].map(c => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                    <span style={{ color: '#C8A84B', flexShrink: 0 }}>{c.icon}</span>
                    {c.text}
                  </div>
                ))}
                <span style={{
                  marginTop: 6, display: 'inline-block',
                  background: 'rgba(11,87,142,0.3)', color: '#8FA8BC',
                  border: '1px solid #1B2B4B', borderRadius: 6,
                  padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700,
                  width: 'fit-content'
                }}>
                  World Athletics Member
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
              © 2026 Ethiopian Athletics Federation — ኢትዮጵያ አትሌቲክስ ፌዴሬሽን. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    
</>
)}
      {publicSubPage === 'MEDIA' && (
        <section style={{ padding: '100px 24px', textAlign: 'center', minHeight: '60vh' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0B2030' }}>Media & Gallery</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Photo and video galleries coming soon.</p>
        </section>
      )}
</div>
  );
}
