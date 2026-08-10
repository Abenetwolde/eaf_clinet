import React from 'react';
import { Home, UserCheck, Bell, BookOpen, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Athlete } from '../../types';

interface ClientLayoutProps {
  activeSubPage: string;
  onChangeSubPage: (page: string) => void;
  currentAthlete: Athlete;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function ClientLayout({
  activeSubPage, onChangeSubPage, currentAthlete, onLogout, children
}: ClientLayoutProps) {
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
        className="bg-white/80 backdrop-blur-[12px] border-b border-black/5 sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onChangeSubPage('OVERVIEW')}
        >
          <img src="/images/logo.jpeg" alt="EAF" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-[1.1rem] font-black text-[#0F172A] m-0 tracking-tight">EAF Athlete</h1>
            <div className="text-[0.75rem] text-primary font-bold">Client Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChangeSubPage('NOTIFICATIONS')}
            title="Updates & Notifications"
            className={`relative p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200
              ${activeSubPage === 'NOTIFICATIONS'
                ? 'bg-[#E0F2FE] border border-primary text-primary-dark'
                : 'bg-slate-100 border-0 text-slate-600'
              }`}
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary border-2 border-white" />
          </motion.button>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="bg-slate-100 border-0 px-3.5 py-2 rounded-xl text-[0.8rem] font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden-mobile">Sign Out</span>
          </motion.button>

          {/* Avatar */}
          <div className="relative">
            <img
              src={currentAthlete.photoUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-primary object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-6 max-w-[900px] mx-auto w-full">

        {/* Modern Tab Navigation */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubPage === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onChangeSubPage(tab.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-0 font-bold text-[0.9rem] cursor-pointer whitespace-nowrap transition-all duration-200 shrink-0
                  ${isActive
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_8px_16px_rgba(14,165,233,0.25)]'
                    : 'bg-white text-slate-500 shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                  }`}
              >
                <Icon size={18} /> {tab.label}
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
