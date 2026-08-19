import React from 'react';
import { Home, UserCheck, Bell, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';
import { LanguageSelector } from '../../i18n';

interface ClientLayoutProps {
  activeSubPage: string;
  onChangeSubPage: (page: string) => void;
  onBackToLanding: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function ClientLayout({
  activeSubPage, onChangeSubPage, onBackToLanding, onLogout, children
}: ClientLayoutProps) {
  const currentAthlete = useAppSelector((state) => state.auth.athlete);
  const tabs = [
    { id: 'OVERVIEW', label: 'Home', icon: Home },
    { id: 'APPLIED', label: 'My Events', icon: BookOpen },
    { id: 'PROFILE', label: 'Profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 28 }}
        className="client-header bg-white/80 backdrop-blur-[12px] border-b border-black/5 sticky top-0 z-50 px-3 sm:px-6 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <div
          className="flex items-center gap-[clamp(0.4rem,0.8vw,0.75rem)] cursor-pointer min-w-0 shrink-0"
          onClick={() => onChangeSubPage('OVERVIEW')}
        >
          <img src="/images/logo.jpeg" alt="EAF" className="client-brand-img w-[clamp(2rem,3.2vw,2.5rem)] h-[clamp(2rem,3.2vw,2.5rem)] rounded-xl object-cover shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[clamp(0.85rem,1.3vw,1.1rem)] font-black text-[#0F172A] m-0 tracking-tight leading-tight whitespace-nowrap">EAF Athlete</h1>
            <div className="text-[clamp(0.6rem,0.9vw,0.75rem)] text-primary font-bold whitespace-nowrap">Client Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSelector />
          {/* Notifications button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChangeSubPage('NOTIFICATIONS')}
            title="Updates & Notifications"
            className={`relative p-2 sm:p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200
              ${activeSubPage === 'NOTIFICATIONS'
                ? 'bg-[#E0F2FE] border border-primary text-primary-dark'
                : 'bg-slate-100 border-0 text-slate-600'
              }`}
          >
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary border-2 border-white" />
          </motion.button>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="client-signout bg-slate-100 border-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[0.78rem] sm:text-[0.8rem] font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden-mobile">Sign Out</span>
          </motion.button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={currentAthlete.photoUrl}
              alt="Profile"
              className="client-avatar w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary object-cover"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="client-main flex-1 px-3 sm:px-6 py-4 sm:py-6 max-w-[900px] mx-auto w-full">

        {/* Back to Landing Page (keeps the athlete signed in) */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBackToLanding}
          title="Back to Landing Page"
          aria-label="Back to Landing Page"
          className="flex items-center gap-1.5 px-1.5 mb-3 border-0 cursor-pointer font-bold text-[0.82rem] text-slate-500 hover:text-primary bg-transparent transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Home
        </motion.button>

        {/* Modern Tab Navigation */}
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubPage === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onChangeSubPage(tab.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border-0 font-bold text-[0.82rem] sm:text-[0.9rem] cursor-pointer whitespace-nowrap transition-all duration-200 shrink-0
                  ${isActive
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_8px_16px_rgba(14,165,233,0.25)]'
                    : 'bg-white text-slate-500 shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                  }`}
              >
                <Icon size={16} /> {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Content with page transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
