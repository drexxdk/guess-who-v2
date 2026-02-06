"use client";

import { CircularProgress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface GameHeaderProps {
  playerName: string;
  score: number;
  totalQuestions: number;
  currentQuestion: number;
  timeLeft: number;
  timerEnabled: boolean;
  timeLimit: number;
}

export const GameHeader = memo(function GameHeader({
  playerName,
  score,
  totalQuestions,
  currentQuestion,
  timeLeft,
  timerEnabled,
  timeLimit,
}: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-white space-y-1">
        <p className="text-sm opacity-80">{playerName}</p>
        <p className="text-2xl font-bold">
          Score: {score}/{totalQuestions}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Question {currentQuestion + 1} of {totalQuestions}
          </Badge>
          <div className="h-1.5 w-32 bg-black/40 rounded-full overflow-hidden border border-white/30">
            <div
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      {timerEnabled && (
        <div className="text-white bg-black/40 rounded-full p-2 border border-white/30 inline-flex">
          <CircularProgress
            value={timeLeft}
            max={timeLimit}
            size={80}
            strokeWidth={6}
          >
            <span className="text-2xl font-bold">{timeLeft}</span>
          </CircularProgress>
        </div>
      )}
    </div>
  );
});
