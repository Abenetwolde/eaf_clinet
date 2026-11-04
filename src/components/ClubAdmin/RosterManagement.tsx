import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  Filter,
  Edit,
  Users,
  Award,
  Eye,
  Activity,
  Lock,
  ChevronRight,
  Download,
  XCircle,
  ArrowLeft,
  RefreshCw,
  X,
  Check,
  Copy,
  Loader2,
  KeyRound,
  QrCode,
  Save,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppSelector } from '../../store/hooks';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useGetClubCoachesQuery } from '../../store/api/clubApi';
import { getProfilePhotoUrl } from '../../utils/profilePhoto';
import type { Athlete } from '../../types';
import { STORAGE_KEYS } from '../../store/persistence';

interface RosterManagementProps {
  onRenewLicense?: (athlete: Athlete) => void;
  onRegisterMember: () => void;
  onUpdateAthlete?: (athlete: Athlete) => void;
}

export interface UnifiedMember {
  id: string;
  memberType: 'ATHLETE' | 'COACH';
  name: string;
  amharicName?: string;
  dob?: string;
  gender?: string;
  ageTier?: string;
  clubId?: string;
  clubName?: string;
  region?: string;
  address?: string;
  email?: string;
  phone?: string;
  emergencyContactPhone?: string;
  faydaFin?: string;
  faydaFan?: string;
  faydaStatus: 'VERIFIED' | 'PENDING';
  faydaVerifiedAt?: string;
  licenseStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'UNLICENSED';
  licenseNumber?: string;
  licenseExpiry?: string;
  primaryEvent?: string;
  specialization?: string;
  yearsOfExperience?: number;
  pb?: string;
  personalBests?: Array<{ discipline: string; mark: string; date?: string; venue?: string }>;
  photoUrl: string;
  bloodType?: string;
  height?: number | string;
  weight?: number | string;
  nationalRank?: number;
  worldRank?: number;
  coachName?: string;
  bio?: string;
  achievements?: string[];
  isEligible: boolean;
  ineligibilityReasons: string[];
  completenessScore: number;
  contractExpiry?: string;
  contractStatus?: 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'RENEWED' | string;
  contractType?: string;
  previousClubName?: string;
  monthlySalary?: number;
  releaseClause?: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function formatBloodType(bt?: string): string {
  if (!bt) return '—';
  const map: Record<string, string> = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A−', B_POSITIVE: 'B+', B_NEGATIVE: 'B−',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB−', O_POSITIVE: 'O+', O_NEGATIVE: 'O−',
  };
  return map[bt] || bt;
}
function calculateAgeTier(dob?: string | null, fallback?: string): string {
  if (!dob) return fallback || 'Senior Division';
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  if (age < 16) return `U16 Youth (${age} yrs)`;
  if (age < 18) return `U18 Youth (${age} yrs)`;
  if (age < 20) return `U20 Junior (${age} yrs)`;
  if (age >= 35) return `Masters (${age} yrs)`;
  return `Senior (${age} yrs)`;
}
function formatFin(fin?: string): string {
  if (!fin) return '';
  const d = fin.replace(/\D/g, '').slice(0, 16);
  return d.match(/.{1,4}/g)?.join(' ') || fin;
}
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.accessToken) || localStorage.getItem('token') || localStorage.getItem('eaf_token');
}
function qrUrl(m: UnifiedMember): string {
  const code = m.licenseNumber || m.id;
  return typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/api/v1/licenses/verify/${encodeURIComponent(code)}`
    : `http://localhost:3000/api/v1/licenses/verify/${encodeURIComponent(code)}`;
}

