import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, Clock, X, QrCode, FileCheck, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MOCK_MEETS } from '../../data/mockData';
import { useAppSelector } from '../../store/hooks';

interface AthleteApplicationsProps {
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

export default function AthleteApplications({ onNotify }: AthleteApplicationsProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);
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

  const handleDownloadPass = (app: ApplicationDetail) => {
    if (!app) return;

    const meetName = app.meetTitle || 'EAF Championship';
    const venue = app.meet?.venue || 'Addis Ababa Stadium';
    const date = app.meet?.date || '2026';
    const disciplinesStr = app.disciplines.join(', ');
    const codeId = `EAF-${app.meetId.substring(0, 8)}-${athlete.id.substring(4, 12)}`;

    // Build SVG Image for the Accreditation Pass
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06152B"/>
          <stop offset="50%" stop-color="#0A2540"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="50%" stop-color="#FCD34D"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>

      <!-- Background Card -->
      <rect width="600" height="850" rx="32" fill="url(#bgGrad)" stroke="#F59E0B" stroke-width="3"/>
      
      <!-- Top Gold/Green Accent Bar -->
      <rect x="0" y="0" width="600" height="12" rx="6" fill="url(#goldGrad)"/>

      <!-- Header Section -->
      <text x="300" y="55" font-family="sans-serif" font-size="14" font-weight="900" fill="#FCD34D" text-anchor="middle" letter-spacing="3">ETHIOPIAN ATHLETICS FEDERATION</text>
      <text x="300" y="82" font-family="sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">OFFICIAL ACCREDITATION PASS</text>
      <text x="300" y="105" font-family="sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">NATIONAL DIGITAL COMPETITION ENTRY</text>

      <line x1="40" y1="125" x2="560" y2="125" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

      <!-- Meet Details Banner -->
      <rect x="40" y="145" width="520" height="100" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <text x="60" y="178" font-family="sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">${meetName.replace(/&/g, '&amp;')}</text>
      <text x="60" y="205" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">📍 ${venue.replace(/&/g, '&amp;')}</text>
      <text x="60" y="227" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">📅 ${date.replace(/&/g, '&amp;')}</text>

      <!-- Athlete Biometrics Card Block -->
      <rect x="40" y="265" width="520" height="230" rx="20" fill="rgba(15,23,42,0.8)" stroke="rgba(245,158,11,0.4)" stroke-width="2"/>
      
      <!-- Athlete Photo Box -->
      <rect x="65" y="290" width="130" height="160" rx="16" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
      <text x="130" y="375" font-family="sans-serif" font-size="48" text-anchor="middle" fill="#FCD34D">🏃</text>
      <text x="130" y="420" font-family="sans-serif" font-size="11" font-weight="900" fill="#10B981" text-anchor="middle">FAYDA VERIFIED</text>

      <!-- Athlete Info -->
      <text x="215" y="320" font-family="sans-serif" font-size="22" font-weight="900" fill="#FFFFFF">${(athlete.name || 'Athlete Name').replace(/&/g, '&amp;')}</text>
      <text x="215" y="345" font-family="sans-serif" font-size="16" font-weight="800" fill="#FCD34D">${(athlete.amharicName || 'አልማዝ በቀለ ነጋሽ').replace(/&/g, '&amp;')}</text>
      
      <text x="215" y="380" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">Fayda FIN: <tspan fill="#FFFFFF" font-family="monospace" font-weight="900">${athlete.faydaFin || '7961-3131-0300'}</tspan></text>
      <text x="215" y="405" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">License No: <tspan fill="#FFFFFF" font-family="monospace" font-weight="900">${athlete.licenseNumber || 'ETH-2026-ACTIVE'}</tspan></text>
      <text x="215" y="430" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">Club: <tspan fill="#FFFFFF" font-weight="900">${(athlete.clubName || 'Independent').replace(/&/g, '&amp;')}</tspan></text>
      <text x="215" y="455" font-family="sans-serif" font-size="13" font-weight="700" fill="#94A3B8">Disciplines: <tspan fill="#38BDF8" font-weight="900">${disciplinesStr.replace(/&/g, '&amp;')}</tspan></text>

      <!-- QR Code Security Block -->
      <rect x="40" y="515" width="520" height="210" rx="20" fill="#FFFFFF"/>
      <text x="300" y="545" font-family="sans-serif" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">CALL ROOM ACCREDITATION QR CODE</text>
      
      <!-- Simulated Vector QR Matrix -->
      <rect x="235" y="560" width="130" height="130" fill="#0F172A" rx="8"/>
      <rect x="245" y="570" width="35" height="35" fill="#FFFFFF"/>
      <rect x="253" y="578" width="19" height="19" fill="#0F172A"/>
      <rect x="320" y="570" width="35" height="35" fill="#FFFFFF"/>
      <rect x="328" y="578" width="19" height="19" fill="#0F172A"/>
      <rect x="245" y="645" width="35" height="35" fill="#FFFFFF"/>
      <rect x="253" y="653" width="19" height="19" fill="#0F172A"/>
      <rect x="295" y="610" width="15" height="15" fill="#FFFFFF"/>
      <rect x="315" y="630" width="20" height="20" fill="#FFFFFF"/>
      <rect x="290" y="640" width="15" height="15" fill="#FFFFFF"/>

      <text x="300" y="710" font-family="monospace" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">${codeId}</text>

      <!-- Footer Badge & Stamp -->
      <rect x="40" y="745" width="520" height="60" rx="14" fill="url(#badgeGrad)"/>
      <text x="300" y="780" font-family="sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">✓ CONFIRMED ATHLETE ACCREDITATION • CALL ROOM READY</text>

    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EAF_Accreditation_Pass_${app.meetId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify?.('Accreditation Pass image downloaded successfully!', 'success');
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
                  className="btn-gov-primary w-full p-3 rounded-xl text-[0.9rem] flex items-center justify-center gap-2 font-extrabold cursor-pointer" 
                  onClick={() => handleDownloadPass(selectedApplication)}
                >
                  <Download size={17} /> Download Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
