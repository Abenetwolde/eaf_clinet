import React, { useState, useEffect } from 'react';
import {
  Users, Trophy, UserPlus, X, Calendar, ShieldCheck, Award, Activity, Search,
  ArrowRight, Phone, Mail, MapPin, CheckCircle2, ChevronRight,
  TrendingUp, Clock, Filter, LogOut, RefreshCw, AlertCircle, Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useInitiateFaydaMutation, useConfirmFaydaOtpMutation } from '../../store/api/authApi';
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

  // Coach athlete registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [faydaFin, setFaydaFin] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [faydaVerifiedData, setFaydaVerifiedData] = useState<any>(null);
  const [faydaLoading, setFaydaLoading] = useState(false);
  const [faydaError, setFaydaError] = useState("");
  const [faydaVerificationId, setFaydaVerificationId] = useState("");
  const [regEvent, setRegEvent] = useState("");
  const [regWeight, setRegWeight] = useState("");
  const [regHeight, setRegHeight] = useState("");

  const [initiateFayda] = useInitiateFaydaMutation();
  const [confirmFaydaOtp] = useConfirmFaydaOtpMutation();

  const handleInitiateFayda = async () => {
    const cleanNin = faydaFin.replace(/\D/g, "");
    if (!cleanNin || cleanNin.length < 8) {
      setFaydaError("Please enter a valid Fayda National ID (at least 8 digits)");
      return;
    }
    setFaydaError("");
    setFaydaLoading(true);
    try {
      const res = await initiateFayda({ nin: cleanNin }).unwrap();
      if (res.data?.verificationId) {
        setFaydaVerificationId(res.data.verificationId);
        if (res.data.otp) setOtpValue(res.data.otp);
        setOtpStep(true);
      }
    } catch (err: any) {
      setFaydaError(err?.data?.message || "Fayda verification could not be started. Please try again.");
    } finally {
      setFaydaLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpValue) {
      setFaydaError("Please enter OTP code");
      return;
    }
    setFaydaError("");
    setFaydaLoading(true);
    try {
      const cleanNin = faydaFin.replace(/\D/g, "");
      const res = await confirmFaydaOtp({ verificationId: faydaVerificationId, otp: otpValue }).unwrap();
      const identity: any = res.data?.identity || res.data?.userInfo;
      const token = res.data?.verificationToken;
      if (!identity || !token) throw new Error("Fayda did not return a verified identity token.");

      const dob = identity.birthDate || identity.dob;
      if (!dob || !(identity.fullName || identity.name) || !identity.gender) throw new Error("Fayda returned incomplete identity details.");
      const birthYear = parseInt(dob.substring(0, 4));
      const age = new Date().getFullYear() - birthYear;
      const tier = age <= 16 ? "U16 Junior" : age <= 18 ? "U18 Youth" : age <= 20 ? "U20 Junior" : "Senior Division";

      setFaydaVerifiedData({
        fin: cleanNin,
        fullName: identity.fullName || identity.name,
        amharicName: identity.fullNameAmharic || identity.amharic || "",
        dob,
        ageTier: tier,
        photoUrl: identity.picture || identity.photoUrl || "",
        gender: identity.gender,
      });
      setOtpStep(false);
    } catch (err: any) {
      setFaydaError("Failed to verify OTP code.");
    } finally {
      setFaydaLoading(false);
    }
  };

  const handleEnrollAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faydaVerifiedData) return;
    onNotify("Use the club member registration workflow to add an athlete with verified Fayda and complete contact details.", "info");
  };

  // Real API: Fetch athletes from backend
  const { data: athletes = [], isLoading: isLoadingAthletes } = useGetAthletesQuery();

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
    : coachProfile?.name || 'Not recorded';

  const licenseNo = coachProfile?.licenseNumber || 'Not recorded';
  const specialization = coachProfile?.specialization || 'Not recorded';
  const finNumber = coachProfile?.user?.faydaIdentity?.nin || coachProfile?.faydaFin || 'Not recorded';
  const fanNumber = coachProfile?.user?.faydaIdentity?.fanNumber || coachProfile?.faydaFan || 'Not provided';

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
              {(coachName || 'U').split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {coachName}
              </div>
              <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <ShieldCheck size={11} className="text-blue-600" /> License not recorded
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
                src={coachProfile?.photoUrl || ''}
                alt="Coach Portrait"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-300/40 text-[11px] font-black text-blue-100 mb-1.5 backdrop-blur-xs">
                <ShieldCheck size={12} className="text-emerald-400" /> {coachProfile?.faydaStatus === 'VERIFIED' ? 'Fayda verified coach' : 'Fayda verification not recorded'}
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
                <div className="text-2xl font-black text-slate-900">{athletes.length}</div>
                <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  {athletes.filter((item: any) => item.faydaVerified).length} Fayda verified
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">Upcoming Events</span>
                  <Calendar size={18} className="text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{events.length}</div>
                <div className="text-xs text-indigo-600 font-bold mt-1">
                  Published events returned by the federation
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">High Performance Tier</span>
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">Not recorded</div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  Training center not recorded
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">License Status</span>
                  <Award size={18} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{licenseNo}</div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  License validity not recorded
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
                                src={ath.photoUrl || ''}
                                alt="Athlete"
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-black text-slate-900">
                                  {ath.name || `${ath.user?.firstName || ''} ${ath.user?.lastName || ''}`}
                                </div>
                                <div className="text-[11px] text-blue-700 font-bold">
                                  {ath.amharicName || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {ath.primaryEvent || 'Not recorded'}
                          </td>
                          <td className="py-3 font-mono text-xs font-bold text-slate-600">
                            {ath.faydaFin || 'Not recorded'}
                          </td>
                          <td className="py-3 font-mono text-xs font-black text-slate-900">
                            {ath.personalBest || 'Not recorded'}
                          </td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${ath.faydaVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                              {ath.faydaVerified ? 'FAYDA VERIFIED' : 'NOT VERIFIED'}
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
                          {evt.category || 'Category not recorded'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {evt.venue || 'Venue not recorded'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 m-0 leading-snug">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {evt.description || 'No event description is recorded.'}
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
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
                >
                  <UserPlus size={15} />
                  Register Athlete
                </button>
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
                      src={ath.photoUrl || ''}
                      alt="Athlete"
                      className="w-16 h-18 rounded-2xl object-cover border-2 border-slate-200 shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-black uppercase">
                        {ath.faydaVerified && <><ShieldCheck size={12} /> Fayda Verified</>}
                      </div>
                      <h4 className="text-base font-black text-slate-900 truncate leading-tight mt-0.5">
                        {ath.name || `${ath.user?.firstName || ''} ${ath.user?.lastName || ''}`}
                      </h4>
                      <div className="text-xs text-blue-700 font-bold mt-0.5">
                        {ath.amharicName || ''}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {ath.ageTier || 'Age category not recorded'} · {ath.clubName || 'Club not recorded'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Primary Event:</span>
                      <span className="font-black text-slate-900">{ath.primaryEvent || 'Not recorded'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Personal Best:</span>
                      <span className="font-mono font-black text-blue-700">{ath.personalBest || 'Not recorded'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">National ID:</span>
                      <span className="font-mono text-slate-700 font-bold text-[11px]">{ath.faydaFin || 'Not recorded'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNotify('Performance telemetry is not available in the current athlete record.', 'info')}
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
                        {evt.category || 'Category not recorded'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {evt.venue || 'Venue not recorded'}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 m-0">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {evt.description || 'No event description is recorded.'}
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
              <p className="text-xs text-slate-500 mb-6">Training logs are available when the backend training record service is configured.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Altitude Base</div>
                  <div className="text-xl font-black mt-1">Not recorded</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Weekly Squad Mileage</div>
                  <div className="text-xl font-black mt-1">Not recorded</div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Anti-Doping Compliance</div>
                  <div className="text-xl font-black mt-1">No records available</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNotify('Training log storage is not configured. No session was saved.', 'error')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer border-0 shadow-sm"
              >
                <Dumbbell size={16} />
                <span>Log High Altitude Training Session</span>
              </button>
            </div>
          </div>
        )}
      </main>
          {/* Coach Register Athlete Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Register Club Athlete</h3>
                  <p className="text-xs text-slate-500 font-semibold">Verified biometric onboarding via Fayda National ID</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowRegisterModal(false); setFaydaVerifiedData(null); setOtpStep(false); }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-0"
                >
                  <X size={16} />
                </button>
              </div>

              {faydaError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {faydaError}
                </div>
              )}

              {!faydaVerifiedData ? (
                <div className="space-y-4">
                  {!otpStep ? (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Fayda National ID Number (FIN / NIN) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={faydaFin}
                          onChange={(e) => setFaydaFin(e.target.value)}
                          placeholder="e.g. 2685-0380-1845-1943"
                          className="flex-1 p-3 border border-slate-300 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleInitiateFayda}
                          disabled={faydaLoading || faydaFin.length < 8}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl border-0 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {faydaLoading ? "Verifying..." : "Verify ID"}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Enter the athlete's 12 to 16 digit National ID to authenticate via the National ID Program API.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/60 border border-emerald-300 rounded-2xl p-4 space-y-3">
                      <div className="text-xs font-extrabold text-emerald-900">
                        Enter 6-Digit OTP Sent to Athlete Mobile
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.slice(0, 6))}
                          placeholder="111111"
                          maxLength={6}
                          className="flex-1 p-3 border border-emerald-300 rounded-xl font-mono text-center text-lg font-black tracking-widest bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmOtp}
                          disabled={faydaLoading || otpValue.length < 4}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl border-0 cursor-pointer shadow-xs"
                        >
                          {faydaLoading ? "Confirming..." : "Confirm OTP"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEnrollAthlete} className="space-y-4">
                  {/* Verified Identity Card */}
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-4">
                    <img
                      src={faydaVerifiedData.photoUrl || "/images/profile-placeholder.svg"}
                      alt="Verified"
                      className="w-14 h-16 rounded-xl object-cover border border-emerald-300 bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-emerald-800 text-[10px] font-black uppercase">
                        {ath.faydaVerified && <><ShieldCheck size={12} /> Fayda Verified</>} Resident
                      </div>
                      <div className="font-black text-sm text-slate-900 truncate mt-0.5">
                        {faydaVerifiedData.fullName}
                      </div>
                      <div className="text-xs font-bold text-blue-800">
                        {faydaVerifiedData.amharicName}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        DOB: {faydaVerifiedData.dob} · Tier: <strong>{faydaVerifiedData.ageTier}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Sports Specialization */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                      Primary Discipline *
                    </label>
                    <select
                      value={regEvent}
                      onChange={(e) => setRegEvent(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
                    >
                      <option value="5,000m">5,000m Long Distance</option>
                      <option value="10,000m">10,000m Track</option>
                      <option value="1,500m">1,500m Middle Distance</option>
                      <option value="800m">800m Middle Distance</option>
                      <option value="3,000m Steeplechase">3,000m Steeplechase</option>
                      <option value="Half Marathon">Half Marathon</option>
                      <option value="Marathon">Full Marathon (42.195km)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={regWeight}
                        onChange={(e) => setRegWeight(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={regHeight}
                        onChange={(e) => setRegHeight(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFaydaVerifiedData(null)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-extrabold text-xs bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                      Re-verify
                    </button>
                    <button
                      type="submit"
                      disabled={faydaLoading}
                      className="flex-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-sm border-0"
                    >
                      {faydaLoading ? "Enrolling..." : "Complete Club Enrollment"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
