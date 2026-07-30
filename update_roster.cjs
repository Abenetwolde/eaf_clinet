const fs = require('fs');

let content = fs.readFileSync('src/components/ClubAdmin/RosterManagement.jsx', 'utf8');

// 1. Add new state variables for the registration form and the detail modal
content = content.replace(
  /const \[faydaLookupLoading, setFaydaLookupLoading\] = useState\(false\);/,
  `const [faydaLookupLoading, setFaydaLookupLoading] = useState(false);
  const [newAthleteWeight, setNewAthleteWeight] = useState('');
  const [newAthleteHeight, setNewAthleteHeight] = useState('');
  const [newAthleteCoach, setNewAthleteCoach] = useState('');
  const [newAthleteEmergency, setNewAthleteEmergency] = useState('');
  const [newAthleteMedical, setNewAthleteMedical] = useState('');
  
  // State for view detail modal
  const [viewingAthlete, setViewingAthlete] = useState(null);`
);

// 2. Add the new fields to the created athlete object
content = content.replace(
  /weight: null, height: null, restingHR: null, trainingLoad: 0,/,
  `weight: newAthleteWeight, height: newAthleteHeight, restingHR: null, trainingLoad: 0,
      coach: newAthleteCoach, emergencyContact: newAthleteEmergency, medicalConditions: newAthleteMedical,`
);

// 3. Clear new fields on submit
content = content.replace(
  /setNewAthleteFin\(''\);/,
  `setNewAthleteFin('');
    setNewAthleteWeight('');
    setNewAthleteHeight('');
    setNewAthleteCoach('');
    setNewAthleteEmergency('');
    setNewAthleteMedical('');`
);

// 4. Update the Registration Form UI with numerous fields
const newFieldsJSX = `
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
`;

content = content.replace(
  /\{\/\* Fayda Response Result Display \*\/\}/,
  newFieldsJSX + '\n              {/* Fayda Response Result Display */}'
);

// 5. Remove the "Pay License" button and update the Action column
// We will also make the row clickable by adding onClick to <tr>
content = content.replace(
  /<tr key=\{athlete\.id\}>/g,
  `<tr key={athlete.id} onClick={() => setViewingAthlete(athlete)} style={{ cursor: 'pointer' }} className="hover-lift">`
);

// Remove the Pay License button
content = content.replace(
  /\{athlete\.licenseStatus !== 'ACTIVE' \? \([\s\S]*?\) : \([\s\S]*?Verified\s*<\/span>\s*\)\}/,
  ``
);

// Add the Detail Modal at the bottom
const detailModalJSX = `
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
`;

content = content.replace(
  /\{\/\* Edit Athlete Profile Modal \*\/\}/,
  detailModalJSX + '\n      {/* Edit Athlete Profile Modal */}'
);

// Prevent Edit button from triggering the row click
content = content.replace(
  /onClick=\{\(\) => handleOpenEditModal\(athlete\)\}/,
  `onClick={(e) => { e.stopPropagation(); handleOpenEditModal(athlete); }}`
);

fs.writeFileSync('src/components/ClubAdmin/RosterManagement.jsx', content);
console.log('RosterManagement updated successfully.');
