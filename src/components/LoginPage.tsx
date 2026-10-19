import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';
import {
  ShieldCheck, Phone, AlertCircle, ArrowRight, ArrowLeft, Sparkles, Eye, EyeOff, User, Lock, Home, Building2, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export type LoginMethod = 'FAYDA' | 'PHONE';

interface LoginPageProps {
  onLoginSuccess: (role: string, data: any) => void;
  onOpenRegistration?: (role?: 'CLUB' | 'ATHLETE') => void;
  onNavigateHome?: () => void;
  initialMethod?: LoginMethod | string;
  initialCredential?: string;
  darkMode?: boolean;
}

export default function LoginPage({
  onLoginSuccess,
  onOpenRegistration,
  onNavigateHome,
  initialMethod,
  initialCredential,
  darkMode = false,
}: LoginPageProps) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

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
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const msg = sessionStorage.getItem('eaf_registration_success_msg');
      if (msg) {
        sessionStorage.removeItem('eaf_registration_success_msg');
        return msg;
      }
    }
    return '';
  });

  // Pre-fill registered FIN if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFin = sessionStorage.getItem('eaf_registered_fin');
      if (savedFin && !credential) {
        const digits = savedFin.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.match(/.{1,4}/g)?.join(' ') || savedFin;
        setCredential(formatted);
        setMethod('FAYDA');
        sessionStorage.removeItem('eaf_registered_fin');
      }
    }
  }, []);

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
      const cleanUpper = raw.toUpperCase().replace(/\s+/g, '');
      if (cleanUpper.startsWith('FAN')) {
        const fanDigits = cleanUpper.replace('FAN', '');
        if (fanDigits.length < 9) {
          setError('Fayda Administrative Number (FAN) must be at least 9 characters.');
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
      const roles: string[] = data.user?.roles || [];
      const isCoach = userRole.includes('coach') || roles.some((r: string) => r.toUpperCase() === 'COACH');
      const isClub = userRole.includes('club') || roles.some((r: string) => r.toUpperCase().includes('CLUB'));

      const appRole = isCoach ? 'COACH' : isClub ? 'CLUB' : 'ATHLETE';

      const userData = {
        id: data.user?.id || data.userId,
        email: data.user?.email || '',
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        status: data.status || data.user?.status || 'ACTIVE',
        roles,
      };

      if (appRole === 'COACH') {
        const resolvedCoach = data.coach || {
          id: data.userId || data.user?.id,
          name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || data.userName || 'Coach',
          email: data.user?.email || '',
          phoneNumber: data.user?.phoneNumber || credential,
          licenseNumber: data.licenseNumber || 'WA-COA-ETH-2026-21593',
          specialization: data.specialization || 'Distance & Steeplechase',
          yearsOfExperience: 24,
          status: 'ACTIVE',
          user: data.user,
          faydaFin: identifierToSend,
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
            isRegistered: true,
          }));
        } catch (e) {}

        onLoginSuccess('ATHLETE', { athlete: resolvedAthlete });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiErr = err as { data?: { message?: string; success?: boolean }; error?: string; status?: string | number };
      const msg = apiErr?.data?.message || apiErr?.error || 'Invalid credentials. Please verify your login details and password.';

      if (apiErr?.status === 'FETCH_ERROR') {
        setError('Cannot connect to backend server. You can use the Quick Sandbox Logins below to test immediately.');
      } else {
        setError(msg);
      }
    }
  };

  const handleDemoLogin = (role: 'CLUB' | 'ATHLETE' | 'COACH') => {
    if (role === 'COACH') {
      const coach = {
        id: 'cmv25mzco000bfhdljahai4gz',
        name: 'Tolosa Kotu',
        email: 'tolosa.21593@athletics.et',
        phoneNumber: '0911442159',
        licenseNumber: 'WA-COA-ETH-2026-21593',
        specialization: 'Distance & Steeplechase',
        yearsOfExperience: 24,
        status: 'ACTIVE',
        faydaFin: '3849018299412026',
        faydaFan: 'FAN-3849-0182-2026',
      };
      const userData = {
        id: 'cmv25mzcl0009fhdl2xk3hazq',
        email: 'tolosa.21593@athletics.et',
        firstName: 'Tolosa',
        lastName: 'Kotu',
        status: 'ACTIVE',
        roles: ['COACH'],
      };
      dispatch(login({
        role: 'COACH',
        coach,
        token: 'demo-token-coach-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        userId: userData.id,
        userData,
      }));
      onLoginSuccess('COACH', { coach });
    } else if (role === 'CLUB') {
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
        club,
        token: 'demo-token-club-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      onLoginSuccess('CLUB', { club });
    } else {
      const athlete = MOCK_ATHLETES[0];
      const userData = {
        id: athlete.id || 'cmuxyf78x0029fheqhs7ggvv1',
        email: 'tigist.akele@example.com',
        firstName: 'Tigist',
        lastName: 'Akele',
        status: 'ACTIVE',
        roles: ['ATHLETE'],
      };

      dispatch(login({
        role: 'ATHLETE',
        athlete,
        token: 'demo-token-athlete-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        userId: userData.id,
        userData,
      }));

      try {
        localStorage.setItem('eaf_registered_athlete', JSON.stringify({
          userId: userData.id,
          name: 'Tigist Akele',
          status: 'ACTIVE',
          isRegistered: true,
          photoUrl: athlete.photoUrl || '/images/runner_female.png',
        }));
      } catch (e) {}

      onLoginSuccess('ATHLETE', { athlete });
    }
  };

  const handleFillSampleCred = (type: 'ATHLETE_FIN' | 'COACH_FIN' | 'COACH_PHONE' | 'ATHLETE_PHONE') => {
    setError('');
    setPassword('Password123!');
    if (type === 'ATHLETE_FIN') {
      setMethod('FAYDA');
      setCredential('2685 0380 1845 1943');
    } else if (type === 'COACH_FIN') {
      setMethod('FAYDA');
      setCredential('3849 0182 9941 2026');
    } else if (type === 'COACH_PHONE') {
      setMethod('PHONE');
      setCredential('0911442159');
    } else if (type === 'ATHLETE_PHONE') {
      setMethod('PHONE');
      setCredential('0911223344');
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-slate-900'}`}>
      {/* Top Header / Navigation Bar */}


      {/* Main Responsive Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 md:p-10 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Header Title */}
          <div className="text-center mb-6">
          
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Access athlete licenses, club rosters, official competition entries, and federation services.
            </p>
          </div>

          {/* Login Method Tabs (Fayda vs Phone) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleMethodSelect('FAYDA')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                method === 'FAYDA'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>🇪🇹</span>
              <span>Fayda ID (FIN / FAN)</span>
            </button>
            <button
              type="button"
              onClick={() => handleMethodSelect('PHONE')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                method === 'PHONE'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Phone Number</span>
            </button>
          </div>

          {/* Registration Success Banner */}
          {registrationSuccessMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <strong className="block text-emerald-950 dark:text-emerald-100 font-black mb-0.5">
                  Registration Successful!
                </strong>
                <span className="font-semibold leading-relaxed">{registrationSuccessMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {method === 'FAYDA' ? 'Fayda National ID (FIN or FAN)' : 'Registered Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  placeholder={method === 'FAYDA' ? 'e.g. 2685 0380 1845 1943 or FAN12345678' : 'e.g. 0911442159 or +251 91 144 2159'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {method === 'FAYDA' ? <ShieldCheck className="w-5 h-5 text-blue-600" /> : <Phone className="w-5 h-5 text-blue-600" />}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {method === 'FAYDA'
                  ? 'Enter your 16-digit Fayda FIN or your alphanumeric FAN.'
                  : 'Enter the phone number linked to your EAF profile.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:scale-[0.99] transition shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox / Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                ⚡ Quick Sandbox Logins
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">1-Click Test</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ATHLETE')}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <span>🏃 Athlete</span>
                <span className="text-[10px] text-slate-500 font-normal">Tigist Akele</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('COACH')}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <span>⏱️ Coach</span>
                <span className="text-[10px] text-slate-500 font-normal">Tolosa Kotu</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('CLUB')}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <span>🏢 Club Admin</span>
                <span className="text-[10px] text-slate-500 font-normal">Dawit Bekele</span>
              </button>
            </div>
          </div>

          {/* Footer Registration Link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div>
              Don't have an athlete license yet?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onOpenRegistration) onOpenRegistration('ATHLETE');
                  else window.location.href = '/register';
                }}
                className="font-extrabold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Start Athlete Registration (Fayda)
              </button>
            </div>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              Representing an athletics club or organization?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onOpenRegistration) onOpenRegistration('CLUB');
                  else window.location.href = '/register?role=club';
                }}
                className="font-extrabold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5 inline" />
                Register as a Club (No Fayda upfront)
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Page Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        © 2026 Ethiopian Athletics Federation (EAF). All rights reserved.
      </footer>
    </div>
  );
}
