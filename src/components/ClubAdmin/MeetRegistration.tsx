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
  Square,
  ChevronRight,
  Filter,
  Award,
  ShieldAlert,
  Globe,
  Zap,
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
import { isRegionMatch } from '../../utils/region-utils';

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

  // Competitions visible to this club:
  // Only display national competitions or regional competitions for the club's specific region.
  // Ineligible regional competitions from other regions are completely filtered out.
  const visibleCompetitions = useMemo(() => {
    return (competitions || []).filter((comp) => {
      const isRegional = Boolean(comp.isRegional || comp.regionId || comp.region || comp.regionName);
      if (!isRegional) return true; // National championships are open to all clubs

      const compRegionName =
        comp.region?.name ||
        comp.regionName ||
        (typeof comp.region === 'string' ? comp.region : '') ||
        '';
      const compRegionId = comp.regionId || comp.region?.id;

      const clubRegionName =
        club?.region ||
        (club as any)?.regionName ||
        accountClub?.region ||
        '';
      const clubRegionId =
        (club as any)?.regionId ||
        (accountClub as any)?.regionId;

      const isRegionEligible =
        comp.isRegionEligible !== undefined
          ? comp.isRegionEligible
          : isRegionMatch(clubRegionName, compRegionName, clubRegionId, compRegionId);

      return isRegionEligible;
    });
  }, [competitions, club, accountClub]);

  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useGetClubApplicationsQuery(clubId, { skip: !clubId });

  const { data: rawBackendResults = [] } = useGetPublishedResultsQuery();
  const backendResults = Array.isArray(rawBackendResults)
    ? rawBackendResults
    : (rawBackendResults as any)?.data || [];

  // Results Tab Filtering & Detail View State
  const [resultsSearch, setResultsSearch] = useState<string>('');
  const [resultsDisciplineFilter, setResultsDisciplineFilter] = useState<string>('ALL');
  const [resultsRoundFilter, setResultsRoundFilter] = useState<string>('ALL');
  const [selectedResultDetail, setSelectedResultDetail] = useState<any | null>(null);

  const formatRoundLabel = (r?: string) => {
    if (!r) return 'Championship Final';
    const upper = String(r).toUpperCase().trim();
    if (upper === 'FINAL' || upper === 'FN') return 'Final';
    if (upper === 'SEMIFINALS' || upper === 'SF') return 'Semi-Finals';
    if (upper.startsWith('SEMI_') || upper.startsWith('SEMIFINAL_')) {
      const num = upper.replace(/[^0-9]/g, '');
      return `Semi-Final ${num || '1'}`;
    }
    if (upper === 'HEATS' || upper === 'HT' || upper === 'ROUND_1' || upper === 'R1') return 'Heats (Round 1)';
    if (upper.startsWith('HEAT_')) {
      const num = upper.replace(/[^0-9]/g, '');
      return `Heat ${num || '1'}`;
    }
    if (upper === 'PRELIMINARY' || upper === 'PRELIM') return 'Preliminary Round';
    if (upper === 'QUALIFYING' || upper === 'QUAL') return 'Qualification Flights';
    if (upper.startsWith('QUAL_') || upper.startsWith('FLIGHT_')) {
      const letter = upper.replace(/^(QUAL_|FLIGHT_)/, '');
      return `Flight ${letter}`;
    }
    return r;
  };

  const availableResultsDisciplines = useMemo(() => {
    const set = new Set<string>();
    backendResults.forEach((r: any) => {
      if (r.discipline) set.add(r.discipline);
    });
    return Array.from(set);
  }, [backendResults]);

  const filteredBackendResults = useMemo(() => {
    return backendResults.filter((r: any) => {
      if (resultsDisciplineFilter !== 'ALL' && r.discipline !== resultsDisciplineFilter) return false;
      if (resultsRoundFilter !== 'ALL') {
        const norm = (r.round || '').toUpperCase();
        if (resultsRoundFilter === 'FINAL' && !norm.includes('FINAL') && norm !== 'FN') return false;
        if (resultsRoundFilter === 'HEATS' && !norm.includes('HEAT') && !norm.includes('R1') && norm !== 'HT') return false;
        if (resultsRoundFilter === 'SEMIS' && !norm.includes('SEMI') && norm !== 'SF') return false;
      }
      if (resultsSearch.trim()) {
        const q = resultsSearch.toLowerCase();
        const matchDisc = (r.discipline || '').toLowerCase().includes(q);
        const matchEvent = (r.eventTitle || '').toLowerCase().includes(q);
        const entries = r.entries || r.top3Preview || [];
        const matchEntries = entries.some((e: any) =>
          (e.athleteName || e.name || '').toLowerCase().includes(q) ||
          (e.club || e.clubName || '').toLowerCase().includes(q)
        );
        if (!matchDisc && !matchEvent && !matchEntries) return false;
      }
      return true;
    });
  }, [backendResults, resultsDisciplineFilter, resultsRoundFilter, resultsSearch]);

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

  // ── Discipline & Relay Squad Helpers ──
  const isRelayDiscipline = (disciplineName?: string): boolean => {
    if (!disciplineName) return false;
    const lower = disciplineName.toLowerCase();
    return (
      lower.includes('relay') ||
      lower.includes('4x') ||
      lower.includes('4×') ||
      lower.includes('medley')
    );
  };

  const detectRelayFormat = (disciplineName?: string): string => {
    const lower = (disciplineName || '').toLowerCase();
    if (lower.includes('mixed') || lower.includes('mix')) return 'RELAY_4X400M_MIXED';
    if (lower.includes('4x400') || lower.includes('4×400')) return 'RELAY_4X400M';
    if (lower.includes('4x100') || lower.includes('4×100')) return 'RELAY_4X100M';
    if (lower.includes('sprint medley')) return 'SPRINT_MEDLEY';
    if (lower.includes('distance medley')) return 'DISTANCE_MEDLEY';
    return 'RELAY_4X100M';
  };

  const isMaleAthlete = (g?: string) => {
    const u = (g || '').trim().toUpperCase();
    return u === 'MALE' || u === 'M' || u === 'MEN';
  };

  const isFemaleAthlete = (g?: string) => {
    const u = (g || '').trim().toUpperCase();
    return u === 'FEMALE' || u === 'W' || u === 'F' || u === 'WOMEN';
  };

  const getDisciplineGender = (
    disciplineName?: string,
    config?: any
  ): 'MEN' | 'WOMEN' | 'MIXED' => {
    if (!disciplineName) return 'MIXED';

    const direct = config?.gender || config?.relayGender || config?.relayConfig?.gender;
    if (direct) {
      const u = String(direct).toUpperCase();
      if (u.includes('FEMALE') || u.includes('WOMEN') || u === 'W' || u === 'F') return 'WOMEN';
      if (u.includes('MALE') || u.includes('MEN') || u === 'M') return 'MEN';
      if (u.includes('MIX')) return 'MIXED';
    }

    const cat = (config?.category || '').toLowerCase();
    if (cat.includes('women') || cat.includes('female') || cat.includes('girls')) return 'WOMEN';
    if (cat.includes('men') || cat.includes('male') || cat.includes('boys')) return 'MEN';
    if (cat.includes('mix')) return 'MIXED';

    const name = disciplineName.toLowerCase();
    if (name.includes('mixed') || name.includes('mix')) return 'MIXED';
    if (name.includes('100m hurdles') || name.includes('heptathlon')) return 'WOMEN';
    if (name.includes('110m hurdles') || name.includes('decathlon')) return 'MEN';
    if (
      name.includes('women') ||
      name.includes('female') ||
      name.includes('girls') ||
      name.includes("women's") ||
      name.endsWith(' women') ||
      name.endsWith(' w')
    ) {
      return 'WOMEN';
    }
    if (
      name.includes('men') ||
      name.includes('male') ||
      name.includes('boys') ||
      name.includes("men's") ||
      name.endsWith(' men') ||
      name.endsWith(' m')
    ) {
      return 'MEN';
    }

    return 'MIXED';
  };

  const detectRelayGender = (disciplineName?: string): 'MEN' | 'WOMEN' | 'MIXED' => {
    return getDisciplineGender(disciplineName);
  };

  const getFormatLabel = (fmt?: string) => {
    switch (fmt) {
      case 'RELAY_4X100M':
        return '4x100m Relay (4 × 100m)';
      case 'RELAY_4X400M':
        return '4x400m Relay (4 × 400m)';
      case 'RELAY_4X400M_MIXED':
        return '4x400m Mixed Relay (2M + 2W)';
      case 'SPRINT_MEDLEY':
        return 'Sprint Medley (100m-100m-200m-400m)';
      case 'DISTANCE_MEDLEY':
        return 'Distance Medley (1200m-400m-800m-1600m)';
      case 'CUSTOM':
        return 'Custom Relay Format';
      default:
        return fmt || 'Relay Event';
    }
  };

  const getGenderLabel = (g?: string) => {
    switch (g) {
      case 'MEN':
        return "Men's Division";
      case 'WOMEN':
        return "Women's Division";
      case 'MIXED':
        return 'Mixed Division (2 Men + 2 Women)';
      default:
        return g || 'Open Division';
    }
  };

  // Selected Discipline (Discipline-First Workflow)
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  // ── Host Official Discipline Configuration (Derivation from Event Model) ──
  const hostDisciplineConfig = useMemo(() => {
    if (!selectedDiscipline) return null;
    return (
      (selectedCompetition as any)?.disciplineConfigs?.[selectedDiscipline] ||
      (eligibleData as any)?.competition?.disciplineConfigs?.[selectedDiscipline] ||
      null
    );
  }, [selectedCompetition, eligibleData, selectedDiscipline]);

  const isCurrentRelay = useMemo(() => {
    if (hostDisciplineConfig) {
      if (typeof hostDisciplineConfig.isRelay === 'boolean') return hostDisciplineConfig.isRelay;
      if (typeof hostDisciplineConfig.relayConfig?.isRelay === 'boolean') return hostDisciplineConfig.relayConfig.isRelay;
    }
    return isRelayDiscipline(selectedDiscipline);
  }, [hostDisciplineConfig, selectedDiscipline]);

  const hostRelayFormat = useMemo(() => {
    return (
      hostDisciplineConfig?.relayFormat ||
      hostDisciplineConfig?.relayConfig?.format ||
      detectRelayFormat(selectedDiscipline)
    );
  }, [hostDisciplineConfig, selectedDiscipline]);

  const hostRelayGender: 'MEN' | 'WOMEN' | 'MIXED' = useMemo(() => {
    return (
      hostDisciplineConfig?.relayGender ||
      hostDisciplineConfig?.relayConfig?.gender ||
      hostDisciplineConfig?.gender ||
      detectRelayGender(selectedDiscipline)
    );
  }, [hostDisciplineConfig, selectedDiscipline]);

  const targetDisciplineGender: 'MEN' | 'WOMEN' | 'MIXED' = useMemo(() => {
    return getDisciplineGender(selectedDiscipline, hostDisciplineConfig);
  }, [selectedDiscipline, hostDisciplineConfig]);

  const hostRequiredLegs: number = useMemo(() => {
    return (
      hostDisciplineConfig?.requiredLegs ||
      hostDisciplineConfig?.relayConfig?.requiredLegs ||
      4
    );
  }, [hostDisciplineConfig]);

  const hostMaxAlternates: number = useMemo(() => {
    return (
      hostDisciplineConfig?.maxAlternates ??
      hostDisciplineConfig?.relayConfig?.maxAlternates ??
      2
    );
  }, [hostDisciplineConfig]);

  const hostRelayRulesNote = useMemo(() => {
    return (
      hostDisciplineConfig?.relayRulesNote ||
      hostDisciplineConfig?.relayConfig?.rulesNote ||
      ''
    );
  }, [hostDisciplineConfig]);

  // Relay Squad State (4 Active Legs + Reserves)
  const [relaySquad, setRelaySquad] = useState<{
    teamName: string;
    format: string;
    gender: 'MEN' | 'WOMEN' | 'MIXED';
    seedTime: string;
    leg1AthleteId: string;
    leg2AthleteId: string;
    leg3AthleteId: string;
    leg4AthleteId: string;
    alt1AthleteId: string;
    alt2AthleteId: string;
  }>({
    teamName: '',
    format: 'RELAY_4X100M',
    gender: 'MIXED',
    seedTime: '',
    leg1AthleteId: '',
    leg2AthleteId: '',
    leg3AthleteId: '',
    leg4AthleteId: '',
    alt1AthleteId: '',
    alt2AthleteId: '',
  });

  // Individual Event Selections
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<string>>(new Set());
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
  const [wizardGenderFilter, setWizardGenderFilter] = useState<'ALL' | 'MEN' | 'WOMEN'>('ALL');
  const [disciplineDivisionFilter, setDisciplineDivisionFilter] = useState<'ALL' | 'MEN' | 'WOMEN' | 'MIXED'>('ALL');

  // Success Confirmation State
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    reference: string;
    competitionTitle: string;
    athleteCount: number;
  } | null>(null);

  // Application detail modal
  const [viewingApplication, setViewingApplication] = useState<ClubApplication | null>(null);

  // Eligible verified roster members
  const eligibleRosterAthletes = useMemo(() => {
    return clubEligibleAthletes.filter((a) => a.isEligible);
  }, [clubEligibleAthletes]);

  // Relay calculations & validations
  const activeLegAthletes = useMemo(() => {
    return [
      relaySquad.leg1AthleteId,
      relaySquad.leg2AthleteId,
      relaySquad.leg3AthleteId,
      relaySquad.leg4AthleteId,
    ]
      .map((id) => clubEligibleAthletes.find((a) => a.id === id))
      .filter(Boolean) as EligibleAthlete[];
  }, [relaySquad, clubEligibleAthletes]);

  const activeLegCount = activeLegAthletes.length;

  const maleLegCount = useMemo(() => {
    return activeLegAthletes.filter((a) => isMaleAthlete(a.gender)).length;
  }, [activeLegAthletes]);

  const femaleLegCount = useMemo(() => {
    return activeLegAthletes.filter((a) => isFemaleAthlete(a.gender)).length;
  }, [activeLegAthletes]);

  const isRelayConfigValid = useMemo(() => {
    if (!isCurrentRelay) return true;
    if (activeLegCount !== hostRequiredLegs) return false;
    const all = [
      relaySquad.leg1AthleteId,
      relaySquad.leg2AthleteId,
      relaySquad.leg3AthleteId,
      relaySquad.leg4AthleteId,
      relaySquad.alt1AthleteId,
      relaySquad.alt2AthleteId,
    ].filter(Boolean);
    if (new Set(all).size !== all.length) return false;

    if (hostRelayGender === 'MIXED') {
      if (maleLegCount !== 2 || femaleLegCount !== 2) return false;
    } else if (hostRelayGender === 'MEN') {
      if (femaleLegCount > 0) return false;
    } else if (hostRelayGender === 'WOMEN') {
      if (maleLegCount > 0) return false;
    }
    return true;
  }, [isCurrentRelay, activeLegCount, hostRequiredLegs, relaySquad, hostRelayGender, maleLegCount, femaleLegCount]);

  // ── Wizard Handlers ──
  const handleStartEnrollment = (comp: ClubCompetition) => {
    const isRegional = Boolean(comp.isRegional || comp.regionId || comp.region || comp.regionName);
    const compRegionName =
      comp.region?.name ||
      comp.regionName ||
      (typeof comp.region === 'string' ? comp.region : '') ||
      '';
    const compRegionId = comp.regionId || comp.region?.id;

    const clubRegionName =
      club?.region ||
      (club as any)?.regionName ||
      accountClub?.region ||
      '';
    const clubRegionId =
      (club as any)?.regionId ||
      (accountClub as any)?.regionId;

    const isRegionEligible =
      comp.isRegionEligible !== undefined
        ? comp.isRegionEligible
        : (!isRegional || isRegionMatch(clubRegionName, compRegionName, clubRegionId, compRegionId));

    if (isRegional && !isRegionEligible) {
      onNotify(
        `Regional Competition Restriction: Only clubs and athletes from ${compRegionName || 'the host region'} may participate. ${club?.name || 'Your club'} is registered under ${clubRegionName || 'another region'}.`,
        'error'
      );
      return;
    }

    setSelectedCompetition(comp);
    setWizardStep(1);
    const initialDisc = comp.disciplines?.[0] || '100m';
    setSelectedDiscipline(initialDisc);
    setSelectedAthleteIds(new Set());
    setAthleteSeedMap({});

    const initialCfg = comp.disciplineConfigs?.[initialDisc];
    const initialFmt = initialCfg?.relayFormat || initialCfg?.relayConfig?.format || detectRelayFormat(initialDisc);
    const initialG = (initialCfg?.relayGender || initialCfg?.relayConfig?.gender || detectRelayGender(initialDisc)) as 'MEN' | 'WOMEN' | 'MIXED';

    setRelaySquad({
      teamName: `${club?.name || 'Club'} Relay Team A`,
      format: initialFmt,
      gender: initialG,
      seedTime: '',
      leg1AthleteId: '',
      leg2AthleteId: '',
      leg3AthleteId: '',
      leg4AthleteId: '',
      alt1AthleteId: '',
      alt2AthleteId: '',
    });
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
    setSelectedDiscipline('');
    if (onCloseWizard) onCloseWizard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDiscipline = (disc: string) => {
    setSelectedDiscipline(disc);
    const cfg =
      (selectedCompetition as any)?.disciplineConfigs?.[disc] ||
      (eligibleData as any)?.competition?.disciplineConfigs?.[disc] ||
      null;
    const isRel = Boolean(
      cfg?.isRelay ?? cfg?.relayConfig?.isRelay ?? isRelayDiscipline(disc)
    );
    if (isRel) {
      const fmt = cfg?.relayFormat || cfg?.relayConfig?.format || detectRelayFormat(disc);
      const g = (cfg?.relayGender || cfg?.relayConfig?.gender || detectRelayGender(disc)) as 'MEN' | 'WOMEN' | 'MIXED';
      setRelaySquad((prev) => ({
        ...prev,
        teamName: prev.teamName || `${club?.name || 'Club'} Relay Team A`,
        format: fmt,
        gender: g,
      }));
    }
  };

  const setRelaySlotAthlete = (
    slot: 'leg1AthleteId' | 'leg2AthleteId' | 'leg3AthleteId' | 'leg4AthleteId' | 'alt1AthleteId' | 'alt2AthleteId',
    athleteId: string
  ) => {
    setRelaySquad((prev) => {
      const next = { ...prev };
      // Smart swap: if athlete was in another slot, clear that slot
      (
        ['leg1AthleteId', 'leg2AthleteId', 'leg3AthleteId', 'leg4AthleteId', 'alt1AthleteId', 'alt2AthleteId'] as const
      ).forEach((k) => {
        if (k !== slot && next[k] === athleteId && athleteId !== '') {
          next[k] = '';
        }
      });
      next[slot] = athleteId;
      return next;
    });
  };

  const toggleIndividualAthlete = (athlete: EligibleAthlete) => {
    if (!athlete.isEligible) return;
    setSelectedAthleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(athlete.id)) {
        next.delete(athlete.id);
        const nextSeed = { ...athleteSeedMap };
        delete nextSeed[athlete.id];
        setAthleteSeedMap(nextSeed);
      } else {
        next.add(athlete.id);
        const pb =
          athlete.personalRecords?.find(
            (pr) => pr.discipline.toLowerCase() === selectedDiscipline.toLowerCase()
          )?.mark || athlete.personalRecords?.[0]?.mark || '';
        setAthleteSeedMap((prevSeed) => ({
          ...prevSeed,
          [athlete.id]: pb,
        }));
      }
      return next;
    });
  };

  const handleSelectAllIndividual = () => {
    const eligible = wizardFilteredAthletes.filter((a) => a.isEligible);
    if (eligible.length === 0) return;
    const nextIds = new Set(selectedAthleteIds);
    const nextSeed = { ...athleteSeedMap };
    eligible.forEach((ath) => {
      nextIds.add(ath.id);
      if (!nextSeed[ath.id]) {
        nextSeed[ath.id] =
          ath.personalRecords?.find(
            (pr) => pr.discipline.toLowerCase() === selectedDiscipline.toLowerCase()
          )?.mark || ath.personalRecords?.[0]?.mark || '';
      }
    });
    setSelectedAthleteIds(nextIds);
    setAthleteSeedMap(nextSeed);
  };

  const handleClearIndividual = () => {
    setSelectedAthleteIds(new Set());
    setAthleteSeedMap({});
  };

  const handleFinalSubmit = async () => {
    if (!selectedCompetition) return;

    if (!repConfirmed || !consentConfirmed || !medicalConfirmed) {
      onNotify('All three regulatory and medical declarations are required before submission.', 'error');
      return;
    }

    const isRelay = isCurrentRelay;

    if (isRelay) {
      if (activeLegCount !== hostRequiredLegs) {
        onNotify(`Relay application requires all ${hostRequiredLegs} active leg positions to be assigned. Current: ${activeLegCount}/${hostRequiredLegs}.`, 'error');
        return;
      }
      if (hostRelayGender === 'MIXED' && (maleLegCount !== 2 || femaleLegCount !== 2)) {
        onNotify(`Mixed relay composition requires exactly 2 male and 2 female runners. Current: ${maleLegCount} Male, ${femaleLegCount} Female.`, 'error');
        return;
      }
      if (hostRelayGender === 'MEN' && femaleLegCount > 0) {
        onNotify("Men's relay requires all active runners to be male.", 'error');
        return;
      }
      if (hostRelayGender === 'WOMEN' && maleLegCount > 0) {
        onNotify("Women's relay requires all active runners to be female.", 'error');
        return;
      }

      const squadAthleteIds = [
        relaySquad.leg1AthleteId,
        relaySquad.leg2AthleteId,
        relaySquad.leg3AthleteId,
        relaySquad.leg4AthleteId,
        relaySquad.alt1AthleteId,
        relaySquad.alt2AthleteId,
      ].filter(Boolean);

      const payloadAthletes = squadAthleteIds.map((id) => {
        const ath = clubEligibleAthletes.find((a) => a.id === id);
        return {
          athleteId: id,
          athleteName: ath?.name || '',
          disciplines: [selectedDiscipline],
          seedMark: relaySquad.seedTime || '',
        };
      });

      const payloadRelaySquad = {
        teamName: relaySquad.teamName || `${club?.name || 'Club'} Relay Team A`,
        discipline: selectedDiscipline,
        format: hostRelayFormat,
        gender: hostRelayGender,
        category: 'Senior',
        seedTime: relaySquad.seedTime || undefined,
        members: [
          { athleteId: relaySquad.leg1AthleteId, legNumber: 1, isAlternate: false },
          { athleteId: relaySquad.leg2AthleteId, legNumber: 2, isAlternate: false },
          { athleteId: relaySquad.leg3AthleteId, legNumber: 3, isAlternate: false },
          { athleteId: relaySquad.leg4AthleteId, legNumber: 4, isAlternate: false },
          ...(relaySquad.alt1AthleteId
            ? [{ athleteId: relaySquad.alt1AthleteId, legNumber: null, isAlternate: true, alternateOrder: 1 }]
            : []),
          ...(relaySquad.alt2AthleteId
            ? [{ athleteId: relaySquad.alt2AthleteId, legNumber: null, isAlternate: true, alternateOrder: 2 }]
            : []),
        ],
      };

      try {
        const res = await submitApplication({
          clubId,
          eventId: selectedCompetition.id,
          body: {
            athletes: payloadAthletes,
            relaySquad: payloadRelaySquad,
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

        onNotify(`Relay squad "${relaySquad.teamName || 'Relay Team'}" submitted successfully for ${selectedDiscipline}!`, 'success');
        setSubmissionSuccess({
          reference: res.data?.reference || 'APP-RELAY-CONFIRMED',
          competitionTitle: selectedCompetition.title,
          athleteCount: payloadAthletes.length,
        });
        handleCloseWizard();
        setActiveTab('tracking');
        refetchApplications();
        refetchCompetitions();
      } catch (err: any) {
        onNotify(
          err?.data?.message || err?.message || 'Failed to submit relay application. Please check eligibility rules.',
          'error'
        );
      }
    } else {
      // Individual discipline
      if (selectedAthleteIds.size === 0) {
        onNotify('Please select at least one eligible athlete to enter for this discipline.', 'error');
        return;
      }

      const payloadAthletes = Array.from(selectedAthleteIds).map((id) => {
        const ath = clubEligibleAthletes.find((a) => a.id === id);
        return {
          athleteId: id,
          athleteName: ath?.name || '',
          disciplines: [selectedDiscipline],
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

        onNotify(`Championship application submitted successfully for ${selectedDiscipline} (${payloadAthletes.length} athlete${payloadAthletes.length > 1 ? 's' : ''})!`, 'success');
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
    }
  };

  // Filtered athletes in wizard search (Enforces Event Division Gender Scope)
  const wizardFilteredAthletes = useMemo(() => {
    return clubEligibleAthletes
      .filter((ath) => {
        // Strict event division gender enforcement
        if (targetDisciplineGender === 'WOMEN' && !isFemaleAthlete(ath.gender)) return false;
        if (targetDisciplineGender === 'MEN' && !isMaleAthlete(ath.gender)) return false;

        // Interactive gender sub-filter
        if (wizardGenderFilter === 'MEN' && !isMaleAthlete(ath.gender)) return false;
        if (wizardGenderFilter === 'WOMEN' && !isFemaleAthlete(ath.gender)) return false;

        if (wizardTierFilter !== 'ALL' && ath.category !== wizardTierFilter) return false;
        if (wizardAthleteSearch.trim()) {
          const q = wizardAthleteSearch.toLowerCase();
          const matchesName = ath.name.toLowerCase().includes(q);
          const matchesFin = ath.faydaFin?.toLowerCase().includes(q) ?? false;
          const matchesEvent = ath.primaryEvent?.toLowerCase().includes(q) ?? false;
          if (!matchesName && !matchesFin && !matchesEvent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // If mixed or open, group Men together and Women together, then alphabetically
        if (targetDisciplineGender === 'MIXED') {
          const gA = isMaleAthlete(a.gender) ? 0 : 1;
          const gB = isMaleAthlete(b.gender) ? 0 : 1;
          if (gA !== gB) return gA - gB;
        }
        return a.name.localeCompare(b.name);
      });
  }, [clubEligibleAthletes, targetDisciplineGender, wizardGenderFilter, wizardTierFilter, wizardAthleteSearch]);

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
                {Boolean(selectedCompetition.isRegional || selectedCompetition.regionId || selectedCompetition.region || selectedCompetition.regionName) ? (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <ShieldAlert size={13} className="text-amber-600" />
                    <span>Host Region: {selectedCompetition.region?.name || selectedCompetition.regionName || 'Regional Scope'}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <Globe size={13} className="text-slate-500" />
                    <span>National Championship</span>
                  </span>
                )}
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

        {/* ── 3-Step Wizard Navigation Stepper (Discipline-First Workflow) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              step: 1,
              title: '1. Discipline Selection',
              desc: 'Choose competition event to apply for',
            },
            {
              step: 2,
              title: '2. Athlete / Squad Allocation',
              desc: isRelayDiscipline(selectedDiscipline)
                ? 'Assign 4 active legs + up to 2 reserves'
                : 'Select athlete(s) & qualifying seed marks',
            },
            {
              step: 3,
              title: '3. Review & Submit',
              desc: 'Compliance declarations & submission',
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

        {/* ── STEP 1: DISCIPLINE SELECTION FIRST ── */}
        {wizardStep === 1 && (() => {
          const isSelectedRegional = Boolean(
            selectedCompetition.isRegional ||
            selectedCompetition.regionId ||
            selectedCompetition.region ||
            selectedCompetition.regionName
          );
          const selCompRegionName =
            selectedCompetition.region?.name ||
            selectedCompetition.regionName ||
            (typeof selectedCompetition.region === 'string' ? selectedCompetition.region : '') ||
            '';
          const selCompRegionId = selectedCompetition.regionId || selectedCompetition.region?.id;
          const clubRegionName = club?.region || (club as any)?.regionName || accountClub?.region || '';
          const clubRegionId = (club as any)?.regionId || (accountClub as any)?.regionId;
          const isSelectedEligible =
            selectedCompetition.isRegionEligible !== undefined
              ? selectedCompetition.isRegionEligible
              : (!isSelectedRegional || isRegionMatch(clubRegionName, selCompRegionName, clubRegionId, selCompRegionId));

          const compDisciplines =
            selectedCompetition.disciplines && selectedCompetition.disciplines.length > 0
              ? selectedCompetition.disciplines
              : ['100m', '200m', '400m', '800m', '1,500m', '5,000m', '10,000m', '4x100m Relay', '4x400m Relay', '4x400m Mixed Relay'];

          const filteredCompDisciplines = compDisciplines.filter((disc) => {
            if (disciplineDivisionFilter === 'ALL') return true;
            const cfg = (selectedCompetition as any)?.disciplineConfigs?.[disc];
            const g = getDisciplineGender(disc, cfg);
            return g === disciplineDivisionFilter;
          });

          const selectedIsRelay = isRelayDiscipline(selectedDiscipline);

          return (
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
              {/* Regional Restriction Alert Banner */}
              {isSelectedRegional && !isSelectedEligible && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-amber-950">
                      Regional Scope Restriction: Club Ineligible for this Meet
                    </p>
                    <p className="leading-relaxed">
                      This competition is an official regional championship hosted strictly for clubs and delegations from <strong>{selCompRegionName || 'the host region'}</strong>.
                      Your club (<strong>{club?.name || 'Club'}</strong>) is registered under <strong>{clubRegionName || 'another region'}</strong>.
                      Athletes from outside the host region cannot be entered into this championship.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 m-0">
                    Step 1: Select Competition Discipline
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    First choose the competition discipline your club wants to enter. Disciplines are categorized by target gender division (Men, Women, Mixed).
                    For <strong>Relay Events</strong>, the system enforces selecting exactly <strong>4 active leg runners</strong> (Legs 1 to 4) and up to <strong>2 reserve athletes</strong>.
                    For <strong>Individual Events</strong>, eligible athletes are filtered by gender division.
                  </p>
                </div>

                {selectedDiscipline && (
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                      {selectedIsRelay ? <Zap size={14} className="text-blue-600" /> : <Medal size={14} className="text-blue-600" />}
                      <span>Selected: {selectedDiscipline}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Gender Division Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { key: 'ALL' as const, label: `All Disciplines (${compDisciplines.length})` },
                  { key: 'MEN' as const, label: '♂ Men’s Division' },
                  { key: 'WOMEN' as const, label: '♀ Women’s Division' },
                  { key: 'MIXED' as const, label: '⚥ Mixed / Open' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDisciplineDivisionFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      disciplineDivisionFilter === tab.key
                        ? tab.key === 'MEN'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : tab.key === 'WOMEN'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : tab.key === 'MIXED'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Discipline Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredCompDisciplines.map((disc) => {
                  const isRelay = isRelayDiscipline(disc);
                  const isSelected = selectedDiscipline.toLowerCase() === disc.toLowerCase();
                  const cfg = (selectedCompetition as any)?.disciplineConfigs?.[disc];
                  const discGender = getDisciplineGender(disc, cfg);

                  return (
                    <div
                      key={disc}
                      onClick={() => handleSelectDiscipline(disc)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 min-w-0">
                          <div className="font-black text-base text-slate-900 truncate">
                            {disc}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              discGender === 'WOMEN'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : discGender === 'MEN'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}>
                              {discGender === 'WOMEN' ? '♀ Women' : discGender === 'MEN' ? '♂ Men' : '⚥ Mixed'}
                            </span>
                            {isRelay ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Zap size={10} className="text-indigo-600" />
                                <span>Relay (4 Legs)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <Medal size={10} className="text-slate-500" />
                                <span>Individual</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-600">
                          {isRelay ? '4-Leg Squad Required' : 'Individual Athlete Entry'}
                        </span>
                        <span className="font-bold text-blue-600 flex items-center gap-0.5">
                          {isSelected ? 'Selected' : 'Select'} <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Discipline Info Card */}
              {selectedDiscipline && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  selectedIsRelay
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}>
                  {selectedIsRelay ? (
                    <Zap size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">
                      {selectedIsRelay ? 'Relay Squad Event Selected:' : 'Individual Track/Field Discipline Selected:'}{' '}
                      <span className="underline decoration-2">{selectedDiscipline}</span>
                    </p>
                    <p className="leading-relaxed opacity-90">
                      {selectedIsRelay
                        ? 'Next step will configure your 4-runner relay squad (Legs 1 to 4: Starter, Back Straight, Curve, Anchor) plus up to 2 alternate reserves.'
                        : 'Next step will allow you to select eligible athlete(s) from your club roster and enter their qualifying seed marks.'}
                    </p>
                  </div>
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
                    {selectedDiscipline ? `Selected: ${selectedDiscipline}` : 'Choose an event above'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelectedRegional && !isSelectedEligible) {
                        onNotify(`Regional Restriction: This competition is restricted to clubs from ${selCompRegionName || 'the host region'}.`, 'error');
                        return;
                      }
                      if (!selectedDiscipline) {
                        onNotify('Please select a discipline to proceed.', 'error');
                        return;
                      }
                      setWizardStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!selectedDiscipline || (isSelectedRegional && !isSelectedEligible)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continue to Athlete / Squad Allocation</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── STEP 2: ATHLETE / SQUAD ALLOCATION (DISCIPLINE-DRIVEN) ── */}
        {wizardStep === 2 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Step 2
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isCurrentRelay ? 'Relay Squad Builder' : 'Individual Event Selection'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 m-0 mt-1">
                  {isCurrentRelay
                    ? `Assign ${hostRequiredLegs} Active Leg Runners & Up to ${hostMaxAlternates} Reserves for ${selectedDiscipline}`
                    : `Select Club Athlete(s) for ${selectedDiscipline}`}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isCurrentRelay
                    ? `Official relay specifications mandate assigning exactly ${hostRequiredLegs} active runners across Legs 1 to ${hostRequiredLegs}. Up to ${hostMaxAlternates} reserve athletes are permitted.`
                    : `Choose the athlete(s) to represent your club in ${selectedDiscipline} and enter their qualifying seed marks.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setWizardStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <ArrowLeft size={13} />
                <span>Change Discipline</span>
              </button>
            </div>

            {/* ─── CASE A: RELAY DISCIPLINE BUILDER ─── */}
            {isCurrentRelay ? (
              <div className="space-y-6">
                {/* 1. Official Host Relay Specifications (Locked from Hosting Body) */}
                <div className="p-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-slate-50/80 to-purple-50/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 m-0">
                            Official Host Relay Specifications & Event Rules
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Locked by Hosting Body
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                          Format and division criteria are set by the hosting body and loaded from the competition database.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Official Relay Format
                      </span>
                      <strong className="text-slate-900 block font-black text-sm mt-0.5">
                        {getFormatLabel(hostRelayFormat)}
                      </strong>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold block mt-0.5">
                        {hostRelayFormat}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Division / Gender Scope
                      </span>
                      <strong className="text-slate-900 block font-black text-sm mt-0.5">
                        {getGenderLabel(hostRelayGender)}
                      </strong>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold block mt-0.5">
                        {hostRelayGender}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Active Squad Quota
                      </span>
                      <strong className="text-slate-900 block font-black text-sm mt-0.5">
                        {hostRequiredLegs} Active Runners
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Legs 1 to {hostRequiredLegs} required
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Reserve Allowance
                      </span>
                      <strong className="text-slate-900 block font-black text-sm mt-0.5">
                        Up to {hostMaxAlternates} Reserves
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Optional named alternates
                      </span>
                    </div>
                  </div>

                  {hostRelayRulesNote && (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2">
                      <Info size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold">Host Federation Notice: </strong>
                        {hostRelayRulesNote}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Club Squad Registration Details (Club-Provided) */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Zap size={15} className="text-indigo-600" />
                    <span>Club Relay Squad Identification & Seed Mark</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Relay Team Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Defence SC Team A"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        value={relaySquad.teamName}
                        onChange={(e) => setRelaySquad((prev) => ({ ...prev, teamName: e.target.value }))}
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Designation for your club squad (e.g. Club Name Team A).
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Qualifying Seed Time / Entry Mark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 39.85 or 3:12.40"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        value={relaySquad.seedTime}
                        onChange={(e) => setRelaySquad((prev) => ({ ...prev, seedTime: e.target.value }))}
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Official qualifying mark or seasonal best for seeding purposes.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Relay Status and Regulatory Compliance Banner */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isRelayConfigValid
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isRelayConfigValid ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-extrabold text-sm block">
                        {isRelayConfigValid
                          ? 'Relay Squad Fully Configured & Ready for Review'
                          : `Relay Allocation Incomplete: ${activeLegCount} of ${hostRequiredLegs} Active Legs Assigned`}
                      </span>
                      <span className="text-[11px] opacity-90">
                        {hostRelayGender === 'MIXED'
                          ? `Mixed Rule Check: 2 Men & 2 Women required on active legs (Current: ${maleLegCount} Men, ${femaleLegCount} Women).`
                          : hostRelayGender === 'MEN'
                          ? `Men's Division: All active runners must be male (Current: ${maleLegCount} Men).`
                          : `Women's Division: All active runners must be female (Current: ${femaleLegCount} Women).`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                      activeLegCount === hostRequiredLegs
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {activeLegCount} / {hostRequiredLegs} Active Legs
                    </span>
                    {hostRelayGender === 'MIXED' && (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        maleLegCount === 2 && femaleLegCount === 2
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {maleLegCount}M : {femaleLegCount}W
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Active Legs Section (Mandatory 4 Runners) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 m-0 flex items-center gap-1.5">
                      <Zap size={14} className="text-indigo-600" />
                      <span>Active Leg Runners (Exactly 4 Required)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      Legs 1 to 4 must each be assigned
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        slot: 'leg1AthleteId' as const,
                        legNumber: 1,
                        title: 'Leg 1: Starter / Lead-Off',
                        roleDesc: 'Starting blocks & first bend specialist',
                        athleteId: relaySquad.leg1AthleteId,
                      },
                      {
                        slot: 'leg2AthleteId' as const,
                        legNumber: 2,
                        title: 'Leg 2: Back Straight',
                        roleDesc: 'Speed endurance & second leg carry',
                        athleteId: relaySquad.leg2AthleteId,
                      },
                      {
                        slot: 'leg3AthleteId' as const,
                        legNumber: 3,
                        title: 'Leg 3: Curve Runner',
                        roleDesc: 'Bend running specialist & third carry',
                        athleteId: relaySquad.leg3AthleteId,
                      },
                      {
                        slot: 'leg4AthleteId' as const,
                        legNumber: 4,
                        title: 'Leg 4: Anchor Finisher',
                        roleDesc: 'Finishing speed & home straight sprint',
                        athleteId: relaySquad.leg4AthleteId,
                      },
                    ].map((leg) => {
                      const athlete = clubEligibleAthletes.find((a) => a.id === leg.athleteId);
                      const isAssigned = Boolean(athlete);

                      return (
                        <div
                          key={leg.slot}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            isAssigned
                              ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-500/10'
                              : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isAssigned ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Leg {leg.legNumber}
                                </span>
                                <span className="font-extrabold text-xs text-slate-900">
                                  {leg.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {leg.roleDesc}
                              </span>
                            </div>

                            {isAssigned && (
                              <button
                                type="button"
                                onClick={() => setRelaySlotAthlete(leg.slot, '')}
                                className="text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer bg-transparent border-0 p-0"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Athlete Dropdown Picker */}
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                            value={leg.athleteId}
                            onChange={(e) => setRelaySlotAthlete(leg.slot, e.target.value)}
                          >
                            <option value="">-- Choose Runner for Leg {leg.legNumber} (Required) --</option>
                            {eligibleRosterAthletes
                              .filter((ath) => {
                                if (hostRelayGender === 'MEN') return isMaleAthlete(ath.gender);
                                if (hostRelayGender === 'WOMEN') return isFemaleAthlete(ath.gender);
                                return true;
                              })
                              .map((ath) => {
                                const isPickedElsewhere = (
                                  ['leg1AthleteId', 'leg2AthleteId', 'leg3AthleteId', 'leg4AthleteId', 'alt1AthleteId', 'alt2AthleteId'] as const
                                ).some((k) => k !== leg.slot && relaySquad[k] === ath.id);

                                return (
                                  <option key={ath.id} value={ath.id}>
                                    {ath.name} ({isMaleAthlete(ath.gender) ? '♂ Male' : '♀ Female'}, {ath.category || 'Senior'})
                                    {ath.personalRecords?.[0] ? ` · PB: ${ath.personalRecords[0].mark}` : ''}
                                    {isPickedElsewhere ? ' (Swap Position)' : ''}
                                  </option>
                                );
                              })}
                          </select>

                          {/* Assigned Runner Card Preview */}
                          {athlete && (
                            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200">
                              <img
                                src={
                                  getProfilePhotoUrl({
                                    photoUrl: athlete.photoUrl,
                                    faydaFin: athlete.faydaFin,
                                    faydaNin: athlete.faydaFin,
                                  }) || '/images/profile-placeholder.svg'
                                }
                                alt={athlete.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/profile-placeholder.svg';
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-slate-900 truncate">
                                    {athlete.name}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    isMaleAthlete(athlete.gender)
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {isMaleAthlete(athlete.gender) ? '♂ Male' : '♀ Female'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                  <span>FIN: {athlete.faydaFin || 'Biometric ID'}</span>
                                  {athlete.personalRecords?.[0] && (
                                    <span className="font-bold text-slate-700">PB: {athlete.personalRecords[0].mark}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alternate / Reserve Runners Section (Governed by Host Max Alternates) */}
                {hostMaxAlternates > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                        Alternate / Reserve Runners (Up to {hostMaxAlternates} Permitted by Host)
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Substitutable prior to call room closure
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          slot: 'alt1AthleteId' as const,
                          order: 1,
                          title: 'Reserve 1 (Alternate 1)',
                          athleteId: relaySquad.alt1AthleteId,
                        },
                        ...(hostMaxAlternates >= 2
                          ? [
                              {
                                slot: 'alt2AthleteId' as const,
                                order: 2,
                                title: 'Reserve 2 (Alternate 2)',
                                athleteId: relaySquad.alt2AthleteId,
                              },
                            ]
                          : []),
                      ].map((alt) => {
                        const athlete = clubEligibleAthletes.find((a) => a.id === alt.athleteId);
                        const isAssigned = Boolean(athlete);

                        return (
                          <div
                            key={alt.slot}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              isAssigned
                                ? 'bg-slate-50 border-slate-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                  Reserve {alt.order}
                                </span>
                                <span className="font-bold text-xs text-slate-800">
                                  {alt.title}
                                </span>
                              </div>
                              {isAssigned && (
                                <button
                                  type="button"
                                  onClick={() => setRelaySlotAthlete(alt.slot, '')}
                                  className="text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer bg-transparent border-0 p-0"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <select
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                              value={alt.athleteId}
                              onChange={(e) => setRelaySlotAthlete(alt.slot, e.target.value)}
                            >
                              <option value="">-- None (Leave Empty) --</option>
                              {eligibleRosterAthletes
                                .filter((ath) => {
                                  if (hostRelayGender === 'MEN') return isMaleAthlete(ath.gender);
                                  if (hostRelayGender === 'WOMEN') return isFemaleAthlete(ath.gender);
                                  return true;
                                })
                                .map((ath) => (
                                  <option key={ath.id} value={ath.id}>
                                    {ath.name} ({isMaleAthlete(ath.gender) ? '♂ Male' : '♀ Female'}, {ath.category || 'Senior'})
                                  </option>
                                ))}
                            </select>

                            {athlete && (
                              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200">
                                <img
                                  src={
                                    getProfilePhotoUrl({
                                      photoUrl: athlete.photoUrl,
                                      faydaFin: athlete.faydaFin,
                                      faydaNin: athlete.faydaFin,
                                    }) || '/images/profile-placeholder.svg'
                                  }
                                  alt={athlete.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/images/profile-placeholder.svg';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="font-extrabold text-xs text-slate-900 truncate block">
                                    {athlete.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {isMaleAthlete(athlete.gender) ? 'Male' : 'Female'} · FIN: {athlete.faydaFin || 'ID'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2 Footer for Relay */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to Disciplines
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-500">
                      {activeLegCount === hostRequiredLegs ? `${hostRequiredLegs}/${hostRequiredLegs} legs assigned` : `${hostRequiredLegs - activeLegCount} legs remaining`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeLegCount !== hostRequiredLegs) {
                          onNotify(`Relay application requires all ${hostRequiredLegs} active leg positions to be assigned.`, 'error');
                          return;
                        }
                        if (hostRelayGender === 'MIXED' && (maleLegCount !== 2 || femaleLegCount !== 2)) {
                          onNotify(`Mixed relay composition requires exactly 2 male and 2 female runners. Current selection: ${maleLegCount} Male, ${femaleLegCount} Female.`, 'error');
                          return;
                        }
                        setWizardStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!isRelayConfigValid}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Declarations & Review</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── CASE B: INDIVIDUAL EVENT ATHLETE SELECTION ─── */
              <div className="space-y-6">
                {/* Event Division Scope Alert Banner */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  targetDisciplineGender === 'WOMEN'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : targetDisciplineGender === 'MEN'
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                    : 'bg-purple-50/70 border-purple-200 text-purple-950'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                      targetDisciplineGender === 'WOMEN'
                        ? 'bg-rose-600 text-white'
                        : targetDisciplineGender === 'MEN'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {targetDisciplineGender === 'WOMEN' ? '♀' : targetDisciplineGender === 'MEN' ? '♂' : '⚥'}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs tracking-wide uppercase">
                        {targetDisciplineGender === 'WOMEN' ? "Women's Event Division" : targetDisciplineGender === 'MEN' ? "Men's Event Division" : 'Mixed / Open Event Division'}
                      </div>
                      <div className="text-xs opacity-90 font-medium mt-0.5">
                        {targetDisciplineGender === 'WOMEN'
                          ? `Restricted to female athletes. Showing verified women on your roster eligible for ${selectedDiscipline}.`
                          : targetDisciplineGender === 'MEN'
                          ? `Restricted to male athletes. Showing verified men on your roster eligible for ${selectedDiscipline}.`
                          : `Open to both male and female athletes on your roster for ${selectedDiscipline}.`}
                      </div>
                    </div>
                  </div>

                  <span className={`self-start sm:self-auto px-3 py-1 rounded-md text-xs font-black uppercase border ${
                    targetDisciplineGender === 'WOMEN'
                      ? 'bg-white text-rose-800 border-rose-300'
                      : targetDisciplineGender === 'MEN'
                      ? 'bg-white text-blue-800 border-blue-300'
                      : 'bg-white text-purple-800 border-purple-300'
                  }`}>
                    {targetDisciplineGender === 'WOMEN' ? 'Women Only' : targetDisciplineGender === 'MEN' ? 'Men Only' : 'Mixed / Open'}
                  </span>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Search club athletes for ${selectedDiscipline}...`}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      value={wizardAthleteSearch}
                      onChange={(e) => setWizardAthleteSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {targetDisciplineGender === 'MIXED' && (
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {(['ALL', 'MEN', 'WOMEN'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setWizardGenderFilter(g)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border-0 ${
                              wizardGenderFilter === g
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'bg-transparent text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {g === 'ALL' ? 'All' : g === 'MEN' ? '♂ Men' : '♀ Women'}
                          </button>
                        ))}
                      </div>
                    )}

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
                      onClick={handleSelectAllIndividual}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare size={13} /> Select All Eligible
                    </button>

                    {selectedAthleteIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleClearIndividual}
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
                  </div>
                ) : wizardFilteredAthletes.length === 0 ? (
                  <div className="py-14 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                    <Users size={32} className="mx-auto opacity-30 text-slate-500" />
                    <p className="font-bold text-sm text-slate-700">
                      No athletes found matching your search.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {wizardFilteredAthletes.map((ath) => {
                      const isSelected = selectedAthleteIds.has(ath.id);
                      const isEligible = ath.isEligible;
                      const seedMark = athleteSeedMap[ath.id] || '';

                      return (
                        <div
                          key={ath.id}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            !isEligible
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div
                            onClick={() => isEligible && toggleIndividualAthlete(ath)}
                            className="flex items-start justify-between gap-3 cursor-pointer"
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
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    isMaleAthlete(ath.gender) ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {isMaleAthlete(ath.gender) ? '♂ M' : '♀ F'}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                  <div>
                                    Primary: <strong className="text-slate-800">{ath.primaryEvent || ath.discipline}</strong>
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
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                                  isSelected ? 'bg-blue-600 text-white border-blue-600' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                }`}>
                                  {isSelected ? <Check size={12} /> : null}
                                  {isSelected ? 'Selected' : 'Eligible'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  <AlertTriangle size={11} /> Ineligible
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Seed Mark Input when selected */}
                          {isSelected && (
                            <div className="pt-2 border-t border-slate-200 flex items-center gap-3 text-xs">
                              <label className="font-bold text-slate-700 shrink-0">
                                Qualifying Seed Mark / PB:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 10.25s or 13:20.10"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                                value={seedMark}
                                onChange={(e) =>
                                  setAthleteSeedMap((prev) => ({ ...prev, [ath.id]: e.target.value }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Step 2 Footer for Individual */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to Disciplines
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-xs font-bold text-slate-500">
                      {selectedAthleteIds.size} athlete(s) selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedAthleteIds.size === 0) {
                          onNotify(`Please select at least one eligible athlete to enter in ${selectedDiscipline}.`, 'error');
                          return;
                        }
                        setWizardStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={selectedAthleteIds.size === 0}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Declarations & Review</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: REVIEW & FINAL SUBMISSION ── */}
        {wizardStep === 3 && (
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                <CheckCircle2 size={18} /> Official Championship Application Ready for Submission
              </div>
              <p className="text-xs text-blue-800 m-0 leading-relaxed">
                Review your club's entry details below. Upon submission, the application and athlete squad records
                will be transmitted directly to the Ethiopian Athletics Federation championship database.
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Discipline Entry
                  </span>
                  <span className="font-black text-base text-slate-900">
                    {selectedDiscipline}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Entry Type
                  </span>
                  <span className="font-extrabold text-xs text-blue-700">
                    {isCurrentRelay ? `Relay Squad Entry (${hostRequiredLegs} Legs + Reserves)` : 'Individual Track/Field Entry'}
                  </span>
                </div>
              </div>

              {/* If Relay: Show Legs + Reserves */}
              {isCurrentRelay ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Squad Name</span>
                      <strong className="text-slate-900">{relaySquad.teamName || 'Relay Team'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Host Format</span>
                      <strong className="text-slate-900">{getFormatLabel(hostRelayFormat)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Host Division</span>
                      <strong className="text-slate-900">{getGenderLabel(hostRelayGender)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Seed Time</span>
                      <strong className="font-mono text-slate-900">{relaySquad.seedTime || '—'}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Position</th>
                          <th className="py-2.5 px-3">Athlete Name</th>
                          <th className="py-2.5 px-3">Gender</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Fayda FIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { pos: 'Leg 1 (Starter)', id: relaySquad.leg1AthleteId },
                          { pos: 'Leg 2 (Back Straight)', id: relaySquad.leg2AthleteId },
                          { pos: 'Leg 3 (Curve)', id: relaySquad.leg3AthleteId },
                          { pos: 'Leg 4 (Anchor)', id: relaySquad.leg4AthleteId },
                          ...(relaySquad.alt1AthleteId ? [{ pos: 'Reserve 1', id: relaySquad.alt1AthleteId }] : []),
                          ...(relaySquad.alt2AthleteId ? [{ pos: 'Reserve 2', id: relaySquad.alt2AthleteId }] : []),
                        ].map((item, idx) => {
                          const ath = clubEligibleAthletes.find((a) => a.id === item.id);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  item.pos.startsWith('Reserve') ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-800 font-extrabold'
                                }`}>
                                  {item.pos}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">
                                {ath?.name || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {isMaleAthlete(ath?.gender) ? '♂ Male' : '♀ Female'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {ath?.category || 'Senior'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">
                                {ath?.faydaFin || 'Biometric ID'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Individual Table */
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                        <th className="py-2.5 px-3">Athlete Name</th>
                        <th className="py-2.5 px-3">Gender</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Fayda FIN</th>
                        <th className="py-2.5 px-3">Discipline</th>
                        <th className="py-2.5 px-3">Seed Mark / PB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {Array.from(selectedAthleteIds).map((id) => {
                        const ath = clubEligibleAthletes.find((a) => a.id === id);
                        if (!ath) return null;
                        return (
                          <tr key={id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {ath.name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isMaleAthlete(ath.gender) ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isMaleAthlete(ath.gender) ? '♂ Male' : '♀ Female'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{ath.category}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {ath.faydaFin || 'Biometric FIN'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">
                              {selectedDiscipline}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700">
                              {athleteSeedMap[id] || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Representative & Regulatory Certification Card */}
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
                <ArrowLeft size={14} /> Back to Athlete Allocation
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
              Showing {visibleCompetitions.length} available competition{visibleCompetitions.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoadingCompetitions ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="font-bold text-xs text-slate-700">Loading open federation competitions...</p>
            </div>
          ) : visibleCompetitions.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 bg-white text-slate-400">
              <Trophy size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">No competitions are currently open for your club's registration.</p>
              <p className="text-xs text-slate-500 mt-1">
                Please check back when the federation publishes new championship fixtures for {club?.region ? `${club.region} or national` : 'your'} division.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleCompetitions.map((comp) => {
                const isOpen = comp.isRegistrationOpen;
                const isRegional = Boolean(comp.isRegional || comp.regionId || comp.region || comp.regionName);
                const compRegionName =
                  comp.region?.name ||
                  comp.regionName ||
                  (typeof comp.region === 'string' ? comp.region : '') ||
                  '';

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

                      {/* Top-Left: Regional / National Scope Badge */}
                      <div className="absolute top-3 left-3">
                        {isRegional ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-700/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                            <ShieldCheck size={11} />
                            <span>Regional: {compRegionName || 'Host Region'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                            <Globe size={11} />
                            <span>National Championship</span>
                          </span>
                        )}
                      </div>

                      {/* Top-Right: Registration Status Badge */}
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
                          {comp.category || (isRegional ? 'Regional Championship' : 'National Championship')}
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
                        {isOpen ? (
                          <button
                            onClick={() => handleStartEnrollment(comp)}
                            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-0 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                          >
                            <UserCheck size={14} />
                            <span>Start Club Enrollment Application</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-0 bg-slate-100 text-slate-400 cursor-not-allowed"
                          >
                            <Clock size={14} />
                            <span>Registration Deadline Passed</span>
                          </button>
                        )}
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
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">
                Official Federation Competition Results
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified race and field results ratified by the Ethiopian Athletics Federation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <ShieldCheck size={14} /> Certified Results ({backendResults.length})
              </span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center gap-3 text-xs shadow-2xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search athlete, club, or discipline..."
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 shrink-0">Discipline:</label>
              <select
                value={resultsDisciplineFilter}
                onChange={(e) => setResultsDisciplineFilter(e.target.value)}
                className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Disciplines ({availableResultsDisciplines.length})</option>
                {availableResultsDisciplines.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 shrink-0">Round:</label>
              <select
                value={resultsRoundFilter}
                onChange={(e) => setResultsRoundFilter(e.target.value)}
                className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Rounds</option>
                <option value="FINAL">Championship Finals</option>
                <option value="SEMIS">Semi-Finals</option>
                <option value="HEATS">Preliminary Heats</option>
              </select>
            </div>

            {(resultsSearch || resultsDisciplineFilter !== 'ALL' || resultsRoundFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setResultsSearch('');
                  setResultsDisciplineFilter('ALL');
                  setResultsRoundFilter('ALL');
                }}
                className="text-xs text-blue-600 font-bold hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredBackendResults.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 bg-white text-slate-400 space-y-2">
              <Medal size={40} className="mx-auto opacity-30 text-slate-500" />
              <p className="font-bold text-sm text-slate-700">No competition results match the current filters.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Official times, heats, and certified standings are published directly by the EAF secretariat upon referee ratification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBackendResults.map((result: any, idx: number) => {
                const entriesToShow = Array.isArray(result.entries) && result.entries.length > 0
                  ? result.entries
                  : Array.isArray(result.top3Preview)
                  ? result.top3Preview
                  : [];

                return (
                  <div
                    key={result.id || idx}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3.5 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    {/* Discipline & Round Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base text-slate-900">{result.discipline}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                            {formatRoundLabel(result.round)}
                          </span>
                          {result.gender && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {result.gender}
                            </span>
                          )}
                          {result.category && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium m-0 flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-800 font-bold">{result.eventTitle || result.eventName || 'Competition'}</span>
                          <span>•</span>
                          <span>{result.venue || 'Addis Ababa Stadium'}</span>
                          {result.windReading && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-700 font-semibold">Wind: {result.windReading}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-500 block">{result.date || 'Recent'}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                          <ShieldCheck size={13} /> {result.statusLabel || 'Official Result'}
                        </span>
                      </div>
                    </div>

                    {/* Finishers Preview */}
                    {entriesToShow.length > 0 ? (
                      <div className="space-y-1.5">
                        {entriesToShow.slice(0, 5).map((e: any, posIdx: number) => {
                          const athleteName = e.athleteName || e.name || 'Athlete';
                          const clubName = e.clubName || e.club || 'Independent';
                          const mark = e.time || e.mark || e.performance || '-';
                          const pos = e.position != null ? e.position : e.rank != null ? e.rank : posIdx + 1;
                          const isOurClub = club?.name && (
                            clubName.toLowerCase() === club.name.toLowerCase() ||
                            (e.clubId && e.clubId === clubId)
                          );

                          return (
                            <div
                              key={e.id || posIdx}
                              className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                                isOurClub
                                  ? 'bg-blue-50/70 border border-blue-200'
                                  : 'bg-slate-50 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-bold text-slate-500 font-mono w-5 text-center shrink-0">
                                  {pos === 1 || e.medal === 'GOLD' ? '🥇' : pos === 2 || e.medal === 'SILVER' ? '🥈' : pos === 3 || e.medal === 'BRONZE' ? '🥉' : `#${pos}`}
                                </span>
                                {e.bibNo && (
                                  <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                    #{e.bibNo}
                                  </span>
                                )}
                                <span className={`font-bold truncate ${isOurClub ? 'text-blue-900' : 'text-slate-800'}`}>
                                  {athleteName}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate">
                                  ({clubName})
                                </span>
                                {isOurClub && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shrink-0">
                                    Your Club
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {e.lane && (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    L{e.lane}
                                  </span>
                                )}
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {mark}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic">
                        Results officially verified. Awaiting complete athlete breakdown publication.
                      </div>
                    )}

                    {/* View Full Results Button */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Total Finishers: <strong>{result.totalFinishers || entriesToShow.length}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedResultDetail(result)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Full Result Sheet</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Result Sheet Modal */}
          {selectedResultDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 m-0">
                        {selectedResultDetail.discipline} · {formatRoundLabel(selectedResultDetail.round)}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <ShieldCheck size={12} /> {selectedResultDetail.statusLabel || 'Official Result'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 m-0">
                      {selectedResultDetail.eventTitle} • {selectedResultDetail.venue || 'Addis Ababa Stadium'} • {selectedResultDetail.date}
                      {selectedResultDetail.windReading ? ` • Wind: ${selectedResultDetail.windReading}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResultDetail(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Pos</th>
                        <th className="py-2.5 px-2">Bib</th>
                        <th className="py-2.5 px-3">Athlete</th>
                        <th className="py-2.5 px-3">Club / Delegation</th>
                        <th className="py-2.5 px-2 text-center">Heat/Lane</th>
                        <th className="py-2.5 px-3 text-right">Official Mark</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(selectedResultDetail.entries || selectedResultDetail.top3Preview || []).map((entry: any, i: number) => {
                        const athName = entry.athleteName || entry.name || 'Athlete';
                        const clName = entry.clubName || entry.club || 'Independent';
                        const markVal = entry.time || entry.mark || entry.performance || '-';
                        const positionVal = entry.position != null ? entry.position : entry.rank != null ? entry.rank : i + 1;
                        const isOurs = club?.name && clName.toLowerCase() === club.name.toLowerCase();

                        return (
                          <tr key={entry.id || i} className={isOurs ? 'bg-blue-50/70' : 'hover:bg-slate-50'}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                              {positionVal === 1 ? '🥇 1' : positionVal === 2 ? '🥈 2' : positionVal === 3 ? '🥉 3' : positionVal}
                            </td>
                            <td className="py-2.5 px-2 font-mono text-slate-500">
                              {entry.bibNo || entry.bib || '-'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{athName}</span>
                                {isOurs && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white uppercase">
                                    Your Club
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {clName}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                              {entry.heat ? `H${entry.heat}` : ''} {entry.lane ? `L${entry.lane}` : ''}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                              {markVal}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                entry.status === 'DQ' ? 'bg-red-100 text-red-700' :
                                entry.status === 'DNF' ? 'bg-amber-100 text-amber-700' :
                                entry.status === 'DNS' ? 'bg-slate-100 text-slate-600' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {entry.status || 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Officially Ratified by EAF Competition Secretariat
                  </span>
                  <button
                    onClick={() => setSelectedResultDetail(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Close Result Sheet
                  </button>
                </div>
              </div>
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

              {/* If relay squad was submitted with the application */}
              {(viewingApplication as any).relaySquad && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                        Official Relay Squad
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {(viewingApplication as any).relaySquad.teamName || 'Relay Squad'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-600 text-white">
                      {(viewingApplication as any).relaySquad.discipline}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div>Format: <strong className="text-slate-800">{(viewingApplication as any).relaySquad.format}</strong></div>
                    <div>Division: <strong className="text-slate-800">{(viewingApplication as any).relaySquad.gender}</strong></div>
                    {(viewingApplication as any).relaySquad.seedTime && (
                      <div>Seed Mark: <strong className="font-mono text-slate-800">{(viewingApplication as any).relaySquad.seedTime}</strong></div>
                    )}
                  </div>
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
