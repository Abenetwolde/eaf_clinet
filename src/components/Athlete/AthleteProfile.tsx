import React, { useState } from 'react';
import { Save, User, ShieldCheck, Mail, Phone, MapPin, Activity, Calendar } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import type { Athlete } from '../../types';

interface AthleteProfileProps {
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteProfile({ onUpdateAthlete, onNotify }: AthleteProfileProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);
  const [name, setName] = useState(athlete.name || '');
  const [amharicName, setAmharicName] = useState(athlete.amharicName || '');
  const [dob, setDob] = useState(athlete.dob || '');
  const [gender, setGender] = useState(athlete.gender || 'Male');
  const [region, setRegion] = useState(athlete.region || 'Addis Ababa');
  const [phone, setPhone] = useState(athlete.phone || '+251 911 123456');
  const [email, setEmail] = useState(athlete.email || `${athlete.name.toLowerCase().replace(/ /g, '.')}@eaf.org.et`);
  const [primaryEvent, setPrimaryEvent] = useState(athlete.primaryEvent || '5,000m / 10,000m');

  const handleSave = (e: React.FormEvent) => {
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
    <div className="max-w-[800px]">
      <div className="mb-6">
        <h3 className="text-[1.4rem] font-extrabold text-text-heading">
          My Profile Data
        </h3>
        <p className="text-[0.85rem] text-text-muted mt-1">
          Manage your personal identity, region affiliation, and contact information. Core identity details are verified via Fayda National ID.
        </p>
      </div>

      <form className="gov-card bg-white p-7 rounded-[16px]" onSubmit={handleSave}>
        
        {/* Verification Status Banner */}
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl px-[18px] py-3.5 mb-6 flex items-center gap-2.5">
          <ShieldCheck size={20} color="#15803D" />
          <div>
            <div className="font-bold text-[0.88rem] text-[#166534]">Fayda Verified Profile</div>
            <div className="text-[0.78rem] text-[#15803D] mt-0.5">
              Your Name, DOB, and Gender are securely linked with your Fayda National ID (FIN: {athlete.faydaFin}) and cannot be edited.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Read-Only Identity Fields */}
          <div className="form-group">
            <label className="form-label font-bold">EAF Athlete ID (Read-only)</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed font-semibold" 
              type="text" 
              value={athlete.id} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label className="form-label font-bold">Fayda FIN Number (Read-only)</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed font-semibold" 
              type="text" 
              value={athlete.faydaFin} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (English)</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed" 
              type="text" 
              value={name} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (Amharic)</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed" 
              type="text" 
              value={amharicName} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth (DOB)</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed" 
              type="date" 
              value={dob} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <input 
              className="form-input bg-[#F1F5F9] cursor-not-allowed" 
              type="text" 
              value={gender} 
              disabled 
            />
          </div>
        </div>

        {/* Editable Information Fields */}
        <h4 className="text-base font-extrabold border-t border-[#E2E8F0] pt-5 mb-4 text-text-heading">
          Editable Athletics &amp; Contact Info
        </h4>

        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="form-group">
            <label className="form-label flex items-center gap-1">
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
            <label className="form-label flex items-center gap-1">
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
            <label className="form-label flex items-center gap-1">
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
            <label className="form-label flex items-center gap-1">
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
          className="btn-gov-primary w-full p-3.5 flex items-center justify-center gap-2" 
        >
          <Save size={16} /> Save Profile Changes
        </button>

      </form>
    </div>
  );
}
