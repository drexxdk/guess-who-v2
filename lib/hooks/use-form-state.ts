"use client";

import { useState, useCallback } from "react";

export function useFormState() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        return await action();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { error, isLoading, execute, setError, clearError };
}
