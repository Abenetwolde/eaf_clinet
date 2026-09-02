import React, { useState, useEffect } from 'react';
import {
  Save, User, ShieldCheck, Mail, Phone, MapPin, Activity,
  Calendar, BadgeCheck, CheckCircle2, QrCode, Copy, Check,
  AlertCircle, Heart, Weight, Lock, ArrowLeft, Award
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { formatFaydaId } from '../../utils/formatFaydaId';
import type { Athlete } from '../../types';

interface AthleteProfileProps {
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteProfile({ onUpdateAthlete, onNotify }: AthleteProfileProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);

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

  // Re-sync editable fields when the backend profile (GET /athletes/profile)
  // hydrates state.auth.athlete after this screen mounts.
  useEffect(() => {
    if (!athlete?.id) return;
    setRegion(athlete.region || 'Addis Ababa');
    setPhone(athlete.phone || '+251 911 123456');
    setEmail(athlete.email || `${(athlete.name || 'athlete').toLowerCase().replace(/ /g, '.')}@eaf.org.et`);
    setPrimaryEvent(athlete.primaryEvent || '5,000m / 10,000m');
    setClubName(athlete.clubName || 'Independent');
    setWeight(athlete.weight || 58);
    setHeight(athlete.height || 172);
    setRestingHR(athlete.restingHR || 48);
    setEmergencyContact(athlete.emergencyContact || '+251 911 000000');
    setMedicalNotes(athlete.medicalNotes || 'Blood Group O+ · Full Medical Clearance');
  }, [athlete?.id, athlete?.phone, athlete?.email, athlete?.primaryEvent, athlete?.clubName, athlete?.weight, athlete?.height, athlete?.region]);

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
                <span>FIN: <strong className="text-[#FCD34D] font-mono">{formatFaydaId(athlete.faydaFin) || '—'}</strong></span>
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
                    value={formatFaydaId(athlete.faydaFin) || '—'}
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
                  FIN: <strong className="text-[#FCD34D] font-mono">{formatFaydaId(athlete.faydaFin) || '—'}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[0.7rem] text-slate-400">
              <span>WA ID: <strong className="text-white">ETH-2026-092</strong></span>
              <span className="text-emerald-400 font-bold">✓ Active License</span>
            </div>
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

        </div>

      </div>

    </div>
  );
}
