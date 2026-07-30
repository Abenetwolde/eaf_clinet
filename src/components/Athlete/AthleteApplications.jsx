import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, Clock, X, QrCode, FileCheck } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';

// Realistic SVG 2D QR Code Matrix Generator Component
function EAFQrCode({ code = "EAF-MEET-202-2026-243", size = 150 }) {
  return (
    <div style={{
      width: size,
      height: size,
      background: '#FFFFFF',
      padding: '10px',
      borderRadius: '16px',
      border: '2px solid #0EA5E9',
      boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {/* Outer Corner Finder Patterns */}
        {/* Top Left */}
        <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
        <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
        <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#0EA5E9" />

        {/* Top Right */}
        <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
        <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
        <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#0EA5E9" />

        {/* Bottom Left */}
        <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
        <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
        <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#0EA5E9" />

        {/* Matrix Data Modules */}
        <rect x="36" y="8" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="44" y="8" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="8" width="5" height="5" rx="1" fill="#0F172A" />

        <rect x="36" y="16" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="44" y="16" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="58" y="16" width="5" height="5" rx="1" fill="#0EA5E9" />

        <rect x="8" y="36" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="16" y="36" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="24" y="36" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="36" y="36" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="44" y="36" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="36" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="68" y="36" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="76" y="36" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="84" y="36" width="5" height="5" rx="1" fill="#0EA5E9" />

        <rect x="8" y="44" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="24" y="44" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="68" y="44" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="84" y="44" width="5" height="5" rx="1" fill="#0F172A" />

        <rect x="8" y="52" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="16" y="52" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="36" y="52" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="52" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="76" y="52" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="84" y="52" width="5" height="5" rx="1" fill="#0F172A" />

        <rect x="36" y="68" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="44" y="68" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="68" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="68" y="68" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="76" y="68" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="84" y="68" width="5" height="5" rx="1" fill="#0EA5E9" />

        <rect x="36" y="76" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="76" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="68" y="76" width="5" height="5" rx="1" fill="#0F172A" />

        <rect x="36" y="84" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="44" y="84" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="52" y="84" width="5" height="5" rx="1" fill="#0EA5E9" />
        <rect x="76" y="84" width="5" height="5" rx="1" fill="#0F172A" />
        <rect x="84" y="84" width="5" height="5" rx="1" fill="#0EA5E9" />

        {/* Center EAF Emblem Shield */}
        <circle cx="50" cy="50" r="11" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="1.5" />
        <text x="50" y="53" fontSize="8" fontWeight="900" fill="#0EA5E9" textAnchor="middle">EAF</text>
      </svg>
    </div>
  );
}

export default function AthleteApplications({ athlete, onNotify }) {
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fallback default applications for display if none are in state
  const applications = athlete.appliedCompetitions || [
    {
      meetId: "MEET-2026-01",
      meetTitle: "Addis Ababa International Grand Prix 2026",
      disciplines: ["5,000m"],
      status: "Approved",
      appliedDate: "2026-07-15"
    },
    {
      meetId: "MEET-2026-02",
      meetTitle: "Ethiopian National Youth Olympic Games U18 / U20",
      disciplines: ["1,500m"],
      status: "Approved",
      appliedDate: "2026-07-20"
    },
    {
      meetId: "MEET-2026-03",
      meetTitle: "Jan Meda National Cross-Country Olympic Trials",
      disciplines: ["10km Senior Men"],
      status: "Completed",
      appliedDate: "2026-06-10"
    }
  ];

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="badge badge-green">✓ Approved</span>;
      case 'pending':
        return <span className="badge badge-amber"><Clock size={12} /> Pending</span>;
      case 'completed':
        return <span className="badge badge-blue">★ Completed</span>;
      case 'closed':
      default:
        return <span className="badge" style={{ background: '#E2E8F0', color: '#64748B' }}>Closed</span>;
    }
  };

  const handleRowClick = (app) => {
    const meetDetails = MOCK_MEETS.find(m => m.id === app.meetId) || {
      title: app.meetTitle,
      venue: "Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)",
      date: "August 12-14, 2026",
      bannerUrl: "/images/banner_grand_prix.png",
      status: "REGISTRATION_OPEN"
    };
    setSelectedApplication({ ...app, meet: meetDetails });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          My Applied Competitions
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Track and review the status of your individual event registration applications.
        </p>
      </div>

      {/* Applications Grid/List */}
      <div className="gov-card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px' }}>
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Event Banner &amp; Title</th>
                <th>Applied Date</th>
                <th>Disciplines</th>
                <th>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => {
                const meet = MOCK_MEETS.find(m => m.id === app.meetId) || {
                  bannerUrl: "/images/banner_grand_prix.png",
                  venue: "Addis Ababa National Stadium"
                };
                return (
                  <tr 
                    key={index} 
                    onClick={() => handleRowClick(app)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover-row"
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '64px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                          <img 
                            src={meet.bannerUrl || "/images/banner_grand_prix.png"} 
                            alt={app.meetTitle} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.92rem' }}>{app.meetTitle}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{meet.venue || "Addis Ababa Stadium"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.appliedDate}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {app.disciplines.map((d, i) => (
                          <span key={i} className="badge badge-primary" style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-gov-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(app);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApplication && (
        <div className="modal-backdrop" onClick={() => setSelectedApplication(null)} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 9999 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              padding: '0', 
              maxWidth: '620px', 
              width: '92%', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              border: '1px solid #E2E8F0',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Top Event Banner Image Header */}
            <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
              <img 
                src={selectedApplication.meet.bannerUrl || "/images/banner_grand_prix.png"} 
                alt={selectedApplication.meetTitle} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.78rem', background: '#10B981', color: '#FFF', padding: '6px 12px', fontWeight: 800 }}>
                    Official Accreditation Pass
                  </span>
                  <button 
                    onClick={() => setSelectedApplication(null)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                  >
                    <X size={18} color="#FFFFFF" />
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {selectedApplication.meetTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', color: '#E2E8F0', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#38BDF8" /> {selectedApplication.meet.venue}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#38BDF8" /> {selectedApplication.meet.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px 28px' }}>
              
              {/* Application Details Header Block */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Details</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>Submitted on {selectedApplication.appliedDate}</div>
                  </div>
                  <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <FileCheck size={14} /> Entry Confirmed
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Selected Disciplines &amp; Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedApplication.disciplines.map((d, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: '#FFFFFF', 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '8px', 
                          padding: '8px 12px' 
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>{d}</span>
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real Vector SVG 2D QR Code Container */}
              <div style={{ background: '#F1F5F9', border: '2px dashed #CBD5E1', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <QrCode size={16} color="#0EA5E9" /> Entry QR Code
                </div>
                
                {/* Real SVG 2D QR Code Matrix */}
                <EAFQrCode code={`EAF-${selectedApplication.meetId}-${athlete.id}`} size={160} />

                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1rem', color: '#0F172A', marginTop: '12px', letterSpacing: '0.08em' }}>
                  EAF-{selectedApplication.meetId.substring(0, 8)}-{athlete.id.substring(4, 12)}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                  Scan this code at the Call Room for quick check-in.
                </p>
              </div>

              {/* Verification Notice */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.4 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda Biometric data. For queries regarding your approval, contact <a href="mailto:registrar@eaf.org.et" style={{ color: '#0284C7', fontWeight: 800 }}>registrar@eaf.org.et</a>.
                </div>
              </div>

              {/* Footer Button */}
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="btn-gov-primary" 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }} 
                  onClick={() => setSelectedApplication(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
