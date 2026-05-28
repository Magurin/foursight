"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";

export interface ProfileRow {
  id: string;
  username: string | null;
  elo: number;
  elo_pve: number;
  elo_pvp: number;
  pro: boolean;
  coins: number;
  cosmetic_player: string | null;
  cosmetic_opponent: string | null;
  cosmetic_board: string | null;
  owned_cosmetics: string[] | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;
    supabase
      .from("profiles")
      .select("id, username, elo, elo_pve, elo_pvp, pro, coins, cosmetic_player, cosmetic_opponent, cosmetic_board, owned_cosmetics")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: { data: ProfileRow | null }) => {
        if (!active) return;
        setProfile(data);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return { user, profile, loading };
}
