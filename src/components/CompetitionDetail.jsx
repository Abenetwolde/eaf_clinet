import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Phone, Mail, Award, Users, Filter, CheckCircle2, User, Building, Clock, ChevronRight } from 'lucide-react';
import { MOCK_ATHLETES, MOCK_EVENT_RESULTS, MOCK_CLUBS } from '../data/mockData';

// Helper to determine banner image based on meet ID
const getBannerUrl = (meetId) => {
  if (meetId === 'MEET-2026-01') return '/images/banner_grand_prix.png';
  if (meetId === 'MEET-2026-02') return '/images/banner_youth_games.png';
  if (meetId === 'MEET-2026-03') return '/images/banner_jan_meda.png';
  return 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=900&auto=format&fit=crop&q=80';
};

export default function CompetitionDetail({ meet, onBack, onRegister, language = 'en' }) {
  const [activeTab, setActiveTab] = useState('about');
  
  // Results Filters
  const [resultEventFilter, setResultEventFilter] = useState('ALL');
  const [resultClubFilter, setResultClubFilter] = useState('ALL');
  const [resultAgeFilter, setResultAgeFilter] = useState('ALL');
  const [resultGenderFilter, setResultGenderFilter] = useState('ALL');

  if (!meet) return null;

  // Localized texts
  const t = {
    back: language === 'en' ? '← Back to Competitions' : '← ወደ ውድድሮች ይመለሱ',
    regClosed: language === 'en' ? 'Registration Closed' : 'ምዝገባ ተዘግቷል',
    regOpen: language === 'en' ? 'Open for Registration' : 'ምዝገባ ክፍት ነው',
    upcoming: language === 'en' ? 'Upcoming' : 'መጪ ውድድር',
    live: language === 'en' ? 'LIVE EVENT' : 'የቀጥታ ስርጭት',
    organizer: language === 'en' ? 'Organizer' : 'አዘጋጅ',
    venue: language === 'en' ? 'Venue & Address' : 'ቦታ እና አድራሻ',
    contact: language === 'en' ? 'Contact Details' : 'የእውቂያ መረጃ',
    deadline: language === 'en' ? 'Registration Deadline' : 'የምዝገባ ማብቂያ ቀን',
    regIndividual: language === 'en' ? 'Register as Individual Athlete' : 'እንደ ግል አትሌት ይመዝገቡ',
    regClub: language === 'en' ? 'Register as Club / Team' : 'እንደ ክለብ/ቡድን ይመዝገቡ',
    actionTitle: language === 'en' ? 'Registration Action Panel' : 'የምዝገባ ፓነል',
    verified: language === 'en' ? 'EAF Verified' : 'የተረጋገጠ አትሌት',
    recordStatus: language === 'en' ? 'Record Status' : 'የሪከርድ ደረጃ',
    
    // Tabs
    tabAbout: language === 'en' ? 'About Event' : 'ስለ ውድድሩ',
    tabEvents: language === 'en' ? 'Events & Categories' : 'የውድድር አይነቶች',
    tabStarters: language === 'en' ? 'Starter Lists' : 'የተወዳዳሪዎች ዝርዝር',
    tabResults: language === 'en' ? 'Live Results & Participants' : 'የቀጥታ ውጤቶች',
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
      // Alternating mock gender
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

  // Generate Starter Lists from MOCK_ATHLETES + some extra mock entries
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

  // Fetch Results if available, or construct mock ones
  const rawResults = MOCK_EVENT_RESULTS[meet.id] || [];
  
  // Flatten results and enrich with athlete details for advanced filtering
  const resultsData = [];
  rawResults.forEach(disciplineBlock => {
    disciplineBlock.results.forEach(res => {
      // Find matching athlete if possible to extract gender/age
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
        nr: res.pos === 1 && meet.id === 'MEET-2026-01' && disciplineBlock.discipline === '800m', // Tigist broke NR
        event: disciplineBlock.discipline,
        gender,
        ageGroup: ageTier,
        verified: matchingAthlete ? matchingAthlete.faydaStatus === 'VERIFIED' : true
      });
    });
  });

  // Filtered Results
  const filteredResults = resultsData.filter(r => {
    if (resultEventFilter !== 'ALL' && r.event !== resultEventFilter) return false;
    if (resultClubFilter !== 'ALL' && r.club !== resultClubFilter) return false;
    if (resultAgeFilter !== 'ALL' && r.ageGroup !== resultAgeFilter) return false;
    if (resultGenderFilter !== 'ALL' && r.gender !== resultGenderFilter) return false;
    return true;
  });

  // Unique lists for filtering dropdowns
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
        {t.back}
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
        {/* Modern dark gradient overlay */}
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
              {meet.status === 'REGISTRATION_OPEN' ? t.regOpen : meet.status === 'LIVE' ? t.live : t.upcoming}
            </span>
            <span 
              className="badge badge-gold" 
              style={{ border: '1px solid rgba(200, 168, 75, 0.4)', borderRadius: '8px', padding: '6px 14px', color: '#FFE082' }}
            >
              ★ EAF Grade A Event
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
            🏆 Competition Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(11, 87, 142, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date &amp; Schedule</div>
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
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.deadline}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#DC2626', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  August 05, 2026 
                  <span className="badge badge-red" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Urgent</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(11, 87, 142, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.organizer}</div>
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
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.contact}</div>
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
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
            color: '#FFFFFF',
            border: 'none', 
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '28px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFE082', marginBottom: '8px' }}>
              {t.actionTitle}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Register for this meet to secure your spot. Athlete entries require Fayda ID biometric verification. Club entries must be managed by certified coaches.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => onRegister('ATHLETE')}
              className="btn-accent"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> {t.regIndividual}
              </span>
              <ChevronRight size={16} />
            </button>

            <button 
              onClick={() => onRegister('CLUB')}
              className="btn-gov-secondary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} /> {t.regClub}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── B. TABBED INFORMATION ARCHITECTURE ── */}
      {/* Tab Selectors */}
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
          { id: 'about', label: t.tabAbout },
          { id: 'events', label: t.tabEvents },
          { id: 'starters', label: t.tabStarters },
          { id: 'results', label: t.tabResults },
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
                Event Overview
              </h4>
              <p style={{ lineHeight: 1.7, color: 'var(--text-body)', fontSize: '0.95rem' }}>
                {aboutInfo.overview}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📜 Technical Rules
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-body)', fontSize: '0.88rem' }}>
                  {aboutInfo.rules}
                </p>
              </div>

              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏃 Qualifying Standards
                </h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-body)', fontSize: '0.88rem' }}>
                  {aboutInfo.standards}
                </p>
              </div>

              <div className="gov-card" style={{ background: '#FFFFFF', borderRadius: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 Prize Purse &amp; Awards
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
                    <th>Event / Discipline</th>
                    <th>Gender</th>
                    <th>Age Category</th>
                    <th>Registration Status</th>
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
                          {ev.status === 'Open' ? 'OPEN' : 'CLOSED'}
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
                    <th>Bib #</th>
                    <th>Athlete Name</th>
                    <th>Club / Delegation</th>
                    <th>Event</th>
                    <th>Gender / Div</th>
                    <th>Seed Time</th>
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
                              title={t.verified} 
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
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>Results Pending</h4>
                <p style={{ fontSize: '0.85rem' }}>This competition has not started yet. Live results will display here once events commence.</p>
              </div>
            ) : (
              <div>
                {/* Advanced Result Filters */}
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
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Filter Results</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Event Type</label>
                      <select 
                        className="form-select" 
                        value={resultEventFilter} 
                        onChange={e => setResultEventFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">All Events</option>
                        {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Club / Delegation</label>
                      <select 
                        className="form-select" 
                        value={resultClubFilter} 
                        onChange={e => setResultClubFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">All Clubs</option>
                        {uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gender</label>
                      <select 
                        className="form-select" 
                        value={resultGenderFilter} 
                        onChange={e => setResultGenderFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">All Genders</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Age Category</label>
                      <select 
                        className="form-select" 
                        value={resultAgeFilter} 
                        onChange={e => setResultAgeFilter(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Senior">Senior</option>
                        <option value="U20">U20</option>
                        <option value="U18">U18</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtered Results Table */}
                {filteredResults.length === 0 ? (
                  <div className="gov-card" style={{ background: '#FFFFFF', textAlign: 'center', padding: '36px', color: 'var(--text-muted)', borderRadius: '18px' }}>
                    <p style={{ fontWeight: 700 }}>No results matches your filter selection.</p>
                  </div>
                ) : (
                  <div className="gov-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden', borderRadius: '18px' }}>
                    <div className="table-responsive">
                      <table className="gov-table">
                        <thead>
                          <tr>
                            <th style={{ width: '80px' }}>Rank</th>
                            <th style={{ width: '100px' }}>Bib #</th>
                            <th>Athlete Name</th>
                            <th>Club / Region</th>
                            <th>Event</th>
                            <th>Time / Distance</th>
                            <th>Record Status</th>
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
                                      title={t.verified} 
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

    </div>
  );
}
