"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { use } from "react";

interface Player {
  id: string;
  name: string;
  correct: number;
  wrong: number;
  missing: number;
  answered: boolean;
  isActive: boolean;
}

interface GameSession {
  id: string;
  game_code: string;
  game_type: string;
  status: string;
  total_questions: number;
  time_limit_seconds?: number;
  options_count?: number;
  groups: {
    name: string;
  };
}

export default function GameControlPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const params = use(paramsPromise);
  const sessionId = params.sessionId;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameCode, setGameCode] = useState("");

  const loadGameSession = useCallback(async () => {
    const supabase = createClient();

    // Get game session
    const { data: session } = await supabase
      .from("game_sessions")
      .select("*, groups(*)")
      .eq("id", sessionId)
      .single();

    if (!session) {
      alert("Game session not found!");
      router.push("/protected");
      return;
    }

    setGameSession(session);
    setGameCode(session.game_code || "N/A");

    // Get all unique players who have joined (even if they haven't answered yet)
    const { data: answers } = await supabase
      .from("game_answers")
      .select("*")
      .eq("session_id", sessionId);

    console.log("Fetched game_answers for sessionId", sessionId, ":", answers);
    console.log(
      "Raw is_active values:",
      answers?.map((a) => ({
        name: a.player_name,
        correct_option_id: a.correct_option_id,
        is_active: a.is_active,
      })),
    );

    // Count occurrences of each player name (only join records where correct_option_id is null)
    const joinRecords = answers?.filter((a) => !a.correct_option_id) || [];
    const nameCounts = new Map<string, number>();
    const nameIndices = new Map<string, number>();
    const latestJoinRecordIdPerName = new Map<string, string>();

    joinRecords.forEach((record: { id: string; player_name: string }) => {
      const playerName = record.player_name || "Anonymous";
      nameCounts.set(playerName, (nameCounts.get(playerName) || 0) + 1);
      // Keep track of the latest (most recent) join record for each name
      latestJoinRecordIdPerName.set(playerName, record.id);
    });

    // Track unique players by their join record ID (one entry per join record)
    const playerStats = new Map<
      string,
      {
        name: string;
        correct: number;
        wrong: number;
        missing: number;
        isActive: boolean;
        displayName: string;
      }
    >();

    // First pass: create one player entry for each join record
    joinRecords.forEach(
      (joinRecord: {
        id: string;
        player_name: string;
        is_active?: boolean;
      }) => {
        const playerName = joinRecord.player_name || "Anonymous";
        const isDuplicate = nameCounts.get(playerName)! > 1;

        const currentIndex = (nameIndices.get(playerName) || 0) + 1;
        nameIndices.set(playerName, currentIndex);

        const displayName = isDuplicate
          ? `${playerName} (${currentIndex})`
          : playerName;

        playerStats.set(joinRecord.id, {
          name: playerName,
          correct: 0,
          wrong: 0,
          missing: 0,
          isActive: joinRecord.is_active !== false,
          displayName,
        });
      },
    );

    // Second pass: count answers for each player
    if (answers && answers.length > 0) {
      const joinIds = Array.from(playerStats.keys());
      console.log("Available join IDs in playerStats:", joinIds);

      const answerRecords = answers.filter((a) => a.correct_option_id);
      console.log("Answer records found:", answerRecords.length);
      console.log(
        "Answer records join_ids:",
        answerRecords.map((a) => ({
          join_id: a.join_id,
          is_correct: a.is_correct,
          player_name: a.player_name,
        })),
      );

      answers.forEach(
        (answer: {
          player_name: string;
          correct_option_id?: string;
          is_correct?: boolean;
          is_active?: boolean;
          join_id?: string;
        }) => {
          const playerName = answer.player_name || "Anonymous";

          // Count actual answers (records where correct_option_id is NOT null)
          if (answer.correct_option_id) {
            console.log(
              "Processing answer for",
              playerName,
              "with join_id:",
              answer.join_id,
              "has in stats:",
              playerStats.has(answer.join_id || ""),
            );
            if (answer.join_id && playerStats.has(answer.join_id)) {
              const stats = playerStats.get(answer.join_id)!;
              if (answer.is_correct) {
                stats.correct++;
              } else {
                stats.wrong++;
              }
            } else {
              console.log("Answer skipped - join_id not found in playerStats");
            }
          }
        },
      );
    }

    console.log(
      "Final player stats:",
      Array.from(playerStats.entries()).map(([, stats]) => ({
        name: stats.displayName,
        isActive: stats.isActive,
      })),
    );

    const activePlayers: Player[] = Array.from(playerStats.entries()).map(
      ([id, stats]) => {
        const total = stats.correct + stats.wrong;
        const missing = Math.max(0, session.total_questions - total);

        return {
          id,
          name: stats.displayName,
          correct: stats.correct,
          wrong: stats.wrong,
          missing: missing,
          answered: total === session.total_questions,
          isActive: stats.isActive,
        };
      },
    );

    console.log("Active players found:", activePlayers);

    setPlayers(
      activePlayers.length > 0
        ? activePlayers
        : [
            {
              id: "1",
              name: "Waiting for players...",
              correct: 0,
              wrong: 0,
              missing: 0,
              answered: false,
              isActive: false,
            },
          ],
    );
    setLoading(false);
  }, [sessionId, router]);

  // Initial load
  useEffect(() => {
    loadGameSession();
  }, [loadGameSession]);

  // Set up real-time subscription for players
  useEffect(() => {
    console.log("Setting up subscription for sessionId:", sessionId);
    const supabase = createClient();

    const channel = supabase
      .channel(`game:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_answers",
        },
        (payload) => {
          console.log("🔔 REAL-TIME UPDATE RECEIVED:", payload);
          // Only reload if it's for this session
          const newData = payload.new as Record<string, unknown> | null;
          const oldData = payload.old as Record<string, unknown> | null;
          if (
            newData?.session_id === sessionId ||
            oldData?.session_id === sessionId
          ) {
            console.log("✅ Update is for this session, reloading...");
            loadGameSession();
          }
        },
      )
      .subscribe((status, err) => {
        console.log("📡 Subscription status:", status);
        if (err) {
          console.error("❌ Subscription error:", err);
        }
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to game_answers");
        }
      });

    console.log("Subscription channel created:", channel);

    return () => {
      console.log("Cleaning up subscription for sessionId:", sessionId);
      supabase.removeChannel(channel);
    };
  }, [sessionId, loadGameSession]);

  const endGame = async () => {
    const supabase = createClient();

    await supabase
      .from("game_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    router.push("/protected");
  };

  if (loading || !gameSession) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">
                {gameSession.groups?.name || "Game Session"}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Game Type:{" "}
                {gameSession.game_type === "guess_name"
                  ? "Guess the Name"
                  : "Guess the Image"}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Game Code</p>
              <Badge className="text-4xl px-8 py-4 font-mono">{gameCode}</Badge>
              <div className="mt-4 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Time limit:</span>{" "}
                  {gameSession.time_limit_seconds || 30}s
                </p>
                <p>
                  <span className="font-medium">Options:</span>{" "}
                  {gameSession.options_count || 4}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>Players ({players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        player.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-x-2">
                    {player.correct > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {player.correct} correct
                      </Badge>
                    )}
                    {player.wrong > 0 && (
                      <Badge variant="destructive">{player.wrong} wrong</Badge>
                    )}
                    {player.missing > 0 && (
                      <Badge variant="secondary">
                        {player.missing} missing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg text-black">
              <p className="text-sm mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">
                {gameSession.status || "Active"}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-black">
              <p className="text-sm mb-1">Questions</p>
              <p className="text-lg font-semibold">
                {gameSession.total_questions} total
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={endGame}
                variant="destructive"
                className="w-full"
              >
                End Game
              </Button>
              <Link
                href="/protected"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
              >
                Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Share the game code <Badge variant="outline">{gameCode}</Badge>{" "}
              with players
            </li>
            <li>
              Players visit <strong>your-app.com/game/join</strong> and enter
              the code
            </li>
            <li>Players will see questions and answer in real-time</li>
            <li>Monitor player progress from this dashboard</li>
            <li>Click &quot;End Game&quot; when everyone is done</li>
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
