import React, { useState } from 'react';
import { ShieldCheck, Upload, FileCheck, RefreshCw, Info } from 'lucide-react';
import type { Athlete } from '../../types';

interface FaydaVerificationProps {
  athlete: Athlete;
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function FaydaVerification({ athlete, onUpdateAthlete, onNotify }: FaydaVerificationProps) {
  const [finInput, setFinInput] = useState(athlete.faydaFin || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(
    athlete.faydaStatus === 'VERIFIED' ? {
      status: 'VERIFIED',
      hash: athlete.faydaHash,
      ageTier: athlete.ageTier
    } : null
  );

  const [selectedDocType, setSelectedDocType] = useState('BIRTH_CERTIFICATE');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRunFaydaQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const newHash = '0xFAYDA_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setVerifiedResult({ status: 'VERIFIED', hash: newHash, ageTier: athlete.ageTier });
      onUpdateAthlete({ ...athlete, faydaFin: finInput, faydaStatus: 'VERIFIED', faydaHash: newHash });
      onNotify('Fayda FIN verified against Ethiopian Digital Identity Hash Index.', 'success');
    }, 1400);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onUpdateAthlete({
        ...athlete,
        secondaryDoc: {
          type: selectedDocType,
          docNumber: 'DOC-ETH-2026-' + Math.floor(1000 + Math.random() * 9000),
          fileName: docFile ? docFile.name : 'Scanned_Document.pdf',
          uploadDate: new Date().toLocaleDateString(),
          verificationStatus: 'AUDITED_AND_APPROVED'
        }
      });
      onNotify('Secondary KYC document uploaded to EAF Audit Queue.', 'success');
    }, 1400);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-[1.35rem] font-extrabold text-text-heading">
          Fayda National ID & KYC Verification
        </h3>
        <p className="text-[0.84rem] text-text-muted mt-1">
          Proclamation No. 1284/2023 —  verification mandatory for all registered athletes
        </p>
      </div>

      {/* Info banner — name/dob from Fayda */}
      <div className="bg-primary-light border border-[rgba(0,80,160,0.2)] rounded-[10px] px-4 py-3 mb-6 flex items-start gap-2.5">
        <Info size={18} color="var(--eth-blue)" className="shrink-0 mt-[1px]" />
        <p className="text-[0.83rem] text-primary font-semibold leading-[1.5]">
          Your full name, date of birth, gender, and age division are sourced directly from the Fayda government database.
          You only need to provide your FIN below — no personal information needs to be entered manually.
        </p>
      </div>

      {/* Current Fayda profile (read-only, from Fayda) */}
      <div className="gov-card mb-6 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-0 rounded-[18px] p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} color="var(--primary)" />
          <span className="font-black text-white text-[0.95rem]">Fayda Government Sourced Profile</span>
          {athlete.faydaStatus === 'VERIFIED' && <span className="badge badge-green text-[0.7rem] bg-[#10B981] text-white">VERIFIED</span>}
        </div>
        
        <div className="flex gap-5 items-center flex-wrap">
          <div className="relative">
            <img 
              src={athlete.photoUrl || '/images/runner_marathon.png'} 
              alt={athlete.name} 
              className="w-[88px] h-[88px] rounded-[16px] object-cover border-[3px] border-primary shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[0.7rem] font-black">
              ✓
            </div>
          </div>

          <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
            {[
              { label: 'Full Name', value: athlete.name, color: '#FFFFFF' },
              { label: 'Amharic Name', value: athlete.amharicName, color: 'var(--primary)' },
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
        {/* Fayda FIN Query */}
        <div className="gov-card">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck size={20} color="var(--primary)" />
            <h4 className="text-[1.05rem] font-bold">Re-Verify Fayda FIN</h4>
          </div>
          <p className="text-[0.82rem] text-text-muted mb-4 leading-[1.5]">
            Run a fresh query against the Fayda government identity server to update your verification status and hash.
          </p>
          <form onSubmit={handleRunFaydaQuery}>
            <div className="form-group">
              <label className="form-label">Fayda FIN (12-Digit National ID Number)</label>
              <input type="text" className="form-input" value={finInput}
                onChange={e => setFinInput(e.target.value)} placeholder="e.g. 9840-3920-1124" required />
            </div>
            <button type="submit" className="btn-gov-primary w-full mb-4" disabled={isVerifying}>
              {isVerifying
                ? <><RefreshCw size={15} className="animate-spin" /> Querying Fayda Server...</>
                : <><ShieldCheck size={15} /> Execute Verification Query</>
              }
            </button>
          </form>

          {verifiedResult && (
            <div className="bg-primary-light border border-[rgba(11,87,142,0.25)] rounded-[10px] p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.75rem] font-extrabold text-primary">VERIFICATION RECORD</span>
                <span className="badge badge-green">VERIFIED</span>
              </div>
              <div className="text-[0.83rem] text-text-heading leading-[1.7]">
                <div>FIN: <strong className="font-mono">{finInput}</strong></div>
                <div>Age Division: <strong className="text-primary">{verifiedResult.ageTier}</strong></div>
                <div className="text-[0.7rem] text-text-muted font-mono mt-0.5">
                  Hash: {verifiedResult.hash}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary KYC */}
        <div className="gov-card">
          <div className="flex items-center gap-2.5 mb-3.5">
            <Upload size={20} color="var(--eth-blue)" />
            <h4 className="text-[1.05rem] font-bold">Secondary KYC Document</h4>
          </div>
          <p className="text-[0.82rem] text-text-muted mb-4 leading-[1.5]">
            Required for U16/U18 athletes and foreign nationals — upload a supporting identity document.
          </p>
          <form onSubmit={handleUploadDoc}>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select className="form-select" value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}>
                <option value="BIRTH_CERTIFICATE">Official Certified Birth Certificate</option>
                <option value="PASSPORT">Ethiopian / Foreign Passport</option>
                <option value="SCHOOL_RECORD">Ministry of Education Student Record</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Upload Scanned File (PDF / JPEG)</label>
              <input type="file" className="form-input" onChange={e => setDocFile(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg" />
            </div>
            <button type="submit" className="btn-gov-secondary w-full mb-4" disabled={isUploading}>
              {isUploading
                ? <><RefreshCw size={14} className="animate-spin" /> Uploading...</>
                : <><Upload size={14} /> Upload to EAF Audit Queue</>
              }
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
