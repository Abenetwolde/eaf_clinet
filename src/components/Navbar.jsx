import React from 'react';
import { ShieldCheck, UserCheck, Building2, LogOut, Sparkles, Award } from 'lucide-react';

export default function Navbar({ currentRole, currentAthlete, currentClub, onSwitchRole, onLogout, onOpenAuthModal }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
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
            boxShadow: '0 6px 16px rgba(0, 114, 206, 0.15)'
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
                letterSpacing: '-0.02em'
              }}>EOSCRMS</span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                OLYMPIC v1.1
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              EOSCRMS v1.1
            </p>
          </div>
        </div>

        {/* System Navigation & Role Context Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              {/* Active Session Indicator */}
              <div style={{
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
                    <span style={{ fontSize: '1.2rem' }}>{currentClub.logo}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {currentAthlete.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--olympic-green)', fontWeight: 700 }}>
                        ID Verified ({currentAthlete.ageTier})
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Switch Role Button */}
              <button
                onClick={() => onSwitchRole(currentRole === 'CLUB' ? 'ATHLETE' : 'CLUB')}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
              >
                {currentRole === 'CLUB' ? 'Athlete View' : 'Club View'}
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
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
                  fontWeight: 700
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
