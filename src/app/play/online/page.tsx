"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Globe, Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { generateRoomCode } from "@/lib/hooks/use-guest-id";
import { useT } from "@/lib/i18n/context";

export default function OnlinePage() {
  const t = useT();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
          <Globe className="mx-auto h-10 w-10 text-indigo-500" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {t("online.placeholder.needSupabase")}
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {t("online.placeholder.needSupabaseBody")}
          </p>
        </main>
      </>
    );
  }

  const createRoom = () => {
    setCreating(true);
    const c = generateRoomCode();
    router.push(`/play/online/${c}?host=1`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length === 0) return;
    router.push(`/play/online/${c}`);
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-indigo-500" />
          <h1 className="text-3xl font-semibold tracking-tight">{t("online.title")}</h1>
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t("online.subtitle")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">{t("online.create.title")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("online.create.body")}</p>
            <button
              type="button"
              onClick={createRoom}
              disabled={creating}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("online.create.button")}
            </button>
          </div>

          <form
            onSubmit={joinRoom}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-sm font-semibold">{t("online.join.title")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("online.join.body")}</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC123"
              maxLength={8}
              className="mt-4 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-center font-mono text-sm uppercase tracking-widest dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {t("online.join.button")}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
