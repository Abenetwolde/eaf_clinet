import React, { useEffect, useRef } from 'react';
import { Home, UserCheck, Bell, BookOpen, LogOut, Sun, Moon, ArrowLeft, Calendar, Trophy, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAthlete } from '../../store/slices/authSlice';
import { useGetMyAthleteProfileQuery, mapMyProfileToAthlete } from '../../store/api/athleteApi';
import { LanguageSelector } from '../../i18n';

interface ClientLayoutProps {
  activeSubPage: string;
  onChangeSubPage: (page: string) => void;
  onBackToLanding: () => void;
  onLogout: () => void;
  onGoHome?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  children: React.ReactNode;
}

export default function ClientLayout({
  activeSubPage, onChangeSubPage, onBackToLanding, onLogout, onGoHome,
  darkMode, onToggleDarkMode, children
}: ClientLayoutProps) {
  const currentAthlete = useAppSelector((state) => state.auth.athlete);
  const userData = useAppSelector((state) => state.auth.userData);
  // Token presence gates the profile query — `status` is legitimately
  // 'loading' while the saved session is being validated on app mount.
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);
  const dispatch = useAppDispatch();

  // Hydrate the athlete portal with the registered profile from
  // GET /athletes/profile — the login response only carries identity basics.
  const {
    data: myProfile,
    isSuccess: profileLoaded,
    error: profileError,
  } = useGetMyAthleteProfileQuery(undefined, { skip: !isAuthenticated });

  // Accounts created before the registration fix have a login account but
  // no athlete profile on the backend (GET /athletes/profile → 404).
  const missingProfile =
    !!profileError &&
    (profileError as { status?: number | string }).status === 404;

  // Remembers the last athlete object produced by a server hydration so a
  // re-run never clobber local edits made in the portal afterwards.
  const lastHydratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profileLoaded || !myProfile?.id) return;
    const seed = {
      name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || undefined,
      email: userData?.email || undefined,
    };
    const merged = mapMyProfileToAthlete(myProfile, seed);
    const mergedJSON = JSON.stringify(merged);
    const currentJSON = JSON.stringify(currentAthlete);
    if (mergedJSON === currentJSON) {
      lastHydratedRef.current = mergedJSON;
      return;
    }
    // The athlete in state was changed locally after a hydration (user edits)
    // — leave it alone.
    if (lastHydratedRef.current !== null && currentJSON !== lastHydratedRef.current) return;
    lastHydratedRef.current = mergedJSON;
    dispatch(setAthlete(merged));
  }, [profileLoaded, myProfile, currentAthlete, userData, dispatch]);

  const tabs = [
    { id: 'OVERVIEW', label: 'Dashboard', icon: Home },
    { id: 'EVENTS', label: 'Competitions', icon: Calendar },
    { id: 'APPLIED', label: 'My Registrations', icon: BookOpen },
    { id: 'RESULTS', label: 'Results & Standings', icon: Trophy },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-[#080C14]' : 'bg-[#F4F6F9]'}`}>
      {/* Top Clean Desktop Web Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 28 }}
        className={`client-header sticky top-0 z-50 px-4 sm:px-8 py-3 flex justify-between items-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]
          ${darkMode ? 'bg-[#0F172A]/95 border-[#1E293B]' : 'bg-white/90 border-slate-200/80'} backdrop-blur-[16px] border-b`}
      >
        {/* Brand & Federation Title */}
        <div className="flex items-center gap-3 cursor-pointer min-w-0 shrink-0" onClick={() => onChangeSubPage('OVERVIEW')}>
          <img src="/images/logo.jpeg" alt="EAF" className="client-brand-img w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200" />
          <div className="min-w-0">
            <h1 className={`text-base sm:text-lg font-black m-0 tracking-tight leading-tight whitespace-nowrap ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              EAF Athlete Portal
            </h1>
            <div className="text-[0.72rem] text-primary font-bold whitespace-nowrap">
              National Digital Athlete Registry • የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeSubPage(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[0.84rem] transition-all duration-150 border-none cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_2px_8px_rgba(1,64,167,0.3)]'
                    : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools & Clean Avatar Profile Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChangeSubPage('NOTIFICATIONS')}
            title="Updates & Notifications"
            className={`relative p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200
              ${activeSubPage === 'NOTIFICATIONS'
                ? 'bg-[#E0F2FE] dark:bg-[#1E293B] border border-primary text-primary-dark dark:text-primary-light'
                : `${darkMode ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} border-0`
              }`}
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-white" />
          </motion.button>

          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleDarkMode}
              className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 border-none
                ${darkMode ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </motion.button>
          )}

          {/* Go to Public Website */}
          {onGoHome && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoHome}
              title="Go to Public Website"
              className={`${darkMode ? 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#2A3756]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} border-0 p-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors`}
            >
              <Home size={17} />
            </motion.button>
          )}

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            title="Sign Out"
            className={`client-signout ${darkMode ? 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#2A3756]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} border-0 px-3 py-2 rounded-xl text-[0.8rem] font-bold flex items-center gap-1.5 cursor-pointer transition-colors`}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>

          {/* Avatar - Clickable to open Profile Management */}
          {currentAthlete && (
            <motion.div
              className={`relative cursor-pointer shrink-0 rounded-full transition-all duration-150 ${
                activeSubPage === 'PROFILE' ? 'ring-3 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => onChangeSubPage('PROFILE')}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              title="Manage Athlete Profile & Credentials"
            >
              <img
                src={currentAthlete.photoUrl || '/images/runner_marathon.png'}
                alt="Profile"
                className="client-avatar w-10 h-10 rounded-full border-2 border-primary object-cover shadow-sm block"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Full-Width Desktop Content Area */}
      <main className="client-main flex-1 px-4 sm:px-8 py-5 sm:py-7 max-w-[1400px] mx-auto w-full">

        {/* Account without an athlete profile (legacy registrations) */}
        {missingProfile && (
          <div className="mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-[14px] px-4 py-3.5 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[0.85rem] text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="font-extrabold">No athlete profile is linked to this account yet.</strong>{' '}
              Your registered athletics data (personal bests, club, events) is attached to an athlete
              profile on the federation server, and this account doesn't have one — it was likely
              created by an earlier version of the registration form. Please{' '}
              <strong>register again as an athlete with a different email</strong> (or contact the
              federation registrar) so your profile is created and your data appears here.
            </div>
          </div>
        )}

        {/* Top Breadcrumb & Mobile Tab Bar */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToLanding}
            title="Back to Public Site"
            aria-label="Back to Public Site"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer font-bold text-[0.82rem] text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary bg-white dark:bg-[#121829] shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back to Public Site</span>
          </motion.button>

          {/* Mobile Secondary Tab Bar */}
          <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeSubPage(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-none font-bold text-[0.78rem] cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200'
                  }`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content with smooth page transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
