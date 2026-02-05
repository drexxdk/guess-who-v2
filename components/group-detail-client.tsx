"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import type { Group, Person } from "@/lib/schemas";
import { logger } from "@/lib/logger";
import {
  useMultiRealtimeSubscription,
  getPayloadNew,
  getPayloadOld,
} from "@/lib/hooks/use-realtime";
import { useLoading } from "@/lib/loading-context";
import { LoadingLink } from "@/components/ui/loading-link";

export function GroupDetailClient({
  groupData,
  initialPeople,
  groupId,
}: {
  groupData: Group;
  initialPeople: Person[];
  groupId: string;
}) {
  const { setLoading } = useLoading();
  const [updatedGroupData, setUpdatedGroupData] = useState<Group>(groupData);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Reset loading state when component mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Realtime event handlers
  const handleDelete = useCallback(
    (payload: Parameters<typeof getPayloadOld<Person>>[0]) => {
      const oldData = getPayloadOld<Person>(payload);
      if (!oldData?.id) return;
      logger.log("DELETE event received for person:", oldData.id);
      setPeople((prev) => prev.filter((p) => p.id !== oldData.id));
    },
    [],
  );

  const handleInsert = useCallback(
    (payload: Parameters<typeof getPayloadNew<Person>>[0]) => {
      const newPerson = getPayloadNew<Person>(payload);
      if (!newPerson?.id) return;
      logger.log("INSERT event received:", newPerson);
      setPeople((prev) =>
        [...prev, newPerson].sort((a, b) =>
          a.first_name.localeCompare(b.first_name),
        ),
      );
    },
    [],
  );

  const handleUpdate = useCallback(
    (payload: Parameters<typeof getPayloadNew<Person>>[0]) => {
      const updatedPerson = getPayloadNew<Person>(payload);
      if (!updatedPerson?.id) return;
      logger.log("UPDATE event received:", updatedPerson);
      setPeople((prev) =>
        prev
          .map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
          .sort((a, b) => a.first_name.localeCompare(b.first_name)),
      );
    },
    [],
  );

  // Watch for changes to people in this group
  const realtimeConfig = useMemo(
    () => ({
      channelName: `people:${groupId}`,
      subscriptions: [
        {
          table: "people",
          event: "DELETE" as const,
          onEvent: handleDelete,
        },
        {
          table: "people",
          event: "INSERT" as const,
          filter: `group_id=eq.${groupId}`,
          onEvent: handleInsert,
        },
        {
          table: "people",
          event: "UPDATE" as const,
          filter: `group_id=eq.${groupId}`,
          onEvent: handleUpdate,
        },
      ],
    }),
    [groupId, handleDelete, handleInsert, handleUpdate],
  );

  useMultiRealtimeSubscription<Person>(realtimeConfig);

  const hasEnoughPeople =
    people.length >= (updatedGroupData.options_count ?? 4);

  const handleGroupUpdate = (
    updated: Pick<Group, "name" | "time_limit_seconds" | "options_count">,
  ) => {
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
              <LoadingLink
                href={`/protected/groups/${updatedGroupData.id}/host`}
                className={buttonVariants({
                  className: `w-full ${!hasEnoughPeople ? "opacity-50 pointer-events-none" : ""}`,
                })}
              >
                Start Game
              </LoadingLink>
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
