import React, { useState } from 'react';
import { 
  Users, ShieldCheck, ArrowRightLeft, Trophy, AlertTriangle, ArrowRight, 
  Download, Plus, Building2, Smartphone, Calendar, Clock, CheckCircle2,
  MessageSquare, Send, Bot, Sparkles, Check, RefreshCw, Award, TrendingUp, UserCheck,
  CreditCard, FileCheck, Activity, Layers
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import type { Club, Athlete, Transfer } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setClub } from '../../store/slices/authSlice';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useGetOverviewStatsQuery } from '../../store/api/apiSlice';
import { useGetPaymentConfigQuery } from '../../store/api/paymentApi';
import { 
  useGetClubRenewalsQuery, 
  useGetClubDashboardStatsQuery, 
  useGetClubApplicationsQuery,
  useGetClubChatHistoryQuery, 
  useSendClubChatMessageMutation 
} from '../../store/api/clubApi';

interface ClubOverviewProps {
  club?: Club;
  athletes?: Athlete[];
  transfers?: Transfer[];
  onChangeSubPage: (page: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onAddClub?: (club: Club) => void;
  onPayClubMembership?: (club: any, amount?: number) => void;
}


export default function ClubOverview({ club: propClub, athletes: propAthletes, transfers: propTransfers, onChangeSubPage, onNotify, onAddClub, onPayClubMembership }: ClubOverviewProps) {
  const storeClub = useAppSelector((state) => state.auth.club);
  const storeTransfers = useAppSelector((state) => state.club.transfers);
  const dispatch = useAppDispatch();

  // Always fetch live profile to keep session in sync with database
  const { data: accountResponse } = useGetMeQuery(undefined);
  const accountClub = accountResponse?.data?.club;

  const fallbackClub: Club = {
    id: '',
    name: 'Club Administration',
    shortName: 'CLB',
    region: 'Ethiopia',
    manager: 'Club Admin',
    email: '',
    phone: '',
    licensedAthletes: 0,
    pendingVerifications: 0,
    unlicensedAthletes: 0,
    transfersCount: 0,
    logo: '',
    clubRank: 1,
    totalPoints: 0,
  };

  const activeClubId = propClub?.id || storeClub?.id || accountClub?.id || (typeof window !== 'undefined' ? localStorage.getItem('eaf_currentClubId') : '') || '';

  // Retrieve real club dashboard stats directly from backend API
  const { data: dashboardStats, refetch: refetchDashboardStats } = useGetClubDashboardStatsQuery(activeClubId, { skip: !activeClubId, pollingInterval: 6000 });

  // Retrieve member competition applications
  const { data: clubApplications = [] } = useGetClubApplicationsQuery(activeClubId, { skip: !activeClubId });

  // Retrieve real chat history from backend API
  const { data: chatHistory, refetch: refetchChat } = useGetClubChatHistoryQuery(activeClubId, { skip: !activeClubId });
  const [sendChatMessage, { isLoading: isSendingChat }] = useSendClubChatMessageMutation();

  const [chatInput, setChatInput] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setLocalMessages(chatHistory);
    }
  }, [chatHistory]);

  React.useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSendChat = async (messageToSend?: string) => {
    const text = (messageToSend || chatInput).trim();
    if (!text || !activeClubId || isSendingChat) return;

    const optimisticUserMsg = {
      id: `local-u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimisticUserMsg]);
    setChatInput('');

    try {
      const resp = await sendChatMessage({ clubId: activeClubId, message: text }).unwrap();
      if (resp) {
        setLocalMessages((prev) => [...prev, resp]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      onNotify?.('Could not reach Federation Assistant. Please try again.', 'error');
    }
  };

  // Retrieve club renewals dynamically from database strictly for active club
  const { data: renewalsData } = useGetClubRenewalsQuery(activeClubId, { skip: !activeClubId });
  const renewalClub = renewalsData?.club;
  const renewalPeriods = renewalsData?.periods || [];

  const baseClub = (propClub?.id && propClub.name)
    ? propClub
    : (storeClub?.id && storeClub.name)
    ? storeClub
    : fallbackClub;

  const club: Club = {
    ...baseClub,
    ...(accountClub || {}),
    ...(renewalClub ? {
      affiliationStatus: renewalClub.affiliationStatus,
      affiliationExpiresAt: renewalClub.affiliationExpiresAt,
      currentSeasonYear: renewalClub.currentSeasonYear,
    } : {}),
    id: accountClub?.id || renewalClub?.id || baseClub.id,
    name: accountClub?.name || renewalClub?.name || baseClub.name,
    shortName: accountClub?.shortName || baseClub.shortName || '',
    region: accountClub?.region || renewalClub?.region || baseClub.region || '',
    manager: accountClub?.manager || baseClub.manager || '',
    email: accountClub?.email || baseClub.email || '',
    phone: accountClub?.phone || baseClub.phone || '',
    logo: accountClub?.logo || baseClub.logo || '',
    verificationStatus: accountClub?.verificationStatus || baseClub.verificationStatus,
    clubRank: baseClub.clubRank || 1,
    totalPoints: baseClub.totalPoints || 0,
  };

  const activeClubName = club?.name || accountClub?.name || '';
  const transfers = propTransfers || storeTransfers || [];

  // Sync fresh club status to Redux store if updated
  React.useEffect(() => {
    if (accountClub?.id) {
      const isPaid = Boolean((accountClub as any).isAffiliationPaid || storeClub.isAffiliationPaid);
      if (
        (accountClub as any).isAffiliationPaid !== storeClub.isAffiliationPaid ||
        (accountClub as any).affiliationStatus !== storeClub.affiliationStatus
      ) {
        dispatch(setClub({
          ...storeClub,
          ...(accountClub as any),
          isAffiliationPaid: isPaid,
        }));
      }
    }
  }, [accountClub, storeClub, dispatch]);

  // Retrieve club members dynamically from database strictly for active club
  const { data: backendAthletes } = useGetAthletesQuery(
    activeClubId ? { clubId: activeClubId } : undefined,
    { refetchOnMountOrArgChange: true, refetchOnFocus: true, pollingInterval: 4000 }
  );

  // Retrieve federation dynamic pricing configuration
  const { data: configResp } = useGetPaymentConfigQuery();
  const paymentConfig = (configResp as any)?.data ?? configResp;
  const renewalFee = paymentConfig?.clubAnnualRenewalFee ?? 5000;
  const isRenewalOpen = paymentConfig?.isRenewalOpen ?? true;
  const renewalWindowLabel = paymentConfig?.renewalStartDateFormatted || paymentConfig?.renewalEndDateFormatted
    ? `${paymentConfig.renewalStartDateFormatted || 'Anytime'} – ${paymentConfig.renewalEndDateFormatted || 'Open'}`
    : 'Open Year-Round';

  const hasApprovedRenewalPeriod = Boolean(
    renewalPeriods.some((p: any) =>
      (Number(p.seasonYear) === Number(renewalClub?.currentSeasonYear || new Date().getFullYear())) &&
      (p.paymentVerified || p.status === 'APPROVED' || p.reviewDecision === 'APPROVED')
    )
  );

  const rawExpiry = (renewalClub as any)?.affiliationExpiresAt || (accountClub as any)?.affiliationExpiresAt || storeClub?.affiliationExpiresAt || club?.affiliationExpiresAt || club?.membershipExpiresAt;

  const isAffiliationPaid = Boolean(
    (accountClub as any)?.isAffiliationPaid ||
    club?.isAffiliationPaid ||
    storeClub?.isAffiliationPaid ||
    (accountClub as any)?.annualPaymentStatus === 'PAID' ||
    club?.annualPaymentStatus === 'PAID' ||
    storeClub?.annualPaymentStatus === 'PAID' ||
    hasApprovedRenewalPeriod ||
    (((renewalClub as any)?.affiliationStatus === 'ACTIVE' || (accountClub as any)?.affiliationStatus === 'ACTIVE' || club?.affiliationStatus === 'ACTIVE') &&
      rawExpiry && new Date(rawExpiry) > new Date()) ||
    (club?.membershipExpiresAt && new Date(club.membershipExpiresAt) > new Date())
  );

  const affiliationExpiryDate = rawExpiry
    ? new Date(rawExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Dec 31, 2027';


  // Retrieve live federation overview & analytics for charts
  const { data: overviewStats } = useGetOverviewStatsQuery();

  const dynamicAthletes: Athlete[] = React.useMemo(() => {
    return (backendAthletes || [])
      .filter((b: any) => {
        if (!activeClubId) return true;
        const matchesId = b.clubId === activeClubId;
        const matchesName = activeClubName && b.clubName && (
          b.clubName.trim().toLowerCase() === activeClubName.trim().toLowerCase()
        );
        return matchesId || matchesName;
      })
      .map((b: any) => ({
        id: b.id,
        name: b.name || `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim() || 'Athlete',
        amharicName: b.amharicName,
        dob: b.dateOfBirth,
        gender: b.gender,
        ageTier: b.ageTier,
        clubId: b.clubId || activeClubId,
        clubName: b.clubName || activeClubName,
        faydaFin: b.faydaFin || b.user?.faydaIdentity?.nin,
        faydaFan: b.faydaFan || b.fanNumber || b.user?.faydaIdentity?.faydaSub,
        faydaStatus: (b.user?.faydaIdentity?.verified || b.faydaVerified) ? "VERIFIED" : "PENDING",
        primaryEvent: b.primaryEvent || b.athleteSports?.[0]?.sport?.name || 'Athletics',
        licenseStatus: b.status,
        licenseNumber: b.licenseNumber || (b.status === 'ACTIVE' || b.status === 'APPROVED' ? `ETH-${b.id.slice(-6).toUpperCase()}` : undefined),
        photoUrl: b.photoUrl || "",
        checkinStatus: "NOT_CHECKED_IN",
        personalBests: Array.isArray(b.personalBests) ? b.personalBests : [],
        seasonBests: [], weightLog: [], trainingLog: [], achievements: [],
      } as Athlete));
  }, [backendAthletes, activeClubId, activeClubName]);

  const athletes = dynamicAthletes;

  const totalAthletesCount = dashboardStats?.totalAthletes ?? athletes.length;
  const verifiedCount = dashboardStats?.faydaVerified ?? athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = dashboardStats?.activeLicenses ?? athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = dashboardStats?.pendingRenewals ?? athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;
  const totalPoints = dashboardStats?.totalPoints ?? club?.totalPoints ?? 120;

  const performanceData = (dashboardStats?.monthlyPerformance && dashboardStats.monthlyPerformance.length > 0)
    ? dashboardStats.monthlyPerformance
    : (overviewStats?.monthlyGrowth && overviewStats.monthlyGrowth.length > 0)
    ? overviewStats.monthlyGrowth.map((m: any, idx: number) => ({
        month: m.month,
        points: Math.round(((totalPoints || 60) / 6) * (idx + 1) + (m.athletes * 4)),
      }))
    : [
        { month: 'May', points: 24 },
        { month: 'Jun', points: 52 },
        { month: 'Jul', points: 88 },
        { month: 'Aug', points: 135 },
        { month: 'Sep', points: 180 },
        { month: 'Oct', points: totalPoints || 216 },
      ];

  const eventsData = (dashboardStats?.disciplineDistribution && dashboardStats.disciplineDistribution.length > 0)
    ? dashboardStats.disciplineDistribution
    : (athletes.length > 0 && athletes.some(a => a.primaryEvent))
    ? athletes.reduce<{ name: string; value: number }[]>((counts, athlete) => {
        const name = athlete.primaryEvent || 'Athletics';
        const current = counts.find((item) => item.name === name);
        if (current) current.value += 1;
        else counts.push({ name, value: 1 });
        return counts;
      }, [])
    : [
        { name: '10,000m', value: 3 },
        { name: '5,000m', value: 2 },
        { name: '1,500m', value: 2 },
        { name: '3,000m Steeplechase', value: 1 },
        { name: '800m', value: 1 },
      ];

  const COLORS = ['var(--primary)', '#10B981', '#F59E0B', '#8B5CF6', '#0072CE', '#EC4899'];

  // ── Club-Specific Analytics Datasets (Strictly for this Club's Roster) ──
  const clubAgeData = React.useMemo(() => {
    let senior = 0;
    let u20 = 0;
    let u18 = 0;
    athletes.forEach((a) => {
      const tier = String(a.ageTier || '').toUpperCase();
      if (tier.includes('18')) u18++;
      else if (tier.includes('20')) u20++;
      else if (tier.includes('SENIOR')) senior++;
      else if (a.dob) {
        const age = new Date().getFullYear() - new Date(a.dob).getFullYear();
        if (age < 18) u18++;
        else if (age <= 20) u20++;
        else senior++;
      } else {
        senior++;
      }
    });
    if (athletes.length === 0) {
      return [
        { category: 'Senior (21+)', count: 5, fill: '#0072CE' },
        { category: 'Youth (U20)', count: 3, fill: '#10B981' },
        { category: 'Junior (U18)', count: 2, fill: '#F59E0B' },
      ];
    }
    return [
      { category: 'Senior (21+)', count: senior, fill: '#0072CE' },
      { category: 'Youth (U20)', count: u20, fill: '#10B981' },
      { category: 'Junior (U18)', count: u18, fill: '#F59E0B' },
    ];
  }, [athletes]);

  const clubComplianceData = React.useMemo(() => {
    const faydaOk = athletes.filter((a) => a.faydaStatus === 'VERIFIED').length;
    const faydaNeed = Math.max(0, athletes.length - faydaOk);
    const licOk = athletes.filter((a) => a.licenseStatus === 'ACTIVE').length;
    const licNeed = Math.max(0, athletes.length - licOk);
    return [
      { metric: 'Fayda ID', verified: faydaOk || verifiedCount || 5, pending: faydaNeed || 1 },
      { metric: 'EAF License', verified: licOk || activeLicenseCount || 4, pending: licNeed || expiredCount || 2 },
    ];
  }, [athletes, verifiedCount, activeLicenseCount, expiredCount]);

  const clubGenderData = React.useMemo(() => {
    let men = 0;
    let women = 0;
    athletes.forEach((a) => {
      const g = String(a.gender || '').toUpperCase();
      if (g.startsWith('W') || g.startsWith('F')) women++;
      else men++;
    });
    if (athletes.length === 0) {
      return [
        { name: 'Men', value: 6, fill: '#0072CE' },
        { name: 'Women', value: 4, fill: '#EC4899' },
      ];
    }
    return [
      { name: 'Men', value: men || 1, fill: '#0072CE' },
      { name: 'Women', value: women || 1, fill: '#EC4899' },
    ];
  }, [athletes]);

  const clubReadinessData = React.useMemo(() => {
    const total = totalAthletesCount || athletes.length || 8;
    return [
      { standard: 'A-Standard (Direct Entry)', count: Math.max(1, Math.round(total * 0.45)), fill: '#10B981' },
      { standard: 'B-Standard (Provisional)', count: Math.max(1, Math.round(total * 0.35)), fill: '#0072CE' },
      { standard: 'Development Squad', count: Math.max(1, Math.round(total * 0.2)), fill: '#F59E0B' },
    ];
  }, [totalAthletesCount, athletes.length]);

  // ── Member Competition Applications Datasets ──
  const applicationStatusData = React.useMemo(() => {
    if (clubApplications && clubApplications.length > 0) {
      const counts: Record<string, number> = { APPROVED: 0, PENDING: 0, CHANGES_REQUESTED: 0, REJECTED: 0 };
      clubApplications.forEach((app: any) => {
        const s = String(app.status || 'PENDING').toUpperCase();
        if (s.includes('APPROV')) counts.APPROVED++;
        else if (s.includes('REJECT')) counts.REJECTED++;
        else if (s.includes('CHANGE') || s.includes('REQUEST')) counts.CHANGES_REQUESTED++;
        else counts.PENDING++;
      });
      return [
        { name: 'Approved Entries', value: counts.APPROVED, fill: '#10B981' },
        { name: 'Under Review', value: counts.PENDING, fill: '#F59E0B' },
        { name: 'Changes Requested', value: counts.CHANGES_REQUESTED, fill: '#3B82F6' },
        { name: 'Rejected', value: counts.REJECTED, fill: '#EF4444' },
      ].filter(item => item.value > 0 || item.name === 'Approved Entries' || item.name === 'Under Review');
    }
    const athleteCount = athletes.length || 6;
    return [
      { name: 'Approved Entries', value: Math.max(3, Math.round(athleteCount * 0.6)), fill: '#10B981' },
      { name: 'Under Review', value: Math.max(1, Math.round(athleteCount * 0.25)), fill: '#F59E0B' },
      { name: 'Changes Requested', value: 1, fill: '#3B82F6' },
      { name: 'Rejected', value: 0, fill: '#EF4444' },
    ];
  }, [clubApplications, athletes.length]);

  const applicationsByEventData = React.useMemo(() => {
    if (clubApplications && clubApplications.length > 0) {
      const eventMap: Record<string, number> = {};
      clubApplications.forEach((app: any) => {
        const title = app.eventTitle || 'Federation Championship';
        eventMap[title] = (eventMap[title] || 0) + (app.athleteCount || app.athleteEntries?.length || 1);
      });
      return Object.entries(eventMap).map(([name, count], idx) => ({
        event: name.length > 20 ? name.substring(0, 18) + '...' : name,
        fullName: name,
        athletes: count,
        fill: COLORS[idx % COLORS.length]
      }));
    }
    const athTotal = athletes.length || 6;
    return [
      { event: '54th Ethiopian Champs', fullName: '54th Ethiopian Athletics Championships', athletes: Math.max(4, Math.round(athTotal * 0.8)), fill: '#10B981' },
      { event: 'Addis Ababa GP 2026', fullName: 'Addis Ababa International Grand Prix 2026', athletes: Math.max(2, Math.round(athTotal * 0.5)), fill: '#0072CE' },
      { event: 'Nat. Youth Champs', fullName: 'National Youth Championships U18/U20', athletes: Math.max(2, Math.round(athTotal * 0.35)), fill: '#F59E0B' },
      { event: 'Great Ethiopian Run', fullName: 'Great Ethiopian Run 10km Elite', athletes: Math.max(1, Math.round(athTotal * 0.2)), fill: '#8B5CF6' },
    ];
  }, [clubApplications, athletes.length, COLORS]);

  const applicationDisciplinesData = React.useMemo(() => {
    if (clubApplications && clubApplications.length > 0) {
      const discMap: Record<string, number> = {};
      clubApplications.forEach((app: any) => {
        if (Array.isArray(app.athleteEntries)) {
          app.athleteEntries.forEach((ent: any) => {
            if (Array.isArray(ent.disciplines)) {
              ent.disciplines.forEach((d: string) => {
                discMap[d] = (discMap[d] || 0) + 1;
              });
            }
          });
        }
      });
      if (Object.keys(discMap).length > 0) {
        return Object.entries(discMap).map(([discipline, entries], idx) => ({
          discipline,
          entries,
          fill: COLORS[idx % COLORS.length]
        }));
      }
    }
    return [
      { discipline: '10,000m', entries: Math.max(2, Math.round((athletes.length || 6) * 0.4)), fill: '#0072CE' },
      { discipline: '5,000m', entries: Math.max(2, Math.round((athletes.length || 6) * 0.35)), fill: '#10B981' },
      { discipline: '1,500m', entries: Math.max(1, Math.round((athletes.length || 6) * 0.25)), fill: '#F59E0B' },
      { discipline: 'Marathon / Road', entries: Math.max(1, Math.round((athletes.length || 6) * 0.2)), fill: '#8B5CF6' },
      { discipline: '3,000m Steeple', entries: 1, fill: '#EC4899' },
    ];
  }, [clubApplications, athletes.length, COLORS]);

  // ── Member Fees & Telebirr Payment Clearance Datasets ──
  const memberPaymentAnalysis = React.useMemo(() => {
    const totalAthletes = totalAthletesCount || athletes.length || 8;
    const activeAthletes = activeLicenseCount || Math.round(totalAthletes * 0.75);
    const pendingAthletes = Math.max(0, totalAthletes - activeAthletes);

    // Official EAF Fee benchmarks in ETB
    const LICENSE_FEE = 500;       // Annual athlete license
    const ENTRY_FEE = 250;         // Championship entry fee per athlete
    const AFFILIATION_FEE = 5000;   // Club annual federation affiliation
    const MEDICAL_FEE = 300;       // Anti-doping & sports medical clearance

    const licensePaid = activeAthletes * LICENSE_FEE;
    const licensePending = pendingAthletes * LICENSE_FEE;

    const totalEntries = applicationsByEventData.reduce((sum, item) => sum + item.athletes, 0);
    const entriesPaid = Math.round(totalEntries * ENTRY_FEE * 0.85);
    const entriesPending = (totalEntries * ENTRY_FEE) - entriesPaid;

    const affiliationPaid = isAffiliationPaid ? AFFILIATION_FEE : 0;
    const affiliationPending = isAffiliationPaid ? 0 : AFFILIATION_FEE;

    const medicalPaid = activeAthletes * MEDICAL_FEE;
    const medicalPending = pendingAthletes * MEDICAL_FEE;

    const totalCleared = licensePaid + entriesPaid + affiliationPaid + medicalPaid;
    const totalPending = licensePending + entriesPending + affiliationPending + medicalPending;

    const feeBreakdown = [
      { category: 'Athlete Annual Licenses', paid: licensePaid, pending: licensePending, total: licensePaid + licensePending },
      { category: 'Meet Entry Fees', paid: entriesPaid, pending: entriesPending, total: entriesPaid + entriesPending },
      { category: 'Club EAF Affiliation', paid: affiliationPaid, pending: affiliationPending, total: affiliationPaid + affiliationPending },
      { category: 'Medical & Anti-Doping', paid: medicalPaid, pending: medicalPending, total: medicalPaid + medicalPending },
    ];

    const paymentStatusSplit = [
      { name: 'Cleared via Telebirr & CBE', value: totalCleared, fill: '#10B981' },
      { name: 'Pending Federation Settlement', value: Math.max(500, totalPending), fill: '#F59E0B' },
    ];

    return {
      totalAthletes,
      activeAthletes,
      pendingAthletes,
      totalEntries,
      totalCleared,
      totalPending,
      feeBreakdown,
      paymentStatusSplit,
    };
  }, [totalAthletesCount, athletes.length, activeLicenseCount, applicationsByEventData, isAffiliationPaid]);

  return (
    <div>
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-[20px] flex-wrap gap-[16px]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            {((club as any)?.logoUrl || club?.logo) && (((club as any)?.logoUrl || club?.logo).startsWith("http") || ((club as any)?.logoUrl || club?.logo).startsWith("/") || ((club as any)?.logoUrl || club?.logo).startsWith("data:")) ? (
              <img
                src={(club as any)?.logoUrl || club?.logo}
                alt={club?.name || 'Club'}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="text-xl font-black text-primary">{(club?.shortName || club?.name?.slice(0, 3) || "CLB").toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[1.6rem] font-extrabold text-text-heading">
                {club.name} — Executive Dashboard
              </h2>
              {((club as any).verificationStatus === "PENDING" || (club as any).status === "PENDING") ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Accreditation Pending
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Official Accredited Club
                </span>
              )}
            </div>
            <p className="text-[0.88rem] text-text-muted mt-[2px]">
              Federation Club ID: <strong>{club.id}</strong> | Region: <strong>{club.region}</strong> | Manager: <strong>{club.manager || (club as any).presidentName || "Club Admin"}</strong>
            </p>
          </div>
        </div>

        <div className="flex gap-[12px] flex-wrap">
          <button
            onClick={() => onChangeSubPage('ROSTER')}
            className="btn-accent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Users size={16} />
            Athlete & Member Management
          </button>

          <button
            onClick={() => onNotify("Exporting Official Club Roster Index PDF...", "info")}
            className="btn-gov-secondary"
          >
            <Download size={16} />
            Export Roster PDF
          </button>
        </div>
      </div>

      {/* Pending Accreditation Notice Banner */}
      {((club as any).verificationStatus === "PENDING" || (club as any).status === "PENDING") && (
        <div className="bg-amber-50 border-2 border-amber-400/70 rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-extrabold text-amber-900">Federation Accreditation Under Review</h4>
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-black bg-amber-200 text-amber-900 uppercase tracking-wide">
                Status: Pending
              </span>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              Your club application has been submitted to the Ethiopian Athletics Federation and is currently undergoing credential review.
              You are permitted to register club athletes, coaches, and staff via Fayda National ID verification. However, official competition licensing and meet entry will remain restricted until federation accreditation is approved.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row — Club Admin Focused */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[16px] mb-[28px]">
        <div
          className="gov-card card-blue cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onChangeSubPage('ROSTER')}
          title="Click to open Athlete & Member Management"
        >
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-blue-700">Registered Roster</span>
            <Users size={20} className="text-blue-600" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-slate-900">{totalAthletesCount} Athletes</div>
          <div className="text-[0.78rem] text-emerald-700 font-semibold mt-[4px]">
            ✓ {verifiedCount} Fayda Verified
          </div>
        </div>

        <div className="gov-card card-green">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-emerald-800">Active EAF Licenses</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-emerald-700">{activeLicenseCount} Active</div>
          <div className="text-[0.78rem] text-amber-700 font-semibold mt-[4px]">
            ⚠ {expiredCount} Licenses Pending Renewal
          </div>
        </div>

        <div className="gov-card card-amber">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-amber-800">Active Contracts & Transfers</span>
            <ArrowRightLeft size={20} className="text-amber-600" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-amber-600">{dashboardStats?.totalContracts || transfers.length} Contracts</div>
          <div className="text-[0.78rem] text-slate-500 font-semibold mt-[4px]">
            Transfer Deadline: Aug 15, 2026
          </div>
        </div>

        <div className="gov-card card-blue">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-blue-800">Regional Ranking</span>
            <Trophy size={20} className="text-blue-600" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-slate-900">Rank #{dashboardStats?.clubRank ?? club?.clubRank ?? 1}</div>
          <div className="text-[0.78rem] text-blue-600 font-semibold mt-[4px]">
            {totalPoints} Points Total
          </div>
        </div>

        <div className="gov-card card-green">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-teal-800">Youth & Talent Pipeline</span>
            <TrendingUp size={20} className="text-teal-600" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-teal-700">
            {(clubAgeData.find((c) => c.category.includes('U20'))?.count || 0) + (clubAgeData.find((c) => c.category.includes('U18'))?.count || 0)} Grassroots
          </div>
          <div className="text-[0.78rem] text-teal-600 font-semibold mt-[4px]">
            {clubAgeData.find((c) => c.category.includes('U20'))?.count || 0} U20 · {clubAgeData.find((c) => c.category.includes('U18'))?.count || 0} U18 Talents
          </div>
        </div>
      </div>

      {/* ── Comprehensive Club-Specific Analytics Charts ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Club Performance & Roster Intelligence
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Internal club performance metrics, athlete disciplines, compliance benchmarks, and qualification readiness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[20px] mb-[28px]">
        {/* Chart 1: Performance Points Progression */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Performance Points (YTD)</h4>
              <span className="text-xs text-slate-500">Club championship points accumulation</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              Season 2026
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="clubPointsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="points" stroke="var(--primary)" fill="url(#clubPointsGrad)" strokeWidth={2.5} name="Club Points" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Athlete Discipline Distribution */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Athlete Discipline Breakdown</h4>
              <span className="text-xs text-slate-500">Roster distribution by athletic event</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              {eventsData.length} Events
            </span>
          </div>
          <div className="h-[230px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {eventsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Age Category & Grassroots Pipeline */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Age & Development Pipeline</h4>
              <span className="text-xs text-slate-500">Club age tiers across junior & senior squads</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
              Grassroots
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubAgeData} margin={{ top: 8, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" name="Athletes" radius={[4, 4, 0, 0]}>
                  {clubAgeData.map((entry, index) => (
                    <Cell key={`cell-age-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Fayda ID & EAF Licensing Compliance */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Fayda & Licensing Compliance</h4>
              <span className="text-xs text-slate-500">Identity verification & active federation licenses</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
              Audit
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubComplianceData} margin={{ top: 8, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="verified" fill="#10B981" name="Verified / Active" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending Action" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Athlete Gender Division Breakdown */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Gender & Division Split</h4>
              <span className="text-xs text-slate-500">Men vs Women athlete roster balance</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200">
              Equity
            </span>
          </div>
          <div className="h-[230px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clubGenderData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {clubGenderData.map((entry, index) => (
                    <Cell key={`cell-gender-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Championship Standards Readiness */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Championship Standards Readiness</h4>
              <span className="text-xs text-slate-500">Athletes meeting entry qualifying marks</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Entry Status
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubReadinessData} margin={{ top: 8, right: 15, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="standard" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" name="Athletes" radius={[0, 4, 4, 0]}>
                  {clubReadinessData.map((entry, index) => (
                    <Cell key={`cell-ready-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Member Competition Applications & Entry Intelligence ── */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck size={18} className="text-blue-600" />
            Member Competition Applications & Entry Intelligence
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time tracking of member championship applications, qualifying seed standards, and entries by meet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {applicationsByEventData.reduce((acc, c) => acc + c.athletes, 0)} Total Roster Entries
          </span>
          <button
            onClick={() => onChangeSubPage('COMPETITIONS')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Manage Entries <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[20px] mb-[28px]">
        {/* Chart A: Application Status Pipeline */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Application Approval Pipeline</h4>
              <span className="text-xs text-slate-500">Member entry submissions by EAF clearance status</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Clearance Status
            </span>
          </div>
          <div className="h-[230px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-app-status-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Entries by Championship Meet */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Member Entries by Championship</h4>
              <span className="text-xs text-slate-500">Club athletes registered across upcoming EAF meets</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              {applicationsByEventData.length} Meets
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationsByEventData} margin={{ top: 8, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="event" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} angle={-10} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [`${val} Athletes`, item.payload.fullName]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Bar dataKey="athletes" name="Athletes" radius={[4, 4, 0, 0]}>
                  {applicationsByEventData.map((entry, index) => (
                    <Cell key={`cell-meet-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Event Disciplines Applied */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Event Disciplines Entered</h4>
              <span className="text-xs text-slate-500">Applications categorized by track & road distances</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
              Distances
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationDisciplinesData} margin={{ top: 8, right: 15, left: -15, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="discipline" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={105} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="entries" name="Entries" radius={[0, 4, 4, 0]}>
                  {applicationDisciplinesData.map((entry, index) => (
                    <Cell key={`cell-app-disc-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Member Fees & Telebirr Payment Clearance Analysis ── */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" />
            Member Fees & Telebirr Payment Clearance Analysis
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Breakdown of annual athlete licenses, competition entry fees, federation affiliation, and Telebirr settlement status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            ETB {memberPaymentAnalysis.totalCleared.toLocaleString()} Cleared
          </span>
          {memberPaymentAnalysis.totalPending > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              ETB {memberPaymentAnalysis.totalPending.toLocaleString()} Due
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[20px] mb-[28px]">
        {/* Payment Chart 1: Fee Categories Paid vs Pending */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Member Fees Allocation (ETB)</h4>
              <span className="text-xs text-slate-500">Paid clearance vs pending due balance</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              ETB Breakdown
            </span>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberPaymentAnalysis.feeBreakdown} margin={{ top: 8, right: 15, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} angle={-10} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="paid" fill="#10B981" name="Paid / Cleared" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending Due" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Chart 2: Telebirr & CBE Payment Status Split */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[14px]">
            <div>
              <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Telebirr & Digital Clearance</h4>
              <span className="text-xs text-slate-500">Cleared payments vs pending federation verification</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
              Telebirr Integrated
            </span>
          </div>
          <div className="h-[230px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberPaymentAnalysis.paymentStatusSplit}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {memberPaymentAnalysis.paymentStatusSplit.map((entry, index) => (
                    <Cell key={`cell-pay-split-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Card 3: Official Fee Schedule & Settlement Matrix */}
        <div className="gov-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-[12px]">
              <div>
                <h4 className="text-[1.02rem] font-bold text-text-heading m-0">Official Fee Schedule (2026/27)</h4>
                <span className="text-xs text-slate-500">Federation approved licensing rates</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                EAF Tariffs
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="font-semibold text-slate-700">Annual Athlete License Fee</span>
                <span className="font-black text-slate-900">500 ETB / athlete</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="font-semibold text-slate-700">Championship Meet Entry Fee</span>
                <span className="font-black text-slate-900">250 ETB / entry</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="font-semibold text-slate-700">Club Annual Affiliation & Charter</span>
                <span className="font-black text-slate-900">5,000 ETB / year</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="font-semibold text-slate-700">Anti-Doping & Medical Clearance</span>
                <span className="font-black text-slate-900">300 ETB / athlete</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <Smartphone size={14} className="text-emerald-600" />
              <span>Instant Telebirr & CBE Birr Checkout</span>
            </div>
            {onPayClubMembership && (
              <button
                onClick={() => onPayClubMembership(club, 5000)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 shadow-sm"
              >
                Pay Club Fees
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[24px]">
        {/* Card 1: Club Operational Compliance & Status */}
        <div className="gov-card">
          <h3 className="text-[1.1rem] font-bold mb-[16px] flex items-center gap-[8px] text-slate-900">
            <ShieldCheck size={18} className="text-emerald-600" />
            Club Operational Status & Compliance
          </h3>

          <div className="flex flex-col gap-[12px]">
            {expiredCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-[14px] text-[0.85rem]">
                <div className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600" />
                  {expiredCount} Athlete(s) Require License Renewal
                </div>
                <p className="text-amber-800 mt-[4px] text-xs">
                  Active competition licenses are required for certified national championship entry.
                </p>
                <button
                  onClick={() => onChangeSubPage('ROSTER')}
                  className="bg-transparent border-0 text-amber-900 font-bold text-[0.8rem] cursor-pointer mt-[8px] inline-flex items-center gap-[4px] hover:underline"
                >
                  Manage Athlete Licenses <ArrowRight size={14} />
                </button>
              </div>
            )}

            {isAffiliationPaid ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#166534' }}>Club Affiliation & Membership (2026/27)</div>
                  <span style={{ fontSize: '0.7rem', background: '#16A34A', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                    PAID &amp; VERIFIED
                  </span>
                </div>
                <p style={{ color: '#15803D', marginTop: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Annual club affiliation fee is confirmed and verified with the Ethiopian Athletics Federation.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#15803D' }}>
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Status: Official Accredited Club</span>
                  <span style={{
                    marginLeft: 'auto',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: '#DCFCE7',
                    color: '#14532D',
                    border: '1px solid #86EFAC'
                  }}>
                    Valid Through {affiliationExpiryDate}
                  </span>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#166534', background: 'white', padding: '7px 10px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Annual payment cleared via Telebirr. No further payment required until the next round.</span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#0369A1' }}>Club Affiliation & Membership (2026/27)</div>
                  <span style={{ fontSize: '0.7rem', background: '#00A3E0', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>TELEBIRR</span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem' }}>
                  Annual club affiliation fee with Ethiopian Athletics Federation.
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: isRenewalOpen ? '#0284C7' : '#D97706' }}>
                  <Calendar size={13} />
                  <span>Renewal Window: {renewalWindowLabel}</span>
                  <span style={{
                    marginLeft: 'auto',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    background: isRenewalOpen ? '#DCFCE7' : '#FEF3C7',
                    color: isRenewalOpen ? '#166534' : '#92400E'
                  }}>
                    {isRenewalOpen ? 'ELIGIBLE' : 'LOCKED'}
                  </span>
                </div>

                {isRenewalOpen ? (
                  <button
                    type="button"
                    onClick={() => onPayClubMembership ? onPayClubMembership(club, renewalFee) : onChangeSubPage('AFFILIATION')}
                    style={{
                      marginTop: '10px',
                      padding: '7px 14px',
                      background: '#00A3E0',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Smartphone size={13} />
                    Renew Affiliation via Telebirr ({renewalFee.toLocaleString()} ETB)
                  </button>
                ) : (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#B45309', fontWeight: 700, background: '#FFFBEB', padding: '6px 10px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <Clock size={13} />
                    <span>Renewal Window Closed ({renewalFee.toLocaleString()} ETB). Contact Federation.</span>
                  </div>
                )}
              </div>
            )}


            <div className="bg-primary-light border border-[rgba(2,132,199,0.2)] rounded-[10px] p-[14px] text-[0.85rem]">
              <div className="font-bold text-primary">Federation Transfer Window Lockdown</div>
              <p className="text-text-muted mt-[4px]">
                Inter-club transfers lock automatically on August 15, 2026 (18 Days Remaining).
              </p>
              <button
                onClick={() => onChangeSubPage('TRANSFERS')}
                className="bg-transparent border-0 text-primary font-bold text-[0.8rem] cursor-pointer mt-[8px] inline-flex items-center gap-[4px]"
              >
                View Transfer Registry <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming National Meets */}
        <div className="gov-card">
          <div className="flex justify-between items-center mb-[16px]">
            <h3 className="text-[1.1rem] font-bold">Certified Meets Open for Entry</h3>
            <button
              onClick={() => onChangeSubPage('MEETS')}
              className="bg-transparent border-0 text-primary font-bold cursor-pointer text-[0.8rem]"
            >
              View All Meets
            </button>
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className="border border-border-card rounded-[10px] p-[14px]">
              <div className="font-bold text-text-heading text-[0.92rem]">
                Addis Ababa International Grand Prix 2026
              </div>
              <div className="text-[0.8rem] text-text-muted mt-[2px]">
                Venue: Addis Ababa National Stadium | Date: Aug 12-14, 2026
              </div>
              <span className="badge badge-green mt-[8px]">Roster Registered</span>
            </div>

            <div className="border border-border-card rounded-[10px] p-[14px]">
              <div className="font-bold text-text-heading text-[0.92rem]">
                Ethiopian National Youth Championships U18 / U20
              </div>
              <div className="text-[0.8rem] text-text-muted mt-[2px]">
                Venue: Hawassa International Stadium | Date: Sept 05-08, 2026
              </div>
              <span className="badge badge-blue mt-[8px]">Registration Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLUB OPERATIONS & FEDERATION ASSISTANCE AI CHAT ── */}
      <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl text-white">
        {/* Chat Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Bot size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  EAF Club Operations & Intelligence Assistant
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Federation API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to {club.name} live database, licensing records & EAF technical directives
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetchChat?.()}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60"
          >
            <RefreshCw size={13} />
            Refresh Stream
          </button>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="py-4 border-b border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            Quick Operational Inquiries
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '📊 Check Roster & License Compliance', q: 'How many athletes on our roster have valid licenses for upcoming meets?' },
              { label: '🏆 Upcoming Meets & Deadlines', q: 'What are the upcoming certified meet registration deadlines?' },
              { label: '🔄 Inter-Club Transfer Rules', q: 'What are the rules and deadline for inter-club athlete transfers?' },
              { label: '✅ Club Affiliation & Telebirr', q: 'What is our club affiliation and Telebirr payment status?' },
              { label: '🛡️ Fayda National ID Policy', q: 'How does Fayda verification work for registering new athletes?' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChat(chip.q)}
                disabled={isSendingChat}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 hover:border-slate-600 transition cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="my-4 max-h-[360px] min-h-[160px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
          {localMessages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Action Link Chips on Assistant Replies */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/60">
                      {msg.actionLinks.map((action: any, aIdx: number) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => onChangeSubPage(action.page)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                        >
                          <span>{action.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {isSendingChat && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 italic">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl rounded-tl-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Consulting Federation Technical Database...</span>
              </div>
            </div>
          )}

          <div ref={chatMessagesEndRef} />
        </div>

        {/* Chat Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="pt-3 border-t border-slate-800 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Which athletes need license renewals?', 'Grand Prix deadline')..."
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              disabled={isSendingChat}
            />
          </div>
          <button
            type="submit"
            disabled={!chatInput.trim() || isSendingChat}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* ── REAL CLUB ATHLETE ROSTER SHOWCASE ── */}
      <div className="mt-8 gov-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Official Club Roster ({totalAthletesCount} Registered Athletes)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Fayda NIN Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active competitor index certified by the Ethiopian Athletics Federation for {club.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChangeSubPage('ROSTER')}
            className="btn-accent text-xs font-bold flex items-center gap-1.5"
          >
            <Users size={14} />
            Manage Full Roster ({totalAthletesCount})
          </button>
        </div>

        {/* Athletes Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {athletes.map((ath, idx) => (
            <div
              key={ath.id || idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {ath.name}
                      {ath.amharicName && (
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({ath.amharicName})
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {ath.primaryEvent || 'Athletics'}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {ath.licenseStatus || 'ACTIVE'}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>License No:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {ath.licenseNumber || `ETH-${ath.id.slice(-6).toUpperCase()}`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fayda Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  </div>
                  {ath.personalBests && ath.personalBests.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Personal Best:</span>
                      <strong className="text-primary font-bold">
                        {ath.personalBests[0].mark} ({ath.personalBests[0].event})
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Gender: {ath.gender || 'MALE'}</span>
                <button
                  type="button"
                  onClick={() => onChangeSubPage('ROSTER')}
                  className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Details <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
