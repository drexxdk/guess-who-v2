"use client";

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

export default function JoinGamePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Verify the game code exists and get the session
      const { data: sessions, error: queryError } = await supabase
        .from("game_sessions")
        .select("id, status")
        .eq("game_code", gameCode)
        .eq("status", "active")
        .limit(1);

      if (queryError) {
        throw new Error("Failed to verify game code");
      }

      if (!sessions || sessions.length === 0) {
        setError("Invalid game code or game is not active");
        setLoading(false);
        return;
      }

      // Game code is valid, redirect to play page
      const joinSessionId = crypto.randomUUID();
      router.push(
        `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}&joinSessionId=${joinSessionId}`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !gameCode || !playerName}
              className="w-full text-lg py-6"
            >
              {loading ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </CardContent>
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </Card>
    </div>
  );
}
