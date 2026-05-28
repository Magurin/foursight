"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Check, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/context";

export default function ProPage() {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const features: string[] = [
    t("pro.feat.depth"),
    t("pro.feat.book"),
    t("pro.feat.history"),
    t("pro.feat.themes"),
    t("pro.feat.queue"),
    t("pro.feat.prose"),
  ];

  const startCheckout = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    alert(
      "Stripe Checkout would open here.\n\n" +
        "Wire up STRIPE_SECRET_KEY in .env.local and uncomment the API route to enable real payments.",
    );
    setBusy(false);
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-amber-50 to-rose-50 p-8 dark:border-zinc-800 dark:from-amber-500/5 dark:to-rose-500/5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:bg-zinc-900/60 dark:text-zinc-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {t("pro.badge")}
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{t("pro.price")}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t("pro.tagline")}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={startCheckout}
            disabled={busy}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? t("pro.opening") : t("pro.cta")}
          </button>
          <p className="mt-3 text-xs text-zinc-500">{t("pro.fineprint")}</p>
        </div>
      </main>
    </>
  );
}
