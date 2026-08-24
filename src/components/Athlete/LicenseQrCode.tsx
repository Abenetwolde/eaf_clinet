import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X } from 'lucide-react';
import type { Athlete } from '../../types';

// ── License QR payload builder (isolated so it can be wired to a backend) ──
// There is no backend license QR/verification endpoint yet, so the QR encodes
// the athlete's existing local license data. When a real endpoint exists, swap
// this function for a verifier payload/URL (e.g. `${API_ORIGIN}/verify/...`).
export function buildLicenseQrValue(athlete: Athlete): string {
  return JSON.stringify({
    type: 'EAF_LICENSE',
    license: athlete.licenseNumber || '',
    athleteId: athlete.id,
    athleteName: athlete.name,
    expiry: athlete.licenseExpiry || '2026-12-31',
  });
}

interface LicenseQrCodeProps {
  athlete: Athlete;
  size?: number;
}

export default function LicenseQrCode({ athlete, size = 180 }: LicenseQrCodeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!athlete.licenseNumber) return null;

  return (
    <>
      {/* "View QR" action shown next to the license number */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View license QR code"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-white text-primary cursor-pointer font-bold text-[0.8rem] hover:bg-primary-light transition-colors"
      >
        <QrCode size={14} />
        View QR
      </button>

      {/* License QR modal (only shown after clicking "View QR") */}
      {open && (
        <div
          className="modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Athlete License QR Code"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 400, padding: '28px 20px', textAlign: 'center' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-[1.05rem] font-black text-[#0F172A] m-0 text-left">Athlete License QR Code</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close license QR code"
                className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] font-bold shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR code */}
            <div className="inline-flex bg-white p-3 rounded-xl border border-[#E2E8F0] mx-auto">
              <QRCodeSVG value={buildLicenseQrValue(athlete)} size={size} level="M" />
            </div>

            {/* License number */}
            <div className="mt-4">
              <div className="text-[0.72rem] font-bold uppercase tracking-wide text-[#64748B] mb-1">
                License Number
              </div>
              <div className="font-mono text-[1.05rem] font-black text-[#0F172A] break-all">
                {athlete.licenseNumber}
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl border-0 cursor-pointer font-bold text-[0.9rem] text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}