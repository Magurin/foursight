"use client";

import { NavBar } from "@/components/NavBar";
import { GameView } from "@/components/GameView";

export default function AIPlayPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <GameView mode="ai" humanSide={1} />
      </main>
    </>
  );
}
