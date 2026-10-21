import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useGetAthletePersonalBestsQuery } from '../../store/api/athleteApi';
import type { Athlete } from '../../types';

interface RecordsVaultProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function RecordsVault({ athlete }: RecordsVaultProps) {
  const { data: response, isLoading, isError } = useGetAthletePersonalBestsQuery();
  const records = Array.isArray(response) ? response : Array.isArray(response?.allTime) ? response.allTime : Array.isArray(response?.season) ? response.season : Array.isArray(response?.data) ? response.data : [];

  return (
    <section className="space-y-5">
      <header>
        <h3 className="text-[1.4rem] font-extrabold text-text-heading">Personal Bests</h3>
        <p className="text-[0.85rem] text-text-muted mt-1">Performance records saved to the federation athlete record for {athlete.name}.</p>
      </header>
      <div className="gov-card p-0 overflow-hidden rounded-[18px]">
        <div className="px-5 py-3.5 bg-[#0F172A] text-white font-extrabold text-[0.88rem] flex items-center gap-2"><Award size={16} /> Recorded performances</div>
        {isLoading ? <p className="p-5 text-text-muted">Loading recorded performances…</p> : isError ? <p className="p-5 text-red-600">Performance records could not be loaded.</p> : records.length === 0 ? <p className="p-5 text-text-muted">No personal bests have been recorded yet.</p> : (
          <div className="table-responsive"><table className="gov-table"><thead><tr><th>Event</th><th>Mark</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead><tbody>
            {records.map((record: any) => <tr key={record.id}><td className="font-bold">{record.event || record.discipline || 'Not recorded'}</td><td className="font-mono font-extrabold">{record.mark || record.performance || 'Not recorded'}</td><td>{record.date ? new Date(record.date).toLocaleDateString() : 'Not recorded'}</td><td>{record.venue || 'Not recorded'}</td><td><span className="inline-flex items-center gap-1"><TrendingUp size={13} />{record.statusLabel || record.status || 'Recorded'}</span></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </section>
  );
}
