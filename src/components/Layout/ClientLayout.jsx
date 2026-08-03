import React from 'react';
import { Home, UserCheck, Bell, BookOpen, LogOut } from 'lucide-react';

export default function ClientLayout({
  activeSubPage, onChangeSubPage, currentAthlete, onLogout, children
}) {
  const tabs = [
    { id: 'OVERVIEW', label: 'Home', icon: Home },
    { id: 'APPLIED', label: 'My Events', icon: BookOpen },
    { id: 'PROFILE', label: 'Profile', icon: UserCheck },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* Top Navbar */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => onChangeSubPage('OVERVIEW')}
        >
          <img src="/images/logo.jpeg" alt="EAF" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>EAF Athlete</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Client Portal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Updates Icon Button next to Sign Out */}
          <button 
            onClick={() => onChangeSubPage('NOTIFICATIONS')} 
            title="Updates & Notifications"
            style={{ 
              background: activeSubPage === 'NOTIFICATIONS' ? '#E0F2FE' : '#F1F5F9',
              border: activeSubPage === 'NOTIFICATIONS' ? '1px solid #0EA5E9' : 'none', 
              padding: '9px 11px', 
              borderRadius: '10px', 
              color: activeSubPage === 'NOTIFICATIONS' ? '#0284C7' : '#475569', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#0EA5E9',
              border: '2px solid #FFFFFF'
            }} />
          </button>

          <button 
            onClick={onLogout} 
            style={{ 
              background: '#F1F5F9', border: 'none', padding: '8px 14px', borderRadius: '10px', 
              fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> <span className="hidden-mobile">Sign Out</span>
          </button>
          <div style={{ position: 'relative' }}>
            <img 
              src={currentAthlete.photoUrl} 
              alt="Profile" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} 
            />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10B981', border: '2px solid #FFF', borderRadius: '50%' }}></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        {/* Modern Tab Navigation */}
        <div style={{ 
          display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px',
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }} className="no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeSubPage(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '14px', border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: isActive ? '0 8px 16px rgba(14, 165, 233, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content */}
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {children}
        </div>
      </main>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
