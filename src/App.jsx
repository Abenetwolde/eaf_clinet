import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import RegistrationModal from './components/RegistrationModal';
import AppLayout from './components/Layout/AppLayout';

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

import PaymentModal from './components/PaymentModal';
import NotificationToast from './components/NotificationToast';

import { MOCK_CLUBS, MOCK_ATHLETES, MOCK_TRANSFERS } from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState('LANDING');
  const [clubSubPage, setClubSubPage] = useState('OVERVIEW');
  const [athleteSubPage, setAthleteSubPage] = useState('OVERVIEW');

  const [clubs, setClubs] = useState(MOCK_CLUBS);
  const [athletes, setAthletes] = useState(MOCK_ATHLETES);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  const [currentClub, setCurrentClub] = useState(MOCK_CLUBS[0]);
  const [currentAthlete, setCurrentAthlete] = useState(MOCK_ATHLETES[0]);

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
    if (currentAthlete.id === updated.id) setCurrentAthlete(updated);
    handleNotify('Athlete profile updated.', 'success');
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
  if (currentRole === 'LANDING') {
    const navLinks = [
      { label: 'Home',        href: '#home' },
      { label: 'News',        href: '#news' },
      { label: 'Competition', href: '#competitions' },
      { label: 'Athletes',    href: '#athletes' },
      { label: 'About',       href: '#about' },
      { label: 'Contact',     href: '#contact' },
    ];

    const handleNavClick = (href) => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
      <div>
        {/* ── Header / Navbar ── */}
        <header style={{
          background: '#1A1F2E',
          borderBottom: '3px solid var(--primary)',
          padding: '0 32px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          {/* Logo + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: '#FFFFFF', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src="/images/logo.jpeg"
                alt="EAF Logo"
                style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Ethiopian Athletics Federation
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--accent)', fontWeight: 700 }}>
                የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
              </div>
            </div>
          </div>

          {/* Centre nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8FA8BC', fontWeight: 700, fontSize: '0.85rem',
                  padding: '8px 14px', borderRadius: '8px',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#8FA8BC'; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right — Register Athlete + Portal Login */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setRegModalRole('ATHLETE')}
              className="btn-gov-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Register as Athlete
            </button>
            <button
              onClick={handleOpenAuthModal}
              className="btn-gov-secondary"
              style={{ fontSize: '0.78rem', padding: '7px 13px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              Portal Login
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>
        </header>

        <LandingPage
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
  return (
    <AppLayout
      currentRole={currentRole}
      activeSubPage={currentRole === 'CLUB' ? clubSubPage : athleteSubPage}
      onChangeSubPage={sub => {
        if (currentRole === 'CLUB') setClubSubPage(sub);
        else setAthleteSubPage(sub);
      }}
      currentClub={currentClub}
      currentAthlete={currentAthlete}
      onSwitchRole={handleSwitchRoleDirectly}
      onLogout={() => setCurrentRole('LANDING')}
    >
      {/* ── CLUB PORTAL ── */}
      {currentRole === 'CLUB' && (
        <>
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
        </>
      )}

      {/* ── ATHLETE PORTAL ── */}
      {currentRole === 'ATHLETE' && (
        <>
          {athleteSubPage === 'OVERVIEW' && (
            <AthleteOverview
              athlete={currentAthlete}
              onChangeSubPage={setAthleteSubPage}
              onPayLicense={handleInitiateLicensePayment}
              onUpdateAthlete={handleUpdateAthlete}
            />
          )}
          {athleteSubPage === 'EVENTS' && (
            <AthleteEvents
              athlete={currentAthlete}
              onNotify={handleNotify}
            />
          )}
          {athleteSubPage === 'CHECKIN' && (
            <GeofenceCheckin
              athlete={currentAthlete} onUpdateAthlete={handleUpdateAthlete} onNotify={handleNotify}
            />
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
        </>
      )}

      {paymentData && (
        <PaymentModal
          paymentData={paymentData}
          onClose={() => setPaymentData(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </AppLayout>
  );
}
