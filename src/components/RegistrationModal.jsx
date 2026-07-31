import React, { useState } from 'react';
import { X, Building2, UserCheck, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight, Mail, Lock, Phone, User, Award, FileText, LockKeyhole } from 'lucide-react';
import { MOCK_CLUBS } from '../data/mockData';

// Step indicator
function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.9rem',
            background: i < current ? '#0EA5E9' : i === current ? '#0EA5E9' : '#F1F5F9',
            color: i <= current ? '#FFFFFF' : '#64748B',
            boxShadow: i === current ? '0 0 0 4px rgba(14, 165, 233, 0.25)' : 'none',
            transition: 'all 0.2s'
          }}>
            {i < current ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: i <= current ? '#0EA5E9' : '#64748B', textAlign: 'center' }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegistrationModal({ role, onClose, onRegisterSuccess }) {
  const isClub = role === 'CLUB';
  const [step, setStep] = useState(0);

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

  // Athlete-specific
  const [faydaFin, setFaydaFin] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('NONE');
  const [primaryEvent, setPrimaryEvent] = useState(['5,000m Long Distance']);
  const [faydaLoading, setFaydaLoading] = useState(false);
  const [faydaResult, setFaydaResult] = useState(null);
  const [faydaError, setFaydaError] = useState('');

  const clubSteps = ['Account', 'Club Info', 'Confirm'];
  const athleteSteps = ['Fayda Verification', 'Sports Info', 'Account', 'Confirm'];

  const steps = isClub ? clubSteps : athleteSteps;

  // ── Fayda lookup (simulated) ──
  const handleFaydaLookup = () => {
    if (faydaFin.length < 10) { setFaydaError('Enter a valid Fayda FIN (at least 10 digits)'); return; }
    setFaydaError('');
    setFaydaLoading(true);
    setTimeout(() => {
      setFaydaLoading(false);
      const mockProfiles = [
        { name: 'Almaz Bekele Negash', amharic: 'አልማዝ በቀለ ነጋሽ', dob: '2003-06-18', gender: 'Female', photoUrl: '/images/runner_female.png' },
        { name: 'Dawit Fikadu Alemu', amharic: 'ዳዊት ፍካዱ አለሙ', dob: '2001-11-22', gender: 'Male', photoUrl: '/images/runner_marathon.png' },
        { name: 'Marta Woldu Hailе', amharic: 'ማርታ ወልዱ ኃይሌ', dob: '2008-04-07', gender: 'Female', photoUrl: '/images/a1.jpg' },
      ];
      const pick = mockProfiles[faydaFin.length % mockProfiles.length];
      const age = 2026 - parseInt(pick.dob.substring(0, 4));
      const tier = age <= 16 ? 'U16' : age <= 18 ? 'U18' : age <= 20 ? 'U20' : 'Senior';
      setFaydaResult({
        ...pick,
        ageTier: tier,
        fin: faydaFin,
        hash: '0xFAYDA_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }, 1200);
  };

  // ── Submit handlers ──
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
    onRegisterSuccess('CLUB', { club: newClub });
  };

  const handleAthleteSubmit = () => {
    const club = selectedClubId === 'NONE' 
      ? { id: 'NONE', name: 'Independent / Unaffiliated Athlete', shortName: 'Independent' }
      : (MOCK_CLUBS.find(c => c.id === selectedClubId) || MOCK_CLUBS[0]);

    const displayEvent = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;

    const newAthlete = {
      id: 'ATH-2026-' + Math.floor(100 + Math.random() * 900),
      name: faydaResult.name,
      amharicName: faydaResult.amharic,
      dob: faydaResult.dob,
      gender: faydaResult.gender,
      ageTier: faydaResult.ageTier,
      clubId: club.id,
      clubName: club.shortName,
      faydaFin: faydaResult.fin,
      faydaStatus: 'VERIFIED',
      faydaHash: faydaResult.hash,
      primaryEvent: displayEvent,
      licenseStatus: 'UNLICENSED',
      licenseNumber: null,
      licenseExpiry: null,
      photoUrl: faydaResult.photoUrl,
      checkinStatus: 'NOT_CHECKED_IN',
      qrCodeData: null,
      secondaryDoc: null,
      weight: 58, height: 172, restingHR: 48, trainingLoad: 60,
      personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: []
    };
    onRegisterSuccess('ATHLETE', { athlete: newAthlete });
  };

  // ── CLUB FLOW ──
  const renderClubStep = () => {
    if (step === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Create Admin Account</h4>
        <div className="form-group">
          <label className="form-label">Official Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourclub.et" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 000 0000" required style={{ padding: '12px 14px' }} />
        </div>
        <button
          className="btn-accent"
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
          onClick={() => email && password && phone ? setStep(1) : null}>
          Continue to Club Details <ArrowRight size={18} />
        </button>
      </div>
    );

    if (step === 1) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Club Information</h4>
        <div className="form-group">
          <label className="form-label">Club Official Name (English)</label>
          <input className="form-input" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Bekoji Athletics Club" required style={{ padding: '12px 14px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Club Name (Amharic — የክለቡ ስም)</label>
          <input className="form-input" value={clubAmharic} onChange={e => setClubAmharic(e.target.value)} placeholder="e.g. በቆጂ የሩጫ አካዳሚ" required style={{ padding: '12px 14px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Regional State</label>
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
            <label className="form-label">Club Symbol / Emoji</label>
            <input className="form-input" value={clubLogo} onChange={e => setClubLogo(e.target.value)} placeholder="🏃" style={{ padding: '12px 14px' }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Club Manager / Director Name</label>
          <input className="form-input" value={manager} onChange={e => setManager(e.target.value)} placeholder="e.g. Coach Sentayehu Eshetu" required style={{ padding: '12px 14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '13px', borderRadius: '12px' }} onClick={() => setStep(0)}>Back</button>
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => clubName && manager ? setStep(2) : null}>
            Review & Submit <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Review & Confirm Registration</h4>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
          <table className="gov-table">
            <tbody>
              {[
                ['Club Name', `${clubName} (${clubAmharic})`],
                ['Region', region],
                ['Manager', manager],
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
          By registering, your club agrees to comply with Ethiopian Athletics Federation rules and mandate Fayda National ID verification for all athletes.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '13px', borderRadius: '12px' }} onClick={() => setStep(1)}>Back</button>
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleClubSubmit}>
            <CheckCircle2 size={18} /> Register Club with EAF
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
            Step 1: Fayda ID Verification
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
            Enter your 12-digit Fayda FIN. Full name, date of birth, age tier, and photo profile are fetched automatically from the government identity database.
          </p>
        </div>

        {/* Fayda Input */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Fayda FIN Number (12 Digits)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              className="form-input" style={{ flex: 1, padding: '14px 16px', fontSize: '1rem', borderRadius: '12px' }}
              value={faydaFin} onChange={e => setFaydaFin(e.target.value)}
              placeholder="e.g. 9840-3920-1124"
            />
            <button
              type="button"
              className="btn-accent"
              style={{ whiteSpace: 'nowrap', padding: '14px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleFaydaLookup}
              disabled={faydaLoading}
            >
              {faydaLoading ? <><RefreshCw size={16} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={18} /> Verify Fayda FIN</>}
            </button>
          </div>
          {faydaError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>{faydaError}</span>}
        </div>

        {/* Fayda Verified Result Card with Profile Picture */}
        {faydaResult && (
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '2px solid #0EA5E9',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)'
          }}>
            {/* Athlete Fayda Profile Photo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={faydaResult.photoUrl}
                alt="Fayda Profile Photo"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                }}
              />
              <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#10B981', color: '#FFF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#0284C7" />
                <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '0.95rem' }}>FAYDA  PROFILE VERIFIED</span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', marginBottom: '2px' }}>
                {faydaResult.name} ({faydaResult.amharic})
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.82rem', color: '#475569' }}>
                <span>DOB: <strong>{faydaResult.dob}</strong></span>
                <span>Gender: <strong>{faydaResult.gender}</strong></span>
                <span style={{ background: '#0EA5E9', color: '#FFF', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  Division: {faydaResult.ageTier}
                </span>
              </div>

              <div style={{ fontSize: '0.73rem', fontFamily: 'var(--font-mono)', color: '#64748B', marginTop: '6px' }}>
                Audit Hash: {faydaResult.hash}
              </div>
            </div>
          </div>
        )}

        {!faydaResult && (
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
            <span>🔒 Please click "Verify Fayda FIN" above to unlock the "Continue to Sports Info" button.</span>
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
              ? 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'
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
          Continue to Sports Info
          <ArrowRight size={20} />
        </button>
      </div>
    );

    if (step === 1) {
      const allDisciplines = [
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
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>Step 2: Sports & Athletic Affiliation</h4>

          {/* Multi-select Disciplines Checkboxes */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Primary Event / Discipline (Select all that apply)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                      color: isSelected ? '#0284C7' : '#334155',
                      cursor: 'pointer',
                      background: isSelected ? '#E0F2FE' : '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #0EA5E9' : '1px solid #E2E8F0',
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
                      style={{ width: '16px', height: '16px', accentColor: '#0EA5E9' }}
                    />
                    {d}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Current Registered Club Dropdown with None option */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Current Registered Club</label>
            <select className="form-select" value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)} style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }}>
              <option value="NONE">None (Independent / Unaffiliated Athlete)</option>
              {MOCK_CLUBS.map(c => (
                <option key={c.id} value={c.id}>{c.shortName} ({c.region})</option>
              ))}
            </select>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px', fontSize: '0.85rem', color: '#64748B' }}>
            💡 <strong>Tip:</strong> You can log training sessions, personal records, and weight stats in your Athlete Dashboard after completing registration.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(0)}>Back</button>
            <button className="btn-accent" style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(2)}>
              Continue to Account Credentials <ArrowRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>Step 3: Portal Account Setup</h4>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.name@athletics.et" required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Phone Number</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 234 5678" required style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(1)}>Back</button>
          <button
            className="btn-accent"
            style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => email && password ? setStep(3) : null}
          >
            Review Registration <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 3) {
      const club = selectedClubId === 'NONE' 
        ? { shortName: 'Independent' } 
        : (MOCK_CLUBS.find(c => c.id === selectedClubId) || { shortName: 'EAF Club' });

      const eventText = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>Step 4: Final Confirmation</h4>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img src={faydaResult?.photoUrl} alt="Photo" style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>{faydaResult?.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#0EA5E9', fontWeight: 700 }}>Fayda FIN: {faydaResult?.fin}</div>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="gov-table">
                <tbody>
                  <tr><td style={{ width: '40%', fontWeight: 700, color: '#64748B' }}>Division</td><td style={{ fontWeight: 900, color: '#0F172A' }}>{faydaResult?.ageTier}</td></tr>
                  <tr><td style={{ fontWeight: 700, color: '#64748B' }}>Events</td><td style={{ fontWeight: 900, color: '#0F172A' }}>{eventText}</td></tr>
                  <tr><td style={{ fontWeight: 700, color: '#64748B' }}>Club</td><td style={{ fontWeight: 900, color: '#0F172A' }}>{club?.shortName}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(2)}>Back</button>
            <button
              className="btn-accent"
              style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleAthleteSubmit}
            >
              <CheckCircle2 size={18} /> Complete Athlete Registration
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '32px 16px' }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          padding: '44px 48px',
          maxWidth: '780px',
          width: '95%',
          margin: '20px auto',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '14px',
              background: isClub ? '#FEF3C7' : '#E0F2FE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isClub ? '#D97706' : '#0284C7'
            }}>
              {isClub ? <Building2 size={26} /> : <UserCheck size={26} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                {isClub ? 'Register Club Account' : 'Athlete Registration'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Ethiopian Athletics Federation — EOSCRMS Portal
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        <StepBar steps={steps} current={step} />

        {isClub ? renderClubStep() : renderAthleteStep()}
      </div>
    </div>
  );
}
