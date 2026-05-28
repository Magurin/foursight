"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { CoachPanel } from "@/components/CoachPanel";
import { useGameStore } from "@/lib/store/game-store";
import { Brain } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function CoachPage() {
  const last = useGameStore((s) => s.lastFinished);
  const { t, locale } = useI18n();

  if (!last || last.moves.length === 0) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <Brain className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t("coach.empty.title")}</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            {t("coach.empty.body")}{" "}
            <Link href="/play/ai" className="text-indigo-600 underline dark:text-indigo-400">
              {t("coach.empty.link")}
            </Link>
            .
          </p>
        </main>
      </>
    );
  }

  const meta =
    last.mode === "ai"
      ? t(`game.difficulty.${last.difficulty ?? "medium"}` as const)
      : last.mode === "online"
        ? t("play.picker.online.title")
        : t("play.picker.hotSeat.title");

  // Avoid stripping `locale` from the deps — we want re-render on language switch
  void locale;

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <CoachPanel moves={last.moves} firstPlayer={last.firstPlayer} meta={meta} />
      </main>
    </>
  );
}
