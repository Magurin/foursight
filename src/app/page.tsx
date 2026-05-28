"use client";

import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Brain, Check, Puzzle, Sparkles, Swords, Trophy, X, Zap } from "lucide-react";
import { useT } from "@/lib/i18n/context";

export default function Home() {
  const t = useT();
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <Brain className="h-3.5 w-3.5" />
                {t("landing.badge")}
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
                {t("landing.title.line1")}
                <span className="block bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
                  {t("landing.title.line2")}
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
                {t("landing.subtitle")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Swords className="h-4 w-4" />
                  {t("landing.cta.playNow")}
                </Link>
                <Link
                  href="/coach"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Brain className="h-4 w-4" />
                  {t("landing.cta.seeCoach")}
                </Link>
              </div>
              <p className="mt-6 text-xs text-zinc-500">{t("landing.cta.note")}</p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-indigo-200/40 blur-2xl dark:from-amber-500/10 dark:via-rose-500/10 dark:to-indigo-500/10" />
              <div className="relative rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
                <PreviewBoard />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-auto-flow:dense]">
            {/* Featured tile — analysis */}
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40 dark:hover:shadow-indigo-500/20 lg:col-span-2 lg:row-span-2">
              <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-amber-200/30 via-rose-200/20 to-indigo-200/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-amber-500/10 dark:via-rose-500/10 dark:to-indigo-500/15" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {t("landing.feature.analysis.title")}
                  </span>
                </div>
                <p className="mt-4 max-w-md text-lg text-zinc-700 dark:text-zinc-200">
                  {t("landing.feature.analysis.body")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t("landing.hero.evalBest")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {t("landing.hero.evalInaccuracy")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {t("landing.hero.evalBlunder")}
                  </span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-8">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                      {t("landing.hero.depthCaption")}
                    </div>
                    <div className="text-sm text-zinc-500">{t("landing.hero.depthLabel")}</div>
                  </div>
                  <span className="bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 bg-clip-text text-6xl font-bold leading-none tracking-tight text-transparent sm:text-7xl">
                    {t("landing.hero.depthValue")}
                  </span>
                </div>
              </div>
            </div>

            <Feature
              icon={<Swords className="h-5 w-5" />}
              tone="bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
              title={t("landing.feature.opponents.title")}
              body={t("landing.feature.opponents.body")}
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              tone="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
              title={t("landing.feature.online.title")}
              body={t("landing.feature.online.body")}
            />
            <Feature
              icon={<Trophy className="h-5 w-5" />}
              tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              title={t("landing.feature.ratings.title")}
              body={t("landing.feature.ratings.body")}
              horizontal
              className="lg:col-span-2"
            />
            <Feature
              icon={<Brain className="h-5 w-5" />}
              tone="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
              title={t("landing.feature.hints.title")}
              body={t("landing.feature.hints.body")}
            />
            <Feature
              icon={<Puzzle className="h-5 w-5" />}
              tone="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
              title={t("landing.feature.puzzles.title")}
              body={t("landing.feature.puzzles.body")}
              horizontal
              className="lg:col-span-3"
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("landing.pro.title")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-zinc-600 dark:text-zinc-300">
              {t("landing.pro.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2">
            {/* Free plan */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t("landing.pro.free.name")}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {t("landing.pro.free.price")}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                <PlanRow ok label={t("landing.pro.free.f1")} />
                <PlanRow ok label={t("landing.pro.free.f2")} />
                <PlanRow ok label={t("landing.pro.free.f3")} />
                <PlanRow label={t("landing.pro.free.f4neg")} />
                <PlanRow label={t("landing.pro.free.f5neg")} />
              </ul>
              <Link
                href="/play"
                className="mt-6 inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("landing.pro.free.cta")}
              </Link>
            </div>

            {/* Pro plan — highlighted */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/20 dark:bg-zinc-900 [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(135deg,theme(colors.amber.400),theme(colors.rose.500))_border-box] dark:[background:linear-gradient(theme(colors.zinc.900),theme(colors.zinc.900))_padding-box,linear-gradient(135deg,theme(colors.amber.400),theme(colors.rose.500))_border-box]">
              <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3" />
                {t("landing.pro.popular")}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-transparent bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text">
                {t("landing.pro.pro.name")}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {t("landing.pro.pro.price")}
                </span>
                <span className="text-sm text-zinc-500">{t("landing.pro.period")}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                <PlanRow ok strong label={t("pro.feat.depth")} />
                <PlanRow ok strong label={t("pro.feat.book")} />
                <PlanRow ok strong label={t("pro.feat.history")} />
                <PlanRow ok strong label={t("pro.feat.themes")} />
                <PlanRow ok strong label={t("pro.feat.prose")} />
              </ul>
              <Link
                href="/pro"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {t("landing.pro.cta")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function PlanRow({
  label,
  ok,
  strong,
}: {
  label: string;
  ok?: boolean;
  strong?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
      ) : (
        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
      )}
      <span
        className={
          ok
            ? strong
              ? "font-medium text-zinc-900 dark:text-zinc-100"
              : "text-zinc-700 dark:text-zinc-200"
            : "text-zinc-400 line-through dark:text-zinc-500"
        }
      >
        {label}
      </span>
    </li>
  );
}

function Feature({
  icon,
  title,
  body,
  tone = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  className = "",
  horizontal = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: string;
  className?: string;
  horizontal?: boolean;
}) {
  return (
    <div
      className={`h-full rounded-xl border border-zinc-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 ${horizontal ? "flex items-center" : ""} ${className}`}
    >
      <div className={horizontal ? "flex items-start gap-4" : ""}>
        <div
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </div>
        <div>
          <h3 className={`${horizontal ? "" : "mt-3"} text-base font-semibold`}>
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{body}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewBoard() {
  const cells: (0 | 1 | 2)[][] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 2, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 0, 0],
    [0, 1, 2, 1, 1, 1, 0],
  ];
  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-3">
      <div className="grid grid-cols-7 gap-1.5">
        {cells.flat().map((v, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-full bg-indigo-950/40 ring-1 ring-inset ring-indigo-300/10"
          >
            {v !== 0 && (
              <div
                className={
                  "absolute inset-[6%] rounded-full " +
                  (v === 1
                    ? "bg-gradient-to-br from-amber-300 to-amber-500"
                    : "bg-gradient-to-br from-rose-400 to-rose-600")
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
