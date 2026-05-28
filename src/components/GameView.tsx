"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { useGameStore } from "@/lib/store/game-store";
import { status, toMove } from "@/lib/engine/game";
import { pickAIMove, solve } from "@/lib/engine/solver";
import { Bot, Lightbulb, Maximize2, Minimize2, RotateCcw, Undo2, Users, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/use-user";
import { useMatchPersistence } from "@/lib/hooks/use-match-persistence";
import { resolveSkins } from "@/lib/cosmetics";
import { useT } from "@/lib/i18n/context";

type Mode = "local" | "ai";

interface Props {
  mode: Mode;
  // Which side the human plays when mode = "ai". 1 = goes first (yellow).
  humanSide?: 1 | 2;
}

export function GameView({ mode, humanSide = 1 }: Props) {
  const t = useT();
  const state = useGameStore((s) => s.state);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const drop = useGameStore((s) => s.drop);
  const reset = useGameStore((s) => s.reset);
  const undoMove = useGameStore((s) => s.undo);
  const setMode = useGameStore((s) => s.setMode);
  const setHint = useGameStore((s) => s.setHint);
  const hint = useGameStore((s) => s.hint);

  const [aiThinking, setAiThinking] = useState(false);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const lastAiMoveAt = useRef<number>(0);
  const { user, profile } = useUser();
  // In AI mode the human's discs follow the "player" skin; in local 2-player
  // games side 1 is treated as "you".
  const skins = resolveSkins(profile, mode === "ai" ? humanSide : 1);
  useMatchPersistence({
    state,
    mode,
    difficulty,
    playerId: user?.id ?? null,
    humanSide,
  });

  useEffect(() => {
    setMode(mode);
    setHint(null);
  }, [mode, setMode, setHint]);

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

  const st = status(state);
  const turn = toMove(state);
  // Identifies a specific finished game so the modal reopens on each new result
  // but stays dismissed for the current one.
  const resultKey = `${st.kind}:${state.moves.length}`;

  // Drive the AI.
  useEffect(() => {
    if (mode !== "ai") return;
    if (st.kind !== "playing") return;
    if (turn === humanSide) return;
    setAiThinking(true);
    const timer = setTimeout(() => {
      const res = pickAIMove(state, difficulty);
      if (res.chosenCol >= 0) {
        drop(res.chosenCol);
      }
      lastAiMoveAt.current = Date.now();
      setAiThinking(false);
    }, 350); // small delay so UI shows the human's move first
    return () => {
      clearTimeout(timer);
      setAiThinking(false);
    };
  }, [mode, state, difficulty, drop, humanSide, st.kind, turn]);

  const onHint = useCallback(() => {
    if (st.kind !== "playing") return;
    const res = solve(state, 8, 800);
    setHint(res.bestCol);
    setTimeout(() => setHint(null), 2500);
  }, [state, st.kind, setHint]);

  // Block human input on AI's turn.
  const blocked = mode === "ai" && (turn !== humanSide || aiThinking);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {mode === "local" ? (
              <>
                <Users className="mr-1 inline h-3.5 w-3.5" /> {t("game.kicker.local")}
              </>
            ) : (
              <>
                <Bot className="mr-1 inline h-3.5 w-3.5" /> {t("game.kicker.ai")} · {t(`game.difficulty.${difficulty}` as const)}
              </>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {mode === "local" ? t("game.title.local") : t("game.title.ai")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === "ai" && (
            <select
              aria-label="Difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="easy">{t("game.difficulty.easy")}</option>
              <option value="medium">{t("game.difficulty.medium")}</option>
              <option value="hard">{t("game.difficulty.hard")}</option>
            </select>
          )}
          <button
            type="button"
            onClick={onHint}
            disabled={blocked || st.kind !== "playing"}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-40 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
          >
            <Lightbulb className="h-3.5 w-3.5" /> {t("game.button.hint")}
          </button>
          <button
            type="button"
            onClick={() => undoMove()}
            disabled={state.moves.length === 0 || aiThinking}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Undo2 className="h-3.5 w-3.5" /> {t("game.button.undo")}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {t("game.button.newGame")}
          </button>
          <button
            type="button"
            onClick={toggleFocus}
            aria-label={t("game.button.fullscreen")}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("game.button.fullscreen")}</span>
          </button>
        </div>
      </div>

      <StatusBanner status={st} turn={turn} aiThinking={aiThinking} mode={mode} humanSide={humanSide} />

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <Board state={state} onDrop={(c) => !blocked && drop(c)} disabled={blocked} showHint={hint} skins={skins} />
      </div>

      {focus && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  "inline-block h-3 w-3 rounded-full " +
                  (turn === 1 ? "bg-amber-400" : "bg-rose-500")
                }
              />
              <span className="font-medium">
                {st.kind !== "playing"
                  ? ""
                  : mode === "ai"
                    ? turn === humanSide
                      ? t("game.status.turn.you")
                      : aiThinking
                        ? t("game.status.turn.thinking")
                        : t("game.status.turn.engine")
                    : t("game.status.turn.local", { p: turn })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onHint}
                disabled={blocked || st.kind !== "playing"}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-40 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              >
                <Lightbulb className="h-3.5 w-3.5" /> {t("game.button.hint")}
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("game.button.newGame")}</span>
              </button>
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
          <div className="flex flex-1 items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Board
              state={state}
              onDrop={(c) => !blocked && drop(c)}
              disabled={blocked}
              showHint={hint}
              skins={skins}
              widthClassName="max-w-[min(92vw,76vh)]"
            />
          </div>
        </div>
      )}

      {st.kind !== "playing" && dismissedKey !== resultKey && (
        <ResultModal
          status={st}
          mode={mode}
          humanSide={humanSide}
          onPlayAgain={() => reset()}
          onClose={() => setDismissedKey(resultKey)}
        />
      )}
    </div>
  );
}

