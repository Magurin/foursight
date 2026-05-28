import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { CoachPanel } from "@/components/CoachPanel";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function CoachMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured) return notFound();
  const supabase = await getServerSupabase();
  if (!supabase) return notFound();
  const { data: match } = await supabase
    .from("matches")
    .select("id, mode, ai_difficulty, winner, moves, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!match) return notFound();

  const meta =
    match.mode === "ai"
      ? `vs AI (${match.ai_difficulty ?? "?"})`
      : match.mode === "online"
        ? "Online match"
        : "Local match";

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <CoachPanel moves={match.moves ?? []} firstPlayer={1} meta={meta} />
      </main>
    </>
  );
}
