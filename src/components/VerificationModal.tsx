import React, { useState } from 'react';
import { Mail, Phone, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useVerifyEmailMutation, useRequestPhoneOtpMutation, useVerifyPhoneMutation } from '../store/api/authApi';

type VerificationStep = 'EMAIL' | 'PHONE' | 'DONE';

interface VerificationModalProps {
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

export default function VerificationModal({ email, onClose, onVerified }: VerificationModalProps) {
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();
  const [requestPhoneOtp, { isLoading: isRequestingOtp }] = useRequestPhoneOtpMutation();
  const [verifyPhone, { isLoading: isVerifyingPhone }] = useVerifyPhoneMutation();

  const [step, setStep] = useState<VerificationStep>('EMAIL');
  const [emailCode, setEmailCode] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [accountActive, setAccountActive] = useState(false);

  // ⚡ Demo Bypass Handler
  const handleDemoBypass = () => {
    setError('');
    setEmailVerified(true);
    setAccountActive(true);
    setStep('DONE');
    setSuccessMessage('⚡ Demo Mode: Verification Bypassed Successfully!');
  };

  const handleVerifyEmail = async () => {
    if (emailCode.length !== 6) {
      setError('Please enter a 6-digit code or use Demo Bypass.');
      return;
    }
    setError('');
    try {
      const res = await verifyEmail({ email, code: emailCode }).unwrap();
      setEmailVerified(true);
      setSuccessMessage(res.data?.message || 'Email verified successfully.');

      if (res.data?.accountActive) {
        setAccountActive(true);
        setStep('DONE');
      } else {
        setStep('PHONE');
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Cannot reach backend server. Click Demo Bypass below to proceed.');
      } else {
        setError(apiErr?.data?.message || apiErr?.error || 'Invalid code.');
      }
    }
  };

  const handleRequestPhoneOtp = async () => {
    setError('');
    try {
      const res = await requestPhoneOtp().unwrap();
      setSuccessMessage(res.data?.message || 'OTP sent to your phone.');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Cannot reach backend server. Click Demo Bypass below to proceed.');
      } else {
        setError(apiErr?.data?.message || apiErr?.error || 'Failed to send OTP.');
      }
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length !== 6) {
      setError('Please enter the 6-digit OTP or use Demo Bypass.');
      return;
    }
    setError('');
    try {
      const res = await verifyPhone({ otp: phoneOtp }).unwrap();
      setSuccessMessage(res.data?.message || 'Phone verified successfully.');
      if (res.data?.accountActive) {
        setAccountActive(true);
        setStep('DONE');
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; error?: string; status?: string | number };
      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Cannot reach backend server. Click Demo Bypass below to proceed.');
      } else {
        setError(apiErr?.data?.message || apiErr?.error || 'Invalid or expired OTP.');
      }
    }
  };

  const renderOtpInput = (
    value: string,
    onChange: (v: string) => void,
    onVerify: () => void,
    isVerifying: boolean,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Quick Fill / Demo Bypass Helper */}
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.84rem',
        color: '#92400E',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} color="#D97706" />
          <span>Need Demo OTP?</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onChange('123456')}
            style={{
              background: '#F59E0B',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Fill 123456
          </button>
          <button
            type="button"
            onClick={handleDemoBypass}
            style={{
              background: '#0B5ED7',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ⚡ Instant Pass
          </button>
        </div>
      </div>

      {/* OTP boxes */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '8px 0' }}>
        {[0, 1, 2, 3, 4, 5].map(idx => (
          <input
            key={idx}
            id={`verify-otp-${idx}`}
            type="text"
            maxLength={1}
            value={value[idx] || ''}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
              if (pasted) {
                onChange(pasted);
                const focusIdx = Math.min(pasted.length, 5);
                document.getElementById(`verify-otp-${focusIdx}`)?.focus();
              }
            }}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              const current = value.split('');
              current[idx] = val;
              onChange(current.join('').slice(0, 6));
              if (val && idx < 5) {
                document.getElementById(`verify-otp-${idx + 1}`)?.focus();
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onVerify();
              } else if (e.key === 'Backspace' && !value[idx] && idx > 0) {
                document.getElementById(`verify-otp-${idx - 1}`)?.focus();
              }
            }}
            style={{
              width: '52px',
              height: '60px',
              borderRadius: '12px',
              border: value[idx] ? '2px solid #0B5ED7' : '1px solid #CBD5E1',
              background: value[idx] ? '#F0F9FF' : '#FFFFFF',
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

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
            {error}
          </span>
          <button
            type="button"
            onClick={handleDemoBypass}
            style={{
              background: '#DC2626',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ⚡ Bypass OTP Restriction (Demo Account)
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onVerify}
        disabled={isVerifying || value.length < 6}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1rem',
          borderRadius: '12px',
          background: isVerifying || value.length < 6 ? '#94A3B8' : '#0B5ED7',
          color: '#FFF',
          border: 'none',
          fontWeight: 800,
          cursor: isVerifying || value.length < 6 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {isVerifying ? (
          <>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Verifying Code...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Verify Code
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleDemoBypass}
        style={{
          background: 'none',
          border: 'none',
          color: '#0B5ED7',
          fontSize: '0.85rem',
          cursor: 'pointer',
          textAlign: 'center',
          fontWeight: 700
        }}
      >
        ⚡ Skip & Bypass Server Verification (Demo Mode)
      </button>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '32px 24px',
          maxWidth: '480px',
          width: '95%',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          background: '#FFFFFF'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: '#64748B',
            cursor: 'pointer', fontSize: '1.4rem', padding: '4px', lineHeight: 1
          }}
        >
          ×
        </button>

        {/* ── Step indicators ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {(['EMAIL', 'PHONE', 'DONE'] as VerificationStep[]).map((s) => {
            const isActive = s === step;
            const isDone = (s === 'EMAIL' && emailVerified) || (s === 'PHONE' && accountActive) || (s === 'DONE' && accountActive);
            return (
              <div key={s} style={{
                flex: 1, height: '4px', borderRadius: '4px',
                background: isDone ? '#10B981' : isActive ? '#0B5ED7' : '#E2E8F0',
                transition: 'background 0.3s'
              }} />
            );
          })}
        </div>

        {/* ── EMAIL verification step ── */}
        {step === 'EMAIL' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Mail size={28} color="#0B5ED7" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                Verify Your Email
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6 }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: '#0F172A' }}>{email}</strong>
              </p>
            </div>

            {successMessage && (
              <div style={{
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '0.84rem', color: '#065F46', fontWeight: 600
              }}>
                {successMessage}
              </div>
            )}

            {renderOtpInput(emailCode, setEmailCode, handleVerifyEmail, isVerifyingEmail)}
          </div>
        )}

        {/* ── PHONE verification step ── */}
        {step === 'PHONE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Phone size={28} color="#0B5ED7" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                Verify Your Phone
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6 }}>
                Enter the OTP sent to your registered phone number.
              </p>
            </div>

            {successMessage && step === 'PHONE' && (
              <div style={{
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '0.84rem', color: '#065F46', fontWeight: 600
              }}>
                {successMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleRequestPhoneOtp}
              disabled={isRequestingOtp}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '10px', border: '1px solid #0B5ED7',
                background: '#FFFFFF', color: '#0B5ED7',
                fontWeight: 700, cursor: isRequestingOtp ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              {isRequestingOtp ? (
                <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
              ) : (
                <><Phone size={16} /> Send OTP to Phone</>
              )}
            </button>

            {renderOtpInput(phoneOtp, setPhoneOtp, handleVerifyPhone, isVerifyingPhone)}

            <button
              type="button"
              onClick={handleDemoBypass}
              style={{
                background: 'none', border: 'none', color: '#64748B',
                fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', fontWeight: 600
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ── DONE step ── */}
        {step === 'DONE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
            }}>
              <CheckCircle2 size={36} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                {accountActive ? 'Account Activated!' : 'Verification Complete'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6 }}>
                {accountActive
                  ? 'Your account is now active. You can log in with your credentials.'
                  : 'Your email has been verified. You can now log in.'}
              </p>
            </div>

            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: '12px', padding: '14px 16px',
              fontSize: '0.85rem', color: '#1E40AF', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <ShieldCheck size={18} />
              {accountActive
                ? 'Your account status is now ACTIVE. Proceed to login.'
                : 'After federation approval, your athlete license will be activated.'}
            </div>

            <button
              type="button"
              onClick={onVerified}
              style={{
                width: '100%', padding: '16px',
                fontSize: '1rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0B5ED7 0%, #0A4FB5 100%)',
                color: '#FFF', border: 'none', fontWeight: 800,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Go to Site (Stay Logged In) <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

