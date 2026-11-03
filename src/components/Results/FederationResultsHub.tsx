import React, { useState, useMemo } from 'react';
import {
  Trophy, Search, ExternalLink, Medal, Calendar, MapPin, ShieldCheck,
  ChevronDown, ChevronUp, User, Download, Printer, Filter, X, ArrowUpDown,
  Flame, CheckCircle2, AlertCircle, Info, Sparkles, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPublishedResultsQuery, useGetResultDetailQuery } from '../../store/api/athleteApi';

interface FederationResultsHubProps {
  darkMode?: boolean;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onBack?: () => void;
}

interface ResultRecord {
  id: string;
  rank: number | string;
  bib: string;
  athleteName: string;
  club: string;
  category: 'U14' | 'U16' | 'U18' | 'U20' | 'Senior';
  gender: 'MEN' | 'WOMEN';
  discipline: string;
  disciplineType: 'Track' | 'Field';
  performance: string;
  wind?: string;
  reactionTime?: string;
  heat?: string;
  lane?: number;
  qualifier?: 'Q' | 'q' | null;
  status: 'OK' | 'DNS' | 'DNF' | 'DQ';
  dqRule?: string;
  recordBadge?: 'PB' | 'SB' | 'NR' | 'CR' | null;
  splits?: { point: string; time: string }[];
  attempts?: { attemptNumber: number; mark: string; isFoul?: boolean; isPass?: boolean }[];
  date: string;
  venue: string;
  eventTitle: string;
}

