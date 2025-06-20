import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: upcomingAssignments = [] } = useQuery({
    queryKey: ["/api/assignments", { upcoming: true }],
    enabled: isAuthenticated,
  });

  const { data: latestAssessment } = useQuery({
    queryKey: ["/api/assessment/latest"],
    enabled: isAuthenticated,
  });

  const { data: dueFlashcards = [] } = useQuery({
    queryKey: ["/api/flashcards", { due: true }],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      {/* Dashboard Overview */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2">
            <Card className="glassmorphic hover-lift border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-neutral-800">
                  Upcoming Assignments
                </CardTitle>
                <Badge variant="outline" className="bg-white/50">
                  <Calendar className="w-3 h-3 mr-1" />
                  From Canvas
                </Badge>
              </CardHeader>
              <CardContent>
                {upcomingAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No upcoming assignments</p>
                    <p className="text-sm text-neutral-500 mt-2">
                      Connect your Canvas account to see assignments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAssignments.slice(0, 3).map((assignment: any) => (
                      <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Learning Style Assessment */}
            <Card className="glassmorphic hover-lift border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">
                  Learning Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestAssessment ? (
                  <div>
                    <RadarChart assessment={latestAssessment} size={200} />
                    <div className="text-center mt-4">
                      <p className="text-sm text-neutral-600 mb-3">Your learning style profile</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/assessment'}
                        className="w-full"
                      >
                        Retake Assessment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-sm text-neutral-600 mb-4">
                      Take our learning style assessment to get personalized study recommendations
                    </p>
                    <Button
                      onClick={() => window.location.href = '/assessment'}
                      className="btn-coral w-full"
                    >
                      Take Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Study */}
            <Card className="glassmorphic hover-lift border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">
                  Quick Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/50 hover:bg-white/70"
                    onClick={() => window.location.href = '/chat?mode=active_recall'}
                  >
                    <Brain className="w-4 h-4 mr-3 text-coral" />
                    Active Recall
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/50 hover:bg-white/70"
                    onClick={() => window.location.href = '/chat?mode=feynman'}
                  >
                    <Users className="w-4 h-4 mr-3 text-blue-500" />
                    Feynman Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/50 hover:bg-white/70"
                    onClick={() => window.location.href = '/flashcards'}
                  >
                    <BookOpen className="w-4 h-4 mr-3 text-purple-500" />
                    Flashcards ({dueFlashcards.length} due)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Library */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-800">Course Library</h2>
          <Button className="btn-coral">
            <Upload className="w-4 h-4 mr-2" />
            Upload Materials
          </Button>
        </div>
        
        {courses.length === 0 ? (
          <Card className="glassmorphic border-0">
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">No courses found</h3>
              <p className="text-neutral-600 mb-6">
                Connect your Canvas account to automatically sync your courses
              </p>
              <Button className="btn-lime">
                <CheckCircle className="w-4 h-4 mr-2" />
                Connect Canvas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
