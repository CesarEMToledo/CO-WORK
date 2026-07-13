"use client";

import { LoadingScreen } from "./LoadingScreen";

const INTRO_SEEN_KEY = "cw_intro_seen";

export function IntroGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingScreen onDone={() => sessionStorage.setItem(INTRO_SEEN_KEY, "1")} />
      {children}
    </>
  );
}
