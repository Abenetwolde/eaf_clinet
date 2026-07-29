import React from 'react';
import { Activity, Radio, Trophy, Share2, Download, Award, FileCode } from 'lucide-react';
import { MOCK_LIVE_SPLITS } from '../../data/mockData';

export default function LiveRaceTracker({ athlete, onNotify }) {
  const handleShareBadge = (badgeTitle) => {
    onNotify(`Generated Digital Achievement Card for "${badgeTitle}"!`, 'success');
  };

  const handleDownloadWAXml = () => {
    onNotify(`Downloading certified World Athletics XML schema log for ${athlete.name}...`, 'info');
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            Live Race Split Tracker & World Athletics Data Log
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            FR-3.1: Real-time broadcast sync (&lt; 1.5s latency) & World Athletics XML schema (FR-3.3)
          </p>
        </div>

        {/* Live Broadcast Sync Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'var(--primary-light)',
          border: '1px solid rgba(5, 150, 105, 0.3)'
        }}>
          <Radio size={16} color="var(--primary)" className="animate-pulse" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
            WebSocket Live Broadcast Sync (&lt; 1.2s Latency)
          </span>
        </div>
      </div>

      {/* Grid: Split Times Table vs Digital Achievement Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Table of Live Splits */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Addis Ababa GP — Men's 5,000m Final Splits
            </h4>
            <span className="badge badge-amber">Official certified</span>
          </div>

          <div className="table-responsive" style={{ marginBottom: '20px' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Split Distance</th>
                  <th>Lap Time</th>
                  <th>Pace (/km)</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LIVE_SPLITS.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{item.distance}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>{item.splitTime}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.pace}</td>
                    <td>
                      <span className={`badge ${item.position === 1 ? 'badge-green' : 'badge-amber'}`}>
                        Pos #{item.position} ({item.leaderGap})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            onClick={handleDownloadWAXml}
            className="btn-gov-secondary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <FileCode size={16} />
            Export World Athletics XML Results File (FR-3.3)
          </button>
        </div>

        {/* Digital Achievement Badges Collector */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Digital Achievement Badges & Credentials
            </h4>
            <Trophy color="var(--accent)" size={22} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {athlete.achievements.map((ach, idx) => (
              <div key={idx} style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)'
                  }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.88rem' }}>{ach.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Year: {ach.year} | Time: <strong>{ach.time}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleShareBadge(ach.title)}
                  className="btn-gov-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Share2 size={12} />
                  Share
                </button>
              </div>
            ))}
          </div>

          {/* Social Share Card Preview */}
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <span className="badge badge-green" style={{ marginBottom: '8px' }}>EACRMS VERIFIED ATHLETE</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>{athlete.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 700 }}>
              Personal Best: <strong>{athlete.pb}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Fayda FIN Hash: {athlete.faydaHash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
