import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, Clock, X, QrCode, FileCheck, RefreshCw, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useGetAthleteApplicationsQuery } from '../../store/api/athleteApi';

interface AthleteApplicationsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ApplicationDetail {
  meetId: string;
  meetTitle: string;
  disciplines: string[];
  status: string;
  appliedDate: string;
  location?: string;
  qrCode?: string;
  meet?: any;
}

// Realistic SVG 2D QR Code Matrix Generator Component
function EAFQrCode({ code, size = 150 }: { code: string; size?: number }) {
  return (
    <div className="bg-white p-3 rounded-[8px] border border-[#E2E8F0] inline-flex items-center mx-auto">
      <QRCodeSVG value={code} size={size} />
    </div>
  );
}

export default function AthleteApplications(_props: AthleteApplicationsProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);

  // Fetch real applications from backend API
  const { data: backendApps = [], isLoading: isLoadingApps, refetch } = useGetAthleteApplicationsQuery(undefined, { pollingInterval: 5000 });

  const applications = (backendApps || []).map(a => ({
        meetId: a.eventId,
        meetTitle: a.title,
        disciplines: Array.isArray(a.disciplines) ? a.disciplines : (a.disciplines ? [a.disciplines] : []),
        status: a.statusLabel === 'CONFIRMED' || a.statusLabel === 'Approved' ? 'Approved' : a.statusLabel === 'REJECTED' || a.statusLabel === 'Rejected' ? 'Rejected' : 'Pending',
        appliedDate: a.appliedAt ? a.appliedAt.split('T')[0] : 'Not recorded',
        location: a.location || '',
        organizer: a.organizer || '',
        qrCode: a.qrCodeValue || '',
      }));

  const getStatusBadge = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return <span className="badge badge-green" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>✓ Approved</span>;
      case 'pending':
        return <span className="badge badge-amber" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}><Clock size={12} /> Pending</span>;
      case 'rejected':
        return <span className="badge badge-red" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>✕ Rejected</span>;
      case 'completed':
        return <span className="badge badge-blue">★ Completed</span>;
      case 'closed':
      default:
        return <span className="badge bg-[#E2E8F0] text-[#64748B]">Closed</span>;
    }
  };

  const handleRowClick = (app: ApplicationDetail) => {
    const meetDetails = {
      title: app.meetTitle,
      venue: app.location || 'Not recorded',
      date: 'Not recorded',
      bannerUrl: '',
      status: 'Not recorded',
    };
    setSelectedApplication({ ...app, meet: meetDetails });
  };


  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            My Registrations & Applications
          </h3>
          <p className="text-[0.85rem] text-text-muted mt-1">
            Track and review the real-time status of your event applications (pending, approved, or rejected).
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoadingApps}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <RefreshCw size={14} className={isLoadingApps ? 'animate-spin text-blue-600' : 'text-slate-600'} />
          <span>{isLoadingApps ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Applications Grid/List */}
      <div className="gov-card p-0 overflow-hidden bg-white rounded-[16px]">
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Event Banner &amp; Title</th>
                <th>Applied Date</th>
                <th>Disciplines</th>
                <th>Status</th>
                <th className="w-[120px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => {
                const meet = { bannerUrl: "", venue: app.location || "Not recorded" };
                return (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(app)}
                    className="hover-row cursor-pointer transition-colors duration-150"
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <td>
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-11 rounded-[8px] overflow-hidden shrink-0 border border-[#E2E8F0]">
                          <img
                            src={(app as any).imageUrl || meet.bannerUrl || "/images/event-placeholder.svg"}
                            alt={app.meetTitle}
                            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-text-heading text-[0.92rem]">{app.meetTitle}</div>
                          <div className="text-[0.72rem] text-text-muted">{meet.venue || "Not recorded"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted text-[0.85rem]">{app.appliedDate}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {app.disciplines.map((d, i) => (
                          <span key={i} className="badge badge-primary px-2 py-[3px] text-[0.72rem] font-bold">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td className="text-right">
                      <button
                        className="btn-gov-secondary text-[0.78rem] px-3 py-1.5 rounded-[8px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(app);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApplication && (
        <div className="modal-backdrop bg-[rgba(15,23,42,0.75)] backdrop-blur-[6px] z-[9999]" onClick={() => setSelectedApplication(null)}>
          <div
            className="modal-content p-0 max-w-[620px] w-[92%] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-[#E2E8F0] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Event Banner Image Header */}
            <div className="relative w-full h-[170px] overflow-hidden">
              {selectedApplication.meet.bannerUrl ? <img src={selectedApplication.meet.bannerUrl} alt={selectedApplication.meetTitle} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.95)] via-[rgba(15,23,42,0.4)] to-[rgba(0,0,0,0.2)] px-6 py-5 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="badge badge-green text-[0.78rem] bg-[#10B981] text-white px-3 py-1.5 font-extrabold">
                    Event Application
                  </span>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="bg-white/20 border-0 rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer backdrop-blur-[4px]"
                  >
                    <X size={18} color="#FFFFFF" />
                  </button>
                </div>

                <div>
                  <h3 className="text-[1.35rem] font-black text-white m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                    {selectedApplication.meetTitle}
                  </h3>
                  <div className="flex items-center gap-3.5 mt-1 text-[#E2E8F0] text-[0.82rem] font-bold">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} color="#38BDF8" /> {selectedApplication.meet.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} color="#38BDF8" /> {selectedApplication.meet.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-7 py-6">

              {/* Application Details Header Block */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-[18px] mb-5">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2.5 mb-3">
                  <div>
                    <div className="text-[0.75rem] font-extrabold text-primary uppercase tracking-[0.05em]">Application Details</div>
                    <div className="text-[0.82rem] font-bold text-[#64748B] mt-0.5">Submitted on {selectedApplication.appliedDate}</div>
                  </div>
                  {selectedApplication.status === 'Approved' ? (
                    <span className="bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] px-3 py-1 rounded-[8px] text-[0.78rem] font-extrabold inline-flex items-center gap-1">
                      <FileCheck size={14} /> Entry Approved
                    </span>
                  ) : selectedApplication.status === 'Rejected' ? (
                    <span className="bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] px-3 py-1 rounded-[8px] text-[0.78rem] font-extrabold inline-flex items-center gap-1">
                      ✕ Entry Rejected
                    </span>
                  ) : (
                    <span className="bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-[8px] text-[0.78rem] font-extrabold inline-flex items-center gap-1">
                      <Clock size={14} /> Under Review (Pending)
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[0.78rem] text-[#64748B] font-bold mb-1.5">Selected Disciplines &amp; Status</div>
                  <div className="flex flex-col gap-1.5">
                    {selectedApplication.disciplines.map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white border border-[#E2E8F0] rounded-[8px] px-3 py-2"
                      >
                        <span className="font-extrabold text-[0.88rem] text-[#0F172A]">{d}</span>
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conditional Accreditation QR Code Container */}
              {selectedApplication.status === 'Approved' && selectedApplication.qrCode ? (
                <div className="bg-[#F0FDF4] border-2 border-dashed border-[#86EFAC] rounded-[20px] p-5 text-center mb-5">
                  <div className="text-[0.82rem] font-extrabold text-[#15803D] mb-3 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Official Competition Accreditation Pass (Approved)
                  </div>

                  {/* Real SVG 2D QR Code Matrix */}
                  <div className="inline-block p-2.5 bg-white rounded-xl shadow-md border border-[#BBF7D0]">
                    <EAFQrCode
                      code={selectedApplication.qrCode}
                      size={160}
                    />
                  </div>

                  <div className="font-mono font-black text-sm text-[#0F172A] mt-3 tracking-[0.08em]">
                    Application ID: {selectedApplication.meetId}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[0.75rem] font-black mt-2">
                    <ShieldCheck size={14} /> Application approved
                  </div>
                  <p className="text-[0.78rem] text-[#64748B] mt-2 font-semibold">
                    Event check-in eligibility is verified separately by authorized event officials.
                  </p>
                </div>
              ) : selectedApplication.status === 'Rejected' ? (
                <div className="bg-[#FEF2F2] border-2 border-dashed border-[#FECACA] rounded-[20px] p-6 text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={24} />
                  </div>
                  <div className="text-[0.9rem] font-black text-red-700">Accreditation Pass Denied</div>
                  <p className="text-[0.78rem] text-red-600 mt-1 max-w-sm mx-auto">
                    This competition registration was not approved by EAF Administration. Contact the competitions department for appeals.
                  </p>
                </div>
              ) : (
                <div className="bg-[#FFFBEB] border-2 border-dashed border-[#FDE68A] rounded-[20px] p-6 text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                    <Lock size={22} />
                  </div>
                  <div className="text-[0.9rem] font-black text-amber-900">Accreditation QR Pass Locked</div>
                  <p className="text-[0.78rem] text-amber-800 mt-1.5 max-w-sm mx-auto font-medium">
                    Your competition registration is pending federation approval. The unique accreditation QR pass will automatically be generated and unlocked once an administrator approves your participation.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[0.75rem] font-extrabold mt-3">
                    <Clock size={13} /> Awaiting Admin Approval
                  </div>
                </div>
              )}

              {/* Verification Notice */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 flex gap-2 text-[0.78rem] text-[#1E40AF] leading-[1.4]">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda data. For queries regarding your approval, contact <a href="mailto:registrar@eaf.org.et" className="text-primary-dark font-extrabold">registrar@eaf.org.et</a>.
                </div>
              </div>

              {/* Footer Button */}
              <div className="mt-5">
                {selectedApplication.status === 'Approved' && selectedApplication.qrCode ? (
                  <button
                    className="btn-gov-primary w-full p-3 rounded-xl text-[0.9rem] flex items-center justify-center gap-2 font-extrabold cursor-pointer"
                    disabled
                  >
                    Official pass download is not configured
                  </button>
                ) : selectedApplication.status === 'Rejected' ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-center text-xs font-bold">
                    This competition application was not approved by EAF Administration. Contact the competitions department for appeals.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center text-xs font-bold">
                    Application is currently pending admin review. Your official accreditation pass will be unlocked upon approval.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
