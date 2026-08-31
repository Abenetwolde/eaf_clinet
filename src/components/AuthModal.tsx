import React, { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import {
  Building2,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

import VerificationModal from './VerificationModal';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (role: string, data: any) => void;
  initialRole?: 'CLUB' | 'ATHLETE';
  initialEmail?: string;
}

export default function AuthModal({ onClose, onLoginSuccess, initialRole = 'CLUB', initialEmail = '' }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [activeTab, setActiveTab] = useState<'CLUB' | 'ATHLETE'>(initialRole);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingNotice(null);

    try {
      const res = await loginApi({ email: email.trim(), password }).unwrap();
      // /auth/login returns a flat payload (no {success, data} envelope)
      const data = res;

      // Extract user info
      const rawUserRole = (data?.userRole || '').toString().toUpperCase();
      const rolesArray = (data?.user?.roles || []).map((r: string) => r.toString().toUpperCase());
      const accountStatus = (data?.status || data?.user?.status || 'ACTIVE').toString().toUpperCase();

      // Determine app role (Club vs Athlete)
      const isAthleteRole =
        rawUserRole.includes('ATHLETE') ||
        rolesArray.includes('ATHLETE') ||
        activeTab === 'ATHLETE';

      const appRole: 'CLUB' | 'ATHLETE' = isAthleteRole ? 'ATHLETE' : 'CLUB';

      // Check if the account is still pending acceptance/approval
      if (accountStatus === 'PENDING' || accountStatus === 'PENDING_APPROVAL' || accountStatus === 'UNVERIFIED') {
        setPendingNotice(
          'Your registration has been submitted and is currently pending verification/acceptance. Please check your email for the confirmation message once your registration is approved.'
        );
        return;
      }

      // Build user data for state & persistence
      const userData = {
        id: data?.user?.id || data?.userId || '',
        email: data?.user?.email || email,
        firstName: data?.user?.firstName || '',
        lastName: data?.user?.lastName || '',
        status: accountStatus,
        roles: data?.user?.roles || [appRole],
      };

      // Dispatch session to Redux
      dispatch(
        login({
          role: appRole,
          token: data?.token || data?.accessToken,
          refreshToken: data?.refreshToken,
          userId: data?.userId || data?.user?.id,
          userData,
        })
      );

      // Transition to respective dashboard
      if (appRole === 'CLUB') {
        const rawClubName = data?.clubName || '';
        onLoginSuccess('CLUB', {
          club: {
            id: data?.clubId || data?.userId || data?.user?.id || '',
            name: rawClubName,
            shortName: rawClubName.split(' ')[0] || '',
            region: '',
            manager: `${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`.trim(),
            email: data?.user?.email || email,
            phone: '',
            licensedAthletes: 0,
            pendingVerifications: 0,
            unlicensedAthletes: 0,
            transfersCount: 0,
            logo: '',
            clubRank: 0,
            totalPoints: 0,
          },
        });
      } else {
        const athleteName = `${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`.trim() || data?.userName || '';
        onLoginSuccess('ATHLETE', {
          athlete: {
            id: data?.userId || data?.user?.id || '',
            name: athleteName,
            dob: '',
            gender: '',
            ageTier: '',
            clubId: data?.clubId || undefined,
            clubName: data?.clubName || '',
            faydaFin: data?.fanNumber || undefined,
            faydaStatus: 'PENDING',
            licenseStatus: 'NONE',
            photoUrl: '',
            email: data?.user?.email || email,
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
      const apiErr = err as {
        data?: { message?: string; success?: boolean; error?: string };
        error?: string;
        status?: string | number;
      };

      const serverMsg = apiErr?.data?.message || apiErr?.data?.error || apiErr?.error;

      if (apiErr?.status === 'FETCH_ERROR' || !apiErr?.status) {
        setError('Unable to reach authentication server. Please verify your connection.');
      } else if (apiErr?.status === 401 || apiErr?.status === 400) {
        setError(serverMsg || 'Invalid email or password. Please check your credentials.');
      } else if (apiErr?.status === 403) {
        setError('Access denied. Your account may be suspended or awaiting approval.');
      } else {
        setError(serverMsg || 'Login failed. Please verify your credentials and try again.');
      }
    }
  };

  const handleOpenRegistration = (role: 'CLUB' | 'ATHLETE') => {
    onClose();
    window.dispatchEvent(new CustomEvent('openRegistrationModal', { detail: { role } }));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] bg-white dark:bg-[#111827] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0B5ED7] via-[#10B981] to-[#F59E0B]" />

        {/* Modal Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20">
                <img
                  src="/images/logo.jpeg"
                  alt="EAF Logo"
                  className="w-7 h-7 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight leading-none text-slate-900 dark:text-white">
                  Ethiopian Athletics Federation
                </h3>
                <span className="text-[0.7rem] font-bold text-primary tracking-wider uppercase">
                  National Management Portal
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('CLUB');
                setError('');
                setPendingNotice(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 border-0 cursor-pointer ${
                activeTab === 'CLUB'
                  ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
              }`}
            >
              <Building2 size={16} className={activeTab === 'CLUB' ? 'text-primary' : ''} />
              <span>Club Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ATHLETE');
                setError('');
                setPendingNotice(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 border-0 cursor-pointer ${
                activeTab === 'ATHLETE'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
              }`}
            >
              <UserCheck size={16} className={activeTab === 'ATHLETE' ? 'text-emerald-500' : ''} />
              <span>Athlete Portal</span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {activeTab === 'CLUB' ? 'Club Administrator Login' : 'Athlete Portal Login'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'CLUB'
                ? 'Sign in to manage club rosters, register athletes & staff, and view meet stats.'
                : 'Sign in to access your athlete profile, licensing, event check-ins, and results.'}
            </p>
          </div>

          {/* Pending Approval Notice */}
          {pendingNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed mb-4 flex items-start gap-3">
              <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Registration Under Review</p>
                <p>{pendingNotice}</p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold mb-4 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === 'CLUB' ? 'admin@club.eaf.et' : 'athlete@eaf.et'
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all box-border"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset links are sent by the federation system administrator.')}
                  className="text-[0.7rem] font-bold text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {showVerifyPrompt && (
              <button
                type="button"
                onClick={() => setShowVerification(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> Enter Email Verification Code →
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 border-0 cursor-pointer ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : activeTab === 'CLUB'
                  ? 'bg-primary hover:bg-primary-dark shadow-primary/25 hover:shadow-primary/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 hover:shadow-emerald-600/40'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'CLUB' ? 'Enter Club Dashboard' : 'Enter Athlete Portal'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {showVerification && (
            <VerificationModal
              email={email}
              onClose={() => setShowVerification(false)}
              onVerified={() => {
                setShowVerification(false);
                setError('');
                setShowVerifyPrompt(false);
              }}
            />
          )}

          {/* Registration Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Haven't registered with the federation yet?
            </p>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleOpenRegistration('ATHLETE')}
                className="text-xs font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Register as Athlete →
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[0.7rem] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={13} className="text-emerald-500" />
            EAF National Sports Identity Encrypted
          </span>
          <span className="font-mono text-[0.65rem] opacity-70">v2.4.0</span>
        </div>
      </div>
    </div>
  );
}

