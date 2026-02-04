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

type GameType = "guess_name" | "guess_image";

interface GroupData {
  id: string;
  name: string;
  creator_id: string;
  time_limit_seconds: number;
  options_count: number;
  created_at?: string;
}

interface Person {
  id: string;
  group_id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  gender: string;
}

interface GameSession {
  id: string;
  user_id: string;
  group_id: string;
  game_type: GameType;
  total_questions: number;
  game_code: string;
  status: string;
  score?: number;
  created_at?: string;
}

export default function GameHostPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameCode, setGameCode] = useState<string>("");
  const [selectedGameType, setSelectedGameType] =
    useState<GameType>("guess_name");

  const loadGroupData = useCallback(async () => {
    const supabase = createClient();

    // Get group
    const { data: groupInfo } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    // Get people
    const { data: peopleData } = await supabase
      .from("people")
      .select("*")
      .eq("group_id", groupId);

    setGroupData(groupInfo);
    setPeople(peopleData || []);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [groupId, loadGroupData]);

  const generateGameCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const startGame = async () => {
    if (people.length < 2) {
      alert("You need at least 2 people to start a game!");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Mark any existing active sessions for this group as completed
    await supabase
      .from("game_sessions")
      .update({ status: "completed" })
      .eq("group_id", groupId)
      .eq("status", "active");

    const code = generateGameCode();

    // Create game session
    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        group_id: groupId,
        game_type: selectedGameType,
        total_questions: people.length,
        game_code: code,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to create game session");
      setLoading(false);
      return;
    }

    setGameSession(session);
    setGameCode(code);
    setLoading(false);

    // Don't navigate away - stay on this page to show the code
    // User can manually click to go to control page
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
                variant="outline"
                onClick={() => {
                  setGameSession(null);
                  setGameCode("");
                }}
                className="flex-1"
              >
                Cancel Game
              </Button>
              <Button
                onClick={() =>
                  router.push(`/protected/game/play/${gameSession.id}`)
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
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Time per question:</span>{" "}
                  {groupData.time_limit_seconds} seconds
                </p>
                <p>
                  <span className="font-medium">Options per question:</span>{" "}
                  {groupData.options_count}
                </p>
                <p>
                  <span className="font-medium">Total questions:</span>{" "}
                  {people.length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={startGame}
                disabled={loading || people.length < 2}
                className="flex-1"
              >
                {loading ? "Starting..." : "Start Game"}
              </Button>
            </div>

            {people.length < 2 && (
              <p className="text-sm text-destructive text-center">
                You need at least 2 people to start a game
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
