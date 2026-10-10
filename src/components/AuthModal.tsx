import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';
import {
  ShieldCheck, User, Phone, Mail, Hash, KeyRound,
  Eye, EyeOff, AlertCircle, ArrowRight, X, Sparkles, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type LoginMethod = 'FIN' | 'FAN' | 'PHONE' | 'EMAIL';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (role: string, data: any) => void;
  onOpenRegistration?: () => void;
}

export default function AuthModal({
  onClose,
  onLoginSuccess,
  onOpenRegistration,
}: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [method, setMethod] = useState<LoginMethod>('FIN');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Format helpers
  const handleCredentialChange = (val: string) => {
    setError('');
    if (method === 'FIN') {
      // Auto-space in groups of 4 digits
      const digits = val.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
      setCredential(formatted);
    } else if (method === 'FAN') {
      let upper = val.toUpperCase().trim();
      if (!upper.startsWith('FAN-') && upper.length > 3 && !upper.startsWith('FAN')) {
        upper = 'FAN-' + upper.replace(/\D/g, '');
      }
      setCredential(upper);
    } else {
      setCredential(val);
    }
  };

  const handleMethodSelect = (newMethod: LoginMethod) => {
    setMethod(newMethod);
    setCredential('');
    setError('');
  };

  const validateInput = (): boolean => {
    const raw = credential.trim();
    if (!raw) {
      setError(`Please enter your ${method === 'FIN' ? 'National ID (FIN)' : method === 'FAN' ? 'Fayda Access Number (FAN)' : method === 'PHONE' ? 'Phone Number' : 'Email Address'}.`);
      return false;
    }

    if (!password) {
      setError('Please enter your account password.');
      return false;
    }

    if (method === 'FIN') {
      const digits = raw.replace(/\D/g, '');
      if (digits.length < 12) {
        setError('National ID Number (FIN) must be at least 12 digits.');
        return false;
      }
    } else if (method === 'FAN') {
      if (raw.length < 6) {
        setError('Please enter a valid Fayda Access Number (FAN).');
        return false;
      }
    } else if (method === 'PHONE') {
      const clean = raw.replace(/\D/g, '');
      if (clean.length < 9) {
        setError('Please enter a valid phone number (e.g., 0911000000 or +251911000000).');
        return false;
      }
    } else if (method === 'EMAIL') {
      if (!raw.includes('@') || !raw.includes('.')) {
        setError('Please enter a valid email address.');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInput()) return;

    try {
      // Send raw cleaned identifier or full string
      let identifierToSend = credential.trim();
      if (method === 'FIN') {
        identifierToSend = credential.replace(/\s+/g, '');
      }

      const res = await loginApi({ identifier: identifierToSend, password }).unwrap();
      const data = res.data;

      // Extract roles
      const userRole = data.userRole?.toLowerCase() || '';
      const roles = data.user?.roles || [];
      const isAthlete = userRole.includes('athlete') || roles.some((r: string) => r.toUpperCase() === 'ATHLETE');
      const appRole = isAthlete ? 'ATHLETE' : 'CLUB';

      const userData = {
        id: data.user?.id || data.userId,
        email: data.user?.email || (method === 'EMAIL' ? credential : ''),
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        status: data.status || data.user?.status || 'ACTIVE',
        roles,
      };

      // Persist auth in Redux with real backend athlete & club objects
      dispatch(login({
        role: appRole,
        club: data.club,
        athlete: data.athlete,
        token: data.token || data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId || data.user?.id,
        userData,
      }));

      // Store registration marker so UI persists registered state
      try {
        localStorage.setItem('eaf_registered_athlete', JSON.stringify({
          userId: userData.id,
          name: `${userData.firstName} ${userData.lastName}`.trim() || data.userName,
          fanNumber: data.fanNumber,
          role: appRole,
          status: 'ACTIVE',
        }));
      } catch (e) {}

      if (appRole === 'CLUB') {
        const resolvedClub = data.club || {
          id: data.clubId || 'CLUB-' + data.userId,
          name: data.clubName || 'Addis Ababa Runners Club',
          shortName: data.clubName ? data.clubName.split(' ')[0] : 'AARC',
          region: 'Addis Ababa',
          manager: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'Club Administrator',
          email: data.user?.email || credential,
          phone: '',
          licensedAthletes: 14,
          pendingVerifications: 2,
          unlicensedAthletes: 0,
          transfersCount: 1,
          logo: '🏃',
          clubRank: 1,
          totalPoints: 850,
        };
        onLoginSuccess('CLUB', { club: resolvedClub });
      } else {
        const resolvedAthlete = data.athlete || {
          id: data.userId || data.user?.id,
          name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName || 'Athlete',
          amharicName: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName,
          dob: '2000-01-01',
          gender: 'MALE',
          ageTier: 'Senior Division',
          clubId: data.clubId || undefined,
          clubName: data.clubName || 'Independent',
          faydaFin: data.fanNumber || identifierToSend,
          faydaFan: data.fanNumber,
          faydaStatus: 'VERIFIED',
          licenseStatus: 'APPROVED',
          photoUrl: '/images/fayda_resident_photo.jpg',
          email: data.user?.email || (method === 'EMAIL' ? credential : ''),
          phone: '',
          personalBests: [],
          seasonBests: [],
          weightLog: [],
          trainingLog: [],
          achievements: [],
        };
        onLoginSuccess('ATHLETE', { athlete: resolvedAthlete });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiErr = err as { data?: { message?: string; success?: boolean }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Invalid credentials. Please verify your login information.';

      if (apiErr?.status === 'FETCH_ERROR') {
        setError('Cannot connect to the backend server. Please verify your connection or use the Demo Sandbox below.');
      } else {
        setError(msg);
      }
    }
  };

  // Dedicated Demo Bypass
  const handleDemoLogin = (role: 'CLUB' | 'ATHLETE') => {
    if (role === 'CLUB') {
      const club = MOCK_CLUBS[0];
      const userData = {
        id: 'usr-club-' + club.id,
        email: club.email || 'clubadmin@aarc.et',
        firstName: 'Dawit',
        lastName: 'Bekele',
        status: 'ACTIVE',
        roles: ['CLUB_ADMIN'],
      };

      dispatch(login({
        role: 'CLUB',
        token: 'demo-token-club-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      onLoginSuccess('CLUB', { club });
    } else {
      const athlete = MOCK_ATHLETES[0];
      const userData = {
        id: athlete.id,
        email: 'tigist.akele@example.com',
        firstName: 'Tigist',
        lastName: 'Akele',
        status: 'ACTIVE',
        roles: ['ATHLETE'],
      };

      dispatch(login({
        role: 'ATHLETE',
        token: 'demo-token-athlete-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      onLoginSuccess('ATHLETE', { athlete });
    }
  };

  const getMethodPlaceholder = () => {
    switch (method) {
      case 'FIN':
        return '2685 0380 1845 1943';
      case 'FAN':
        return 'FAN-9842-1084-3310';
      case 'PHONE':
        return '0911 00 00 00 or +251 91 100 0000';
      case 'EMAIL':
        return 'athlete@athletics.et or club@athletics.et';
    }
  };

  const getMethodHint = () => {
    switch (method) {
      case 'FIN':
        return 'Test credentials: FIN: 2685 0380 1845 1943 | Password: Password123!';
      case 'FAN':
        return 'Test credentials: FAN: FAN-9842-1084-3310 | Password: Password123!';
      case 'PHONE':
        return 'Test credentials: Phone: 0911000000 | Password: Password123!';
      case 'EMAIL':
        return 'Test credentials: Email: almaz.test@athletics.et | Password: Password123!';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.jpeg"
              alt="EAF Logo"
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight m-0">
                Federation Portal Login
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0">
                Ethiopian Athletics Federation Digital Registry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {/* Method Tabs */}
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Authentication Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleMethodSelect('FIN')}
                className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
                  method === 'FIN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                FIN
              </button>
              <button
                type="button"
                onClick={() => handleMethodSelect('FAN')}
                className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
                  method === 'FAN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                FAN
              </button>
              <button
                type="button"
                onClick={() => handleMethodSelect('PHONE')}
                className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
                  method === 'PHONE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => handleMethodSelect('EMAIL')}
                className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
                  method === 'EMAIL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Credential Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {method === 'FIN' && 'National ID Number (FIN)'}
                {method === 'FAN' && 'Fayda Access Number (FAN)'}
                {method === 'PHONE' && 'Registered Phone Number'}
                {method === 'EMAIL' && 'Official Email Address'}
              </label>
              <div className="relative">
                <input
                  type={method === 'EMAIL' ? 'email' : 'text'}
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  placeholder={getMethodPlaceholder()}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-slate-50/50"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {getMethodHint()}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-slate-50/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-0 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In with {method}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Separate Registration Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 m-0">
              New to the federation?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenRegistration) {
                    onOpenRegistration();
                  } else {
                    window.location.href = '/register';
                  }
                }}
                className="font-black text-slate-900 hover:text-black bg-transparent border-0 cursor-pointer underline inline-flex items-center gap-1"
              >
                Register with Fayda National ID →
              </button>
            </p>
          </div>

          {/* Clearly Separated Demo Login Sandbox */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" /> Demo Sandbox (Instant Testing)
              </span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-bold">
                No Password Required
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ATHLETE')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="font-black text-slate-900">Athlete Portal</div>
                <div className="text-[10px] text-slate-500 truncate">Tigist Akele</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('CLUB')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="font-black text-slate-900">Club Portal</div>
                <div className="text-[10px] text-slate-500 truncate">Dawit Bekele (AARC)</div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
