import React, { useState, useMemo } from 'react';
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
  List,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  FileText,
  Search,
  Filter,
  Check,
  Lock,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  useGetClubCompetitionsQuery,
  useGetEligibleAthletesForCompetitionQuery,
  useSubmitClubCompetitionApplicationMutation,
  useGetClubApplicationsQuery,
  type ClubCompetition,
  type EligibleAthlete,
  type ClubApplication,
} from '../../store/api/clubApi';
import { useGetPublishedResultsQuery } from '../../store/api/athleteApi';

const MEDAL_COLORS: Record<number, string> = { 1: '#C8A84B', 2: '#A8B8C8', 3: '#C87040' };

interface MeetRegistrationProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function MeetRegistration({ onNotify }: MeetRegistrationProps) {
  const club = useAppSelector((state) => state.auth.club);
  const user = useAppSelector((state) => state.auth.user);
  const clubId = club?.id || '';

  // Tab State: 'competitions' | 'tracking' | 'results'
  const [activeTab, setActiveTab] = useState<'competitions' | 'tracking' | 'results'>('competitions');

  // Queries
  const { data: competitions = [], isLoading: isLoadingCompetitions, refetch: refetchCompetitions } =
    useGetClubCompetitionsQuery(clubId, { skip: !clubId });

  const { data: applications = [], isLoading: isLoadingApplications, refetch: refetchApplications } =
    useGetClubApplicationsQuery(clubId, { skip: !clubId });

  const { data: rawBackendResults = [] } = useGetPublishedResultsQuery();
  const backendResults = Array.isArray(rawBackendResults)
    ? rawBackendResults
    : (rawBackendResults as any)?.data || [];

  // Submit Mutation
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitClubCompetitionApplicationMutation();

