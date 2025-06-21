import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  RotateCcw,
  Play,
  Pause,
  SkipForward
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  answer: string;
  questionType: "multiple_choice" | "short_answer" | "true_false";
  options?: string[];
  conceptId: number;
  conceptTitle: string;
}

interface Session {
  id: number;
  title: string;
  description: string;
  concepts: number[];
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  difficulty: string;
  isActive: boolean;
}

export default function InterleavedSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get session ID from URL
  const sessionId = window.location.pathname.split("/").pop();

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchQuestions();
      setSessionStartTime(new Date());
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/interleaved-sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/interleaved-sessions/${sessionId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        if (data.length > 0) {
          setCurrentQuestion(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const answer = currentQuestion.questionType === "multiple_choice" ? selectedOption : userAnswer;
    if (!answer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interleaved-questions/${currentQuestion.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer,
          timeSpent: Math.floor((Date.now() - (sessionStartTime?.getTime() || Date.now())) / 1000),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsCorrect(result.isCorrect);
        setIsAnswered(true);
        setShowExplanation(true);

        // Update session progress
        if (session) {
          setSession({
            ...session,
            questionsAnswered: session.questionsAnswered + 1,
            correctAnswers: session.correctAnswers + (result.isCorrect ? 1 : 0),
          });
        }

        toast({
          title: result.isCorrect ? "Correct!" : "Incorrect",
          description: result.isCorrect 
            ? "Great job! You got it right." 
            : "Don't worry, learning from mistakes is part of the process.",
          variant: result.isCorrect ? "default" : "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setUserAnswer("");
      setSelectedOption("");
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // Session complete
      completeSession();
    }
  };

  const completeSession = async () => {
    try {
      const response = await fetch(`/api/interleaved-sessions/${sessionId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Session Complete!",
          description: "Great job completing your interleaved study session!",
        });
        setLocation("/interleaved");
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) return 0;
    return Math.floor((currentTime.getTime() - sessionStartTime.getTime()) / 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!session || session.totalQuestions === 0) return 0;
    return Math.round((session.questionsAnswered / session.totalQuestions) * 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-600">Session not found</h2>
        <Button onClick={() => setLocation("/interleaved")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/interleaved")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">{session.title}</h1>
            <p className="text-neutral-600">Interleaved Study Session</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-neutral-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(getSessionDuration())}</span>
          </div>
          <Badge variant="secondary">{session.difficulty}</Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>{session.questionsAnswered}/{session.totalQuestions}</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-3" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg mb-2">Question {currentQuestionIndex + 1}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {currentQuestion.conceptTitle}
              </Badge>
            </div>
            <div className="text-right text-sm text-neutral-500">
              {currentQuestion.questionType.replace("_", " ")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg text-neutral-800 mb-4">{currentQuestion.question}</p>
            
            {currentQuestion.questionType === "multiple_choice" && currentQuestion.options && (
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                disabled={isAnswered}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.questionType === "short_answer" && (
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isAnswered}
                className="text-base"
              />
            )}

            {currentQuestion.questionType === "true_false" && (
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                disabled={isAnswered}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="text-base cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="text-base cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}
          </div>

          {!isAnswered && (
            <Button
              onClick={submitAnswer}
              disabled={isSubmitting || (!userAnswer.trim() && !selectedOption)}
              className="w-full btn-coral"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          )}

          {showExplanation && (
            <div className={`p-4 rounded-lg border ${
              isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  isCorrect ? "text-green-800" : "text-red-800"
                }`}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              <div className="text-neutral-700">
                <p className="font-medium mb-1">Correct Answer:</p>
                <p>{currentQuestion.answer}</p>
              </div>
            </div>
          )}

          {isAnswered && (
            <Button
              onClick={nextQuestion}
              className="w-full btn-coral"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Next Question
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Session
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{session.correctAnswers}</div>
            <div className="text-sm text-neutral-600">Correct Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-neutral-800">
              {session.questionsAnswered > 0 
                ? Math.round((session.correctAnswers / session.questionsAnswered) * 100)
                : 0}%
            </div>
            <div className="text-sm text-neutral-600">Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {session.totalQuestions - session.questionsAnswered}
            </div>
            <div className="text-sm text-neutral-600">Questions Remaining</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 