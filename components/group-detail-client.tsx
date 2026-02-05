"use client";

import { useState, useEffect } from "react";
import { FaPencil } from "react-icons/fa6";
import { PeopleList } from "@/components/people-list";
import { AddPersonForm } from "@/components/add-person-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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
  const [updatedGroupData, setUpdatedGroupData] =
    useState<GroupData>(groupData);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

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

  const hasEnoughPeople = people.length >= updatedGroupData.options_count;

  const handleGroupUpdate = (updated: {
    name: string;
    time_limit_seconds: number;
    options_count: number;
  }) => {
    setUpdatedGroupData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{updatedGroupData.name}</CardTitle>
                <CardDescription>
                  {people.length} people in this group
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditingSettings(true)}
                variant="outline"
                size="icon"
              >
                <FaPencil className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <GroupSettings
              groupId={groupId}
              initialGroup={updatedGroupData}
              peopleCount={people.length}
              onUpdate={handleGroupUpdate}
              isEditing={isEditingSettings}
              onEditChange={setIsEditingSettings}
            />
            <div className="mt-6 space-y-2">
              <Link
                href={`/protected/groups/${updatedGroupData.id}/host`}
                className={buttonVariants({
                  className: `w-full ${!hasEnoughPeople ? "opacity-50 pointer-events-none" : ""}`,
                })}
              >
                Start Game
              </Link>
              {!hasEnoughPeople && (
                <p className="text-sm text-destructive text-center">
                  You need at least {updatedGroupData.options_count} people to
                  start a game
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
  );
}
