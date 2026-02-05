"use client";

import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingLink } from "@/components/ui/loading-link";
import { useLoading } from "@/lib/loading-context";

interface Group {
  id: string;
  name: string;
  people?: { count: number }[];
}

interface GroupsListProps {
  groups: Group[] | null;
}

export function GroupsList({ groups }: GroupsListProps) {
  const { setLoading } = useLoading();

  // Reset loading state when page mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My groups</h1>
          <p className="text-muted-foreground">
            Create and manage your groups of people
          </p>
        </div>
        <LoadingLink href="/protected/groups/new" className={buttonVariants()}>
          Create New Group
        </LoadingLink>
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any groups yet
            </p>
            <LoadingLink
              href="/protected/groups/new"
              className={buttonVariants({ className: "w-full" })}
            >
              Create Your First Group
            </LoadingLink>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.people?.at(0)?.count ?? 0} people
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize time limit and options when starting a game
                </p>
                <div className="flex gap-2 mt-4">
                  <LoadingLink
                    href={`/protected/groups/${group.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "flex-1",
                    })}
                  >
                    Manage
                  </LoadingLink>
                  <LoadingLink
                    href={`/protected/groups/${group.id}/host`}
                    className={buttonVariants({ className: "flex-1" })}
                  >
                    Start Game
                  </LoadingLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
