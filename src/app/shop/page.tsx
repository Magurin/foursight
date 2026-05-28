"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Coins, Lock, ShoppingBag } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/hooks/use-user";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import {
  BALL_SKINS,
  BOARD_THEMES,
  DEFAULT_BALL_OPPONENT,
  DEFAULT_BALL_PLAYER,
  DEFAULT_BOARD,
  isOwned,
  type BallSkin,
  type BoardTheme,
  type Slot,
} from "@/lib/cosmetics";

export default function ShopPage() {
  const { t, locale } = useI18n();
  const { user, profile, loading } = useUser();

  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipPlayer, setEquipPlayer] = useState(DEFAULT_BALL_PLAYER);
  const [equipOpp, setEquipOpp] = useState(DEFAULT_BALL_OPPONENT);
  const [equipBoard, setEquipBoard] = useState(DEFAULT_BOARD);
  const [busy, setBusy] = useState<string | null>(null);

  // Seed editable state from the profile once it loads (render-phase init —
  // re-runs only when a different profile arrives, not on every render).
  const [seededId, setSeededId] = useState<string | null>(null);
  if (profile && profile.id !== seededId) {
    setSeededId(profile.id);
    setCoins(profile.coins ?? 0);
    setOwned(profile.owned_cosmetics ?? []);
    setEquipPlayer(profile.cosmetic_player ?? DEFAULT_BALL_PLAYER);
    setEquipOpp(profile.cosmetic_opponent ?? DEFAULT_BALL_OPPONENT);
    setEquipBoard(profile.cosmetic_board ?? DEFAULT_BOARD);
  }

  const persist = async (patch: Record<string, unknown>) => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    await supabase.from("profiles").update(patch).eq("id", user.id);
  };

  const buy = async (id: string, price: number) => {
    if (busy || coins < price || isOwned(id, owned)) return;
    setBusy(id);
    const nextCoins = coins - price;
    const nextOwned = [...owned, id];
    setCoins(nextCoins);
    setOwned(nextOwned);
    await persist({ coins: nextCoins, owned_cosmetics: nextOwned });
    setBusy(null);
  };

  const equip = async (slot: Slot, id: string) => {
    if (slot === "player") {
      setEquipPlayer(id);
      await persist({ cosmetic_player: id });
    } else if (slot === "opponent") {
      setEquipOpp(id);
      await persist({ cosmetic_opponent: id });
    } else {
      setEquipBoard(id);
      await persist({ cosmetic_board: id });
    }
  };

  if (!loading && !user) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t("shop.signInTitle")}</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{t("shop.signInBody")}</p>
          <Link
            href="/login?next=/shop"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t("shop.signIn")}
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-amber-500" />
              <h1 className="text-2xl font-semibold tracking-tight">{t("shop.title")}</h1>
            </div>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">{t("shop.subtitle")}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <Coins className="h-4 w-4" />
            {t("shop.coins", { n: coins })}
          </div>
        </div>

        <Section title={t("shop.section.yourBalls")}>
          {BALL_SKINS.map((b) => (
            <BallCard
              key={`p-${b.id}`}
              skin={b}
              owned={isOwned(b.id, owned)}
              equipped={equipPlayer === b.id}
              coins={coins}
              busy={busy === b.id}
              locale={locale}
              t={t}
              onBuy={() => buy(b.id, b.price)}
              onEquip={() => equip("player", b.id)}
            />
          ))}
        </Section>

        <Section title={t("shop.section.oppBalls")}>
          {BALL_SKINS.map((b) => (
            <BallCard
              key={`o-${b.id}`}
              skin={b}
              owned={isOwned(b.id, owned)}
              equipped={equipOpp === b.id}
              coins={coins}
              busy={busy === b.id}
              locale={locale}
              t={t}
              onBuy={() => buy(b.id, b.price)}
              onEquip={() => equip("opponent", b.id)}
            />
          ))}
        </Section>

        <Section title={t("shop.section.boards")}>
          {BOARD_THEMES.map((b) => (
            <BoardCard
              key={b.id}
              theme={b}
              owned={isOwned(b.id, owned)}
              equipped={equipBoard === b.id}
              coins={coins}
              busy={busy === b.id}
              locale={locale}
              t={t}
              onBuy={() => buy(b.id, b.price)}
              onEquip={() => equip("board", b.id)}
            />
          ))}
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function PriceTag({
  owned,
  equipped,
  coins,
  price,
  busy,
  t,
  onBuy,
  onEquip,
}: {
  owned: boolean;
  equipped: boolean;
  coins: number;
  price: number;
  busy: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onBuy: () => void;
  onEquip: () => void;
}) {
  if (equipped) {
    return (
      <span className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
        <Check className="h-3.5 w-3.5" /> {t("shop.equipped")}
      </span>
    );
  }
  if (owned) {
    return (
      <button
        type="button"
        onClick={onEquip}
        className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        {t("shop.equip")}
      </button>
    );
  }
  const affordable = coins >= price;
  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={!affordable || busy}
      title={!affordable ? t("shop.notEnough") : undefined}
      className={cn(
        "inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
        affordable
          ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
      )}
    >
      {affordable ? null : <Lock className="h-3 w-3" />}
      {t("shop.buy", { price })}
    </button>
  );
}

function BallCard({
  skin,
  owned,
  equipped,
  coins,
  busy,
  locale,
  t,
  onBuy,
  onEquip,
}: {
  skin: BallSkin;
  owned: boolean;
  equipped: boolean;
  coins: number;
  busy: boolean;
  locale: "en" | "ru";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onBuy: () => void;
  onEquip: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border bg-white p-4 text-center transition dark:bg-zinc-900",
        equipped
          ? "border-emerald-400 dark:border-emerald-500/40"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <div className="flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 dark:from-indigo-700 dark:to-indigo-950">
        <div className={cn("h-10 w-10 rounded-full shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]", skin.className)} />
      </div>
      <div className="text-sm font-medium">{skin.name[locale]}</div>
      <PriceTag
        owned={owned}
        equipped={equipped}
        coins={coins}
        price={skin.price}
        busy={busy}
        t={t}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    </div>
  );
}

function BoardCard({
  theme,
  owned,
  equipped,
  coins,
  busy,
  locale,
  t,
  onBuy,
  onEquip,
}: {
  theme: BoardTheme;
  owned: boolean;
  equipped: boolean;
  coins: number;
  busy: boolean;
  locale: "en" | "ru";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onBuy: () => void;
  onEquip: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border bg-white p-4 text-center transition dark:bg-zinc-900",
        equipped
          ? "border-emerald-400 dark:border-emerald-500/40"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <div className={cn("grid w-full grid-cols-3 gap-1 rounded-xl p-2", theme.container)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("aspect-square rounded-full", theme.cell)} />
        ))}
      </div>
      <div className="text-sm font-medium">{theme.name[locale]}</div>
      <PriceTag
        owned={owned}
        equipped={equipped}
        coins={coins}
        price={theme.price}
        busy={busy}
        t={t}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    </div>
  );
}
