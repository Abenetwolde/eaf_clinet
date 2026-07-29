import React, { useState } from 'react';
import { Trophy, TrendingUp, Download, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { MOCK_MEETS, MOCK_EVENT_RESULTS } from '../../data/mockData';

const MEDAL_COLORS = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

export default function RecordsVault({ athlete, onNotify }) {
  const [activeTab, setActiveTab] = useState('pbs');
  const [expandedDisc, setExpandedDisc] = useState(null);
  const [selectedMeet, setSelectedMeet] = useState(Object.keys(MOCK_EVENT_RESULTS)[0]);

  const records = [
    { event: '5,000m',  pb: '12:51.20', sb: '12:51.20', date: 'May 18, 2026',  venue: 'Addis Ababa Stadium',  rankingPts: 1248 },
    { event: '3,000m',  pb: '7:28.40',  sb: '7:30.10',  date: 'Feb 12, 2026',  venue: 'Lievin Indoor Arena',  rankingPts: 1210 },
    { event: '10,000m', pb: '26:49.00', sb: '26:55.00', date: 'June 02, 2025', venue: 'Hengelo FBK Games',   rankingPts: 1235 },
  ];

  const meetResults = MOCK_EVENT_RESULTS[selectedMeet] || [];

  const tabs = [
    { id: 'pbs',     label: 'Personal Bests' },
    { id: 'live',    label: 'Live Results' },
    { id: 'history', label: 'Competition History' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>Records &amp; Career Vault</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Personal bests, live competition results, and career history
          </p>
        </div>
        <button onClick={() => onNotify(`Exporting Career Passport for ${athlete.name}...`, 'info')} className="btn-gov-primary">
          <Download size={16} /> Export Career Passport PDF
        </button>
      </div>

      {/* World ranking card */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', border: 'none', color: '#FFFFFF', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>World Athletics Ranking</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1 }}>1,248 Performance Points</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', marginTop: '6px' }}>
              #4 Nationally · #12 Global 5,000m
            </div>
          </div>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF', borderRadius: '8px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}>
              ✓ Olympic Qualifier Standard Met
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#F0F5FA', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
              background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              color: activeTab === t.id ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(11,87,142,0.25)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PERSONAL BESTS TAB ── */}
      {activeTab === 'pbs' && (
        <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem' }}>
            Official Verified Personal Bests &amp; Season Bests
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
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 800 }}>{r.event}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{r.pb}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>{r.sb}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.date}</td>
                    <td style={{ fontSize: '0.85rem' }}>{r.venue}</td>
                    <td><span className="badge badge-blue"><TrendingUp size={12} /> {r.rankingPts}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LIVE RESULTS TAB ── */}
      {activeTab === 'live' && (
        <div>
          {/* Meet selector */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {Object.keys(MOCK_EVENT_RESULTS).map(meetId => {
              const meet = MOCK_MEETS.find(m => m.id === meetId);
              if (!meet) return null;
              const isSelected = selectedMeet === meetId;
              return (
                <button key={meetId} onClick={() => { setSelectedMeet(meetId); setExpandedDisc(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: isSelected ? 'var(--primary)' : '#F0F5FA',
                    color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                    fontWeight: 700, fontSize: '0.84rem', transition: 'all 0.15s',
                  }}>
                  <Activity size={14} />
                  {meet.title.length > 40 ? meet.title.slice(0, 40) + '…' : meet.title}
                </button>
              );
            })}
          </div>

          {/* Meet banner */}
          {(() => {
            const meet = MOCK_MEETS.find(m => m.id === selectedMeet);
            if (!meet) return null;
            return (
              <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '120px', marginBottom: '20px' }}>
                <img src={meet.bannerUrl} alt={meet.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', padding: '20px' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>{meet.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>{meet.date} · {meet.venue}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Results accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {meetResults.map((disc, di) => {
              const isOpen = expandedDisc === di;
              const winner = disc.results[0];
              return (
                <div key={di} className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => setExpandedDisc(isOpen ? null : di)}
                    style={{
                      width: '100%', padding: '14px 18px', cursor: 'pointer', border: 'none',
                      background: isOpen ? 'var(--primary)' : '#F8FAFC',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Trophy size={16} color={isOpen ? '#C8A84B' : 'var(--primary)'} />
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isOpen ? '#FFFFFF' : 'var(--text-heading)' }}>{disc.discipline}</span>
                      <span style={{ fontSize: '0.76rem', color: isOpen ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>{disc.results.length} athletes</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {winner && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isOpen ? '#C8A84B' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          🥇 {winner.athleteName.split(' ')[0]} — {winner.time}
                        </span>
                      )}
                      {isOpen ? <ChevronUp size={16} color={isOpen ? '#FFFFFF' : 'var(--text-muted)'} /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="table-responsive">
                      <table className="gov-table">
                        <thead>
                          <tr><th style={{ width: 52 }}>Pos</th><th>Athlete</th><th>Club</th><th>Time</th><th>Marks</th></tr>
                        </thead>
                        <tbody>
                          {disc.results.map((r, ri) => (
                            <tr key={ri}>
                              <td style={{ textAlign: 'center' }}>
                                {r.pos <= 3
                                  ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: MEDAL_COLORS[r.pos] + '22', border: `2px solid ${MEDAL_COLORS[r.pos]}`, fontWeight: 900, fontSize: '0.85rem', color: MEDAL_COLORS[r.pos] }}>
                                      {['🥇', '🥈', '🥉'][r.pos - 1]}
                                    </span>
                                  : <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{r.pos}</span>
                                }
                              </td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{r.athleteName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.nat}</div>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.club}</td>
                              <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: r.pos === 1 ? '#C8A84B' : 'var(--primary)' }}>{r.time}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {r.pb && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>PB</span>}
                                  {r.sb && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>SB</span>}
                                  {!r.pb && !r.sb && <span style={{ color: 'var(--text-dim)' }}>—</span>}
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

      {/* ── COMPETITION HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem' }}>
            Competition History
          </div>
          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr><th>Year</th><th>Competition</th><th>Result / Time</th></tr>
              </thead>
              <tbody>
                {(athlete.achievements || []).length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No competition history recorded</td></tr>
                ) : (athlete.achievements || []).map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{a.year}</td>
                    <td style={{ fontWeight: 700 }}>{a.title}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>{a.time}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
