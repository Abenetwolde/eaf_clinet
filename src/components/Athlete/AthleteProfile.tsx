import React, { useEffect, useState } from 'react';
import {
  Save, User, ShieldCheck, Mail, Phone, MapPin, Activity,
  Calendar, BadgeCheck, CheckCircle2, QrCode, Copy, Check,
  AlertCircle, Heart, Weight, Lock, ArrowLeft, Award, ExternalLink, Globe, Plane, LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Clock } from 'lucide-react';
import { useGetAthleteApplicationsQuery, useUpdateAthleteProfileMutation } from '../../store/api/athleteApi';
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
  const [updateProfile] = useUpdateAthleteProfileMutation();

  const applications = (backendApps || []).map(a => ({
    id: a.id || a.eventId,
    meetId: a.eventId,
    title: a.title,
    disciplines: Array.isArray(a.disciplines) ? a.disciplines : (a.disciplines ? [a.disciplines] : []),
    status: a.statusLabel === 'APPROVED' || a.statusLabel === 'Approved' ? 'Approved' : a.statusLabel === 'REJECTED' || a.statusLabel === 'Rejected' ? 'Rejected' : 'Pending',
    appliedDate: a.appliedAt ? a.appliedAt.split('T')[0] : 'Not recorded',
    location: a.location || 'Not recorded',
    qrCodeValue: a.qrCodeValue || '',
  }));

  // Anti-Doping Dossier State
  const [antiDopingData, setAntiDopingData] = useState<any>(null);
  const [antiDopingSummary, setAntiDopingSummary] = useState<any>(null);
  const [antiDopingTab, setAntiDopingTab] = useState<'WHEREABOUTS' | 'TESTS' | 'PROHIBITED' | 'LINKS' | 'SANCTIONS'>('WHEREABOUTS');
  const [showWhereaboutsModal, setShowWhereaboutsModal] = useState(false);
  const [wbWindow, setWbWindow] = useState("");
  const [wbVenue, setWbVenue] = useState("");
  const [wbAddress, setWbAddress] = useState("");
  const [wbEmergency, setWbEmergency] = useState("");
  const [wbQuarter, setWbQuarter] = useState("");
  const [isSavingWb, setIsSavingWb] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('eafAccessToken') || localStorage.getItem('eaf_accessToken') || localStorage.getItem('token') || localStorage.getItem('eaf_token');
    if (!token) return;
    fetch("http://localhost:3000/api/v1/antidoping/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(json => { if (json?.data) setAntiDopingSummary(json.data); })
      .catch(() => {});
  }, [athlete?.id]);

  const handleUpdateWhereabouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWb(true);
    try {
      const token = localStorage.getItem('eafAccessToken') || localStorage.getItem('eaf_accessToken') || localStorage.getItem('token') || localStorage.getItem('eaf_token');
      const res = await fetch("http://localhost:3000/api/v1/antidoping/whereabouts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ athleteId: athlete.id, timeSlot: wbWindow, trainingVenue: wbVenue, location: wbVenue, overnightAddress: wbAddress, emergencyPhone: wbEmergency, quarter: wbQuarter }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Whereabouts storage is unavailable.');
      setAntiDopingData((prev: any) => ({ ...prev, whereabouts: json.data }));
      setShowWhereaboutsModal(false);
      onNotify("Whereabouts record saved.", "success");
    } catch (error: any) {
      onNotify(error?.message || "Whereabouts record could not be saved. No local record was created.", "error");
    } finally {
      setIsSavingWb(false);
    }
  };

    const approvedCompetitions = applications.filter(a => a.status === 'Approved');
  const pendingCompetitions = applications.filter(a => a.status === 'Pending');


  // Editable fields
  const [region, setRegion] = useState(athlete.region || '');
  const [phone, setPhone] = useState(athlete.phone || '');
  const [email, setEmail] = useState(athlete.email || '');
  const [primaryEvent, setPrimaryEvent] = useState(athlete.primaryEvent || '');
  const [clubName, setClubName] = useState(athlete.clubName || '');
  const [weight, setWeight] = useState(athlete.weight || '');
  const [height, setHeight] = useState(athlete.height || '');

  const [copiedFin, setCopiedFin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyFin = () => {
    if (!athlete.faydaFin) return;
    navigator.clipboard.writeText(athlete.faydaFin);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patch: Record<string, unknown> = { region, phoneNumber: phone, email, primaryEvent, clubName };
      if (weight !== '' && Number.isFinite(Number(weight))) patch.weight = Number(weight);
      if (height !== '' && Number.isFinite(Number(height))) patch.height = Number(height);
      const response: any = await updateProfile(patch).unwrap();
      onUpdateAthlete({ ...athlete, ...response, region, phone, email, primaryEvent, clubName, ...(weight !== '' ? { weight: Number(weight) } : {}), ...(height !== '' ? { height: Number(height) } : {}) });
      setSavedSuccess(true);
      onNotify('Profile changes saved.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: any) {
      onNotify(error?.data?.message || 'Profile changes could not be saved.', 'error');
    }
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
                src={athlete.photoUrl || '/images/profile-placeholder.svg'}
                alt={athlete.name}
                className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-4 border-white/90 shadow-xl bg-slate-800"
              />
              {athlete.faydaStatus === 'VERIFIED' && <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-md"><CheckCircle2 size={16} /></div>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> {athlete.faydaStatus === 'VERIFIED' ? 'Fayda verified profile' : 'Fayda verification not recorded'}
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  {athlete.ageTier || 'Age category not recorded'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
                {athlete.name}
              </h2>
              <div className="text-lg font-extrabold text-[#FCD34D]">
                {athlete.amharicName || '—'}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3 pt-0.5 font-medium flex-wrap">
                <span>EAF ID: <strong className="text-white font-mono">{athlete.id}</strong></span>
                <span>•</span>
                <span>FIN: <strong className="text-[#FCD34D] font-mono">{athlete.faydaFin || 'Not provided'}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 w-full sm:w-auto">
            <div className="text-xs text-slate-300">Registration Status</div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black px-3 py-1 rounded-lg">
              {athlete.licenseStatus === 'ACTIVE' ? 'Active license' : athlete.licenseStatus || 'Status not recorded'}
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
                  National identity {athlete.faydaStatus === 'VERIFIED' ? '(Fayda verified)' : '(verification not recorded)'}
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
                  value={athlete.amharicName || '—'}
                  disabled
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs font-bold text-slate-500">Date of Birth & Age Category</label>
                <input
                  className="form-input text-sm bg-slate-100 dark:bg-slate-800/80 font-medium text-slate-800 dark:text-slate-200 cursor-not-allowed"
                  type="text"
                  value={`${athlete.dob || '2004-05-12'} (${athlete.ageTier || 'Age category not recorded'})`}
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
                    value={athlete.faydaFin || 'Not provided'}
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

              <div className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-500">
                Emergency contacts and medical records are managed through authorized federation workflows and are not editable in this profile.
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
                    Anti-doping records shown here are provided by connected federation services.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <BadgeCheck size={13} className="text-emerald-600" />
                  No clearance status recorded
                </span>
              </div>
            </div>

            {/* Anti-Doping Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              {[
                { id: "WHEREABOUTS", label: "Whereabouts & Testing Window" },
                { id: "TESTS", label: "Doping Control & History" },
                { id: "PROHIBITED", label: "Prohibited List" },
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
                      {antiDopingData?.whereabouts?.quarter ? `${antiDopingData.whereabouts.quarter} · Filing recorded` : 'No filing record available'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block mb-1">Primary Training Facility & Track Venue</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500" />
                      {wbVenue || 'Not recorded'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block mb-1">Overnight Accommodation & Residential Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {wbAddress || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Whereabouts Emergency Contact</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600" />
                      {wbEmergency || 'Not recorded'}
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
                {(antiDopingData?.testingHistory || []).length === 0 ? <p className="text-slate-500">No testing records are available for this profile.</p> : <div className="overflow-x-auto">
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
                      {(antiDopingData?.testingHistory || []).map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{t.testDate}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{t.sampleType}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-blue-700 dark:text-blue-400">{t.testingAuthority}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{t.laboratory || "Not recorded"}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              {t.result || 'Outcome not recorded'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
                  Testing records are sensitive health data and should be viewed only by authorized users.
                </div>
              </div>
            )}

            {/* Sub-Panel 3: Prohibited List & TUE */}
            {antiDopingTab === "PROHIBITED" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold leading-relaxed">
                  ⚠️ <strong>Strict Liability Principle:</strong> As an athlete, you are strictly responsible for any substance found in your sample, regardless of intent. Always check every medication and supplement before use!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(antiDopingSummary?.substancesCategories || []).map((cat: any) => (
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
                  {(antiDopingSummary?.substancesCategories || []).length === 0 && <p className="text-slate-500">No current prohibited list is synchronized. Consult the official anti-doping authority before using medication or supplements.</p>}
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-extrabold text-blue-950 dark:text-blue-200 m-0 text-sm">Need a Therapeutic Use Exemption (TUE)?</h5>
                    <p className="text-xs text-blue-800 dark:text-blue-300 m-0">For TUE requirements and current deadlines, consult the authorized anti-doping authority.</p>
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
                  <span>Personal sanction and eligibility status is not available from an authoritative service.</span>
                </div>

                <div className="overflow-x-auto">
                  {(antiDopingSummary?.sanctionedPersonnelRegistry || []).length === 0 ? <p className="text-slate-500">No sanctions registry data is available from the connected service.</p> : <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
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
                      {(antiDopingSummary?.sanctionedPersonnelRegistry || []).map((s: any) => (
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
                  </table>}
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
                  ATHLETE PROFILE
                </div>
                <div className="text-xs font-extrabold text-white">Athlete profile</div>
              </div>
              <div className="text-slate-300 text-[0.65rem] font-bold px-2 py-0.5 rounded">
                Federation athlete record
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                {(athlete as any).credentialQrValue ? <QRCodeSVG value={(athlete as any).credentialQrValue} size={64} /> : <span className="text-xs text-slate-500">No credential QR</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white truncate">{athlete.name}</div>
                <div className="text-xs text-primary-light truncate">{athlete.amharicName}</div>
                <div className="text-[0.72rem] text-slate-400 mt-1.5">
                  FIN: <strong className="text-[#FCD34D] font-mono">{athlete.faydaFin || 'Not provided'}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[0.7rem] text-slate-400">
              <span>WA ID: <strong className="text-white">{(athlete as any).worldAthleticsId || 'Not linked'}</strong></span>
              <span className="text-slate-400 font-bold">{athlete.licenseStatus || 'License status not recorded'}</span>
            </div>
          </div>

          {/* 1B. Official Competition Accreditation Passes (Feature 6) */}
          <div className="bg-white dark:bg-[#121829] rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[0.68rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Competition Accreditations
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">Approved Event Applications</div>
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
                        APPROVED
                      </span>
                    </div>

                    {/* Verified 2D QR Code Matrix */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {app.qrCodeValue ? <div className="bg-white p-1 rounded-lg shrink-0 shadow-sm border border-slate-100"><QRCodeSVG value={app.qrCodeValue} size={76} /></div> : null}
                      <div className="min-w-0 flex-1 text-[11px]">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                          Application: {app.id || app.meetId}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          {app.qrCodeValue ? 'Federation QR credential' : 'No QR credential issued'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Approval status does not confirm event eligibility or venue check-in.
                        </div>
                      </div>
                    </div>


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
                <span className="font-extrabold">Not recorded</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Fayda Biometrics
                </span>
                <span className="font-extrabold">{athlete.faydaStatus === 'VERIFIED' ? 'Verified' : 'Not recorded'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-purple-800 dark:text-purple-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Award size={14} /> EAF License 2026
                </span>
                <span className="font-extrabold">{athlete.licenseStatus || 'Not recorded'}</span>
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
                Integration status unavailable
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">World Athletics ID</span>
                <span className="font-mono font-black text-sky-700 dark:text-sky-400">{(athlete as any).worldAthleticsId || 'Not linked'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Global Ranking</span>
                <span className="font-black text-slate-900 dark:text-white">Not available</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">WA Performance Score</span>
                <span className="font-black text-emerald-600">Not available</span>
              </div>
            </div>

            <a
              href={(athlete as any).worldAthleticsUrl || undefined}
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
                  value={wbVenue || 'Not recorded'}
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
                  value={wbAddress || 'Not recorded'}
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
                  value={wbEmergency || 'Not recorded'}
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
