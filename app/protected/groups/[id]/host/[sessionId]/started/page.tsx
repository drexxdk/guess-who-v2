"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GameSessionWithGroup } from "@/lib/schemas";

export default function GameStartedPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const groupId = params.id;
  const sessionId = params.sessionId;

  const [gameSession, setGameSession] = useState<GameSessionWithGroup | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadGameSession = useCallback(async () => {
    const supabase = createClient();
    const { data: session, error } = await supabase
      .from("game_sessions")
      .select("*, groups(id, name)")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setGameSession(session as GameSessionWithGroup);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadGameSession();
  }, [loadGameSession]);

  async function cancelGame() {
    if (!gameSession) return;

    const supabase = createClient();

    // End the game by marking it as completed
    await supabase
      .from("game_sessions")
      .update({ status: "completed" })
      .eq("id", gameSession.id);

    // Navigate back to group
    router.push(`/protected/groups/${groupId}/host`);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!gameSession) {
    return <p>Game session not found</p>;
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Game started - show code */}
        <>
          <div className="text-center space-y-4 py-8">
            <h3 className="text-2xl font-bold">Game Started!</h3>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Game Code</p>
              <Badge className="text-6xl px-12 py-6 font-mono">
                {gameSession.game_code}
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
            <Link
              href={`/protected/groups/${groupId}/host/${sessionId}/play`}
              className={buttonVariants({ className: "flex-1" })}
            >
              Go to Control Dashboard
            </Link>
          </div>
        </>
      </CardContent>
    </Card>
  );
}
