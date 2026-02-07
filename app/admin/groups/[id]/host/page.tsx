'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { use } from 'react';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/ui/error-message';
import { generateGameCode, endGameSession } from '@/lib/game-utils';
import { useLoading } from '@/lib/loading-context';
import type { Group, Person, GameSession, GameType } from '@/lib/schemas';
import { logError } from '@/lib/logger';
import { GameQRCode } from '@/components/game-qr-code';

export default function GameHostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const { setLoading } = useLoading();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameCode, setGameCode] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<GameType>('guess_name');
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(30);
  const [optionsCount, setOptionsCount] = useState<number>(4);
  const [totalQuestions, setTotalQuestions] = useState<number>(1);

  const loadGroupData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Get group
      const { data: groupInfo, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get people
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('group_id', groupId);

      if (peopleError) throw peopleError;

      // Cast to Group type to include enable_timer field (for backward compatibility with DB)
      const group = groupInfo as unknown as Group;
      setGroupData(group);
      setPeople(peopleData || []);
      // Set default values from group settings
      setEnableTimer(group.enable_timer ?? true);
      setTimeLimitSeconds(group.time_limit_seconds || 30);
      setOptionsCount(group.options_count || 4);
      setTotalQuestions(Math.min((peopleData || []).length || 1, 10));
    } catch (error) {
      logError('Error loading group data:', error);
    } finally {
      setInitialized(true);
      setLoading(false);
    }
  }, [groupId, setLoading]);

  useEffect(() => {
    loadGroupData();
  }, [groupId, loadGroupData]);

  const cancelGame = async () => {
    if (!gameSession) return;

    const supabase = createClient();
    await endGameSession(supabase, gameSession.id);

    // Reset local state
    setGameSession(null);
    setGameCode('');
  };

  const startGame = async () => {
    if (!groupData) return;

    if (people.length < optionsCount) {
      setError(`You need at least ${optionsCount} people to start a game with ${optionsCount} options!`);
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    // Allow multiple games to run simultaneously - don't mark existing sessions as completed

    const code = generateGameCode();

    // Create game session with game-specific settings
    const { data: session, error: createError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        group_id: groupId,
        game_type: selectedGameType,
        total_questions: totalQuestions,
        game_code: code,
        status: 'active',
        time_limit_seconds: timeLimitSeconds,
        options_count: optionsCount,
        enable_timer: enableTimer,
      })
      .select()
      .single();

    if (createError) {
      logError(createError);
      setError('Failed to create game session');
      setLoading(false);
      return;
    }

    // Navigate to game started screen
    router.push(`/admin/groups/${groupId}/host/${session.id}/started`);
  };

  // Show nothing until initialized (global loading overlay handles loading state)
  if (!initialized) {
    return null;
  }

  const icebreakerTips = [
    "Introduce yourself and explain the game's purpose: helping everyone learn names and faces",
    "Remind participants this isn't about winning - it's about making connections",
    "Encourage players to chat with people they didn't recognize after the game",
    'Keep the atmosphere light and fun - laugh together at mistakes!',
    'Consider doing a quick round of introductions before starting',
  ];

  if (!groupData) {
    return <p>Group not found</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Start a New Game</CardTitle>
          <CardDescription>
            {groupData.name} - {people.length} people
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameSession && gameCode ? (
            // Game started - show code
            <div className="rounded-xl bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                </div>
                <h3 className="text-2xl font-bold">Game Started!</h3>
                <p className="text-muted-foreground mt-2 text-sm">Players can join using either method below</p>
              </div>

              {/* Code and QR Section */}
              <div className="mb-6 grid gap-6 md:grid-cols-2">
                {/* Game Code */}
                <div className="bg-background/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
                  <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">Game Code</p>
                  <Badge className="bg-primary hover:bg-primary mb-4 px-8 py-4 font-mono text-5xl shadow-lg">
                    {gameCode}
                  </Badge>
                  <p className="text-muted-foreground text-center text-xs">
                    Enter at <span className="text-foreground font-mono">/game/join</span>
                  </p>
                </div>

                {/* QR Code */}
                {gameCode && (
                  <div className="bg-background/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
                    <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                      Or Scan QR Code
                    </p>
                    <div className="rounded-lg bg-white p-2">
                      <GameQRCode gameCode={gameCode} />
                    </div>
                    <p className="text-muted-foreground mt-4 text-center text-xs">Opens with code pre-filled</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={cancelGame} className="flex-1">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  End Game
                </Button>
                <Button
                  onClick={() => {
                    setLoading(true);
                    router.push(`/admin/groups/${groupId}/host/${gameSession.id}/play`);
                  }}
                  className="flex-1"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            // Game not started - show setup
            <>
              <div>
                <h3 className="mb-4 text-lg font-semibold">Select Game Mode</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    variant="compact"
                    className={`cursor-pointer transition-all ${
                      selectedGameType === 'guess_name' ? 'ring-primary ring-2' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedGameType('guess_name')}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">Guess the Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">Show a photo and players guess the name</p>
                    </CardContent>
                  </Card>

                  <Card
                    variant="compact"
                    className={`cursor-pointer transition-all ${
                      selectedGameType === 'guess_image' ? 'ring-primary ring-2' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedGameType('guess_image')}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">Guess the Face</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">Show a name and players guess the photo</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold">Game Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      id="enable-timer-host"
                      type="checkbox"
                      checked={enableTimer}
                      onChange={(e) => setEnableTimer(e.target.checked)}
                      className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-2"
                    />
                    <label htmlFor="enable-timer-host" className="cursor-pointer text-sm leading-none font-medium">
                      Enable countdown timer
                    </label>
                  </div>
                  {enableTimer && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-medium">Time per question (seconds)</label>
                        <span className="bg-muted rounded px-3 py-1 text-sm font-medium">{timeLimitSeconds}s</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="1"
                        value={timeLimitSeconds}
                        onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                        className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium">Options per question</label>
                      <span className="bg-muted rounded px-3 py-1 text-sm font-medium">{optionsCount}</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max={Math.min(people.length, 10)}
                      step="1"
                      value={optionsCount}
                      onChange={(e) => setOptionsCount(Number(e.target.value))}
                      className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium">Amount of questions</label>
                      <span className="bg-muted rounded px-3 py-1 text-sm font-medium">{totalQuestions}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={people.length}
                      step="1"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={startGame} disabled={!groupData || people.length < optionsCount} className="flex-1">
                  Start Game
                </Button>
              </div>

              <ErrorMessage message={error} />

              {people.length < optionsCount && !error && (
                <p className="text-destructive text-center text-sm">
                  You need at least {optionsCount} people to start a game
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <span className="text-2xl">💡</span>
            Icebreaker Tips for Hosts
          </CardTitle>
          <CardDescription className="text-gray-700">
            Make everyone feel comfortable and set the right tone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-gray-900">
            {icebreakerTips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold text-gray-900">{index + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
