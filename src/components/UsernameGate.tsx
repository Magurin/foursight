"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { needsUsername } from "@/lib/username";

// Logged-in users without a chosen username are forced to /onboarding before
// they can use the rest of the app — this keeps email handles off the
// leaderboard and gives everyone a real nickname.
const EXEMPT = ["/onboarding", "/login", "/auth"];

export function UsernameGate() {
  const { user, profile, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (!needsUsername(profile.username, user.email)) return;
    if (EXEMPT.some((p) => pathname.startsWith(p))) return;
    router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, profile, pathname, router]);

  return null;
}
