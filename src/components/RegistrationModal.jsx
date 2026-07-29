import React, { useState } from 'react';
import { X, Building2, UserCheck, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight, Mail, Lock, Phone } from 'lucide-react';
import { MOCK_CLUBS } from '../data/mockData';

// Step indicator
function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.82rem',
            background: i < current ? 'var(--primary)' : i === current ? 'var(--primary)' : '#E8F0EA',
            color: i <= current ? '#fff' : 'var(--text-muted)',
            boxShadow: i === current ? '0 0 0 3px rgba(11,87,142,0.2)' : 'none'
          }}>
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: i <= current ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
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
  const [selectedClubId, setSelectedClubId] = useState(MOCK_CLUBS[0].id);
  const [primaryEvent, setPrimaryEvent] = useState('5,000m / 10,000m');
  const [faydaLoading, setFaydaLoading] = useState(false);
  const [faydaResult, setFaydaResult] = useState(null);
  const [faydaError, setFaydaError] = useState('');

  const clubSteps = ['Account', 'Club Info', 'Confirm'];
  const athleteSteps = ['Fayda ID', 'Sports Info', 'Account', 'Confirm'];

  const steps = isClub ? clubSteps : athleteSteps;

  // ── Fayda lookup (simulated) ──
  const handleFaydaLookup = () => {
    if (faydaFin.length < 10) { setFaydaError('Enter a valid Fayda FIN'); return; }
    setFaydaError('');
    setFaydaLoading(true);
    setTimeout(() => {
      setFaydaLoading(false);
      // Simulate different results based on FIN
      const mockNames = [
        { name: 'Almaz Bekele Negash', amharic: 'አልማዝ በቀለ ነጋሽ', dob: '2003-06-18', gender: 'Female' },
        { name: 'Dawit Fikadu Alemu',  amharic: 'ዳዊት ፍካዱ አለሙ',  dob: '2001-11-22', gender: 'Male' },
        { name: 'Marta Woldu Hailе',   amharic: 'ማርታ ወልዱ ኃይሌ',  dob: '2008-04-07', gender: 'Female' },
      ];
      const pick = mockNames[faydaFin.length % mockNames.length];
      const age = 2026 - parseInt(pick.dob.substring(0, 4));
      const tier = age <= 16 ? 'U16' : age <= 18 ? 'U18' : age <= 20 ? 'U20' : 'Senior';
      setFaydaResult({
        ...pick,
        ageTier: tier,
        fin: faydaFin,
        hash: '0xFAYDA_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }, 1400);
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
    const club = MOCK_CLUBS.find(c => c.id === selectedClubId) || MOCK_CLUBS[0];
    const newAthlete = {
      id: 'ATH-2026-' + Math.floor(100 + Math.random() * 900),
      name: faydaResult.name,
      amharicName: faydaResult.amharic,
      dob: faydaResult.dob,
      gender: faydaResult.gender,
      ageTier: faydaResult.ageTier,
      clubId: club.id,
      clubName: club.name,
      faydaFin: faydaResult.fin,
      faydaStatus: 'VERIFIED',
      faydaHash: faydaResult.hash,
      primaryEvent,
      licenseStatus: 'UNLICENSED',
      licenseNumber: null,
      licenseExpiry: null,
      photoUrl: faydaResult.gender === 'Female' ? '/images/runner_female.png' : '/images/runner_marathon.png',
      checkinStatus: 'NOT_CHECKED_IN',
      qrCodeData: null,
      secondaryDoc: null,
      weight: null, height: null, restingHR: null, trainingLoad: 0,
      personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: []
    };
    onRegisterSuccess('ATHLETE', { athlete: newAthlete });
  };

  // ── CLUB FLOW ──
  const renderClubStep = () => {
    if (step === 0) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Create Admin Account</h4>
        <div className="form-group">
          <label className="form-label">Official Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourclub.et" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 000 0000" required />
        </div>
        <button className="btn-gov-primary" style={{ width: '100%', padding: '12px' }}
          onClick={() => email && password && phone ? setStep(1) : null}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    );

    if (step === 1) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Club Information</h4>
        <div className="form-group">
          <label className="form-label">Club Official Name (English)</label>
          <input className="form-input" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Bekoji Athletics Club" required />
        </div>
        <div className="form-group">
          <label className="form-label">Club Name (Amharic — የክለቡ ስም)</label>
          <input className="form-input" value={clubAmharic} onChange={e => setClubAmharic(e.target.value)} placeholder="e.g. በቆጂ የሩጫ አካዳሚ" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Regional State</label>
            <select className="form-select" value={region} onChange={e => setRegion(e.target.value)}>
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
            <input className="form-input" value={clubLogo} onChange={e => setClubLogo(e.target.value)} placeholder="🏃" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Club Manager / Director Name</label>
          <input className="form-input" value={manager} onChange={e => setManager(e.target.value)} placeholder="e.g. Coach Sentayehu Eshetu" required />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '11px' }} onClick={() => setStep(0)}>Back</button>
          <button className="btn-gov-primary" style={{ flex: 2, padding: '11px' }}
            onClick={() => clubName && manager ? setStep(2) : null}>
            Review & Submit <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );

    if (step === 2) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Review & Confirm</h4>
        <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          {[
            ['Club Name', `${clubName} (${clubAmharic})`],
            ['Region', region],
            ['Manager', manager],
            ['Email', email],
            ['Phone', phone],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          By registering, you agree that your club will comply with EAF regulations and that all athletes will be verified via Fayda National ID before competing.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '11px' }} onClick={() => setStep(1)}>Back</button>
          <button className="btn-gov-primary" style={{ flex: 2, padding: '11px' }} onClick={handleClubSubmit}>
            <CheckCircle2 size={16} /> Register Club with EAF
          </button>
        </div>
      </div>
    );
  };

  // ── ATHLETE FLOW ──
  const renderAthleteStep = () => {
    if (step === 0) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px', color: 'var(--primary)' }}>Fayda National ID Verification</h4>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
          Your full name, date of birth, and age tier are automatically retrieved from the Fayda government database. You do not need to enter them manually.
        </p>
        <div className="form-group">
          <label className="form-label">Fayda FIN (12-Digit ID Number)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="form-input" style={{ flex: 1 }}
              value={faydaFin} onChange={e => setFaydaFin(e.target.value)}
              placeholder="e.g. 9840-3920-1124"
            />
            <button className="btn-gov-primary" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}
              onClick={handleFaydaLookup} disabled={faydaLoading}>
              {faydaLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Querying...</> : 'Verify Fayda'}
            </button>
          </div>
          {faydaError && <span style={{ color: 'var(--eaf-red)', fontSize: '0.8rem', fontWeight: 600 }}>{faydaError}</span>}
        </div>

        {faydaResult && (
          <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>Fayda Verification Successful</span>
            </div>
            {[
              ['Full Name (English)', faydaResult.name],
              ['ሙሉ ስም (አማርኛ)', faydaResult.amharic],
              ['Date of Birth', faydaResult.dob],
              ['Gender', faydaResult.gender],
              ['Age Division', faydaResult.ageTier],
              ['Hash Index', faydaResult.hash.substring(0, 20) + '...'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '7px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{k === 'Age Division' ? <span className="badge badge-green">{v}</span> : v}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn-gov-primary" style={{ width: '100%', padding: '12px' }}
          disabled={!faydaResult}
          onClick={() => faydaResult && setStep(1)}>
          Continue to Sports Info <ArrowRight size={16} />
        </button>
      </div>
    );

    if (step === 1) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Sports Information</h4>
        <div className="form-group">
          <label className="form-label">Primary Athletic Event / Discipline</label>
          <select className="form-select" value={primaryEvent} onChange={e => setPrimaryEvent(e.target.value)}>
            <option>100m / 200m Sprint</option>
            <option>400m</option>
            <option>800m / 1,500m</option>
            <option>5,000m / 10,000m</option>
            <option>3,000m Steeplechase</option>
            <option>Marathon / Road Races</option>
            <option>Long Jump / Triple Jump</option>
            <option>High Jump / Pole Vault</option>
            <option>Shot Put / Discus / Javelin</option>
            <option>Combined Events (Heptathlon / Decathlon)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Current Club Affiliation</label>
          <select className="form-select" value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)}>
            {MOCK_CLUBS.map(c => (
              <option key={c.id} value={c.id}>{c.shortName} — {c.region}</option>
            ))}
          </select>
        </div>
        <div style={{ background: '#F5FAF6', border: '1px solid #D0E0ED', borderRadius: '10px', padding: '12px', marginBottom: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-heading)' }}>Note:</strong> Personal bests, weight, and training logs can be added after registration from your Athlete Portal dashboard.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '11px' }} onClick={() => setStep(0)}>Back</button>
          <button className="btn-gov-primary" style={{ flex: 2, padding: '11px' }} onClick={() => setStep(2)}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );

    if (step === 2) return (
      <div>
        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Create Account Credentials</h4>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@email.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 91 000 0000" required />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '11px' }} onClick={() => setStep(1)}>Back</button>
          <button className="btn-gov-primary" style={{ flex: 2, padding: '11px' }}
            onClick={() => email && password ? setStep(3) : null}>
            Review <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );

    if (step === 3) {
      const club = MOCK_CLUBS.find(c => c.id === selectedClubId);
      return (
        <div>
          <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '18px', color: 'var(--primary)' }}>Review & Complete Registration</h4>
          <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            {[
              ['Name (from Fayda)', faydaResult?.name],
              ['Amharic Name', faydaResult?.amharic],
              ['Age Division', faydaResult?.ageTier],
              ['Primary Event', primaryEvent],
              ['Club', club?.shortName],
              ['Email', email],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '9px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '11px' }} onClick={() => setStep(2)}>Back</button>
            <button className="btn-gov-primary" style={{ flex: 2, padding: '11px' }} onClick={handleAthleteSubmit}>
              <CheckCircle2 size={16} /> Complete Registration
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '32px', maxWidth: '520px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: isClub ? 'rgba(200,168,75,0.12)' : 'rgba(11,87,142,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isClub ? '#92620A' : 'var(--primary)'
            }}>
              {isClub ? <Building2 size={22} /> : <UserCheck size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                {isClub ? 'Register New Club' : 'Athlete Registration'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ethiopian Athletics Federation — EOSCRMS
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F1', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        <StepBar steps={steps} current={step} />

        {isClub ? renderClubStep() : renderAthleteStep()}
      </div>
    </div>
  );
}
