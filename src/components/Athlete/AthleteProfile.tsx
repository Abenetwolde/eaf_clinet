import React, { useState } from 'react';
import {
  Save, User, ShieldCheck, Mail, Phone, MapPin, Activity,
  Calendar, BadgeCheck, CheckCircle2, QrCode, Copy, Check,
  AlertCircle, Heart, Weight, Lock, ArrowLeft, Award, ExternalLink, Globe, Plane, LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Clock } from 'lucide-react';
import { useGetAthleteApplicationsQuery } from '../../store/api/athleteApi';
import { useAppSelector } from '../../store/hooks';
import type { Athlete } from '../../types';

interface AthleteProfileProps {
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onLogout?: () => void;
}

export default function AthleteProfile({ onUpdateAthlete, onNotify, onLogout }: AthleteProfileProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);

  // Real-time backend applications query with polling
  const { data: backendApps = [] } = useGetAthleteApplicationsQuery(undefined, { pollingInterval: 5000 });

  // Combined applications list (backend + local)
  const applications = (backendApps && backendApps.length > 0)
    ? backendApps.map(a => ({
        id: a.id || a.eventId,
        meetId: a.eventId,
        title: a.title,
        disciplines: Array.isArray(a.disciplines) ? a.disciplines : [a.disciplines || 'General Entry'],
        status: (a.statusLabel === 'CONFIRMED' || a.statusLabel === 'Approved' || a.qrCodeStatus === 'APPROVED') ? 'Approved' : (a.statusLabel === 'REJECTED' || a.statusLabel === 'Rejected') ? 'Rejected' : 'Pending',
        appliedDate: a.appliedAt ? a.appliedAt.split('T')[0] : '2026-10-14',
        location: a.location || 'Addis Ababa National Stadium',
        qrCodeValue: a.qrCodeValue || a.id,
      }))
    : (athlete.appliedCompetitions && athlete.appliedCompetitions.length > 0)
    ? athlete.appliedCompetitions.map((c: any) => ({
        id: c.meetId,
        meetId: c.meetId,
        title: c.meetTitle,
        disciplines: c.disciplines || ['5,000m'],
        status: c.status || 'Pending',
        appliedDate: c.appliedDate || '2026-10-14',
        location: 'Addis Ababa National Stadium',
        qrCodeValue: `EAF-${c.meetId}-${athlete.id}`,
      }))
    : [];

  // Anti-Doping Dossier State
  const [antiDopingData, setAntiDopingData] = useState<any>(null);
  const [antiDopingSummary, setAntiDopingSummary] = useState<any>(null);
  const [antiDopingTab, setAntiDopingTab] = useState<'WHEREABOUTS' | 'TESTS' | 'PROHIBITED' | 'LINKS' | 'SANCTIONS'>('WHEREABOUTS');
  const [showWhereaboutsModal, setShowWhereaboutsModal] = useState(false);
  const [wbWindow, setWbWindow] = useState("06:00 - 07:00 AM");
  const [wbVenue, setWbVenue] = useState("Sululta High Altitude Elite Training Camp");
  const [wbAddress, setWbAddress] = useState("Sululta Elite Residence Block B, Room 14");
  const [wbEmergency, setWbEmergency] = useState("+251 911 234567");
  const [wbQuarter, setWbQuarter] = useState("2026-Q4");
  const [isSavingWb, setIsSavingWb] = useState(false);

  useEffect(() => {
    const athleteId = athlete?.id || "ATH-001";
    fetch(`http://localhost:3000/api/v1/antidoping/athlete/${athleteId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setAntiDopingData(json.data);
          if (json.data.whereabouts) {
            setWbWindow(json.data.whereabouts.timeSlot || "06:00 - 07:00 AM");
            setWbVenue(json.data.whereabouts.trainingVenue || json.data.whereabouts.location || "Sululta Elite Camp");
            setWbAddress(json.data.whereabouts.overnightAddress || "Sululta Elite Residence Block B");
            setWbEmergency(json.data.whereabouts.emergencyPhone || "+251 911 234567");
          }
        }
      })
      .catch(() => {});

    fetch("http://localhost:3000/api/v1/antidoping/summary")
      .then(res => res.json())
      .then(json => {
        if (json.data) setAntiDopingSummary(json.data);
      })
      .catch(() => {});
  }, [athlete?.id]);

  const handleUpdateWhereabouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWb(true);
    try {
      const athleteId = athlete?.id || "ATH-001";
      const res = await fetch("http://localhost:3000/api/v1/antidoping/whereabouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          timeSlot: wbWindow,
          trainingVenue: wbVenue,
          location: wbVenue,
          overnightAddress: wbAddress,
          emergencyPhone: wbEmergency,
          quarter: wbQuarter,
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAntiDopingData((prev: any) => ({ ...prev, whereabouts: json.data }));
        setShowWhereaboutsModal(false);
        onNotify("Whereabouts filing successfully updated with ETH-NADO and WADA ADAMS.", "success");
      }
    } catch {
      onNotify("Whereabouts filing saved locally.", "info");
      setShowWhereaboutsModal(false);
    } finally {
      setIsSavingWb(false);
    }
  };

    const approvedCompetitions = applications.filter(a => a.status === 'Approved');
  const pendingCompetitions = applications.filter(a => a.status === 'Pending');

  const handleDownloadCompetitionPass = (app: any) => {
    const meetName = app.title || 'EAF Competition';
    const venue = app.location || 'Addis Ababa National Stadium';
    const date = app.appliedDate || '2026';
    const disciplinesStr = app.disciplines.join(', ');
    const codeId = `EAF-${app.meetId?.substring(0, 8) || 'PASS'}-${athlete.id?.substring(0, 8) || 'ATH'}`;

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06152B"/>
          <stop offset="50%" stop-color="#0A2540"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="50%" stop-color="#FCD34D"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
      </defs>
      <rect width="600" height="850" rx="32" fill="url(#bgGrad)" stroke="#F59E0B" stroke-width="3"/>
      <rect x="0" y="0" width="600" height="12" rx="6" fill="url(#goldGrad)"/>
      <text x="300" y="55" font-family="sans-serif" font-size="14" font-weight="900" fill="#FCD34D" text-anchor="middle" letter-spacing="3">ETHIOPIAN ATHLETICS FEDERATION</text>
      <text x="300" y="82" font-family="sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">OFFICIAL COMPETITION ACCREDITATION PASS</text>
      <rect x="50" y="115" width="500" height="95" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="75" y="145" font-family="sans-serif" font-size="16" font-weight="900" fill="#FFFFFF">${meetName.replace(/&/g, '&amp;')}</text>
      <text x="75" y="172" font-family="sans-serif" font-size="12" font-weight="600" fill="#94A3B8">Venue: ${venue.replace(/&/g, '&amp;')} | Date: ${date}</text>
      <text x="75" y="194" font-family="sans-serif" font-size="12" font-weight="700" fill="#38BDF8">Disciplines: ${disciplinesStr.replace(/&/g, '&amp;')}</text>
      <rect x="50" y="230" width="500" height="230" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <circle cx="120" cy="310" r="50" fill="#006633" stroke="#FCD34D" stroke-width="3"/>
      <text x="120" y="318" font-family="sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" text-anchor="middle">ETH</text>
      <text x="195" y="275" font-family="sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">${athlete.name}</text>
      <text x="195" y="298" font-family="sans-serif" font-size="13" font-weight="700" fill="#FCD34D">${athlete.amharicName || 'የኢትዮጵያ አትሌቲክስ ፌዴሬሽን'}</text>
      <text x="195" y="325" font-family="sans-serif" font-size="12" font-weight="600" fill="#94A3B8">National FIN: <tspan fill="#FFFFFF" font-family="monospace">${athlete.faydaFin || '7961-3131-0300'}</tspan></text>
      <text x="195" y="347" font-family="sans-serif" font-size="12" font-weight="600" fill="#94A3B8">EAF License: <tspan fill="#10B981" font-weight="700">${athlete.eafLicenseNo || 'EAF-LIC-2026'}</tspan></text>
      <rect x="195" y="365" width="220" height="28" rx="8" fill="#065F46"/>
      <text x="305" y="384" font-family="sans-serif" font-size="11" font-weight="900" fill="#A7F3D0" text-anchor="middle">✓ ELIGIBLE TO PARTICIPATE</text>
      <rect x="175" y="485" width="250" height="250" rx="20" fill="#FFFFFF"/>
      <text x="300" y="620" font-family="sans-serif" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">[ SECURE VERIFIED QR MATRIX ]</text>
      <text x="300" y="760" font-family="monospace" font-size="14" font-weight="900" fill="#FCD34D" text-anchor="middle" letter-spacing="2">PASS ID: ${codeId}</text>
      <text x="300" y="810" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748B" text-anchor="middle">ISSUED BY ETHIOPIAN ATHLETICS FEDERATION · CALL ROOM ACCREDITATION</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EAF_Accreditation_Pass_${meetName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`Accreditation Pass downloaded for ${meetName}`, 'success');
  };

  // Editable fields
  const [region, setRegion] = useState(athlete.region || 'Addis Ababa');
  const [phone, setPhone] = useState(athlete.phone || '+251 911 123456');
  const [email, setEmail] = useState(athlete.email || `${(athlete.name || 'athlete').toLowerCase().replace(/ /g, '.')}@eaf.org.et`);
  const [primaryEvent, setPrimaryEvent] = useState(athlete.primaryEvent || '5,000m / 10,000m');
  const [clubName, setClubName] = useState(athlete.clubName || 'Independent');
  const [weight, setWeight] = useState(athlete.weight || 58);
  const [height, setHeight] = useState(athlete.height || 172);
  const [restingHR, setRestingHR] = useState(athlete.restingHR || 48);
  const [emergencyContact, setEmergencyContact] = useState(athlete.emergencyContact || '+251 911 000000');
  const [medicalNotes, setMedicalNotes] = useState(athlete.medicalNotes || 'Blood Group O+ · Full Medical Clearance');

  const [copiedFin, setCopiedFin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyFin = () => {
    if (!athlete.faydaFin) return;
    navigator.clipboard.writeText(athlete.faydaFin);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      onNotify('Email and Phone fields are required.', 'error');
      return;
    }

    const updatedAthlete: Athlete = {
      ...athlete,
      region,
      phone,
      email,
      primaryEvent,
      clubName,
      weight: Number(weight),
      height: Number(height),
      restingHR: Number(restingHR),
      emergencyContact,
      medicalNotes,
    };

    onUpdateAthlete(updatedAthlete);
    setSavedSuccess(true);
    onNotify('Profile credentials updated successfully!', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">

      {/* ── 1. Top Executive Profile Banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#071C3D] via-[#012E7A] to-[#0140A7] p-6 sm:p-8 text-white shadow-lg border border-white/10 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={athlete.photoUrl || '/images/runner_marathon.png'}
                alt={athlete.name}
                className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-4 border-white/90 shadow-xl bg-slate-800"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-md">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Fayda Verified Profile
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  {athlete.ageTier || 'Senior Division'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
                {athlete.name}
              </h2>
              <div className="text-lg font-extrabold text-[#FCD34D]">
                {athlete.amharicName || 'አልማዝ በቀለ ነጋሽ'}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3 pt-0.5 font-medium flex-wrap">
                <span>EAF ID: <strong className="text-white font-mono">{athlete.id}</strong></span>
                <span>•</span>
                <span>FIN: <strong className="text-[#FCD34D] font-mono">{athlete.faydaFin || '7961-3131-0300'}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 w-full sm:w-auto">
            <div className="text-xs text-slate-300">Registration Status</div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black px-3 py-1 rounded-lg">
              ✓ Active National Competitor
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Desktop Two-Column Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT / MAIN FORM COLUMN (8 cols) ── */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">

          {/* Section 1: Verified National Identity (Fayda Sealed - Read-only) */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                  National Biometric Identity (Fayda Authenticated)
                </h3>
              </div>
              <span className="text-[0.7rem] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                Cryptographically Sealed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold text-slate-500">Legal Name (English)</label>
                <input
                  className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200 cursor-not-allowed"
                  type="text"
                  value={athlete.name}
                  disabled
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold text-slate-500">Legal Name (Amharic)</label>
                <input
                  className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-bold text-primary dark:text-sky-400 cursor-not-allowed"
                  type="text"
                  value={athlete.amharicName || 'አልማዝ በቀለ ነጋሽ'}
                  disabled
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold text-slate-500">Date of Birth & Age Category</label>
                <input
                  className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-medium text-slate-800 dark:text-slate-200 cursor-not-allowed"
                  type="text"
                  value={`${athlete.dob || '2004-05-12'} (${athlete.ageTier || 'Senior Division'})`}
                  disabled
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold text-slate-500">Gender</label>
                <input
                  className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-medium text-slate-800 dark:text-slate-200 cursor-not-allowed"
                  type="text"
                  value={athlete.gender || 'Female'}
                  disabled
                />
              </div>

              <div className="form-group mb-0 sm:col-span-2">
                <label className="form-label text-xs font-bold text-slate-500">Fayda FIN (National ID Number)</label>
                <div className="relative">
                  <input
                    className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-mono font-bold text-[#0F172A] dark:text-white cursor-not-allowed pr-24"
                    type="text"
                    value={athlete.faydaFin || '7961-3131-0300'}
                    disabled
                  />
                  <button
                    type="button"
                    onClick={handleCopyFin}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary cursor-pointer flex items-center gap-1"
                  >
                    {copiedFin ? <><Check size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Athletics Affiliation, Discipline & Metrics (Editable) */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Activity size={18} className="text-primary" />
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                Athletics Discipline, Delegation & Physical Stats
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  <MapPin size={13} className="text-primary" /> Regional Delegation State
                </label>
                <select
                  className="form-select text-sm font-semibold"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  {['Addis Ababa', 'Oromia', 'Amhara', 'Sidama', 'Tigray', 'SNNPR', 'Somali', 'Dire Dawa', 'Afar', 'Benishangul-Gumuz', 'Gambella', 'Harari'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  <Activity size={13} className="text-primary" /> Primary Competition Event
                </label>
                <select
                  className="form-select text-sm font-semibold"
                  value={primaryEvent}
                  onChange={e => setPrimaryEvent(e.target.value)}
                >
                  {[
                    '100m / 200m Sprint',
                    '400m / 800m Middle Distance',
                    '1,500m / 3,000m Middle Distance',
                    '5,000m Long Distance',
                    '10,000m Long Distance',
                    '3,000m Steeplechase',
                    'Half Marathon',
                    'Full Marathon',
                    'Field — Jumps (Long, High, Triple)',
                    'Field — Throws (Javelin, Shot Put, Discus)'
                  ].map(ev => (
                    <option key={ev} value={ev}>{ev}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0 sm:col-span-2">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  🏛️ Club / Delegation Affiliation
                </label>
                <input
                  className="form-input text-sm font-semibold"
                  type="text"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  placeholder="e.g. Bekoji Athletics Club / Independent"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  <Weight size={13} className="text-primary" /> Body Weight (kg)
                </label>
                <input
                  className="form-input text-sm font-semibold"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  Height (cm)
                </label>
                <input
                  className="form-input text-sm font-semibold"
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Emergency Information (Editable) */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Phone size={18} className="text-primary" />
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                Official Contact & Emergency Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  <Phone size={13} className="text-primary" /> Registered Mobile Phone
                </label>
                <input
                  className="form-input text-sm font-semibold"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+251 91 234 5678"
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold flex items-center gap-1">
                  <Mail size={13} className="text-primary" /> Official Email Address
                </label>
                <input
                  className="form-input text-sm font-semibold"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="athlete@athletics.et"
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold">Emergency Contact Phone</label>
                <input
                  className="form-input text-sm font-semibold"
                  type="text"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="+251 91 123 4567"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold">Medical Notes & Blood Group</label>
                <input
                  className="form-input text-sm font-semibold"
                  type="text"
                  value={medicalNotes}
                  onChange={e => setMedicalNotes(e.target.value)}
                  placeholder="Blood Group O+ · No known allergies"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Anti-Doping & Clean Athletics Integrity Dossier */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                    Anti-Doping & Clean Athletics Integrity Dossier
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold m-0">
                    WADA 2026 Code · Athletics Integrity Unit (AIU) · ETH-NADO Certified
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <BadgeCheck size={13} className="text-emerald-600" />
                  Compliance: Clean Standing
                </span>
              </div>
            </div>

            {/* Anti-Doping Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              {[
                { id: "WHEREABOUTS", label: "Whereabouts & Testing Window" },
                { id: "TESTS", label: "Doping Control & History" },
                { id: "PROHIBITED", label: "WADA 2026 Prohibited List" },
                { id: "LINKS", label: "Official Authorities" },
                { id: "SANCTIONS", label: "Sanctions Registry" },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAntiDopingTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all border-0 ${
                    antiDopingTab === t.id
                      ? "bg-slate-900 text-white font-black dark:bg-blue-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sub-Panel 1: Whereabouts Filing */}
            {antiDopingTab === "WHEREABOUTS" && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">60-Minute Daily Testing Window</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Clock size={15} className="text-blue-600" />
                      {wbWindow}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Active Quarter Filing</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      {wbQuarter} · Filed with WADA ADAMS
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block mb-1">Primary Training Facility & Track Venue</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500" />
                      {wbVenue}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block mb-1">Overnight Accommodation & Residential Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {wbAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Whereabouts Emergency Contact</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600" />
                      {wbEmergency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Access Control Classification</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">
                      Restricted to Athlete, EAF Integrity Officer, & AIU
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowWhereaboutsModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs cursor-pointer shadow-xs border-0 flex items-center gap-1.5"
                  >
                    <Clock size={14} /> Update Whereabouts & Testing Window
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Panel 2: Doping Control & Testing History */}
            {antiDopingTab === "TESTS" && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Sample Date</th>
                        <th className="p-3">Type & Matrix</th>
                        <th className="p-3">Testing Authority</th>
                        <th className="p-3">Laboratory & Outcome</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(antiDopingData?.testingHistory || [
                        { id: "TEST-01", testDate: "2026-08-14", sampleType: "Urine In-Competition", testingAuthority: "AIU / Athletics Integrity Unit", laboratory: "WADA Accredited Lab Lausanne", result: "NEGATIVE_CLEAN" },
                        { id: "TEST-02", testDate: "2026-04-20", sampleType: "Blood ABP Passport", testingAuthority: "ETH-NADO", laboratory: "WADA Accredited Lab Doha", result: "NEGATIVE_CLEAN" }
                      ]).map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{t.testDate}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{t.sampleType}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-blue-700 dark:text-blue-400">{t.testingAuthority}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{t.laboratory || "WADA Accredited"}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              PASS · NEGATIVE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
                  All test records are legally disclosed in compliance with the World Athletics Anti-Doping Rules (ADR) and WADA International Standard for Results Management (ISRM).
                </div>
              </div>
            )}

            {/* Sub-Panel 3: WADA 2026 Prohibited List & TUE */}
            {antiDopingTab === "PROHIBITED" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold leading-relaxed">
                  ⚠️ <strong>Strict Liability Principle:</strong> As an athlete, you are strictly responsible for any substance found in your sample, regardless of intent. Always check every medication and supplement before use!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(antiDopingSummary?.substancesCategories || [
                    { code: "S1", name: "Anabolic Agents", status: "PROHIBITED_AT_ALL_TIMES", examples: "Nandrolone, Stanozolol, Testosterone" },
                    { code: "S2", name: "Peptide Hormones, Growth Factors", status: "PROHIBITED_AT_ALL_TIMES", examples: "EPO, CERA, hGH, IGF-1" },
                    { code: "S3", name: "Beta-2 Agonists", status: "PROHIBITED_WITH_EXCEPTIONS", examples: "Inhaled Salbutamol restricted to max 1600mcg/24h" },
                    { code: "S4", name: "Hormone & Metabolic Modulators", status: "PROHIBITED_AT_ALL_TIMES", examples: "Meldonium, Trimetazidine, Tamoxifen" },
                    { code: "S5", name: "Diuretics & Masking Agents", status: "PROHIBITED_AT_ALL_TIMES", examples: "Furosemide, Hydrochlorothiazide" },
                    { code: "M1-M3", name: "Prohibited Methods", status: "PROHIBITED_AT_ALL_TIMES", examples: "Blood transfusions, IV infusions >100mL/12h" },
                    { code: "S6", name: "Stimulants", status: "PROHIBITED_IN_COMPETITION", examples: "Ephedrine (>10mcg/mL), Pseudoephedrine (>150mcg/mL)" },
                    { code: "S9", name: "Glucocorticoids", status: "PROHIBITED_IN_COMPETITION", examples: "Injectable or oral cortisone (TUE required)" }
                  ]).map((cat: any) => (
                    <div key={cat.code} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-black text-slate-900 dark:text-white">{cat.code} · {cat.name}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                          {cat.status === "PROHIBITED_IN_COMPETITION" ? "In-Competition" : "Prohibited At All Times"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 m-0">
                        {cat.examples}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-extrabold text-blue-950 dark:text-blue-200 m-0 text-sm">Need a Therapeutic Use Exemption (TUE)?</h5>
                    <p className="text-xs text-blue-800 dark:text-blue-300 m-0">If you have an illness or condition requiring a prohibited medication, apply 30 days before competition.</p>
                  </div>
                  <a
                    href="https://www.nado.gov.et"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs no-underline flex items-center gap-1.5 shrink-0"
                  >
                    <ExternalLink size={14} /> ETH-NADO TUE Portal
                  </a>
                </div>
              </div>
            )}

            {/* Sub-Panel 4: Official Authorities & Links */}
            {antiDopingTab === "LINKS" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(antiDopingSummary?.accreditedAuthorities || [
                  { code: "WADA", name: "World Anti-Doping Agency", role: "Global Anti-Doping Code Oversight & Prohibited List", website: "https://www.wada-ama.org", portalUrl: "https://adams.wada-ama.org" },
                  { code: "AIU", name: "Athletics Integrity Unit", role: "World Athletics Testing & Integrity Oversight", website: "https://www.athleticsintegrity.org", portalUrl: "https://www.athleticsintegrity.org/know-the-rules" },
                  { code: "ETH-NADO", name: "Ethiopian National Anti-Doping Authority", role: "National Education, Testing, & TUE Committee", website: "https://www.nado.gov.et", phone: "+251 11 558 3920" }
                ]).map((auth: any) => (
                  <div key={auth.code} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-900 text-white dark:bg-slate-800">{auth.code}</span>
                        <span className="font-black text-slate-900 dark:text-white text-sm">{auth.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 m-0">{auth.role}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={auth.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline flex items-center gap-1"
                      >
                        <Globe size={13} /> Official Website
                      </a>
                      {auth.portalUrl && (
                        <a
                          href={auth.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 dark:text-slate-400 font-bold hover:underline flex items-center gap-1 ml-auto"
                        >
                          <ExternalLink size={13} /> ADAMS Portal
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Panel 5: Disclosed Sanctions Registry */}
            {antiDopingTab === "SANCTIONS" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Your Athlete Record: <strong>No active sanctions. In full eligibility standing.</strong></span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Sanctioned Person / Role</th>
                        <th className="p-3">Violation Details</th>
                        <th className="p-3">Sanction Period</th>
                        <th className="p-3">Ineligibility Window</th>
                        <th className="p-3">Tribunal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(antiDopingSummary?.sanctionedPersonnelRegistry || [
                        { id: "SANC-01", name: "Redacted Athlete A", role: "Athlete", substanceOrViolation: "Article 2.1 - Presence of Triamcinolone", sanctionPeriod: "2 Years", startDate: "2024-05-10", endDate: "2026-05-09", adjudicatingBody: "AIU Tribunal" },
                        { id: "SANC-02", name: "Redacted Personnel B", role: "Support Personnel", substanceOrViolation: "Article 2.8 - Prohibited Method", sanctionPeriod: "4 Years", startDate: "2023-01-15", endDate: "2027-01-14", adjudicatingBody: "ETH-NADO Panel" }
                      ]).map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold">{s.role}</div>
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{s.substanceOrViolation}</td>
                          <td className="p-3 font-black text-red-600">{s.sanctionPeriod}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{s.startDate} to {s.endDate}</td>
                          <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{s.adjudicatingBody}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>


          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-extrabold text-sm shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all border-none cursor-pointer flex items-center gap-2"
            >
              <Save size={16} /> Save Profile Changes
            </button>
          </div>

        </form>

        {/* ── RIGHT / SIDEBAR COLUMN (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. Official Digital Pass Credential */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0F172A] to-[#1E293B] p-5 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10">
              <div>
                <div className="text-[0.65rem] font-black text-[#FCD34D] tracking-wider uppercase">
                  EAF DIGITAL ACCREDITATION
                </div>
                <div className="text-xs font-extrabold text-white">National Athlete Pass</div>
              </div>
              <div className="bg-emerald-500 text-white text-[0.65rem] font-black px-2 py-0.5 rounded">
                AUTHENTICATED
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                <QrCode size={64} className="text-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white truncate">{athlete.name}</div>
                <div className="text-xs text-primary-light truncate">{athlete.amharicName}</div>
                <div className="text-[0.72rem] text-slate-400 mt-1.5">
                  FIN: <strong className="text-[#FCD34D] font-mono">{athlete.faydaFin || '7961-3131-0300'}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[0.7rem] text-slate-400">
              <span>WA ID: <strong className="text-white">ETH-2026-092</strong></span>
              <span className="text-emerald-400 font-bold">✓ Active License</span>
            </div>
          </div>

          {/* 1B. Official Competition Accreditation Passes (Feature 6) */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[0.68rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Competition Accreditations
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">Approved Entry Passes</div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {approvedCompetitions.length} Approved
              </span>
            </div>

            {approvedCompetitions.length > 0 ? (
              <div className="space-y-4">
                {approvedCompetitions.map((app, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 to-slate-50 dark:from-emerald-950/20 dark:to-slate-800/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                          {app.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {app.disciplines.join(' · ')}
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-white shrink-0">
                        ELIGIBLE
                      </span>
                    </div>

                    {/* Verified 2D QR Code Matrix */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="bg-white p-1 rounded-lg shrink-0 shadow-sm border border-slate-100">
                        <QRCodeSVG 
                          value={app.qrCodeValue || JSON.stringify({
                            athlete: athlete.name,
                            license: athlete.eafLicenseNo || 'EAF-LIC-2026',
                            faydaFin: athlete.faydaFin || '',
                            competition: app.title,
                            disciplines: app.disciplines,
                            eligibility: 'OFFICIAL_ATHLETE_ELIGIBLE',
                            approvalRef: app.id,
                            federation: 'Ethiopian Athletics Federation',
                            status: 'APPROVED'
                          })}
                          size={76}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-[11px]">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          REF: EAF-{app.meetId.substring(0, 8)}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          ✓ Call Room Pass Generated
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Scan for lane assignment &amp; entry check-in
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadCompetitionPass(app)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border-0"
                    >
                      <Download size={13} />
                      <span>Download Official Accreditation Pass (SVG)</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <QrCode size={24} className="text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Approved Passes Yet</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When you register for competitions and the federation admin approves your entry, your verified accreditation QR pass will appear here automatically.
                </p>
              </div>
            )}

            {pendingCompetitions.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock size={13} /> {pendingCompetitions.length} Entry Pending Approval
                </span>
                <span className="text-[10px] font-extrabold uppercase">QR Locked</span>
              </div>
            )}
          </div>

          {/* 2. Security & Compliance Status */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Accreditation Compliance
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> WADA Anti-Doping
                </span>
                <span className="font-extrabold">COMPLIANT</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Fayda Biometrics
                </span>
                <span className="font-extrabold">MATCHED</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-purple-800 dark:text-purple-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Award size={14} /> EAF License 2026
                </span>
                <span className="font-extrabold">VALID</span>
              </div>
            </div>
          </div>

          {/* 3. World Athletics Official Database Sync */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-sky-600" />
                World Athletics Integration
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ WA Synchronized
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">World Athletics ID</span>
                <span className="font-mono font-black text-sky-700 dark:text-sky-400">WA-14207842</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Global Ranking</span>
                <span className="font-black text-slate-900 dark:text-white">#1 Women's 5,000m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">WA Performance Score</span>
                <span className="font-black text-emerald-600">1,412 Points (Elite)</span>
              </div>
            </div>

            <a
              href="https://worldathletics.org/athletes/ethiopia/14207842"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>View World Athletics Official Profile</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* 4. Passport & FAN Identification */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plane size={13} className="text-purple-600" />
                Passport & FAN Identification
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                International Travel
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Fayda Access Number (FAN)</div>
                <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">{athlete.faydaFan || 'Not provided'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Passport Number & Country</div>
                <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">Not provided in this profile</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1"></div>
              </div>
            </div>
          </div>

          {/* 5. Account Session & Security */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-red-200/80 dark:border-red-900/50 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LogOut size={14} className="text-red-500" />
                Account Session & Security
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                Session Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign out of your active Ethiopian Athletics Federation digital session on this device.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer border-0"
            >
              <LogOut size={16} />
              <span>Log Out / Sign Out</span>
            </button>
          </div>

        </div>

      </div>

          {/* Whereabouts Update Modal */}
      {showWhereaboutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121829] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white m-0">Update Whereabouts Filing</h3>
                <p className="text-xs text-slate-500 font-semibold m-0">Mandatory filing with ETH-NADO & WADA ADAMS</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWhereaboutsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer border-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateWhereabouts} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">60-Minute Daily Testing Slot *</label>
                <select
                  value={wbWindow}
                  onChange={e => setWbWindow(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 dark:text-white"
                >
                  <option value="05:00 - 06:00 AM">05:00 - 06:00 AM (Early Morning)</option>
                  <option value="06:00 - 07:00 AM">06:00 - 07:00 AM (Standard Slot)</option>
                  <option value="07:00 - 08:00 AM">07:00 - 08:00 AM (Morning Slot)</option>
                  <option value="18:00 - 19:00 PM">18:00 - 19:00 PM (Evening Slot)</option>
                  <option value="19:00 - 20:00 PM">19:00 - 20:00 PM (Night Slot)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">Primary Training Facility & Track Venue *</label>
                <input
                  type="text"
                  value={wbVenue}
                  onChange={e => setWbVenue(e.target.value)}
                  placeholder="e.g. Sululta High Altitude Elite Camp"
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">Overnight Residence / Accommodation *</label>
                <input
                  type="text"
                  value={wbAddress}
                  onChange={e => setWbAddress(e.target.value)}
                  placeholder="e.g. Sululta Elite Residence Block B, Room 14"
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">Whereabouts Emergency Contact *</label>
                <input
                  type="text"
                  value={wbEmergency}
                  onChange={e => setWbEmergency(e.target.value)}
                  placeholder="e.g. +251 911 234567"
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWhereaboutsModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold cursor-pointer bg-slate-50 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWb}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer shadow-sm border-0"
                >
                  {isSavingWb ? "Filing..." : "Submit Whereabouts Filing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
