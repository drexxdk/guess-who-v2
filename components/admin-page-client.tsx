'use client';

import { useEffect } from 'react';
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

export function AdminPageClient({ activeSessions }: AdminPageClientProps) {
  const { setLoading } = useLoading();

  // Reset loading state when page mounts
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="flex items-start gap-4">
        <div className="flex grow flex-col gap-4">
          <h1 className="mb-2 text-3xl font-bold">Welcome to Guess Who!</h1>
          <p className="text-muted-foreground">
            A social icebreaker game that helps people learn about each other. Create groups for your team, classroom,
            or event and help everyone connect!
          </p>
          <div className="wrap flex gap-4">
            <LoadingLink href="/game/join" className={buttonVariants()}>
              Join Game
            </LoadingLink>
            <LoadingLink href="/admin/groups" className={buttonVariants()}>
              My groups
            </LoadingLink>
          </div>
        </div>
      </div>

      {/* Active Games Section */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Your Active Games</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {activeSessions.map((session: GameSessionWithGroup) => (
              <Card key={session.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{session.groups?.name || 'Unknown'}</CardTitle>
                    <Badge className="font-mono">{session.game_code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-semibold">
                        {session.game_type === 'guess_name' ? 'Guess the Name' : 'Guess the Face'}
                      </p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Time Limit</p>
                      <p className="font-semibold">{session.time_limit_seconds || 30}s</p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Options</p>
                      <p className="font-semibold">{session.options_count || 4}</p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Questions</p>
                      <p className="font-semibold">{session.total_questions}</p>
                    </div>
                  </div>

                  <LoadingLink
                    href={`/admin/groups/${session.groups?.id}/host/${session.id}/play`}
                    className={buttonVariants()}
                  >
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
}
