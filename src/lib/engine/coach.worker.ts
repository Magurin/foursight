// Web Worker entrypoint for AI Coach analysis.
//
// Messages in:  { moves, firstPlayer, depth?, timePerMoveMs?, locale? }
// Messages out: { type: "report", report: CoachReport }

import { analyzeGame, type CoachReport } from "./coach";
import type { Locale } from "@/lib/i18n/dictionary";

export interface CoachRequest {
  moves: number[];
  firstPlayer: 1 | 2;
  depth?: number;
  timePerMoveMs?: number;
  locale?: Locale;
}

export interface CoachResponse {
  type: "report";
  report: CoachReport;
}

self.onmessage = (e: MessageEvent<CoachRequest>) => {
  const { moves, firstPlayer, depth, timePerMoveMs, locale } = e.data;
  const report = analyzeGame(moves, {
    firstPlayer,
    depth: depth ?? 6,
    timePerMoveMs: timePerMoveMs ?? 200,
    locale,
  });
  const msg: CoachResponse = { type: "report", report };
  (self as unknown as Worker).postMessage(msg);
};
