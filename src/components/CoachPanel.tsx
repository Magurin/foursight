"use client";

import { useEffect, useMemo, useState } from "react";
import { Board } from "./Board";
import { Brain, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { analyzeGame, CoachReport, type Label, labelColor } from "@/lib/engine/coach";
import type { CoachRequest, CoachResponse } from "@/lib/engine/coach.worker";
import { emptyGame, play, GameState } from "@/lib/engine/game";
import { useI18n } from "@/lib/i18n/context";
import type { TKey } from "@/lib/i18n/dictionary";

const LABEL_KEYS: Record<Label, TKey> = {
  Best: "coach.label.Best",
  Brilliant: "coach.label.Brilliant",
  Good: "coach.label.Good",
  Book: "coach.label.Book",
  Inaccuracy: "coach.label.Inaccuracy",
  Mistake: "coach.label.Mistake",
  Blunder: "coach.label.Blunder",
  "Missed win": "coach.label.MissedWin",
  Forced: "coach.label.Forced",
};

interface Props {
  moves: number[];
  firstPlayer: 1 | 2;
  // Optional label (e.g. "vs AI (hard)" or "Local match")
  meta?: string;
}

export function CoachPanel({ moves, firstPlayer, meta }: Props) {
  const { t, locale } = useI18n();
  const [report, setReport] = useState<CoachReport | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [activePly, setActivePly] = useState(0);

  // Reconstruct board state at every ply for the stepper.
  const states = useMemo<GameState[]>(() => {
    const out: GameState[] = [emptyGame(firstPlayer)];
    let s = out[0];
    for (const c of moves) {
      const n = play(s, c);
      if (!n) break;
      s = n;
      out.push(s);
    }
    return out;
  }, [moves, firstPlayer]);

  useEffect(() => {
    let cancelled = false;
    setAnalyzing(true);

    // Try Web Worker; fall back to main-thread if unavailable (SSR / older browsers).
    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL("@/lib/engine/coach.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      worker = null;
    }

    if (worker) {
      worker.onmessage = (e: MessageEvent<CoachResponse>) => {
        if (cancelled) return;
        if (e.data.type === "report") {
          setReport(e.data.report);
          setAnalyzing(false);
          setActivePly(0);
        }
      };
      const req: CoachRequest = {
        moves,
        firstPlayer,
        depth: 6,
        timePerMoveMs: 200,
        locale,
      };
      worker.postMessage(req);
      return () => {
        cancelled = true;
        worker?.terminate();
      };
    }

    // Fallback: run on main thread, deferred so the spinner renders first.
    const timer = setTimeout(() => {
      const r = analyzeGame(moves, {
        firstPlayer,
        depth: 6,
        timePerMoveMs: 200,
        locale,
      });
      if (!cancelled) {
        setReport(r);
        setAnalyzing(false);
        setActivePly(0);
      }
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [moves, firstPlayer, locale]);

  const activeState = states[activePly] ?? states[0];
  const activeMove = report?.moves[activePly - 1];

  if (analyzing) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-3 text-sm text-zinc-500">
          {t("coach.analyzing", { n: moves.length })}
        </p>
      </div>
    );
  }
  if (!report) return null;

  const evalSeries = report.moves.map((m) => m.evalAfter);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <Brain className="h-3.5 w-3.5" />
              {t("coach.kicker")}
              {meta ? <span className="text-zinc-400">· {meta}</span> : null}
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {activePly === 0
                ? t("coach.move.start")
                : t("coach.move.title", {
                    n: activePly,
                    color: activeMove
                      ? t(activeMove.player === 1 ? "coach.color.yellow" : "coach.color.red")
                      : "",
                    col: activeMove ? activeMove.col + 1 : "",
                  })}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Previous move"
              onClick={() => setActivePly((p) => Math.max(0, p - 1))}
              disabled={activePly === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next move"
              onClick={() =>
                setActivePly((p) => Math.min(report.moves.length, p + 1))
              }
              disabled={activePly === report.moves.length}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Board
          state={activeState}
          disabled
          showHint={activeMove?.bestCol !== activeMove?.col ? activeMove?.bestCol : null}
        />

        {activeMove && (
          <div className="mt-4 min-h-[92px] rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <span
                className={
                  "rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset " +
                  labelColor(activeMove.label).bg +
                  " " +
                  labelColor(activeMove.label).text +
                  " " +
                  labelColor(activeMove.label).ring
                }
              >
                {t(LABEL_KEYS[activeMove.label])}
              </span>
              <span className="text-xs text-zinc-500">
                {t("coach.evalLabel")}: {formatEval(activeMove.evalAfter)}
                {activeMove.bestCol !== activeMove.col && (
                  <> · {t("coach.suggested", { col: activeMove.bestCol + 1 })}</>
                )}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
              {activeMove.explanation}
            </p>
          </div>
        )}

        <EvalGraph series={evalSeries} activePly={activePly} onSeek={setActivePly} />
      </div>

      <aside className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">{t("coach.summary")}</h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <PlayerSummary name={t("coach.color.yellow")} stats={report.summary.player1} />
          <PlayerSummary name={t("coach.color.red")} stats={report.summary.player2} />
        </div>

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("coach.moveList")}
        </h4>
        <ol className="mt-2 max-h-[420px] space-y-1 overflow-auto pr-1">
          {report.moves.map((m, i) => {
            const lc = labelColor(m.label);
            const active = activePly === i + 1;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActivePly(i + 1)}
                  className={
                    "flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition " +
                    (active
                      ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-500/10"
                      : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800")
                  }
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-zinc-400">{i + 1}.</span>
                    <span
                      className={
                        "inline-block h-2 w-2 rounded-full " +
                        (m.player === 1 ? "bg-amber-400" : "bg-rose-500")
                      }
                    />
                    <span className="font-medium">{m.col + 1}</span>
                  </span>
                  <span
                    className={
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset " +
                      lc.bg +
                      " " +
                      lc.text +
                      " " +
                      lc.ring
                    }
                  >
                    {t(LABEL_KEYS[m.label])}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}

function PlayerSummary({
  name,
  stats,
}: {
  name: string;
  stats: { blunders: number; mistakes: number; inaccuracies: number; bestPct: number };
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="text-xs font-semibold">{name}</div>
      <dl className="mt-1 space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-300">
        <Row label={t("coach.stat.best")} value={`${stats.bestPct}%`} />
        <Row label={t("coach.stat.inaccuracies")} value={stats.inaccuracies} />
        <Row label={t("coach.stat.mistakes")} value={stats.mistakes} />
        <Row label={t("coach.stat.blunders")} value={stats.blunders} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function formatEval(s: number): string {
  if (s > 18) return "+M";
  if (s < -18) return "-M";
  if (s === 0) return "≈ 0";
  return (s > 0 ? "+" : "") + s.toString();
}

function EvalGraph({
  series,
  activePly,
  onSeek,
}: {
  series: number[];
  activePly: number;
  onSeek: (p: number) => void;
}) {
  if (series.length === 0) return null;
  const H = 80; // px, fixed height of the chart
  const max = Math.max(20, ...series.map((s) => Math.abs(s)));
  // x as a 0–100 percentage so the line stretches to fill the width; y in px.
  const pts = series.map((s, i) => {
    const x = ((i + 0.5) / series.length) * 100;
    const y = H / 2 - (s / max) * (H / 2 - 8);
    return { x, y };
  });
  // The SVG uses preserveAspectRatio="none" — fine for the line, but it would
  // distort circles into ovals, so the dots are HTML overlays instead.
  const path = pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  return (
    <div className="relative mt-4 w-full" style={{ height: H }}>
      <svg
        viewBox={`0 0 100 ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-zinc-400 dark:text-zinc-500"
      >
        <line x1={0} x2={100} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity={0.2} />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.8}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {pts.map((p, i) => {
        const active = activePly === i + 1;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Move ${i + 1}`}
            onClick={() => onSeek(i + 1)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full ring-2 ring-white transition-transform hover:scale-125 dark:ring-zinc-900"
            style={{
              left: `${p.x}%`,
              top: p.y,
              width: active ? 11 : 7,
              height: active ? 11 : 7,
              backgroundColor: series[i] >= 0 ? "#f59e0b" : "#f43f5e",
            }}
          />
        );
      })}
    </div>
  );
}
