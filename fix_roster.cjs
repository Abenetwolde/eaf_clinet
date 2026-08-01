const fs = require('fs');
let t = fs.readFileSync('src/components/ClubAdmin/RosterManagement.jsx', 'utf8');

// 1. Add otpStep, otpValue, passportPhoto state after faydaVerifiedData state
t = t.replace(
  "// State for view detail modal\n  const [viewingAthlete, setViewingAthlete] = useState(null);\n  const [faydaVerifiedData, setFaydaVerifiedData] = useState(null);",
  `// State for view detail modal
  const [viewingAthlete, setViewingAthlete] = useState(null);
  const [faydaVerifiedData, setFaydaVerifiedData] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);`
);

// 2. Replace the FIN input field with auto-formatting FIN and OTP step
t = t.replace(
  `<form onSubmit={handleCreateAthleteSubmit}>
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
              </div>`,
  `<form onSubmit={(e) => { e.preventDefault(); if(!showConfirmation) { setShowConfirmation(true); } else { setRegistrationSubmitted(true); } }}>
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
                      let fmt = v.replace(/(\d{4})(\d{0,4})(\d{0,4})/,'$1-$2-$3').replace(/-+$/,'');
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
              )}`
);

// 3. Replace Fayda Response Result Display to be a detailed list with passport photo
t = t.replace(
  `{/* Fayda Response Result Display */}
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
              )}`,
  `{/* Fayda Response Result Display */}
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
              )}`
);

// 4. Fix submit button logic
t = t.replace(
  `<button 
                type="submit" 
                className="btn-gov-primary" 
                style={{ width: '100%', padding: '12px' }}
                disabled={!faydaVerifiedData}
              >
                Add Athlete to Club Roster
              </button>`,
  `{!registrationSubmitted && (
                <button 
                  type="submit" 
                  className="btn-gov-primary" 
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                  disabled={otpVerified && !faydaVerifiedData}
                >
                  {showConfirmation ? '✅ Confirm & Submit to EAF Registry' : (!faydaVerifiedData ? 'Complete Fayda Verification First' : 'Review & Confirm Registration')}
                </button>
              )}`
);

// 5. Make the modal large
t = t.replace(
  `{showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>`,
  `{showAddModal && (
        <div className="modal-backdrop" onClick={() => { setShowAddModal(false); setOtpStep(false); setOtpVerified(false); setShowConfirmation(false); setRegistrationSubmitted(false); setFaydaVerifiedData(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>`
);

// 6. Make edit modal large too
t = t.replace(
  `{editingAthlete && (
        <div className="modal-backdrop" onClick={() => setEditingAthlete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>`,
  `{editingAthlete && (
        <div className="modal-backdrop" onClick={() => setEditingAthlete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>`
);

// 7. Make view athlete detail modal large
t = t.replace(
  `<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '600px' }}>`,
  `<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '860px', width: '95vw' }}>`
);

fs.writeFileSync('src/components/ClubAdmin/RosterManagement.jsx', t);
console.log('RosterManagement.jsx updated!');
