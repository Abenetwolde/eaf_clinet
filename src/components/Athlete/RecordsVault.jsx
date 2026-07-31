import React, { useState } from 'react';
import { TrendingUp, Download, Eye, ShieldCheck, X, CheckCircle2, Calendar, MapPin, FileCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function EAFQrCode({ code = "EAF-MEET-202-2026-243", size = 150 }) {
  return (
    <div style={{
      background: '#FFFFFF',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      background: '#FFF'
    }}>
      <QRCodeSVG value={code} size={size} />
    </div>
  );
}

export default function RecordsVault({ athlete, onNotify }) {
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  const records = [
    { 
      event: '5,000m',  
      pb: '12:51.20', 
      sb: '12:51.20', 
      date: 'May 18, 2026',  
      venue: 'Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)',  
      rankingPts: 1248,
      splits: [
        { mark: '1,000m', time: '2:34.10', diff: '2:34.10', pace: '2:34/km' },
        { mark: '2,000m', time: '5:09.30', diff: '2:35.20', pace: '2:35/km' },
        { mark: '3,000m', time: '7:43.00', diff: '2:33.70', pace: '2:33/km' },
        { mark: '4,000m', time: '10:18.50', diff: '2:35.50', pace: '2:35/km' },
        { mark: '5,000m', time: '12:51.20', diff: '2:32.70', pace: '2:32/km' }
      ],
      referee: 'Eng. Kebede Tadesse (EAF Technical Delegate #77402)',
      wind: '+0.4 m/s',
      temp: '21°C Clear',
      altitude: '2,355 meters',
      hash: '0x8F92A7C319D04B8E12F54'
    },
    { 
      event: '3,000m',  
      pb: '7:28.40',  
      sb: '7:30.10',  
      date: 'Feb 12, 2026',  
      venue: 'Lievin Indoor Arena',  
      rankingPts: 1210,
      splits: [
        { mark: '1,000m', time: '2:29.80', diff: '2:29.80', pace: '2:29/km' },
        { mark: '2,000m', time: '5:00.10', diff: '2:30.30', pace: '2:30/km' },
        { mark: '3,000m', time: '7:28.40', diff: '2:28.30', pace: '2:28/km' }
      ],
      referee: 'IAAF Certified Officiating Panel #9920',
      wind: 'Indoor (0.0 m/s)',
      temp: '19°C Controlled',
      altitude: '100 meters',
      hash: '0x3E11D92B5F841C908A721'
    },
    { 
      event: '10,000m', 
      pb: '26:49.00', 
      sb: '26:55.00', 
      date: 'June 02, 2025', 
      venue: 'Hengelo FBK Games',   
      rankingPts: 1235,
      splits: [
        { mark: '2,000m', time: '5:21.80', diff: '5:21.80', pace: '2:40/km' },
        { mark: '4,000m', time: '10:44.00', diff: '5:22.20', pace: '2:41/km' },
        { mark: '6,000m', time: '16:05.50', diff: '5:21.50', pace: '2:40/km' },
        { mark: '8,000m', time: '21:28.10', diff: '5:22.60', pace: '2:41/km' },
        { mark: '10,000m', time: '26:49.00', diff: '5:20.90', pace: '2:40/km' }
      ],
      referee: 'World Athletics Official Jury #ETH-2025',
      wind: '+0.2 m/s',
      temp: '18°C Mild',
      altitude: '15 meters',
      hash: '0x992B45A8812EF1A7030C8'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>Career Records Vault</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Full competition history, verified split breakdown, and official achievements.
          </p>
        </div>
        <button onClick={() => onNotify(`Exporting Official EAF Career Passport for ${athlete.name}...`, 'info')} className="btn-gov-primary">
          <Download size={16} /> Export Career Passport PDF
        </button>
      </div>

      {/* World ranking card */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: 'none', color: '#FFFFFF', marginBottom: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>World Athletics Ranking</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1 }}>1,248 Performance Points</div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px' }}>
              #4 Nationally · #12 Global 5,000m
            </div>
          </div>
          <div>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', borderRadius: '10px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Olympic Qualifier Standard Met
            </span>
          </div>
        </div>
      </div>

      {/* Verified Records Table */}
      <div className="gov-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '18px' }}>
        <div style={{ padding: '14px 20px', background: '#0F172A', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Official Verified Personal Bests &amp; Season Bests</span>
          <span style={{ fontSize: '0.75rem', color: '#0EA5E9' }}>Fayda Cryptographic Audit Active</span>
        </div>
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Personal Best</th>
                <th>Season Best</th>
                <th>Date</th>
                <th>Venue</th>
                <th>WA Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 800, color: '#0F172A' }}>{r.event}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7', fontSize: '1rem' }}>{r.pb}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>{r.sb}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.date}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.venue}</td>
                  <td><span className="badge badge-blue"><TrendingUp size={12} /> {r.rankingPts}</span></td>
                  <td>
                    <button 
                      onClick={() => setSelectedRecordDetail(r)}
                      className="btn-gov-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SHOW DETAILS & APPLICATION MODAL ── */}
      {selectedRecordDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedRecordDetail(null)} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 9999 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              padding: '0', 
              maxWidth: '680px', 
              width: '92%', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              border: '1px solid #E2E8F0',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* 1. Events Banner */}
            <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
              <img 
                src="/images/banner_grand_prix.png" 
                alt="Addis Ababa International Grand Prix 2026" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.78rem', background: '#10B981', color: '#FFF', padding: '6px 12px', fontWeight: 800 }}>
                    <CheckCircle2 size={13} /> Official EAF Entry Pass
                  </span>
                  <button 
                    onClick={() => setSelectedRecordDetail(null)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                  >
                    <X size={20} color="#FFFFFF" />
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    Addis Ababa International Grand Prix 2026
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: '#E2E8F0', fontSize: '0.84rem', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="#38BDF8" /> Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="#38BDF8" /> August 12-14, 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              
              {/* Application Details Card */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Details</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>Submitted on 2026-07-15</div>
                  </div>
                  <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={14} /> Verified Record
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>Selected Disciplines &amp; Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ background: '#0EA5E9', color: '#FFFFFF', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', fontSize: '0.9rem' }}>
                        {selectedRecordDetail.event}
                      </span>
                      <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Approved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{ background: '#F1F5F9', border: '2px dashed #CBD5E1', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <QrCode size={16} color="#0EA5E9" /> Entry QR Code
                </div>
                
                {/* SVG 2D QR Code Matrix */}
                <EAFQrCode code="EAF-MEET-202-2026-243" size={160} />

                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1rem', color: '#0F172A', marginTop: '12px', letterSpacing: '0.08em' }}>
                  EAF-MEET-202-2026-243
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                  Scan this code at the Call Room for quick check-in.
                </p>
              </div>

              {/* Verified Race Splits */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>Official Race Split Times</h4>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', fontWeight: 800 }}>
                        <th style={{ padding: '8px 12px' }}>Split</th>
                        <th style={{ padding: '8px 12px' }}>Accumulated</th>
                        <th style={{ padding: '8px 12px' }}>Segment</th>
                        <th style={{ padding: '8px 12px' }}>Pace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecordDetail.splits.map((s, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0F172A' }}>{s.mark}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7' }}>{s.time}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#475569' }}>{s.diff}</td>
                          <td style={{ padding: '8px 12px', color: '#16A34A', fontWeight: 700 }}>{s.pace}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Entry Verification Warning Box */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '14px 16px', fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.5 }}>
                <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda data. For queries regarding your approval, contact <a href="mailto:registrar@eaf.org.et" style={{ color: '#0284C7', fontWeight: 800 }}>registrar@eaf.org.et</a>.
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
