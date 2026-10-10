import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import RegistrationModal from './components/RegistrationModal';
import FaydaVerifiedProfileModal, { FaydaResidentIdentity, formatFin } from './components/FaydaVerifiedProfileModal';
import RBACSecurityMatrix from './components/Security/RBACSecurityMatrix';
import Callback from './components/Callback';
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
import AntiDopingHub from './components/AntiDopingHub';
import ProfessionalsRegistry from './components/ProfessionalsRegistry';
import RegionalFederationsHub from './components/RegionalFederationsHub';
import AthleteRepresentativesHub from './components/AthleteRepresentativesHub';
import NotificationToast from './components/NotificationToast';

import { Sun, Moon, Menu, X, ShieldCheck, Sparkles, ArrowRight, UserCheck, Eye, CheckCircle2, User, Building2 } from 'lucide-react';
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
  // Dedicated VeriFayda 2.0 (eSignet) OIDC callback route adapted from oidc-test-app
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/callback')) {
    return <Callback />;
  }

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
            if (res.data.athlete) {
              dispatch(setAthlete(res.data.athlete));
            }
            if (res.data.club) {
              dispatch(setClub(res.data.club));
            }
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

  const handleClearNationalId = () => {
    try {
      sessionStorage.removeItem('eaf_fayda_verified');
      sessionStorage.removeItem('fayda_auth_payload');
      sessionStorage.removeItem('fayda_photo');
      sessionStorage.removeItem('fayda_token');
      localStorage.removeItem('fayda_auth_payload');
      localStorage.removeItem('fayda_photo');
      localStorage.removeItem('fayda_token');
      localStorage.removeItem('eaf_fayda_verified');
    } catch (e) {}
    setVerifiedCitizen(null);
    setShowCitizenModal(false);
    handleNotify('National ID session logged out successfully.', 'info');
  };

  const handleLogout = () => {
    // Call logout API (fire-and-forget — it's stateless on the server)
    if (authToken) {
      logoutApi().catch(() => {});
    }
    try {
      sessionStorage.removeItem('eaf_currentRole');
      sessionStorage.removeItem('eaf_currentAthleteId');
      sessionStorage.removeItem('eaf_fayda_verified');
      sessionStorage.removeItem('fayda_auth_payload');
      sessionStorage.removeItem('fayda_photo');
      sessionStorage.removeItem('fayda_token');
      localStorage.removeItem('eaf_currentRole');
      localStorage.removeItem('eaf_currentAthleteId');
      localStorage.removeItem('fayda_auth_payload');
      localStorage.removeItem('fayda_photo');
      localStorage.removeItem('fayda_token');
      localStorage.removeItem('eaf_fayda_verified');
    } catch (e) {}
    dispatch(logout());
    setVerifiedCitizen(null);
    setShowCitizenModal(false);
    setPublicSubPage('HOME');
    handleNotify('Logged out successfully.', 'info');
  };

  // Check for returning from Fayda verification or callback & load verified identity
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let payload: any = null;
      try {
        const raw = localStorage.getItem('fayda_auth_payload') || sessionStorage.getItem('fayda_auth_payload') || sessionStorage.getItem('eaf_fayda_verified');
        if (raw) payload = JSON.parse(raw);
      } catch (e) {}

      const ident = payload?.identity || payload || {};
      const nin = ident.nin || ident.fin || urlParams.get('nin');
      const name = ident.fullName || ident.name || urlParams.get('name');
      const nameAmh = ident.fullNameAmharic || ident.amharic || urlParams.get('nameAmh') || name;
      const dob = ident.birthDate || ident.dob || urlParams.get('dob') || '1980-12-01';
      const gender = (ident.gender || urlParams.get('gender') || 'MALE').toUpperCase();
      const phone = ident.phoneNumber || ident.phone || urlParams.get('phone') || '0909090909';
      const email = ident.email || urlParams.get('email') || 'chere@id.et';
      const address = ident.address || ident.region || 'Addis Ababa / Federal';
      const picture = ident.picture || ident.photoUrl || urlParams.get('photoUrl') || localStorage.getItem('fayda_photo') || sessionStorage.getItem('fayda_photo') || '/images/fayda_resident_photo.jpg';
      const token = urlParams.get('token') || payload?.verificationToken || ident.verificationToken;

      if (nin && name) {
        const dobYear = dob ? parseInt(dob.substring(0, 4)) : 1980;
        const age = 2026 - (isNaN(dobYear) ? 1980 : dobYear);
        const ageTier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : age >= 35 ? `Masters Division (${age} yrs)` : 'Senior Division';
        const citizenObj: FaydaResidentIdentity = {
          nin,
          fullName: name,
          fullNameAmharic: nameAmh,
          birthDate: dob,
          gender: gender === 'MALE' ? 'Male' : 'Female',
          phoneNumber: phone,
          email,
          address,
          picture,
          verificationToken: token,
          verifiedAt: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
          ageTier,
          hash: '0xFAYDA_' + nin.replace(/\D/g, '').slice(-6),
        };
        setVerifiedCitizen(citizenObj);

        try {
          const serialized = JSON.stringify({
            name,
            amharic: nameAmh,
            dob,
            gender: gender === 'MALE' ? 'Male' : 'Female',
            blood: 'O+',
            region: address,
            photoUrl: picture,
            ageTier,
            fin: nin,
            hash: citizenObj.hash,
            verificationDate: citizenObj.verifiedAt,
            phoneNumber: phone,
            email,
            address,
            verificationToken: token,
          });
          sessionStorage.setItem('eaf_fayda_verified', serialized);
          localStorage.setItem('eaf_fayda_verified', serialized);
          localStorage.setItem('fayda_auth_payload', JSON.stringify({ identity: citizenObj, verificationToken: token }));
        } catch (e) {}
      }

      const isCurrentlyAuth = Boolean(
        localStorage.getItem('token') ||
        localStorage.getItem('eaf_token') ||
        sessionStorage.getItem('eaf_currentRole') === 'ATHLETE' ||
        sessionStorage.getItem('eaf_currentRole') === 'CLUB' ||
        localStorage.getItem('eaf_registered_athlete')
      );
      if (
        urlParams.get('openReg') === 'ATHLETE' ||
        urlParams.get('faydaVerified') === 'true' ||
        urlParams.get('faydaSuccess') === 'true' ||
        window.location.pathname.startsWith('/register')
      ) {
        if (!isCurrentlyAuth) {
          setRegModalRole('ATHLETE');
        } else {
          window.history.replaceState({}, '', '/');
        }
      }
      if (urlParams.get('faydaSuccess') === 'true' || urlParams.get('token')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Listen for registration modal trigger from AuthModal
  useEffect(() => {
    const handleOpenRegistration = (e: any) => {
      if (isLoggedIn) {
        setPublicSubPage('DASHBOARD');
        handleNotify('You are already logged in to your portal.', 'info');
        return;
      }
      setAuthModalConfig(null); // Close auth modal
      setRegModalRole(e.detail.role); // Open registration modal
    };
    window.addEventListener('openRegistrationModal', handleOpenRegistration);
    return () => window.removeEventListener('openRegistrationModal', handleOpenRegistration);
  }, []);

  const [authModalConfig, setAuthModalConfig] = useState<any>(null);
  const [regModalRole, setRegModalRole] = useState<'CLUB' | 'ATHLETE' | null>(null);
  const [verifiedCitizen, setVerifiedCitizen] = useState<FaydaResidentIdentity | null>(null);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showRbacMatrix, setShowRbacMatrix] = useState(false);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  // Compute actual backend registration status
  const registeredInfo = (() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('eaf_registered_athlete');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  })();

  const isUserRegistered = Boolean(
    (currentRole === 'ATHLETE' && currentAthlete) ||
    (currentRole === 'CLUB' && currentClub) ||
    Boolean((userData as any)?.isRegistered && (userData as any)?.status === 'ACTIVE') ||
    Boolean(registeredInfo?.isRegistered && registeredInfo?.athleteId)
  );

  const isLoggedIn = Boolean(
    (authToken && (currentRole === 'ATHLETE' || currentRole === 'CLUB')) ||
    currentRole === 'ATHLETE' ||
    currentRole === 'CLUB' ||
    Boolean(currentAthlete) ||
    Boolean(currentClub) ||
    isUserRegistered
  );

  const rawStatus = (userData as any)?.registrationStatus || registeredInfo?.status;
  const registeredStatusText = (() => {
    if (!rawStatus) return isUserRegistered ? 'Active / Registered' : null;
    const upper = String(rawStatus).toUpperCase();
    if (upper === 'DRAFT') {
      // Never show Draft to users!
      return null;
    }
    if (upper === 'PENDING' || upper === 'PENDING_APPROVAL' || upper === 'SUBMITTED') {
      return 'Registration Under Review';
    }
    if (upper === 'FAYDA_VERIFIED') {
      return 'Verified';
    }
    if (upper === 'ACTIVE' || upper === 'APPROVED') {
      return 'Active';
    }
    return rawStatus;
  })();

  // User profile avatar only created and activated when registration is complete
  const userProfileAvatar = isUserRegistered
    ? (currentAthlete?.photoUrl || registeredInfo?.photoUrl || (typeof window !== 'undefined' ? localStorage.getItem('eaf_user_avatar') : null) || '/images/runner_female.png')
    : null;

  const handleNotify = (message: string, type = 'info') => setToast({ message, type });

  const handleOpenAuthModal = () => {
    if (isLoggedIn) {
      setPublicSubPage('DASHBOARD');
      handleNotify('You are already logged in to your portal.', 'info');
      return;
    }
    setAuthModalConfig({ isOpen: true });
  };

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

  const handleRegisterSuccess = (registrationData: { type: 'CLUB' | 'ATHLETE' | 'OFFICIAL'; payload: Record<string, any> }) => {
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
    } else if (registrationData.type === 'ATHLETE') {
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
    } else {
      setPublicSubPage('PROFESSIONALS');
      setNavNonce(prev => prev + 1);
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
      handleNotify('Accreditation registered successfully in the official EAF National Registry.', 'success');
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
      { label: 'Anti-Doping', page: 'ANTI_DOPING' },
      { label: 'Professionals', page: 'PROFESSIONALS' },
      { label: 'Regional Hub', page: 'REGIONS' },
      { label: 'Representatives', page: 'REPRESENTATIVES' },
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`border-0 cursor-pointer font-extrabold text-[clamp(0.78rem,1vw,0.85rem)] px-[clamp(0.5rem,0.9vw,0.95rem)] py-2 rounded-full transition-all duration-200 font-sans whitespace-nowrap
                  ${publicSubPage === link.page
                    ? `${darkMode ? 'bg-slate-800 text-white font-black' : 'bg-slate-100 text-slate-900 font-black'}`
                    : `${darkMode ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'} bg-transparent`
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

            {currentRole === 'ATHLETE' || (isLoggedIn && currentRole !== 'CLUB') ? (
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
                    onClick={() => {
                      if (currentRole !== 'ATHLETE') dispatch(setRole('ATHLETE'));
                      setAthleteSubPage('OVERVIEW');
                      setPublicSubPage('DASHBOARD');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 transition-all cursor-pointer shadow-sm group"
                    title="Access Verified Athlete Portal"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shrink-0 shadow-sm relative bg-slate-800 flex items-center justify-center">
                      {userProfileAvatar ? (
                        <img
                          src={userProfileAvatar}
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[0.78rem] font-black text-white leading-tight group-hover:text-emerald-200 truncate max-w-[120px]">
                        {(verifiedCitizen?.fullName || currentAthlete?.name || 'Athlete').split(' ')[0]}
                      </span>
                      <span className="text-[0.62rem] font-extrabold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Verified ID
                      </span>
                    </div>
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
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setClubSubPage('OVERVIEW');
                    setPublicSubPage('DASHBOARD');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 transition-all cursor-pointer shadow-sm group"
                  title="Access Club Admin Portal"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shrink-0 shadow-sm relative bg-slate-800 flex items-center justify-center">
                    {userProfileAvatar ? (
                      <img
                        src={userProfileAvatar}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={14} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[0.78rem] font-black text-white leading-tight group-hover:text-emerald-200 truncate max-w-[120px]">
                      {(verifiedCitizen?.fullName || currentClub?.manager || 'Club President').split(' ')[0]}
                    </span>
                    <span className="text-[0.62rem] font-extrabold text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 size={9} /> Verified ID
                    </span>
                  </div>
                </motion.button>
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
                {verifiedCitizen && !isUserRegistered && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>ID Verified · Incomplete Registration</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegModalRole('ATHLETE')}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer border-0"
                    >
                      Complete Registration
                    </button>
                    <button
                      type="button"
                      onClick={handleClearNationalId}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      title="Clear National ID session"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenAuthModal}
                className="btn-accent"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '8px 18px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#0F172A',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Portal Login
              </motion.button>
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
                      className="w-full p-2.5 rounded-xl flex items-center justify-between border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-slate-800 flex items-center justify-center">
                          {userProfileAvatar ? (
                            <img
                              src={userProfileAvatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-white">{verifiedCitizen?.fullName || currentAthlete?.name || 'Athlete'}</div>
                          <div className="text-[0.68rem] text-emerald-400 font-bold">✓ Verified National ID Portal</div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-white bg-emerald-600 px-2.5 py-1 rounded-lg">Enter →</span>
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
                    {verifiedCitizen && !isUserRegistered && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">ID Verified</span>
                            <span className="text-[10px] text-slate-500">Registration incomplete</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => { setRegModalRole('ATHLETE'); setMobileMenuOpen(false); }}
                            className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg border-0 cursor-pointer"
                          >
                            Register
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleClearNationalId(); setMobileMenuOpen(false); }}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoggedIn ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            if (currentRole !== 'ATHLETE' && currentRole !== 'CLUB') {
                              dispatch(setRole('ATHLETE'));
                            }
                            setPublicSubPage('DASHBOARD');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl flex items-center justify-between border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span className="text-xs font-bold text-white">Go to {currentRole === 'CLUB' ? 'Club' : 'Athlete'} Portal</span>
                          </div>
                          <span className="text-xs font-black text-white bg-emerald-600 px-2 py-0.5 rounded-md">Open →</span>
                        </button>
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="w-full py-2 rounded-xl cursor-pointer text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRegModalRole('ATHLETE');
                            setMobileMenuOpen(false);
                            window.history.pushState(null, '', '/register');
                          }}
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
                      </>
                    )}
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

        {regModalRole && !isLoggedIn ? (
          <RegistrationModal
            role={regModalRole}
            verifiedIdentity={verifiedCitizen}
            onClose={() => {
              setRegModalRole(null);
              window.history.pushState(null, '', '/');
            }}
            onRegisterSuccess={handleRegisterSuccess}
          />
        ) : publicSubPage === 'ANTI_DOPING' ? (
          <AntiDopingHub darkMode={darkMode} />
        ) : publicSubPage === 'PROFESSIONALS' ? (
          <ProfessionalsRegistry darkMode={darkMode} />
        ) : publicSubPage === 'REGIONS' ? (
          <RegionalFederationsHub darkMode={darkMode} />
        ) : publicSubPage === 'REPRESENTATIVES' ? (
          <AthleteRepresentativesHub darkMode={darkMode} />
        ) : (
          <LandingPage
            publicSubPage={publicSubPage}
            onChangePublicSubPage={setPublicSubPage}
            darkMode={darkMode}
            currentRole={currentRole}
            currentAthlete={currentAthlete}
            onLoginSuccess={handleLoginSuccess}
            navNonce={navNonce}
            isRegistered={isLoggedIn || isUserRegistered}
            registeredStatus={registeredStatusText}
            isLoggedIn={isLoggedIn}
            onSelectRole={(role: string) => {
              if (role === 'CLUB') handleLoginSuccess('CLUB', { club: currentClub });
              else handleLoginSuccess('ATHLETE', { athlete: currentAthlete });
            }}
            onRegister={(role: 'CLUB' | 'ATHLETE') => {
              setRegModalRole(role);
              window.history.pushState(null, '', '/register');
            }}
          />
        )}

        {authModalConfig?.isOpen && !isLoggedIn && (
          <AuthModal
            onClose={() => setAuthModalConfig(null)}
            onLoginSuccess={handleLoginSuccess}
            onOpenRegistration={() => {
              setAuthModalConfig(null);
              setRegModalRole('ATHLETE');
              window.history.pushState(null, '', '/register');
            }}
          />
        )}

        <NotificationToast toast={toast} onClose={() => setToast(null)} />

        {showCitizenModal && verifiedCitizen && (
          <FaydaVerifiedProfileModal
            isOpen={showCitizenModal}
            onClose={() => setShowCitizenModal(false)}
            identity={verifiedCitizen}
            onContinueRegistration={() => {
              setShowCitizenModal(false);
              setRegModalRole('ATHLETE');
            }}
          />
        )}
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
      {showCitizenModal && verifiedCitizen && (
        <FaydaVerifiedProfileModal
          isOpen={showCitizenModal}
          onClose={() => setShowCitizenModal(false)}
          identity={verifiedCitizen}
        />
      )}
      {regModalRole && (
        <RegistrationModal
          role={regModalRole}
          verifiedIdentity={verifiedCitizen}
          onClose={() => setRegModalRole(null)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      <RBACSecurityMatrix isOpen={showRbacMatrix} onClose={() => setShowRbacMatrix(false)} />
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
        {clubSubPage === 'RBAC' && (
          <RBACSecurityMatrix
            isOpen={true}
            isInline={true}
            onClose={() => setClubSubPage('OVERVIEW')}
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
