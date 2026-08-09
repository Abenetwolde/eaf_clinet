import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, Clock, X, QrCode, FileCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MOCK_MEETS } from '../../data/mockData';
import type { Athlete } from '../../types';

interface AthleteApplicationsProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ApplicationDetail {
  meetId: string;
  meetTitle: string;
  disciplines: string[];
  status: string;
  appliedDate: string;
  meet?: any;
}

// Realistic SVG 2D QR Code Matrix Generator Component
function EAFQrCode({ code = "EAF-MEET-202-2026-243", size = 150 }: { code?: string; size?: number }) {
  return (
    <div className="bg-white p-3 rounded-[8px] border border-[#E2E8F0] inline-flex items-center mx-auto">
      <QRCodeSVG value={code} size={size} />
    </div>
  );
}

export default function AthleteApplications({ athlete, onNotify }: AthleteApplicationsProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);

  // Fallback default applications for display if none are in state
  const applications = athlete.appliedCompetitions || [
    {
      meetId: "MEET-2026-01",
      meetTitle: "Addis Ababa International Grand Prix 2026",
      disciplines: ["5,000m"],
      status: "Approved",
      appliedDate: "2026-07-15"
    },
    {
      meetId: "MEET-2026-02",
      meetTitle: "Ethiopian National Youth Olympic Games U18 / U20",
      disciplines: ["1,500m"],
      status: "Approved",
      appliedDate: "2026-07-20"
    },
    {
      meetId: "MEET-2026-03",
      meetTitle: "Jan Meda National Cross-Country Olympic Trials",
      disciplines: ["10km Senior Men"],
      status: "Completed",
      appliedDate: "2026-06-10"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="badge badge-green">✓ Approved</span>;
      case 'pending':
        return <span className="badge badge-amber"><Clock size={12} /> Pending</span>;
      case 'completed':
        return <span className="badge badge-blue">★ Completed</span>;
      case 'closed':
      default:
        return <span className="badge bg-[#E2E8F0] text-[#64748B]">Closed</span>;
    }
  };

  const handleRowClick = (app: ApplicationDetail) => {
    const meetDetails = MOCK_MEETS.find(m => m.id === app.meetId) || {
      title: app.meetTitle,
      venue: "Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)",
      date: "August 12-14, 2026",
      bannerUrl: "/images/banner_grand_prix.png",
      status: "REGISTRATION_OPEN"
    };
    setSelectedApplication({ ...app, meet: meetDetails });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-[1.4rem] font-extrabold text-text-heading">
          My Applied Competitions
        </h3>
        <p className="text-[0.85rem] text-text-muted mt-1">
          Track and review the status of your individual event registration applications.
        </p>
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
                const meet = MOCK_MEETS.find(m => m.id === app.meetId) || {
                  bannerUrl: "/images/banner_grand_prix.png",
                  venue: "Addis Ababa National Stadium"
                };
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
                            src={meet.bannerUrl || "/images/banner_grand_prix.png"} 
                            alt={app.meetTitle} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-text-heading text-[0.92rem]">{app.meetTitle}</div>
                          <div className="text-[0.72rem] text-text-muted">{meet.venue || "Addis Ababa Stadium"}</div>
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
              <img 
                src={selectedApplication.meet.bannerUrl || "/images/banner_grand_prix.png"} 
                alt={selectedApplication.meetTitle} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.95)] via-[rgba(15,23,42,0.4)] to-[rgba(0,0,0,0.2)] px-6 py-5 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="badge badge-green text-[0.78rem] bg-[#10B981] text-white px-3 py-1.5 font-extrabold">
                    Official Accreditation Pass
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
                  <span className="bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] px-3 py-1 rounded-[8px] text-[0.78rem] font-extrabold inline-flex items-center gap-1">
                    <FileCheck size={14} /> Entry Confirmed
                  </span>
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

              {/* Real Vector SVG 2D QR Code Container */}
              <div className="bg-[#F1F5F9] border-2 border-dashed border-[#CBD5E1] rounded-[20px] p-5 text-center mb-5">
                <div className="text-[0.82rem] font-extrabold text-[#334155] mb-3 flex items-center justify-center gap-1.5">
                  <QrCode size={16} color="var(--primary)" /> Entry QR Code
                </div>
                
                {/* Real SVG 2D QR Code Matrix */}
                <EAFQrCode code={`EAF-${selectedApplication.meetId}-${athlete.id}`} size={160} />

                <div className="font-mono font-black text-base text-[#0F172A] mt-3 tracking-[0.08em]">
                  EAF-{selectedApplication.meetId.substring(0, 8)}-{athlete.id.substring(4, 12)}
                </div>
                <p className="text-[0.78rem] text-[#64748B] mt-1 font-semibold">
                  Scan this code at the Call Room for quick check-in.
                </p>
              </div>

              {/* Verification Notice */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 flex gap-2 text-[0.78rem] text-[#1E40AF] leading-[1.4]">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda data. For queries regarding your approval, contact <a href="mailto:registrar@eaf.org.et" className="text-primary-dark font-extrabold">registrar@eaf.org.et</a>.
                </div>
              </div>

              {/* Footer Button */}
              <div className="mt-5">
                <button 
                  className="btn-gov-primary w-full p-3 rounded-xl text-[0.9rem]" 
                  onClick={() => setSelectedApplication(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