// ── Inline LicenseCard modal ───────────────────────────────────────────────
function LicenseCard({ member, onClose }: { member: UnifiedMember; onClose: () => void }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [copiedFin, setCopiedFin] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/v1/athletes/${encodeURIComponent(member.id)}/license-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `EAF_License_${member.licenseNumber || member.id}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.message || 'Could not download license card.'); }
    finally { setDownloadingPdf(false); }
  };

  const handleDownloadQr = () => {
    const svg = document.querySelector<SVGElement>('#roster-qr-wrapper svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `EAF_QR_${member.licenseNumber || member.id}.svg`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    setVerifying(true); setVerifyError(null);
    try {
      const code = member.licenseNumber || member.id;
      const res = await fetch(`/api/v1/licenses/verify/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Verification failed.');
      setVerifyResult(data.data);
    } catch (err: any) { setVerifyError(err.message); }
    finally { setVerifying(false); }
  };

  const handleCopyFin = () => {
    if (!member.faydaFin) return;
    navigator.clipboard.writeText(member.faydaFin);
    setCopiedFin(true); setTimeout(() => setCopiedFin(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 m-0">Official License Card</h3>
              <p className="text-[11px] text-slate-500 m-0">Ed25519 Cryptographic Signature</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer border-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <img src={member.photoUrl} alt={member.name}
            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
            onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/fayda_resident_photo.jpg'; }} />
          <div>
            <p className="font-black text-slate-900 text-sm m-0">{member.name}</p>
            <p className="text-xs text-slate-500 m-0">{member.ageTier} · {member.clubName}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div id="roster-qr-wrapper" className="inline-flex bg-white p-3 rounded-xl border-2 border-emerald-200 shadow-sm">
            <QRCodeSVG value={qrUrl(member)} size={170} level="M" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500 uppercase tracking-wide">License Number</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${member.licenseStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
              <CheckCircle2 size={11} /> {member.licenseStatus}
            </span>
          </div>
          <p className="font-mono font-black text-slate-900 text-base m-0">{member.licenseNumber || 'PENDING ASSIGNMENT'}</p>
          {member.faydaFin && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-mono text-slate-600">{formatFin(member.faydaFin)}</span>
              <button onClick={handleCopyFin}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                {copiedFin ? <><Check size={11} className="text-emerald-500" /> Copied</> : <><Copy size={11} /> Copy FIN</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button onClick={handleDownloadPdf} disabled={downloadingPdf}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-60">
            {downloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download Official License Card (PDF)
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleVerify} disabled={verifying}
              className="py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              {verifying ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
              Verify Authenticity
            </button>
            <button onClick={handleDownloadQr}
              className="py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <QrCode size={13} /> Download QR
            </button>
          </div>
        </div>

        {verifyResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-black flex items-center gap-1.5 m-0"><ShieldCheck size={14} /> Credential Valid</p>
            <p className="m-0">Status: <strong>{verifyResult.status}</strong></p>
            <p className="m-0 font-mono">Key: {verifyResult.keyId}</p>
          </div>
        )}
        {verifyError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">{verifyError}</div>
        )}
      </div>
    </div>
  );
}

// ── Field helper for detail view ──────────────────────────────────────────
function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-slate-900 m-0 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Edit Page (kept as a standalone full-page editor — not currently wired in) ──
function EditMemberPage({
  member,
  onBack,
  onSave,
}: {
  member: UnifiedMember;
  onBack: () => void;
  onSave: (updates: Partial<UnifiedMember>) => void;
}) {
  const [name, setName] = useState(member.name);
  const [amharic, setAmharic] = useState(member.amharicName || '');
  const [email, setEmail] = useState(member.email || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [emergencyPhone, setEmergencyPhone] = useState(member.emergencyContactPhone || '');
  const [region, setRegion] = useState(member.region || '');
  const [address, setAddress] = useState(member.address || '');
  const [primaryEvent, setPrimaryEvent] = useState(member.primaryEvent || member.specialization || '');
  const [height, setHeight] = useState(String(member.height || ''));
  const [weight, setWeight] = useState(String(member.weight || ''));
  const [bio, setBio] = useState(member.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/athletes/${encodeURIComponent(member.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          phoneNumber: phone, email, region, address: address,
          primaryEvent: member.memberType === 'ATHLETE' ? primaryEvent : undefined,
          specialization: member.memberType === 'COACH' ? primaryEvent : undefined,
          height: height ? Number(height) : undefined,
          weight: weight ? Number(weight) : undefined,
          bio,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Save failed');
      }
      onSave({
        name, amharicName: amharic, email, phone, emergencyContactPhone: emergencyPhone, region, address,
        primaryEvent: member.memberType === 'ATHLETE' ? primaryEvent : member.primaryEvent,
        specialization: member.memberType === 'COACH' ? primaryEvent : member.specialization,
        height: height ? Number(height) : member.height,
        weight: weight ? Number(weight) : member.weight,
        bio,
      });
    } catch (err: any) {
      alert(err.message || 'Could not save. Changes not persisted.');
      onBack();
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const lbl = 'block text-xs font-bold text-slate-600 mb-1';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <button onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer">
          <ArrowLeft size={15} /> Back to Profile
        </button>
        <div>
          <h2 className="text-base font-black text-slate-900 m-0">Edit Member — {member.name}</h2>
          <p className="text-xs text-slate-500 m-0">{member.memberType} · {member.clubName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard title="Fayda National Identity — Sealed (Read-only)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Legal Name (English)</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inp + ' bg-slate-50 text-slate-500 cursor-not-allowed'} disabled />
            </div>
            <div>
              <label className={lbl}>Legal Name (Amharic)</label>
              <input value={amharic} onChange={e => setAmharic(e.target.value)} className={inp + ' bg-slate-50 text-slate-500 cursor-not-allowed'} disabled />
            </div>
            <div>
              <label className={lbl}>Date of Birth</label>
              <input value={member.dob || '—'} className={inp + ' bg-slate-50 text-slate-500 cursor-not-allowed'} disabled />
            </div>
            <div>
              <label className={lbl}>Gender</label>
              <input value={member.gender || '—'} className={inp + ' bg-slate-50 text-slate-500 cursor-not-allowed'} disabled />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Fayda FIN (National ID)</label>
              <input value={formatFin(member.faydaFin) || '—'} className={inp + ' bg-slate-50 text-slate-500 font-mono cursor-not-allowed'} disabled />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Contact & Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="member@example.et" />
            </div>
            <div>
              <label className={lbl}>Mobile Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+251 91 234 5678" />
            </div>
            <div>
              <label className={lbl}>Emergency Contact Phone</label>
              <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className={inp} placeholder="+251 91 000 0000" />
            </div>
            <div>
              <label className={lbl}>Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)} className={inp}>
                <option value="">— Select —</option>
                {['Addis Ababa City Administration', 'Amhara Regional State', 'Oromia Regional State', 'Sidama Regional State',
                  'Tigray Regional State', 'Somali Regional State', 'Afar Regional State', 'Harari Regional State',
                  'Dire Dawa City Administration', 'Benishangul-Gumuz Regional State', 'Gambella Regional State',
                  'South Ethiopia Regional State', 'Central Ethiopia Regional State'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Residential Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className={inp} placeholder="e.g. Bole Sub-city, Woreda 03, House No. 456" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title={member.memberType === 'ATHLETE' ? 'Athletic Details' : 'Coaching Details'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={lbl}>{member.memberType === 'ATHLETE' ? 'Primary Competition Event' : 'Coaching Specialization'}</label>
              {member.memberType === 'ATHLETE' ? (
                <select value={primaryEvent} onChange={e => setPrimaryEvent(e.target.value)} className={inp}>
                  <option value="">— Select event —</option>
                  {['100m', '200m', '400m', '800m', '1,500m', '3,000m Steeplechase', '5,000m', '10,000m',
                    'Half Marathon', 'Marathon', 'High Jump', 'Long Jump', 'Triple Jump', 'Javelin Throw', 'Shot Put', 'Discus Throw',
                    '4x100m Relay', '4x400m Relay'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              ) : (
                <input value={primaryEvent} onChange={e => setPrimaryEvent(e.target.value)} className={inp}
                  placeholder="e.g. Sprint & Speed Endurance" />
              )}
            </div>
            {member.memberType === 'ATHLETE' && (
              <>
                <div>
                  <label className={lbl}>Height (cm)</label>
                  <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className={inp} placeholder="e.g. 175" />
                </div>
                <div>
                  <label className={lbl}>Weight (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className={inp} placeholder="e.g. 62.5" />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className={lbl}>Biography / Notes</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={inp + ' resize-none'}
                placeholder="Short bio or administrative notes…" />
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button type="button" onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-sm cursor-pointer border-0 disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function RosterManagement({ onRenewLicense, onRegisterMember, onUpdateAthlete }: RosterManagementProps) {
  const storedClub = useAppSelector((state) => state.auth.club);
  const { data: accountResponse } = useGetMeQuery(undefined, { skip: Boolean(storedClub?.id && storedClub.name) });
  const accountClub = accountResponse?.data?.club;

  const club = useMemo(() => {
    if (storedClub?.id && storedClub.name) return storedClub;
    if (accountClub?.id) return {
      id: accountClub.id, name: accountClub.name, shortName: accountClub.shortName || '',
      region: accountClub.region || '', manager: accountClub.manager || '',
      email: accountClub.email || '', phone: accountClub.phone || '',
      licensedAthletes: 0, pendingVerifications: 0, unlicensedAthletes: 0,
      transfersCount: 0, logo: accountClub.logo || '', clubRank: 0, totalPoints: 0,
    };
    return storedClub;
  }, [storedClub, accountClub]);

  const activeClubId = club?.id || accountClub?.id || (typeof window !== 'undefined' ? localStorage.getItem('eaf_currentClubId') : '') || '';
  const activeClubName = club?.name || accountClub?.name || '';

  // UI state
  const [viewingMember, setViewingMember] = useState<UnifiedMember | null>(null);
  const [editingMember, setEditingMember] = useState<UnifiedMember | null>(null);

  // Filters / search (previously referenced but never declared)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ATHLETE' | 'COACH'>('ALL');
  const [filterLicense, setFilterLicense] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'UNLICENSED'>('ALL');
  const [filterFayda, setFilterFayda] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [filterEligibility, setFilterEligibility] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  // Notification banners
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Detail-view copy feedback
  const [copiedFin, setCopiedFin] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editAmharic, setEditAmharic] = useState<string>('');
  const [editEvent, setEditEvent] = useState<string>('');
  const [editPb, setEditPb] = useState<string>('');
  const [editPhoto, setEditPhoto] = useState<string>('/images/runner_marathon.png');

  // Live queries scoped strictly to activeClubId
  const {
    data: backendAthletes = [],
    isLoading: isLoadingAthletes,
    refetch: refetchAthletes,
  } = useGetAthletesQuery(
    activeClubId ? { clubId: activeClubId, limit: 200 } : { limit: 200 },
    { refetchOnMountOrArgChange: true }
  );
  const {
    data: backendCoaches = [],
    isLoading: isLoadingCoaches,
    refetch: refetchCoaches,
  } = useGetClubCoachesQuery(
    activeClubId || '',
    { skip: !activeClubId, refetchOnMountOrArgChange: true }
  );

  // Build unified list
  const unifiedMembers: UnifiedMember[] = useMemo(() => {
    const list: UnifiedMember[] = [];

    (backendAthletes || []).forEach((b: any) => {
      if (activeClubId) {
        const matchId = b.clubId === activeClubId || b.club?.id === activeClubId;
        const matchName = activeClubName && (b.clubName || b.club?.name) &&
          (String(b.clubName || b.club?.name).toLowerCase().includes(activeClubName.toLowerCase()) ||
            activeClubName.toLowerCase().includes(String(b.clubName || b.club?.name).toLowerCase()));
        const otherClub = b.clubId && b.clubId !== activeClubId && b.club?.id && b.club.id !== activeClubId;
        if (!matchId && !matchName && otherClub) return;
      }

      const bName = b.name || `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim() || 'Unnamed';
      const faydaVer = Boolean(b.user?.faydaIdentity?.verified || b.faydaVerified);
      const faydaFin = b.faydaFin || b.user?.faydaIdentity?.nin || '';
      const faydaFan = b.faydaFan || b.fanNumber || b.user?.faydaIdentity?.faydaSub || '';
      const primaryEvt = b.primaryEvent || b.athleteSports?.[0]?.sport?.name || 'Athletics';
      const pbs = Array.isArray(b.personalBests) ? b.personalBests.map((p: any) => ({
        discipline: p.event || p.discipline || 'Event', mark: p.mark,
        date: p.date ? String(p.date).slice(0, 10) : undefined, venue: p.venue || '',
      })) : [];
      const dob = b.dateOfBirth ? String(b.dateOfBirth).slice(0, 10) : '';
      const tier = calculateAgeTier(dob, b.ageTier);
      const why: string[] = [];
      if (!faydaVer) why.push('Fayda identity not verified');
      if (b.status === 'SUSPENDED') why.push('License suspended');
      if (!['ACTIVE', 'APPROVED'].includes(b.status)) why.push('No active federation license');
      let score = 40;
      if (faydaVer) score += 25;
      if (b.licenseNumber) score += 15;
      if (b.primaryEvent) score += 10;
      if (b.user?.phoneNumber) score += 10;

      list.push({
        id: b.id, memberType: 'ATHLETE', name: bName,
        amharicName: b.amharicName || '', dob, gender: b.gender || '', ageTier: tier,
        clubId: b.clubId || activeClubId, clubName: b.clubName || activeClubName,
        region: b.region || club?.region, address: b.address || b.user?.address || '',
        email: b.user?.email || '', phone: b.user?.phoneNumber || '',
        emergencyContactPhone: b.emergencyContactPhone || '',
        faydaFin, faydaFan,
        faydaStatus: faydaVer ? 'VERIFIED' : 'PENDING',
        faydaVerifiedAt: b.faydaVerifiedAt || b.user?.faydaIdentity?.verifiedAt,
        licenseStatus: ['ACTIVE', 'APPROVED'].includes(b.status) ? 'ACTIVE' : b.status === 'SUSPENDED' ? 'EXPIRED' : 'PENDING',
        licenseNumber: b.licenseNumber || (['ACTIVE', 'APPROVED'].includes(b.status) ? `ETH-${b.id.slice(-6).toUpperCase()}` : undefined),
        licenseExpiry: b.licenseExpiry,
        primaryEvent: primaryEvt, pb: pbs.length > 0 ? `${pbs[0].discipline}: ${pbs[0].mark}` : b.pb || '',
        personalBests: pbs,
        photoUrl: getProfilePhotoUrl({ photoUrl: b.photoUrl, picture: b.user?.picture, faydaFin, faydaNin: faydaFin }) || '/images/fayda_resident_photo.jpg',
        bloodType: b.bloodType,
        height: b.height || b.fitnessStats?.heightCm,
        weight: b.weight || b.fitnessStats?.weightKg,
        nationalRank: b.nationalRank, worldRank: b.worldRank,
        coachName: b.coachName || b.coach?.user?.firstName,
        bio: b.bio || '', achievements: b.achievements || [],
        isEligible: why.length === 0, ineligibilityReasons: why,
        completenessScore: Math.min(score, 100),
        contractExpiry: b.contractExpiry ? (typeof b.contractExpiry === 'string' ? b.contractExpiry : new Date(b.contractExpiry).toISOString()) : undefined,
        contractStatus: b.contractStatus || (b.contractExpiry && new Date(b.contractExpiry) < new Date() ? 'EXPIRED' : 'ACTIVE'),
        contractType: b.contracts?.[0]?.contractType || (b as any).contractType || 'PROFESSIONAL',
        previousClubName: b.previousClubName || undefined,
        monthlySalary: b.contracts?.[0]?.monthlySalary || (b as any).monthlySalary,
        releaseClause: b.contracts?.[0]?.releaseClause || (b as any).releaseClause,
      });
    });

    (backendCoaches || []).forEach((c: any) => {
      if (activeClubId && c.clubId && c.clubId !== activeClubId) return;
      const cName = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() || 'Coach';
      const faydaVer = Boolean(c.user?.faydaIdentity?.verified);
      const faydaFin = c.user?.faydaIdentity?.nin || '';
      list.push({
        id: c.id, memberType: 'COACH', name: cName, amharicName: c.amharicName || '',
        dob: '', gender: '', ageTier: 'Coach / Staff',
        clubId: c.clubId || activeClubId, clubName: activeClubName,
        region: club?.region, address: c.user?.address || '',
        email: c.user?.email || '', phone: c.user?.phoneNumber || '',
        faydaFin, faydaFan: c.user?.faydaIdentity?.faydaSub || '',
        faydaStatus: faydaVer ? 'VERIFIED' : 'PENDING',
        licenseStatus: c.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
        licenseNumber: c.licenseNumber || `ETH-COACH-${c.id.slice(-4).toUpperCase()}`,
        specialization: c.specialization || c.sport?.name || 'Technical Coaching',
        yearsOfExperience: c.yearsOfExperience || 0,
        photoUrl: getProfilePhotoUrl({ photoUrl: c.photoUrl, picture: c.user?.picture, faydaFin }) || '/images/fayda_resident_photo.jpg',
        isEligible: false,
        ineligibilityReasons: ['Coaches are accredited for technical leadership only'],
        completenessScore: faydaVer ? 90 : 65,
      });
    });

    return list;
  }, [backendAthletes, backendCoaches, activeClubId, activeClubName, club]);

  const filteredMembers = useMemo(() => unifiedMembers.filter(m => {
    if (filterType !== 'ALL' && m.memberType !== filterType) return false;
    if (filterLicense !== 'ALL' && m.licenseStatus !== filterLicense) return false;
    if (filterFayda !== 'ALL' && m.faydaStatus !== filterFayda) return false;
    if (filterEligibility === 'ELIGIBLE' && !m.isEligible) return false;
    if (filterEligibility === 'INELIGIBLE' && m.isEligible) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return m.name.toLowerCase().includes(q)
        || (m.amharicName || '').toLowerCase().includes(q)
        || (m.faydaFin || '').toLowerCase().includes(q)
        || (m.primaryEvent || m.specialization || '').toLowerCase().includes(q)
        || (m.licenseNumber || '').toLowerCase().includes(q);
    }
    return true;
  }), [unifiedMembers, filterType, filterLicense, filterFayda, filterEligibility, searchTerm]);

  const metrics = useMemo(() => ({
    total: unifiedMembers.length,
    athletes: unifiedMembers.filter(m => m.memberType === 'ATHLETE').length,
    coaches: unifiedMembers.filter(m => m.memberType === 'COACH').length,
    verified: unifiedMembers.filter(m => m.faydaStatus === 'VERIFIED').length,
    active: unifiedMembers.filter(m => m.licenseStatus === 'ACTIVE').length,
    eligible: unifiedMembers.filter(m => m.isEligible).length,
  }), [unifiedMembers]);

  // ── Edit handling ─────────────────────────────────────────────────────────
  const handleOpenEdit = (member: UnifiedMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditAmharic(member.amharicName || '');
    setEditEvent(member.primaryEvent || member.specialization || '');
    setEditPb(member.pb || '');
    setEditPhoto(member.photoUrl || '/images/runner_marathon.png');
  };

  const handleSaveEdit = async (updates: Partial<UnifiedMember>) => {
    if (!editingMember) return;
    const updated: UnifiedMember = { ...editingMember, ...updates };

    // Persist to backend (best-effort — local update happens regardless).
    try {
      const token = getToken();
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
      const endpoint = updated.memberType === 'ATHLETE'
        ? `${apiBase}/athletes/${encodeURIComponent(updated.id)}`
        : `${apiBase}/coaches/${encodeURIComponent(updated.id)}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: updated.name,
          amharicName: updated.amharicName,
          primaryEvent: updated.primaryEvent,
          specialization: updated.specialization,
          pb: updated.pb,
          photoUrl: updated.photoUrl,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setActionErrorMsg(j.message || 'Saved locally, but server rejected the update.');
      } else {
        setActionSuccessMsg(`Updated ${updated.name}'s record.`);
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Saved locally, but the server could not be reached.');
    }

    setEditingMember(null);
    setViewingMember(updated);

    if (onUpdateAthlete && updated.memberType === 'ATHLETE') {
      onUpdateAthlete({
        id: updated.id, name: updated.name, amharicName: updated.amharicName,
        dob: updated.dob || '', gender: updated.gender || '', ageTier: updated.ageTier || '',
        club: updated.clubName, faydaFin: updated.faydaFin, faydaStatus: updated.faydaStatus,
        licenseStatus: updated.licenseStatus, licenseNumber: updated.licenseNumber,
        primaryEvent: updated.primaryEvent, pb: updated.pb, personalBests: updated.personalBests || [],
        photoUrl: updated.photoUrl, email: updated.email, phone: updated.phone, region: updated.region,
        height: typeof updated.height === 'number' ? updated.height : undefined,
        weight: typeof updated.weight === 'number' ? updated.weight : undefined,
        bio: updated.bio,
      } as unknown as Athlete);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    await handleSaveEdit({
      name: editName,
      amharicName: editAmharic,
      primaryEvent: editingMember.memberType === 'ATHLETE' ? editEvent : editingMember.primaryEvent,
      specialization: editingMember.memberType === 'COACH' ? editEvent : editingMember.specialization,
      pb: editingMember.memberType === 'ATHLETE' ? editPb : editingMember.pb,
      photoUrl: editPhoto,
    });
  };

  const handleCopyFin = () => {
    if (!viewingMember?.faydaFin) return;
    navigator.clipboard.writeText(viewingMember.faydaFin);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
  };

  return (
    <div className="space-y-6">
      {viewingMember ? (
        <div className="space-y-6">
          {/* ── Detail Page Top Navigation & Action Bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setViewingMember(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 cursor-pointer transition-all shadow-xs"
            >
              <ArrowLeft size={16} /> Back to Athlete & Member Management
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(viewingMember)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Edit size={14} /> Edit Records
              </button>
              {viewingMember.memberType === 'ATHLETE' && onRenewLicense && (
                <button
                  onClick={() => {
                    const ath = {
                      id: viewingMember.id,
                      name: viewingMember.name,
                      dob: viewingMember.dob || '',
                      gender: viewingMember.gender || '',
                      ageTier: viewingMember.ageTier || 'Senior',
                      club: viewingMember.clubName || club?.name || '',
                      faydaFin: viewingMember.faydaFin,
                      faydaStatus: viewingMember.faydaStatus,
                      licenseStatus: viewingMember.licenseStatus,
                      licenseNumber: viewingMember.licenseNumber,
                      primaryEvent: viewingMember.primaryEvent,
                      photoUrl: viewingMember.photoUrl,
                    } as Athlete;
                    onRenewLicense(ath);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-0 shadow-xs transition-colors"
                >
                  <Award size={14} /> Renew License
                </button>
              )}
            </div>
          </div>

          {/* Hero — light card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative shrink-0">
                <img src={viewingMember.photoUrl} alt={viewingMember.name}
                  className="w-24 h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-slate-100"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/fayda_resident_photo.jpg'; }} />
                {viewingMember.faydaStatus === 'VERIFIED' && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white shadow">
                    <CheckCircle2 size={15} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${viewingMember.memberType === 'ATHLETE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {viewingMember.memberType}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${viewingMember.faydaStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {viewingMember.faydaStatus === 'VERIFIED' ? '✓ Fayda Verified' : '⚠ Pending Verification'}
                  </span>
                  {viewingMember.licenseStatus === 'ACTIVE' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                      Licensed {new Date().getFullYear()}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-0.5">{viewingMember.name}</h1>
                {viewingMember.amharicName && <p className="text-base font-bold text-emerald-600 m-0">{viewingMember.amharicName}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-2">
                  <span>Club: <strong className="text-slate-800">{viewingMember.clubName || '—'}</strong></span>
                  <span>Region: <strong className="text-slate-800">{viewingMember.region || '—'}</strong></span>
                  <span>Division: <strong className="text-slate-800">{viewingMember.ageTier}</strong></span>
                  <span>License: <strong className="font-mono text-blue-700">{viewingMember.licenseNumber || 'Pending'}</strong></span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[100px]">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 m-0">Profile</p>
                  <p className="text-xl font-black text-blue-700 m-0">{viewingMember.completenessScore}%</p>
                </div>
                {viewingMember.memberType === 'ATHLETE' && (
                  <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 m-0">Status</p>
                    <p className={`text-sm font-black m-0 ${viewingMember.isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {viewingMember.isEligible ? '✓ Eligible' : '✕ Restricted'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-column detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SectionCard title="Fayda National Identity"
              action={<span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Immutable</span>}>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">National ID (FIN)</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-black text-slate-900 text-sm m-0">{formatFin(viewingMember.faydaFin) || viewingMember.faydaFan || 'Fayda Verified'}</p>
                    {viewingMember.faydaFin && (
                      <button onClick={handleCopyFin}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                        {copiedFin ? <><Check size={10} className="text-emerald-500" /> Copied</> : <><Copy size={10} /> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
                <Field label="Fayda FAN" value={viewingMember.faydaFan || '—'} mono />
                <Field label="Date of Birth" value={viewingMember.dob ? `${viewingMember.dob} · ${viewingMember.ageTier}` : '—'} />
                <Field label="Gender" value={viewingMember.gender || '—'} />
                <Field label="Region of Origin" value={viewingMember.region || club?.region || '—'} />
                <Field label="Amharic Name" value={<span className="text-emerald-700 font-bold">{viewingMember.amharicName || '—'}</span>} />
                {viewingMember.faydaVerifiedAt && <Field label="Verified At" value={new Date(viewingMember.faydaVerifiedAt).toLocaleDateString()} />}
              </div>
            </SectionCard>

            <SectionCard title="Contact & Physical Details">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <Field label="Email" value={<span className="truncate block">{viewingMember.email || '—'}</span>} />
                <Field label="Mobile Phone" value={viewingMember.phone || '—'} />
                <Field label="Emergency Contact" value={viewingMember.emergencyContactPhone || '—'} />
                <Field label="Blood Type" value={formatBloodType(viewingMember.bloodType)} />
                <Field label="Height" value={viewingMember.height ? `${viewingMember.height} cm` : '—'} />
                <Field label="Weight" value={viewingMember.weight ? `${viewingMember.weight} kg` : '—'} />
                <div className="col-span-2">
                  <Field label="Address" value={viewingMember.address || '—'} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Official Personal Bests & Sanctioned Records ── */}
          {viewingMember.memberType === 'ATHLETE' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <Award size={18} className="text-amber-500" /> Official Personal Bests & Sanctioned Records
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Federation Verified Marks</span>
              </div>

              {viewingMember.personalBests && viewingMember.personalBests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-400 font-semibold">
                        <th className="pb-2.5">Discipline / Event</th>
                        <th className="pb-2.5">Official Mark</th>
                        <th className="pb-2.5">Date Recorded</th>
                        <th className="pb-2.5">Competition Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {viewingMember.personalBests.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{rec.discipline}</td>
                          <td className="py-3 font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{rec.mark}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{rec.date || '—'}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{rec.venue || 'Federation Championship'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400 text-xs">
                  No personal bests registered yet. New marks are automatically updated from official meet results.
                </div>
              )}
            </div>
          )}

          {/* ── Athletic Performance & Eligibility Checklist ── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <Activity size={18} className="text-emerald-600" /> Federation Clearance & Eligibility Checklist
              </div>
              {viewingMember.memberType === 'ATHLETE' && (
                viewingMember.isEligible ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                    ✓ Cleared for Federation Competitions
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                    ✕ Ineligible for Competitions
                  </span>
                )
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-0.5">License Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {viewingMember.licenseNumber || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-0.5">License Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingMember.licenseStatus}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-0.5">
                  {viewingMember.memberType === 'ATHLETE' ? 'Primary Event' : 'Specialization'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingMember.primaryEvent || viewingMember.specialization || 'Athletics'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-0.5">
                  {viewingMember.memberType === 'ATHLETE' ? 'Personal Best' : 'Experience'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {viewingMember.memberType === 'ATHLETE' ? viewingMember.pb || 'N/A' : `${viewingMember.yearsOfExperience} Years`}
                </span>
              </div>
            </div>

            {viewingMember.memberType === 'ATHLETE' && !viewingMember.isEligible && (
              <div className="mt-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs">
                <div className="font-bold mb-1">Outstanding Requirements for Competition Clearance:</div>
                <ul className="list-disc pl-4 space-y-0.5 m-0">
                  {viewingMember.ineligibilityReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Bottom Navigation & Actions Bar ── */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewingMember(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back to Athlete & Member Management
            </button>

            <button
              onClick={() => handleOpenEdit(viewingMember)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 shadow-xs"
            >
              Edit Member Records
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Top Header Bar ── */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">Official Club Portal</span>
                <span className="text-xs text-slate-500">· {club?.name || 'Club'} Roster</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 m-0">Athlete & Member Management</h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">Consolidated registry of verified club athletes, coaches, and federation members.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => { refetchAthletes(); refetchCoaches(); }} disabled={isLoadingAthletes || isLoadingCoaches}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer disabled:opacity-60">
                <RefreshCw size={14} className={(isLoadingAthletes || isLoadingCoaches) ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button onClick={onRegisterMember}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer border-0">
                <UserPlus size={17} /> Register Member via Fayda
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', val: metrics.total, sub: `${metrics.athletes} Athletes · ${metrics.coaches} Coaches`, color: 'text-blue-700' },
              { label: 'Fayda Verified', val: metrics.verified, sub: `${metrics.total > 0 ? Math.round(metrics.verified / metrics.total * 100) : 0}% biometrically verified`, color: 'text-emerald-700' },
              { label: 'Active Licenses', val: metrics.active, sub: `${metrics.total - metrics.active} pending renewal`, color: 'text-amber-700' },
              { label: 'Competition Ready', val: metrics.eligible, sub: 'Eligible for meet entry', color: 'text-slate-900' },
            ].map(card => (
              <div key={card.label} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <p className="text-xs font-bold text-slate-500 mb-0.5">{card.label}</p>
                <p className={`text-2xl font-black m-0 ${card.color}`}>{card.val}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name, Fayda FIN, discipline, or license…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start">
                {(['ALL', 'ATHLETE', 'COACH'] as const).map(ft => (
                  <button key={ft} onClick={() => setFilterType(ft)}
                    className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-all ${filterType === ft ? (ft === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : ft === 'ATHLETE' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white') : 'text-slate-500 bg-transparent hover:text-slate-900'
                      }`}>
                    {ft === 'ALL' ? `All (${metrics.total})` : ft === 'ATHLETE' ? `Athletes (${metrics.athletes})` : `Coaches (${metrics.coaches})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 text-slate-400 font-bold uppercase text-[10px]">
                <Filter size={11} /> Filter:
              </div>
              {[
                { val: filterLicense, set: setFilterLicense, opts: [['ALL', 'All Licenses'], ['ACTIVE', 'Active'], ['EXPIRED', 'Expired'], ['PENDING', 'Pending'], ['UNLICENSED', 'Unlicensed']] },
                { val: filterFayda, set: setFilterFayda, opts: [['ALL', 'All Fayda'], ['VERIFIED', 'Verified'], ['PENDING', 'Pending']] },
                { val: filterEligibility, set: setFilterEligibility, opts: [['ALL', 'All Eligibility'], ['ELIGIBLE', 'Eligible'], ['INELIGIBLE', 'Ineligible']] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold">
                  {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              {(searchTerm || filterType !== 'ALL' || filterLicense !== 'ALL' || filterFayda !== 'ALL' || filterEligibility !== 'ALL') && (
                <button onClick={() => { setSearchTerm(''); setFilterType('ALL'); setFilterLicense('ALL'); setFilterFayda('ALL'); setFilterEligibility('ALL'); }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer border-0 bg-transparent">
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Success / Error Banners */}
          {actionSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer border-0 bg-transparent">✕</button>
            </div>
          )}
          {actionErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-400 text-rose-900 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertOctagon size={16} className="text-rose-600" />
                <span>{actionErrorMsg}</span>
              </div>
              <button onClick={() => setActionErrorMsg(null)} className="p-1 text-rose-700 hover:text-rose-900 cursor-pointer border-0 bg-transparent">✕</button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wide text-[11px]">
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Fayda Identity</th>
                    <th className="py-3.5 px-4">Role & Discipline</th>
                    <th className="py-3.5 px-4">Federation License</th>
                    <th className="py-3.5 px-4">Competition Eligibility</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(isLoadingAthletes || isLoadingCoaches) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw size={28} className="mx-auto mb-2 opacity-40 animate-spin" />
                        <p className="font-bold text-sm">Loading club members from federation registry…</p>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-sm">
                          {unifiedMembers.length === 0
                            ? 'No members registered for this club yet.'
                            : 'No members found matching your search or filters.'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {unifiedMembers.length === 0
                            ? 'Register your first member via Fayda to get started.'
                            : 'Try resetting filters or registering a new member via Fayda.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const isAthlete = member.memberType === 'ATHLETE';
                      return (
                        <tr
                          key={member.id}
                          onClick={() => setViewingMember(member)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/fayda_resident_photo.jpg';
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{member.name}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${isAthlete
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                                    }`}>
                                    {member.memberType}
                                  </span>
                                </div>
                                <div className="text-[11px] text-emerald-600 font-semibold">
                                  {member.amharicName || '—'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2">
                              {member.faydaStatus === 'VERIFIED' ? (
                                <>
                                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                      {formatFin(member.faydaFin) || member.faydaFan || 'Fayda Verified'}
                                    </div>
                                    <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                      <Lock size={10} /> Fayda Verified
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-amber-700 dark:text-amber-400 font-bold">Pending Verification</div>
                                    <div className="text-[10px] text-slate-400">Manual or unconfirmed ID</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isAthlete ? (
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {member.primaryEvent || 'Athletics'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Tier: <span className="font-semibold text-slate-700 dark:text-slate-300">{member.ageTier}</span>
                                  {member.pb && ` · PB: ${member.pb}`}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {member.specialization || 'Technical Coaching'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {member.yearsOfExperience} years experience
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {member.licenseStatus === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 size={12} />
                                {member.licenseNumber || 'Active (Verified)'}
                              </span>
                            ) : member.licenseStatus === 'EXPIRED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">
                                <Clock size={12} />
                                Renewal Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300">
                                <XCircle size={12} />
                                Unlicensed
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {isAthlete ? (
                              member.isEligible ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400">
                                  <CheckCircle2 size={12} />
                                  Eligible
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <AlertTriangle size={10} />
                                    Ineligible
                                  </span>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                    {member.ineligibilityReasons[0] || 'Restrictions apply'}
                                  </div>
                                </div>
                              )
                            ) : (
                              <span className="text-slate-400 text-[11px]">Coach / Official</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setViewingMember(member)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                title="View Full Profile"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(member)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Member Modal ── */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs" onClick={() => setEditingMember(null)}>
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white m-0 flex items-center gap-2">
                <Edit size={18} className="text-emerald-600" />
                Edit Member Record
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amharic Name (የአማርኛ ስም)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={editAmharic}
                  onChange={(e) => setEditAmharic(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {editingMember.memberType === 'ATHLETE' ? 'Primary Event / Discipline' : 'Coaching Specialization'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={editEvent}
                  onChange={(e) => setEditEvent(e.target.value)}
                  placeholder="e.g. 5,000m / 10,000m, Marathon, Middle Distance"
                />
              </div>

              {editingMember.memberType === 'ATHLETE' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Personal Best (PB)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={editPb}
                    onChange={(e) => setEditPb(e.target.value)}
                    placeholder="e.g. 12:48.20 or 2:03:15"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profile Photo Asset
                </label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                >
                  <option value="/images/runner_marathon.png">Marathon Runner Silhouette</option>
                  <option value="/images/runner_female.png">Track & Field Athlete</option>
                  <option value="/images/runners_training.png">Training Squad / Coach</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer border-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}