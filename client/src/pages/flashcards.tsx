import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, RotateCcw, CheckCircle, Clock, X } from "lucide-react";
import { Flashcard } from "shared/schema";

export default function Flashcards() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dueFlashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", { due: true }],
  });

  const updateFlashcardMutation = useMutation({
    mutationFn: async ({ id, quality }: { id: number; quality: number }) => {
      return await apiRequest("PATCH", `/api/flashcards/${id}`, { quality });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      nextCard();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update flashcard",
        variant: "destructive",
      });
    },
  });

  const currentCard = dueFlashcards[currentCardIndex];
  const progress = dueFlashcards.length > 0 ? ((currentCardIndex + 1) / dueFlashcards.length) * 100 : 0;

  const nextCard = () => {
    setShowAnswer(false);
    if (currentCardIndex + 1 >= dueFlashcards.length) {
      setSessionComplete(true);
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleQualityRating = (quality: number) => {
    if (!currentCard) return;
    
    updateFlashcardMutation.mutate({
      id: currentCard.id,
      quality,
    });
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
  };

  if (dueFlashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <Card className="glassmorphic border-0">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              No flashcards due for review
            </h3>
            <p className="text-neutral-600 mb-6">
              Great job! You're all caught up with your flashcard reviews.
            </p>
            <Button
              onClick={() => window.location.href = '/library'}
              className="btn-coral"
            >
              Upload Study Materials
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <Card className="glassmorphic border-0">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-lime mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">
              Session Complete! 🎉
            </h3>
            <p className="text-neutral-600 mb-6">
              You've reviewed all {dueFlashcards.length} flashcards. Great work on staying consistent with your studies!
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={resetSession}
                variant="outline"
                className="bg-white/50 hover:bg-white/70"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Review Again
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-coral"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Flashcard Review</h1>
          <p className="text-neutral-600">Use spaced repetition to strengthen your memory</p>
        </div>
        <Badge variant="outline" className="bg-white/50">
          {dueFlashcards.length} cards due today
        </Badge>
      </div>

      {/* Progress */}
      <Card className="glassmorphic border-0 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Card {currentCardIndex + 1} of {dueFlashcards.length}
            </span>
            <span className="text-sm text-neutral-600">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className="glassmorphic border-0 mb-6">
        <CardContent className="p-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 min-h-48 flex items-center justify-center text-center">
              <div>
                <p className="text-sm text-neutral-600 mb-2">
                  {showAnswer ? "Answer" : "Question"}
                </p>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  {showAnswer ? currentCard?.answer : currentCard?.question}
                </h3>
                {!showAnswer && (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    variant="outline"
                    className="bg-neutral-100 hover:bg-neutral-200"
                  >
                    Show Answer
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {showAnswer && (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => handleQualityRating(0)}
                    disabled={updateFlashcardMutation.isPending}
                    className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    title="Again (< 1 day)"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(3)}
                    disabled={updateFlashcardMutation.isPending}
                    className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    title="Hard (1-3 days)"
                  >
                    <Clock className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(4)}
                    disabled={updateFlashcardMutation.isPending}
                    className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    title="Good (3-7 days)"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(5)}
                    disabled={updateFlashcardMutation.isPending}
                    className="w-12 h-12 rounded-full btn-lime"
                    title="Easy (> 1 week)"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="text-center text-sm text-neutral-600">
                  <p>Rate how well you knew this answer:</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span>Again</span>
                    <span>Hard</span>
                    <span>Good</span>
                    <span>Easy</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skip Option */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={nextCard}
          className="bg-white/50 hover:bg-white/70"
        >
          Skip Card
        </Button>
      </div>
    </div>
  );
}
