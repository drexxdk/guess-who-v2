"use client";

import { ReactNode } from "react";
import { GameLoadingProvider } from "./loading-context";
import { GameLoadingOverlay } from "./loading-overlay";

export function GameLoadingWrapper({ children }: { children: ReactNode }) {
  return (
    <GameLoadingProvider>
      <GameLoadingOverlay />
      {children}
    </GameLoadingProvider>
  );
}
