import React, { useState } from 'react';
import { getProfilePhotoUrl } from '../../utils/profilePhoto';
import {
  UserCheck, Users, ArrowRightLeft, Trophy, ShieldCheck,
  Navigation, Activity, LogOut, Home,
  Bell, ChevronRight, Award, BookOpen, Sun, Moon, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';
import { useGetClubsQuery } from '../../store/api/apiSlice';
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
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  children: React.ReactNode;
}

export default function AppLayout({
  activeSubPage, onChangeSubPage, onSwitchRole, onLogout,
  darkMode, onToggleDarkMode, children
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [adminAvatarFailed, setAdminAvatarFailed] = useState(false);
  const currentRole = useAppSelector((state) => state.auth.role);
  const currentClub = useAppSelector((state) => state.auth.club);
  const currentAthlete = useAppSelector((state) => state.auth.athlete);
  const userData = useAppSelector((state) => state.auth.userData);
  const clubAdminName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || currentClub?.manager || 'Club Admin';
  const clubAdminPhotoCandidate = (userData as any)?.photoUrl || (userData as any)?.picture || (userData as any)?.avatarUrl || '';
  const clubAdminPhoto = /runner_female\.png|avatar-placeholder|profile-placeholder/i.test(clubAdminPhotoCandidate) ? '' : clubAdminPhotoCandidate;
  const isClub = currentRole === 'CLUB';

  // Live lookup from clubs list to get up-to-date club crest
  const { data: clubsList = [] } = useGetClubsQuery();
  const matchedClub = (clubsList as any[]).find(
    (c: any) => c.id === currentClub?.id || (c.name && currentClub?.name && c.name.trim().toLowerCase() === currentClub?.name?.trim().toLowerCase())
  );
  const resolvedClubLogo = (
    currentClub?.logoUrl ||
    (currentClub as any)?.logo ||
    matchedClub?.logoUrl ||
    matchedClub?.logo ||
    ''
  );
  const clubDisplayName = currentClub?.name || matchedClub?.name || 'Club Portal';

  const athleteClubName = currentAthlete?.club || (currentAthlete as any)?.clubName || '';
  const athleteMatchedClub = athleteClubName ? (clubsList as any[]).find(
    (c: any) => (c.name && c.name.trim().toLowerCase() === athleteClubName.trim().toLowerCase())
  ) : null;
  const athleteClubLogo = athleteMatchedClub?.logoUrl || (athleteMatchedClub as any)?.logo || '';

  const clubNavItems = [
    { id: 'OVERVIEW',   label: 'Dashboard',                   icon: Home },
    { id: 'ROSTER',     label: 'Athlete & Member Management', icon: Users },
    { id: 'MEETS',      label: 'Competitions & Meets',        icon: Trophy },
    { id: 'TRANSFERS',  label: 'Transfers',                   icon: ArrowRightLeft },
    { id: 'RBAC',       label: 'Security & RBAC Matrix',      icon: ShieldCheck },
  ];

  const athleteNavItems = [
    { id: 'OVERVIEW',      label: 'Dashboard',         icon: Home },
    { id: 'APPLIED',       label: 'My Applications',   icon: BookOpen },
    { id: 'PROFILE',       label: 'My Profile',        icon: UserCheck },
    { id: 'NOTIFICATIONS', label: 'Notifications',     icon: Bell },
    { id: 'CHECKIN',       label: 'Check-In',          icon: Navigation },
    { id: 'RACES',         label: 'Races',             icon: Activity },
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
        <div className="md:hidden flex justify-end p-3 border-b border-slate-200">
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-600 p-1 rounded-lg hover:bg-slate-100 border-0 bg-transparent cursor-pointer"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* EAF Brand Header */}
        <div
          className="px-4.5 py-4 border-b border-slate-200 flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-90"
          style={{ padding: '16px 18px' }}
          onClick={() => onSwitchRole('LANDING')}
          role="button"
          tabIndex={0}
          title="Return to Home Page"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-200 shrink-0">
            <EAFLogo size={36} />
          </div>
          <div>
            <div className="text-[0.95rem] font-black text-slate-900 tracking-tight leading-tight">EAF Portal</div>
            <div className="text-[0.68rem] text-blue-600 font-bold mt-px">Ethiopian Athletics Federation</div>
          </div>
        </div>

        {/* ── Club Crest Banner ── */}
        {isClub && (
          <div className="mx-3.5 mt-3.5 mb-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-white p-1 shrink-0 overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center">
                {resolvedClubLogo && !logoFailed ? (
                  <img
                    src={resolvedClubLogo}
                    alt={clubDisplayName}
                    className="w-full h-full object-contain"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs tracking-wider">
                    {(currentClub.shortName || currentClub.name?.slice(0, 3) || 'CLUB').toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 leading-none mb-1">
                  <ShieldCheck size={11} className="text-blue-600 shrink-0" />
                  Official Club Crest
                </div>
                <div className="text-sm font-black text-slate-900 truncate leading-tight" title={clubDisplayName}>
                  {clubDisplayName}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                  {currentClub.region || matchedClub?.region || "Affiliated Club"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Athlete Affiliated Club Badge */}
        {!isClub && athleteClubName && (
          <div className="mx-3.5 mt-2.5 mb-1 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-white p-0.5 shrink-0 overflow-hidden shadow-xs flex items-center justify-center border border-slate-200">
              {athleteClubLogo ? (
                <img src={athleteClubLogo} alt={athleteClubName} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center">
                  {athleteClubName.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] uppercase font-black text-blue-600 tracking-wider leading-none">Affiliated Club</div>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5" title={athleteClubName}>{athleteClubName}</div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="p-3 flex-1 overflow-y-auto" style={{ padding: '16px 12px' }}>
          <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.09em] mb-2.5 pl-1.5">
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
        <div className="p-3.5 border-t border-slate-200 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { onLogout(); setMobileOpen(false); }}
            style={{
              background: 'transparent',
              color: '#F87171',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FCA5A5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#F87171'}
          >
            <LogOut size={15} color="#F87171" /> Logout
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
            
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="w-[34px] h-[34px] rounded-full border-none flex items-center justify-center cursor-pointer transition-colors
                  bg-[var(--bg-surface-variant)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

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
