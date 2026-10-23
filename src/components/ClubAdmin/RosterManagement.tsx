import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  Filter,
  Edit,
  Users,
  Award,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Eye,
  Activity,
  FileCheck2,
  Lock,
  ChevronRight,
  Download,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppSelector } from '../../store/hooks';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useGetClubCoachesQuery } from '../../store/api/clubApi';
import type { Athlete } from '../../types';

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
  primaryEvent?: string;
  specialization?: string;
  yearsOfExperience?: number;
  pb?: string;
  personalBests?: Array<{ discipline: string; mark: string; date?: string; venue?: string }>;
  photoUrl: string;
  bloodType?: string;
  height?: number | string;
  weight?: number | string;
  isEligible: boolean;
  ineligibilityReasons: string[];
  completenessScore: number;
}

function formatBloodType(bt?: string): string {
  if (!bt || bt === 'Unknown') return '—';
  const map: Record<string, string> = {
    'A_POSITIVE': 'A+ (Positive)',
    'A_NEGATIVE': 'A- (Negative)',
    'B_POSITIVE': 'B+ (Positive)',
    'B_NEGATIVE': 'B- (Negative)',
    'AB_POSITIVE': 'AB+ (Positive)',
    'AB_NEGATIVE': 'AB- (Negative)',
    'O_POSITIVE': 'O+ (Positive)',
    'O_NEGATIVE': 'O- (Negative)',
  };
  return map[bt] || bt;
}

function calculateAgeTier(dob?: string | null, fallback?: string): string {
  if (!dob) return fallback || 'Senior Division';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return fallback || 'Senior Division';
  const age = 2026 - birthDate.getFullYear();
  if (age < 16) return `U16 Youth (${age} yrs)`;
  if (age < 18) return `U18 Youth (${age} yrs)`;
  if (age < 20) return `U20 Junior (${age} yrs)`;
  if (age >= 35) return `Masters Division (${age} yrs)`;
  return `Senior Division (${age} yrs)`;
}

function formatFaydaFin(fin?: string): string {
  if (!fin) return '';
  const digits = fin.replace(/\D/g, '');
  if (digits.length >= 12) {
    return digits.slice(0, 16).match(/.{1,4}/g)?.join(' ') || fin;
  }
  return fin;
}

