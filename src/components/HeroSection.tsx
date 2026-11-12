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
// Sub-Component 2: Stadium Background Overlay (Vibrant, Clearly Visible Action Canvas)
// ============================================================================

export function StadiumBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Stadium Photo Background - Clearly Visible */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-100"
        style={{ backgroundImage: `url('/images/banner_grand_prix.png')` }}
      />

      {/* Gentle Directional Scrim (keeps photo bright while maintaining text readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />

      {/* Subtle Stadium Running Track Curve Geometry */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] stroke-current text-white"
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
  headline = "Discover & track great competitions",
  subtitle = "For athletes, by athletes",
}: HeroHeadlineProps) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto text-center">
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]"
      >
        {headline === "Discover & track great competitions" ? (
          <>
            Discover & track <br />
            <span className="text-white">great competitions</span>
          </>
        ) : (
          headline
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

// ============================================================================
// Sub-Component 5: Interactive Registration Spotlight Widget Card
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
      aria-label="Athletics Competitions"
    >
      {/* Elevated High-Contrast Spotlight Card */}
      <div className="relative group rounded-2xl bg-slate-900/90 backdrop-blur-2xl ring-1 ring-emerald-500/25 border-l-4 border-l-emerald-500 shadow-2xl hover:shadow-emerald-500/10 hover:ring-emerald-500/45 transition-all duration-300 overflow-hidden p-4 sm:p-5 text-left">
        {/* Subtle Ambient Accent Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
          >
            {/* Left Side: Thumbnail Image with Energetic Emerald/Blue Registration Badge */}
            <div className="relative w-full sm:w-44 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-950 shadow-md">
              <img
                src={currentEvent.thumbnail || "/images/banner_grand_prix.png"}
                alt={currentEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/images/banner_grand_prix.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

              {/* Energetic Emerald/Blue Registration Badge */}
              <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md shadow-emerald-600/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span>OPEN</span>
              </div>
            </div>

            {/* Middle: Event Title, Registration Status, Venue, and Discipline Tags */}
            <div className="flex-1 min-w-0 text-left w-full">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                {/* Registration Open State Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 text-[11px] tracking-wide">
                  <Sparkles size={11} className="shrink-0" />
                  <span>REGISTRATION OPEN</span>
                </span>

                {/* Location Tag */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
                  <MapPin size={11} className="text-blue-400 shrink-0" />
                  <span>{currentEvent.location}</span>
                </span>

                {/* Deadline countdown / Date Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30">
                  <Calendar size={11} className="shrink-0" />
                  <span>Deadline: {currentEvent.date || "Upcoming"}</span>
                </span>
              </div>

              {/* Event Title */}
              <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-tight mb-2">
                {currentEvent.title}
              </h2>

              {/* Discipline Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                  <Trophy size={11} className="shrink-0" /> Disciplines:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25">
                  {currentEvent.category || "Track & Field"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25">
                  Sprints & Relays
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25">
                  Distance
                </span>
              </div>
            </div>

            {/* Right Side: Energetic Emerald/Blue "Register Now" Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onViewStandings?.(currentEvent.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm tracking-tight shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Register Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Carousel Controls: Minimalist indicator dots and navigation arrows */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mr-1.5">
              Event {currentIndex + 1} of {events.length}
            </span>
            {events.map((evt, idx) => (
              <button
                key={evt.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to event ${idx + 1}`}
                className={`transition-all duration-200 rounded-full ${
                  currentIndex === idx
                    ? "w-6 h-1.5 bg-emerald-500"
                    : "w-1.5 h-1.5 bg-slate-700 hover:bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Previous Live Event"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Live Event"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
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
// Sub-Component 6: Main Action Buttons & Bento Trust Strip
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Primary & Secondary Action CTAs matching reference */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
      >
        {/* Primary Solid Green Button: "View the competition calendar ->" */}
        <button
          onClick={onExplore}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm sm:text-base tracking-tight shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>View the competition calendar</span>
          <ArrowRight size={17} />
        </button>

        {/* Secondary Green Ghost Link: "Find an athlete ->" */}
        <button
          onClick={() => {
            const el = document.getElementById("athletes");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center justify-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-sm sm:text-base transition-colors"
        >
          <span>Find an athlete</span>
          <ArrowRight size={17} />
        </button>

        {/* Sign In to Portal CTA */}
        <button
          onClick={onSignIn}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm shadow-md transition-all duration-200"
        >
          <UserCheck size={16} />
          <span>{currentLanguage === "am" ? "ወደ ፖርታልዎ ይግቡ" : "Sign In to Your Portal"}</span>
        </button>
      </motion.div>

      {/* App Store & Google Play Badges Strip matching reference */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-xs sm:text-sm font-semibold text-slate-300">
          Athletics app on your phone. It is free
        </span>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* App Store */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 bg-black border border-white/20 rounded-xl px-3.5 py-1.5 text-white shadow-lg cursor-pointer">
              <svg width="16" height="19" viewBox="0 0 170 170" fill="currentColor">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.77-7.94-12.22-14.6-6.19-9.35-11.11-20.2-14.75-32.55-3.64-12.35-5.46-24.08-5.46-35.18 0-15.54 3.8-28.16 11.41-37.86 7.6-9.7 17.1-14.65 28.5-14.86 5.86 0 12.16 1.62 18.9 4.86 6.74 3.24 11.23 4.97 13.48 5.19 1.96-.22 6.53-1.95 13.72-5.19 7.19-3.24 13.38-4.75 18.57-4.54 13.91.65 24.99 5.86 33.24 15.64-12.17 7.4-18.15 17.39-17.93 29.99.22 9.79 3.91 18.04 11.08 24.77 7.17 6.74 15.65 10.54 25.43 11.41-2.17 6.74-4.89 13.59-8.16 20.54zM119.22 33.04c0-7.39 2.61-14.35 7.82-20.87 5.22-6.52 11.74-10.98 19.57-13.37-.22 1.3-.43 2.5-.65 3.59-1.52 7.17-4.57 13.8-9.13 19.9-4.57 6.09-10.43 10.43-17.61 13.04z" />
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-300">Download on the</span>
                <span className="text-xs font-bold">App Store</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <span>★★★★★</span>
              <span className="text-white">4.8</span>
            </div>
          </div>

          {/* Google Play */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 bg-black border border-white/20 rounded-xl px-3.5 py-1.5 text-white shadow-lg cursor-pointer">
              <svg width="15" height="17" viewBox="0 0 512 512" fill="none">
                <path d="M47.2 12.7C41.4 18.8 38 28.2 38 40.2V471.8c0 12 3.4 21.4 9.2 27.5l1.5 1.5L273 276.5v-5L48.7 11.2l-1.5 1.5z" fill="#00D7FF"/>
                <path d="M351.4 355.2l-78.4-78.7v-5l78.4-78.7 1.8 1 93 52.8c26.5 15 26.5 39.7 0 54.8l-93 52.8-1.8 1z" fill="#FFCF00"/>
                <path d="M273 271.5L48.7 499.3c8.9 9.4 23.4 10.6 39.9 1.3l264.6-150.4-80.2-78.7z" fill="#FF3A44"/>
                <path d="M273 240.5l80.2-78.7L88.6 11.4C72.1 2.1 57.6 3.3 48.7 12.7L273 240.5z" fill="#00E676"/>
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-300">GET IT ON</span>
                <span className="text-xs font-bold">Google Play</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <span>★★★★★</span>
              <span className="text-white">4.5</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento-Style Action & Trust Strip */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Fayda Verified</div>
            <div className="text-[11px] text-slate-400">Biometric identity</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">World Athletics TR</div>
            <div className="text-[11px] text-slate-400">Official rulesets</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">11 Regional Hubs</div>
            <div className="text-[11px] text-slate-400">Nationwide registry</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Digital Licensing</div>
            <div className="text-[11px] text-slate-400">Certified credentials</div>
          </div>
        </div>
      </motion.div>
    </div>
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

          {/* Main Action Buttons & Bento Trust Strip */}
          <HeroActionButtons
            onSignIn={onLogin}
            onExplore={onExploreCompetitions}
            currentLanguage={language}
          />
        </div>

        {/* Curved Wave Bottom Boundary matching reference image */}
        <svg
          viewBox="0 0 1440 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -bottom-1 left-0 w-full h-[50px] pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <path
            d="M0 65 Q 720 0 1440 65 L 1440 65 L 0 65 Z"
            className="fill-slate-50 dark:fill-slate-950"
          />
        </svg>

        {/* Centered Circular Scroll-Down Button matching reference image */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              const el = document.getElementById("competitions");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all"
            aria-label="Scroll down to competitions"
          >
            <ChevronDown size={20} strokeWidth={2.5} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default HeroSection;
