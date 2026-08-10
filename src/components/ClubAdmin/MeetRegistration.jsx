import React, { useState } from 'react';
import {
  Trophy, Calendar, MapPin, CheckCircle2, FileSpreadsheet,
  ArrowRight, UserCheck, X, Users, ShieldCheck, AlertTriangle,
  Medal, List, UserPlus, ChevronDown, ChevronUp
} from 'lucide-react';
import { MOCK_MEETS, MOCK_EVENT_RESULTS } from '../../data/mockData';

const MEDAL_COLORS = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

export default function MeetRegistration({ club, athletes, onNotify }) {
  const [meets, setMeets] = useState(MOCK_MEETS);
  const [activeTab, setActiveTab] = useState('enroll');   // 'enroll' | 'results'
  const [selectedMeet, setSelectedMeet] = useState(null); // meet id for results drill-down
  const [expandedDisc, setExpandedDisc] = useState(null); // discipline name in results

  // Enrollment state
  const [rosterModal, setRosterModal] = useState(null);
  const [selections, setSelections] = useState({});

  const clubAthletes = athletes.filter(a => a.clubId === club.id);

  // ── enrollment helpers ──
  const toggleAthlete = (meetId, discipline, athleteId) => {
    setSelections(prev => {
      const meetSel = { ...(prev[meetId] || {}) };
      const discSet = new Set(meetSel[discipline] || []);
      discSet.has(athleteId) ? discSet.delete(athleteId) : discSet.add(athleteId);
      meetSel[discipline] = discSet;
      return { ...prev, [meetId]: meetSel };
    });
  };

  const getSelectedCount = (meetId) => {
    const s = selections[meetId] || {};
    return Object.values(s).reduce((t, set) => t + set.size, 0);
  };

  const handleConfirmEntry = (meetId) => {
    const count = getSelectedCount(meetId);
    if (count === 0) { onNotify('Select at least one athlete before enrolling.', 'error'); return; }
    setMeets(prev => prev.map(m => {
      if (m.id !== meetId) return m;
      const meetSel = selections[meetId] || {};
      const enrolled = [];
      Object.entries(meetSel).forEach(([disc, ids]) => {
        ids.forEach(id => {
          const ath = clubAthletes.find(a => a.id === id);
          if (ath) enrolled.push({ athleteId: id, athleteName: ath.name, discipline: disc });
        });
      });
      return { ...m, isClubRegistered: true, enrolledAthletes: [...(m.enrolledAthletes || []), ...enrolled], enrolledClubsCount: m.enrolledClubsCount + 1 };
    }));
    onNotify(`${count} entr${count > 1 ? 'ies' : 'y'} submitted for ${meets.find(m => m.id === meetId)?.title}`, 'success');
    setRosterModal(null);
  };

  const currentMeet = rosterModal ? meets.find(m => m.id === rosterModal.meetId) : null;
  const discAthleteSel = rosterModal ? new Set((selections[rosterModal.meetId]?.[rosterModal.discipline]) || []) : new Set();

  // ── results data ──
  const resultsForMeet = selectedMeet ? (MOCK_EVENT_RESULTS[selectedMeet] || []) : [];

  return (
    <div>
      {/* Page header + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Meet Registrations & Results</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Enroll club athletes per discipline or view official event results.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#F0F5FA', padding: '4px', borderRadius: '10px' }}>
          {[{ id: 'enroll', label: 'Enroll Athletes', icon: UserPlus }, { id: 'results', label: 'Event Results', icon: Medal }].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '8px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px',
                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                color: activeTab === t.id ? '#FFFFFF' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(11,87,142,0.25)' : 'none',
                transition: 'all 0.15s'
              }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ENROLL TAB ── */}
      {activeTab === 'enroll' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {meets.map(meet => {
            const selected = getSelectedCount(meet.id);
            const enrolled = (meet.enrolledAthletes || []).filter(e => clubAthletes.find(a => a.id === e.athleteId));
            return (
              <div key={meet.id} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-card)', background: '#FFFFFF', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(13,20,40,0.05)' }}>
                {/* Meet image header */}
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <img src={meet.bannerUrl} alt={meet.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,20,40,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span className={`badge ${meet.status === 'REGISTRATION_OPEN' ? 'badge-green' : meet.status === 'UPCOMING' ? 'badge-amber' : 'badge-blue'}`}>
                      {meet.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#C8A84B', fontWeight: 800 }}>{meet.enrolledClubsCount} clubs</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.35 }}>{meet.title}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} color="var(--primary)" /> {meet.venue}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} color="#92620A" /> {meet.date}</div>
                  </div>

                  {/* Disciplines */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Click discipline to assign athletes:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {meet.disciplines.map((disc, idx) => {
                        const discSel = selections[meet.id]?.[disc]?.size || 0;
                        const isEnrolled = meet.isClubRegistered && (meet.enrolledAthletes || []).some(e => e.discipline === disc && clubAthletes.find(a => a.id === e.athleteId));
                        return (
                          <button key={idx}
                            disabled={meet.status === 'UPCOMING' || (meet.isClubRegistered && isEnrolled)}
                            onClick={() => setRosterModal({ meetId: meet.id, discipline: disc })}
                            style={{
                              background: isEnrolled ? 'var(--primary-light)' : discSel > 0 ? 'rgba(11,87,142,0.08)' : '#F0F5FA',
                              border: `1px solid ${isEnrolled ? 'rgba(11,87,142,0.3)' : discSel > 0 ? 'rgba(11,87,142,0.4)' : '#C8D8E5'}`,
                              borderRadius: '5px', padding: '4px 9px', fontSize: '0.72rem', fontWeight: 700,
                              color: isEnrolled ? 'var(--primary)' : discSel > 0 ? 'var(--primary)' : 'var(--text-body)',
                              cursor: meet.status === 'UPCOMING' ? 'not-allowed' : 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                            {isEnrolled ? <CheckCircle2 size={10} /> : <ArrowRight size={10} />}
                            {disc}
                            {discSel > 0 && !isEnrolled && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '8px', padding: '0 5px', fontSize: '0.64rem' }}>{discSel}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {enrolled.length > 0 && (
                    <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.2)', borderRadius: '7px', padding: '8px 11px', marginBottom: '10px', fontSize: '0.76rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>✓ {enrolled.length} entries submitted: </span>
                      <span style={{ color: 'var(--text-muted)' }}>{enrolled.map(e => e.athleteName).join(', ')}</span>
                    </div>
                  )}

                  {/* Action */}
                  <div style={{ marginTop: 'auto' }}>
                    {meet.status === 'UPCOMING' ? (
                      <button className="btn-gov-secondary" style={{ width: '100%', fontSize: '0.8rem' }} disabled>Registration Not Open Yet</button>
                    ) : meet.isClubRegistered ? (
                      <div style={{ display: 'flex', gap: '7px' }}>
                        <button className="btn-gov-secondary" style={{ flex: 1, fontSize: '0.78rem' }} disabled>
                          <CheckCircle2 size={12} color="var(--primary)" /> Enrolled
                        </button>
                        <button onClick={() => onNotify('Downloading Entry Form PDF...', 'info')} className="btn-gov-secondary" style={{ fontSize: '0.78rem', padding: '10px 11px' }}>
                          <FileSpreadsheet size={12} />
                        </button>
                      </div>
                    ) : (
                      <button className="btn-gov-primary" style={{ width: '100%', fontSize: '0.82rem', padding: '10px' }}
                        onClick={() => handleConfirmEntry(meet.id)} disabled={selected === 0}>
                        {selected > 0 ? `Submit ${selected} Entr${selected > 1 ? 'ies' : 'y'}` : 'Select Athletes to Enroll'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {activeTab === 'results' && (
        <div>
          {/* Meet selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '28px' }}>
            {meets.map(meet => {
              const hasResults = !!(MOCK_EVENT_RESULTS[meet.id]);
              const isSelected = selectedMeet === meet.id;
              return (
                <div key={meet.id}
                  onClick={() => hasResults ? setSelectedMeet(isSelected ? null : meet.id) : null}
                  style={{
                    borderRadius: '14px', overflow: 'hidden', cursor: hasResults ? 'pointer' : 'default',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-card)'}`,
                    boxShadow: isSelected ? '0 0 0 3px rgba(11,87,142,0.12)' : 'none',
                    transition: 'all 0.2s', opacity: hasResults ? 1 : 0.55
                  }}>
                  <div style={{ position: 'relative', height: '120px' }}>
                    <img src={meet.bannerUrl} alt={meet.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,40,0.55)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px', padding: '12px' }}>
                      <h4 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.3 }}>{meet.title}</h4>
                      <span style={{ fontSize: '0.72rem', color: hasResults ? '#8FA8BC' : '#8FA8BC', fontWeight: 700 }}>
                        {hasResults ? `${MOCK_EVENT_RESULTS[meet.id].length} events with results` : 'Results not yet published'}
                      </span>
                    </div>
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results table */}
          {selectedMeet && resultsForMeet.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-heading)' }}>
                Official Results — {meets.find(m => m.id === selectedMeet)?.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resultsForMeet.map((evResult, ei) => {
                  const isExpanded = expandedDisc === evResult.discipline;
                  return (
                    <div key={ei} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
                      {/* Event header */}
                      <button
                        onClick={() => setExpandedDisc(isExpanded ? null : evResult.discipline)}
                        style={{
                          width: '100%', padding: '14px 18px', background: isExpanded ? '#1A1F2E' : '#F5FAF6',
                          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background 0.15s'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Trophy size={16} color={isExpanded ? '#C8A84B' : 'var(--primary)'} />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isExpanded ? '#FFFFFF' : 'var(--text-heading)' }}>
                            {evResult.discipline}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isExpanded ? '#8FA8BC' : 'var(--text-muted)' }}>
                            {evResult.results.length} athletes
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {evResult.results[0] && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isExpanded ? '#C8A84B' : 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                              🥇 {evResult.results[0].athleteName.split(' ')[0]} — {evResult.results[0].time}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp size={16} color={isExpanded ? '#8FA8BC' : 'var(--text-muted)'} /> : <ChevronDown size={16} color="var(--text-muted)" />}
                        </div>
                      </button>

                      {/* Expanded results */}
                      {isExpanded && (
                        <div className="table-responsive">
                          <table className="gov-table">
                            <thead>
                              <tr>
                                <th>Pos</th>
                                <th>Athlete</th>
                                <th>Club</th>
                                <th>Time / Result</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evResult.results.map((r, ri) => (
                                <tr key={ri} style={{ background: ri === 0 ? 'rgba(200,168,75,0.05)' : undefined }}>
                                  <td>
                                    <div style={{
                                      width: '28px', height: '28px', borderRadius: '50%',
                                      background: MEDAL_COLORS[r.pos] ? `${MEDAL_COLORS[r.pos]}22` : '#F0F5FA',
                                      border: `2px solid ${MEDAL_COLORS[r.pos] || '#E0E8E1'}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 900, fontSize: '0.8rem',
                                      color: MEDAL_COLORS[r.pos] || 'var(--text-muted)'
                                    }}>
                                      {r.pos <= 3 ? ['🥇','🥈','🥉'][r.pos - 1] : r.pos}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.athleteName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{r.nat}</div>
                                  </td>
                                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.club}</td>
                                  <td>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: r.pos === 1 ? '#C8A84B' : 'var(--primary)', fontSize: '1rem' }}>
                                      {r.time}
                                    </span>
                                  </td>
                                  <td style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                    {r.pb && <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>PB</span>}
                                    {r.sb && <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>SB</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedMeet && resultsForMeet.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <Trophy size={40} color="#D0E0D2" style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 700 }}>No results published yet for this meet.</p>
            </div>
          )}

          {!selectedMeet && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <List size={40} color="#D0E0D2" style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 700 }}>Select a meet above to view event results.</p>
            </div>
          )}
        </div>
      )}

      {/* ── ROSTER PICKER MODAL ── */}
      {rosterModal && currentMeet && (
        <div className="modal-backdrop" onClick={() => setRosterModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '26px', maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '3px' }}>Select Athletes — {rosterModal.discipline}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{currentMeet.title}</p>
              </div>
              <button onClick={() => setRosterModal(null)} style={{ background: '#F1F5F1', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '360px', overflowY: 'auto', marginBottom: '18px' }}>
              {clubAthletes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No athletes in club roster</p>
              ) : clubAthletes.map(ath => {
                const checked = discAthleteSel.has(ath.id);
                const eligible = ath.licenseStatus === 'ACTIVE' && ath.faydaStatus === 'VERIFIED';
                return (
                  <label key={ath.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 13px', borderRadius: '10px',
                    cursor: eligible ? 'pointer' : 'not-allowed', opacity: eligible ? 1 : 0.5,
                    border: `1px solid ${checked ? 'rgba(11,87,142,0.4)' : '#D0E0D2'}`,
                    background: checked ? 'var(--primary-light)' : eligible ? '#FFFFFF' : '#F8FAF8',
                    transition: 'all 0.12s'
                  }}>
                    <input type="checkbox" checked={checked} disabled={!eligible}
                      onChange={() => eligible && toggleAthlete(rosterModal.meetId, rosterModal.discipline, ath.id)} />
                    <img src={ath.photoUrl} alt={ath.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ath.name}</span>
                        <span className={`badge ${ath.ageTier === 'Senior' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>{ath.ageTier}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {ath.primaryEvent}{ath.personalBests?.[0] ? ` · PB ${ath.personalBests[0].time}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      {ath.faydaStatus === 'VERIFIED'
                        ? <span className="badge badge-green" style={{ fontSize: '0.6rem' }}><ShieldCheck size={9} /> Fayda</span>
                        : <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}><AlertTriangle size={9} /> Unverified</span>}
                      {ath.licenseStatus === 'ACTIVE'
                        ? <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Licensed</span>
                        : <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>No License</span>}
                    </div>
                  </label>
                );
              })}
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              * Only Fayda-verified & licensed athletes are selectable. Renew licenses from Roster Management.
            </p>
            <div style={{ display: 'flex', gap: '9px' }}>
              <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => setRosterModal(null)}>Cancel</button>
              <button className="btn-gov-primary" style={{ flex: 2 }} onClick={() => setRosterModal(null)}>
                <UserCheck size={14} /> Confirm ({discAthleteSel.size} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