  // ── Wizard State for Enrollment ──
  const [selectedCompetition, setSelectedCompetition] = useState<ClubCompetition | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1); // 1: Overview, 2: Athlete Selection, 3: Disciplines & Declarations, 4: Review

  // Query eligible athletes for currently selected competition
  const { data: eligibleData, isLoading: isLoadingEligible } = useGetEligibleAthletesForCompetitionQuery(
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

  // Success Modal
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    reference: string;
    competitionTitle: string;
    athleteCount: number;
  } | null>(null);

  // Results Tab State
  const [selectedMeetIdForResults, setSelectedMeetIdForResults] = useState<string | null>(null);
  const [expandedDiscipline, setExpandedDiscipline] = useState<string | null>(null);

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
  };

  const handleCloseWizard = () => {
    setSelectedCompetition(null);
    setWizardStep(1);
    setSelectedAthleteIds(new Set());
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
        // Pre-select matching primary discipline if in competition
        const matchingDisc = (selectedCompetition?.disciplines || []).find(
          (d) => d.toLowerCase() === (athlete.primaryEvent || athlete.discipline).toLowerCase()
        ) || selectedCompetition?.disciplines?.[0] || '10,000m';

        setAthleteDisciplineMap((prevDisc) => ({
          ...prevDisc,
          [athlete.id]: [matchingDisc],
        }));

        // Pre-populate PB if present
        const pb = athlete.personalRecords?.[0]?.mark || '';
        setAthleteSeedMap((prevSeed) => ({
          ...prevSeed,
          [athlete.id]: pb,
        }));
      }
      return next;
    });
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

    // Validate that every selected athlete has at least one discipline
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
      refetchApplications();
      refetchCompetitions();
    } catch (err: any) {
      onNotify(err?.data?.message || err?.message || 'Failed to submit application. Please check eligibility rules.', 'error');
    }
  };

  // Filtered athletes in wizard
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

  return (
    <div className="space-y-6">
      {/* ── Page Header & Tab Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              EAF Championship Registry
            </span>
            <span className="text-xs text-slate-400">· Club Competition Hub</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white m-0">
            Competition Entries & Tracking Center
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Enroll verified club athletes in upcoming federation meets, track application approval statuses in real time,
            and inspect official published championship results.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'competitions'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-transparent'
            }`}
          >
            <Trophy size={15} />
            <span>Open Competitions</span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-transparent'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white bg-transparent'
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white m-0">
              Federation Meets Open for Club Entry
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Showing {competitions.length} available competitions
            </span>
          </div>

          {competitions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
              <Trophy size={40} className="mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">No competitions are currently open for registration.</p>
              <p className="text-xs text-slate-500 mt-1">Please check back when the federation publishes new championship fixtures.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitions.map((comp) => {
                const isOpen = comp.isRegistrationOpen;
                return (
                  <div
                    key={comp.id}
                    className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Header Banner */}
                    <div className="relative h-40 bg-slate-800 overflow-hidden">
                      <img
                        src={comp.bannerUrl || '/images/runner_marathon.png'}
                        alt={comp.title}
                        className="w-full h-full object-cover opacity-75"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isOpen
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {isOpen ? 'Registration Open' : 'Deadline Passed'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          {comp.category || 'National Championship'}
                        </span>
                        <h4 className="text-base font-extrabold text-white leading-tight truncate">
                          {comp.title}
                        </h4>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate">{comp.venue || 'Addis Ababa Stadium'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500 shrink-0" />
                          <span>
                            {comp.startDate || 'Upcoming'} {comp.endDate && `– ${comp.endDate}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-rose-500 shrink-0" />
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            Deadline: {comp.registrationDeadline || 'Standard Entry'}
                          </span>
                        </div>
                      </div>

                      {/* Disciplines Chips */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Eligible Events:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(comp.disciplines || []).slice(0, 4).map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {d}
                            </span>
                          ))}
                          {(comp.disciplines || []).length > 4 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              +{(comp.disciplines || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleStartEnrollment(comp)}
                          disabled={!isOpen}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border-0 ${
                            isOpen
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-sm hover:shadow-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <UserPlus size={14} />
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white m-0">
              Submitted Competition Applications
            </h3>
            <button
              onClick={() => refetchApplications()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer bg-transparent border-0"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
              <FileSpreadsheet size={40} className="mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">No applications have been submitted by your club yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Go to the Open Competitions tab to enroll your athletes in upcoming meets.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Application Reference</th>
                      <th className="py-3.5 px-4">Competition / Event</th>
                      <th className="py-3.5 px-4">Athletes Enrolled</th>
                      <th className="py-3.5 px-4">Submitted Date</th>
                      <th className="py-3.5 px-4">Review Status</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {applications.map((app) => {
                      const isPending = app.status === 'PENDING';
                      const isApproved = app.status === 'APPROVED';
                      const isRejected = app.status === 'REJECTED';

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                              {app.reference}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Club: {club?.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {app.eventTitle}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                              <Users size={12} /> {app.athleteCount} Athletes
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {app.createdAt}
                          </td>
                          <td className="py-3.5 px-4">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300">
                                <X size={12} /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">
                                <Clock size={12} /> Under Review
                              </span>
                            )}
                            {app.decisionNote && (
                              <div className="text-[10px] text-slate-500 mt-1 italic">
                                Note: {app.decisionNote}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setViewingApplication(app)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 cursor-pointer"
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white m-0">
              Official Federation Competition Results
            </h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> Certified Results
            </span>
          </div>

          {backendResults.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
              <Medal size={40} className="mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">No championship results have been published yet.</p>
              <p className="text-xs text-slate-500 mt-1">Official times and standings will be published upon conclusion of scheduled meets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backendResults.map((result: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {result.eventTitle || result.discipline}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{result.date || 'Recent'}</span>
                  </div>

                  {Array.isArray(result.entries) && (
                    <div className="space-y-1.5 pt-2">
                      {result.entries.slice(0, 5).map((e: any, posIdx: number) => (
                        <div
                          key={posIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-500 w-4">#{posIdx + 1}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{e.athleteName}</span>
                            <span className="text-[10px] text-slate-400">({e.club || 'Club'})</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600">{e.time || e.mark}</span>
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

      {/* ── 4-STEP ENROLLMENT WIZARD MODAL ── */}
      {selectedCompetition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                  Club Competition Enrollment Wizard
                </span>
                <h3 className="text-xl font-black text-white m-0 truncate max-w-xl">
                  {selectedCompetition.title}
                </h3>
              </div>
              <button
                onClick={handleCloseWizard}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold shrink-0">
              {[
                { step: 1, label: '1. Competition Details' },
                { step: 2, label: '2. Athlete Selection' },
                { step: 3, label: '3. Disciplines & Consent' },
                { step: 4, label: '4. Review & Submit' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 ${
                    wizardStep === s.step
                      ? 'text-amber-600 dark:text-amber-400 font-black'
                      : wizardStep > s.step
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      wizardStep === s.step
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : wizardStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {wizardStep > s.step ? '✓' : s.step}
                  </span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              {/* STEP 1: COMPETITION & CLUB INFO */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 m-0 flex items-center gap-2">
                      <Trophy size={16} /> Competition Event Specifications
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">Venue & Host</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedCompetition.venue}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Scheduled Dates</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedCompetition.startDate} to {selectedCompetition.endDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Registration Deadline</span>
                        <span className="font-bold text-rose-600">
                          {selectedCompetition.registrationDeadline}
                        </span>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <span className="text-slate-400 font-semibold block mb-1">Eligible Disciplines in this Meet:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedCompetition.disciplines || []).map((d, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300/40"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0 flex items-center gap-2">
                      <ShieldCheck size={16} /> Submitting Club Entity
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">Club Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{club?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">License ID</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{club?.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Affiliated Region</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{club?.region}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Club Manager</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{club?.manager || 'Authorized Admin'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ATHLETE SELECTION & ELIGIBILITY */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white m-0">
                        Select Club Athletes for Enrollment
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Only biometrically verified Fayda athletes with active federation licenses are eligible to compete.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-300">
                        {selectedAthleteIds.size} Athletes Selected
                      </span>
                    </div>
                  </div>

                  {/* Filters inside wizard */}
                  <div className="flex flex-col md:flex-row items-center gap-3 text-xs">
                    <div className="relative flex-1 w-full">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search athletes by name, FIN, or primary event..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        value={wizardAthleteSearch}
                        onChange={(e) => setWizardAthleteSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      value={wizardTierFilter}
                      onChange={(e) => setWizardTierFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Senior">Senior</option>
                      <option value="U20">U20 Division</option>
                      <option value="U18">U18 Division</option>
                    </select>
                  </div>

                  {/* Athletes Selectable List */}
                  {isLoadingEligible ? (
                    <div className="py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                      <p className="font-bold text-xs">Checking athlete eligibility against federation rules...</p>
                    </div>
                  ) : wizardFilteredAthletes.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <p className="font-bold text-xs">No athletes found in your club roster matching the search.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {wizardFilteredAthletes.map((ath) => {
                        const isSelected = selectedAthleteIds.has(ath.id);
                        const isEligible = ath.isEligible;

                        return (
                          <div
                            key={ath.id}
                            onClick={() => isEligible && toggleAthleteSelection(ath)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              !isEligible
                                ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-xs cursor-pointer'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!isEligible}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                              />
                              <img
                                src={ath.photoUrl || '/images/runner_marathon.png'}
                                alt={ath.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/runner_marathon.png';
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {ath.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {ath.category || 'Senior'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Primary: <span className="font-semibold text-slate-700 dark:text-slate-300">{ath.primaryEvent || ath.discipline}</span>
                                  {ath.personalRecords?.[0] && ` · PB: ${ath.personalRecords[0].mark}`}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              {isEligible ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <Check size={11} /> Eligible
                                </span>
                              ) : (
                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-300">
                                    <AlertTriangle size={10} /> Ineligible
                                  </span>
                                  <span className="text-[10px] text-slate-400 block max-w-48 truncate mt-0.5">
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
                </div>
              )}

              {/* STEP 3: DISCIPLINES & DECLARATIONS */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white m-0">
                      Assign Competition Events per Selected Athlete
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select one or more eligible events for each athlete and input seed marks / recent personal bests.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {Array.from(selectedAthleteIds).map((id) => {
                      const ath = clubEligibleAthletes.find((a) => a.id === id);
                      if (!ath) return null;
                      const selectedDiscs = athleteDisciplineMap[id] || [];
                      const seedMark = athleteSeedMap[id] || '';

                      return (
                        <div
                          key={id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {ath.name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                {ath.category}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              FIN: {ath.faydaFin || 'Fayda-Verified'}
                            </span>
                          </div>

                          {/* Event Disciplines Checkboxes */}
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                              Select Events for this Athlete:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {(selectedCompetition.disciplines || []).map((disc) => {
                                const isChecked = selectedDiscs.includes(disc);
                                return (
                                  <button
                                    key={disc}
                                    type="button"
                                    onClick={() => toggleAthleteDiscipline(id, disc)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                      isChecked
                                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    {isChecked && '✓ '}
                                    {disc}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Seed Mark Input */}
                          <div className="pt-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Seed Mark / Qualifying Time
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 12:54.20 or 2:05:30 (Optional)"
                              className="w-full max-w-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                              value={seedMark}
                              onChange={(e) =>
                                setAthleteSeedMap((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Representative & Declarations */}
                  <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 m-0">
                      Authorized Club Declarations & Medical Clearance
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Authorized Representative Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          value={repName}
                          onChange={(e) => setRepName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Representative Phone
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          value={repPhone}
                          onChange={(e) => setRepPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={repConfirmed}
                          onChange={(e) => setRepConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 mt-0.5"
                        />
                        <span>
                          I confirm as the authorized club representative that all athlete records and entries are accurate and compliant with Ethiopian Athletics Federation regulations.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consentConfirmed}
                          onChange={(e) => setConsentConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 mt-0.5"
                        />
                        <span>
                          All enrolled athletes have given consent to participate and abide by World Athletics and EAF anti-doping regulations.
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={medicalConfirmed}
                          onChange={(e) => setMedicalConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 mt-0.5"
                        />
                        <span>
                          All enrolled athletes hold valid pre-competition medical clearances on file with the club.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                      <CheckCircle2 size={18} /> Ready for Official Federation Review
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 m-0">
                      Review your club's enrolled athletes and registered events below. Once submitted, your application reference will be issued and submitted to the regional and federation review queue.
                    </p>
                  </div>

                  {/* Summary Table */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase text-[11px]">
                          <th className="py-2.5 px-4">Athlete Name</th>
                          <th className="py-2.5 px-4">Age Division</th>
                          <th className="py-2.5 px-4">Registered Disciplines</th>
                          <th className="py-2.5 px-4">Seed Mark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {Array.from(selectedAthleteIds).map((id) => {
                          const ath = clubEligibleAthletes.find((a) => a.id === id);
                          if (!ath) return null;
                          return (
                            <tr key={id}>
                              <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                                {ath.name}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">{ath.category}</td>
                              <td className="py-2.5 px-4 font-bold text-amber-600">
                                {(athleteDisciplineMap[id] || []).join(', ')}
                              </td>
                              <td className="py-2.5 px-4 font-mono">{athleteSeedMap[id] || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Representative Summary */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      Submitting Representative: {repName} ({repPhone})
                    </div>
                    <div className="text-slate-500">
                      Declarations: Verified & Consented by Club Administration
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseWizard}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 2 && selectedAthleteIds.size === 0) {
                      onNotify('Please select at least one eligible athlete to proceed.', 'error');
                      return;
                    }
                    setWizardStep((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-0 flex items-center gap-1.5 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer border-0 flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Application to Federation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMISSION SUCCESS MODAL ── */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white m-0">
              Application Successfully Submitted!
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your club enrollment application for{' '}
              <strong>{submissionSuccess.competitionTitle}</strong> has been saved and queued for official review.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-black text-amber-600 border border-slate-200 dark:border-slate-700">
              Reference: {submissionSuccess.reference}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setActiveTab('tracking');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer border-0"
              >
                View in Tracking Tab
              </button>
              <button
                onClick={() => setSubmissionSuccess(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATION DETAILS MODAL ── */}
      {viewingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs" onClick={() => setViewingApplication(null)}>
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-500">
                  {viewingApplication.reference}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white m-0">
                  {viewingApplication.eventTitle}
                </h3>
              </div>
              <button
                onClick={() => setViewingApplication(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-semibold">Review Status</span>
                <span className="font-black uppercase tracking-wider text-amber-600">
                  {viewingApplication.status}
                </span>
              </div>

              {viewingApplication.decisionNote && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-800">
                  <span className="font-bold block mb-0.5">Reviewer Feedback:</span>
                  <span>{viewingApplication.decisionNote}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Enrolled Athletes ({viewingApplication.athleteEntries.length}):
                </span>
                <div className="space-y-1.5">
                  {viewingApplication.athleteEntries.map((ath, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {ath.athleteName || `Athlete #${i + 1}`}
                      </span>
                      <span className="font-semibold text-amber-600">
                        {ath.disciplines.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingApplication(null)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-0 cursor-pointer"
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
