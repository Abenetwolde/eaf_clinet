import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, CheckCircle2, X, ShieldCheck, AlertTriangle, Users } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';
import { useAppSelector } from '../../store/hooks';
import type { Athlete } from '../../types';

interface AthleteEventsProps {
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteEvents({ onUpdateAthlete, onNotify }: AthleteEventsProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);
  const [meets, setMeets] = useState(MOCK_MEETS.map(m => ({ ...m, athleteEnrolled: false, enrolledDiscipline: null })));
  const [enrollModal, setEnrollModal] = useState<{ [key: string]: any } | null>(null); // { meet }
  const [selectedDisc, setSelectedDisc] = useState('');

  const canEnroll = athlete.faydaStatus === 'VERIFIED' && athlete.licenseStatus === 'ACTIVE';

  const handleEnroll = () => {
    if (!selectedDisc) { onNotify('Please select a discipline.', 'error'); return; }
    
    // 1. Update local meets state
    setMeets(prev => prev.map(m =>
      m.id === enrollModal.id
        ? { ...m, athleteEnrolled: true, enrolledDiscipline: selectedDisc, totalAthletesEnrolled: m.totalAthletesEnrolled + 1 }
        : m
    ));

    // 2. Persist to athlete profile (Redux -> localStorage via athletesSlice)
    const newApplication = {
      meetId: enrollModal.id,
      meetTitle: enrollModal.title,
      disciplines: [selectedDisc],
      status: "Approved", // Auto-approved for this flow
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    const existingApps = athlete.appliedCompetitions || [];
    onUpdateAthlete({
      ...athlete,
      appliedCompetitions: [newApplication, ...existingApps]
    });

    onNotify(`Enrolled in ${selectedDisc} at ${enrollModal.title}!`, 'success');
    setEnrollModal(null);
    setSelectedDisc('');
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-[1.4rem] font-extrabold text-text-heading">
          Event Registration
        </h3>
        <p className="text-[0.85rem] text-text-muted mt-1">
          Register directly for sanctioned EAF competitions as an individual athlete
        </p>
      </div>

      {/* Eligibility banner */}
      {!canEnroll && (
        <div className="bg-[#FEF9EC] border border-[#F5D76E] rounded-xl px-[18px] py-3.5 mb-6 flex items-center gap-2.5">
          <AlertTriangle size={18} color="#D97706" />
          <div>
            <div className="font-bold text-[0.9rem] text-[#92600A]">Eligibility Requirements Not Met</div>
            <div className="text-[0.8rem] text-[#B45309] mt-0.5">
              You need a verified Fayda ID and an active license to register for events.
              {athlete.faydaStatus !== 'VERIFIED' && ' → Complete Fayda verification.'}
              {athlete.licenseStatus !== 'ACTIVE' && ' → Renew your EAF license (500 ETB).'}
            </div>
          </div>
        </div>
      )}

      {canEnroll && (
        <div className="bg-primary-light border border-[rgba(11,87,142,0.2)] rounded-xl px-[18px] py-3 mb-6 flex items-center gap-2.5">
          <ShieldCheck size={18} color="var(--primary)" />
          <div className="text-[0.85rem] text-primary font-semibold">
            Fayda verified &amp; license active — you are eligible to register for events below.
          </div>
        </div>
      )}

      {/* Meet cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
        {meets.map(meet => (
          <div key={meet.id} className="rounded-[16px] overflow-hidden border border-border-card bg-white shadow-gov flex flex-col">
            {/* Image header */}
            <div className="relative h-[160px] overflow-hidden">
              <img src={meet.bannerUrl} alt={meet.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.75)] to-transparent" />
              <div className="absolute bottom-3 left-3.5 right-3.5 flex justify-between items-end">
                <span className={`badge text-[0.65rem] ${meet.status === 'REGISTRATION_OPEN' ? 'badge-primary' : 'badge-amber'}`}>
                  {meet.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[0.72rem] font-bold text-[#C8A84B]">
                  <Users size={11} className="inline mr-[3px]" />{meet.totalAthletesEnrolled} athletes
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-2.5">
              <h4 className="text-base font-extrabold leading-[1.35] text-text-heading">{meet.title}</h4>
              <div className="flex flex-col gap-1 text-[0.8rem] text-text-muted">
                <div className="flex items-center gap-1.5"><MapPin size={12} color="var(--primary)" /> {meet.venue}</div>
                <div className="flex items-center gap-1.5"><Calendar size={12} color="var(--accent)" /> {meet.date}</div>
              </div>

              {/* Disciplines */}
              <div className="flex flex-wrap gap-1">
                {meet.disciplines.slice(0, 4).map((d, i) => (
                  <span key={i} className="bg-primary-light text-primary rounded-[5px] px-2 py-[3px] text-[0.72rem] font-semibold">{d}</span>
                ))}
                {meet.disciplines.length > 4 && (
                  <span className="bg-[#F1F5F9] text-text-muted rounded-[5px] px-2 py-[3px] text-[0.72rem] font-semibold">+{meet.disciplines.length - 4} more</span>
                )}
              </div>

              {/* Enrolled summary */}
              {meet.athleteEnrolled && (
                <div className="bg-primary-light border border-[rgba(11,87,142,0.2)] rounded-[8px] px-3 py-2 text-[0.8rem] font-bold text-primary">
                  <CheckCircle2 size={13} className="inline mr-1" />
                  Enrolled in: {meet.enrolledDiscipline}
                </div>
              )}

              {/* Action */}
              <div className="mt-auto">
                {meet.status === 'UPCOMING' ? (
                  <button className="btn-gov-secondary w-full text-[0.82rem]" disabled>
                    Registration Not Open Yet
                  </button>
                ) : meet.athleteEnrolled ? (
                  <button className="btn-gov-secondary w-full text-[0.82rem]" disabled>
                    <CheckCircle2 size={13} /> Registered
                  </button>
                ) : (
                  <button
                    className={`btn-gov-primary w-full text-[0.85rem] p-[11px] ${canEnroll ? 'opacity-100' : 'opacity-50'}`}
                    disabled={!canEnroll}
                    onClick={() => { setEnrollModal(meet); setSelectedDisc(''); }}
                  >
                    <Trophy size={14} /> Register for This Event
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {enrollModal && (
        <div className="modal-backdrop" onClick={() => setEnrollModal(null)}>
          <div className="modal-content p-7 max-w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[1.15rem] font-extrabold">Register for Event</h3>
                <p className="text-[0.8rem] text-text-muted mt-[3px]">{enrollModal.title}</p>
              </div>
              <button onClick={() => setEnrollModal(null)} className="bg-[#F1F5F9] border-0 w-[30px] h-[30px] rounded-full cursor-pointer flex items-center justify-center">
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>

            {/* Meet banner in modal */}
            <div className="relative rounded-[10px] overflow-hidden h-[100px] mb-5">
              <img src={enrollModal.bannerUrl} alt={enrollModal.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute bottom-2.5 left-3 text-[0.8rem] text-white font-semibold">
                <MapPin size={11} className="inline mr-1" />{enrollModal.venue}
                <span className="ml-3"><Calendar size={11} className="inline mr-1" />{enrollModal.date}</span>
              </div>
            </div>

            {/* Athlete identity (read-only from Fayda) */}
            <div className="bg-[#F8FAFC] border border-border-card rounded-[10px] px-3.5 py-3 mb-[18px] text-[0.84rem]">
              <div className="font-bold mb-1">Registering as:</div>
              <div className="text-text-muted">
                <strong className="text-text-heading">{athlete.name}</strong>
                {' '}&nbsp;·&nbsp; FIN: <span className="font-mono text-[0.8rem]">{athlete.faydaFin}</span>
                {' '}&nbsp;·&nbsp; {athlete.ageTier}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Discipline</label>
              <select className="form-select" value={selectedDisc} onChange={e => setSelectedDisc(e.target.value)}>
                <option value="">— Choose a discipline —</option>
                {enrollModal.disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button className="btn-gov-secondary flex-1" onClick={() => setEnrollModal(null)}>Cancel</button>
              <button className="btn-gov-primary flex-[2]" onClick={handleEnroll} disabled={!selectedDisc}>
                <CheckCircle2 size={15} /> Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
