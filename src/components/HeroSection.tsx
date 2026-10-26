import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Trophy,
  Radio,
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  UserCheck,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Flame,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types & Contracts
// ============================================================================

export type LanguageCode = "en" | "am";

export interface NavItem {
  id: string;
  label: string;
  labelAm: string;
  href?: string;
}

export interface LiveEventItem {
  id: string;
  title: string;
  location: string;
  category: string;
  date: string;
  thumbnail: string;
  isLive: boolean;
  leader?: string;
  paceOrSplit?: string;
  actionText?: string;
}

export interface HeroSectionProps {
  // Navigation & Auth actions
  onLogin?: () => void;
  onRegisterClub?: () => void;
  onExploreCompetitions?: () => void;
  onViewLiveStandings?: (eventId: string) => void;
  onSearch?: (query: string) => void;
  onNavigate?: (navId: string) => void;

  // Controlled states (optional with built-in fallbacks)
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  activeNavId?: string;

  // Custom data overrides
  events?: LiveEventItem[];
  customHeadline?: string;
  customSubtitle?: string;
}

// ============================================================================
// Default Federation Data
// ============================================================================

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", labelAm: "ዋና ገጽ", href: "#home" },
  { id: "competitions", label: "Competitions", labelAm: "ውድድሮች", href: "#competitions" },
  { id: "athletes", label: "Athletes", labelAm: "አትሌቶች", href: "#athletes" },
  { id: "professionals", label: "Professionals", labelAm: "ባለሙያዎች", href: "#professionals" },
  { id: "media", label: "Media", labelAm: "ሚዲያ", href: "#media" },
];

export const DEFAULT_LIVE_EVENTS: LiveEventItem[] = [
  {
    id: "addis-marathon-2026",
    title: "Addis Ababa International Marathon 2026",
    location: "Addis Ababa Stadium",
    category: "Marathon",
    date: "Sept 27, 2026",
    thumbnail: "/images/runner_marathon.png",
    isLive: true,
    leader: "Tamirat Tola • 2:03:39",
    paceOrSplit: "Split 35km (2:52/km)",
    actionText: "Live Standings",
  },
  {
    id: "eth-track-trials-2026",
    title: "National Track & Field Olympic Trials",
    location: "Hawassa International Stadium",
    category: "10,000m Final",
    date: "Oct 15, 2026",
    thumbnail: "/images/banner_grand_prix.png",
    isLive: true,
    leader: "Selemon Barega • Final Lap 52.8s",
    paceOrSplit: "Split 8,000m (21:40)",
    actionText: "Live Standings",
  },
  {
    id: "jan-meda-cross-2026",
    title: "Jan Meda International Cross Country",
    location: "Jan Meda Race Course",
    category: "Cross Country 10K",
    date: "Nov 08, 2026",
    thumbnail: "/images/banner_jan_meda.png",
    isLive: true,
    leader: "Gudaf Tsegay • Lap 4 Leader",
    paceOrSplit: "Lap Pace 2:48/km",
    actionText: "Live Standings",
  },
];

// ============================================================================
// Sub-Component 1: Floating Glassmorphism Header
// ============================================================================

export interface FederationHeaderProps {
  navItems?: NavItem[];
  activeNavId?: string;
  onNavigate?: (id: string) => void;
  onLogin?: () => void;
  onRegisterClub?: () => void;
  onSearch?: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export function FederationHeader({
  navItems = DEFAULT_NAV_ITEMS,
  activeNavId = "home",
  onNavigate,
  onLogin,
  onRegisterClub,
  onSearch,
  darkMode,
  onToggleDarkMode,
  currentLanguage,
  onLanguageChange,
}: FederationHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    setSearchOpen(false);
  };

