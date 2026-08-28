import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';

export default function AuthModal({ onClose, onLoginSuccess }: {
  onClose: () => void;
  onLoginSuccess: (role: string, data: any) => void;
}) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await loginApi({ email, password }).unwrap();
      const data = res.data;

      // Determine role from userRole or roles array
      const userRole = data.userRole?.toLowerCase() || '';
      const roles = data.user?.roles || [];
      const isAthlete = userRole.includes('athlete') || roles.some(r => r.toUpperCase() === 'ATHLETE');
      const appRole = isAthlete ? 'ATHLETE' : 'CLUB';

      // Build userData for persistence
      const userData = {
        id: data.user?.id || data.userId,
        email: data.user?.email || email,
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        status: data.status || data.user?.status || 'ACTIVE',
        roles,
      };

      // Dispatch token + user data to Redux
      dispatch(login({
        role: appRole,
        token: data.token || data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId || data.user?.id,
        userData,
      }));

      // Build club or athlete object for the existing handler
      if (appRole === 'CLUB') {
        onLoginSuccess('CLUB', {
          club: {
            id: data.clubId || 'CLUB-' + data.userId,
            name: data.clubName || 'My Club',
            shortName: data.clubName || 'Club',
            region: 'Addis Ababa',
            manager: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'Admin',
            email: data.user?.email || email,
            phone: '',
            licensedAthletes: 0,
            pendingVerifications: 0,
            unlicensedAthletes: 0,
            transfersCount: 0,
            logo: '🏃',
            clubRank: 0,
            totalPoints: 0,
          },
        });
      } else {
        onLoginSuccess('ATHLETE', {
          athlete: {
            id: data.userId || data.user?.id,
            name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName || 'Athlete',
            dob: '',
            gender: '',
            ageTier: 'Senior',
            clubId: data.clubId || undefined,
            clubName: data.clubName || undefined,
            faydaFin: data.fanNumber || undefined,
            faydaStatus: 'VERIFIED',
            licenseStatus: 'PENDING',
            photoUrl: '/images/runner_female.png',
            email: data.user?.email || email,
            phone: '',
            personalBests: [],
            seasonBests: [],
            weightLog: [],
            trainingLog: [],
            achievements: [],
          },
        });
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; success?: boolean }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Login failed. Please check your credentials.';

      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Cannot reach the server. Please try again later.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        {/* Back Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '1.4rem',
            padding: '4px',
            lineHeight: 1
          }}
        >
          ←
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
            Login
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#0B5ED7', marginBottom: '4px', fontWeight: 600 }}>
            Welcome
          </p>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
            Access your competitions and registration tools.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            fontSize: '0.85rem',
            color: '#991B1B',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0B5ED7'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0B5ED7'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              borderRadius: '12px',
              background: isLoading ? '#94A3B8' : '#0B5ED7',
              color: '#FFFFFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              fontWeight: 700,
              marginTop: '8px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#0A4FB5'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#0B5ED7'; }}
          >
            {isLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Logging in...
              </>
            ) : 'Login'}
          </button>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('openRegistrationModal', { detail: { role: 'ATHLETE' } }));
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0B5ED7',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Need an account? Register as Athlete
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
