import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RadarChart from "@/components/RadarChart";
import { Target, Brain, Eye, Ear, Hand, BookOpen, Users, Calculator } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: Array<{
    value: string;
    text: string;
    style: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'social' | 'logical';
  }>;
}

const assessmentQuestions: Question[] = [
  {
    id: "learning_preference",
    question: "When learning a new concept, you prefer to:",
    options: [
      { value: "visual", text: "See diagrams, charts, and visual representations", style: "visual" },
      { value: "auditory", text: "Listen to explanations and discuss with others", style: "auditory" },
      { value: "kinesthetic", text: "Try it hands-on and learn by doing", style: "kinesthetic" },
      { value: "reading", text: "Read detailed explanations and take notes", style: "reading" },
    ]
  },
  {
    id: "problem_solving",
    question: "When solving a complex problem, you tend to:",
    options: [
      { value: "logical", text: "Break it down into logical steps and analyze systematically", style: "logical" },
      { value: "visual", text: "Draw diagrams or mind maps to visualize the solution", style: "visual" },
      { value: "social", text: "Discuss it with others and brainstorm together", style: "social" },
      { value: "kinesthetic", text: "Work through examples and practice similar problems", style: "kinesthetic" },
    ]
  },
  {
    id: "memory_technique",
    question: "To remember information for an exam, you find it most effective to:",
    options: [
      { value: "reading", text: "Read and re-read your notes multiple times", style: "reading" },
      { value: "auditory", text: "Recite information aloud or explain it to someone", style: "auditory" },
      { value: "visual", text: "Create colorful diagrams and visual summaries", style: "visual" },
      { value: "kinesthetic", text: "Write flashcards and practice with physical movement", style: "kinesthetic" },
    ]
  },
  {
    id: "study_environment",
    question: "Your ideal study environment includes:",
    options: [
      { value: "social", text: "Study groups with peers and collaborative discussions", style: "social" },
      { value: "auditory", text: "Quiet space where you can read aloud or use audio materials", style: "auditory" },
      { value: "visual", text: "Well-lit area with visual aids and organized materials", style: "visual" },
      { value: "logical", text: "Systematic organization with clear structure and minimal distractions", style: "logical" },
    ]
  },
  {
    id: "information_processing",
    question: "When processing new information, you naturally:",
    options: [
      { value: "logical", text: "Look for patterns, connections, and logical relationships", style: "logical" },
      { value: "kinesthetic", text: "Need to apply it practically to understand it fully", style: "kinesthetic" },
      { value: "social", text: "Want to discuss and share insights with others", style: "social" },
      { value: "reading", text: "Need to read comprehensive materials and take detailed notes", style: "reading" },
    ]
  },
  {
    id: "explanation_style",
    question: "When explaining something you understand well, you prefer to:",
    options: [
      { value: "visual", text: "Use diagrams, drawings, or visual demonstrations", style: "visual" },
      { value: "auditory", text: "Talk through it step-by-step verbally", style: "auditory" },
      { value: "kinesthetic", text: "Show by doing and have them practice with you", style: "kinesthetic" },
      { value: "logical", text: "Present a structured, logical argument with clear reasoning", style: "logical" },
    ]
  }
];

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const { data: existingAssessment } = useQuery({
    queryKey: ["/api/assessment/latest"],
  });

  const assessmentMutation = useMutation({
    mutationFn: async (responses: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/assessment", responses);
      return response.json();
    },
    onSuccess: (data) => {
      setShowResults(true);
      toast({
        title: "Assessment Complete!",
        description: "Your learning style profile has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save assessment results",
        variant: "destructive",
      });
    },
  });

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const isComplete = currentQuestion >= assessmentQuestions.length;

  const handleAnswer = (value: string) => {
    const newResponses = { ...responses, [assessmentQuestions[currentQuestion].id]: value };
    setResponses(newResponses);

    if (currentQuestion + 1 >= assessmentQuestions.length) {
      // Submit assessment
      assessmentMutation.mutate(newResponses);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const retakeAssessment = () => {
    setCurrentQuestion(0);
    setResponses({});
    setShowResults(false);
  };

  if (showResults || (existingAssessment && Object.keys(responses).length === 0)) {
    const assessmentData = assessmentMutation.data || existingAssessment;
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <Card className="glassmorphic border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-lime/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-lime" />
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-800 mb-2">
              Your Learning Style Profile
            </CardTitle>
            <p className="text-neutral-600">
              Based on your responses, here's your personalized learning style breakdown
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="flex justify-center">
                <RadarChart assessment={assessmentData} size={300} />
              </div>

              {/* Learning Style Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Your Strengths:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Visual</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.visual || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.visual || '0') * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <Ear className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Auditory</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.auditory || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.auditory || '0') * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <Hand className="w-5 h-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Kinesthetic</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.kinesthetic || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.kinesthetic || '0') * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Reading/Writing</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.reading || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.reading || '0') * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <Users className="w-5 h-5 text-pink-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Social</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.social || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.social || '0') * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">Logical</p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${(parseFloat(assessmentData?.logical || '0') * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {Math.round(parseFloat(assessmentData?.logical || '0') * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex space-x-3">
                    <Button onClick={retakeAssessment} variant="outline" className="flex-1 bg-white/50 hover:bg-white/70">
                      Retake Assessment
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex-1 btn-coral"
                    >
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <Card className="glassmorphic border-0">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Processing Your Assessment...
            </h3>
            <p className="text-neutral-600">
              Analyzing your responses to create your personalized learning profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = assessmentQuestions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-coral" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Learning Style Assessment</h1>
        <p className="text-neutral-600">
          Help us understand how you learn best to personalize your study experience
        </p>
      </div>

      {/* Progress */}
      <Card className="glassmorphic border-0 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
            <span className="text-sm text-neutral-600">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="glassmorphic border-0">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-800 text-center">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={handleAnswer} className="space-y-4">
            {question.options.map((option, index) => (
              <div 
                key={option.value}
                className="flex items-start space-x-3 p-4 bg-white/30 rounded-lg hover:bg-white/40 transition-colors cursor-pointer"
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      option.style === 'visual' ? 'bg-blue-500/20' :
                      option.style === 'auditory' ? 'bg-green-500/20' :
                      option.style === 'kinesthetic' ? 'bg-orange-500/20' :
                      option.style === 'reading' ? 'bg-purple-500/20' :
                      option.style === 'social' ? 'bg-pink-500/20' :
                      'bg-indigo-500/20'
                    }`}>
                      {option.style === 'visual' && <Eye className="w-4 h-4 text-blue-500" />}
                      {option.style === 'auditory' && <Ear className="w-4 h-4 text-green-500" />}
                      {option.style === 'kinesthetic' && <Hand className="w-4 h-4 text-orange-500" />}
                      {option.style === 'reading' && <BookOpen className="w-4 h-4 text-purple-500" />}
                      {option.style === 'social' && <Users className="w-4 h-4 text-pink-500" />}
                      {option.style === 'logical' && <Calculator className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <span className="text-neutral-800">{option.text}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={goBack}
              disabled={currentQuestion === 0}
              variant="outline"
              className="bg-white/50 hover:bg-white/70"
            >
              Previous
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="bg-white/50 hover:bg-white/70"
            >
              Skip Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
