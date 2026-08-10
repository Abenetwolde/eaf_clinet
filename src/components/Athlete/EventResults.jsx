import React, { useState } from 'react';
import { Trophy, Medal, ChevronDown, ChevronUp, Calendar, MapPin } from 'lucide-react';
import { MOCK_MEETS, MOCK_EVENT_RESULTS } from '../../data/mockData';

const MEDAL_COLORS = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

export default function EventResults({ onNotify }) {
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [expandedDisc, setExpandedDisc] = useState(null);

  const meetResults = selectedMeet ? (MOCK_EVENT_RESULTS[selectedMeet] || []) : [];

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Trophy size={24} color="#C8A84B" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Event Results &amp; Champions</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Official results from EAF-sanctioned meets</p>
      </div>

      {/* Meet selector grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 32 }}>
        {MOCK_MEETS.map(meet => {
          const results = MOCK_EVENT_RESULTS[meet.id];
          const hasResults = results && results.length > 0;
          const resultCount = hasResults ? results.reduce((acc, d) => acc + d.results.length, 0) : 0;
          const isSelected = selectedMeet === meet.id;

          return (
            <div key={meet.id}
              onClick={() => {
                setSelectedMeet(isSelected ? null : meet.id);
                setExpandedDisc(null);
              }}
              style={{
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-card, #E5EDE8)'}`,
                transition: 'all 0.18s',
                boxShadow: isSelected ? '0 0 0 3px rgba(11,87,142,0.15)' : 'none'
              }}>
              {/* Image section */}
              <div style={{ position: 'relative', height: 130 }}>
                <img src={meet.bannerUrl} alt={meet.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 60%)'
                }} />
                <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 2 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF', lineHeight: 1.3, marginBottom: 3 }}>
                    {meet.title.length > 55 ? meet.title.slice(0, 55) + '…' : meet.title}
                  </div>
                  {hasResults ? (
                    <span style={{ background: 'var(--primary)', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                      {resultCount} results
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(200,168,75,0.85)', color: '#000', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                      Results pending
                    </span>
                  )}
                </div>
              </div>
              {/* Card footer */}
              <div style={{ padding: '10px 14px', background: isSelected ? 'rgba(0,102,51,0.06)' : '#FFFFFF' }}>
                <div style={{ fontWeight: 700, fontSize: '0.83rem', marginBottom: 5, color: 'var(--text-heading)' }}>
                  {meet.title.length > 50 ? meet.title.slice(0, 50) + '…' : meet.title}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> {meet.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {meet.venue.split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results panel */}
      {!selectedMeet && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <Trophy size={36} color="var(--border-card, #CCC)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select a meet above to view results</p>
        </div>
      )}

      {selectedMeet && meetResults.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <Medal size={36} color="var(--border-card, #CCC)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Results not yet published for this meet</p>
        </div>
      )}

      {selectedMeet && meetResults.length > 0 && (
        <div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, fontSize: '0.83rem' }}>
            <button onClick={() => { setSelectedMeet(null); setExpandedDisc(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, padding: 0 }}>
              ← All Meets
            </button>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
              {MOCK_MEETS.find(m => m.id === selectedMeet)?.title}
            </span>
          </div>

          {/* Meet header */}
          <div className="gov-card" style={{ marginBottom: 20, padding: '18px 22px', background: 'linear-gradient(135deg, #1A1F2E 0%, #152238 100%)', border: 'none', color: '#FFFFFF' }}>
            <h4 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 5 }}>
              {MOCK_MEETS.find(m => m.id === selectedMeet)?.title}
            </h4>
            <div style={{ display: 'flex', gap: 18, fontSize: '0.8rem', color: '#8FA8BC' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} /> {MOCK_MEETS.find(m => m.id === selectedMeet)?.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={13} /> {MOCK_MEETS.find(m => m.id === selectedMeet)?.venue}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Trophy size={13} /> {meetResults.length} discipline{meetResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Discipline accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meetResults.map((disc, di) => {
              const isExpanded = expandedDisc === di;
              const winner = disc.results[0];
              return (
                <div key={di} className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Discipline header */}
                  <div onClick={() => setExpandedDisc(isExpanded ? null : di)}
                    className="results-acc-head"
                    style={{
                      padding: '14px 20px', cursor: 'pointer',
                      background: isExpanded ? 'var(--primary)' : '#F5FAF6',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background 0.15s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Trophy size={17} color={isExpanded ? '#C8A84B' : 'var(--primary)'} />
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: isExpanded ? '#FFFFFF' : 'var(--text-heading)' }}>
                        {disc.discipline}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: isExpanded ? '#C0E8CA' : 'var(--text-muted)', fontWeight: 600 }}>
                        {disc.results.length} athletes
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {winner && (
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.78rem', color: isExpanded ? '#C8A84B' : 'var(--text-muted)', fontWeight: 600 }}>Winner:</span>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isExpanded ? '#FFFFFF' : 'var(--text-heading)' }}>{winner.athleteName}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.88rem', color: '#C8A84B' }}>{winner.time}</span>
                        </div>
                      )}
                      {isExpanded ? <ChevronUp size={18} color={isExpanded ? '#FFFFFF' : 'var(--text-muted)'} /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Results table */}
                  {isExpanded && (
                    <div className="table-responsive">
                      <table className="gov-table">
                        <thead>
                          <tr>
                            <th style={{ width: 60 }}>Pos</th>
                            <th>Athlete</th>
                            <th>Club</th>
                            <th>Time / Result</th>
                            <th style={{ width: 80 }}>Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disc.results.map((r, ri) => (
                            <tr key={ri} style={{ background: r.pos <= 3 ? `rgba(${r.pos === 1 ? '200,168,75' : r.pos === 2 ? '168,184,200' : '200,112,64'},0.06)` : undefined }}>
                              <td style={{ textAlign: 'center' }}>
                                {r.pos <= 3 ? (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: MEDAL_COLORS[r.pos], color: r.pos === 2 ? '#333' : '#000',
                                    fontWeight: 900, fontSize: '0.82rem'
                                  }}>
                                    {r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : '🥉'}
                                  </span>
                                ) : (
                                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{r.pos}</span>
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.athleteName}</div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{r.nat}</div>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.club}</td>
                              <td>
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem',
                                  color: r.pos === 1 ? '#C8A84B' : 'var(--primary)'
                                }}>
                                  {r.time}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {r.pb && (
                                    <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>PB</span>
                                  )}
                                  {r.sb && (
                                    <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>SB</span>
                                  )}
                                  {!r.pb && !r.sb && <span style={{ color: 'var(--text-dim, #ccc)', fontSize: '0.78rem' }}>—</span>}
                                </div>
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
    </div>
  );
}
