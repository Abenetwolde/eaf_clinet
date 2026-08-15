import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowRightLeft, 
  Trophy, 
  Download
} from 'lucide-react';
import RosterManagement from './RosterManagement';
import TransferRegistry from './TransferRegistry';
import MeetRegistration from './MeetRegistration';
import type { Club, Athlete, Transfer } from '../../types';

interface ClubDashboardProps {
  club: Club;
  athletes: Athlete[];
  transfers: Transfer[];
  onRenewLicense: (athlete: Athlete) => void;
  onAddAthlete: (athlete: Athlete) => void;
  onInitiateTransfer: (transfer: Transfer) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ClubDashboard({ club, athletes, transfers, onRenewLicense, onAddAthlete, onInitiateTransfer, onNotify }: ClubDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('ROSTER'); // 'ROSTER', 'TRANSFERS', 'MEETS'

  const verifiedCount = athletes.filter(a => a.faydaStatus === 'VERIFIED').length;
  const activeLicenseCount = athletes.filter(a => a.licenseStatus === 'ACTIVE').length;
  const expiredCount = athletes.filter(a => a.licenseStatus !== 'ACTIVE').length;

  return (
    <div className="max-w-[1280px] mx-auto p-[32px_24px]">
      {/* Club Banner Header */}
      <div className="glass-panel flex items-center justify-between flex-wrap gap-[20px] p-[32px] mb-[28px] bg-gradient-to-br from-white to-[#F8FAFC] border-2 border-[rgba(255,184,0,0.4)]">
        <div className="flex items-center gap-[20px]">
          <div className="text-[3.2rem] p-[14px] bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,114,206,0.1)] border border-[rgba(226,232,240,0.8)]">
            {club.logo}
          </div>

          <div>
            <div className="flex items-center gap-[10px]">
              <h2 className="text-[2rem] font-black text-text-main">
                {club.name}
              </h2>
              <span className="badge badge-gold">
                Rank #{club.clubRank} Regional
              </span>
            </div>
            <p className="text-[0.9rem] text-text-muted mt-[4px] font-semibold">
              Region: {club.region} | Club Manager: <strong>{club.manager}</strong> | ID: {club.id}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button 
          onClick={() => onNotify("Downloading Club Annual Performance & Roster Report...", "info")}
          className="btn-secondary text-[0.85rem]"
        >
          <Download size={16} />
          Export Official Club Roster Index
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px] mb-[32px]">
        <div className="glass-panel p-[22px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Registered Roster</span>
            <Users size={22} color="#0072CE" />
          </div>
          <div className="text-[2rem] font-black text-text-main">{athletes.length} Athletes</div>
          <div className="text-[0.78rem] text-[#00A859] font-bold mt-[4px]">
            {verifiedCount} Fayda  Verified
          </div>
        </div>

        <div className="glass-panel p-[22px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Active EAF Licenses</span>
            <ShieldCheck size={22} color="#00A859" />
          </div>
          <div className="text-[2rem] font-black text-[#00A859]">{activeLicenseCount} Active</div>
          <div className="text-[0.78rem] text-[#D97706] font-bold mt-[4px]">
            {expiredCount} Pending Renewal
          </div>
        </div>

        <div className="glass-panel p-[22px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Transfer Registry</span>
            <ArrowRightLeft size={22} color="#D97706" />
          </div>
          <div className="text-[2rem] font-black text-[#D97706]">{transfers.length} Active</div>
          <div className="text-[0.78rem] text-text-muted font-semibold mt-[4px]">
            Lock Deadline: Aug 15
          </div>
        </div>

        <div className="glass-panel p-[22px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[0.8rem] font-bold text-text-muted">Championship Points</span>
            <Trophy size={22} color="#7C3AED" />
          </div>
          <div className="text-[2rem] font-black text-text-main">{club.totalPoints} Pts</div>
          <div className="text-[0.78rem] text-[#7C3AED] font-bold mt-[4px]">
            Season 2025/26 Standings
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-[12px] border-b-2 border-[rgba(226,232,240,0.8)] pb-[16px] mb-[28px] overflow-x-auto">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-[24px] py-[12px] rounded-[12px] border-0 font-extrabold text-[0.9rem] cursor-pointer flex items-center gap-[8px] whitespace-nowrap ${
            activeTab === 'ROSTER' ? 'bg-[rgba(0,168,89,0.12)] text-[#00A859]' : 'bg-transparent text-text-muted'
          }`}
        >
          <Users size={18} />
          Digital Roster & Licensing
        </button>

        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`px-[24px] py-[12px] rounded-[12px] border-0 font-extrabold text-[0.9rem] cursor-pointer flex items-center gap-[8px] whitespace-nowrap ${
            activeTab === 'TRANSFERS' ? 'bg-[rgba(255,184,0,0.15)] text-[#D97706]' : 'bg-transparent text-text-muted'
          }`}
        >
          <ArrowRightLeft size={18} />
          Transfer Registry ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('MEETS')}
          className={`px-[24px] py-[12px] rounded-[12px] border-0 font-extrabold text-[0.9rem] cursor-pointer flex items-center gap-[8px] whitespace-nowrap ${
            activeTab === 'MEETS' ? 'bg-[rgba(0,114,206,0.12)] text-[#0072CE]' : 'bg-transparent text-text-muted'
          }`}
        >
          <Trophy size={18} />
          Meet Entries & Seeding
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'ROSTER' && (
        <RosterManagement 
          onRenewLicense={onRenewLicense}
          onAddAthlete={onAddAthlete}
        />
      )}

      {activeTab === 'TRANSFERS' && (
        <TransferRegistry 
          onInitiateTransfer={onInitiateTransfer}
        />
      )}

      {activeTab === 'MEETS' && (
        <MeetRegistration 
          onNotify={onNotify}
        />
      )}
    </div>
  );
}
