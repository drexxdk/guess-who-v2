"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    // For now, redirect to a game page
    // In production, you'd verify the game code exists
    router.push(
      `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}`,
    );

    // Reset loading after a short delay to handle fast back navigation
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Join Game</CardTitle>
        <CardDescription>Enter the game code to join the fun!</CardDescription>
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
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !gameCode || !playerName}
            className="w-full text-lg py-6"
          >
            {loading ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