export default function RosterManagement({
  onRenewLicense,
  onRegisterMember,
  onUpdateAthlete,
}: RosterManagementProps) {
  const { t } = useI18n();
  const storedClub = useAppSelector((state) => state.auth.club);
  const { data: accountResponse } = useGetMeQuery(undefined, {
    skip: Boolean(storedClub?.id && storedClub.name),
  });
  const accountClub = accountResponse?.data?.club;

  const club = useMemo(() => {
    if (storedClub?.id && storedClub.name) return storedClub;
    if (accountClub?.id) {
      return {
        id: accountClub.id,
        name: accountClub.name,
        shortName: accountClub.shortName || '',
        region: accountClub.region || '',
        manager: accountClub.manager || '',
        email: accountClub.email || '',
        phone: accountClub.phone || '',
        licensedAthletes: 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: accountClub.logo || '',
        clubRank: 0,
        totalPoints: 0,
      };
    }
    return storedClub;
  }, [storedClub, accountClub]);

  const activeClubId = club?.id || accountClub?.id || (typeof window !== 'undefined' ? localStorage.getItem('eaf_currentClubId') : '') || '';
  const activeClubName = club?.name || accountClub?.name || '';

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'ATHLETE' | 'COACH'>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterLicense, setFilterLicense] = useState<string>('ALL');
  const [filterFayda, setFilterFayda] = useState<string>('ALL');
  const [filterEligibility, setFilterEligibility] = useState<string>('ALL');

  // Modals State
  const [viewingMember, setViewingMember] = useState<UnifiedMember | null>(null);
  const [editingMember, setEditingMember] = useState<UnifiedMember | null>(null);

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editAmharic, setEditAmharic] = useState<string>('');
  const [editEvent, setEditEvent] = useState<string>('');
  const [editPb, setEditPb] = useState<string>('');
  const [editPhoto, setEditPhoto] = useState<string>('/images/runner_marathon.png');

  // Live queries from backend scoped strictly to activeClubId
  const { data: backendAthletes = [], isLoading: isLoadingAthletes } = useGetAthletesQuery(
    activeClubId ? { clubId: activeClubId } : undefined
  );
  const { data: backendCoaches = [], isLoading: isLoadingCoaches } = useGetClubCoachesQuery(
    activeClubId || '',
    { skip: !activeClubId }
  );

  // Build unified member list merging real backend athletes and coaches strictly for this club
  const unifiedMembers: UnifiedMember[] = useMemo(() => {
    const list: UnifiedMember[] = [];

    // 1. Process Athletes - strictly only members of this club!
    (backendAthletes || []).forEach((b: any) => {
      if (activeClubId) {
        const matchesId = b.clubId === activeClubId;
        const matchesName = activeClubName && b.clubName && (
          b.clubName.trim().toLowerCase() === activeClubName.trim().toLowerCase()
        );
        if (!matchesId && !matchesName) {
          return; // Exclude athlete belonging to another club
        }
      }

      const bName = b.name || `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim() || 'Unnamed Athlete';
      const faydaVerified = Boolean(b.user?.faydaIdentity?.verified || b.faydaVerified);
      const faydaFin = b.faydaFin || b.user?.faydaIdentity?.nin || '';
      const faydaFan = b.faydaFan || b.fanNumber || b.user?.faydaIdentity?.faydaSub || '';
      const primaryEvent = b.primaryEvent || b.athleteSports?.[0]?.sport?.name || 'Athletics';

      // Parse personal bests list from database relation
      const personalBests = Array.isArray(b.personalBests) ? b.personalBests.map((p: any) => ({
        discipline: p.event || p.discipline || 'Event',
        mark: p.mark,
        date: p.date ? (typeof p.date === 'string' ? p.date.slice(0, 10) : new Date(p.date).toISOString().slice(0, 10)) : undefined,
        venue: p.venue || '',
      })) : [];

      const primaryPb = personalBests.length > 0
        ? `${personalBests[0].discipline}: ${personalBests[0].mark}`
        : (b.pb || b.personalBest || '');

      const dobString = b.dateOfBirth ? (typeof b.dateOfBirth === 'string' ? b.dateOfBirth.slice(0, 10) : new Date(b.dateOfBirth).toISOString().slice(0, 10)) : '';
      const computedTier = calculateAgeTier(dobString, b.ageTier);

      // Determine ineligibility reasons
      const ineligibilityReasons: string[] = [];
      if (!faydaVerified) ineligibilityReasons.push('Fayda identity not verified');
      if (b.status === 'SUSPENDED') ineligibilityReasons.push('License suspended');
      if (b.status !== 'ACTIVE' && b.status !== 'APPROVED') ineligibilityReasons.push('No active federation license');
      if (!primaryEvent) ineligibilityReasons.push('Primary sporting event missing');

      const isEligible = ineligibilityReasons.length === 0;

      // Completeness score
      let score = 40; // Base profile
      if (faydaVerified) score += 25;
      if (b.licenseNumber) score += 15;
      if (b.primaryEvent) score += 10;
      if (b.user?.phoneNumber || b.contact?.phoneNumber) score += 10;

      list.push({
        id: b.id,
        memberType: 'ATHLETE',
        name: bName,
        amharicName: b.amharicName || '',
        dob: dobString,
        gender: b.gender || '',
        ageTier: computedTier,
        clubId: b.clubId || activeClubId,
        clubName: b.clubName || activeClubName,
        region: b.region || club?.region,
        address: b.address || b.user?.address || '',
        email: b.user?.email || b.contact?.email || '',
        phone: b.user?.phoneNumber || b.contact?.phoneNumber || '',
        emergencyContactPhone: b.emergencyContactPhone || '',
        faydaFin,
        faydaFan,
        faydaStatus: faydaVerified ? 'VERIFIED' : 'PENDING',
        faydaVerifiedAt: b.faydaVerifiedAt || b.user?.faydaIdentity?.verifiedAt,
        licenseStatus: (b.status === 'ACTIVE' || b.status === 'APPROVED') ? 'ACTIVE' : b.status === 'SUSPENDED' ? 'EXPIRED' : 'PENDING',
        licenseNumber: b.licenseNumber || (b.status === 'ACTIVE' || b.status === 'APPROVED' ? `ETH-${b.id.slice(-6).toUpperCase()}` : undefined),
        primaryEvent,
        pb: primaryPb,
        personalBests,
        photoUrl: b.photoUrl || '/images/runner_marathon.png',
        bloodType: b.bloodType,
        height: b.height || b.fitnessStats?.heightCm || undefined,
        weight: b.weight || b.fitnessStats?.weightKg || undefined,
        isEligible,
        ineligibilityReasons,
        completenessScore: Math.min(score, 100),
      });
    });

    // 2. Process Coaches & Staff - strictly only coaches belonging to this club!
    (backendCoaches || []).forEach((c: any) => {
      if (activeClubId && c.clubId && c.clubId !== activeClubId) {
        return; // Exclude coach belonging to another club
      }

      const cName = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() || 'Coach';
      const faydaVerified = Boolean(c.user?.faydaIdentity?.verified);
      const faydaFin = c.user?.faydaIdentity?.nin || '';
      const faydaFan = c.user?.faydaIdentity?.faydaSub || '';

      list.push({
        id: c.id,
        memberType: 'COACH',
        name: cName,
        amharicName: c.amharicName || '',
        dob: '',
        gender: '',
        ageTier: 'Coach / Technical Staff',
        clubId: c.clubId || activeClubId,
        clubName: activeClubName || club?.name,
        region: club?.region,
        address: c.user?.address || '',
        email: c.user?.email || '',
        phone: c.user?.phoneNumber || '',
        faydaFin,
        faydaFan,
        faydaStatus: faydaVerified ? 'VERIFIED' : 'PENDING',
        licenseStatus: c.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
        licenseNumber: c.licenseNumber || `ETH-COACH-${c.id.slice(-4).toUpperCase()}`,
        specialization: c.specialization || c.sport?.name || 'Technical Coaching',
        yearsOfExperience: c.yearsOfExperience || 0,
        photoUrl: '/images/runners_training.png',
        isEligible: false,
        ineligibilityReasons: ['Coaches are accredited for technical leadership, not athlete competition entry'],
        completenessScore: faydaVerified ? 100 : 70,
      });
    });

    return list;
  }, [backendAthletes, backendCoaches, activeClubId, activeClubName, club]);

  // Filter & Search Logic
  const filteredMembers = useMemo(() => {
    return unifiedMembers.filter((m) => {
      // Type Filter
      if (filterType !== 'ALL' && m.memberType !== filterType) return false;

      // Tier Filter
      if (filterTier !== 'ALL' && m.ageTier !== filterTier) return false;

      // License Status Filter
      if (filterLicense !== 'ALL' && m.licenseStatus !== filterLicense) return false;

      // Fayda Filter
      if (filterFayda !== 'ALL' && m.faydaStatus !== filterFayda) return false;

      // Eligibility Filter
      if (filterEligibility === 'ELIGIBLE' && !m.isEligible) return false;
      if (filterEligibility === 'INELIGIBLE' && m.isEligible) return false;

      // Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesAmharic = m.amharicName?.toLowerCase().includes(query) ?? false;
        const matchesFin = m.faydaFin?.toLowerCase().includes(query) ?? false;
        const matchesEvent = (m.primaryEvent || m.specialization || '').toLowerCase().includes(query);
        const matchesLicense = m.licenseNumber?.toLowerCase().includes(query) ?? false;

        if (!matchesName && !matchesAmharic && !matchesFin && !matchesEvent && !matchesLicense) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedMembers, filterType, filterTier, filterLicense, filterFayda, filterEligibility, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = unifiedMembers.length;
    const athletesCount = unifiedMembers.filter((m) => m.memberType === 'ATHLETE').length;
    const coachesCount = unifiedMembers.filter((m) => m.memberType === 'COACH').length;
    const verifiedCount = unifiedMembers.filter((m) => m.faydaStatus === 'VERIFIED').length;
    const activeLicenseCount = unifiedMembers.filter((m) => m.licenseStatus === 'ACTIVE').length;
    const eligibleCount = unifiedMembers.filter((m) => m.isEligible).length;

    return { total, athletesCount, coachesCount, verifiedCount, activeLicenseCount, eligibleCount };
  }, [unifiedMembers]);

  const handleOpenEdit = (m: UnifiedMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditAmharic(m.amharicName || '');
    setEditEvent(m.primaryEvent || m.specialization || '');
    setEditPb(m.pb || '');
    setEditPhoto(m.photoUrl);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (onUpdateAthlete && editingMember.memberType === 'ATHLETE') {
      const updated: Athlete = {
        id: editingMember.id,
        name: editName,
        amharicName: editAmharic,
        dob: editingMember.dob || '',
        gender: editingMember.gender || '',
        ageTier: editingMember.ageTier || 'Senior',
        club: editingMember.clubName || club?.name || '',
        faydaFin: editingMember.faydaFin,
        faydaStatus: editingMember.faydaStatus,
        licenseStatus: editingMember.licenseStatus,
        licenseNumber: editingMember.licenseNumber,
        primaryEvent: editEvent,
        pb: editPb,
        personalBests: editingMember.personalBests || [],
        photoUrl: editPhoto,
      };
      onUpdateAthlete(updated);
    }

    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Official Club Portal
            </span>
            <span className="text-xs text-slate-400">· {club?.name || 'Club'} Roster</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white m-0">
            Unified Members & Athlete Management
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Consolidated registry for viewing, searching, and managing verified club athletes, coaches, and federation members.
            All biometric identity data is verified through the national Fayda system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRegisterMember}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer border-0"
          >
            <UserPlus size={17} />
            <span>Register Member via Fayda</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Total Members</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-bold text-blue-600">{metrics.athletesCount}</span> Athletes ·{' '}
            <span className="font-bold text-purple-600">{metrics.coachesCount}</span> Coaches
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Fayda Verified</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.verifiedCount}</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
            {metrics.total > 0 ? Math.round((metrics.verifiedCount / metrics.total) * 100) : 0}% Biometrically Verified
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Active Licenses</span>
            <FileCheck2 size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.activeLicenseCount}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {metrics.total - metrics.activeLicenseCount} Pending Renewal
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Competition Ready</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.eligibleCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            Eligible for meet enrollments
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search members by name, Amharic, Fayda FIN, discipline, or license..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Member Type Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              onClick={() => setFilterType('ATHLETE')}
              className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
                filterType === 'ATHLETE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              Athletes ({metrics.athletesCount})
            </button>
            <button
              onClick={() => setFilterType('COACH')}
              className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
                filterType === 'COACH'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              Coaches ({metrics.coachesCount})
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
            <Filter size={12} /> Filter by:
          </div>

          <select
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="ALL">All Age Divisions</option>
            <option value="Senior">Senior</option>
            <option value="U20">U20 Division</option>
            <option value="U18">U18 Division</option>
            <option value="U16">U16 Youth</option>
          </select>

          <select
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            value={filterLicense}
            onChange={(e) => setFilterLicense(e.target.value)}
          >
            <option value="ALL">All Licenses</option>
            <option value="ACTIVE">Active Licenses</option>
            <option value="EXPIRED">Expired / Pending Renewal</option>
            <option value="UNLICENSED">Unlicensed</option>
          </select>

          <select
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            value={filterFayda}
            onChange={(e) => setFilterFayda(e.target.value)}
          >
            <option value="ALL">All Fayda Status</option>
            <option value="VERIFIED">Fayda Verified Only</option>
            <option value="PENDING">Pending Verification</option>
          </select>

          <select
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            value={filterEligibility}
            onChange={(e) => setFilterEligibility(e.target.value)}
          >
            <option value="ALL">Competition Eligibility</option>
            <option value="ELIGIBLE">Eligible Only</option>
            <option value="INELIGIBLE">Ineligible / Restrictions</option>
          </select>

          {(searchTerm || filterType !== 'ALL' || filterTier !== 'ALL' || filterLicense !== 'ALL' || filterFayda !== 'ALL' || filterEligibility !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setFilterTier('ALL');
                setFilterLicense('ALL');
                setFilterFayda('ALL');
                setFilterEligibility('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer border-0 bg-transparent"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Unified Member Table ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Member / Athlete</th>
                <th className="py-3.5 px-4">Fayda National Identity</th>
                <th className="py-3.5 px-4">Role & Discipline</th>
                <th className="py-3.5 px-4">Federation License</th>
                <th className="py-3.5 px-4">Competition Eligibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">No members found matching your search or filters.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or registering a new member via Fayda.</p>
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
                      {/* Name & Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {member.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                                  isAthlete
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                                }`}
                              >
                                {member.memberType}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-600 font-semibold">
                              {member.amharicName || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fayda National Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          {member.faydaStatus === 'VERIFIED' ? (
                            <>
                              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                  {formatFaydaFin(member.faydaFin) || member.faydaFan || 'Fayda Verified'}
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
                                <div className="text-amber-700 dark:text-amber-400 font-bold">
                                  Pending Verification
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Manual or unconfirmed ID
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Discipline / Role */}
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

                      {/* Federation License */}
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

                      {/* Competition Eligibility */}
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

                      {/* Actions */}
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

      {/* ── Comprehensive Member Profile Modal ── */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs" onClick={() => setViewingMember(null)}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={viewingMember.photoUrl}
                  alt={viewingMember.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white m-0">
                      {viewingMember.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {viewingMember.memberType}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                    {viewingMember.amharicName || '—'} · Club: {viewingMember.clubName || club?.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    System ID: {viewingMember.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Section 1: Fayda Verified Identity */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck size={16} /> Verified Fayda Identity
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                    Immutable Source
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">National ID (FIN)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatFaydaFin(viewingMember.faydaFin) || viewingMember.faydaFan || 'Fayda Verified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Fayda Access Number (FAN)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.faydaFan || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Date of Birth & Division</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.dob ? `${viewingMember.dob} (${viewingMember.ageTier})` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Gender</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.gender || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Region of Origin</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.region || club?.region || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Amharic Legal Name</span>
                    <span className="font-bold text-emerald-600">
                      {viewingMember.amharicName || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Registration & Contact Information */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <UserPlus size={16} /> Registration & Contact Info
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Athlete-Entered Records
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Email</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {viewingMember.email || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Phone</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.phone || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Emergency Contact</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.emergencyContactPhone || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Blood Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatBloodType(viewingMember.bloodType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Height / Weight</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {viewingMember.height ? `${viewingMember.height} cm` : '—'} / {viewingMember.weight ? `${viewingMember.weight} kg` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Permanent Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={viewingMember.address}>
                      {viewingMember.address || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Official Personal Bests & Sporting Records */}
            {viewingMember.memberType === 'ATHLETE' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <Award size={16} className="text-amber-500" /> Official Personal Bests & Sanctioned Records
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Federation Verified Results
                  </span>
                </div>

                {viewingMember.personalBests && viewingMember.personalBests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-400 font-semibold">
                          <th className="pb-2">Discipline / Event</th>
                          <th className="pb-2">Official Mark</th>
                          <th className="pb-2">Date Recorded</th>
                          <th className="pb-2">Competition Venue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {viewingMember.personalBests.map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{rec.discipline}</td>
                            <td className="py-2.5 font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{rec.mark}</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-400">{rec.date || '—'}</td>
                            <td className="py-2.5 text-slate-600 dark:text-slate-400">{rec.venue || 'Federation Championship'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400 text-xs">
                    No personal bests registered yet. New marks are automatically updated from official meet results.
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Athletic Performance & Eligibility */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Activity size={16} /> Federation Status & Eligibility
                </div>
                {viewingMember.memberType === 'ATHLETE' && (
                  viewingMember.isEligible ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Cleared for Federation Competitions
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                      ✕ Ineligible for Competitions
                    </span>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">License Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {viewingMember.licenseNumber || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">License Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingMember.licenseStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">
                    {viewingMember.memberType === 'ATHLETE' ? 'Primary Event' : 'Specialization'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingMember.primaryEvent || viewingMember.specialization || 'Athletics'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">
                    {viewingMember.memberType === 'ATHLETE' ? 'Personal Best' : 'Experience'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingMember.memberType === 'ATHLETE' ? viewingMember.pb || 'N/A' : `${viewingMember.yearsOfExperience} Years`}
                  </span>
                </div>
              </div>

              {/* Ineligibility reasons if any */}
              {viewingMember.memberType === 'ATHLETE' && !viewingMember.isEligible && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs">
                  <div className="font-bold mb-1">Outstanding Requirements for Competition Clearance:</div>
                  <ul className="list-disc pl-4 space-y-0.5 m-0">
                    {viewingMember.ineligibilityReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const m = viewingMember;
                  setViewingMember(null);
                  handleOpenEdit(m);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Edit Records
              </button>
              {viewingMember.memberType === 'ATHLETE' && onRenewLicense && (
                <button
                  onClick={() => {
                    const ath: Athlete = {
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
                    };
                    setViewingMember(null);
                    onRenewLicense(ath);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-0"
                >
                  Renew License
                </button>
              )}
              <button
                onClick={() => setViewingMember(null)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
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
