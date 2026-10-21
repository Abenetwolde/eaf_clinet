import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Navigation, Activity, Award, ArrowRight,
  Weight, TrendingUp, Calendar, Plus, Trash2, Edit3, Save, Trophy,
  Medal, MapPin, Flag, QrCode, CheckCircle2, Clock, Sparkles,
  Heart, Zap, BarChart3, Flame, ChevronRight, Download, Printer,
  FileText, Check, Copy, User, Lock, ExternalLink
} from 'lucide-react';
import type { Athlete } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { useGetAthleteDashboardQuery, useGetAthletePersonalBestsQuery, useGetAthleteTrainingLogsQuery, useGetAthleteWeightLogsQuery, useGetMyAthleteResultsQuery, useUpdateAthleteProfileMutation, useCreateAthletePersonalBestMutation, useCreateAthleteTrainingLogMutation, useCreateAthleteWeightLogMutation } from '../../store/api/athleteApi';
import LicenseQrCode from './LicenseQrCode';
import { getProfilePhotoUrl } from '../../utils/profilePhoto';

interface AthleteOverviewProps {
  onChangeSubPage: (page: string) => void;
  onPayLicense: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteOverview({ onChangeSubPage, onPayLicense, onUpdateAthlete, onNotify }: AthleteOverviewProps) {
  const rawAthlete = useAppSelector((state) => state.auth.athlete);
  const { data: dashboard } = useGetAthleteDashboardQuery();
  const { data: personalBests = { allTime: [], season: [] } } = useGetAthletePersonalBestsQuery();
  const { data: trainingLogs = [] } = useGetAthleteTrainingLogsQuery();
  const { data: weightLogs = [] } = useGetAthleteWeightLogsQuery();
  const { data: recordedResults = [] } = useGetMyAthleteResultsQuery();
  const [updateProfile] = useUpdateAthleteProfileMutation();
  const [createPersonalBest] = useCreateAthletePersonalBestMutation();
  const [createTrainingLog] = useCreateAthleteTrainingLogMutation();
  const [createWeightLog] = useCreateAthleteWeightLogMutation();
  const athlete = dashboard ? {
    ...rawAthlete,
    id: dashboard.id,
    name: dashboard.name,
    dob: dashboard.dateOfBirth,
    gender: dashboard.gender,
    ageTier: dashboard.ageTier,
    photoUrl: getProfilePhotoUrl({ photoUrl: dashboard.photoUrl, picture: dashboard.user?.picture, faydaFin: dashboard.user?.faydaIdentity?.nin || rawAthlete?.faydaFin }) || rawAthlete?.photoUrl || '',
    clubId: dashboard.clubId || undefined,
    clubName: dashboard.clubName || undefined,
    region: dashboard.region || undefined,
    faydaFin: dashboard.user?.faydaIdentity?.nin || rawAthlete?.faydaFin,
    weight: dashboard.fitnessStats?.weightKg ?? undefined,
    height: dashboard.fitnessStats?.heightCm ?? undefined,
    personalBests: [...(personalBests.allTime || []), ...(personalBests.season || [])].map((pb: any) => ({ event: pb.event, mark: pb.mark, time: pb.mark, date: pb.date || undefined, venue: pb.venue || undefined })),
    trainingLog: trainingLogs.map((log: any) => ({ date: log.date, type: log.type, distance: log.distanceKm, duration: `${log.durationMinutes} min`, notes: log.notes || '' })),
    weightLog: weightLogs.map((log: any) => ({ date: log.date, kg: log.weightKg })),
  } as Athlete : rawAthlete;

  const [activeTab, setActiveTab] = useState('overview');
  const [copiedFin, setCopiedFin] = useState(false);

  // Weight log entry
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Training log entry
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [trainType, setTrainType] = useState('Easy Run');
  const [trainDist, setTrainDist] = useState('');
  const [trainDur, setTrainDur] = useState('');
  const [trainNotes, setTrainNotes] = useState('');
  const [trainDate, setTrainDate] = useState(new Date().toISOString().split('T')[0]);

  // PB entry
  const [showAddPb, setShowAddPb] = useState(false);
  const [pbEvent, setPbEvent] = useState('5,000m');
  const [pbTime, setPbTime] = useState('');
  const [pbDate, setPbDate] = useState(new Date().toISOString().split('T')[0]);
  const [pbVenue, setPbVenue] = useState('');

  // Body stats edit
  const [editingStats, setEditingStats] = useState(false);
  const [editWeight, setEditWeight] = useState<string | number>(athlete?.weight ?? '');
  const [editHeight, setEditHeight] = useState<string | number>(athlete?.height ?? '');

  useEffect(() => {
    if (athlete) {
      setEditWeight(athlete.weight ?? '');
      setEditHeight(athlete.height ?? '');
    }
  }, [athlete?.id, athlete?.weight, athlete?.height, athlete?.restingHR]);

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;
    try {
      await createWeightLog({ date: newWeightDate, weightKg: w }).unwrap();
      onNotify('Weight entry saved.', 'success');
      setNewWeight('');
    } catch (error: any) { onNotify(error?.data?.message || 'Weight entry could not be saved.', 'error'); }
  };

