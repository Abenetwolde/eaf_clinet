import React, { useState } from 'react';
import { MOCK_CLUBS, MOCK_ATHLETES } from '../data/mockData';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes('athlete') || lowerEmail.includes('haile') || lowerEmail.includes('runner') || lowerEmail.includes('@example')) {
      const selectedAthlete = MOCK_ATHLETES.find(a => a.name.toLowerCase().includes('haile')) || MOCK_ATHLETES[0];
      onLoginSuccess('ATHLETE', { athlete: selectedAthlete });
    } else {
      const selectedClub = MOCK_CLUBS.find(c => c.email.toLowerCase() === lowerEmail) || MOCK_CLUBS[0];
      onLoginSuccess('CLUB', { club: selectedClub });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '32px 24px',
          maxWidth: '480px',
          width: '95%',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          background: '#FFFFFF'
        }}
      >
        {/* Back Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '1.4rem',
            padding: '4px',
            lineHeight: 1
          }}
        >
          ←
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
            Login
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#0B5ED7', marginBottom: '4px', fontWeight: 600 }}>
            Welcome
          </p>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
            Access your competitions and registration tools.
          </p>
        </div>

        {/* Mock Mode Test Credentials */}
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '24px',
          fontSize: '0.85rem',
          color: '#1E40AF'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ fontSize: '1rem' }}>ℹ️</div>
            <div>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>Mock Mode - Test Credentials:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.6 }}>
                <div>Club Admin: admin@eacrms.gov.et / admin123</div>
                <div>Athlete: athlete@example.com / athlete123</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0B5ED7'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0B5ED7'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              borderRadius: '12px',
              background: '#0B5ED7',
              color: '#FFFFFF',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 700,
              marginTop: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#0A4FB5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0B5ED7'}
          >
            Login
          </button>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('openRegistrationModal', { detail: { role: 'ATHLETE' } }));
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0B5ED7',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Need an account? Register as Athlete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
