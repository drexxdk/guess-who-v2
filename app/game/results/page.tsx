"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function GameResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "0");
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: "🌟", text: "Amazing!", color: "text-yellow-500" };
    if (percentage >= 75) return { emoji: "🎉", text: "Great Job!", color: "text-green-500" };
    if (percentage >= 60) return { emoji: "👍", text: "Good Work!", color: "text-blue-500" };
    if (percentage >= 40) return { emoji: "📚", text: "Keep Trying!", color: "text-orange-500" };
    return { emoji: "💪", text: "Try Again!", color: "text-red-500" };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <CardTitle className={`text-4xl font-bold ${grade.color}`}>
            {grade.text}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            You scored {score} out of {total}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <p className="text-muted-foreground">Accuracy</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{total - score}</div>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push("/game/join")}
              className="w-full"
              size="lg"
            >
              Play Again
            </Button>
            <Button 
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GameResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    }>
      <GameResults />
    </Suspense>
  );
}
