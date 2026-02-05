"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { markPlayerAsLeft } from "@/app/actions/mark-player-left";
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
  time_limit_seconds?: number;
}

export default function GamePlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameCode = searchParams?.get("code");
  const playerName = searchParams?.get("name");
  const retry = searchParams?.get("retry"); // Flag to indicate this is a retry/fresh start

  const [loading, setLoading] = useState(true);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [joinRecordId, setJoinRecordId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );

  const generateQuestions = useCallback(
    (
      allPeople: Person[],
      gameType: GameType,
      count: number,
      optionsCount: number,
    ): Question[] => {
      if (allPeople.length < 2) {
        alert("Not enough people in this group to play!");
        return [];
      }

      const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
      const questionList: Question[] = [];

      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const correctPerson = shuffled[i];

        // Get wrong options based on options_count (e.g., if options_count is 3, we need 2 wrong options + 1 correct)
        const numWrongOptions = Math.max(1, optionsCount - 1);

        // Filter candidates by the same gender as the correct person
        const samGenderPeople = allPeople.filter(
          (p) => p.id !== correctPerson.id && p.gender === correctPerson.gender,
        );

        // If not enough same gender people, fall back to any gender
        const candidates =
          samGenderPeople.length >= numWrongOptions
            ? samGenderPeople
            : allPeople.filter((p) => p.id !== correctPerson.id);

        const wrongOptions = candidates
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(numWrongOptions, candidates.length));

        const options = [...wrongOptions, correctPerson].sort(
          () => Math.random() - 0.5,
        );

        questionList.push({
          person: correctPerson,
          options,
        });
      }

      console.log(
        "generateQuestions: Created",
        questionList.length,
        "questions",
      );
      return questionList;
    },
    [],
  );

  const loadGame = useCallback(async () => {
    try {
      console.log("[loadGame] Starting loadGame");
      // Reset all game state at the start
      setLoading(true);
      setCurrentQuestion(0);
      setScore(0);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(30); // Will be overridden once gameSession loads
      setLastAnswerCorrect(null);

      const supabase = createClient();

      // Store game code and player name for "Play Again" feature
      if (gameCode && playerName) {
        sessionStorage.setItem("lastGameCode", gameCode);
        sessionStorage.setItem("lastPlayerName", playerName);
      }

      // Find game session by code (allow any status so player can rejoin and try again)
      const { data: session } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("game_code", gameCode)
        .single();

      if (!session) {
        console.error("Game session not found for code:", gameCode);
        alert("Game not found!");
        setLoading(false);
        router.push("/game/join");
        return;
      }

      setGameSession(session);

      // Always clear any leftover data to start fresh
      // This ensures clean state when player rejoins/tries again
      sessionStorage.removeItem(
        `questionStartTime_${session.id}_${playerName}`,
      );
      sessionStorage.removeItem(`joinRecordId_${gameCode}_${playerName}`);

      // Load people from the group
      const { data: peopleData, error: peopleError } = await supabase
        .from("people")
        .select("*")
        .eq("group_id", session.group_id);

      console.log("People data:", peopleData, "Error:", peopleError);

      if (!peopleData || peopleData.length === 0) {
        console.error("No people found in group");
        alert("This group has no people! Add people to the group first.");
        setLoading(false);
        router.push("/game/join");
        return;
      }

      // Use options_count from game session (set when host started the game)
      const optionsCount = session.options_count || 4;

      const generatedQuestions = generateQuestions(
        peopleData,
        session.game_type,
        session.total_questions,
        optionsCount,
      );
      console.log(
        "[loadGame] generateQuestions called with",
        session.total_questions,
        "questions, got",
        generatedQuestions.length,
        "back",
      );
      setQuestions(generatedQuestions);

      // Check how many questions the player has already answered to resume from the right question
      // Skip this if it's a retry (fresh start)
      let resumeFromQuestion = 0;
      let answeredQuestions: Array<{ correct_option_id: string | null; selected_option_id: string | null; id: string; response_time_ms: number }> = [];

      if (!retry) {
        const { data: allAnswers } = await supabase
          .from("game_answers")
          .select("id, correct_option_id, selected_option_id, response_time_ms")
          .eq("session_id", session.id)
          .eq("player_name", playerName)
          .order("id", { ascending: true });

        if (allAnswers && allAnswers.length > 0) {
          // Filter answers that have been submitted (both correct_option_id and selected_option_id exist)
          answeredQuestions = allAnswers.filter(
            (a: { correct_option_id: string | null; selected_option_id: string | null; id: string; response_time_ms: number }) =>
              a.correct_option_id !== null && a.selected_option_id !== null,
          );

          if (answeredQuestions.length > 0) {
            console.log(
              "Player has answered",
              answeredQuestions.length,
              "questions, resuming from question",
              answeredQuestions.length,
            );
            resumeFromQuestion = answeredQuestions.length;
            setCurrentQuestion(resumeFromQuestion);
          }
        }
      }

      // Set initial timer based on game session settings
      const timeLimit = session.time_limit_seconds || 30;

      // Check if there's a stored question start time (from before reload)
      // Use session ID in key to isolate different game sessions
      const storedStartTime = sessionStorage.getItem(
        `questionStartTime_${session.id}_${playerName}`,
      );
      let initialTimeLeft = timeLimit;

      if (storedStartTime && resumeFromQuestion < session.total_questions) {
        const elapsedMs = Date.now() - parseInt(storedStartTime);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        initialTimeLeft = Math.max(0, timeLimit - elapsedSeconds);
        console.log(
          "Resuming question with",
          initialTimeLeft,
          "seconds remaining",
        );
      } else {
        // New question, store the start time
        sessionStorage.setItem(
          `questionStartTime_${session.id}_${playerName}`,
          Date.now().toString(),
        );
      }

      console.log("Game loaded successfully, starting game");
      console.log("Questions generated:", session.total_questions);

      // Ensure all state updates are batched before marking game as started
      setTimeLeft(initialTimeLeft);
      setLoading(false);
      // Don't set gameStarted here - let the useEffect below handle it when questions are ready
    } catch (error) {
      console.error("Error loading game:", error);
      alert(
        "Error loading game: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
      setLoading(false);
    }
  }, [gameCode, router, playerName, generateQuestions, retry]);

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

      // Get join record ID from state or sessionStorage
      const recordId = joinRecordId || sessionStorage.getItem("joinRecordId");
      if (!recordId) {
        console.error("No join record ID available");
        return;
      }

      setAnswered(true);
      setSelectedAnswer(answerId);

      const isCorrect = answerId === questions[currentQuestion].person.id;
      setLastAnswerCorrect(isCorrect);

      if (isCorrect) {
        setScore(score + 1);
      }

      // Save answer to database
      const supabase = createClient();
      console.log(
        "Saving answer with join_id:",
        recordId,
        "is_correct:",
        isCorrect,
      );
      const { error } = await supabase.from("game_answers").insert({
        session_id: gameSession.id,
        correct_option_id: questions[currentQuestion].person.id,
        selected_option_id: answerId,
        is_correct: isCorrect,
        response_time_ms:
          Math.max(0, (gameSession.time_limit_seconds || 30) - timeLeft) * 1000,
        player_name: playerName,
        join_id: recordId,
      });

      if (error) {
        console.error("Error saving answer:", error);
      } else {
        console.log("Answer saved successfully");
      }

      // Move to next question after animation completes
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setAnswered(false);
          setTimeLeft(gameSession?.time_limit_seconds || 30);
          setLastAnswerCorrect(null);
          // Store start time for the new question
          sessionStorage.setItem(
            `questionStartTime_${gameSession?.id}_${playerName}`,
            Date.now().toString(),
          );
        } else {
          // Game finished
          sessionStorage.removeItem(
            `questionStartTime_${gameSession?.id}_${playerName}`,
          );
          finishGame();
        }
      }, 500);
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
      joinRecordId,
    ],
  );

  useEffect(() => {
    if (gameCode && playerName) {
      loadGame();
    }
  }, [gameCode, playerName, loadGame]);

  // Handle join tracking separately - only once when player joins
  useEffect(() => {
    if (!gameSession?.id || !playerName) return;

    // Check if this component instance has already created a join record (for React Strict Mode)
    if (joinRecordId) {
      console.log(
        "Join record already created for this instance:",
        joinRecordId,
      );
      return;
    }

    const handlePlayerJoin = async () => {
      const supabase = createClient();

      // Check if a join record already exists for this player in this session
      const { data: existingJoins } = await supabase
        .from("game_answers")
        .select("id, created_at")
        .eq("session_id", gameSession.id)
        .eq("player_name", playerName)
        .is("correct_option_id", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingJoins && existingJoins.length > 0) {
        // Reuse the existing join record (player rejoining)
        console.log(
          "Player rejoining - using existing join record:",
          existingJoins[0].id,
        );
        setJoinRecordId(existingJoins[0].id);
        sessionStorage.setItem(
          `joinRecordId_${gameCode}_${playerName}`,
          existingJoins[0].id,
        );
      } else {
        // New join - create a new join tracking entry
        console.log("Creating new join tracking record:", {
          session_id: gameSession.id,
          player_name: playerName,
        });
        const { data: joinData, error: insertError } = await supabase
          .from("game_answers")
          .insert({
            session_id: gameSession.id,
            player_name: playerName,
            is_correct: false,
            response_time_ms: 0,
            is_active: true,
            // No correct_option_id for join tracking - this distinguishes it from answer records
          })
          .select("id");
        if (insertError) {
          console.error("Error inserting join tracking:", insertError);
          console.error(
            "Full error object:",
            JSON.stringify(insertError, null, 2),
          );
        } else {
          console.log("Join tracking inserted successfully");
          const recordId = joinData?.[0]?.id;
          console.log("Join record ID:", recordId);
          setJoinRecordId(recordId || null);
          if (recordId) {
            sessionStorage.setItem(
              `joinRecordId_${gameCode}_${playerName}`,
              recordId,
            );
          }
        }
      }
    };

    handlePlayerJoin();
  }, [gameSession?.id, playerName, joinRecordId, gameCode]);

  // Mark player as left when they close the window or navigate away
  useEffect(() => {
    if (!gameSession?.id || !playerName) return;

    const handlePlayerLeft = async () => {
      console.log("Player leaving game:", playerName);
      const result = await markPlayerAsLeft(gameSession.id, playerName);
      console.log("Mark player as left result:", result);
    };

    const handleBeforeUnload = () => {
      handlePlayerLeft();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Only mark as left if they're actually closing the window (beforeunload was triggered)
      // Don't mark as left on normal navigation away (they might be going to results)
    };
  }, [gameSession?.id, playerName]);

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
    // Only run timer if we have questions loaded and active
    if (questions.length > 0 && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && questions.length > 0) {
      handleAnswer(null);
    }
  }, [timeLeft, answered, questions.length, handleAnswer]);

  return (
    <RenderState
      state={
        loading
          ? { type: "loading" }
          : !questions || questions.length === 0
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
                  lastAnswerCorrect,
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
    <div className="w-full max-w-screen-lg">
      <div className={cn("w-full max-w-screen-lg ", className)}>{children}</div>
    </div>
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
  lastAnswerCorrect: boolean | null;
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
        <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
          <Container>
            <Message text="Loading game..." />
          </Container>
        </div>
      );
    case "waiting-for-start":
      return (
        <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
          <Container>
            <Message text="Waiting for game to start..." />
          </Container>
        </div>
      );
    case "loading-question":
      return (
        <div className="grow flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
          <Container>
            <Message text="Loading question..." />
          </Container>
        </div>
      );
    case "active":
      return (
        <div
          className={cn(
            "transition-colors duration-700 grow flex flex-col gap-2 p-4 items-center justify-center bg-gradient-to-br overflow-hidden",
            state.lastAnswerCorrect === true
              ? "from-green-600 to-green-800"
              : state.lastAnswerCorrect === false
                ? "from-red-600 to-red-800"
                : "from-purple-500 to-pink-500",
          )}
        >
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

            <AnimatePresence mode="popLayout">
              <motion.div
                key={state.currentQuestion}
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100vw", opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div
                  className={`flex gap-6 ${state.gameType === "guess_image" ? "flex-col" : "flex-col lg:flex-row"}`}
                >
                  <Card className="flex-shrink-0 justify-center">
                    <CardHeader>
                      <CardTitle className="text-center text-2xl">
                        {state.gameType === "guess_name"
                          ? "Who is this?"
                          : "Who is " +
                            state.question.person.first_name +
                            " " +
                            state.question.person.last_name +
                            "?"}
                      </CardTitle>
                    </CardHeader>
                    {state.gameType === "guess_name" && (
                      <CardContent>
                        <div className="flex justify-center">
                          <div className=" aspect-square rounded-lg border-4 border-gray-200">
                            <Image
                              width={256}
                              height={256}
                              key={`person-image-${state.currentQuestion}-${state.question.person.id}`}
                              src={
                                state.question.person.image_url ||
                                "/placeholder.png"
                              }
                              alt="Person"
                              priority={true}
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                  {/* Question Options */}
                  <div
                    className={`gap-2 flex-1 justify-center ${state.gameType === "guess_image" ? "grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))]" : "flex flex-col"}`}
                  >
                    {state.question.options.map((option) => {
                      const isSelected = state.selectedAnswer === option.id;
                      const isCorrect = option.id === state.question.person.id;

                      let buttonClass =
                        "text-lg font-semibold disabled:opacity-100";
                      let buttonVariant: "default" | "outline" = "outline";

                      if (state.answered) {
                        if (isCorrect && isSelected) {
                          buttonClass +=
                            " bg-green-500 hover:bg-green-500 text-white";
                          buttonVariant = "default";
                        } else if (isSelected && !isCorrect) {
                          buttonClass +=
                            " bg-red-500 hover:bg-red-500 text-white";
                          buttonVariant = "default";
                        }
                      }

                      return (
                        <Button
                          key={option.id}
                          onClick={() => state.handleAnswer(option.id)}
                          disabled={state.answered}
                          className={buttonClass}
                          variant={buttonVariant}
                        >
                          {state.gameType === "guess_name" ? (
                            <span className="truncate">
                              {option.first_name} {option.last_name}
                            </span>
                          ) : (
                            <div
                              key={`option-image-${state.currentQuestion}-${option.id}`}
                              className="flex justify-center relative w-full min-w-[100px] min-h-[100px] max-h-[200px]"
                            >
                              <Image
                                src={option.image_url || "/placeholder.png"}
                                alt={`${option.first_name} ${option.last_name}`}
                                width={200}
                                height={200}
                                priority={true}
                              />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Container>
        </div>
      );
    default:
      const _exhaustiveCheck: undefined = state;
      return _exhaustiveCheck;
  }
};
