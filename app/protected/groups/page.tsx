import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function GroupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get groups for this user
  const { data: groups } = await supabase
    .from("groups")
    .select(
      `
      *,
      people:people(count)
    `,
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My groups</h1>
          <p className="text-muted-foreground">
            Create and manage your groups of people
          </p>
        </div>
        <Link href="/protected/groups/new" className={buttonVariants()}>
          Create New Group
        </Link>
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any groups yet
            </p>
            <Link
              href="/protected/groups/new"
              className={buttonVariants({ className: "w-full" })}
            >
              Create Your First Group
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.people?.[0]?.count || 0} people
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize time limit and options when starting a game
                </p>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/protected/groups/${group.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "flex-1",
                    })}
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/protected/groups/${group.id}/host`}
                    className={buttonVariants({ className: "flex-1" })}
                  >
                    Start Game
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
