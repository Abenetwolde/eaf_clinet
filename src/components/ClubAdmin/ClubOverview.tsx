import React from 'react';
import { Users, ShieldCheck, ArrowRightLeft, Trophy, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import type { Club, Athlete, Transfer } from '../../types';

interface ClubOverviewProps {
  club: Club;
  athletes: Athlete[];
  transfers: Transfer[];
  onChangeSubPage: (page: string) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onAddClub: (club: Club) => void;
}

export default function ClubOverview({ club, athletes, transfers, onChangeSubPage, onNotify }: ClubOverviewProps) {
  const verifiedCount = athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;



  const performanceData = [
    { month: 'Jan', points: 120 },
    { month: 'Feb', points: 150 },
    { month: 'Mar', points: 170 },
    { month: 'Apr', points: 210 },
    { month: 'May', points: 190 },
    { month: 'Jun', points: 280 },
    { month: 'Jul', points: 310 },
  ];

  const eventsData = [
    { name: 'Sprints', value: 12 },
    { name: 'Middle Dist', value: 18 },
    { name: 'Long Dist', value: 35 },
    { name: 'Field Events', value: 8 },
  ];
  const COLORS = ['var(--primary)', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div>
      {/* Page Title Header */}
      <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
        <div>
          <h2 className="text-[1.6rem] font-extrabold text-text-heading">
            {club.name} — Executive Dashboard
          </h2>
          <p className="text-[0.88rem] text-text-muted mt-[2px]">
            Federation Club ID: <strong>{club.id}</strong> | Region: <strong>{club.region}</strong> | Manager: <strong>{club.manager}</strong>
          </p>
        </div>

        <div className="flex gap-[12px]">
          <button
            onClick={() => onChangeSubPage('REGISTER_MEMBER')}
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
            Register Members
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

      {/* Metrics Row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[16px] mb-[28px]">
        <div className="gov-card">
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
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  wrapperStyle={{ outline: 'none' }}
                />
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
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  wrapperStyle={{ outline: 'none' }}
                />
              </PieChart>
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
