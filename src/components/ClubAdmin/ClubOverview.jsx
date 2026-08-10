import React, { useState } from 'react';
import { Users, ShieldCheck, ArrowRightLeft, Trophy, AlertTriangle, ArrowRight, Download, Plus, Building2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function ClubOverview({ club, athletes, transfers, onChangeSubPage, onNotify, onAddClub }) {
  const verifiedCount = athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;

  const [showClubModal, setShowClubModal] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubAmharic, setClubAmharic] = useState('');
  const [region, setRegion] = useState('Oromia Region');
  const [manager, setManager] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('🏃‍♂️');

  
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
  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div>
      {/* Page Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {club.name} — Executive Dashboard
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Federation Club ID: <strong>{club.id}</strong> | Region: <strong>{club.region}</strong> | Manager: <strong>{club.manager}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Registered Roster</span>
            <Users size={20} color="var(--eth-blue)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>{athletes.length} Athletes</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
            ✓ {verifiedCount} Fayda Verified
          </div>
        </div>

        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active EAF Licenses</span>
            <ShieldCheck size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{activeLicenseCount} Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
            ⚠ {expiredCount} Licenses Pending Renewal
          </div>
        </div>

        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Transfers</span>
            <ArrowRightLeft size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>{transfers.length} Transfers</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
            Deadline: Aug 15, 2026
          </div>
        </div>

        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Regional Ranking</span>
            <Trophy size={20} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>Rank #{club.clubRank}</div>
          <div style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 600, marginTop: '4px' }}>
            {club.totalPoints} Points Total
          </div>
        </div>
      </div>

      
      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-heading)' }}>Performance Points (YTD)</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="points" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-heading)' }}>Athlete Discipline Distribution</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {eventsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Alerts & Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
        {/* Card 1: Regulatory Action Items */}
        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--accent)" />
            Regulatory Audit Alerts (FR-1.2)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'var(--accent-light)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>2 Athletes Require Annual Licensing Fee Payment</div>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Unlicensed athletes cannot be entered into upcoming certified meets.
              </p>
              <button 
                onClick={() => onChangeSubPage('ROSTER')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Go to Roster Audits <ArrowRight size={14} />
              </button>
            </div>

            <div style={{
              background: 'var(--eth-blue-light)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--eth-blue)' }}>Federation Transfer Window Lockdown</div>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Inter-club transfers lock automatically on August 15, 2026 (18 Days Remaining).
              </p>
              <button 
                onClick={() => onChangeSubPage('TRANSFERS')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--eth-blue)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View Transfer Registry <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming National Meets */}
        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Certified Meets Open for Entry</h3>
            <button 
              onClick={() => onChangeSubPage('MEETS')}
              style={{ background: 'none', border: 'none', color: 'var(--eth-blue)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              View All Meets
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ border: '1px solid var(--border-card)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                Addis Ababa International Grand Prix 2026
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Venue: Addis Ababa National Stadium | Date: Aug 12-14, 2026
              </div>
              <span className="badge badge-green" style={{ marginTop: '8px' }}>Roster Registered</span>
            </div>

            <div style={{ border: '1px solid var(--border-card)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                Ethiopian National Youth Championships U18 / U20
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Venue: Hawassa International Stadium | Date: Sept 05-08, 2026
              </div>
              <span className="badge badge-blue" style={{ marginTop: '8px' }}>Registration Open</span>
            </div>
          </div>
        </div>
      </div>

          </div>
  );
}
