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
import { ErrorMessage } from "@/components/ui/error-message";
import { getActiveGameSessionByCode } from "@/lib/queries";
import { useGameLoading } from "../loading-context";

export default function JoinGamePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setLoading } = useGameLoading();

  // Reset loading state when returning to this page via back button or history navigation
  useEffect(() => {
    // Reset on mount in case we're returning from a navigation
    setLoading(false);
    setIsSubmitting(false);
    
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false);
        setIsSubmitting(false);
      }
    };

    const handlePopState = () => {
      setLoading(false);
      setIsSubmitting(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setLoading]);

  const handleJoin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);
    setLoading(true);

    try {
      const supabase = createClient();
      const session = await getActiveGameSessionByCode(supabase, gameCode);

      if (!session) {
        throw new Error("Invalid game code or game is not active");
      }

      // Game code is valid, redirect to play page
      const joinSessionId = crypto.randomUUID();
      router.push(
        `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}&joinSessionId=${joinSessionId}`,
      );
      // Keep loading state active during navigation - will be reset on unmount or back navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [gameCode, playerName, router, isSubmitting, setLoading]);

  return (
    <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md">
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                required
                disabled={isSubmitting}
              />
            </div>

            <ErrorMessage message={error} />

            <Button
              type="submit"
              disabled={isSubmitting || !gameCode || !playerName}
              className="w-full text-lg py-6"
            >
              {isSubmitting ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
