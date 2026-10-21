import React, { useState } from "react";
import {
  ShieldCheck, CheckCircle2, Copy, Check, X,
  Calendar, Phone, Mail, MapPin, User, ArrowRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  fanNumber?: string;
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
    "";

  const fan = identity.fanNumber;
  const tier = identity.ageTier || 'Not calculated';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <img
              src="/images/fayda_logo.png"
              alt="Fayda Logo"
              className="w-8 h-8 rounded-full object-cover shadow-xs bg-white p-0.5 border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-sky-800 uppercase tracking-wider">
                  Fayda Identity Verified
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" /> Authenticated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium m-0">
                National ID Program (NIDP) · Ethiopian Athletics Federation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* Subtle Animated Success Banner */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0.5, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
              className="w-16 h-16 rounded-full bg-emerald-50 border-3 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-md relative mb-3"
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" />
              <CheckCircle2 size={34} className="text-emerald-600 relative z-10" />
            </motion.div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight m-0">
              Identity Verified Successfully
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1">
              Your biometric national identity credentials have been authenticated and matched with official government records.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 shadow-xs">
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap sm:flex-nowrap mb-5">
              <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
                <img
                  src={photo}
                  alt="Biometric Portrait"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h4 className="text-lg sm:text-xl font-black text-slate-900 m-0 leading-tight">
                  {identity.fullName}
                </h4>
                {identity.fullNameAmharic && (
                  <div className="text-sm font-bold text-sky-700 mt-0.5">
                    {identity.fullNameAmharic}
                  </div>
                )}
                <div className="text-xs text-slate-600 font-semibold mt-1.5 flex items-center gap-2 flex-wrap">
                  <span>{identity.birthDate || "Date of birth not provided"}</span>
                  <span>•</span>
                  <span>{identity.gender || "Gender not provided"}</span>
                  <span>•</span>
                  <span>{tier}</span>
                </div>
              </div>
            </div>

            {/* SEPARATE FIN AND FAN CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* FIN */}
              <div className="bg-white border-2 border-sky-100 rounded-xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-800">
                    National ID (FIN)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(identity.nin, 'FIN')}
                    className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 hover:bg-sky-100 cursor-pointer inline-flex items-center gap-1"
                  >
                    {copied === 'FIN' ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied === 'FIN' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-base font-black text-slate-900 font-mono tracking-tight">
                  {formatFin(identity.nin)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Permanent Citizen Identification
                </div>
              </div>

              {/* FAN */}
              <div className="bg-white border-2 border-emerald-100 rounded-xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                    Federation Access Number (FAN)
                  </span>
                  {fan && <button
                    type="button"
                    onClick={() => handleCopy(fan, 'FAN')}
                    className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 cursor-pointer inline-flex items-center gap-1"
                  >
                    {copied === 'FAN' ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied === 'FAN' ? 'Copied' : 'Copy'}</span>
                  </button>}
                </div>
                <div className="text-base font-black text-slate-900 font-mono tracking-tight">
                  {fan || "Not provided by Fayda"}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Issued by the federation when available
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span className="font-bold">Phone:</span>
                <span className="font-semibold">{identity.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span className="font-bold">Email:</span>
                <span className="font-semibold">{identity.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span className="font-bold">Region:</span>
                <span className="font-semibold">{identity.address || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onContinueRegistration) {
                  onContinueRegistration();
                }
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer border-0 transition-all"
            >
              <span>Continue to Next Step</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
