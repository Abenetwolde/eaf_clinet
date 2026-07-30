import React, { useState } from 'react';
import { Calendar, MapPin, CheckCircle2, AlertCircle, Clock, X, Trophy } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';

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
      meetId: "MEET-2026-04",
      meetTitle: "Oromia Athletics Championship 2026",
      disciplines: ["5,000m", "10,000m"],
      status: "Completed",
      appliedDate: "2026-06-10"
    },
    {
      meetId: "MEET-2026-02",
      meetTitle: "Ethiopian National Youth Olympic Games U18/U20",
      disciplines: ["1,500m"],
      status: "Closed",
      appliedDate: "2026-07-20"
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
    // Find detailed meet information
    const meetDetails = MOCK_MEETS.find(m => m.id === app.meetId) || {
      title: app.meetTitle,
      venue: "Addis Ababa National Stadium",
      date: "August 12-14, 2026",
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
                <th>Competition</th>
                <th>Applied Date</th>
                <th>Disciplines</th>
                <th>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleRowClick(app)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  className="hover-row"
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{app.meetTitle}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {app.meetId}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.appliedDate}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {app.disciplines.map((d, i) => (
                        <span key={i} className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-gov-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(app);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApplication && (
        <div className="modal-backdrop" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '520px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-heading)' }}>
                  Application Details
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Submitted on {selectedApplication.appliedDate}
                </p>
              </div>
              <button 
                onClick={() => setSelectedApplication(null)} 
                style={{ background: '#F1F5F9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>

            {/* Meet summary card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: '10px' }}>
                {selectedApplication.meetTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--primary)" /> {selectedApplication.meet.venue}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color="var(--accent)" /> {selectedApplication.meet.date}
                </div>
              </div>
            </div>

            {/* Application status block */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Selected Disciplines &amp; Status
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedApplication.disciplines.map((d, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: '#F0FDF4', 
                      border: '1px solid #DCFCE7', 
                      borderRadius: '8px', 
                      padding: '10px 14px' 
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#15803D' }}>{d}</span>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional info notice */}
            {selectedApplication.status.toLowerCase() === 'approved' && (
              <div style={{ background: '#FFFFFF', border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '4px' }}>Entry QR Code</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Scan this code at the Call Room for quick check-in.</p>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '12px', display: 'inline-block', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '120px', height: '120px', background: 'repeating-linear-gradient(45deg, #0F172A 0, #0F172A 10px, #FFFFFF 10px, #FFFFFF 20px), repeating-linear-gradient(135deg, #0F172A 0, #0F172A 10px, #FFFFFF 10px, #FFFFFF 20px)', backgroundBlendMode: 'multiply', borderRadius: '8px' }}></div>
                </div>
                <div style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                  EAF-{selectedApplication.meetId.substring(0, 8)}-{athlete.id.substring(4, 12)}
                </div>
              </div>
            )}

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#1E40AF', lineHeight: 1.4 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda Biometric data. For queries regarding your approval, contact registrar@eaf.org.et.
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-gov-primary" style={{ width: '100%', padding: '12px' }} onClick={() => setSelectedApplication(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
