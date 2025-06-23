import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import AssignmentCard from "@/components/AssignmentCard";
import CourseCard from "@/components/CourseCard";
import RadarChart from "@/components/RadarChart";
import { 
  Brain, 
  Users, 
  BookOpen, 
  Upload,
  CheckCircle,
  Target,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Assignment, Course, Flashcard, LearningAssessment } from "shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: upcomingAssignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments", { upcoming: true, limit: 3 }],
  });

  const { data: dueFlashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", { due: true }],
  });

  const { data: latestAssessment } = useQuery<LearningAssessment>({
    queryKey: ["/api/assessments", { latest: true }],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">
          Welcome back, {user?.firstName || 'Student'}!
        </h1>
        <p className="text-neutral-600">Here's your learning snapshot for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Assignments */}
        <Card className="glassmorphic border-0">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>
              Due in the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssignments.length === 0 ? (
                <p className="text-neutral-600">No upcoming assignments.</p>
              ) : (
                upcomingAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Style */}
        <Card className="glassmorphic border-0">
          <CardHeader>
            <CardTitle>Your Learning Style</CardTitle>
            <CardDescription>
              Based on your latest assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {latestAssessment ? (
              <RadarChart assessment={latestAssessment} size={200} />
            ) : (
              <div className="text-center">
                <p className="text-neutral-600 mb-4">No assessment data found.</p>
                <Button
                  variant="outline"
                  className="bg-white/50 hover:bg-white/70"
                  onClick={() => window.location.href = '/assessment'}
                >
                  Take Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="glassmorphic border-0 hover-lift">
          <CardHeader>
            <CardTitle>AI Study Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              Chat with our AI to test your knowledge or explain concepts back.
            </p>
            <Button 
              className="w-full btn-coral"
              onClick={() => window.location.href = '/chat'}
            >
              Start AI Chat
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
        <Card className="glassmorphic border-0 hover-lift">
          <CardHeader>
            <CardTitle>Flashcard Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              You have {dueFlashcards.length} flashcards due for review.
            </p>
            <Button 
              className="w-full btn-lime"
              onClick={() => window.location.href = '/flashcards'}
            >
              Review Flashcards
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <Card className="glassmorphic border-0">
            <CardContent className="text-center py-12">
              <p className="text-neutral-600 mb-4">
                You haven't added any courses yet.
              </p>
              <Button 
                className="btn-coral"
                onClick={() => window.location.href = '/library'}
              >
                Upload Study Materials
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard 
                key={course.id} 
                course={course}
                documentCount={course.documentCount || 0}
                conceptCount={course.conceptCount || 0}
                progressPercentage={course.progressPercentage || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
