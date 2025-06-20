import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Brain, TrendingUp } from "lucide-react";

interface CourseCardProps {
  course: {
    id: number;
    name: string;
    courseCode: string;
    color?: string;
  };
  documentCount?: number;
  conceptCount?: number;
  progressPercentage?: number;
}

export default function CourseCard({ 
  course, 
  documentCount = 0, 
  conceptCount = 0, 
  progressPercentage = 0 
}: CourseCardProps) {
  const getIconColor = () => {
    if (course.courseCode?.startsWith('CS') || course.courseCode?.startsWith('CIS')) {
      return 'text-coral bg-coral/20';
    } else if (course.courseCode?.startsWith('MATH')) {
      return 'text-blue-500 bg-blue-500/20';
    } else if (course.courseCode?.startsWith('BIO') || course.courseCode?.startsWith('CHEM')) {
      return 'text-purple-500 bg-purple-500/20';
    } else if (course.courseCode?.startsWith('PHYS')) {
      return 'text-green-500 bg-green-500/20';
    } else {
      return 'text-neutral-600 bg-neutral-600/20';
    }
  };

  const getProgressColor = () => {
    if (progressPercentage >= 80) return 'text-lime';
    if (progressPercentage >= 60) return 'text-blue-500';
    if (progressPercentage >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getProgressBarColor = () => {
    if (progressPercentage >= 80) return 'bg-lime';
    if (progressPercentage >= 60) return 'bg-blue-500';
    if (progressPercentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="glassmorphic hover-lift border-0">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor()}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-800 truncate">
              {course.courseCode}
            </h3>
            <p className="text-sm text-neutral-600 truncate">
              {course.name}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              Documents
            </span>
            <span className="font-medium text-neutral-800">{documentCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 flex items-center">
              <Brain className="w-3 h-3 mr-1" />
              Concepts
            </span>
            <span className="font-medium text-neutral-800">{conceptCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Progress
            </span>
            <span className={`font-medium ${getProgressColor()}`}>
              {progressPercentage}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <Button 
          className="w-full bg-white/50 hover:bg-white/70 text-neutral-800 font-medium transition-colors"
          onClick={() => window.location.href = `/chat?course=${course.id}`}
        >
          Study Now
        </Button>
      </CardContent>
    </Card>
  );
}
