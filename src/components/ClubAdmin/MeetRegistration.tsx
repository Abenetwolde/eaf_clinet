import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  UserCheck,
  X,
  Users,
  ShieldCheck,
  AlertTriangle,
  Medal,
  Clock,
  Send,
  Search,
  Check,
  ArrowLeft,
  RefreshCw,
  Building2,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useGetMeQuery } from '../../store/api/authApi';
import {
  useGetClubCompetitionsQuery,
  useGetEligibleAthletesForCompetitionQuery,
  useSubmitClubCompetitionApplicationMutation,
  useGetClubApplicationsQuery,
  useGetVerifiedClubsQuery,
  type ClubCompetition,
  type EligibleAthlete,
  type ClubApplication,
} from '../../store/api/clubApi';
import { useGetPublishedResultsQuery } from '../../store/api/athleteApi';
import { getProfilePhotoUrl } from '../../utils/profilePhoto';

interface MeetRegistrationProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialCompetition?: ClubCompetition | null;
  onCloseWizard?: () => void;
}

export default function MeetRegistration({
  onNotify,
  initialCompetition = null,
  onCloseWizard,
}: MeetRegistrationProps) {
  // ── Database Session & Club Resolution ──
  const storedClub = useAppSelector((state) => state.auth.club);
  const user = useAppSelector((state) => state.auth.user);

  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: Boolean(storedClub?.id && storedClub.name),
  });
  const accountClub = meResponse?.data?.club;

  const { data: verifiedClubs = [] } = useGetVerifiedClubsQuery(undefined, {
    skip: Boolean(storedClub?.id || accountClub?.id),
  });

  const club = useMemo(() => {
    if (storedClub?.id && storedClub.name) return storedClub;
    if (accountClub?.id) {
      return {
        id: accountClub.id,
        name: accountClub.name,
        shortName: accountClub.shortName || '',
        region: accountClub.region || '',
        manager: accountClub.manager || '',
        email: accountClub.email || '',
        phone: accountClub.phone || '',
        licensedAthletes: 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: accountClub.logo || '',
        clubRank: 0,
        totalPoints: 0,
      };
    }
    if (verifiedClubs.length > 0) {
      const c = verifiedClubs[0];
      return {
        id: c.id,
        name: c.name,
        shortName: c.shortName || '',
        region: c.region || '',
        manager: c.manager || 'Club Manager',
        email: c.email || '',
        phone: c.phone || '',
        licensedAthletes: c.athleteCount || 0,
        pendingVerifications: 0,
        unlicensedAthletes: 0,
        transfersCount: 0,
        logo: c.logoUrl || '',
        clubRank: 1,
        totalPoints: 0,
      };
    }
    return storedClub;
  }, [storedClub, accountClub, verifiedClubs]);

  const clubId =
    club?.id ||
    accountClub?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('eaf_currentClubId') || '' : '') ||
    '';

  // Tab State: 'competitions' | 'tracking' | 'results'
  const [activeTab, setActiveTab] = useState<'competitions' | 'tracking' | 'results'>('competitions');

  // Queries sourcing live data directly from PostgreSQL / Prisma backend
  const {
    data: competitions = [],
    isLoading: isLoadingCompetitions,
    refetch: refetchCompetitions,
  } = useGetClubCompetitionsQuery(clubId || 'all');

  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useGetClubApplicationsQuery(clubId, { skip: !clubId });

  const { data: rawBackendResults = [] } = useGetPublishedResultsQuery();
  const backendResults = Array.isArray(rawBackendResults)
    ? rawBackendResults
    : (rawBackendResults as any)?.data || [];

  // Submit Mutation
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitClubCompetitionApplicationMutation();

  // ── Enrollment Wizard State (Full-Page View) ──
  const [selectedCompetition, setSelectedCompetition] = useState<ClubCompetition | null>(initialCompetition);
  // 3-Step Wizard: 1: Athlete Selection & Eligibility, 2: Disciplines & Declarations, 3: Review & Submit
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Auto-initiate enrollment if initialCompetition is provided or dispatched via event
  useEffect(() => {
    if (initialCompetition) {
      handleStartEnrollment(initialCompetition);
    }
  }, [initialCompetition]);

  useEffect(() => {
    const handleOpenEnrollmentEvent = (e: any) => {
      const comp = e.detail?.competition;
      if (comp) {
        handleStartEnrollment(comp);
      }
    };
    window.addEventListener('eaf-open-club-enrollment', handleOpenEnrollmentEvent);
    return () => window.removeEventListener('eaf-open-club-enrollment', handleOpenEnrollmentEvent);
  }, []);

  // Query eligible club athletes for the selected competition directly from database
  const {
    data: eligibleData,
    isLoading: isLoadingEligible,
  } = useGetEligibleAthletesForCompetitionQuery(
    { clubId, eventId: selectedCompetition?.id || '' },
    { skip: !clubId || !selectedCompetition?.id }
  );
  const clubEligibleAthletes: EligibleAthlete[] = eligibleData?.athletes || [];

  // Form selections for chosen athletes
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<string>>(new Set());
  const [athleteDisciplineMap, setAthleteDisciplineMap] = useState<Record<string, string[]>>({});
  const [athleteSeedMap, setAthleteSeedMap] = useState<Record<string, string>>({});

  // Representative & Declarations
  const [repName, setRepName] = useState<string>(club?.manager || '');
  const [repPhone, setRepPhone] = useState<string>(club?.phone || '');
  const [repEmail, setRepEmail] = useState<string>(club?.email || '');
  const [repRole, setRepRole] = useState<string>('Club Manager / Official Representative');

  const [repConfirmed, setRepConfirmed] = useState<boolean>(true);
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(true);
  const [medicalConfirmed, setMedicalConfirmed] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Athlete search & filter inside wizard
  const [wizardAthleteSearch, setWizardAthleteSearch] = useState<string>('');
  const [wizardTierFilter, setWizardTierFilter] = useState<string>('ALL');

  // Success Confirmation State
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    reference: string;
    competitionTitle: string;
    athleteCount: number;
  } | null>(null);

  // Application detail modal
  const [viewingApplication, setViewingApplication] = useState<ClubApplication | null>(null);

  // ── Wizard Handlers ──
  const handleStartEnrollment = (comp: ClubCompetition) => {
    setSelectedCompetition(comp);
    setWizardStep(1);
    setSelectedAthleteIds(new Set());
    setAthleteDisciplineMap({});
    setAthleteSeedMap({});
    setRepName(club?.manager || '');
    setRepPhone(club?.phone || '');
    setRepEmail(club?.email || '');
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseWizard = () => {
    setSelectedCompetition(null);
    setWizardStep(1);
    setSelectedAthleteIds(new Set());
    if (onCloseWizard) onCloseWizard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAthleteSelection = (athlete: EligibleAthlete) => {
    if (!athlete.isEligible) return;

    setSelectedAthleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(athlete.id)) {
        next.delete(athlete.id);
        const nextDisc = { ...athleteDisciplineMap };
        delete nextDisc[athlete.id];
        setAthleteDisciplineMap(nextDisc);
      } else {
        next.add(athlete.id);
        const matchingDisc =
          (selectedCompetition?.disciplines || []).find(
            (d) => d.toLowerCase() === (athlete.primaryEvent || athlete.discipline).toLowerCase()
          ) || selectedCompetition?.disciplines?.[0] || '10,000m';

        setAthleteDisciplineMap((prevDisc) => ({
          ...prevDisc,
          [athlete.id]: [matchingDisc],
        }));

        const pb = athlete.personalRecords?.[0]?.mark || '';
        setAthleteSeedMap((prevSeed) => ({
          ...prevSeed,
          [athlete.id]: pb,
        }));
      }
      return next;
    });
  };

  const handleSelectAllEligible = () => {
    const eligibleAthletes = wizardFilteredAthletes.filter((a) => a.isEligible);
    if (eligibleAthletes.length === 0) return;

    const nextIds = new Set(selectedAthleteIds);
    const nextDisc = { ...athleteDisciplineMap };
    const nextSeed = { ...athleteSeedMap };

    eligibleAthletes.forEach((athlete) => {
      nextIds.add(athlete.id);
      if (!nextDisc[athlete.id]) {
        const matchingDisc =
          (selectedCompetition?.disciplines || []).find(
            (d) => d.toLowerCase() === (athlete.primaryEvent || athlete.discipline).toLowerCase()
          ) || selectedCompetition?.disciplines?.[0] || '10,000m';
        nextDisc[athlete.id] = [matchingDisc];
      }
      if (!nextSeed[athlete.id]) {
        nextSeed[athlete.id] = athlete.personalRecords?.[0]?.mark || '';
      }
    });

    setSelectedAthleteIds(nextIds);
    setAthleteDisciplineMap(nextDisc);
    setAthleteSeedMap(nextSeed);
  };

  const handleDeselectAll = () => {
    setSelectedAthleteIds(new Set());
    setAthleteDisciplineMap({});
    setAthleteSeedMap({});
  };

  const toggleAthleteDiscipline = (athleteId: string, disc: string) => {
    setAthleteDisciplineMap((prev) => {
      const current = prev[athleteId] || [];
      const exists = current.includes(disc);
      const next = exists ? current.filter((d) => d !== disc) : [...current, disc];
      return { ...prev, [athleteId]: next };
    });
  };

  const handleFinalSubmit = async () => {
    if (!selectedCompetition) return;
    if (selectedAthleteIds.size === 0) {
      onNotify('Please select at least one eligible athlete.', 'error');
      return;
    }

    for (const id of selectedAthleteIds) {
      const discs = athleteDisciplineMap[id] || [];
      if (discs.length === 0) {
        const ath = clubEligibleAthletes.find((a) => a.id === id);
        onNotify(`Please assign at least one event discipline for ${ath?.name || 'athlete'}.`, 'error');
        return;
      }
    }

    if (!repConfirmed || !consentConfirmed || !medicalConfirmed) {
      onNotify('All three regulatory and medical declarations are required before submission.', 'error');
      return;
    }

    const payloadAthletes = Array.from(selectedAthleteIds).map((id) => {
      const ath = clubEligibleAthletes.find((a) => a.id === id);
      return {
        athleteId: id,
        athleteName: ath?.name || '',
        disciplines: athleteDisciplineMap[id] || [],
        seedMark: athleteSeedMap[id] || '',
      };
    });

    try {
      const res = await submitApplication({
        clubId,
        eventId: selectedCompetition.id,
        body: {
          athletes: payloadAthletes,
          representative: {
            name: repName,
            phone: repPhone,
            email: repEmail,
            roleTitle: repRole,
          },
          declarations: {
            authorizedRepConfirmed: repConfirmed,
            athleteConsentConfirmed: consentConfirmed,
            medicalClearanceConfirmed: medicalConfirmed,
          },
          notes,
        },
      }).unwrap();

      onNotify('Club competition enrollment application submitted successfully!', 'success');
      setSubmissionSuccess({
        reference: res.data?.reference || 'APP-CONFIRMED',
        competitionTitle: selectedCompetition.title,
        athleteCount: payloadAthletes.length,
      });
      handleCloseWizard();
      setActiveTab('tracking');
      refetchApplications();
      refetchCompetitions();
    } catch (err: any) {
      onNotify(
        err?.data?.message || err?.message || 'Failed to submit application. Please check eligibility rules.',
        'error'
      );
    }
  };

  // Filtered athletes in wizard search
  const wizardFilteredAthletes = useMemo(() => {
    return clubEligibleAthletes.filter((ath) => {
      if (wizardTierFilter !== 'ALL' && ath.category !== wizardTierFilter) return false;
      if (wizardAthleteSearch.trim()) {
        const q = wizardAthleteSearch.toLowerCase();
        const matchesName = ath.name.toLowerCase().includes(q);
        const matchesFin = ath.faydaFin?.toLowerCase().includes(q) ?? false;
        const matchesEvent = ath.primaryEvent?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesFin && !matchesEvent) return false;
      }
      return true;
    });
  }, [clubEligibleAthletes, wizardTierFilter, wizardAthleteSearch]);

  const eligibleCount = useMemo(() => {
    return clubEligibleAthletes.filter((a) => a.isEligible).length;
  }, [clubEligibleAthletes]);

  // ═════════════════════════════════════════════════════════════════════════
  // ── FULL-PAGE ENROLLMENT WIZARD VIEW (CLEAN 3-COLOR LIGHT DESIGN) ──
  // ═════════════════════════════════════════════════════════════════════════
  if (selectedCompetition) {
    return (
      <div className="space-y-6">
        {/* ── Top Breadcrumbs & Exit Navigation ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleCloseWizard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer border-0 bg-transparent"
            >
              <ArrowLeft size={14} />
              <span>Back to Competitions</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-500">Club Enrollment</span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-slate-900 truncate max-w-xs">
              {selectedCompetition.title}
            </span>
          </div>

          <button
            onClick={handleCloseWizard}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
          >
            Cancel & Exit
          </button>
        </div>

        {/* ── Competition Context Header Banner (Clean Light Surface, No Black Background) ── */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-xs text-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedCompetition.category || 'National Championship'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedCompetition.isRegistrationOpen ? 'Registration Active' : 'Deadline Passed'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <ShieldCheck size={14} className="text-emerald-600" /> EAF Sanctioned Meet
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight m-0">
                {selectedCompetition.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-slate-400 shrink-0" />
                  <span className="font-semibold">{selectedCompetition.venue || 'Addis Ababa Stadium'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-slate-400 shrink-0" />
                  <span>
                    {selectedCompetition.startDate || 'Upcoming'} {selectedCompetition.endDate && `– ${selectedCompetition.endDate}`}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-700">
                    Deadline: {selectedCompetition.registrationDeadline || 'Standard Entry'}
                  </span>
                </span>
              </div>

              {/* Eligible Events List */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Meet Disciplines:
                </span>
                {(selectedCompetition.disciplines || []).map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Submitting Club Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs shrink-0 lg:min-w-[280px] space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <Building2 size={13} className="text-blue-600" /> Submitting Club
              </div>
              <div className="font-extrabold text-slate-900 text-base truncate">
                {club?.name || 'Club Delegation'}
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div>
                  Region: <span className="font-semibold text-slate-800">{club?.region || 'Addis Ababa'}</span>
                </div>
                <div>
                  Club License ID:{' '}
                  <span className="font-mono text-slate-800 font-bold">{clubId || 'ETH-CL-2026'}</span>
                </div>
                <div>
                  Representative:{' '}
                  <span className="font-semibold text-slate-800">
                    {repName || club?.manager || 'Authorized Official'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-Step Wizard Navigation Stepper (Clean & Disciplined Palette) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              step: 1,
              title: '1. Athlete Selection',
              desc: 'Select eligible verified roster members',
            },
            {
              step: 2,
              title: '2. Disciplines & Declarations',
              desc: 'Assign events, seed marks & compliance',
            },
            {
              step: 3,
              title: '3. Review & Submit',
              desc: 'Official delegation verification',
            },
          ].map((s) => {
            const isCurrent = wizardStep === s.step;
            const isCompleted = wizardStep > s.step;

            return (
              <div
                key={s.step}
                className={`p-4 rounded-xl border transition-all flex items-center gap-3.5 ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : s.step}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-sm font-extrabold truncate ${
                      isCurrent
                        ? 'text-blue-900'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-600'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: ATHLETE SELECTION & ELIGIBILITY ── */}
        {wizardStep === 1 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 m-0">
                  Select Club Athletes for Championship Enrollment
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Athletes must have an active license, valid Fayda biometric identity verification, and no active sanctions.
                  Data is verified in real-time against Ethiopian Athletics Federation records.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedAthleteIds.size} of {eligibleCount} Eligible Athletes Selected
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search athletes by name, Fayda FIN, or primary event..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  value={wizardAthleteSearch}
                  onChange={(e) => setWizardAthleteSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                  value={wizardTierFilter}
                  onChange={(e) => setWizardTierFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Senior">Senior Division</option>
                  <option value="U20">U20 Division</option>
                  <option value="U18">U18 Division</option>
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllEligible}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare size={13} /> Select All Eligible
                </button>

                {selectedAthleteIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                  >
                    <Square size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Athletes Selectable List */}
            {isLoadingEligible ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
                <p className="font-bold text-xs text-slate-700">
                  Retrieving verified club athlete eligibility from database...
                </p>
                <p className="text-[11px] text-slate-400">
                  Checking Fayda biometric identity records, license statuses, and active disciplinary sanctions.
                </p>
              </div>
            ) : wizardFilteredAthletes.length === 0 ? (
              <div className="py-14 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                <Users size={32} className="mx-auto opacity-30 text-slate-500" />
                <p className="font-bold text-sm text-slate-700">
                  No athletes found matching your search.
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Make sure athletes are registered under your club in the Digital Roster tab and hold verified Fayda credentials.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {wizardFilteredAthletes.map((ath) => {
                  const isSelected = selectedAthleteIds.has(ath.id);
                  const isEligible = ath.isEligible;

                  return (
                    <div
                      key={ath.id}
                      onClick={() => isEligible && toggleAthleteSelection(ath)}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        !isEligible
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20 shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isEligible}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 mt-1 cursor-pointer shrink-0"
                        />
                        <img
                          src={
                            getProfilePhotoUrl({
                              photoUrl: ath.photoUrl,
                              faydaFin: ath.faydaFin,
                              faydaNin: ath.faydaFin,
                            }) || '/images/profile-placeholder.svg'
                          }
                          alt={ath.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/profile-placeholder.svg';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 truncate">
                              {ath.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {ath.category || 'Senior'}
                            </span>
                          </div>

                          {ath.amharicName && (
                            <div className="text-[11px] text-slate-500 font-semibold truncate">
                              {ath.amharicName}
                            </div>
                          )}

                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div>
                              Primary Event:{' '}
                              <strong className="text-slate-800">
                                {ath.primaryEvent || ath.discipline}
                              </strong>
                              {ath.personalRecords?.[0] && ` · PB: ${ath.personalRecords[0].mark}`}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-mono text-slate-500">
                                FIN: {ath.faydaFin || 'Biometric ID'}
                              </span>
                              {ath.faydaStatus === 'verified' && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                                  <ShieldCheck size={11} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <Check size={12} /> Eligible
                          </span>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              <AlertTriangle size={11} /> Ineligible
                            </span>
                            <span className="text-[10px] text-slate-500 block max-w-44 truncate mt-1">
                              {ath.ineligibilityReasons[0] || 'Restriction'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1 Footer Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseWizard}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel Enrollment
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-xs font-bold text-slate-500">
                  {selectedAthleteIds.size} athlete(s) selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAthleteIds.size === 0) {
                      onNotify('Please select at least one eligible athlete to proceed.', 'error');
                      return;
                    }
                    setWizardStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={selectedAthleteIds.size === 0}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Disciplines & Declarations</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: DISCIPLINES & DECLARATIONS ── */}
        {wizardStep === 2 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 m-0">
                Assign Competition Disciplines & Confirm Club Declarations
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Specify one or more eligible events for each enrolled athlete, enter qualifying seed marks, and confirm authorized club compliance.
              </p>
            </div>

            {/* Athletes Event Assignment Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
                Athlete Event Assignments ({selectedAthleteIds.size} Athletes)
              </h3>

              <div className="space-y-3">
                {Array.from(selectedAthleteIds).map((id) => {
                  const ath = clubEligibleAthletes.find((a) => a.id === id);
                  if (!ath) return null;
                  const selectedDiscs = athleteDisciplineMap[id] || [];
                  const seedMark = athleteSeedMap[id] || '';

                  return (
                    <div
                      key={id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              getProfilePhotoUrl({
                                photoUrl: ath.photoUrl,
                                faydaFin: ath.faydaFin,
                                faydaNin: ath.faydaFin,
                              }) || '/images/profile-placeholder.svg'
                            }
                            alt={ath.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/profile-placeholder.svg';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {ath.name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {ath.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Primary: <strong>{ath.primaryEvent || ath.discipline}</strong>
                              {ath.faydaFin && ` · FIN: ${ath.faydaFin}`}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-blue-700 font-bold">
                          {selectedDiscs.length} event(s) assigned
                        </div>
                      </div>

                      {/* Multi-discipline Selector */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                          Eligible Events in this Competition:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedCompetition.disciplines || []).map((disc) => {
                            const isChecked = selectedDiscs.includes(disc);
                            return (
                              <button
                                key={disc}
                                type="button"
                                onClick={() => toggleAthleteDiscipline(id, disc)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                                  isChecked
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {isChecked && <Check size={13} />}
                                <span>{disc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Seed Mark */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Seed Mark / Qualifying Personal Best
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 28:45.10 or 2:04:12"
                            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                            value={seedMark}
                            onChange={(e) =>
                              setAthleteSeedMap((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Representative & Compliance Declarations */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                  Authorized Club Official & Regulatory Declarations
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Federation championship regulations require club manager certification and anti-doping compliance acknowledgment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Representative Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Representative Phone
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Role / Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                    value={repRole}
                    onChange={(e) => setRepRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  Delegation Remarks / Technical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any special notes for meet organizers or the technical committee..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* 3 Checkboxes */}
              <div className="space-y-3 pt-2 text-xs text-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repConfirmed}
                    onChange={(e) => setRepConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    <strong>Authorized Club Delegation:</strong> I confirm as the authorized official of {club?.name || 'the club'} that all athlete records and entries submitted are true, verified, and in full compliance with EAF championship rules.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    <strong>Anti-Doping & Code of Conduct:</strong> All entered athletes have provided formal consent and agreed to abide by World Athletics and Ethiopian National Anti-Doping Organization (ETH-NADO) regulations.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medicalConfirmed}
                    onChange={(e) => setMedicalConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    <strong>Medical Clearances:</strong> All entered athletes possess active, valid pre-competition medical clearances on record with the club.
                  </span>
                </label>
              </div>
            </div>

            {/* Step 2 Footer Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setWizardStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Athlete Selection
              </button>

              <button
                type="button"
                onClick={() => {
                  for (const id of selectedAthleteIds) {
                    const discs = athleteDisciplineMap[id] || [];
                    if (discs.length === 0) {
                      const ath = clubEligibleAthletes.find((a) => a.id === id);
                      onNotify(`Please assign at least one discipline for ${ath?.name || 'athlete'}.`, 'error');
                      return;
                    }
                  }
                  if (!repConfirmed || !consentConfirmed || !medicalConfirmed) {
                    onNotify('All three regulatory and medical declarations are required.', 'error');
                    return;
                  }
                  setWizardStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue to Review & Submit</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW & FINAL SUBMISSION ── */}
        {wizardStep === 3 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                <CheckCircle2 size={18} /> Official Delegation Ready for Federation Submission
              </div>
              <p className="text-xs text-blue-800 m-0 leading-relaxed">
                Review your club's enrolled athletes and registered disciplines below. Upon submission, your application will be saved directly into the championship registry and an official reference tracking code will be issued.
              </p>
            </div>

            {/* Roster Summary Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
                Official Club Roster ({selectedAthleteIds.size} Athletes)
              </h3>

              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                      <th className="py-3 px-4">Athlete Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Fayda FIN</th>
                      <th className="py-3 px-4">Assigned Disciplines</th>
                      <th className="py-3 px-4">Seed Mark / PB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from(selectedAthleteIds).map((id) => {
                      const ath = clubEligibleAthletes.find((a) => a.id === id);
                      if (!ath) return null;
                      return (
                        <tr key={id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {ath.name}
                            {ath.amharicName && (
                              <span className="text-[10px] text-slate-500 block font-normal">
                                {ath.amharicName}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{ath.category}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {ath.faydaFin || 'Biometric FIN'}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-700">
                            {(athleteDisciplineMap[id] || []).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {athleteSeedMap[id] || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Representative & Regulatory Certification Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="font-extrabold text-slate-900 text-sm">
                Authorized Submitting Official:
              </div>
              <div className="text-slate-600">
                {repName} ({repRole}) · Phone: {repPhone} · Club: {club?.name || 'Club'}
              </div>
              <div className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                <CheckCircle2 size={13} /> All regulatory, anti-doping, and medical clearance declarations confirmed.
              </div>
            </div>

            {/* Step 3 Footer Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setWizardStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Disciplines
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Transmitting to Federation Database...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Application to Federation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── DEFAULT VIEW: COMPETITIONS / APPLICATIONS / RESULTS TABS ──
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Page Header & Tab Bar (Clean Light Surface, No Black Background) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              EAF Championship Registry
            </span>
            <span className="text-xs text-slate-500">· Club Competition Hub</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 m-0">
            Competition Entries & Tracking Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Enroll verified club athletes in upcoming federation meets, track application approval statuses in real time,
            and inspect official published championship results directly from the national database.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'competitions'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <Trophy size={15} />
            <span>Open Competitions</span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <Medal size={15} />
            <span>Published Results</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: COMPETITIONS LIST ── */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 m-0">
              Federation Meets Open for Club Entry
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing {competitions.length} available competitions from database
            </span>
          </div>

          {isLoadingCompetitions ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="font-bold text-xs text-slate-700">Loading open federation competitions...</p>
            </div>
          ) : competitions.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 bg-white text-slate-400">
              <Trophy size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">No competitions are currently open for registration.</p>
              <p className="text-xs text-slate-500 mt-1">
                Please check back when the federation publishes new championship fixtures.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitions.map((comp) => {
                const isOpen = comp.isRegistrationOpen;
                return (
                  <div
                    key={comp.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Header Banner */}
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      <img
                        src={comp.bannerUrl || '/images/runner_marathon.png'}
                        alt={comp.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isOpen ? 'Registration Open' : 'Deadline Passed'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                          {comp.category || 'National Championship'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {comp.title}
                        </h4>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{comp.venue || 'Addis Ababa Stadium'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <span>
                              {comp.startDate || 'Upcoming'} {comp.endDate && `– ${comp.endDate}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">
                              Deadline: {comp.registrationDeadline || 'Standard Entry'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Disciplines Chips */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Eligible Events:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(comp.disciplines || []).slice(0, 4).map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                            >
                              {d}
                            </span>
                          ))}
                          {(comp.disciplines || []).length > 4 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                              +{(comp.disciplines || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button: Opens the Enrollment Page directly on Step 1 */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleStartEnrollment(comp)}
                          disabled={!isOpen}
                          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-0 ${
                            isOpen
                              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <UserCheck size={14} />
                          <span>Start Club Enrollment Application</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: APPLICATIONS TRACKING ── */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 m-0">
              Submitted Competition Applications
            </h3>
            <button
              onClick={() => refetchApplications()}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer bg-transparent border-0 font-bold"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {isLoadingApplications ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
              <p className="font-bold text-xs text-slate-700">Loading submitted applications from database...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 bg-white text-slate-400">
              <FileSpreadsheet size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">No applications have been submitted by your club yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Go to the Open Competitions tab to enroll your athletes in upcoming meets.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Application Reference</th>
                      <th className="py-3 px-4">Competition / Event</th>
                      <th className="py-3 px-4">Athletes Enrolled</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => {
                      const isApproved = app.status === 'APPROVED';
                      const isRejected = app.status === 'REJECTED';

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-slate-900">
                              {app.reference}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Club: {club?.name || 'Club'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 text-sm">
                              {app.eventTitle}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              <Users size={12} /> {app.athleteCount} Athletes
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{app.createdAt}</td>
                          <td className="py-3 px-4">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <X size={12} /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock size={12} /> Under Review
                              </span>
                            )}
                            {app.decisionNote && (
                              <div className="text-[10px] text-slate-500 mt-1 italic">
                                Note: {app.decisionNote}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setViewingApplication(app)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              View Roster
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PUBLISHED RESULTS ── */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 m-0">
              Official Federation Competition Results
            </h3>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> Certified Results
            </span>
          </div>

          {backendResults.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 bg-white text-slate-400">
              <Medal size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">No championship results have been published yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Official times and standings will be published upon conclusion of scheduled meets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backendResults.map((result: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      {result.eventTitle || result.discipline}
                    </span>
                    <span className="text-xs text-slate-500">{result.date || 'Recent'}</span>
                  </div>

                  {Array.isArray(result.entries) && (
                    <div className="space-y-1.5 pt-2">
                      {result.entries.slice(0, 5).map((e: any, posIdx: number) => (
                        <div
                          key={posIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-500 w-4">#{posIdx + 1}</span>
                            <span className="font-semibold text-slate-800">
                              {e.athleteName}
                            </span>
                            <span className="text-[10px] text-slate-500">({e.club || 'Club'})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{e.time || e.mark}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSION SUCCESS MODAL (Clean Light Dialog) ── */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="text-lg font-black text-slate-900 m-0">
              Application Successfully Submitted
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your club enrollment application for{' '}
              <strong className="text-slate-900">{submissionSuccess.competitionTitle}</strong> has been saved directly into the federation database.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 text-xs font-mono font-bold text-slate-800 border border-slate-200">
              Reference: {submissionSuccess.reference}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setActiveTab('tracking');
                }}
                className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0"
              >
                View in Tracking Tab
              </button>
              <button
                onClick={() => setSubmissionSuccess(null)}
                className="py-2.5 px-4 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATION DETAILS MODAL (Clean Light Dialog) ── */}
      {viewingApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setViewingApplication(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {viewingApplication.reference}
                </span>
                <h3 className="text-lg font-black text-slate-900 m-0">
                  {viewingApplication.eventTitle}
                </h3>
              </div>
              <button
                onClick={() => setViewingApplication(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-semibold">Review Status</span>
                <span className="font-bold uppercase tracking-wider text-slate-800">
                  {viewingApplication.status}
                </span>
              </div>

              {viewingApplication.decisionNote && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-bold block mb-0.5">Reviewer Feedback:</span>
                  <span>{viewingApplication.decisionNote}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 block mb-2">
                  Enrolled Athletes ({viewingApplication.athleteEntries.length}):
                </span>
                <div className="space-y-1.5">
                  {viewingApplication.athleteEntries.map((ath, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <span className="font-bold text-slate-800">
                        {ath.athleteName || `Athlete #${i + 1}`}
                      </span>
                      <span className="font-semibold text-blue-700">
                        {ath.disciplines.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingApplication(null)}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 border-0 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
