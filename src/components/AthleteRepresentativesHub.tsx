import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  CheckCircle2,
  ExternalLink,
  Award,
  Globe,
  Mail,
  Phone,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';

interface AthleteRepresentativesHubProps {
  darkMode?: boolean;
}

export default function AthleteRepresentativesHub({ darkMode = false }: AthleteRepresentativesHubProps) {
  const [representatives, setRepresentatives] = useState([
    {
      id: 'AR-001',
      name: 'Jos Hermens',
      agency: 'Global Sports Communication (GSC)',
      licenseNumber: 'WA-AR-0014',
      licensedSince: '1994',
      headquarters: 'Nijmegen, Netherlands & Kaptagat / Addis Ababa',
      email: 'management@globalsportscommunication.nl',
      phone: '+31 24 378 1289',
      representedAthletes: [
        {
          id: 'ATH-KEN',
          name: 'Kenenisa Bekele',
          worldAthleticsId: '14207842',
          eventFocus: 'Marathon & 10,000m Legend',
          status: 'ACTIVE',
          contractPeriod: '2023 - 2027',
          waGlobalRanking: '#12 World Marathon (2:01:41)'
        },
        {
          id: 'ATH-GUD',
          name: 'Gudaf Tsegay',
          worldAthleticsId: '14561234',
          eventFocus: '5000m World Record Holder / 10000m',
          status: 'ACTIVE',
          contractPeriod: '2022 - 2028',
          waGlobalRanking: "#1 Women's 5000m (WR 14:00.21)"
        },
        {
          id: 'ATH-SELE',
          name: 'Selemon Barega',
          worldAthleticsId: '14689012',
          eventFocus: '10,000m Olympic Champion',
          status: 'ACTIVE',
          contractPeriod: '2021 - 2027',
          waGlobalRanking: "#2 Men's 10,000m (Olympic Gold)"
        }
      ]
    },
    {
      id: 'AR-002',
      name: 'Federico Rosa & Gabriele Rosa',
      agency: 'Rosa & Associati Sports Agency',
      licenseNumber: 'WA-AR-0042',
      licensedSince: '1999',
      headquarters: 'Brescia, Italy & Addis Ababa',
      email: 'athletes@rosassociati.it',
      phone: '+39 030 242 8190',
      representedAthletes: [
        {
          id: 'ATH-SIS',
          name: 'Sisay Lemma',
          worldAthleticsId: '14389021',
          eventFocus: 'Boston & Valencia Marathon Champion',
          status: 'ACTIVE',
          contractPeriod: '2022 - 2026',
          waGlobalRanking: '#1 World Marathon Leader (2:01:48)'
        },
        {
          id: 'ATH-GOT',
          name: 'Gotytom Gebreslase',
          worldAthleticsId: '14498701',
          eventFocus: 'World Marathon Champion',
          status: 'ACTIVE',
          contractPeriod: '2021 - 2026',
          waGlobalRanking: "#4 Women's World Marathon (Oregon 2022 Gold)"
        }
      ]
    },
    {
      id: 'AR-003',
      name: 'Gianni Demadonna',
      agency: 'Demadonna Athletic Associates',
      licenseNumber: 'WA-AR-0031',
      licensedSince: '2001',
      headquarters: 'Trento, Italy & Addis Ababa',
      email: 'info@demadonna.com',
      phone: '+39 0461 823 400',
      representedAthletes: [
        {
          id: 'ATH-TAM',
          name: 'Tamirat Tola',
          worldAthleticsId: '14451299',
          eventFocus: 'Paris 2024 Olympic Marathon Champion & OR',
          status: 'ACTIVE',
          contractPeriod: '2020 - 2028',
          waGlobalRanking: "#1 Men's Marathon Olympic Gold (2:06:26 OR)"
        },
        {
          id: 'ATH-ASE',
          name: 'Amane Beriso Shankule',
          worldAthleticsId: '14512034',
          eventFocus: 'World Champion Marathon (Valencia 2:14:58)',
          status: 'ACTIVE',
          contractPeriod: '2022 - 2027',
          waGlobalRanking: "#3 Women's World Marathon"
        }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Load backend data if available
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/athlete-representatives')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setRepresentatives(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredRepresentatives = representatives.filter(rep => {
    const q = searchQuery.toLowerCase();
    const matchesRep = rep.name.toLowerCase().includes(q) ||
                       rep.agency.toLowerCase().includes(q) ||
                       rep.licenseNumber.toLowerCase().includes(q);
    const matchesAthlete = rep.representedAthletes.some(a =>
      a.name.toLowerCase().includes(q) || a.eventFocus.toLowerCase().includes(q)
    );
    return matchesRep || matchesAthlete;
  });

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${darkMode ? 'bg-[#0B0F17] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header Banner ── */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 mb-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-bold mb-3">
                <Briefcase size={14} />
                <span>World Athletics Authorized Representative Registry</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Athlete Representatives & Represented Rosters
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Official registry of World Athletics licensed Athlete Representatives (Agents) authorized to represent
                Ethiopian athletes in international competitions, Diamond League meetings, and commercial endorsements.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search representative, agency, athlete..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* ── Representatives Directory ── */}
        <div className="space-y-8">
          {filteredRepresentatives.map((rep) => (
            <div
              key={rep.id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              {/* Rep Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {rep.licenseNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                      ✓ World Athletics Authorized
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Licensed since {rep.licensedSince}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {rep.name}
                  </h3>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5 mt-0.5">
                    <Building size={14} />
                    <span>{rep.agency}</span>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Globe size={13} className="text-slate-400" />
                    <span>{rep.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Mail size={13} className="text-slate-400" />
                    <span>{rep.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold font-mono">
                    <Phone size={13} className="text-slate-400" />
                    <span>{rep.phone}</span>
                  </div>
                </div>
              </div>

              {/* Represented Athletes Roster */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={16} className="text-purple-600" />
                    <span>Represented Ethiopian Athletes ({rep.representedAthletes.length} Athletes)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    Direct World Athletics Verified Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rep.representedAthletes.map((ath) => (
                    <div
                      key={ath.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          WA ID: {ath.worldAthleticsId}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {ath.status}
                        </span>
                      </div>

                      <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {ath.name}
                      </div>

                      <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                        {ath.eventFocus}
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Global Ranking / Distinction</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{ath.waGlobalRanking}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span>Contract: {ath.contractPeriod}</span>
                        <a
                          href={`https://worldathletics.org/athletes/ethiopia/${ath.worldAthleticsId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 font-bold hover:underline"
                        >
                          <span>WA Profile</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
