import React, { useState } from 'react';
import { Trophy, Medal, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { useGetPublishedResultsQuery, useGetResultDetailQuery } from '../../store/api/athleteApi';

interface EventResultsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function EventResults({ onNotify: _onNotify }: EventResultsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: response, isLoading, isError } = useGetPublishedResultsQuery();
  const results = Array.isArray(response) ? response : Array.isArray((response as any)?.data) ? (response as any).data : [];
  const { data: detailResponse } = useGetResultDetailQuery(selectedId || '', { skip: !selectedId });
  const detail = (detailResponse as any)?.data || detailResponse;

  return <section className="space-y-5">
    <header className="mb-2">
      <div className="flex items-center gap-2"><Trophy size={22} className="text-amber-500"/><h3 className="text-2xl font-black">Federation Results</h3></div>
      <p className="text-text-muted text-sm">Results published by the federation.</p>
    </header>
    {isLoading ? <p className="text-text-muted">Loading published results…</p> : isError ? <p className="text-red-600">Published results could not be loaded.</p> : results.length === 0 ? <div className="gov-card p-6 text-text-muted">No federation results have been published yet.</div> : <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {results.map((item: any) => <button key={item.id} type="button" onClick={() => setSelectedId(selectedId === item.id ? null : item.id)} className="gov-card p-4 text-left border border-border-card rounded-xl hover:border-emerald-400">
        <div className="flex justify-between gap-2"><span className="inline-flex items-center gap-1 text-xs font-bold"><ShieldCheck size={14}/>{item.statusLabel || item.status || 'Published'}</span><span className="text-xs text-text-muted">{item.totalFinishers ?? ''}</span></div>
        <h4 className="font-bold mt-3">{item.eventTitle || item.title || 'Untitled event'}</h4>
        <p className="text-sm text-text-muted">{[item.discipline, item.gender, item.category].filter(Boolean).join(' · ') || 'Details not recorded'}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-muted">{item.date && <span className="flex gap-1"><Calendar size={13}/>{item.date}</span>}{item.venue && <span className="flex gap-1"><MapPin size={13}/>{item.venue}</span>}</div>
      </button>)}
    </div>}
    {selectedId && <div className="gov-card p-5">
      <h4 className="font-bold mb-3">Published result details</h4>
      {detail ? <div className="overflow-x-auto"><table className="gov-table"><thead><tr><th>Place</th><th>Athlete</th><th>Performance</th><th>Club</th></tr></thead><tbody>{(detail.results || detail.entries || detail.rows || []).map((row: any, index: number) => <tr key={row.id || index}><td><span className="inline-flex items-center gap-1">{Number(row.position || row.rank) <= 3 && <Medal size={14}/>} {row.position || row.rank || '—'}</span></td><td>{row.athleteName || row.name || 'Not recorded'}</td><td>{row.performance || row.mark || 'Not recorded'}</td><td>{row.clubName || row.club || 'Not recorded'}</td></tr>)}</tbody></table></div> : <p className="text-text-muted">Loading result details…</p>}
    </div>}
  </section>;
}
