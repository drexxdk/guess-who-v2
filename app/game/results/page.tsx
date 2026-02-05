"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const [gameEnded, setGameEnded] = useState<boolean | null>(null);

  const score = parseInt(searchParams?.get("score") || "0");
  const total = parseInt(searchParams?.get("total") || "0");
  const sessionId = searchParams?.get("session") || "";
  const gameCode =
    searchParams?.get("code") || sessionStorage.getItem("lastGameCode") || "";
  const playerName =
    searchParams?.get("name") || sessionStorage.getItem("lastPlayerName") || "";
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    // Check initial game session status
    const checkGameStatus = async () => {
      try {
        const { data: session } = await supabase
          .from("game_sessions")
          .select("status")
          .eq("id", sessionId)
          .single();

        if (session?.status === "completed") {
          setGameEnded(true);
        } else {
          setGameEnded(false);
        }
      } catch (error) {
        console.error("Error checking game status:", error);
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
          setGameEnded(updatedSession.status === "completed");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handlePlayAgain = async () => {
    if (gameEnded) {
      // Game has been ended by host, send them back to join
      router.push("/game/join");
      return;
    }

    if (gameCode && playerName) {
      try {
        // Clear all previous data for this player in this session before restarting
        const supabase = createClient();

        console.log("[handlePlayAgain] Starting retry for:", playerName);

        // First, find the join record for this player
        const { data: joinRecords } = await supabase
          .from("game_answers")
          .select("id")
          .eq("session_id", sessionId)
          .eq("player_name", playerName)
          .is("correct_option_id", null)
          .order("created_at", { ascending: false })
          .limit(1);

        const joinRecordId = joinRecords?.[0]?.id;
        console.log("[handlePlayAgain] Found join record:", joinRecordId);

        // Delete only the actual answers (not the join tracking record)
        // Join tracking records have correct_option_id = null, so we only delete where it's not null
        const { error: deleteError } = await supabase
          .from("game_answers")
          .delete()
          .eq("session_id", sessionId)
          .eq("player_name", playerName)
          .not("correct_option_id", "is", null);

        if (deleteError) {
          console.error("Error deleting answers:", deleteError);
        } else {
          console.log("[handlePlayAgain] Answers deleted successfully");
        }

        // Touch the join record by updating it to trigger host's real-time subscription
        // This ensures the host sees the updated player list immediately
        if (joinRecordId) {
          console.log(
            "[handlePlayAgain] Touching join record to trigger host update",
          );
          const { error: touchError } = await supabase
            .from("game_answers")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", joinRecordId);

          if (touchError) {
            console.error("Error touching join record:", touchError);
          } else {
            console.log("[handlePlayAgain] Join record touched successfully");
          }
        }

        // Clear all sessionStorage entries for this game/player
        Object.keys(sessionStorage).forEach((key) => {
          if (key.includes(gameCode) && key.includes(playerName)) {
            console.log("[handlePlayAgain] Clearing sessionStorage:", key);
            sessionStorage.removeItem(key);
          }
        });

        // Wait a brief moment to ensure Supabase has fully processed the updates
        // and broadcasted the changes to subscribed clients
        await new Promise((resolve) => setTimeout(resolve, 300));

        console.log(
          "[handlePlayAgain] Redirecting to play page with retry flag",
        );

        // Redirect to play page with retry flag to force fresh start
        router.push(
          `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}&retry=true`,
        );
      } catch (err) {
        console.error("Error in handlePlayAgain:", err);
        // Even if there's an error, still try to navigate with retry flag
        router.push(
          `/game/play?code=${gameCode}&name=${encodeURIComponent(playerName)}&retry=true`,
        );
      }
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
    <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
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
            {gameEnded === null ? (
              <div className="p-3 bg-gray-100 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : gameEnded ? (
              <>
                <div className="p-3 bg-orange-50 rounded-lg text-black text-center mb-2">
                  <p className="text-sm font-medium">Game has ended</p>
                </div>
                <Button
                  onClick={() => router.push("/game/join")}
                  className="w-full"
                >
                  Join New Game
                </Button>
                <Link
                  href="/game/join"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  Back to Home
                </Link>
              </>
            ) : (
              <>
                <Button onClick={handlePlayAgain} className="w-full">
                  Play Again
                </Button>
                <Link
                  href="/game/join"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  Back to Home
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
