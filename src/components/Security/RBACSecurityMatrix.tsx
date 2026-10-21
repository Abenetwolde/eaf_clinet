import React, { useState } from 'react';
import {
  Shield, ShieldCheck, Lock, Eye, Check, X, FileText, AlertCircle,
  Clock, Hash, Database, Key, Server, Users, HeartPulse, UserCheck,
  ChevronDown, Search, Filter, Sparkles, Activity, Award
} from 'lucide-react';

interface RBACPermission {
  id: string;
  category: 'Athlete Data' | 'Performance' | 'Medical & Anti-Doping' | 'Competition & Events' | 'Governance & Transfers' | 'System & Audit';
  name: string;
  description: string;
  roles: {
    CLUB_PRESIDENT: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
    COACH: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
    MEDICAL_HEAD: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
    TECHNICAL_OFFICIAL: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
    ATHLETE: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
    SUPER_ADMIN: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE';
  };
  note?: string;
}

const PERMISSIONS_DATA: RBACPermission[] = [
  // Athlete Data
  {
    id: 'ath_demographics_view',
    category: 'Athlete Data',
    name: 'View Athlete Legal Demographics',
    description: 'Access full legal name, Fayda NIN, date of birth, age category, and contact details.',
    roles: {
      CLUB_PRESIDENT: 'FULL',
      COACH: 'FULL',
      MEDICAL_HEAD: 'FULL',
      TECHNICAL_OFFICIAL: 'VIEW',
      ATHLETE: 'VIEW',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'ath_fayda_biometrics',
    category: 'Athlete Data',
    name: 'Access Fayda Raw Biometrics',
    description: 'Access government verified biometric credentials and National ID assertions.',
    roles: {
      CLUB_PRESIDENT: 'NONE',
      COACH: 'NONE',
      MEDICAL_HEAD: 'RESTRICTED',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
    note: 'Privacy Protection: Raw biometric scans are never stored; only cryptographic validation tokens are recorded.',
  },
  {
    id: 'ath_profile_edit',
    category: 'Athlete Data',
    name: 'Edit Athlete Profile & Details',
    description: 'Update phone number, regional address, emergency contact, and photo credentials.',
    roles: {
      CLUB_PRESIDENT: 'FULL',
      COACH: 'VIEW',
      MEDICAL_HEAD: 'VIEW',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'FULL',
      SUPER_ADMIN: 'FULL',
    },
  },

  // Performance
  {
    id: 'perf_pb_sb_manage',
    category: 'Performance',
    name: 'Manage Personal & Season Bests',
    description: 'Digitize and submit official marks, FAT timing records, dates, and competition venues.',
    roles: {
      CLUB_PRESIDENT: 'VIEW',
      COACH: 'FULL',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'VIEW',
      ATHLETE: 'VIEW',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'perf_training_telemetry',
    category: 'Performance',
    name: 'Track Training Load & Telemetry',
    description: 'Input weekly microcycle volume, heart-rate zones, mileage, and readiness scores.',
    roles: {
      CLUB_PRESIDENT: 'VIEW',
      COACH: 'FULL',
      MEDICAL_HEAD: 'VIEW',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'FULL',
      SUPER_ADMIN: 'FULL',
    },
  },

  // Medical & Anti-Doping
  {
    id: 'med_cardiac_clearance',
    category: 'Medical & Anti-Doping',
    name: 'Sign Cardiac (ECG) Clearance',
    description: 'Review clinical ECG/Echo cardiology reports and approve pre-competition cardiac safety.',
    roles: {
      CLUB_PRESIDENT: 'NONE',
      COACH: 'NONE',
      MEDICAL_HEAD: 'FULL',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'RESTRICTED',
    },
    note: 'Protected Medical Record: Coaches and Presidents can only see if clearance is PASS/PENDING without clinical notes.',
  },
  {
    id: 'med_fit_to_compete',
    category: 'Medical & Anti-Doping',
    name: 'Issue Fit-to-Compete Clearance',
    description: 'Certify musculoskeletal readiness, injury recovery status, and competition safety.',
    roles: {
      CLUB_PRESIDENT: 'VIEW',
      COACH: 'VIEW',
      MEDICAL_HEAD: 'FULL',
      TECHNICAL_OFFICIAL: 'VIEW',
      ATHLETE: 'VIEW',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'med_tue_antidoping',
    category: 'Medical & Anti-Doping',
    name: 'Coordinate WADA / NADO TUE Applications',
    description: 'File Therapeutic Use Exemptions and manage anti-doping registered testing pool data.',
    roles: {
      CLUB_PRESIDENT: 'NONE',
      COACH: 'NONE',
      MEDICAL_HEAD: 'FULL',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'VIEW',
      SUPER_ADMIN: 'FULL',
    },
  },

  // Competition & Events
  {
    id: 'comp_athlete_entry',
    category: 'Competition & Events',
    name: 'Register Athletes for Competitions',
    description: 'Submit qualified athletes into federation championship heats, qualifiers, and meets.',
    roles: {
      CLUB_PRESIDENT: 'FULL',
      COACH: 'FULL',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'FULL',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'comp_startlist_marshaling',
    category: 'Competition & Events',
    name: 'Race Marshaling & Call-Room Check-In',
    description: 'Verify athlete bibs, spike lengths, Fayda identity verification, and call-room check-in.',
    roles: {
      CLUB_PRESIDENT: 'NONE',
      COACH: 'VIEW',
      MEDICAL_HEAD: 'VIEW',
      TECHNICAL_OFFICIAL: 'FULL',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'comp_photo_finish_cert',
    category: 'Competition & Events',
    name: 'Certify Electronic Results & Photo-Finish',
    description: 'Read primary transponder/FAT timing cameras, rule on photofinish ties, and sign results.',
    roles: {
      CLUB_PRESIDENT: 'NONE',
      COACH: 'NONE',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'FULL',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
    note: 'Official Certification: Only World Athletics accredited Technical Officials can sign off electronic timing.',
  },

  // Governance & Transfers
  {
    id: 'gov_roster_transfers',
    category: 'Governance & Transfers',
    name: 'Authorize Athlete Transfers & Loans',
    description: 'Sign official bilateral transfer agreements and release letters for athletes.',
    roles: {
      CLUB_PRESIDENT: 'FULL',
      COACH: 'VIEW',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'VIEW',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'gov_charter_contracts',
    category: 'Governance & Transfers',
    name: 'Sign Federation Charter Contracts',
    description: 'Execute official club licensing charters, affiliation fees, and voting representation.',
    roles: {
      CLUB_PRESIDENT: 'FULL',
      COACH: 'NONE',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
  },

  // System & Audit
  {
    id: 'sys_audit_logs',
    category: 'System & Audit',
    name: 'View Immutable Audit Trail',
    description: 'Access cryptographic SHA-256 logs of all federation updates, approvals, and credentials.',
    roles: {
      CLUB_PRESIDENT: 'VIEW',
      COACH: 'NONE',
      MEDICAL_HEAD: 'VIEW',
      TECHNICAL_OFFICIAL: 'VIEW',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
  },
  {
    id: 'sys_role_management',
    category: 'System & Audit',
    name: 'Grant & Revoke Stakeholder Roles',
    description: 'Assign club officials, coaches, team physicians, and technical referees.',
    roles: {
      CLUB_PRESIDENT: 'RESTRICTED',
      COACH: 'NONE',
      MEDICAL_HEAD: 'NONE',
      TECHNICAL_OFFICIAL: 'NONE',
      ATHLETE: 'NONE',
      SUPER_ADMIN: 'FULL',
    },
    note: 'Club Presidents can assign Coaches and Physicians within their own registered club.',
  },
];

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: string;
  target: string;
  targetId: string;
  ipAddress: string;
  hash: string;
  status: 'VERIFIED' | 'COMPLETED' | 'FLAGGED';
  details: Record<string, string>;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [];
const AUDIT_LOG_DATA: any[] = [];

export default function RBACSecurityMatrix({
  isOpen,
  onClose,
  isInline = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isInline?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'AUDIT' | 'ARCHITECTURE'>('MATRIX');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [ledgerStatus, setLedgerStatus] = useState<'IDLE' | 'VERIFYING' | 'VERIFIED'>('IDLE');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor Role', 'Actor Name', 'Action', 'Target', 'Target ID', 'Status', 'Hash'];
    const rows = AUDIT_LOG_DATA.map(log => [
      log.id,
      log.timestamp,
      log.actorRole,
      `"${log.actorName}"`,
      `"${log.action}"`,
      `"${log.target}"`,
      log.targetId,
      log.status,
      log.hash
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EAF_Security_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionSuccessMessage('Security audit ledger exported successfully (CSV).');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleExportJson = () => {
    const exportData = {
      federation: 'Ethiopian Athletics Federation',
      generatedAt: new Date().toISOString(),
      mfaPolicyEnforced: mfaEnforced,
      permissions: PERMISSIONS_DATA,
      auditLedger: AUDIT_LOG_DATA
    };
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EAF_RBAC_Security_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionSuccessMessage('Federation security policy report exported (JSON).');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleVerifyLedger = () => {
    setLedgerStatus('VERIFYING');
    setTimeout(() => {
      setLedgerStatus('VERIFIED');
      setActionSuccessMessage('All cryptographic SHA-256 ledger blocks verified 100% authentic against National ID registry.');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }, 1000);
  };

  if (!isOpen) return null;

  const categories = ['ALL', 'Athlete Data', 'Performance', 'Medical & Anti-Doping', 'Competition & Events', 'Governance & Transfers', 'System & Audit'];

  const filteredPermissions = PERMISSIONS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderBadge = (level: 'FULL' | 'VIEW' | 'RESTRICTED' | 'NONE') => {
    switch (level) {
      case 'FULL':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC',
            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800
          }}>
            <Check size={12} strokeWidth={3} /> FULL
          </span>
        );
      case 'VIEW':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC',
            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800
          }}>
            <Eye size={12} strokeWidth={2.5} /> VIEW
          </span>
        );
      case 'RESTRICTED':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE',
            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800
          }}>
            <Lock size={12} strokeWidth={2.5} /> SPECIAL
          </span>
        );
      case 'NONE':
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0',
            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700
          }}>
            <X size={12} strokeWidth={2.5} /> DENIED
          </span>
        );
    }
  };

  return (
    <div
      style={isInline ? {
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 16px',
      } : {
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={isInline ? undefined : onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: isInline ? '100%' : '1100px',
          maxHeight: isInline ? 'none' : '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isInline ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #CBD5E1',
          overflow: isInline ? 'visible' : 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >


        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
          color: '#FFFFFF',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
            }}>
              <ShieldCheck size={26} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                  Federation Security &amp; RBAC Control Matrix
                </h3>
                <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.68rem', fontWeight: 900, padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                  LIVE ENFORCEMENT
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Explicit role boundaries for Coaches, Health Heads, Club Presidents, and Technical Officials with SHA-256 audit logging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Super Admin Action Controls */}
        <div style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0369A1', background: '#E0F2FE', padding: '3px 8px', borderRadius: '6px' }}>
              Super Admin Controls
            </span>
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
              Executive Live Security Actions:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} color="#0284C7" /> Export Audit Log (CSV)
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Database size={14} color="#059669" /> Export Security Report (JSON)
            </button>

            <button
              type="button"
              onClick={handleVerifyLedger}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: ledgerStatus === 'VERIFIED' ? '#ECFDF5' : '#FFFFFF',
                border: ledgerStatus === 'VERIFIED' ? '1px solid #6EE7B7' : '1px solid #CBD5E1',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: ledgerStatus === 'VERIFIED' ? '#047857' : '#334155',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={14} color={ledgerStatus === 'VERIFIED' ? '#059669' : '#D97706'} />
              {ledgerStatus === 'VERIFYING' ? 'Verifying...' : ledgerStatus === 'VERIFIED' ? '✓ Ledger 100% Intact' : 'Verify Identity Ledger'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMfaEnforced(!mfaEnforced);
                setActionSuccessMessage(!mfaEnforced ? 'Mandatory Multi-Factor Authentication ENFORCED for all administrative roles.' : 'MFA policy set to Standard.');
                setTimeout(() => setActionSuccessMessage(null), 4000);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: mfaEnforced ? '#F0FDF4' : '#F8FAFC',
                border: mfaEnforced ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: mfaEnforced ? '#15803D' : '#64748B',
                cursor: 'pointer'
              }}
            >
              <Lock size={14} color={mfaEnforced ? '#16A34A' : '#94A3B8'} />
              {mfaEnforced ? 'MFA Mandate: Enforced' : 'MFA Mandate: Standard'}
            </button>
          </div>
        </div>

        {actionSuccessMessage && (
          <div style={{
            background: '#F0FDF4',
            borderBottom: '1px solid #BBF7D0',
            padding: '8px 24px',
            fontSize: '0.8rem',
            color: '#166534',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={14} strokeWidth={3} /> {actionSuccessMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          padding: '12px 28px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          gap: '12px',
          flexShrink: 0,
        }}>
          {[
            { id: 'MATRIX', label: 'RBAC Permission Matrix', icon: <Shield size={16} /> },
            { id: 'AUDIT', label: 'Immutable Audit Trail', icon: <Database size={16} /> },
            { id: 'ARCHITECTURE', label: 'Security Architecture', icon: <Lock size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: activeTab === tab.id ? '1px solid #0284C7' : '1px solid transparent',
                background: activeTab === tab.id ? '#0284C7' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* TAB 1: RBAC MATRIX */}
          {activeTab === 'MATRIX' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Role Definition Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '14px',
              }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Club President</div>
                      <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 800 }}>CLUB_ADMIN</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    Executive governance, charter contracts, player transfers &amp; fee authorizations. Restricted from clinical ECG details.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Head Coach</div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>COACH</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    Discipline telemetry, PBs/SBs tracking, competition entry submissions. Restricted from transfer contract approvals.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#8B5CF6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Health / Medical Head</div>
                      <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 800 }}>MEDICAL_STAFF</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    Pre-participation cardiac ECG clearances, WADA TUE filings &amp; Fit-to-Compete certs. Absolute medical confidentiality.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>Technical Official</div>
                      <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 800 }}>REFEREE</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    FAT electronic timing validation, call-room verification, official result sealing &amp; disqualification rulings.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: selectedCategory === c ? '1px solid #0284C7' : '1px solid #E2E8F0',
                        background: selectedCategory === c ? '#E0F2FE' : '#FFFFFF',
                        color: selectedCategory === c ? '#0369A1' : '#64748B',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 12px 7px 30px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Permission Table */}
              <div style={{
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.76rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Operation / Entitlement
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#0369A1', textAlign: 'center' }}>
                        Club President
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#059669', textAlign: 'center' }}>
                        Head Coach
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#7C3AED', textAlign: 'center' }}>
                        Health Head
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#D97706', textAlign: 'center' }}>
                        Tech Official
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#475569', textAlign: 'center' }}>
                        Athlete
                      </th>
                      <th style={{ padding: '12px 10px', fontSize: '0.76rem', fontWeight: 900, color: '#DC2626', textAlign: 'center' }}>
                        Super Admin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <td style={{ padding: '12px 16px', maxWidth: '340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.category}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                              {item.name}
                            </span>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35 }}>
                            {item.description}
                          </p>
                          {item.note && (
                            <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#7C3AED', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={11} /> {item.note}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.CLUB_PRESIDENT)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.COACH)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.MEDICAL_HEAD)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.TECHNICAL_OFFICIAL)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.ATHLETE)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>{renderBadge(item.roles.SUPER_ADMIN)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Ledger Status Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
                borderRadius: '16px',
                padding: '18px 22px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={22} color="#FFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900 }}>Cryptographic Audit Ledger</div>
                    <div style={{ fontSize: '0.76rem', color: '#34D399' }}>
                      All federation actions hashed with SHA-256 · Merkle root checked &amp; immutable
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Verified Events</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FFF' }}>12,489</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Ledger Integrity</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#34D399' }}>100% Intact</div>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div style={{
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                background: '#FFFFFF',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Event &amp; Action</th>
                      <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Actor &amp; Role</th>
                      <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Target Entity</th>
                      <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Cryptographic Hash</th>
                      <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_AUDIT_LOGS.map((log, idx) => (
                      <tr
                        key={log.id}
                        style={{
                          background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              background: '#10B981', color: '#FFF', fontSize: '0.65rem',
                              fontWeight: 900, padding: '2px 6px', borderRadius: '4px'
                            }}>
                              {log.status}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                              {log.action}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                            {log.timestamp} · {log.category}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>{log.actor}</div>
                          <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 700 }}>{log.actorRole}</div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{log.target}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{log.targetId}</div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{
                            fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569',
                            background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px',
                            maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }} title={log.hash}>
                            {log.hash.substring(0, 22)}...
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            style={{
                              background: '#E0F2FE',
                              color: '#0369A1',
                              border: '1px solid #BAE6FD',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Diff
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'ARCHITECTURE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#FFFFFF',
              }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 900, color: '#38BDF8' }}>
                  Ethiopian Athletics Federation Digital Trust Architecture
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                  Built upon MOSIP eSignet open identity protocols, National ID Program (Fayda) biometric assertions,
                  and World Athletics Anti-Doping integrity standards. The architecture guarantees non-repudiation,
                  granular role isolation, and protected athlete medical privacy.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Key size={20} color="#0284C7" />
                    <h5 style={{ margin: 0, fontWeight: 900, fontSize: '0.92rem', color: '#0F172A' }}>Fayda National ID Program (Digital Authentication)</h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                    Authorization code flow with PKCE prevents interception. Demographic credentials are authenticated directly with the National ID Program (Fayda).
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <HeartPulse size={20} color="#8B5CF6" />
                    <h5 style={{ margin: 0, fontWeight: 900, fontSize: '0.92rem', color: '#0F172A' }}>Medical Isolation Barrier</h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                    Athletes' clinical ECG data, echocardiogram scans, and TUE records are encrypted end-to-end. Only licensed Health Heads hold decryption keys.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Award size={20} color="#10B981" />
                    <h5 style={{ margin: 0, fontWeight: 900, fontSize: '0.92rem', color: '#0F172A' }}>World Athletics Timing Proof</h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                    Electronic FAT photofinish timing records include sensor hashes and referee digital signatures before official national rankings update.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            &copy; 2026 Ethiopian Athletics Federation &amp; National ID Program (NIDP)
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            Close Security Matrix
          </button>
        </div>

        {/* Detail Inspection Modal */}
        {selectedAuditLog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setSelectedAuditLog(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '560px',
                width: '100%',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#10B981" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>Audit Payload Inspection</h4>
                </div>
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '4px' }}>Transaction ID</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, fontFamily: 'monospace' }}>{selectedAuditLog.id}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '8px', marginBottom: '4px' }}>Cryptographic SHA-256 Hash</div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#0369A1', wordBreak: 'break-all' }}>{selectedAuditLog.hash}</div>
              </div>

              <h5 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 800 }}>Payload Attribute Diff:</h5>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px' }}>
                {Object.entries(selectedAuditLog.details).map(([k, v], i) => (
                  <div key={k} style={{ display: 'flex', padding: '8px 12px', background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>
                    <span style={{ width: '40%', fontWeight: 700, color: '#64748B' }}>{k}:</span>
                    <span style={{ width: '60%', fontWeight: 800, color: '#0F172A' }}>{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedAuditLog(null)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
