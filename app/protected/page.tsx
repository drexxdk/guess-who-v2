import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameSession {
  id: string;
  game_code: string;
  game_type: string;
  status: string;
  total_questions: number;
  groups: {
    id: string;
    name: string;
  } | null;
}

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's active game sessions
  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*, groups(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(3);

  const activeSessions = sessions || [];

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">Welcome to Guess Who!</h1>
        <p className="text-muted-foreground">
          Create groups and host exciting games or join others
        </p>
      </div>

      {/* Active Games Section */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Active Games</h2>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {activeSessions.map((session: GameSession) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{session.groups?.name || "Unknown Group"}</CardTitle>
                      <CardDescription className="text-sm">
                        {session.game_type === "guess_name" ? "Guess the Name" : "Guess the Face"}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="text-xs">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Game Code</p>
                    <Badge variant="outline" className="text-xl px-4 py-1 font-mono">
                      {session.game_code}
                    </Badge>
                  </div>
                  
                  <Link href={`/protected/game/play/${session.id}`}>
                    <Button className="w-full" size="sm">Open Game</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Groups</CardTitle>
            <CardDescription>
              Create and manage your groups of people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/protected/groups">
              <Button className="w-full">Go to My Groups</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join a Game</CardTitle>
            <CardDescription>
              Enter a game code to play
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/game/join">
              <Button className="w-full" variant="outline">
                Join Game
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create a group and add people with their photos and names</li>
              <li>Start a game and choose the mode (guess name or guess face)</li>
              <li>Share the game code with players</li>
              <li>Players join using the code and compete in real-time</li>
              <li>View results and see who knows the group best!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
