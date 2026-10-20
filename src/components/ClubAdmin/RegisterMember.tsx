import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useRegisterAthleteByClubAdminMutation, useRegisterCoachByClubAdminMutation } from '../../store/api/athleteApi';
import { FAYDA_CONFIG, launchFaydaPortal } from '../../constants/fayda';

interface RegisterMemberProps {
  onBack: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type MemberType = 'ATHLETE' | 'COACH';
type FaydaProfile = {
  name: string; amharic: string; dob: string; gender: string; photoUrl: string;
  region: string; address: string; nationality: string; verificationToken?: string;
  fanNumber?: string; email?: string; phoneNumber?: string;
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
      nationality: identity.nationality || '',
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
  const club = useAppSelector((state) => state.auth.club);
  const [registerAthlete] = useRegisterAthleteByClubAdminMutation();
  const [registerCoach] = useRegisterCoachByClubAdminMutation();
  const [type, setType] = useState<MemberType | null>(null);
  const [profile, setProfile] = useState<FaydaProfile | null>(null);
  const [fin, setFin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [event, setEvent] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('Athletics');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const acceptFaydaIdentity = (raw?: string) => {
      if (sessionStorage.getItem('eaf_club_member_registration') !== '1') return;
      const savedType = sessionStorage.getItem('eaf_club_member_type');
      if (savedType !== 'ATHLETE' && savedType !== 'COACH') return;
      const serialized = raw || sessionStorage.getItem('eaf_fayda_verified') || '';
      const verified = serialized ? profileFromIdentity(serialized) : null;
      if (!verified?.profile.verificationToken) return;
      setType(savedType);
      setProfile(verified.profile);
      setFin(verified.fin);
      setEmail(verified.profile.email || '');
      setPhone(verified.profile.phoneNumber || '');
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
    const nin = fin.replace(/\D/g, '');
    const names = profile.name.trim().split(/\s+/);
    if (!nin || !names[0] || !names.slice(1).join(' ')) return onNotify('The Fayda profile must include FIN and full name.', 'error');
    setSubmitting(true);
    try {
      if (type === 'ATHLETE') {
        await registerAthlete({
          email: email.trim(), password, phoneNumber: phone.trim(), firstName: names[0], lastName: names.slice(1).join(' '),
          amharicName: profile.amharic, faydaFin: nin, nin, dateOfBirth: profile.dob,
          gender: profile.gender.toUpperCase(), nationality: profile.nationality,
          photoUrl: profile.photoUrl, primaryEvent: event, faydaVerificationToken: profile.verificationToken || '',
          fanNumber: profile.fanNumber, clubId: club.id, clubName: club.name, sportIds: [event], sportId: event,
          region: profile.region, emergencyContactPhone: emergencyContactPhone.trim(),
        }).unwrap();
        // The API response is the source of truth; the roster reads the saved member from the server.
      } else {
        await registerCoach({
          email: email.trim(), password, phoneNumber: phone.trim(), firstName: names[0], lastName: names.slice(1).join(' '),
          faydaFin: nin, nin, amharicName: profile.amharic, faydaVerificationToken: profile.verificationToken,
          fanNumber: profile.fanNumber, clubId: club.id, licenseNumber: licenseNumber.trim() || undefined,
          specialization: specialization.trim() || 'Athletics', yearsOfExperience: Number(yearsOfExperience) || 0,
        }).unwrap();
      }
      sessionStorage.removeItem('eaf_fayda_verified');
      sessionStorage.removeItem('fayda_auth_payload');
      sessionStorage.removeItem('eaf_club_member_registration');
      sessionStorage.removeItem('eaf_club_member_type');
      onNotify(`${type === 'ATHLETE' ? 'Athlete' : 'Coach'} ${profile.name} was added to ${club.name}.`, 'success');
      onBack();
    } catch (e: any) {
      onNotify(e?.data?.message || e?.message || 'Member registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 6 };

  return <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 40 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <button type="button" onClick={onBack} className="btn-gov-secondary" style={{ padding: '8px 14px', borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}><ArrowLeft size={16}/> Back</button>
      <div><h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-heading)' }}>Register Club Member</h2><p style={{ margin: '4px 0 0', color: '#64748B' }}>Verify identity with Fayda, then create the member account and select their club role.</p></div>
    </div>
    {!type && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
      {([['ATHLETE', Users, 'Register Athlete', 'Add an athlete to your club roster.'], ['COACH', UserCheck, 'Register Coach', 'Add a coach to your club.']] as const).map(([value, Icon, title, description]) => <button key={value} className="gov-card" onClick={() => setType(value)} style={{ padding: 28, borderRadius: 16, cursor: 'pointer', textAlign: 'center' }}><Icon size={34} color="var(--primary)"/><h3>{title}</h3><p>{description}</p></button>)}
    </div>}
    {type && !profile && <div className="gov-card" style={{ padding: 28, borderRadius: 16 }}>
      <h3>Verify this member with Fayda</h3><p style={{ color: '#64748B' }}>Continue to the official Fayda sign-in page. Their verified profile will return here to complete registration.</p>
      {error && <p style={{ color: '#B91C1C' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12 }}><button type="button" className="btn-gov-secondary" onClick={() => setType(null)}>Change role</button><button type="button" className="btn-accent" disabled={loading} onClick={verifyWithFayda}>{loading ? 'Opening Fayda…' : 'Continue to Fayda'}</button></div>
    </div>}
    {profile && <form className="gov-card" onSubmit={submit} style={{ padding: 28, borderRadius: 16, display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
        {profile.photoUrl
          ? <img src={profile.photoUrl} alt={`Fayda profile of ${profile.name}`} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #DBEAFE' }}/>
          : <div aria-label="No Fayda photo available" style={{ width: 96, height: 96, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#E2E8F0', color: '#334155', fontSize: 30, fontWeight: 800 }}>{profile.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</div>}
        <div><h3 style={{ margin: 0 }}>{profile.name}</h3><div style={{ color: '#15803D', fontWeight: 700, marginTop: 4 }}>Fayda identity verified</div></div>
      </div>
      <h3 style={{ margin: '0 0 -8px' }}>Verified Fayda information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {([
          ['Full name', profile.name], ['Full name (Amharic)', profile.amharic], ['FIN / National ID', fin],
          ['FAN number', profile.fanNumber], ['Date of birth', profile.dob], ['Gender', profile.gender],
          ['Nationality', profile.nationality], ['Address', profile.address], ['Region', profile.region],
          ['Fayda email', profile.email], ['Fayda phone', profile.phoneNumber],
        ] as const).map(([label, value]) => <label key={label} style={{ color: '#475569', fontSize: 13 }}>{label}<input readOnly value={value || 'Not provided by Fayda'} style={{ ...inputStyle, background: '#F8FAFC', color: value ? '#0F172A' : '#94A3B8' }}/></label>)}
      </div>
      <h3 style={{ margin: 0 }}>Account and contact details</h3>
      <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}/></label>
      <label>Phone number<input required value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}/></label>
      <label>Account password<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}/></label>
      {type === 'ATHLETE' ? <>
        {!profile.dob && <label>Date of birth<input required type="date" value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })} style={inputStyle}/></label>}
        {!profile.gender && <label>Gender<select required value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} style={inputStyle}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></label>}
        <label>Primary event<select required value={event} onChange={e => setEvent(e.target.value)} style={inputStyle}><option value="">Select event</option>{['100m Sprint','200m Sprint','400m','800m','1,500m','3,000m Steeplechase','5,000m','10,000m','Half Marathon','Marathon','High Jump','Long Jump','Triple Jump','Javelin Throw','Shot Put'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Emergency contact phone<input required value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} style={inputStyle}/></label>
      </> : <>
        <label>Coach license number<input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} style={inputStyle}/></label>
        <label>Specialization<input value={specialization} onChange={e => setSpecialization(e.target.value)} style={inputStyle}/></label>
        <label>Years of experience<input type="number" min="0" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} style={inputStyle}/></label>
      </>}
      {error && <p style={{ color: '#B91C1C', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><button type="button" className="btn-gov-secondary" onClick={() => setProfile(null)}>Restart Fayda verification</button><button type="submit" className="btn-accent" disabled={submitting}>{submitting ? 'Registering…' : `Register ${type === 'ATHLETE' ? 'Athlete' : 'Coach'}`}</button></div>
    </form>}
  </div>;
}
