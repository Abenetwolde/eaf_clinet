import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from './en';
import { am } from './am';
import { or } from './or';
import { ti } from './ti';

export interface LanguageInfo {
  code: string;
  nativeName: string;
  short: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', nativeName: 'English', short: 'EN' },
  { code: 'am', nativeName: 'አማርኛ', short: 'አማ' },
  { code: 'or', nativeName: 'Afaan Oromoo', short: 'OR' },
  { code: 'ti', nativeName: 'ትግርኛ', short: 'ትግ' },
];

export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'eaf_language';

const translations: Record<string, Record<string, any>> = {
  en,
  am,
  or,
  ti,
};

export function translate(key: string, language: string = DEFAULT_LANGUAGE, params?: Record<string, unknown>): string {
  const langDict = translations[language] || translations[DEFAULT_LANGUAGE];
  let value = key.split('.').reduce((obj: any, part: string) => (obj ? obj[part] : undefined), langDict);
  if ((value === undefined || value === null) && language !== DEFAULT_LANGUAGE) {
    value = key.split('.').reduce((obj: any, part: string) => (obj ? obj[part] : undefined), translations[DEFAULT_LANGUAGE]);
  }
  const apply = (str: string) =>
    params
      ? String(str).replace(/\{(\w+)\}/g, (m, p) => (params[p] !== undefined ? String(params[p]) : m))
      : str;
  return value !== undefined && value !== null ? apply(String(value)) : key;
}

export interface I18nContextValue {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const LanguageContext = createContext<I18nContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    } catch {
      /* ignore */
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      /* ignore */
    }
  }, [language]);

  const setLanguage = (code: string) => {
    if (LANGUAGES.some((l) => l.code === code)) setLanguageState(code);
  };

  const value: I18nContextValue = {
    language,
    setLanguage,
    t: (key, params) => translate(key, language, params),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(LanguageContext);
}

export interface LanguageSelectorProps {
  variant?: 'default' | 'dark';
  style?: React.CSSProperties;
}

/* ── 4-Language Selector Component for Navigation Bars ── */
export function LanguageSelector({ variant = 'default', style }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const isDark = variant === 'dark';

  const baseBtn: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.12)' : '#F1F5F9',
    border: isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid #CBD5E1',
    color: isDark ? '#FFFFFF' : '#0F172A',
    padding: '6px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    ...style,
  };

  const menuBase: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
    borderRadius: '12px',
    boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
    padding: '6px',
    zIndex: 100,
    minWidth: '170px',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={baseBtn}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>🌐</span>
        <span>{current.nativeName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div role="listbox" style={menuBase}>
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isActive ? (isDark ? '#0284C7' : '#E0F2FE') : 'transparent',
                    color: isActive ? (isDark ? '#FFFFFF' : '#0284C7') : (isDark ? '#F1F5F9' : '#334155'),
                    fontWeight: isActive ? 800 : 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang.nativeName} ({lang.short})
                  </span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
