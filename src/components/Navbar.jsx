import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ currentRole, currentAthlete, currentClub, onSwitchRole, onLogout, onOpenAuthModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: currentRole === 'LANDING' ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
      backdropFilter: currentRole === 'LANDING' ? 'none' : 'blur(20px)',
      borderBottom: currentRole === 'LANDING' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: currentRole === 'LANDING' ? 'none' : '0 4px 20px rgba(15, 23, 42, 0.04)'
    }}>
      <div className="navbar-inner" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo & EAF Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => onSwitchRole('LANDING')}>
          <div style={{
            position: 'relative',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
            border: '2px solid rgba(0, 114, 206, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0, 114, 206, 0.15)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '1.5rem' }}>🇪🇹</span>
            {/* Olympic 5 Ring Color Top Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '4px',
              background: 'linear-gradient(90deg, #0072CE 0%, #FFB800 25%, #1E293B 50%, #00A859 75%, #E51B24 100%)',
              borderRadius: '2px'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap'
              }}>EOSCRMS</span>
              <span className="badge badge-gold hidden-mobile" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                OLYMPIC v1.1
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              EOSCRMS v1.1
            </p>
          </div>
        </div>

        {/* System Navigation & Role Context Controls */}
        {currentRole === 'LANDING' ? (
          <button
            onClick={() => onOpenAuthModal()}
            className="btn-primary"
            style={{ fontSize: '0.9rem', padding: '10px 20px' }}
          >
            Sign In
          </button>
        ) : (
          <>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="mobile-menu-toggle"
              aria-label="Toggle menu"
              style={{
                background: 'rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                color: 'var(--text-main)',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Session + Actions — inline row on desktop, dropdown panel on mobile */}
            <div className={`mobile-menu-wrap ${menuOpen ? 'open' : ''}`}>
              {/* Active Session Indicator */}
              <div className="session-indicator" style={{
                background: '#FFFFFF',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                padding: '6px 14px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {currentRole === 'CLUB' ? (
                  <>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{currentClub.logo}</span>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentClub.shortName}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--olympic-blue)', fontWeight: 700 }}>
                        Admin
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={currentAthlete.photoUrl}
                      alt={currentAthlete.name}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentAthlete.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--olympic-green)', fontWeight: 700 }}>
                        ID Verified ({currentAthlete.ageTier})
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Switch Role + Logout */}
              <div className="menu-actions" style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    onSwitchRole(currentRole === 'CLUB' ? 'ATHLETE' : 'CLUB');
                    closeMenu();
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px', flex: 1, justifyContent: 'center' }}
                >
                  {currentRole === 'CLUB' ? 'Athlete View' : 'Club View'}
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    closeMenu();
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#DC2626',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    justifyContent: 'center'
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
