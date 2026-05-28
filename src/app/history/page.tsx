import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!isSupabaseConfigured) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Match history</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            Configure Supabase to enable history.
          </p>
        </main>
      </>
    );
  }

  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Match history</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 underline">
              Sign in
            </Link>{" "}
            to see your previous games.
          </p>
        </main>
      </>
    );
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id, mode, ai_difficulty, winner, moves, created_at, ended_at")
    .or(`player_one.eq.${user.id},player_two.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Your matches</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Last 50 games. Click to replay & analyze.</p>

        {(!matches || matches.length === 0) ? (
          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No games yet. <Link href="/play" className="text-indigo-600 underline dark:text-indigo-400">Play one →</Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {matches.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {m.mode === "ai" ? `AI (${m.ai_difficulty ?? "?"})` : m.mode === "online" ? "Online" : "Local"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {m.moves?.length ?? 0} moves · {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "rounded-md px-2 py-0.5 text-xs font-medium " +
                      (m.winner === 1
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                        : m.winner === 2
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200")
                    }
                  >
                    {m.winner === 0 ? "Draw" : `P${m.winner} won`}
                  </span>
                  <Link
                    href={`/coach/${m.id}`}
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Analyze →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
