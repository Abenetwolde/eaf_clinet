import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, X, Mail, Lock, Sparkles, Building2, UserCheck } from 'lucide-react';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('admin@defense-athletics.et');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e) => {
    e.preventDefault();
    const lowerEmail = email.toLowerCase();
    
    // Auto-detect role based on email or presets
    if (lowerEmail.includes('athlete') || lowerEmail.includes('haile') || lowerEmail.includes('runner')) {
      const selectedAthlete = MOCK_ATHLETES[0];
      onLoginSuccess('ATHLETE', { athlete: selectedAthlete });
    } else {
      const selectedClub = MOCK_CLUBS.find(c => c.email.toLowerCase() === lowerEmail) || MOCK_CLUBS[0];
      onLoginSuccess('CLUB', { club: selectedClub });
    }
  };

  const handleApplyPreset = (presetEmail, presetRole) => {
    setEmail(presetEmail);
    setPassword('Password123!');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '480px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
              EOSCRMS Unified Sign In
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your registered Email & Password to access the portal
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              color: 'var(--text-muted)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--eth-blue)" />
              Email Address
            </label>
            <input 
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@defense-athletics.et"
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} color="var(--eth-blue)" />
              Password
            </label>
            <input 
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              required
            />
          </div>

          {/* Security Verification Banner */}
          <div style={{
            background: 'rgba(0, 114, 206, 0.08)',
            border: '1px solid rgba(0, 114, 206, 0.25)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: 'var(--olympic-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <ShieldCheck size={18} />
            <span>Encrypted Fayda FIN Single Sign-On Enabled</span>
          </div>

          {/* Quick Demo Credentials Presets */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Quick Demo Credentials
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('admin@defense-athletics.et', 'CLUB')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  background: 'rgba(255, 184, 0, 0.08)',
                  color: '#D97706',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Building2 size={14} />
                Club Admin
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('haile.tadesse@athletics.et', 'ATHLETE')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 168, 89, 0.3)',
                  background: 'rgba(0, 168, 89, 0.08)',
                  color: '#00A859',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={14} />
                Athlete View
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            Sign In to Portal
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
