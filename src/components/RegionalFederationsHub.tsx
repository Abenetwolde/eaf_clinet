import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Calendar,
  Trophy,
  Building,
  Target,
  Users,
  Compass,
  PlusCircle,
  X,
  Send,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  FileSpreadsheet,
  Award
} from 'lucide-react';

interface RegionalFederationsHubProps {
  darkMode?: boolean;
}

export default function RegionalFederationsHub({ darkMode = false }: RegionalFederationsHubProps) {
  const [activeTab, setActiveTab] = useState<'FEDERATIONS' | 'CALENDAR' | 'RESULTS'>('FEDERATIONS');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('REG-ORO');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Form State for new regional competition
  const [newCompTitle, setNewCompTitle] = useState('');
  const [newCompRegion, setNewCompRegion] = useState('REG-ORO');
  const [newCompVenue, setNewCompVenue] = useState('');
  const [newCompStartDate, setNewCompStartDate] = useState('');
  const [newCompEndDate, setNewCompEndDate] = useState('');
  const [newCompDisciplines, setNewCompDisciplines] = useState('1500m, 5000m, 10000m');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Regional Federations & Structures Data
  const [regionalFederations, setRegionalFederations] = useState([
    {
      id: 'REG-ORO',
      name: 'Oromia Regional Athletics Federation',
      amharicName: 'የኦሮሚያ አትሌቲክስ ፌዴሬሽን',
      headquarters: 'Adama & Sululta',
      president: 'Chala Degefa',
      technicalDirector: 'Dube Jillo',
      contactEmail: 'athletics@oromia.gov.et',
      phone: '+251 22 111 8492',
      activeAthletesCount: 1420,
      clubsCount: 18,
      clubs: [
        { id: 'CL-OWW', name: 'Oromia Water Works Club', city: 'Sululta', memberCount: 64 },
        { id: 'CL-MUG', name: 'Muger Cement Athletics Club', city: 'Muger', memberCount: 52 },
        { id: 'CL-BEK', name: 'Bekoji Young Runners Club', city: 'Bekoji', memberCount: 78 }
      ],
      trainingCenters: [
        { id: 'TC-01', name: 'Bekoji High Altitude Training Center', altitudeMeters: 2810, focus: '5,000m - Marathon' },
        { id: 'TC-02', name: 'Sululta High Altitude Training Complex', altitudeMeters: 2750, focus: 'Endurance & Recovery' }
      ],
      developmentProjects: [
        { id: 'PRJ-01', name: 'Arsi Talent Identification & Nurturing Site', trainees: 120, target: 'U18 & U20 Distance' },
        { id: 'PRJ-02', name: 'Bale Mountain Steeplechase Grassroots Hub', trainees: 45, target: '3,000m Steeplechase' }
      ],
      facilities: ['Bekoji Stadium & Clay Track', 'Sululta Tartan 400m Track', 'Adama Regional Stadium']
    },
    {
      id: 'REG-AMH',
      name: 'Amhara Regional Athletics Federation',
      amharicName: 'የአማራ አትሌቲክስ ፌዴሬሽን',
      headquarters: 'Bahir Dar',
      president: 'Dr. Getachew Reda',
      technicalDirector: 'Worku Bikila',
      contactEmail: 'athletics@amhara.gov.et',
      phone: '+251 58 220 1480',
      activeAthletesCount: 980,
      clubsCount: 12,
      clubs: [
        { id: 'CL-BD', name: 'Bahir Dar City Athletics Club', city: 'Bahir Dar', memberCount: 48 },
        { id: 'CL-GON', name: 'Fasil Kenema Athletics Club', city: 'Gondar', memberCount: 42 },
        { id: 'CL-DB', name: 'Debre Birhan High Altitude Athletics', city: 'Debre Birhan', memberCount: 56 }
      ],
      trainingCenters: [
        { id: 'TC-03', name: 'Debre Birhan Extreme Altitude Training Hub', altitudeMeters: 2840, focus: 'Marathon & 10,000m' }
      ],
      developmentProjects: [
        { id: 'PRJ-03', name: 'Wollo Middle Distance Project', trainees: 85, target: '800m & 1,500m' }
      ],
      facilities: ['Bahir Dar International Stadium', 'Debre Birhan Tartan Training Facility']
    },
    {
      id: 'REG-AA',
      name: 'Addis Ababa Athletics Federation',
      amharicName: 'የአዲስ አበባ አትሌቲክስ ፌዴሬሽን',
      headquarters: 'Addis Ababa',
      president: 'Bililign Mekoya',
      technicalDirector: 'Tolosa Kotu',
      contactEmail: 'info@addisathletics.et',
      phone: '+251 11 551 2488',
      activeAthletesCount: 2150,
      clubsCount: 22,
      clubs: [
        { id: 'CL-EEAC', name: 'Ethiopian Electric Athletics Club', city: 'Addis Ababa', memberCount: 92 },
        { id: 'CL-DEF', name: 'Defense Sports Club Athletics', city: 'Addis Ababa', memberCount: 88 },
        { id: 'CL-CBE', name: 'Commercial Bank of Ethiopia Club', city: 'Addis Ababa', memberCount: 74 },
        { id: 'CL-POL', name: 'Federal Police Athletics Club', city: 'Addis Ababa', memberCount: 68 }
      ],
      trainingCenters: [
        { id: 'TC-04', name: 'Yaya Africa Athletics Village', altitudeMeters: 2700, focus: 'International Acclimatization' }
      ],
      developmentProjects: [
        { id: 'PRJ-04', name: 'Metropolitan Sprint & Hurdle Academy', trainees: 60, target: '100m, 200m, 400m Hurdles' }
      ],
      facilities: ['Abebe Bikila Stadium', 'Addis Ababa National Stadium', 'Jan Meda Cross Country Course']
    },
    {
      id: 'REG-SID',
      name: 'Sidama Regional Athletics Federation',
      amharicName: 'የሲዳማ አትሌቲክስ ፌዴሬሽን',
      headquarters: 'Hawassa',
      president: 'Tsegaye Wolde',
      technicalDirector: 'Abebech Negussie',
      contactEmail: 'sidama.athletics@gov.et',
      phone: '+251 46 220 5410',
      activeAthletesCount: 620,
      clubsCount: 8,
      clubs: [
        { id: 'CL-HW', name: 'Hawassa Kenema Athletics Club', city: 'Hawassa', memberCount: 46 }
      ],
      trainingCenters: [
        { id: 'TC-05', name: 'Hawassa Lakeview Sprint & Jump Academy', altitudeMeters: 1700, focus: 'Sprints, Relays & Jumps' }
      ],
      developmentProjects: [
        { id: 'PRJ-05', name: 'Aleta Wondo Endurance Initiative', trainees: 40, target: 'Road Racing' }
      ],
      facilities: ['Hawassa International Stadium']
    },
    {
      id: 'REG-TIG',
      name: 'Tigray Regional Athletics Federation',
      amharicName: 'የትግራይ አትሌቲክስ ፌዴሬሽን',
      headquarters: 'Mekelle',
      president: 'Kahsay Berhe',
      technicalDirector: 'Gebremedhin Hailu',
      contactEmail: 'tigray.athletics@et',
      phone: '+251 34 440 2199',
      activeAthletesCount: 540,
      clubsCount: 7,
      clubs: [
        { id: 'CL-MEK', name: 'Mekelle 70 Enderta Athletics', city: 'Mekelle', memberCount: 38 }
      ],
      trainingCenters: [
        { id: 'TC-06', name: 'Mekelle High Plateau Training Base', altitudeMeters: 2250, focus: 'Middle Distance' }
      ],
      developmentProjects: [
        { id: 'PRJ-06', name: 'North Highlands Youth Track Clinic', trainees: 50, target: 'Grassroots Track' }
      ],
      facilities: ['Tigray International Stadium (Mekelle)']
    }
  ]);

  // Regional Competitions Calendar
  const [competitions, setCompetitions] = useState([
    {
      id: 'RCOMP-2026-01',
      title: 'Oromia Regional High-Altitude Championship',
      regionId: 'REG-ORO',
      regionName: 'Oromia',
      startDate: '2026-11-14',
      endDate: '2026-11-16',
      venue: 'Sululta National Stadium',
      categories: ['U18 Youth', 'U20 Junior', 'Senior Division'],
      disciplines: ['1500m', '5000m', '10000m', '3000m Steeplechase'],
      status: 'SCHEDULED',
      registeredClubsCount: 16,
      hasOfficialResults: false
    },
    {
      id: 'RCOMP-2026-02',
      title: '54th Ethiopian National Championship Regional Qualifier',
      regionId: 'REG-AA',
      regionName: 'Addis Ababa',
      startDate: '2026-10-24',
      endDate: '2026-10-26',
      venue: 'Abebe Bikila Stadium',
      categories: ['Senior Division'],
      disciplines: ['100m', '400m', '800m', '1500m', '5000m', '10000m', '4x400m Relay'],
      status: 'SCHEDULED',
      registeredClubsCount: 22,
      hasOfficialResults: false
    },
    {
      id: 'RCOMP-2026-03',
      title: 'Amhara Highland Cross Country Trials',
      regionId: 'REG-AMH',
      regionName: 'Amhara',
      startDate: '2026-09-18',
      endDate: '2026-09-18',
      venue: 'Debre Birhan Extreme Elevation Loop',
      categories: ['U20 Junior 6km', 'Senior Men 10km', 'Senior Women 10km'],
      disciplines: ['Cross Country 10km', 'Cross Country 6km'],
      status: 'COMPLETED',
      registeredClubsCount: 11,
      hasOfficialResults: true,
      results: [
        { event: 'Senior Men 10km', rank: 1, athleteName: 'Tadese Worku', club: 'Debre Birhan Athletics', time: '29:14.2', note: 'Course Record' },
        { event: 'Senior Men 10km', rank: 2, athleteName: 'Biniam Mehary', club: 'Bahir Dar City AC', time: '29:22.8', note: 'FAT Official' },
        { event: 'Senior Women 10km', rank: 1, athleteName: 'Senbere Teferi', club: 'Fasil Kenema AC', time: '32:45.0', note: 'National Standard' }
      ]
    }
  ]);

  // Load backend data if available
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/regional-federations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setRegionalFederations(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:3000/api/v1/regional-competitions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setCompetitions(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const selectedRegion = regionalFederations.find(r => r.id === selectedRegionId) || regionalFederations[0];

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompTitle || !newCompVenue || !newCompStartDate) return;

    const matchedRegion = regionalFederations.find(r => r.id === newCompRegion);
    const payload = {
      title: newCompTitle,
      regionId: newCompRegion,
      regionName: matchedRegion ? matchedRegion.name.split(' ')[0] : 'Regional Federation',
      startDate: newCompStartDate,
      endDate: newCompEndDate || newCompStartDate,
      venue: newCompVenue,
      categories: ['Senior Division', 'U20 Junior'],
      disciplines: newCompDisciplines.split(',').map(s => s.trim())
    };

    try {
      const res = await fetch('http://localhost:3000/api/v1/regional-competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompetitions(prev => [data.data, ...prev]);
      } else {
        const fallback = {
          id: 'RCOMP-2026-' + String(competitions.length + 1).padStart(2, '0'),
          ...payload,
          status: 'SCHEDULED',
          registeredClubsCount: 1,
          hasOfficialResults: false
        };
        setCompetitions(prev => [fallback, ...prev]);
      }
    } catch {
      const fallback = {
        id: 'RCOMP-2026-' + String(competitions.length + 1).padStart(2, '0'),
        ...payload,
        status: 'SCHEDULED',
        registeredClubsCount: 1,
        hasOfficialResults: false
      };
      setCompetitions(prev => [fallback, ...prev]);
    }

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setIsPublishModalOpen(false);
      setNewCompTitle('');
      setNewCompVenue('');
      setNewCompStartDate('');
      setNewCompEndDate('');
    }, 1500);
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${darkMode ? 'bg-[#0B0F17] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 mb-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
                <Map size={14} />
                <span>EAF Regional Governance & Structures</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Regional Athletics Federations & Structures
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Centralized database of regional federations, accredited athletics clubs, high-altitude training centers,
                development projects, annual competition calendars, and official regional results.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
            >
              <PlusCircle size={17} />
              <span>Publish Regional Competition</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            {[
              { id: 'FEDERATIONS', label: 'Regional Structures & Clubs', icon: Building },
              { id: 'CALENDAR', label: 'Regional Competition Calendar', icon: Calendar },
              { id: 'RESULTS', label: 'Official Regional Results Vault', icon: Trophy },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab 1: REGIONAL STRUCTURES & CLUBS ── */}
        {activeTab === 'FEDERATIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Region Selector List */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">
                Regional Member Federations
              </h3>
              {regionalFederations.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedRegionId === reg.id
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 shadow-sm'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {reg.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {reg.amharicName}
                      </p>
                    </div>
                    <ChevronRight size={16} className={selectedRegionId === reg.id ? 'text-sky-600' : 'text-slate-300'} />
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    <span>{reg.clubsCount} Clubs</span>
                    <span>•</span>
                    <span>{reg.activeAthletesCount} Registered Athletes</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Region Structure Details Panel */}
            <div className="lg:col-span-8 space-y-6">
              {/* Region Overview Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedRegion.id}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedRegion.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">{selectedRegion.amharicName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold block">Headquarters & Secretariat</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRegion.headquarters}</span>
                  </div>
                </div>

                {/* Key Personnel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Regional President</span>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{selectedRegion.president}</div>
                    <div className="text-xs text-slate-500">{selectedRegion.contactEmail}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Technical Director</span>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{selectedRegion.technicalDirector}</div>
                    <div className="text-xs text-slate-500">{selectedRegion.phone}</div>
                  </div>
                </div>

                {/* Affiliated Clubs */}
                <div className="mb-6">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users size={16} className="text-sky-600" />
                    <span>Affiliated Athletics Clubs ({selectedRegion.clubs.length} Clubs Registered)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedRegion.clubs.map(c => (
                      <div key={c.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs">
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{c.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                          <span>{c.city}</span>
                          <span className="font-bold text-sky-600">{c.memberCount} Athletes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High Altitude Training Centers */}
                <div className="mb-6">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Compass size={16} className="text-emerald-600" />
                    <span>Accredited High-Altitude Training Centers</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRegion.trainingCenters.map(tc => (
                      <div key={tc.id} className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                        <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200">{tc.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                          <span>Elevation: {tc.altitudeMeters}m</span>
                          <span>Focus: {tc.focus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Development Projects & Sites */}
                <div className="mb-6">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target size={16} className="text-purple-600" />
                    <span>Grassroots Talent Projects & Development Sites</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRegion.developmentProjects.map(prj => (
                      <div key={prj.id} className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                        <div className="font-bold text-xs text-purple-950 dark:text-purple-200">{prj.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-purple-800 dark:text-purple-400 font-semibold mt-1">
                          <span>{prj.trainees} Youth Trainees</span>
                          <span>Target: {prj.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities & Stadiums */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                    Certified Tracks & Facilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.facilities.map((f, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        🏟️ {f}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: REGIONAL COMPETITION CALENDAR ── */}
        {activeTab === 'CALENDAR' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Annual Regional Athletics Competition Calendar
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Official calendar of regional qualifiers, championship meets, high-altitude cross-country trials, and track invitationals.
              </p>

              <div className="space-y-4">
                {competitions.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{comp.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[10px] font-black uppercase">
                            {comp.regionName}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            comp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {comp.status}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {comp.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar size={13} className="text-slate-400" />
                            {comp.startDate} {comp.endDate !== comp.startDate && `— ${comp.endDate}`}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MapPin size={13} className="text-slate-400" />
                            {comp.venue}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Users size={13} className="text-slate-400" />
                            {comp.registeredClubsCount} Participating Clubs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {comp.hasOfficialResults ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('RESULTS')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                          >
                            View Official Results →
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                            Entries Open
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Disciplines:</span>
                      {comp.disciplines.map((d, idx) => (
                        <span key={idx} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: REGIONAL RESULTS VAULT ── */}
        {activeTab === 'RESULTS' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Official Regional Competition Results & Records
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Certified finish times, FAT electronic photo-finish validation, and club team point totals.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Full PDF Report</span>
                </button>
              </div>

              {/* Sample Competition Results */}
              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Amhara Highland Cross Country Trials 2026
                    </h4>
                    <div className="text-xs text-slate-500 font-semibold">Debre Birhan Extreme Elevation Loop • 18 Sep 2026</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black">
                    ✓ Official Verified Results
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <th className="pb-2.5 font-extrabold">Rank</th>
                        <th className="pb-2.5 font-extrabold">Event</th>
                        <th className="pb-2.5 font-extrabold">Athlete</th>
                        <th className="pb-2.5 font-extrabold">Club</th>
                        <th className="pb-2.5 font-extrabold">Mark / Time</th>
                        <th className="pb-2.5 font-extrabold text-right">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { rank: '1 🥇', event: 'Senior Men 10km', name: 'Tadese Worku', club: 'Debre Birhan Athletics Club', time: '29:14.2', note: 'Course Record / FAT' },
                        { rank: '2 🥈', event: 'Senior Men 10km', name: 'Biniam Mehary', club: 'Bahir Dar City AC', time: '29:22.8', note: 'National Standard' },
                        { rank: '3 🥉', event: 'Senior Men 10km', name: 'Nibret Melak', club: 'Fasil Kenema Athletics', time: '29:35.0', note: 'FAT Timing' },
                        { rank: '1 🥇', event: 'Senior Women 10km', name: 'Senbere Teferi', club: 'Fasil Kenema Athletics', time: '32:45.0', note: 'Trial Winner' },
                        { rank: '2 🥈', event: 'Senior Women 10km', name: 'Mizan Alem', club: 'Debre Birhan Athletics Club', time: '32:58.4', note: 'Personal Best' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 font-black text-slate-900 dark:text-white">{row.rank}</td>
                          <td className="py-2.5 font-bold text-sky-700 dark:text-sky-400">{row.event}</td>
                          <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">{row.name}</td>
                          <td className="py-2.5 text-slate-600 dark:text-slate-300">{row.club}</td>
                          <td className="py-2.5 font-mono font-black text-slate-900 dark:text-white">{row.time}</td>
                          <td className="py-2.5 text-right font-bold text-xs text-emerald-600">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Publish Regional Competition Modal ── */}
        <AnimatePresence>
          {isPublishModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl relative"
              >
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Publish Regional Competition
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Add competition to official EAF Central Database and notify regional clubs.
                </p>

                {publishSuccess ? (
                  <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                      Competition Calendar Published!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Event added to regional competition schedule and club rosters.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePublishSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Competition Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newCompTitle}
                        onChange={e => setNewCompTitle(e.target.value)}
                        placeholder="e.g., Sidama Regional Track & Field Trials"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Host Region
                        </label>
                        <select
                          value={newCompRegion}
                          onChange={e => setNewCompRegion(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {regionalFederations.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Venue / Stadium
                        </label>
                        <input
                          type="text"
                          required
                          value={newCompVenue}
                          onChange={e => setNewCompVenue(e.target.value)}
                          placeholder="e.g., Hawassa International Stadium"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          required
                          value={newCompStartDate}
                          onChange={e => setNewCompStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={newCompEndDate}
                          onChange={e => setNewCompEndDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Disciplines (comma separated)
                      </label>
                      <input
                        type="text"
                        value={newCompDisciplines}
                        onChange={e => setNewCompDisciplines(e.target.value)}
                        placeholder="1500m, 5000m, 10000m, 3000m Steeplechase"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      <Send size={16} />
                      <span>Publish to Central Regional Calendar</span>
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
