'use client';

import { useEffect, memo } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoListCard } from '@/components/ui/section-card';
import { LoadingLink } from '@/components/ui/loading-link';
import { useLoading } from '@/lib/loading-context';
import type { GameSessionWithGroup } from '@/lib/schemas';

interface AdminPageClientProps {
  activeSessions: GameSessionWithGroup[];
}

export const AdminPageClient = memo(function AdminPageClient({ activeSessions }: AdminPageClientProps) {
  const { setLoading } = useLoading();

  // Reset loading state when page mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      {/* Hero Section with Gradient */}
      <Card variant="flush" className="relative overflow-hidden">
        <div className="from-primary/10 absolute inset-0 bg-linear-to-br via-purple-500/10 to-pink-500/10" />
        <div className="relative flex items-start gap-6 p-8">
          <div className="from-primary flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br to-purple-600 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-10 w-10 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <div className="flex grow flex-col gap-4">
            <div>
              <h1 className="from-primary mb-2 bg-linear-to-r to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                Welcome to Guess Who!
              </h1>
              <p className="text-muted-foreground text-lg">
                A social icebreaker game that helps people learn about each other. Create groups for your team,
                classroom, or event and help everyone connect!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LoadingLink href="/game/join" className={buttonVariants({ size: 'lg', className: 'gap-2' })}>
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
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                Join Game
              </LoadingLink>
              <LoadingLink
                href="/admin/groups"
                className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'gap-2' })}
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
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
                My Groups
              </LoadingLink>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Games Section */}
      {activeSessions.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="text-primary h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Your Active Games</h2>
              <p className="text-muted-foreground text-sm">Continue hosting your live game sessions</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {activeSessions.map((session: GameSessionWithGroup) => (
              <Card key={session.id} variant="compact" hover className="group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {session.game_type === 'guess_name' ? (
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
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      ) : (
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
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      )}
                      <CardTitle className="text-base">{session.groups?.name || 'Unknown'}</CardTitle>
                    </div>
                    <Badge className="font-mono text-xs">{session.game_code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-primary/5 border-primary/10 flex flex-col gap-1 rounded-lg border p-2.5">
                      <p className="text-muted-foreground text-xs font-medium">Type</p>
                      <p className="text-sm font-semibold">{session.game_type === 'guess_name' ? 'Name' : 'Face'}</p>
                    </div>
                    <div className="bg-primary/5 border-primary/10 flex flex-col gap-1 rounded-lg border p-2.5">
                      <p className="text-muted-foreground text-xs font-medium">Timer</p>
                      <p className="text-sm font-semibold">{session.time_limit_seconds || 30}s</p>
                    </div>
                    <div className="bg-primary/5 border-primary/10 flex flex-col gap-1 rounded-lg border p-2.5">
                      <p className="text-muted-foreground text-xs font-medium">Options</p>
                      <p className="text-sm font-semibold">{session.options_count || 4}</p>
                    </div>
                    <div className="bg-primary/5 border-primary/10 flex flex-col gap-1 rounded-lg border p-2.5">
                      <p className="text-muted-foreground text-xs font-medium">Questions</p>
                      <p className="text-sm font-semibold">{session.total_questions}</p>
                    </div>
                  </div>

                  <LoadingLink
                    href={`/admin/groups/${session.groups?.id}/host/${session.id}/play`}
                    className={buttonVariants({ className: 'w-full gap-2 group-hover:shadow-lg' })}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                    Open Game
                  </LoadingLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <InfoListCard
        title="How It Works"
        items={[
          'Create a group and add people with their photos and names',
          'Start a game and choose the mode (guess name or guess face)',
          'Share the game code with players',
          'Players join using the code and compete in real-time',
          'View results and see who knows the group best!',
        ]}
        ordered={true}
        className="md:col-span-2"
      />
    </div>
  );
});
