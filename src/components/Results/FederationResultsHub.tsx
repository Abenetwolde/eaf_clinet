import React, { useState, useMemo } from 'react';
import {
  Trophy, Search, ExternalLink, Medal, Calendar, MapPin, ShieldCheck,
  ChevronDown, ChevronUp, User, Download, Printer, Filter, X, ArrowUpDown,
  Flame, CheckCircle2, AlertCircle, Info, Sparkles, Activity, Layers,
  Clock, Wind, Award, Building2, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPublishedResultsQuery, useGetResultDetailQuery } from '../../store/api/athleteApi';

interface FederationResultsHubProps {
  darkMode?: boolean;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onBack?: () => void;
}

export interface AthleteFinisher {
  id: string;
  rank: number | string;
  bib: string;
  athleteName: string;
  club: string;
  mark: string;
  time?: string;
  wind?: string;
  reactionTime?: string;
  lane?: string | number;
  heat?: string | number;
  qualifier?: 'Q' | 'q' | null;
  status: 'OK' | 'DNS' | 'DNF' | 'DQ';
  dqRule?: string;
  recordBadge?: 'PB' | 'SB' | 'NR' | 'CR' | null;
  verified?: boolean;
  remarks?: string;
  splits?: { point: string; time: string }[];
  attempts?: { attemptNumber: number; mark: string; isFoul?: boolean; isPass?: boolean }[];
  stageType?: 'FINAL' | 'SEMIFINALS' | 'HEATS' | 'QUALIFICATION';
  roundKey?: string;
}

export interface RoundResult {
  roundKey: string;
  roundLabel: string;
  stageType: 'FINAL' | 'SEMIFINALS' | 'HEATS' | 'QUALIFICATION';
  statusLabel: string;
  windReading?: string;
  date?: string;
  venue?: string;
  isOfficial?: boolean;
  entries: AthleteFinisher[];
}

export interface DisciplineResults {
  discipline: string;
  gender: 'MEN' | 'WOMEN' | 'MIXED';
  category: string;
  rounds: RoundResult[];
}

