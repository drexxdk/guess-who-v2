'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { FaPencil } from 'react-icons/fa6';
import { PeopleList } from '@/components/people-list';
import { AddPersonForm } from '@/components/add-person-form';
import { BulkUploadPeople } from '@/components/bulk-upload-people';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionCard } from '@/components/ui/section-card';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { GroupSettings } from '@/components/group-settings';
import { DeleteGroupButton } from '@/components/delete-group-button';
import { DuplicateGroupButton } from '@/components/duplicate-group-button';
import type { Group, Person } from '@/lib/schemas';
import { logger } from '@/lib/logger';
import { useMultiRealtimeSubscription, getPayloadNew, getPayloadOld } from '@/lib/hooks/use-realtime';
import { useLoading } from '@/lib/loading-context';
import { LoadingLink } from '@/components/ui/loading-link';

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
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');

  // Reset loading state when component mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Realtime event handlers
  const handleDelete = useCallback((payload: Parameters<typeof getPayloadOld<Person>>[0]) => {
    const oldData = getPayloadOld<Person>(payload);
    if (!oldData?.id) return;
    logger.log('DELETE event received for person:', oldData.id);
    setPeople((prev) => prev.filter((p) => p.id !== oldData.id));
  }, []);

  const handleInsert = useCallback((payload: Parameters<typeof getPayloadNew<Person>>[0]) => {
    const newPerson = getPayloadNew<Person>(payload);
    if (!newPerson?.id) return;
    logger.log('INSERT event received:', newPerson);
    setPeople((prev) => [...prev, newPerson].sort((a, b) => a.first_name.localeCompare(b.first_name)));
  }, []);

  const handleUpdate = useCallback((payload: Parameters<typeof getPayloadNew<Person>>[0]) => {
    const updatedPerson = getPayloadNew<Person>(payload);
    if (!updatedPerson?.id) return;
    logger.log('UPDATE event received:', updatedPerson);
    setPeople((prev) =>
      prev
        .map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
        .sort((a, b) => a.first_name.localeCompare(b.first_name)),
    );
  }, []);

  // Watch for changes to people in this group
  const realtimeConfig = useMemo(
    () => ({
      channelName: `people:${groupId}`,
      subscriptions: [
        {
          table: 'people',
          event: 'DELETE' as const,
          onEvent: handleDelete,
        },
        {
          table: 'people',
          event: 'INSERT' as const,
          filter: `group_id=eq.${groupId}`,
          onEvent: handleInsert,
        },
        {
          table: 'people',
          event: 'UPDATE' as const,
          filter: `group_id=eq.${groupId}`,
          onEvent: handleUpdate,
        },
      ],
    }),
    [groupId, handleDelete, handleInsert, handleUpdate],
  );

  useMultiRealtimeSubscription<Person>(realtimeConfig);

  const hasEnoughPeople = people.length >= (updatedGroupData.options_count ?? 4);

  const handleGroupUpdate = (updated: Pick<Group, 'name' | 'time_limit_seconds' | 'options_count'>) => {
    setUpdatedGroupData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card variant="flush">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative flex items-start justify-between gap-6 p-8">
            <div className="flex items-start gap-6">
              <div className="bg-linear-to-br from-primary to-purple-600 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-8 w-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="mb-2 text-3xl font-bold">{updatedGroupData.name}</h1>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="text-primary h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                  <p className="text-muted-foreground text-lg">
                    <span className="font-semibold text-foreground">{people.length}</span> people in this group
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditingSettings(true)}
              variant="outline"
              size="icon"
              aria-label="Edit group settings"
              className="shrink-0"
            >
              <FaPencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {/* Group Settings */}
          <Card variant="compact">
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="text-primary h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <CardTitle>Game Settings</CardTitle>
              </div>
              <CardDescription>Configure how games will be played in this group</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupSettings
                groupId={groupId}
                initialGroup={updatedGroupData}
                peopleCount={people.length}
                onUpdate={handleGroupUpdate}
                isEditing={isEditingSettings}
                onEditChange={setIsEditingSettings}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card variant="compact">
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="text-primary h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                <CardTitle>Actions</CardTitle>
              </div>
              <CardDescription>Start a game or manage this group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <LoadingLink
                href={`/admin/groups/${updatedGroupData.id}/host`}
                className={buttonVariants({
                  className: `w-full gap-2 ${!hasEnoughPeople ? 'pointer-events-none opacity-50' : ''}`,
                })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                Start Game
              </LoadingLink>
              {!hasEnoughPeople && (
                <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="text-destructive h-5 w-5 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-destructive text-sm">
                    You need at least {updatedGroupData.options_count} people to start a game
                  </p>
                </div>
              )}
              <DuplicateGroupButton groupId={groupId} />
              <DeleteGroupButton groupId={groupId} />
            </CardContent>
          </Card>

          {/* Add Person */}
          <SectionCard title="Add Person" description="Add new people to this group">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={uploadMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setUploadMode('single')}
                  className="flex-1"
                >
                  Single Person
                </Button>
                <Button
                  variant={uploadMode === 'bulk' ? 'default' : 'outline'}
                  onClick={() => setUploadMode('bulk')}
                  className="flex-1"
                >
                  Bulk Upload (CSV)
                </Button>
              </div>
              {uploadMode === 'single' ? (
                <AddPersonForm groupId={groupId} />
              ) : (
                <BulkUploadPeople groupId={groupId} />
              )}
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="People" description="Manage people in this group">
            <PeopleList people={people} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
