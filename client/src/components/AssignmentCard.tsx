import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Calculator, Microscope } from "lucide-react";
import { Assignment } from "shared/schema";

interface AssignmentCardProps {
  assignment: Assignment & { course?: { courseCode: string; name: string } };
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  if (!assignment.dueDate) {
    // Handle case where there is no due date
    return (
      <Card className="bg-white/30 hover:bg-white/40 transition-colors border-0 hover-lift">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-neutral-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-800 truncate">
                {assignment.name}
              </h3>
              <p className="text-sm text-neutral-600 truncate">
                {assignment.course?.courseCode} - {assignment.course?.name}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <Badge className="bg-neutral-100 text-neutral-800 border-0">
                No Due Date
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDaysUntilDue = () => {
    if (!assignment.dueDate) return Infinity;
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = () => {
    const daysUntilDue = getDaysUntilDue();
    if (daysUntilDue <= 1) return 'text-coral';
    if (daysUntilDue <= 3) return 'text-yellow-600';
    return 'text-neutral-600';
  };

  const getDueDateBadgeColor = () => {
    const daysUntilDue = getDaysUntilDue();
    if (daysUntilDue <= 1) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-neutral-100 text-neutral-800';
  };

  const getIconForCourse = () => {
    const courseCode = assignment.course?.courseCode?.toLowerCase() || '';
    if (courseCode.includes('cs') || courseCode.includes('cis')) {
      return <FileText className="w-6 h-6 text-coral" />;
    } else if (courseCode.includes('math')) {
      return <Calculator className="w-6 h-6 text-blue-500" />;
    } else if (courseCode.includes('bio') || courseCode.includes('chem')) {
      return <Microscope className="w-6 h-6 text-purple-500" />;
    }
    return <FileText className="w-6 h-6 text-neutral-600" />;
  };

  const formatDueDate = () => {
    if (!assignment.dueDate) return "";
    const dueDate = new Date(assignment.dueDate);
    return dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDueDateText = () => {
    const daysUntilDue = getDaysUntilDue();
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} days`;
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <Card className="bg-white/30 hover:bg-white/40 transition-colors border-0 hover-lift">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center flex-shrink-0">
            {getIconForCourse()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-800 truncate">
              {assignment.name}
            </h3>
            <p className="text-sm text-neutral-600 truncate">
              {assignment.course?.courseCode} - {assignment.course?.name}
            </p>
            
            {assignment.submissionTypes && assignment.submissionTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {assignment.submissionTypes.slice(0, 2).map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white/50 border-white/30">
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
                {assignment.submissionTypes.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-white/50 border-white/30">
                    +{assignment.submissionTypes.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="text-right flex-shrink-0">
            <Badge className={`mb-2 ${getDueDateBadgeColor()} border-0`}>
              <Clock className="w-3 h-3 mr-1" />
              {getDueDateText()}
            </Badge>
            <p className={`text-xs ${getDueDateColor()}`}>
              <Calendar className="w-3 h-3 inline mr-1" />
              {formatDueDate()}
            </p>
            {assignment.pointsPossible && (
              <p className="text-xs text-neutral-500 mt-1">
                {assignment.pointsPossible} points
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
