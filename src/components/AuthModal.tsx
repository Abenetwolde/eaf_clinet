import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import {
  ShieldCheck, Phone, AlertCircle, ArrowRight, X, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

export type LoginMethod = 'FAYDA' | 'PHONE';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (role: string, data: any) => void;
  onOpenRegistration?: () => void;
  initialMethod?: LoginMethod | string;
  initialCredential?: string;
}

export default function AuthModal({
  onClose,
  onLoginSuccess,
  onOpenRegistration,
  initialMethod,
  initialCredential,
}: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  // ONLY TWO OPTIONS: 1. FAYDA (FAN / FIN), 2. PHONE
  const [method, setMethod] = useState<LoginMethod>(() => {
    if (initialMethod === 'PHONE') return 'PHONE';
    return 'FAYDA';
  });

  const [credential, setCredential] = useState(() => {
    if (initialCredential) {
      if (initialMethod === 'PHONE') return initialCredential;
      const digits = initialCredential.replace(/\D/g, '').slice(0, 16);
      return digits.match(/.{1,4}/g)?.join(' ') || initialCredential;
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Format helpers
  const handleCredentialChange = (val: string) => {
    setError('');
    if (method === 'FAYDA') {
      const upper = val.toUpperCase().trim();
      if (upper.startsWith('FAN')) {
        setCredential(upper);
      } else {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
        setCredential(formatted);
      }
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
      setError(`Please enter your ${method === 'FAYDA' ? 'Fayda National ID (FAN or FIN)' : 'Phone Number'}.`);
      return false;
    }

    if (!password) {
      setError('Please enter your account password.');
      return false;
    }

    if (method === 'FAYDA') {
      if (raw.toUpperCase().startsWith('FAN')) {
        if (raw.length < 6) {
          setError('Please enter a valid Fayda Access Number (e.g. FAN-3849-0182-2026).');
          return false;
        }
      } else {
        const digits = raw.replace(/\D/g, '');
        if (digits.length < 12) {
          setError('National ID Number (FIN) must be at least 12 digits (e.g. 2685 0380 1845 1943).');
          return false;
        }
      }
    } else if (method === 'PHONE') {
      const clean = raw.replace(/\D/g, '');
      if (clean.length < 9) {
        setError('Please enter a valid phone number (e.g., 0911442159 or +251 91 144 2159).');
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
      let identifierToSend = credential.trim();
      if (method === 'FAYDA' && !identifierToSend.toUpperCase().startsWith('FAN')) {
        identifierToSend = credential.replace(/\s+/g, '');
      }

      const res = await loginApi({ identifier: identifierToSend, password }).unwrap();
      const data = res.data;

      const userRole = (data.userRole || '').toLowerCase();
      const roles: string[] = data.user?.roles || data.roles || [];
      const isCoach = userRole.includes('coach') || roles.some((r: string) => r.toUpperCase() === 'COACH');
      const isClub = userRole.includes('club') || roles.some((r: string) => r.toUpperCase().includes('CLUB'));

      const appRole = isCoach ? 'COACH' : isClub ? 'CLUB' : 'ATHLETE';

      const userData = {
        id: data.user?.id || data.userId || data.id,
        email: data.user?.email || data.email || '',
        firstName: data.user?.firstName || data.firstName || '',
        lastName: data.user?.lastName || data.lastName || '',
        phoneNumber: data.user?.phoneNumber || data.phoneNumber || '',
        faydaNin: data.faydaNin || data.user?.faydaIdentity?.nin || '',
        picture: data.user?.picture || data.user?.photoUrl || data.picture || data.photoUrl || '',
        status: data.status || data.user?.status || 'ACTIVE',
        roles,
      };

      if (appRole === 'COACH') {
        const resolvedCoach = data.coach || {
          id: data.userId || data.user?.id,
          name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName || 'Coach',
          email: data.user?.email || '',
          phoneNumber: data.user?.phoneNumber || '',
          licenseNumber: data.licenseNumber || '',
          specialization: data.specialization || '',
          yearsOfExperience: data.yearsOfExperience || 0,
          status: data.coach?.status || '',
          user: data.user,
          faydaFin: data.faydaNin || data.user?.faydaIdentity?.nin || '',
          faydaFan: data.fanNumber,
        };

        dispatch(login({
          role: 'COACH',
          coach: resolvedCoach,
          token: data.token || data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId || data.user?.id,
          userData,
        }));

        onLoginSuccess('COACH', { coach: resolvedCoach });
      } else if (appRole === 'CLUB') {
        const resolvedLogo = data.club?.logoUrl || data.club?.logo || data.user?.adminOf?.logoUrl || '';
        const resolvedClub = data.club ? {
          ...data.club,
          logo: data.club.logo || resolvedLogo,
          logoUrl: data.club.logoUrl || resolvedLogo,
        } : {
          id: data.clubId || data.user?.adminOf?.id || '',
          name: data.clubName || data.user?.adminOf?.name || '',
          shortName: data.club?.shortName || data.user?.adminOf?.name?.slice(0, 4) || '',
          region: data.club?.region || data.user?.adminOf?.region || '',
          manager: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim(),
          email: data.club?.email || data.user?.email || '',
          phone: '',
          licensedAthletes: 0,
          pendingVerifications: 0,
          unlicensedAthletes: 0,
          transfersCount: 0,
          logo: resolvedLogo,
          logoUrl: resolvedLogo,
          clubRank: 0,
          totalPoints: 0,
        };

        dispatch(login({
          role: 'CLUB',
          club: resolvedClub,
          token: data.token || data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId || data.user?.id,
          userData,
        }));

        onLoginSuccess('CLUB', { club: resolvedClub });
      } else {
        const resolvedAthlete = data.athlete || {
          id: data.userId || data.user?.id,
          name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName || '',
          amharicName: data.athlete?.amharicName || '',
          dob: data.athlete?.dateOfBirth || '',
          gender: data.athlete?.gender || '',
          ageTier: data.athlete?.ageTier || '',
          clubId: data.clubId || undefined,
          clubName: data.clubName || '',
          faydaFin: data.faydaNin || data.user?.faydaIdentity?.nin || '',
          faydaFan: data.fanNumber,
          faydaStatus: data.athlete?.faydaStatus || '',
          licenseStatus: data.athlete?.status || '',
          photoUrl: data.athlete?.photoUrl || data.user?.picture || '',
          email: data.user?.email || '',
          phone: '',
          personalBests: [],
          seasonBests: [],
          weightLog: [],
          trainingLog: [],
          achievements: [],
        };

        dispatch(login({
          role: 'ATHLETE',
          athlete: resolvedAthlete,
          token: data.token || data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId || data.user?.id,
          userData,
        }));

        try {
          localStorage.setItem('eaf_registered_athlete', JSON.stringify({
            userId: userData.id,
            name: `${userData.firstName} ${userData.lastName}`.trim() || data.userName,
            fanNumber: data.fanNumber,
            role: 'ATHLETE',
            status: 'ACTIVE',
          }));
        } catch (e) {}

        onLoginSuccess('ATHLETE', { athlete: resolvedAthlete });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiErr = err as { data?: { message?: string; success?: boolean }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Invalid credentials. Please verify your login details and password.';

      if (apiErr?.status === 'FETCH_ERROR') {
        setError('Cannot connect to the backend server. Please verify your connection and try again.');
      } else {
        setError(msg);
      }
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
          {/* ONLY TWO AUTHENTICATION METHOD TABS */}
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Login Method
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleMethodSelect('FAYDA')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer border-0 flex items-center justify-center gap-2 ${
                  method === 'FAYDA'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Fayda ID (FAN / FIN)</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodSelect('PHONE')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer border-0 flex items-center justify-center gap-2 ${
                  method === 'PHONE'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                }`}
              >
                <Phone size={16} />
                <span>Phone Number</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Credential Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {method === 'FAYDA' ? 'Fayda National ID (FAN or FIN)' : 'Registered Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  placeholder={method === 'FAYDA' ? '2685 0380 1845 1943 or FAN-3849-0182-2026' : '0911 44 21 59 or +251 91 144 2159'}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {method === 'FAYDA'
                  ? 'Enter your 16-digit National ID (FIN) or Fayda Access Number (FAN)'
                  : 'Enter your verified Ethiopian phone number (e.g. 0911442159)'}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 pr-10"
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
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer border-0 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Federation Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Separate Registration Link */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
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
                className="font-black text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer underline inline-flex items-center gap-1"
              >
                Register with Fayda National ID →
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
