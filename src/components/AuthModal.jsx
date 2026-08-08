import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, X, Mail, Lock, Sparkles, Building2, UserCheck, CheckCircle2 } from 'lucide-react';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [loginRole, setLoginRole] = useState('CLUB'); // 'CLUB' | 'ATHLETE'
  const [email, setEmail] = useState('admin@defense-athletics.et');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e) => {
    e.preventDefault();
    const lowerEmail = email.toLowerCase();
    
    if (loginRole === 'ATHLETE' || lowerEmail.includes('athlete') || lowerEmail.includes('haile') || lowerEmail.includes('runner')) {
      const selectedAthlete = MOCK_ATHLETES.find(a => a.name.toLowerCase().includes('haile')) || MOCK_ATHLETES[0];
      onLoginSuccess('ATHLETE', { athlete: selectedAthlete });
    } else {
      const selectedClub = MOCK_CLUBS.find(c => c.email.toLowerCase() === lowerEmail) || MOCK_CLUBS[0];
      onLoginSuccess('CLUB', { club: selectedClub });
    }
  };

  const handleApplyPreset = (presetEmail, presetRole) => {
    setLoginRole(presetRole);
    setEmail(presetEmail);
    setPassword('Password123!');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '32px 16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: '44px 48px', 
          maxWidth: '720px', 
          width: '95%',
          margin: '30px auto',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '10px' }}>
              <ShieldCheck size={14} />
              EOSCRMS Government Single Sign-On
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              EAF Portal Authentication
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '6px' }}>
              Sign in to manage club rosters, event registrations, and athlete  licenses
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              color: '#64748B',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px', background: '#F8FAFC', padding: '6px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={() => {
              setLoginRole('CLUB');
              setEmail('admin@defense-athletics.et');
            }}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              background: loginRole === 'CLUB' ? '#FFFFFF' : 'transparent',
              color: loginRole === 'CLUB' ? '#0EA5E9' : '#64748B',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: loginRole === 'CLUB' ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Building2 size={18} />
            Club Administrator Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginRole('ATHLETE');
              setEmail('haile.tadesse@athletics.et');
            }}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              background: loginRole === 'ATHLETE' ? '#FFFFFF' : 'transparent',
              color: loginRole === 'ATHLETE' ? '#0EA5E9' : '#64748B',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: loginRole === 'ATHLETE' ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <UserCheck size={18} />
            Athlete Portal Access
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Email Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                <Mail size={16} color="#0EA5E9" />
                Registered Email Address
              </label>
              <input 
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@defense-athletics.et"
                required
                style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }}
              />
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                <Lock size={16} color="#0EA5E9" />
                Account Password
              </label>
              <input 
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                required
                style={{ padding: '14px 16px', fontSize: '0.95rem', borderRadius: '12px' }}
              />
            </div>
          </div>

          {/* Fayda Security Verification Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(2, 132, 199, 0.12) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '28px',
            fontSize: '0.85rem',
            color: '#0369A1',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: 600
          }}>
            <ShieldCheck size={22} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>Fayda FIN  SSO Protected</div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>Proclamation No. 1284/2023 Compliant — National Digital ID Verification Active</div>
            </div>
          </div>

          {/* Quick Demo Credentials Presets */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '28px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ One-Click Demo Credentials
            </div>

            <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('admin@defense-athletics.et', 'CLUB')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  background: '#F0F9FF',
                  color: '#0284C7',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Building2 size={16} />
                Club Admin Demo
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('haile.tadesse@athletics.et', 'ATHLETE')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <UserCheck size={16} />
                Athlete Demo
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-accent" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '1.05rem', 
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            Sign In to {loginRole === 'CLUB' ? 'Club Management Portal' : 'Athlete Portal'}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
