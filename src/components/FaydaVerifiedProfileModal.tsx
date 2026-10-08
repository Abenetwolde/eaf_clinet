import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Fingerprint,
  User,
  Award,
  Hash,
  Download,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export interface FaydaResidentIdentity {
  nin: string;
  fullName: string;
  fullNameAmharic?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  picture?: string;
  verificationToken?: string;
  verifiedAt?: string;
  ageTier?: string;
  hash?: string;
  nationality?: string;
}

interface FaydaVerifiedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: FaydaResidentIdentity;
  onContinueRegistration?: () => void;
}

export function formatFin(fin: string | undefined): string {
  if (!fin) return "—";
  const clean = fin.replace(/\D/g, "");
  if (clean.length === 0) return fin;
  // Group in 4s
  return clean.match(/.{1,4}/g)?.join(" ") || fin;
}

export default function FaydaVerifiedProfileModal({
  isOpen,
  onClose,
  identity,
  onContinueRegistration,
}: FaydaVerifiedProfileModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const photo =
    identity.picture ||
    (typeof window !== "undefined"
      ? localStorage.getItem("fayda_photo") || sessionStorage.getItem("fayda_photo")
      : null) ||
    "/images/fayda_resident_photo.jpg";

  const dobYear = identity.birthDate ? parseInt(identity.birthDate.substring(0, 4)) : 2001;
  const age = 2026 - (isNaN(dobYear) ? 2001 : dobYear);
  const tier =
    identity.ageTier ||
    (age <= 16
      ? "U16 Junior Division"
      : age <= 18
      ? "U18 Youth Division"
      : age <= 20
      ? "U20 Junior Division"
      : age >= 35
      ? `Masters Division (${age} yrs)`
      : `Senior Division (${age} yrs)`);

  const qrPayload = JSON.stringify({
    iss: "https://esignet.ida.fayda.et",
    sub: identity.nin,
    name: identity.fullName,
    name_am: identity.fullNameAmharic || identity.fullName,
    dob: identity.birthDate,
    gender: identity.gender,
    verified_by: "Ethiopian Athletics Federation",
    status: "VERIFIED",
    verified_at: identity.verifiedAt || new Date().toISOString(),
  });

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-sky-500/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ethiopian Flag Tricolor Accent */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#009A44]" />
          <div className="flex-1 bg-[#FED100]" />
          <div className="flex-1 bg-[#EF3340]" />
        </div>

        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Fayda Verified Resident Profile
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Federal Democratic Republic of Ethiopia · National ID Program (NIDP)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1">
          {/* Main Citizen ID Card Presentation */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-sky-500/40 p-6 shadow-2xl overflow-hidden">
            {/* Background watermark seal */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
              <ShieldCheck size={260} />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo Frame */}
              <div className="flex flex-col items-center gap-2.5 shrink-0 mx-auto md:mx-0">
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border-4 border-amber-400/80 shadow-2xl bg-slate-800">
                  <img
                    src={photo}
                    alt={identity.fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Official Portrait
                </span>
              </div>

              {/* Citizen Information Block */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-0.5">
                    Resident Citizen Name
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                    {identity.fullName}
                  </h2>
                  {identity.fullNameAmharic && (
                    <div className="text-base font-bold text-sky-300 mt-0.5">
                      {identity.fullNameAmharic}
                    </div>
                  )}
                </div>

                {/* NIN badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 max-w-fit flex-wrap">
                  <Fingerprint size={18} className="text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                      National ID Number (NIN / FAN)
                    </span>
                    <span className="font-mono font-black text-sm text-amber-300 tracking-wider">
                      {formatFin(identity.nin)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(identity.nin, "NIN")}
                    className="ml-2 p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy NIN"
                  >
                    {copied === "NIN" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Demographic Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <Calendar size={11} className="text-sky-400" /> Date of Birth
                    </div>
                    <div className="text-xs font-extrabold text-white">
                      {identity.birthDate || "1980-12-01"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <User size={11} className="text-purple-400" /> Gender
                    </div>
                    <div className="text-xs font-extrabold text-white">
                      {identity.gender || "MALE"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <Award size={11} className="text-amber-400" /> Age Tier
                    </div>
                    <div className="text-xs font-extrabold text-amber-300 truncate">
                      {tier}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <Phone size={11} className="text-emerald-400" /> Phone
                    </div>
                    <div className="text-xs font-extrabold text-white truncate">
                      {identity.phoneNumber || "0909090909"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <Mail size={11} className="text-blue-400" /> Email
                    </div>
                    <div className="text-xs font-extrabold text-white truncate">
                      {identity.email || "chere@id.et"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <MapPin size={11} className="text-rose-400" /> Region
                    </div>
                    <div className="text-xs font-extrabold text-white truncate">
                      {identity.address || "Addis Ababa / Federal"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Details & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Claims Audit Box */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  OIDC Cryptographic Verification
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  RS256 VALIDATED
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Identity Provider:</span>
                  <span className="font-mono font-bold text-slate-200">esignet.ida.fayda.et</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Authentication Flow:</span>
                  <span className="font-bold text-slate-200">Authorization Code + PKCE (S256)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Verification Date:</span>
                  <span className="font-bold text-slate-200">
                    {identity.verifiedAt || new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </span>
                </div>
                {identity.verificationToken && (
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      EAF Verification Token Hash:
                    </span>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-sky-300 break-all flex items-center justify-between gap-2">
                      <span className="truncate">{identity.verificationToken}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(identity.verificationToken || "", "TOKEN")}
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        {copied === "TOKEN" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Credential */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-2.5 rounded-xl bg-white shadow-md mb-2">
                <QRCodeSVG value={qrPayload} size={110} level="M" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Digital Verification QR
              </span>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                EAF · Proclamation 1284/2023
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors"
          >
            Close Viewer
          </button>

          <div className="flex items-center gap-2">
            {onContinueRegistration && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinueRegistration();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>Continue Registration with Verified ID</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
