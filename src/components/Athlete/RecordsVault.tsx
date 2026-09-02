import React, { useState } from 'react';
import { Download, Eye, TrendingUp, X, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import type { Athlete } from '../../types';

interface RecordsVaultProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface RecordDetail {
  event: string;
  pb?: string;
  sb?: string;
  date?: string;
  venue?: string;
}

function RecordsVault({ athlete, onNotify }: RecordsVaultProps) {
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<RecordDetail | null>(null);

  // Records are derived from the athlete's registered personal/season bests —
  // no demo data.
  const seasonByEvent = new Map(
    (athlete.seasonBests || [])
      .filter((sb) => sb.event)
      .map((sb) => [sb.event, sb.mark || sb.time || '—']),
  );

  const records: RecordDetail[] = (athlete.personalBests || [])
    .filter((pb) => pb.event)
    .map((pb) => ({
      event: pb.event,
      pb: pb.mark || pb.time || '—',
      sb: seasonByEvent.get(pb.event) || '—',
      date: pb.date || '—',
      venue: pb.venue || '—',
    }));

  const hasRanking = typeof athlete.nationalRank === 'number' || typeof athlete.worldRank === 'number';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">Career Records Vault</h3>
          <p className="text-[0.85rem] text-text-muted mt-1">
            Verified personal and season bests registered with the Ethiopian Athletics Federation.
          </p>
        </div>
        <button onClick={() => onNotify(`Exporting Official EAF Career Passport for ${athlete.name}...`, 'info')} className="btn-gov-primary">
          <Download size={16} /> Export Career Passport PDF
        </button>
      </div>

      {/* Ranking card — only rendered when a rank is actually on record */}
      {hasRanking && (
        <div className="gov-card bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-0 text-white mb-6 rounded-[18px]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[0.72rem] font-bold text-primary uppercase tracking-[0.06em] mb-1.5">Competition Ranking</div>
              <div className="text-[1.8rem] font-black leading-[1.1]">
                {typeof athlete.nationalRank === 'number' ? `#${athlete.nationalRank} Nationally` : 'National ranking pending'}
              </div>
              {typeof athlete.worldRank === 'number' && (
                <div className="text-[0.85rem] text-[#94A3B8] mt-1.5">
                  #{athlete.worldRank} World
                </div>
              )}
            </div>
            <div>
              <span className="bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.4)] text-[#34D399] rounded-[10px] px-4 py-2 text-[0.82rem] font-bold inline-flex items-center gap-1.5">
                <ShieldCheck size={16} /> EAF Verified Athlete
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Verified Records Table */}
      <div className="gov-card p-0 overflow-hidden rounded-[18px]">
        <div className="px-5 py-3.5 bg-[#0F172A] text-white font-extrabold text-[0.88rem] flex justify-between items-center">
          <span>Official Verified Personal Bests &amp; Season Bests</span>
          <span className="text-[0.75rem] text-primary">Fayda Cryptographic Audit Active</span>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td className="font-extrabold text-[#0F172A]">{r.event}</td>
                  <td><span className="font-mono font-extrabold text-primary-dark text-base">{r.pb}</span></td>
                  <td><span className="font-mono text-text-heading">{r.sb}</span></td>
                  <td className="text-text-muted text-[0.85rem]">{r.date}</td>
                  <td className="text-[0.85rem]">{r.venue}</td>
                  <td>
                    <button
                      onClick={() => setSelectedRecordDetail(r)}
                      className="btn-gov-secondary px-3 py-1.5 text-[0.78rem] rounded-[8px] inline-flex items-center gap-1"
                    >
                      <Eye size={14} /> Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <div className="p-10 text-center">
            <TrendingUp size={36} className="mx-auto text-slate-300 mb-3" />
            <div className="text-[0.95rem] font-extrabold text-text-heading">No records on file yet</div>
            <p className="text-[0.82rem] text-text-muted mt-1 max-w-[420px] mx-auto">
              Personal and season bests will appear here once your competition results are
              verified by the federation.
            </p>
          </div>
        )}
      </div>

      {/* ── RECORD DETAIL MODAL ── */}
      {selectedRecordDetail && (
        <div className="modal-backdrop bg-[rgba(15,23,42,0.75)] backdrop-blur-[6px] z-[9999]" onClick={() => setSelectedRecordDetail(null)}>
          <div
            className="modal-content p-0 max-w-[680px] w-[92%] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-[#E2E8F0] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="relative w-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
              <div className="flex justify-between items-center">
                <span className="badge badge-green text-[0.78rem] bg-[#10B981] text-white px-3 py-1.5 font-extrabold">
                  <ShieldCheck size={13} /> EAF Verified Record
                </span>
                <button
                  onClick={() => setSelectedRecordDetail(null)}
                  className="bg-white/20 border-0 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer backdrop-blur-[4px]"
                >
                  <X size={20} color="#FFFFFF" />
                </button>
              </div>

              <h3 className="text-[1.45rem] font-black text-white m-0 mt-3">
                {selectedRecordDetail.event}
              </h3>
              <div className="flex items-center gap-4 mt-1.5 text-[#E2E8F0] text-[0.84rem] font-bold flex-wrap">
                {selectedRecordDetail.venue && selectedRecordDetail.venue !== '—' && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} color="#38BDF8" /> {selectedRecordDetail.venue}
                  </span>
                )}
                {selectedRecordDetail.date && selectedRecordDetail.date !== '—' && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} color="#38BDF8" /> {selectedRecordDetail.date}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-7 py-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-5 mb-5">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-3.5">
                  <div>
                    <div className="text-[0.75rem] font-extrabold text-primary uppercase tracking-[0.05em]">Performance Details</div>
                    <div className="text-[0.85rem] font-bold text-[#64748B] mt-0.5">{athlete.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[0.8rem] text-[#64748B] font-bold">Personal Best</div>
                    <div className="font-mono font-black text-primary-dark text-[1.1rem] mt-1">{selectedRecordDetail.pb}</div>
                  </div>
                  <div>
                    <div className="text-[0.8rem] text-[#64748B] font-bold">Season Best</div>
                    <div className="font-mono font-black text-text-heading text-[1.1rem] mt-1">{selectedRecordDetail.sb}</div>
                  </div>
                </div>
              </div>

              {/* Entry Verification Warning Box */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] px-4 py-3.5 text-[0.78rem] text-[#1E40AF] leading-[1.5]">
                <strong>Record Verification:</strong> All performances are cross-referenced with active EAF licenses and Fayda data. For queries regarding your records, contact <a href="mailto:registrar@eaf.org.et" className="text-primary-dark font-extrabold">registrar@eaf.org.et</a>.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordsVault;