function ResultModal({
  status: st,
  mode,
  humanSide,
  onPlayAgain,
  onClose,
}: {
  status: Extract<ReturnType<typeof status>, { kind: "win" | "draw" }>;
  mode: Mode;
  humanSide: 1 | 2;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const isAIWin = mode === "ai" && st.kind === "win" && st.winner !== humanSide;
  const won = st.kind === "win" && !isAIWin;

  const title =
    st.kind === "draw"
      ? mode === "local"
        ? t("game.status.draw.local")
        : t("game.status.draw")
      : mode === "local"
        ? t("game.status.win.local", { p: st.winner })
        : isAIWin
          ? t("game.status.win.ai.loss")
          : t("game.status.win.ai.win");

  const accent = won
    ? "from-emerald-400 to-teal-500"
    : isAIWin
      ? "from-rose-400 to-rose-600"
      : "from-zinc-400 to-zinc-500";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <button
          type="button"
          aria-label={t("game.result.close")}
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
        <div
          className={
            "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl " +
            accent
          }
        >
          {won ? "🏆" : isAIWin ? "🤖" : "🤝"}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <RotateCcw className="h-4 w-4" />
            {t("game.result.playAgain")}
          </button>
          <Link
            href="/coach"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t("game.analyze")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {t("game.result.viewBoard")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBanner({
  status: st,
  turn,
  aiThinking,
  mode,
  humanSide,
}: {
  status: ReturnType<typeof status>;
  turn: 1 | 2;
  aiThinking: boolean;
  mode: Mode;
  humanSide: 1 | 2;
}) {
  const t = useT();
  // Terminal results are shown in the popup ResultModal, not inline.
  if (st.kind !== "playing") return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className={
          "inline-block h-3 w-3 rounded-full " +
          (turn === 1 ? "bg-amber-400" : "bg-rose-500")
        }
      />
      <span className="font-medium">
        {mode === "ai"
          ? turn === humanSide
            ? t("game.status.turn.you")
            : aiThinking
              ? t("game.status.turn.thinking")
              : t("game.status.turn.engine")
          : t("game.status.turn.local", { p: turn })}
      </span>
    </div>
  );
}
