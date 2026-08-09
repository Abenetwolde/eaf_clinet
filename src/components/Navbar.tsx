import React from 'react';
import { ShieldCheck, UserCheck, Building2, LogOut, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Club, Athlete, Role } from '../types';

interface NavbarProps {
  currentRole: Role;
  currentAthlete: Athlete;
  currentClub: Club;
  onSwitchRole: (role: Role) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({
  currentRole, currentAthlete, currentClub, onSwitchRole, onLogout, onOpenAuthModal
}: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 ${
        currentRole === 'LANDING'
          ? 'bg-transparent backdrop-blur-none border-none shadow-none'
          : 'bg-white/88 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between flex-wrap gap-4">
        {/* Brand Logo & EAF Title */}
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          onClick={() => onSwitchRole('LANDING')}
        >
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-white to-slate-100 border-2 border-blue-300/40 flex items-center justify-center shadow-[0_6px_16px_rgba(0,114,206,0.15)]">
            <span className="text-2xl">🇪🇹</span>
            <div className="absolute top-0 left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#0072CE] via-[#FFB800] via-[#1E293B] via-[#00A859] to-[#E51B24] rounded-sm" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-text-main tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                EOSCRMS
              </span>
              <span className="badge badge-gold text-[0.65rem] px-2 py-0.5">
                OLYMPIC v1.1
              </span>
            </div>
            <p className="text-xs text-text-muted font-semibold">EOSCRMS v1.1</p>
          </div>
        </div>

        {/* System Navigation & Role Context Controls */}
        <div className="flex items-center gap-3">
          {currentRole === 'LANDING' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuthModal()}
              className="btn-primary text-[0.9rem] px-5 py-2.5"
            >
              Sign In
            </motion.button>
          ) : (
            <>
              {/* Active Session Indicator */}
              <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-3xl flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {currentRole === 'CLUB' ? (
                  <>
                    <span className="text-xl">{currentClub.logo}</span>
                    <div className="text-left">
                      <div className="text-[0.8rem] font-black text-text-main">{currentClub.shortName}</div>
                      <div className="text-[0.65rem] text-primary font-bold">Admin</div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={currentAthlete.photoUrl}
                      alt={currentAthlete.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-[0.8rem] font-black text-text-main">{currentAthlete.name}</div>
                      <div className="text-[0.65rem] text-primary font-bold">
                        ID Verified ({currentAthlete.ageTier})
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Switch Role Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSwitchRole(currentRole === 'CLUB' ? 'ATHLETE' : 'CLUB')}
                className="btn-gov-secondary text-[0.8rem] px-3.5 py-2"
              >
                {currentRole === 'CLUB' ? 'Athlete View' : 'Club View'}
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLogout}
                className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[0.8rem] font-bold cursor-pointer transition-colors hover:bg-red-100"
              >
                <LogOut size={14} />
                Logout
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
