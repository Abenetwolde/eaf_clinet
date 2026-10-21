import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

export default function PaymentModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '32px 16px' }}>
      <div className="modal-content main-pad" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '95vw', margin: 'auto', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>Payment unavailable</h3>
          <button type="button" onClick={onClose} className="btn-secondary" aria-label="Close"><X size={18} /></button>
        </div>
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
          <ShieldAlert className="shrink-0" size={20} />
          <p>No live payment provider is configured. No payment was requested or recorded, and no receipt or athlete license was generated.</p>
        </div>
        <button type="button" onClick={onClose} className="btn-gov-secondary w-full mt-5">Close</button>
      </div>
    </div>
  );
}
