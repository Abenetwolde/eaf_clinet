import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Clock,
  UserPlus,
  Filter,
  Edit
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppSelector } from '../../store/hooks';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import type { Athlete } from '../../types';

interface RosterManagementProps {
  onRenewLicense: (athlete: Athlete) => void;
  onRegisterMember: () => void;
  onUpdateAthlete?: (athlete: Athlete) => void;
}

export default function RosterManagement({ onRenewLicense, onRegisterMember, onUpdateAthlete }: RosterManagementProps) {
  const { t } = useI18n();
  const club = useAppSelector((state) => state.auth.club);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterLicense, setFilterLicense] = useState<string>('ALL');
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  // Edit Athlete form state
  const [editName, setEditName] = useState<string>('');
  const [editAmharic, setEditAmharic] = useState<string>('');
  const [editEvent, setEditEvent] = useState<string>('');
  const [editPb, setEditPb] = useState<string>('');
  const [editPhoto, setEditPhoto] = useState<string>('/images/runner_marathon.png');

  // State for view detail modal
  const [viewingAthlete, setViewingAthlete] = useState<Athlete | null>(null);


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

  // Real-time backend athletes sync
  const { data: backendAthletes = [] } = useGetAthletesQuery({ clubId: club.id });

  // Merge backend athletes with local athletes
  const allAthletes: Athlete[] = [];
  if (backendAthletes && backendAthletes.length > 0) {
    backendAthletes.forEach((b: any) => {
      const bName = b.name || `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim();
      if (!allAthletes.some(a => a.id === b.id || (a.name && bName && a.name.toLowerCase() === bName.toLowerCase()))) {
        allAthletes.push({
          id: b.id,
          name: bName || 'Federation Athlete',
          amharicName: b.amharicName,
          dob: '2004-01-01',
          gender: (b.gender as any) || 'MALE',
          ageTier: b.ageTier || 'Senior',
          club: b.clubName || club.name,
          clubId: b.clubId || club.id,
          clubName: b.clubName || club.name,
          region: club.region || 'Addis Ababa',
          faydaFin: '7961-3131-0300',
          faydaStatus: 'VERIFIED',
          licenseStatus: 'ACTIVE',
          licenseNumber: `EAF-LIC-${b.id.slice(-6).toUpperCase()}`,
          primaryEvent: b.primaryEvent || '5,000m',
          pb: b.personalBest || '13:05.12',
          photoUrl: b.photoUrl || '/images/runner_marathon.png',
        });
      }
    });
  }

  // Filter logic
  const filteredAthletes = allAthletes.filter(athlete => {
    const name = athlete?.name || '';
    const fin = athlete?.faydaFin || '';
    const event = athlete?.primaryEvent || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fin.includes(searchTerm) ||
                          event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'ALL' || (athlete?.ageTier || 'Senior') === filterTier;
    const matchesLicense = filterLicense === 'ALL' || athlete?.licenseStatus === filterLicense;

    return matchesSearch && matchesTier && matchesLicense;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            {t('club.rosterAuditsTitle')}
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            {t('club.rosterAuditsSub')}
          </p>
        </div>

        <button 
          onClick={onRegisterMember}
          className="btn-gov-primary"
        >
          <UserPlus size={16} />
          {t('club.registerViaFayda')}
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
              placeholder={t('club.searchPlaceholder')}
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
              <option value="ALL">{t('club.allAgeTiers')}</option>
              <option value="Senior">{t('club.seniorTiers')}</option>
              <option value="U20">{t('club.u20Division')}</option>
              <option value="U18">{t('club.u18Division')}</option>
              <option value="U16">{t('club.u16Youth')}</option>
            </select>
          </div>

          <select 
            className="form-select"
            value={filterLicense}
            onChange={(e) => setFilterLicense(e.target.value)}
          >
            <option value="ALL">{t('club.allLicenseStatuses')}</option>
            <option value="ACTIVE">{t('club.activeLicenses')}</option>
            <option value="EXPIRED">{t('club.expiredLicenses')}</option>
            <option value="UNLICENSED">{t('club.unlicensed')}</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('club.athleteNameCol')}</th>
                <th>{t('club.faydaNationalIdCol')}</th>
                <th>{t('club.ageDivisionCol')}</th>
                <th>{t('club.primaryDisciplineCol')}</th>
                <th>{t('club.federationLicenseCol')}</th>
                <th>{t('club.actionCol')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map(athlete => {
                const photo = athlete.photoUrl || '/images/runner_marathon.png';
                const hash = athlete.faydaHash || '0xFAYDA_' + (athlete.id ? String(athlete.id).replace(/\D/g, '') : '892A1');
                const tier = athlete.ageTier || 'Senior';
                const event = athlete.primaryEvent || 'Athletics';
                const pb = athlete.pb || 'N/A';

                return (
                <tr key={athlete.id} onClick={() => setViewingAthlete(athlete)} className="hover-lift cursor-pointer">
                  <td>
                    <div className="flex items-center gap-[12px]">
                      <img 
                        src={photo} 
                        alt={athlete.name || 'Athlete'}
                        className="w-[38px] h-[38px] rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-text-heading">{athlete.name || 'Unnamed Athlete'}</div>
                        <div className="text-[0.75rem] text-primary font-semibold">{athlete.amharicName || ''}</div>
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
                              {athlete.faydaFin || 'N/A'}
                            </div>
                            <div className="text-[0.65rem] text-text-dim">
                              {t('club.hashPrefix', { hash: hash.substring(0, 10) + '...' })}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} color="var(--accent)" />
                          <div>
                            <div className="text-[0.8rem] text-accent font-bold">{t('club.pendingAudit')}</div>
                            <div className="text-[0.65rem] text-text-muted">
                              {athlete.secondaryDoc ? athlete.secondaryDoc.type : t('club.missingVerification')}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${
                      tier === 'Senior' ? 'badge-blue' :
                      tier === 'U20' ? 'badge-green' :
                      tier === 'U18' ? 'badge-amber' : 'badge-green'
                    }`}>
                      {t('club.tierBadge', { tier: tier })}
                    </span>
                  </td>

                  <td>
                    <div className="font-semibold text-text-heading">{event}</div>
                    <div className="text-[0.75rem] text-text-muted">{t('club.pbPrefix', { pb: pb })}</div>
                  </td>

                  <td>
                    {athlete.licenseStatus === 'ACTIVE' ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} />
                        {t('club.activeLicense', { number: athlete.licenseNumber || 'EAF-LIC' })}
                      </span>
                    ) : athlete.licenseStatus === 'EXPIRED' ? (
                      <span className="badge badge-amber">
                        <Clock size={12} />
                        {t('club.expiredDec2025')}
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <AlertTriangle size={12} />
                        {t('club.unlicensed')}
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
                        {t('club.editBtn')}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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

            <div className="stack-on-mobile grid grid-cols-2 gap-[20px] mb-[24px]">
              <div className="bg-[#F8FAFC] p-[16px] rounded-[12px] border border-[#E2E8F0]">
                <div className="text-[0.8rem] text-text-muted font-bold mb-[8px]">{t('club.biometricInfo')}</div>
                <div className="grid gap-[6px] text-[0.9rem]">
                  <div><strong>{t('club.faydaFinKey')}</strong> {viewingAthlete.faydaFin}</div>
                  <div><strong>{t('club.statusKey')}</strong> {viewingAthlete.faydaStatus}</div>
                  <div><strong>{t('club.ageTierKey')}</strong> {viewingAthlete.ageTier}</div>
                  <div><strong>{t('club.heightWeightKey')}</strong> {t('club.heightWeightValue', { height: viewingAthlete.height || '-', weight: viewingAthlete.weight || '-' })}</div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-[16px] rounded-[12px] border border-[#E2E8F0]">
                <div className="text-[0.8rem] text-text-muted font-bold mb-[8px]">{t('club.athleticInfo')}</div>
                <div className="grid gap-[6px] text-[0.9rem]">
                  <div><strong>{t('club.disciplineKey')}</strong> {viewingAthlete.primaryEvent}</div>
                  <div><strong>{t('club.personalBestKey')}</strong> {viewingAthlete.pb || t('club.nA')}</div>
                  <div><strong>{t('club.licenseKey')}</strong> {viewingAthlete.licenseStatus}</div>
                  <div><strong>{t('club.coachKey')}</strong> {viewingAthlete.coach || t('club.unassigned')}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-[12px]">
              <button className="btn-gov-secondary" onClick={() => { setViewingAthlete(null); handleOpenEditModal(viewingAthlete); }}>{t('club.editProfileBtn')}</button>
              <button className="btn-gov-primary" onClick={() => setViewingAthlete(null)}>{t('club.closeBtn')}</button>
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
                {t('club.editAthleteProfileTitle')}
              </h3>
              <button onClick={() => setEditingAthlete(null)} className="btn-gov-secondary px-[10px] py-[4px]">✕</button>
            </div>

            <form onSubmit={handleSaveEditSubmit}>
              <div className="form-group">
                <label className="form-label">{t('club.fullNameEnglishLabel')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.amharicNameLabel')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editAmharic}
                  onChange={(e) => setEditAmharic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.primaryEventDisciplineLabel')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editEvent}
                  onChange={(e) => setEditEvent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.personalBestPbLabel')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editPb}
                  onChange={(e) => setEditPb(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('club.athletePhotoAssetLabel')}</label>
                <select 
                  className="form-select"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                >
                  <option value="/images/runner_marathon.png">{t('club.marathonPhotoOption')}</option>
                  <option value="/images/runner_female.png">{t('club.trackRunnerPhotoOption')}</option>
                  <option value="/images/runners_training.png">{t('club.trainingSquadPhotoOption')}</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-gov-primary w-full p-[12px] mt-[10px]"
              >
                {t('club.saveProfileBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
