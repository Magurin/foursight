"use client";

import { useT } from "@/lib/i18n/context";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
      {t("landing.footer")}
    </footer>
  );
}
