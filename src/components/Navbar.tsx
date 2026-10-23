import React from "react";
import { ShieldCheck, UserCheck, Building2, LogOut, User, Award, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import type { Club, Athlete, Role } from "../types";
import { useAppSelector } from "../store/hooks";

interface NavbarProps {
  currentRole: Role;
  currentAthlete: Athlete;
  currentClub: Club;
  onSwitchRole: (role: string) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({
  currentRole, currentAthlete, currentClub, onSwitchRole, onLogout, onOpenAuthModal
}: NavbarProps) {
  const authState = useAppSelector(state => state.auth);
  const isAuthenticated = Boolean(authState.token && authState.role !== 'LANDING');
  const userRole = authState.role || "ATHLETE";

  // Check if user has a completed registration
  const isRegistered = Boolean(
    isAuthenticated &&
    ((() => {
      try {
        const regRaw = localStorage.getItem("eaf_registered_athlete");
        if (regRaw) {
          const parsed = JSON.parse(regRaw);
          if (parsed.isRegistered) return true;
        }
      } catch (e) {}
      return false;
    })() ||
    Boolean(authState.userData && (authState.userData as any).status === "ACTIVE" && (authState.userData as any).isRegistered))
  );

  const userAvatar = isAuthenticated ? (currentAthlete?.photoUrl || (authState.userData as any)?.picture || (typeof window !== "undefined" ? (localStorage.getItem("fayda_photo") || localStorage.getItem("eaf_user_avatar")) : null) || "/images/runner_female.png") : null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 ${
        currentRole === "LANDING"
          ? "bg-white border-b border-slate-200 shadow-xs"
          : "bg-white border-b border-slate-200 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between flex-wrap gap-4">
        {/* Brand Logo & EAF Title */}
        <div
          className="flex items-center gap-[clamp(0.5rem,1vw,0.875rem)] cursor-pointer min-w-0 shrink-0"
          onClick={() => onSwitchRole("LANDING")}
        >
          <div className="relative w-[clamp(2.1rem,3.4vw,2.75rem)] h-[clamp(2.1rem,3.4vw,2.75rem)] rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <span className="text-[clamp(1.1rem,1.8vw,1.5rem)]">🇪🇹</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[clamp(0.95rem,1.4vw,1.25rem)] font-black text-slate-900 tracking-tight whitespace-nowrap" style={{ fontFamily: "var(--font-sans)" }}>
                EOSCRMS
              </span>
              <span className="px-2 py-0.5 rounded text-[clamp(0.55rem,0.8vw,0.65rem)] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                REGISTRY v1.1
              </span>
            </div>
            <p className="text-[clamp(0.65rem,0.9vw,0.75rem)] text-slate-500 font-semibold whitespace-nowrap">Ethiopian Athletics Federation</p>
          </div>
        </div>

        {/* System Navigation & Role Context Controls */}
        <div className="flex items-center gap-3">
          {currentRole === "LANDING" ? (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSwitchRole(userRole)}
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer shadow-xs group"
                  title="Access Portal"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shrink-0 relative bg-slate-200 flex items-center justify-center">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={14} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[0.78rem] font-black text-slate-900 leading-tight truncate max-w-[120px]">
                      {(currentAthlete?.name || "Member").split(" ")[0]}
                    </span>
                    <span className="text-[0.62rem] font-bold text-slate-500 flex items-center gap-0.5">
                      {isRegistered ? "✓ Active Member" : "Registration Pending"}
                    </span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[0.8rem] font-bold cursor-pointer transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("openRegistrationModal", { detail: { role: "CLUB" } }));
                  }}
                  className="bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-extrabold text-[0.85rem] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Building2 size={15} className="text-sky-700" />
                  Register Club
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenAuthModal()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[0.9rem] px-4.5 py-2.5 rounded-xl border-0 cursor-pointer shadow-xs"
                >
                  Sign In
                </motion.button>
              </div>
            )
          ) : (
            <>
              {/* Active Session Indicator */}
              <div className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
                {currentRole === "CLUB" ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                      {(currentClub.logoUrl || currentClub.logo) && ((currentClub.logoUrl || currentClub.logo).startsWith("http") || (currentClub.logoUrl || currentClub.logo).startsWith("/") || (currentClub.logoUrl || currentClub.logo).startsWith("data:")) ? (
                        <img
                          src={currentClub.logoUrl || currentClub.logo}
                          alt={currentClub.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xs font-black text-slate-700">{currentClub.shortName?.slice(0, 2) || "CL"}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-[0.8rem] font-black text-slate-900">{currentClub.shortName || currentClub.name}</div>
                      <div className="text-[0.65rem] text-slate-500 font-bold">Admin Portal</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-slate-100 flex items-center justify-center">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={currentAthlete.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} className="text-slate-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-[0.8rem] font-black text-slate-900">{currentAthlete.name}</div>
                      <div className="text-[0.65rem] text-slate-500 font-bold">
                        {currentAthlete.ageTier || "Athlete"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[0.8rem] font-bold cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                Logout
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
