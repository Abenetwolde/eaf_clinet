import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';
import { Shield, User, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess }: {
  onClose: () => void;
  onLoginSuccess: (role: string, data: any) => void;
}) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ⚡ Demo Account Bypass Handler (No backend required)
  const handleDemoLogin = (role: 'CLUB' | 'ATHLETE', index = 0) => {
    if (role === 'CLUB') {
      const club = MOCK_CLUBS[index] || MOCK_CLUBS[0];
      const userData = {
        id: 'usr-club-' + club.id,
        email: club.email || 'demo.club@athletics.et',
        firstName: club.manager.split(' ')[0] || 'Club',
        lastName: club.manager.split(' ')[1] || 'Admin',
        status: 'ACTIVE',
        roles: ['CLUB_ADMIN'],
      };

      dispatch(login({
        role: 'CLUB',
        token: 'demo-access-token-club-' + Date.now(),
        refreshToken: 'demo-refresh-token-club-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      onLoginSuccess('CLUB', { club });
    } else {
      const athlete = MOCK_ATHLETES[index] || MOCK_ATHLETES[0];
      const userData = {
        id: athlete.id,
        email: athlete.email || 'demo.athlete@athletics.et',
        firstName: athlete.name.split(' ')[0] || 'Athlete',
        lastName: athlete.name.split(' ')[1] || 'User',
        status: 'ACTIVE',
        roles: ['ATHLETE'],
      };

      dispatch(login({
        role: 'ATHLETE',
        token: 'demo-access-token-athlete-' + Date.now(),
        refreshToken: 'demo-refresh-token-athlete-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      onLoginSuccess('ATHLETE', { athlete });
    }
  };

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
      const msg = apiErr?.data?.message || apiErr?.error || 'Login failed. Backend API server is offline or unreachable.';

      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Cannot reach the backend API server. You can bypass this restriction using Demo Mode below.');
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
          maxWidth: '500px',
          width: '95%',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          background: '#FFFFFF',
          maxHeight: '92vh',
          overflowY: 'auto'
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
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
            Portal Login
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#0B5ED7', marginBottom: '4px', fontWeight: 700 }}>
            EOSCRMS — Ethiopian Athletics Federation
          </p>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Sign in with your account or use instant Demo Access.
          </p>
        </div>

        {/* ⚡ Demo Bypass Section Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1.5px solid #F59E0B',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#92400E', fontWeight: 900, fontSize: '0.95rem' }}>
            <Zap size={18} color="#D97706" />
            <span>⚡ Instant Demo Access (No Backend Required)</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#78350F', marginBottom: '12px', lineHeight: 1.4, fontWeight: 600 }}>
            API server offline or no credentials? Click below to immediately log in and bypass backend restrictions:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('CLUB', 0)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #F59E0B',
                color: '#92400E',
                padding: '10px 12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFFBEB'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              <Shield size={16} color="#D97706" />
              Demo Club Admin
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('ATHLETE', 0)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #0B5ED7',
                color: '#1E40AF',
                padding: '10px 12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              <User size={16} color="#0B5ED7" />
              Demo Athlete
            </button>
          </div>
        </div>

        {/* Error Message with Quick Bypass Option */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#991B1B',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <AlertTriangle size={18} color="#DC2626" style={{ shrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('CLUB', 0)}
                style={{
                  flex: 1,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                ⚡ Bypass as Club Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ATHLETE', 0)}
                style={{
                  flex: 1,
                  background: '#0B5ED7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                ⚡ Bypass as Athlete
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                Email Address
              </label>
              <span
                onClick={() => { setEmail('admin@defense-athletics.et'); setPassword('password123'); }}
                style={{ fontSize: '0.78rem', color: '#0B5ED7', fontWeight: 700, cursor: 'pointer' }}
              >
                Auto-fill Club Email
              </span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@defense-athletics.et"
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: '0.98rem',
                borderRadius: '12px',
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
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: '0.98rem',
                borderRadius: '12px',
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
              padding: '15px',
              fontSize: '1.05rem',
              borderRadius: '12px',
              background: isLoading ? '#94A3B8' : 'linear-gradient(135deg, #0B5ED7 0%, #0A4FB5 100%)',
              color: '#FFFFFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              fontWeight: 800,
              marginTop: '4px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Connecting to API...
              </>
            ) : (
              <>
                Server API Login <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
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
                fontSize: '0.92rem',
                fontWeight: 700,
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

