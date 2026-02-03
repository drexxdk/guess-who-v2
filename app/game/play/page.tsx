"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const loadGame = useCallback(async () => {
    const supabase = createClient();

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

    // Load people from the group
    const { data: peopleData } = await supabase
      .from("people")
      .select("*")
      .eq("group_id", session.group_id);

    if (peopleData && peopleData.length > 0) {
      setAllPeople(peopleData);
      generateQuestions(peopleData, session.game_type, session.total_questions);
    }

    setLoading(false);
    setGameStarted(true);
  }, [gameCode, router]);

  const generateQuestions = useCallback((allPeople: Person[], gameType: GameType, count: number) => {
    const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
    const questionList: Question[] = [];

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const correctPerson = shuffled[i];
      const wrongOptions = allPeople
        .filter(p => p.id !== correctPerson.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [...wrongOptions, correctPerson].sort(() => Math.random() - 0.5);

      questionList.push({
        person: correctPerson,
        options,
      });
    }

    setQuestions(questionList);
    setTimeLeft(30); // Reset timer for first question
  }, []);

  const handleAnswer = useCallback(async (answerId: string | null) => {
    if (answered) return;

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
  }, [answered, gameSession, questions, currentQuestion, score, timeLeft]);

  useEffect(() => {
    if (gameCode) {
      loadGame();
    }
  }, [gameCode, loadGame]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleAnswer(null);
    }
  }, [timeLeft, answered, gameStarted, handleAnswer]);

  const finishGame = async () => {
    const supabase = createClient();
    
    // Update game session with final score
    await supabase
      .from("game_sessions")
      .update({ 
        score,
        status: "completed",
      })
      .eq("id", gameSession.id);

    router.push(`/game/results?session=${gameSession.id}&score=${score}&total=${questions.length}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <Card>
          <CardContent className="p-8">
            <p className="text-lg">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <Card>
          <CardContent className="p-8">
            <p className="text-lg">Waiting for game to start...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const gameType = gameSession.game_type as GameType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-white">
            <p className="text-sm opacity-80">{playerName}</p>
            <p className="text-2xl font-bold">Score: {score}/{questions.length}</p>
          </div>
          <div className="text-white text-right">
            <p className="text-sm opacity-80">Question {currentQuestion + 1}/{questions.length}</p>
            <Badge variant={timeLeft < 10 ? "destructive" : "default"} className="text-2xl px-4 py-2">
              {timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {gameType === "guess_name" ? "Who is this?" : "Where is " + question.person.first_name + "?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameType === "guess_name" && (
              <div className="flex justify-center mb-6">
                <div className="relative w-64 h-64 rounded-lg overflow-hidden border-4 border-gray-200">
                  <Image
                    src={question.person.image_url || "/placeholder.png"}
                    alt="Person"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.id === question.person.id;
            
            let buttonClass = "h-auto min-h-[120px] text-lg font-semibold";
            
            if (answered) {
              if (isCorrect) {
                buttonClass += " bg-green-500 hover:bg-green-500 text-white";
              } else if (isSelected) {
                buttonClass += " bg-red-500 hover:bg-red-500 text-white";
              }
            }

            return (
              <Button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
                className={buttonClass}
                variant={answered ? "default" : "outline"}
              >
                {gameType === "guess_name" ? (
                  <span>{option.first_name} {option.last_name}</span>
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

        {answered && (
          <div className="mt-6 text-center">
            <Card className={selectedAnswer === question.person.id ? "bg-green-100" : "bg-red-100"}>
              <CardContent className="p-4">
                <p className="text-xl font-bold">
                  {selectedAnswer === question.person.id ? "✓ Correct!" : "✗ Wrong!"}
                </p>
                {selectedAnswer !== question.person.id && (
                  <p className="text-sm mt-2">
                    Correct answer: {question.person.first_name} {question.person.last_name}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
