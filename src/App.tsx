import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import RegistrationModal from './components/RegistrationModal';
import AppLayout from './components/Layout/AppLayout';
import ClientLayout from './components/Layout/ClientLayout';

import ClubOverview from './components/ClubAdmin/ClubOverview';
import RosterManagement from './components/ClubAdmin/RosterManagement';
import SeedingGenerator from './components/ClubAdmin/SeedingGenerator';
import TransferRegistry from './components/ClubAdmin/TransferRegistry';
import MeetRegistration from './components/ClubAdmin/MeetRegistration';
import RegisterMember from './components/ClubAdmin/RegisterMember';

import AthleteOverview from './components/Athlete/AthleteOverview';
import AthleteEvents from './components/Athlete/AthleteEvents';
import GeofenceCheckin from './components/Athlete/GeofenceCheckin';
import LiveRaceTracker from './components/Athlete/LiveRaceTracker';
import RecordsVault from './components/Athlete/RecordsVault';
import EventResults from './components/Athlete/EventResults';
import AthleteApplications from './components/Athlete/AthleteApplications';
import AthleteProfile from './components/Athlete/AthleteProfile';
import AthleteNotifications from './components/Athlete/AthleteNotifications';

import PaymentModal from './components/PaymentModal';
import NotificationToast from './components/NotificationToast';

import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, LanguageSelector } from './i18n';

import { useAppDispatch, useAppSelector } from './store/hooks';
import { setRole, setClub, setAthlete, logout, setAuthLoading, setUserData } from './store/slices/authSlice';
import { addAthlete, updateAthlete, setAthletes } from './store/slices/athleteSlice';
import { addClub, addTransfer } from './store/slices/clubSlice';
import { useLazyGetMeQuery, useLogoutApiMutation } from './store/api/authApi';
import { Athlete, Club, Transfer } from './types';

type Role = 'LANDING' | 'CLUB' | 'ATHLETE';

