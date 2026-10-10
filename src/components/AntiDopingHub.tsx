import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Clock,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  Award,
  ChevronRight,
  Send,
  XCircle,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';

interface AntiDopingHubProps {
  darkMode?: boolean;
}

export default function AntiDopingHub({ darkMode = false }: AntiDopingHubProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WHEREABOUTS' | 'PROHIBITED_LIST' | 'SANCTIONS' | 'TUE'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // TUE Form State
  const [tueMedication, setTueMedication] = useState('');
  const [tueDiagnosis, setTueDiagnosis] = useState('');
  const [tueDosage, setTueDosage] = useState('');
  const [tuePhysician, setTuePhysician] = useState('');
  const [tueSubmitted, setTueSubmitted] = useState(false);

  // Prohibited substances & common medications database
  const prohibitedSubstances = [
    { code: 'S1', category: 'Anabolic Agents', name: 'Nandrolone, Stanozolol, Testosterone, Boldenone', status: 'PROHIBITED_ALWAYS', badge: 'Prohibited At All Times', tueEligible: false, note: 'Strict liability. Severe sanction period (4 years).' },
    { code: 'S2', category: 'Peptide Hormones & Growth Factors', name: 'Erythropoietin (EPO), CERA, Darbepoetin, hGH, IGF-1', status: 'PROHIBITED_ALWAYS', badge: 'Prohibited At All Times', tueEligible: false, note: 'Blood manipulation & oxygen transfer enhancers.' },
    { code: 'S3', category: 'Beta-2 Agonists', name: 'Salbutamol, Formoterol, Salmeterol, Vilanterol', status: 'RESTRICTED', badge: 'Permitted with Threshold', tueEligible: true, note: 'Inhaled salbutamol permitted up to 1600 mcg per 24 hours. Oral form strictly prohibited.' },
    { code: 'S4', category: 'Hormone & Metabolic Modulators', name: 'Meldonium, Trimetazidine, Tamoxifen, Clomifene, Letrozole', status: 'PROHIBITED_ALWAYS', badge: 'Prohibited At All Times', tueEligible: false, note: 'Metabolic pathway modifiers and estrogen blockers.' },
    { code: 'S5', category: 'Diuretics & Masking Agents', name: 'Furosemide, Hydrochlorothiazide, Spironolactone, Acetazolamide', status: 'PROHIBITED_ALWAYS', badge: 'Prohibited At All Times', tueEligible: true, note: 'Masking agents and rapid weight-loss substances.' },
    { code: 'M1-M3', category: 'Prohibited Methods', name: 'Blood Transfusions, Artificial Oxygen Carriers, IV Infusions > 100mL', status: 'PROHIBITED_ALWAYS', badge: 'Prohibited Methods', tueEligible: false, note: 'Any IV infusion exceeding 100 mL per 12-hour period requires retroactive hospital documentation.' },
    { code: 'S6', category: 'Stimulants', name: 'Amphetamine, Cocaine, Modafinil, Methylphenidate, Pseudoephedrine (>150mcg)', status: 'PROHIBITED_IN_COMPETITION', badge: 'Prohibited In-Competition', tueEligible: true, note: 'Prohibited from 23:59 on the day before a competition until test completion.' },
    { code: 'S7', category: 'Narcotics', name: 'Fentanyl, Morphine, Oxycodone, Diamorphine (Heroin)', status: 'PROHIBITED_IN_COMPETITION', badge: 'Prohibited In-Competition', tueEligible: true, note: 'Strong opioid analgesics prohibited in competition.' },
    { code: 'S8', category: 'Cannabinoids', name: 'Natural and synthetic THC, Hashish, Cannabis', status: 'PROHIBITED_IN_COMPETITION', badge: 'Prohibited In-Competition', tueEligible: false, note: 'All natural and synthetic cannabinoids are prohibited in competition. Cannabidiol (CBD) is permitted.' },
    { code: 'S9', category: 'Glucocorticoids', name: 'Prednisone, Dexamethasone, Triamcinolone Acetonide, Betamethasone', status: 'PROHIBITED_IN_COMPETITION', badge: 'Injectable/Oral Prohibited', tueEligible: true, note: 'Oral, rectal, or any injectable route prohibited in competition. Inhaled and topical routes are permitted.' },
    // Permitted common medications
    { code: 'MED-01', category: 'Permitted Medications', name: 'Paracetamol (Acetaminophen), Aspirin, Ibuprofen, Naproxen', status: 'PERMITTED', badge: 'Permitted At All Times', tueEligible: false, note: 'Standard non-steroidal anti-inflammatory drugs (NSAIDs) and simple analgesics are permitted.' },
    { code: 'MED-02', category: 'Permitted Medications', name: 'Amoxicillin, Azithromycin, Ciprofloxacin, Doxycycline', status: 'PERMITTED', badge: 'Permitted At All Times', tueEligible: false, note: 'Common antibiotics are fully permitted under the WADA Code.' },
    { code: 'MED-03', category: 'Permitted Medications', name: 'Cetirizine, Loratadine, Fexofenadine (Antihistamines)', status: 'PERMITTED', badge: 'Permitted At All Times', tueEligible: false, note: 'All standard oral antihistamines for allergies are permitted.' }
  ];

  const filteredSubstances = prohibitedSubstances.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' ||
                             (categoryFilter === 'PROHIBITED' && item.status.includes('PROHIBITED')) ||
                             (categoryFilter === 'PERMITTED' && item.status === 'PERMITTED') ||
                             (categoryFilter === 'RESTRICTED' && item.status === 'RESTRICTED');
    return matchesSearch && matchesCategory;
  });

  const handleTueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tueMedication || !tueDiagnosis || !tuePhysician) return;
    setTueSubmitted(true);
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${darkMode ? 'bg-[#0B0F17] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header Banner ── */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 mb-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
                <ShieldAlert size={14} />
                <span>Athletics Integrity & Fair Play Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Anti-Doping & Clean Sport Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Comprehensive testing management, registered whereabouts, World Anti-Doping Code compliance,
                prohibited substance registry, and authorized Therapeutic Use Exemptions (TUE).
              </p>
            </div>

            {/* Official Authority Links */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <a
                href="https://www.athleticsintegrity.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-all shadow-sm"
              >
                <span>AIU Athletics Integrity</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://www.wada-ama.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold hover:bg-emerald-100 transition-all"
              >
                <span>WADA Prohibited List</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://adams.wada-ama.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-extrabold hover:bg-sky-100 transition-all"
              >
                <span>ADAMS Whereabouts</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            {[
              { id: 'OVERVIEW', label: 'Integrity Overview', icon: Activity },
              { id: 'WHEREABOUTS', label: 'Athlete Whereabouts & Testing', icon: MapPin },
              { id: 'PROHIBITED_LIST', label: 'Prohibited Substances & Meds', icon: AlertTriangle },
              { id: 'SANCTIONS', label: 'Sanctions Registry', icon: XCircle },
              { id: 'TUE', label: 'Therapeutic Use Exemption (TUE)', icon: FileText },
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

        {/* ── Tab Content ── */}

        {/* 1. OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Core Pillars */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Ethiopian National Anti-Doping Framework (ETH-NADO & AIU)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  The Ethiopian Athletics Federation operates under strict adherence to the World Anti-Doping Code,
                  in direct coordination with the Athletics Integrity Unit (AIU) and the Ethiopian National Anti-Doping Authority (ETH-NADO).
                  Every national team member and registered club athlete is subject to in-competition and unannounced out-of-competition testing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                      Registered Testing Pool (RTP)
                    </div>
                    <div className="text-xl font-black text-emerald-950 dark:text-emerald-200">
                      100% RTP Coverage
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Quarterly whereabouts filing required on ADAMS for all World Athletics Category A elite runners.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
                    <div className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-1">
                      Biological Passport (ABP)
                    </div>
                    <div className="text-xl font-black text-sky-950 dark:text-sky-200">
                      Haematological & Steroidal
                    </div>
                    <p className="text-xs text-sky-700 dark:text-sky-400 mt-1">
                      Continuous longitudinal monitoring of blood biomarkers through certified WADA laboratories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast Testing Statistics */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  Annual Testing Protocols (2025/2026 Season)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">1,480+</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Out-of-Competition Tests</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">620+</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">In-Competition Tests</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.4%</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Compliance Rate</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-2xl font-black text-sky-600 dark:text-sky-400">100%</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Fayda ID Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accredited Authorities Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  Official Anti-Doping Authorities
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>World Anti-Doping Agency</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">WADA</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      International standards for testing, laboratories, TUEs, and the World Anti-Doping Code.
                    </p>
                    <a href="https://www.wada-ama.org" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-600 font-bold mt-2 hover:underline">
                      Visit wada-ama.org <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Athletics Integrity Unit</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">AIU</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Independent body managing testing, intelligence, investigations, and sanctioning for World Athletics.
                    </p>
                    <a href="https://www.athleticsintegrity.org" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-600 font-bold mt-2 hover:underline">
                      Visit athleticsintegrity.org <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Ethiopian NADO</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">ETH-NADO</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      National anti-doping authority conducting sample collection and educational seminars across high-altitude camps.
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                      Hotline: +251 11 558 3920
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. WHEREABOUTS & TESTING HISTORY */}
        {activeTab === 'WHEREABOUTS' && (
          <div className="space-y-6">
            {/* Active Whereabouts Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                    <CheckCircle2 size={13} />
                    <span>ADAMS Whereabouts Synchronized</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Current Quarter (Q4 2026) Whereabouts Filing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Athletes in the World Athletics Registered Testing Pool (RTP) must specify a 60-minute daily testing slot between 05:00 and 23:00.
                  </p>
                </div>
                <a
                  href="https://adams.wada-ama.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-sm transition-all shrink-0"
                >
                  <span>Update in ADAMS Portal</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <Clock size={14} className="text-sky-600" />
                    <span>Daily 60-Min Testing Slot</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">06:00 - 07:00 AM</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">Confirmed Available</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <MapPin size={14} className="text-emerald-600" />
                    <span>Primary Training Base</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">Bekoji Altitude Center</div>
                  <div className="text-[11px] text-slate-500 font-bold mt-1">Arsi Zone, Oromia</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <Building size={14} className="text-purple-600" />
                    <span>Overnight Accommodation</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">National Elite Camp</div>
                  <div className="text-[11px] text-slate-500 font-bold mt-1">Villa 4, Sululta / Bekoji</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar size={14} className="text-orange-600" />
                    <span>Next Quarter Filing Deadline</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">15 Dec 2026</div>
                  <div className="text-[11px] text-sky-600 font-bold mt-1">66 Days Remaining</div>
                </div>
              </div>
            </div>

            {/* Doping Control Testing History */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Official Doping Control History (Clean Pass Certified)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Verified anti-doping sample results processed by WADA-accredited laboratories under Chain of Custody standards.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-extrabold">Test Date</th>
                      <th className="pb-3 font-extrabold">Mission Type</th>
                      <th className="pb-3 font-extrabold">Sample Type</th>
                      <th className="pb-3 font-extrabold">Testing Authority</th>
                      <th className="pb-3 font-extrabold">Laboratory</th>
                      <th className="pb-3 font-extrabold">Certificate / Custody ID</th>
                      <th className="pb-3 font-extrabold text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {[
                      {
                        date: '14 Aug 2026',
                        type: 'Out-of-Competition',
                        sample: 'Urine & Blood ABP',
                        authority: 'Athletics Integrity Unit (AIU)',
                        lab: 'WADA Accredited Lab (Lausanne)',
                        id: 'WADA-TST-2026-8812',
                        status: 'NEGATIVE / CLEAN'
                      },
                      {
                        date: '28 May 2026',
                        type: 'In-Competition',
                        sample: 'Urine',
                        authority: 'ETH-NADO National Trials',
                        lab: 'WADA Accredited Lab (Bloemfontein)',
                        id: 'ETH-TST-2026-0419',
                        status: 'NEGATIVE / CLEAN'
                      },
                      {
                        date: '10 Feb 2026',
                        type: 'Out-of-Competition',
                        sample: 'Blood ABP (Haematological)',
                        authority: 'Athletics Integrity Unit (AIU)',
                        lab: 'WADA Accredited Lab (Seibersdorf)',
                        id: 'WADA-TST-2026-3109',
                        status: 'NEGATIVE / CLEAN'
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">{row.date}</td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                            {row.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">{row.sample}</td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-200 font-bold">{row.authority}</td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400">{row.lab}</td>
                        <td className="py-3.5 font-mono text-xs text-sky-700 dark:text-sky-400">{row.id}</td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                            <CheckCircle2 size={12} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PROHIBITED SUBSTANCES & MEDICATIONS */}
        {activeTab === 'PROHIBITED_LIST' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    WADA 2026 Prohibited Substances & Medications Database
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Search active ingredients, over-the-counter medications, and prohibited methods to verify compliance before use.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search medication or substance..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 flex-wrap mb-6">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'PROHIBITED', label: 'Prohibited' },
                  { id: 'RESTRICTED', label: 'Restricted / Threshold' },
                  { id: 'PERMITTED', label: 'Permitted Medications' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setCategoryFilter(filter.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      categoryFilter === filter.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {filteredSubstances.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {item.code}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.category}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {item.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          item.status === 'PERMITTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'RESTRICTED'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {item.badge}
                        </span>
                        {item.tueEligible && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-extrabold">
                            TUE Eligible
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 pl-1 border-l-2 border-slate-200 dark:border-slate-700">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. SANCTIONS REGISTRY */}
        {activeTab === 'SANCTIONS' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={20} className="text-red-600" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Official Sanctions & Ineligibility Registry
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                In compliance with World Athletics Rule 15 and WADA Code transparency requirements, athletes and athlete support personnel currently serving periods of ineligibility are published below.
              </p>

              <div className="space-y-4">
                {[
                  {
                    name: 'Case Ref. ETH-AIU-2024-08',
                    role: 'Athlete',
                    discipline: 'Half Marathon / Road',
                    violation: 'Article 2.1 - Presence of Prohibited Substance (Triamcinolone Acetonide)',
                    period: '2 Years Ineligibility',
                    dates: '10 May 2024 — 09 May 2026',
                    tribunal: 'AIU Disciplinary Panel'
                  },
                  {
                    name: 'Case Ref. ETH-NADO-2023-14',
                    role: 'Athlete Support Personnel / Coach',
                    discipline: 'Middle Distance',
                    violation: 'Article 2.8 - Administration and Assisting Anti-Doping Rule Violation',
                    period: '4 Years Ineligibility',
                    dates: '15 Jan 2023 — 14 Jan 2027',
                    tribunal: 'ETH-NADO National Disciplinary Committee'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">{item.name}</span>
                        <span className="px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 text-[10px] font-black uppercase">
                          {item.role}
                        </span>
                      </div>
                      <span className="text-xs font-black text-red-700 dark:text-red-400">
                        {item.period}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {item.violation}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span><strong>Discipline:</strong> {item.discipline}</span>
                      <span><strong>Sanction Window:</strong> {item.dates}</span>
                      <span><strong>Tribunal:</strong> {item.tribunal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. THERAPEUTIC USE EXEMPTION (TUE) */}
        {activeTab === 'TUE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Apply for Therapeutic Use Exemption (TUE)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Athletes with a diagnosed medical condition requiring a prohibited medication must obtain an approved TUE prior to competing.
              </p>

              {tueSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                    TUE Application Successfully Submitted!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-md mx-auto">
                    Your request for <strong>{tueMedication}</strong> has been forwarded to the ETH-NADO TUE Medical Committee.
                    A medical panel will review the clinical file within 21 days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTueSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Medication / Substance Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Inhaled Salbutamol (>1600mcg), Insulin, Methylprednisolone"
                      value={tueMedication}
                      onChange={e => setTueMedication(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Medical Diagnosis
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Exercise-Induced Bronchospasm, Type 1 Diabetes"
                        value={tueDiagnosis}
                        onChange={e => setTueDiagnosis(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dosage & Administration Route
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 200mcg twice daily via inhaler"
                        value={tueDosage}
                        onChange={e => setTueDosage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Prescribing Physician & Medical Board License
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dr. Hailu Bekele, MD (MoH License: ETH-MED-8492)"
                      value={tuePhysician}
                      onChange={e => setTuePhysician(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                    <strong>Mandatory Clinical Evidence:</strong> Diagnostic spirometry, laboratory workups, or specialist letters must be submitted alongside this form to the EAF Medical Department.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>Submit TUE Dossier for Review</span>
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-3">
                  TUE Criteria Checklist
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Athlete would experience significant health impairment without the substance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>No reasonable permitted therapeutic alternative exists.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Use will not produce performance enhancement beyond return to baseline health.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Necessity is not consequence of prior prohibited substance abuse.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
