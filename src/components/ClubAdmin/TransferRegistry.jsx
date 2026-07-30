import React, { useState } from 'react';
import { ArrowRightLeft, Lock, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TransferRegistry({ transfers, currentClub, onInitiateTransfer }) {
  const [showModal, setShowModal] = useState(false);
  const [athleteName, setAthleteName] = useState('Girmay Legese');
  const [targetClub, setTargetClub] = useState('CBE AC (Commercial Bank)');
  const [transferFee, setTransferFee] = useState('450,000');
  const [reason, setReason] = useState('National squad development agreement');

  const handleSubmitTransfer = (e) => {
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            EAF Inter-Club Athlete Transfer Registry
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
      <div className="gov-card" style={{
        background: 'var(--eth-amber-light)',
        border: '1px solid rgba(217, 119, 6, 0.3)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: '#FFFFFF',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            color: 'var(--eth-amber)'
          }}>
            <Lock size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--eth-amber)', fontSize: '0.98rem' }}>
              Federation Transfer Window Lock Active
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              All agreements must be submitted before <strong>August 15, 2026 at 23:59 EAT</strong>.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
          <Calendar size={16} color="var(--eth-amber)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--eth-amber)', fontFamily: 'var(--font-mono)' }}>
            18 Days Remaining
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Inbound Requests List */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-heading)' }}>
            Inbound Requests (Other clubs requesting your athletes)
          </h4>
          <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Tadesse Worku</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--eth-blue)' }}>Defense Sports Club (Mekelakeya)</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>850,000 ETB</td>
                    <td style={{ fontSize: '0.85rem' }}>National team alignment strategy</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-gov-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Approve</button>
                        <button className="btn-gov-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Diribe Welteji</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--eth-blue)' }}>Ethiopian Airlines AC</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>1,200,000 ETB</td>
                    <td style={{ fontSize: '0.85rem' }}>Contract buyout clause activation</td>
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
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-heading)' }}>
            Outbound & Initiated Transfers
          </h4>
          <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                      <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{t.athleteName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{t.fromClub}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--eth-blue)' }}>{t.toClub}</td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>{t.transferFee}</td>
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
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Submit Inter-Club Transfer Agreement
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-gov-secondary" style={{ padding: '4px 10px' }}>✕</button>
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

              <button type="submit" className="btn-gov-primary" style={{ width: '100%', padding: '12px' }}>
                Submit to EAF Transfer Registry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
