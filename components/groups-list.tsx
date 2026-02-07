'use client';

import { useEffect } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingLink } from '@/components/ui/loading-link';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredGrid, StaggeredGridItem } from '@/components/ui/staggered-list';
import { useLoading } from '@/lib/loading-context';

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My groups</h1>
          <p className="text-muted-foreground">
            Create groups for your team, classroom, or event. Help people learn names and faces!
          </p>
        </div>
        <LoadingLink href="/protected/groups/new" className={buttonVariants()}>
          Create New Group
        </LoadingLink>
      </div>

      {!groups || groups.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title="No groups yet"
          description="Create your first group to help people get to know each other through an icebreaker game"
          action={
            <LoadingLink href="/protected/groups/new" className={buttonVariants({ size: 'lg' })}>
              Create Your First Group
            </LoadingLink>
          }
        />
      ) : (
        <StaggeredGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <StaggeredGridItem key={group.id}>
              <Card hover className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.people?.at(0)?.count ?? 0} people</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex gap-2">
                    <LoadingLink
                      href={`/protected/groups/${group.id}`}
                      className={buttonVariants({
                        variant: 'outline',
                        className: 'flex-1',
                      })}
                    >
                      Manage
                    </LoadingLink>
                    <LoadingLink
                      href={`/protected/groups/${group.id}/host`}
                      className={buttonVariants({ className: 'flex-1' })}
                    >
                      Start Game
                    </LoadingLink>
                  </div>
                </CardContent>
              </Card>
            </StaggeredGridItem>
          ))}
        </StaggeredGrid>
      )}
    </>
  );
}
