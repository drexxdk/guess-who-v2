"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { DeleteGroupButton } from "@/components/delete-group-button";
import { createClient } from "@/lib/supabase/client";

type GroupData = {
  id: string;
  name: string;
  creator_id: string;
  time_limit_seconds: number;
  options_count: number;
  created_at?: string;
};

type Person = {
  id: string;
  group_id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  gender: string;
};

export function GroupDetailClient({
  groupData,
  initialPeople,
  groupId,
}: {
  groupData: GroupData;
  initialPeople: Person[];
  groupId: string;
}) {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>(initialPeople);

  // Watch for changes to people in this group
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`people:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "people",
        },
        (payload) => {
          // Remove deleted person from state
          const deletedId = (payload.old as { id: string }).id;
          console.log("DELETE event received for person:", deletedId);
          setPeople((prev) => prev.filter((p) => p.id !== deletedId));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "people",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // Add new person to state
          console.log("INSERT event received:", payload.new);
          setPeople((prev) =>
            [...prev, payload.new as Person].sort((a, b) =>
              a.first_name.localeCompare(b.first_name),
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "people",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // Update person in state
          console.log("UPDATE event received:", payload.new);
          setPeople((prev) =>
            prev
              .map((p) =>
                p.id === (payload.new as Person).id
                  ? (payload.new as Person)
                  : p,
              )
              .sort((a, b) => a.first_name.localeCompare(b.first_name)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const loadPeople = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("group_id", groupId)
      .order("first_name", { ascending: true });

    if (data) {
      setPeople(data);
    }
  };

  const hasEnoughPeople = people.length >= groupData.options_count;

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
                {people.length} people in this group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GroupSettings groupId={groupId} initialGroup={groupData} />
              <div className="mt-6 space-y-2">
                <Link href={`/protected/groups/${groupData.id}/host`}>
                  <Button className="w-full" disabled={!hasEnoughPeople}>
                    Start Game
                  </Button>
                </Link>
                {!hasEnoughPeople && (
                  <p className="text-sm text-destructive text-center">
                    You need at least {groupData.options_count} people to start
                    a game
                  </p>
                )}
                <DeleteGroupButton groupId={groupId} />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add Person</CardTitle>
              <CardDescription>Add a new person to this group</CardDescription>
            </CardHeader>
            <CardContent>
              <AddPersonForm groupId={groupId} />
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
              <PeopleList people={people} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
