"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Bot, Globe, Users } from "lucide-react";
import { useT } from "@/lib/i18n/context";

type Accent = "amber" | "indigo" | "emerald";

// Full static class strings per accent (Tailwind can't compile dynamic names).
const ACCENT: Record<
  Accent,
  { icon: string; glow: string; border: string; arrow: string }
> = {
  amber: {
    icon: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    glow: "hover:shadow-[0_18px_50px_-14px_rgba(245,158,11,0.55)] hover:border-amber-300 dark:hover:border-amber-500/50",
    border: "before:from-amber-400 before:to-orange-500",
    arrow: "text-amber-600 dark:text-amber-400",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
    glow: "hover:shadow-[0_18px_50px_-14px_rgba(99,102,241,0.55)] hover:border-indigo-300 dark:hover:border-indigo-500/50",
    border: "before:from-indigo-500 before:to-violet-600",
    arrow: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-400 to-teal-600 text-white",
    glow: "hover:shadow-[0_18px_50px_-14px_rgba(16,185,129,0.55)] hover:border-emerald-300 dark:hover:border-emerald-500/50",
    border: "before:from-emerald-400 before:to-teal-600",
    arrow: "text-emerald-600 dark:text-emerald-400",
  },
};

export default function PlayIndexPage() {
  const t = useT();
  return (
    <>
      <NavBar />
      {/* Center the picker vertically in the remaining viewport on desktop. */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("play.picker.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600 dark:text-zinc-300 sm:mx-0">
            {t("play.picker.subtitle")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <ModeCard
            href="/play/local"
            accent="amber"
            icon={<Users className="h-6 w-6" />}
            title={t("play.picker.hotSeat.title")}
            body={t("play.picker.hotSeat.body")}
            cta={t("play.picker.linkPlay")}
          />
          <ModeCard
            href="/play/ai"
            accent="indigo"
            icon={<Bot className="h-6 w-6" />}
            title={t("play.picker.ai.title")}
            body={t("play.picker.ai.body")}
            cta={t("play.picker.linkPlay")}
          />
          <ModeCard
            href="/play/online"
            accent="emerald"
            icon={<Globe className="h-6 w-6" />}
            title={t("play.picker.online.title")}
            body={t("play.picker.online.body")}
            cta={t("play.picker.linkPlay")}
          />
        </div>
      </main>
    </>
  );
}

function ModeCard({
  href,
  accent,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  accent: Accent;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  const a = ACCENT[accent];
  return (
    <Link
      href={href}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 transition-all duration-300",
        "hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900",
        "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        a.border,
        a.glow,
      ].join(" ")}
    >
      <div
        className={
          "inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 " +
          a.icon
        }
      >
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {body}
      </p>
      <span
        className={
          "mt-5 inline-flex items-center gap-1 text-sm font-semibold " + a.arrow
        }
      >
        {cta.replace("→", "").trim()}
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
