import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Trophy,
  CreditCard
} from 'lucide-react';
import FaydaVerification from './FaydaVerification';
import RecordsVault from './RecordsVault';
import EventResults from './EventResults';
import type { Athlete } from '../../types';

interface AthleteDashboardProps {
  athlete: Athlete;
  onUpdateAthlete: (athlete: Athlete) => void;
  onPayLicense: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteDashboard({ athlete, onUpdateAthlete, onPayLicense, onNotify }: AthleteDashboardProps) {
  const [activeTab, setActiveTab] = useState('RECORDS'); // 'RECORDS', 'FAYDA', 'RESULTS'

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Athlete Header Profile Banner */}
      <div className="glass-panel p-8 mb-7 bg-gradient-to-br from-white to-[#F0FDF4] border-2 border-[rgba(0,168,89,0.3)] flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-5">
          <img 
            src={athlete.photoUrl} 
            alt={athlete.name}
            className="w-[86px] h-[86px] rounded-[22px] object-cover border-[3px] border-[#00A859] shadow-[0_8px_20px_rgba(0,168,89,0.2)]"
          />

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[2rem] font-black text-text-main">
                {athlete.name}
              </h2>
              <span className="badge badge-green">
                <ShieldCheck size={14} />
                Fayda ID Verified
              </span>
              <span className="badge badge-purple">
                {athlete.ageTier} Tier
              </span>
            </div>

            <p className="text-[0.95rem] text-[#047857] mt-0.5 font-bold">
              {athlete.amharicName} — {athlete.clubName}
            </p>

            <div className="flex gap-4 mt-2 text-[0.85rem] text-text-muted font-semibold flex-wrap">
              <span>Fayda FIN: <strong className="text-text-main font-mono">{athlete.faydaFin}</strong></span>
              <span>•</span>
              <span>Discipline: <strong className="text-text-main">{athlete.primaryEvent}</strong></span>
              <span>•</span>
              <span>Personal Best: <strong className="text-[#D97706]">{athlete.pb}</strong></span>
            </div>
          </div>
        </div>

        {/* License Action Button */}
        {athlete.licenseStatus !== 'ACTIVE' ? (
          <button 
            onClick={() => onPayLicense(athlete)}
            className="btn-telebirr text-[0.9rem] px-[22px] py-3.5"
          >
            <CreditCard size={18} />
            Renew EAF License via Telebirr (500 ETB)
          </button>
        ) : (
          <div className="text-right">
            <span className="badge badge-green text-[0.82rem] px-4 py-2">
              ✓ License Active ({athlete.licenseNumber})
            </span>
            <div className="text-[0.78rem] text-text-muted mt-1 font-semibold">
              Valid through Dec 31, 2026
            </div>
          </div>
        )}
      </div>

      {/* Career Records Vault View */}
      <RecordsVault 
        athlete={athlete}
        onNotify={onNotify}
      />
    </div>
  );
}
