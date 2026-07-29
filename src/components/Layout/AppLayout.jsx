import React from 'react';
import {
  Building2, UserCheck, Users, ArrowRightLeft, Trophy,
  Navigation, Activity, LogOut, Home,
  Bell, ChevronRight, Layers, Award, ShieldCheck, Globe
} from 'lucide-react';

// EAF Logo — local file
function EAFLogo({ size = 36 }) {
  return (
    <img
      src="/images/logo.jpeg"
      alt="Ethiopian Athletics Federation"
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '6px' }}
    />
  );
}

export default function AppLayout({
  currentRole, activeSubPage, onChangeSubPage,
  currentClub, currentAthlete, onSwitchRole, onLogout, children
}) {
  const isClub = currentRole === 'CLUB';

  const clubNavItems = [
    { id: 'OVERVIEW',   label: 'Dashboard',   icon: Home },
    { id: 'ROSTER',     label: 'Roster',      icon: Users },
    { id: 'MEETS',      label: 'Meets',       icon: Trophy },
    { id: 'SEEDING',    label: 'Seeding',     icon: Layers },
    { id: 'TRANSFERS',  label: 'Transfers',   icon: ArrowRightLeft },
  ];

  const athleteNavItems = [
    { id: 'OVERVIEW',   label: 'Dashboard',         icon: Home },
    { id: 'EVENTS',     label: 'Events',            icon: Globe },
    { id: 'CHECKIN',    label: 'Check-In',          icon: Navigation },
    { id: 'RACES',      label: 'Races',             icon: Activity },
    { id: 'RESULTS',    label: 'Event Results',     icon: Trophy },
    { id: 'RECORDS',    label: 'Records',           icon: Award },
  ];

  const navItems = isClub ? clubNavItems : athleteNavItems;

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* EAF Brand Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #2D3A5A', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <EAFLogo size={36} />
            <span style={{ display: 'none', fontSize: '1.3rem' }}>🇪🇹</span>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              EAF Portal
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, marginTop: '1px' }}>
              EAF
            </div>
          </div>
        </div>

        {/* Identity Card */}
        <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid #2D3A5A', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isClub ? (
            <>
              <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{currentClub.logo}</div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>{currentClub.shortName}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700 }}>Admin</div>
              </div>
            </>
          ) : (
            <>
              <img src={currentAthlete.photoUrl} alt={currentAthlete.name}
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--accent)' }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>{currentAthlete.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#8FA8BC', fontWeight: 700 }}>{currentAthlete.ageTier} · ID Verified</div>
              </div>
            </>
          )}
        </div>

        {/* Nav Items */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#5A7A94', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '10px', paddingLeft: '6px' }}>
            {isClub ? 'Club' : 'Athlete'}
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSubPage === item.id;
            return (
              <div key={item.id} onClick={() => onChangeSubPage(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={17} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px', borderTop: '1px solid #2D3A5A', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onSwitchRole('LANDING')}
            className="btn-gov-secondary"
            style={{ width: '100%', fontSize: '0.78rem', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Globe size={13} /> Go to Home Page
          </button>
          <button onClick={() => onSwitchRole(isClub ? 'ATHLETE' : 'CLUB')} className="btn-gov-secondary" style={{ width: '100%', fontSize: '0.78rem', padding: '8px 12px' }}>
            {isClub ? <><UserCheck size={13} /> Athlete View</> : <><Building2 size={13} /> Club View</>}
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', padding: '7px' }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        <header className="header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700 }}>EAF</span>
            <ChevronRight size={13} />
            <span style={{ fontWeight: 600 }}>{isClub ? 'Club Portal' : 'Athlete Portal'}</span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--text-heading)', fontWeight: 800 }}>
              {navItems.find(n => n.id === activeSubPage)?.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)' }} />
              Active
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={19} color="var(--text-muted)" />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
          </div>
        </header>

        <div style={{ padding: '28px 32px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
