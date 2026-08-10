import React, { useState } from 'react';
import { TrendingUp, Download, Eye, ShieldCheck, X, CheckCircle2, Calendar, MapPin, FileCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Athlete } from '../../types';

interface RecordsVaultProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface RecordDetail {
  event: string;
  pb: string;
  sb: string;
  date: string;
  venue: string;
  rankingPts: number;
  splits: Array<{ mark: string; time: string; diff: string; pace: string }>;
  referee: string;
  wind: string;
  temp: string;
  altitude: string;
  hash: string;
}

function EAFQrCode({ code = "EAF-MEET-202-2026-243", size = 150 }: { code?: string; size?: number }) {
  return (
    <div className="bg-white p-3 rounded-[8px] border border-[#E2E8F0] inline-flex items-center mx-auto">
      <QRCodeSVG value={code} size={size} />
    </div>
  );
}

export default function RecordsVault({ athlete, onNotify }: RecordsVaultProps) {
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<RecordDetail | null>(null);

  const records = [
    { 
      event: '5,000m',  
      pb: '12:51.20', 
      sb: '12:51.20', 
      date: 'May 18, 2026',  
      venue: 'Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)',  
      rankingPts: 1248,
      splits: [
        { mark: '1,000m', time: '2:34.10', diff: '2:34.10', pace: '2:34/km' },
        { mark: '2,000m', time: '5:09.30', diff: '2:35.20', pace: '2:35/km' },
        { mark: '3,000m', time: '7:43.00', diff: '2:33.70', pace: '2:33/km' },
        { mark: '4,000m', time: '10:18.50', diff: '2:35.50', pace: '2:35/km' },
        { mark: '5,000m', time: '12:51.20', diff: '2:32.70', pace: '2:32/km' }
      ],
      referee: 'Eng. Kebede Tadesse (EAF Technical Delegate #77402)',
      wind: '+0.4 m/s',
      temp: '21°C Clear',
      altitude: '2,355 meters',
      hash: '0x8F92A7C319D04B8E12F54'
    },
    { 
      event: '3,000m',  
      pb: '7:28.40',  
      sb: '7:30.10',  
      date: 'Feb 12, 2026',  
      venue: 'Lievin Indoor Arena',  
      rankingPts: 1210,
      splits: [
        { mark: '1,000m', time: '2:29.80', diff: '2:29.80', pace: '2:29/km' },
        { mark: '2,000m', time: '5:00.10', diff: '2:30.30', pace: '2:30/km' },
        { mark: '3,000m', time: '7:28.40', diff: '2:28.30', pace: '2:28/km' }
      ],
      referee: 'IAAF Certified Officiating Panel #9920',
      wind: 'Indoor (0.0 m/s)',
      temp: '19°C Controlled',
      altitude: '100 meters',
      hash: '0x3E11D92B5F841C908A721'
    },
    { 
      event: '10,000m', 
      pb: '26:49.00', 
      sb: '26:55.00', 
      date: 'June 02, 2025', 
      venue: 'Hengelo FBK Games',   
      rankingPts: 1235,
      splits: [
        { mark: '2,000m', time: '5:21.80', diff: '5:21.80', pace: '2:40/km' },
        { mark: '4,000m', time: '10:44.00', diff: '5:22.20', pace: '2:41/km' },
        { mark: '6,000m', time: '16:05.50', diff: '5:21.50', pace: '2:40/km' },
        { mark: '8,000m', time: '21:28.10', diff: '5:22.60', pace: '2:41/km' },
        { mark: '10,000m', time: '26:49.00', diff: '5:20.90', pace: '2:40/km' }
      ],
      referee: 'World Athletics Official Jury #ETH-2025',
      wind: '+0.2 m/s',
      temp: '18°C Mild',
      altitude: '15 meters',
      hash: '0x992B45A8812EF1A7030C8'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">Career Records Vault</h3>
          <p className="text-[0.85rem] text-text-muted mt-1">
            Full competition history, verified split breakdown, and official achievements.
          </p>
        </div>
        <button onClick={() => onNotify(`Exporting Official EAF Career Passport for ${athlete.name}...`, 'info')} className="btn-gov-primary">
          <Download size={16} /> Export Career Passport PDF
        </button>
      </div>

      {/* World ranking card */}
      <div className="gov-card bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-0 text-white mb-6 rounded-[18px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[0.72rem] font-bold text-primary uppercase tracking-[0.06em] mb-1.5">World Athletics Ranking</div>
            <div className="text-[1.8rem] font-black leading-[1.1]">1,248 Performance Points</div>
            <div className="text-[0.85rem] text-[#94A3B8] mt-1.5">
              #4 Nationally · #12 Global 5,000m
            </div>
          </div>
          <div>
            <span className="bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.4)] text-[#34D399] rounded-[10px] px-4 py-2 text-[0.82rem] font-bold inline-flex items-center gap-1.5">
              <ShieldCheck size={16} /> Olympic Qualifier Standard Met
            </span>
          </div>
        </div>
      </div>

      {/* Verified Records Table */}
      <div className="gov-card p-0 overflow-hidden rounded-[18px]">
        <div className="px-5 py-3.5 bg-[#0F172A] text-white font-extrabold text-[0.88rem] flex justify-between items-center">
          <span>Official Verified Personal Bests &amp; Season Bests</span>
          <span className="text-[0.75rem] text-primary">Fayda Cryptographic Audit Active</span>
        </div>
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Personal Best</th>
                <th>Season Best</th>
                <th>Date</th>
                <th>Venue</th>
                <th>WA Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td className="font-extrabold text-[#0F172A]">{r.event}</td>
                  <td><span className="font-mono font-extrabold text-primary-dark text-base">{r.pb}</span></td>
                  <td><span className="font-mono text-text-heading">{r.sb}</span></td>
                  <td className="text-text-muted text-[0.85rem]">{r.date}</td>
                  <td className="text-[0.85rem]">{r.venue}</td>
                  <td><span className="badge badge-blue"><TrendingUp size={12} /> {r.rankingPts}</span></td>
                  <td>
                    <button 
                      onClick={() => setSelectedRecordDetail(r)}
                      className="btn-gov-secondary px-3 py-1.5 text-[0.78rem] rounded-[8px] inline-flex items-center gap-1"
                    >
                      <Eye size={14} /> Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SHOW DETAILS & APPLICATION MODAL ── */}
      {selectedRecordDetail && (
        <div className="modal-backdrop bg-[rgba(15,23,42,0.75)] backdrop-blur-[6px] z-[9999]" onClick={() => setSelectedRecordDetail(null)}>
          <div 
            className="modal-content p-0 max-w-[680px] w-[92%] rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-[#E2E8F0] max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()} 
          >
            {/* 1. Events Banner */}
            <div className="relative w-full h-[180px] overflow-hidden">
              <img 
                src="/images/banner_grand_prix.png" 
                alt="Addis Ababa International Grand Prix 2026" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.95)] via-[rgba(15,23,42,0.4)] to-[rgba(0,0,0,0.2)] p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="badge badge-green text-[0.78rem] bg-[#10B981] text-white px-3 py-1.5 font-extrabold">
                    <CheckCircle2 size={13} /> Official EAF Entry Pass
                  </span>
                  <button 
                    onClick={() => setSelectedRecordDetail(null)}
                    className="bg-white/20 border-0 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer backdrop-blur-[4px]"
                  >
                    <X size={20} color="#FFFFFF" />
                  </button>
                </div>

                <div>
                  <h3 className="text-[1.45rem] font-black text-white m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                    Addis Ababa International Grand Prix 2026
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5 text-[#E2E8F0] text-[0.84rem] font-bold">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} color="#38BDF8" /> Addis Ababa National Stadium (አዲስ አበባ ስታዲየም)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} color="#38BDF8" /> August 12-14, 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-7 py-6">
              
              {/* Application Details Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-5 mb-5">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-3.5">
                  <div>
                    <div className="text-[0.75rem] font-extrabold text-primary uppercase tracking-[0.05em]">Application Details</div>
                    <div className="text-[0.85rem] font-bold text-[#64748B] mt-0.5">Submitted on 2026-07-15</div>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] px-3 py-1.5 rounded-[8px] text-[0.8rem] font-extrabold inline-flex items-center gap-1.5">
                    <FileCheck size={14} /> Verified Record
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div>
                    <div className="text-[0.8rem] text-[#64748B] font-bold">Selected Disciplines &amp; Status</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-primary text-white font-black px-2.5 py-1 rounded-[6px] text-[0.9rem]">
                        {selectedRecordDetail.event}
                      </span>
                      <span className="text-[#16A34A] font-extrabold text-[0.88rem] flex items-center gap-1">
                        ✓ Approved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-[#F1F5F9] border-2 border-dashed border-[#CBD5E1] rounded-[20px] p-5 text-center mb-5">
                <div className="text-[0.82rem] font-extrabold text-[#334155] mb-3 flex items-center justify-center gap-1.5">
                  <QrCode size={16} color="var(--primary)" /> Entry QR Code
                </div>
                
                {/* SVG 2D QR Code Matrix */}
                <EAFQrCode code="EAF-MEET-202-2026-243" size={160} />

                <div className="font-mono font-black text-base text-[#0F172A] mt-3 tracking-[0.08em]">
                  EAF-MEET-202-2026-243
                </div>
                <p className="text-[0.78rem] text-[#64748B] mt-1 font-semibold">
                  Scan this code at the Call Room for quick check-in.
                </p>
              </div>

              {/* Verified Race Splits */}
              <div className="mb-5">
                <h4 className="text-[0.95rem] font-extrabold text-[#0F172A] mb-2.5">Official Race Split Times</h4>
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-[0.85rem]">
                    <thead>
                      <tr className="bg-[#F1F5F9] text-[#475569] text-left font-extrabold">
                        <th className="px-3 py-2">Split</th>
                        <th className="px-3 py-2">Accumulated</th>
                        <th className="px-3 py-2">Segment</th>
                        <th className="px-3 py-2">Pace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecordDetail.splits.map((s, idx) => (
                        <tr key={idx} className="border-t border-[#E2E8F0]">
                          <td className="px-3 py-2 font-extrabold text-[#0F172A]">{s.mark}</td>
                          <td className="px-3 py-2 font-mono font-extrabold text-primary-dark">{s.time}</td>
                          <td className="px-3 py-2 font-mono text-[#475569]">{s.diff}</td>
                          <td className="px-3 py-2 text-[#16A34A] font-bold">{s.pace}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Entry Verification Warning Box */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] px-4 py-3.5 text-[0.78rem] text-[#1E40AF] leading-[1.5]">
                <strong>Entry Verification:</strong> All entries are cross-referenced with active EAF licenses and Fayda data. For queries regarding your approval, contact <a href="mailto:registrar@eaf.org.et" className="text-primary-dark font-extrabold">registrar@eaf.org.et</a>.
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
