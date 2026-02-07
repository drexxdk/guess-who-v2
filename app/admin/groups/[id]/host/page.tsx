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

  const initializedContent = gameSession && gameCode ? (
    <GameStartedContent 
      gameCode={gameCode} 
      gameSession={gameSession} 
      groupId={groupId} 
      cancelGame={cancelGame} 
      router={router} 
      setLoading={setLoading} 
    />
  ) : (
    <GameSetupContent 
      selectedGameType={selectedGameType}
      setSelectedGameType={setSelectedGameType}
      enableTimer={enableTimer}
      setEnableTimer={setEnableTimer}
      timeLimitSeconds={timeLimitSeconds}
      setTimeLimitSeconds={setTimeLimitSeconds}
      optionsCount={optionsCount}
      setOptionsCount={setOptionsCount}
      totalQuestions={totalQuestions}
      setTotalQuestions={setTotalQuestions}
      people={people}
      router={router}
      startGame={startGame}
      groupData={groupData}
      error={error}
    />
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Hero Header */}
      <Card variant="flush">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative flex items-start gap-6 p-8">
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
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold">Start a New Game</h1>
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
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
                <p className="text-muted-foreground text-lg">
                  <span className="text-foreground font-semibold">{groupData.name}</span> • {people.length} people
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="compact">
        <CardContent className="space-y-6">{initializedContent}
        </CardContent>
      </Card>
      
      <Card variant="compact" className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <span className="text-2xl">💡</span>
            Icebreaker Tips for Hosts
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300">
            Make everyone feel comfortable and set the right tone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
            {icebreakerTips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">{index + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function GameStartedContent({ gameCode, gameSession, groupId, cancelGame, router, setLoading }: { 
  gameCode: string; 
  gameSession: GameSession; 
  groupId: string; 
  cancelGame: () => Promise<void>; 
  router: ReturnType<typeof useRouter>; 
  setLoading: (loading: boolean) => void; 
}) {
  return (
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
        <Button variant="outline" onClick={cancelGame} className="flex-1 gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          End Game
        </Button>
        <Button
          onClick={() => {
            setLoading(true);
            router.push(`/admin/groups/${groupId}/host/${gameSession.id}/play`);
          }}
          className="flex-1 gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function GameSetupContent({ 
  selectedGameType, 
  setSelectedGameType, 
  enableTimer, 
  setEnableTimer, 
  timeLimitSeconds, 
  setTimeLimitSeconds, 
  optionsCount, 
  setOptionsCount, 
  totalQuestions, 
  setTotalQuestions, 
  people, 
  router, 
  startGame, 
  groupData, 
  error 
}: { 
  selectedGameType: GameType; 
  setSelectedGameType: (type: GameType) => void; 
  enableTimer: boolean; 
  setEnableTimer: (value: boolean) => void; 
  timeLimitSeconds: number; 
  setTimeLimitSeconds: (value: number) => void; 
  optionsCount: number; 
  setOptionsCount: (value: number) => void; 
  totalQuestions: number; 
  setTotalQuestions: (value: number) => void; 
  people: Person[]; 
  router: ReturnType<typeof useRouter>; 
  startGame: () => Promise<void>; 
  groupData: Group | null; 
  error: string | null; 
}) {
  return (
    <>
      <div>
        <div className="mb-4 flex items-center gap-2">
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
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
          <h3 className="text-lg font-semibold">Select Game Mode</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Guess the Name */}
          <Card
            variant="flush"
            className={`group cursor-pointer overflow-hidden transition-all ${
              selectedGameType === 'guess_name' ? 'ring-primary ring-2' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedGameType('guess_name')}
          >
            <div className="relative overflow-hidden bg-linear-to-br from-blue-500/10 to-cyan-500/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-blue-500/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                {selectedGameType === 'guess_name' && (
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h4 className="mb-2 text-xl font-bold">Guess the Name</h4>
              <p className="text-muted-foreground mb-4 text-sm">Players see a photo and guess the person&apos;s name</p>
              
              {/* Visual Example */}
              <div className="bg-background/50 relative rounded-lg border p-4">
                <div className="absolute -right-1 -top-1 rotate-12 rounded-lg bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-sm">
                  Example
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                    <svg className="text-muted-foreground h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1 text-xs">Players guess:</p>
                    <p className="font-mono text-sm font-semibold">? ? ?</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Guess the Face */}
          <Card
            variant="flush"
            className={`group cursor-pointer overflow-hidden transition-all ${
              selectedGameType === 'guess_image' ? 'ring-primary ring-2' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedGameType('guess_image')}
          >
            <div className="relative overflow-hidden bg-linear-to-br from-purple-500/10 to-pink-500/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-purple-500/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                {selectedGameType === 'guess_image' && (
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h4 className="mb-2 text-xl font-bold">Guess the Face</h4>
              <p className="text-muted-foreground mb-4 text-sm">Players see a name and guess the person&apos;s photo</p>
              
              {/* Visual Example */}
              <div className="bg-background/50 relative rounded-lg border p-4">
                <div className="absolute -right-1 -top-1 rotate-12 rounded-lg bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-sm">
                  Example
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                    <span className="text-2xl">?</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1 text-xs">Players see name:</p>
                    <p className="font-mono text-sm font-semibold">John Smith</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
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
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Game Settings</h3>
        </div>
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
        <Button variant="outline" onClick={() => router.back()} className="flex-1 gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
        </Button>
        <Button onClick={startGame} disabled={!groupData || people.length < optionsCount} className="flex-1 gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
            />
          </svg>
          Start Game
        </Button>
      </div>

      <ErrorMessage message={error} />

      {people.length < optionsCount && !error && (
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
            You need at least {optionsCount} people to start a game
          </p>
        </div>
      )}
    </>
  );
}