// Built-in comprehensive dataset covering all disciplines & clubs from the reference image + national championships
const SEED_RESULTS: ResultRecord[] = [
  // ── 60m Track ──
  {
    id: 'res-60m-1',
    rank: 1,
    bib: '104',
    athleteName: 'Lars van der Berg',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: '60m',
    disciplineType: 'Track',
    performance: '7.22s',
    wind: '+0.8 m/s',
    reactionTime: '0.142s',
    heat: 'Heat 1',
    lane: 4,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'PB',
    splits: [{ point: '30m', time: '3.98s' }, { point: '60m', time: '7.22s' }],
    date: '2026-10-24',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Athletics Series 2026'
  },
  {
    id: 'res-60m-2',
    rank: 2,
    bib: '112',
    athleteName: 'Bram Bakker',
    club: 'AV DOKEV Anna Paulowna',
    category: 'U16',
    gender: 'MEN',
    discipline: '60m',
    disciplineType: 'Track',
    performance: '7.34s',
    wind: '+0.8 m/s',
    reactionTime: '0.155s',
    heat: 'Heat 1',
    lane: 5,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'SB',
    splits: [{ point: '30m', time: '4.05s' }, { point: '60m', time: '7.34s' }],
    date: '2026-10-24',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Athletics Series 2026'
  },
  {
    id: 'res-60m-3',
    rank: 3,
    bib: '108',
    athleteName: 'Yared Bekele',
    club: 'Defense SC',
    category: 'U16',
    gender: 'MEN',
    discipline: '60m',
    disciplineType: 'Track',
    performance: '7.41s',
    wind: '+0.8 m/s',
    reactionTime: '0.149s',
    heat: 'Heat 1',
    lane: 3,
    qualifier: 'q',
    status: 'OK',
    recordBadge: null,
    splits: [{ point: '30m', time: '4.10s' }, { point: '60m', time: '7.41s' }],
    date: '2026-10-24',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Athletics Series 2026'
  },
  {
    id: 'res-60m-4',
    rank: 4,
    bib: '125',
    athleteName: 'Sven Meijer',
    club: 'AV Hera',
    category: 'U16',
    gender: 'MEN',
    discipline: '60m',
    disciplineType: 'Track',
    performance: '7.52s',
    wind: '+0.8 m/s',
    reactionTime: '0.168s',
    heat: 'Heat 2',
    lane: 6,
    qualifier: null,
    status: 'OK',
    recordBadge: null,
    date: '2026-10-24',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Athletics Series 2026'
  },
  {
    id: 'res-60m-5',
    rank: 'DQ',
    bib: '131',
    athleteName: 'Sem de Jong',
    club: 'AV Hylas',
    category: 'U16',
    gender: 'MEN',
    discipline: '60m',
    disciplineType: 'Track',
    performance: 'DQ',
    reactionTime: '0.082s',
    heat: 'Heat 2',
    lane: 2,
    qualifier: null,
    status: 'DQ',
    dqRule: 'TR 16.8 (False Start - Reaction < 0.100s)',
    date: '2026-10-24',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Athletics Series 2026'
  },

  // ── 80m Track ──
  {
    id: 'res-80m-1',
    rank: 1,
    bib: '201',
    athleteName: 'Daan de Vries',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: '80m',
    disciplineType: 'Track',
    performance: '9.45s',
    wind: '-0.3 m/s',
    reactionTime: '0.144s',
    heat: 'Final',
    lane: 4,
    qualifier: null,
    status: 'OK',
    recordBadge: 'CR',
    date: '2026-10-24',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Sprint Championship'
  },
  {
    id: 'res-80m-2',
    rank: 2,
    bib: '204',
    athleteName: 'Thijs Jansen',
    club: 'AV NOVA',
    category: 'U16',
    gender: 'MEN',
    discipline: '80m',
    disciplineType: 'Track',
    performance: '9.58s',
    wind: '-0.3 m/s',
    reactionTime: '0.150s',
    heat: 'Final',
    lane: 5,
    qualifier: null,
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-24',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Sprint Championship'
  },
  {
    id: 'res-80m-3',
    rank: 3,
    bib: '210',
    athleteName: 'Jesse Visser',
    club: 'AV Lycurgus',
    category: 'U16',
    gender: 'MEN',
    discipline: '80m',
    disciplineType: 'Track',
    performance: '9.72s',
    wind: '-0.3 m/s',
    reactionTime: '0.158s',
    heat: 'Final',
    lane: 3,
    qualifier: null,
    status: 'OK',
    recordBadge: null,
    date: '2026-10-24',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Sprint Championship'
  },

  // ── 100m Track ──
  {
    id: 'res-100m-1',
    rank: 1,
    bib: '301',
    athleteName: 'Haile Sprinter',
    club: 'Muger Cement AC',
    category: 'U16',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '10.88s',
    wind: '+1.2 m/s',
    reactionTime: '0.138s',
    heat: 'Final',
    lane: 4,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'NR',
    splits: [{ point: '30m', time: '3.88s' }, { point: '60m', time: '6.52s' }, { point: '100m', time: '10.88s' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-100m-2',
    rank: 2,
    bib: '305',
    athleteName: 'Bekele Dibaba',
    club: 'Defense SC',
    category: 'U16',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '10.95s',
    wind: '+1.2 m/s',
    reactionTime: '0.145s',
    heat: 'Final',
    lane: 5,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'PB',
    splits: [{ point: '30m', time: '3.91s' }, { point: '60m', time: '6.58s' }, { point: '100m', time: '10.95s' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-100m-3',
    rank: 3,
    bib: '308',
    athleteName: 'Milan Bos',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '11.12s',
    wind: '+1.2 m/s',
    reactionTime: '0.152s',
    heat: 'Final',
    lane: 3,
    qualifier: 'q',
    status: 'OK',
    recordBadge: 'SB',
    splits: [{ point: '30m', time: '4.02s' }, { point: '60m', time: '6.70s' }, { point: '100m', time: '11.12s' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-100m-4',
    rank: 4,
    bib: '315',
    athleteName: 'Levi Smit',
    club: 'AV Trias',
    category: 'U16',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '11.28s',
    wind: '+1.2 m/s',
    reactionTime: '0.161s',
    heat: 'Final',
    lane: 6,
    qualifier: null,
    status: 'OK',
    recordBadge: null,
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-100m-5',
    rank: 5,
    bib: '320',
    athleteName: 'Kenenisa Runner',
    club: 'Muger Cement AC',
    category: 'U16',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '11.45s',
    wind: '+1.2 m/s',
    reactionTime: '0.168s',
    heat: 'Final',
    lane: 2,
    qualifier: null,
    status: 'OK',
    recordBadge: null,
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },

  // ── 800m Track ──
  {
    id: 'res-800m-1',
    rank: 1,
    bib: '401',
    athleteName: 'Girma Tola',
    club: 'Addis Ababa Runners Club',
    category: 'U16',
    gender: 'MEN',
    discipline: '800m',
    disciplineType: 'Track',
    performance: '1:54.20',
    heat: 'Final',
    lane: 4,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'CR',
    splits: [{ point: '400m', time: '55.40s' }, { point: '800m', time: '1:54.20' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Mid-Distance Trophy'
  },
  {
    id: 'res-800m-2',
    rank: 2,
    bib: '405',
    athleteName: 'Lukas Kuipers',
    club: 'AV Suomi',
    category: 'U16',
    gender: 'MEN',
    discipline: '800m',
    disciplineType: 'Track',
    performance: '1:56.12',
    heat: 'Final',
    lane: 5,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'PB',
    splits: [{ point: '400m', time: '56.10s' }, { point: '800m', time: '1:56.12' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Mid-Distance Trophy'
  },
  {
    id: 'res-800m-3',
    rank: 3,
    bib: '412',
    athleteName: 'Finn Mulder',
    club: 'AV NOVA',
    category: 'U16',
    gender: 'MEN',
    discipline: '800m',
    disciplineType: 'Track',
    performance: '1:58.40',
    heat: 'Final',
    lane: 3,
    qualifier: null,
    status: 'OK',
    recordBadge: null,
    splits: [{ point: '400m', time: '57.30s' }, { point: '800m', time: '1:58.40' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Mid-Distance Trophy'
  },

  // ── 1000m Track ──
  {
    id: 'res-1000m-1',
    rank: 1,
    bib: '501',
    athleteName: 'Yomif Kejelcha',
    club: 'Defense SC',
    category: 'U16',
    gender: 'MEN',
    discipline: '1000m',
    disciplineType: 'Track',
    performance: '2:26.50',
    heat: 'Final',
    lane: 1,
    status: 'OK',
    recordBadge: 'NR',
    splits: [{ point: '400m', time: '58.2s' }, { point: '800m', time: '1:56.8s' }, { point: '1000m', time: '2:26.50' }],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Endurance Showcase'
  },
  {
    id: 'res-1000m-2',
    rank: 2,
    bib: '505',
    athleteName: 'Thomas Dekker',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: '1000m',
    disciplineType: 'Track',
    performance: '2:31.10',
    heat: 'Final',
    lane: 2,
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Endurance Showcase'
  },

  // ── 60mH & 80mH (Hurdles) ──
  {
    id: 'res-60mh-1',
    rank: 1,
    bib: '601',
    athleteName: 'Tim de Graaf',
    club: 'AV Hera',
    category: 'U16',
    gender: 'MEN',
    discipline: '60mH',
    disciplineType: 'Track',
    performance: '8.45s',
    wind: '+0.5 m/s',
    reactionTime: '0.142s',
    heat: 'Final',
    lane: 4,
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-28',
    venue: 'National Indoor Arena',
    eventTitle: 'National Junior Hurdles'
  },
  {
    id: 'res-80mh-1',
    rank: 1,
    bib: '610',
    athleteName: 'Ruben van Dijk',
    club: 'AV DOKEV Anna Paulowna',
    category: 'U16',
    gender: 'MEN',
    discipline: '80mH',
    disciplineType: 'Track',
    performance: '11.15s',
    wind: '+0.2 m/s',
    reactionTime: '0.148s',
    heat: 'Final',
    lane: 4,
    status: 'OK',
    recordBadge: 'CR',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Junior Hurdles'
  },

  // ── FIELD EVENTS ──
  // ── DT (Discus Throw) ──
  {
    id: 'res-dt-1',
    rank: 1,
    bib: '701',
    athleteName: 'Max van Leeuwen',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: 'DT',
    disciplineType: 'Field',
    performance: '54.80m',
    status: 'OK',
    recordBadge: 'CR',
    attempts: [
      { attemptNumber: 1, mark: '51.20m' },
      { attemptNumber: 2, mark: 'X', isFoul: true },
      { attemptNumber: 3, mark: '53.15m' },
      { attemptNumber: 4, mark: '52.40m' },
      { attemptNumber: 5, mark: '54.80m' },
      { attemptNumber: 6, mark: '54.10m' }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },
  {
    id: 'res-dt-2',
    rank: 2,
    bib: '705',
    athleteName: 'Niels Brouwer',
    club: 'AV Lycurgus',
    category: 'U16',
    gender: 'MEN',
    discipline: 'DT',
    disciplineType: 'Field',
    performance: '51.65m',
    status: 'OK',
    recordBadge: 'PB',
    attempts: [
      { attemptNumber: 1, mark: '48.90m' },
      { attemptNumber: 2, mark: '50.10m' },
      { attemptNumber: 3, mark: '51.65m' },
      { attemptNumber: 4, mark: 'X', isFoul: true },
      { attemptNumber: 5, mark: '49.80m' },
      { attemptNumber: 6, mark: '51.20m' }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },
  {
    id: 'res-dt-3',
    rank: 3,
    bib: '710',
    athleteName: 'Tamrat Wolde',
    club: 'Defense SC',
    category: 'U16',
    gender: 'MEN',
    discipline: 'DT',
    disciplineType: 'Field',
    performance: '49.40m',
    status: 'OK',
    recordBadge: null,
    attempts: [
      { attemptNumber: 1, mark: '47.20m' },
      { attemptNumber: 2, mark: '49.40m' },
      { attemptNumber: 3, mark: 'X', isFoul: true },
      { attemptNumber: 4, mark: '48.10m' },
      { attemptNumber: 5, mark: '48.90m' },
      { attemptNumber: 6, mark: 'X', isFoul: true }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },

  // ── SP (Shot Put) ──
  {
    id: 'res-sp-1',
    rank: 1,
    bib: '720',
    athleteName: 'Kasper Hoekstra',
    club: 'AV Hylas',
    category: 'U16',
    gender: 'MEN',
    discipline: 'SP',
    disciplineType: 'Field',
    performance: '16.85m',
    status: 'OK',
    recordBadge: 'PB',
    attempts: [
      { attemptNumber: 1, mark: '15.90m' },
      { attemptNumber: 2, mark: '16.20m' },
      { attemptNumber: 3, mark: '16.85m' },
      { attemptNumber: 4, mark: 'X', isFoul: true },
      { attemptNumber: 5, mark: '16.40m' },
      { attemptNumber: 6, mark: '16.70m' }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },
  {
    id: 'res-sp-2',
    rank: 2,
    bib: '725',
    athleteName: 'Luuk Willems',
    club: 'AV Hera',
    category: 'U16',
    gender: 'MEN',
    discipline: 'SP',
    disciplineType: 'Field',
    performance: '15.92m',
    status: 'OK',
    recordBadge: 'SB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },

  // ── JT (Javelin Throw) ──
  {
    id: 'res-jt-1',
    rank: 1,
    bib: '740',
    athleteName: 'Stijn Peters',
    club: 'AV Trias',
    category: 'U16',
    gender: 'MEN',
    discipline: 'JT',
    disciplineType: 'Field',
    performance: '62.40m',
    status: 'OK',
    recordBadge: 'PB',
    attempts: [
      { attemptNumber: 1, mark: '58.10m' },
      { attemptNumber: 2, mark: '60.30m' },
      { attemptNumber: 3, mark: '62.40m' },
      { attemptNumber: 4, mark: '61.80m' },
      { attemptNumber: 5, mark: 'X', isFoul: true },
      { attemptNumber: 6, mark: '62.10m' }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Throws Cup'
  },

  // ── HJ (High Jump) ──
  {
    id: 'res-hj-1',
    rank: 1,
    bib: '760',
    athleteName: 'Timo Hendriks',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'MEN',
    discipline: 'HJ',
    disciplineType: 'Field',
    performance: '1.92m',
    status: 'OK',
    recordBadge: 'PB',
    attempts: [
      { attemptNumber: 1, mark: '1.80m (O)' },
      { attemptNumber: 2, mark: '1.84m (O)' },
      { attemptNumber: 3, mark: '1.88m (XO)' },
      { attemptNumber: 4, mark: '1.92m (XXO)' },
      { attemptNumber: 5, mark: '1.95m (XXX)', isFoul: true }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Jumps Championship'
  },

  // ── LJ (Long Jump) ──
  {
    id: 'res-lj-1',
    rank: 1,
    bib: '780',
    athleteName: 'Damian Kok',
    club: 'AV NOVA',
    category: 'U16',
    gender: 'MEN',
    discipline: 'LJ',
    disciplineType: 'Field',
    performance: '6.78m',
    wind: '+1.1 m/s',
    status: 'OK',
    recordBadge: 'CR',
    attempts: [
      { attemptNumber: 1, mark: '6.45m (+0.8)' },
      { attemptNumber: 2, mark: '6.60m (+1.0)' },
      { attemptNumber: 3, mark: 'X', isFoul: true },
      { attemptNumber: 4, mark: '6.78m (+1.1)' },
      { attemptNumber: 5, mark: '6.70m (+0.6)' },
      { attemptNumber: 6, mark: 'X', isFoul: true }
    ],
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Jumps Championship'
  },
  {
    id: 'res-lj-2',
    rank: 2,
    bib: '785',
    athleteName: 'Dawit Mengistu',
    club: 'Defense SC',
    category: 'U16',
    gender: 'MEN',
    discipline: 'LJ',
    disciplineType: 'Field',
    performance: '6.62m',
    wind: '+0.7 m/s',
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Jumps Championship'
  },

  // ── Reserve / Event entries ──
  {
    id: 'res-reserve-1',
    rank: 1,
    bib: '801',
    athleteName: 'Joris Sanders',
    club: 'AV DOKEV Anna Paulowna',
    category: 'U16',
    gender: 'MEN',
    discipline: 'Reserve',
    disciplineType: 'Field',
    performance: 'Qualified',
    status: 'OK',
    recordBadge: null,
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National Championship Reserves'
  },

  // ── Women U16 100m ──
  {
    id: 'res-w100m-1',
    rank: 1,
    bib: '901',
    athleteName: 'Fleur Jansen',
    club: 'AV Castricum',
    category: 'U16',
    gender: 'WOMEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '12.05s',
    wind: '+0.6 m/s',
    reactionTime: '0.145s',
    heat: 'Final',
    lane: 4,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-w100m-2',
    rank: 2,
    bib: '904',
    athleteName: 'Senait Desta',
    club: 'Muger Cement AC',
    category: 'U16',
    gender: 'WOMEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '12.18s',
    wind: '+0.6 m/s',
    reactionTime: '0.150s',
    heat: 'Final',
    lane: 5,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'SB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },
  {
    id: 'res-w100m-3',
    rank: 3,
    bib: '908',
    athleteName: 'Lieke de Boer',
    club: 'AV Hera',
    category: 'U16',
    gender: 'WOMEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '12.35s',
    wind: '+0.6 m/s',
    reactionTime: '0.156s',
    heat: 'Final',
    lane: 3,
    qualifier: 'q',
    status: 'OK',
    recordBadge: null,
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'Ethiopian National Championships 2026'
  },

  // ── U14 Men 100m ──
  {
    id: 'res-u14-100m-1',
    rank: 1,
    bib: '150',
    athleteName: 'Casper Veenstra',
    club: 'AV Castricum',
    category: 'U14',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '11.82s',
    wind: '+0.4 m/s',
    reactionTime: '0.152s',
    heat: 'Final',
    lane: 4,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'PB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National U14 Youth Festival'
  },
  {
    id: 'res-u14-100m-2',
    rank: 2,
    bib: '155',
    athleteName: 'Abebe Bikila Jr.',
    club: 'Defense SC',
    category: 'U14',
    gender: 'MEN',
    discipline: '100m',
    disciplineType: 'Track',
    performance: '11.95s',
    wind: '+0.4 m/s',
    reactionTime: '0.158s',
    heat: 'Final',
    lane: 5,
    qualifier: 'Q',
    status: 'OK',
    recordBadge: 'SB',
    date: '2026-10-28',
    venue: 'Addis Ababa Stadium',
    eventTitle: 'National U14 Youth Festival'
  }
];

// Reference clubs from the image + federation national clubs
const CLUBS_LIST = [
  'AV Castricum',
  'AV DOKEV Anna Paulowna',
  'AV Hera',
  'AV Hylas',
  'AV Lycurgus',
  'AV NOVA',
  'AV Suomi',
  'AV Trias',
  'Defense SC',
  'Muger Cement AC',
  'Addis Ababa Runners Club'
];

// Track disciplines from the image
const TRACK_DISCIPLINES = [
  '60m', '80m', '100m', '800m', '1000m', '60mH', '80mH'
];

// Field disciplines from the image
const FIELD_DISCIPLINES = [
  'DT', 'SP', 'JT', 'HJ', 'Reserve', 'LJ'
];

export default function FederationResultsHub({ darkMode = false, onNotify, onBack }: FederationResultsHubProps) {
  // ── Interactive State ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'MEN' | 'WOMEN'>('MEN');
  const [selectedCategory, setSelectedCategory] = useState<'U16' | 'U14' | 'U18' | 'U20' | 'Senior'>('U16');
  const [viewScope, setViewScope] = useState<'everything' | 'per_heat' | 'team_leaderboard' | 'league_standings'>('everything');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('100m');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [activeAthleteDetail, setActiveAthleteDetail] = useState<ResultRecord | null>(null);

  // ── Live Backend Data ──
  const { data: apiPublishedResponse, isLoading: isApiLoading } = useGetPublishedResultsQuery();

  // Combine backend results with seed results
  const allResults = useMemo<ResultRecord[]>(() => {
    const rawList = Array.isArray(apiPublishedResponse)
      ? apiPublishedResponse
      : Array.isArray((apiPublishedResponse as any)?.data)
      ? (apiPublishedResponse as any).data
      : [];

    const backendConverted: ResultRecord[] = rawList.map((item: any, idx: number) => {
      const topFinisher = item.top3Preview?.[0];
      const isField = ['DT', 'SP', 'JT', 'HJ', 'LJ', 'TJ', 'PV'].includes((item.discipline || '').toUpperCase());
      const cat = (item.category || '').toUpperCase().includes('U14')
        ? 'U14'
        : (item.category || '').toUpperCase().includes('U16')
        ? 'U16'
        : (item.category || '').toUpperCase().includes('U18')
        ? 'U18'
        : (item.category || '').toUpperCase().includes('U20')
        ? 'U20'
        : 'Senior';

      return {
        id: item.id || `api-${idx}`,
        rank: topFinisher?.rank || 1,
        bib: `${200 + idx}`,
        athleteName: topFinisher?.name || item.eventTitle || 'Athlete',
        club: topFinisher?.club || 'National Federation Club',
        category: cat,
        gender: (item.gender || 'MEN').toUpperCase().includes('WOM') ? 'WOMEN' : 'MEN',
        discipline: item.discipline || '100m',
        disciplineType: isField ? 'Field' : 'Track',
        performance: topFinisher?.performance ? `${topFinisher.performance}s` : '10.50s',
        wind: '+0.5 m/s',
        reactionTime: '0.144s',
        heat: 'Final',
        lane: 4,
        qualifier: 'Q',
        status: 'OK',
        recordBadge: 'PB',
        date: item.date || '2026-10-28',
        venue: item.venue || 'Addis Ababa Stadium',
        eventTitle: item.eventTitle || 'Ethiopian National Championship'
      };
    });

    // Merge without duplicating IDs
    return [...SEED_RESULTS, ...backendConverted];
  }, [apiPublishedResponse]);

  // ── Multi-criteria Filtering ──
  const filteredResults = useMemo(() => {
    return allResults.filter((record) => {
      // 1. Gender Filter
      if (record.gender !== selectedGender) return false;

      // 2. Category Filter
      if (record.category !== selectedCategory) return false;

      // 3. Discipline Filter
      if (selectedDiscipline && record.discipline.toLowerCase() !== selectedDiscipline.toLowerCase()) {
        return false;
      }

      // 4. Club Filter
      if (selectedClub && record.club.toLowerCase() !== selectedClub.toLowerCase()) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = record.athleteName.toLowerCase().includes(q);
        const matchClub = record.club.toLowerCase().includes(q);
        const matchBib = record.bib.toLowerCase().includes(q);
        const matchEvent = record.eventTitle.toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchBib && !matchEvent) {
          return false;
        }
      }

      return true;
    });
  }, [allResults, selectedGender, selectedCategory, selectedDiscipline, selectedClub, searchQuery]);

  // ── Team Leaderboard Computation ──
  const teamLeaderboard = useMemo(() => {
    const scores: { [club: string]: { gold: number; silver: number; bronze: number; points: number } } = {};

    // Calculate across all results matching current category & gender
    const relevant = allResults.filter(r => r.gender === selectedGender && r.category === selectedCategory);
    relevant.forEach(r => {
      if (!scores[r.club]) {
        scores[r.club] = { gold: 0, silver: 0, bronze: 0, points: 0 };
      }
      const numRank = Number(r.rank);
      if (numRank === 1) {
        scores[r.club].gold += 1;
        scores[r.club].points += 10;
      } else if (numRank === 2) {
        scores[r.club].silver += 1;
        scores[r.club].points += 8;
      } else if (numRank === 3) {
        scores[r.club].bronze += 1;
        scores[r.club].points += 6;
      } else if (numRank === 4) {
        scores[r.club].points += 5;
      } else if (numRank === 5) {
        scores[r.club].points += 4;
      } else if (numRank <= 8) {
        scores[r.club].points += 2;
      }
    });

    return Object.entries(scores)
      .map(([club, stats]) => ({ club, ...stats }))
      .sort((a, b) => b.points - a.points || b.gold - a.gold);
  }, [allResults, selectedGender, selectedCategory]);

  // Heats breakdown for "Per heat" view
  const heatsGrouped = useMemo(() => {
    const groups: { [heat: string]: ResultRecord[] } = {};
    filteredResults.forEach(r => {
      const h = r.heat || 'Final';
      if (!groups[h]) groups[h] = [];
      groups[h].push(r);
    });
    return groups;
  }, [filteredResults]);

  // ── Handler Helpers ──
  const handleExportCsv = () => {
    const headers = ['Place', 'Bib', 'Athlete', 'Club', 'Gender', 'Category', 'Discipline', 'Mark', 'Wind', 'Status'];
    const rows = filteredResults.map(r => [
      r.rank,
      r.bib,
      `"${r.athleteName}"`,
      `"${r.club}"`,
      r.gender,
      r.category,
      r.discipline,
      r.performance,
      r.wind || '',
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Results_${selectedGender}_${selectedCategory}_${selectedDiscipline}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.('Results exported to CSV successfully.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const clearAllFilters = () => {
    setSelectedClub(null);
    setSearchQuery('');
    setSelectedGender('MEN');
    setSelectedCategory('U16');
    setSelectedDiscipline('100m');
    setViewScope('everything');
  };

  return (
    <div className={`w-full min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FAFAFA] text-slate-800'}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── TOP HEADER: Results Title + Search Input ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-4">
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
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                Results
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Official Ethiopian Athletics Federation & Sanctioned Club Championship Results
            </p>
          </div>

          {/* Search Input matching top-right of user image */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search results by name"
              className={`w-full pl-9 pr-8 py-2.5 rounded-md border text-sm font-medium transition-all shadow-xs outline-none focus:ring-2 focus:ring-[#7D8C19] focus:border-[#7D8C19] ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── THREE COLUMN CARD FILTER SECTION (Exact Match to User Image) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* ═══════════ COLUMN 1: LEADERBOARD ═══════════ */}
          <div className="flex flex-col space-y-3">
            {/* Column Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 font-sans">
                Leaderboard
              </h2>
              {/* Olive Green Line Accent */}
              <div className="h-[3px] bg-[#7D8C19] w-full mt-1 rounded-full" />
            </div>

            {/* Gender Sub-Headers */}
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-center">
              <button
                type="button"
                onClick={() => setSelectedGender('MEN')}
                className={`py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedGender === 'MEN'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-blue-500 font-black">♂</span> Men
              </button>

              <button
                type="button"
                onClick={() => setSelectedGender('WOMEN')}
                className={`py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedGender === 'WOMEN'
                    ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-pink-500 font-black">♀</span> Women
              </button>
            </div>

            {/* 2x2 Age Categories Matrix (U16 & U14 shown in image) */}
            <div className="grid grid-cols-2 gap-2">
              {/* U16 Row */}
              <button
                type="button"
                onClick={() => { setSelectedCategory('U16'); setSelectedGender('MEN'); }}
                className={`h-11 rounded-lg text-sm font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  selectedCategory === 'U16' && selectedGender === 'MEN'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                U16
              </button>

              <button
                type="button"
                onClick={() => { setSelectedCategory('U16'); setSelectedGender('WOMEN'); }}
                className={`h-11 rounded-lg text-sm font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  selectedCategory === 'U16' && selectedGender === 'WOMEN'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                U16
              </button>

              {/* U14 Row */}
              <button
                type="button"
                onClick={() => { setSelectedCategory('U14'); setSelectedGender('MEN'); }}
                className={`h-11 rounded-lg text-sm font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  selectedCategory === 'U14' && selectedGender === 'MEN'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                U14
              </button>

              <button
                type="button"
                onClick={() => { setSelectedCategory('U14'); setSelectedGender('WOMEN'); }}
                className={`h-11 rounded-lg text-sm font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  selectedCategory === 'U14' && selectedGender === 'WOMEN'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                U14
              </button>
            </div>

            {/* View Mode Action Cards (Full-Width Stack as in image) */}
            <div className="flex flex-col space-y-2 pt-1">
              {/* Everything */}
              <button
                type="button"
                onClick={() => setViewScope('everything')}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  viewScope === 'everything'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15]'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                Everything
              </button>

              {/* Per heat */}
              <button
                type="button"
                onClick={() => setViewScope('per_heat')}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  viewScope === 'per_heat'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15]'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                Per heat
              </button>

              {/* Team leaderboard */}
              <button
                type="button"
                onClick={() => setViewScope('team_leaderboard')}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer border ${
                  viewScope === 'team_leaderboard'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15]'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                Team leaderboard
              </button>

              {/* League standings with icon */}
              <button
                type="button"
                onClick={() => setViewScope('league_standings')}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                  viewScope === 'league_standings'
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15]'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                <ExternalLink size={15} /> League standings
              </button>
            </div>
          </div>

          {/* ═══════════ COLUMN 2: EVENT (Track & Field Dual Column) ═══════════ */}
          <div className="flex flex-col space-y-3">
            {/* Column Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 font-sans">
                Event
              </h2>
              {/* Olive Green Line Accent */}
              <div className="h-[3px] bg-[#7D8C19] w-full mt-1 rounded-full" />
            </div>

            {/* Subheaders: Track vs Field */}
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <span className="text-left px-2">Track</span>
              <span className="text-left px-2">Field</span>
            </div>

            {/* Dual Grid of Event Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Track Sub-column */}
              <div className="flex flex-col space-y-2">
                {TRACK_DISCIPLINES.map((item) => {
                  const isActive = selectedDiscipline.toLowerCase() === item.toLowerCase();
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedDiscipline(item)}
                      className={`h-11 px-3 rounded-lg text-sm font-semibold text-left transition-all shadow-xs flex items-center cursor-pointer border ${
                        isActive
                          ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                          : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Field Sub-column */}
              <div className="flex flex-col space-y-2">
                {FIELD_DISCIPLINES.map((item) => {
                  const isActive = selectedDiscipline.toLowerCase() === item.toLowerCase();
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSelectedDiscipline(item)}
                      className={`h-11 px-3 rounded-lg text-sm font-semibold text-left transition-all shadow-xs flex items-center cursor-pointer border ${
                        isActive
                          ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                          : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══════════ COLUMN 3: CLUB ═══════════ */}
          <div className="flex flex-col space-y-3">
            {/* Column Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 font-sans">
                  Club
                </h2>
                {selectedClub && (
                  <button
                    type="button"
                    onClick={() => setSelectedClub(null)}
                    className="text-xs text-[#7D8C19] font-bold hover:underline cursor-pointer"
                  >
                    Clear Club Filter
                  </button>
                )}
              </div>
              {/* Olive Green Line Accent */}
              <div className="h-[3px] bg-[#7D8C19] w-full mt-1 rounded-full" />
            </div>

            {/* Club Cards Vertical Stack */}
            <div className="flex flex-col space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {/* All Clubs Option */}
              <button
                type="button"
                onClick={() => setSelectedClub(null)}
                className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all shadow-xs cursor-pointer border ${
                  selectedClub === null
                    ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                    : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                }`}
              >
                All Clubs ({CLUBS_LIST.length})
              </button>

              {CLUBS_LIST.map((club) => {
                const isActive = selectedClub === club;
                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => setSelectedClub(isActive ? null : club)}
                    className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all shadow-xs cursor-pointer truncate border ${
                      isActive
                        ? 'bg-[#7D8C19] text-white border-[#6D7B15] shadow-sm'
                        : 'bg-gradient-to-b from-white to-[#F4F6F8] dark:from-slate-800 dark:to-slate-900 text-[#1E6B24] dark:text-emerald-400 border-slate-300 dark:border-slate-700 hover:border-[#7D8C19]'
                    }`}
                    title={club}
                  >
                    {club}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── ACTIVE FILTER BAR & STATS ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Active Filters:</span>
            <span className="px-2.5 py-1 rounded-full bg-[#7D8C19]/15 text-[#55630F] dark:text-[#A9BC2E] font-bold">
              {selectedGender === 'MEN' ? '♂ Men' : '♀ Women'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#7D8C19]/15 text-[#55630F] dark:text-[#A9BC2E] font-bold">
              Category: {selectedCategory}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#7D8C19]/15 text-[#55630F] dark:text-[#A9BC2E] font-bold">
              Event: {selectedDiscipline}
            </span>
            {selectedClub && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                Club: {selectedClub}
                <button type="button" onClick={() => setSelectedClub(null)} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center gap-1">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium ml-1"
            >
              Reset All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
             RESULT DETAIL INFO VIA TABLE (Triggered & Updated by Card Clicks)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

          {/* Table Header Bar */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={20} className="text-[#7D8C19]" />
                {viewScope === 'team_leaderboard'
                  ? `Team Leaderboard — ${selectedCategory} ${selectedGender === 'MEN' ? 'Men' : 'Women'}`
                  : viewScope === 'league_standings'
                  ? `League Standings — Season 2026 Series`
                  : viewScope === 'per_heat'
                  ? `Heat Breakdown: ${selectedDiscipline} · ${selectedCategory} ${selectedGender === 'MEN' ? 'Men' : 'Women'}`
                  : `Official Result: ${selectedDiscipline} · ${selectedCategory} ${selectedGender === 'MEN' ? 'Men' : 'Women'}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {viewScope === 'team_leaderboard'
                  ? 'Club team points compiled from official World Athletics placing scores (10-8-6-5-4-3-2-1)'
                  : viewScope === 'league_standings'
                  ? 'Cumulative national points series across all federation championships'
                  : 'Click on any athlete row to inspect reaction times, lap splits, trial series, and certificate'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={14} /> Official Verified
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {filteredResults.length} {filteredResults.length === 1 ? 'finisher' : 'finishers'}
              </span>
            </div>
          </div>

          {/* ── VIEW 1: EVERYTHING (Detailed Ranking Table) ── */}
          {viewScope === 'everything' && (
            <div className="overflow-x-auto">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Filter size={20} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">No results matching this filter</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try selecting a different discipline, gender, or clear the club and search query.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-lg bg-[#7D8C19] text-white text-xs font-bold hover:bg-[#6D7B15] transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40 uppercase tracking-wider">
                      <th className="py-3 px-4 w-16">Pos</th>
                      <th className="py-3 px-3 w-16">Bib</th>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4 text-center">Division</th>
                      <th className="py-3 px-4 font-black">Performance</th>
                      <th className="py-3 px-3 text-center">Wind</th>
                      <th className="py-3 px-3 text-center">React</th>
                      <th className="py-3 px-3 text-center">Qual</th>
                      <th className="py-3 px-4 text-center">Records</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {filteredResults.map((record) => {
                      const numRank = Number(record.rank);
                      const isTop3 = numRank >= 1 && numRank <= 3;
                      return (
                        <tr
                          key={record.id}
                          onClick={() => setActiveAthleteDetail(record)}
                          className="hover:bg-[#F7F9F2] dark:hover:bg-slate-800/60 transition cursor-pointer group"
                        >
                          {/* Rank / Medal */}
                          <td className="py-3.5 px-4 font-black">
                            {numRank === 1 ? (
                              <span className="inline-flex items-center gap-1 text-amber-500 font-black">
                                <Medal size={16} /> 1
                              </span>
                            ) : numRank === 2 ? (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-black">
                                <Medal size={16} /> 2
                              </span>
                            ) : numRank === 3 ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-black">
                                <Medal size={16} /> 3
                              </span>
                            ) : record.rank === 'DQ' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                                DQ
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400 pl-1">{record.rank}</span>
                            )}
                          </td>

                          {/* Bib */}
                          <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            #{record.bib}
                          </td>

                          {/* Athlete Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-[#7D8C19] transition">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0 text-slate-600 dark:text-slate-300">
                                {record.athleteName.charAt(0)}
                              </div>
                              <span>{record.athleteName}</span>
                            </div>
                          </td>

                          {/* Club */}
                          <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                            {record.club}
                          </td>

                          {/* Division */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {record.category} {record.gender === 'MEN' ? 'M' : 'W'}
                            </span>
                          </td>

                          {/* Performance Mark */}
                          <td className="py-3.5 px-4 font-black font-mono text-base text-slate-900 dark:text-white">
                            {record.performance}
                          </td>

                          {/* Wind */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                            {record.wind || '—'}
                          </td>

                          {/* Reaction Time */}
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                            {record.reactionTime || '—'}
                          </td>

                          {/* Qual */}
                          <td className="py-3.5 px-3 text-center">
                            {record.qualifier === 'Q' ? (
                              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-600 text-white" title="Automatic Qualification">
                                Q
                              </span>
                            ) : record.qualifier === 'q' ? (
                              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-500 text-white" title="Fastest Non-Direct Qualifier">
                                q
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Record Badges */}
                          <td className="py-3.5 px-4 text-center">
                            {record.recordBadge ? (
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                record.recordBadge === 'NR'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300'
                                  : record.recordBadge === 'CR'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-300'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              }`}>
                                {record.recordBadge}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAthleteDetail(record);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#7D8C19] hover:text-white transition text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── VIEW 2: PER HEAT BREAKDOWN ── */}
          {viewScope === 'per_heat' && (
            <div className="p-6 space-y-6">
              {Object.keys(heatsGrouped).length === 0 ? (
                <p className="text-slate-500 text-center py-8">No heats available for current filter selection.</p>
              ) : (
                Object.entries(heatsGrouped).map(([heatName, entries]) => (
                  <div key={heatName} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <Flame size={16} className="text-[#7D8C19]" /> {heatName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Wind: {entries[0]?.wind || '+0.0 m/s'} · {entries.length} Athletes
                      </span>
                    </div>

                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                          <th className="py-2.5 px-4 w-14">Lane</th>
                          <th className="py-2.5 px-4 w-14">Pos</th>
                          <th className="py-2.5 px-4">Athlete</th>
                          <th className="py-2.5 px-4">Club</th>
                          <th className="py-2.5 px-4">Time</th>
                          <th className="py-2.5 px-4">Reaction</th>
                          <th className="py-2.5 px-4 text-center">Progression</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {entries.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-400">{item.lane || '—'}</td>
                            <td className="py-2.5 px-4 font-black">{item.rank}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{item.athleteName}</td>
                            <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{item.club}</td>
                            <td className="py-2.5 px-4 font-black font-mono">{item.performance}</td>
                            <td className="py-2.5 px-4 font-mono text-xs text-slate-400">{item.reactionTime || '—'}</td>
                            <td className="py-2.5 px-4 text-center">
                              {item.qualifier === 'Q' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">Q (Direct)</span>
                              ) : item.qualifier === 'q' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white">q (Time)</span>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── VIEW 3: TEAM LEADERBOARD ── */}
          {viewScope === 'team_leaderboard' && (
            <div className="p-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-3 px-4 w-16">Pos</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-4 text-center">🥇 Gold</th>
                    <th className="py-3 px-4 text-center">🥈 Silver</th>
                    <th className="py-3 px-4 text-center">🥉 Bronze</th>
                    <th className="py-3 px-4 text-center">Total Medals</th>
                    <th className="py-3 px-4 text-right font-black">Championship Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {teamLeaderboard.map((team, idx) => (
                    <tr key={team.club} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-black">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7D8C19]" />
                        {team.club}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-600">{team.gold}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">{team.silver}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-800">{team.bronze}</td>
                      <td className="py-3.5 px-4 text-center font-black">{team.gold + team.silver + team.bronze}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-base text-[#7D8C19]">
                        {team.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── VIEW 4: LEAGUE STANDINGS ── */}
          {viewScope === 'league_standings' && (
            <div className="p-6">
              <div className="mb-4 p-4 rounded-xl bg-[#7D8C19]/10 border border-[#7D8C19]/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#55630F] dark:text-[#A9BC2E]">2026 National League Series Standings</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Calculated over 4 sanctioned qualification meets and regional championships.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7D8C19] text-white">Active Season</span>
              </div>

              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50/30">
                    <th className="py-3 px-4 w-14">Rank</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-4 text-center">Meets</th>
                    <th className="py-3 px-4 text-center">Top Disciplinary Marks</th>
                    <th className="py-3 px-4 text-right font-black">League Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CLUBS_LIST.map((club, idx) => (
                    <tr key={club} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-black">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold">{club}</td>
                      <td className="py-3 px-4 text-center">4 / 4</td>
                      <td className="py-3 px-4 text-center text-xs text-slate-500 font-mono">100m (10.88s) · DT (54.80m)</td>
                      <td className="py-3 px-4 text-right font-black font-mono text-[#7D8C19]">
                        {380 - idx * 28} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════
           ATHLETE PERFORMANCE DETAIL MODAL
         ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeAthleteDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7D8C19] text-white flex items-center justify-center font-black text-lg">
                    {activeAthleteDetail.athleteName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                      {activeAthleteDetail.athleteName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeAthleteDetail.club} · Bib #{activeAthleteDetail.bib} · {activeAthleteDetail.category} {activeAthleteDetail.gender}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveAthleteDetail(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Highlight Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">FINISH PLACE</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {activeAthleteDetail.rank}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">MARK</span>
                    <span className="text-2xl font-black font-mono text-[#7D8C19]">
                      {activeAthleteDetail.performance}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">WIND SPEED</span>
                    <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                      {activeAthleteDetail.wind || 'NWI'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">REACTION TIME</span>
                    <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                      {activeAthleteDetail.reactionTime || '—'}
                    </span>
                  </div>
                </div>

                {/* Disqualification or Status alert if applicable */}
                {activeAthleteDetail.status === 'DQ' && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Disqualification Enacted:</span> {activeAthleteDetail.dqRule || 'Technical infringement'}
                    </div>
                  </div>
                )}

                {/* Lap / Interval Splits (for Track) */}
                {activeAthleteDetail.splits && activeAthleteDetail.splits.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Activity size={14} /> Interval Splits Progression
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeAthleteDetail.splits.map((s) => (
                        <div key={s.point} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">{s.point}</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attempt Trials Series (for Field) */}
                {activeAthleteDetail.attempts && activeAthleteDetail.attempts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Trophy size={14} /> Official 6 Attempts Series
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {activeAthleteDetail.attempts.map((att) => (
                        <div
                          key={att.attemptNumber}
                          className={`p-2 rounded-lg border text-center text-xs ${
                            att.isFoul
                              ? 'border-red-300 bg-red-50/50 dark:border-red-900 text-red-600'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                          }`}
                        >
                          <span className="block text-[10px] text-slate-400">Attempt {att.attemptNumber}</span>
                          <span className="font-mono font-black text-sm">{att.mark}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Metadata */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Competition:</span>
                    <span className="font-bold">{activeAthleteDetail.eventTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date & Venue:</span>
                    <span className="font-bold">{activeAthleteDetail.date} · {activeAthleteDetail.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timing Method:</span>
                    <span className="font-bold">Fully Automatic Timing (FAT) · Photo-Finish</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
                <span className="text-xs text-slate-400">
                  Sanctioned by Ethiopian Athletics Federation
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onNotify?.(`Performance record for ${activeAthleteDetail.athleteName} saved.`, 'success');
                    setActiveAthleteDetail(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#7D8C19] text-white hover:bg-[#6D7B15] transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
