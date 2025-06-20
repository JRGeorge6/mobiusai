import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen } from "lucide-react";

interface ConceptCardProps {
  concept: {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    tags?: string[];
  };
  onMarkAsKnown?: (conceptId: number) => void;
  onAddToStudyList?: (conceptId: number) => void;
}

export default function ConceptCard({ concept, onMarkAsKnown, onAddToStudyList }: ConceptCardProps) {
  const [isMarked, setIsMarked] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const handleMarkAsKnown = () => {
    setIsMarked(true);
    onMarkAsKnown?.(concept.id);
  };

  const handleAddToStudyList = () => {
    onAddToStudyList?.(concept.id);
  };

  return (
    <Card className="glassmorphic hover-lift border-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-neutral-800 text-lg">{concept.title}</h3>
          <Badge 
            variant="outline" 
            className={`${getDifficultyColor(concept.difficulty)} border-0`}
          >
            {concept.difficulty}
          </Badge>
        </div>
        
        <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
          {concept.description}
        </p>

        {concept.tags && concept.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {concept.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-white/50 border-white/30"
              >
                {tag}
              </Badge>
            ))}
            {concept.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/50 border-white/30">
                +{concept.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button
            onClick={handleMarkAsKnown}
            disabled={isMarked}
            className={`flex-1 ${isMarked ? 'btn-lime opacity-75' : 'btn-lime hover:bg-[hsl(158,64%,47%)]'}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isMarked ? 'Marked as Known' : 'Already Know'}
          </Button>
          <Button
            onClick={handleAddToStudyList}
            className="flex-1 btn-coral hover:bg-[hsl(0,79%,65%)]"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Study This
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
