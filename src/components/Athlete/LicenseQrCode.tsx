import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download, ShieldCheck, CheckCircle2, FileText, Loader2, KeyRound } from 'lucide-react';
import type { Athlete } from '../../types';
import { STORAGE_KEYS } from '../../store/persistence';

// ── License QR payload builder (points directly to cryptographic verification endpoint) ──
export function buildLicenseQrValue(athlete: Athlete): string {
  const code = athlete.licenseNumber || athlete.id;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}/api/v1/licenses/verify/${encodeURIComponent(code)}`;
  }
  return `http://localhost:3000/api/v1/licenses/verify/${encodeURIComponent(code)}`;
}

interface LicenseQrCodeProps {
  athlete: Athlete;
  size?: number;
  showPdfButton?: boolean;
}

export default function LicenseQrCode({ athlete, size = 180, showPdfButton = true }: LicenseQrCodeProps) {
  const [open, setOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem(STORAGE_KEYS.accessToken) ||
      localStorage.getItem('token') ||
      localStorage.getItem('eaf_token')
    );
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/athletes/${encodeURIComponent(athlete.id)}/license-pdf`, {
        headers,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || 'Failed to generate official license card PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EAF_Official_License_${athlete.licenseNumber || athlete.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Could not download official license card.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setVerifyError(null);
      const code = athlete.licenseNumber || athlete.id;
      const res = await fetch(`/api/v1/licenses/verify/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Credential verification failed.');
      }
      setVerifyResult(data.data);
    } catch (err: any) {
      setVerifyError(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadQr = () => {
    const svgElement = document.querySelector('#license-qr-svg-wrapper svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `EAF_License_QR_${athlete.licenseNumber || 'ATHLETE'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  if (!athlete.licenseNumber && !athlete.id) return null;

  const qrUrl = buildLicenseQrValue(athlete);

  return (
    <>
      {/* Action buttons shown on athlete profile */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setVerifyResult(null);
          }}
          title="View official cryptographic license QR code"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-white text-primary cursor-pointer font-bold text-[0.8rem] hover:bg-primary-light transition-colors shadow-xs"
        >
          <QrCode size={14} />
          View QR
        </button>

        {showPdfButton && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            title="Download official cryptographic license card PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold text-[0.8rem] transition-colors shadow-xs disabled:opacity-50"
          >
            {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Download Card (PDF)
          </button>
        )}
      </div>

      {/* License QR & Security Details Modal */}
      {open && (
        <div
          className="modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Official Athlete License QR Code"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 440, padding: '28px 24px', textAlign: 'center' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-[1.05rem] font-black text-[#0F172A] m-0">Official Athlete License</h3>
                  <p className="text-[0.72rem] text-slate-500 m-0">Cryptographically signed with Ed25519</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] font-bold shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR code container */}
            <div
              id="license-qr-svg-wrapper"
              className="inline-flex bg-white p-3 rounded-xl border-2 border-emerald-500/20 mx-auto shadow-sm"
            >
              <QRCodeSVG value={qrUrl} size={size} level="M" />
            </div>

            {/* License identifiers */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] font-bold uppercase tracking-wide text-slate-500">
                  License Number
                </span>
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
              <div className="font-mono text-[1.05rem] font-black text-[#0F172A] break-all">
                {athlete.licenseNumber || 'PENDING'}
              </div>
              <div className="flex items-center justify-between text-[0.72rem] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Sign Scheme: Ed25519</span>
                <span>Gate Scanner Ready</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full py-2.5 rounded-xl border-0 cursor-pointer font-bold text-[0.88rem] text-white flex items-center justify-center gap-2 shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {downloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download Official License Card (PDF)
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[0.78rem] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  Verify Authenticity
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[0.78rem] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode size={14} /> Download QR
                </button>
              </div>
            </div>

            {/* Verification Result Feedback */}
            {verifyResult && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-[0.78rem] text-emerald-900 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck size={16} /> Credential Cryptographically Valid
                </div>
                <div>Status: <span className="font-bold uppercase">{verifyResult.status}</span></div>
                <div>Key ID: <span className="font-mono font-bold">{verifyResult.keyId}</span></div>
                <div>Revocation Status: <span className="font-bold">{verifyResult.currentRevocationStatus}</span></div>
                <div className="text-[0.7rem] text-emerald-700 pt-1">
                  Zero personal data leaked: Fayda NIN and private contacts strictly suppressed.
                </div>
              </div>
            )}

            {verifyError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-[0.78rem] text-rose-800">
                {verifyError}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
