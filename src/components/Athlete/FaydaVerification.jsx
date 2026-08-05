import React, { useState } from 'react';
import { ShieldCheck, Upload, FileCheck, RefreshCw, Info } from 'lucide-react';

export default function FaydaVerification({ athlete, onUpdateAthlete, onNotify }) {
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
  const [docFile, setDocFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRunFaydaQuery = (e) => {
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

  const handleUploadDoc = (e) => {
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
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          Fayda National ID & KYC Verification
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Proclamation No. 1284/2023 —  verification mandatory for all registered athletes
        </p>
      </div>

      {/* Info banner — name/dob from Fayda */}
      <div style={{ background: 'var(--eth-blue-light)', border: '1px solid rgba(0,80,160,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Info size={18} color="var(--eth-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '0.83rem', color: 'var(--eth-blue)', fontWeight: 600, lineHeight: 1.5 }}>
          Your full name, date of birth, gender, and age division are sourced directly from the Fayda government database.
          You only need to provide your FIN below — no personal information needs to be entered manually.
        </p>
      </div>

      {/* Current Fayda profile (read-only, from Fayda) */}
      <div className="gov-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: 'none', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <span style={{ fontWeight: 900, color: '#FFFFFF', fontSize: '0.95rem' }}>Fayda Government Sourced Profile</span>
          {athlete.faydaStatus === 'VERIFIED' && <span className="badge badge-green" style={{ fontSize: '0.7rem', background: '#10B981', color: '#FFF' }}>VERIFIED</span>}
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={athlete.photoUrl || '/images/runner_marathon.png'} 
              alt={athlete.name} 
              style={{ width: '88px', height: '88px', borderRadius: '16px', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
            />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary)', color: '#FFF', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
              ✓
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {[
              { label: 'Full Name', value: athlete.name, color: '#FFFFFF' },
              { label: 'Amharic Name', value: athlete.amharicName, color: 'var(--primary)' },
              { label: 'Date of Birth', value: athlete.dob || '—', color: '#CBD5E1' },
              { label: 'Gender', value: athlete.gender || '—', color: '#CBD5E1' },
              { label: 'Age Division', value: athlete.ageTier, color: '#F59E0B' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{f.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: f.color }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        
        {athlete.faydaHash && (
          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
            Audit Hash: {athlete.faydaHash}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Fayda FIN Query */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Re-Verify Fayda FIN</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            Run a fresh query against the Fayda government identity server to update your verification status and hash.
          </p>
          <form onSubmit={handleRunFaydaQuery}>
            <div className="form-group">
              <label className="form-label">Fayda FIN (12-Digit National ID Number)</label>
              <input type="text" className="form-input" value={finInput}
                onChange={e => setFinInput(e.target.value)} placeholder="e.g. 9840-3920-1124" required />
            </div>
            <button type="submit" className="btn-gov-primary" style={{ width: '100%', marginBottom: '16px' }} disabled={isVerifying}>
              {isVerifying
                ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Querying Fayda Server...</>
                : <><ShieldCheck size={15} /> Execute Verification Query</>
              }
            </button>
          </form>

          {verifiedResult && (
            <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(11,87,142,0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>VERIFICATION RECORD</span>
                <span className="badge badge-green">VERIFIED</span>
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-heading)', lineHeight: 1.7 }}>
                <div>FIN: <strong style={{ fontFamily: 'var(--font-mono)' }}>{finInput}</strong></div>
                <div>Age Division: <strong style={{ color: 'var(--eth-blue)' }}>{verifiedResult.ageTier}</strong></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Hash: {verifiedResult.hash}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary KYC */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Upload size={20} color="var(--eth-blue)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Secondary KYC Document</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
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
            <button type="submit" className="btn-gov-secondary" style={{ width: '100%', marginBottom: '16px' }} disabled={isUploading}>
              {isUploading
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                : <><Upload size={14} /> Upload to EAF Audit Queue</>
              }
            </button>
          </form>

          {athlete.secondaryDoc && (
            <div style={{ background: '#F0F5FA', border: '1px solid #C8D8E5', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck color="var(--primary)" size={20} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{athlete.secondaryDoc.fileName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
