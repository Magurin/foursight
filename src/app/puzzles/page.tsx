"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Board } from "@/components/Board";
import { PUZZLES, type Puzzle, TAG_KEYS, puzzleOfTheDay } from "@/lib/puzzles/positions";
import { emptyGame, play, GameState } from "@/lib/engine/game";
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  Maximize2,
  Minimize2,
  Puzzle as PuzzleIcon,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Outcome = "pending" | "correct" | "wrong";

interface PuzzleStats {
  solved: string[]; // puzzle ids solved
  streak: number;
  best: number;
}

const STATS_KEY = "foursight.puzzles.stats";

function loadStats(): PuzzleStats {
  if (typeof window === "undefined") return { solved: [], streak: 0, best: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { solved: [], streak: 0, best: 0 };
    return JSON.parse(raw) as PuzzleStats;
  } catch {
    return { solved: [], streak: 0, best: 0 };
  }
}

function saveStats(s: PuzzleStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

const DIFFICULTY_TONE: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  2: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  3: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
};

export default function PuzzlesPage() {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<Puzzle | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("pending");
  const [stats, setStats] = useState<PuzzleStats>({ solved: [], streak: 0, best: 0 });
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  // Reset solve state (and leave fullscreen) whenever a new puzzle is opened.
  useEffect(() => {
    setOutcome("pending");
    setSelectedCol(null);
    setFocus(false);
  }, [active]);

  const toggleFocus = useCallback(() => {
    setFocus((v) => {
      const next = !v;
      try {
        if (next) document.documentElement.requestFullscreen?.();
        else if (document.fullscreenElement) document.exitFullscreen?.();
      } catch {
        /* fullscreen API unavailable — CSS overlay still works */
      }
      return next;
    });
  }, []);

  // Esc exits focus; keep state in sync if the user leaves native fullscreen.
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(false);
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) setFocus(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [focus]);

  const initialState = useMemo<GameState>(() => {
    if (!active) return emptyGame(1);
    let s = emptyGame(active.firstPlayer);
    for (const c of active.setup) {
      const n = play(s, c);
      if (!n) break;
      s = n;
    }
    return s;
  }, [active]);

  const stateAfter = useMemo<GameState>(() => {
    if (selectedCol === null) return initialState;
    return play(initialState, selectedCol) ?? initialState;
  }, [initialState, selectedCol]);

  const onDrop = useCallback(
    (col: number) => {
      if (!active || outcome !== "pending") return;
      setSelectedCol(col);
      if (col === active.solution) {
        setOutcome("correct");
        setStats((prev) => {
          if (prev.solved.includes(active.id)) return prev;
          const streak = prev.streak + 1;
          const next: PuzzleStats = {
            solved: [...prev.solved, active.id],
            streak,
            best: Math.max(prev.best, streak),
          };
          saveStats(next);
          return next;
        });
      } else {
        setOutcome("wrong");
        setStats((prev) => {
          const next: PuzzleStats = { ...prev, streak: 0 };
          saveStats(next);
          return next;
        });
      }
    },
    [active, outcome],
  );

  const nextPuzzle = useCallback(() => {
    if (!active) return;
    const pool = PUZZLES.filter(
      (p) => p.difficulty === active.difficulty && p.id !== active.id,
    );
    const choice = (pool.length ? pool : PUZZLES.filter((p) => p.id !== active.id))[
      Math.floor(Math.random() * (pool.length ? pool.length : PUZZLES.length - 1))
    ];
    setActive(choice ?? active);
  }, [active]);

  const retry = useCallback(() => {
    setOutcome("pending");
    setSelectedCol(null);
  }, []);

  // ── Library view ───────────────────────────────────────────────
  if (!active) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("puzzles.title")}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {t("puzzles.subtitle")}
              </p>
            </div>
            <StreakBadge stats={stats} />
          </div>

          <FeaturedCard
            puzzle={puzzleOfTheDay()}
            solved={stats.solved}
            onPlay={setActive}
          />

          {([1, 2, 3] as const).map((level) => {
            const items = PUZZLES.filter((p) => p.difficulty === level);
            if (items.length === 0) return null;
            const done = items.filter((p) => stats.solved.includes(p.id)).length;
            return (
              <section key={level} className="mt-8">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold " +
                      DIFFICULTY_TONE[level]
                    }
                  >
                    {"★".repeat(level)}
                  </span>
                  <h2 className="text-base font-semibold">
                    {t(
                      level === 1
                        ? "puzzles.difficulty.easy"
                        : level === 2
                          ? "puzzles.difficulty.medium"
                          : "puzzles.difficulty.hard",
                    )}
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {t("puzzles.sectionProgress", { done, total: items.length })}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <PuzzleCard
                      key={p.id}
                      puzzle={p}
                      solved={stats.solved.includes(p.id)}
                      onPlay={setActive}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </>
    );
  }

  // ── Solve view ─────────────────────────────────────────────────
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" /> {t("puzzles.back")}
        </button>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <PuzzleIcon className="h-3.5 w-3.5" />
              {t(TAG_KEYS[active.tag])}
              <span
                className={"rounded px-1.5 py-0.5 text-[10px] " + DIFFICULTY_TONE[active.difficulty]}
              >
                {"★".repeat(active.difficulty)}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{active.prompt[locale]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StreakBadge stats={stats} />
            <button
              type="button"
              onClick={toggleFocus}
              aria-label={t("game.button.fullscreen")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("game.button.fullscreen")}</span>
            </button>
          </div>
        </div>

        <FeedbackBanner
          outcome={outcome}
          explanation={active.explanation[locale]}
          solution={active.solution}
        />

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <Board
            state={stateAfter}
            onDrop={onDrop}
            disabled={outcome !== "pending"}
            showHint={outcome === "wrong" ? active.solution : null}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {outcome === "wrong" && (
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("puzzles.button.tryAgain")}
            </button>
          )}
          {outcome !== "pending" && (
            <button
              type="button"
              onClick={nextPuzzle}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {t("puzzles.button.next")}
            </button>
          )}
        </div>
      </main>

      {focus && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <PuzzleIcon className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate font-medium">{active.prompt[locale]}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {outcome === "wrong" && (
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t("puzzles.button.tryAgain")}
                </button>
              )}
              {outcome !== "pending" && (
                <button
                  type="button"
                  onClick={nextPuzzle}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  {t("puzzles.button.next")}
                </button>
              )}
              <button
                type="button"
                onClick={toggleFocus}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("game.button.exitFullscreen")}</span>
              </button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-2xl px-4">
            <FeedbackBanner
              outcome={outcome}
              explanation={active.explanation[locale]}
              solution={active.solution}
            />
          </div>
          <div className="flex flex-1 items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Board
              state={stateAfter}
              onDrop={onDrop}
              disabled={outcome !== "pending"}
              showHint={outcome === "wrong" ? active.solution : null}
              widthClassName="max-w-[min(92vw,76vh)]"
            />
          </div>
        </div>
      )}
    </>
  );
}

