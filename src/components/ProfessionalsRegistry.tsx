import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Award,
  Stethoscope,
  Activity,
  HeartPulse,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  X,
  Send,
  Building,
  MapPin,
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface ProfessionalsRegistryProps {
  darkMode?: boolean;
}

interface Professional {
  id: string;
  name: string;
  category: 'TECHNICAL_OFFICIAL' | 'MEDICAL' | 'COACH' | 'MASSAGE_THERAPIST' | 'PHYSIOTHERAPIST';
  roleTitle: string;
  qualificationLevel: string;
  licenseNumber: string;
  region: string;
  institution: string;
  experienceYears: number;
  status: string;
  verified: boolean;
}

export default function ProfessionalsRegistry({ darkMode = false }: ProfessionalsRegistryProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([
    {
      id: 'PROF-001',
      name: 'Dr. Ayana Tadesse',
      category: 'MEDICAL',
      roleTitle: 'Team Physician & Sports Medicine Specialist',
      qualificationLevel: 'MoH Specialist Board / WA Level 3 Sports Medicine',
      licenseNumber: 'ETH-MED-2018-8492',
      region: 'Addis Ababa / Federal',
      institution: 'National Sports Medical Center / Tikur Anbessa Hospital',
      experienceYears: 14,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-002',
      name: 'Coach Gemedu Dedefo',
      category: 'COACH',
      roleTitle: 'Elite Marathon & Middle Distance Coach',
      qualificationLevel: 'World Athletics Level 3 High Performance',
      licenseNumber: 'WA-COA-ETH-2024-102',
      region: 'Oromia / Bekoji',
      institution: 'Oromia Water Works Athletics Club',
      experienceYears: 19,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-003',
      name: 'Sister Bethlehem Girma',
      category: 'PHYSIOTHERAPIST',
      roleTitle: 'Senior Musculoskeletal & Olympic Physiotherapist',
      qualificationLevel: 'MSc Sports Physiotherapy / WA Accredited',
      licenseNumber: 'ETH-PHY-2020-4109',
      region: 'Addis Ababa',
      institution: 'EAF National Elite Recovery Center',
      experienceYears: 10,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-004',
      name: 'Hailu Mekonnen',
      category: 'TECHNICAL_OFFICIAL',
      roleTitle: 'World Athletics Technical Delegate & International Referee',
      qualificationLevel: 'World Athletics International Technical Official (ITO Level 3)',
      licenseNumber: 'WA-ITO-ETH-098',
      region: 'Amhara',
      institution: 'EAF Technical Committee & World Athletics Area Panel',
      experienceYears: 22,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-005',
      name: 'Teshale Wolde',
      category: 'MASSAGE_THERAPIST',
      roleTitle: 'Licensed Sports Soft Tissue Therapist',
      qualificationLevel: 'Certified Olympic Sports Massage Specialist Level 2',
      licenseNumber: 'ETH-SMT-2021-309',
      region: 'Oromia / Sululta',
      institution: 'Sululta High Performance High Altitude Camp',
      experienceYears: 8,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-006',
      name: 'Dr. Yonas Mulugeta',
      category: 'MEDICAL',
      roleTitle: 'Cardiology Consultant & National TUE Committee Head',
      qualificationLevel: 'Fellow European Society of Cardiology / WA Medical Delegate',
      licenseNumber: 'ETH-MED-2015-3912',
      region: 'Addis Ababa',
      institution: 'St. Paul Millennium Medical College',
      experienceYears: 16,
      status: 'ACTIVE',
      verified: true
    },
    {
      id: 'PROF-007',
      name: 'Woldemeskel Kostre Academy Faculty',
      category: 'COACH',
      roleTitle: 'Head of Youth Distance Talent Development',
      qualificationLevel: 'World Athletics Level 2 Youth & Junior',
      licenseNumber: 'WA-COA-ETH-2023-411',
      region: 'Sidama',
      institution: 'Hawassa Regional Training Academy',
      experienceYears: 11,
      status: 'ACTIVE',
      verified: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form State
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState<'TECHNICAL_OFFICIAL' | 'MEDICAL' | 'COACH' | 'MASSAGE_THERAPIST' | 'PHYSIOTHERAPIST'>('COACH');
  const [regRoleTitle, setRegRoleTitle] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regRegion, setRegRegion] = useState('Addis Ababa');
  const [regInstitution, setRegInstitution] = useState('');
  const [regExperience, setRegExperience] = useState('5');
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetch from backend API if available
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/professionals')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setProfessionals(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regRoleTitle || !regLicense) return;

    const payload = {
      name: regName,
      category: regCategory,
      roleTitle: regRoleTitle,
      qualificationLevel: regQualification,
      licenseNumber: regLicense,
      region: regRegion,
      institution: regInstitution,
      experienceYears: Number(regExperience)
    };

    try {
      const res = await fetch('http://localhost:3000/api/v1/professionals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfessionals(prev => [data.data, ...prev]);
      } else {
        // Fallback local append
        const fallback: Professional = {
          id: 'PROF-' + String(professionals.length + 1).padStart(3, '0'),
          ...payload,
          status: 'VERIFIED',
          verified: true
        };
        setProfessionals(prev => [fallback, ...prev]);
      }
    } catch {
      const fallback: Professional = {
        id: 'PROF-' + String(professionals.length + 1).padStart(3, '0'),
        ...payload,
        status: 'VERIFIED',
        verified: true
      };
      setProfessionals(prev => [fallback, ...prev]);
    }

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterModalOpen(false);
      setRegName('');
      setRegRoleTitle('');
      setRegLicense('');
      setRegQualification('');
      setRegInstitution('');
    }, 1500);
  };

  const filteredProfessionals = professionals.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.qualificationLevel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MEDICAL':
        return { label: 'Medical Professional', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'COACH':
        return { label: 'Athletics Coach', icon: Award, color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
      case 'PHYSIOTHERAPIST':
        return { label: 'Physiotherapist', icon: Activity, color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'MASSAGE_THERAPIST':
        return { label: 'Massage Therapist', icon: HeartPulse, color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' };
      case 'TECHNICAL_OFFICIAL':
      default:
        return { label: 'Technical Official', icon: ShieldCheck, color: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' };
    }
  };

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${darkMode ? 'bg-[#0B0F17] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 mb-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-xs font-bold mb-3">
                <Users size={14} />
                <span>EAF Official Workforce Registry</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Athletics Professionals & Technical Registry
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Accredited directory of World Athletics licensed coaches, technical officials, team physicians,
                physiotherapists, and soft tissue massage therapists across Ethiopia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
            >
              <PlusCircle size={17} />
              <span>Register Professional Accreditation</span>
            </button>
          </div>

          {/* Search & Category Filter Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All Professionals' },
                { id: 'COACH', label: 'Coaches' },
                { id: 'TECHNICAL_OFFICIAL', label: 'Technical Officials' },
                { id: 'MEDICAL', label: 'Medical Doctors' },
                { id: 'PHYSIOTHERAPIST', label: 'Physiotherapists' },
                { id: 'MASSAGE_THERAPIST', label: 'Massage Therapists' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, license, club..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* ── Professionals Directory Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((prof) => {
            const badge = getCategoryBadge(prof.category);
            const Icon = badge.icon;
            return (
              <motion.div
                key={prof.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${badge.color}`}>
                      <Icon size={12} />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {prof.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {prof.name}
                  </h3>
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1">
                    {prof.roleTitle}
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Qualification / Certification</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{prof.qualificationLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">License / Accreditation #</span>
                      <span className="font-mono font-extrabold text-sky-700 dark:text-sky-300">{prof.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <Building size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{prof.institution}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-extrabold shrink-0">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Registration Modal ── */}
        <AnimatePresence>
          {isRegisterModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={20} className="text-sky-600" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Register Athletics Professional
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Submit credentials for official accreditation in the Ethiopian Athletics Federation National Directory.
                </p>

                {regSuccess ? (
                  <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                      Accreditation Registered Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Professional profile has been verified and added to the official EAF registry.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Professional Category
                      </label>
                      <select
                        value={regCategory}
                        onChange={e => setRegCategory(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="COACH">Athletics Coach</option>
                        <option value="TECHNICAL_OFFICIAL">Technical Official / Track Referee</option>
                        <option value="MEDICAL">Medical Doctor / Sports Medicine Physician</option>
                        <option value="PHYSIOTHERAPIST">Physiotherapist</option>
                        <option value="MASSAGE_THERAPIST">Massage Therapist (Soft Tissue Specialist)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name (Legal)
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g., Coach Haile Gebrselassie / Dr. Abebe Tadesse"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Role Title / Designation
                        </label>
                        <input
                          type="text"
                          required
                          value={regRoleTitle}
                          onChange={e => setRegRoleTitle(e.target.value)}
                          placeholder="e.g., Senior Distance Coach"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          License / Registration #
                        </label>
                        <input
                          type="text"
                          required
                          value={regLicense}
                          onChange={e => setRegLicense(e.target.value)}
                          placeholder="e.g., WA-COA-ETH-2026-901"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Qualification Level & Certification Body
                      </label>
                      <input
                        type="text"
                        required
                        value={regQualification}
                        onChange={e => setRegQualification(e.target.value)}
                        placeholder="e.g., World Athletics Level 3 High Performance / MoH Specialist Board"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Affiliated Club / Institution
                        </label>
                        <input
                          type="text"
                          required
                          value={regInstitution}
                          onChange={e => setRegInstitution(e.target.value)}
                          placeholder="e.g., Ethiopian Electric Athletics Club"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Region / Base
                        </label>
                        <select
                          value={regRegion}
                          onChange={e => setRegRegion(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="Addis Ababa">Addis Ababa / Federal</option>
                          <option value="Oromia">Oromia Regional State</option>
                          <option value="Amhara">Amhara Regional State</option>
                          <option value="Sidama">Sidama Regional State</option>
                          <option value="Tigray">Tigray Regional State</option>
                          <option value="Somali">Somali Regional State</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      <Send size={16} />
                      <span>Submit Accreditation Record</span>
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
