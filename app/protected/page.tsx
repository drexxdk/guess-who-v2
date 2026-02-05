import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GameSession {
  id: string;
  game_code: string;
  game_type: string;
  status: string;
  total_questions: number;
  time_limit_seconds?: number;
  options_count?: number;
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
              <Card
                key={session.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base">
                    {session.game_type === "guess_name"
                      ? "Guess the Name"
                      : "Guess the Face"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Group</p>
                      <p className="font-semibold">
                        {session.groups?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Code</p>
                      <p className="font-semibold font-mono">
                        {session.game_code}
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Time Limit</p>
                      <p className="font-semibold">
                        {session.time_limit_seconds || 30}s
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Options</p>
                      <p className="font-semibold">
                        {session.options_count || 4}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/protected/groups/${session.groups?.id}/host/${session.id}/play`}
                    className={buttonVariants()}
                  >
                    Open Game
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
            <Link href="/protected/groups" className={buttonVariants()}>
              Go to My Groups
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join a Game</CardTitle>
            <CardDescription>Enter a game code to play</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/game/join"
              className={buttonVariants({ variant: "outline" })}
            >
              Join Game
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
              <li>
                Start a game and choose the mode (guess name or guess face)
              </li>
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
