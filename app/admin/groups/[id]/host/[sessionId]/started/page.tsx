'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { endGameSession } from '@/lib/game-utils';
import { getGameSessionWithGroup } from '@/lib/queries';
import { useLoading } from '@/lib/loading-context';
import { LoadingLink } from '@/components/ui/loading-link';
import { GameQRCode } from '@/components/game-qr-code';

export default function GameStartedPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const groupId = params.id;
  const sessionId = params.sessionId;
  const { setLoading } = useLoading();
  const [gameSession, setGameSession] = useState<Awaited<ReturnType<typeof getGameSessionWithGroup>> | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadGameSession = useCallback(async () => {
    const supabase = createClient();
    const data = await getGameSessionWithGroup(supabase, sessionId);
    setGameSession(data);
    setInitialized(true);
    setLoading(false);
  }, [sessionId, setLoading]);

  useEffect(() => {
    loadGameSession();
  }, [loadGameSession]);

  async function cancelGame() {
    if (!gameSession) return;

    const supabase = createClient();
    await endGameSession(supabase, gameSession.id);

    // Navigate back to group
    setLoading(true);
    router.push(`/admin/groups/${groupId}/host`);
  }

  // Show nothing until initialized (global loading overlay handles loading state)
  if (!initialized) {
    return null;
  }

  if (!gameSession) {
    return <p>Game session not found</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card variant="flush" className="bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10">
        <CardContent className="space-y-8 p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
            </div>
            <h3 className="text-3xl font-bold">Game Started!</h3>
            <p className="text-muted-foreground mt-2 text-sm">Players can join using either method below</p>
          </div>

          {/* Code and QR Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Game Code */}
            <div className="bg-background/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">Game Code</p>
              <Badge className="bg-primary hover:bg-primary mb-4 px-8 py-4 font-mono text-5xl shadow-lg">
                {gameSession.game_code}
              </Badge>
              <p className="text-muted-foreground text-center text-xs">
                Enter at <span className="text-foreground font-mono">/game/join</span>
              </p>
            </div>

            {/* QR Code */}
            {gameSession.game_code && (
              <div className="bg-background/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
                <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  Or Scan QR Code
                </p>
                <div className="rounded-lg bg-white p-2">
                  <GameQRCode gameCode={gameSession.game_code} />
                </div>
                <p className="text-muted-foreground mt-4 text-center text-xs">Opens with code pre-filled</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button variant="outline" onClick={cancelGame} className="flex-1">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              End Game
            </Button>
            <LoadingLink
              href={`/admin/groups/${groupId}/host/${sessionId}/play`}
              className={buttonVariants({ className: 'flex-1' })}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Go to Dashboard
            </LoadingLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
