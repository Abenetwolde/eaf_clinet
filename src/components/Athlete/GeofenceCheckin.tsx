import React from 'react';
import { MapPin, QrCode, ShieldAlert } from 'lucide-react';
import type { Athlete } from '../../types';

interface GeofenceCheckinProps {
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function GeofenceCheckin(_props: GeofenceCheckinProps) {
  return (
    <section className="gov-card max-w-3xl mx-auto" aria-labelledby="checkin-title">
      <div className="flex items-center gap-3 mb-3">
        <MapPin size={22} color="var(--primary)" />
        <h3 id="checkin-title" className="text-[1.35rem] font-extrabold text-text-heading">Competition check-in</h3>
      </div>
      <p className="text-sm text-text-muted mb-5">Check-in requires an event registration and verification by an authorized event official.</p>
      <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
        <ShieldAlert className="shrink-0" size={20} />
        <span>There is no published event check-in available for this athlete. No GPS check-in or QR credential has been recorded.</span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted"><QrCode size={16} /> QR credentials are issued and validated by the event check-in service.</div>
    </section>
  );
}
