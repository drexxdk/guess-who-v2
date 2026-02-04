"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GameType = "guess_name" | "guess_image";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  gender: string;
}

interface Question {
  person: Person;
  options: Person[];
}

interface GameSession {
  id: string;
  group_id: string;
  game_type: GameType;
  total_questions: number;
  game_code: string;
  status: string;
}

export default function GamePlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameCode = searchParams.get("code");
  const playerName = searchParams.get("name");

  const [loading, setLoading] = useState(true);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generateQuestions = useCallback(
    (
      allPeople: Person[],
      gameType: GameType,
      count: number,
      optionsCount: number,
    ) => {
      if (allPeople.length < 2) {
        alert("Not enough people in this group to play!");
        return;
      }

      const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
      const questionList: Question[] = [];

      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const correctPerson = shuffled[i];

        // Get wrong options based on options_count (e.g., if options_count is 3, we need 2 wrong options + 1 correct)
        const numWrongOptions = Math.max(1, optionsCount - 1);
        const wrongOptions = allPeople
          .filter((p) => p.id !== correctPerson.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(numWrongOptions, allPeople.length - 1));

        const options = [...wrongOptions, correctPerson].sort(
          () => Math.random() - 0.5,
        );

        questionList.push({
          person: correctPerson,
          options,
        });
      }

      setQuestions(questionList);
      setTimeLeft(30); // Reset timer for first question
    },
    [],
  );

  const loadGame = useCallback(async () => {
    // Reset all game state at the start
    setLoading(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(30);
    setGameStarted(false);

    const supabase = createClient();

    // Store game code and player name for "Play Again" feature
    if (gameCode && playerName) {
      sessionStorage.setItem("lastGameCode", gameCode);
      sessionStorage.setItem("lastPlayerName", playerName);
    }

    // Find game session by code
    const { data: session } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("game_code", gameCode)
      .eq("status", "active")
      .single();

    if (!session) {
      alert("Game not found!");
      router.push("/game/join");
      return;
    }

    setGameSession(session);

    // Delete any previous answers by this player in this session to give them a fresh start
    if (playerName) {
      await supabase
        .from("game_answers")
        .delete()
        .eq("session_id", session.id)
        .eq("player_name", playerName);

      // Create a lightweight tracking entry
      await supabase.from("game_answers").insert({
        session_id: session.id,
        player_name: playerName,
        is_correct: false,
        response_time_ms: 0,
      });
    }

    // Load people from the group
    const { data: peopleData, error: peopleError } = await supabase
      .from("people")
      .select("*")
      .eq("group_id", session.group_id);

    console.log("People data:", peopleData, "Error:", peopleError);

    if (!peopleData || peopleData.length === 0) {
      alert("This group has no people! Add people to the group first.");
      router.push("/game/join");
      return;
    }

    // Load group settings to get options_count
    const { data: groupData } = await supabase
      .from("groups")
      .select("options_count")
      .eq("id", session.group_id)
      .single();

    const optionsCount = groupData?.options_count || 4;

    generateQuestions(
      peopleData,
      session.game_type,
      session.total_questions,
      optionsCount,
    );

    setLoading(false);
    setGameStarted(true);
  }, [gameCode, router, playerName, generateQuestions]);

  const finishGame = useCallback(async () => {
    if (!gameSession) return;

    const supabase = createClient();

    // Save final score but don't mark session as completed
    // The session will only be marked complete when the host clicks "End Game"
    await supabase
      .from("game_sessions")
      .update({
        score,
      })
      .eq("id", gameSession.id);

    // Redirect to results page
    router.push(
      `/game/results?session=${gameSession.id}&score=${score}&total=${questions.length}&code=${gameSession.game_code}&name=${encodeURIComponent(playerName || "")}&gameCode=${gameSession.game_code}`,
    );
  }, [gameSession, score, questions.length, router, playerName]);

  const handleAnswer = useCallback(
    async (answerId: string | null) => {
      if (answered || !gameSession) return;

      setAnswered(true);
      setSelectedAnswer(answerId);

      const isCorrect = answerId === questions[currentQuestion].person.id;

      if (isCorrect) {
        setScore(score + 1);
      }

      // Save answer to database
      const supabase = createClient();
      await supabase.from("game_answers").insert({
        session_id: gameSession.id,
        student_id: questions[currentQuestion].person.id,
        selected_student_id: answerId,
        is_correct: isCorrect,
        response_time_ms: (30 - timeLeft) * 1000,
        player_name: playerName,
      });

      // Move to next question after delay
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setAnswered(false);
          setTimeLeft(30);
        } else {
          // Game finished
          finishGame();
        }
      }, 2000);
    },
    [
      answered,
      gameSession,
      questions,
      currentQuestion,
      score,
      timeLeft,
      playerName,
      finishGame,
    ],
  );

  useEffect(() => {
    if (gameCode && playerName) {
      loadGame();
    }
  }, [gameCode, playerName, loadGame]);

  // Watch for session status changes (when host ends game)
  useEffect(() => {
    if (!gameSession?.id || !playerName) return;

    const supabase = createClient();
    const sessionId = gameSession.id;
    const gameCode = gameSession.game_code;

    const channel = supabase
      .channel(`game:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedSession = payload.new as GameSession;
          if (updatedSession.status === "completed") {
            // Game ended by host - redirect to results
            router.push(
              `/game/results?session=${sessionId}&score=${score}&total=${questions.length}&code=${gameCode}&name=${encodeURIComponent(playerName || "")}`,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    gameSession?.id,
    playerName,
    score,
    questions.length,
    router,
    gameSession?.game_code,
  ]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleAnswer(null);
    }
  }, [timeLeft, answered, gameStarted, handleAnswer]);

  return (
    <RenderState
      state={
        loading
          ? { type: "loading" }
          : !gameStarted || questions.length === 0
            ? { type: "waiting-for-start" }
            : !questions[currentQuestion]
              ? { type: "loading-question" }
              : {
                  type: "active",
                  gameType: gameSession!.game_type,
                  playerName: playerName || "Player",
                  score,
                  question: questions[currentQuestion],
                  currentQuestion,
                  questions,
                  timeLeft,
                  selectedAnswer,
                  answered,
                  handleAnswer,
                }
      }
    />
  );
}

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full max-w-screen-lg", className)}>{children}</div>
  );
};

const Message = ({ text }: { text: string }) => {
  return (
    <Card>
      <CardContent>
        <p>{text}</p>
      </CardContent>
    </Card>
  );
};

interface State {
  type: "loading" | "waiting-for-start" | "loading-question" | "active";
}

interface LoadingState extends State {
  type: "loading";
}

interface WaitingForStartState extends State {
  type: "waiting-for-start";
}

interface LoadingQuestionState extends State {
  type: "loading-question";
}

interface ActiveState extends State {
  type: "active";
  gameType: GameType;
  playerName: string;
  score: number;
  question: Question;
  currentQuestion: number;
  questions: Question[];
  timeLeft: number;
  selectedAnswer: string | null;
  answered: boolean;
  handleAnswer: (answerId: string | null) => void;
}

type StateUnion =
  | LoadingState
  | WaitingForStartState
  | LoadingQuestionState
  | ActiveState;

const RenderState = ({ state }: { state: StateUnion }) => {
  switch (state.type) {
    case "loading":
      return (
        <Container>
          <Message text="Loading game..." />
        </Container>
      );
    case "waiting-for-start":
      return (
        <Container>
          <Message text="Waiting for game to start..." />
        </Container>
      );
    case "loading-question":
      return (
        <Container>
          <Message text="Loading question..." />
        </Container>
      );
    case "active":
      return (
        <Container className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-white">
              <p className="text-sm opacity-80">{state.playerName}</p>
              <p className="text-2xl font-bold">
                Score: {state.score}/{state.questions.length}
              </p>
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-80">
                Question {state.currentQuestion + 1}/{state.questions.length}
              </p>
              <Badge
                variant={state.timeLeft < 10 ? "destructive" : "default"}
                className="text-2xl px-4 py-2"
              >
                {state.timeLeft}s
              </Badge>
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {state.gameType === "guess_name"
                  ? "Who is this?"
                  : "Where is " + state.question.person.first_name + "?"}
              </CardTitle>
            </CardHeader>
            {state.gameType === "guess_name" && (
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-64 h-64 rounded-lg overflow-hidden border-4 border-gray-200">
                    <Image
                      src={
                        state.question.person.image_url || "/placeholder.png"
                      }
                      alt="Person"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {state.question.options.map((option) => {
              const isSelected = state.selectedAnswer === option.id;
              const isCorrect = option.id === state.question.person.id;

              let buttonClass = "h-auto min-h-[120px] text-lg font-semibold";

              if (state.answered) {
                if (isCorrect) {
                  buttonClass += " bg-green-500 hover:bg-green-500 text-white";
                } else if (isSelected) {
                  buttonClass += " bg-red-500 hover:bg-red-500 text-white";
                }
              }

              return (
                <Button
                  key={option.id}
                  onClick={() => state.handleAnswer(option.id)}
                  disabled={state.answered}
                  className={buttonClass}
                  variant={state.answered ? "default" : "outline"}
                >
                  {state.gameType === "guess_name" ? (
                    <span>
                      {option.first_name} {option.last_name}
                    </span>
                  ) : (
                    <div className="relative w-full h-32">
                      <Image
                        src={option.image_url || "/placeholder.png"}
                        alt={`${option.first_name} ${option.last_name}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {state.answered && (
            <div className="text-center">
              <Card
                className={
                  state.selectedAnswer === state.question.person.id
                    ? "bg-green-100"
                    : "bg-red-100"
                }
              >
                <CardContent className="p-4">
                  <p className="text-xl font-bold">
                    {state.selectedAnswer === state.question.person.id
                      ? "✓ Correct!"
                      : "✗ Wrong!"}
                  </p>
                  {state.selectedAnswer !== state.question.person.id && (
                    <p className="text-sm mt-2">
                      Correct answer: {state.question.person.first_name}{" "}
                      {state.question.person.last_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </Container>
      );
    default:
      const _exhaustiveCheck: undefined = state;
      return _exhaustiveCheck;
  }
};
