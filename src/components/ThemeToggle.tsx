"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useT } from "@/lib/i18n/context";

// document.startViewTransition isn't in the default TS DOM lib yet.
type ViewTransition = { ready: Promise<void> };
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

export function ThemeToggle() {
  const t = useT();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme : "light";
  const next = current === "dark" ? "light" : "dark";

  const toggle = useCallback(() => {
    const doc = document as DocWithVT;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fallback: no View Transitions support or user prefers reduced motion.
    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // Origin of the circular reveal = center of the toggle button.
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    // Radius reaching the farthest screen corner.
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => {
      // flushSync forces next-themes' class change to land synchronously so
      // the View Transition snapshots the new theme as the "new" layer.
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          // ease-in: the reveal accelerates toward the end so the farthest
          // corner snaps closed instead of lingering (ease-out decelerates and
          // leaves a visible trailing edge, especially on tall mobile screens).
          duration: 380,
          easing: "cubic-bezier(0.5, 0, 0.75, 0)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }, [next, setTheme]);

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={t("nav.theme.toggle")}
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {current === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Theme: {mounted ? theme : "loading"}</span>
    </button>
  );
}