function FeaturedCard({
  puzzle,
  solved,
  onPlay,
}: {
  puzzle: Puzzle;
  solved: string[];
  onPlay: (p: Puzzle) => void;
}) {
  const { t, locale } = useI18n();
  const isSolved = solved.includes(puzzle.id);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/40">
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-200/30 via-rose-200/20 to-indigo-200/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-amber-500/10 dark:via-rose-500/10 dark:to-indigo-500/15" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            {t("puzzles.kicker.day")}
            {isSolved && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          </div>
          <h2 className="mt-2 max-w-lg text-xl font-semibold tracking-tight">
            {puzzle.prompt[locale]}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span>{t(TAG_KEYS[puzzle.tag])}</span>
            <span className={"rounded px-1.5 py-0.5 " + DIFFICULTY_TONE[puzzle.difficulty]}>
              {"★".repeat(puzzle.difficulty)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPlay(puzzle)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          {t("puzzles.featuredCta")}
        </button>
      </div>
    </div>
  );
}

function PuzzleCard({
  puzzle,
  solved,
  onPlay,
}: {
  puzzle: Puzzle;
  solved: boolean;
  onPlay: (p: Puzzle) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onPlay(puzzle)}
      className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <PuzzleIcon className="h-3.5 w-3.5" />
          {t(TAG_KEYS[puzzle.tag])}
        </span>
        {solved ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {t("puzzles.doneBadge")}
          </span>
        ) : (
          <span className={"rounded px-1.5 py-0.5 text-[10px] " + DIFFICULTY_TONE[puzzle.difficulty]}>
            {"★".repeat(puzzle.difficulty)}
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
        {puzzle.prompt[locale]}
      </p>
      <span className="mt-3 text-xs font-medium text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
        {t("puzzles.play")} →
      </span>
    </button>
  );
}

function StreakBadge({ stats }: { stats: PuzzleStats }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="font-semibold">{stats.streak}</span>
        <span className="text-zinc-500">{t("puzzles.streak")}</span>
      </div>
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center gap-1">
        <span className="font-semibold">{stats.solved.length}</span>
        <span className="text-zinc-500">{t("puzzles.solved")}</span>
      </div>
    </div>
  );
}

function FeedbackBanner({
  outcome,
  explanation,
  solution,
}: {
  outcome: Outcome;
  explanation: string;
  solution: number;
}) {
  const { t } = useI18n();
  if (outcome === "correct") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-semibold">{t("puzzles.feedback.correct")}</div>
          <div className="mt-0.5 text-emerald-800 dark:text-emerald-300">{explanation}</div>
        </div>
      </div>
    );
  }
  if (outcome === "wrong") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-semibold">{t("puzzles.feedback.wrong", { col: solution + 1 })}</div>
          <div className="mt-0.5 text-rose-800 dark:text-rose-300">{explanation}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      {t("puzzles.feedback.idle")}
    </div>
  );
}
