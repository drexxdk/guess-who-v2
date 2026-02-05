"use client";

import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useMutation } from "@/lib/hooks/use-async";
import { getActiveGameSessionByCode } from "@/lib/queries";

export default function JoinGamePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const joinGame = useCallback(async () => {
    const supabase = createClient();
    const session = await getActiveGameSessionByCode(supabase, gameCode);

    if (!session) {
      throw new Error("Invalid game code or game is not active");
    }

    // Game code is valid, redirect to play page
    // Use push so /game/join stays in history - back from play will return here
    const joinSessionId = crypto.randomUUID();
    router.push(
      `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}&joinSessionId=${joinSessionId}`,
    );
    
    // Return a promise that never resolves to keep loading state active during navigation
    // This prevents flicker as the join page stays in loading state until unmounted
    return new Promise(() => {});
  }, [gameCode, playerName, router]);

  const { error, isLoading, execute, setError, reset } = useMutation(joinGame);

  // Reset loading state when returning to this page via back button or history navigation
  useEffect(() => {
    // Reset on mount in case we're returning from a navigation
    reset();
    
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted is true when the page is loaded from the back-forward cache
      if (event.persisted) {
        reset();
      }
    };

    // Also handle popstate for client-side navigation
    const handlePopState = () => {
      reset();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [reset]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    await execute();
  };

  return (
    <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Join Game</CardTitle>
          <CardDescription>
            Enter the game code to join the fun!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Game Code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-bold tracking-widest"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                required
                disabled={isLoading}
              />
            </div>

            <ErrorMessage message={error} />

            <Button
              type="submit"
              disabled={isLoading || !gameCode || !playerName}
              className="w-full text-lg py-6"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </Card>
    </div>
  );
}