export default function App() {
  // Redux: auth session + shared data registries
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.role);
  const currentClub = useAppSelector((state) => state.auth.club);
  const currentAthlete = useAppSelector((state) => state.auth.athlete);
  const athletes = useAppSelector((state) => state.athletes);
  const authToken = useAppSelector((state) => state.auth.token);
  const userData = useAppSelector((state) => state.auth.userData);

  // API hooks
  const [fetchMe] = useLazyGetMeQuery();
  const [logoutApi] = useLogoutApiMutation();

  // Auto-login: validate saved token on mount
  useEffect(() => {
    if (authToken && currentRole !== 'LANDING') {
      dispatch(setAuthLoading());
      fetchMe()
        .unwrap()
        .then((res) => {
          if (res?.data) {
            dispatch(setUserData({
              id: res.data.id,
              email: res.data.email,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              phoneNumber: res.data.phoneNumber,
              status: res.data.status,
              roles: res.data.roles,
              permissions: res.data.permissions,
            }));
          }
        })
        .catch(() => {
          // Token invalid/expired — clear auth
          dispatch(logout());
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Local UI state
  const [clubSubPage, setClubSubPage] = useState('OVERVIEW');
  const [athleteSubPage, setAthleteSubPage] = useState('OVERVIEW');
  const [publicSubPage, setPublicSubPage] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('eaf_darkMode') === 'true';
    } catch {
      return false;
    }
  });

  // Persist athletes data
  useEffect(() => {
    try {
      localStorage.setItem('eaf_athletes', JSON.stringify(athletes));
    } catch (e) {}
    if (currentAthlete) {
      const updatedAthlete = athletes.find((a: any) => a.id === currentAthlete.id);
      if (updatedAthlete && JSON.stringify(updatedAthlete) !== JSON.stringify(currentAthlete)) {
        dispatch(setAthlete(updatedAthlete));
      }
    }
  }, [athletes, currentAthlete, dispatch]);

  // Persist dark mode state to localStorage and document.documentElement class
  useEffect(() => {
    try {
      localStorage.setItem('eaf_darkMode', String(darkMode));
    } catch (e) {}
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist active tab session
  useEffect(() => {
    try {
      sessionStorage.setItem('eaf_currentRole', currentRole);
      if (currentRole === 'ATHLETE' && currentAthlete) {
        sessionStorage.setItem('eaf_currentAthleteId', currentAthlete.id);
      }
    } catch (e) {}
  }, [currentRole, currentAthlete]);

  const handleLogout = () => {
    // Call logout API (fire-and-forget — it's stateless on the server)
    if (authToken) {
      logoutApi().catch(() => {});
    }
    try {
      sessionStorage.removeItem('eaf_currentRole');
      sessionStorage.removeItem('eaf_currentAthleteId');
      localStorage.removeItem('eaf_currentRole');
      localStorage.removeItem('eaf_currentAthleteId');
    } catch (e) {}
    dispatch(logout());
    setPublicSubPage('HOME');
  };

  // Listen for registration modal trigger from AuthModal
  useEffect(() => {
    const handleOpenRegistration = (e: any) => {
      setAuthModalConfig(null); // Close auth modal
      setRegModalRole(e.detail.role); // Open registration modal
    };
    window.addEventListener('openRegistrationModal', handleOpenRegistration);
    return () => window.removeEventListener('openRegistrationModal', handleOpenRegistration);
  }, []);

  const [authModalConfig, setAuthModalConfig] = useState<any>(null);
  const [regModalRole, setRegModalRole] = useState<'CLUB' | 'ATHLETE' | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  const handleNotify = (message: string, type = 'info') => setToast({ message, type });

  const handleOpenAuthModal = () => setAuthModalConfig({ isOpen: true });

  const handleLoginSuccess = (role: string, data: any) => {
    setAuthModalConfig(null);
    if (role === 'CLUB') {
      if (data.club) dispatch(setClub(data.club));
      dispatch(setRole('CLUB'));
      setClubSubPage('OVERVIEW');
      setPublicSubPage('DASHBOARD'); // Reset to dashboard so club admin sees their dashboard first
      handleNotify(`Welcome back, ${data.club?.shortName || 'Club Admin'}!`, 'success');
    } else {
      if (data.athlete) dispatch(setAthlete(data.athlete));
      dispatch(setRole('ATHLETE'));
      setAthleteSubPage('OVERVIEW');
      handleNotify(`Welcome, ${data.athlete?.name || 'Athlete'}!`, 'success');
    }
  };

  const handleRegisterSuccess = (registrationData: { type: 'CLUB' | 'ATHLETE'; payload: Record<string, any> }) => {
    setRegModalRole(null);
    if (registrationData.type === 'CLUB') {
      const newClub = registrationData.payload.club as Club;
      dispatch(addClub(newClub));
      dispatch(setClub(newClub));
      dispatch(setRole('CLUB'));
      setClubSubPage('OVERVIEW');
      setPublicSubPage('HOME');
      setNavNonce(prev => prev + 1);
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
      handleNotify(`Club "${newClub.shortName}" registered successfully! Welcome to EAF.`, 'success');
    } else {
      const newAthlete = registrationData.payload.athlete as Athlete;
      dispatch(addAthlete(newAthlete));
      dispatch(setAthlete(newAthlete));
      dispatch(setRole('ATHLETE'));
      setAthleteSubPage('OVERVIEW');
      setPublicSubPage('HOME');
      setNavNonce(prev => prev + 1);
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
      handleNotify(`Athlete "${newAthlete.name}" registered successfully! Welcome to EAF.`, 'success');
    }
  };

  const [navNonce, setNavNonce] = useState(0);

  const handleSwitchRoleDirectly = (targetRole: string) => {
    if (targetRole === 'LANDING' || targetRole === 'HOME') {
      dispatch(setRole('LANDING'));
      setPublicSubPage('HOME');
      setNavNonce(prev => prev + 1);
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
      return;
    }
    dispatch(setRole(targetRole as Role));
    if (targetRole === 'CLUB') setClubSubPage('OVERVIEW');
    else setAthleteSubPage('OVERVIEW');
    handleNotify(`Switched to ${targetRole === 'CLUB' ? 'Club Admin' : 'Athlete'} Portal`, 'info');
  };

  const handleAddAthlete = (newAthlete: Athlete) => {
    dispatch(addAthlete(newAthlete));
    handleNotify(`Athlete "${newAthlete.name}" added to roster.`, 'success');
  };

  const handleAddClub = (newClub: Club) => {
    dispatch(addClub(newClub));
    handleNotify(`Club "${newClub.name}" registered!`, 'success');
  };

  const handleUpdateAthlete = (updated: Athlete) => {
    dispatch(updateAthlete(updated));
    dispatch(setAthlete(updated));
    handleNotify('Profile data saved to local storage.', 'success');
  };

  const handleInitiateLicensePayment = (athleteObj: any) => {
    setPaymentData({
      athleteId: athleteObj.id,
      athleteName: athleteObj.name,
      amount: 500,
      description: 'EAF Annual Athlete Licensing Fee (2026 Season)'
    });
  };

  const handlePaymentComplete = (receipt: any) => {
    if (paymentData?.athleteId) {
      const licNo = 'EAF-LIC-2026-' + Math.floor(1000 + Math.random() * 9000);
      const updater = (a: any) => a.id === paymentData.athleteId
        ? { ...a, licenseStatus: 'ACTIVE', licenseNumber: licNo, licenseExpiry: '2026-12-31' }
        : a;
      dispatch(setAthletes(athletes.map(updater)));
      if (currentAthlete && currentAthlete.id === paymentData.athleteId) {
        dispatch(setAthlete(updater(currentAthlete)));
      }
    }
    handleNotify(`Payment via ${receipt.gateway} complete! Receipt: ${receipt.receiptNo}`, 'success');
    setPaymentData(null);
  };

  const handleInitiateTransfer = (newTransfer: Transfer) => {
    dispatch(addTransfer(newTransfer));
    handleNotify(`Transfer for ${newTransfer.athleteName} submitted to EAF Registry.`, 'success');
  };

  // ── LANDING PAGE ──
  if (currentRole === 'LANDING' ||
    (currentRole === 'ATHLETE' && publicSubPage !== 'DASHBOARD') ||
    (currentRole === 'CLUB' && publicSubPage !== 'DASHBOARD')) {
    const navLinks = [
      { label: t('nav.home'), page: 'HOME' },
      { label: t('nav.competitions'), page: 'COMPETITIONS' },
      { label: t('nav.athletes'), page: 'ATHLETES' },
      { label: t('nav.media'), page: 'MEDIA' },
    ];

    const handleNavClick = (page: string) => {
      setPublicSubPage(page);
      setMobileMenuOpen(false);
      setNavNonce(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0D1117]' : 'bg-white'}`}>
        {/* ── Floating Glassmorphism Header ── */}
        <motion.header
          initial={{ y: -72 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className={`sticky top-0 z-50 px-4 md:px-6 h-[64px] md:h-[72px] flex items-center justify-between w-full transition-all duration-300
            ${darkMode
              ? 'bg-[rgba(15,23,42,0.92)] border-b border-[#1E293B] shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-[rgba(255,255,255,0.96)] border-b border-[#E2E8F0] shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
            }
            backdrop-blur-[16px]`}
        >
          {/* Logo + brand */}
          <div
            className="flex items-center gap-[clamp(0.4rem,0.8vw,0.75rem)] cursor-pointer min-w-0 shrink-0"
            onClick={() => handleNavClick('HOME')}
          >
            <div className="w-[clamp(2.1rem,3.4vw,2.75rem)] h-[clamp(2.1rem,3.4vw,2.75rem)] bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-[#E2E8F0] p-0.5">
              <img
                src="/images/logo.jpeg"
                alt="EAF Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className={`text-[clamp(0.72rem,1.15vw,0.95rem)] font-black tracking-tight leading-tight whitespace-nowrap ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                Ethiopian Athletics Federation
              </div>
              <div className="text-[clamp(0.52rem,0.78vw,0.65rem)] text-primary font-black whitespace-nowrap">
                የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
              </div>
            </div>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden min-[1186px]:flex items-center gap-[clamp(0.1rem,0.4vw,0.375rem)] min-w-0 shrink">
            {navLinks.map((link) => (
              <motion.button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`border-0 cursor-pointer font-bold text-[clamp(0.75rem,1vw,0.85rem)] px-[clamp(0.4rem,0.8vw,0.875rem)] py-2 rounded-lg transition-all duration-200 font-sans whitespace-nowrap
                  ${publicSubPage === link.page
                    ? `text-primary ${darkMode ? 'bg-[#1E293B]' : 'bg-[#F1F5F9]'}`
                    : `${darkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#E2E8F0]'} bg-transparent`
                  }`}
              >
                {link.label}
              </motion.button>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden min-[1186px]:flex gap-[clamp(0.35rem,0.7vw,0.75rem)] items-center shrink-0">
            {/* 4-Language Switcher */}
            <LanguageSelector variant={darkMode ? 'dark' : 'default'} />

            {/* Dark/Light Theme Toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: darkMode ? '#1E293B' : '#F1F5F9',
                border: '1px solid ' + (darkMode ? '#334155' : '#E2E8F0'),
                color: darkMode ? '#F1F5F9' : '#0F172A',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {darkMode ? <Sun size={18} color="#FDE047" /> : <Moon size={18} color="#475569" />}
            </motion.button>

            {currentRole === 'ATHLETE' ? (
              <div className="flex gap-2 items-center">
                {publicSubPage === 'DASHBOARD' ? (
                  <button
                    onClick={() => handleNavClick('HOME')}
                    style={{
                      fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Back to Home
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); }}
                    className="btn-accent text-[0.78rem] px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 border-0 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {t('nav.myDashboard')}
                  </motion.button>
                )}
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer text-[0.78rem] font-bold border
                    ${darkMode ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8]' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]'}`}
                >
                  Logout
                </button>
              </div>
            ) : currentRole === 'CLUB' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setClubSubPage('OVERVIEW');
                    setPublicSubPage('DASHBOARD');
                  }}
                  className="btn-accent"
                  style={{
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                  My Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer text-[0.78rem] font-bold border
                    ${darkMode ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8]' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRegModalRole('ATHLETE')}
                  className="btn-accent"
                  style={{
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', boxShadow: 'none', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  {t('nav.registerAsAthlete')}
                </motion.button>

                <button
                  onClick={handleOpenAuthModal}
                  className="btn-gov-secondary"
                  style={{
                    fontSize: '0.76rem', padding: '7px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {t('nav.clubPortalLogin')}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Language Selector + Hamburger Toggle */}
          <div className="flex min-[1186px]:hidden items-center gap-2">
            <LanguageSelector variant={darkMode ? 'dark' : 'default'} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border transition-colors
                ${darkMode ? 'bg-[#1E293B] border-[#334155] text-white' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]'}`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.header>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`min-[1186px]:hidden sticky top-[64px] z-40 px-4 py-4 border-b flex flex-col gap-3 backdrop-blur-xl shadow-xl overflow-hidden
                ${darkMode ? 'bg-[rgba(15,23,42,0.98)] border-[#1E293B] text-white' : 'bg-white/98 border-[#E2E8F0] text-[#0F172A]'}`}
            >
              {/* Nav links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.page)}
                    className={`text-left px-3.5 py-2.5 rounded-xl font-bold text-[0.9rem] transition-colors border-0 cursor-pointer ${
                      publicSubPage === link.page
                        ? 'bg-primary text-white'
                        : darkMode ? 'text-[#CBD5E1] bg-transparent hover:bg-[#1E293B]' : 'text-[#475569] bg-transparent hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className={`h-px my-1 ${darkMode ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}`} />

              {/* Actions & Theme toggle */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold opacity-75">Theme</span>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold border cursor-pointer ${
                      darkMode ? 'bg-[#1E293B] border-[#334155] text-white' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  >
                    {darkMode ? <Sun size={14} color="#FDE047" /> : <Moon size={14} color="#475569" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

                {currentRole === 'ATHLETE' ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); setMobileMenuOpen(false); }}
                      className="w-full btn-accent text-[0.85rem] py-2.5 rounded-xl inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className={`w-full py-2 rounded-xl cursor-pointer text-[0.85rem] font-bold border text-center ${
                        darkMode ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8]' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setRegModalRole('ATHLETE'); setMobileMenuOpen(false); }}
                      className="w-full text-[0.85rem] py-2.5 rounded-xl inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
                    >
                      {t('nav.registerAsAthlete')}
                    </button>
                    <button
                      onClick={() => { handleOpenAuthModal(); setMobileMenuOpen(false); }}
                      className="w-full text-[0.85rem] py-2.5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer font-bold bg-white text-[#0F172A] border border-[#CBD5E1]"
                    >
                      {t('nav.clubPortalLogin')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
          }
        `}</style>

        <LandingPage
          publicSubPage={publicSubPage}
          onChangePublicSubPage={setPublicSubPage}
          darkMode={darkMode}
          currentRole={currentRole}
          currentAthlete={currentAthlete}
          onLoginSuccess={handleLoginSuccess}
          navNonce={navNonce}
          onSelectRole={(role: string) => {
            if (role === 'CLUB') handleLoginSuccess('CLUB', { club: currentClub });
            else handleLoginSuccess('ATHLETE', { athlete: currentAthlete });
          }}
          onRegister={(role: 'CLUB' | 'ATHLETE') => setRegModalRole(role)}
        />

        {authModalConfig?.isOpen && (
          <AuthModal onClose={() => setAuthModalConfig(null)} onLoginSuccess={handleLoginSuccess} />
        )}

        {regModalRole && (
          <RegistrationModal
            role={regModalRole}
            onClose={() => setRegModalRole(null)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        <NotificationToast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // ── AUTHENTICATED APP ──
  const sharedModals = (
    <>
      {paymentData && (
        <PaymentModal
          paymentData={paymentData}
          onClose={() => setPaymentData(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </>
  );

  if (currentRole === 'CLUB') {
    return (
      <AppLayout
        activeSubPage={clubSubPage}
        onChangeSubPage={setClubSubPage}
        onSwitchRole={handleSwitchRoleDirectly}
        onLogout={handleLogout}
      >
        {clubSubPage === 'OVERVIEW' && (
          <ClubOverview
            onChangeSubPage={setClubSubPage} onNotify={handleNotify} onAddClub={handleAddClub}
          />
        )}
        {clubSubPage === 'REGISTER_MEMBER' && (
          <RegisterMember
            onBack={() => setClubSubPage('OVERVIEW')}
            onNotify={handleNotify}
            onAddAthlete={handleAddAthlete}
          />
        )}
        {clubSubPage === 'ROSTER' && (
          <RosterManagement
            onRenewLicense={handleInitiateLicensePayment}
            onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete}
          />
        )}
        {clubSubPage === 'MEETS' && (
          <MeetRegistration
            onNotify={handleNotify}
          />
        )}
        {clubSubPage === 'SEEDING' && (
          <SeedingGenerator onNotify={handleNotify} />
        )}
        {clubSubPage === 'TRANSFERS' && (
          <TransferRegistry
            onInitiateTransfer={handleInitiateTransfer}
          />
        )}
        {sharedModals}
      </AppLayout>
    );
  }

  if (currentRole === 'ATHLETE') {
    return (
      <ClientLayout
        activeSubPage={athleteSubPage}
        onChangeSubPage={setAthleteSubPage}
        currentAthlete={currentAthlete}
        onLogout={handleLogout}
        onGoHome={() => handleSwitchRoleDirectly('LANDING')}
        onBackToLanding={() => setPublicSubPage('HOME')}
      >
        {athleteSubPage === 'OVERVIEW' && (
          <AthleteOverview
            onChangeSubPage={setAthleteSubPage}
            onPayLicense={handleInitiateLicensePayment}
            onUpdateAthlete={handleUpdateAthlete}
          />
        )}
        {athleteSubPage === 'APPLIED' && (
          <AthleteApplications onNotify={handleNotify} />
        )}
        {athleteSubPage === 'PROFILE' && (
          <AthleteProfile onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'NOTIFICATIONS' && (
          <AthleteNotifications onNotify={handleNotify} />
        )}
        {athleteSubPage === 'EVENTS' && (
          <AthleteEvents onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'CHECKIN' && (
          <GeofenceCheckin onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'RACES' && (
          <LiveRaceTracker athlete={currentAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'RESULTS' && (
          <EventResults onNotify={handleNotify} />
        )}
        {athleteSubPage === 'RECORDS' && (
          <RecordsVault athlete={currentAthlete} onNotify={handleNotify} />
        )}
        {sharedModals}
      </ClientLayout>
    );
  }

  return null;
}