  return (
    <header className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo + Federation Title with Bilingual Badge */}
          <div
            onClick={() => onNavigate?.("home")}
            className="flex items-center gap-3.5 cursor-pointer select-none group shrink-0"
            role="button"
            tabIndex={0}
            aria-label="Ethiopian Athletics Federation Home"
          >
            {/* Federation Emblem */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-[1.5px] shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden relative">
                <span className="text-xl leading-none">🇪🇹</span>
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
              </div>
            </div>

            {/* Typography & Bilingual Badge */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  EAF
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  Digital Portal
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  Ethiopian Athletics Federation
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                  የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-2"
          >
            {navItems.map((item) => {
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {currentLanguage === "am" ? item.labelAm : item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Quick Search"
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              title="Search athletes, clubs, or events"
            >
              <Search size={17} />
            </button>

            {/* Language Dropdown Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                aria-haspopup="true"
                aria-expanded={langDropdownOpen}
                aria-label="Select Language"
              >
                <Globe size={15} className="text-slate-500 dark:text-slate-400" />
                <span className="uppercase tracking-wider">
                  {currentLanguage === "en" ? "EN" : "አማ"}
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/10 py-1.5 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        onLanguageChange("en");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between ${
                        currentLanguage === "en"
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span>English (EN)</span>
                      {currentLanguage === "en" && (
                        <CheckCircle2 size={13} className="text-blue-600" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange("am");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between ${
                        currentLanguage === "am"
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span>አማርኛ (Amharic)</span>
                      {currentLanguage === "am" && (
                        <CheckCircle2 size={13} className="text-blue-600" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-amber-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Register Club Button (Ghost Outline) */}
            <button
              onClick={onRegisterClub}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-150"
            >
              {currentLanguage === "am" ? "ክለብ ይመዝግቡ" : "Register Club"}
            </button>

            {/* Portal Login Button (Solid Vibrant Blue Primary with subtle shadow) */}
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold tracking-tight shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-150"
            >
              <UserCheck size={16} />
              <span>{currentLanguage === "am" ? "ግባ" : "Portal Login"}</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Collapsible Quick Search Bar Drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pb-4"
            >
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search athletes by license, Fayda NIN, clubs, or live events..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                  activeNavId === item.id
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{currentLanguage === "am" ? item.labelAm : item.label}</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            ))}

            <div className="pt-2 flex flex-col gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={() => {
                  onRegisterClub?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {currentLanguage === "am" ? "ክለብ ይመዝግቡ" : "Register Club"}
              </button>
              <button
                onClick={() => {
                  onLogin?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold text-center shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck size={16} />
                <span>{currentLanguage === "am" ? "ግባ" : "Portal Login"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// Sub-Component 2: Stadium Background Overlay
// ============================================================================

export function StadiumBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* High-Contrast Radial Gradients */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-gradient-to-b from-blue-600/18 via-indigo-600/10 to-transparent blur-3xl" />
      <div className="absolute top-[25%] -left-[10%] w-[500px] h-[400px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl" />
      <div className="absolute top-[20%] -right-[10%] w-[500px] h-[400px] rounded-full bg-gradient-to-tl from-amber-500/10 via-rose-500/5 to-transparent blur-3xl" />

      {/* Subtle Stadium Running Track Curve Geometry */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07] stroke-current text-slate-900 dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <pattern
            id="stadium-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stadium-grid)" />

        {/* Athletics Lane Curves */}
        <g strokeWidth="1.5" stroke="currentColor" fill="none">
          <path d="M -200 600 C 300 300, 700 200, 1600 300" strokeDasharray="6 6" />
          <path d="M -200 640 C 300 340, 700 240, 1600 340" />
          <path d="M -200 680 C 300 380, 700 280, 1600 380" strokeDasharray="4 4" />
          <path d="M -200 720 C 300 420, 700 320, 1600 420" />
          <path d="M -200 760 C 300 460, 700 360, 1600 460" strokeDasharray="8 8" />
        </g>
      </svg>

      {/* Subtle vignette darkening towards bottom to cleanly blend with next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950" />
    </div>
  );
}

// ============================================================================
// Sub-Component 3: Tagline Badge
// ============================================================================

export interface TaglineBadgeProps {
  label?: string;
}

export function TaglineBadge({
  label = "⚡ EAF Centralized Governance & Integrity Architecture",
}: TaglineBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="inline-flex items-center gap-2 p-[1px] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 shadow-sm shadow-blue-500/10 mb-6 group cursor-default"
    >
      <div className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center gap-2 transition-colors duration-200">
        <ShieldCheck
          size={15}
          className="text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform"
        />
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Sub-Component 4: Hero Headline & Subtitle
// ============================================================================

export interface HeroHeadlineProps {
  headline?: string;
  subtitle?: string;
}

export function HeroHeadline({
  headline = "Ethiopian Athletics Federation Digital Athlete Portal",
  subtitle = "The unified national infrastructure for biometric athlete licensing, anti-doping governance, club delegation registry, and World Athletics-synchronized live competition results.",
}: HeroHeadlineProps) {
  return (
    <div className="space-y-5 max-w-4xl mx-auto text-center">
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]"
      >
        EAF Digital Athlete Portal:{" "}
        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
          Governance & Live Results
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

// ============================================================================
// Sub-Component 5: Interactive Live Event Widget Card
// ============================================================================

export interface LiveEventCardProps {
  events?: LiveEventItem[];
  onViewStandings?: (eventId: string) => void;
}

export function LiveEventCard({
  events = DEFAULT_LIVE_EVENTS,
  onViewStandings,
}: LiveEventCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-switch carousel every 6 seconds unless user pauses or interacts
  useEffect(() => {
    if (isPaused || events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, events.length]);

  const currentEvent = events[currentIndex] || events[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto my-8 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Live Athletics Events"
    >
      {/* Elevated Card with subtle glow/ring effect */}
      <div className="relative group rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl hover:shadow-2xl hover:ring-blue-500/30 dark:hover:ring-blue-500/30 transition-all duration-300 overflow-hidden p-4 sm:p-5">
        {/* Subtle Ambient Accent Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
          >
            {/* Left Side: Thumbnail Image with Pulsing Red LIVE Status Badge */}
            <div className="relative w-full sm:w-44 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-950 shadow-md">
              <img
                src={currentEvent.thumbnail}
                alt={currentEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback if image path does not exist
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Pulsing Red LIVE Status Badge */}
              {currentEvent.isLive && (
                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-md shadow-red-600/40 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <Radio size={11} className="shrink-0" />
                  <span>LIVE</span>
                </div>
              )}
            </div>

            {/* Middle: Event Title, Location tag, Category tag, Date badge */}
            <div className="flex-1 min-w-0 text-left w-full">
              {/* Event Title */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight mb-2">
                {currentEvent.title}
              </h2>

              {/* Tag Array */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Location Tag */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <MapPin size={12} className="text-blue-500 shrink-0" />
                  <span>{currentEvent.location}</span>
                </span>

                {/* Category Tag */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <Trophy size={12} className="shrink-0" />
                  <span>{currentEvent.category}</span>
                </span>

                {/* Date Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/50 dark:border-blue-900/50">
                  <Calendar size={12} className="shrink-0" />
                  <span>{currentEvent.date}</span>
                </span>
              </div>

              {/* Live Ticker info if present */}
              {currentEvent.leader && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Activity size={12} className="text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentEvent.leader}
                  </span>
                  {currentEvent.paceOrSplit && (
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                      {currentEvent.paceOrSplit}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: High-contrast red action button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onViewStandings?.(currentEvent.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm tracking-tight shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{currentEvent.actionText || "Live Standings"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Carousel Controls: Minimalist indicator dots and navigation arrows */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mr-1.5">
              Event {currentIndex + 1} of {events.length}
            </span>
            {events.map((evt, idx) => (
              <button
                key={evt.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to event ${idx + 1}`}
                className={`transition-all duration-200 rounded-full ${
                  currentIndex === idx
                    ? "w-6 h-1.5 bg-red-600"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Previous Live Event"
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Live Event"
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Sub-Component 6: Main Action Buttons
// ============================================================================

export interface HeroActionButtonsProps {
  onSignIn?: () => void;
  onExplore?: () => void;
  currentLanguage?: LanguageCode;
}

export function HeroActionButtons({
  onSignIn,
  onExplore,
  currentLanguage = "en",
}: HeroActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto"
    >
      {/* Primary: "Sign In to Your Portal" */}
      <button
        onClick={onSignIn}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base tracking-tight shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <UserCheck size={18} />
        <span>
          {currentLanguage === "am"
            ? "ወደ ፖርታልዎ ይግቡ"
            : "Sign In to Your Portal"}
        </span>
      </button>

      {/* Secondary: "Explore Competitions" (white/slate glass card with trophy icon) */}
      <button
        onClick={onExplore}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 font-bold text-sm sm:text-base tracking-tight shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Trophy size={18} className="text-amber-500" />
        <span>
          {currentLanguage === "am"
            ? "ውድድሮችን ያስሱ"
            : "Explore Competitions"}
        </span>
      </button>
    </motion.div>
  );
}

// ============================================================================
// Main Container: HeroSection
// ============================================================================

export function HeroSection({
  onLogin,
  onRegisterClub,
  onExploreCompetitions,
  onViewLiveStandings,
  onSearch,
  onNavigate,
  darkMode: externalDarkMode,
  onToggleDarkMode: externalToggleDarkMode,
  currentLanguage: externalLanguage,
  onLanguageChange: externalLanguageChange,
  activeNavId = "home",
  events = DEFAULT_LIVE_EVENTS,
  customHeadline,
  customSubtitle,
}: HeroSectionProps) {
  // Internal state fallbacks if not controlled from parent
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eaf_darkMode");
      if (stored !== null) return stored === "true";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [internalLanguage, setInternalLanguage] = useState<LanguageCode>("en");

  const isDarkMode =
    externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;

  const toggleDarkMode = () => {
    if (externalToggleDarkMode) {
      externalToggleDarkMode();
    } else {
      const next = !internalDarkMode;
      setInternalDarkMode(next);
      if (typeof window !== "undefined") {
        localStorage.setItem("eaf_darkMode", String(next));
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  };

  const language = externalLanguage || internalLanguage;
  const setLanguage = externalLanguageChange || setInternalLanguage;

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode ? "dark bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 1. Header: Floating Glassmorphism Header */}
      <FederationHeader
        activeNavId={activeNavId}
        onNavigate={onNavigate}
        onLogin={onLogin}
        onRegisterClub={onRegisterClub}
        onSearch={onSearch}
        darkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* 2. Hero Section Content with Stadium Background */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Stadium High-Contrast Background Overlay */}
        <StadiumBackground />

        {/* Foreground Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          {/* Tagline Badge */}
          <TaglineBadge />

          {/* Headline & Subtitle */}
          <HeroHeadline
            headline={customHeadline}
            subtitle={customSubtitle}
          />

          {/* Interactive Live Event Widget Card */}
          <LiveEventCard
            events={events}
            onViewStandings={onViewLiveStandings}
          />

          {/* Main Action Buttons */}
          <HeroActionButtons
            onSignIn={onLogin}
            onExplore={onExploreCompetitions}
            currentLanguage={language}
          />

          {/* Trust/Integrity Micro-Badges */}
          <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-500" />
              <span>Fayda Biometric Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              <span>World Athletics Synchronized</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={15} className="text-emerald-500" />
              <span>Clean Sport Anti-Doping Governance</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HeroSection;
