"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface GameLoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const GameLoadingContext = createContext<GameLoadingContextType | null>(null);

export function GameLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <GameLoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </GameLoadingContext.Provider>
  );
}

export function useGameLoading() {
  const context = useContext(GameLoadingContext);
  if (!context) {
    throw new Error("useGameLoading must be used within GameLoadingProvider");
  }
  return context;
}
