import React from 'react';
import { Trophy, Calendar, MapPin, ChevronRight, Mail, Phone, Globe, Users, Award, Activity, BookOpen } from 'lucide-react';

/* ─────────────────────────────────────────────
   INLINE SVG SOCIAL ICONS
───────────────────────────────────────────── */
const IconFacebook = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const IconTwitter = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>);
const IconInstagram = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
const IconYoutube = ({ size = 16 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>);

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

const COMPETITIONS = [
  {
    id: 1,
    status: 'REGISTRATION OPEN',
    statusColor: '#0B578E',
    title: 'Addis Ababa International Grand Prix 2026',
    amharic: 'አዲስ አበባ ግራንድ ፕሪ',
    venue: 'Addis Ababa National Stadium',
    date: 'August 12–14, 2026',
    disciplines: ['100m', '5000m', '10000m', '800m', '1500m', 'High Jump', 'Long Jump'],
    img: '/images/d2.jpeg',
  },
  {
    id: 2,
    status: 'OPEN',
    statusColor: '#0B578E',
    title: 'Ethiopian National Youth Olympic Games U18/U20',
    amharic: 'ብሔራዊ የወጣቶች ኦሎምፒክ ጨዋታዎች',
    venue: 'Hawassa International Stadium',
    date: 'September 5–8, 2026',
    disciplines: [],
    img: '/images/d3.jpeg',
  },
  {
    id: 3,
    status: 'UPCOMING',
    statusColor: '#B45309',
    title: 'Jan Meda National Cross-Country Olympic Trials',
    amharic: 'ጃን ሜዳ ብሔራዊ ምርጫ',
    venue: 'Jan Meda Race Course, Addis Ababa',
    date: 'October 20, 2026',
    disciplines: [],
    img: '/images/d4.jpg',
  },
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
  ['Competition', 'ውድድር', '#competitions'],
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
   NEWS TICKER
───────────────────────────────────────────── */
function NewsTicker() {
  const text = 'Ethiopia wins 15 medals at 24th African Athletics Championship · Ethiopian heroes dominate London Marathon · 4th Ethiopia Tamirt 10KM won by Nibret Kinde and Birtukan Mola · EAF completes athletics judging training ·';
  return (
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
        LIVE NEWS
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
        <span className="ticker-inner">{text}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function LandingPage({ onSelectRole, onRegister }) {

  /* ── 1. HERO ── */
  const Hero = () => (
    <section id="home" style={{
      position: 'relative', minHeight: 600,
      backgroundImage: 'url(/images/d1.jpg)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)' }} />
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '60px 24px', maxWidth: 900, margin: '0 auto',
      }}>
        <img
          src="/images/logo.jpeg"
          alt="EAF Logo"
          width={88}
          style={{
            borderRadius: '50%', border: '3px solid #fff',
            marginBottom: 14, objectFit: 'cover',
            background: '#fff', padding: 2,
          }}
        />
        <div style={{ color: '#C8A84B', fontSize: '1rem', fontWeight: 700, marginBottom: 10, letterSpacing: '0.12em' }}>
          ኢ አ ፌ
        </div>
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(2rem,5vw,3.5rem)',
          fontWeight: 900, lineHeight: 1.1, marginBottom: 10,
        }}>
          Ethiopian Athletics Federation
        </h1>
        <h2 style={{ color: '#C8A84B', fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>
          የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
        </h2>
        <p style={{
          color: '#fff', opacity: 0.88, fontSize: '1rem',
          maxWidth: 600, margin: '0 auto 30px', lineHeight: 1.7,
        }}>
          The National Governing Body for Athletics in Ethiopia — A Member of World Athletics
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {[
            '15 Medals — 24th African Championship',
            '46th London Marathon Champions',
            '48 Licensed Clubs',
            '14,800+ Registered Athletes',
          ].map(chip => (
            <span key={chip} style={{
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              borderRadius: 999, padding: '7px 18px',
              fontSize: '0.82rem', fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.3)',
            }}>{chip}</span>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── 3. LATEST NEWS ── */
  const LatestNews = () => (
    <section id="news" style={{ background: '#FFFFFF', padding: '60px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030' }}>Latest News</h2>
          <span style={{ color: '#1B2B4B', fontWeight: 600, fontSize: '1rem' }}>ዜና</span>
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
                background: '#1B2B4B', color: '#fff',
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
              <a href="#" style={{ color: '#C8A84B', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                onClick={e => e.preventDefault()}>
                Read More →
              </a>
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
  );

  /* ── 4. COMPETITIONS ── */
  const Competitions = () => (
    <section id="competitions" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030', marginBottom: 4 }}>Upcoming Competitions</h2>
          <p style={{ color: '#1B2B4B', fontWeight: 600 }}>የውድድር መርሃግብር</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {COMPETITIONS.map(comp => (
            <div key={comp.id} className="hover-lift" style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden',
              minHeight: 280, display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${comp.img})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,8,20,0.92) 0%, rgba(0,8,20,0.5) 55%, transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, padding: 22 }}>
                <span style={{
                  background: comp.statusColor, color: '#fff',
                  borderRadius: 999, padding: '4px 12px',
                  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em',
                  marginBottom: 10, display: 'inline-block',
                }}>{comp.status}</span>
                <h3 style={{ color: '#fff', fontSize: '1.08rem', fontWeight: 900, marginBottom: 4, lineHeight: 1.3 }}>
                  {comp.title}
                </h3>
                <p style={{ color: '#C8A84B', fontSize: '0.82rem', fontWeight: 600, marginBottom: 10 }}>{comp.amharic}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: comp.disciplines.length > 0 ? 12 : 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#C8A84B', fontWeight: 600 }}>
                    <MapPin size={13} /> {comp.venue}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#8FA8BC', fontWeight: 600 }}>
                    <Calendar size={13} /> {comp.date}
                  </span>
                </div>
                {comp.disciplines.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {comp.disciplines.slice(0, 5).map(d => (
                      <span key={d} style={{
                        background: 'rgba(255,255,255,0.15)', color: '#fff',
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '3px 9px', borderRadius: 999,
                      }}>{d}</span>
                    ))}
                    {comp.disciplines.length > 5 && (
                      <span style={{
                        background: 'rgba(200,168,75,0.25)', color: '#C8A84B',
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '3px 9px', borderRadius: 999,
                      }}>+{comp.disciplines.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── 5. ATHLETE SPOTLIGHT ── */
  const AthleteSpotlight = () => (
    <section id="athletes" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0B2030' }}>Ethiopian Athletics Stars</h2>
          <span style={{ color: '#1B2B4B', fontWeight: 600, fontSize: '1rem' }}>አትሌቶቻችን</span>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {ATHLETES.map(athlete => (
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
  );

  /* ── 6. ABOUT ── */
  const About = () => (
    <section id="about" style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        {/* Left */}
        <div style={{ flex: '1 1 340px' }}>
          <h2 style={{ color: '#0B2030', fontSize: '1.9rem', fontWeight: 900, marginBottom: 8 }}>
            About Ethiopian Athletics Federation
          </h2>
          <p style={{ color: '#1B2B4B', fontWeight: 600, marginBottom: 20 }}>ስለ ኢትዮጵያ አትሌቲክስ ፌዴሬሽን</p>
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
            Our Structure — አደረጃጀታችን
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
  );

  /* ── 7. SPONSORS ── */
  const Sponsors = () => (
    <section style={{ background: '#FFFFFF', padding: '48px 24px', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
      <h3 style={{ color: '#5A7A94', fontWeight: 700, fontSize: '0.95rem', marginBottom: 32, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Our Partners &amp; Sponsors — ስፖንሰሮቻችን
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
  );

  /* ── 8. FOOTER ── */
  const Footer = () => (
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
  );

  /* ── RENDER ── */
  return (
    <div style={{ background: '#FFFFFF' }}>
      <Hero />
      <NewsTicker />
      <LatestNews />
      <Competitions />
      <AthleteSpotlight />
      <About />
      <Sponsors />
      <Footer />
    </div>
  );
}
