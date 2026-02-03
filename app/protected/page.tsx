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

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">Welcome to Guess Who!</h1>
        <p className="text-muted-foreground">
          Create groups and host exciting games or join others
        </p>
      </div>

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
