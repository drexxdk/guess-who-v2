"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function GameResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [gameEnded, setGameEnded] = useState(false);

  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "0");
  const sessionId = searchParams.get("session") || "";
  const gameCode =
    searchParams.get("code") || sessionStorage.getItem("lastGameCode") || "";
  const playerName =
    searchParams.get("name") || sessionStorage.getItem("lastPlayerName") || "";
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    // Check initial game session status
    const checkGameStatus = async () => {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("status")
        .eq("id", sessionId)
        .single();

      if (session?.status === "completed") {
        setGameEnded(true);
      }
    };

    checkGameStatus();

    // Watch for game session status changes
    const channel = supabase
      .channel(`game-results:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedSession = payload.new as { status: string };
          if (updatedSession.status === "completed") {
            setGameEnded(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handlePlayAgain = () => {
    if (gameEnded) {
      // Game has been ended by host, send them back to join
      router.push("/game/join");
      return;
    }

    if (gameCode && playerName) {
      router.push(
        `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}`,
      );
    } else {
      router.push("/game/join");
    }
  };

  const getGrade = () => {
    if (percentage >= 90)
      return { emoji: "🌟", text: "Amazing!", color: "text-yellow-500" };
    if (percentage >= 75)
      return { emoji: "🎉", text: "Great Job!", color: "text-green-500" };
    if (percentage >= 60)
      return { emoji: "👍", text: "Good Work!", color: "text-blue-500" };
    if (percentage >= 40)
      return { emoji: "📚", text: "Keep Trying!", color: "text-orange-500" };
    return { emoji: "💪", text: "Try Again!", color: "text-red-500" };
  };

  const grade = getGrade();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">{grade.emoji}</div>
        <CardTitle className={`text-4xl font-bold ${grade.color}`}>
          {grade.text}
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          You scored {score} out of {total}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{percentage}%</div>
          <p className="text-muted-foreground">Accuracy</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {total - score}
            </div>
            <p className="text-sm text-muted-foreground">Wrong</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>

        <div className="space-y-2">
          {gameEnded ? (
            <>
              <div className="p-3 bg-orange-50 rounded-lg text-black text-center mb-2">
                <p className="text-sm font-medium">Game has ended</p>
              </div>
              <Button
                onClick={() => router.push("/game/join")}
                className="w-full"
                size="lg"
              >
                Join New Game
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handlePlayAgain} className="w-full" size="lg">
                Play Again
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