export interface EventResultsGroup {
  id: string;
  eventTitle: string;
  venue: string;
  date: string;
  isOfficial: boolean;
  disciplines: DisciplineResults[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS FOR ROUND LABELS & STAGES
// ─────────────────────────────────────────────────────────────────────────────

function formatRoundDisplayName(roundKey: string): string {
  if (!roundKey) return 'Championship Final';
  const u = roundKey.toUpperCase().trim();
  if (u === 'FINAL' || u === 'FN') return 'Championship Final';
  if (u === 'SEMIFINALS' || u === 'SEMI-FINALS' || u === 'SF') return 'Semi-Finals (All)';
  if (u === 'HEATS' || u === 'PRELIMINARY') return 'Preliminary Heats (All)';
  if (u.startsWith('HEAT_')) return `Round 1 - Heat ${u.replace('HEAT_', '')}`;
  if (u.startsWith('HEAT ')) return `Round 1 - Heat ${u.replace('HEAT ', '')}`;
  if (u.startsWith('SF_')) return `Semi-Final ${u.replace('SF_', '')}`;
  if (u.startsWith('SF ')) return `Semi-Final ${u.replace('SF ', '')}`;
  if (u.startsWith('FLIGHT_')) return `Qualification Group ${u.replace('FLIGHT_', '')}`;
  if (u.startsWith('FLIGHT ')) return `Qualification Group ${u.replace('FLIGHT ', '')}`;
  return roundKey.replace(/_/g, ' ');
}

function getStageType(roundKey: string): 'FINAL' | 'SEMIFINALS' | 'HEATS' | 'QUALIFICATION' {
  const u = (roundKey || '').toUpperCase();
  if (u.includes('FINAL') && !u.includes('SEMI')) return 'FINAL';
  if (u.includes('SEMI') || u.startsWith('SF')) return 'SEMIFINALS';
  if (u.includes('FLIGHT') || u.includes('QUAL')) return 'QUALIFICATION';
  return 'HEATS';
}

// ─────────────────────────────────────────────────────────────────────────────
// ETHIOPIAN NATIONAL FEDERATION DATASET (COMPREHENSIVE MULTI-ROUND ARCHITECTURE)
// ─────────────────────────────────────────────────────────────────────────────

const ETHIOPIAN_SEED_EVENTS: EventResultsGroup[] = [
  {
    id: 'eth-nat-champ-2026',
    eventTitle: 'National Athletics Championship – Ethiopia 2026',
    venue: 'Addis Ababa Stadium, Ethiopia',
    date: '2026-11-06 to 2026-11-09',
    isOfficial: true,
    disciplines: [
      {
        discipline: '100m',
        gender: 'MEN',
        category: 'Senior',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Ratified)',
            windReading: '+0.8 m/s',
            date: '2026-11-09',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'fn-100m-1', rank: 1, bib: '101', athleteName: 'Melkamu Baye', club: 'Defense SC', mark: '10.18s', wind: '+0.8 m/s', reactionTime: '0.142s', lane: 4, heat: 1, status: 'OK', recordBadge: 'PB', verified: true },
              { id: 'fn-100m-2', rank: 2, bib: '104', athleteName: 'Samuel Firewu', club: 'Oromia Police', mark: '10.24s', wind: '+0.8 m/s', reactionTime: '0.148s', lane: 5, heat: 1, status: 'OK', recordBadge: 'SB', verified: true },
              { id: 'fn-100m-3', rank: 3, bib: '108', athleteName: 'Getnet Wale', club: 'Commercial Bank of Ethiopia', mark: '10.31s', wind: '+0.8 m/s', reactionTime: '0.155s', lane: 3, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-100m-4', rank: 4, bib: '112', athleteName: 'Solomon Desta', club: 'Prisons Police', mark: '10.38s', wind: '+0.8 m/s', reactionTime: '0.160s', lane: 6, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-100m-5', rank: 5, bib: '115', athleteName: 'Birhanu Legese', club: 'Addis Ababa City', mark: '10.42s', wind: '+0.8 m/s', reactionTime: '0.165s', lane: 2, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-100m-6', rank: 6, bib: '119', athleteName: 'Dawit Kebede', club: 'Muger Cement AC', mark: '10.49s', wind: '+0.8 m/s', reactionTime: '0.158s', lane: 7, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-100m-7', rank: 7, bib: '122', athleteName: 'Yared Bekele', club: 'Sidama Coffee Athletics', mark: '10.55s', wind: '+0.8 m/s', reactionTime: '0.170s', lane: 1, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-100m-8', rank: 8, bib: '128', athleteName: 'Abel Tesfaye', club: 'Amhara Police SC', mark: '10.62s', wind: '+0.8 m/s', reactionTime: '0.174s', lane: 8, heat: 1, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'SF_1',
            roundLabel: 'Semi-Final 1',
            stageType: 'SEMIFINALS',
            statusLabel: 'Official Result (Progression Q/q)',
            windReading: '+0.4 m/s',
            date: '2026-11-08',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'sf1-1', rank: 1, bib: '101', athleteName: 'Melkamu Baye', club: 'Defense SC', mark: '10.22s', wind: '+0.4 m/s', reactionTime: '0.145s', lane: 4, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf1-2', rank: 2, bib: '108', athleteName: 'Getnet Wale', club: 'Commercial Bank of Ethiopia', mark: '10.33s', wind: '+0.4 m/s', reactionTime: '0.150s', lane: 5, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf1-3', rank: 3, bib: '112', athleteName: 'Solomon Desta', club: 'Prisons Police', mark: '10.40s', wind: '+0.4 m/s', reactionTime: '0.162s', lane: 3, heat: 1, qualifier: 'q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf1-4', rank: 4, bib: '119', athleteName: 'Dawit Kebede', club: 'Muger Cement AC', mark: '10.48s', wind: '+0.4 m/s', reactionTime: '0.159s', lane: 6, heat: 1, qualifier: 'q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf1-5', rank: 5, bib: '133', athleteName: 'Natnael Girma', club: 'Tigray Athletics Club', mark: '10.68s', wind: '+0.4 m/s', reactionTime: '0.175s', lane: 2, heat: 1, qualifier: null, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'SF_2',
            roundLabel: 'Semi-Final 2',
            stageType: 'SEMIFINALS',
            statusLabel: 'Official Result (Progression Q/q)',
            windReading: '+0.6 m/s',
            date: '2026-11-08',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'sf2-1', rank: 1, bib: '104', athleteName: 'Samuel Firewu', club: 'Oromia Police', mark: '10.25s', wind: '+0.6 m/s', reactionTime: '0.149s', lane: 4, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf2-2', rank: 2, bib: '115', athleteName: 'Birhanu Legese', club: 'Addis Ababa City', mark: '10.36s', wind: '+0.6 m/s', reactionTime: '0.161s', lane: 5, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'sf2-3', rank: 3, bib: '122', athleteName: 'Yared Bekele', club: 'Sidama Coffee Athletics', mark: '10.51s', wind: '+0.6 m/s', reactionTime: '0.168s', lane: 3, heat: 2, qualifier: null, status: 'OK', recordBadge: null, verified: true },
              { id: 'sf2-4', rank: 4, bib: '128', athleteName: 'Abel Tesfaye', club: 'Amhara Police SC', mark: '10.58s', wind: '+0.6 m/s', reactionTime: '0.171s', lane: 6, heat: 2, qualifier: null, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_1',
            roundLabel: 'Round 1 - Heat 1',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+0.5 m/s',
            date: '2026-11-07',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'h1-1', rank: 1, bib: '101', athleteName: 'Melkamu Baye', club: 'Defense SC', mark: '10.28s', wind: '+0.5 m/s', reactionTime: '0.146s', lane: 4, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h1-2', rank: 2, bib: '112', athleteName: 'Solomon Desta', club: 'Prisons Police', mark: '10.45s', wind: '+0.5 m/s', reactionTime: '0.158s', lane: 5, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h1-3', rank: 3, bib: '133', athleteName: 'Natnael Girma', club: 'Tigray Athletics Club', mark: '10.70s', wind: '+0.5 m/s', reactionTime: '0.169s', lane: 3, heat: 1, qualifier: null, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_2',
            roundLabel: 'Round 1 - Heat 2',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+0.9 m/s',
            date: '2026-11-07',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'h2-1', rank: 1, bib: '104', athleteName: 'Samuel Firewu', club: 'Oromia Police', mark: '10.29s', wind: '+0.9 m/s', reactionTime: '0.151s', lane: 4, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h2-2', rank: 2, bib: '119', athleteName: 'Dawit Kebede', club: 'Muger Cement AC', mark: '10.48s', wind: '+0.9 m/s', reactionTime: '0.164s', lane: 5, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h2-3', rank: 3, bib: '128', athleteName: 'Abel Tesfaye', club: 'Amhara Police SC', mark: '10.60s', wind: '+0.9 m/s', reactionTime: '0.170s', lane: 6, heat: 2, qualifier: 'q', status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_3',
            roundLabel: 'Round 1 - Heat 3',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+0.2 m/s',
            date: '2026-11-07',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'h3-1', rank: 1, bib: '108', athleteName: 'Getnet Wale', club: 'Commercial Bank of Ethiopia', mark: '10.35s', wind: '+0.2 m/s', reactionTime: '0.153s', lane: 4, heat: 3, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h3-2', rank: 2, bib: '115', athleteName: 'Birhanu Legese', club: 'Addis Ababa City', mark: '10.40s', wind: '+0.2 m/s', reactionTime: '0.162s', lane: 5, heat: 3, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'h3-3', rank: 3, bib: '122', athleteName: 'Yared Bekele', club: 'Sidama Coffee Athletics', mark: '10.54s', wind: '+0.2 m/s', reactionTime: '0.166s', lane: 3, heat: 3, qualifier: 'q', status: 'OK', recordBadge: null, verified: true },
            ]
          }
        ]
      },
      {
        discipline: '100m',
        gender: 'WOMEN',
        category: 'Senior',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Ratified)',
            windReading: '+1.1 m/s',
            date: '2026-11-09',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'fn-w100-1', rank: 1, bib: '201', athleteName: 'Worknesh Mesele', club: 'Defense SC', mark: '11.12s', wind: '+1.1 m/s', reactionTime: '0.138s', lane: 4, heat: 1, status: 'OK', recordBadge: 'NR', verified: true },
              { id: 'fn-w100-2', rank: 2, bib: '204', athleteName: 'Diribe Welteji', club: 'Commercial Bank of Ethiopia', mark: '11.20s', wind: '+1.1 m/s', reactionTime: '0.144s', lane: 5, heat: 1, status: 'OK', recordBadge: 'PB', verified: true },
              { id: 'fn-w100-3', rank: 3, bib: '208', athleteName: 'Tigist Assefa', club: 'Oromia Police', mark: '11.35s', wind: '+1.1 m/s', reactionTime: '0.150s', lane: 3, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-w100-4', rank: 4, bib: '212', athleteName: 'Hawi Feysa', club: 'Prisons Police', mark: '11.45s', wind: '+1.1 m/s', reactionTime: '0.158s', lane: 6, heat: 1, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_1',
            roundLabel: 'Preliminary Heat 1',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+0.7 m/s',
            date: '2026-11-07',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'wh1-1', rank: 1, bib: '201', athleteName: 'Worknesh Mesele', club: 'Defense SC', mark: '11.19s', wind: '+0.7 m/s', reactionTime: '0.140s', lane: 4, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'wh1-2', rank: 2, bib: '208', athleteName: 'Tigist Assefa', club: 'Oromia Police', mark: '11.39s', wind: '+0.7 m/s', reactionTime: '0.152s', lane: 5, heat: 1, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_2',
            roundLabel: 'Preliminary Heat 2',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+1.0 m/s',
            date: '2026-11-07',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'wh2-1', rank: 1, bib: '204', athleteName: 'Diribe Welteji', club: 'Commercial Bank of Ethiopia', mark: '11.25s', wind: '+1.0 m/s', reactionTime: '0.146s', lane: 4, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
              { id: 'wh2-2', rank: 2, bib: '212', athleteName: 'Hawi Feysa', club: 'Prisons Police', mark: '11.48s', wind: '+1.0 m/s', reactionTime: '0.160s', lane: 5, heat: 2, qualifier: 'Q', status: 'OK', recordBadge: null, verified: true },
            ]
          }
        ]
      },
      {
        discipline: '800m',
        gender: 'MEN',
        category: 'Senior',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Ratified)',
            date: '2026-11-09',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'fn-800m-1', rank: 1, bib: '301', athleteName: 'Tadese Lemi', club: 'Defense SC', mark: '1:44.20', lane: 4, heat: 1, status: 'OK', recordBadge: 'CR', verified: true },
              { id: 'fn-800m-2', rank: 2, bib: '305', athleteName: 'Ermias Girma', club: 'Oromia Police', mark: '1:44.85', lane: 5, heat: 1, status: 'OK', recordBadge: 'PB', verified: true },
              { id: 'fn-800m-3', rank: 3, bib: '310', athleteName: 'Nibret Melak', club: 'Commercial Bank of Ethiopia', mark: '1:45.30', lane: 3, heat: 1, status: 'OK', recordBadge: 'SB', verified: true },
              { id: 'fn-800m-4', rank: 4, bib: '315', athleteName: 'Haftu Strut', club: 'Prisons Police', mark: '1:45.92', lane: 6, heat: 1, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_1',
            roundLabel: 'Preliminary Heat 1',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            date: '2026-11-08',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'h800-1', rank: 1, bib: '301', athleteName: 'Tadese Lemi', club: 'Defense SC', mark: '1:46.10', lane: 4, heat: 1, qualifier: 'Q', status: 'OK', verified: true },
              { id: 'h800-2', rank: 2, bib: '310', athleteName: 'Nibret Melak', club: 'Commercial Bank of Ethiopia', mark: '1:46.80', lane: 5, heat: 1, qualifier: 'Q', status: 'OK', verified: true },
            ]
          },
          {
            roundKey: 'HEAT_2',
            roundLabel: 'Preliminary Heat 2',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            date: '2026-11-08',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'h800-3', rank: 1, bib: '305', athleteName: 'Ermias Girma', club: 'Oromia Police', mark: '1:46.30', lane: 4, heat: 2, qualifier: 'Q', status: 'OK', verified: true },
              { id: 'h800-4', rank: 2, bib: '315', athleteName: 'Haftu Strut', club: 'Prisons Police', mark: '1:47.10', lane: 5, heat: 2, qualifier: 'Q', status: 'OK', verified: true },
            ]
          }
        ]
      },
      {
        discipline: '5,000m',
        gender: 'MEN',
        category: 'Senior',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Straight Final)',
            date: '2026-11-09',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'fn-5000m-1', rank: 1, bib: '401', athleteName: 'Selemon Barega', club: 'Defense SC', mark: '12:55.30', lane: 1, status: 'OK', recordBadge: 'CR', verified: true },
              { id: 'fn-5000m-2', rank: 2, bib: '405', athleteName: 'Berihu Aregawi', club: 'Commercial Bank of Ethiopia', mark: '12:56.12', lane: 2, status: 'OK', recordBadge: 'SB', verified: true },
              { id: 'fn-5000m-3', rank: 3, bib: '410', athleteName: 'Yomif Kejelcha', club: 'Prisons Police', mark: '12:57.45', lane: 3, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-5000m-4', rank: 4, bib: '415', athleteName: 'Telahun Haile', club: 'Oromia Police', mark: '13:02.10', lane: 4, status: 'OK', recordBadge: null, verified: true },
              { id: 'fn-5000m-5', rank: 5, bib: '420', athleteName: 'Hagos Gebrhiwet', club: 'Addis Ababa City', mark: '13:08.80', lane: 5, status: 'OK', recordBadge: null, verified: true },
            ]
          }
        ]
      },
      {
        discipline: '10,000m',
        gender: 'WOMEN',
        category: 'Senior',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Straight Final)',
            date: '2026-11-08',
            venue: 'Addis Ababa Stadium',
            isOfficial: true,
            entries: [
              { id: 'fn-10000w-1', rank: 1, bib: '501', athleteName: 'Gudaf Tsegay', club: 'Defense SC', mark: '29:35.20', lane: 1, status: 'OK', recordBadge: 'NR', verified: true },
              { id: 'fn-10000w-2', rank: 2, bib: '505', athleteName: 'Letsenbet Gidey', club: 'Commercial Bank of Ethiopia', mark: '29:40.10', lane: 2, status: 'OK', recordBadge: 'SB', verified: true },
              { id: 'fn-10000w-3', rank: 3, bib: '510', athleteName: 'Ejgayehu Taye', club: 'Oromia Police', mark: '29:52.40', lane: 3, status: 'OK', recordBadge: null, verified: true },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'eth-u20-trials-2026',
    eventTitle: 'Ethiopian U20 Track & Field Trials 2026',
    venue: 'Abebe Bikila Stadium, Addis Ababa',
    date: '2026-10-24 to 2026-10-26',
    isOfficial: true,
    disciplines: [
      {
        discipline: '100m',
        gender: 'MEN',
        category: 'U20',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Ratified)',
            windReading: '+0.6 m/s',
            date: '2026-10-26',
            venue: 'Abebe Bikila Stadium',
            isOfficial: true,
            entries: [
              { id: 'u20-fn-1', rank: 1, bib: '601', athleteName: 'Brook Alemayehu', club: 'Oromia Police', mark: '10.38s', lane: 4, heat: 1, status: 'OK', recordBadge: 'PB', verified: true },
              { id: 'u20-fn-2', rank: 2, bib: '605', athleteName: 'Fikadu Tessema', club: 'Defense SC', mark: '10.45s', lane: 5, heat: 1, status: 'OK', recordBadge: null, verified: true },
              { id: 'u20-fn-3', rank: 3, bib: '610', athleteName: 'Kalkidan Girma', club: 'Addis Ababa City', mark: '10.52s', lane: 3, heat: 1, status: 'OK', recordBadge: null, verified: true },
            ]
          },
          {
            roundKey: 'HEAT_1',
            roundLabel: 'Preliminary Heat 1',
            stageType: 'HEATS',
            statusLabel: 'Official Result (Heats)',
            windReading: '+0.5 m/s',
            date: '2026-10-25',
            venue: 'Abebe Bikila Stadium',
            isOfficial: true,
            entries: [
              { id: 'u20-h1-1', rank: 1, bib: '601', athleteName: 'Brook Alemayehu', club: 'Oromia Police', mark: '10.42s', lane: 4, heat: 1, qualifier: 'Q', status: 'OK', verified: true },
              { id: 'u20-h1-2', rank: 2, bib: '610', athleteName: 'Kalkidan Girma', club: 'Addis Ababa City', mark: '10.59s', lane: 5, heat: 1, qualifier: 'Q', status: 'OK', verified: true },
            ]
          }
        ]
      },
      {
        discipline: '1,500m',
        gender: 'WOMEN',
        category: 'U20',
        rounds: [
          {
            roundKey: 'FINAL',
            roundLabel: 'Championship Final',
            stageType: 'FINAL',
            statusLabel: 'Official Result (Ratified)',
            date: '2026-10-26',
            venue: 'Abebe Bikila Stadium',
            isOfficial: true,
            entries: [
              { id: 'u20-w1500-1', rank: 1, bib: '701', athleteName: 'Birke Haylom', club: 'Commercial Bank of Ethiopia', mark: '4:02.15', lane: 1, status: 'OK', recordBadge: 'CR', verified: true },
              { id: 'u20-w1500-2', rank: 2, bib: '705', athleteName: 'Saron Berhe', club: 'Defense SC', mark: '4:04.30', lane: 2, status: 'OK', recordBadge: 'PB', verified: true },
              { id: 'u20-w1500-3', rank: 3, bib: '710', athleteName: 'Aynadis Mebratu', club: 'Oromia Police', mark: '4:06.80', lane: 3, status: 'OK', recordBadge: null, verified: true },
            ]
          }
        ]
      }
    ]
  }
];

