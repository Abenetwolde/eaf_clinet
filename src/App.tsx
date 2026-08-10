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

import { MOCK_CLUBS, MOCK_ATHLETES, MOCK_TRANSFERS } from './data/mockData';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { Role, Club, Athlete, Transfer, Toast, PaymentData, PaymentReceipt, AuthModalConfig, LoginData } from './types';

export default function App() {
  // Use localStorage for persistence
  const [currentRole, setCurrentRole] = useState<Role>(() =>
    (localStorage.getItem('eaf_currentRole') as Role) || 'LANDING'
  );
  const [clubSubPage, setClubSubPage] = useState('OVERVIEW');
  const [athleteSubPage, setAthleteSubPage] = useState('OVERVIEW');
  const [publicSubPage, setPublicSubPage] = useState('HOME');
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eaf_darkMode') === 'true');

  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('eaf_athletes');
    return saved ? JSON.parse(saved) : MOCK_ATHLETES;
  });
  const [transfers, setTransfers] = useState<Transfer[]>(MOCK_TRANSFERS);

  const [currentClub, setCurrentClub] = useState<Club>(MOCK_CLUBS[0]);
  const [currentAthlete, setCurrentAthlete] = useState<Athlete>(() => {
    const savedId = localStorage.getItem('eaf_currentAthleteId');
    if (savedId) {
      const pool: Athlete[] = localStorage.getItem('eaf_athletes')
        ? JSON.parse(localStorage.getItem('eaf_athletes')!)
        : MOCK_ATHLETES;
      const found = pool.find((a) => a.id === savedId);
      if (found) return found;
    }
    return MOCK_ATHLETES[0];
  });

  // Persist athletes data
  useEffect(() => {
    localStorage.setItem('eaf_athletes', JSON.stringify(athletes));
    if (currentAthlete) {
      const updatedAthlete = athletes.find((a) => a.id === currentAthlete.id);
      if (updatedAthlete && JSON.stringify(updatedAthlete) !== JSON.stringify(currentAthlete)) {
        setCurrentAthlete(updatedAthlete);
      }
    }
  }, [athletes]);

  // Persist dark mode state
  useEffect(() => {
    localStorage.setItem('eaf_darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist session
  useEffect(() => {
    localStorage.setItem('eaf_currentRole', currentRole);
    if (currentRole === 'ATHLETE' && currentAthlete) {
      localStorage.setItem('eaf_currentAthleteId', currentAthlete.id);
    }
  }, [currentRole, currentAthlete]);

  const [authModalConfig, setAuthModalConfig] = useState<AuthModalConfig | null>(null);
  const [regModalRole, setRegModalRole] = useState<'CLUB' | 'ATHLETE' | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const handleNotify = (message: string, type: Toast['type'] = 'info') => setToast({ message, type });

  const handleOpenAuthModal = () => setAuthModalConfig({ isOpen: true });

  const handleLoginSuccess = (role: 'CLUB' | 'ATHLETE', data: LoginData) => {
    setAuthModalConfig(null);
    if (role === 'CLUB') {
      if (data.club) setCurrentClub(data.club);
      setCurrentRole('CLUB');
      setClubSubPage('OVERVIEW');
      handleNotify(`Welcome back, ${data.club?.shortName || 'Club Admin'}!`, 'success');
    } else {
      if (data.athlete) setCurrentAthlete(data.athlete);
      setCurrentRole('ATHLETE');
      setAthleteSubPage('OVERVIEW');
      handleNotify(`Welcome, ${data.athlete?.name || 'Athlete'}!`, 'success');
    }
  };

  const handleRegisterSuccess = (role: 'CLUB' | 'ATHLETE', data: LoginData) => {
    setRegModalRole(null);
    if (role === 'CLUB') {
      const newClub = data.club!;
      setClubs((prev) => [newClub, ...prev]);
      setCurrentClub(newClub);
      setCurrentRole('CLUB');
      setClubSubPage('OVERVIEW');
      handleNotify(`Club "${newClub.shortName}" registered and logged in!`, 'success');
    } else {
      const newAthlete = data.athlete!;
      setAthletes((prev) => [newAthlete, ...prev]);
      setCurrentAthlete(newAthlete);
      setCurrentRole('ATHLETE');
      setAthleteSubPage('OVERVIEW');
      handleNotify(`Athlete "${newAthlete.name}" registered successfully!`, 'success');
    }
  };

  const handleSwitchRoleDirectly = (targetRole: string) => {
    if (targetRole === 'LANDING') { setCurrentRole('LANDING'); return; }
    setCurrentRole(targetRole as Role);
    if (targetRole === 'CLUB') setClubSubPage('OVERVIEW');
    else setAthleteSubPage('OVERVIEW');
    handleNotify(`Switched to ${targetRole === 'CLUB' ? 'Club Admin' : 'Athlete'} Portal`, 'info');
  };

  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletes((prev) => [newAthlete, ...prev]);
    handleNotify(`Athlete "${newAthlete.name}" added to roster.`, 'success');
  };

  const handleAddClub = (newClub: Club) => {
    setClubs((prev) => [newClub, ...prev]);
    handleNotify(`Club "${newClub.name}" registered!`, 'success');
  };

  const handleUpdateAthlete = (updated: Athlete) => {
    setAthletes((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    setCurrentAthlete(updated);
    handleNotify('Profile data saved to local storage.', 'success');
  };

  const handleInitiateLicensePayment = (athleteObj: Athlete) => {
    setPaymentData({
      athleteId: athleteObj.id,
      athleteName: athleteObj.name,
      amount: 500,
      description: 'EAF Annual Athlete Licensing Fee (2026 Season)'
    });
  };

  const handlePaymentComplete = (receipt: PaymentReceipt) => {
    if (paymentData?.athleteId) {
      const licNo = 'EAF-LIC-2026-' + Math.floor(1000 + Math.random() * 9000);
      const updater = (a: Athlete) => a.id === paymentData.athleteId
        ? { ...a, licenseStatus: 'ACTIVE' as const, licenseNumber: licNo, licenseExpiry: '2026-12-31' }
        : a;
      setAthletes((prev) => prev.map(updater));
      if (currentAthlete.id === paymentData.athleteId) setCurrentAthlete(updater(currentAthlete));
    }
    handleNotify(`Payment via ${receipt.gateway} complete! Receipt: ${receipt.receiptNo}`, 'success');
    setPaymentData(null);
  };

  const handleInitiateTransfer = (newTransfer: Transfer) => {
    setTransfers((prev) => [newTransfer, ...prev]);
    handleNotify(`Transfer for ${newTransfer.athleteName} submitted to EAF Registry.`, 'success');
  };

  // ── LANDING PAGE ──
  if (currentRole === 'LANDING' || (currentRole === 'ATHLETE' && publicSubPage !== 'DASHBOARD')) {
    const navLinks = [
      { label: language === 'en' ? 'Home' : 'ዋና ገጽ', page: 'HOME' },
      { label: language === 'en' ? 'Competitions' : 'ውድድሮች', page: 'COMPETITIONS' },
      { label: language === 'en' ? 'Athletes' : 'አትሌቶች', page: 'ATHLETES' },
      { label: language === 'en' ? 'Media' : 'ሚዲያ', page: 'MEDIA' },
    ];

    const handleNavClick = (page: string) => {
      setPublicSubPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0D1117]' : 'bg-white'}`}>
        {/* ── Floating Glassmorphism Header ── */}
        <motion.header
          initial={{ y: -72 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className={`sticky top-0 z-50 px-6 h-[72px] flex items-center justify-between w-full transition-all duration-300
            ${darkMode
              ? 'bg-[rgba(15,23,42,0.9)] border-b border-[#1E293B] shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-[rgba(255,255,255,0.95)] border-b border-[#E2E8F0] shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
            }
            backdrop-blur-[16px]`}
        >
          {/* Logo + brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setPublicSubPage('HOME')}
          >
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-[#E2E8F0] p-0.5">
              <img
                src="/images/logo.jpeg"
                alt="EAF Logo"
                className="w-full h-full object-contain rounded-[6px]"
              />
            </div>
            <div className="hidden-mobile flex flex-col">
              <div className={`text-[0.95rem] font-black tracking-tight leading-tight ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                Ethiopian Athletics Federation
              </div>
              <div className="text-[0.65rem] text-primary font-black">
                የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
              </div>
            </div>
          </div>

          {/* Centre nav links */}
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <motion.button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`border-0 cursor-pointer font-bold text-[0.85rem] px-3.5 py-2 rounded-lg transition-all duration-200 font-sans
                  ${publicSubPage === link.page
                    ? `text-primary ${darkMode ? 'bg-[#1E293B]' : 'bg-[#F1F5F9]'}`
                    : `${darkMode ? 'text-[#94A3B8] hover:bg-[#334155]' : 'text-[#64748B] hover:bg-[#E2E8F0]'} bg-transparent`
                  }`}
              >
                {link.label}
                {publicSubPage === link.page && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="h-0.5 bg-primary mt-0.5 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex gap-3 items-center">

            {/* Modern Segmented Language Switcher */}
            <div className={`flex rounded-xl p-0.5 gap-0.5 items-center border
              ${darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}
            >
              {(['en', 'am'] as const).map((lang) => (
                <motion.button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  whileTap={{ scale: 0.95 }}
                  className={`border-0 rounded-[9px] px-3 py-1.5 text-[0.78rem] font-black cursor-pointer transition-all duration-200
                    ${language === lang
                      ? 'bg-primary text-white'
                      : `bg-transparent ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`
                    }`}
                >
                  {lang === 'en' ? 'EN' : 'አማ'}
                </motion.button>
              ))}
            </div>

            {/* Dark/Light Theme Toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border transition-all duration-200
                ${darkMode
                  ? 'bg-[#1E293B] border-[#334155] text-[#F1F5F9]'
                  : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]'
                }`}
            >
              {darkMode ? <Sun size={18} color="#FDE047" /> : <Moon size={18} color="#475569" />}
            </motion.button>

            {currentRole === 'ATHLETE' ? (
              <div className="flex gap-2 items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); }}
                  className="btn-accent text-[0.78rem] px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 border-0 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {language === 'en' ? 'My Dashboard' : 'ዳሽቦርድ'}
                </motion.button>
                <button
                  onClick={() => { localStorage.removeItem('eaf_currentRole'); setCurrentRole('LANDING'); }}
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
                  className="text-[0.78rem] px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 border-0 cursor-pointer text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  {language === 'en' ? 'Register as Athlete' : 'አትሌት ይመዝገቡ'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: '#F1F5F9' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenAuthModal}
                  className="text-[0.76rem] px-3 py-1.5 rounded-xl inline-flex items-center gap-1 cursor-pointer font-bold"
                  style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1' }}
                >
                  {language === 'en' ? 'Club Portal Login' : 'የክለብ መግቢያ'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </motion.button>
              </>
            )}
          </div>
        </motion.header>

        <style>{`
          @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
          }
        `}</style>

        <LandingPage
          language={language}
          publicSubPage={publicSubPage}
          onChangePublicSubPage={setPublicSubPage}
          darkMode={darkMode}
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
        currentRole={currentRole}
        activeSubPage={clubSubPage}
        onChangeSubPage={setClubSubPage}
        currentClub={currentClub}
        currentAthlete={currentAthlete}
        onSwitchRole={handleSwitchRoleDirectly}
        onLogout={() => {
          localStorage.removeItem('eaf_currentRole');
          setCurrentRole('LANDING');
        }}
      >
        {clubSubPage === 'OVERVIEW' && (
          <ClubOverview
            club={currentClub} athletes={athletes} transfers={transfers}
            onChangeSubPage={setClubSubPage} onNotify={handleNotify} onAddClub={handleAddClub}
          />
        )}
        {clubSubPage === 'ROSTER' && (
          <RosterManagement
            athletes={athletes} club={currentClub}
            onRenewLicense={handleInitiateLicensePayment}
            onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete}
          />
        )}
        {clubSubPage === 'MEETS' && (
          <MeetRegistration
            club={currentClub} athletes={athletes} onNotify={handleNotify}
          />
        )}
        {clubSubPage === 'SEEDING' && (
          <SeedingGenerator club={currentClub} onNotify={handleNotify} />
        )}
        {clubSubPage === 'TRANSFERS' && (
          <TransferRegistry
            transfers={transfers} currentClub={currentClub}
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
        onLogout={() => {
          localStorage.removeItem('eaf_currentRole');
          setCurrentRole('LANDING');
        }}
      >
        {athleteSubPage === 'OVERVIEW' && (
          <AthleteOverview
            athlete={currentAthlete}
            onChangeSubPage={setAthleteSubPage}
            onPayLicense={handleInitiateLicensePayment}
            onUpdateAthlete={handleUpdateAthlete}
          />
        )}
        {athleteSubPage === 'APPLIED' && (
          <AthleteApplications athlete={currentAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'PROFILE' && (
          <AthleteProfile athlete={currentAthlete} onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'NOTIFICATIONS' && (
          <AthleteNotifications athlete={currentAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'EVENTS' && (
          <AthleteEvents athlete={currentAthlete} onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
        )}
        {athleteSubPage === 'CHECKIN' && (
          <GeofenceCheckin athlete={currentAthlete} onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify} />
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
