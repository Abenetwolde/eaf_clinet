import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, CheckCircle2, X, ShieldCheck, AlertTriangle, Users } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';

export default function AthleteEvents({ athlete, onUpdateAthlete, onNotify }) {
  const [meets, setMeets] = useState(MOCK_MEETS.map(m => ({ ...m, athleteEnrolled: false, enrolledDiscipline: null })));
  const [enrollModal, setEnrollModal] = useState(null); // { meet }
  const [selectedDisc, setSelectedDisc] = useState('');

  const canEnroll = athlete.faydaStatus === 'VERIFIED' && athlete.licenseStatus === 'ACTIVE';

  const handleEnroll = () => {
    if (!selectedDisc) { onNotify('Please select a discipline.', 'error'); return; }
    
    // 1. Update local meets state
    setMeets(prev => prev.map(m =>
      m.id === enrollModal.id
        ? { ...m, athleteEnrolled: true, enrolledDiscipline: selectedDisc, totalAthletesEnrolled: m.totalAthletesEnrolled + 1 }
        : m
    ));

    // 2. Persist to athlete profile (localStorage)
    const newApplication = {
      meetId: enrollModal.id,
      meetTitle: enrollModal.title,
      disciplines: [selectedDisc],
      status: "Approved", // Auto-approved for this flow
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    const existingApps = athlete.appliedCompetitions || [];
    onUpdateAthlete({
      ...athlete,
      appliedCompetitions: [newApplication, ...existingApps]
    });

    onNotify(`Enrolled in ${selectedDisc} at ${enrollModal.title}!`, 'success');
    setEnrollModal(null);
    setSelectedDisc('');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          Event Registration
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Register directly for sanctioned EAF competitions as an individual athlete
        </p>
      </div>

      {/* Eligibility banner */}
      {!canEnroll && (
        <div style={{ background: '#FEF9EC', border: '1px solid #F5D76E', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#D97706" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92600A' }}>Eligibility Requirements Not Met</div>
            <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '2px' }}>
              You need a verified Fayda ID and an active license to register for events.
              {athlete.faydaStatus !== 'VERIFIED' && ' → Complete Fayda verification.'}
              {athlete.licenseStatus !== 'ACTIVE' && ' → Renew your EAF license (500 ETB).'}
            </div>
          </div>
        </div>
      )}

      {canEnroll && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.2)', borderRadius: '12px', padding: '12px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            Fayda verified &amp; license active — you are eligible to register for events below.
          </div>
        </div>
      )}

      {/* Meet cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {meets.map(meet => (
          <div key={meet.id} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-card)', background: '#FFFFFF', boxShadow: '0 1px 4px rgba(11,42,66,0.05)', display: 'flex', flexDirection: 'column' }}>
            {/* Image header */}
            <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
              <img src={meet.bannerUrl} alt={meet.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span className={`badge ${meet.status === 'REGISTRATION_OPEN' ? 'badge-primary' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                  {meet.status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C8A84B' }}>
                  <Users size={11} style={{ display: 'inline', marginRight: 3 }} />{meet.totalAthletesEnrolled} athletes
                </span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.35, color: 'var(--text-heading)' }}>{meet.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12} color="var(--primary)" /> {meet.venue}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} color="var(--accent)" /> {meet.date}</div>
              </div>

              {/* Disciplines */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {meet.disciplines.slice(0, 4).map((d, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '5px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}>{d}</span>
                ))}
                {meet.disciplines.length > 4 && (
                  <span style={{ background: '#F1F5F9', color: 'var(--text-muted)', borderRadius: '5px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}>+{meet.disciplines.length - 4} more</span>
                )}
              </div>

              {/* Enrolled summary */}
              {meet.athleteEnrolled && (
                <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 5 }} />
                  Enrolled in: {meet.enrolledDiscipline}
                </div>
              )}

              {/* Action */}
              <div style={{ marginTop: 'auto' }}>
                {meet.status === 'UPCOMING' ? (
                  <button className="btn-gov-secondary" style={{ width: '100%', fontSize: '0.82rem' }} disabled>
                    Registration Not Open Yet
                  </button>
                ) : meet.athleteEnrolled ? (
                  <button className="btn-gov-secondary" style={{ width: '100%', fontSize: '0.82rem' }} disabled>
                    <CheckCircle2 size={13} /> Registered
                  </button>
                ) : (
                  <button
                    className="btn-gov-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '11px', opacity: canEnroll ? 1 : 0.5 }}
                    disabled={!canEnroll}
                    onClick={() => { setEnrollModal(meet); setSelectedDisc(''); }}
                  >
                    <Trophy size={14} /> Register for This Event
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {enrollModal && (
        <div className="modal-backdrop" onClick={() => setEnrollModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem' }}>Register for Event</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>{enrollModal.title}</p>
              </div>
              <button onClick={() => setEnrollModal(null)} style={{ background: '#F1F5F9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>

            {/* Meet banner in modal */}
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '100px', marginBottom: '20px' }}>
              <img src={enrollModal.bannerUrl} alt={enrollModal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '12px', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />{enrollModal.venue}
                <span style={{ marginLeft: '12px' }}><Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />{enrollModal.date}</span>
              </div>
            </div>

            {/* Athlete identity (read-only from Fayda) */}
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Registering as:</div>
              <div style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-heading)' }}>{athlete.name}</strong>
                {' '}&nbsp;·&nbsp; FIN: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{athlete.faydaFin}</span>
                {' '}&nbsp;·&nbsp; {athlete.ageTier}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Discipline</label>
              <select className="form-select" value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)}>
                <option value="">— Choose a discipline —</option>
                {enrollModal.disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => setEnrollModal(null)}>Cancel</button>
              <button className="btn-gov-primary" style={{ flex: 2 }} onClick={handleEnroll} disabled={!selectedDisc}>
                <CheckCircle2 size={15} /> Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
