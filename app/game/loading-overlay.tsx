"use client";

import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { useGameLoading } from "./loading-context";

export function GameLoadingOverlay() {
  const { isLoading } = useGameLoading();

  if (!isLoading) return null;

  return <LoadingOverlay />;
}
