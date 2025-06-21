import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, Target, TrendingUp, Play, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Concept {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  courseId: number;
}

interface InterleavedSession {
  id: number;
  title: string;
  description: string;
  concepts: number[];
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  difficulty: string;
  isActive: boolean;
  createdAt: string;
}

export default function Interleaved() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [sessions, setSessions] = useState<InterleavedSession[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<number[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConcepts();
    fetchSessions();
  }, []);

  const fetchConcepts = async () => {
    try {
      const response = await fetch("/api/concepts");
      if (response.ok) {
        const data = await response.json();
        setConcepts(data);
      }
    } catch (error) {
      console.error("Error fetching concepts:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/interleaved-sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    if (selectedConcepts.length < 2) {
      toast({
        title: "Selection Required",
        description: "Please select at least 2 concepts for interleaved studying.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a session title.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSession(true);
    try {
      const response = await fetch("/api/interleaved-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sessionTitle,
          description: sessionDescription,
          concepts: selectedConcepts,
          difficulty,
        }),
      });

      if (response.ok) {
        const newSession = await response.json();
        setSessions([newSession, ...sessions]);
        setSessionTitle("");
        setSessionDescription("");
        setSelectedConcepts([]);
        setDifficulty("medium");
        toast({
          title: "Session Created",
          description: "Your interleaved study session has been created successfully!",
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const startSession = (sessionId: number) => {
    window.location.href = `/interleaved/${sessionId}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (session: InterleavedSession) => {
    if (session.totalQuestions === 0) return 0;
    return Math.round((session.questionsAnswered / session.totalQuestions) * 100);
  };

  const getAccuracy = (session: InterleavedSession) => {
    if (session.questionsAnswered === 0) return 0;
    return Math.round((session.correctAnswers / session.questionsAnswered) * 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Interleaved Studying</h1>
          <p className="text-neutral-600">
            Mix different topics to improve long-term retention and knowledge transfer
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-coral">
              <Brain className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Interleaved Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g., Math Concepts Review"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  placeholder="Brief description of what you'll be studying..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Concepts to Interleave (Choose 2+ concepts)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {concepts.map((concept) => (
                    <div key={concept.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`concept-${concept.id}`}
                        checked={selectedConcepts.includes(concept.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConcepts([...selectedConcepts, concept.id]);
                          } else {
                            setSelectedConcepts(selectedConcepts.filter(id => id !== concept.id));
                          }
                        }}
                      />
                      <Label htmlFor={`concept-${concept.id}`} className="text-sm cursor-pointer">
                        <div className="font-medium">{concept.title}</div>
                        <div className="text-neutral-500 text-xs">{concept.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={createSession} 
                disabled={isCreatingSession || selectedConcepts.length < 2 || !sessionTitle.trim()}
                className="w-full btn-coral"
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                What is Interleaved Studying?
              </h3>
              <p className="text-neutral-600 mb-3">
                Interleaved studying mixes different topics or problem types within a single session, 
                rather than focusing on one subject at a time. This approach improves long-term retention 
                and knowledge transfer by forcing your brain to work harder at retrieving and applying information.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Target className="w-3 h-3 mr-1" />
                  Better Retention
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Knowledge Transfer
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Mixed Practice
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <Badge className={getDifficultyColor(session.difficulty)}>
                  {session.difficulty}
                </Badge>
              </div>
              {session.description && (
                <p className="text-sm text-neutral-600">{session.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-1">
                    <span>Progress</span>
                    <span>{session.questionsAnswered}/{session.totalQuestions}</span>
                  </div>
                  <Progress value={getProgressPercentage(session)} className="h-2" />
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{session.correctAnswers} correct</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{session.questionsAnswered - session.correctAnswers} incorrect</span>
                  </div>
                </div>

                {session.questionsAnswered > 0 && (
                  <div className="text-center">
                    <span className="text-lg font-semibold text-neutral-800">
                      {getAccuracy(session)}% accuracy
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>{session.concepts.length} concepts</span>
                </div>

                <Button
                  onClick={() => startSession(session.id)}
                  disabled={!session.isActive}
                  className="w-full btn-coral"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {session.isActive ? "Continue Session" : "Session Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Study Sessions Yet</h3>
          <p className="text-neutral-500 mb-4">
            Create your first interleaved study session to start mixing different concepts and improve your learning.
          </p>
        </div>
      )}
    </div>
  );
} 