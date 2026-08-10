import React, { useState } from 'react';
import { ArrowRightLeft, Lock, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Club, Transfer } from '../../types';

interface TransferRegistryProps {
  transfers: Transfer[];
  currentClub: Club;
  onInitiateTransfer: (transfer: Transfer) => void;
}

export default function TransferRegistry({ transfers, currentClub, onInitiateTransfer }: TransferRegistryProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [athleteName, setAthleteName] = useState<string>('Girmay Legese');
  const [targetClub, setTargetClub] = useState<string>('CBE AC (Commercial Bank)');
  const [transferFee, setTransferFee] = useState<string>('450,000');
  const [reason, setReason] = useState<string>('National squad development agreement');

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx = {
      id: `TRX-2026-${Math.floor(100 + Math.random() * 900)}`,
      athleteName,
      fromClub: currentClub.name,
      toClub: targetClub,
      transferFee: `${transferFee} ETB`,
      status: "FEDERATION_LOCKED",
      effectiveDate: "2026-08-15",
      contractHash: "0xTRANSFER_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      eafClearanceStatus: "PENDING_APPROVAL"
    };

    onInitiateTransfer(newTx);
    setShowModal(false);
  };

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            EAF Inter-Club Athlete Transfer Registry
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            Federation Lock Mechanism & Contract Registry
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-gov-primary"
        >
          <ArrowRightLeft size={16} />
          Submit Transfer Agreement
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
              Federation Transfer Window Lock Active
            </div>
            <div className="text-[0.82rem] text-text-muted mt-[2px]">
              All agreements must be submitted before <strong>August 15, 2026 at 23:59 EAT</strong>.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[8px] bg-white px-[14px] py-[6px] rounded-[8px] border border-[rgba(217,119,6,0.2)]">
          <Calendar size={16} color="var(--eth-amber)" />
          <span className="text-[0.82rem] font-bold text-accent font-mono">
            18 Days Remaining
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[32px]">
        {/* Inbound Requests List */}
        <div>
          <h4 className="text-[1.1rem] font-bold mb-[12px] text-text-heading">
            Inbound Requests (Other clubs requesting your athletes)
          </h4>
          <div className="gov-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Requested Athlete</th>
                    <th>Requesting Club</th>
                    <th>Proposed Fee (ETB)</th>
                    <th>Rationale</th>
                    <th>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-text-heading">Tadesse Worku</td>
                    <td className="text-[0.85rem] font-semibold text-primary">Defense Sports Club (Mekelakeya)</td>
                    <td className="font-bold font-mono text-text-heading">850,000 ETB</td>
                    <td className="text-[0.85rem]">National team alignment strategy</td>
                    <td>
                      <div className="flex gap-[8px]">
                        <button className="btn-gov-primary px-[12px] py-[6px] text-[0.75rem]">Approve</button>
                        <button className="btn-gov-secondary px-[12px] py-[6px] text-[0.75rem] border-accent text-accent">Reject</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold text-text-heading">Diribe Welteji</td>
                    <td className="text-[0.85rem] font-semibold text-primary">Ethiopian Airlines AC</td>
                    <td className="font-bold font-mono text-text-heading">1,200,000 ETB</td>
                    <td className="text-[0.85rem]">Contract buyout clause activation</td>
                    <td>
                      <span className="badge badge-amber"><AlertCircle size={12} /> Under Negotiation</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Outbound / Initiated Transfers List */}
        <div>
          <h4 className="text-[1.1rem] font-bold mb-[12px] text-text-heading">
            Outbound & Initiated Transfers
          </h4>
          <div className="gov-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>From Club</th>
                    <th>To Target Club</th>
                    <th>Transfer Fee (ETB)</th>
                    <th>Federation Clearance</th>
                    <th>Contract Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id}>
                      <td className="font-bold text-text-heading">{t.athleteName}</td>
                      <td className="text-[0.85rem]">{t.fromClub}</td>
                      <td className="text-[0.85rem] font-semibold text-primary">{t.toClub}</td>
                      <td className="font-bold font-mono text-text-heading">{t.transferFee}</td>
                      <td>
                        {t.eafClearanceStatus === 'APPROVED' ? (
                          <span className="badge badge-green">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="badge badge-amber">
                            <AlertCircle size={12} /> Pending Clearance
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-[0.75rem] text-text-muted">
                        {t.contractHash}
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
                Submit Inter-Club Transfer Agreement
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            <form onSubmit={handleSubmitTransfer}>
              <div className="form-group">
                <label className="form-label">Athlete Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Club</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={targetClub}
                  onChange={(e) => setTargetClub(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Compensation Fee (ETB)</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={transferFee}
                  onChange={(e) => setTransferFee(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agreement Rationale</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-gov-primary w-full p-[12px]">
                Submit to EAF Transfer Registry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
