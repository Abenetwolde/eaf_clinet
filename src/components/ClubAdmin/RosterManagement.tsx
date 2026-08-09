import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  UserPlus,
  Filter,
  Edit
} from 'lucide-react';
import type { Club, Athlete } from '../../types';

interface RosterManagementProps {
  athletes: Athlete[];
  club: Club;
  onRenewLicense: (athlete: Athlete) => void;
  onAddAthlete: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
}

interface FaydaVerifiedData {
  fin: string;
  fullName: string;
  amharicName: string;
  dob: string;
  computedTier: string;
  verificationHash: string;
  photoUrl: string;
  gender?: string;
}

export default function RosterManagement({ athletes, club, onRenewLicense, onAddAthlete, onUpdateAthlete }: RosterManagementProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterLicense, setFilterLicense] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  // Edit Athlete form state
  const [editName, setEditName] = useState<string>('');
  const [editAmharic, setEditAmharic] = useState<string>('');
  const [editEvent, setEditEvent] = useState<string>('');
  const [editPb, setEditPb] = useState<string>('');
  const [editPhoto, setEditPhoto] = useState<string>('/images/runner_marathon.png');

  // New Athlete form state
  const [newAthleteName, setNewAthleteName] = useState<string>('');
  const [newAthleteFin, setNewAthleteFin] = useState<string>('');
  const [newAthleteDob, setNewAthleteDob] = useState<string>('2006-05-14');
  const [newAthleteEvent, setNewAthleteEvent] = useState<string>('1,500m / 5,000m');
  const [faydaLookupLoading, setFaydaLookupLoading] = useState<boolean>(false);
  const [newAthleteWeight, setNewAthleteWeight] = useState<string>('');
  const [newAthleteHeight, setNewAthleteHeight] = useState<string>('');
  const [newAthleteCoach, setNewAthleteCoach] = useState<string>('');
  const [newAthleteEmergency, setNewAthleteEmergency] = useState<string>('');
  const [newAthleteMedical, setNewAthleteMedical] = useState<string>('');
  
  // State for view detail modal
  const [viewingAthlete, setViewingAthlete] = useState<Athlete | null>(null);
  const [faydaVerifiedData, setFaydaVerifiedData] = useState<FaydaVerifiedData | null>(null);
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState<boolean>(false);

  const handleOpenEditModal = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setEditName(athlete.name);
    setEditAmharic(athlete.amharicName || '');
    setEditEvent(athlete.primaryEvent);
    setEditPb(athlete.pb);
    setEditPhoto(athlete.photoUrl);
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete || !onUpdateAthlete) return;

    const updated = {
      ...editingAthlete,
      name: editName,
      amharicName: editAmharic,
      primaryEvent: editEvent,
      pb: editPb,
      photoUrl: editPhoto
    };

    onUpdateAthlete(updated);
    setEditingAthlete(null);
  };

  // Filter logic
  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          athlete.faydaFin.includes(searchTerm) ||
                          athlete.primaryEvent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'ALL' || athlete.ageTier === filterTier;
    const matchesLicense = filterLicense === 'ALL' || athlete.licenseStatus === filterLicense;

    return matchesSearch && matchesTier && matchesLicense;
  });

  const handleSimulateFaydaLookup = () => {
    if (!newAthleteFin) return;
    setFaydaLookupLoading(true);
    setTimeout(() => {
      setFaydaLookupLoading(false);
      const birthYear = new Date(newAthleteDob).getFullYear();
      const age = 2026 - birthYear;
      let calculatedTier = 'Senior';
      if (age <= 16) calculatedTier = 'U16';
      else if (age <= 18) calculatedTier = 'U18';
      else if (age <= 20) calculatedTier = 'U20';

      setFaydaVerifiedData({
        fin: newAthleteFin,
        fullName: newAthleteName || "Mulugeta Tola Feyisa",
        amharicName: "ሙሉጌታ ቶላ ፈይሳ",
        dob: newAthleteDob,
        computedTier: calculatedTier,
        verificationHash: "0xFAYDA_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
      });
    }, 1000);
  };

  const handleCreateAthleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faydaVerifiedData) return;

    const createdAthlete = {
      id: `ATH-2026-${Math.floor(100 + Math.random() * 900)}`,
      // From Fayda API — not entered manually:
      name: faydaVerifiedData.fullName,
      amharicName: faydaVerifiedData.amharicName,
      dob: faydaVerifiedData.dob,
      gender: faydaVerifiedData.gender || "Male",
      ageTier: faydaVerifiedData.computedTier,
      // Sports-specific fields:
      clubId: club.id,
      clubName: club.name,
      faydaFin: faydaVerifiedData.fin,
      faydaStatus: "VERIFIED",
      faydaHash: faydaVerifiedData.verificationHash,
      primaryEvent: newAthleteEvent,
      licenseStatus: "UNLICENSED",
      licenseNumber: null,
      licenseExpiry: null,
      photoUrl: "/images/runner_marathon.png",
      checkinStatus: "NOT_CHECKED_IN",
      secondaryDoc: null,
      weight: newAthleteWeight, height: newAthleteHeight, restingHR: null, trainingLoad: 0,
      coach: newAthleteCoach, emergencyContact: newAthleteEmergency, medicalConditions: newAthleteMedical,
      personalBests: [], seasonBests: [], weightLog: [], trainingLog: [], achievements: []
    };

    onAddAthlete(createdAthlete);
    setShowAddModal(false);
    setFaydaVerifiedData(null);
    setNewAthleteName('');
    setNewAthleteFin('');
    setNewAthleteWeight('');
    setNewAthleteHeight('');
    setNewAthleteCoach('');
    setNewAthleteEmergency('');
    setNewAthleteMedical('');
  };

  return (
    <div>
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            Digital Roster Audits & Licensing Registry
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            FR-1.2: Digital roster management, Fayda ID verification hashes, & annual licensing audit
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-gov-primary"
        >
          <UserPlus size={16} />
          Register Athlete via Fayda FIN
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="gov-card p-[16px] mb-[24px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[12px]">
          <div className="relative">
            <Search size={18} color="var(--text-muted)" className="absolute left-[12px] top-[10px]" />
            <input 
              type="text"
              className="form-input pl-[38px] w-full"
              placeholder="Search name, discipline, Fayda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-[8px]">
            <Filter size={16} color="var(--text-muted)" />
            <select 
              className="form-select w-full"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="ALL">All Age Tiers</option>
              <option value="Senior">Senior Tiers</option>
              <option value="U20">U20 Division</option>
              <option value="U18">U18 Division</option>
              <option value="U16">U16 Youth Division</option>
            </select>
          </div>

          <select 
            className="form-select"
            value={filterLicense}
            onChange={(e) => setFilterLicense(e.target.value)}
          >
            <option value="ALL">All License Statuses</option>
            <option value="ACTIVE">Active Licenses</option>
            <option value="EXPIRED">Expired Licenses</option>
            <option value="UNLICENSED">Unlicensed</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Athlete Name</th>
                <th>Fayda National ID</th>
                <th>Age Division</th>
                <th>Primary Discipline</th>
                <th>Federation License</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map(athlete => (
                <tr key={athlete.id} onClick={() => setViewingAthlete(athlete)} className="hover-lift cursor-pointer">
                  <td>
                    <div className="flex items-center gap-[12px]">
                      <img 
                        src={athlete.photoUrl} 
                        alt={athlete.name}
                        className="w-[38px] h-[38px] rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-text-heading">{athlete.name}</div>
                        <div className="text-[0.75rem] text-primary font-semibold">{athlete.amharicName}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-[6px]">
                      {athlete.faydaStatus === 'VERIFIED' ? (
                        <>
                          <ShieldCheck size={16} color="var(--primary)" />
                          <div>
                            <div className="font-mono text-[0.85rem] font-bold">
                              {athlete.faydaFin}
                            </div>
                            <div className="text-[0.65rem] text-text-dim">
                              Hash: {athlete.faydaHash.substring(0, 10)}...
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} color="var(--accent)" />
                          <div>
                            <div className="text-[0.8rem] text-accent font-bold">Pending Audit</div>
                            <div className="text-[0.65rem] text-text-muted">
                              {athlete.secondaryDoc ? athlete.secondaryDoc.type : 'Missing Verification'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${
                      athlete.ageTier === 'Senior' ? 'badge-blue' :
                      athlete.ageTier === 'U20' ? 'badge-green' :
                      athlete.ageTier === 'U18' ? 'badge-amber' : 'badge-green'
                    }`}>
                      {athlete.ageTier} Tier
                    </span>
                  </td>

                  <td>
                    <div className="font-semibold text-text-heading">{athlete.primaryEvent}</div>
                    <div className="text-[0.75rem] text-text-muted">PB: {athlete.pb}</div>
                  </td>

                  <td>
                    {athlete.licenseStatus === 'ACTIVE' ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} />
                        Active ({athlete.licenseNumber})
                      </span>
                    ) : athlete.licenseStatus === 'EXPIRED' ? (
                      <span className="badge badge-amber">
                        <Clock size={12} />
                        Expired Dec 2025
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <AlertTriangle size={12} />
                        Unlicensed
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="flex items-center gap-[8px]">
                      

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(athlete); }}
                        className="btn-gov-secondary text-[0.75rem] px-[10px] py-[6px] flex items-center gap-[4px]"
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Athlete Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => { setShowAddModal(false); setOtpStep(false); setOtpVerified(false); setShowConfirmation(false); setRegistrationSubmitted(false); setFaydaVerifiedData(null); }}>
          <div className="modal-content p-[36px] max-w-[860px] w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-[20px]">
              <h3 className="text-[1.3rem] font-extrabold text-text-heading">
                Register Athlete via Fayda FIN
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            {/* Info note */}
            <div className="bg-primary-light border border-[rgba(0,80,160,0.2)] rounded-[8px] px-[14px] py-[10px] mb-[16px] text-[0.8rem] text-primary font-semibold leading-[1.5]">
              ℹ Name, date of birth, and age division are fetched automatically from the Fayda API. Enter the FIN below.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(!showConfirmation) { setShowConfirmation(true); } else { setRegistrationSubmitted(true); } }}>
              {!otpStep && !otpVerified && (
              <div className="form-group">
                <label className="form-label">Fayda FIN (Auto-formatted: XXXX-XXXX-XXXX)</label>
                <div className="flex gap-[8px]">
                  <input 
                    type="text" 
                    className="form-input flex-1 font-mono text-[1.1rem] tracking-[0.1em]"
                    value={newAthleteFin} 
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g,'');
                      if(v.length > 12) v = v.slice(0,12);
                      let fmt = '';
                      if(v.length>0) fmt += v.slice(0,4);
                      if(v.length>4) fmt += '-' + v.slice(4,8);
                      if(v.length>8) fmt += '-' + v.slice(8,12);
                      setNewAthleteFin(fmt);
                    }}
                    maxLength={14}
                    placeholder="XXXX-XXXX-XXXX" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => { if(newAthleteFin.replace(/-/g,'').length===12){ setOtpStep(true); } }}
                    className="btn-gov-primary text-[0.8rem] whitespace-nowrap px-[14px] py-[10px]"
                    disabled={newAthleteFin.replace(/-/g,'').length!==12}
                  >
                    Send OTP
                  </button>
                </div>
              </div>
              )}

              {otpStep && !otpVerified && (
                <div className="form-group bg-[#F0FDF4] border border-[#86EFAC] rounded-[12px] p-[20px]">
                  <div className="font-extrabold text-[#15803D] mb-[8px] text-[0.95rem]">📱 OTP sent to registered phone</div>
                  <div className="text-[0.82rem] text-[#64748B] mb-[16px]">Enter the 6-digit One-Time Password sent to the athlete's Fayda-registered mobile number.</div>
                  <div className="flex gap-[8px]">
                    <input 
                      type="text" className="form-input flex-1 font-mono text-[1.4rem] text-center tracking-[0.3em]"
                      value={otpValue} 
                      onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g,'').slice(0,6))}
                      placeholder="_ _ _ _ _ _" maxLength={6}
                    />
                    <button type="button" className="btn-gov-primary px-[20px] py-[10px]"
                      onClick={() => {
                        if(otpValue.length === 6) {
                          setOtpVerified(true); setOtpStep(false);
                          handleSimulateFaydaLookup();
                        }
                      }}
                    >Verify OTP</button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Primary Athletic Event</label>
                <select 
                  className="form-select"
                  value={newAthleteEvent}
                  onChange={(e) => setNewAthleteEvent(e.target.value)}
                >
                  <option value="100m Sprint / 200m">100m / 200m Sprint</option>
                  <option value="800m / 1,500m">800m / 1,500m Middle Distance</option>
                  <option value="5,000m / 10,000m">5,000m / 10,000m Long Distance</option>
                  <option value="3,000m Steeplechase">3,000m Steeplechase</option>
                  <option value="Marathon / Half-Marathon">Marathon / Road Races</option>
                </select>
              </div>

              
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" className="form-input" value={newAthleteWeight} onChange={e => setNewAthleteWeight(e.target.value)} placeholder="e.g. 58" />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input type="number" className="form-input" value={newAthleteHeight} onChange={e => setNewAthleteHeight(e.target.value)} placeholder="e.g. 170" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Coach</label>
                <input type="text" className="form-input" value={newAthleteCoach} onChange={e => setNewAthleteCoach(e.target.value)} placeholder="Coach Name" />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input type="text" className="form-input" value={newAthleteEmergency} onChange={e => setNewAthleteEmergency(e.target.value)} placeholder="+251 91 123 4567" />
              </div>

              <div className="form-group">
                <label className="form-label">Medical Conditions / Allergies</label>
                <input type="text" className="form-input" value={newAthleteMedical} onChange={e => setNewAthleteMedical(e.target.value)} placeholder="None" />
              </div>

              {/* Fayda Response Result Display */}
              {faydaVerifiedData && otpVerified && !showConfirmation && (
                <div className="bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-[14px] p-[20px] mb-[20px]">
                  <div className="flex items-center gap-[10px] mb-[16px]">
                    <ShieldCheck color="#15803D" size={22} />
                    <span className="font-extrabold text-[#15803D] text-[1rem]">✅ Fayda Government API — Identity Verified</span>
                  </div>
                  <div className="flex gap-[20px] flex-wrap">
                    {/* Passport Photo upload */}
                    <div className="shrink-0">
                      <label className="block font-bold text-[0.8rem] text-[#374151] mb-[8px]">Passport Photo *</label>
                      <div 
                        onClick={() => document.getElementById('passportPhotoInput').click()}
                        className="w-[120px] h-[150px] border-2 border-dashed border-[#86EFAC] rounded-[8px] cursor-pointer flex items-center justify-center overflow-hidden bg-white relative"
                      >
                        {passportPhotoUrl ? (
                          <img src={passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-[#9CA3AF] text-[0.75rem]">
                            <div className="text-[2rem]">📷</div>
                            <div>Click to upload</div>
                            <div>35mm × 45mm</div>
                          </div>
                        )}
                        <input id="passportPhotoInput" type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const f = e.target.files[0];
                            if(f) { setPassportPhoto(f); setPassportPhotoUrl(URL.createObjectURL(f)); }
                          }}
                        />
                      </div>
                    </div>
                    {/* Personal Info List */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-bold text-[#374151] mb-[10px] text-[0.85rem]">Personal Information (from Fayda API)</div>
                      <ul className="list-none p-0 m-0 flex flex-col gap-[8px]">
                        {[
                          ['Full Name (English)', faydaVerifiedData.fullName],
                          ['Full Name (Amharic)', faydaVerifiedData.amharicName],
                          ['Date of Birth', faydaVerifiedData.dob],
                          ['Age Division', faydaVerifiedData.computedTier],
                          ['Gender', 'Male'],
                          ['Region', 'Oromia Region'],
                          ['FIN', faydaVerifiedData.fin],
                          ['Verification Hash', faydaVerifiedData.verificationHash.slice(0,18)+'...'],
                        ].map(([k,v]) => (
                          <li key={k} className="flex gap-[8px] text-[0.82rem] border-b border-[#D1FAE5] pb-[6px]">
                            <span className="font-bold text-[#374151] min-w-[140px]">{k}:</span>
                            <span className="text-[#4B5563]">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Confirmation Panel */}
              {showConfirmation && faydaVerifiedData && !registrationSubmitted && (
                <div className="bg-[#EFF6FF] border-2 border-[#93C5FD] rounded-[14px] p-[24px] mb-[20px]">
                  <div className="font-extrabold text-[#1D4ED8] text-[1.1rem] mb-[20px] flex items-center gap-[8px]">
                    📋 Final Registration Confirmation — Review All Details
                  </div>
                  <div className="flex gap-[24px] flex-wrap">
                    {passportPhotoUrl && (
                      <div className="shrink-0">
                        <img src={passportPhotoUrl} alt="Passport" className="w-[120px] h-[150px] object-cover rounded-[8px] border-2 border-[#93C5FD]" />
                        <div className="text-[0.72rem] text-center text-[#6B7280] mt-[4px]">Passport Photo</div>
                      </div>
                    )}
                    <div className="flex-1 min-w-[200px]">
                      <ul className="list-none p-0 m-0 grid grid-cols-2 gap-[8px]">
                        {[
                          ['Full Name', faydaVerifiedData.fullName],
                          ['Amharic Name', faydaVerifiedData.amharicName],
                          ['Date of Birth', faydaVerifiedData.dob],
                          ['Age Division', faydaVerifiedData.computedTier],
                          ['Gender', 'Male'],
                          ['FIN', faydaVerifiedData.fin],
                          ['Club', 'Bekoji AC'],
                          ['Primary Event', newAthleteEvent],
                          ['Weight', newAthleteWeight ? newAthleteWeight + ' kg' : 'N/A'],
                          ['Height', newAthleteHeight ? newAthleteHeight + ' cm' : 'N/A'],
                          ['Coach', newAthleteCoach || 'N/A'],
                          ['Emergency Contact', newAthleteEmergency || 'N/A'],
                          ['Medical Notes', newAthleteMedical || 'None'],
                          ['License Status', 'UNLICENSED (Pending)'],
                        ].map(([k,v]) => (
                          <li key={k} className="text-[0.8rem] border-b border-[#BFDBFE] pb-[6px]">
                            <div className="font-bold text-[#1E3A8A] text-[0.72rem]">{k}</div>
                            <div className="text-[#374151]">{v}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* After submission — awaiting approval */}
              {registrationSubmitted && (
                <div className="bg-[#FFF7ED] border-2 border-[#FCD34D] rounded-[14px] p-[32px] text-center mb-[20px]">
                  <div className="text-[3rem] mb-[12px]">⏳</div>
                  <div className="font-black text-[#92400E] text-[1.4rem] mb-[12px]">🎉 Registration Submitted — Awaiting EAF Approval</div>
                  <div className="text-[#78350F] text-[0.9rem] leading-[1.6]">
                    Your registration application for <strong>{faydaVerifiedData?.fullName}</strong> has been successfully submitted to the Ethiopian Athletics Federation (EAF) Digital Registry.<br/><br/>
                    📋 <strong>Application Reference:</strong> EAF-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}<br/>
                    ⏱️ <strong>Expected Review Time:</strong> 2–5 business days<br/>
                    📱 <strong>Notification:</strong> SMS &amp; email will be sent to the registered Fayda mobile number<br/>
                    🔒 <strong>Status:</strong> Pending biometric cross-verification<br/><br/>
                    You will be notified once the athlete's Fayda identity is cleared and the EAF license is issued.
                  </div>
                </div>
              )}

              {!registrationSubmitted && (
                <button 
                  type="submit" 
                  className="btn-gov-primary w-full p-[14px] text-[1rem] font-extrabold"
                  disabled={otpVerified && !faydaVerifiedData}
                >
                  {showConfirmation ? '✅ Confirm & Submit to EAF Registry' : (!faydaVerifiedData ? 'Complete Fayda Verification First' : 'Review & Confirm Registration')}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      
      {/* View Athlete Detail Modal */}
      {viewingAthlete && (
        <div className="modal-backdrop" onClick={() => setViewingAthlete(null)}>
          <div className="modal-content p-[36px] max-w-[860px] w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-[24px]">
              <div className="flex items-center gap-[16px]">
                <img src={viewingAthlete.photoUrl} alt="Athlete" className="w-[64px] h-[64px] rounded-full object-cover border-[3px] border-primary" />
                <div>
                  <h3 className="text-[1.4rem] font-extrabold text-text-heading m-0">{viewingAthlete.name}</h3>
                  <div className="text-[0.9rem] text-text-muted font-semibold">{viewingAthlete.amharicName} | ID: {viewingAthlete.id}</div>
                </div>
              </div>
              <button onClick={() => setViewingAthlete(null)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-[20px] mb-[24px]">
              <div className="bg-[#F8FAFC] p-[16px] rounded-[12px] border border-[#E2E8F0]">
                <div className="text-[0.8rem] text-text-muted font-bold mb-[8px]">BIOMETRIC INFO</div>
                <div className="grid gap-[6px] text-[0.9rem]">
                  <div><strong>Fayda FIN:</strong> {viewingAthlete.faydaFin}</div>
                  <div><strong>Status:</strong> {viewingAthlete.faydaStatus}</div>
                  <div><strong>Age Tier:</strong> {viewingAthlete.ageTier}</div>
                  <div><strong>Height/Weight:</strong> {viewingAthlete.height || '-'} cm / {viewingAthlete.weight || '-'} kg</div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-[16px] rounded-[12px] border border-[#E2E8F0]">
                <div className="text-[0.8rem] text-text-muted font-bold mb-[8px]">ATHLETIC INFO</div>
                <div className="grid gap-[6px] text-[0.9rem]">
                  <div><strong>Discipline:</strong> {viewingAthlete.primaryEvent}</div>
                  <div><strong>Personal Best:</strong> {viewingAthlete.pb || 'N/A'}</div>
                  <div><strong>License:</strong> {viewingAthlete.licenseStatus}</div>
                  <div><strong>Coach:</strong> {viewingAthlete.coach || 'Unassigned'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-[12px]">
              <button className="btn-gov-secondary" onClick={() => { setViewingAthlete(null); handleOpenEditModal(viewingAthlete); }}>Edit Profile</button>
              <button className="btn-gov-primary" onClick={() => setViewingAthlete(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Athlete Profile Modal */}
      {editingAthlete && (
        <div className="modal-backdrop" onClick={() => setEditingAthlete(null)}>
          <div className="modal-content p-[36px] max-w-[860px] w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-[20px]">
              <h3 className="text-[1.3rem] font-extrabold text-text-heading flex items-center gap-[8px]">
                <Edit size={18} color="var(--eth-blue)" />
                Edit Athlete Profile
              </h3>
              <button onClick={() => setEditingAthlete(null)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            <form onSubmit={handleSaveEditSubmit}>
              <div className="form-group">
                <label className="form-label">Athlete Full Name (English)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amharic Name (የአትሌቱ ሙሉ ስም)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editAmharic}
                  onChange={(e) => setEditAmharic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Event / Discipline</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editEvent}
                  onChange={(e) => setEditEvent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Personal Best (PB)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editPb}
                  onChange={(e) => setEditPb(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Athlete Photo Asset</label>
                <select 
                  className="form-select"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                >
                  <option value="/images/runner_marathon.png">Marathon Finisher Photo (Ethiopian male athlete)</option>
                  <option value="/images/runner_female.png">Track Runner Photo (Ethiopian female athlete)</option>
                  <option value="/images/runners_training.png">High Altitude Altitude Training Squad</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-gov-primary w-full p-[12px] mt-[10px]"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
