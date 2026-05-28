import { NextResponse } from "next/server";
import { emptyGame, play, status, undo } from "@/lib/engine/game";
import { canPlay } from "@/lib/engine/bitboard";
import { solve } from "@/lib/engine/solver";
import { PUZZLES } from "@/lib/puzzles/positions";

function expect(cond: boolean, msg: string, errors: string[]) {
  if (!cond) errors.push(msg);
}

export async function GET() {
  const errors: string[] = [];

  // 1. Horizontal win for player 1 on bottom row.
  {
    let s = emptyGame(1);
    const seq = [0, 0, 1, 1, 2, 2, 3];
    for (const c of seq) s = play(s, c)!;
    const st = status(s);
    expect(st.kind === "win", "horizontal: should be win", errors);
    if (st.kind === "win") {
      expect(st.winner === 1, `horizontal: winner=${st.winner} expected 1`, errors);
      expect(st.line.length === 4, `horizontal: line len ${st.line.length}`, errors);
    }
  }

  // 2. Vertical win for player 1 in column 3.
  {
    let s = emptyGame(1);
    const seq = [3, 4, 3, 4, 3, 4, 3];
    for (const c of seq) s = play(s, c)!;
    const st = status(s);
    expect(st.kind === "win" && st.winner === 1, "vertical: P1 should win", errors);
  }

  // 3. Diagonal / win for player 1.
  //   Layout (row 0 bottom):
  //   col0 r0=1
  //   col1 r0=2, r1=1
  //   col2 r0=2, r1=2, r2=1
  //   col3 r0=2, r1=1, r2=2, r3=1   <- need r3 P1
  // Sequence designed:
  {
    let s = emptyGame(1);
    // P1=0, P2=1, P1=1, P2=2, P1=2, P2=3, P1=2, P2=3, P1=3, P2=6, P1=3
    const seq = [0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3];
    for (const c of seq) {
      const n = play(s, c);
      if (!n) {
        errors.push(`diagonal /: illegal move ${c} at ply ${s.moves.length}`);
        break;
      }
      s = n;
    }
    const st = status(s);
    expect(st.kind === "win" && (st as any).winner === 1, "diagonal /: P1 should win", errors);
  }

  // 4. Undo returns to prior state.
  {
    let s = emptyGame(1);
    s = play(s, 3)!;
    const after = s;
    s = play(s, 3)!;
    s = undo(s);
    expect(s.mask === after.mask && s.position === after.position, "undo should restore", errors);
  }

  // 5a. Solver finds immediate winning move.
  {
    // P1 has 3 in a row at bottom cols 0,1,2; should play col 3.
    let s = emptyGame(1);
    const setup = [0, 0, 1, 1, 2, 2]; // P1: 0,1,2 bottom; P2: 0,1,2 row1
    for (const c of setup) s = play(s, c)!;
    // Now P1 to move — winning move is col 3.
    const res = solve(s, 6, 500);
    expect(res.bestCol === 3, `solver immediate win: got ${res.bestCol}`, errors);
  }

  // 5b. Solver blocks immediate threat.
  {
    // P1 plays col 3 (center). P2 plays col 0,1,2 (threat horiz). P1 must block col 3 already filled — make different setup.
    // P2 has 3 in a row at cols 0,1,2 bottom. P1 to move must block col 3.
    let s = emptyGame(1);
    // P1=3, P2=0, P1=3, P2=1, P1=3, P2=2  — now P1 to move and P2 threatens col 3 bottom.
    // Wait — col 3 is full to row 2 for P1. P2's row is bottom: 0,1,2; threat is col 3 bottom but column 3's bottom is P1.
    // Let me set up: P2 at bottom 0,1,2.
    // P1=5, P2=0, P1=5, P2=1, P1=5, P2=2  -> P1 has 3 in col 5; P2 has 3 at bottom 0,1,2. P1 turn.
    // P1's options: win in col 5 (4 vertical!) wins for P1.
    // So P1 plays col 5 to win, not block.
    // Different: give P1 no immediate win. P1=5, P2=0, P1=4, P2=1, P1=5, P2=2. Now P1 at (5,r0),(4,r0),(5,r1). P2 at 0,1,2 bottom. P1 to move, must block col 3.
    s = emptyGame(1);
    const seq = [5, 0, 4, 1, 5, 2];
    for (const c of seq) s = play(s, c)!;
    const res = solve(s, 6, 500);
    expect(res.bestCol === 3, `solver block: got ${res.bestCol}`, errors);
  }

  // 6. canPlay correctly rejects full column.
  {
    let s = emptyGame(1);
    for (let i = 0; i < 6; i++) s = play(s, 0)!;
    expect(!canPlay(s.mask, 0), "full column should reject", errors);
  }

  // 7. Verify every curated puzzle has the engine agreeing with its claimed solution.
  for (const p of PUZZLES) {
    let s = emptyGame(p.firstPlayer);
    let illegal = false;
    for (const c of p.setup) {
      const n = play(s, c);
      if (!n) {
        illegal = true;
        break;
      }
      s = n;
    }
    if (illegal) {
      errors.push(`puzzle ${p.id}: setup contains illegal move`);
      continue;
    }
    const res = solve(s, 8, 1500);
    if (res.bestCol !== p.solution) {
      errors.push(
        `puzzle ${p.id}: solver said ${res.bestCol}, puzzle claims ${p.solution}`,
      );
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    errors,
  });
}
