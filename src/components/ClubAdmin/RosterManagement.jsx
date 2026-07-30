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
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
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

            <form onSubmit={handleCreateAthleteSubmit}>
              <div className="form-group">
                <label className="form-label">Fayda FIN (12-Digit National ID Number)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={newAthleteFin} 
                    onChange={(e) => setNewAthleteFin(e.target.value)}
                    placeholder="e.g. 8812-4902-1109" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={handleSimulateFaydaLookup}
                    className="btn-gov-primary" 
                    style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '10px 14px' }}
                  >
                    {faydaLookupLoading ? 'Querying...' : 'Verify Fayda'}
                  </button>
                </div>
              </div>

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
              {faydaVerifiedData && (
                <div style={{
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <ShieldCheck color="var(--primary)" size={20} />
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      Fayda Government API Verification Successful
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <div><strong>Authenticated Name:</strong> {faydaVerifiedData.amharicName} ({faydaVerifiedData.fullName})</div>
                    <div><strong>Calculated Age Division:</strong> <span className="badge badge-green">{faydaVerifiedData.computedTier}</span></div>
                    <div><strong>Digital Hash Index:</strong> {faydaVerifiedData.verificationHash}</div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-gov-primary" 
                style={{ width: '100%', padding: '12px' }}
                disabled={!faydaVerifiedData}
              >
                Add Athlete to Club Roster
              </button>
            </form>
          </div>
        </div>
      )}

      
      {/* View Athlete Detail Modal */}
      {viewingAthlete && (
        <div className="modal-backdrop" onClick={() => setViewingAthlete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '600px' }}>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
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
