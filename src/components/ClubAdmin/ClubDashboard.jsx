import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowRightLeft, 
  Trophy, 
  Download
} from 'lucide-react';
import RosterManagement from './RosterManagement';
import TransferRegistry from './TransferRegistry';
import MeetRegistration from './MeetRegistration';

export default function ClubDashboard({ club, athletes, transfers, onRenewLicense, onAddAthlete, onInitiateTransfer, onNotify }) {
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER', 'TRANSFERS', 'MEETS'

  const verifiedCount = athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Club Banner Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '2px solid rgba(255, 184, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            fontSize: '3.2rem',
            padding: '14px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(0, 114, 206, 0.1)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            {club.logo}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {club.name}
              </h2>
              <span className="badge badge-gold">
                Rank #{club.clubRank} Regional
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Region: {club.region} | Club Manager: <strong>{club.manager}</strong> | ID: {club.id}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button 
          onClick={() => onNotify("Downloading Club Annual Performance & Roster Report...", "info")}
          className="btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <Download size={16} />
          Export Official Club Roster Index
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '32px'
      }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Registered Roster</span>
            <Users size={22} color="#0072CE" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{athletes.length} Athletes</div>
          <div style={{ fontSize: '0.78rem', color: '#00A859', fontWeight: 700, marginTop: '4px' }}>
            {verifiedCount} Fayda  Verified
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active EAF Licenses</span>
            <ShieldCheck size={22} color="#00A859" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00A859' }}>{activeLicenseCount} Active</div>
          <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '4px' }}>
            {expiredCount} Pending Renewal
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Transfer Registry</span>
            <ArrowRightLeft size={22} color="#D97706" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#D97706' }}>{transfers.length} Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
            Lock Deadline: Aug 15
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Championship Points</span>
            <Trophy size={22} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{club.totalPoints} Pts</div>
          <div style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 700, marginTop: '4px' }}>
            Season 2025/26 Standings
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '2px solid rgba(226, 232, 240, 0.8)',
        paddingBottom: '16px',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('ROSTER')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'ROSTER' ? 'rgba(0, 168, 89, 0.12)' : 'transparent',
            color: activeTab === 'ROSTER' ? '#00A859' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={18} />
          Digital Roster & Licensing
        </button>

        <button
          onClick={() => setActiveTab('TRANSFERS')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'TRANSFERS' ? 'rgba(255, 184, 0, 0.15)' : 'transparent',
            color: activeTab === 'TRANSFERS' ? '#D97706' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <ArrowRightLeft size={18} />
          Transfer Registry ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('MEETS')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'MEETS' ? 'rgba(0, 114, 206, 0.12)' : 'transparent',
            color: activeTab === 'MEETS' ? '#0072CE' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Trophy size={18} />
          Meet Entries & Seeding
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'ROSTER' && (
        <RosterManagement 
          athletes={athletes}
          club={club}
          onRenewLicense={onRenewLicense}
          onAddAthlete={onAddAthlete}
        />
      )}

      {activeTab === 'TRANSFERS' && (
        <TransferRegistry 
          transfers={transfers}
          currentClub={club}
          onInitiateTransfer={onInitiateTransfer}
        />
      )}

      {activeTab === 'MEETS' && (
        <MeetRegistration 
          club={club}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}
