import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  FileCheck2,
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setClub } from '../../store/slices/authSlice';
import { useGetMeQuery } from '../../store/api/authApi';
import {
  useGetRegistrationOptionsQuery,
  useRegisterAthleteByClubAdminMutation,
  useRegisterCoachByClubAdminMutation,
  useLazyCheckAthleteAffiliationQuery,
} from '../../store/api/athleteApi';
import { FAYDA_CONFIG, launchFaydaPortal } from '../../constants/fayda';

interface RegisterMemberProps {
  onBack: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type MemberType = 'ATHLETE' | 'COACH';
type ContractType = 'PROFESSIONAL' | 'SEMI_PROFESSIONAL' | 'DEVELOPMENT_YOUTH' | 'SCHOLARSHIP_AMATEUR';

type FaydaProfile = {
  name: string;
  amharic: string;
  dob: string;
  gender: string;
  photoUrl: string;
  region: string;
  address: string;
  nationality: string;
  verificationToken?: string;
  fanNumber?: string;
  email?: string;
  phoneNumber?: string;
};

function profileFromIdentity(raw: string): { profile: FaydaProfile; fin: string } | null {
  try {
    const outer = JSON.parse(raw);
    const identity = outer.identity || outer;
    const addressValue = identity.address;
    const address = typeof addressValue === 'string'
      ? addressValue
      : [addressValue?.woreda, addressValue?.zone, addressValue?.region, addressValue?.city]
        .filter(Boolean).join(', ');
    const profile: FaydaProfile = {
      name: identity.name || identity.fullName || identity['name#en'] || [identity.given_name || identity.firstName, identity.middle_name, identity.family_name || identity.lastName].filter(Boolean).join(' '),
      amharic: identity.amharic || identity.fullNameAmharic || identity['name#am'] || '',
      dob: identity.dob || identity.birthDate || identity.birthdate || '',
      gender: identity.gender || '',
      photoUrl: identity.photoUrl || identity.picture || '',
      region: identity.region || address || '',
      address: address || identity.region || '',
      nationality: (identity.nationality && String(identity.nationality).trim().length >= 2) ? String(identity.nationality).trim() : 'Ethiopian',
      verificationToken: outer.verificationToken || identity.verificationToken,
      fanNumber: identity.fan || identity.fanNumber || identity.fan_number,
      email: identity.email || '',
      phoneNumber: identity.phoneNumber || identity.phone_number || identity.phone || '',
    };
    const fin = identity.fin || identity.nin || identity.national_id || identity.nationalId || '';
    return profile.name && fin ? { profile, fin } : null;
  } catch {
    return null;
  }
}

export default function RegisterMember({ onBack, onNotify }: RegisterMemberProps) {
  const dispatch = useAppDispatch();
  const storedClub = useAppSelector((state) => state.auth.club);
  const { data: accountResponse, isLoading: isLoadingAccount } = useGetMeQuery(undefined, {
    skip: Boolean(storedClub?.id),
  });
  const accountClub = accountResponse?.data?.club;
  const club = storedClub?.id ? storedClub : accountClub?.id ? {
    id: accountClub.id,
    name: accountClub.name,
    shortName: accountClub.shortName || '',
    region: accountClub.region || '',
    manager: accountClub.manager || '',
    email: accountClub.email || '',
    phone: accountClub.phone || '',
    licensedAthletes: 0,
    pendingVerifications: 0,
    unlicensedAthletes: 0,
    transfersCount: 0,
    logo: accountClub.logo || '',
    clubRank: 0,
    totalPoints: 0,
  } : storedClub;

  const { data: registrationOptions } = useGetRegistrationOptionsQuery();
  const regions = registrationOptions?.regions || [];
  const regionOptions = club?.region && !regions.some((region) => region.name === club.region)
    ? [...regions, { id: `club-${club.id}`, name: club.region, flag: '🏃', flagImageUrl: null }]
    : regions;

  const [registerAthlete] = useRegisterAthleteByClubAdminMutation();
  const [registerCoach] = useRegisterCoachByClubAdminMutation();
  const [checkAffiliation, { data: affiliationStatus, isFetching: isCheckingAffiliation }] = useLazyCheckAthleteAffiliationQuery();

  const [type, setType] = useState<MemberType | null>(null);
  const [profile, setProfile] = useState<FaydaProfile | null>(null);
  const [fin, setFin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [event, setEvent] = useState('5,000m');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('Athletics');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');

  // Detailed Contract Signing State
  const [contractType, setContractType] = useState<ContractType>('PROFESSIONAL');
  const [contractStartDate, setContractStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [contractEndDate, setContractEndDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [monthlySalary, setMonthlySalary] = useState<string>('20000');
  const [signingBonus, setSigningBonus] = useState<string>('15000');
  const [releaseClause, setReleaseClause] = useState<string>('200000');
  const [podiumBonus, setPodiumBonus] = useState<string>('30000');
  const [hasHealthInsurance, setHasHealthInsurance] = useState<boolean>(true);
  const [hasPhysioCoverage, setHasPhysioCoverage] = useState<boolean>(true);
  const [contractTerms, setContractTerms] = useState<string>(
    'Under the official governance of the Ethiopian Athletics Federation (EAF) and World Athletics Regulations, the athlete is registered to represent this club exclusively in certified championships and competitions. The club guarantees medical, training, and financial stipends as stipulated. Early termination or inter-club transfer requires mutual written release or activation of the buyout release clause.'
  );
  const [signedByClub, setSignedByClub] = useState<string>('');
  const [signedByAthlete, setSignedByAthlete] = useState<string>('');
  const [contractAffirmed, setContractAffirmed] = useState<boolean>(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!storedClub?.id && club?.id) dispatch(setClub(club));
    if (club?.name && !signedByClub) {
      setSignedByClub(`${club.name} Official Administration`);
    }
  }, [club, dispatch, storedClub?.id, signedByClub]);

  useEffect(() => {
    const acceptFaydaIdentity = (raw?: string) => {
      if (sessionStorage.getItem('eaf_club_member_registration') !== '1') return;
      const savedType = sessionStorage.getItem('eaf_club_member_type');
      if (savedType !== 'ATHLETE' && savedType !== 'COACH') return;
      const serialized = raw || sessionStorage.getItem('eaf_fayda_verified') || '';
      const verified = serialized ? profileFromIdentity(serialized) : null;
      if (!verified?.profile.verificationToken) return;
      if (club?.region) verified.profile.region = club.region;
      if (!verified.profile.nationality || verified.profile.nationality.trim().length < 2) {
        verified.profile.nationality = 'Ethiopian';
      }
      setType(savedType);
      setProfile(verified.profile);
      setFin(verified.fin);
      setEmail(verified.profile.email || '');
      setPhone(verified.profile.phoneNumber || '');
      setSignedByAthlete(verified.profile.name);
      setError('');
      sessionStorage.removeItem('eaf_club_member_registration');
      sessionStorage.removeItem('eaf_club_member_type');
    };
    const handleVerified = (event: Event) => {
      const custom = event as CustomEvent<string>;
      acceptFaydaIdentity(custom.detail);
    };
    acceptFaydaIdentity();
    window.addEventListener('eaf-fayda-verified', handleVerified);
    return () => window.removeEventListener('eaf-fayda-verified', handleVerified);
  }, [club?.region]);

  // Check affiliation as soon as fin is available
  useEffect(() => {
    if (fin && type === 'ATHLETE') {
      checkAffiliation({ nin: fin, clubId: club?.id });
    }
  }, [fin, type, club?.id, checkAffiliation]);

  const verifyWithFayda = async () => {
    if (!type) return setError('Choose athlete or coach first.');
    if (!club?.id) return setError('Your club account is not loaded. Sign in again before adding a member.');
    setError('');
    setLoading(true);
    sessionStorage.setItem('eaf_club_member_registration', '1');
    sessionStorage.setItem('eaf_club_member_type', type);
    try {
      await launchFaydaPortal(FAYDA_CONFIG.redirectUri, false);
    } catch (e: any) {
      sessionStorage.removeItem('eaf_club_member_registration');
      sessionStorage.removeItem('eaf_club_member_type');
      setError(e?.message || 'Could not open the official Fayda verification service.');
      setLoading(false);
    }
  };

  const handleSetTermPreset = (years: number) => {
    const start = new Date(contractStartDate || Date.now());
    start.setFullYear(start.getFullYear() + years);
    setContractEndDate(start.toISOString().split('T')[0]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !type || !club?.id || !profile.verificationToken) return onNotify('Complete the official Fayda verification flow first.', 'error');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return onNotify('Enter a valid email address.', 'error');
    if (password.length < 8) return onNotify('Password must contain at least 8 characters.', 'error');
    if (!phone.trim()) return onNotify('Enter a contact phone number.', 'error');
    if (type === 'ATHLETE' && !emergencyContactPhone.trim()) return onNotify('Enter an emergency contact phone number.', 'error');
    if (type === 'ATHLETE' && (!profile.dob || !['MALE', 'FEMALE'].includes(profile.gender.toUpperCase()))) {
      return onNotify('Enter the member’s date of birth and gender from their Fayda profile.', 'error');
    }

    if (type === 'ATHLETE') {
      if (affiliationStatus?.isForbidden) {
        return onNotify('DUAL REGISTRATION FORBIDDEN: Athlete is actively under contract with another club.', 'error');
      }
      if (!contractEndDate) {
        return onNotify('Contract expiration date is required.', 'error');
      }
      if (new Date(contractEndDate) <= new Date(contractStartDate)) {
        return onNotify('Contract expiration date must be after the start date.', 'error');
      }
      if (!contractAffirmed) {
        return onNotify('You must accept and affirm the binding contract terms to complete registration.', 'error');
      }
    }

    const nin = fin.replace(/\D/g, '');
    const names = profile.name.trim().split(/\s+/);
    if (!nin || !names[0] || !names.slice(1).join(' ')) return onNotify('The Fayda profile must include FIN and full name.', 'error');

    setSubmitting(true);
    try {
      if (type === 'ATHLETE') {
        const resolvedNationality = (profile.nationality && profile.nationality.trim().length >= 2)
          ? profile.nationality.trim()
          : 'Ethiopian';

        const res = await registerAthlete({
          email: email.trim(),
          password,
          phoneNumber: phone.trim(),
          firstName: names[0],
          lastName: names.slice(1).join(' '),
          amharicName: profile.amharic,
          faydaFin: nin,
          nin,
          dateOfBirth: profile.dob,
          gender: profile.gender.toUpperCase(),
          photoUrl: profile.photoUrl,
          primaryEvent: event,
          faydaVerificationToken: profile.verificationToken || '',
          fanNumber: profile.fanNumber,
          clubId: club.id,
          clubName: club.name,
          sportIds: [event],
          sportId: event,
          region: profile.region?.trim() || club.region?.trim() || 'National',
          nationality: resolvedNationality,
          address: profile.address,
          emergencyContactPhone: emergencyContactPhone.trim(),

          // Binding Contract Payload
          contractType,
          contractStartDate,
          contractEndDate,
          contractExpiry: contractEndDate,
          monthlySalary: monthlySalary ? Number(monthlySalary) : undefined,
          signingBonus: signingBonus ? Number(signingBonus) : undefined,
          releaseClause: releaseClause ? Number(releaseClause) : undefined,
          podiumBonus: podiumBonus ? Number(podiumBonus) : undefined,
          hasHealthInsurance,
          hasPhysioCoverage,
          terms: contractTerms,
          signedByClub: signedByClub || club.name,
          signedByAthlete: signedByAthlete || profile.name,
        }).unwrap();

        const successMsg = res.message || `Athlete ${profile.name} was registered under signed contract with ${club.name}.`;
        onNotify(successMsg, 'success');
      } else {
        await registerCoach({
          email: email.trim(),
          password,
          phoneNumber: phone.trim(),
          firstName: names[0],
          lastName: names.slice(1).join(' '),
          faydaFin: nin,
          nin,
          amharicName: profile.amharic,
          faydaVerificationToken: profile.verificationToken,
          fanNumber: profile.fanNumber,
          clubId: club.id,
          address: profile.address,
          licenseNumber: licenseNumber.trim() || undefined,
          specialization: specialization.trim() || 'Athletics',
          yearsOfExperience: Number(yearsOfExperience) || 0,
        }).unwrap();
        onNotify(`Coach ${profile.name} was added to ${club.name}.`, 'success');
      }

      sessionStorage.removeItem('eaf_fayda_verified');
      sessionStorage.removeItem('fayda_auth_payload');
      sessionStorage.removeItem('eaf_club_member_registration');
      sessionStorage.removeItem('eaf_club_member_type');
      onBack();
    } catch (e: any) {
      onNotify(e?.data?.message || e?.message || 'Member registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 10,
    border: '1px solid #CBD5E1',
    marginTop: 5,
    fontSize: '0.85rem',
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Top Header Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-gov-secondary"
          style={{ padding: '8px 14px', borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-heading)' }}>
            Register Club Member & Sign Contract
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
            Biometrically verify via Fayda, establish member credentials, and execute official federation contract.
          </p>
        </div>
      </div>

      {/* Step 1: Select Member Type */}
      {!type && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {([
            ['ATHLETE', Users, 'Register Athlete with Contract', 'Add an athlete to your club roster with a binding federation contract, expiration date, and verified biometric credentials.'],
            ['COACH', UserCheck, 'Register Club Coach', 'Add an accredited coach or technical trainer to your club roster with Fayda biometric verification.']
          ] as const).map(([value, Icon, title, description]) => (
            <button
              key={value}
              className="gov-card hover:border-emerald-500 transition-all text-left"
              onClick={() => setType(value)}
              style={{ padding: 28, borderRadius: 16, cursor: 'pointer' }}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
                <Icon size={26} />
              </div>
              <h3 className="font-extrabold text-base mb-1">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed m-0">{description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Fayda Verification Portal Prompt */}
      {type && !profile && (
        <div className="gov-card" style={{ padding: 32, borderRadius: 16 }}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={28} className="text-emerald-600" />
            <h3 className="m-0 text-lg font-black">Biometric Verification via National Fayda ID</h3>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Under Ethiopian Athletics Federation regulations, all club athletes and coaches must be biometrically identified via their National Fayda FIN/NIN. Continue to the official Fayda sign-in page; their verified claims will return here to complete contract signing.
          </p>
          {error && <p style={{ color: '#B91C1C', fontWeight: 600, fontSize: '0.85rem' }}>{error}</p>}
          {!club?.id && (
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
              {isLoadingAccount ? 'Loading your club account…' : 'This login is not linked to an active club account. Please contact federation support.'}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="button" className="btn-gov-secondary" onClick={() => setType(null)}>
              Change role
            </button>
            <button
              type="button"
              className="btn-accent"
              disabled={loading || isLoadingAccount || !club?.id}
              onClick={verifyWithFayda}
            >
              {loading ? 'Opening Fayda…' : 'Continue to Official Fayda Sign-In'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verified Profile & Contract Form */}
      {profile && (
        <form className="gov-card space-y-6" onSubmit={submit} style={{ padding: 32, borderRadius: 18 }}>
          {/* Fayda Badge Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={`Fayda profile of ${profile.name}`}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #10B981' }}
              />
            ) : (
              <div
                aria-label="No Fayda photo available"
                style={{ width: 88, height: 88, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#E2E8F0', color: '#334155', fontSize: 26, fontWeight: 900 }}
              >
                {profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-green text-xs font-black">Fayda Biometrically Verified</span>
                <span className="text-xs text-slate-400">FIN: {fin}</span>
              </div>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 900 }}>{profile.name}</h3>
              {profile.amharic && <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 700 }}>{profile.amharic}</div>}
            </div>
          </div>

          {/* Dual Registration Strict Check Banner */}
          {type === 'ATHLETE' && affiliationStatus?.isForbidden && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-red-950 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-700 font-black text-sm">
                <AlertOctagon size={20} className="shrink-0 text-red-600" />
                <span>DUAL REGISTRATION STRICTLY FORBIDDEN</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-red-800 m-0">
                {affiliationStatus.message}
              </p>
              <div className="text-xs font-bold text-red-900 bg-red-100 p-2.5 rounded-lg border border-red-300">
                Current Club: <span className="underline">{affiliationStatus.currentClubName}</span> · Active Contract Through: {affiliationStatus.contractExpiry ? new Date(affiliationStatus.contractExpiry).toLocaleDateString() : 'Active Term'}.
              </div>
            </div>
          )}

          {/* Transfer & Data Continuity Banner */}
          {type === 'ATHLETE' && affiliationStatus?.isTransfer && !affiliationStatus?.isForbidden && (
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-400 text-blue-950 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                <ArrowRightLeft size={18} className="shrink-0 text-blue-600" />
                <span>FEDERATION TRANSFER & LIFETIME DATA PRESERVATION</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-800 m-0">
                {affiliationStatus.message}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-900 bg-blue-100/80 p-2 rounded-lg">
                <span>Preserved Historical Data:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-extrabold">{affiliationStatus.personalBestsCount || 0} Personal Bests</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-extrabold">Accreditation History</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-extrabold">Biometric Identity</span>
              </div>
            </div>
          )}

          {type === 'ATHLETE' && affiliationStatus?.isCurrentClub && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              <div className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-800">
                <BadgeAlert size={16} /> Member Already in Club Roster
              </div>
              {affiliationStatus.message}
            </div>
          )}

          {/* Demographics Summary */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Verified Identity Claims</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {([
                ['Full name', profile.name],
                ['FIN / National ID', fin],
                ['Date of birth', profile.dob],
                ['Gender', profile.gender],
                ['Nationality', profile.nationality || 'Ethiopian'],
                ['Region', profile.region || club?.region || 'National'],
              ] as const).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-400 font-bold">{label}</div>
                  <div className="font-black text-slate-800 mt-0.5 truncate">{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Account & Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Official Email Address *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="font-bold text-slate-700">Phone Number *</label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="font-bold text-slate-700">Account Password (Min 8 chars) *</label>
                <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              </div>
              {type === 'ATHLETE' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700">Primary Athletic Event *</label>
                    <select required value={event} onChange={(e) => setEvent(e.target.value)} style={inputStyle}>
                      {['100m Sprint', '200m Sprint', '400m', '800m', '1,500m', '3,000m Steeplechase', '5,000m', '10,000m', 'Half Marathon', 'Marathon', 'High Jump', 'Long Jump', 'Triple Jump', 'Javelin Throw', 'Shot Put'].map((x) => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700">Emergency Contact Phone Number *</label>
                    <input required value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} style={inputStyle} placeholder="+251 9..." />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700">Specialization</label>
                    <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Years of Coaching Experience</label>
                    <input type="number" min="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} style={inputStyle} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* DETAILED CONTRACT SIGNING SECTION (ATHLETES ONLY)                     */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {type === 'ATHLETE' && (
            <div className="p-6 sm:p-7 rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-200/90 space-y-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-emerald-600 before:via-teal-600 before:to-emerald-700">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black shadow-xs shrink-0">
                    <FileCheck2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 m-0 tracking-tight">Official EAF Club Contract Execution</h3>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Binding sporting representation contract governed under Ethiopian Athletics Federation Articles.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {club?.name || 'Club Roster'}
                </span>
              </div>

              {/* Contract Classification & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contract Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                  >
                    <option value="PROFESSIONAL">Professional Tier (Full Representation & Salary)</option>
                    <option value="SEMI_PROFESSIONAL">Semi-Professional (Competition Stipend)</option>
                    <option value="DEVELOPMENT_YOUTH">Youth Academy & Development (Junior Pipeline)</option>
                    <option value="SCHOLARSHIP_AMATEUR">Scholarship / Amateur Track Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contract Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                  />
                </div>

                {/* Expiration Date with Presets */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-700" />
                      Contract Expiration Date <span className="text-red-500">*</span>
                      <span className="font-normal text-amber-800 text-[11px]">(Renewal / Free Agency Benchmark)</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-800 mr-1">Term Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleSetTermPreset(1)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/70 text-[11px] text-slate-700 font-bold border border-slate-200 hover:border-amber-300 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        +1 Year
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetTermPreset(2)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/70 text-[11px] text-slate-700 font-bold border border-slate-200 hover:border-amber-300 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        +2 Years
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetTermPreset(3)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/70 text-[11px] text-slate-700 font-bold border border-slate-200 hover:border-amber-300 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        +3 Years
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetTermPreset(4)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] text-white font-black border border-emerald-700 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        Olympic Cycle (4Y)
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-slate-950 text-xs font-black shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-amber-900/80 m-0 leading-normal">
                    Athletes may renew with this club before expiration, or become eligible free agents to transfer to another club upon reaching this date.
                  </p>
                </div>
              </div>

              {/* Financial Terms & Allowances (ETB) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 m-0 flex items-center gap-1.5">
                    <DollarSign size={15} className="text-emerald-600" />
                    Financial Terms & Allowances
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Currency: Ethiopian Birr (ETB)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1 text-[11px]">Monthly Stipend</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                        placeholder="20000"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">ETB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1 text-[11px]">Signing Bonus</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={signingBonus}
                        onChange={(e) => setSigningBonus(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                        placeholder="15000"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">ETB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1 text-[11px]">Podium Bonus</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={podiumBonus}
                        onChange={(e) => setPodiumBonus(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                        placeholder="30000"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">ETB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1 text-[11px]">Release Clause</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={releaseClause}
                        onChange={(e) => setReleaseClause(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                        placeholder="200000"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">ETB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical & Welfare Coverage Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer shadow-xs ${hasHealthInsurance ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-700 font-medium hover:border-slate-300'}`}>
                  <input
                    type="checkbox"
                    checked={hasHealthInsurance}
                    onChange={(e) => setHasHealthInsurance(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-900">Sports Health & Injury Insurance</span>
                    <span className="text-[11px] text-slate-500 font-normal">Full club medical coverage for training & championship injuries</span>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer shadow-xs ${hasPhysioCoverage ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-700 font-medium hover:border-slate-300'}`}>
                  <input
                    type="checkbox"
                    checked={hasPhysioCoverage}
                    onChange={(e) => setHasPhysioCoverage(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-900">Physiotherapy & Sports Rehab</span>
                    <span className="text-[11px] text-slate-500 font-normal">Club-covered sports therapy, massage & muscle recovery</span>
                  </div>
                </label>
              </div>

              {/* Binding Terms */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">Contract Governance Clauses</label>
                  <span className="text-[11px] text-slate-400 font-medium">Ethiopian Athletics Federation Sporting Code</span>
                </div>
                <textarea
                  rows={3}
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-800 text-xs font-mono leading-relaxed resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                />
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Authorized Club Signatory <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={signedByClub}
                    onChange={(e) => setSignedByClub(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Authorized administration of {club?.name || 'the club'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Athlete Signatory Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={signedByAthlete}
                    onChange={(e) => setSignedByAthlete(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Verified Fayda sporting identity ({profile.name})</span>
                </div>
              </div>

              {/* Solemn Affirmation Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/90 border border-emerald-300/80 cursor-pointer text-xs text-emerald-950 shadow-xs hover:bg-emerald-50 transition">
                <input
                  type="checkbox"
                  required
                  checked={contractAffirmed}
                  onChange={(e) => setContractAffirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 accent-emerald-600 shrink-0"
                />
                <div className="leading-relaxed">
                  <span className="font-extrabold text-emerald-900 block mb-0.5">Binding Sporting Representation Affirmation</span>
                  <span className="text-emerald-800/95 font-medium">
                    I solemnly affirm under Ethiopian Athletics Federation Regulations that this contract has been mutually agreed upon. The athlete represents this club exclusively; simultaneous registration with any other club is strictly prohibited until expiration or mutual release.
                  </span>
                </div>
              </label>
            </div>
          )}

          {error && <p style={{ color: '#B91C1C', margin: 0, fontWeight: 700 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 10 }}>
            <button type="button" className="btn-gov-secondary" onClick={() => setProfile(null)}>
              Restart Fayda Verification
            </button>
            <button
              type="submit"
              className="btn-accent"
              disabled={
                submitting ||
                (type === 'ATHLETE' && Boolean(affiliationStatus?.isForbidden || !contractAffirmed))
              }
            >
              {submitting
                ? 'Executing Contract…'
                : affiliationStatus?.isTransfer
                ? `Execute Transfer & Sign Contract`
                : `Sign Contract & Register ${type === 'ATHLETE' ? 'Athlete' : 'Coach'}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
