"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Locale,
  SUPPORTED_LOCALES,
  TKey,
  translate,
} from "./dictionary";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
  // True once we've read the user's preferred locale from storage / navigator.
  // Components that need to avoid hydration mismatches gate translated text
  // behind this flag.
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "foursight.locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const browser = navigator.language?.toLowerCase() ?? "";
  if (browser.startsWith("ru")) return "ru";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // SSR + first client paint use "en" to avoid hydration mismatches. The
  // useEffect below swaps to the detected locale once mounted.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    // Reflect on <html lang> for a11y.
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  // Sync <html lang> when locale changes.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      ready,
    }),
    [locale, setLocale, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Allow components used outside the provider (e.g. unit tests) to fall
    // back to English without crashing.
    return {
      locale: "en",
      setLocale: () => {},
      t: (key, params) => translate("en", key, params),
      ready: false,
    };
  }
  return ctx;
}

// Convenience hook returning just the translator.
export function useT() {
  return useI18n().t;
}
