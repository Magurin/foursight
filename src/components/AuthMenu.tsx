"use client";

import Link from "next/link";
import { Coins, LogOut, User as UserIcon } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useT } from "@/lib/i18n/context";

export function AuthMenu() {
  const { user, profile, loading } = useUser();
  const t = useT();

  if (!isSupabaseConfigured) {
    return (
      <span
        title="Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to enable accounts"
        className="hidden text-xs text-zinc-400 sm:inline"
      >
        {t("nav.guestMode")}
      </span>
    );
  }

  if (loading) return <span className="h-9 w-20" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {t("nav.signIn")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/shop"
        title={t("nav.shop")}
        className="hidden items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20 sm:inline-flex"
      >
        <Coins className="h-3.5 w-3.5" />
        {profile?.coins ?? 0}
      </Link>
      <Link
        href="/history"
        className="hidden items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:inline-flex"
      >
        <UserIcon className="h-3.5 w-3.5" />
        {profile?.username ?? t("nav.account")}
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
          {profile?.elo_pve ?? 0}
        </span>
      </Link>
      <button
        type="button"
        aria-label={t("nav.signOut")}
        onClick={async () => {
          await getBrowserSupabase()?.auth.signOut();
          window.location.href = "/";
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
