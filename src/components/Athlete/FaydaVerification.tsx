import React, { useState } from 'react';
import { ShieldCheck, Upload, FileCheck, RefreshCw, Info, ExternalLink } from 'lucide-react';
import type { Athlete } from '../../types';
import { launchFaydaPortal, FAYDA_CONFIG } from '../../constants/fayda';

interface FaydaVerificationProps {
  athlete: Athlete;
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function FaydaVerification({ athlete, onUpdateAthlete, onNotify }: FaydaVerificationProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('BIRTH_CERTIFICATE');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── Official VeriFayda 2.0 (eSignet) Flow ──
  const handleLaunchFayda = async () => {
    setIsLaunching(true);
    try {
      const redirectUri = FAYDA_CONFIG.redirectUri;
      await launchFaydaPortal(redirectUri, false);
    } catch (err: any) {
      console.error('Failed to launch Fayda portal:', err);
      onNotify('Failed to connect to Fayda identity server. Please try again.', 'error');
      setIsLaunching(false);
    }
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify('Supporting identity documents cannot be securely stored yet. No file was uploaded or recorded.', 'info');
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-[1.35rem] font-extrabold text-text-heading">
          Fayda National ID & KYC Verification
        </h3>
        <p className="text-[0.84rem] text-text-muted mt-1">
          Government biometric identity synchronization and document compliance.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-primary-light border border-[rgba(0,80,160,0.2)] rounded-[10px] px-4 py-3 mb-6 flex items-start gap-2.5">
        <Info size={18} color="var(--eth-blue)" className="shrink-0 mt-[1px]" />
        <p className="text-[0.83rem] text-primary font-semibold leading-[1.5]">
          Biometric authentication is conducted securely via the official <strong>Fayda eSignet</strong> government portal.
        </p>
      </div>

      {/* Current Fayda profile (read-only, from Fayda) */}
      <div className="gov-card mb-6 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-0 rounded-[18px] p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} color="#38BDF8" />
            <span className="font-black text-white text-[0.95rem]">Fayda Government Profile</span>
          </div>
          {athlete.faydaStatus === 'VERIFIED' ? (
            <span className="badge badge-green text-[0.7rem] bg-[#10B981] text-white font-extrabold px-3 py-1 rounded-full">
              ✓ VERIFIED
            </span>
          ) : (
            <span className="text-[0.7rem] bg-[#F59E0B] text-black font-extrabold px-3 py-1 rounded-full">
              PENDING VERIFICATION
            </span>
          )}
        </div>
        
        <div className="flex gap-5 items-center flex-wrap">
          <div className="relative">
            <img 
              src={athlete.photoUrl || '/images/runner_marathon.png'} 
              alt={athlete.name} 
              className="w-[88px] h-[88px] rounded-[16px] object-cover border-[3px] border-[#38BDF8] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            />
            {athlete.faydaStatus === 'VERIFIED' && (
              <div className="absolute -bottom-1 -right-1 bg-[#10B981] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[0.7rem] font-black">
                ✓
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
            {[
              { label: 'Full Name', value: athlete.name, color: '#FFFFFF' },
              { label: 'Amharic Name', value: athlete.amharicName || athlete.name, color: '#38BDF8' },
              { label: 'National ID (NIN)', value: athlete.faydaFin || '—', color: '#FCD34D' },
              { label: 'Date of Birth', value: athlete.dob || '—', color: '#CBD5E1' },
              { label: 'Gender', value: athlete.gender || '—', color: '#CBD5E1' },
              { label: 'Age Division', value: athlete.ageTier, color: '#F59E0B' },
            ].map(f => (
              <div key={f.label}>
                <div className="text-[0.7rem] font-bold text-[#94A3B8] uppercase tracking-[0.05em] mb-[3px]">{f.label}</div>
                <div className="text-[0.95rem] font-extrabold" style={{ color: f.color }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        
        {athlete.faydaHash && (
          <div className="mt-4 text-[0.75rem] text-[#64748B] font-mono border-t border-white/10 pt-3">
            Audit Hash: {athlete.faydaHash}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {/* Official Fayda eSignet Redirect Card */}
        <div className="gov-card">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck size={20} color="var(--primary)" />
            <h4 className="text-[1.05rem] font-bold">
              {athlete.faydaStatus === 'VERIFIED' ? 'Re-Authenticate with VeriFayda 2.0' : 'Authenticate with VeriFayda 2.0'}
            </h4>
          </div>
          <p className="text-[0.82rem] text-text-muted mb-4 leading-[1.5]">
            Authenticate directly on the official <strong>VeriFayda 2.0 (eSignet)</strong> portal using your National ID and OTP passcode.
          </p>

          <button
            type="button"
            onClick={handleLaunchFayda}
            disabled={isLaunching}
            className="btn-accent w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 mb-4"
            style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' }}
          >
            {isLaunching ? (
              <><RefreshCw size={16} className="animate-spin" /> Redirecting to Fayda Portal...</>
            ) : (
              <><ExternalLink size={16} /> Open Official Fayda eSignet Portal →</>
            )}
          </button>

          <div className="text-[0.74rem] text-text-muted bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <strong>OIDC Security:</strong> Authorization Code Flow with PKCE (S256) · Client Assertion JWT (RS256).
          </div>
        </div>

        {/* Secondary KYC */}
        <div className="gov-card">
          <div className="flex items-center gap-2.5 mb-3.5">
            <Upload size={20} color="var(--eth-blue)" />
            <h4 className="text-[1.05rem] font-bold">Secondary KYC Document</h4>
          </div>
          <p className="text-[0.82rem] text-text-muted mb-4 leading-[1.5]">
            Supporting identity document storage is not configured. Do not enter document data here.
          </p>
          <form onSubmit={handleUploadDoc}>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select className="form-select" value={selectedDocType} disabled><option value="BIRTH_CERTIFICATE">Unavailable</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">Upload Scanned File (PDF / JPEG)</label>
              <input type="file" className="form-input" disabled accept=".pdf,.png,.jpg,.jpeg" />
            </div>
            <button type="submit" className="btn-gov-secondary w-full mb-4" disabled>
              <Upload size={14} /> Secure document storage unavailable
            </button>
          </form>

          {athlete.secondaryDoc && (
            <div className="bg-[#F0F5FA] border border-[#C8D8E5] rounded-[10px] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck color="var(--primary)" size={20} />
                <div>
                  <div className="font-bold text-[0.84rem]">{athlete.secondaryDoc.fileName}</div>
                  <div className="text-[0.72rem] text-text-muted">
                    {athlete.secondaryDoc.docNumber} · {athlete.secondaryDoc.uploadDate}
                  </div>
                </div>
              </div>
              <span className="badge badge-green">APPROVED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
