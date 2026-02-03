"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { use } from "react";

type GameType = "guess_name" | "guess_image";

export default function GameHostPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [gameSession, setGameSession] = useState<any>(null);
  const [gameCode, setGameCode] = useState<string>("");
  const [selectedGameType, setSelectedGameType] = useState<GameType>("guess_name");

  useEffect(() => {
    loadGroupData();
  }, [classId]);

  const loadGroupData = async () => {
    const supabase = createClient();
    
    // Get group
    const { data: groupInfo } = await supabase
      .from("groups")
      .select("*")
      .eq("id", classId)
      .single();

    // Get people
    const { data: peopleData } = await supabase
      .from("people")
      .select("*")
      .eq("group_id", classId);

    setGroupData(groupInfo);
    setPeople(peopleData || []);
    setLoading(false);
  };

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

    const code = generateGameCode();
    
    // Create game session
    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        group_id: classId,
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

    // Navigate to active game page
    router.push(`/protected/game/play/${session.id}`);
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!groupData) {
    return <div className="container mx-auto py-8">Group not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Start a New Game</CardTitle>
          <CardDescription>
            {groupData.name} - {people.length} people
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
