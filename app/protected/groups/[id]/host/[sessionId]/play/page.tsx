"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [error, setError] = useState<string | null>(null);
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
      setError("Game session not found!");
      setLoading(false);
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
  }, [sessionId]);

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

  if (loading) {
    return (
      <div className="grow flex flex-col gap-2 items-center justify-center p-4">
        {error && (
          <Card className="w-full max-w-md">
            <CardContent>
              <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
                {error}
              </div>
            </CardContent>
          </Card>
        )}
        {!error && (
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
    );
  }

  if (!gameSession) {
    return (
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error || "Game session not found"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {gameSession.groups?.name || "Game Session"}
            </CardTitle>
            <Badge className="text-lg px-4 py-2 font-mono">{gameCode}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-muted rounded">
              <p className="text-muted-foreground">Type</p>
              <p className="font-semibold">
                {gameSession.game_type === "guess_name"
                  ? "Guess the Name"
                  : "Guess the Face"}
              </p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-muted-foreground">Time Limit</p>
              <p className="font-semibold">
                {gameSession.time_limit_seconds || 30}s
              </p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-muted-foreground">Options</p>
              <p className="font-semibold">{gameSession.options_count || 4}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-muted-foreground">Questions</p>
              <p className="font-semibold">{gameSession.total_questions}</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={endGame} variant="destructive" className="flex-1">
              End Game
            </Button>
            <Link
              href="/protected"
              className={buttonVariants({
                variant: "outline",
                className: "flex-1",
              })}
            >
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>

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
                className="flex justify-between items-center p-3 bg-muted rounded-lg gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      player.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {player.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-x-2 shrink-0">
                  {player.correct > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      {player.correct} correct
                    </Badge>
                  )}
                  {player.wrong > 0 && (
                    <Badge variant="destructive">{player.wrong} wrong</Badge>
                  )}
                  {player.missing > 0 && (
                    <Badge variant="secondary">{player.missing} missing</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
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
    </div>
  );
}
