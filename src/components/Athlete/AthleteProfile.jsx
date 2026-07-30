import React, { useState } from 'react';
import { Save, User, ShieldCheck, Mail, Phone, MapPin, Activity, Calendar } from 'lucide-react';

export default function AthleteProfile({ athlete, onUpdateAthlete, onNotify }) {
  const [name, setName] = useState(athlete.name || '');
  const [amharicName, setAmharicName] = useState(athlete.amharicName || '');
  const [dob, setDob] = useState(athlete.dob || '');
  const [gender, setGender] = useState(athlete.gender || 'Male');
  const [region, setRegion] = useState(athlete.region || 'Addis Ababa');
  const [phone, setPhone] = useState(athlete.phone || '+251 911 123456');
  const [email, setEmail] = useState(athlete.email || `${athlete.name.toLowerCase().replace(/ /g, '.')}@eaf.org.et`);
  const [primaryEvent, setPrimaryEvent] = useState(athlete.primaryEvent || '5,000m / 10,000m');

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      onNotify('Name, Email, and Phone fields are required.', 'error');
      return;
    }

    const updatedAthlete = {
      ...athlete,
      name,
      amharicName,
      dob,
      gender,
      region,
      phone,
      email,
      primaryEvent
    };

    onUpdateAthlete(updatedAthlete);
    onNotify('Profile updated successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          My Profile Data
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your personal identity, region affiliation, and contact information. Core identity details are verified via Fayda National ID.
        </p>
      </div>

      <form className="gov-card" style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px' }} onSubmit={handleSave}>
        
        {/* Verification Status Banner */}
        <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#15803D" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534' }}>Fayda Verified Profile</div>
            <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '2px' }}>
              Your Name, DOB, and Gender are securely linked with your Fayda National ID (FIN: {athlete.faydaFin}) and cannot be edited.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Read-Only Identity Fields */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>EAF Athlete ID (Read-only)</label>
            <input 
              className="form-input" 
              type="text" 
              value={athlete.id} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed', fontWeight: 600 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Fayda FIN Number (Read-only)</label>
            <input 
              className="form-input" 
              type="text" 
              value={athlete.faydaFin} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed', fontWeight: 600 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (English)</label>
            <input 
              className="form-input" 
              type="text" 
              value={name} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (Amharic)</label>
            <input 
              className="form-input" 
              type="text" 
              value={amharicName} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth (DOB)</label>
            <input 
              className="form-input" 
              type="date" 
              value={dob} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <input 
              className="form-input" 
              type="text" 
              value={gender} 
              disabled 
              style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Editable Information Fields */}
        <h4 style={{ fontWeight: 800, fontSize: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>
          Editable Athletics &amp; Contact Info
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="var(--primary)" /> Affiliated Region
            </label>
            <select 
              className="form-select" 
              value={region} 
              onChange={e => setRegion(e.target.value)}
            >
              <option value="Addis Ababa">Addis Ababa</option>
              <option value="Oromia">Oromia</option>
              <option value="Amhara">Amhara</option>
              <option value="Sidama">Sidama</option>
              <option value="Tigray">Tigray</option>
              <option value="SNNPR">SNNPR</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={14} color="var(--primary)" /> Primary Discipline
            </label>
            <select 
              className="form-select" 
              value={primaryEvent} 
              onChange={e => setPrimaryEvent(e.target.value)}
            >
              <option value="100m / 200m Sprint">100m / 200m Sprint</option>
              <option value="800m / 1,500m">800m / 1,500m</option>
              <option value="5,000m / 10,000m">5,000m / 10,000m</option>
              <option value="3,000m Steeplechase">3,000m Steeplechase</option>
              <option value="Marathon">Marathon</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={14} color="var(--primary)" /> Phone Number
            </label>
            <input 
              className="form-input" 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              placeholder="+251 911 123456"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} color="var(--primary)" /> Email Address
            </label>
            <input 
              className="form-input" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="athlete@eaf.org.et"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-gov-primary" 
          style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={16} /> Save Profile Changes
        </button>

      </form>
    </div>
  );
}
