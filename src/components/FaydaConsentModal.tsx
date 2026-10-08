import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Camera,
  Fingerprint,
  RefreshCw,
  FileText,
  Check,
  Languages,
} from "lucide-react";

interface FaydaConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
  isLaunching?: boolean;
}

export default function FaydaConsentModal({
  isOpen,
  onClose,
  onConsent,
  isLaunching = false,
}: FaydaConsentModalProps) {
  const [hasAgreed, setHasAgreed] = useState(true);
  const [lang, setLang] = useState<"EN" | "AM">("EN");

  if (!isOpen) return null;

  const dataAttributes = [
    {
      icon: <User size={20} className="text-sky-600" />,
      nameEn: "Full Legal Name (English & Amharic)",
      nameAm: "ሙሉ ህጋዊ ስም (በእንግሊዝኛ እና በአማርኛ)",
      claims: "name, name#en, name#am, first_name, last_name",
      purposeEn: "Official competition licensing, accreditation rosters, and passport matching.",
      purposeAm: "ለይፋዊ የውድድር ፍቃድ፣ የክለብ ምዝገባ እና ከፓስፖርት ጋር ለማመሳከር።",
      required: true,
    },
    {
      icon: <Fingerprint size={20} className="text-emerald-600" />,
      nameEn: "National ID Number (Fayda NIN / FAN)",
      nameAm: "ብሔራዊ መታወቂያ ቁጥር (የፋይዳ NIN / FAN)",
      claims: "nin, sub",
      purposeEn: "Unique lifetime athlete federation registry and anti-duplicate registration.",
      purposeAm: "ለአትሌቱ ቋሚ የፌዴሬሽን መለያ ቁጥር እና ተደጋጋሚ ምዝገባን ለመከላከል\።",
      required: true,
    },
    {
      icon: <Calendar size={20} className="text-amber-600" />,
      nameEn: "Date of Birth & Age Classification",
      nameAm: "የትውልድ ቀን እና የዕድሜ ምድብ",
      claims: "birthdate",
      purposeEn: "Anti-age-fabrication verification; assigns U16, U18, U20, or Senior category.",
      purposeAm: "የዕድሜ ማጭበርበርን ለመከላከል እና ትክክለኛ የዕድሜ ምድብ ለመመደብ።",
      required: true,
    },
    {
      icon: <ShieldCheck size={20} className="text-purple-600" />,
      nameEn: "Biological Gender",
      nameAm: "ጾታ",
      claims: "gender",
      purposeEn: "Assignment to official Men\x27s or Women\x27s athletics divisions per World Athletics rules.",
      purposeAm: "በዓለም አቀፍ የአትሌቲክስ ህግ መሰረት በወንዶች ወይም በሴቶች ምድብ ለመመደብ።",
      required: true,
    },
    {
      icon: <Camera size={20} className="text-rose-600" />,
      nameEn: "Biometric Facial Portrait",
      nameAm: "ባዮሜትሪክ የፊት ፎቶግራፍ",
      claims: "picture (High-resolution resident JPEG)",
      purposeEn: "Digital athlete license card badge, stadium access pass, and race accreditation.",
      purposeAm: "ለዲጂታል አትሌት መታወቂያ ካርድ፣ ለስታዲየም መግቢያ እና ይፋዊ እውቅና።",
      required: true,
    },
    {
      icon: <Phone size={20} className="text-cyan-600" />,
      nameEn: "Registered Phone Number",
      nameAm: "የተመዘገበ ስልክ ቁጥር",
      claims: "phone_number",
      purposeEn: "Two-factor SMS OTP authentication, emergency contact, and race updates.",
      purposeAm: "ለኤስኤምኤስ (SMS) ማረጋገጫ ኮድ፣ ለአስቸኳይ ጊዜ ጥሪ እና የውድድር መረጃ።",
      required: true,
    },
    {
      icon: <Mail size={20} className="text-blue-600" />,
      nameEn: "Registered Email Address",
      nameAm: "የተመዘገበ ኢሜይል አድራሻ",
      claims: "email",
      purposeEn: "Digital license delivery, anti-doping compliance notices, and portal login.",
      purposeAm: "የዲጂታል ፈቃድ ሰነድ ለመላክ እና የፀረ-ዶፒንግ መረጃዎችን ለማድረስ።",
      required: false,
    },
    {
      icon: <MapPin size={20} className="text-teal-600" />,
      nameEn: "Residential Address & Region",
      nameAm: "የመኖሪያ አድራሻ እና ክልል",
      claims: "address (Region, Zone, Woreda)",
      purposeEn: "Regional athletics delegation quotas and national championships seeding.",
      purposeAm: "ለክልል አትሌቲክስ ፌዴሬሽን ውክልና እና የብሔራዊ ሻምፒዮና ምደባ።",
      required: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ethiopian Flag Tricolor Accent Line */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#009A44]" />
          <div className="flex-1 bg-[#FED100]" />
          <div className="flex-1 bg-[#EF3340]" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  VeriFayda 2.0 (eSignet)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800">
                  Proclamation No. 1284/2023
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === "EN"
                  ? "Fayda Data Disclosure & Consent Authorization"
                  : "የፋይዳ ዲጂታል መታወቂያ መረጃ ይፋ ማድረጊያ እና የስምምነት ፈቃድ"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {lang === "EN"
                  ? "National ID Program (NIDP) · Ethiopian Athletics Federation (EAF)"
                  : "የብሔራዊ መታወቂያ ፕሮግራም · የኢትዮጵያ አትሌቲክስ ፌዴሬሽን"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "EN" ? "AM" : "EN")}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="Toggle Language / ቋንቋ ቀይር"
            >
              <Languages size={14} />
              {lang === "EN" ? "አማርኛ" : "English"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Statutory Notice */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200">
            <div className="flex items-start gap-3">
              <FileText size={18} className="text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold block text-sky-950 dark:text-sky-100 text-sm mb-1">
                  {lang === "EN"
                    ? "Mandatory Digital Identity Consent Notice"
                    : "ህጋዊ የዲጂታል መታወቂያ መረጃ ፈቃድ ማስታወቂያ"}
                </strong>
                {lang === "EN" ? (
                  <>
                    Under <strong>Federal Proclamation No. 1284/2023</strong> (Digital Identification Proclamation) and Ethiopian Athletics Federation licensing regulations, your explicit consent is required before accessing your verified identity attributes. Clicking proceed will redirect your browser to the official <strong>Fayda eSignet</strong> authentication gateway.
                  </>
                ) : (
                  <>
                    በኢትዮጵያ <strong>አዋጅ ቁጥር 1284/2015</strong> (የዲጂታል መታወቂያ አዋጅ) እና በኢትዮጵያ አትሌቲክስ ፌዴሬሽን መመሪያ መሰረት፣ የተረጋገጠውን የፋይዳ መረጃዎን ለመውሰድ የእርስዎ ግልጽ ፈቃድ ያስፈልጋል። በመቀጠል ወደ ይፋዊው <strong>Fayda eSignet</strong> መግቢያ ገጽ ይዛወራሉ።
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Requested Data Attributes List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === "EN"
                  ? "Personal Data Attributes Requested From Fayda:"
                  : "ከፋይዳ የሚወሰዱ የግል መረጃዎች ዝርዝር፡"}
              </h4>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {dataAttributes.length} Attributes Disclosed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {dataAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-3 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mt-0.5">
                    {attr.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {lang === "EN" ? attr.nameEn : attr.nameAm}
                      </span>
                      {attr.required && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1 truncate">
                      Claims: {attr.claims}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {lang === "EN" ? attr.purposeEn : attr.purposeAm}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Cryptographic Safeguards */}
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>
                {lang === "EN"
                  ? "Cryptographic Privacy & Protection Guarantee"
                  : "የመረጃ ደህንነት እና ጥበቃ ዋስትና"}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
              <li>
                {lang === "EN"
                  ? "Raw biometric templates (fingerprint/iris) are NEVER accessed, transmitted, or stored."
                  : "የጣት አሻራ ወይም የአይን ባዮሜትሪክ መረጃዎች በፍጹም አይወሰዱም ወይም አይቀመጡም።"}
              </li>
              <li>
                {lang === "EN"
                  ? "Data transfer is secured with RS256 cryptographic signatures directly issued by NIDP."
                  : "የመረጃ ልውውጡ በብሔራዊ መታወቂያ ፕሮግራም በRS256 ዲጂታል ፊርማ የተጠበቀ ነው።"}
              </li>
              <li>
                {lang === "EN"
                  ? "Data is used strictly for EAF athlete licensing, anti-doping integrity, and competition eligibility."
                  : "መረጃው የሚያገለግለው ለአትሌት ፈቃድ፣ ለፀረ-ዶፒንግ ቁጥጥር እና ለውድድር ብቃት ብቻ ነው።"}
              </li>
            </ul>
          </div>

          {/* Explicit Consent Agreement Checkbox */}
          <label
            className="flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all select-none"
            style={{
              borderColor: hasAgreed ? "#0284C7" : "#CBD5E1",
              background: hasAgreed ? "rgba(2, 132, 199, 0.05)" : "transparent",
            }}
          >
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
              {lang === "EN" ? (
                <>
                  I have reviewed the disclosed personal attributes above. I hereby give my free, informed, and explicit consent for the Ethiopian Athletics Federation (EAF) to retrieve and verify my National ID record via the VeriFayda 2.0 (eSignet) service.
                </>
              ) : (
                <>
                  ከላይ የተዘረዘሩትን የግል መረጃዎች አንብቤያለሁ። የኢትዮጵያ አትሌቲክስ ፌዴሬሽን የብሔራዊ መታወቂያ መረጃዬን በይፋዊው VeriFayda 2.0 (eSignet) በኩል ወስዶ እንዲያረጋግጥ በነጻ ፈቃዴ ተስማምቻለሁ።
                </>
              )}
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === "EN" ? "Decline / Cancel" : "ይቅር / ተመለስ"}
          </button>

          <button
            type="button"
            disabled={!hasAgreed || isLaunching}
            onClick={onConsent}
            className="px-6 py-3 rounded-xl font-black text-xs text-white shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: hasAgreed
                ? "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)"
                : "#94A3B8",
            }}
          >
            {isLaunching ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                {lang === "EN" ? "Connecting to Fayda Portal..." : "ወደ ፋይዳ በመገናኘት ላይ..."}
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {lang === "EN"
                  ? "I Consent & Proceed to Fayda Portal →"
                  : "ተስማምቻለሁ — ወደ ፋይዳ ገጽ ቀጥል →"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
