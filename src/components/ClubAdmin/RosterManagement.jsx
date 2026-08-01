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

export default function RosterManagement({ athletes, club, onRenewLicense, onAddAthlete, onUpdateAthlete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');
  const [filterLicense, setFilterLicense] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);

  // Edit Athlete form state
  const [editName, setEditName] = useState('');
  const [editAmharic, setEditAmharic] = useState('');
  const [editEvent, setEditEvent] = useState('');
  const [editPb, setEditPb] = useState('');
  const [editPhoto, setEditPhoto] = useState('/images/runner_marathon.png');

  // New Athlete form state
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteFin, setNewAthleteFin] = useState('');
  const [newAthleteDob, setNewAthleteDob] = useState('2006-05-14');
  const [newAthleteEvent, setNewAthleteEvent] = useState('1,500m / 5,000m');
  const [faydaLookupLoading, setFaydaLookupLoading] = useState(false);
  const [newAthleteWeight, setNewAthleteWeight] = useState('');
  const [newAthleteHeight, setNewAthleteHeight] = useState('');
  const [newAthleteCoach, setNewAthleteCoach] = useState('');
  const [newAthleteEmergency, setNewAthleteEmergency] = useState('');
  const [newAthleteMedical, setNewAthleteMedical] = useState('');
  
  // State for view detail modal
  const [viewingAthlete, setViewingAthlete] = useState(null);
  const [faydaVerifiedData, setFaydaVerifiedData] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  const handleOpenEditModal = (athlete) => {
    setEditingAthlete(athlete);
    setEditName(athlete.name);
    setEditAmharic(athlete.amharicName || '');
    setEditEvent(athlete.primaryEvent);
    setEditPb(athlete.pb);
    setEditPhoto(athlete.photoUrl);
  };

  const handleSaveEditSubmit = (e) => {
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

  const handleCreateAthleteSubmit = (e) => {
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            Digital Roster Audits & Licensing Registry
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
      <div className="gov-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="Search name, discipline, Fayda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select 
              className="form-select"
              style={{ width: '100%' }}
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
      <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                <tr key={athlete.id} onClick={() => setViewingAthlete(athlete)} style={{ cursor: 'pointer' }} className="hover-lift">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={athlete.photoUrl} 
                        alt={athlete.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{athlete.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{athlete.amharicName}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {athlete.faydaStatus === 'VERIFIED' ? (
                        <>
                          <ShieldCheck size={16} color="var(--primary)" />
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
                              {athlete.faydaFin}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                              Hash: {athlete.faydaHash.substring(0, 10)}...
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} color="var(--accent)" />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>Pending Audit</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
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
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{athlete.primaryEvent}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PB: {athlete.pb}</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(athlete); }}
                        className="btn-gov-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Register Athlete via Fayda FIN
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn-gov-secondary" style={{ padding: '4px 10px' }}>✕</button>
            </div>

            {/* Info note */}
            <div style={{ background: 'var(--eth-blue-light)', border: '1px solid rgba(0,80,160,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--eth-blue)', fontWeight: 600, lineHeight: 1.5 }}>
              ℹ Name, date of birth, and age division are fetched automatically from the Fayda API. Enter the FIN below.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(!showConfirmation) { setShowConfirmation(true); } else { setRegistrationSubmitted(true); } }}>
              {!otpStep && !otpVerified && (
              <div className="form-group">
                <label className="form-label">Fayda FIN (Auto-formatted: XXXX-XXXX-XXXX)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                    value={newAthleteFin} 
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g,'');
                      if(v.length > 12) v = v.slice(0,12);
                      let fmt = v.replace(/(d{4})(d{0,4})(d{0,4})/,'$1-$2-$3').replace(/-+$/,'');
                      setNewAthleteFin(fmt);
                    }}
                    maxLength={14}
                    placeholder="XXXX-XXXX-XXXX" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => { if(newAthleteFin.replace(/-/g,'').length===12){ setOtpStep(true); } }}
                    className="btn-gov-primary" 
                    style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '10px 14px' }}
                    disabled={newAthleteFin.replace(/-/g,'').length!==12}
                  >
                    Send OTP
                  </button>
                </div>
              </div>
              )}

              {otpStep && !otpVerified && (
                <div className="form-group" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontWeight: 800, color: '#15803D', marginBottom: '8px', fontSize: '0.95rem' }}>📱 OTP sent to registered phone</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>Enter the 6-digit One-Time Password sent to the athlete's Fayda-registered mobile number.</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" className="form-input" 
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '0.3em' }}
                      value={otpValue} 
                      onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g,'').slice(0,6))}
                      placeholder="_ _ _ _ _ _" maxLength={6}
                    />
                    <button type="button" className="btn-gov-primary" style={{ padding: '10px 20px' }}
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

              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <ShieldCheck color="#15803D" size={22} />
                    <span style={{ fontWeight: 800, color: '#15803D', fontSize: '1rem' }}>✅ Fayda Government API — Identity Verified</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Passport Photo upload */}
                    <div style={{ flexShrink: 0 }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#374151', marginBottom: '8px' }}>Passport Photo *</label>
                      <div 
                        onClick={() => document.getElementById('passportPhotoInput').click()}
                        style={{ width: '120px', height: '150px', border: '2px dashed #86EFAC', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#fff', position: 'relative' }}
                      >
                        {passportPhotoUrl ? (
                          <img src={passportPhotoUrl} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem' }}>
                            <div style={{ fontSize: '2rem' }}>📷</div>
                            <div>Click to upload</div>
                            <div>35mm × 45mm</div>
                          </div>
                        )}
                        <input id="passportPhotoInput" type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => {
                            const f = e.target.files[0];
                            if(f) { setPassportPhoto(f); setPassportPhotoUrl(URL.createObjectURL(f)); }
                          }}
                        />
                      </div>
                    </div>
                    {/* Personal Info List */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, color: '#374151', marginBottom: '10px', fontSize: '0.85rem' }}>Personal Information (from Fayda API)</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          <li key={k} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', borderBottom: '1px solid #D1FAE5', paddingBottom: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#374151', minWidth: '140px' }}>{k}:</span>
                            <span style={{ color: '#4B5563' }}>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Confirmation Panel */}
              {showConfirmation && faydaVerifiedData && !registrationSubmitted && (
                <div style={{ background: '#EFF6FF', border: '2px solid #93C5FD', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 Final Registration Confirmation — Review All Details
                  </div>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {passportPhotoUrl && (
                      <div style={{ flexShrink: 0 }}>
                        <img src={passportPhotoUrl} alt="Passport" style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #93C5FD' }} />
                        <div style={{ fontSize: '0.72rem', textAlign: 'center', color: '#6B7280', marginTop: '4px' }}>Passport Photo</div>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                          <li key={k} style={{ fontSize: '0.8rem', borderBottom: '1px solid #BFDBFE', paddingBottom: '6px' }}>
                            <div style={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.72rem' }}>{k}</div>
                            <div style={{ color: '#374151' }}>{v}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* After submission — awaiting approval */}
              {registrationSubmitted && (
                <div style={{ background: '#FFF7ED', border: '2px solid #FCD34D', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div>
                  <div style={{ fontWeight: 900, color: '#92400E', fontSize: '1.2rem', marginBottom: '8px' }}>Registration Submitted — Awaiting Approval</div>
                  <div style={{ color: '#78350F', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Your application for <strong>{faydaVerifiedData?.fullName}</strong> has been received by the EAF registry.<br/>
                    The federation will review and approve within <strong>2–5 business days</strong>.<br/>
                    You will receive a notification once the athlete is cleared.
                  </div>
                </div>
              )}

              {!registrationSubmitted && (
                <button 
                  type="submit" 
                  className="btn-gov-primary" 
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={viewingAthlete.photoUrl} alt="Athlete" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--eth-blue)' }} />
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>{viewingAthlete.name}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{viewingAthlete.amharicName} | ID: {viewingAthlete.id}</div>
                </div>
              </div>
              <button onClick={() => setViewingAthlete(null)} className="btn-gov-secondary" style={{ padding: '4px 10px' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>BIOMETRIC INFO</div>
                <div style={{ display: 'grid', gap: '6px', fontSize: '0.9rem' }}>
                  <div><strong>Fayda FIN:</strong> {viewingAthlete.faydaFin}</div>
                  <div><strong>Status:</strong> {viewingAthlete.faydaStatus}</div>
                  <div><strong>Age Tier:</strong> {viewingAthlete.ageTier}</div>
                  <div><strong>Height/Weight:</strong> {viewingAthlete.height || '-'} cm / {viewingAthlete.weight || '-'} kg</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>ATHLETIC INFO</div>
                <div style={{ display: 'grid', gap: '6px', fontSize: '0.9rem' }}>
                  <div><strong>Discipline:</strong> {viewingAthlete.primaryEvent}</div>
                  <div><strong>Personal Best:</strong> {viewingAthlete.pb || 'N/A'}</div>
                  <div><strong>License:</strong> {viewingAthlete.licenseStatus}</div>
                  <div><strong>Coach:</strong> {viewingAthlete.coach || 'Unassigned'}</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-gov-secondary" onClick={() => { setViewingAthlete(null); handleOpenEditModal(viewingAthlete); }}>Edit Profile</button>
              <button className="btn-gov-primary" onClick={() => setViewingAthlete(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Athlete Profile Modal */}
      {editingAthlete && (
        <div className="modal-backdrop" onClick={() => setEditingAthlete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="var(--eth-blue)" />
                Edit Athlete Profile
              </h3>
              <button onClick={() => setEditingAthlete(null)} className="btn-gov-secondary" style={{ padding: '4px 10px' }}>✕</button>
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
                className="btn-gov-primary" 
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
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
