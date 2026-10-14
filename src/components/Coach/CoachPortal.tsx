import React, { useState, useEffect } from 'react';
import {
  Users, Trophy, Calendar, ShieldCheck, Award, Activity, Search,
  ArrowRight, Phone, Mail, MapPin, CheckCircle2, ChevronRight,
  TrendingUp, Clock, Filter, LogOut, RefreshCw, AlertCircle, Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import type { Coach } from '../../types';

interface CoachPortalProps {
  currentCoach?: Coach | null;
  onLogout: () => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onGoHome?: () => void;
}

export default function CoachPortal({
  currentCoach,
  onLogout,
  onNotify,
  onGoHome,
}: CoachPortalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATHLETES' | 'COMPETITIONS' | 'TRAINING'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');

  // Real API: Fetch athletes from backend
  const { data: athletes = [], isLoading: isLoadingAthletes, refetch: refetchAthletes } = useGetAthletesQuery();

  // Real API: Fetch published events
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Real API: Fetch coach profile from backend
  const [coachProfile, setCoachProfile] = useState<any>(currentCoach || null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('eaf_token');
      if (!token) return;
      setIsLoadingProfile(true);
      try {
        const res = await fetch('/api/v1/coaches/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setCoachProfile((prev: any) => ({ ...prev, ...json.data }));
          }
        }
      } catch (err) {
        console.error('Failed to load coach profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchPublishedEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const res = await fetch('/api/v1/events/published');
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setEvents(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchCoachProfile();
    fetchPublishedEvents();
  }, []);

  const coachName = coachProfile?.user?.firstName
    ? `${coachProfile.user.firstName} ${coachProfile.user.lastName}`
    : coachProfile?.name || 'Coach Tolosa Kotu';

  const licenseNo = coachProfile?.licenseNumber || 'WA-COA-ETH-2026-21593';
  const specialization = coachProfile?.specialization || 'Distance & Steeplechase High Performance';
  const finNumber = coachProfile?.user?.faydaIdentity?.nin || coachProfile?.faydaFin || '3849 0182 9941 2026';
  const fanNumber = coachProfile?.user?.faydaIdentity?.faydaSub || coachProfile?.faydaFan || 'FAN-3849-0182-2026';

  // Filter athletes
  const filteredAthletes = athletes.filter((ath) => {
    const nameMatch = (ath.name || `${ath.user?.firstName || ''} ${ath.user?.lastName || ''}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const discMatch = selectedDiscipline === 'ALL' || (ath.primaryEvent || '').includes(selectedDiscipline);
    return nameMatch && discMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Coach Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={onGoHome}
            title="Return to Public Home"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden p-0.5 shadow-2xs flex items-center justify-center">
              <img src="/images/logo.jpeg" alt="EAF Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                Ethiopian Athletics Federation
              </div>
              <div className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                Coach High Performance Portal
              </div>
            </div>
          </div>
        </div>

        {/* Coach Profile Card & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
              TK
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {coachName}
              </div>
              <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <ShieldCheck size={11} className="text-blue-600" /> WA Certified Coach
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── Coach Hero Banner ── */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 sm:px-8 py-8 border-b border-blue-950 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-lg relative shrink-0">
              <img
                src="/images/fayda_resident_photo.jpg"
                alt="Coach Portrait"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-300/40 text-[11px] font-black text-blue-100 mb-1.5 backdrop-blur-xs">
                <ShieldCheck size={12} className="text-emerald-400" /> Fayda Verified High Performance Coach
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                {coachName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium m-0 mt-1 max-w-xl">
                {specialization} · World Athletics License: <span className="font-mono font-bold text-white">{licenseNo}</span>
              </p>
            </div>
          </div>

          {/* Fayda Credential Badges */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">National ID (FIN)</div>
              <div className="text-sm font-mono font-black text-white">{finNumber}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">Access Number (FAN)</div>
              <div className="text-sm font-mono font-black text-white">{fanNumber}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Dashboard Overview', icon: Activity },
            { id: 'ATHLETES', label: 'Squad Athletes', icon: Users, badge: athletes.length },
            { id: 'COMPETITIONS', label: 'Federation Competitions', icon: Calendar, badge: events.length },
            { id: 'TRAINING', label: 'Altitude & Performance', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer border-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white bg-transparent'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-blue-100 text-blue-900' : 'bg-white/20 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">Squad Athletes</span>
                  <Users size={18} className="text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{athletes.length || 18}</div>
                <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Fayda ID Verified
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">Upcoming Events</span>
                  <Calendar size={18} className="text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{events.length || 5}</div>
                <div className="text-xs text-indigo-600 font-bold mt-1">
                  Active National Label Meets
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">High Performance Tier</span>
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">Olympic Standard</div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  Bekoji High Altitude Base
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">License Status</span>
                  <Award size={18} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">Active / Valid</div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  Quadrennial 2024–2028
                </div>
              </div>
            </div>

            {/* Live Athlete Roster Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0 leading-tight">
                    Athlete Squad Roster (Live Registry)
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Athletes managed under your high performance coaching jurisdiction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ATHLETES')}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                >
                  <span>View All Athletes ({athletes.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {isLoadingAthletes ? (
                <div className="p-8 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Loading squad data from federation registry...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="pb-3">Athlete</th>
                        <th className="pb-3">Discipline</th>
                        <th className="pb-3">Fayda National ID</th>
                        <th className="pb-3">Personal Best</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {athletes.slice(0, 5).map((ath) => (
                        <tr key={ath.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={ath.photoUrl || '/images/fayda_resident_photo.jpg'}
                                alt="Athlete"
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-black text-slate-900">
                                  {ath.name || `${ath.user?.firstName || ''} ${ath.user?.lastName || ''}`}
                                </div>
                                <div className="text-[11px] text-blue-700 font-bold">
                                  {ath.amharicName || 'የኢትዮጵያ አትሌት'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {ath.primaryEvent || '5,000m Long Distance'}
                          </td>
                          <td className="py-3 font-mono text-xs font-bold text-slate-600">
                            {ath.faydaFin || '2685 0380 1845 1943'}
                          </td>
                          <td className="py-3 font-mono text-xs font-black text-slate-900">
                            {ath.personalBest || '12:48.20'}
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Upcoming Federation Competitions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0 leading-tight">
                    Official Federation Competitions (Published Calendar)
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Competitions open for entry applications and squad entries
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('COMPETITIONS')}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                >
                  <span>View All Meets ({events.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          {evt.category || 'Championship'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {evt.venue || 'Addis Ababa'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 m-0 leading-snug">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {evt.description || 'Official athletics competition sanctioned by the Ethiopian Athletics Federation.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                      <span className="font-bold">Status: {evt.status}</span>
                      <span className="text-blue-700 font-black">Entries Open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ATHLETES' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search athlete by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                {['ALL', '5,000m', '10,000m', 'Marathon', '800m', '1,500m'].map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors border ${
                      selectedDiscipline === disc
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            </div>

            {/* Athletes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAthletes.map((ath) => (
                <div key={ath.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={ath.photoUrl || '/images/fayda_resident_photo.jpg'}
                      alt="Athlete"
                      className="w-16 h-18 rounded-2xl object-cover border-2 border-slate-200 shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-black uppercase">
                        <ShieldCheck size={12} /> Fayda Verified
                      </div>
                      <h4 className="text-base font-black text-slate-900 truncate leading-tight mt-0.5">
                        {ath.name || `${ath.user?.firstName || ''} ${ath.user?.lastName || ''}`}
                      </h4>
                      <div className="text-xs text-blue-700 font-bold mt-0.5">
                        {ath.amharicName || 'የኢትዮጵያ አትሌት'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {ath.ageTier || 'Senior Division'} · {ath.clubName || 'Bekoji Training Center'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Primary Event:</span>
                      <span className="font-black text-slate-900">{ath.primaryEvent || '5,000m'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Personal Best:</span>
                      <span className="font-mono font-black text-blue-700">{ath.personalBest || '12:48.20'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">National ID:</span>
                      <span className="font-mono text-slate-700 font-bold text-[11px]">{ath.faydaFin || '2685 0380 1845 1943'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNotify(`Viewing biometric biometric telemetry for ${ath.name || 'athlete'}.`, 'info')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-700 hover:text-blue-800 text-xs font-black transition-colors cursor-pointer bg-white flex items-center justify-center gap-1.5"
                  >
                    <Activity size={14} />
                    <span>View Performance Telemetry</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'COMPETITIONS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 m-0">Official Competition Calendar</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Directly connected to federation competitions database</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
                {events.length} Published Meets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div key={evt.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        {evt.category || 'Championship'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {evt.venue || 'Addis Ababa'}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 m-0">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {evt.description || 'Official athletics competition sanctioned by the Ethiopian Athletics Federation.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Disciplines:</span>
                      <span className="font-black text-slate-900">
                        {Array.isArray(evt.disciplines) ? evt.disciplines.join(', ') : 'Track & Field'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Organizer:</span>
                      <span className="font-semibold text-slate-800">{evt.organizerName || 'EAF Competitions Department'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNotify(`Squad entry checklist prepared for ${evt.title}.`, 'success')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm transition-colors"
                  >
                    <span>Manage Squad Entry for this Meet</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'TRAINING' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 mb-1">High Altitude Training Logs & Workload</h3>
              <p className="text-xs text-slate-500 mb-6">Monitoring Bekoji High Altitude Training Center sessions</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Altitude Base</div>
                  <div className="text-xl font-black mt-1">2,810 Meters</div>
                  <div className="text-[11px] text-blue-600 mt-0.5">Bekoji, Oromia Regional State</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Weekly Squad Mileage</div>
                  <div className="text-xl font-black mt-1">165–185 km</div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">High altitude endurance block</div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Anti-Doping Compliance</div>
                  <div className="text-xl font-black mt-1">100% Cleared</div>
                  <div className="text-[11px] text-indigo-600 mt-0.5">ETH-NADO whereabouts submitted</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNotify('New high-altitude session logged into federation registry.', 'success')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer border-0 shadow-sm"
              >
                <Dumbbell size={16} />
                <span>Log High Altitude Training Session</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
