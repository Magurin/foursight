"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { useUser } from "@/lib/hooks/use-user";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { User as UserIcon } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { USERNAME_RE, emailLocalPart, needsUsername } from "@/lib/username";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <>
          <NavBar />
          <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12" />
        </>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { user, profile, loading } = useUser();

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Send people who don't belong here away.
  useEffect(() => {
    if (loading) return;
    if (!isSupabaseConfigured) {
      router.replace("/");
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile && !needsUsername(profile.username, user.email)) {
      router.replace(next);
    }
  }, [loading, user, profile, next, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!USERNAME_RE.test(name)) {
      setError(t("onboarding.error.format"));
      return;
    }
    const local = emailLocalPart(user?.email);
    if (local && name.toLowerCase() === local.toLowerCase()) {
      setError(t("onboarding.error.email"));
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setSaving(true);
    setError(null);
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ username: name })
      .eq("id", user.id);
    if (dbError) {
      setSaving(false);
      setError(dbError.code === "23505" ? t("onboarding.error.taken") : t("onboarding.error.generic"));
      return;
    }
    // Full reload so every hook re-reads the fresh profile (and the gate clears).
    window.location.assign(next);
  };

  if (loading || !user || (profile && !needsUsername(profile.username, user.email))) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12" />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          <UserIcon className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t("onboarding.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("onboarding.subtitle")}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t("onboarding.label")}
            </span>
            <input
              type="text"
              required
              autoFocus
              value={value}
              maxLength={20}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("onboarding.placeholder")}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <p className="text-xs text-zinc-500">{t("onboarding.hint")}</p>
          {error && (
            <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? t("onboarding.saving") : t("onboarding.save")}
          </button>
        </form>
      </main>
    </>
  );
}
