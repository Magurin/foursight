import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Bot, Trophy, Users } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

interface LeaderboardRow {
  id: string;
  username: string;
  elo: number;
  pro: boolean;
}

type Board = "pve" | "pvp";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  const board: Board = sp.mode === "pvp" ? "pvp" : "pve";

  if (!isSupabaseConfigured) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <Trophy className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Configure Supabase to enable the global leaderboard.
          </p>
        </main>
      </>
    );
  }

  const supabase = await getServerSupabase();
  const view = board === "pvp" ? "leaderboard_pvp" : "leaderboard_pve";
  const { data } = (await supabase?.from(view).select("*").limit(50)) ?? {
    data: [] as LeaderboardRow[],
  };
  const rows = (data ?? []) as LeaderboardRow[];

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Global leaderboard</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {board === "pvp"
            ? "Top 50 players by online (PvP) rating."
            : "Top 50 players by rating earned vs the AI (PvE)."}
        </p>

        {/* Tabs */}
        <div className="mt-5 inline-flex rounded-lg border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Tab href="/leaderboard?mode=pve" active={board === "pve"}>
            <Bot className="h-3.5 w-3.5" /> PvE
          </Tab>
          <Tab href="/leaderboard?mode=pvp" active={board === "pvp"}>
            <Users className="h-3.5 w-3.5" /> PvP
          </Tab>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No ranked players yet — be the first.
          </div>
        ) : (
          <ol className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {rows.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right font-mono text-xs text-zinc-400">{i + 1}</span>
                  <span className="font-medium">{p.username ?? "anon"}</span>
                  {p.pro && (
                    <span className="rounded bg-gradient-to-r from-amber-400 to-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      PRO
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-semibold">{p.elo}</span>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 font-medium transition " +
        (active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800")
      }
    >
      {children}
    </Link>
  );
}
