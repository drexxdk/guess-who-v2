"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { generateGameCode, endGameSession } from "@/lib/game-utils";
import type { Group, Person, GameSession, GameType } from "@/lib/schemas";
import { logError } from "@/lib/logger";

export default function GameHostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameCode, setGameCode] = useState<string>("");
  const [selectedGameType, setSelectedGameType] =
    useState<GameType>("guess_name");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(30);
  const [optionsCount, setOptionsCount] = useState<number>(4);
  const [totalQuestions, setTotalQuestions] = useState<number>(1);

  const loadGroupData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Get group
      const { data: groupInfo, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      // Get people
      const { data: peopleData, error: peopleError } = await supabase
        .from("people")
        .select("*")
        .eq("group_id", groupId);

      if (peopleError) throw peopleError;

      setGroupData(groupInfo);
      setPeople(peopleData || []);
      // Set default values from group settings
      setTimeLimitSeconds(groupInfo.time_limit_seconds || 30);
      setOptionsCount(groupInfo.options_count || 4);
      setTotalQuestions(Math.min((peopleData || []).length || 1, 10));
    } catch (error) {
      logError("Error loading group data:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [groupId, loadGroupData]);

  const cancelGame = async () => {
    if (!gameSession) return;

    const supabase = createClient();
    await endGameSession(supabase, gameSession.id);

    // Reset local state
    setGameSession(null);
    setGameCode("");
  };

  const startGame = async () => {
    if (!groupData) return;

    if (people.length < optionsCount) {
      setError(
        `You need at least ${optionsCount} people to start a game with ${optionsCount} options!`,
      );
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    // Allow multiple games to run simultaneously - don't mark existing sessions as completed

    const code = generateGameCode();

    // Create game session with game-specific settings
    const { data: session, error: createError } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        group_id: groupId,
        game_type: selectedGameType,
        total_questions: totalQuestions,
        game_code: code,
        status: "active",
        time_limit_seconds: timeLimitSeconds,
        options_count: optionsCount,
      })
      .select()
      .single();

    if (createError) {
      logError(createError);
      setError("Failed to create game session");
      setLoading(false);
      return;
    }

    // Navigate to game started screen
    router.push(`/protected/groups/${groupId}/host/${session.id}/started`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!groupData) {
    return <p>Group not found</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a New Game</CardTitle>
        <CardDescription>
          {groupData.name} - {people.length} people
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {gameSession && gameCode ? (
          // Game started - show code
          <>
            <div className="text-center space-y-4 py-8">
              <h3 className="text-2xl font-bold">Game Started!</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Game Code</p>
                <Badge className="text-6xl px-12 py-6 font-mono">
                  {gameCode}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Share this code with players so they can join at{" "}
                <span className="font-mono">/game/join</span>
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={cancelGame}
                className="flex-1"
              >
                End Game
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/protected/groups/${groupId}/host/${gameSession.id}/play`,
                  )
                }
                className="flex-1"
              >
                Go to Control Dashboard
              </Button>
            </div>
          </>
        ) : (
          // Game not started - show setup
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Game Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedGameType === "guess_name"
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedGameType("guess_name")}
                >
                  <CardHeader>
                    <CardTitle className="text-base">Guess the Name</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Show a photo and players guess the name
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    selectedGameType === "guess_image"
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedGameType("guess_image")}
                >
                  <CardHeader>
                    <CardTitle className="text-base">Guess the Face</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Show a name and players guess the photo
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">
                      Time per question (seconds)
                    </label>
                    <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
                      {timeLimitSeconds}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="1"
                    value={timeLimitSeconds}
                    onChange={(e) =>
                      setTimeLimitSeconds(Number(e.target.value))
                    }
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">
                      Options per question
                    </label>
                    <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
                      {optionsCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max={Math.min(people.length, 10)}
                    step="1"
                    value={optionsCount}
                    onChange={(e) => setOptionsCount(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">
                      Amount of questions
                    </label>
                    <span className="text-sm font-medium bg-muted px-3 py-1 rounded">
                      {totalQuestions}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={people.length}
                    step="1"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={startGame}
                disabled={loading || !groupData || people.length < optionsCount}
                className="flex-1"
              >
                {loading ? "Starting..." : "Start Game"}
              </Button>
            </div>

            <ErrorMessage message={error} />

            {people.length < optionsCount && !error && (
              <p className="text-sm text-destructive text-center">
                You need at least {optionsCount} people to start a game
              </p>
            )}
          </>
        )}
      </CardContent>
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </Card>
  );
}
