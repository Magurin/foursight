"use client";

import { useI18n } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { locale, setLocale, t, ready } = useI18n();
  const next = locale === "en" ? "ru" : "en";

  return (
    <button
      type="button"
      aria-label={t("nav.language.toggle")}
      onClick={() => setLocale(next)}
      className="inline-flex h-9 min-w-[40px] items-center justify-center rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {ready ? locale : "EN"}
    </button>
  );
}
