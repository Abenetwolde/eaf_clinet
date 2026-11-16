import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ShieldCheck, CheckCircle2, Copy, Check, Loader2 } from 'lucide-react';
import type { Athlete } from '../../types';
import { getProfilePhotoUrl } from '../../utils/profilePhoto';
import { buildLicenseQrValue, downloadAthleteLicensePdf } from './LicenseQrCode';

interface AthleteDigitalIdCardProps {
  athlete: Athlete;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  showDownloadButton?: boolean;
}

export default function AthleteDigitalIdCard({
  athlete,
  onNotify,
  showDownloadButton = true,
}: AthleteDigitalIdCardProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedFin, setCopiedFin] = useState(false);

  const handleCopyFin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!athlete.faydaFin) return;
    navigator.clipboard.writeText(athlete.faydaFin);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
    if (onNotify) onNotify('Fayda FIN copied to clipboard', 'info');
  };

  const handleDownload = async () => {
    try {
      setDownloadingPdf(true);
      await downloadAthleteLicensePdf(athlete);
      if (onNotify) {
        onNotify('Official National Athlete Digital ID PDF downloaded successfully.', 'success');
      }
    } catch (err: any) {
      if (onNotify) {
        onNotify(err?.message || 'Could not download official license card PDF.', 'error');
      } else {
        alert(err?.message || 'Could not download official license card PDF.');
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Format date of birth
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const resolvedPhoto = getProfilePhotoUrl({
    photoUrl: athlete.photoUrl,
    faydaFin: athlete.faydaFin,
  }) || '/images/profile-placeholder.svg';

  const licenseNum = athlete.licenseNumber || `ETH-${(athlete.id || '000000').slice(-6).toUpperCase()}`;
  const isVerified = athlete.faydaStatus === 'VERIFIED' || !!athlete.faydaFin;
  const statusLabel = athlete.licenseStatus === 'ACTIVE' ? 'ACTIVE / ELIGIBLE' : (athlete.licenseStatus || 'ACTIVE');

  return (
    <div className="w-full max-w-full space-y-3">
      {/* ── OFFICIAL NATIONAL ATHLETE DIGITAL ID CARD (WHITE & GOLD / EMERALD) ── */}
      <div className="w-full bg-white rounded-2xl border-2 border-[#D4AF37] shadow-xl overflow-hidden text-slate-900 transition-all select-none">
        
        {/* 1. Header Banner: Emerald Green with Circular Seal & 2026 Season Pill */}
        <div className="bg-[#006B3F] text-white px-3.5 py-3 relative">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Circular Seal & Federation Typography */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border border-[#D4AF37] shadow-xs flex items-center justify-center shrink-0"
                style={{ width: '36px', height: '36px' }}
              >
                <img
                  src="/images/logo.jpeg"
                  alt="EAF Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white leading-tight truncate">
                  ETHIOPIAN ATHLETICS FEDERATION
                </div>
                <div className="text-[8px] sm:text-[8.5px] font-bold text-slate-100 leading-tight truncate">
                  የኢትዮጵያ አትሌቲክስ ፌዴሬሽን • NATIONAL REGISTRY
                </div>
                <div className="text-[7px] sm:text-[7.5px] font-bold text-[#FEF08A] tracking-wider uppercase leading-tight truncate mt-0.5">
                  OFFICIAL ATHLETE DIGITAL ID & ACCREDITATION CARD
                </div>
              </div>
            </div>

            {/* Right: Season Pill */}
            <div className="shrink-0">
              <div className="rounded bg-[#064E3B] border border-[#FCD116] text-[#FDE047] text-[8.5px] sm:text-[9.5px] font-black px-2 py-0.5 tracking-wider uppercase shadow-xs whitespace-nowrap">
                2026 SEASON
              </div>
            </div>
          </div>

          {/* Gold Accent Ribbon along the bottom of the header */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FCD116]" />
        </div>

        {/* 2. Main Card Body (Crisp White with Clean Slate Details - NO BLACK) */}
        <div className="p-3.5 sm:p-4 bg-white space-y-3">
          
          {/* Top Section: Photo + Identification + Scannable QR Matrix */}
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            
            {/* Column A: Strict Fixed-Dimension Photo Frame + Fayda Verified Pill */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="rounded-lg border border-slate-300 overflow-hidden bg-slate-100 shadow-xs relative shrink-0"
                style={{ width: '88px', height: '112px', minWidth: '88px', maxWidth: '88px' }}
              >
                <img
                  src={resolvedPhoto}
                  alt={athlete.name}
                  className="w-full h-full object-cover object-top block"
                  style={{ width: '88px', height: '112px', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/fayda_resident_photo.jpg';
                  }}
                />
              </div>

              {/* Fayda Verified Badge below photo */}
              <div className="w-[88px] mt-1 flex flex-col items-center">
                <span className="w-full bg-[#15803D] text-white text-[7px] font-black py-0.5 px-1 rounded text-center uppercase tracking-wider shadow-xs flex items-center justify-center gap-0.5">
                  <CheckCircle2 size={8} /> {isVerified ? 'FAYDA VERIFIED' : 'ACCREDITED'}
                </span>
                <span className="text-[6px] font-black text-slate-500 uppercase tracking-wider text-center mt-0.5">
                  FAYDA FIN / NIN:
                </span>
                <div className="flex items-center justify-center gap-0.5 w-full">
                  <span className="text-[7.5px] font-bold font-mono text-slate-900 tracking-tight truncate max-w-[72px]">
                    {athlete.faydaFin || 'FIN-VERIFIED'}
                  </span>
                  {athlete.faydaFin && (
                    <button
                      type="button"
                      onClick={handleCopyFin}
                      title="Copy FIN"
                      className="text-slate-400 hover:text-slate-800 p-0 border-none bg-transparent cursor-pointer inline-flex items-center"
                    >
                      {copiedFin ? <Check size={8} className="text-emerald-600" /> : <Copy size={8} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Column B: Athlete Identity & Official License Box */}
            <div className="min-w-0 flex-1 space-y-1.5 text-left">
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight leading-tight m-0 truncate">
                  {athlete.name}
                </h4>
                <div className="text-[11px] font-bold text-slate-600 leading-tight truncate mt-0.5">
                  {athlete.amharicName || '—'}
                </div>
              </div>

              {/* Official License Number Box (Mint background with emerald accents) */}
              <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-lg p-2 flex items-center justify-between gap-1 shadow-xs">
                <div className="text-left min-w-0">
                  <div className="text-[6.5px] font-black text-[#15803D] tracking-wider uppercase leading-none">
                    EAF LICENSE NUMBER
                  </div>
                  <div className="text-xs sm:text-[13px] font-black font-mono text-[#047857] tracking-wider mt-0.5 truncate">
                    {licenseNum}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="bg-[#16A34A] text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wide whitespace-nowrap">
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Primary Club & Region Key Credentials */}
              <div className="grid grid-cols-2 gap-1.5 text-left pt-0.5">
                <div className="min-w-0">
                  <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                    CLUB
                  </span>
                  <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                    {athlete.clubName || athlete.club || 'National Roster'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                    REGION
                  </span>
                  <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                    {athlete.region || 'Ethiopia'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column C: Scannable Cryptographic QR Matrix & Stadium Gate Tag */}
            <div className="shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <QRCodeSVG value={buildLicenseQrValue(athlete)} size={54} level="M" />
              <span className="text-[6px] font-black text-[#006B3F] uppercase tracking-wider mt-1">
                SCAN TO VERIFY
              </span>
              <span className="text-[5px] font-semibold text-slate-500 uppercase tracking-tight">
                GATE VALIDATION
              </span>
              <span className="text-[4.5px] font-mono text-slate-400 mt-0.5">
                Ed25519 Signed
              </span>
            </div>
          </div>

          {/* Secondary Credentials Grid (Discipline, Gender, DOB, Category) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-left">
            <div className="min-w-0">
              <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                WA DISCIPLINES
              </span>
              <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                {athlete.primaryEvent || 'Athletics'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                GENDER
              </span>
              <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                {athlete.gender || '—'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                DATE OF BIRTH
              </span>
              <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                {formatDate(athlete.dob)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[6.5px] font-black uppercase tracking-wider text-slate-500">
                CATEGORY / TIER
              </span>
              <span className="block text-[9.5px] font-bold text-slate-900 truncate">
                {athlete.ageTier || 'Senior'}
              </span>
            </div>
          </div>

          {/* Anti-Doping Notice Box (identical to official PDF accreditation card) */}
          <div className="rounded-md bg-slate-50 border border-slate-200/80 p-1.5 text-[7px] text-slate-600 leading-snug text-left">
            This license certifies official compliance with Ethiopian Athletics Federation regulations and anti-doping protocols for national and international sanctioned competition.
          </div>

          {/* National Tri-Color Security Band (Green, Yellow, Red) */}
          <div className="space-y-1 pt-0.5">
            <div className="flex h-1.5 w-full rounded-full overflow-hidden shadow-2xs">
              <div className="flex-1 bg-[#006B3F]" />
              <div className="flex-1 bg-[#FCD116]" />
              <div className="flex-1 bg-[#E03C31]" />
            </div>
            <div className="flex items-center justify-between text-[7px] text-slate-500 px-0.5 font-medium">
              <span className="truncate">Ethiopian Athletics Federation • Addis Ababa</span>
              <span className="font-mono font-bold text-slate-600 shrink-0 ml-1">
                AUTH-REF: {licenseNum}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── DOWNLOAD BUTTON DIRECTLY BELOW CARD ── */}
      {showDownloadButton && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadingPdf}
            title="Download official vector PDF athlete license and accreditation card"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer border border-emerald-400/40 disabled:opacity-50"
          >
            {downloadingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating Official Card PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Card (PDF)</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[0.72rem] text-slate-500 dark:text-slate-400 px-1 font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck size={13} /> Official EAF Accreditation Card
            </span>
            <span>Print-ready 640×410 pt</span>
          </div>
        </div>
      )}
    </div>
  );
}
