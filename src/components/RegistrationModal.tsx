import React, { useState } from 'react';
import { X, Building2, UserCheck, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight, Phone, LockKeyhole, Clock } from 'lucide-react';
import { MOCK_CLUBS } from '../data/mockData';

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
  const isClub = role === 'CLUB';
  const [step, setStep] = useState(0);

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

  // Athlete-specific
  const [faydaFin, setFaydaFin] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState('NONE');
  const [primaryEvent, setPrimaryEvent] = useState(['5,000m Long Distance']);
  const [faydaLoading, setFaydaLoading] = useState(false);
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(null);
  const [faydaError, setFaydaError] = useState('');

  // Athlete physical & contact metadata
  const [weight, setWeight] = useState(58);
  const [height, setHeight] = useState(172);
  const [emergencyContact, setEmergencyContact] = useState('Ato Bekele Negash (+251 91 111 2233)');
  const [medicalNotes, setMedicalNotes] = useState('Blood Group O+ | No known allergies');

  // Pending approval screen state
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<PendingRegistrationData | null>(null);

  const clubSteps = ['Account', 'Club Info', 'Confirm'];
  const athleteSteps = ['Fayda Verification', 'Sports Info', 'Account', 'Confirm'];
  const steps = isClub ? clubSteps : athleteSteps;

  // Auto-format Fayda FIN into 12 digits (XXXX-XXXX-XXXX)
  const handleFinChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
    }
    setFaydaFin(formatted);
  };

  // ── Step 1: Initiate Fayda lookup & launch OTP prompt ──
  const handleInitiateFaydaLookup = () => {
    const cleanDigits = faydaFin.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setFaydaError('Enter a valid 12-digit Fayda FIN Number (e.g. 9840-3920-1124)');
      return;
    }
    setFaydaError('');
    setFaydaLoading(true);
    setTimeout(() => {
      setFaydaLoading(false);
      setOtpStep(true); // Open OTP verification page
    }, 900);
  };

  // ── Step 2: Confirm OTP & retrieve Fayda Biometrics ──
  const handleVerifyOtp = () => {
    if (otpCode.length < 6) {
      setFaydaError('Enter a valid 6-digit SMS OTP passcode');
      return;
    }
    setFaydaError('');
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      setOtpStep(false);

      const mockProfiles = [
        { name: 'Almaz Bekele Negash', amharic: 'አልማዝ በቀለ ነጋሽ', dob: '2003-06-18', gender: 'Female', blood: 'O+', region: 'Oromia Regional State', photoUrl: '/images/runner_female.png' },
        { name: 'Dawit Fikadu Alemu', amharic: 'ዳዊት ፍካዱ አለሙ', dob: '2001-11-22', gender: 'Male', blood: 'A+', region: 'Addis Ababa Administration', photoUrl: '/images/runner_marathon.png' },
        { name: 'Marta Woldu Hailе', amharic: 'ማርታ ወልዱ ኃይሌ', dob: '2008-04-07', gender: 'Female', blood: 'B+', region: 'Amhara Regional State', photoUrl: '/images/a1.jpg' },
      ];
      const cleanDigits = faydaFin.replace(/\D/g, '');
      const pick = mockProfiles[cleanDigits.length % mockProfiles.length];
      const age = 2026 - parseInt(pick.dob.substring(0, 4));
      const tier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : 'Senior Division';

      setFaydaResult({
        ...pick,
        ageTier: tier,
        fin: faydaFin || '9840-3920-1124',
        hash: '0xFAYDA_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      });
    }, 1100);
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

  const handleAthleteSubmit = () => {
    const club = selectedClubId === 'NONE'
      ? { id: 'NONE', name: 'Independent / Unaffiliated Athlete', shortName: 'Independent' }
      : (MOCK_CLUBS.find(c => c.id === selectedClubId) || MOCK_CLUBS[0]);

    const displayEvent = Array.isArray(primaryEvent) ? primaryEvent.join(', ') : primaryEvent;

    const newAthlete = {
      id: 'ATH-2026-' + Math.floor(100 + Math.random() * 900),
      name: faydaResult?.name || 'Almaz Bekele Negash',
      amharicName: faydaResult?.amharic || 'አልማዝ በቀለ ነጋሽ',
      dob: faydaResult?.dob || '2003-06-18',
      gender: faydaResult?.gender || 'Female',
      ageTier: faydaResult?.ageTier || 'Senior Division',
      clubId: club.id,
      clubName: club.shortName,
      faydaFin: faydaResult?.fin || faydaFin,
      faydaStatus: 'VERIFIED',
      faydaHash: faydaResult?.hash || '0xFAYDA_982A1B0C',
      primaryEvent: displayEvent,
      licenseStatus: 'PENDING_APPROVAL',
      licenseNumber: null,
      licenseExpiry: null,
      photoUrl: faydaResult?.photoUrl || '/images/runner_female.png',
      checkinStatus: 'NOT_CHECKED_IN',
      qrCodeData: null,
      weight, height, restingHR: 48, trainingLoad: '60',
      emergencyContact, medicalNotes,
      email: email || 'athlete@athletics.et',
      phone: phone || '+251 91 234 5678',
      region: faydaResult?.region || 'Oromia Regional State',
      personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: []
    };

    setPendingRegistrationData({ type: 'ATHLETE', payload: { athlete: newAthlete } });
    setIsSubmittedPending(true);
  };

  // ── Pending Approval View ──
  const renderPendingApprovalScreen = () => {
    if (!pendingRegistrationData) return null;
    const refNumber = 'EAF-REG-2026-' + Math.floor(100000 + Math.random() * 900000);
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
          ⏳ PENDING FEDERATION BOARD APPROVAL
        </span>

        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
          Application Submitted Successfully!
        </h3>

        <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '580px', lineHeight: 1.6, marginBottom: '24px' }}>
          Your {isAthleteData ? 'athlete profile & Fayda identity biometrics' : 'club registration details'} have been securely logged and queued for audit by the <strong>Ethiopian Athletics Federation (EAF) Executive Board</strong>.
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', marginBottom: '14px', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B' }}>TRACKING REFERENCE ID</span>
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
                  ✓ Fayda Biometrics Verified · Status: Under Board Review
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
          📲 <strong>Notification Notice:</strong> You will receive an official SMS notification and email once your EAF license is reviewed and approved by federation officials.
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
          Acknowledge & Access Portal Dashboard →
        </button>
      </div>
    );
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
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
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
        <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => clubName && manager ? setStep(2) : null}>
            Review & Submit <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Review & Confirm Registration</h4>
        <div className="table-responsive" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
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
          <button className="btn-accent" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleClubSubmit}>
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
            Step 1: Fayda FIN Verification
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
            Enter your 12-digit Fayda FIN Number. Full legal name, date of birth, age division, and official passport photo are fetched from the National ID database.
          </p>
        </div>

        {/* Fayda Input */}
        {!otpStep && !faydaResult && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Fayda FIN Number (12 Digits Auto-Formatted)
            </label>
            <div className="fin-row" style={{ display: 'flex', gap: '10px' }}>
              <input
                className="form-input"
                style={{ flex: 1, padding: '14px 16px', fontSize: '1.05rem', borderRadius: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', fontWeight: 700, minWidth: 0 }}
                value={faydaFin}
                onChange={handleFinChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInitiateFaydaLookup();
                  }
                }}
                placeholder="e.g. 9840-3920-1124"
                maxLength={14}
              />
              <button
                type="button"
                className="btn-accent"
                style={{ whiteSpace: 'nowrap', padding: '14px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleInitiateFaydaLookup}
                disabled={faydaLoading}
              >
                {faydaLoading ? <><RefreshCw size={16} className="animate-spin" /> Verifying FIN...</> : <><ShieldCheck size={18} /> Verify Fayda FIN</>}
              </button>
            </div>
            {faydaError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginTop: '6px', display: 'block' }}>{faydaError}</span>}
          </div>
        )}

        {/* OTP Entry Page (After clicking Verify FIN) */}
        {otpStep && !faydaResult && (
          <div style={{
            background: '#F0F9FF',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>SMS OTP Authentication</h5>
                <p style={{ fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                  A 6-digit OTP passcode was sent to your Fayda registered mobile (+251 91 *** *78).
                </p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                Enter 6-Digit Passcode (OTP)
              </label>
              <div className="otp-row" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '12px 0' }}>
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    className="otp-box"
                    type="text"
                    maxLength={1}
                    value={otpCode[idx] || ''}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (pastedData) {
                        setOtpCode(pastedData);
                        const focusIndex = Math.min(pastedData.length, 5);
                        const targetEl = document.getElementById(`otp-box-${focusIndex}`);
                        if (targetEl) targetEl.focus();
                      }
                    }}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const current = otpCode.split('');
                      current[idx] = val;
                      const newCode = current.join('').slice(0, 6);
                      setOtpCode(newCode);
                      if (val && idx < 5) {
                        const nextEl = document.getElementById(`otp-box-${idx + 1}`);
                        if (nextEl) nextEl.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyOtp();
                      } else if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                        const prevEl = document.getElementById(`otp-box-${idx - 1}`);
                        if (prevEl) prevEl.focus();
                      }
                    }}
                    style={{
                      width: '52px',
                      height: '60px',
                      borderRadius: '12px',
                      border: otpCode[idx] ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                      background: otpCode[idx] ? '#F0F9FF' : '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                ))}
              </div>
            </div>

            {faydaError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700 }}>{faydaError}</span>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-gov-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                onClick={() => setOtpStep(false)}
              >
                Back to FIN
              </button>
              <button
                type="button"
                className="btn-accent"
                style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? <><RefreshCw size={16} className="animate-spin" /> Confirming Passcode...</> : <><CheckCircle2 size={18} /> Confirm OTP & Retrieve Biometrics</>}
              </button>
            </div>
          </div>
        )}

        {/* Fayda Verified Result List Card with Formal Passport Photo */}
        {faydaResult && (
          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '2px solid var(--primary)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(14, 165, 233, 0.3)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="var(--primary-dark)" />
                <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '1rem', letterSpacing: '0.04em' }}>
                  GOVERNMENT FAYDA ID BIOMETRICS VERIFIED
                </span>
              </div>
              <span style={{ background: '#10B981', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                AUTHENTICATED ✓
              </span>
            </div>

            {/* Profile Content Layout */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Formal Passport Photo Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{
                  width: '125px',
                  height: '160px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                  position: 'relative',
                  background: '#E2E8F0'
                }}>
                  <img
                    src={faydaResult.photoUrl}
                    alt="Formal Passport Photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: '#10B981', color: '#FFF', borderRadius: '50%',
                    width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369A1', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  📷 Official Passport Photo
                </span>
              </div>

              {/* Personal Information List */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  📋 Personal Identity Data List
                </h5>
                <div className="table-responsive" style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #BAE6FD' }}>
                  <table className="gov-table" style={{ margin: 0 }}>
                    <tbody>
                      {[
                        ['Full Legal Name (Eng)', faydaResult.name],
                        ['Full Legal Name (Amh)', faydaResult.amharic],
                        ['Fayda FIN Number', faydaResult.fin],
                        ['Date of Birth (DOB)', `${faydaResult.dob} (Age 22)`],
                        ['Age Division Tier', faydaResult.ageTier],
                        ['Gender & Blood', `${faydaResult.gender} · Blood Type ${faydaResult.blood}`],
                        ['Regional Delegation', faydaResult.region],
                        ['Verification Hash', faydaResult.hash],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ width: '42%', fontWeight: 700, color: '#64748B', fontSize: '0.82rem', padding: '10px 14px' }}>{k}</td>
                          <td style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem', padding: '10px 14px' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {!faydaResult && !otpStep && (
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
            <span>🔒 Please click "Verify Fayda FIN" above to enter your SMS OTP passcode.</span>
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
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Current Registered Club</label>
            <select className="form-select" value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)} style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }}>
              <option value="NONE">None (Independent / Unaffiliated Athlete)</option>
              {MOCK_CLUBS.map(c => (
                <option key={c.id} value={c.id}>{c.shortName} ({c.region})</option>
              ))}
            </select>
          </div>

          {/* Physical & Medical Stats Inputs */}
          <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Weight (kg)</label>
              <input className="form-input" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ padding: '12px 14px', borderRadius: '10px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Height (cm)</label>
              <input className="form-input" type="number" value={height} onChange={e => setHeight(Number(e.target.value))} style={{ padding: '12px 14px', borderRadius: '10px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(0)}>Back</button>
            <button className="btn-accent" style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(2)}>
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

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 800, color: '#0F172A' }}>Emergency Contact Person & Phone</label>
          <input className="form-input" type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(1)}>Back</button>
          <button
            className="btn-accent"
            style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
          <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>Step 4: Final Confirmation Summary</h4>

          {/* Detailed Summary Card */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Passport Card */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '120px', height: '150px', borderRadius: '14px',
                border: '4px solid #FFFFFF', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden', flexShrink: 0
              }}>
                <img src={faydaResult?.photoUrl || '/images/runner_female.png'} alt="Passport Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                  <ShieldCheck size={14} /> FAYDA IDENTITY VERIFIED
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
                    ['Full Legal Name', `${faydaResult?.name} (${faydaResult?.amharic})`],
                    ['Fayda FIN Number', faydaResult?.fin],
                    ['Cryptographic Hash', faydaResult?.hash],
                    ['Date of Birth & Division', `${faydaResult?.dob} · ${faydaResult?.ageTier}`],
                    ['Gender & Blood Group', `${faydaResult?.gender} · Type ${faydaResult?.blood}`],
                    ['Physical Stats', `Height: ${height} cm · Weight: ${weight} kg`],
                    ['Athletics Club', club?.shortName],
                    ['Primary Event(s)', eventText],
                    ['Regional Delegation', faydaResult?.region || 'Oromia Regional State'],
                    ['Account Email', email || 'athlete@athletics.et'],
                    ['Phone Number', phone || '+251 91 234 5678'],
                    ['Emergency Contact', emergencyContact],
                    ['Medical Notes', medicalNotes],
                    ['License Status', '⏳ PENDING FEDERATION AUDIT & APPROVAL'],
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
            <button className="btn-gov-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }} onClick={() => setStep(2)}>Back</button>
            <button
              className="btn-accent"
              style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleAthleteSubmit}
            >
              <CheckCircle2 size={18} /> Submit Athlete Registration to EAF
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '24px 16px', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          padding: '44px 48px',
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
        )}

        {!isSubmittedPending && <StepBar steps={steps} current={step} />}

        {isSubmittedPending
          ? renderPendingApprovalScreen()
          : (isClub ? renderClubStep() : renderAthleteStep())
        }
      </div>
    </div>
  );
}
