import { NavBar } from "@/components/NavBar";
import { OnlineRoom } from "@/components/OnlineRoom";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const isHost = sp.host === "1";

  if (!isSupabaseConfigured) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Online play needs Supabase</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            Configure your Supabase env vars to enable realtime rooms.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <OnlineRoom code={code.toUpperCase()} isHostHint={isHost} />
      </main>
    </>
  );
}
