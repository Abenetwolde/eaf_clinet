import React from 'react';
import { Activity, Trophy } from 'lucide-react';
import type { Athlete } from '../../types';

interface LiveRaceTrackerProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LiveRaceTracker({ athlete: _athlete, onNotify: _onNotify }: LiveRaceTrackerProps) {
  return (
    <section className="gov-card" aria-labelledby="athlete-results-title">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={20} color="var(--primary)" />
        <h3 id="athlete-results-title" className="text-[1.35rem] font-extrabold text-text-heading">Performance records</h3>
      </div>
      <p className="text-sm text-text-muted mb-5">Live timing and certified result exports appear here when event timing data is connected.</p>
      <div role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 flex items-start gap-3">
        <Trophy size={19} className="shrink-0" />
        <span>No live splits or event results are available for this athlete.</span>
      </div>
    </section>
  );
}
