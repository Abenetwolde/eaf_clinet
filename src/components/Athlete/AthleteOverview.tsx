import React, { useState } from 'react';
import {
  ShieldCheck, Navigation, Activity, Award, ArrowRight,
  Weight, TrendingUp, Calendar, Plus, Trash2, Edit3, Save, Trophy
} from 'lucide-react';
import type { Athlete } from '../../types';

interface AthleteOverviewProps {
  athlete: Athlete;
  onChangeSubPage: (page: string) => void;
  onPayLicense: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
}

export default function AthleteOverview({ athlete, onChangeSubPage, onPayLicense, onUpdateAthlete }: AthleteOverviewProps) {
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
    onUpdateAthlete({ ...athlete, weight: parseFloat(editWeight as string), height: parseFloat(editHeight as string), restingHR: parseFloat(editHR as string) });
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
      <div className="gov-card p-6 mb-6 bg-gradient-to-br from-[#1A1F2E] to-[#1E2740] border-0 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-[18px]">
            <img src={athlete.photoUrl} alt={athlete.name}
              className="w-[72px] h-[72px] rounded-[14px] object-cover border-2 border-accent" />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-[1.6rem] font-black text-white">{athlete.name}</h2>
                <span className="badge badge-green"><ShieldCheck size={12} /> Fayda Verified</span>
                <span className="badge badge-amber">{athlete.ageTier}</span>
              </div>
              <p className="text-[#C8A84B] font-bold text-[0.9rem]">{athlete.amharicName} — {athlete.clubName}</p>
              <div className="flex gap-[14px] mt-1.5 text-[0.82rem] text-[#8FA8BC]">
                <span>FIN: <strong className="text-white font-mono">{athlete.faydaFin}</strong></span>
                <span>•</span>
                <span>Event: <strong className="text-white">{athlete.primaryEvent}</strong></span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {athlete.licenseStatus !== 'ACTIVE' ? (
              <button onClick={() => onPayLicense(athlete)} className="btn-telebirr">
                Renew License — 500 ETB
              </button>
            ) : (
              <div>
                <span className="badge badge-green px-3 py-1.5">✓ {athlete.licenseNumber}</span>
                <div className="text-[0.75rem] text-[#8FA8BC] mt-1">Expires: Dec 31, 2026</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-6 bg-[#F0F5FA] p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-[18px] py-2 rounded-[9px] border-0 cursor-pointer font-bold text-[0.85rem] transition-all duration-150 ${activeTab === t.id ? 'bg-primary text-white shadow-[0_2px_8px_rgba(11,87,142,0.25)]' : 'bg-transparent text-text-muted shadow-none'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div>
          {/* Body Stats */}
          <div className="gov-card mb-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold">Body & Fitness Stats</h4>
              <button onClick={() => setEditingStats(!editingStats)} className="btn-gov-secondary px-3 py-1.5 text-[0.8rem]">
                {editingStats ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
            {editingStats ? (
              <div className="grid grid-cols-3 gap-3">
                {([
                  ['Weight (kg)', editWeight, setEditWeight],
                  ['Height (cm)', editHeight, setEditHeight],
                  ['Resting HR (bpm)', editHR, setEditHR]
                ] as Array<[string, string | number, React.Dispatch<React.SetStateAction<string | number>>]>).map(([label, val, setter]) => (
                  <div key={label} className="form-group mb-0">
                    <label className="form-label text-[0.76rem]">{label}</label>
                    <input className="form-input" type="number" value={val} onChange={e => setter(e.target.value)} />
                  </div>
                ))}
                <button className="btn-gov-primary self-end p-[10px]" onClick={handleSaveStats}>
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
                    <div className="stat-value text-[1.4rem]" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick navigation cards */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {[
              { page: 'RECORDS', icon: Award, color: '#7C3AED', title: 'Career Records Vault', desc: 'Full competition history, verified split breakdown, and official achievements.' },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.page} className="gov-card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Icon size={20} color={c.color} />
                    <h3 className="text-[0.95rem] font-bold">{c.title}</h3>
                  </div>
                  <p className="text-[0.82rem] text-text-muted mb-3.5 leading-normal">{c.desc}</p>
                  <button onClick={() => onChangeSubPage(c.page)} className="btn-gov-secondary w-full text-[0.82rem] p-2">
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
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-[1.1rem] font-extrabold">Personal Bests & Season Bests</h4>
            <button className="btn-gov-primary px-3.5 py-2 text-[0.82rem]" onClick={() => setShowAddPb(true)}>
              <Plus size={14} /> Add PB
            </button>
          </div>

          {/* PB Table */}
          <div className="gov-card p-0 overflow-hidden mb-6">
            <div className="px-5 py-3.5 bg-primary text-white">
              <span className="text-[0.85rem] font-extrabold">All-Time Personal Bests</span>
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
                    <tr><td colSpan={4} className="text-center text-text-muted p-6">No personal bests recorded yet</td></tr>
                  ) : (athlete.personalBests || []).map((pb, i) => (
                    <tr key={i}>
                      <td><strong>{pb.event}</strong></td>
                      <td><span className="font-mono font-extrabold text-primary text-base">{pb.time}</span></td>
                      <td className="text-text-muted">{pb.date}</td>
                      <td className="text-text-muted">{pb.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Season Bests */}
          <div className="gov-card p-0 overflow-hidden">
            <div className="px-5 py-3.5 bg-[#0050A0] text-white">
              <span className="text-[0.85rem] font-extrabold">2026 Season Bests</span>
            </div>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Event</th><th>Time / Result</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {(athlete.seasonBests || []).length === 0 ? (
                    <tr><td colSpan={3} className="text-center text-text-muted p-6">No season bests recorded yet</td></tr>
                  ) : (athlete.seasonBests || []).map((sb, i) => (
                    <tr key={i}>
                      <td><strong>{sb.event}</strong></td>
                      <td><span className="font-mono font-extrabold text-[#0050A0]">{sb.time}</span></td>
                      <td className="text-text-muted">{sb.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add PB Modal */}
          {showAddPb && (
            <div className="modal-backdrop" onClick={() => setShowAddPb(false)}>
              <div className="modal-content p-7 max-w-[440px]" onClick={e => e.stopPropagation()}>
                <h3 className="font-extrabold mb-5">Add Personal Best</h3>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={pbDate} onChange={e => setPbDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue / Competition</label>
                    <input className="form-input" value={pbVenue} onChange={e => setPbVenue(e.target.value)} placeholder="National Championship" />
                  </div>
                </div>
                <div className="flex gap-2.5 mt-2">
                  <button className="btn-gov-secondary flex-1" onClick={() => setShowAddPb(false)}>Cancel</button>
                  <button className="btn-gov-primary flex-[2]" onClick={handleAddPb}>Save Personal Best</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEIGHT LOG TAB ── */}
      {activeTab === 'weight' && (
        <div>
          <div className="grid grid-cols-[1fr_2fr] gap-5">
            {/* Add entry */}
            <div className="gov-card">
              <h4 className="text-base font-extrabold mb-4">Log Weight</h4>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 62.5" />
              </div>
              <button className="btn-gov-primary w-full" onClick={handleAddWeight}>
                <Plus size={14} /> Log Entry
              </button>
            </div>

            {/* History */}
            <div className="gov-card p-0 overflow-hidden">
              <div className="px-5 py-3.5 bg-primary text-white">
                <span className="text-[0.85rem] font-extrabold">Weight History</span>
              </div>
              <div className="table-responsive">
                <table className="gov-table">
                  <thead>
                    <tr><th>Date</th><th>Weight (kg)</th><th>Change</th></tr>
                  </thead>
                  <tbody>
                    {(athlete.weightLog || []).length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-text-muted p-6">No entries yet</td></tr>
                    ) : (athlete.weightLog || []).map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const change = prev ? (entry.kg - prev.kg).toFixed(1) : null;
                      return (
                        <tr key={i}>
                          <td>{entry.date}</td>
                          <td><strong className="font-mono text-primary">{entry.kg} kg</strong></td>
                          <td>
                            {change !== null ? (
                              <span className="font-bold text-[0.85rem]" style={{ color: parseFloat(change) < 0 ? 'var(--primary)' : parseFloat(change) > 0 ? '#CC0000' : 'var(--text-muted)' }}>
                                {parseFloat(change) > 0 ? '+' : ''}{change} kg
                              </span>
                            ) : <span className="text-text-dim">—</span>}
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
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-[1.1rem] font-extrabold">Training Log</h4>
            <button className="btn-gov-primary px-3.5 py-2 text-[0.82rem]" onClick={() => setShowAddTraining(true)}>
              <Plus size={14} /> Log Session
            </button>
          </div>

          <div className="gov-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Distance</th><th>Duration</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {(athlete.trainingLog || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-text-muted p-6">No training sessions logged</td></tr>
                  ) : (athlete.trainingLog || []).map((s, i) => (
                    <tr key={i}>
                      <td className="text-text-muted">{s.date}</td>
                      <td>
                        <span className="font-bold text-primary bg-primary-light px-2 py-[3px] rounded-[5px] text-[0.8rem]">{s.type}</span>
                      </td>
                      <td><strong className="font-mono">{s.distance} km</strong></td>
                      <td className="text-text-muted">{s.duration}</td>
                      <td className="text-[0.82rem] text-text-muted max-w-[200px]">{s.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Training Modal */}
          {showAddTraining && (
            <div className="modal-backdrop" onClick={() => setShowAddTraining(false)}>
              <div className="modal-content p-7 max-w-[460px]" onClick={e => e.stopPropagation()}>
                <h3 className="font-extrabold mb-5">Log Training Session</h3>
                <div className="grid grid-cols-2 gap-3">
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
                  <textarea className="form-textarea resize-y w-full" rows={2} value={trainNotes} onChange={e => setTrainNotes(e.target.value)} placeholder="e.g. 5×1000m at race pace, feeling strong" />
                </div>
                <div className="flex gap-2.5">
                  <button className="btn-gov-secondary flex-1" onClick={() => setShowAddTraining(false)}>Cancel</button>
                  <button className="btn-gov-primary flex-[2]" onClick={handleAddTraining}>Save Session</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
