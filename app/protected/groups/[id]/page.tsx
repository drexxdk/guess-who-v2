import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PeopleList } from "@/components/people-list";
import { AddPersonForm } from "@/components/add-person-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GroupSettings } from "@/components/group-settings";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get group details
  const { data: groupData } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (!groupData) {
    return redirect("/protected/groups");
  }

  // Get people in this group
  const { data: people } = await supabase
    .from("people")
    .select("*")
    .eq("group_id", id)
    .order("first_name", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/protected/groups">
          <Button variant="ghost">← Back to Groups</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{groupData.name}</CardTitle>
              <CardDescription>
                {people?.length || 0} people in this group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GroupSettings groupId={id} initialGroup={groupData} />
              <div className="mt-6">
                <Link href={`/protected/game/host/${groupData.id}`}>
                  <Button className="w-full">Start Game</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add Person</CardTitle>
              <CardDescription>Add a new person to this group</CardDescription>
            </CardHeader>
            <CardContent>
              <AddPersonForm groupId={id} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
              <CardDescription>Manage people in this group</CardDescription>
            </CardHeader>
            <CardContent>
              <PeopleList people={people || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
