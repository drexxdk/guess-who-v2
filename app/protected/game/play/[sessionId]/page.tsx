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

interface Player {
  id: string;
  name: string;
  score: number;
  answered: boolean;
}

export default function GameControlPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameSession, setGameSession] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameCode, setGameCode] = useState("");

  useEffect(() => {
    loadGameSession();
    // Set up real-time subscription for players
    const supabase = createClient();
    
    const channel = supabase
      .channel(`game:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_answers",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Reload game data when answers come in
          loadGameSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadGameSession = async () => {
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

    // Track unique players by player_name
    const playerStats = new Map<string, { name: string; score: number; totalAnswered: number }>();
    
    if (answers && answers.length > 0) {
      answers.forEach((answer: any) => {
        const playerName = answer.player_name || 'Anonymous';
        
        if (!playerStats.has(playerName)) {
          playerStats.set(playerName, { name: playerName, score: 0, totalAnswered: 0 });
        }
        
        // Only count actual answers (not join records)
        if (answer.student_id) {
          const stats = playerStats.get(playerName)!;
          stats.totalAnswered++;
          if (answer.is_correct) {
            stats.score++;
          }
        }
      });
    }

    const activePlayers: Player[] = Array.from(playerStats.entries()).map(([id, stats]) => ({
      id,
      name: stats.name,
      score: stats.score,
      answered: stats.totalAnswered === session.total_questions,
    }));

    setPlayers(activePlayers.length > 0 ? activePlayers : [
      { id: "1", name: "Waiting for players...", score: 0, answered: false }
    ]);
    setLoading(false);
  };

  const endGame = async () => {
    const supabase = createClient();
    
    await supabase
      .from("game_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    router.push("/protected");
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl">
                  {gameSession.groups?.name || "Game Session"}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Game Type: {gameSession.game_type === "guess_name" ? "Guess the Name" : "Guess the Image"}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Game Code</p>
                <Badge className="text-4xl px-8 py-4 font-mono">{gameCode}</Badge>
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
                          player.answered ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <Badge variant="secondary">{player.score} pts</Badge>
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
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-semibold capitalize">
                  {gameSession.status || "Active"}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Questions</p>
                <p className="text-lg font-semibold">
                  {gameSession.total_questions} total
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={endGame}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  End Game
                </Button>
                <Button
                  onClick={() => router.push("/protected")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
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
              <li>Share the game code <Badge variant="outline">{gameCode}</Badge> with players</li>
              <li>Players visit <strong>your-app.com/game/join</strong> and enter the code</li>
              <li>Players will see questions and answer in real-time</li>
              <li>Monitor player progress from this dashboard</li>
              <li>Click "End Game" when everyone is done</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
