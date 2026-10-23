import React, { useState } from 'react';
import { Users, ShieldCheck, ArrowRightLeft, Trophy, AlertTriangle, ArrowRight, Download, Plus, Building2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { Club, Athlete, Transfer } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useGetOverviewStatsQuery } from '../../store/api/apiSlice';

interface ClubOverviewProps {
  club?: Club;
  athletes?: Athlete[];
  transfers?: Transfer[];
  onChangeSubPage: (page: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onAddClub?: (club: Club) => void;
}

export default function ClubOverview({ club: propClub, athletes: propAthletes, transfers: propTransfers, onChangeSubPage, onNotify, onAddClub }: ClubOverviewProps) {
  const storeClub = useAppSelector((state) => state.auth.club);
  const storeTransfers = useAppSelector((state) => state.club.transfers);
  const { data: accountResponse } = useGetMeQuery(undefined, {
    skip: Boolean((propClub?.id && propClub.name) || (storeClub?.id && storeClub.name)),
  });
  const accountClub = accountResponse?.data?.club;

  const club = (propClub?.id && propClub.name)
    ? propClub
    : (storeClub?.id && storeClub.name)
    ? storeClub
    : accountClub?.id
    ? {
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
      }
    : propClub || storeClub;

  const activeClubId = club?.id || accountClub?.id || (typeof window !== 'undefined' ? localStorage.getItem('eaf_currentClubId') : '') || '';
  const activeClubName = club?.name || accountClub?.name || '';
  const transfers = propTransfers || storeTransfers;

  // Retrieve club members dynamically from database strictly for active club
  const { data: backendAthletes } = useGetAthletesQuery(
    activeClubId ? { clubId: activeClubId } : undefined
  );

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

  const verifiedCount = athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;

  const performanceData = (overviewStats?.monthlyGrowth && overviewStats.monthlyGrowth.length > 0)
    ? overviewStats.monthlyGrowth.map((m: any, idx: number) => ({
        month: m.month,
        points: Math.round(((club.totalPoints || 60) / 6) * (idx + 1) + (m.athletes * 4)),
      }))
    : [
        { month: 'May', points: 12 },
        { month: 'Jun', points: 28 },
        { month: 'Jul', points: 42 },
        { month: 'Aug', points: 65 },
        { month: 'Sep', points: 88 },
        { month: 'Oct', points: club.totalPoints || 120 },
      ];

  const eventsData = (athletes.length > 0 && athletes.some(a => a.primaryEvent))
    ? athletes.reduce<{ name: string; value: number }[]>((counts, athlete) => {
        const name = athlete.primaryEvent || 'Athletics';
        const current = counts.find((item) => item.name === name);
        if (current) current.value += 1;
        else counts.push({ name, value: 1 });
        return counts;
      }, [])
    : (overviewStats?.disciplineDistribution && overviewStats.disciplineDistribution.length > 0)
    ? overviewStats.disciplineDistribution.slice(0, 5).map((d: any) => ({ name: d.name, value: d.count || d.value }))
    : [
        { name: '5,000m / 10,000m', value: 4 },
        { name: 'Middle Distance', value: 3 },
        { name: 'Marathon & Road', value: 2 },
        { name: 'Field & Jumps', value: 1 },
      ];

  const COLORS = ['var(--primary)', '#10B981', '#F59E0B', '#8B5CF6', '#0072CE', '#EC4899'];

  return (
    <div>
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-[20px] flex-wrap gap-[16px]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            {(club.logoUrl || (club as any).logo) && ((club.logoUrl || (club as any).logo).startsWith("http") || (club.logoUrl || (club as any).logo).startsWith("/") || (club.logoUrl || (club as any).logo).startsWith("data:")) ? (
              <img
                src={club.logoUrl || (club as any).logo}
                alt={club.name}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="text-xl font-black text-primary">{(club.shortName || club.name?.slice(0, 3) || "CLB").toUpperCase()}</span>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[16px] mb-[28px]">
        <div
          className="gov-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onChangeSubPage('ROSTER')}
          title="Click to open Athlete & Member Management"
        >
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Registered Roster</span>
            <Users size={20} color="var(--eth-blue)" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-text-heading">{athletes.length} Athletes</div>
          <div className="text-[0.78rem] text-primary font-semibold mt-[4px]">
            ✓ {verifiedCount} Fayda Verified
          </div>
        </div>

        <div className="gov-card">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Active EAF Licenses</span>
            <ShieldCheck size={20} color="var(--primary)" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-primary">{activeLicenseCount} Active</div>
          <div className="text-[0.78rem] text-accent font-semibold mt-[4px]">
            ⚠ {expiredCount} Licenses Pending Renewal
          </div>
        </div>

        <div className="gov-card">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Active Transfers</span>
            <ArrowRightLeft size={20} color="var(--accent)" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-accent">{transfers.length} Transfers</div>
          <div className="text-[0.78rem] text-text-muted font-semibold mt-[4px]">
            Deadline: Aug 15, 2026
          </div>
        </div>

        <div className="gov-card">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Regional Ranking</span>
            <Trophy size={20} color="#7C3AED" />
          </div>
          <div className="text-[1.8rem] font-extrabold text-text-heading">Rank #{club.clubRank}</div>
          <div className="text-[0.78rem] text-[#7C3AED] font-semibold mt-[4px]">
            {club.totalPoints} Points Total
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[24px] mb-[28px]">
        <div className="gov-card">
          <h3 className="text-[1.1rem] font-bold mb-[16px] text-text-heading">Performance Points (YTD)</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="points" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card">
          <h3 className="text-[1.1rem] font-bold mb-[16px] text-text-heading">Athlete Discipline Distribution</h3>
          <div className="h-[240px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {eventsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="gov-card">
          <h3 className="text-[1.1rem] font-bold mb-[16px] text-text-heading">Federation Regional Benchmark</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(overviewStats?.regionalDistribution || []).slice(0, 5)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="region" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="athletes" fill="#0072CE" name="Athletes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clubs" fill="#FFB800" name="Clubs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Alerts & Overview Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[24px]">
        {/* Card 1: Regulatory Action Items */}
        <div className="gov-card">
          <h3 className="text-[1.1rem] font-bold mb-[16px] flex items-center gap-[8px]">
            <AlertTriangle size={18} color="var(--accent)" />
            Regulatory Audit Alerts (FR-1.2)
          </h3>

          <div className="flex flex-col gap-[12px]">
            <div className="bg-accent-light border border-[rgba(217,119,6,0.2)] rounded-[10px] p-[14px] text-[0.85rem]">
              <div className="font-bold text-accent">2 Athletes Require Annual Licensing Fee Payment</div>
              <p className="text-text-muted mt-[4px]">
                Unlicensed athletes cannot be entered into upcoming certified meets.
              </p>
              <button
                onClick={() => onChangeSubPage('ROSTER')}
                className="bg-transparent border-0 text-accent font-bold text-[0.8rem] cursor-pointer mt-[8px] inline-flex items-center gap-[4px]"
              >
                Go to Roster Audits <ArrowRight size={14} />
              </button>
            </div>

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

    </div>
  );
}
