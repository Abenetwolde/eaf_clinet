import React, { useState } from 'react';
import {
  Building2, UserCheck, Users, ArrowRightLeft, Trophy,
  Navigation, Activity, LogOut, Home,
  Bell, ChevronRight, Award, Globe, BookOpen, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';
import { LanguageSelector } from '../../i18n';

function EAFLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/images/logo.jpeg"
      alt="Ethiopian Athletics Federation"
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '6px' }}
    />
  );
}

interface AppLayoutProps {
  activeSubPage: string;
  onChangeSubPage: (page: string) => void;
  onSwitchRole: (role: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function AppLayout({
  activeSubPage, onChangeSubPage, onSwitchRole, onLogout, children
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRole = useAppSelector((state) => state.auth.role);
  const currentClub = useAppSelector((state) => state.auth.club);
  const currentAthlete = useAppSelector((state) => state.auth.athlete);
  const isClub = currentRole === 'CLUB';

  const clubNavItems = [
    { id: 'OVERVIEW',   label: 'Dashboard',           icon: Home },
    { id: 'ROSTER',     label: 'Athlete Management',  icon: Users },
    { id: 'MEETS',      label: 'Meets',               icon: Trophy },
    { id: 'TRANSFERS',  label: 'Transfers',           icon: ArrowRightLeft },
  ];

  const athleteNavItems = [
    { id: 'OVERVIEW',      label: 'Dashboard',         icon: Home },
    { id: 'APPLIED',       label: 'My Applications',   icon: BookOpen },
    { id: 'PROFILE',       label: 'My Profile',        icon: UserCheck },
    { id: 'NOTIFICATIONS', label: 'Notifications',     icon: Bell },
    { id: 'EVENTS',        label: 'Events',            icon: Globe },
    { id: 'CHECKIN',       label: 'Check-In',          icon: Navigation },
    { id: 'RACES',         label: 'Races',             icon: Activity },
    { id: 'RESULTS',       label: 'Event Results',     icon: Trophy },
    { id: 'RECORDS',       label: 'Records',           icon: Award },
  ];

  const navItems = isClub ? clubNavItems : athleteNavItems;

  const handleNavClick = (id: string) => {
    onChangeSubPage(id);
    setMobileOpen(false);
  };

  return (
    <div className="app-container">
      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <motion.aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        initial={false}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-3 border-b border-[#2D3A5A]">
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white p-1 rounded-lg hover:bg-white/10 border-0 bg-transparent cursor-pointer"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* EAF Brand Header */}
        <div className="px-4.5 py-5 border-b border-[#2D3A5A] flex items-center gap-3" style={{ padding: '20px 18px' }}>
          <div className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)] shrink-0">
            <EAFLogo size={36} />
          </div>
          <div>
            <div className="text-[0.95rem] font-black text-white tracking-tight leading-tight">EAF Portal</div>
            <div className="text-[0.68rem] text-accent font-bold mt-px">EAF</div>
          </div>
        </div>

        {/* Identity Card */}
        <div className="px-4 py-3.5 bg-white/[0.04] border-b border-[#2D3A5A] flex items-center gap-2.5">
          {isClub ? (
            <>
              <div className="text-2xl shrink-0">{currentClub.logo}</div>
              <div>
                <div className="text-[0.84rem] font-bold text-white">{currentClub.shortName}</div>
                <div className="text-[0.68rem] text-accent font-bold">Admin</div>
              </div>
            </>
          ) : (
            <>
              <img
                src={currentAthlete.photoUrl}
                alt={currentAthlete.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border-2 border-accent"
              />
              <div>
                <div className="text-[0.84rem] font-bold text-white leading-tight">{currentAthlete.name}</div>
                <div className="text-[0.68rem] text-[#8FA8BC] font-bold">{currentAthlete.ageTier} · ID Verified</div>
              </div>
            </>
          )}
        </div>

        {/* Nav Items */}
        <div className="p-3 flex-1 overflow-y-auto" style={{ padding: '16px 12px' }}>
          <div className="text-[0.65rem] font-black text-[#5A7A94] uppercase tracking-[0.09em] mb-2.5 pl-1.5">
            {isClub ? 'Club' : 'Athlete'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubPage === item.id;
            return (
              <motion.div
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''} relative`}
                whileHover={{ x: isActive ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={17} />
                <span>{item.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2D3A5A] flex flex-col gap-2">
          <button
            onClick={() => { onSwitchRole('LANDING'); setMobileOpen(false); }}
            className="btn-gov-secondary w-full text-[0.78rem] px-3 py-2 flex items-center justify-center gap-1.5"
          >
            <Globe size={13} /> Go to Home Page
          </button>
          <button
            onClick={() => { onSwitchRole(isClub ? 'ATHLETE' : 'CLUB'); setMobileOpen(false); }}
            className="btn-gov-secondary w-full text-[0.78rem] px-3 py-2"
          >
            {isClub ? <><UserCheck size={13} /> Athlete View</> : <><Building2 size={13} /> Club View</>}
          </button>
          <button
            onClick={() => { onLogout(); setMobileOpen(false); }}
            className="bg-transparent border-none text-red-400 text-[0.78rem] font-semibold flex items-center justify-center gap-1.5 cursor-pointer py-1.5"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        <header className="header-bar">
          <div className="flex items-center gap-2">
            {/* Hamburger toggle for mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-100 border-0 text-slate-700 cursor-pointer flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div className="header-breadcrumb flex items-center gap-1.5 text-[0.82rem] text-text-muted">
              <span className="font-bold">EAF</span>
              <ChevronRight size={13} />
              <span className="font-semibold hidden sm:inline">{isClub ? 'Club Portal' : 'Athlete Portal'}</span>
              <ChevronRight size={13} className="hidden sm:inline" />
              <span className="text-text-heading font-black truncate">
                {navItems.find((n) => n.id === activeSubPage)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <LanguageSelector />
            <div className="hidden sm:flex bg-primary-light px-3 py-1.5 rounded-2xl text-[0.75rem] font-bold text-primary items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Active
            </div>
            <div className="relative cursor-pointer p-1">
              <Bell size={19} color="var(--text-muted)" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubPage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="main-pad p-4 sm:p-6 md:p-8 flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
