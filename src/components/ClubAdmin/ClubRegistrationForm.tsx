import React, { useState, useRef } from 'react';
import {
  Building2, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, RefreshCw, Eye, EyeOff, User, Phone, Mail, MapPin,
  FileCheck, Sparkles, Check, Users, UploadCloud, Image as ImageIcon, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Club } from '../../types';

interface ClubRegistrationFormProps {
  onClose: () => void;
  onRegisterSuccess: (data: { type: 'CLUB'; payload: { club: Club; targetSubPage?: string; session?: { token: string; refreshToken?: string; userId: string; userData?: any } } }) => void;
  onSwitchToAthlete?: () => void;
}

const ETHIOPIAN_REGIONS = [
  'Addis Ababa (Federal City)',
  'Oromia Regional State',
  'Amhara Regional State',
  'Sidama Regional State',
  'Tigray Regional State',
  'Somali Regional State',
  'South Ethiopia Regional State',
  'Central Ethiopia Regional State',
  'Dire Dawa (Chartered City)',
  'Afar Regional State',
  'Benishangul-Gumuz Regional State',
  'Gambela Regional State',
  'Harari Regional State',
  'Federal Defense / Police Command',
];

const CLUB_EMBLEMS = ['⚡', '🦅', '🦁', '🏃', '🏆', '🌟', '🛡️', '🏔️', '🐆', '🌲'];

