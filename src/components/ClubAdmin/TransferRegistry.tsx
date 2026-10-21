import React, { useState } from 'react';
import { ArrowRightLeft, Lock, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppSelector } from '../../store/hooks';
import type { Transfer } from '../../types';

interface TransferRegistryProps {
  onInitiateTransfer: (transfer: Transfer) => void;
}

export default function TransferRegistry({ onInitiateTransfer }: TransferRegistryProps) {
  const { t } = useI18n();
  const transfers = useAppSelector((state) => state.club.transfers);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [athleteName, setAthleteName] = useState<string>('');
  const [targetClub, setTargetClub] = useState<string>('');
  const [transferFee, setTransferFee] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            {t('club.transferRegistryTitle')}
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            {t('club.transferRegistrySub')}
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-gov-primary"
        >
          <ArrowRightLeft size={16} />
          {t('club.submitTransferAgreement')}
        </button>
      </div>

      {/* Federation Lock Banner */}
      <div className="gov-card bg-accent-light border border-[rgba(217,119,6,0.3)] mb-[24px] flex items-center justify-between flex-wrap gap-[16px]">
        <div className="flex items-center gap-[14px]">
          <div className="p-[10px] rounded-[10px] bg-white border border-[rgba(217,119,6,0.3)] text-accent">
            <Lock size={24} />
          </div>
          <div>
            <div className="font-extrabold text-accent text-[0.98rem]">
              {t('club.transferWindowLockActive')}
            </div>
            <div className="text-[0.82rem] text-text-muted mt-[2px]">
              {t('club.transferWindowDeadline', { date: 'August 15, 2026 at 23:59 EAT' })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[8px] bg-white px-[14px] py-[6px] rounded-[8px] border border-[rgba(217,119,6,0.2)]">
          <Calendar size={16} color="var(--eth-amber)" />
          <span className="text-[0.82rem] font-bold text-accent font-mono">
            {t('club.daysRemaining', { count: 18 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[32px]">
        {/* Inbound Requests List */}
        <div>
          <h4 className="text-[1.1rem] font-bold mb-[12px] text-text-heading">
            {t('club.inboundRequests')}
          </h4>
          <div className="gov-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t('club.requestedAthlete')}</th>
                    <th>{t('club.requestingClub')}</th>
                    <th>{t('club.proposedFee')}</th>
                    <th>{t('club.rationale')}</th>
                    <th>{t('club.statusAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={5} className="text-center text-text-muted py-8">No transfer requests are recorded.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Outbound / Initiated Transfers List */}
        <div>
          <h4 className="text-[1.1rem] font-bold mb-[12px] text-text-heading">
            {t('club.outboundTransfers')}
          </h4>
          <div className="gov-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t('club.athlete')}</th>
                    <th>{t('club.fromClub')}</th>
                    <th>{t('club.toTargetClub')}</th>
                    <th>{t('club.transferFee')}</th>
                    <th>{t('club.federationClearance')}</th>
                    <th>{t('club.contractHash')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(tx => (
                    <tr key={tx.id}>
                      <td className="font-bold text-text-heading">{tx.athleteName}</td>
                      <td className="text-[0.85rem]">{tx.fromClub}</td>
                      <td className="text-[0.85rem] font-semibold text-primary">{tx.toClub}</td>
                      <td className="font-bold font-mono text-text-heading">{tx.transferFee}</td>
                      <td>
                        {tx.eafClearanceStatus === 'APPROVED' ? (
                          <span className="badge badge-green">
                            <CheckCircle2 size={12} /> {t('club.approved')}
                          </span>
                        ) : (
                          <span className="badge badge-amber">
                            <AlertCircle size={12} /> {t('club.pendingClearance')}
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-[0.75rem] text-text-muted">
                        {tx.contractHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Transfer Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content p-[28px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-[20px]">
              <h3 className="text-[1.3rem] font-extrabold text-text-heading">
                {t('club.submitTransferTitle')}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            <form onSubmit={handleSubmitTransfer}>
              <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4 text-sm text-amber-900">
                Transfer applications cannot be saved because the backend transfer workflow is not configured. This form will not create a transfer record.
              </div>
              <div className="form-group">
                <label className="form-label">{t('club.athleteName')}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.destinationClub')}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={targetClub}
                  onChange={(e) => setTargetClub(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.transferCompensation')}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={transferFee}
                  onChange={(e) => setTransferFee(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.agreementRationale')}</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button type="submit" disabled className="btn-gov-primary w-full p-[12px] opacity-60 cursor-not-allowed">
                Transfer submission unavailable
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
