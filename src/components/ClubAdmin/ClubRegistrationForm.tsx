import React, { useState, useRef } from 'react';
import {
  Building2, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, RefreshCw, Eye, EyeOff, User, Phone, Mail, MapPin,
  FileCheck, Check, Users, UploadCloud, Trash2,
  CreditCard, Smartphone, Globe, Calendar, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Club } from '../../types';
import { useGetPaymentConfigQuery } from '../../store/api/paymentApi';
import PaymentModal from '../PaymentModal';
import { useGetRegistrationOptionsQuery } from '../../store/api/athleteApi';
import { getApiErrorMessage } from '../../utils/apiMessages';

interface ClubRegistrationFormProps {
  onClose: () => void;
  onRegisterSuccess: (data: {
    type: 'CLUB';
    payload: {
      club: Club;
      targetSubPage?: string;
      session?: { token: string; refreshToken?: string; userId: string; userData?: any };
    };
  }) => void;
  onSwitchToAthlete?: () => void;
  /** When set, the region field is locked to this value (e.g. after club admin login) */
  lockedRegion?: string;
}

export default function ClubRegistrationForm({
  onClose,
  onRegisterSuccess,
  onSwitchToAthlete,
  lockedRegion,
}: ClubRegistrationFormProps) {
  const { data: registrationOptions, isLoading: loadingRegions, error: regionsError } =
    useGetRegistrationOptionsQuery();
  const regions = registrationOptions?.regions || [];

  // Payment config – used for the club registration fee shown on review + success
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const configObj = (paymentConfig as any)?.data ?? paymentConfig;
  const registrationFee = configObj?.clubRegistrationFee ?? 5000;

  // Wizard steps
  const [step, setStep] = useState(0);

  // ── Step 0: Club Identity ──────────────────────────────────────────────────
  const [clubName, setClubName] = useState('');
  const [clubShortName, setClubShortName] = useState('');
  const [clubType, setClubType] = useState('Athletics Club');
  const [foundingYear, setFoundingYear] = useState('');
  const [clubRegion, setClubRegion] = useState(lockedRegion || '');
  const [clubCity, setClubCity] = useState('');
  const [clubAddress, setClubAddress] = useState('');
  const [clubWebsite, setClubWebsite] = useState('');

  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ── Step 1: Contact & Communication ──────────────────────────────────────
  const [clubEmail, setClubEmail] = useState('');
  const [clubPhone, setClubPhone] = useState('');
  const [clubAltPhone, setClubAltPhone] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');

  // ── Step 2: Governance ───────────────────────────────────────────────────
  const [repName, setRepName] = useState('');
  const [repTitle, setRepTitle] = useState('Club President');
  const [repPhone, setRepPhone] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [licenseRef, setLicenseRef] = useState('');

  // ── Step 3: Admin Account ─────────────────────────────────────────────────
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToCharter, setAgreeToCharter] = useState(false);

  // ── Submission state ──────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredClub, setRegisteredClub] = useState<Club | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [registeredSession, setRegisteredSession] = useState<{
    token: string; refreshToken?: string; userId: string; userData?: any;
  } | undefined>();

  // ── Payment state (used on the success screen) ───────────────────────────
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    type: string;
    clubId: string;
    clubName: string;
    amount: number;
    description: string;
  } | null>(null);

  // ── Logo helpers ──────────────────────────────────────────────────────────
  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Image size exceeds 5 MB. Please choose a smaller file.');
      return;
    }
    setLogoUploadError('');
    setLogoFileName(file.name);
    setIsUploadingLogo(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) setCustomLogoUrl(url);
    };
    reader.readAsDataURL(file);

    try {
      const form = new FormData();
      form.append('file', file);
      for (const ep of ['/api/v1/clubs/upload-logo', 'http://localhost:3000/api/v1/clubs/upload-logo']) {
        try {
          const res = await fetch(ep, { method: 'POST', body: form });
          if (res.ok) {
            const json = await res.json();
            if (json?.data?.url) {
              const full = json.data.url.startsWith('http')
                ? json.data.url
                : `http://localhost:3000${json.data.url}`;
              setCustomLogoUrl(full);
              break;
            }
          }
        } catch (fetchErr) {
          console.warn('Upload attempt error at ' + ep, fetchErr);
        }
      }
    } catch { }
    finally { setIsUploadingLogo(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleLogoFile(f);
  };

  // ── Auto-sync admin email with club email ────────────────────────────────
  const handleClubEmailChange = (val: string) => {
    setClubEmail(val);
    if (!adminEmail || adminEmail === clubEmail) setAdminEmail(val);
  };

  // ── Step validation ──────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!clubName.trim()) {
      setErrorMessage('Please provide the official legal name of the club.');
      return false;
    }
    if (!clubCity.trim()) {
      setErrorMessage('Please specify the city / municipality of the club headquarters.');
      return false;
    }
    if (!clubEmail.trim() || !clubEmail.includes('@')) {
      setErrorMessage('Please provide a valid official email address for the club.');
      return false;
    }
    if (!clubPhone.trim()) {
      setErrorMessage('Please provide an official telephone number for the club.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep1 = () => {
    if (!clubEmail.trim() || !clubEmail.includes('@')) {
      setErrorMessage('Please provide a valid official email address for the club.');
      return false;
    }
    if (!clubPhone.trim()) {
      setErrorMessage('Please provide an official telephone number for the club.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep2 = () => {
    if (!repName.trim()) {
      setErrorMessage('Please enter the full name of the authorized club president or representative.');
      return false;
    }
    if (!repPhone.trim()) {
      setErrorMessage('Please provide the contact phone number of the representative.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const validateStep3 = () => {
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address for logging into the club portal.');
      return false;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return false;
    }
    if (!agreeToCharter) {
      setErrorMessage('You must acknowledge and agree to comply with EAF statutes and the Fayda member verification mandate.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep0()) { setStep(0); return; }
    if (!validateStep1()) { setStep(1); return; }
    if (!validateStep2()) { setStep(2); return; }
    if (!validateStep3()) { setStep(3); return; }

    setIsSubmitting(true);
    setErrorMessage('');

    const shortCode = clubShortName.trim() || clubName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 6);
    const splitNames = repName.trim().split(' ');
    const firstName = splitNames[0] || 'Club';
    const lastName = splitNames.slice(1).join(' ') || 'President';

    const payload = {
      email: adminEmail.trim(),
      password,
      firstName,
      lastName,
      phoneNumber: repPhone.trim(),
      clubName: clubName.trim(),
      clubShortName: shortCode,
      clubEmail: clubEmail.trim(),
      clubPhone: clubPhone.trim(),
      clubAddress: clubAddress.trim(),
      clubCity: clubCity.trim(),
      clubRegion,
      clubWebsite: clubWebsite.trim() || undefined,
      clubType: clubType.trim(),
      foundingYear: foundingYear ? Number(foundingYear) : undefined,
      licenseNumber: licenseRef.trim() || undefined,
      logoUrl: customLogoUrl || undefined,
      repTitle: repTitle.trim(),
      repEmail: repEmail.trim() || undefined,
    };

    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/clubs/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(getApiErrorMessage(json, 'Club registration failed. Please check your details and try again.'));
      const persisted = json?.data?.club;
      if (!persisted?.id || !json?.data?.user?.id) throw new Error('The server did not confirm the club account. Please try again.');

      // Auto sign-in
      const loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminEmail.trim(), password }),
      });
      const loginJson = await loginRes.json().catch(() => ({}));
      const loginData = loginJson?.data || loginJson;
      const sessionToken = loginData?.token || loginData?.accessToken;
      if (!loginRes.ok || !sessionToken || !loginData?.userId) {
        throw new Error('Club registered but automatic sign-in failed. Please sign in manually with your email and password.');
      }

      setRegisteredSession({
        token: sessionToken,
        refreshToken: loginData.refreshToken,
        userId: loginData.userId,
        userData: loginData.user,
      });

      const newClub: Club = {
        id: persisted.id,
        name: persisted.name || clubName.trim(),
        shortName: persisted.shortName || shortCode,
        region: persisted.region || clubRegion,
        manager: `${json.data.user.firstName || firstName} ${json.data.user.lastName || lastName}`.trim(),
        email: persisted.email || clubEmail.trim(),
        phone: persisted.phone || clubPhone.trim(),
        licensedAthletes: 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: persisted.logoUrl || customLogoUrl || '',
        clubRank: 1,
        totalPoints: 0,
      };
      (newClub as any).city = clubCity.trim();
      (newClub as any).address = clubAddress.trim();
      (newClub as any).website = clubWebsite.trim();
      (newClub as any).presidentName = repName.trim();
      (newClub as any).charterAuthority = repTitle.trim();
      (newClub as any).logoUrl = persisted.logoUrl || customLogoUrl || '';
      (newClub as any).verificationStatus = persisted.verificationStatus;
      (newClub as any).licenseNumber = persisted.licenseNumber || persisted.id;

      setRegisteredClub(newClub);
      setReferenceId(persisted.licenseNumber || persisted.id);
      setStep(5); // Show success screen
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, 'Unable to connect to the registration service. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['1. Club Identity', '2. Contact', '3. Governance', '4. Admin Account', '5. Review'];

  // ── Shared input style ────────────────────────────────────────────────────
  const inp = 'w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none';
  const label = 'block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5';
  const fieldset = 'space-y-1';
  const req = <span className="text-red-500">*</span>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 my-4 sm:my-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">

          {/* Header */}
          {step < 5 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-xs shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
                    Club Organization Registration
                    <span className="bg-sky-100 text-sky-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-sky-300 hidden sm:inline">
                      Official EAF Portal
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    No Fayda ID required — member athletes will be added via Fayda inside the Club Portal.
                  </p>
                </div>
              </div>
              {onSwitchToAthlete && (
                <button
                  type="button"
                  onClick={onSwitchToAthlete}
                  className="text-xs font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <User size={14} /> Switch to Athlete Registration
                </button>
              )}
            </div>
          )}

          {/* Stepper */}
          {step < 5 && (
            <div className="flex items-center justify-between gap-1 mb-8 overflow-x-auto pb-1">
              {stepLabels.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${done ? 'bg-emerald-500 text-white' : active ? 'bg-sky-600 text-white ring-4 ring-sky-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                      </div>
                      <span className={`text-xs font-bold whitespace-nowrap hidden sm:block ${active ? 'text-slate-900 font-extrabold' : done ? 'text-emerald-700' : 'text-slate-500'
                        }`}>{s}</span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 min-w-[12px] transition-all ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-sm animate-in fade-in">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-extrabold block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 0 — Club Identity & Headquarters                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">1. Club Identity & Headquarters</h2>
                <p className="text-xs text-slate-500 mt-1 m-0">Official organizational information as registered with the Regional Sports Bureau or Ministry of Sport.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Official Club Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g. Ethiopian Electric Athletics Club"
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Short Code / Acronym
                    </label>
                    <input
                      type="text"
                      value={clubShortName}
                      onChange={(e) => setClubShortName(e.target.value.toUpperCase())}
                      placeholder="e.g. EEAC"
                      maxLength={8}
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 bg-white uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Region & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={fieldset}>
                    <label className={label}>Affiliated Regional State {req}</label>
                    {lockedRegion ? (
                      <div className={inp + ' bg-slate-100 text-slate-600 cursor-not-allowed flex items-center gap-2'}>
                        <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                        <span>{lockedRegion}</span>
                        <span className="ml-auto text-[11px] font-bold text-slate-400">Locked</span>
                      </div>
                    ) : (
                      <select
                        value={clubRegion}
                        onChange={(e) => setClubRegion(e.target.value)}
                        required
                        disabled={loadingRegions || !regions.length}
                        className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">— Select regional state —</option>
                        {regions.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    )}
                    {regionsError && <p className="mt-1 text-xs text-red-600">Could not load regions. Please check the server connection and retry.</p>}
                    {regions.find((region) => region.name === clubRegion)?.flagImageUrl && <img className="mt-2 h-8 w-12 rounded border object-cover" src={regions.find((region) => region.name === clubRegion)?.flagImageUrl || ''} alt={`${clubRegion} flag`} />}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      City / Municipality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={clubCity}
                      onChange={(e) => setClubCity(e.target.value)}
                      placeholder="e.g. Addis Ababa"
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Headquarters / Office Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={clubAddress}
                      onChange={(e) => setClubAddress(e.target.value)}
                      placeholder="e.g. Mexico Square, EEP Compound, Building 4"
                      className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Official Club Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={clubEmail}
                        onChange={(e) => handleClubEmailChange(e.target.value)}
                        placeholder="e.g. contact@eeac-athletics.et"
                        className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Official Club Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={clubPhone}
                        onChange={(e) => setClubPhone(e.target.value)}
                        placeholder="e.g. +251 11 551 2233"
                        className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Club Official Logo Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      Official Club Crest / Logo <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-bold text-sky-700">
                      PNG, JPG, WEBP or SVG (Max 5MB)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {customLogoUrl ? (
                    <div className="p-4 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                          <img src={customLogoUrl} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 truncate max-w-[200px] block">{logoFileName || 'Uploaded Club Logo'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 mt-1">
                            <CheckCircle2 size={11} /> Uploaded
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                          Change
                        </button>
                        <button type="button" onClick={() => { setCustomLogoUrl(''); setLogoFileName(''); }}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer bg-white">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={e => { e.preventDefault(); setIsDraggingOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleLogoFile(f); }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center gap-2 ${isDraggingOver ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/30'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                        {isUploadingLogo ? <RefreshCw size={22} className="animate-spin" /> : <UploadCloud size={24} />}
                      </div>
                      <span className="text-sm font-black text-slate-900">{isUploadingLogo ? 'Uploading…' : 'Upload Club Logo'}</span>
                      <span className="text-xs text-slate-500">Click to browse or drag and drop</span>
                      <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-sky-700 shadow-xs">Choose File</span>
                    </div>
                  )}
                  {logoUploadError && (
                    <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={13} /> {logoUploadError}</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm">Cancel</button>
                  <button type="button" onClick={() => { if (validateStep0()) setStep(1); }}
                    className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0">
                    Continue to Contact <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 1 — Contact & Communication                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">2. Official Club Contact & Communication</h2>
                <p className="text-xs text-slate-500 mt-1 m-0">Provide contact details that the federation will use for official correspondence and public listings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={fieldset}>
                  <label className={label}>Official Club Email {req}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input type="email" value={clubEmail} onChange={e => handleClubEmailChange(e.target.value)}
                      placeholder="e.g. info@eeac-athletics.et" className={inp + ' pl-10'} required />
                  </div>
                </div>
                <div className={fieldset}>
                  <label className={label}>Primary Club Phone {req}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input type="tel" value={clubPhone} onChange={e => setClubPhone(e.target.value)}
                      placeholder="e.g. +251 11 551 2233" className={inp + ' pl-10'} required />
                  </div>
                </div>
              </div>

              <div className={fieldset}>
                <label className={label}>Alternate / Mobile Phone <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input type="tel" value={clubAltPhone} onChange={e => setClubAltPhone(e.target.value)}
                    placeholder="e.g. +251 91 144 2159" className={inp + ' pl-10'} />
                </div>
              </div>

              <div className="pt-1">
                <p className={label + ' mb-3'}>Social Media Handles <span className="text-slate-400 font-normal lowercase">(optional)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={fieldset}>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Facebook Page</label>
                    <input type="text" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)}
                      placeholder="e.g. facebook.com/eeac" className={inp} />
                  </div>
                  <div className={fieldset}>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Telegram Channel</label>
                    <input type="text" value={socialTelegram} onChange={e => setSocialTelegram(e.target.value)}
                      placeholder="e.g. t.me/eeac_official" className={inp} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setStep(0)} className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-1.5">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => { if (validateStep1()) setStep(2); }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Continue to Governance</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 2 — Governance & Accreditation                            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">3. Club Governance & Signatory Authority</h2>
                <p className="text-xs text-slate-500 mt-1 m-0">Specify the authorized club president or legal representative, and any regional sports bureau registration details.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Authorized President / Representative Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="e.g. Dawit Bekele Negash"
                        className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Mandate / Official Title
                    </label>
                    <input
                      type="text"
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      placeholder="e.g. Executive President & Signatory"
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Representative Mobile Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={repPhone}
                        onChange={(e) => setRepPhone(e.target.value)}
                        placeholder="e.g. 0911442159"
                        className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Regional Sports Bureau License / Reference
                    </label>
                    <div className="relative">
                      <FileCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={licenseRef}
                        onChange={(e) => setLicenseRef(e.target.value)}
                        placeholder="e.g. RSB-AA-2024-C9842"
                        className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Club Founding Year
                  </label>
                  <input
                    type="number"
                    value={foundingYear}
                    onChange={(e) => setFoundingYear(e.target.value)}
                    placeholder="e.g. 1988"
                    min="1900"
                    max="2026"
                    className="w-full sm:w-48 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (validateStep2()) setStep(3); }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Continue to Portal Account</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 3 — Admin Account & Charter                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">4. Club Administrator Account</h2>
                <p className="text-xs text-slate-500 mt-1 m-0">Create sign-in credentials for the club admin portal. This account will manage your roster, competition entries, and transfers.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Administrator Sign-In Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. president@eeac-athletics.et"
                      className="w-full pl-10 p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    You will use this email to sign into the Club Admin portal.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full p-3.5 pr-10 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                {/* Compliance Box */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToCharter}
                      onChange={(e) => setAgreeToCharter(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 mt-1 border-slate-300 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block font-bold mb-0.5">
                        Ethiopian Athletics Federation Charter & Member Mandate Agreement
                      </strong>
                      By registering, our club officially agrees to abide by World Athletics and EAF technical, ethical, and anti-doping regulations. We understand that <strong>club registration does not require personal Fayda IDs upfront</strong>, but all member athletes and coaches must be registered and verified via <strong>Fayda National ID</strong> in the club roster before entering official competitions.
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (validateStep3()) setStep(4); }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Review Application</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 4 — Review & Submit                                       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">5. Review & Confirm Club Registration</h2>
                <p className="text-xs text-slate-500 mt-1 m-0">Verify all details before submitting to the Ethiopian Athletics Federation.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                {/* Club header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                    {customLogoUrl ? (
                      <img src={customLogoUrl} alt="Club Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 size={28} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="bg-sky-100 text-sky-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-sky-300">
                      {clubType}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1 mb-0">
                      {clubName} {clubShortName && <span className="text-slate-500 font-bold">({clubShortName})</span>}
                    </h3>
                    <p className="text-xs text-slate-500 m-0">{clubRegion} · {clubCity}{foundingYear && ` · Est. ${foundingYear}`}</p>
                  </div>
                </div>

                {/* Detail rows */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                  {[
                    ['Official Email', clubEmail],
                    ['Official Phone', clubPhone],
                    ['Headquarters', [clubAddress, clubCity, clubRegion].filter(Boolean).join(', ')],
                    ['Club President', `${repName} — ${repTitle}`],
                    ['President Phone', repPhone],
                    licenseRef && ['Sports Bureau Ref', licenseRef],
                    clubWebsite && ['Website', clubWebsite],
                    ['Admin Sign-In Account', adminEmail],
                  ].filter(Boolean).map(([k, v]: any) => (
                    <div key={k} className={`p-3 flex justify-between gap-2 ${k === 'Admin Sign-In Account' ? 'bg-sky-50/60' : ''}`}>
                      <span className="font-bold text-slate-500 shrink-0">{k}</span>
                      <span className="font-black text-slate-900 text-right truncate">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Federation Fee Schedule Card */}
                <div className="bg-sky-50/80 border-2 border-sky-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs shrink-0">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-900">
                          Federation Club Registration Fee
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-200 text-sky-900">
                          Mandatory
                        </span>
                      </div>
                      <p className="text-xs text-sky-800 mt-0.5 m-0 leading-relaxed">
                        Official Ethiopian Athletics Federation digital registry & charter fee. Processed securely via Telebirr Web Pay.
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-sky-200">
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {registrationFee.toLocaleString()} ETB
                    </div>
                    <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1 sm:justify-end mt-0.5">
                      <Smartphone size={13} />
                      <span>Telebirr H5 Checkout</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>No Fayda ID is required to register the club. Member athletes and coaches will be added via Fayda inside the Club Portal after registration.</span>
                </div>
              </div>

              {/* Submission Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 text-xs sm:text-sm shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-red-800 mb-1">
                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                    <span>Registration could not be completed:</span>
                  </div>
                  <p className="text-red-700 font-medium pl-6 m-0">{errorMessage}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" disabled={isSubmitting} onClick={handleSubmit}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0">
                  {isSubmitting ? (
                    <><RefreshCw size={17} className="animate-spin" /> Registering Club…</>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Register Club with EAF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 5 — Success                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 5 && registeredClub && (
            <div className="flex flex-col items-center text-center py-6 sm:py-8 max-w-xl mx-auto">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center shadow-lg relative mb-5"
              >
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-25 animate-ping" />
                <CheckCircle2 size={42} className="text-emerald-600 relative z-10" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Club Registered Successfully!
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
                <strong>{registeredClub.name}</strong> was saved to the Ethiopian Athletics Federation registry. Sign in with the administrator email and password you registered.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full text-left mb-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-500">EAF Club Reference</span>
                  <span className="text-sm font-black text-sky-700 font-mono">{referenceId}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <span className="text-xs font-bold text-slate-500">Accreditation Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    Under Federation Review
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                    {(registeredClub.logo || '').startsWith('data:') || (registeredClub.logo || '').startsWith('http') || (registeredClub.logo || '').startsWith('/') ? (
                      <img src={registeredClub.logo} alt="Club Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{registeredClub.name}</div>
                    <div className="text-xs font-bold text-sky-700">{registeredClub.region} · Admin: {registeredClub.manager}</div>
                  </div>
                </div>
              </div>

              {/* Complete Payment Button if still pending */}
              {paymentCompleted ? (
                <div className="w-full mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-800">Registration Fee Paid &amp; Certified via Telebirr</div>
                    <div className="text-xs font-semibold text-emerald-700">Accreditation payment has been verified. No further payment required until the annual cycle.</div>
                  </div>
                </div>
              ) : (
                <div className="w-full mb-6">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentModalData({
                        type: 'CLUB_REGISTRATION_FEE',
                        clubId: registeredClub.id,
                        clubName: registeredClub.name,
                        amount: registrationFee,
                        description: 'EAF Official Club Organization Registration & Accreditation Fee',
                      })
                    }
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer border-0"
                  >
                    <Smartphone size={18} />
                    <span>Complete Registration Fee via Telebirr ({registrationFee.toLocaleString()} ETB)</span>
                  </button>
                </div>
              )}

              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-5 w-full text-left mb-6">
                <div className="flex items-center gap-2 mb-1.5 text-sky-900 font-black text-sm">
                  <Users size={18} className="text-sky-700" />
                  Next: Add Members to Your Roster
                </div>
                <p className="text-xs text-sky-800 leading-relaxed m-0">
                  Immediately begin adding athletes, coaches, and technical staff by verifying their <strong>Fayda National IDs</strong> inside the Club Portal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button type="button"
                  onClick={() => onRegisterSuccess({ type: 'CLUB', payload: { club: registeredClub, targetSubPage: 'REGISTER_MEMBER', session: registeredSession } })}
                  className="flex-1 py-4 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer border-0">
                  <Users size={18} /> Enter Portal & Add Members
                </button>
                <button type="button"
                  onClick={() => onRegisterSuccess({ type: 'CLUB', payload: { club: registeredClub, targetSubPage: 'OVERVIEW', session: registeredSession } })}
                  className="py-4 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm cursor-pointer">
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Payment modal – opened from the success screen */}
      {paymentModalData && (
        <PaymentModal
          paymentData={paymentModalData}
          onClose={() => setPaymentModalData(null)}
          onPaymentComplete={() => {
            setPaymentCompleted(true);
            setPaymentModalData(null);
          }}
          onPaymentSuccess={() => {
            setPaymentCompleted(true);
            setPaymentModalData(null);
          }}
        />
      )}
    </div>
  );
}