export default function ClubRegistrationForm({
  onClose,
  onRegisterSuccess,
  onSwitchToAthlete,
}: ClubRegistrationFormProps) {
  // Wizard step (0: Organization Info, 1: Leadership & Accreditation, 2: Account & Charter, 3: Review, 4: Success)
  const [step, setStep] = useState<number>(0);

  // Step 1: Club Identity & Location
  const [clubName, setClubName] = useState('');
  const [clubShortName, setClubShortName] = useState('');
  const [clubRegion, setClubRegion] = useState(ETHIOPIAN_REGIONS[0]);
  const [clubCity, setClubCity] = useState('');
  const [clubAddress, setClubAddress] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [clubPhone, setClubPhone] = useState('');
  const [clubLogo, setClubLogo] = useState('⚡');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleLogoFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    setLogoUploadError('');
    setLogoFileName(file.name);
    setIsUploadingLogo(true);

    // Immediate local preview so UI never waits
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) setCustomLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    // Real server upload
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoints = [
        '/api/v1/clubs/upload-logo',
        'http://localhost:3000/api/v1/clubs/upload-logo',
      ];

      let uploadedUrl = '';
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.data?.url) {
              uploadedUrl = json.data.url;
              break;
            }
          }
        } catch (fetchErr) {
          console.warn('Upload attempt error at ' + ep, fetchErr);
        }
      }

      if (uploadedUrl) {
        const fullUrl = uploadedUrl.startsWith('http')
          ? uploadedUrl
          : `http://localhost:3000${uploadedUrl}`;
        setCustomLogoUrl(fullUrl);
      }
    } catch (err: any) {
      console.warn('Server upload notice, keeping local preview:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoFile(file);
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrl('');
    setLogoFileName('');
    setLogoUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2: Governance & Accreditation
  const [repName, setRepName] = useState('');
  const [repTitle, setRepTitle] = useState('Executive President & Legal Signatory');
  const [repPhone, setRepPhone] = useState('');
  const [licenseRef, setLicenseRef] = useState('');
  const [foundingYear, setFoundingYear] = useState('2018');

  // Step 3: Admin Account & Compliance
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToCharter, setAgreeToCharter] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredClub, setRegisteredClub] = useState<Club | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [registeredSession, setRegisteredSession] = useState<{ token: string; refreshToken?: string; userId: string; userData?: any } | undefined>();

  // Auto-sync admin email with club email if empty
  const handleClubEmailChange = (val: string) => {
    setClubEmail(val);
    if (!adminEmail || adminEmail === clubEmail) {
      setAdminEmail(val);
    }
  };

  // Step validation
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

  const validateStep2 = () => {
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

  // Submit Registration
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const resolvedLogo = (customLogoUrl.trim().startsWith('http') || customLogoUrl.trim().startsWith('/'))
      ? customLogoUrl.trim()
      : clubLogo;

    const shortCode = clubShortName.trim() || clubName.split(' ')[0] || 'CLUB';
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
      licenseNumber: licenseRef.trim() || undefined,
      logoUrl: resolvedLogo,
    };

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/clubs/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || 'Club registration failed. Please check your details and try again.');
      }
      const persistedClub = json?.data?.club;
      if (!persistedClub?.id || !json?.data?.user?.id) {
        throw new Error('The server did not confirm the club account. Please try again.');
      }

      // Registration creates the admin account but does not create a browser
      // session. Sign in with the submitted credentials so protected portal
      // requests (including member registration) have a bearer token.
      const loginRes = await fetch(`${apiBase.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminEmail.trim(), password }),
      });
      const loginJson = await loginRes.json().catch(() => ({}));
      const sessionToken = loginJson?.token || loginJson?.accessToken;
      if (!loginRes.ok || !sessionToken || !loginJson?.userId) {
        throw new Error('Club registered, but automatic sign-in failed. Please sign in with your club admin email and password before adding members.');
      }
      setRegisteredSession({
        token: sessionToken,
        refreshToken: loginJson.refreshToken,
        userId: loginJson.userId,
        userData: loginJson.user,
      });

      const newClub: Club = {
        id: persistedClub.id,
        name: persistedClub.name || clubName.trim(),
        shortName: persistedClub.shortName || shortCode,
        region: persistedClub.region || clubRegion,
        manager: `${json.data.user.firstName || firstName} ${json.data.user.lastName || lastName}`.trim(),
        email: persistedClub.email || clubEmail.trim(),
        phone: persistedClub.phone || clubPhone.trim(),
        licensedAthletes: 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: persistedClub.logoUrl || resolvedLogo,
        clubRank: 1,
        totalPoints: 100,
      };

      // Add extended properties
      (newClub as any).city = clubCity.trim();
      (newClub as any).address = clubAddress.trim();
      (newClub as any).presidentName = repName.trim();
      (newClub as any).charterAuthority = repTitle.trim();
      (newClub as any).verificationStatus = persistedClub.verificationStatus;
      (newClub as any).status = persistedClub.verificationStatus === 'VERIFIED' ? 'ACTIVE' : persistedClub.verificationStatus;
      (newClub as any).licenseNumber = persistedClub.licenseNumber || cleanRef;
      (newClub as any).logoUrl = persistedClub.logoUrl || resolvedLogo;

      setRegisteredClub(newClub);
      setReferenceId(persistedClub.licenseNumber || cleanRef);
      setStep(4); // Show success screen
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to connect to the registration service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = ['1. Club Identity', '2. Governance', '3. Portal Account', '4. Review & Register'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Main Full-Page Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 my-4 sm:my-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          
          {/* Top Role Switcher Banner */}
          {step < 4 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-xs">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                      Club Organization Registration
                    </h1>
                    <span className="bg-sky-100 text-sky-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-sky-300">
                      Official EAF Portal
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-0.5">
                    No Fayda ID required to register a club organization. Member athletes will be added via Fayda in the Club Portal.
                  </p>
                </div>
              </div>

              {onSwitchToAthlete && (
                <button
                  type="button"
                  onClick={onSwitchToAthlete}
                  className="text-xs font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <User size={14} />
                  <span>Switch to Athlete Registration (Fayda)</span>
                </button>
              )}
            </div>
          )}

          {/* Stepper Progress Bar */}
          {step < 4 && (
            <div className="flex items-center justify-between gap-2 mb-8 relative w-full overflow-x-auto pb-2">
              {stepsList.map((s, i) => {
                const isDone = i < step;
                const isActive = i === step;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                      </div>
                      <span
                        className={`text-xs font-bold tracking-tight whitespace-nowrap ${
                          isActive ? 'text-slate-900 font-extrabold' : isDone ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {s}
                      </span>
                    </div>
                    {i < stepsList.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 min-w-[20px] transition-all ${
                          i < step ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 0: Club Identity & Headquarters */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  1. Club Identity & Official Headquarters
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
                  Enter official organizational information as registered with the Regional Sports Bureau or Ministry.
                </p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Affiliated Region / State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={clubRegion}
                      onChange={(e) => setClubRegion(e.target.value)}
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      {ETHIOPIAN_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
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
                    <div className="p-4 rounded-2xl bg-white border-2 border-sky-300 shadow-sm flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                          <img
                            src={customLogoUrl}
                            alt="Club Logo Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate max-w-[220px]">
                              {logoFileName || "Uploaded Club Logo"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Real Upload
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">
                            This logo will be displayed on official club licenses, rosters, and competition entries.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
                        >
                          Change Logo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer bg-white"
                          title="Remove uploaded logo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                        isDraggingOver
                          ? "border-sky-500 bg-sky-50/70"
                          : "border-slate-300 bg-slate-50/60 hover:border-sky-400 hover:bg-sky-50/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                        {isUploadingLogo ? (
                          <RefreshCw size={22} className="animate-spin text-sky-600" />
                        ) : (
                          <UploadCloud size={24} />
                        )}
                      </div>

                      <div>
                        <span className="text-sm font-black text-slate-900 block">
                          {isUploadingLogo ? "Uploading Club Logo..." : "Upload Official Club Logo Image"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Click to browse or drag and drop your logo file here
                        </span>
                      </div>

                      <div className="mt-1">
                        <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-sky-700 shadow-xs">
                          Choose File
                        </span>
                      </div>
                    </div>
                  )}

                  {logoUploadError && (
                    <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} /> {logoUploadError}
                    </p>
                  )}

                  {/* Fallback preset emblems for sandbox */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Or pick fallback emblem:</span>
                    <div className="flex items-center gap-1.5">
                      {CLUB_EMBLEMS.slice(0, 6).map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            setClubLogo(sym);
                            setCustomLogoUrl("");
                          }}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border cursor-pointer ${
                            clubLogo === sym && !customLogoUrl
                              ? "border-sky-500 bg-sky-100"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep0()) setStep(1);
                  }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Continue to Governance</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Leadership & Federation Accreditation */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  2. Club Governance & Signatory Authority
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
                  Specify the authorized club president, legal representative, and regional sports bureau registration.
                </p>
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

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Continue to Portal Account</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Portal Admin Account & Charter Agreement */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  3. Club Administrator Account & Compliance Charter
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
                  Create secure sign-in credentials to manage your club roster and entries in the EAF portal.
                </p>
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

              {/* Navigation */}
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
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <span>Review Application</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  4. Review & Confirm Club Registration
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
                  Please verify your club details before submitting to the Ethiopian Athletics Federation.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-xs shrink-0">
                    {customLogoUrl.startsWith('http') || customLogoUrl.startsWith('/') ? (
                      <img src={customLogoUrl} alt="Club Crest" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span>{clubLogo}</span>
                    )}
                  </div>
                  <div>
                    <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-300">
                      🏢 Athletics Club Organization
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 mb-0">
                      {clubName} ({clubShortName || clubName.split(' ')[0]})
                    </h3>
                    <div className="text-xs font-bold text-slate-500 mt-0.5">
                      Region: {clubRegion} • City: {clubCity}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Official Club Email</span>
                    <span className="font-mono font-black text-slate-900">{clubEmail}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Official Club Phone</span>
                    <span className="font-black text-slate-900">{clubPhone}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Authorized Representative</span>
                    <span className="font-black text-slate-900">{repName} ({repTitle})</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Representative Mobile</span>
                    <span className="font-black text-slate-900">{repPhone}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Headquarters Address</span>
                    <span className="font-semibold text-slate-900">{clubAddress || clubCity}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-500">Sports Bureau License Ref</span>
                    <span className="font-mono font-black text-sky-800">{licenseRef || 'Generated by Federation'}</span>
                  </div>
                  <div className="p-3 flex justify-between bg-sky-50/50">
                    <span className="font-bold text-sky-900">Admin Sign-In Account</span>
                    <span className="font-mono font-black text-sky-800">{adminEmail}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    No Fayda ID is required to register the club organization. You will add and verify club members (athletes, coaches, and staff) using Fayda National IDs inside your Club Portal.
                  </span>
                </div>
              </div>

              {/* Navigation */}
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
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Registering Club...</span>
                    </>
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

          {/* STEP 4: Success Screen */}
          {step === 4 && registeredClub && (
            <div className="flex flex-col items-center text-center py-6 sm:py-8 max-w-xl mx-auto">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg relative mb-5"
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

              {/* Tracking & Accreditation Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full text-left mb-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <span className="text-xs font-bold text-slate-500">Official Club Reference</span>
                  <span className="text-sm font-black text-sky-700 font-mono">{referenceId}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <span className="text-xs font-bold text-slate-500">Accreditation Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    Under Federation Review
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0 overflow-hidden">
                    {(registeredClub.logoUrl || registeredClub.logo || "").startsWith("http") ||
                    (registeredClub.logoUrl || registeredClub.logo || "").startsWith("/") ||
                    (registeredClub.logoUrl || registeredClub.logo || "").startsWith("data:") ? (
                      <img
                        src={registeredClub.logoUrl || registeredClub.logo}
                        alt="Club Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      registeredClub.logo || "⚡"
                    )}
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{registeredClub.name}</div>
                    <div className="text-xs font-bold text-sky-700">
                      Region: {registeredClub.region} • Admin: {registeredClub.manager}
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next Callout Card */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-5 w-full text-left mb-6">
                <div className="flex items-center gap-2 mb-1.5 text-sky-900 font-black text-sm">
                  <Users size={18} className="text-sky-700" />
                  <span>Next Step: Add Members to Your Club Roster</span>
                </div>
                <p className="text-xs sm:text-sm text-sky-800 leading-relaxed m-0">
                  Now that your club is registered, you can immediately begin adding athletes, coaches, and technical staff to your official roster by verifying their <strong>Fayda National IDs</strong> inside the Club Portal.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    onRegisterSuccess({
                      type: 'CLUB',
                      payload: { club: registeredClub, targetSubPage: 'REGISTER_MEMBER', session: registeredSession },
                    });
                  }}
                  className="flex-1 py-4 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer border-0"
                >
                  <Users size={18} />
                  <span>Enter Portal & Add Members</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRegisterSuccess({
                      type: 'CLUB',
                      payload: { club: registeredClub, targetSubPage: 'OVERVIEW', session: registeredSession },
                    });
                  }}
                  className="py-4 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm sm:text-base cursor-pointer"
                >
                  Executive Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