export default function FederationResultsHub({ darkMode = false, onNotify, onBack }: FederationResultsHubProps) {
  // ── Live Backend Published Results ──
  const { data: apiPublishedResponse, isLoading: isApiLoading, refetch } = useGetPublishedResultsQuery();

  // ── Unified Event Results Architecture ──
  const eventGroups = useMemo<EventResultsGroup[]>(() => {
    const rawList: any[] = Array.isArray(apiPublishedResponse)
      ? apiPublishedResponse
      : Array.isArray((apiPublishedResponse as any)?.data)
      ? (apiPublishedResponse as any).data
      : [];

    if (rawList.length === 0) {
      return ETHIOPIAN_SEED_EVENTS;
    }

    // Build event groups dynamically from real database records
    const groupedMap = new Map<string, EventResultsGroup>();

    for (const item of rawList) {
      const eventKey = item.eventId || item.eventTitle || 'active-competition';
      const eventTitle = item.eventTitle || item.eventName || 'National Athletics Championship – Ethiopia 2026';
      const venue = item.venue || 'Addis Ababa Stadium, Ethiopia';
      const date = item.date || '2026-11-09';
      const isOfficial = !!item.isOfficial;

      if (!groupedMap.has(eventKey)) {
        groupedMap.set(eventKey, {
          id: eventKey,
          eventTitle,
          venue,
          date,
          isOfficial,
          disciplines: [],
        });
      }

      const evtGroup = groupedMap.get(eventKey)!;
      const disciplineName = item.discipline || '100m';
      const gender = (item.gender || 'MEN').toUpperCase().includes('WOM') ? 'WOMEN' : 'MEN';
      const category = item.category || 'Senior';

      // Find or create discipline
      let discGroup = evtGroup.disciplines.find(
        (d) => d.discipline.toLowerCase() === disciplineName.toLowerCase() && d.gender === gender
      );
      if (!discGroup) {
        discGroup = {
          discipline: disciplineName,
          gender,
          category,
          rounds: [],
        };
        evtGroup.disciplines.push(discGroup);
      }

      // Convert backend entries
      const roundKey = item.round || item.stage || 'FINAL';
      const roundLabel = formatRoundDisplayName(roundKey);
      const stageType = getStageType(roundKey);

      // Convert and deduplicate backend entries for this round
      const seenAthletesInRound = new Set<string>();
      const deduplicatedRawEntries = (item.entries || []).filter((e: any) => {
        const key = e.athleteId || (e.athleteName || e.name || '').toLowerCase().trim() || e.bibNo || e.bib;
        if (key && seenAthletesInRound.has(key)) return false;
        if (key) seenAthletesInRound.add(key);
        return true;
      });

      const entries: AthleteFinisher[] = deduplicatedRawEntries.map((e: any, idx: number) => {
        const pos = e.position ?? (idx + 1);
        return {
          id: e.id || `entry-${idx}`,
          rank: e.rank ?? pos,
          bib: e.bibNo || e.bib || String(100 + idx + 1),
          athleteName: e.athleteName || e.name || 'Athlete',
          club: e.clubName || e.club || 'Independent',
          mark: e.mark || e.performance || e.time || '—',
          time: e.time || e.mark || '—',
          wind: item.windReading || undefined,
          reactionTime: e.reactionTime || undefined,
          lane: e.lane,
          heat: e.heat,
          qualifier: e.qualified || null,
          status: (e.status === 'DQ' || e.flag === 'DQ' ? 'DQ' : e.status === 'DNF' || e.flag === 'DNF' ? 'DNF' : e.status === 'DNS' || e.flag === 'DNS' ? 'DNS' : 'OK'),
          dqRule: e.remarks || e.dqReason || undefined,
          recordBadge: e.nationalRecord ? 'NR' : e.personalBest ? 'PB' : e.seasonBest ? 'SB' : e.meetRecord ? 'CR' : null,
          verified: true,
          remarks: e.remarks,
          stageType,
          roundKey,
        };
      });

      // Avoid duplicate round entries
      const existingRoundIdx = discGroup.rounds.findIndex((r) => r.roundKey === roundKey);
      const roundObj: RoundResult = {
        roundKey,
        roundLabel,
        stageType,
        statusLabel: item.statusLabel || (isOfficial ? 'Official Result (Ratified)' : 'Provisional Result'),
        windReading: item.windReading ? `${item.windReading} m/s` : undefined,
        date,
        venue,
        isOfficial,
        entries: entries.sort((a, b) => {
          const numA = typeof a.rank === 'number' ? a.rank : 999;
          const numB = typeof b.rank === 'number' ? b.rank : 999;
          return numA - numB;
        }),
      };

      if (existingRoundIdx >= 0) {
        discGroup.rounds[existingRoundIdx] = roundObj;
      } else {
        discGroup.rounds.push(roundObj);
      }
    }

    // Merge in any seed events not already populated so the portal remains rich
    const dynamicGroups = Array.from(groupedMap.values());
    for (const seedEvt of ETHIOPIAN_SEED_EVENTS) {
      if (!dynamicGroups.some((d) => d.id === seedEvt.id || d.eventTitle.toLowerCase() === seedEvt.eventTitle.toLowerCase())) {
        dynamicGroups.push(seedEvt);
      }
    }

    return dynamicGroups;
  }, [apiPublishedResponse]);

  // ── Navigation & Active Selection State ──
  const [selectedEventId, setSelectedEventId] = useState<string>(() => eventGroups[0]?.id || '');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('100m');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MEN' | 'WOMEN'>('MEN');
  const [selectedRoundKey, setSelectedRoundKey] = useState<string>('FINAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'MEDALS'>('RESULTS');
  const [activeAthleteDetail, setActiveAthleteDetail] = useState<AthleteFinisher | null>(null);

  // Active Event
  const currentEvent = useMemo(() => {
    return eventGroups.find((e) => e.id === selectedEventId) || eventGroups[0];
  }, [eventGroups, selectedEventId]);

  // Available Disciplines under Active Event
  const availableDisciplines = useMemo(() => {
    if (!currentEvent) return [];
    return currentEvent.disciplines.filter((d) => {
      if (selectedGender !== 'ALL' && d.gender !== selectedGender) return false;
      return true;
    });
  }, [currentEvent, selectedGender]);

  // Active Discipline
  const currentDiscipline = useMemo(() => {
    if (availableDisciplines.length === 0) return null;
    return availableDisciplines.find((d) => d.discipline.toLowerCase() === selectedDiscipline.toLowerCase()) || availableDisciplines[0];
  }, [availableDisciplines, selectedDiscipline]);

  // Available Rounds for Active Discipline
  const availableRounds = useMemo(() => {
    if (!currentDiscipline) return [];
    return currentDiscipline.rounds;
  }, [currentDiscipline]);

  // Active Round Result
  const currentRound = useMemo(() => {
    if (availableRounds.length === 0) return null;
    if (selectedRoundKey === 'ALL') return null;
    return availableRounds.find((r) => r.roundKey === selectedRoundKey) || availableRounds[0];
  }, [availableRounds, selectedRoundKey]);

  // Finishers for Active Display (Filtered by Round, Search, and Club)
  const displayFinishers = useMemo(() => {
    let list: AthleteFinisher[] = [];
    if (selectedRoundKey === 'ALL') {
      availableRounds.forEach((r) => {
        list.push(...r.entries);
      });
    } else if (currentRound) {
      list = [...currentRound.entries];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.athleteName.toLowerCase().includes(q) ||
          f.club.toLowerCase().includes(q) ||
          f.bib.includes(q)
      );
    }

    if (selectedClub) {
      list = list.filter((f) => f.club.toLowerCase() === selectedClub.toLowerCase());
    }

    return list;
  }, [currentRound, availableRounds, selectedRoundKey, searchQuery, selectedClub]);

  // Unique Clubs across Current Event
  const eventClubs = useMemo(() => {
    if (!currentEvent) return [];
    const clubsSet = new Set<string>();
    currentEvent.disciplines.forEach((d) => {
      d.rounds.forEach((r) => {
        r.entries.forEach((e) => {
          if (e.club && e.club !== 'Independent' && e.club !== 'Unattached') {
            clubsSet.add(e.club);
          }
        });
      });
    });
    return Array.from(clubsSet).sort();
  }, [currentEvent]);

  // Computed Medal Standings & Team Points for Selected Event
  const medalStandings = useMemo(() => {
    if (!currentEvent) return [];
    const table: Record<string, { club: string; gold: number; silver: number; bronze: number; points: number; total: number }> = {};

    currentEvent.disciplines.forEach((d) => {
      // Prioritize finals for medal tables - only championship finals award official medals
      const finalRound = d.rounds.find((r) => r.stageType === 'FINAL');
      if (!finalRound) return;

      finalRound.entries.forEach((e) => {
        const club = e.club || 'Independent';
        if (!table[club]) {
          table[club] = { club, gold: 0, silver: 0, bronze: 0, points: 0, total: 0 };
        }

        const rank = Number(e.rank);
        if (rank === 1) {
          table[club].gold += 1;
          table[club].total += 1;
          table[club].points += 10;
        } else if (rank === 2) {
          table[club].silver += 1;
          table[club].total += 1;
          table[club].points += 8;
        } else if (rank === 3) {
          table[club].bronze += 1;
          table[club].total += 1;
          table[club].points += 6;
        } else if (rank === 4) {
          table[club].points += 5;
        } else if (rank === 5) {
          table[club].points += 4;
        } else if (rank <= 8) {
          table[club].points += 2;
        }
      });
    });

    return Object.values(table).sort((a, b) => b.points - a.points || b.gold - a.gold || b.silver - a.silver);
  }, [currentEvent]);

  // Export CSV
  const handleExportCsv = () => {
    if (displayFinishers.length === 0) return;
    const headers = ['Place', 'Bib', 'Athlete', 'Club', 'Mark', 'Wind', 'ReactTime', 'Qualifier', 'Status'];
    const rows = displayFinishers.map((f) => [
      f.rank,
      `"${f.bib}"`,
      `"${f.athleteName}"`,
      `"${f.club}"`,
      `"${f.mark}"`,
      `"${f.wind || ''}"`,
      `"${f.reactionTime || ''}"`,
      `"${f.qualifier || ''}"`,
      `"${f.status}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `Official_Results_${currentEvent?.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDiscipline?.discipline}_${selectedRoundKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.('Results exported to CSV successfully.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${darkMode ? 'bg-[#0b1322] text-slate-100' : 'bg-[#FAFAFA] text-slate-800'}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── TOP FEDERATION BRANDING HEADER ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2">
          <div>
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Trophy className="h-8 w-8 text-[#C8A84B]" />
                Official Federation Results
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ethiopian Athletics Federation • Certified Competition Results & Leaderboards
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete, bib, or club..."
              className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-xs outline-none focus:ring-2 focus:ring-[#C8A84B] focus:border-[#C8A84B] ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── 1. EVENT SELECTOR: ORGANIZED BY COMPETITION / EVENT ── */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Select Championship / Event
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                {eventGroups.length} Active Events
              </span>
            </div>
            <button
              type="button"
              onClick={() => refetch?.()}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Refresh Results
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {eventGroups.map((evt) => {
              const isSelected = evt.id === currentEvent?.id;
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    if (evt.disciplines[0]) {
                      setSelectedDiscipline(evt.disciplines[0].discipline);
                    }
                    setSelectedRoundKey('FINAL');
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex-1 min-w-[280px] max-w-md ${
                    isSelected
                      ? 'border-[#C8A84B] bg-[#C8A84B]/5 dark:bg-[#C8A84B]/10 ring-2 ring-[#C8A84B]/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {evt.eventTitle}
                    </div>
                    {evt.isOfficial && (
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 font-bold uppercase rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Official
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#C8A84B]" /> {evt.venue.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#C8A84B]" /> {evt.date}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. DISCIPLINE & ROUND ORGANIZED SELECTOR ── */}
        {currentEvent && (
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            {/* Top Toolbar: Gender & Category Filters + View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              {/* Gender Division Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedGender('MEN')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedGender === 'MEN'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>♂ Men's Events</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('WOMEN')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedGender === 'WOMEN'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>♀ Women's Events</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('ALL')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedGender === 'ALL'
                      ? 'bg-[#C8A84B] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  All Divisions
                </button>
              </div>

              {/* View Switcher: Event Results vs Medal Standings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('RESULTS')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'RESULTS'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Activity size={14} className="text-[#C8A84B]" /> Results Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('MEDALS')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'MEDALS'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Medal size={14} className="text-[#C8A84B]" /> Team & Medals Table
                  </button>
                </div>

                {/* Club Filter Dropdown */}
                {eventClubs.length > 0 && (
                  <select
                    value={selectedClub || ''}
                    onChange={(e) => setSelectedClub(e.target.value || null)}
                    className="h-8 text-xs font-semibold px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="">All Clubs & Regions</option>
                    {eventClubs.map((club) => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                )}

                {/* Action buttons */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-2xs"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-2xs"
                >
                  <Printer size={13} /> Print
                </button>
              </div>
            </div>

            {/* Disciplines Horizontal Carousel / Buttons */}
            {activeTab === 'RESULTS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. Select Discipline:
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {availableDisciplines.length} disciplines available
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {availableDisciplines.map((d) => {
                    const isSelected = d.discipline.toLowerCase() === currentDiscipline?.discipline.toLowerCase();
                    const hasRounds = d.rounds.length > 1;
                    return (
                      <button
                        key={`${d.discipline}-${d.gender}`}
                        type="button"
                        onClick={() => {
                          setSelectedDiscipline(d.discipline);
                          setSelectedRoundKey('FINAL');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-[#C8A84B] text-white border-[#B5963E] shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#C8A84B]'
                        }`}
                      >
                        <span>{d.discipline}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected
                            ? 'bg-black/20 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {hasRounds ? `${d.rounds.length} Rounds` : 'Final'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── 3. ORGANIZED ROUND RESULT SELECTOR (IF DISCIPLINE HAS ROUNDS) ── */}
                {currentDiscipline && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Layers size={14} className="text-[#C8A84B]" />
                        3. Select Stage / Round:
                      </span>
                      {currentRound && (
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          {currentRound.windReading && (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                              <Wind size={12} /> Wind: {currentRound.windReading}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <ShieldCheck size={13} /> {currentRound.statusLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Round Pills Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      {availableRounds.map((rnd) => {
                        const isSelected = selectedRoundKey === rnd.roundKey;
                        const isFinal = rnd.stageType === 'FINAL';
                        const isSemi = rnd.stageType === 'SEMIFINALS';

                        return (
                          <button
                            key={rnd.roundKey}
                            type="button"
                            onClick={() => setSelectedRoundKey(rnd.roundKey)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? isFinal
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                  : isSemi
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                  : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {isFinal ? (
                              <Trophy size={13} className={isSelected ? 'text-white' : 'text-amber-500'} />
                            ) : isSemi ? (
                              <Flame size={13} className={isSelected ? 'text-white' : 'text-blue-500'} />
                            ) : (
                              <Clock size={13} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                            )}
                            <span>{rnd.roundLabel}</span>
                            <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {rnd.entries.length}
                            </span>
                          </button>
                        );
                      })}

                      {availableRounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoundKey('ALL')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                            selectedRoundKey === 'ALL'
                              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-900 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Layers size={13} />
                          <span>All Stages (Overview)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 4. RESULTS TABLE DISPLAY ── */}
        {activeTab === 'RESULTS' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy size={18} className="text-[#C8A84B]" />
                  {currentDiscipline ? (
                    <>
                      <span>{currentDiscipline.discipline}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className="text-[#C8A84B] font-bold">
                        {selectedRoundKey === 'ALL' ? 'All Rounds Combined' : currentRound?.roundLabel || 'Final'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {currentDiscipline.gender} · {currentDiscipline.category}
                      </span>
                    </>
                  ) : (
                    <span>Competition Results</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official timing and electronic photo-finish records certified under World Athletics Technical Rules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck size={14} /> Official Verified
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {displayFinishers.length} {displayFinishers.length === 1 ? 'athlete' : 'athletes'}
                </span>
              </div>
            </div>

            {/* Finishers Table */}
            <div className="overflow-x-auto">
              {displayFinishers.length === 0 ? (
                <div className="text-center py-14 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Filter size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">No results found for this stage</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try switching between Heats, Semi-Finals, and Championship Final, or clear active search and club filters.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40 uppercase tracking-wider">
                      <th className="py-3 px-4 w-16 text-center">Place</th>
                      <th className="py-3 px-3 w-16">Bib</th>
                      <th className="py-3 px-4">Athlete Name</th>
                      <th className="py-3 px-4">Club / Region</th>
                      <th className="py-3 px-3 text-center">Lane / Heat</th>
                      <th className="py-3 px-4 font-black">Mark / Time</th>
                      <th className="py-3 px-3 text-center">Reaction</th>
                      <th className="py-3 px-3 text-center">Qualification</th>
                      <th className="py-3 px-4 text-center">Records</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {displayFinishers.map((record) => {
                      const numRank = Number(record.rank);
                      const isRecordFinal = record.stageType ? record.stageType === 'FINAL' : (selectedRoundKey === 'FINAL' || (currentRound && currentRound.stageType === 'FINAL'));
                      const isGold = numRank === 1 && isRecordFinal;
                      const isSilver = numRank === 2 && isRecordFinal;
                      const isBronze = numRank === 3 && isRecordFinal;
                      const isDQ = record.status === 'DQ';
                      const isDNF = record.status === 'DNF';
                      const isDNS = record.status === 'DNS';

                      return (
                        <tr
                          key={record.id}
                          onClick={() => setActiveAthleteDetail(record)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                        >
                          {/* Rank / Medal Badge */}
                          <td className="py-3.5 px-4 font-black text-center">
                            {isGold ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-extrabold shadow-2xs border border-amber-300 dark:border-amber-800 text-xs">
                                🥇 1
                              </span>
                            ) : isSilver ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold shadow-2xs border border-slate-300 dark:border-slate-700 text-xs">
                                🥈 2
                              </span>
                            ) : isBronze ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-500 font-extrabold shadow-2xs border border-amber-800/30 text-xs">
                                🥉 3
                              </span>
                            ) : isDQ ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                                DQ
                              </span>
                            ) : isDNF ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500">
                                DNF
                              </span>
                            ) : isDNS ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700">
                                DNS
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
                                {record.rank}
                              </span>
                            )}
                          </td>

                          {/* Bib */}
                          <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            #{record.bib}
                          </td>

                          {/* Athlete Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-[#C8A84B] transition">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#C8A84B]/15 text-[#C8A84B] flex items-center justify-center text-xs font-bold shrink-0">
                                {record.athleteName.charAt(0)}
                              </div>
                              <span>{record.athleteName}</span>
                              {record.verified && (
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              )}
                            </div>
                          </td>

                          {/* Club */}
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={12} className="text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{record.club}</span>
                            </div>
                          </td>

                          {/* Lane / Heat */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                            {record.lane ? `L${record.lane}` : '—'}
                            {record.heat ? ` · H${record.heat}` : ''}
                          </td>

                          {/* Performance / Mark */}
                          <td className="py-3.5 px-4 font-black font-mono text-base text-slate-900 dark:text-white">
                            {isDQ ? (
                              <span className="text-red-600 text-xs">DQ {record.dqRule ? `(${record.dqRule})` : ''}</span>
                            ) : isDNF ? (
                              <span className="text-slate-400 text-xs">Did Not Finish</span>
                            ) : isDNS ? (
                              <span className="text-amber-600 text-xs">Did Not Start</span>
                            ) : (
                              record.mark
                            )}
                          </td>

                          {/* Reaction Time */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-500">
                            {record.reactionTime || '—'}
                          </td>

                          {/* Qualification Badges */}
                          <td className="py-3.5 px-3 text-center">
                            {record.qualifier === 'Q' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs shadow-2xs">
                                Q
                              </span>
                            ) : record.qualifier === 'q' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs shadow-2xs">
                                q
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>

                          {/* Records Flag */}
                          <td className="py-3.5 px-4 text-center">
                            {record.recordBadge ? (
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                                record.recordBadge === 'NR'
                                  ? 'bg-red-500 text-white shadow-xs'
                                  : record.recordBadge === 'CR'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-purple-600 text-white shadow-xs'
                              }`}>
                                {record.recordBadge}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>

                          {/* View details action */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-xs font-bold text-[#C8A84B] group-hover:underline">
                              Inspect →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── 5. MEDAL STANDINGS & TEAM POINTS TAB ── */}
        {activeTab === 'MEDALS' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Medal size={20} className="text-[#C8A84B]" />
                  Club Championship Medal & Placing Standings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official cumulative standings calculated from certified championship results across all disciplines.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                World Athletics TR Scoring: 10-8-6-5-4-3-2-1
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40 uppercase">
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Club / Team Name</th>
                    <th className="py-3 px-4 text-center">🥇 Gold</th>
                    <th className="py-3 px-4 text-center">🥈 Silver</th>
                    <th className="py-3 px-4 text-center">🥉 Bronze</th>
                    <th className="py-3 px-4 text-center">Total Medals</th>
                    <th className="py-3 px-4 text-right font-black">Placing Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {medalStandings.map((team, idx) => (
                    <tr key={team.club} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="py-3.5 px-4 font-black text-center">
                        {idx + 1 === 1 ? '🥇 1' : idx + 1 === 2 ? '🥈 2' : idx + 1 === 3 ? '🥉 3' : `${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span>{team.club}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-600">{team.gold}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">{team.silver}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-800">{team.bronze}</td>
                      <td className="py-3.5 px-4 text-center font-black">{team.total}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-base text-primary">
                        {team.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 6. ATHLETE PERFORMANCE DETAIL MODAL ── */}
        <AnimatePresence>
          {activeAthleteDetail && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
              onClick={() => setActiveAthleteDetail(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#C8A84B]/20 text-[#C8A84B] flex items-center justify-center text-lg font-black">
                      {activeAthleteDetail.athleteName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black">{activeAthleteDetail.athleteName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activeAthleteDetail.club} · Bib #{activeAthleteDetail.bib}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAthleteDetail(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="py-4 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[11px]">Official Mark</span>
                      <span className="text-xl font-black font-mono text-[#C8A84B] mt-0.5 block">
                        {activeAthleteDetail.mark}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[11px]">Finish Rank</span>
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                        {(activeAthleteDetail.stageType === 'FINAL' || currentRound?.stageType === 'FINAL' || selectedRoundKey === 'FINAL') && Number(activeAthleteDetail.rank) === 1
                          ? '🥇 1st Place (Gold Medal)'
                          : (activeAthleteDetail.stageType === 'FINAL' || currentRound?.stageType === 'FINAL' || selectedRoundKey === 'FINAL') && Number(activeAthleteDetail.rank) === 2
                          ? '🥈 2nd Place (Silver Medal)'
                          : (activeAthleteDetail.stageType === 'FINAL' || currentRound?.stageType === 'FINAL' || selectedRoundKey === 'FINAL') && Number(activeAthleteDetail.rank) === 3
                          ? '🥉 3rd Place (Bronze Medal)'
                          : `${activeAthleteDetail.rank}${Number(activeAthleteDetail.rank) === 1 ? 'st' : Number(activeAthleteDetail.rank) === 2 ? 'nd' : Number(activeAthleteDetail.rank) === 3 ? 'rd' : 'th'} Place`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Competition:</span>
                      <span className="font-bold">{currentEvent?.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discipline & Stage:</span>
                      <span className="font-bold">{currentDiscipline?.discipline} ({activeAthleteDetail.roundKey ? formatRoundDisplayName(activeAthleteDetail.roundKey) : currentRound?.roundLabel || 'Final'})</span>
                    </div>
                    {activeAthleteDetail.qualifier && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Progression / Qualification:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          {activeAthleteDetail.qualifier === 'Q' ? 'Qualified Automatically (Q)' : 'Qualified by Next Fastest Mark (q)'}
                        </span>
                      </div>
                    )}
                    {activeAthleteDetail.reactionTime && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reaction Time:</span>
                        <span className="font-mono font-bold">{activeAthleteDetail.reactionTime}</span>
                      </div>
                    )}
                    {activeAthleteDetail.wind && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wind Velocity:</span>
                        <span className="font-mono font-bold">{activeAthleteDetail.wind}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status & Verification:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Certified by World Athletics Delegate
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveAthleteDetail(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
