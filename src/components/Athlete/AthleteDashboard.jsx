import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Navigation, 
  Activity, 
  CreditCard, 
} from 'lucide-react';
import FaydaVerification from './FaydaVerification';
import GeofenceCheckin from './GeofenceCheckin';
import LiveRaceTracker from './LiveRaceTracker';

export default function AthleteDashboard({ athlete, onUpdateAthlete, onPayLicense, onNotify }) {
  const [activeTab, setActiveTab] = useState('FAYDA'); // 'FAYDA', 'CHECKIN', 'RACES'

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Athlete Header Profile Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
        border: '2px solid rgba(0, 168, 89, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={athlete.photoUrl} 
            alt={athlete.name}
            style={{ width: '86px', height: '86px', borderRadius: '22px', objectFit: 'cover', border: '3px solid #00A859', boxShadow: '0 8px 20px rgba(0, 168, 89, 0.2)' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {athlete.name}
              </h2>
              <span className="badge badge-green">
                <ShieldCheck size={14} />
                Fayda ID Verified
              </span>
              <span className="badge badge-purple">
                {athlete.ageTier} Tier
              </span>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#047857', marginTop: '2px', fontWeight: 700 }}>
              {athlete.amharicName} — {athlete.clubName}
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>Fayda FIN: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{athlete.faydaFin}</strong></span>
              <span>•</span>
              <span>Discipline: <strong style={{ color: 'var(--text-main)' }}>{athlete.primaryEvent}</strong></span>
              <span>•</span>
              <span>Personal Best: <strong style={{ color: '#D97706' }}>{athlete.pb}</strong></span>
            </div>
          </div>
        </div>

        {/* License Action Button */}
        {athlete.licenseStatus !== 'ACTIVE' ? (
          <button 
            onClick={() => onPayLicense(athlete)}
            className="btn-telebirr"
            style={{ fontSize: '0.9rem', padding: '14px 22px' }}
          >
            <CreditCard size={18} />
            Renew EAF License via Telebirr (500 ETB)
          </button>
        ) : (
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-green" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              ✓ License Active ({athlete.licenseNumber})
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Valid through Dec 31, 2026
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '2px solid rgba(226, 232, 240, 0.8)',
        paddingBottom: '16px',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('FAYDA')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'FAYDA' ? 'rgba(0, 168, 89, 0.12)' : 'transparent',
            color: activeTab === 'FAYDA' ? '#00A859' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={18} />
          Fayda ID & Document Verification (FR-1.1)
        </button>

        <button
          onClick={() => setActiveTab('CHECKIN')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'CHECKIN' ? 'rgba(255, 184, 0, 0.15)' : 'transparent',
            color: activeTab === 'CHECKIN' ? '#D97706' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Navigation size={18} />
          GPS Check-In & Call Room QR (FR-1.3)
        </button>

        <button
          onClick={() => setActiveTab('RACES')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'RACES' ? 'rgba(0, 114, 206, 0.12)' : 'transparent',
            color: activeTab === 'RACES' ? '#0072CE' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={18} />
          Live Split Tracker & Badges (FR-3.1)
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'FAYDA' && (
        <FaydaVerification 
          athlete={athlete}
          onUpdateAthlete={onUpdateAthlete}
          onNotify={onNotify}
        />
      )}

      {activeTab === 'CHECKIN' && (
        <GeofenceCheckin 
          athlete={athlete}
          onUpdateAthlete={onUpdateAthlete}
          onNotify={onNotify}
        />
      )}

      {activeTab === 'RACES' && (
        <LiveRaceTracker 
          athlete={athlete}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}
