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

type Role = 'LANDING' | 'CLUB' | 'ATHLETE';

export default function App() {
  // Use localStorage for persistence
  const [currentRole, setCurrentRole] = useState<Role>(() =>
    (localStorage.getItem('eaf_currentRole') as Role) || 'LANDING'
  );
  const [clubSubPage, setClubSubPage] = useState('OVERVIEW');
  const [athleteSubPage, setAthleteSubPage] = useState('OVERVIEW');
  const [publicSubPage, setPublicSubPage] = useState('HOME');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eaf_darkMode') === 'true');

  const [clubs, setClubs] = useState(MOCK_CLUBS);
  const [athletes, setAthletes] = useState(() => {
    const saved = localStorage.getItem('eaf_athletes');
    return saved ? JSON.parse(saved) : MOCK_ATHLETES;
  });
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  const [currentClub, setCurrentClub] = useState(MOCK_CLUBS[0]);
  const [currentAthlete, setCurrentAthlete] = useState(() => {
    const savedId = localStorage.getItem('eaf_currentAthleteId');
    if (savedId) {
      const found = (localStorage.getItem('eaf_athletes') ? JSON.parse(localStorage.getItem('eaf_athletes')!) : MOCK_ATHLETES).find((a: any) => a.id === savedId);
      if (found) return found;
    }
    return MOCK_ATHLETES[0];
  });

  // Persist athletes data
  useEffect(() => {
    localStorage.setItem('eaf_athletes', JSON.stringify(athletes));
    if (currentAthlete) {
      const updatedAthlete = athletes.find((a: any) => a.id === currentAthlete.id);
      if (updatedAthlete && JSON.stringify(updatedAthlete) !== JSON.stringify(currentAthlete)) {
        setCurrentAthlete(updatedAthlete);
      }
    }
  }, [athletes, currentAthlete]);

  // Persist dark mode state to localStorage and document.documentElement class
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

  const handleRegisterSuccess = (registrationData: { type: 'CLUB' | 'ATHLETE'; payload: Record<string, any> }) => {
    setRegModalRole(null);
    if (registrationData.type === 'CLUB') {
      const newClub = registrationData.payload.club;
      setClubs((prev: any) => [newClub, ...prev]);
      setCurrentClub(newClub);
      setCurrentRole('CLUB');
      setClubSubPage('OVERVIEW');
      handleNotify(`Club "${newClub.shortName}" registered and logged in!`, 'success');
    } else {
      const newAthlete = registrationData.payload.athlete;
      setAthletes((prev: any) => [newAthlete, ...prev]);
      setCurrentAthlete(newAthlete);
      setCurrentRole('ATHLETE');
      setAthleteSubPage('OVERVIEW');
      handleNotify(`Athlete "${newAthlete.name}" registered successfully!`, 'success');
    }
  };

  const [navNonce, setNavNonce] = useState(0);

  const handleSwitchRoleDirectly = (targetRole: string) => {
    if (targetRole === 'LANDING' || targetRole === 'HOME') {
      setPublicSubPage('HOME');
      setNavNonce(prev => prev + 1);
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
      return;
    }
    setCurrentRole(targetRole as Role);
    if (targetRole === 'CLUB') setClubSubPage('OVERVIEW');
    else setAthleteSubPage('OVERVIEW');
    handleNotify(`Switched to ${targetRole === 'CLUB' ? 'Club Admin' : 'Athlete'} Portal`, 'info');
  };

  const handleAddAthlete = (newAthlete: any) => {
    setAthletes((prev: any) => [newAthlete, ...prev]);
    handleNotify(`Athlete "${newAthlete.name}" added to roster.`, 'success');
  };

  const handleAddClub = (newClub: any) => {
    setClubs((prev: any) => [newClub, ...prev]);
    handleNotify(`Club "${newClub.name}" registered!`, 'success');
  };

  const handleUpdateAthlete = (updated: any) => {
    setAthletes((prev: any) => prev.map((a: any) => a.id === updated.id ? updated : a));
    setCurrentAthlete(updated);
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
      setAthletes((prev: any) => prev.map(updater));
      if (currentAthlete.id === paymentData.athleteId) setCurrentAthlete(updater(currentAthlete));
    }
    handleNotify(`Payment via ${receipt.gateway} complete! Receipt: ${receipt.receiptNo}`, 'success');
    setPaymentData(null);
  };

  const handleInitiateTransfer = (newTransfer: any) => {
    setTransfers((prev: any) => [newTransfer, ...prev]);
    handleNotify(`Transfer for ${newTransfer.athleteName} submitted to EAF Registry.`, 'success');
  };

  // ── LANDING PAGE ──
  if (currentRole === 'LANDING' || (currentRole === 'ATHLETE' && publicSubPage !== 'DASHBOARD')) {
    const navLinks = [
      { label: 'Home', page: 'HOME' },
      { label: 'Competitions', page: 'COMPETITIONS' },
      { label: 'Athletes', page: 'ATHLETES' },
      { label: 'Media', page: 'MEDIA' },
    ];

    const handleNavClick = (page: string) => {
      setPublicSubPage(page);
      setNavNonce(prev => prev + 1);
      // Immediate scroll to top
      window.scrollTo(0, 0);
      // Also scroll after a delay to override any browser behavior
      setTimeout(() => window.scrollTo(0, 0), 50);
      setTimeout(() => window.scrollTo(0, 0), 150);
    };

    return (
      <div style={{ background: darkMode ? '#0D1117' : '#FFFFFF', minHeight: '100vh', transition: 'background-color 0.3s' }}>
        <header style={{
          background: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid ' + (darkMode ? '#1E293B' : '#E2E8F0'),
          boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '0px',
          margin: '0 auto',
          width: '100%',
          maxWidth: '100%',
          borderRadius: '0px',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          zIndex: 50,
          transition: 'all 0.3s ease'
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => handleNavClick('HOME')}
          >
            <div style={{ width: '44px', height: '44px', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0', padding: '2px' }}>
              <img
                src="/images/logo.jpeg"
                alt="EAF Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
              />
            </div>
            <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: darkMode ? '#F8FAFC' : '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Ethiopian Athletics Federation
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>
                የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                style={{
                  background: publicSubPage === link.page ? (darkMode ? '#1E293B' : '#F1F5F9') : 'none',
                  border: 'none', cursor: 'pointer',
                  color: publicSubPage === link.page ? 'var(--primary)' : (darkMode ? '#94A3B8' : '#64748B'),
                  fontWeight: 700, fontSize: '0.85rem',
                  padding: '8px 14px', borderRadius: '8px',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-sans)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = darkMode ? '#334155' : '#E2E8F0'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = publicSubPage === link.page ? (darkMode ? '#1E293B' : '#F1F5F9') : 'none'; e.currentTarget.style.color = publicSubPage === link.page ? 'var(--primary)' : (darkMode ? '#94A3B8' : '#64748B'); }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
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
            </button>

            {currentRole === 'ATHLETE' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  <button
                    onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); }}
                    className="btn-accent"
                    style={{
                      fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', cursor: 'pointer'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Dashboard
                  </button>
                )}
                <button
                  onClick={() => { localStorage.removeItem('eaf_currentRole'); setCurrentRole('LANDING'); }}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setRegModalRole('ATHLETE')}
                  className="btn-accent"
                  style={{
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', boxShadow: 'none', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  Register as Athlete
                </button>

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
                  Club Portal Login
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </button>
              </>
            )}
          </div>
        </header>

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
        onGoHome={() => handleSwitchRoleDirectly('LANDING')}
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
