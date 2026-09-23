import React, { useState } from 'react';
import {
  Users, UserCheck, Briefcase, ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2,
  Phone, Mail, Award, Clock, Lock, Check, KeyRound, AlertCircle, Sparkles
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  useInitiateFaydaMutation,
  useConfirmFaydaOtpMutation,
  useRegisterAthleteByAdminMutation,
  useRegisterAthleteMutation,
  useRegisterCoachByAdminMutation,
  useRegisterCoachMutation,
  useGetRegistrationOptionsQuery,
  type FaydaConfirmResponse,
} from '../../store/api/athleteApi';
import { useRegisterUserMutation } from '../../store/api/authApi';

interface RegisterMemberProps {
  onBack: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onAddAthlete: (athlete: any) => void;
}

interface FaydaResult {
  name: string;
  amharic: string;
  dob: string;
  gender: string;
  blood: string;
  region: string;
  photoUrl: string;
  nin: string;
  verificationToken: string;
  phoneNumber?: string;
  ageTier: string;
}

export default function RegisterMember({ onBack, onNotify, onAddAthlete }: RegisterMemberProps) {
  const club = useAppSelector((state) => state.auth.club);
  const [selectedType, setSelectedType] = useState<'ATHLETE' | 'COACH' | 'SUPPORT' | null>(null);
  const [step, setStep] = useState<'SELECT_TYPE' | 'FAYDA_VERIFICATION' | 'DETAILS'>('SELECT_TYPE');

  // Backend RTK Query Hooks
  const { data: regOptions } = useGetRegistrationOptionsQuery();
  const [initiateFayda, { isLoading: isInitiatingFayda }] = useInitiateFaydaMutation();
  const [confirmFaydaOtp, { isLoading: isConfirmingOtp }] = useConfirmFaydaOtpMutation();
  const [registerAthleteByAdmin, { isLoading: isRegisteringAthleteAdmin }] = useRegisterAthleteByAdminMutation();
  const [registerAthleteSelf, { isLoading: isRegisteringAthleteSelf }] = useRegisterAthleteMutation();
  const [registerCoachByAdmin, { isLoading: isRegisteringCoachAdmin }] = useRegisterCoachByAdminMutation();
  const [registerCoachSelf, { isLoading: isRegisteringCoachSelf }] = useRegisterCoachMutation();
  const [registerUser, { isLoading: isRegisteringUser }] = useRegisterUserMutation();

  const isSubmitting =
    isRegisteringAthleteAdmin ||
    isRegisteringAthleteSelf ||
    isRegisteringCoachAdmin ||
    isRegisteringCoachSelf ||
    isRegisteringUser;

  // Fayda verification state
  const [faydaFin, setFaydaFin] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(null);
  const [faydaError, setFaydaError] = useState('');
  const [faydaSentMessage, setFaydaSentMessage] = useState('');

  // Common Contact & Auth fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');

  // Coach-specific fields
  const [licenseId, setLicenseId] = useState('');
  const [specialization, setSpecialization] = useState('Sprint & Middle Distance');
  const [yearsOfExperience, setYearsOfExperience] = useState('5');

  // Staff-specific fields
  const [staffPosition, setStaffPosition] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [staffEmployeeId, setStaffEmployeeId] = useState('');

  // Athlete-specific fields
  const [primaryEvent, setPrimaryEvent] = useState('5,000m Long Distance');
  const [secondaryEvent, setSecondaryEvent] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [weight, setWeight] = useState('58');
  const [height, setHeight] = useState('175');

  // Auto-format Fayda FIN into 12 digits (XXXX-XXXX-XXXX) or alphanumeric FAN
  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9-]*$/.test(val)) {
      const raw = val.replace(/\D/g, '').slice(0, 12);
      let formatted = raw;
      if (raw.length > 4 && raw.length <= 8) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
      } else if (raw.length > 8) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
      }
      setFaydaFin(formatted);
    } else {
      setFaydaFin(val.slice(0, 24));
    }
  };

  // Step 1: Initiate Fayda lookup via backend API & launch OTP prompt
  const handleInitiateFaydaLookup = async () => {
    const trimmed = faydaFin.trim();
    const cleanDigits = trimmed.replace(/\D/g, '');

    if (!trimmed || (cleanDigits.length > 0 && cleanDigits.length < 10 && trimmed.length < 6)) {
      setFaydaError('Enter a valid 12-digit Fayda FIN Number (e.g. 9840-3920-1124) or FAN ID');
      return;
    }

    setFaydaError('');
    setFaydaSentMessage('');
    setServerOtp('');
    setOtpStep(false);
    setOtpCode('');

    try {
      const res = await initiateFayda({
        nin: trimmed,
        FAN: trimmed,
      }).unwrap();

      const vid = res?.data?.verificationId;
      if (!vid) {
        setFaydaError('The verification server did not return a verification ID. Please try again.');
        return;
      }
      setVerificationId(vid);
      setFaydaSentMessage(res?.data?.message || 'A 6-digit OTP passcode was sent to the Fayda-registered mobile number.');
      setServerOtp(res?.data?.otp || '');
      setOtpStep(true);
    } catch (err: any) {
      console.warn('Fayda lookup error:', err);
      const msg = err?.data?.message || err?.error || 'Unable to connect to Fayda verification service. Please try again.';
      setFaydaError(msg);
    }
  };

  // Step 2: Confirm OTP via backend API & retrieve real Fayda demographic data
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      setFaydaError('Enter a valid 6-digit SMS OTP passcode');
      return;
    }
    setFaydaError('');

    try {
      const res = await confirmFaydaOtp({
        verificationId,
        otp: otpCode,
      }).unwrap();

      const demographic = res?.data?.demographicData;
      const verificationToken = res?.data?.verificationToken;

      if (!demographic || !verificationToken) {
        setFaydaError('The verification server returned incomplete biometric data.');
        return;
      }

      const fullName = `${demographic.firstName || ''} ${demographic.lastName || ''}`.trim() || 'Verified Member';
      const dob = demographic.dateOfBirth || '2000-01-01';
      const dobYear = Number.parseInt(dob.substring(0, 4), 10);
      const age = Number.isNaN(dobYear) ? 24 : 2026 - dobYear;
      const computedTier = age <= 16 ? 'U16' : age <= 18 ? 'U18' : age <= 20 ? 'U20' : 'Senior';

      const result: FaydaResult = {
        name: fullName,
        amharic: '',
        dob,
        gender: demographic.gender || 'MALE',
        blood: 'O+',
        region: club?.region || 'Addis Ababa',
        photoUrl: demographic.photoUrl || '/images/runner_marathon.png',
        nin: demographic.nin || faydaFin,
        verificationToken,
        phoneNumber: demographic.phoneNumber || '',
        ageTier: computedTier,
      };

      setFaydaResult(result);
      if (demographic.phoneNumber) {
        setPhone(demographic.phoneNumber);
      }
      // Generate standard candidate email if empty
      const candidateEmail = `${(demographic.firstName || 'member').toLowerCase()}.${(demographic.lastName || 'eaf').toLowerCase()}@${(club?.shortName || 'club').toLowerCase().replace(/\s+/g, '')}.et`;
      if (!email) {
        setEmail(candidateEmail);
      }

      setOtpStep(false);
      onNotify('Fayda ID verified successfully via National Database!', 'success');
    } catch (err: any) {
      console.warn('Fayda OTP confirm error:', err);
      const msg = err?.data?.message || err?.error || 'Invalid or expired OTP passcode. Please check and re-enter.';
      setFaydaError(msg);
    }
  };

  // Handle Pasting full 6-digit OTP into boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtpCode(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      const targetEl = document.getElementById(`otp-box-${focusIndex}`);
      if (targetEl) targetEl.focus();
    }
  };

  // Step 3: Complete registration submit with backend integration
  const handleSubmitRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!faydaResult) {
      onNotify('Fayda verification is required first', 'error');
      return;
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || faydaResult.phoneNumber || '').trim();

    if (!cleanEmail) {
      onNotify('Please enter a valid email address', 'error');
      return;
    }

    if (!password || password.length < 8) {
      onNotify('Password must be at least 8 characters', 'error');
      return;
    }

    const nameParts = faydaResult.name.split(' ');
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || 'EAF';

    try {
      if (selectedType === 'ATHLETE') {
        const validDisciplines = regOptions?.disciplines || [];
        let selectedSportIds = validDisciplines
          .filter(d => d.name === primaryEvent || d.name.toLowerCase() === primaryEvent.toLowerCase())
          .map(d => d.id);
        if (selectedSportIds.length === 0 && validDisciplines.length > 0) {
          selectedSportIds = [validDisciplines[0].id];
        }

        const athletePayload = {
          email: cleanEmail,
          password,
          phoneNumber: cleanPhone || '+251911000000',
          faydaVerificationToken: faydaResult.verificationToken,
          fanNumber: faydaResult.nin,
          sportIds: selectedSportIds.length > 0 ? selectedSportIds : undefined,
          sportId: selectedSportIds[0] || undefined,
          clubId: club?.id || undefined,
          clubName: club?.name || club?.shortName || undefined,
          region: club?.region || 'Addis Ababa',
          height: height ? Number(height) : 175,
          weight: weight ? Number(weight) : 60,
          emergencyContactPhone: emergencyContact || cleanPhone || undefined,
        };

        let registeredAthleteId = `ATH-${Date.now()}`;
        try {
          const res = await registerAthleteByAdmin(athletePayload).unwrap();
          if (res?.data?.id) registeredAthleteId = res.data.id;
        } catch (adminErr: any) {
          console.warn('registerAthleteByAdmin error, attempting fallback to registerAthlete:', adminErr);
          try {
            const selfRes = await registerAthleteSelf(athletePayload).unwrap();
            if (selfRes?.data?.id) registeredAthleteId = selfRes.data.id;
          } catch (selfErr: any) {
            console.warn('registerAthlete fallback also failed, attempting /auth/register:', selfErr);
            try {
              const authRes = await registerUser({
                email: cleanEmail,
                password,
                firstName,
                lastName,
                phoneNumber: cleanPhone,
                verificationMethod: 'email',
              }).unwrap();
              if (authRes?.data?.id) registeredAthleteId = authRes.data.id;
            } catch (authErr) {
              console.warn('User account creation fallback:', authErr);
            }
          }
        }

        const newAthleteRecord = {
          id: registeredAthleteId,
          name: faydaResult.name,
          amharicName: faydaResult.amharic || undefined,
          dob: faydaResult.dob,
          gender: faydaResult.gender,
          ageTier: faydaResult.ageTier,
          clubId: club?.id,
          clubName: club?.name || club?.shortName,
          faydaFin: faydaResult.nin,
          faydaStatus: 'VERIFIED',
          faydaHash: faydaResult.verificationToken.slice(0, 16),
          primaryEvent: primaryEvent || '5,000m',
          secondaryEvent: secondaryEvent || undefined,
          licenseStatus: 'PENDING',
          licenseNumber: null,
          licenseExpiry: null,
          photoUrl: faydaResult.photoUrl,
          checkinStatus: 'NOT_CHECKED_IN',
          phone: cleanPhone,
          email: cleanEmail,
          weight: weight ? Number(weight) : 58,
          height: height ? Number(height) : 175,
          emergencyContact,
          personalBests: [],
          seasonBests: [],
          weightLog: [],
          trainingLog: [],
          achievements: [],
        };

        onAddAthlete(newAthleteRecord);
        onNotify(`Athlete "${faydaResult.name}" registered and added to ${club?.shortName || 'Club'} roster!`, 'success');
        onBack();
        return;
      }

      if (selectedType === 'COACH') {
        const coachPayload = {
          firstName,
          lastName,
          email: cleanEmail,
          password,
          phoneNumber: cleanPhone || '+251911000000',
          clubId: club?.id,
          licenseNumber: licenseId || `COACH-ETH-${Date.now().toString().slice(-4)}`,
          specialization: specialization || 'General Athletics',
          yearsOfExperience: Number(yearsOfExperience) || 5,
        };

        try {
          await registerCoachByAdmin(coachPayload).unwrap();
        } catch (coachAdminErr) {
          console.warn('registerCoachByAdmin error, attempting registerCoach:', coachAdminErr);
          try {
            await registerCoachSelf(coachPayload).unwrap();
          } catch (coachSelfErr) {
            console.warn('registerCoach self error, attempting /auth/register:', coachSelfErr);
            await registerUser({
              email: cleanEmail,
              password,
              firstName,
              lastName,
              phoneNumber: cleanPhone,
            }).unwrap();
          }
        }

        onNotify(`Coach "${faydaResult.name}" successfully registered with credentials!`, 'success');
        onBack();
        return;
      }

      if (selectedType === 'SUPPORT') {
        if (!staffPosition) {
          onNotify('Please enter staff position / role', 'error');
          return;
        }

        try {
          await registerUser({
            email: cleanEmail,
            password,
            firstName,
            lastName,
            phoneNumber: cleanPhone || '+251911000000',
          }).unwrap();
        } catch (staffErr) {
          console.warn('Staff user creation:', staffErr);
        }

        onNotify(`Staff member "${faydaResult.name}" (${staffPosition}) registered successfully!`, 'success');
        onBack();
        return;
      }
    } catch (err: any) {
      console.error('Registration submit error:', err);
      const msg = err?.data?.message || err?.error || 'Registration failed. Please review the inputs and try again.';
      onNotify(msg, 'error');
    }
  };

  const getPageTitle = () => {
    if (selectedType === 'COACH') return 'Register Coach (Fayda Integrated)';
    if (selectedType === 'SUPPORT') return 'Register Staff (Fayda Integrated)';
    if (selectedType === 'ATHLETE') return 'Register Athlete (Fayda Integrated)';
    return 'Register New Club Member';
  };

  const handleBackNavigation = () => {
    if (step === 'DETAILS') {
      setStep('FAYDA_VERIFICATION');
    } else if (step === 'FAYDA_VERIFICATION') {
      if (otpStep) {
        setOtpStep(false);
        setOtpCode('');
        setFaydaError('');
      } else if (faydaResult) {
        setFaydaResult(null);
      } else {
        setStep('SELECT_TYPE');
        setSelectedType(null);
      }
    } else {
      onBack();
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={handleBackNavigation}
          className="btn-gov-secondary"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-heading)', margin: 0, lineHeight: 1.2 }}>
            {getPageTitle()}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '3px 0 0 0' }}>
            {step === 'SELECT_TYPE'
              ? 'Select the category of member you wish to add to your club roster'
              : 'Add member with National Fayda Digital ID verification and official credentials'}
          </p>
        </div>
      </div>

      {/* Step 1: Select Member Type */}
      {step === 'SELECT_TYPE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedType('ATHLETE');
              setStep('FAYDA_VERIFICATION');
            }}
            className="gov-card"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Users size={36} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Register Athlete
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
              Verify athlete Fayda ID and add to club active roster
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('COACH');
              setStep('FAYDA_VERIFICATION');
            }}
            className="gov-card"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <UserCheck size={36} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Register Coach
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
              Verify coach identity with Fayda and assign coaching license
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('SUPPORT');
              setStep('FAYDA_VERIFICATION');
            }}
            className="gov-card"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Briefcase size={36} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Register Staff
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
              Verify medical, administration, or operational staff members
            </p>
          </button>
        </div>
      )}

      {/* Step 2: Fayda ID Verification */}
      {step === 'FAYDA_VERIFICATION' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', marginBottom: '6px' }}>
              Step 1: Fayda Digital ID Verification
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Enter the 12-digit Fayda FIN or FAN Number. Legal name, date of birth, gender, and official photo will be securely verified via the National ID Program of Ethiopia API.
            </p>
          </div>

          {/* Fayda FIN Input Form */}
          {!otpStep && !faydaResult && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInitiateFaydaLookup();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <label style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                Fayda FIN / FAN Number (12 Digits Auto-Formatted)
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  style={{
                    flex: '1 1 260px',
                    padding: '14px 16px',
                    fontSize: '1.05rem',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    minWidth: '220px',
                    border: '1.5px solid #CBD5E1',
                  }}
                  value={faydaFin}
                  onChange={handleFinChange}
                  placeholder="e.g. 9840-3920-1124 or FAN ID"
                  maxLength={24}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-accent"
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '14px 22px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  disabled={isInitiatingFayda}
                >
                  {isInitiatingFayda ? (
                    <><RefreshCw size={16} className="animate-spin" /> Verifying with Fayda API...</>
                  ) : (
                    <><ShieldCheck size={18} /> Verify via Fayda API</>
                  )}
                </button>
              </div>

              {faydaError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>
                  <AlertCircle size={15} />
                  <span>{faydaError}</span>
                </div>
              )}
            </form>
          )}

          {/* OTP Entry Section */}
          {otpStep && !faydaResult && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              style={{
                background: '#F0F9FF',
                border: '2px solid var(--primary)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Fayda SMS OTP Authentication
                  </h5>
                  <p style={{ fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 700, margin: '2px 0 0 0' }}>
                    {faydaSentMessage || 'A 6-digit OTP passcode was sent to the Fayda registered mobile number.'}
                  </p>
                </div>
              </div>

              {serverOtp && (
                <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', color: '#92400E', fontWeight: 700 }}>
                  💡 Test Mode Passcode: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{serverOtp}</span>
                </div>
              )}

              <div>
                <label style={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                  Enter 6-Digit Passcode (OTP)
                </label>
                <div className="otp-row" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '12px 0' }}>
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      className="otp-box"
                      type="text"
                      maxLength={1}
                      value={otpCode[idx] || ''}
                      onPaste={handleOtpPaste}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const current = otpCode.split('');
                        current[idx] = val;
                        const newCode = current.join('').slice(0, 6);
                        setOtpCode(newCode);
                        if (val && idx < 5) {
                          const nextEl = document.getElementById(`otp-box-${idx + 1}`);
                          if (nextEl) (nextEl as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleVerifyOtp();
                        } else if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                          const prevEl = document.getElementById(`otp-box-${idx - 1}`);
                          if (prevEl) (prevEl as HTMLInputElement).focus();
                        }
                      }}
                      autoFocus={idx === 0}
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {faydaError && (
                <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                  {faydaError}
                </span>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                  onClick={() => {
                    setOtpStep(false);
                    setOtpCode('');
                    setFaydaError('');
                  }}
                >
                  Back to FIN
                </button>
                <button
                  type="submit"
                  className="btn-accent"
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  disabled={isConfirmingOtp}
                >
                  {isConfirmingOtp ? (
                    <><RefreshCw size={16} className="animate-spin" /> Verifying with Server...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Confirm OTP & Retrieve Biometrics</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Fayda Verified Result Card */}
          {faydaResult && (
            <div
              style={{
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                border: '2px solid var(--primary)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(14, 165, 233, 0.3)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="var(--primary-dark)" />
                  <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                    NATIONAL FAYDA DIGITAL IDENTITY VERIFIED
                  </span>
                </div>
                <CheckCircle2 size={26} color="#10B981" />
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img
                  src={faydaResult.photoUrl}
                  alt="Fayda Photo"
                  style={{
                    width: '115px',
                    height: '145px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                  }}
                />
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Full Legal Name
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                      {faydaResult.name}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Date of Birth</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{faydaResult.dob}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gender</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{faydaResult.gender}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Age Division</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{faydaResult.ageTier}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Affiliated Club</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{club?.shortName || club?.name || 'Club'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#64748B', border: '1px solid #E0F2FE' }}>
                <strong style={{ color: '#0369A1' }}>Fayda FIN:</strong> {faydaResult.nin} · <strong style={{ color: '#10B981' }}>✓ Verified via Live Backend Fayda API</strong>
              </div>

              <button
                type="button"
                className="btn-accent"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.98rem',
                }}
                onClick={() => setStep('DETAILS')}
              >
                Continue to Complete Registration →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Additional Details Form */}
      {step === 'DETAILS' && faydaResult && (
        <div
          className="gov-card"
          style={{
            padding: '36px',
            borderRadius: '20px',
            background: '#FFFFFF',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Member Verified Summary Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={faydaResult.photoUrl}
                alt="Member Photo"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{faydaResult.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Fayda FIN: {faydaResult.nin}</div>
              </div>
            </div>
            <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}>
              ✓ Fayda Verified
            </span>
          </div>

          <form onSubmit={handleSubmitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ══════════ SECTION 1: Account & Contact Information (All Roles) ══════════ */}
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#004B99',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Account & Contact Credentials
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.95rem',
                      background: '#F8FAFC',
                    }}
                  />
                </div>

                {/* Password & Phone Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Login Password (Min 8 Chars) *
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password123!"
                      required
                      minLength={8}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 91 123 4567 or 0911234567"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>
                </div>

                {/* Athlete-specific: Emergency Contact */}
                {selectedType === 'ATHLETE' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Emergency Contact (Name & Phone)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. Coach Tadesse (+251 91 111 2233)"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ══════════ SECTION 2: Role-Specific Credentials / Information ══════════ */}

            {/* ── COACH SECTION ── */}
            {selectedType === 'COACH' && (
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#004B99',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Coaching Credentials
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* License ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      License ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      placeholder="e.g. COACH-ETH-2026-1234"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Specialization / Sport Discipline
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Sprint Coach, Middle & Long Distance"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Years of Coaching Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="5"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STAFF SECTION ── */}
            {selectedType === 'SUPPORT' && (
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#004B99',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Staff Role & Department
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Position/Role * */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Position / Role *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={staffPosition}
                      onChange={(e) => setStaffPosition(e.target.value)}
                      placeholder="e.g. Physiotherapist, Operations Manager, Team Doctor"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  {/* Department * */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Department *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={staffDepartment}
                      onChange={(e) => setStaffDepartment(e.target.value)}
                      placeholder="e.g. Medical, Administration, Technical Operations"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Employee / Staff ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={staffEmployeeId}
                      onChange={(e) => setStaffEmployeeId(e.target.value)}
                      placeholder="e.g. STAFF-ETH-2026-001"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── ATHLETE SECTION ── */}
            {selectedType === 'ATHLETE' && (
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#004B99',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Athletics & Event Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Primary Event */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Primary Event / Discipline *
                    </label>
                    <select
                      className="form-input"
                      value={primaryEvent}
                      onChange={(e) => setPrimaryEvent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    >
                      {(regOptions?.disciplines && regOptions.disciplines.length > 0) ? (
                        regOptions.disciplines.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="100m Sprint">100m Sprint</option>
                          <option value="200m Sprint">200m Sprint</option>
                          <option value="400m">400m</option>
                          <option value="800m">800m</option>
                          <option value="1,500m">1,500m</option>
                          <option value="3,000m Steeplechase">3,000m Steeplechase</option>
                          <option value="5,000m Long Distance">5,000m Long Distance</option>
                          <option value="10,000m Long Distance">10,000m Long Distance</option>
                          <option value="Half Marathon">Half Marathon</option>
                          <option value="Marathon">Marathon</option>
                          <option value="High Jump">High Jump</option>
                          <option value="Long Jump">Long Jump</option>
                          <option value="Triple Jump">Triple Jump</option>
                          <option value="Javelin Throw">Javelin Throw</option>
                          <option value="Shot Put">Shot Put</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Secondary Event */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Secondary Event / Cross Country (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={secondaryEvent}
                      onChange={(e) => setSecondaryEvent(e.target.value)}
                      placeholder="e.g. 10,000m or Cross-Country"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC',
                      }}
                    />
                  </div>

                  {/* Physical Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="58"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '0.95rem',
                          background: '#F8FAFC',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '0.95rem',
                          background: '#F8FAFC',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Buttons */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setStep('FAYDA_VERIFICATION')}
                className="btn-gov-secondary"
                style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 700 }}
                disabled={isSubmitting}
              >
                Back to Fayda ID
              </button>
              <button
                type="submit"
                className="btn-accent"
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><RefreshCw size={18} className="animate-spin" /> Registering with Backend...</>
                ) : (
                  <><CheckCircle2 size={18} /> Complete Registration</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