  const handleAddTraining = async () => {
    const d = parseFloat(trainDist);
    if (isNaN(d) || !trainDur) return;
    const durationMinutes = Number(trainDur);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 0) { onNotify('Enter workout duration in whole minutes.', 'error'); return; }
    try {
      await createTrainingLog({ date: trainDate, type: trainType, distanceKm: d, durationMinutes, notes: trainNotes }).unwrap();
      onNotify('Training session saved.', 'success');
      setShowAddTraining(false); setTrainDist(''); setTrainDur(''); setTrainNotes('');
    } catch (error: any) { onNotify(error?.data?.message || 'Training session could not be saved.', 'error'); }
  };

  const handleAddPb = async () => {
    if (!pbTime.trim()) return;
    try {
      await createPersonalBest({ event: pbEvent, mark: pbTime.trim(), date: pbDate, venue: pbVenue.trim() }).unwrap();
      onNotify('Performance record saved.', 'success');
      setShowAddPb(false); setPbTime(''); setPbVenue('');
    } catch (error: any) { onNotify(error?.data?.message || 'Performance record could not be saved.', 'error'); }
  };

  const handleSaveStats = async () => {
    const w = parseFloat(String(editWeight));
    const h = parseFloat(String(editHeight));
    const body: Record<string, number> = {};
    if (Number.isFinite(w) && w > 0) body.weight = w;
    if (Number.isFinite(h) && h > 0) body.height = h;
    if (!Object.keys(body).length) { onNotify('Enter a valid height or weight.', 'error'); return; }
    try {
      await updateProfile(body).unwrap();
      onUpdateAthlete({ ...athlete, ...body });
      onNotify('Profile measurements saved.', 'success');
      setEditingStats(false);
    } catch (error: any) { onNotify(error?.data?.message || 'Profile measurements could not be saved.', 'error'); }
  };

  const handleCopyFin = () => {
    if (!athlete?.faydaFin) return;
    navigator.clipboard.writeText(athlete.faydaFin);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
  };

  // BMI Calculation
  const numW = typeof athlete?.weight === 'number' && athlete.weight > 0 ? athlete.weight : null;
  const numH = typeof athlete?.height === 'number' && athlete.height > 0 ? athlete.height : null;
  const bmiCalc = numW && numH ? numW / Math.pow(numH / 100, 2) : null;
  const bmi = bmiCalc && isFinite(bmiCalc) ? bmiCalc.toFixed(1) : null;

  const competitionHistory = recordedResults.map((result: any, index: number) => ({
    meetId: result.resultId || String(index),
    meetTitle: result.eventTitle || 'Untitled event',
    meetDate: result.date || 'Not recorded',
    meetVenue: result.venue || 'Not recorded',
    discipline: result.discipline || 'Not recorded',
    pos: Number(result.rank) || 0,
    time: result.performance || '',
    pb: false,
    sb: false,
    totalAthletes: 0,
  }));
  const totalRaces = competitionHistory.length;
  const goldCount = competitionHistory.filter(r => r.pos === 1).length;
  const silverCount = competitionHistory.filter(r => r.pos === 2).length;
  const bronzeCount = competitionHistory.filter(r => r.pos === 3).length;
  const medalCount = goldCount + silverCount + bronzeCount;
  const placements = competitionHistory.map((r) => r.pos).filter((position) => position > 0);
  const bestPos = placements.length > 0 ? Math.min(...placements) : null;

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    // { id: 'competitions', label: `Competition History (${totalRaces})`, icon: Trophy },
    { id: 'pbs', label: `Personal Bests (${(athlete?.personalBests || []).length})`, icon: Zap },
    { id: 'weight', label: `Weight & Body (${(athlete?.weightLog || []).length})`, icon: Weight },
    { id: 'training', label: `Training Log (${(athlete?.trainingLog || []).length})`, icon: Flame },
  ];

  return (
    <div className="space-y-6">

      {/* ── 1. Desktop Executive Profile Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071C3D] via-[#012E7A] to-[#0140A7] p-6 sm:p-8 text-white shadow-lg border border-white/10">
        {/* Subtle geometric watermark rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Left: Athlete Biometric Photo & Identity */}
          <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
            {/* Passport Photo Frame with Biometric Verified Badge */}
            <div className="relative shrink-0">
              <img
                src={getProfilePhotoUrl({ photoUrl: athlete.photoUrl, faydaFin: athlete.faydaFin }) || '/images/profile-placeholder.svg'}
                alt={athlete.name}
                className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-4 border-white/90 shadow-xl bg-slate-800"
              />
              <div className={`absolute -bottom-2 -right-2 ${dashboard?.faydaVerified ? 'bg-emerald-500' : 'bg-slate-500'} text-white rounded-full p-1 border-2 border-white shadow-md`} title={dashboard?.faydaVerified ? "Fayda identity verified" : "Fayda verification not recorded"}>
                <CheckCircle2 size={16} />
              </div>
            </div>

            {/* Names & Metadata Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> {dashboard?.faydaVerified ? 'Fayda verified' : 'Fayda verification not recorded'}
                </span>
                {/* <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[0.72rem] font-black px-2.5 py-0.5 rounded-full">
                  🏅 {athlete.ageTier || 'Not recorded'}
                </span>
                <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                  🇪🇹 Ethiopian Athletics
                </span> */}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                {athlete.name}
              </h1>
              <div className="text-lg sm:text-xl font-extrabold text-[#FCD34D] tracking-wide">
                {athlete.amharicName || '—'}
              </div>

              <div className="flex items-center gap-3 text-[0.82rem] text-slate-200/90 flex-wrap pt-0.5 font-medium">
                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                  🏛️ <strong className="text-white">{athlete.clubName || 'Not recorded'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                  🏃 <strong className="text-white">{athlete.primaryEvent}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  FIN: <strong className="font-mono text-[#FCD34D] font-bold">{athlete.faydaFin || 'Not provided'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  FAN: <strong className="font-mono text-emerald-300 font-bold">{athlete.faydaFan || 'Not provided'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: License Status & Primary Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 w-full sm:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
            {athlete.licenseStatus !== 'ACTIVE' ? (
              <div className="space-y-2 w-full sm:w-auto text-left lg:text-right">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[0.75rem] font-extrabold px-3 py-1 rounded-lg">
                  <Clock size={13} className="animate-spin" /> License Pending Activation
                </div>
                <div>
                  <button
                    onClick={() => onPayLicense(athlete)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#E6A500] to-[#C98F00] text-slate-950 font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap size={16} /> Renew Annual License — 500 ETB
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-left lg:text-right">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[0.78rem] font-black px-3 py-1 rounded-lg">
                  <CheckCircle2 size={14} /> License Active • {athlete.licenseNumber}
                </div>
                <div className="text-[0.74rem] text-slate-300">Valid Through: Dec 31, 2026</div>
                <div className="pt-1">
                  <LicenseQrCode athlete={athlete} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 2. Modern Desktop Segmented Tab Navigation ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm scrollbar-hide">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border-none cursor-pointer font-extrabold text-[0.84rem] whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. OVERVIEW TAB: Desktop Two-Column Layout ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT / MAIN COLUMN (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Body & Fitness Health Strip */}
            <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-rose-500" />
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                    Physical Biometrics & Physiological Metrics
                  </h3>
                </div>
                <button
                  onClick={() => setEditingStats(!editingStats)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-primary hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {editingStats ? <><Save size={13} /> Save</> : <><Edit3 size={13} /> Edit Stats</>}
                </button>
              </div>

              {editingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="form-group mb-0">
                    <label className="form-label text-[0.76rem]">Weight (kg)</label>
                    <input className="form-input text-sm" type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-[0.76rem]">Height (cm)</label>
                    <input className="form-input text-sm" type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} />
                  </div>
                  <button className="btn-gov-primary sm:col-span-2 p-2.5 font-bold text-xs mt-1" onClick={handleSaveStats}>
                    <Save size={14} /> Update Metrics
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Weight</div>
                    <div className="text-2xl font-black text-primary dark:text-sky-400 mt-1">
                      {athlete.weight ?? 'Not recorded'} {typeof athlete.weight === 'number' && <span className="text-xs font-semibold text-slate-500">kg</span>}
                    </div>
                    <div className="text-[0.7rem] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      BMI: {bmi || 'Not calculated'}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Height</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
                      {athlete.height ?? 'Not recorded'} {typeof athlete.height === 'number' && <span className="text-xs font-semibold text-slate-500">cm</span>}
                    </div>
                    <div className="text-[0.7rem] text-slate-500 font-semibold mt-1">
                      Self-reported measurement
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Career Performance Highlights Strip */}
            <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white m-0">
                    Championship Performance Record
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('competitions')}
                  className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  Full History <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white flex items-center justify-center gap-1.5">
                    <span>🥇</span> <span>{goldCount}</span>
                  </div>
                  <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 mt-1">1st Place Finishes</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white flex items-center justify-center gap-1.5">
                    <span>🥈</span> <span>{silverCount}</span>
                  </div>
                  <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 mt-1">2nd Place Finishes</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white flex items-center justify-center gap-1.5">
                    <span>🥉</span> <span>{bronzeCount}</span>
                  </div>
                  <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 mt-1">Podium Finishes</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-black text-primary dark:text-sky-400">
                    {totalRaces}
                  </div>
                  <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 mt-1">Certified EAF Meets</div>
                </div>
              </div>
            </div>

            {/* Desktop Portal Management Modules Grid (Commented out per user request) */}
            {/*
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Portal Management Modules • የአትሌት አገልግሎቶች
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { page: 'RECORDS', icon: Award, title: 'Career Records Vault', desc: 'Personal bests, verified split breakdowns, and official World Athletics achievements.' },
                  { page: 'EVENTS', icon: Calendar, title: 'Competitions & Events', desc: 'Browse upcoming federation trials, heat start lists, and apply for entries.' },
                  { page: 'CHECKIN', icon: Navigation, title: 'Venue GPS Check-In', desc: 'Race-day arrival geofence verification linked to Fayda National ID.' },
                  { page: 'RACES', icon: Activity, title: 'Live Race Tracker', desc: 'Real-time heat splits, lap pacing, and World Athletics digital achievements.' },
                  { page: 'RESULTS', icon: Trophy, title: 'Event Results', desc: 'Official published podium times and standings across all EAF championships.' },
                  { page: 'APPLIED', icon: FileText, title: 'My Registrations', desc: 'Track pending event entry applications and bib assignment statuses.' },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.page}
                      onClick={() => onChangeSubPage(c.page)}
                      className="group bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-primary/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-primary dark:text-sky-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200 shadow-sm">
                            <Icon size={19} />
                          </div>
                          <ArrowRight size={16} className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-1.5 group-hover:text-primary transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            */}

          </div>

          {/* ── RIGHT / SIDEBAR COLUMN (4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Athlete profile card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#06152B] via-[#0A2540] to-[#0F172A] p-5 text-white shadow-2xl border border-amber-500/30 relative overflow-hidden">
              {/* Background watermark hologram & gradient accent */}
              <div className="pointer-events-none absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-gradient-to-br from-amber-500/10 to-emerald-500/10 blur-2xl" />
              <div className="pointer-events-none absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400" />

              {/* Card Header Banner */}
              <div className="flex justify-between items-center pb-3 mb-3.5 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <img src="/images/logo.jpeg" alt="EAF" className="w-6 h-6 rounded-md object-cover border border-white/20" />
                  <div>
                    <div className="text-[0.62rem] font-black text-[#FCD34D] tracking-widest uppercase leading-tight">
                      ETHIOPIAN ATHLETICS FEDERATION
                    </div>
                    <div className="text-[0.72rem] font-extrabold text-white leading-tight">
                      NATIONAL ATHLETE DIGITAL ID
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[0.62rem] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> {dashboard?.faydaVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                </span>
              </div>

              {/* Card Body: Athlete Photo + Details + Embedded Verification QR */}
              <div className="flex items-start gap-3.5">
                {/* Athlete Portrait Photo */}
                <div className="relative shrink-0">
                  <img
                    src={getProfilePhotoUrl({ photoUrl: athlete.photoUrl, faydaFin: athlete.faydaFin }) || '/images/profile-placeholder.svg'}
                    alt={athlete.name}
                    className="w-16 h-20 rounded-xl object-cover border-2 border-amber-400/80 shadow-md bg-slate-800"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[0.58rem] px-1 rounded border border-white">
                    {athlete.ageTier || '—'}
                  </div>
                </div>

                {/* ID Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-black text-white truncate leading-tight">{athlete.name}</div>
                  <div className="text-[0.75rem] font-bold text-amber-300 truncate">{athlete.amharicName || '—'}</div>
                  
                  <div className="text-[0.7rem] text-slate-300 pt-0.5 space-y-0.5">
                    <div>Event: <strong className="text-white">{athlete.primaryEvent}</strong></div>
                    <div>Club: <strong className="text-white">{athlete.clubName || 'Not recorded'}</strong></div>
                    <div className="flex items-center gap-1">
                      FIN: <strong className="text-[#FCD34D] font-mono text-[0.72rem]">{athlete.faydaFin || 'Not provided'}</strong>
                      <button
                        onClick={handleCopyFin}
                        title="Copy FIN"
                        className="text-slate-300 hover:text-white bg-white/10 p-0.5 rounded border-none cursor-pointer"
                      >
                        {copiedFin ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      FAN: <strong className="text-emerald-300 font-mono text-[0.72rem]">{athlete.faydaFan || 'Not provided'}</strong>
                    </div>
                  </div>
                </div>

                {/* Small Security Verification QR Thumbnail */}
                <div className="shrink-0 bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm flex flex-col items-center">
                  <QrCode size={38} className="text-slate-950" />
                  <span className="text-[0.55rem] font-extrabold text-slate-700 mt-0.5">ID</span>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-3.5 pt-2.5 border-t border-white/15 flex justify-between items-center text-[0.68rem] text-slate-300">
                <span>LIC: <strong className="font-mono text-white">{athlete.licenseNumber || 'Not recorded'}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> {athlete.licenseStatus === 'ACTIVE' ? 'Active license' : athlete.licenseStatus || 'License status not recorded'}
                </span>
              </div>
            </div>

            {/* 2. Upcoming National Championships Widget (Commented out per user request) */}
            {/*
            <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Upcoming Meet • ቀጣይ ውድድር
                </div>
                <span className="bg-primary/10 text-primary text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full">
                  In 18 Days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="font-extrabold text-sm text-[#0F172A] dark:text-white">
                  2026 Ethiopian National Track & Field Trials
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={12} /> May 14–18, 2026</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> Addis Ababa Stadium</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onChangeSubPage('EVENTS')}
                    className="w-full py-2 rounded-lg bg-primary text-white font-bold text-xs border-none cursor-pointer hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Meet Details & Heats <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
            */}

            {/* 3. Federation Compliance & Clearances */}
            <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Regulatory Clearance • ህጋዊ ፍቃዶች
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Anti-Doping Record
                  </span>
                  <span className="font-extrabold">Not recorded</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Fayda Biometrics
                  </span>
                  <span className="font-extrabold">{dashboard?.faydaVerified ? 'Verified' : 'Not verified'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-purple-800 dark:text-purple-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Award size={14} /> Club Affiliation
                  </span>
                  <span className="font-extrabold">{athlete.clubName || 'No club recorded'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── COMPETITION HISTORY TAB ── */}
      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { label: 'Races Run', value: totalRaces, icon: Flag, color: 'var(--primary)' },
              { label: 'Medals', value: medalCount, icon: Medal, color: '#C8A84B' },
              { label: '🥇 Gold', value: goldCount, icon: Trophy, color: '#C8A84B' },
              { label: '🥈 Silver', value: silverCount, icon: Trophy, color: '#A8B8C8' },
              { label: '🥉 Bronze', value: bronzeCount, icon: Trophy, color: '#C87040' },
              { label: 'Best Finish', value: bestPos ? `#${bestPos}` : '—', icon: TrendingUp, color: 'var(--primary)' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white dark:bg-[#121829] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                  <div className="flex justify-center mb-1">
                    <Icon size={18} color={s.color} />
                  </div>
                  <div className="text-xl font-black text-[#0F172A] dark:text-white" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>

          {competitionHistory.length === 0 ? (
            <div className="bg-white dark:bg-[#121829] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center p-12 text-slate-500">
              <Trophy size={42} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-extrabold text-base text-[#0F172A] dark:text-white mb-1">No competition results recorded</p>
            </div>
          ) : (
            <div className="gov-card overflow-hidden">
              <div className="table-responsive"><table className="gov-table">
                <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Discipline</th><th>Place</th><th>Performance</th></tr></thead>
                <tbody>{competitionHistory.map((result: any) => <tr key={result.meetId}>
                  <td>{result.meetTitle}</td><td>{result.meetDate}</td><td>{result.meetVenue}</td><td>{result.discipline}</td>
                  <td>{result.pos > 0 ? result.pos : 'Not recorded'}</td><td>{result.time || 'Not recorded'}</td>
                </tr>)}</tbody>
              </table></div>
            </div>
          )}
        </div>
      )}

      {/* ── PERSONAL BESTS TAB ── */}
      {activeTab === 'pbs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white m-0">Personal Bests & World Athletics Marks</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Officially verified times across competition meets</p>
            </div>
            <button className="btn-gov-primary px-4 py-2 font-bold text-xs" onClick={() => setShowAddPb(true)}>
              <Plus size={14} /> Add PB Entry
            </button>
          </div>

          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-3.5 bg-primary text-white font-extrabold text-sm">
              All-Time Personal Bests
            </div>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Time / Result</th>
                    <th>Date</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {(athlete.personalBests || []).length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-slate-400 p-8">No personal bests recorded yet</td></tr>
                  ) : (athlete.personalBests || []).map((pb, i) => (
                    <tr key={i}>
                      <td><strong className="text-sm">{pb.event}</strong></td>
                      <td><span className="font-mono font-black text-primary text-base">{pb.time}</span></td>
                      <td className="text-slate-500">{pb.date}</td>
                      <td className="text-slate-500">{pb.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add PB Modal */}
          {showAddPb && (
            <div className="modal-backdrop" onClick={() => setShowAddPb(false)}>
              <div className="modal-content p-7 max-w-[460px]" onClick={e => e.stopPropagation()}>
                <h3 className="font-black text-lg mb-5 text-[#0F172A]">Add Personal Best Entry</h3>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select className="form-select" value={pbEvent} onChange={e => setPbEvent(e.target.value)}>
                    {['100m', '200m', '400m', '800m', '1,500m', '3,000m', '5,000m', '10,000m', 'Half Marathon', 'Marathon', '3,000m Steeplechase', 'Long Jump', 'Triple Jump', 'High Jump', 'Shot Put', 'Discus', 'Javelin'].map(ev => (
                      <option key={ev}>{ev}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time / Mark (e.g. 12:51.44 or 7.98m)</label>
                  <input className="form-input" value={pbTime} onChange={e => setPbTime(e.target.value)} placeholder="12:51.44" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={pbDate} onChange={e => setPbDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue / Competition</label>
                    <input className="form-input" value={pbVenue} onChange={e => setPbVenue(e.target.value)} placeholder="National Championship" />
                  </div>
                </div>
                <div className="flex gap-2.5 mt-3">
                  <button className="btn-gov-secondary flex-1 font-bold text-xs" onClick={() => setShowAddPb(false)}>Cancel</button>
                  <button className="btn-gov-primary flex-[2] font-bold text-xs" onClick={handleAddPb}>Save Record</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEIGHT LOG TAB ── */}
      {activeTab === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="text-base font-extrabold mb-4 text-[#0F172A] dark:text-white">Log Weight Entry</h4>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 58.2" />
            </div>
            <button className="btn-gov-primary w-full py-2.5 font-bold text-xs mt-2" onClick={handleAddWeight}>
              <Plus size={14} /> Log Weight
            </button>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-3.5 bg-primary text-white font-extrabold text-sm">
              Weight History & Trend
            </div>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Date</th><th>Weight (kg)</th><th>Change</th></tr>
                </thead>
                <tbody>
                  {(athlete.weightLog || []).length === 0 ? (
                    <tr><td colSpan={3} className="text-center text-slate-400 p-8">No weight entries logged yet</td></tr>
                  ) : (athlete.weightLog || []).map((entry, i, arr) => {
                    const prev = arr[i + 1];
                    const change = prev ? (entry.kg - prev.kg).toFixed(1) : null;
                    return (
                      <tr key={i}>
                        <td className="font-medium">{entry.date}</td>
                        <td><strong className="font-mono text-primary text-base">{entry.kg} kg</strong></td>
                        <td>
                          {change !== null ? (
                            <span className="font-bold text-xs" style={{ color: parseFloat(change) < 0 ? '#10B981' : parseFloat(change) > 0 ? '#EF4444' : '#64748B' }}>
                              {parseFloat(change) > 0 ? '+' : ''}{change} kg
                            </span>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAINING LOG TAB ── */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white m-0">Training & Workout Sessions</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Track daily mileage, track intervals, and training notes</p>
            </div>
            <button className="btn-gov-primary px-4 py-2 font-bold text-xs" onClick={() => setShowAddTraining(true)}>
              <Plus size={14} /> Log Training Session
            </button>
          </div>

          <div className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Distance</th><th>Duration</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {(athlete.trainingLog || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-slate-400 p-8">No training sessions logged yet</td></tr>
                  ) : (athlete.trainingLog || []).map((s, i) => (
                    <tr key={i}>
                      <td className="font-medium text-slate-600 dark:text-slate-400">{s.date}</td>
                      <td>
                        <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-xs">{s.type}</span>
                      </td>
                      <td><strong className="font-mono text-sm">{s.distance} km</strong></td>
                      <td className="text-slate-600 dark:text-slate-400">{s.duration}</td>
                      <td className="text-xs text-slate-500 max-w-[240px] truncate">{s.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Training Modal */}
          {showAddTraining && (
            <div className="modal-backdrop" onClick={() => setShowAddTraining(false)}>
              <div className="modal-content p-7 max-w-[480px]" onClick={e => e.stopPropagation()}>
                <h3 className="font-black text-lg mb-5 text-[#0F172A]">Log Training Workout</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={trainDate} onChange={e => setTrainDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Session Type</label>
                    <select className="form-select" value={trainType} onChange={e => setTrainType(e.target.value)}>
                      {['Easy Run', 'Long Run', 'Tempo Run', 'Track Work', 'Speed Work', 'Fartlek', 'Hill Repeats', 'Recovery Run', 'Strength & Conditioning'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Distance (km)</label>
                    <input className="form-input" type="number" step="0.1" value={trainDist} onChange={e => setTrainDist(e.target.value)} placeholder="e.g. 16" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input className="form-input" type="number" min="0" step="1" value={trainDur} onChange={e => setTrainDur(e.target.value)} placeholder="Duration in minutes" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Training Notes</label>
                  <textarea className="form-textarea resize-y w-full" rows={2} value={trainNotes} onChange={e => setTrainNotes(e.target.value)} placeholder="e.g. 5×1000m at race pace, feeling strong" />
                </div>
                <div className="flex gap-2.5 mt-3">
                  <button className="btn-gov-secondary flex-1 font-bold text-xs" onClick={() => setShowAddTraining(false)}>Cancel</button>
                  <button className="btn-gov-primary flex-[2] font-bold text-xs" onClick={handleAddTraining}>Save Workout</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
