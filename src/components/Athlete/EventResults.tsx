import React, { useState } from 'react';
import { Trophy, Medal, ChevronDown, ChevronUp, Calendar, MapPin, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { MOCK_MEETS, MOCK_EVENT_RESULTS } from '../../data/mockData';
import { useGetPublishedResultsQuery, useGetResultDetailQuery } from '../../store/api/athleteApi';

interface EventResultsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MEDAL_COLORS: Record<number, string> = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

export default function EventResults({ onNotify }: EventResultsProps) {
  const [selectedMeet, setSelectedMeet] = useState<string | null>(null);
  const [selectedBackendResultId, setSelectedBackendResultId] = useState<string | null>(null);
  const [expandedDisc, setExpandedDisc] = useState<number | null>(0);

  // Real-time backend published results
  const { data: rawBackendResults = [], isLoading: isLoadingBackend } = useGetPublishedResultsQuery();
  const backendResults = Array.isArray(rawBackendResults)
    ? rawBackendResults
    : (rawBackendResults as any)?.data || [];

  // Single backend result detail query
  const { data: backendDetail } = useGetResultDetailQuery(selectedBackendResultId || '', {
    skip: !selectedBackendResultId,
  });

  const selectedMeetObj = selectedMeet ? MOCK_MEETS.find(m => m.id === selectedMeet) : null;
  const meetResults = selectedMeet && selectedMeetObj && selectedMeetObj.status !== 'REGISTRATION_OPEN' && selectedMeetObj.status !== 'UPCOMING'
    ? (MOCK_EVENT_RESULTS[selectedMeet] || [])
    : [];

  return (
    <div>
      {/* Page title */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <Trophy size={24} color="#C8A84B" />
          <h3 className="text-[1.5rem] font-black">Event Results &amp; Champions</h3>
        </div>
        <p className="text-text-muted text-[0.88rem]">
          Official verified results and rankings from EAF-sanctioned national &amp; regional championships
        </p>
      </div>

      {/* Official Backend Published Results Section */}
      {backendResults.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Official Federation Published Results ({backendResults.length})
            </h4>
            <span className="badge badge-green text-[0.7rem] px-2 py-0.5">Live Certified</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {backendResults.map((item: any) => {
              const isSelected = selectedBackendResultId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedMeet(null);
                    setSelectedBackendResultId(isSelected ? null : item.id);
                    setExpandedDisc(0);
                  }}
                  className={`rounded-2xl p-4.5 cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wide">
                      {item.statusLabel || 'Official Result'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {item.totalFinishers || item.top3Preview?.length || 1} Finishers
                    </span>
                  </div>

                  <h5 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                    {item.eventTitle}
                  </h5>

                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                    {item.discipline} · {item.gender} {item.category}
                  </div>

                  {item.top3Preview && item.top3Preview.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {item.top3Preview.map((fin: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="font-black text-amber-500">
                              {fin.rank === '1' || i === 0 ? '🥇' : fin.rank === '2' || i === 1 ? '🥈' : '🥉'}
                            </span>
                            <span className="font-semibold truncate">{fin.name}</span>
                          </span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                            {fin.performance}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {item.venue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Backend Result Expanded Detail View */}
      {selectedBackendResultId && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-3 text-[0.83rem]">
            <button
              onClick={() => setSelectedBackendResultId(null)}
              className="bg-transparent border-0 cursor-pointer text-primary font-bold p-0"
            >
              ← Back to All Results
            </button>
            <span className="text-text-muted">/</span>
            <span className="font-bold text-text-heading">
              {backendDetail?.eventTitle || backendResults.find((r: any) => r.id === selectedBackendResultId)?.eventTitle}
            </span>
          </div>

          <div className="gov-card mb-4 px-6 py-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A2540] border-0 text-white rounded-2xl shadow-xl">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                  <ShieldCheck size={12} /> Federation Certified Official Results
                </span>
                <h4 className="text-xl font-black mb-1">
                  {backendDetail?.eventTitle || backendResults.find((r: any) => r.id === selectedBackendResultId)?.eventTitle}
                </h4>
                <div className="flex gap-4 text-xs text-slate-300 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-emerald-400" /> {backendDetail?.date || backendResults.find((r: any) => r.id === selectedBackendResultId)?.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-400" /> {backendDetail?.venue || backendResults.find((r: any) => r.id === selectedBackendResultId)?.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={13} className="text-emerald-400" /> {backendDetail?.discipline || backendResults.find((r: any) => r.id === selectedBackendResultId)?.discipline}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Finishers */}
          <div className="gov-card p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Discipline: {backendDetail?.discipline || backendResults.find((r: any) => r.id === selectedBackendResultId)?.discipline}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {(backendDetail?.allFinishers?.length || backendResults.find((r: any) => r.id === selectedBackendResultId)?.top3Preview?.length || 1)} Official Finishers
              </span>
            </div>

            <div className="table-responsive">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th className="w-[70px]">Rank</th>
                    <th>Athlete Name</th>
                    <th>Club / Affiliation</th>
                    <th>Time / Performance</th>
                    <th className="w-[120px]">Medal / Award</th>
                  </tr>
                </thead>
                <tbody>
                  {(backendDetail?.allFinishers || backendResults.find((r: any) => r.id === selectedBackendResultId)?.top3Preview || []).map((fin: any, idx: number) => {
                    const rankNum = parseInt(fin.rank || String(idx + 1), 10);
                    const isPodium = rankNum <= 3;
                    const medalText = fin.medal || (rankNum === 1 ? 'GOLD' : rankNum === 2 ? 'SILVER' : rankNum === 3 ? 'BRONZE' : null);
                    return (
                      <tr
                        key={idx}
                        style={{
                          background: isPodium
                            ? `rgba(${rankNum === 1 ? '200,168,75' : rankNum === 2 ? '168,184,200' : '200,112,64'}, 0.08)`
                            : undefined,
                        }}
                      >
                        <td className="text-center font-black">
                          {isPodium ? (
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black shadow-sm"
                              style={{ background: MEDAL_COLORS[rankNum] || '#C8A84B', color: rankNum === 2 ? '#1E293B' : '#000' }}
                            >
                              {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400">{rankNum}</span>
                          )}
                        </td>
                        <td>
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {fin.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold">
                            {fin.nationality || 'ETH · Ethiopia'}
                          </div>
                        </td>
                        <td className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {fin.club || 'Independent'}
                        </td>
                        <td>
                          <span
                            className="font-mono font-black text-sm"
                            style={{ color: rankNum === 1 ? '#C8A84B' : 'var(--primary)' }}
                          >
                            {fin.performance}
                          </span>
                        </td>
                        <td>
                          {medalText ? (
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                              style={{
                                background: rankNum === 1 ? '#FEF3C7' : rankNum === 2 ? '#F1F5F9' : '#FFEDD5',
                                color: rankNum === 1 ? '#92400E' : rankNum === 2 ? '#334155' : '#9A3412',
                                border: `1px solid ${rankNum === 1 ? '#FDE68A' : rankNum === 2 ? '#CBD5E1' : '#FED7AA'}`,
                              }}
                            >
                              {medalText} MEDAL
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historical & Certified Meets Selector Grid */}
      <div className="mb-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          All Sanctioned Meets &amp; Archives
        </h4>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px] mb-8">
        {MOCK_MEETS.map(meet => {
          const results = (meet.status !== 'REGISTRATION_OPEN' && meet.status !== 'UPCOMING') ? MOCK_EVENT_RESULTS[meet.id] : undefined;
          const hasResults = results && results.length > 0;
          const resultCount = hasResults ? results.reduce((acc, d) => acc + d.results.length, 0) : 0;
          const isSelected = selectedMeet === meet.id;

          return (
            <div key={meet.id}
              onClick={() => {
                setSelectedBackendResultId(null);
                setSelectedMeet(isSelected ? null : meet.id);
                setExpandedDisc(null);
              }}
              className="rounded-[16px] overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-card, #E5EDE8)'}`,
                boxShadow: isSelected ? '0 0 0 3px rgba(11,87,142,0.15)' : 'none'
              }}>
              {/* Image section */}
              <div className="relative h-[130px]">
                <img src={meet.bannerUrl} alt={meet.title}
                  className="w-full h-full object-cover block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.72)] to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 z-[2]">
                  <div className="font-extrabold text-[0.88rem] text-white leading-[1.3] mb-[3px]">
                    {meet.title.length > 55 ? meet.title.slice(0, 55) + '…' : meet.title}
                  </div>
                  {hasResults ? (
                    <span className="bg-primary text-white text-[0.68rem] font-bold px-2 py-0.5 rounded-full">
                      {resultCount} results
                    </span>
                  ) : (
                    <span className="bg-[rgba(200,168,75,0.85)] text-black text-[0.68rem] font-bold px-2 py-0.5 rounded-full">
                      Results pending
                    </span>
                  )}
                </div>
              </div>
              {/* Card footer */}
              <div className="px-3.5 py-2.5" style={{ background: isSelected ? 'rgba(0,102,51,0.06)' : '#FFFFFF' }}>
                <div className="font-bold text-[0.83rem] mb-1 text-text-heading">
                  {meet.title.length > 50 ? meet.title.slice(0, 50) + '…' : meet.title}
                </div>
                <div className="flex gap-3.5 text-[0.75rem] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {meet.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {meet.venue.split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results panel for Mock Meets */}
      {!selectedMeet && !selectedBackendResultId && (
        <div className="text-center py-12 text-text-muted">
          <Trophy size={36} color="var(--border-card, #CCC)" className="mb-3" />
          <p className="font-semibold text-[0.95rem]">Select a meet above to view complete race results</p>
        </div>
      )}

      {selectedMeet && meetResults.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Medal size={36} color="var(--border-card, #CCC)" className="mb-3" />
          <p className="font-semibold text-[0.95rem]">Results not yet published for this meet</p>
        </div>
      )}

      {selectedMeet && meetResults.length > 0 && (
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-[18px] text-[0.83rem]">
            <button onClick={() => { setSelectedMeet(null); setExpandedDisc(null); }}
              className="bg-transparent border-0 cursor-pointer text-primary font-bold p-0">
              ← All Meets
            </button>
            <span className="text-text-muted">/</span>
            <span className="font-bold text-text-heading">
              {MOCK_MEETS.find(m => m.id === selectedMeet)?.title}
            </span>
          </div>

          {/* Meet header */}
          <div className="gov-card mb-5 px-[22px] py-[18px] bg-gradient-to-br from-[#1A1F2E] to-[#152238] border-0 text-white">
            <h4 className="text-[1.1rem] font-black mb-1">
              {MOCK_MEETS.find(m => m.id === selectedMeet)?.title}
            </h4>
            <div className="flex gap-[18px] text-[0.8rem] text-[#8FA8BC]">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {MOCK_MEETS.find(m => m.id === selectedMeet)?.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {MOCK_MEETS.find(m => m.id === selectedMeet)?.venue}
              </span>
              <span className="flex items-center gap-1">
                <Trophy size={13} /> {meetResults.length} discipline{meetResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Discipline accordions */}
          <div className="flex flex-col gap-2.5">
            {meetResults.map((disc, di) => {
              const isExpanded = expandedDisc === di;
              const winner = disc.results[0];
              return (
                <div key={di} className="gov-card p-0 overflow-hidden">
                  {/* Discipline header */}
                  <div onClick={() => setExpandedDisc(isExpanded ? null : di)}
                    className="px-5 py-3.5 cursor-pointer flex items-center justify-between transition-colors duration-150"
                    style={{ background: isExpanded ? 'var(--primary)' : '#F5FAF6' }}>
                    <div className="flex items-center gap-3">
                      <Trophy size={17} color={isExpanded ? '#C8A84B' : 'var(--primary)'} />
                      <span className={`font-extrabold text-base ${isExpanded ? 'text-white' : 'text-text-heading'}`}>
                        {disc.discipline}
                      </span>
                      <span className={`text-[0.78rem] font-semibold ${isExpanded ? 'text-[#C0E8CA]' : 'text-text-muted'}`}>
                        {disc.results.length} athletes
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {winner && (
                        <div className="text-right flex items-center gap-2">
                          <span className={`text-[0.78rem] font-semibold ${isExpanded ? 'text-[#C8A84B]' : 'text-text-muted'}`}>Winner:</span>
                          <span className={`font-extrabold text-[0.85rem] ${isExpanded ? 'text-white' : 'text-text-heading'}`}>{winner.athleteName}</span>
                          <span className="font-mono font-extrabold text-[0.88rem] text-[#C8A84B]">{winner.time}</span>
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
                            <th className="w-[60px]">Pos</th>
                            <th>Athlete</th>
                            <th>Club</th>
                            <th>Time / Result</th>
                            <th className="w-[80px]">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disc.results.map((r, ri) => (
                            <tr key={ri} style={{ background: r.pos <= 3 ? `rgba(${r.pos === 1 ? '200,168,75' : r.pos === 2 ? '168,184,200' : '200,112,64'},0.06)` : undefined }}>
                              <td className="text-center">
                                {r.pos <= 3 ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-[0.82rem]"
                                    style={{
                                      background: MEDAL_COLORS[r.pos], color: r.pos === 2 ? '#333' : '#000'
                                    }}>
                                    {r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : '🥉'}
                                  </span>
                                ) : (
                                  <span className="font-bold text-text-muted text-[0.88rem]">{r.pos}</span>
                                )}
                              </td>
                              <td>
                                <div className="font-bold text-[0.9rem]">{r.athleteName}</div>
                                <div className="text-[0.74rem] text-text-muted font-semibold">{r.nat}</div>
                              </td>
                              <td className="text-text-muted text-[0.85rem]">{r.club}</td>
                              <td>
                                <span className="font-mono font-extrabold text-[0.95rem]"
                                  style={{
                                    color: r.pos === 1 ? '#C8A84B' : 'var(--primary)'
                                  }}>
                                  {r.time}
                                </span>
                              </td>
                              <td>
                                <div className="flex gap-1">
                                  {r.pb && (
                                    <span className="badge badge-amber text-[0.68rem] px-1.5 py-0.5">PB</span>
                                  )}
                                  {r.sb && (
                                    <span className="badge badge-blue text-[0.68rem] px-1.5 py-0.5">SB</span>
                                  )}
                                  {!r.pb && !r.sb && <span className="text-text-dim text-[0.78rem]">—</span>}
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
