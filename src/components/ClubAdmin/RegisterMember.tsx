import React, { useState } from 'react';
import { Users, UserCheck, Briefcase, ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2, Phone, Mail, Award, Clock } from 'lucide-react';

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
}

export default function RegisterMember({ onBack, onNotify, onAddAthlete }: RegisterMemberProps) {
  const [selectedType, setSelectedType] = useState<'ATHLETE' | 'COACH' | 'SUPPORT' | null>(null);
  const [step, setStep] = useState<'SELECT_TYPE' | 'FAYDA_VERIFICATION' | 'DETAILS'>('SELECT_TYPE');

  // Fayda verification state
  const [faydaFin, setFaydaFin] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [faydaLoading, setFaydaLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [faydaResult, setFaydaResult] = useState<FaydaResult | null>(null);
  const [faydaError, setFaydaError] = useState('');

  // Common Contact fields (shown for all roles)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Coach-specific fields (matching image 1)
  const [licenseId, setLicenseId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');

  // Staff-specific fields (matching image 2)
  const [staffPosition, setStaffPosition] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [staffEmployeeId, setStaffEmployeeId] = useState('');

  // Athlete-specific fields
  const [primaryEvent, setPrimaryEvent] = useState('5,000m');
  const [secondaryEvent, setSecondaryEvent] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Auto-format Fayda FIN into 12 digits (XXXX-XXXX-XXXX)
  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
    }
    setFaydaFin(formatted);
  };

  // Step 1: Initiate Fayda lookup & launch OTP prompt
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
      setOtpStep(true); // Open OTP verification
    }, 900);
  };

  // Step 2: Confirm OTP & retrieve Fayda Biometrics
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
        { name: 'Tadesse Worku Bekele', amharic: 'ታደሰ ወርቁ በቀለ', dob: '1998-05-15', gender: 'Male', blood: 'O+', region: 'Oromia Regional State', photoUrl: '/images/runner_marathon.png' },
        { name: 'Almaz Bekele Negash', amharic: 'አልማዝ በቀለ ነጋሽ', dob: '2003-06-18', gender: 'Female', blood: 'O+', region: 'Oromia Regional State', photoUrl: '/images/runner_female.png' },
        { name: 'Marta Woldu Haile', amharic: 'ማርታ ወልዱ ኃይሌ', dob: '2008-04-07', gender: 'Female', blood: 'B+', region: 'Amhara Regional State', photoUrl: '/images/a1.jpg' },
      ];
      const cleanDigits = faydaFin.replace(/\D/g, '');
      const pick = mockProfiles[cleanDigits.length % mockProfiles.length];

      setFaydaResult(pick);
      onNotify('Fayda ID verified successfully!', 'success');
    }, 1100);
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

  // Step 3: Complete registration submit
  const handleSubmitRegistration = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!faydaResult) {
      onNotify('Fayda verification required', 'error');
      return;
    }

    if (selectedType === 'ATHLETE' && !primaryEvent) {
      onNotify('Please select primary event for athlete', 'error');
      return;
    }

    if (selectedType === 'SUPPORT' && !staffPosition) {
      onNotify('Please enter Position / Role for staff member', 'error');
      return;
    }

    if (selectedType === 'SUPPORT' && !staffDepartment) {
      onNotify('Please enter Department for staff member', 'error');
      return;
    }

    const birthYear = faydaResult.dob ? parseInt(faydaResult.dob.substring(0, 4)) : 2000;
    const age = 2026 - birthYear;
    const calculatedTier = age <= 16 ? 'U16' : age <= 18 ? 'U18' : age <= 20 ? 'U20' : 'Senior';

    // Create new member record
    const newMember = {
      id: `${selectedType}-${Date.now()}`,
      name: faydaResult.name,
      amharicName: faydaResult.amharic,
      dob: faydaResult.dob,
      gender: faydaResult.gender,
      blood: faydaResult.blood,
      region: faydaResult.region,
      faydaFin: faydaFin,
      faydaStatus: 'VERIFIED',
      faydaHash: '0xFAYDA_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      licenseStatus: 'PENDING',
      licenseNumber: null,
      licenseExpiry: null,
      ageTier: calculatedTier,
      pb: 'N/A',
      photoUrl: faydaResult.photoUrl,
      phone: phone || '+251 91 123 4567',
      email: email || '',
      ...(selectedType === 'ATHLETE' && {
        primaryEvent: primaryEvent || '5,000m',
        secondaryEvent: secondaryEvent || '',
        emergencyContact: emergencyContact || '',
        weight: weight ? Number(weight) : 58,
        height: height ? Number(height) : 172,
      }),
      ...(selectedType === 'COACH' && {
        licenseId: licenseId || 'COACH-ETH-2026-001',
        specialization: specialization || 'General Athletics Coach',
        yearsOfExperience: Number(yearsOfExperience) || 0
      }),
      ...(selectedType === 'SUPPORT' && {
        role: staffPosition,
        position: staffPosition,
        department: staffDepartment,
        employeeId: staffEmployeeId || 'STAFF-ETH-2026-001'
      })
    };

    if (selectedType === 'ATHLETE') {
      onAddAthlete(newMember);
    }

    const typeLabel = selectedType === 'COACH' ? 'Coach' : selectedType === 'SUPPORT' ? 'Staff Member' : 'Athlete';
    onNotify(`${typeLabel} "${faydaResult.name}" registered successfully!`, 'success');
    onBack();
  };

  const getPageTitle = () => {
    if (selectedType === 'COACH') return 'Register Coach';
    if (selectedType === 'SUPPORT') return 'Register Staff';
    if (selectedType === 'ATHLETE') return 'Register Athlete';
    return 'Register New Member';
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
    <div style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '40px' }}>
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
            cursor: 'pointer'
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
              : 'Add member with National Fayda ID verification and registration credentials'}
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
              borderRadius: '16px'
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
              Add a new competitive athlete to your club roster
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
              borderRadius: '16px'
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
              Add a certified coach or trainer to your technical staff
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
              borderRadius: '16px'
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
              Add medical, administration, or operational staff
            </p>
          </button>
        </div>
      )}

      {/* Step 2: Fayda ID Verification */}
      {step === 'FAYDA_VERIFICATION' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', marginBottom: '6px' }}>
              Step 1: Fayda FIN Verification
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Enter the 12-digit Fayda FIN Number. Legal name, date of birth, gender, blood type, region, and official photo will be securely retrieved from the National ID database.
            </p>
          </div>

          {/* Fayda FIN Input Form (supports Enter key) */}
          {!otpStep && !faydaResult && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInitiateFaydaLookup();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <label style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                Fayda FIN Number (12 Digits Auto-Formatted)
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
                    border: '1.5px solid #CBD5E1'
                  }}
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
                    gap: '8px'
                  }}
                  disabled={faydaLoading}
                >
                  {faydaLoading ? (
                    <><RefreshCw size={16} className="animate-spin" /> Verifying FIN...</>
                  ) : (
                    <><ShieldCheck size={18} /> Verify Fayda FIN</>
                  )}
                </button>
              </div>
              {faydaError && (
                <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                  {faydaError}
                </span>
              )}
            </form>
          )}

          {/* OTP Entry Section (supports Enter key and Paste) */}
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
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    SMS OTP Authentication
                  </h5>
                  <p style={{ fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 700, margin: '2px 0 0 0' }}>
                    A 6-digit OTP passcode was sent to Fayda registered mobile number.
                  </p>
                </div>
              </div>

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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
                    gap: '8px'
                  }}
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <><RefreshCw size={16} className="animate-spin" /> Confirming Passcode...</>
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
                gap: '20px'
              }}
            >
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(14, 165, 233, 0.3)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="var(--primary-dark)" />
                  <span style={{ fontWeight: 900, color: '#0369A1', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                    GOVERNMENT FAYDA ID BIOMETRICS VERIFIED
                  </span>
                </div>
                <CheckCircle2 size={26} color="#10B981" />
              </div>

              {/* Photo and Details */}
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
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
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
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Amharic Name
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '2px' }}>
                      {faydaResult.amharic}
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
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Blood Type</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{faydaResult.blood}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Region</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{faydaResult.region}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#64748B', border: '1px solid #E0F2FE' }}>
                <strong style={{ color: '#0369A1' }}>Fayda FIN:</strong> {faydaFin} · <strong style={{ color: '#10B981' }}>✓ Verified via National ID Database</strong>
              </div>

              {/* Continue Button */}
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
                  fontSize: '0.98rem'
                }}
                onClick={() => setStep('DETAILS')}
              >
                Continue to Additional Details →
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
            border: '1px solid #E2E8F0'
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
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={faydaResult.photoUrl}
                alt="Member Photo"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{faydaResult.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Fayda FIN: {faydaFin}</div>
              </div>
            </div>
            <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}>
              ✓ Verified
            </span>
          </div>

          <form onSubmit={handleSubmitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ══════════ SECTION 1: Contact Information (All Roles) ══════════ */}
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#004B99',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}
              >
                Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Phone Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 123 4567 or 0911234567"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.95rem',
                      background: '#F8FAFC'
                    }}
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.95rem',
                      background: '#F8FAFC'
                    }}
                  />
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
                      placeholder="e.g. Ato Bekele Negash (+251 91 111 2233)"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ══════════ SECTION 2: Role-Specific Credentials / Information ══════════ */}

            {/* ── COACH SECTION (Matching Image 1) ── */}
            {selectedType === 'COACH' && (
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#004B99',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
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
                      placeholder="e.g. COACH-ETH-2024-1234"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
                      }}
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Sprint Coach, Distance Running"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
                      }}
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STAFF SECTION (Matching Image 2) ── */}
            {selectedType === 'SUPPORT' && (
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#004B99',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Staff Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Position/Role * */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Position/Role *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={staffPosition}
                      onChange={(e) => setStaffPosition(e.target.value)}
                      placeholder="e.g. Physiotherapist, Manager, Admi..."
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
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
                      placeholder="e.g. Medical, Administration, Operati..."
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
                      }}
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={staffEmployeeId}
                      onChange={(e) => setStaffEmployeeId(e.target.value)}
                      placeholder="e.g. STAFF-ETH-2024-001"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        background: '#F8FAFC'
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
                    letterSpacing: '-0.01em'
                  }}
                >
                  Athletics Information
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
                        background: '#F8FAFC'
                      }}
                    >
                      <option value="100m Sprint">100m Sprint</option>
                      <option value="200m Sprint">200m Sprint</option>
                      <option value="400m">400m</option>
                      <option value="800m">800m</option>
                      <option value="1,500m">1,500m</option>
                      <option value="3,000m Steeplechase">3,000m Steeplechase</option>
                      <option value="5,000m">5,000m Long Distance</option>
                      <option value="10,000m">10,000m Long Distance</option>
                      <option value="Half Marathon">Half Marathon</option>
                      <option value="Marathon">Marathon</option>
                      <option value="High Jump">High Jump</option>
                      <option value="Long Jump">Long Jump</option>
                      <option value="Triple Jump">Triple Jump</option>
                      <option value="Javelin Throw">Javelin Throw</option>
                      <option value="Shot Put">Shot Put</option>
                    </select>
                  </div>

                  {/* Secondary Event (Optional) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Secondary Event (Optional)
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
                        background: '#F8FAFC'
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
                          background: '#F8FAFC'
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
                          background: '#F8FAFC'
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
                  cursor: 'pointer'
                }}
              >
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
