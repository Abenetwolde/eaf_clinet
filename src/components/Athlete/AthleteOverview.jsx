import React, { useState } from 'react';
import {
  ShieldCheck, Navigation, Activity, Award, ArrowRight,
  Weight, TrendingUp, Calendar, Plus, Trash2, Edit3, Save, Trophy
} from 'lucide-react';

export default function AthleteOverview({ athlete, onChangeSubPage, onPayLicense, onUpdateAthlete }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Weight log entry
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Training log entry
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [trainType, setTrainType] = useState('Easy Run');
  const [trainDist, setTrainDist] = useState('');
  const [trainDur, setTrainDur] = useState('');
  const [trainNotes, setTrainNotes] = useState('');
  const [trainDate, setTrainDate] = useState(new Date().toISOString().split('T')[0]);

  // PB entry
  const [showAddPb, setShowAddPb] = useState(false);
  const [pbEvent, setPbEvent] = useState('5,000m');
  const [pbTime, setPbTime] = useState('');
  const [pbDate, setPbDate] = useState(new Date().toISOString().split('T')[0]);
  const [pbVenue, setPbVenue] = useState('');

  // Body stats edit
  const [editingStats, setEditingStats] = useState(false);
  const [editWeight, setEditWeight] = useState(athlete.weight || '');
  const [editHeight, setEditHeight] = useState(athlete.height || '');
  const [editHR, setEditHR] = useState(athlete.restingHR || '');

  const handleAddWeight = () => {
    if (!newWeight) return;
    const updated = {
      ...athlete,
      weight: parseFloat(newWeight),
      weightLog: [{ date: newWeightDate, kg: parseFloat(newWeight) }, ...(athlete.weightLog || [])]
    };
    onUpdateAthlete(updated);
    setNewWeight('');
  };

  const handleAddTraining = () => {
    if (!trainDist || !trainDur) return;
    const entry = { date: trainDate, type: trainType, distance: parseFloat(trainDist), duration: trainDur, notes: trainNotes };
    onUpdateAthlete({ ...athlete, trainingLog: [entry, ...(athlete.trainingLog || [])] });
    setShowAddTraining(false);
    setTrainDist(''); setTrainDur(''); setTrainNotes('');
  };

  const handleAddPb = () => {
    if (!pbTime) return;
    const newPb = { event: pbEvent, time: pbTime, date: pbDate, venue: pbVenue };
    const existing = (athlete.personalBests || []).filter(p => p.event !== pbEvent);
    onUpdateAthlete({ ...athlete, personalBests: [newPb, ...existing] });
    setShowAddPb(false);
    setPbTime(''); setPbVenue('');
  };

  const handleSaveStats = () => {
    onUpdateAthlete({ ...athlete, weight: parseFloat(editWeight), height: parseFloat(editHeight), restingHR: parseFloat(editHR) });
    setEditingStats(false);
  };

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'pbs',       label: 'Personal Bests' },
    { id: 'weight',    label: 'Weight Log' },
    { id: 'training',  label: 'Training Log' },
  ];

  return (
    <div>
      {/* Profile Header */}
      <div className="gov-card" style={{
        padding: '24px', marginBottom: '24px',
        background: 'linear-gradient(135deg, #1A1F2E 0%, #1E2740 100%)',
        border: 'none', color: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <img src={athlete.photoUrl} alt={athlete.name}
              style={{ width: '72px', height: '72px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--accent)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>{athlete.name}</h2>
                <span className="badge badge-green"><ShieldCheck size={12} /> Fayda Verified</span>
                <span className="badge badge-amber">{athlete.ageTier}</span>
              </div>
              <p style={{ color: '#C8A84B', fontWeight: 700, fontSize: '0.9rem' }}>{athlete.amharicName} — {athlete.clubName}</p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.82rem', color: '#8FA8BC' }}>
                <span>FIN: <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{athlete.faydaFin}</strong></span>
                <span>•</span>
                <span>Event: <strong style={{ color: '#FFFFFF' }}>{athlete.primaryEvent}</strong></span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {athlete.licenseStatus !== 'ACTIVE' ? (
              <button onClick={() => onPayLicense(athlete)} className="btn-telebirr">
                Renew License — 500 ETB
              </button>
            ) : (
              <div>
                <span className="badge badge-green" style={{ padding: '6px 12px' }}>✓ {athlete.licenseNumber}</span>
                <div style={{ fontSize: '0.75rem', color: '#8FA8BC', marginTop: '4px' }}>Expires: Dec 31, 2026</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#F0F5FA', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
              background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              color: activeTab === t.id ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(11,87,142,0.25)' : 'none'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div>
          {/* Body Stats */}
          <div className="gov-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Body & Fitness Stats</h4>
              <button onClick={() => setEditingStats(!editingStats)} className="btn-gov-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {editingStats ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
            {editingStats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  ['Weight (kg)', editWeight, setEditWeight],
                  ['Height (cm)', editHeight, setEditHeight],
                  ['Resting HR (bpm)', editHR, setEditHR]
                ].map(([label, val, setter]) => (
                  <div key={label} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>{label}</label>
                    <input className="form-input" type="number" value={val} onChange={e => setter(e.target.value)} />
                  </div>
                ))}
                <button className="btn-gov-primary" style={{ alignSelf: 'flex-end', padding: '10px' }} onClick={handleSaveStats}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="stats-grid">
                {[
                  { label: 'Weight', value: athlete.weight ? `${athlete.weight} kg` : '—', color: 'var(--primary)' },
                  { label: 'Height', value: athlete.height ? `${athlete.height} cm` : '—', color: 'var(--eth-blue)' },
                  { label: 'Resting HR', value: athlete.restingHR ? `${athlete.restingHR} bpm` : '—', color: '#CC0000' },
                  { label: 'Training Load', value: athlete.trainingLoad ?? '—', color: '#92620A' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-value" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick navigation cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { page: 'RECORDS', icon: Award, color: '#7C3AED', title: 'Career Records Vault', desc: 'Full competition history, verified split breakdown, and official achievements.' },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.page} className="gov-card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Icon size={20} color={c.color} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{c.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>{c.desc}</p>
                  <button onClick={() => onChangeSubPage(c.page)} className="btn-gov-secondary" style={{ width: '100%', fontSize: '0.82rem', padding: '8px' }}>
                    Open <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PERSONAL BESTS TAB ── */}
      {activeTab === 'pbs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Personal Bests & Season Bests</h4>
            <button className="btn-gov-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => setShowAddPb(true)}>
              <Plus size={14} /> Add PB
            </button>
          </div>

          {/* PB Table */}
          <div className="gov-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#FFFFFF' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>All-Time Personal Bests</span>
            </div>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Time / Result</th>
                    <th>Date</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {(athlete.personalBests || []).length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No personal bests recorded yet</td></tr>
                  ) : (athlete.personalBests || []).map((pb, i) => (
                    <tr key={i}>
                      <td><strong>{pb.event}</strong></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{pb.time}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{pb.date}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{pb.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Season Bests */}
          <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#0050A0', color: '#FFFFFF' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>2026 Season Bests</span>
            </div>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Event</th><th>Time / Result</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {(athlete.seasonBests || []).length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No season bests recorded yet</td></tr>
                  ) : (athlete.seasonBests || []).map((sb, i) => (
                    <tr key={i}>
                      <td><strong>{sb.event}</strong></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0050A0' }}>{sb.time}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{sb.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add PB Modal */}
          {showAddPb && (
            <div className="modal-backdrop" onClick={() => setShowAddPb(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Add Personal Best</h3>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select className="form-select" value={pbEvent} onChange={e => setPbEvent(e.target.value)}>
                    {['100m','200m','400m','800m','1,500m','3,000m','5,000m','10,000m','Half Marathon','Marathon','3,000m Steeplechase','110m Hurdles','Long Jump','Triple Jump','High Jump','Shot Put','Discus','Javelin'].map(ev => (
                      <option key={ev}>{ev}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time / Result (e.g. 12:51.44 or 7.98m)</label>
                  <input className="form-input" value={pbTime} onChange={e => setPbTime(e.target.value)} placeholder="12:51.44" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={pbDate} onChange={e => setPbDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue / Competition</label>
                    <input className="form-input" value={pbVenue} onChange={e => setPbVenue(e.target.value)} placeholder="National Championship" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => setShowAddPb(false)}>Cancel</button>
                  <button className="btn-gov-primary" style={{ flex: 2 }} onClick={handleAddPb}>Save Personal Best</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEIGHT LOG TAB ── */}
      {activeTab === 'weight' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            {/* Add entry */}
            <div className="gov-card">
              <h4 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>Log Weight</h4>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 62.5" />
              </div>
              <button className="btn-gov-primary" style={{ width: '100%' }} onClick={handleAddWeight}>
                <Plus size={14} /> Log Entry
              </button>
            </div>

            {/* History */}
            <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#FFFFFF' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Weight History</span>
              </div>
              <div className="table-responsive">
                <table className="gov-table">
                  <thead>
                    <tr><th>Date</th><th>Weight (kg)</th><th>Change</th></tr>
                  </thead>
                  <tbody>
                    {(athlete.weightLog || []).length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No entries yet</td></tr>
                    ) : (athlete.weightLog || []).map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const change = prev ? (entry.kg - prev.kg).toFixed(1) : null;
                      return (
                        <tr key={i}>
                          <td>{entry.date}</td>
                          <td><strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{entry.kg} kg</strong></td>
                          <td>
                            {change !== null ? (
                              <span style={{ color: parseFloat(change) < 0 ? 'var(--primary)' : parseFloat(change) > 0 ? '#CC0000' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                                {parseFloat(change) > 0 ? '+' : ''}{change} kg
                              </span>
                            ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAINING LOG TAB ── */}
      {activeTab === 'training' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Training Log</h4>
            <button className="btn-gov-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => setShowAddTraining(true)}>
              <Plus size={14} /> Log Session
            </button>
          </div>

          <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Distance</th><th>Duration</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {(athlete.trainingLog || []).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No training sessions logged</td></tr>
                  ) : (athlete.trainingLog || []).map((s, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)' }}>{s.date}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: '5px', fontSize: '0.8rem' }}>{s.type}</span>
                      </td>
                      <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{s.distance} km</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.duration}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{s.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Training Modal */}
          {showAddTraining && (
            <div className="modal-backdrop" onClick={() => setShowAddTraining(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '460px' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Log Training Session</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={trainDate} onChange={e => setTrainDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Session Type</label>
                    <select className="form-select" value={trainType} onChange={e => setTrainType(e.target.value)}>
                      {['Easy Run','Long Run','Tempo Run','Track Work','Speed Work','Fartlek','Hill Repeats','Recovery Run','Cross Training','Strength & Conditioning'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Distance (km)</label>
                    <input className="form-input" type="number" step="0.1" value={trainDist} onChange={e => setTrainDist(e.target.value)} placeholder="e.g. 16" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input className="form-input" value={trainDur} onChange={e => setTrainDur(e.target.value)} placeholder="e.g. 1h 05m" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={2} value={trainNotes} onChange={e => setTrainNotes(e.target.value)} placeholder="e.g. 5×1000m at race pace, feeling strong" style={{ resize: 'vertical', width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => setShowAddTraining(false)}>Cancel</button>
                  <button className="btn-gov-primary" style={{ flex: 2 }} onClick={handleAddTraining}>Save Session</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
