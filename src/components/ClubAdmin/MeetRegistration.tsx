import React, { useState } from 'react';
import {
  Trophy, Calendar, MapPin, CheckCircle2, FileSpreadsheet,
  ArrowRight, UserCheck, X, Users, ShieldCheck, AlertTriangle,
  Medal, List, UserPlus, ChevronDown, ChevronUp
} from 'lucide-react';
import { MOCK_MEETS, MOCK_EVENT_RESULTS } from '../../data/mockData';
import type { Club, Athlete } from '../../types';

const MEDAL_COLORS: Record<number, string> = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

interface MeetRegistrationProps {
  club: Club;
  athletes: Athlete[];
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface EnrolledAthlete {
  athleteId: string;
  athleteName: string;
  discipline: string;
}

interface MeetCard {
  id: string;
  title: string;
  venue: string;
  date: string;
  status: string;
  disciplines: string[];
  enrolledClubsCount: number;
  isClubRegistered?: boolean;
  bannerUrl: string;
  enrolledAthletes: any[];
}

interface RosterModalState {
  meetId: string;
  discipline: string;
}

export default function MeetRegistration({ club, athletes, onNotify }: MeetRegistrationProps) {
  const [meets, setMeets] = useState<MeetCard[]>(MOCK_MEETS);
  const [activeTab, setActiveTab] = useState<string>('enroll');   // 'enroll' | 'results'
  const [selectedMeet, setSelectedMeet] = useState<string | null>(null); // meet id for results drill-down
  const [expandedDisc, setExpandedDisc] = useState<string | null>(null); // discipline name in results

  // Enrollment state
  const [rosterModal, setRosterModal] = useState<RosterModalState | null>(null);
  const [selections, setSelections] = useState<Record<string, Record<string, Set<string>>>>({});

  const clubAthletes = athletes.filter(a => a.clubId === club.id);

  // ── enrollment helpers ──
  const toggleAthlete = (meetId: string, discipline: string, athleteId: string) => {
    setSelections(prev => {
      const meetSel = { ...(prev[meetId] || {}) };
      const discSet = new Set(meetSel[discipline] || []);
      discSet.has(athleteId) ? discSet.delete(athleteId) : discSet.add(athleteId);
      meetSel[discipline] = discSet;
      return { ...prev, [meetId]: meetSel };
    });
  };

  const getSelectedCount = (meetId: string) => {
    const s = selections[meetId] || {};
    return Object.values(s).reduce((t, set) => t + set.size, 0);
  };

  const handleConfirmEntry = (meetId: string) => {
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
      <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold">Meet Registrations & Results</h3>
          <p className="text-[0.84rem] text-text-muted mt-[3px]">
            Enroll club athletes per discipline or view official event results.
          </p>
        </div>
        <div className="flex gap-[4px] bg-[var(--bg-surface-variant)] dark:bg-[#0D1220] p-[4px] rounded-[10px]">
          {[{ id: 'enroll', label: 'Enroll Athletes', icon: UserPlus }, { id: 'results', label: 'Event Results', icon: Medal }].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-[16px] py-[8px] rounded-[7px] border-0 cursor-pointer font-bold text-[0.84rem] flex items-center gap-[6px] transition-all duration-150 ${
                activeTab === t.id ? 'bg-primary text-white shadow-[0_2px_8px_rgba(11,87,142,0.25)]' : 'bg-transparent text-text-muted'
              }`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ENROLL TAB ── */}
      {activeTab === 'enroll' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[20px]">
          {meets.map(meet => {
            const selected = getSelectedCount(meet.id);
            const enrolled = (meet.enrolledAthletes || []).filter(e => clubAthletes.find(a => a.id === e.athleteId));
            return (
              <div key={meet.id} className="rounded-[16px] overflow-hidden border border-border-card bg-[var(--bg-card)] flex flex-col shadow-[0_1px_4px_rgba(13,20,40,0.05)]">
                {/* Meet image header */}
                <div className="relative h-[160px] overflow-hidden">
                  <img src={meet.bannerUrl} alt={meet.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,20,40,0.7)] to-transparent" />
                  <div className="absolute bottom-[12px] left-[14px] right-[14px] flex justify-between items-end">
                    <span className={`badge ${meet.status === 'REGISTRATION_OPEN' ? 'badge-green' : meet.status === 'UPCOMING' ? 'badge-amber' : 'badge-blue'}`}>
                      {meet.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[0.72rem] text-[#C8A84B] font-extrabold">{meet.enrolledClubsCount} clubs</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-[16px] flex-1 flex flex-col">
                  <h4 className="text-[1rem] font-extrabold mb-[8px] leading-[1.35]">{meet.title}</h4>
                  <div className="flex flex-col gap-[4px] mb-[12px] text-[0.8rem] text-text-muted">
                    <div className="flex items-center gap-[5px]"><MapPin size={12} color="var(--primary)" /> {meet.venue}</div>
                    <div className="flex items-center gap-[5px]"><Calendar size={12} color="#92620A" /> {meet.date}</div>
                  </div>

                  {/* Disciplines */}
                  <div className="mb-[12px]">
                    <div className="text-[0.68rem] font-extrabold text-text-muted uppercase tracking-[0.05em] mb-[6px]">
                      Click discipline to assign athletes:
                    </div>
                    <div className="flex flex-wrap gap-[5px]">
                      {meet.disciplines.map((disc, idx) => {
                        const discSel = selections[meet.id]?.[disc]?.size || 0;
                        const isEnrolled = meet.isClubRegistered && (meet.enrolledAthletes || []).some(e => e.discipline === disc && clubAthletes.find(a => a.id === e.athleteId));
                        return (
                          <button key={idx}
                            disabled={meet.status === 'UPCOMING' || (meet.isClubRegistered && isEnrolled)}
                            onClick={() => setRosterModal({ meetId: meet.id, discipline: disc })}
                            className={`rounded-[5px] px-[9px] py-[4px] text-[0.72rem] font-bold inline-flex items-center gap-[4px] ${
                              isEnrolled ? 'bg-primary-light border border-[rgba(11,87,142,0.3)] text-primary'
                              : discSel > 0 ? 'bg-[rgba(11,87,142,0.08)] border border-[rgba(11,87,142,0.4)] text-primary'
                              : 'bg-[var(--bg-surface-variant)] border border-border-card text-text-body'
                            } ${meet.status === 'UPCOMING' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isEnrolled ? <CheckCircle2 size={10} /> : <ArrowRight size={10} />}
                            {disc}
                            {discSel > 0 && !isEnrolled && <span className="bg-primary text-white rounded-[8px] px-[5px] text-[0.64rem]">{discSel}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {enrolled.length > 0 && (
                    <div className="bg-primary-light border border-[rgba(11,87,142,0.2)] rounded-[7px] px-[11px] py-[8px] mb-[10px] text-[0.76rem]">
                      <span className="font-bold text-primary">✓ {enrolled.length} entries submitted: </span>
                      <span className="text-text-muted">{enrolled.map(e => e.athleteName).join(', ')}</span>
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-auto">
                    {meet.status === 'UPCOMING' ? (
                      <button className="btn-gov-secondary w-full text-[0.8rem]" disabled>Registration Not Open Yet</button>
                    ) : meet.isClubRegistered ? (
                      <div className="flex gap-[7px]">
                        <button className="btn-gov-secondary flex-1 text-[0.78rem]" disabled>
                          <CheckCircle2 size={12} color="var(--primary)" /> Enrolled
                        </button>
                        <button onClick={() => onNotify('Downloading Entry Form PDF...', 'info')} className="btn-gov-secondary text-[0.78rem] px-[11px] py-[10px]">
                          <FileSpreadsheet size={12} />
                        </button>
                      </div>
                    ) : (
                      <button className="btn-gov-primary w-full text-[0.82rem] p-[10px]"
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[16px] mb-[28px]">
            {meets.map(meet => {
              const hasResults = !!(MOCK_EVENT_RESULTS[meet.id]);
              const isSelected = selectedMeet === meet.id;
              return (
                <div key={meet.id}
                  onClick={() => hasResults ? setSelectedMeet(isSelected ? null : meet.id) : null}
                  className={`rounded-[14px] overflow-hidden ${hasResults ? 'cursor-pointer' : 'cursor-default'} border-2 ${
                    isSelected ? 'border-primary shadow-[0_0_0_3px_rgba(11,87,142,0.12)]' : 'border-border-card'
                  } transition-all duration-200 ${hasResults ? '' : 'opacity-[0.55]'}`}>
                  <div className="relative h-[120px]">
                    <img src={meet.bannerUrl} alt={meet.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[rgba(13,20,40,0.55)]" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-[4px] p-[12px]">
                      <h4 className="text-white font-extrabold text-[0.88rem] text-center leading-[1.3]">{meet.title}</h4>
                      <span className="text-[0.72rem] text-[#8FA8BC] font-bold">
                        {hasResults ? `${MOCK_EVENT_RESULTS[meet.id].length} events with results` : 'Results not yet published'}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-[8px] right-[8px]">
                        <span className="badge badge-green text-[0.62rem]">Selected</span>
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
              <h4 className="font-extrabold text-[1.1rem] mb-[16px] text-text-heading">
                Official Results — {meets.find(m => m.id === selectedMeet)?.title}
              </h4>
              <div className="flex flex-col gap-[12px]">
                {resultsForMeet.map((evResult, ei) => {
                  const isExpanded = expandedDisc === evResult.discipline;
                  return (
                    <div key={ei} className="rounded-[12px] overflow-hidden border border-border-card">
                      {/* Event header */}
                      <button
                        onClick={() => setExpandedDisc(isExpanded ? null : evResult.discipline)}
                        className={`w-full px-[18px] py-[14px] flex items-center justify-between transition-colors duration-150 ${
                          isExpanded ? 'bg-[#1A1F2E]' : 'bg-[#F5FAF6]'
                        }`}>
                        <div className="flex items-center gap-[10px]">
                          <Trophy size={16} color={isExpanded ? '#C8A84B' : 'var(--primary)'} />
                          <span className={`font-extrabold text-[0.95rem] ${isExpanded ? 'text-white' : 'text-text-heading'}`}>
                            {evResult.discipline}
                          </span>
                          <span className={`text-[0.72rem] font-bold ${isExpanded ? 'text-[#8FA8BC]' : 'text-text-muted'}`}>
                            {evResult.results.length} athletes
                          </span>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          {evResult.results[0] && (
                            <span className={`text-[0.8rem] font-bold font-mono ${isExpanded ? 'text-[#C8A84B]' : 'text-primary'}`}>
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
                                <tr key={ri} className={ri === 0 ? 'bg-[rgba(200,168,75,0.05)]' : undefined}>
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
                                    <div className="font-bold text-[0.88rem]">{r.athleteName}</div>
                                    <div className="text-[0.7rem] text-text-dim">{r.nat}</div>
                                  </td>
                                  <td className="text-[0.82rem] text-text-muted">{r.club}</td>
                                  <td>
                                    <span className={`font-mono font-extrabold text-[1rem] ${r.pos === 1 ? 'text-[#C8A84B]' : 'text-primary'}`}>
                                      {r.time}
                                    </span>
                                  </td>
                                  <td className="flex gap-[5px] flex-wrap">
                                    {r.pb && <span className="badge badge-amber text-[0.6rem]">PB</span>}
                                    {r.sb && <span className="badge badge-blue text-[0.6rem]">SB</span>}
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
            <div className="text-center p-[60px_24px] text-text-muted">
              <Trophy size={40} color="#D0E0D2" className="mb-[12px]" />
              <p className="font-bold">No results published yet for this meet.</p>
            </div>
          )}

          {!selectedMeet && (
            <div className="text-center p-[60px_24px] text-text-muted">
              <List size={40} color="#D0E0D2" className="mb-[12px]" />
              <p className="font-bold">Select a meet above to view event results.</p>
            </div>
          )}
        </div>
      )}

      {/* ── ROSTER PICKER MODAL ── */}
      {rosterModal && currentMeet && (
        <div className="modal-backdrop" onClick={() => setRosterModal(null)}>
          <div className="modal-content p-[26px] max-w-[540px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-[16px]">
              <div>
                <h3 className="text-[1.1rem] font-extrabold mb-[3px]">Select Athletes — {rosterModal.discipline}</h3>
                <p className="text-[0.78rem] text-text-muted">{currentMeet.title}</p>
              </div>
              <button onClick={() => setRosterModal(null)} className="bg-[var(--bg-surface-variant)] border-0 w-[30px] h-[30px] rounded-full cursor-pointer flex items-center justify-center">
                <X size={15} color="var(--text-muted)" />
              </button>
            </div>

            <div className="flex flex-col gap-[7px] max-h-[360px] overflow-y-auto mb-[18px]">
              {clubAthletes.length === 0 ? (
                <p className="text-center text-text-muted p-[24px]">No athletes in club roster</p>
              ) : clubAthletes.map(ath => {
                const checked = discAthleteSel.has(ath.id);
                const eligible = ath.licenseStatus === 'ACTIVE' && ath.faydaStatus === 'VERIFIED';
                return (
                  <label key={ath.id} className={`flex items-center gap-[12px] p-[11px_13px] rounded-[10px] transition-all duration-150 ${
                    eligible ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${eligible ? '' : 'opacity-50'} border ${
                    checked ? 'border-[rgba(11,87,142,0.4)] bg-primary-light' : eligible ? 'border-border-card bg-[var(--bg-card)]' : 'border-border-card bg-[var(--bg-surface-variant)]'
                  }`}>
                    <input type="checkbox" checked={checked} disabled={!eligible}
                      onChange={() => eligible && toggleAthlete(rosterModal.meetId, rosterModal.discipline, ath.id)} />
                    <img src={ath.photoUrl} alt={ath.name} className="w-[36px] h-[36px] rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-[5px]">
                        <span className="font-bold text-[0.88rem]">{ath.name}</span>
                        <span className={`badge ${ath.ageTier === 'Senior' ? 'badge-blue' : 'badge-green'} text-[0.6rem]`}>{ath.ageTier}</span>
                      </div>
                      <div className="text-[0.72rem] text-text-muted mt-[1px]">
                        {ath.primaryEvent}{ath.personalBests?.[0] ? ` · PB ${ath.personalBests[0].time}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-[3px]">
                      {ath.faydaStatus === 'VERIFIED'
                        ? <span className="badge badge-green text-[0.6rem]"><ShieldCheck size={9} /> Fayda</span>
                        : <span className="badge badge-amber text-[0.6rem]"><AlertTriangle size={9} /> Unverified</span>}
                      {ath.licenseStatus === 'ACTIVE'
                        ? <span className="badge badge-green text-[0.6rem]">Licensed</span>
                        : <span className="badge badge-red text-[0.6rem]">No License</span>}
                    </div>
                  </label>
                );
              })}
            </div>

            <p className="text-[0.72rem] text-text-muted mb-[12px]">
              * Only Fayda-verified & licensed athletes are selectable. Renew licenses from Roster Management.
            </p>
            <div className="flex gap-[9px]">
              <button className="btn-gov-secondary flex-1" onClick={() => setRosterModal(null)}>Cancel</button>
              <button className="btn-gov-primary flex-[2]" onClick={() => setRosterModal(null)}>
                <UserCheck size={14} /> Confirm ({discAthleteSel.size} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
