"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "./Board";
import { emptyGame, play, status, toMove } from "@/lib/engine/game";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useGuestId } from "@/lib/hooks/use-guest-id";
import { useUser } from "@/lib/hooks/use-user";
import { DEFAULT_ELO, coinsFor, nextElo, scoreFor } from "@/lib/elo";
import { resolveSkins } from "@/lib/cosmetics";
import { Check, Link as LinkIcon, RotateCcw, Users } from "lucide-react";
import { useT } from "@/lib/i18n/context";

interface Props {
  code: string;
  isHostHint: boolean; // came from ?host=1
}

type Role = 1 | 2;

interface RoomMessage {
  // 'hello' from any joiner announcing identity
  // 'sync' from host with current moves
  // 'move' { col, ply }
  // 'reset' empty
  t: "hello" | "sync" | "move" | "reset";
  from: string;
  payload?: unknown;
}

export function OnlineRoom({ code, isHostHint }: Props) {
  const t = useT();
  const { user, profile } = useUser();
  const guestId = useGuestId();
  const myId = user?.id ?? guestId;

  const [state, setState] = useState(() => emptyGame(1));
  const [role, setRole] = useState<Role | null>(null);
  const [opponentPresent, setOpponentPresent] = useState(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ratedRef = useRef<string | null>(null);

  // Persist role per room across refreshes.
  useEffect(() => {
    if (!myId) return;
    const KEY = `foursight.role.${code}`;
    const stored = localStorage.getItem(KEY);
    if (stored === "1" || stored === "2") {
      setRole(Number(stored) as Role);
      return;
    }
    if (isHostHint) {
      localStorage.setItem(KEY, "1");
      setRole(1);
    }
  }, [code, isHostHint, myId]);

  const supabaseRef = useRef<ReturnType<typeof getBrowserSupabase>>(null);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getBrowserSupabase>>["channel"]> | null>(null);

  // Set up realtime channel.
  useEffect(() => {
    if (!myId) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    supabaseRef.current = supabase;

    const channel = supabase.channel(`room:${code}`, {
      config: { presence: { key: myId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const handleMove = (col: number) => {
      setState((s) => {
        const st = status(s);
        if (st.kind !== "playing") return s;
        return play(s, col) ?? s;
      });
    };

    channel
      .on("broadcast", { event: "msg" }, ({ payload }: { payload: RoomMessage }) => {
        if (payload.from === myId) return;
        if (payload.t === "hello") {
          // Host responds with current moves so the joiner can catch up.
          if (role === 1) {
            channel.send({
              type: "broadcast",
              event: "msg",
              payload: {
                t: "sync",
                from: myId,
                payload: state.moves,
              } satisfies RoomMessage,
            });
          }
        } else if (payload.t === "sync") {
          const moves = (payload.payload as number[]) ?? [];
          let s = emptyGame(1);
          for (const c of moves) s = play(s, c) ?? s;
          setState(s);
        } else if (payload.t === "move") {
          const col = (payload.payload as { col: number }).col;
          handleMove(col);
        } else if (payload.t === "reset") {
          setState(emptyGame(1));
        }
      })
      .on("presence", { event: "sync" }, () => {
        const presence = channel.presenceState() as Record<string, unknown[]>;
        const others = Object.keys(presence).filter((k) => k !== myId);
        setOpponentPresent(others.length > 0);
        if (others[0]) setOpponentId(others[0]);

        // Assign roles deterministically if not set: lowest id = host.
        if (role === null) {
          const all = [myId, ...others].sort();
          const me = all.indexOf(myId);
          const assigned: Role = me === 0 ? 1 : 2;
          localStorage.setItem(`foursight.role.${code}`, String(assigned));
          setRole(assigned);
        }
      })
      .subscribe(async (s: string) => {
        if (s === "SUBSCRIBED") {
          await channel.track({ id: myId, at: Date.now() });
          channel.send({
            type: "broadcast",
            event: "msg",
            payload: { t: "hello", from: myId } satisfies RoomMessage,
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // role intentionally not in deps — channel uses ref-stable state via setState
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, myId]);

  const st = status(state);
  const turn = toMove(state);
  const myTurn = role !== null && turn === role && st.kind === "playing";

  // PVP rating: when an online game finishes between two registered users, each
  // client updates its OWN elo_pvp against the opponent's current rating.
  // Guests (no profile row) and unauthenticated players are skipped.
  useEffect(() => {
    if (st.kind !== "win" && st.kind !== "draw") return;
    const myUserId = user?.id;
    if (!myUserId || !opponentId || role === null) return;
    const winner = st.kind === "win" ? st.winner : 0;
    const key = `pvp:${code}:${state.moves.join(",")}:${winner}`;
    if (ratedRef.current === key) return;
    const storageKey = `foursight.pvp.rated.${key}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      ratedRef.current = key;
      return;
    }
    ratedRef.current = key;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const myScore = scoreFor(winner, role);
    (async () => {
      const { data: opp } = await supabase
        .from("profiles")
        .select("id, elo_pvp")
        .eq("id", opponentId)
        .maybeSingle();
      if (!opp) return; // opponent is a guest — not a rated match
      const { data: me } = await supabase
        .from("profiles")
        .select("elo_pvp, coins")
        .eq("id", myUserId)
        .maybeSingle();
      const myElo = me?.elo_pvp ?? DEFAULT_ELO;
      const updated = nextElo(myElo, opp.elo_pvp ?? DEFAULT_ELO, myScore);
      const coins = (me?.coins ?? 0) + coinsFor(myScore);
      await supabase.from("profiles").update({ elo_pvp: updated, coins }).eq("id", myUserId);
      if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
    })();
  }, [st.kind, role, user?.id, opponentId, state.moves, code]);

  const onDrop = (col: number) => {
    if (!myTurn || !channelRef.current) return;
    const next = play(state, col);
    if (!next) return;
    setState(next);
    channelRef.current.send({
      type: "broadcast",
      event: "msg",
      payload: {
        t: "move",
        from: myId!,
        payload: { col },
      } satisfies RoomMessage,
    });
  };

  const onReset = () => {
    setState(emptyGame(1));
    channelRef.current?.send({
      type: "broadcast",
      event: "msg",
      payload: { t: "reset", from: myId! } satisfies RoomMessage,
    });
  };

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/play/online/${code}`;
  }, [code]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            <Users className="mr-1 inline h-3.5 w-3.5" />
            {t("online.room.kicker", { code })}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {role === 1 ? t("online.room.yellow") : role === 2 ? t("online.room.red") : t("online.room.connecting")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!shareUrl) return;
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <LinkIcon className="h-3.5 w-3.5" />}
            {copied ? t("online.room.copied") : t("online.room.invite")}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {t("online.room.rematch")}
          </button>
        </div>
      </div>

      <Banner
        st={st}
        myTurn={myTurn}
        role={role}
        turn={turn}
        opponentPresent={opponentPresent}
      />

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <Board state={state} onDrop={onDrop} disabled={!myTurn} skins={resolveSkins(profile, role ?? 1)} />
      </div>
    </div>
  );
}

function Banner({
  st,
  myTurn,
  role,
  turn,
  opponentPresent,
}: {
  st: ReturnType<typeof status>;
  myTurn: boolean;
  role: Role | null;
  turn: 1 | 2;
  opponentPresent: boolean;
}) {
  const t = useT();
  if (st.kind === "win") {
    const youWon = role === st.winner;
    return (
      <div
        className={
          "rounded-lg px-4 py-3 text-sm font-medium " +
          (youWon
            ? "border border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            : "border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200")
        }
      >
        {youWon ? t("online.room.you.win") : t("online.room.you.lose")}
      </div>
    );
  }
  if (st.kind === "draw") {
    return (
      <div className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        {t("online.room.draw")}
      </div>
    );
  }
  if (!opponentPresent) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        {t("online.room.waiting")}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className={
          "inline-block h-3 w-3 rounded-full " +
          (turn === 1 ? "bg-amber-400" : "bg-rose-500")
        }
      />
      <span className="font-medium">{myTurn ? t("online.room.turn.you") : t("online.room.turn.opp")}</span>
    </div>
  );
}
