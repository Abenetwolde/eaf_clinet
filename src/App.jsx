import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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

export default function App() {
  // Use localStorage for persistence
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('eaf_currentRole') || 'LANDING');
  const [clubSubPage, setClubSubPage] = useState('OVERVIEW');
  const [athleteSubPage, setAthleteSubPage] = useState('OVERVIEW');
  const [publicSubPage, setPublicSubPage] = useState('HOME'); // 'HOME' | 'COMPETITIONS' | 'ATHLETES' | 'MEDIA'
  const [language, setLanguage] = useState('en'); // 'en' | 'am'
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);

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
      // Re-hydrate the currentAthlete from the potentially updated athletes array
      const found = (localStorage.getItem('eaf_athletes') ? JSON.parse(localStorage.getItem('eaf_athletes')) : MOCK_ATHLETES).find(a => a.id === savedId);
      if (found) return found;
    }
    return MOCK_ATHLETES[0];
  });

  // Persist athletes data
  useEffect(() => {
    localStorage.setItem('eaf_athletes', JSON.stringify(athletes));
    if (currentAthlete) {
      // Keep currentAthlete in sync with the athletes array
      const updatedAthlete = athletes.find(a => a.id === currentAthlete.id);
      if (updatedAthlete && JSON.stringify(updatedAthlete) !== JSON.stringify(currentAthlete)) {
        setCurrentAthlete(updatedAthlete);
      }
    }
  }, [athletes]);

  // Persist session
  useEffect(() => {
    localStorage.setItem('eaf_currentRole', currentRole);
    if (currentRole === 'ATHLETE' && currentAthlete) {
      localStorage.setItem('eaf_currentAthleteId', currentAthlete.id);
    }
  }, [currentRole, currentAthlete]);

  const [authModalConfig, setAuthModalConfig] = useState(null);
  const [regModalRole, setRegModalRole] = useState(null); // 'CLUB' | 'ATHLETE' | null
  const [paymentData, setPaymentData] = useState(null);
  const [toast, setToast] = useState(null);

  const handleNotify = (message, type = 'info') => setToast({ message, type });

  const handleOpenAuthModal = () => setAuthModalConfig({ isOpen: true });

  const handleLoginSuccess = (role, data) => {
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

  // Called from RegistrationModal on successful registration
  const handleRegisterSuccess = (role, data) => {
    setRegModalRole(null);
    if (role === 'CLUB') {
      const newClub = data.club;
      setClubs(prev => [newClub, ...prev]);
      setCurrentClub(newClub);
      setCurrentRole('CLUB');
      setClubSubPage('OVERVIEW');
      handleNotify(`Club "${newClub.shortName}" registered and logged in!`, 'success');
    } else {
      const newAthlete = data.athlete;
      setAthletes(prev => [newAthlete, ...prev]);
      setCurrentAthlete(newAthlete);
      setCurrentRole('ATHLETE');
      setAthleteSubPage('OVERVIEW');
      handleNotify(`Athlete "${newAthlete.name}" registered successfully!`, 'success');
    }
  };

  const handleSwitchRoleDirectly = (targetRole) => {
    if (targetRole === 'LANDING') { setCurrentRole('LANDING'); return; }
    setCurrentRole(targetRole);
    if (targetRole === 'CLUB') setClubSubPage('OVERVIEW');
    else setAthleteSubPage('OVERVIEW');
    handleNotify(`Switched to ${targetRole === 'CLUB' ? 'Club Admin' : 'Athlete'} Portal`, 'info');
  };

  const handleAddAthlete = (newAthlete) => {
    setAthletes(prev => [newAthlete, ...prev]);
    handleNotify(`Athlete "${newAthlete.name}" added to roster.`, 'success');
  };

  const handleAddClub = (newClub) => {
    setClubs(prev => [newClub, ...prev]);
    handleNotify(`Club "${newClub.name}" registered!`, 'success');
  };

  const handleUpdateAthlete = (updated) => {
    setAthletes(prev => prev.map(a => a.id === updated.id ? updated : a));
    setCurrentAthlete(updated);
    handleNotify('Profile data saved to local storage.', 'success');
  };

  const handleInitiateLicensePayment = (athleteObj) => {
    setPaymentData({
      athleteId: athleteObj.id,
      athleteName: athleteObj.name,
      amount: 500,
      description: 'EAF Annual Athlete Licensing Fee (2026 Season)'
    });
  };

  const handlePaymentComplete = (receipt) => {
    if (paymentData?.athleteId) {
      const licNo = 'EAF-LIC-2026-' + Math.floor(1000 + Math.random() * 9000);
      const updater = a => a.id === paymentData.athleteId
        ? { ...a, licenseStatus: 'ACTIVE', licenseNumber: licNo, licenseExpiry: '2026-12-31' }
        : a;
      setAthletes(prev => prev.map(updater));
      if (currentAthlete.id === paymentData.athleteId) setCurrentAthlete(updater(currentAthlete));
    }
    handleNotify(`Payment via ${receipt.gateway} complete! Receipt: ${receipt.receiptNo}`, 'success');
    setPaymentData(null);
  };

  const handleInitiateTransfer = (newTransfer) => {
    setTransfers(prev => [newTransfer, ...prev]);
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

    const handleNavClick = (page) => {
      setPublicSubPage(page);
      setLandingMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
        {/* ── Floating Glassmorphism Header ── */}
        <header className="landing-header" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
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
          {/* Logo + brand */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => { setPublicSubPage('HOME'); setLandingMenuOpen(false); }}
          >
            <div style={{ width: '44px', height: '44px', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0', padding: '2px' }}>
              <img
                src="/images/logo.jpeg"
                alt="EAF Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
              />
            </div>
            <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Ethiopian Athletics Federation
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0EA5E9', fontWeight: 800 }}>
                የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
              </div>
            </div>
          </div>

          {/* Centre nav links */}
          <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                style={{
                  background: publicSubPage === link.page ? '#F1F5F9' : 'none', 
                  border: 'none', cursor: 'pointer',
                  color: publicSubPage === link.page ? '#0EA5E9' : '#64748B', 
                  fontWeight: 700, fontSize: '0.85rem',
                  padding: '8px 14px', borderRadius: '8px',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-sans)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0EA5E9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = publicSubPage === link.page ? '#F1F5F9' : 'none'; e.currentTarget.style.color = publicSubPage === link.page ? '#0EA5E9' : '#64748B'; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="landing-menu-btn"
            onClick={() => setLandingMenuOpen(o => !o)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#0F172A'
            }}
          >
            {landingMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Right Side */}
          <div className="landing-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'am' : 'en')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '7px 11px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
            >
              🌐 {language === 'en' ? 'አማርኛ' : 'EN'}
            </button>

            {currentRole === 'ATHLETE' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); }}
                  className="btn-accent"
                  style={{
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {language === 'en' ? 'My Dashboard' : 'ዳሽቦርድ'}
                </button>
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
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', boxShadow: 'none', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  {language === 'en' ? 'Register as Athlete' : 'አትሌት ይመዝገቡ'}
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
                  {language === 'en' ? 'Club Portal Login' : 'የክለብ መግቢያ'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
              </>
            )}
          </div>
        </header>

        {/* ── Mobile dropdown menu ── */}
        {landingMenuOpen && (
          <div
            className="landing-mobile-menu"
            style={{
              position: 'sticky',
              top: '64px',
              zIndex: 49,
              background: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
              padding: '8px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                style={{
                  textAlign: 'left',
                  background: publicSubPage === link.page ? '#F1F5F9' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: publicSubPage === link.page ? '#0EA5E9' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {link.label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', padding: '0 4px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setLanguage(l => l === 'en' ? 'am' : 'en')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  padding: '7px 11px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-sans)'
                }}
              >
                🌐 {language === 'en' ? 'አማርኛ' : 'EN'}
              </button>
              {currentRole === 'ATHLETE' ? (
                <>
                  <button
                    onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); setLandingMenuOpen(false); }}
                    className="btn-accent"
                    style={{
                      fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                      color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {language === 'en' ? 'My Dashboard' : 'ዳሽቦርድ'}
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('eaf_currentRole'); setCurrentRole('LANDING'); setLandingMenuOpen(false); }}
                    style={{
                      background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '7px 12px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: 700, color: '#475569', fontFamily: 'var(--font-sans)'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setRegModalRole('ATHLETE'); setLandingMenuOpen(false); }}
                    className="btn-accent"
                    style={{
                      fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                      color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {language === 'en' ? 'Register as Athlete' : 'አትሌት ይመዝገቡ'}
                  </button>
                  <button
                    onClick={() => { handleOpenAuthModal(); setLandingMenuOpen(false); }}
                    className="btn-gov-secondary"
                    style={{
                      fontSize: '0.76rem', padding: '7px 12px', borderRadius: '8px',
                      background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1',
                      cursor: 'pointer', fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {language === 'en' ? 'Club Portal Login' : 'የክለብ መግቢያ'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
          }
        `}</style>

        <LandingPage
          language={language}
          publicSubPage={publicSubPage}
          onChangePublicSubPage={setPublicSubPage}
          onSelectRole={role => {
            if (role === 'CLUB') handleLoginSuccess('CLUB', { club: currentClub });
            else handleLoginSuccess('ATHLETE', { athlete: currentAthlete });
          }}
          onRegister={role => setRegModalRole(role)}
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
